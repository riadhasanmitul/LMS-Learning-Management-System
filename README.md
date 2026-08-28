# CPS LMS — Learning Management System

A full-stack Learning Management System built with **Next.js** (frontend) and **Strapi v5** (backend), featuring four distinct user roles, progress tracking, quiz auto-grading, blog management, and an admin panel.

---

## 🔗 Live Links

| | URL |
|---|---|
| **Frontend** | *(your Vercel URL)* |
| **Backend / CMS** | *(your Railway URL)* |

---

## 🧱 Tech Stack

| Layer | Technology | Hosting |
|---|---|---|
| Frontend | Next.js 16 (App Router) | Vercel |
| Backend / CMS | Strapi v5 | Railway |
| Database | SQLite (dev) / PostgreSQL (prod) | Railway |

---

## 👥 User Roles

| Role | What they can do |
|---|---|
| **Admin** | Full platform control — manage users, roles, courses, blog posts, and view all stats |
| **Content Manager** | Create/edit/delete any course, lesson, quiz; write and publish blog posts |
| **Instructor** | Manage lessons and quizzes for their own courses only; view enrolled student progress |
| **Student** | Browse and enroll in courses, view lessons, mark progress, take quizzes |

All permissions are enforced **on the backend**, not just the frontend UI.

---

## ✅ Features Completed

### Core
- [x] Authentication — Sign up / Login with JWT
- [x] Role-based protected routes (frontend redirect + backend enforcement)
- [x] Blocked user handling — blocked accounts cannot log in
- [x] Course management — create, edit, delete (CM: any course; Instructor: own courses only)
- [x] Lessons under courses — title, rich-text content, optional video URL
- [x] Draft / Published state for courses, lessons, and quizzes
- [x] Student course enrollment (no duplicate enrollments)
- [x] Enrolled "My Courses" page for students
- [x] Lesson viewing in sequence (enrolled students only)

### Differentiators
- [x] **Progress Tracking** — students mark lessons complete; percentage shown per course; persists across refreshes, stored per student per course
- [x] **Quiz Auto-Grading** — MCQ quizzes with correct answers; score computed instantly on submit; results stored and viewable in quiz history
- [x] **Admin Panel** — platform stats (users, courses, lessons, enrollments, quizzes, attempts), user role management (promote/change/remove roles)
- [x] **Blog** — draft/published state; CM and Admin can write, edit, publish, and delete posts; anyone can read published posts publicly without login

---

## 🗂️ Project Structure

```
cps-lms/
├── frontend/     # Next.js app (deployed on Vercel)
└── backend/      # Strapi v5 CMS (deployed on Railway)
```

---

## ⚙️ Running Locally

### Prerequisites
- Node.js 18+
- npm

---

### 1. Backend (Strapi)

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=your_app_key_1,your_app_key_2,your_app_key_3,your_app_key_4
API_TOKEN_SALT=your_api_token_salt
ADMIN_JWT_SECRET=your_admin_jwt_secret
TRANSFER_TOKEN_SALT=your_transfer_token_salt
JWT_SECRET=your_jwt_secret
```

> **Note:** For local development, you can generate random strings for all secrets. For production, use strong random values.

Start the backend:

```bash
npm run develop
```

Strapi will be running at `http://localhost:1337`.

On first run, visit `http://localhost:1337/admin` and create the super-admin account.

---

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:1337
```

Start the frontend:

```bash
npm run dev
```

The app will be running at `http://localhost:3000`.

---

## 🔑 User Roles & Test Accounts

New registrations via `/login` default to the **Student** role.  
An Admin must promote users to other roles via the Admin panel (`/admin/users`).

| Role | Entry Point after login |
|---|---|
| Student | `/student` |
| Instructor | `/instructor` |
| Content Manager | `/content-manager` |
| Admin | `/admin` |

---

## 🧭 Navigation Map

