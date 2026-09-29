const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { requireAuth, requireAdmin, logActivity, createNotification } = require('../auth');

// GET /api/documents
router.get('/', requireAuth, (req, res) => {
  const isAdmin = ['super_admin', 'academic_admin', 'hostel_admin'].includes(req.user.role);

  let query = `
    SELECT d.*, s.roll_no, u.name as student_name, s.department, s.year, s.semester, s.batch, s.hostel, s.room_no,
           admin_u.name as reviewed_by_admin_name
    FROM document_requests d
    JOIN students s ON s.id = d.student_id
    JOIN users u ON u.id = s.user_id
    LEFT JOIN users admin_u ON admin_u.id = d.reviewed_by_admin_id
  `;

  const params = [];
  if (!isAdmin) {
    query += ` WHERE d.student_id = ? `;
    params.push(req.user.student_db_id);
  }

  if (req.query.status) {
    query += (params.length ? ' AND ' : ' WHERE ') + ` d.status = ? `;
    params.push(req.query.status);
  }

  query += ` ORDER BY d.created_at DESC `;
  const docs = db.prepare(query).all(...params);

  res.json({ documents: docs });
});

// POST /api/documents (Student requests certificate/document)
router.post('/', requireAuth, (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can request documents/certificates.' });
  }

  const { doc_type, purpose, copies } = req.body;

  if (!doc_type || !purpose) {
    return res.status(400).json({ error: 'Please specify Document Type and Purpose.' });
  }

  const student = db.prepare('SELECT id, user_id FROM students WHERE user_id = ?').get(req.user.id);
  if (!student) {
    return res.status(404).json({ error: 'Student record not found.' });
  }

  const countRow = db.prepare('SELECT count(*) as count FROM document_requests').get();
  const requestNo = `DOC-2026-${String(countRow.count + 1).padStart(3, '0')}`;

  const insert = db.prepare(`
    INSERT INTO document_requests (
      request_no, student_id, doc_type, purpose, copies, status
    ) VALUES (?, ?, ?, ?, ?, 'Submitted')
  `);

  const info = insert.run(
    requestNo,
    student.id,
    doc_type,
    purpose,
    copies || 1
  );

  createNotification(
    req.user.id,
    'Document Request Queued',
    `Your request for ${doc_type} (#${requestNo}) has been submitted to the academic/facilities desk.`,
    'document',
    requestNo
  );

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    'DOCUMENT_REQUESTED',
    'Document',
    requestNo,
    `Requested ${doc_type} for ${purpose}`
  );

  res.status(201).json({
    message: 'Document application submitted successfully!',
    requestNo,
    id: info.lastInsertRowid
  });
});

// PUT /api/documents/:id/status (Admins process and issue certificate)
// PER PS07 REQUIREMENT: ALL THREE ADMIN ROLES HAVE FULL APPROVAL & MANAGEMENT ACCESS
router.put('/:id/status', requireAuth, requireAdmin, (req, res) => {
  const docId = req.params.id;
  const { status, admin_remarks } = req.body;

  const validStatuses = ['Submitted', 'Processing', 'Ready for Download', 'Rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid document status.' });
  }

  const doc = db.prepare(`
    SELECT d.*, s.user_id as student_user_id, s.roll_no, u.name as student_name
    FROM document_requests d
    JOIN students s ON s.id = d.student_id
    JOIN users u ON u.id = s.user_id
    WHERE d.id = ?
  `).get(docId);

  if (!doc) {
    return res.status(404).json({ error: 'Document request not found.' });
  }

  let certificateNo = doc.certificate_no;
  if (status === 'Ready for Download' && !certificateNo) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    certificateNo = `BPUT/CERT/2026/${randomDigits}`;
  }

  db.prepare(`
    UPDATE document_requests
    SET status = ?, certificate_no = ?, admin_remarks = ?, reviewed_by_admin_id = ?, reviewed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(status, certificateNo || null, admin_remarks || null, req.user.id, docId);

  const notifMsg = status === 'Ready for Download'
    ? `Your ${doc.doc_type} (#${doc.request_no}) is approved! Certificate No: ${certificateNo}. You can view and print it now.`
    : `Your request #${doc.request_no} for ${doc.doc_type} is now: ${status}.`;

  createNotification(
    doc.student_user_id,
    `Document Request ${status}`,
    notifMsg,
    'document',
    doc.request_no
  );

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    `DOCUMENT_${status.toUpperCase().replace(/\s+/g, '_')}`,
    'Document',
    doc.request_no,
    `Updated status to ${status}. Cert No: ${certificateNo || 'N/A'}`
  );

  res.json({
    message: `Document request updated to ${status}.`,
    requestNo: doc.request_no,
    certificateNo,
    status
  });
});

// GET /api/documents/:id/certificate (Fetch formatted data for printing certificate)
router.get('/:id/certificate', requireAuth, (req, res) => {
  const docId = req.params.id;

  const doc = db.prepare(`
    SELECT d.*, s.roll_no, u.name as student_name, s.department, s.year, s.semester, s.batch, s.hostel, s.room_no,
           admin_u.name as issued_by_name, admin_u.role as issued_by_role
    FROM document_requests d
    JOIN students s ON s.id = d.student_id
    JOIN users u ON u.id = s.user_id
    LEFT JOIN users admin_u ON admin_u.id = d.reviewed_by_admin_id
    WHERE d.id = ?
  `).get(docId);

  if (!doc) {
    return res.status(404).json({ error: 'Document record not found.' });
  }

  // Only permit student owner or admins to view/print
  const isAdmin = ['super_admin', 'academic_admin', 'hostel_admin'].includes(req.user.role);
  if (!isAdmin && doc.student_id !== req.user.student_db_id) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  res.json({ certificate: doc });
});

module.exports = router;
