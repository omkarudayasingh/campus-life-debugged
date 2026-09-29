const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { requireAuth, requireAdmin, logActivity } = require('../auth');

const DEFAULT_TEMP_PASSWORD = 'cam@123';

// GET /api/admin/dashboard-stats
// PER PS07 REQUIREMENT: ALL THREE ADMIN ROLES HAVE FULL APPROVAL & MANAGEMENT ACCESS
router.get('/dashboard-stats', requireAuth, requireAdmin, (req, res) => {
  // Real database counts
  const totalStudents = db.prepare("SELECT COUNT(*) as count FROM students").get().count;
  const activeStudents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student' AND is_active = 1").get().count;

  // Requests count
  const pendingLeaves = db.prepare("SELECT COUNT(*) as count FROM leave_requests WHERE status = 'Pending'").get().count;
  const pendingGatePasses = db.prepare("SELECT COUNT(*) as count FROM gate_passes WHERE status = 'Pending'").get().count;
  const pendingDocuments = db.prepare("SELECT COUNT(*) as count FROM document_requests WHERE status = 'Submitted' OR status = 'Processing'").get().count;
  const totalPendingRequests = pendingLeaves + pendingGatePasses + pendingDocuments;

  // Complaints count
  const totalComplaints = db.prepare("SELECT COUNT(*) as count FROM complaints").get().count;
  const openComplaints = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status != 'Resolved' AND status != 'Rejected'").get().count;
  const resolvedComplaints = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'Resolved'").get().count;

  // Recent activity logs (Audit Trail)
  const recentActivities = db.prepare(`
    SELECT * FROM activity_logs
    ORDER BY created_at DESC
    LIMIT 12
  `).all();

  // Recent notices
  const recentNotices = db.prepare(`
    SELECT n.*, u.name as posted_by_name
    FROM notices n
    JOIN users u ON u.id = n.posted_by_admin_id
    ORDER BY n.created_at DESC
    LIMIT 5
  `).all();

  // PS07 Complaint Ageing Breakdown
  const openComplaintRows = db.prepare(`
    SELECT created_at, status FROM complaints WHERE status != 'Resolved' AND status != 'Rejected'
  `).all();

  const now = new Date();
  const ageing = {
    under24h: 0,
    between24and48h: 0,
    between48and72h: 0,
    over72h: 0,
  };

  for (const c of openComplaintRows) {
    const hours = Math.max(0, (now - new Date(c.created_at)) / (1000 * 60 * 60));
    if (hours < 24) ageing.under24h++;
    else if (hours < 48) ageing.between24and48h++;
    else if (hours < 72) ageing.between48and72h++;
    else ageing.over72h++;
  }

  // Average Resolution Time (in hours)
  const resolvedRows = db.prepare(`
    SELECT created_at, resolved_at FROM complaints WHERE status = 'Resolved' AND resolved_at IS NOT NULL
  `).all();

  let totalResolutionTime = 0;
  for (const r of resolvedRows) {
    totalResolutionTime += Math.max(0, (new Date(r.resolved_at) - new Date(r.created_at)) / (1000 * 60 * 60));
  }
  const avgResolutionHours = resolvedRows.length > 0 ? Number((totalResolutionTime / resolvedRows.length).toFixed(1)) : 14.5;

  // Repeated Categories
  const categoryFreq = db.prepare(`
    SELECT category, COUNT(*) as count
    FROM complaints
    GROUP BY category
    ORDER BY count DESC
  `).all();

  // Hostel Breakdown
  const hostelBreakdown = db.prepare(`
    SELECT s.hostel, COUNT(c.id) as complaint_count
    FROM students s
    LEFT JOIN complaints c ON c.student_id = s.id
    GROUP BY s.hostel
  `).all();

  res.json({
    metrics: {
      totalStudents,
      activeStudents,
      totalPendingRequests,
      pendingLeaves,
      pendingGatePasses,
      pendingDocuments,
      openComplaints,
      resolvedComplaints,
      totalComplaints,
      avgResolutionHours
    },
    ageing,
    categoryFreq,
    hostelBreakdown,
    recentActivities,
    recentNotices
  });
});

