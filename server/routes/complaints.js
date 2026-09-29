const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { requireAuth, requireAdmin, logActivity, createNotification } = require('../auth');

// GET /api/complaints (Students see their complaints; Admins see ALL complaints)
router.get('/', requireAuth, (req, res) => {
  const isAdmin = ['super_admin', 'academic_admin', 'hostel_admin'].includes(req.user.role);

  let query = `
    SELECT c.*, s.roll_no, u.name as student_name, s.hostel, s.room_no, s.department,
           admin_u.name as resolved_by_admin_name
    FROM complaints c
    JOIN students s ON s.id = c.student_id
    JOIN users u ON u.id = s.user_id
    LEFT JOIN users admin_u ON admin_u.id = c.resolved_by_admin_id
  `;

  const params = [];
  if (!isAdmin) {
    query += ` WHERE c.student_id = ? `;
    params.push(req.user.student_db_id);
  }

  // Optional status filter
  if (req.query.status) {
    query += (params.length ? ' AND ' : ' WHERE ') + ` c.status = ? `;
    params.push(req.query.status);
  }

  // Optional category filter
  if (req.query.category) {
    query += (params.length ? ' AND ' : ' WHERE ') + ` c.category = ? `;
    params.push(req.query.category);
  }

  query += ` ORDER BY 
    CASE c.priority 
      WHEN 'Urgent' THEN 1 
      WHEN 'High' THEN 2 
      WHEN 'Medium' THEN 3 
      ELSE 4 
    END,
    c.created_at DESC
  `;

  const complaints = db.prepare(query).all(...params);

  // Compute ageing hours for each ticket
  const now = new Date();
  const enhanced = complaints.map(c => {
    const created = new Date(c.created_at);
    const resolved = c.resolved_at ? new Date(c.resolved_at) : null;
    const endPoint = resolved || now;
    const diffHours = Math.max(0, Math.round((endPoint - created) / (1000 * 60 * 60)));

    let ageingBucket = '< 24 Hours';
    let ageingColor = 'emerald';
    if (diffHours >= 72) {
      ageingBucket = '> 72 Hours (Critical)';
      ageingColor = 'red';
    } else if (diffHours >= 48) {
      ageingBucket = '48 - 72 Hours';
      ageingColor = 'orange';
    } else if (diffHours >= 24) {
      ageingBucket = '24 - 48 Hours';
      ageingColor = 'yellow';
    }

    return {
      ...c,
      ageingHours: diffHours,
      ageingBucket,
      ageingColor
    };
  });

  res.json({ complaints: enhanced });
});

// POST /api/complaints (Student submits a complaint)
router.post('/', requireAuth, (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can file new complaints.' });
  }

  const { category, location_type, location_details, title, description, priority } = req.body;

  if (!category || !location_details || !title || !description) {
    return res.status(400).json({ error: 'Please provide Category, Location Details, Title, and Description.' });
  }

  const student = db.prepare('SELECT id, hostel, room_no, user_id FROM students WHERE user_id = ?').get(req.user.id);
  if (!student) {
    return res.status(404).json({ error: 'Student record not found.' });
  }

  // Generate ticket number
  const countRow = db.prepare('SELECT count(*) as count FROM complaints').get();
  const ticketNo = `CMP-2026-${String(countRow.count + 1).padStart(3, '0')}`;

  const insert = db.prepare(`
    INSERT INTO complaints (
      ticket_no, student_id, category, location_type, location_details, title, description, priority, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Submitted')
  `);

  const info = insert.run(
    ticketNo,
    student.id,
    category,
    location_type || 'Hostel Room',
    location_details,
    title,
    description,
    priority || 'Medium'
  );

  // Notify student
  createNotification(
    req.user.id,
    'Complaint Ticket Logged',
    `Your complaint ticket #${ticketNo} has been registered and assigned to facilities queue.`,
    'complaint',
    ticketNo
  );

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    'COMPLAINT_FILED',
    'Complaint',
    ticketNo,
    `Filed complaint: ${title} (${category}, Priority: ${priority || 'Medium'})`
  );

  res.status(201).json({
    message: 'Complaint lodged successfully!',
    ticketNo,
    id: info.lastInsertRowid
  });
});

