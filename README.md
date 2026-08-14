# Muhammadan Law College — Student Portal

A role-based College Management / Student Portal built per the project brief:
5 roles (CEO, Registrar, Accountant, Teacher, Student), 10 core modules,
monolith architecture.

## Architecture

**Monolith, two deployable pieces:**

```
college-portal/
├── backend/     Express REST API + Prisma ORM + PostgreSQL
└── frontend/    React (Vite) + Tailwind CSS single-page app
```

- **Backend** exposes a single REST API (`/api/...`) secured with JWT.
  Every request from the frontend carries a bearer token; role is embedded
  in the token and checked by `requireRole()` middleware on each route —
  this is what enforces "every user sees only what's relevant to their role."
- **Frontend** is a single React app. After login it routes into a
  `/dashboard` shell whose sidebar and available pages change based on the
  logged-in user's role (see `src/components/Sidebar.jsx`).
- **Database**: PostgreSQL via Prisma. `backend/prisma/schema.prisma` is the
  single source of truth for every entity and relationship in the brief
  (User, Department, Class, Subject, Teacher, Student, Attendance,
  Assignment, Submission, FeeSlip, Result, Notice).

This is intentionally a monolith (not microservices) — one Node process,
one Postgres database — matching the brief's budget and 8-week timeline.
It can be split into services later if the college's needs grow.

## Requirements traceability

| Brief section | Where it lives |
|---|---|
| 5 role logins → own dashboard | `POST /api/auth/login` (single endpoint, role in JWT) + `Sidebar.jsx` role menus |
| CEO creates Registrar/Accountant | `POST /api/users/admins` |
| Registrar creates Teacher/Student, bulk import | `POST /api/users/teachers`, `/students`, `/bulk-import` |
| Class/Subject management, teacher↔subject↔class | `backend/src/routes/academics.routes.js` |
| Attendance (mark/edit same-day/view/%) | `backend/src/routes/attendance.routes.js` — 75% threshold constant at top of file |
| Assignments (create/grade/submit, Pending/Submitted/Late/Graded) | `backend/src/routes/assignments.routes.js` |
| Fee management (slips, mark paid, defaulter report) | `backend/src/routes/fees.routes.js` |
| Results (enter/view, simple marks table) | `backend/src/routes/results.routes.js` |
| Notice board (CEO/Registrar/Accountant post, audience-filtered) | `backend/src/routes/notices.routes.js` |
| Per-role dashboards | `backend/src/routes/dashboard.routes.js` + `frontend/src/pages/dashboard/Overview.jsx` |
| About / Contact pages | `frontend/src/pages/About.jsx`, `Contact.jsx` |

## Local setup

### 1. Database
Create a PostgreSQL database (locally, or a free instance on Neon/Railway/Supabase):
```
createdb college_portal
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env       # edit DATABASE_URL, JWT_SECRET, SEED_CEO_PASSWORD
npx prisma migrate dev --name init
npm run prisma:seed        # creates the first CEO login
npm run dev                # http://localhost:5000
```
The seed script prints the CEO's email/password to the console — log in as
CEO first, then use the portal to create Registrar/Accountant accounts,
who in turn create Teachers/Students (matches the brief's hierarchy).

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env       # VITE_API_URL=http://localhost:5000/api
npm run dev                 # http://localhost:5173
```

### 4. First login flow
1. Log in as CEO (from seed output).
2. CEO creates a Registrar and/or Accountant account.
3. Log in as Registrar → create a Department, a Class, add Subjects,
   create Teacher and Student accounts, enroll students into the class,
   assign teachers to subjects.
4. Log in as Teacher → mark attendance, create assignments, enter results.
5. Log in as Student → view attendance %, submit assignments, check fees/results.
6. Log in as Accountant → generate fee slips, mark payments, view collection report.

## Policies currently hard-coded (per Section 7 of the brief — confirm with the college)
- Attendance threshold: **75%** (`backend/src/routes/attendance.routes.js`)
- Attendance edit window: **same day only**
- Late assignment submission: **allowed, tagged "Late"** (not blocked)
- Result visibility: **live immediately** once a teacher enters it (no approval step)
- Account creation: **Registrar/CEO create all accounts** (no self-registration)

These are simple constants/branches in the route files — flag any the
college wants changed and they're a one-line edit each.

## Not yet built (flagged for the next phase)
- File upload storage for assignment submissions & fee slip PDFs (routes accept
  a `fileUrl` field already — wire up S3/local disk + `multer`, which is already
  a backend dependency)
- Excel bulk-import parsing on the frontend (backend endpoint `/users/bulk-import`
  is ready; needs a file picker + a parser like `xlsx` in the React app)
- Email notifications for notices/fee reminders
- Automated tests
