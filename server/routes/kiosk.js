const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { logActivity, createNotification } = require('../auth');

// POST /api/kiosk/lookup
// Allows students without smartphones or with dead batteries to check gate passes, certificates, and timetable
router.post('/lookup', (req, res) => {
  const { roll_no, phone_last4 } = req.body;

  if (!roll_no) {
    return res.status(400).json({ error: 'Please enter Roll Number / Student ID.' });
  }

  const student = db.prepare(`
    SELECT s.*, u.name, u.email, u.phone, u.department
    FROM students s
    JOIN users u ON u.id = s.user_id
    WHERE LOWER(s.roll_no) = LOWER(?)
  `).get(roll_no.trim());

  if (!student) {
    return res.status(404).json({ error: 'Roll Number not found in campus database.' });
  }

  // Security check: if phone_last4 provided, verify it matches
  if (phone_last4) {
    const rawPhone = (student.phone || '').replace(/\D/g, '');
    if (!rawPhone.endsWith(phone_last4.trim())) {
      return res.status(401).json({ error: 'Verification failed. Last 4 digits of phone do not match.' });
    }
  }

  // Fetch active gate passes
  const activeGatePass = db.prepare(`
    SELECT * FROM gate_passes
    WHERE student_id = ? AND status IN ('Approved', 'Checked Out')
    ORDER BY created_at DESC LIMIT 1
  `).get(student.id);

  // Fetch recent document requests
  const recentDoc = db.prepare(`
    SELECT * FROM document_requests
    WHERE student_id = ?
    ORDER BY created_at DESC LIMIT 1
  `).get(student.id);

  // Fetch latest notice
  const latestNotice = db.prepare(`
    SELECT title, category, priority, created_at
    FROM notices
    ORDER BY created_at DESC LIMIT 1
  `).get();

  res.json({
    student: {
      name: student.name,
      roll_no: student.roll_no,
      department: student.department,
      hostel: student.hostel,
      room_no: student.room_no
    },
    activeGatePass,
    recentDoc,
    latestNotice
  });
});

// POST /api/kiosk/quick-complaint
// Allows logging an urgent facility complaint at the hostel desk kiosk without a smartphone
router.post('/quick-complaint', (req, res) => {
  const { roll_no, category, location, description } = req.body;

  if (!roll_no || !category || !description) {
    return res.status(400).json({ error: 'Roll No, Category, and Description required.' });
  }

  const student = db.prepare(`
    SELECT s.id, s.user_id, s.hostel, s.room_no, u.name
    FROM students s
    JOIN users u ON u.id = s.user_id
    WHERE LOWER(s.roll_no) = LOWER(?)
  `).get(roll_no.trim());

  if (!student) {
    return res.status(404).json({ error: 'Student Roll No not recognized.' });
  }

  const countRow = db.prepare('SELECT count(*) as count FROM complaints').get();
  const ticketNo = `CMP-2026-${String(countRow.count + 1).padStart(3, '0')}`;

  db.prepare(`
    INSERT INTO complaints (
      ticket_no, student_id, category, location_type, location_details, title, description, priority, status
    ) VALUES (?, ?, ?, 'Hostel Room', ?, ?, ?, 'Urgent', 'Submitted')
  `).run(
    ticketNo,
    student.id,
    category,
    location || `${student.hostel} ${student.room_no}`,
    `[KIOSK/FALLBACK] ${category} reported from Hostel Terminal`,
    description
  );

  createNotification(
    student.user_id,
    'Hostel Kiosk Complaint Logged',
    `Your emergency complaint #${ticketNo} was logged via Hostel Terminal Desk.`,
    'complaint',
    ticketNo
  );

  logActivity(
    student.user_id,
    student.name,
    'student',
    'KIOSK_COMPLAINT_FILED',
    'Complaint',
    ticketNo,
    `Logged via Campus Kiosk terminal: ${category}`
  );

  res.status(201).json({
    message: 'Urgent complaint registered at hostel kiosk!',
    ticketNo
  });
});

module.exports = router;
