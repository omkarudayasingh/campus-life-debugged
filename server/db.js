const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'campus_life.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for high performance and integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
function initSchema() {
  db.exec(`
    -- USERS TABLE
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      login_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      role TEXT NOT NULL CHECK(role IN ('student', 'super_admin', 'academic_admin', 'hostel_admin')),
      password_hash TEXT NOT NULL,
      must_change_password INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      department TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- STUDENTS TABLE
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      roll_no TEXT UNIQUE NOT NULL,
      year TEXT NOT NULL,
      semester TEXT NOT NULL,
      section TEXT NOT NULL,
      batch TEXT NOT NULL,
      hostel TEXT NOT NULL,
      room_no TEXT NOT NULL,
      cgpa REAL DEFAULT 8.2,
      guardian_contact TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- ADMINS TABLE
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      admin_id TEXT UNIQUE NOT NULL,
      department_area TEXT NOT NULL,
      office_location TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- PASSWORD RESET TOKENS
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at INTEGER NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- ATTENDANCE TABLE
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      subject_code TEXT NOT NULL,
      subject_name TEXT NOT NULL,
      total_classes INTEGER NOT NULL DEFAULT 40,
      attended_classes INTEGER NOT NULL DEFAULT 35,
      faculty_name TEXT,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    -- TIMETABLES TABLE
    CREATE TABLE IF NOT EXISTS timetables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      department TEXT NOT NULL,
      semester TEXT NOT NULL,
      section TEXT NOT NULL,
      day_of_week TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      subject_code TEXT NOT NULL,
      subject_name TEXT NOT NULL,
      faculty_name TEXT NOT NULL,
      room_no TEXT NOT NULL
    );

    -- COMPLAINTS TABLE
    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_no TEXT UNIQUE NOT NULL,
      student_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      location_type TEXT NOT NULL,
      location_details TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT NOT NULL CHECK(priority IN ('Low', 'Medium', 'High', 'Urgent')),
      status TEXT NOT NULL DEFAULT 'Submitted' CHECK(status IN ('Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected')),
      assigned_to TEXT,
      admin_notes TEXT,
      resolution_remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME,
      resolved_by_admin_id INTEGER,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (resolved_by_admin_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- LEAVE REQUESTS TABLE
    CREATE TABLE IF NOT EXISTS leave_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_no TEXT UNIQUE NOT NULL,
      student_id INTEGER NOT NULL,
      leave_type TEXT NOT NULL,
      from_date TEXT NOT NULL,
      to_date TEXT NOT NULL,
      total_days INTEGER NOT NULL DEFAULT 1,
      reason TEXT NOT NULL,
      destination_address TEXT NOT NULL,
      emergency_contact TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected')),
      admin_remarks TEXT,
      reviewed_by_admin_id INTEGER,
      reviewed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewed_by_admin_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- GATE PASSES TABLE
    CREATE TABLE IF NOT EXISTS gate_passes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pass_code TEXT UNIQUE NOT NULL,
      student_id INTEGER NOT NULL,
      purpose TEXT NOT NULL,
      destination TEXT NOT NULL,
      out_time TEXT NOT NULL,
      expected_in_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected', 'Checked Out', 'Checked In', 'Expired')),
      actual_out_time TEXT,
      actual_in_time TEXT,
      admin_remarks TEXT,
      reviewed_by_admin_id INTEGER,
      reviewed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewed_by_admin_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- DOCUMENT / CERTIFICATE REQUESTS TABLE
    CREATE TABLE IF NOT EXISTS document_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_no TEXT UNIQUE NOT NULL,
      student_id INTEGER NOT NULL,
      doc_type TEXT NOT NULL,
      purpose TEXT NOT NULL,
      copies INTEGER DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'Submitted' CHECK(status IN ('Submitted', 'Processing', 'Ready for Download', 'Rejected')),
      certificate_no TEXT,
      admin_remarks TEXT,
      reviewed_by_admin_id INTEGER,
      reviewed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewed_by_admin_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- NOTICES TABLE
    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'Normal' CHECK(priority IN ('Normal', 'Important', 'Urgent')),
      target_type TEXT NOT NULL DEFAULT 'All' CHECK(target_type IN ('All', 'Department', 'Year', 'Section', 'Hostel')),
      target_value TEXT NOT NULL DEFAULT 'ALL',
      posted_by_admin_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (posted_by_admin_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- NOTICE READS TRACKING TABLE
    CREATE TABLE IF NOT EXISTS notice_reads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notice_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(notice_id, user_id),
      FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- NOTIFICATIONS TABLE
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      reference_id TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- FEES AND DUES TABLE
    CREATE TABLE IF NOT EXISTS fees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      fee_type TEXT NOT NULL,
      amount REAL NOT NULL,
      paid_amount REAL NOT NULL DEFAULT 0,
      due_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Paid', 'Partial', 'Pending', 'Overdue')),
      receipt_no TEXT,
      payment_date TEXT,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    -- MESS MENU TABLE
    CREATE TABLE IF NOT EXISTS mess_menu (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_of_week TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      menu_items TEXT NOT NULL,
      timing TEXT NOT NULL,
      dietary_type TEXT NOT NULL,
      special_item TEXT
    );

    -- MESS FEEDBACK TABLE
    CREATE TABLE IF NOT EXISTS mess_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      meal_type TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      comments TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    -- ACTIVITY / AUDIT LOG TABLE (PS07 Actionable Audit Trail)
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      user_name TEXT NOT NULL,
      user_role TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- CREATE PERFORMANCE INDEXES
    CREATE INDEX IF NOT EXISTS idx_users_login_id ON users(login_id);
    CREATE INDEX IF NOT EXISTS idx_students_roll_no ON students(roll_no);
    CREATE INDEX IF NOT EXISTS idx_complaints_student ON complaints(student_id);
    CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
    CREATE INDEX IF NOT EXISTS idx_leave_student ON leave_requests(student_id);
    CREATE INDEX IF NOT EXISTS idx_gate_student ON gate_passes(student_id);
    CREATE INDEX IF NOT EXISTS idx_docs_student ON document_requests(student_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
  `);
}

initSchema();

module.exports = { db, initSchema };
