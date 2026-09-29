const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { requireAuth, requireAdmin, logActivity } = require('../auth');

// GET /api/hostel/info
router.get('/info', requireAuth, (req, res) => {
  // If student, return their hostel info + roommates
  if (req.user.role === 'student') {
    const student = db.prepare(`
      SELECT s.*, u.name, u.email, u.phone
      FROM students s
      JOIN users u ON u.id = s.user_id
      WHERE s.user_id = ?
    `).get(req.user.id);

    const roommates = db.prepare(`
      SELECT s.roll_no, u.name, u.phone, s.department, s.room_no
      FROM students s
      JOIN users u ON u.id = s.user_id
      WHERE s.hostel = ? AND s.room_no = ? AND s.id != ?
    `).all(student.hostel, student.room_no, student.id);

    const warden = db.prepare(`
      SELECT u.name, u.phone, u.email, a.office_location, a.department_area
      FROM users u
      JOIN admins a ON a.user_id = u.id
      WHERE u.role = 'hostel_admin'
    `).get();

    return res.json({
      myHostel: student.hostel,
      myRoom: student.room_no,
      roommates,
      warden: warden || { name: 'Priya Ranjan das', phone: '9692862270', email: 'priyaranjandas0987@gmail.com', office_location: 'Chief Warden Office, BH-1' },
      emergencyContacts: [
        { role: 'Campus Ambulance & Medical Clinic', contact: '+91 94370 11222' },
        { role: 'Campus Security Control Room', contact: '+91 94370 33444' },
        { role: 'Hostel Maintenance Desk (Plumbing & Power)', contact: '+91 94370 55666' }
      ]
    });
  }

  // If Admin, return summary of all hostels and occupancy
  const hostelStats = db.prepare(`
    SELECT hostel, COUNT(*) as student_count, COUNT(DISTINCT room_no) as rooms_occupied
    FROM students
    GROUP BY hostel
  `).all();

  res.json({ hostels: hostelStats });
});

// GET /api/hostel/mess-menu
router.get('/mess-menu', requireAuth, (req, res) => {
  const menu = db.prepare('SELECT * FROM mess_menu ORDER BY id ASC').all();

  // Group by day of week
  const grouped = {};
  for (const item of menu) {
    if (!grouped[item.day_of_week]) {
      grouped[item.day_of_week] = {};
    }
    grouped[item.day_of_week][item.meal_type] = item;
  }

  // Get current day feedback stats
  const feedbackStats = db.prepare(`
    SELECT meal_type, ROUND(AVG(rating), 1) as avg_rating, COUNT(*) as total_reviews
    FROM mess_feedback
    GROUP BY meal_type
  `).all();

  res.json({
    weeklyMenu: grouped,
    rawMenu: menu,
    feedbackStats
  });
});

// POST /api/hostel/mess-feedback (Student submits feedback)
router.post('/mess-feedback', requireAuth, (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can submit mess feedback.' });
  }

  const { meal_type, rating, comments } = req.body;

  if (!meal_type || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Please provide valid meal type and rating between 1 and 5.' });
  }

  const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(req.user.id);

  db.prepare(`
    INSERT INTO mess_feedback (student_id, meal_type, rating, comments)
    VALUES (?, ?, ?, ?)
  `).run(student.id, meal_type, rating, comments || null);

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    'MESS_FEEDBACK_SUBMITTED',
    'MessFeedback',
    meal_type,
    `Rated ${meal_type} as ${rating}/5 stars. Comment: "${comments || 'No comment'}"`
  );

  res.json({ success: true, message: 'Thank you! Your mess feedback has been recorded.' });
});

// PUT /api/hostel/mess-menu/:id (Admins update menu item)
router.put('/mess-menu/:id', requireAuth, requireAdmin, (req, res) => {
  const { menu_items, special_item, timing } = req.body;
  const menuId = req.params.id;

  db.prepare(`
    UPDATE mess_menu
    SET menu_items = COALESCE(?, menu_items),
        special_item = COALESCE(?, special_item),
        timing = COALESCE(?, timing)
    WHERE id = ?
  `).run(menu_items || null, special_item || null, timing || null, menuId);

  res.json({ success: true, message: 'Mess menu item updated successfully.' });
});

module.exports = router;
