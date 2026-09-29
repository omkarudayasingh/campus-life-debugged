const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { db } = require('../db');
const { generateToken, requireAuth, logActivity } = require('../auth');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { login_id, password } = req.body;

  if (!login_id || !password) {
    return res.status(400).json({ error: 'Please enter your Login ID / Roll No and password.' });
  }

  const user = db.prepare(`
    SELECT u.id, u.login_id, u.name, u.email, u.phone, u.role, u.password_hash,
           u.must_change_password, u.is_active, u.department,
           s.id as student_db_id, s.roll_no, s.year, s.semester, s.section, s.batch, s.hostel, s.room_no, s.cgpa,
           a.id as admin_db_id, a.admin_id, a.department_area, a.office_location
    FROM users u
    LEFT JOIN students s ON s.user_id = u.id
    LEFT JOIN admins a ON a.user_id = u.id
    WHERE LOWER(u.login_id) = LOWER(?) OR LOWER(u.email) = LOWER(?)
  `).get(login_id.trim(), login_id.trim());

  if (!user) {
    return res.status(401).json({ error: 'Invalid Login ID / Roll No or password.' });
  }

  if (!user.is_active) {
    return res.status(403).json({ error: 'This account has been deactivated. Please contact campus admin.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid Login ID / Roll No or password.' });
  }

  const token = generateToken(user);

  logActivity(
    user.id,
    user.name,
    user.role,
    'USER_LOGIN',
    'User',
    user.login_id,
    `Logged in from device. Must change password: ${user.must_change_password ? 'YES' : 'NO'}`
  );

  const { password_hash, ...safeUser } = user;
  safeUser.mustChangePassword = Boolean(user.must_change_password);

  return res.json({
    token,
    user: safeUser,
    mustChangePassword: Boolean(user.must_change_password),
    message: user.must_change_password
      ? 'First login detected. You must change your temporary password before proceeding.'
      : 'Login successful.'
  });
});

// POST /api/auth/change-password
// FIRST LOGIN MANDATORY PASSWORD CHANGE OR VOLUNTARY SETTINGS CHANGE
router.post('/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  // Get current user password hash
  const user = db.prepare('SELECT password_hash, must_change_password FROM users WHERE id = ?').get(req.user.id);

  // If user is doing standard change (not first login forced with known cam@123), verify currentPassword if supplied
  if (currentPassword) {
    const isCurrentMatch = bcrypt.compareSync(currentPassword, user.password_hash);
    if (!isCurrentMatch) {
      return res.status(400).json({ error: 'Current password does not match records.' });
    }
  }

  // Hash new password
  const salt = bcrypt.genSaltSync(10);
  const newHash = bcrypt.hashSync(newPassword, salt);

  db.prepare(`
    UPDATE users
    SET password_hash = ?, must_change_password = 0, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(newHash, req.user.id);

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    'PASSWORD_CHANGED',
    'User',
    req.user.login_id,
    'Successfully changed temporary password to secure user password.'
  );

  // Return updated user profile
  const updatedUser = db.prepare(`
    SELECT u.id, u.login_id, u.name, u.email, u.phone, u.role, u.department, u.must_change_password, u.is_active,
           s.id as student_db_id, s.roll_no, s.year, s.semester, s.section, s.batch, s.hostel, s.room_no, s.cgpa,
           a.id as admin_db_id, a.admin_id, a.department_area, a.office_location
    FROM users u
    LEFT JOIN students s ON s.user_id = u.id
    LEFT JOIN admins a ON a.user_id = u.id
    WHERE u.id = ?
  `).get(req.user.id);

  const newToken = generateToken(updatedUser);
  updatedUser.mustChangePassword = false;

  res.json({
    token: newToken,
    user: updatedUser,
    message: 'Password successfully updated! Full dashboard access granted.'
  });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  const { identifier } = req.body;

  if (!identifier) {
    return res.status(400).json({ error: 'Please provide your Roll No / Admin ID or registered Email.' });
  }

  const user = db.prepare(`
    SELECT id, login_id, name, email, role FROM users
    WHERE LOWER(login_id) = LOWER(?) OR LOWER(email) = LOWER(?)
  `).get(identifier.trim(), identifier.trim());

  if (!user) {
    // Return friendly message without disclosing user existence for security
    return res.status(200).json({
      message: 'If an account exists with that Roll No or Email, a password reset token has been generated.'
    });
  }

  // Generate single-use cryptographic token valid for 15 minutes
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

  // Invalidate any previous unused tokens for this user
  db.prepare('UPDATE password_resets SET used = 1 WHERE user_id = ?').run(user.id);

  // Insert new token
  db.prepare(`
    INSERT INTO password_resets (user_id, token, expires_at, used)
    VALUES (?, ?, ?, 0)
  `).run(user.id, token, expiresAt);

  logActivity(
    user.id,
    user.name,
    user.role,
    'FORGOT_PASSWORD_REQUEST',
    'User',
    user.login_id,
    'Requested password reset token'
  );

  // In production, this would trigger an SMTP email dispatch.
  // For hackathon evaluation and testing without SMTP dependencies, we return the token in the response payload.
  res.json({
    message: 'Password reset token generated successfully. Valid for 15 minutes.',
    resetToken: token,
    userEmail: user.email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp2 + '***'),
    login_id: user.login_id
  });
});

// POST /api/auth/verify-reset-token
router.post('/verify-reset-token', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required.' });
  }

  const record = db.prepare(`
    SELECT r.id, r.user_id, r.expires_at, r.used, u.name, u.login_id, u.email
    FROM password_resets r
    JOIN users u ON u.id = r.user_id
    WHERE r.token = ?
  `).get(token);

  if (!record) {
    return res.status(400).json({ error: 'Invalid password reset token.' });
  }

  if (record.used) {
    return res.status(400).json({ error: 'This reset token has already been used. Please request a new one.' });
  }

  if (Date.now() > record.expires_at) {
    return res.status(400).json({ error: 'This reset token has expired. Please request a new one.' });
  }

  res.json({
    valid: true,
    user: {
      name: record.name,
      login_id: record.login_id,
      email: record.email
    }
  });
});

// POST /api/auth/reset-password
router.post('/reset-password', (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const record = db.prepare(`
    SELECT r.id, r.user_id, r.expires_at, r.used, u.login_id, u.name, u.role
    FROM password_resets r
    JOIN users u ON u.id = r.user_id
    WHERE r.token = ?
  `).get(token);

  if (!record) {
    return res.status(400).json({ error: 'Invalid password reset token.' });
  }

  if (record.used) {
    return res.status(400).json({ error: 'This reset token has already been used.' });
  }

  if (Date.now() > record.expires_at) {
    return res.status(400).json({ error: 'This reset token has expired.' });
  }

  // Hash new password
  const salt = bcrypt.genSaltSync(10);
  const newHash = bcrypt.hashSync(newPassword, salt);

  // Update password & clear must_change_password
  db.prepare(`
    UPDATE users
    SET password_hash = ?, must_change_password = 0, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(newHash, record.user_id);

  // Mark token as used
  db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(record.id);

  logActivity(
    record.user_id,
    record.name,
    record.role,
    'PASSWORD_RESET_SUCCESS',
    'User',
    record.login_id,
    'Password was successfully reset using verification token.'
  );

  res.json({
    success: true,
    message: 'Your password has been successfully reset! You can now log in with your new password.'
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: {
      ...req.user,
      mustChangePassword: Boolean(req.user.must_change_password)
    }
  });
});

module.exports = router;
