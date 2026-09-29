const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'bput-hackathon-2026-ps07-fretbox-campus-secret-key';
const JWT_EXPIRES_IN = '7d';

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      login_id: user.login_id,
      role: user.role,
      name: user.name,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Authentication Middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Fetch fresh user record from DB to verify active status
    const user = db.prepare(`
      SELECT u.id, u.login_id, u.name, u.email, u.phone, u.role, u.department, u.must_change_password, u.is_active,
             s.id as student_db_id, s.roll_no, s.year, s.semester, s.section, s.batch, s.hostel, s.room_no,
             a.id as admin_db_id, a.admin_id, a.department_area, a.office_location
      FROM users u
      LEFT JOIN students s ON s.user_id = u.id
      LEFT JOIN admins a ON a.user_id = u.id
      WHERE u.id = ?
    `).get(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account has been deactivated. Please contact campus administration.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

// Any Admin Middleware (Super Admin, Academic Admin, Hostel Admin)
// PER PS07 REQUIREMENT: ALL THREE ADMIN ROLES HAVE FULL APPROVAL & MANAGEMENT ACCESS
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const adminRoles = ['super_admin', 'academic_admin', 'hostel_admin'];
  if (!adminRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Administrative privileges required.' });
  }

  next();
}

// Super Admin Only Middleware (for user creation/deactivation & system settings)
function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super Admin access required for this action.' });
  }
  next();
}

// Log audit activity
function logActivity(userId, userName, userRole, action, entityType, entityId, details) {
  try {
    db.prepare(`
      INSERT INTO activity_logs (user_id, user_name, user_role, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, userName, userRole, action, entityType, entityId, details);
  } catch (err) {
    console.error('Audit log failure:', err.message);
  }
}

// Helper to send in-app notification
function createNotification(userId, title, message, type, referenceId) {
  try {
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type, reference_id, is_read)
      VALUES (?, ?, ?, ?, ?, 0)
    `).run(userId, title, message, type, referenceId);
  } catch (err) {
    console.error('Notification creation failure:', err.message);
  }
}

module.exports = {
  JWT_SECRET,
  generateToken,
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  logActivity,
  createNotification
};
