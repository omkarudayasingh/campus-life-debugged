const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { requireAuth, requireAdmin, logActivity, createNotification } = require('../auth');

// GET /api/leave
router.get('/', requireAuth, (req, res) => {
  const isAdmin = ['super_admin', 'academic_admin', 'hostel_admin'].includes(req.user.role);

  let query = `
    SELECT l.*, s.roll_no, u.name as student_name, s.hostel, s.room_no, s.department,
           admin_u.name as reviewed_by_admin_name
    FROM leave_requests l
    JOIN students s ON s.id = l.student_id
    JOIN users u ON u.id = s.user_id
    LEFT JOIN users admin_u ON admin_u.id = l.reviewed_by_admin_id
  `;

  const params = [];
  if (!isAdmin) {
    query += ` WHERE l.student_id = ? `;
    params.push(req.user.student_db_id);
  }

  if (req.query.status) {
    query += (params.length ? ' AND ' : ' WHERE ') + ` l.status = ? `;
    params.push(req.query.status);
  }

  query += ` ORDER BY l.created_at DESC `;
  const leaves = db.prepare(query).all(...params);

  res.json({ leaves });
});

// POST /api/leave (Student submits leave request)
router.post('/', requireAuth, (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can submit leave requests.' });
  }

  const { leave_type, from_date, to_date, total_days, reason, destination_address, emergency_contact } = req.body;

  if (!leave_type || !from_date || !to_date || !reason || !emergency_contact) {
    return res.status(400).json({ error: 'Please provide all required leave details.' });
  }

  const student = db.prepare('SELECT id, user_id FROM students WHERE user_id = ?').get(req.user.id);
  if (!student) {
    return res.status(404).json({ error: 'Student record not found.' });
  }

  const countRow = db.prepare('SELECT count(*) as count FROM leave_requests').get();
  const requestNo = `LEV-2026-${String(countRow.count + 1).padStart(3, '0')}`;

  const calculatedDays = total_days || Math.max(1, Math.ceil((new Date(to_date) - new Date(from_date)) / (1000 * 60 * 60 * 24)) + 1);

  const insert = db.prepare(`
    INSERT INTO leave_requests (
      request_no, student_id, leave_type, from_date, to_date, total_days, reason, destination_address, emergency_contact, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
  `);

  const info = insert.run(
    requestNo,
    student.id,
    leave_type,
    from_date,
    to_date,
    calculatedDays,
    reason,
    destination_address || 'Home Address',
    emergency_contact
  );

  createNotification(
    req.user.id,
    'Leave Request Submitted',
    `Your leave request #${requestNo} (${leave_type}, ${calculatedDays} days) has been forwarded to administration for approval.`,
    'leave',
    requestNo
  );

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    'LEAVE_REQUESTED',
    'Leave',
    requestNo,
    `Requested ${calculatedDays} days leave from ${from_date} to ${to_date}`
  );

  res.status(201).json({
    message: 'Leave application submitted successfully!',
    requestNo,
    id: info.lastInsertRowid
  });
});

// PUT /api/leave/:id/review (Admins approve/reject)
// PER PS07 REQUIREMENT: ALL THREE ADMIN ROLES HAVE FULL APPROVAL & MANAGEMENT ACCESS
router.put('/:id/review', requireAuth, requireAdmin, (req, res) => {
  const leaveId = req.params.id;
  const { status, admin_remarks } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be either Approved or Rejected.' });
  }

  const leave = db.prepare(`
    SELECT l.*, s.user_id as student_user_id, s.roll_no, u.name as student_name
    FROM leave_requests l
    JOIN students s ON s.id = l.student_id
    JOIN users u ON u.id = s.user_id
    WHERE l.id = ?
  `).get(leaveId);

  if (!leave) {
    return res.status(404).json({ error: 'Leave request not found.' });
  }

  db.prepare(`
    UPDATE leave_requests
    SET status = ?, admin_remarks = ?, reviewed_by_admin_id = ?, reviewed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(status, admin_remarks || null, req.user.id, leaveId);

  // Send in-app notification to student
  createNotification(
    leave.student_user_id,
    `Leave Request ${status}!`,
    `Your leave request #${leave.request_no} has been ${status.toUpperCase()} by ${req.user.name}.${admin_remarks ? ` Remarks: ${admin_remarks}` : ''}`,
    'leave',
    leave.request_no
  );

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    `LEAVE_${status.toUpperCase()}`,
    'Leave',
    leave.request_no,
    `Admin ${req.user.name} (${req.user.role}) ${status.toLowerCase()} leave request #${leave.request_no}. Remarks: ${admin_remarks || 'None'}`
  );

  res.json({
    message: `Leave request has been ${status.toLowerCase()}.`,
    requestNo: leave.request_no,
    status
  });
});

module.exports = router;
