const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { requireAuth, requireAdmin, logActivity, createNotification } = require('../auth');

// GET /api/gate-pass
router.get('/', requireAuth, (req, res) => {
  const isAdmin = ['super_admin', 'academic_admin', 'hostel_admin'].includes(req.user.role);

  let query = `
    SELECT g.*, s.roll_no, u.name as student_name, s.hostel, s.room_no, s.department,
           admin_u.name as reviewed_by_admin_name
    FROM gate_passes g
    JOIN students s ON s.id = g.student_id
    JOIN users u ON u.id = s.user_id
    LEFT JOIN users admin_u ON admin_u.id = g.reviewed_by_admin_id
  `;

  const params = [];
  if (!isAdmin) {
    query += ` WHERE g.student_id = ? `;
    params.push(req.user.student_db_id);
  }

  if (req.query.status) {
    query += (params.length ? ' AND ' : ' WHERE ') + ` g.status = ? `;
    params.push(req.query.status);
  }

  query += ` ORDER BY g.created_at DESC `;
  const gatePasses = db.prepare(query).all(...params);

  res.json({ gatePasses });
});

// POST /api/gate-pass (Student submits gate pass request)
router.post('/', requireAuth, (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can request gate passes.' });
  }

  const { purpose, destination, out_time, expected_in_time } = req.body;

  if (!purpose || !destination || !out_time || !expected_in_time) {
    return res.status(400).json({ error: 'Please provide purpose, destination, out time, and expected return time.' });
  }

  const student = db.prepare('SELECT id, user_id FROM students WHERE user_id = ?').get(req.user.id);
  if (!student) {
    return res.status(404).json({ error: 'Student record not found.' });
  }

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const passCode = `GP-2026-${randomDigits}`;

  const insert = db.prepare(`
    INSERT INTO gate_passes (
      pass_code, student_id, purpose, destination, out_time, expected_in_time, status
    ) VALUES (?, ?, ?, ?, ?, ?, 'Pending')
  `);

  const info = insert.run(
    passCode,
    student.id,
    purpose,
    destination,
    out_time,
    expected_in_time
  );

  createNotification(
    req.user.id,
    'Gate Pass Request Submitted',
    `Your gate pass request (${passCode}) for ${destination} is awaiting warden/admin review.`,
    'gate_pass',
    passCode
  );

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    'GATE_PASS_REQUESTED',
    'GatePass',
    passCode,
    `Requested gate pass for ${purpose} to ${destination} (${out_time} to ${expected_in_time})`
  );

  res.status(201).json({
    message: 'Gate pass requested successfully!',
    passCode,
    id: info.lastInsertRowid
  });
});

// PUT /api/gate-pass/:id/review (Admins approve/reject)
// PER PS07 REQUIREMENT: ALL THREE ADMIN ROLES HAVE FULL APPROVAL & MANAGEMENT ACCESS
router.put('/:id/review', requireAuth, requireAdmin, (req, res) => {
  const gatePassId = req.params.id;
  const { status, admin_remarks } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be either Approved or Rejected.' });
  }

  const pass = db.prepare(`
    SELECT g.*, s.user_id as student_user_id, s.roll_no, u.name as student_name
    FROM gate_passes g
    JOIN students s ON s.id = g.student_id
    JOIN users u ON u.id = s.user_id
    WHERE g.id = ?
  `).get(gatePassId);

  if (!pass) {
    return res.status(404).json({ error: 'Gate pass not found.' });
  }

  db.prepare(`
    UPDATE gate_passes
    SET status = ?, admin_remarks = ?, reviewed_by_admin_id = ?, reviewed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(status, admin_remarks || null, req.user.id, gatePassId);

  createNotification(
    pass.student_user_id,
    `Gate Pass ${status}!`,
    `Your Gate Pass #${pass.pass_code} has been ${status.toUpperCase()} by ${req.user.name}.${admin_remarks ? ` Remarks: ${admin_remarks}` : ''}`,
    'gate_pass',
    pass.pass_code
  );

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    `GATE_PASS_${status.toUpperCase()}`,
    'GatePass',
    pass.pass_code,
    `Admin ${req.user.name} (${req.user.role}) ${status.toLowerCase()} gate pass #${pass.pass_code}`
  );

  res.json({
    message: `Gate pass has been ${status.toLowerCase()}.`,
    passCode: pass.pass_code,
    status
  });
});

// PUT /api/gate-pass/:id/gate-action (Security gate check-out or check-in scan)
router.put('/:id/gate-action', requireAuth, (req, res) => {
  const { action } = req.body; // 'CHECK_OUT' or 'CHECK_IN'
  const passId = req.params.id;

  const pass = db.prepare('SELECT * FROM gate_passes WHERE id = ?').get(passId);
  if (!pass) {
    return res.status(404).json({ error: 'Gate pass not found.' });
  }

  const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (action === 'CHECK_OUT') {
    db.prepare(`
      UPDATE gate_passes
      SET status = 'Checked Out', actual_out_time = ?
      WHERE id = ?
    `).run(nowFormatted, passId);
  } else if (action === 'CHECK_IN') {
    db.prepare(`
      UPDATE gate_passes
      SET status = 'Checked In', actual_in_time = ?
      WHERE id = ?
    `).run(nowFormatted, passId);
  }

  res.json({
    message: `Gate action ${action} recorded at ${nowFormatted}.`,
    status: action === 'CHECK_OUT' ? 'Checked Out' : 'Checked In'
  });
});

module.exports = router;
