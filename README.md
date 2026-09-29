# Campus Life, Debugged
### BPUT Hackathon 2026 · Problem Statement 07 (Organisation: Fretbox)
> *"Four apps, six notice boards, two WhatsApp groups and one register. Replace all of it."*

---

## 🏛️ Project Overview
**Campus Life, Debugged** is a unified, real-time campus operations platform built directly for BPUT Hackathon 2026 Problem Statement 07. It replaces the fragmented, high-friction maze of physical paper registers, 2:00 AM WhatsApp broadcast noise, slow certificate processing, and disjointed hostel complaint logs with a connected full-stack web application.

---

## 🚀 Live Access & Multi-Device URLs
The server is currently running and bound to `0.0.0.0:5000`, making it accessible across devices:

- **Desktop / Laptop (Current Machine):** [http://localhost:5000](http://localhost:5000)
- **Mobile Phone / Tablet / External Laptop (Same Wi-Fi):** `http://10.21.201.110:5000`
- **Development Hot-Reload Server:** `http://localhost:3000` (via `npm run dev`)

---

## 🔐 Credentials & Authentication Protocols

### Default Initial Password
All initial student and administrator accounts are seeded with the temporary password:
```text
cam@123
```

### 🛡️ First-Login Mandatory Password Change Workflow
When any account logs in for the first time with `cam@123`:
1. The server marks `must_change_password = 1`.
2. The UI intercepts dashboard access and renders a mandatory password reset modal.
3. The user creates a new secure password (minimum 6 characters, distinct from `cam@123`).
4. The password is encrypted with **bcrypt** (salt rounds = 10) and updated in the database.
5. The `must_change_password` flag is set to `0`.
6. Full dashboard access is unlocked.

### 🔑 Secure "Forgot Password?" Flow
- Generates a **cryptographically random, 15-minute, single-use token**.
- Validates token expiry and rejects duplicate reuse.
- Built-in UI token copy tool for quick demo verification without SMTP server dependencies.

---

## 👥 Pre-Loaded Accounts (Source of Truth)

### 3 Administrative Roles (With Full Cross-Department Approval Access)
> **PS07 Special Requirement:** All three admin roles have full cross-approval authority. Academic and Hostel admins can both process complaints, gate passes, leaves, certificates, and notices.

| Admin ID | Name | Role | Department / Area | Office Location |
| :--- | :--- | :--- | :--- | :--- |
| **ADM001** | Omkar Udayasingh | Super Admin | Administration | Admin Block, Room 101 |
| **ADM002** | Priya Ranjan das | Hostel Admin | Hostel & Facilities | Chief Warden Office, BH-1 |
| **ADM003** | Priyanka Priyadarshani Panda | Academic Admin | Academic Affairs | Dean Academics Office |

### 15 Pre-Loaded Students
All 15 official student profiles are seeded in the database with residential allocations, attendance records, and dues:

1. **261062** — Dibyaranjan Mohanta (CSE, 1st Yr, Sec A, Batch 2026, Hostel BH-1, Room B-104)
2. **261034** — Pradyumna Kumar Pradhan (CSE, 1st Yr, Sec A, Batch 2026, Hostel BH-1, Room B-156)
3. **261061** — Dibyajyoti Senapati (CSE, 1st Yr, Sec A, Batch 2026, Hostel GH-1, Room G-203)
4. **261005** — Archana Pradhan (CSE, 1st Yr, Sec C, Batch 2026, Hostel GH-2, Room G-504)
5. **261120** — Archita Mohapatra (CSE, 1st Yr, Sec B, Batch 2026, Hostel GH-1, Room G-54)
6. **261054** — Aryan Raj (CSE, 1st Yr, Sec A, Batch 2026, Hostel GH-2, Room G-509)
7. **261065** — Guruprasad Giri (CSE, 1st Yr, Sec B, Batch 2026, Hostel BH-1, Room B-107)
8. **266050** — SubhashrI Samal (CSE(AI), 1st Yr, Sec C, Batch 2026, Hostel GH-2, Room G-204)
9. **261123** — Amrita Sahoo (CSE, 1st Yr, Sec B, Batch 2026, Hostel GH-2, Room G-224)
10. **261028** — Maitry Maheswari Biswal (CSE, 1st Yr, Sec A, Batch 2026, Hostel GH-1, Room G-12)
11. **266057** — Pragyan paramita Patra (CSE(AI), 1st Yr, Sec B, Batch 2026, Hostel GH-1, Room G-206)
12. **261052** — Aniket Sharma (CSE, 1st Yr, Sec A, Batch CSE, Hostel BH-3, Room B-328)
13. **266011** — Muskan Pal (CSE AI, 1st Yr, Sec B, Batch 2026, Hostel GH-1, Room 108)
14. **261011** — Ayesha perween (CSE, 1st Yr, Sec A, Batch 2026, Hostel GH-1, Room G-108)
15. **261031** — Om Bharati (CSE, 1st Yr, Sec A, Batch 2026, Hostel BH-2, Room B-350)

---

## ⚡ 3 Complete End-to-End Workflows

### 🛠️ Workflow 1: Complaint & Maintenance Lifecycle
1. **Student Lodges Complaint:** Selects Category (Plumbing, Electrical, Wi-Fi, Furniture, etc.), Priority (Low to Urgent), and details. Ticket `#CMP-2026-XXX` is saved to SQLite.
2. **Admin Queue:** Any admin sees the complaint in real time.
3. **Staff Assignment & Updates:** Admin changes status to *In Progress*, assigns a technician (e.g., Ramesh Kumar - Plumber), and logs internal notes.
4. **Student Notification:** In-app notification alerts the student.
5. **Resolution:** Admin marks *Resolved* with formal completion remarks. Real-time ageing timer stops and average resolution time metrics update.

### 🎫 Workflow 2: Digital Gate Pass & Overnight Leave
1. **Application:** Student submits outing details (Market, Medical, Home Visit), time window, and emergency contact.
2. **Review:** Any admin approves/rejects with official warden remarks.
3. **Digital Pass Card:** Generates a verified digital pass with scannable QR code and curfew parameters.
4. **Security Check:** Security desk simulator allows marking *Checked Out* and *Checked In*.

### 📄 Workflow 3: Document & Certificate Issuance
1. **Request:** Student requests Bonafide Certificate, Hostel NOC, or Character Certificate.
2. **Processing:** Admin verifies records and updates status from *Submitted* → *Processing* → *Ready for Download*.
3. **Official Seal & Number:** System auto-generates official certificate reference `#BPUT/CERT/2026/XXXX` with digital signature.
4. **Printable Document:** Student opens formatted official institutional certificate ready for printing or saving as PDF with university seals.

---

## 📊 PS07 Specialized Administrative Insights
The Admin Dashboard provides real database metrics fulfilling the PS07 brief:
1. **Complaint Ageing Matrix:** Real-time bucketing of open tickets into:
   - `< 24 Hours` (Green / Fresh)
   - `24 - 48 Hours` (Yellow / Attention)
   - `48 - 72 Hours` (Orange / Escalated)
   - `> 72 Hours` (Red / Critical Overdue with auto-alert)
2. **Average Resolution Time:** Automatically computed from `resolved_at - created_at` in hours.
3. **Recurring Issue Hotspots:** Categorical frequency breakdown highlighting chronic infrastructure issues (e.g. plumbing in BH-1 vs Wi-Fi in GH-2).
4. **Workload & Hostel Distribution:** Cross-hostel ticket distribution across BH-1, BH-2, BH-3, GH-1, GH-2.
5. **Campus Audit Trail:** Full audit history logging user actions, entities, timestamps, and notes.

---

## 📶 Low-Bandwidth & Kiosk Fallback (Accessibility Reality Checks)
- **Bandwidth Optimizer Mode:** Toggle button in top bar turns off heavy animations and minimizes payload size for slow 2G/3G campus connections.
- **Campus Kiosk Terminal:** Accessible from navbar and sidebar. Students without smartphones or with dead batteries can enter their Roll Number to:
  - Check active gate pass status
  - Check certificate readiness
  - Lodge emergency maintenance complaints directly from the warden desk.

---

## 💻 Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React icons.
- **Backend:** Node.js, Express 5, Better-SQLite3 (WAL mode, Foreign Keys).
- **Security:** bcryptjs password hashing, JWT session tokens, crypto reset tokens.
- **Deployment:** Single unified Express server serving both `/api` endpoints and compiled SPA static assets from `client/dist`.

---

## 🛠️ Commands & Scripts
From the project root (`C:\Users\asus\.gemini\antigravity\scratch\campus-life-debugged`):

```bash
# Start backend server (Port 5000)
npm run server

# Start Vite client development server (Port 3000)
npm run client

# Run concurrently (Both server and client in dev mode)
npm run dev

# Build frontend for production deployment
npm run build

# Reset & re-seed database with clean sample records
npm run seed

# Run end-to-end automated verification test suite
node test_workflows.js
```