| Route | Who can access |
|---|---|
| `/` | Public — landing page |
| `/blog` | Public — published blog posts |
| `/blog/[id]` | Public — single blog post |
| `/login` | Public |
| `/student` | Students |
| `/student/courses` | Students — browse all published courses |
| `/student/my-courses` | Students — enrolled courses |
| `/student/lessons/[id]` | Students (enrolled in the course) |
| `/student/quizzes/[id]` | Students (enrolled in the course) |
| `/student/quiz-results` | Students — quiz history |
| `/instructor` | Instructors |
| `/instructor/courses/[id]` | Instructors (own courses only) |
| `/content-manager` | Content Managers |
| `/content-manager/blog` | Content Managers |
| `/admin` | Admins only |
| `/admin/users` | Admins only |
| `/admin/blog` | Admins only |
| `/admin/analytics` | Admins only |

---

## 🌐 Deployment

### Frontend — Vercel

1. Push the `frontend/` directory to GitHub
2. Import the repo in Vercel
3. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-backend-url
   ```
4. Deploy

### Backend — Railway

1. Push the `backend/` directory to GitHub
2. Create a new Railway project and connect the repo
3. Add all environment variables from the `.env` template above
4. Set `NODE_ENV=production`
5. Add a PostgreSQL plugin — Railway sets `DATABASE_URL` automatically
6. Deploy

---

## 📦 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `HOST` | Server host (default `0.0.0.0`) |
| `PORT` | Server port (default `1337`) |
| `APP_KEYS` | Comma-separated random keys for Strapi sessions |
| `API_TOKEN_SALT` | Salt for API token generation |
| `ADMIN_JWT_SECRET` | Secret for admin panel JWT |
| `TRANSFER_TOKEN_SALT` | Salt for data transfer tokens |
| `JWT_SECRET` | Secret for users-permissions JWT (used by frontend) |
| `DATABASE_URL` | PostgreSQL connection string (production only) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Full URL of the Strapi backend (no trailing slash) |

---

## 📁 Key Backend API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/local` | Login |
| `POST` | `/api/auth/local/register` | Register |
| `GET` | `/api/courses` | List published courses |
| `GET` | `/api/courses/instructor-courses` | Instructor's own courses |
| `GET` | `/api/courses/content-manager-courses` | All courses (CM) |
| `POST` | `/api/courses/:id/publish` | Publish a course |
| `POST` | `/api/courses/:id/unpublish` | Unpublish a course |
| `POST` | `/api/enrollments` | Enroll in a course |
| `GET` | `/api/courses/my-courses` | My enrolled courses |
| `GET` | `/api/lessons/course/:courseId` | Lessons for enrolled students |
| `POST` | `/api/lesson-progress` | Mark lesson complete |
| `GET` | `/api/courses/:id/progress` | Course progress percentage |
| `POST` | `/api/quiz-attempts/submit` | Submit quiz answers |
| `GET` | `/api/quiz-attempts/my-results` | My quiz history |
| `GET` | `/api/blog-posts/published` | Public published blog posts |
| `POST` | `/api/blog-posts` | Create blog post (Admin/CM) |
| `GET` | `/api/admin-dashboard/stats` | Platform stats (Admin only) |
| `GET` | `/api/admin-dashboard/users` | All users (Admin only) |
| `PUT` | `/api/admin-dashboard/users/:id/role` | Change user role (Admin only) |

---

## 🔒 How Permissions Are Enforced

Every sensitive action is enforced on the **backend controller**, not just the UI:

- Role is verified by querying `plugin::users-permissions.user` on every request
- Instructor actions verify `course.instructor.id === user.id` before proceeding
- Students can only access lessons and quizzes of courses they are enrolled in
- Only Students can enroll or submit quizzes
- Blog create/edit/delete is restricted to Admin and Content Manager roles server-side
- Admin endpoints verify `role.name === "Admin"` on the backend

---

## 📝 Implementation Notes

- Rich-text lesson and blog content uses Strapi's block format and is rendered paragraph-by-paragraph on the frontend
- Quiz scores are calculated entirely on the backend — the frontend never receives correct answers before submission
- Draft/Published state is managed via Strapi v5 Document Service `publish()` and `unpublish()` methods
- Progress is stored per student per course in a `lesson-progress` collection and computed as a percentage on demand
