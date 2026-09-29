const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { requireAuth } = require('../auth');

// GET /api/students/profile
router.get('/profile', requireAuth, (req, res) => {
  const student = db.prepare(`
    SELECT s.*, u.name, u.email, u.phone, u.department, u.is_active
    FROM students s
    JOIN users u ON u.id = s.user_id
    WHERE s.user_id = ?
  `).get(req.user.id);

  if (!student) {
    return res.status(404).json({ error: 'Student record not found.' });
  }

  // Find roommates in the same hostel and room
  const roommates = db.prepare(`
    SELECT s.roll_no, u.name, u.email, u.phone, s.department, s.year
    FROM students s
    JOIN users u ON u.id = s.user_id
    WHERE s.hostel = ? AND s.room_no = ? AND s.id != ?
  `).all(student.hostel, student.room_no, student.id);

  res.json({
    student,
    roommates
  });
});

// GET /api/students/attendance
router.get('/attendance', requireAuth, (req, res) => {
  // If student is logged in, use their student_db_id. If admin requested with ?studentId=X, allow admin to view
  let studentId = req.user.student_db_id;
  if (req.query.studentId && ['super_admin', 'academic_admin', 'hostel_admin'].includes(req.user.role)) {
    studentId = parseInt(req.query.studentId, 10);
  }

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID missing.' });
  }

  const records = db.prepare(`
    SELECT id, subject_code, subject_name, total_classes, attended_classes, faculty_name, last_updated,
           ROUND((attended_classes * 100.0 / total_classes), 1) as percentage
    FROM attendance
    WHERE student_id = ?
    ORDER BY subject_code ASC
  `).all(studentId);

  const totalClasses = records.reduce((acc, r) => acc + r.total_classes, 0);
  const totalAttended = records.reduce((acc, r) => acc + r.attended_classes, 0);
  const overallPercentage = totalClasses > 0 ? Number(((totalAttended * 100) / totalClasses).toFixed(1)) : 0;

  // Add actionable insights for students (Classes needed for 75% or safe classes to miss)
  const detailedRecords = records.map(r => {
    const pct = r.percentage;
    let status = 'Good';
    let recommendation = 'Safe attendance level';
    if (pct < 75) {
      status = 'Shortage Warning';
      // Formula to find additional classes needed: (attended + x)/(total + x) >= 0.75 => x = 3*total - 4*attended
      const needed = Math.max(0, Math.ceil(3 * r.total_classes - 4 * r.attended_classes));
      recommendation = `Must attend next ${needed} consecutive classes to reach 75%`;
    } else {
      // Safe to miss: (attended)/(total + y) >= 0.75 => y = (attended / 0.75) - total
      const canMiss = Math.max(0, Math.floor((r.attended_classes / 0.75) - r.total_classes));
      recommendation = canMiss > 0 ? `Can safely miss ${canMiss} class${canMiss > 1 ? 'es' : ''}` : 'On the 75% threshold';
    }
    return {
      ...r,
      status,
      recommendation
    };
  });

  res.json({
    overall: {
      totalClasses,
      totalAttended,
      percentage: overallPercentage,
      status: overallPercentage >= 75 ? 'Safe' : 'Attendance Shortage Warning'
    },
    subjects: detailedRecords
  });
});

// GET /api/students/timetable
router.get('/timetable', requireAuth, (req, res) => {
  let section = req.user.section || 'A';
  let department = req.user.department || 'CSE';
  let semester = req.user.semester || '1st';

  if (req.query.section) section = req.query.section;
  if (req.query.department) department = req.query.department;
  if (req.query.semester) semester = req.query.semester;

  const timetable = db.prepare(`
    SELECT * FROM timetables
    WHERE department = ? AND semester = ? AND section = ?
    ORDER BY 
      CASE day_of_week
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
        ELSE 7
      END,
      time_slot ASC
  `).all(department, semester, section);

  // Group by day of week
  const grouped = {};
  for (const slot of timetable) {
    if (!grouped[slot.day_of_week]) {
      grouped[slot.day_of_week] = [];
    }
    grouped[slot.day_of_week].push(slot);
  }

  res.json({
    department,
    semester,
    section,
    schedule: grouped,
    raw: timetable
  });
});

// GET /api/students/fees
router.get('/fees', requireAuth, (req, res) => {
  let studentId = req.user.student_db_id;
  if (req.query.studentId && ['super_admin', 'academic_admin', 'hostel_admin'].includes(req.user.role)) {
    studentId = parseInt(req.query.studentId, 10);
  }

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID missing.' });
  }

  const feeRecords = db.prepare(`
    SELECT * FROM fees
    WHERE student_id = ?
    ORDER BY due_date DESC
  `).all(studentId);

  const totalDues = feeRecords.reduce((acc, f) => acc + f.amount, 0);
  const totalPaid = feeRecords.reduce((acc, f) => acc + f.paid_amount, 0);
  const pendingAmount = totalDues - totalPaid;

  res.json({
    summary: {
      totalDues,
      totalPaid,
      pendingAmount,
      isCleared: pendingAmount <= 0
    },
    records: feeRecords
  });
});

// GET /api/students/notifications
router.get('/notifications', requireAuth, (req, res) => {
  const notifications = db.prepare(`
    SELECT * FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `).all(req.user.id);

  const unreadCount = db.prepare(`
    SELECT COUNT(*) as count FROM notifications
    WHERE user_id = ? AND is_read = 0
  `).get(req.user.id).count;

  res.json({
    unreadCount,
    notifications
  });
});

// POST /api/students/notifications/read-all
router.post('/notifications/read-all', requireAuth, (req, res) => {
  db.prepare(`
    UPDATE notifications
    SET is_read = 1
    WHERE user_id = ?
  `).run(req.user.id);

  res.json({ success: true, message: 'All notifications marked as read.' });
});

// POST /api/students/notifications/:id/read
router.post('/notifications/:id/read', requireAuth, (req, res) => {
  db.prepare(`
    UPDATE notifications
    SET is_read = 1
    WHERE id = ? AND user_id = ?
  `).run(req.params.id, req.user.id);

  res.json({ success: true });
});

module.exports = router;
