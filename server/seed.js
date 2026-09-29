const bcrypt = require('bcryptjs');
const { db, initSchema } = require('./db');

const DEFAULT_TEMP_PASSWORD = 'cam@123';

const STUDENTS_DATA = [
  { roll_no: '261062', name: 'Dibyaranjan Mohanta', email: 'dibyaranjanmohanta6371@gmail.com', phone: '99380 83475', department: 'CSE', year: '1st', semester: '1st', section: 'A', batch: '2026', hostel: 'BH-1', room_no: 'B-104' },
  { roll_no: '261034', name: 'Pradyumna Kumar Pradhan', email: 'pradymnakumarpradhan@gmail.com', phone: '90786 16025', department: 'CSE', year: '1st', semester: '1st', section: 'A', batch: '2026', hostel: 'BH-1', room_no: 'B-156' },
  { roll_no: '261061', name: 'Dibyajyoti Senapati', email: 'dibyajyotisenapati314@gmail.com', phone: '84559 57784', department: 'CSE', year: '1st', semester: '1st', section: 'A', batch: '2026', hostel: 'GH-1', room_no: 'G-203' },
  { roll_no: '261005', name: 'Archana Pradhan', email: 'archan46pradhan@gmail.com', phone: '78940 57961', department: 'CSE', year: '1st', semester: '1st', section: 'C', batch: '2026', hostel: 'GH-2', room_no: 'G-504' },
  { roll_no: '261120', name: 'Archita Mohapatra', email: 'architamohapatra149@gmail.com', phone: '91241 26491', department: 'CSE', year: '1st', semester: '1st', section: 'B', batch: '2026', hostel: 'GH-1', room_no: 'G-54' },
  { roll_no: '261054', name: 'Aryan Raj', email: 'aryanr5265@gmail.com', phone: '7209643894', department: 'CSE', year: '1st', semester: '1st', section: 'A', batch: '2026', hostel: 'GH-2', room_no: 'G-509' },
  { roll_no: '261065', name: 'Guruprasad Giri', email: 'guruprasadgiri33@gmail.com', phone: '77356 94382', department: 'CSE', year: '1st', semester: '1st', section: 'B', batch: '2026', hostel: 'BH-1', room_no: 'B-107' },
  { roll_no: '266050', name: 'SubhashrI Samal', email: 'subhashreesamal8890@gmail.com', phone: '80186 55546', department: 'CSE(AI)', year: '1st', semester: '1st', section: 'C', batch: '2026', hostel: 'GH-2', room_no: 'G-204' },
  { roll_no: '261123', name: 'Amrita Sahoo', email: 'amritasahoo686@gmail.com', phone: '98615 22532', department: 'CSE', year: '1st', semester: '1st', section: 'B', batch: '2026', hostel: 'GH-2', room_no: 'G-224' },
  { roll_no: '261028', name: 'Maitry Maheswari Biswal', email: 'biswalmaitrymaheswari@gmail.com', phone: '88478 30817', department: 'CSE', year: '1st', semester: '1st', section: 'A', batch: '2026', hostel: 'GH-1', room_no: 'G-12' },
  { roll_no: '266057', name: 'Pragyan paramita Patra', email: 'pragyanparamitap64@gmail.com', phone: '9692092627', department: 'CSE(AI)', year: '1st', semester: '1st', section: 'B', batch: '2026', hostel: 'GH-1', room_no: 'G-206' },
  { roll_no: '261052', name: 'Aniket Sharma', email: 'aniketsharma705736@gmail.com', phone: '9304900349', department: 'CSE', year: '1st', semester: '1st', section: 'A', batch: 'CSE', hostel: 'BH-3', room_no: 'B-328' },
  { roll_no: '266011', name: 'Muskan Pal', email: 'muskanpal6767@gmail.com', phone: '6207290783', department: 'CSE AI', year: '1st', semester: '1st', section: 'B', batch: '2026', hostel: 'GH-1', room_no: '108' },
  { roll_no: '261011', name: 'Ayesha perween', email: 'ap7536379@gmail.com', phone: '7894308163', department: 'CSE', year: '1st', semester: '1st', section: 'A', batch: '2026', hostel: 'GH-1', room_no: 'G-108' },
  { roll_no: '261031', name: 'Om Bharati', email: 'i.ombharati@gmail.com', phone: '99387 21199', department: 'CSE', year: '1st', semester: '1st', section: 'A', batch: '2026', hostel: 'BH-2', room_no: 'B-350' },
];