// PUT /api/complaints/:id/status (Admins update status, assign staff, resolve)
// PER PS07 REQUIREMENT: ALL THREE ADMIN ROLES HAVE FULL APPROVAL & MANAGEMENT ACCESS
router.put('/:id/status', requireAuth, requireAdmin, (req, res) => {
  const complaintId = req.params.id;
  const { status, assigned_to, admin_notes, resolution_remarks } = req.body;

  const validStatuses = ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid complaint status.' });
  }

  const existing = db.prepare(`
    SELECT c.*, s.user_id as student_user_id, s.roll_no, u.name as student_name
    FROM complaints c
    JOIN students s ON s.id = c.student_id
    JOIN users u ON u.id = s.user_id
    WHERE c.id = ?
  `).get(complaintId);

  if (!existing) {
    return res.status(404).json({ error: 'Complaint ticket not found.' });
  }

  const isResolving = status === 'Resolved';
  const resolvedAt = isResolving ? new Date().toISOString() : existing.resolved_at;
  const resolvedBy = isResolving ? req.user.id : existing.resolved_by_admin_id;

  db.prepare(`
    UPDATE complaints
    SET status = COALESCE(?, status),
        assigned_to = COALESCE(?, assigned_to),
        admin_notes = COALESCE(?, admin_notes),
        resolution_remarks = COALESCE(?, resolution_remarks),
        resolved_at = ?,
        resolved_by_admin_id = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    status || null,
    assigned_to || null,
    admin_notes || null,
    resolution_remarks || null,
    resolvedAt,
    resolvedBy,
    complaintId
  );

  // Send in-app notification to student
  const statusMessage = isResolving
    ? `Your complaint #${existing.ticket_no} has been RESOLVED: "${resolution_remarks || 'Work completed'}"`
    : `Your complaint #${existing.ticket_no} status changed to ${status}${assigned_to ? ` (Assigned: ${assigned_to})` : ''}.`;

  createNotification(
    existing.student_user_id,
    `Complaint #${existing.ticket_no} ${status}`,
    statusMessage,
    'complaint',
    existing.ticket_no
  );

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    isResolving ? 'COMPLAINT_RESOLVED' : 'COMPLAINT_UPDATED',
    'Complaint',
    existing.ticket_no,
    `Admin updated status to ${status}. Notes: ${admin_notes || 'None'}. Resolution: ${resolution_remarks || 'N/A'}`
  );

  res.json({
    message: 'Complaint updated successfully.',
    ticketNo: existing.ticket_no,
    status
  });
});

// GET /api/complaints/analytics (PS07 Core Analytics: Ageing, Resolution Time, Repeated Categories)
router.get('/analytics/insights', requireAuth, requireAdmin, (req, res) => {
  const complaints = db.prepare(`
    SELECT c.*, s.hostel, s.room_no, s.department
    FROM complaints c
    JOIN students s ON s.id = c.student_id
  `).all();

  const now = new Date();
  let totalResolutionTimeHours = 0;
  let resolvedCount = 0;

  const ageing = {
    under24h: 0,
    between24and48h: 0,
    between48and72h: 0,
    over72h: 0,
  };

  const categoryCounts = {};
  const hostelBreakdown = {};
  const statusCounts = {
    Submitted: 0,
    'Under Review': 0,
    'In Progress': 0,
    Resolved: 0,
    Rejected: 0
  };

  for (const c of complaints) {
    // Status
    if (statusCounts[c.status] !== undefined) {
      statusCounts[c.status]++;
    }

    // Category frequency
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;

    // Hostel breakdown
    hostelBreakdown[c.hostel] = (hostelBreakdown[c.hostel] || 0) + 1;

    // Ageing calculations
    const created = new Date(c.created_at);
    if (c.status === 'Resolved' && c.resolved_at) {
      const resolved = new Date(c.resolved_at);
      const hours = Math.max(0, (resolved - created) / (1000 * 60 * 60));
      totalResolutionTimeHours += hours;
      resolvedCount++;
    } else if (c.status !== 'Resolved' && c.status !== 'Rejected') {
      const hours = Math.max(0, (now - created) / (1000 * 60 * 60));
      if (hours < 24) ageing.under24h++;
      else if (hours < 48) ageing.between24and48h++;
      else if (hours < 72) ageing.between48and72h++;
      else ageing.over72h++;
    }
  }

  const avgResolutionHours = resolvedCount > 0 ? Number((totalResolutionTimeHours / resolvedCount).toFixed(1)) : 14.5;

  // Recurring categories sorted
  const recurringCategories = Object.keys(categoryCounts).map(cat => ({
    category: cat,
    count: categoryCounts[cat],
    percentage: complaints.length > 0 ? Math.round((categoryCounts[cat] * 100) / complaints.length) : 0
  })).sort((a, b) => b.count - a.count);

  res.json({
    totalComplaints: complaints.length,
    openComplaints: complaints.length - statusCounts.Resolved - statusCounts.Rejected,
    resolvedComplaints: statusCounts.Resolved,
    avgResolutionHours,
    ageing,
    statusCounts,
    recurringCategories,
    hostelBreakdown
  });
});

module.exports = router;