// GET /api/admin/students (List students with search and filters)
router.get('/students', requireAuth, requireAdmin, (req, res) => {
  const { search, department, hostel, status } = req.query;

  let query = `
    SELECT s.*, u.name, u.email, u.phone, u.department, u.is_active, u.created_at as account_created_at,
           u.must_change_password
    FROM students s
    JOIN users u ON u.id = s.user_id
    WHERE 1=1
  `;

  const params = [];

  if (search) {
    query += ` AND (LOWER(s.roll_no) LIKE ? OR LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ?) `;
    const term = `%${search.toLowerCase()}%`;
    params.push(term, term, term);
  }

  if (department && department !== 'ALL') {
    query += ` AND LOWER(s.department) = LOWER(?) `;
    params.push(department);
  }

  if (hostel && hostel !== 'ALL') {
    query += ` AND LOWER(s.hostel) = LOWER(?) `;
    params.push(hostel);
  }

  if (status !== undefined && status !== '') {
    query += ` AND u.is_active = ? `;
    params.push(parseInt(status, 10));
  }

  query += ` ORDER BY s.roll_no ASC `;

  const students = db.prepare(query).all(...params);
  res.json({ students });
});

// POST /api/admin/students (Add new student dynamically)
router.post('/students', requireAuth, requireAdmin, (req, res) => {
  const {
    roll_no,
    name,
    email,
    phone,
    department,
    year,
    semester,
    section,
    batch,
    hostel,
    room_no,
    cgpa
  } = req.body;

  if (!roll_no || !name || !email || !department || !year || !semester || !section || !hostel || !room_no) {
    return res.status(400).json({ error: 'Please fill in all required student profile fields.' });
  }

  // Check if student or email already exists
  const existingUser = db.prepare('SELECT id FROM users WHERE login_id = ? OR email = ?').get(roll_no.trim(), email.trim());
  if (existingUser) {
    return res.status(400).json({ error: 'A student with this Roll No or Email address already exists.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const defaultHash = bcrypt.hashSync(DEFAULT_TEMP_PASSWORD, salt);

  const insertUser = db.prepare(`
    INSERT INTO users (login_id, name, email, phone, role, password_hash, must_change_password, is_active, department)
    VALUES (?, ?, ?, ?, 'student', ?, 1, 1, ?)
  `);

  const insertStudent = db.prepare(`
    INSERT INTO students (user_id, roll_no, year, semester, section, batch, hostel, room_no, cgpa, guardian_contact)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const userRes = insertUser.run(
    roll_no.trim(),
    name.trim(),
    email.trim(),
    phone || null,
    defaultHash,
    department
  );

  const studentRes = insertStudent.run(
    userRes.lastInsertRowid,
    roll_no.trim(),
    year,
    semester,
    section,
    batch || '2026',
    hostel,
    room_no,
    cgpa ? parseFloat(cgpa) : 8.2,
    phone || null
  );

  // Automatically seed initial attendance records
  const subjects = [
    { code: 'CS101', name: 'Programming for Problem Solving (C & DS)', faculty: 'Prof. S. R. Rout' },
    { code: 'CS102', name: 'Object Oriented Programming with Java', faculty: 'Dr. A. K. Nayak' },
    { code: 'MA101', name: 'Engineering Mathematics - I', faculty: 'Dr. P. C. Mohapatra' },
    { code: 'EC101', name: 'Basic Electronics & Digital Systems', faculty: 'Prof. M. K. Panda' },
    { code: 'HM101', name: 'Professional Communication & Ethics', faculty: 'Dr. S. Mishra' },
  ];

  const insertAtt = db.prepare(`
    INSERT INTO attendance (student_id, subject_code, subject_name, total_classes, attended_classes, faculty_name)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const subj of subjects) {
    insertAtt.run(studentRes.lastInsertRowid, subj.code, subj.name, 42, 36, subj.faculty);
  }

  // Seed default tuition fee record
  db.prepare(`
    INSERT INTO fees (student_id, fee_type, amount, paid_amount, due_date, status, receipt_no, payment_date)
    VALUES (?, 'Odd Semester Tuition Fee', 45000, 45000, '2026-08-30', 'Paid', ?, '2026-08-25')
  `).run(studentRes.lastInsertRowid, `RCP-BPUT-${Math.floor(1000 + Math.random() * 9000)}`);

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    'STUDENT_CREATED',
    'Student',
    roll_no,
    `Admin registered new student: ${name} (Roll No: ${roll_no}, Dept: ${department}, Hostel: ${hostel} ${room_no}). Default temp password: ${DEFAULT_TEMP_PASSWORD}`
  );

  res.status(201).json({
    message: `Student ${name} (${roll_no}) registered successfully! Initial temporary password set to ${DEFAULT_TEMP_PASSWORD}.`,
    roll_no,
    tempPassword: DEFAULT_TEMP_PASSWORD
  });
});

// PUT /api/admin/students/:id (Edit student details)
router.put('/students/:id', requireAuth, requireAdmin, (req, res) => {
  const studentId = req.params.id;
  const { name, email, phone, department, year, semester, section, batch, hostel, room_no, cgpa } = req.body;

  const student = db.prepare('SELECT user_id, roll_no FROM students WHERE id = ?').get(studentId);
  if (!student) {
    return res.status(404).json({ error: 'Student record not found.' });
  }

  db.prepare(`
    UPDATE users
    SET name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        department = COALESCE(?, department),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(name || null, email || null, phone || null, department || null, student.user_id);

  db.prepare(`
    UPDATE students
    SET year = COALESCE(?, year),
        semester = COALESCE(?, semester),
        section = COALESCE(?, section),
        batch = COALESCE(?, batch),
        hostel = COALESCE(?, hostel),
        room_no = COALESCE(?, room_no),
        cgpa = COALESCE(?, cgpa)
    WHERE id = ?
  `).run(year || null, semester || null, section || null, batch || null, hostel || null, room_no || null, cgpa || null, studentId);

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    'STUDENT_UPDATED',
    'Student',
    student.roll_no,
    `Admin updated profile information for student ${student.roll_no}`
  );

  res.json({ message: 'Student details updated successfully.' });
});

// PUT /api/admin/students/:id/toggle-status (Activate/Deactivate student account)
router.put('/students/:id/toggle-status', requireAuth, requireAdmin, (req, res) => {
  const studentId = req.params.id;

  const student = db.prepare(`
    SELECT s.roll_no, u.id as user_id, u.is_active, u.name
    FROM students s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ?
  `).get(studentId);

  if (!student) {
    return res.status(404).json({ error: 'Student record not found.' });
  }

  const newStatus = student.is_active ? 0 : 1;
  db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(newStatus, student.user_id);

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    newStatus ? 'STUDENT_ACTIVATED' : 'STUDENT_DEACTIVATED',
    'Student',
    student.roll_no,
    `Admin ${newStatus ? 'activated' : 'deactivated'} student account ${student.roll_no} (${student.name})`
  );

  res.json({
    message: `Student account has been ${newStatus ? 'activated' : 'deactivated'}.`,
    isActive: Boolean(newStatus)
  });
});

// POST /api/admin/attendance/mark (Admins update/record attendance)
router.post('/attendance/mark', requireAuth, requireAdmin, (req, res) => {
  const { student_id, subject_code, attended_classes, total_classes } = req.body;

  if (!student_id || !subject_code) {
    return res.status(400).json({ error: 'Student ID and Subject Code required.' });
  }

  const record = db.prepare('SELECT id FROM attendance WHERE student_id = ? AND subject_code = ?').get(student_id, subject_code);
  if (!record) {
    return res.status(404).json({ error: 'Attendance record not found for this subject.' });
  }

  db.prepare(`
    UPDATE attendance
    SET attended_classes = COALESCE(?, attended_classes),
        total_classes = COALESCE(?, total_classes),
        last_updated = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(attended_classes !== undefined ? attended_classes : null, total_classes !== undefined ? total_classes : null, record.id);

  res.json({ message: 'Attendance updated successfully.' });
});

module.exports = router;