const ADMINS_DATA = [
  { admin_id: 'ADM001', name: 'Omkar Udayasingh', email: 'omkarudayasingh456@gmail.com', phone: '9827920063', role: 'super_admin', department_area: 'Administration', office: 'Admin Block, Room 101' },
  { admin_id: 'ADM002', name: 'Priya Ranjan das', email: 'priyaranjandas0987@gmail.com', phone: '9692862270', role: 'hostel_admin', department_area: 'Hostel & Facilities', office: 'Chief Warden Office, BH-1' },
  { admin_id: 'ADM003', name: 'Priyanka Priyadarshani Panda', email: 'pppanda@giet.edu.in', phone: '7849098939', role: 'academic_admin', department_area: 'Academic Affairs', office: 'Dean Academics Office' },
];

async function seedDatabase() {
  console.log('--- Initializing database seed ---');
  initSchema();

  const salt = bcrypt.genSaltSync(10);
  const defaultHash = bcrypt.hashSync(DEFAULT_TEMP_PASSWORD, salt);

  // Insert Admins
  const insertUserStmt = db.prepare(`
    INSERT INTO users (login_id, name, email, phone, role, password_hash, must_change_password, is_active, department)
    VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?)
    ON CONFLICT(login_id) DO UPDATE SET
      name=excluded.name,
      email=excluded.email,
      phone=excluded.phone,
      role=excluded.role,
      department=excluded.department
  `);

  const insertAdminStmt = db.prepare(`
    INSERT INTO admins (user_id, admin_id, department_area, office_location)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(admin_id) DO UPDATE SET
      department_area=excluded.department_area,
      office_location=excluded.office_location
  `);

  for (const adm of ADMINS_DATA) {
    insertUserStmt.run(adm.admin_id, adm.name, adm.email, adm.phone, adm.role, defaultHash, adm.department_area);
    const user = db.prepare('SELECT id FROM users WHERE login_id = ?').get(adm.admin_id);
    insertAdminStmt.run(user.id, adm.admin_id, adm.department_area, adm.office);
    console.log(`Seeded Admin: ${adm.admin_id} - ${adm.name} (${adm.role})`);
  }

  // Insert Students
  const insertStudentStmt = db.prepare(`
    INSERT INTO students (user_id, roll_no, year, semester, section, batch, hostel, room_no, cgpa, guardian_contact)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(roll_no) DO UPDATE SET
      year=excluded.year,
      semester=excluded.semester,
      section=excluded.section,
      batch=excluded.batch,
      hostel=excluded.hostel,
      room_no=excluded.room_no
  `);

  for (const st of STUDENTS_DATA) {
    insertUserStmt.run(st.roll_no, st.name, st.email, st.phone, 'student', defaultHash, st.department);
    const user = db.prepare('SELECT id FROM users WHERE login_id = ?').get(st.roll_no);
    const cgpa = (7.8 + Math.random() * 1.8).toFixed(2);
    insertStudentStmt.run(user.id, st.roll_no, st.year, st.semester, st.section, st.batch, st.hostel, st.room_no, cgpa, st.phone);
    console.log(`Seeded Student: ${st.roll_no} - ${st.name} (${st.department}, ${st.hostel} ${st.room_no})`);
  }

  // Seed Attendance Records for all students
  const subjects = [
    { code: 'CS101', name: 'Programming for Problem Solving (C & DS)', faculty: 'Prof. S. R. Rout' },
    { code: 'CS102', name: 'Object Oriented Programming with Java', faculty: 'Dr. A. K. Nayak' },
    { code: 'MA101', name: 'Engineering Mathematics - I', faculty: 'Dr. P. C. Mohapatra' },
    { code: 'EC101', name: 'Basic Electronics & Digital Systems', faculty: 'Prof. M. K. Panda' },
    { code: 'HM101', name: 'Professional Communication & Ethics', faculty: 'Dr. S. Mishra' },
  ];

  const checkAttendance = db.prepare('SELECT COUNT(*) as count FROM attendance').get();
  if (checkAttendance.count === 0) {
    console.log('Seeding attendance records...');
    const students = db.prepare('SELECT id FROM students').all();
    const insertAtt = db.prepare(`
      INSERT INTO attendance (student_id, subject_code, subject_name, total_classes, attended_classes, faculty_name)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const s of students) {
      for (const subj of subjects) {
        const total = 42;
        // Range 32 to 40 (approx 76% to 95%)
        const attended = Math.floor(32 + Math.random() * 9);
        insertAtt.run(s.id, subj.code, subj.name, total, attended, subj.faculty);
      }
    }
  }

  // Seed Timetables
  const checkTimetable = db.prepare('SELECT COUNT(*) as count FROM timetables').get();
  if (checkTimetable.count === 0) {
    console.log('Seeding timetable...');
    const insertTt = db.prepare(`
      INSERT INTO timetables (department, semester, section, day_of_week, time_slot, subject_code, subject_name, faculty_name, room_no)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const slots = [
      { time: '09:00 AM - 10:00 AM', subj: subjects[0], room: 'LH-101' },
      { time: '10:05 AM - 11:05 AM', subj: subjects[1], room: 'LH-101' },
      { time: '11:15 AM - 12:15 PM', subj: subjects[2], room: 'LH-101' },
      { time: '01:15 PM - 02:15 PM', subj: subjects[3], room: 'Lab-3' },
      { time: '02:20 PM - 03:20 PM', subj: subjects[4], room: 'LH-102' },
    ];

    for (const day of days) {
      for (const slot of slots) {
        insertTt.run('CSE', '1st', 'A', day, slot.time, slot.subj.code, slot.subj.name, slot.subj.faculty, slot.room);
        insertTt.run('CSE', '1st', 'B', day, slot.time, slot.subj.code, slot.subj.name, slot.subj.faculty, 'LH-103');
        insertTt.run('CSE', '1st', 'C', day, slot.time, slot.subj.code, slot.subj.name, slot.subj.faculty, 'LH-104');
        insertTt.run('CSE(AI)', '1st', 'B', day, slot.time, slot.subj.code, slot.subj.name, slot.subj.faculty, 'AI-Lab 1');
      }
    }
  }

  // Seed Weekly Mess Menu
  const checkMess = db.prepare('SELECT COUNT(*) as count FROM mess_menu').get();
  if (checkMess.count === 0) {
    console.log('Seeding mess menu...');
    const insertMess = db.prepare(`
      INSERT INTO mess_menu (day_of_week, meal_type, menu_items, timing, dietary_type, special_item)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    for (const day of days) {
      insertMess.run(day, 'Breakfast', 'Idli, Sambhar, Coconut Chutney, Bread-Butter-Jam, Boiled Egg/Banana, Tea/Coffee', '07:30 AM - 09:15 AM', 'Veg & Non-Veg Options', 'Filter Coffee');
      insertMess.run(day, 'Lunch', 'Steamed Rice, Dal Fry, Roti, Paneer Butter Masala (Veg) / Fish Curry (Non-Veg), Green Salad, Papad, Curd', '12:15 PM - 02:30 PM', 'Veg / Non-Veg', day === 'Sunday' ? 'Chicken Biryani' : 'Paneer Butter Masala');
      insertMess.run(day, 'Snacks', 'Veg Samosa / Veg Cutlet, Masala Tea, Biscuits', '05:00 PM - 06:15 PM', 'Pure Veg', 'Hot Ginger Tea');
      insertMess.run(day, 'Dinner', 'Jeera Rice, Chana Masala, Tawa Roti, Mix Veg Korma, Gulab Jamun / Kheer', '07:45 PM - 09:30 PM', 'Pure Veg', 'Gulab Jamun');
    }
  }

  // Seed Notices (with different targeting and urgency for PS07 requirements)
  const checkNotices = db.prepare('SELECT COUNT(*) as count FROM notices').get();
  if (checkNotices.count === 0) {
    console.log('Seeding targeted notices...');
    const adminUser = db.prepare('SELECT id FROM users WHERE login_id = ?').get('ADM001');
    const academicAdmin = db.prepare('SELECT id FROM users WHERE login_id = ?').get('ADM003');
    const hostelAdmin = db.prepare('SELECT id FROM users WHERE login_id = ?').get('ADM002');

    const insertNotice = db.prepare(`
      INSERT INTO notices (title, content, category, priority, target_type, target_value, posted_by_admin_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
    `);

    insertNotice.run(
      'BPUT Odd Semester Exam Schedule 2026 Announced',
      'The BPUT Odd Semester Examination schedule has been released. 1st Semester exams commence from 15th October. Admit cards can be downloaded from the university portal once dues are cleared.',
      'Examination',
      'Urgent',
      'All',
      'ALL',
      academicAdmin ? academicAdmin.id : adminUser.id,
      '-1 day'
    );

    insertNotice.run(
      'BH-1 Hostel Water Tank Cleaning Schedule',
      'Notice for all residents of Boys Hostel BH-1: Overhead water tanks will be sanitized this Saturday from 10:00 AM to 02:00 PM. Water supply will remain suspended during this window.',
      'Hostel',
      'Important',
      'Hostel',
      'BH-1',
      hostelAdmin ? hostelAdmin.id : adminUser.id,
      '-2 days'
    );

    insertNotice.run(
      'Hackathon 2026 Coding Lab Access Permissions',
      'CSE & CSE(AI) 1st year participants preparing for Hackathon 2026 can access Lab 3 and Lab 4 until 10:00 PM with approved gate pass or faculty recommendation.',
      'Academic',
      'Normal',
      'Department',
      'CSE',
      academicAdmin ? academicAdmin.id : adminUser.id,
      '-3 days'
    );

    insertNotice.run(
      'GH-1 and GH-2 Curfew and Evening Study Room Guidelines',
      'Study rooms on Ground Floor GH-1 and 2nd Floor GH-2 will remain open 24x7 for upcoming mid-term tests. Maintain silence and display ID cards upon request.',
      'Hostel',
      'Normal',
      'Hostel',
      'GH-1',
      hostelAdmin ? hostelAdmin.id : adminUser.id,
      '-4 days'
    );
  }

  // Seed Fees & Dues for Students
  const checkFees = db.prepare('SELECT COUNT(*) as count FROM fees').get();
  if (checkFees.count === 0) {
    console.log('Seeding student fee dues...');
    const students = db.prepare('SELECT id, roll_no FROM students').all();
    const insertFee = db.prepare(`
      INSERT INTO fees (student_id, fee_type, amount, paid_amount, due_date, status, receipt_no, payment_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      // Tuition
      insertFee.run(s.id, 'Odd Semester Tuition Fee', 45000, 45000, '2026-08-30', 'Paid', `RCP-BPUT-${1000 + i}`, '2026-08-25');
      // Hostel & Mess
      if (i % 3 === 0) {
        insertFee.run(s.id, 'Hostel & Mess Dues (Q2)', 24000, 12000, '2026-10-15', 'Partial', `RCP-HST-${2000 + i}`, '2026-09-10');
      } else if (i % 4 === 0) {
        insertFee.run(s.id, 'Hostel & Mess Dues (Q2)', 24000, 0, '2026-10-05', 'Pending', null, null);
      } else {
        insertFee.run(s.id, 'Hostel & Mess Dues (Q2)', 24000, 24000, '2026-10-05', 'Paid', `RCP-HST-${2000 + i}`, '2026-09-02');
      }
      // Examination Fee
      insertFee.run(s.id, 'Semester End Exam Fee', 1500, 1500, '2026-09-20', 'Paid', `RCP-EX-${3000 + i}`, '2026-09-18');
    }
  }

  // Seed Sample Complaints with Ageing for PS07 Analytics
  const checkComplaints = db.prepare('SELECT COUNT(*) as count FROM complaints').get();
  if (checkComplaints.count === 0) {
    console.log('Seeding sample complaints with realistic ageing data...');
    const dibyaranjan = db.prepare('SELECT id FROM students WHERE roll_no = ?').get('261062');
    const pradyumna = db.prepare('SELECT id FROM students WHERE roll_no = ?').get('261034');
    const archana = db.prepare('SELECT id FROM students WHERE roll_no = ?').get('261005');
    const aryan = db.prepare('SELECT id FROM students WHERE roll_no = ?').get('261054');
    const adminUser = db.prepare('SELECT id FROM users WHERE login_id = ?').get('ADM002'); // Hostel Admin

    const insertComplaint = db.prepare(`
      INSERT INTO complaints (ticket_no, student_id, category, location_type, location_details, title, description, priority, status, assigned_to, admin_notes, resolution_remarks, created_at, resolved_at, resolved_by_admin_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?), ?, ?)
    `);

    // 1. Complaint submitted 5 hours ago (< 24 hrs - Green)
    insertComplaint.run(
      'CMP-2026-001',
      dibyaranjan ? dibyaranjan.id : 1,
      'Plumbing',
      'Hostel Room',
      'BH-1 Room B-104',
      'Leaking washroom tap causing water wastage',
      'The bathroom tap has been continuously dripping and leaking under the basin for the past two days.',
      'Medium',
      'Submitted',
      'Ramesh Kumar (Plumber)',
      'Ticket received and queued for morning maintenance round.',
      null,
      '-5 hours',
      null,
      null
    );

    // 2. Complaint submitted 30 hours ago (24-48 hrs - Yellow)
    insertComplaint.run(
      'CMP-2026-002',
      archana ? archana.id : 4,
      'Wi-Fi & Internet',
      'Hostel Common Area',
      'GH-2 5th Floor Wing B',
      'Wi-Fi Access Point frequent disconnections',
      'AP router on 5th floor GH-2 keeps disconnecting every 10 minutes, unable to attend online lab viva.',
      'High',
      'In Progress',
      'IT Support Team (Sunil)',
      'Technician inspected router firmware; ordering replacement Ethernet switch.',
      null,
      '-30 hours',
      null,
      null
    );

    // 3. Complaint submitted 4 days ago (>72 hrs - Red / Overdue)
    insertComplaint.run(
      'CMP-2026-003',
      aryan ? aryan.id : 6,
      'Carpentry & Furniture',
      'Hostel Room',
      'GH-2 Room G-509',
      'Broken study chair hinge and wardrobe lock stuck',
      'The study chair backrest hinge broke, and the main wardrobe latch is stuck. Need carpentry visit.',
      'Medium',
      'Under Review',
      'Carpentry Wing',
      'Escalated to warden office. Sourcing hinge screws from store.',
      null,
      '-4 days',
      null,
      null
    );

    // 4. Repeated Category Complaint in BH-1
    insertComplaint.run(
      'CMP-2026-004',
      pradyumna ? pradyumna.id : 2,
      'Plumbing',
      'Hostel Room',
      'BH-1 Room B-156',
      'Shower valve jammed in 1st floor bathroom',
      'No water pressure from overhead shower valve in Wing A washrooms.',
      'High',
      'In Progress',
      'Ramesh Kumar (Plumber)',
      'Main pipe pressure regulator adjusted. Replacing inner valve tomorrow morning.',
      null,
      '-18 hours',
      null,
      null
    );

    // 5. Resolved complaint (with resolution duration for PS07 resolution time calculation)
    insertComplaint.run(
      'CMP-2026-005',
      dibyaranjan ? dibyaranjan.id : 1,
      'Electrical',
      'Hostel Room',
      'BH-1 Room B-104',
      'Ceiling fan regulator sparking and overheating',
      'Fan speed regulator switch became burning hot and sparks observed when turned to level 4.',
      'Urgent',
      'Resolved',
      'Santosh (Electrician)',
      'Emergency replacement completed.',
      'Replaced with new Anchor Roma 5-step modular regulator. Earthing verified safe.',
      '-2 days',
      new Date().toISOString(),
      adminUser ? adminUser.id : 1
    );
  }

  // Seed Sample Leave & Gate Passes
  const checkLeaves = db.prepare('SELECT COUNT(*) as count FROM leave_requests').get();
  if (checkLeaves.count === 0) {
    console.log('Seeding leave and gate-pass sample records...');
    const dibyaranjan = db.prepare('SELECT id FROM students WHERE roll_no = ?').get('261062');
    const archana = db.prepare('SELECT id FROM students WHERE roll_no = ?').get('261005');
    const adminUser = db.prepare('SELECT id FROM users WHERE login_id = ?').get('ADM002');

    const insertLeave = db.prepare(`
      INSERT INTO leave_requests (request_no, student_id, leave_type, from_date, to_date, total_days, reason, destination_address, emergency_contact, status, admin_remarks, reviewed_by_admin_id, reviewed_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
    `);

    insertLeave.run(
      'LEV-2026-001',
      dibyaranjan ? dibyaranjan.id : 1,
      'Home Visit',
      '2026-10-02',
      '2026-10-05',
      3,
      'Attending family festival and medical checkup at hometown',
      'At/Po: Mayurbhanj, Odisha - 757001',
      '99380 83475',
      'Approved',
      'Granted with parent telephonic consent. Report back by 05-Oct 08:00 PM.',
      adminUser ? adminUser.id : 1,
      new Date().toISOString(),
      '-1 day'
    );

    insertLeave.run(
      'LEV-2026-002',
      archana ? archana.id : 4,
      'Academic/Conference',
      '2026-10-10',
      '2026-10-12',
      2,
      'Attending State Level Technical Symposium in Bhubaneswar',
      'IIT Bhubaneswar Campus, Argul',
      '78940 57961',
      'Pending',
      null,
      null,
      null,
      '-3 hours'
    );

    // Gate passes
    const insertGate = db.prepare(`
      INSERT INTO gate_passes (pass_code, student_id, purpose, destination, out_time, expected_in_time, status, actual_out_time, actual_in_time, admin_remarks, reviewed_by_admin_id, reviewed_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
    `);

    insertGate.run(
      'GP-2026-891',
      dibyaranjan ? dibyaranjan.id : 1,
      'Market / Personal',
      'Local Market & Stationery Store',
      '04:30 PM',
      '07:45 PM',
      'Approved',
      null,
      null,
      'Permitted for market purchase. Return strictly before 08:00 PM curfew.',
      adminUser ? adminUser.id : 1,
      new Date().toISOString(),
      '-2 hours'
    );
  }

  // Seed Sample Document Requests
  const checkDocs = db.prepare('SELECT COUNT(*) as count FROM document_requests').get();
  if (checkDocs.count === 0) {
    console.log('Seeding sample document requests...');
    const dibyaranjan = db.prepare('SELECT id FROM students WHERE roll_no = ?').get('261062');
    const pradyumna = db.prepare('SELECT id FROM students WHERE roll_no = ?').get('261034');
    const adminUser = db.prepare('SELECT id FROM users WHERE login_id = ?').get('ADM003'); // Academic Admin

    const insertDoc = db.prepare(`
      INSERT INTO document_requests (request_no, student_id, doc_type, purpose, copies, status, certificate_no, admin_remarks, reviewed_by_admin_id, reviewed_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
    `);

    insertDoc.run(
      'DOC-2026-001',
      dibyaranjan ? dibyaranjan.id : 1,
      'Bonafide Certificate',
      'State Post-Matric Scholarship Portal verification & National Scholarship Application',
      1,
      'Ready for Download',
      'BPUT/CERT/2026/8941',
      'Verified with student admission records. Digital certificate signed & generated.',
      adminUser ? adminUser.id : 1,
      new Date().toISOString(),
      '-1 day'
    );

    insertDoc.run(
      'DOC-2026-002',
      pradyumna ? pradyumna.id : 2,
      'Hostel NOC',
      'Opening Student Savings Bank Account at SBI Campus Branch',
      1,
      'Submitted',
      null,
      'Received by warden office; room dues verification pending.',
      null,
      null,
      '-4 hours'
    );
  }

  // Seed sample in-app notifications
  const checkNotif = db.prepare('SELECT COUNT(*) as count FROM notifications').get();
  if (checkNotif.count === 0) {
    console.log('Seeding notifications...');
    const dibyaranjanUser = db.prepare('SELECT id FROM users WHERE login_id = ?').get('261062');
    if (dibyaranjanUser) {
      const insertNotif = db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, reference_id, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now', ?))
      `);

      insertNotif.run(
        dibyaranjanUser.id,
        'Gate Pass Approved!',
        'Your Gate Pass (GP-2026-891) for Market / Personal has been approved. Valid until 07:45 PM.',
        'gate_pass',
        'GP-2026-891',
        0,
        '-1 hour'
      );

      insertNotif.run(
        dibyaranjanUser.id,
        'Bonafide Certificate Ready',
        'Your requested Bonafide Certificate (DOC-2026-001) has been approved and is available for instant download/print.',
        'document',
        'DOC-2026-001',
        0,
        '-2 hours'
      );

      insertNotif.run(
        dibyaranjanUser.id,
        'Complaint Ticket Update',
        'Your complaint CMP-2026-001 (Plumbing) has been assigned to Ramesh Kumar (Plumber).',
        'complaint',
        'CMP-2026-001',
        1,
        '-4 hours'
      );
    }
  }

  console.log('--- Database seeding completed successfully! ---');
}

if (require.main === module) {
  seedDatabase().catch(err => {
    console.error('Error during database seed:', err);
    process.exit(1);
  });
}

module.exports = { seedDatabase, DEFAULT_TEMP_PASSWORD };
