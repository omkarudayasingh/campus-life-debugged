const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { requireAuth, requireAdmin, logActivity, createNotification } = require('../auth');

// GET /api/notices (Targeted list for students; full list for admins)
router.get('/', requireAuth, (req, res) => {
  const isAdmin = ['super_admin', 'academic_admin', 'hostel_admin'].includes(req.user.role);

  if (isAdmin) {
    const notices = db.prepare(`
      SELECT n.*, u.name as posted_by_name,
             (SELECT COUNT(*) FROM notice_reads nr WHERE nr.notice_id = n.id) as read_count
      FROM notices n
      JOIN users u ON u.id = n.posted_by_admin_id
      ORDER BY n.created_at DESC
    `).all();

    return res.json({ notices });
  }

  // Student is requesting - filter by targeting
  const student = db.prepare(`
    SELECT s.*, u.department FROM students s
    JOIN users u ON u.id = s.user_id
    WHERE s.user_id = ?
  `).get(req.user.id);

  if (!student) {
    return res.status(404).json({ error: 'Student record not found.' });
  }

  const notices = db.prepare(`
    SELECT n.*, u.name as posted_by_name,
           EXISTS(SELECT 1 FROM notice_reads nr WHERE nr.notice_id = n.id AND nr.user_id = ?) as is_read
    FROM notices n
    JOIN users u ON u.id = n.posted_by_admin_id
    WHERE n.target_type = 'All'
       OR (n.target_type = 'Department' AND LOWER(n.target_value) = LOWER(?))
       OR (n.target_type = 'Year' AND LOWER(n.target_value) = LOWER(?))
       OR (n.target_type = 'Section' AND LOWER(n.target_value) = LOWER(?))
       OR (n.target_type = 'Hostel' AND LOWER(n.target_value) = LOWER(?))
    ORDER BY 
      CASE n.priority
        WHEN 'Urgent' THEN 1
        WHEN 'Important' THEN 2
        ELSE 3
      END,
      n.created_at DESC
  `).all(req.user.id, student.department, student.year, `Section ${student.section}`, student.hostel);

  res.json({ notices });
});

// POST /api/notices (Admins create targeted notice)
router.post('/', requireAuth, requireAdmin, (req, res) => {
  const { title, content, category, priority, target_type, target_value } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({ error: 'Please provide Title, Content, and Category.' });
  }

  const p = priority || 'Normal';
  const tt = target_type || 'All';
  const tv = target_value || 'ALL';

  const insert = db.prepare(`
    INSERT INTO notices (title, content, category, priority, target_type, target_value, posted_by_admin_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const info = insert.run(title, content, category, p, tt, tv, req.user.id);

  // If priority is Urgent or Important, create in-app notifications for matching students
  let targetedUsers = [];
  if (tt === 'All') {
    targetedUsers = db.prepare("SELECT id FROM users WHERE role = 'student'").all();
  } else if (tt === 'Hostel') {
    targetedUsers = db.prepare("SELECT u.id FROM users u JOIN students s ON s.user_id = u.id WHERE LOWER(s.hostel) = LOWER(?)").all(tv);
  } else if (tt === 'Department') {
    targetedUsers = db.prepare("SELECT u.id FROM users u WHERE LOWER(u.department) = LOWER(?) AND u.role = 'student'").all(tv);
  }

  for (const tu of targetedUsers) {
    createNotification(
      tu.id,
      `Notice: ${title}`,
      `A new ${category} notice has been published: ${title}`,
      'notice',
      String(info.lastInsertRowid)
    );
  }

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    'NOTICE_POSTED',
    'Notice',
    String(info.lastInsertRowid),
    `Posted notice: "${title}" (Target: ${tt} - ${tv}, Priority: ${p})`
  );

  res.status(201).json({
    message: 'Notice broadcasted successfully!',
    id: info.lastInsertRowid
  });
});

// POST /api/notices/:id/read (Student marks notice as read)
router.post('/:id/read', requireAuth, (req, res) => {
  const noticeId = req.params.id;

  try {
    db.prepare(`
      INSERT INTO notice_reads (notice_id, user_id)
      VALUES (?, ?)
      ON CONFLICT(notice_id, user_id) DO UPDATE SET read_at = CURRENT_TIMESTAMP
    `).run(noticeId, req.user.id);
  } catch (err) {
    // Ignore duplicate conflict
  }

  res.json({ success: true });
});

module.exports = router;
