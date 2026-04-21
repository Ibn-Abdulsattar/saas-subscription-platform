# TaskFlow — Project & Team Management Platform

A full-stack SaaS application for managing projects, tasks, and teams with real-time collaboration, role-based access control, and subscription billing.

---

## What This Does

TaskFlow lets organizations manage their work in one place. Admins create projects and assign them to teams, managers break those projects into tasks with checklists, and team members update progress in real time. Subscription plans gate access to features, and everything is tracked through a dashboard with charts and activity feeds.

---

## Tech Stack

**Backend**
- Node.js + Express 5 (ESM modules)
- PostgreSQL + Sequelize ORM
- Redis + ioredis (session/cache)
- Socket.io (real-time updates)
- Stripe (subscription billing)
- Cloudinary + Multer (file/image uploads)
- Nodemailer (transactional email)
- JWT + bcrypt (auth)
- Google OAuth 2.0
- node-cron (scheduled jobs)

**Frontend**
- React 19 + Vite
- Redux Toolkit + React-Redux
- React Router DOM v7
- MUI (Material UI v7) + Tailwind CSS v4
- React Hook Form
- Stripe.js + React Stripe
- Socket.io-client
- Axios

---

## Project Structure

```
root/
├── backend/
│   └── src/
│       ├── config/          # DB connection
│       ├── controllers/     # Route handlers
│       ├── middlewares/     # Auth, validation
│       ├── models/          # Sequelize models
│       ├── routes/          # Express routers
│       ├── services/        # Cloudinary, cron, upload
│       ├── socket/          # Socket.io setup
│       ├── utils/           # wrapAsync, helpers
│       ├── validator/       # express-validator schemas
│       ├── app.js
│       └── server.js
└── frontend/
    └── src/
        ├── components/      # Shared UI, Layout, ProtectedRoute
        ├── pages/           # Auth, Dashboard, Projects, Tasks, Billing...
        ├── redux/           # Store + slices
        ├── routes/          # AppRoutes
        └── App.jsx
```

---

## Roles & Permissions

There are three roles in the system. Access is enforced at the route level via the `auth` middleware.

| Action | user | manager | admin |
|---|---|---|---|
| View dashboard & charts | ✓ | ✓ | ✓ |
| Update task status | ✓ | ✓ | ✓ |
| Create/delete tasks | | ✓ | ✓ |
| Create/manage teams | | ✓ | ✓ |
| Create/delete projects | | | ✓ |
| Assign projects to teams | | ✓ | ✓ |
| View all users | | ✓ | ✓ |
| Manage subscription plans | ✓ | ✓ | ✓ |

---

## API Routes

### Auth — `/api/auth`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/login` | Public | Email/password login |
| POST | `/register` | Public | New account registration |
| POST | `/logout` | All roles | Invalidate session |
| POST | `/forgot` | Public | Send password reset email |
| POST | `/reset-password` | Public | Reset via token |
| POST | `/change-password` | All roles | Change current password |
| POST | `/google` | Public | Google OAuth login |
| GET | `/all-users` | admin, manager | List all users |
| POST | `/update-job-title` | user | Update own job title |

### Projects — `/api/projects`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | admin | Create a project |
| GET | `/` | admin | List all projects |
| GET | `/:id` | admin | Get project details |
| PUT | `/:id` | admin | Update project |
| DELETE | `/:id` | admin | Delete project |
| POST | `/:id/assign-team` | admin, manager | Assign team to project |

### Tasks — `/api/projects/:projectId/tasks`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | admin, manager | Create task |
| GET | `/` | All roles | Get tasks for project |
| GET | `/:id` | All roles | Get task detail |
| PUT | `/:id` | admin, manager | Update task |
| DELETE | `/:id` | admin, manager | Delete task |
| PATCH | `/:id/status` | All roles | Change task status |

### Checklists — `/api/projects/:projectId/tasks/:taskId/checklists`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | All roles | Get checklists for task |
| POST | `/` | admin, manager | Create checklist item |
| PUT | `/:checklistId` | All roles | Toggle checklist status |
| DELETE | `/:checklistId` | admin, manager | Delete checklist item |

### Teams — `/api/teams`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | admin, manager | Create team |
| POST | `/:teamId/members` | admin, manager | Add members |
| GET | `/:teamId/members` | admin, manager | List team members |
| GET | `/all-teams` | admin, manager | List all teams |

### Profile — `/api/profile`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/me` | All roles | Get current user profile |
| PUT | `/me` | All roles | Update profile + avatar upload |

### Billing — `/api/payment`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/history` | All roles | Payment history |
| GET | `/subscription` | All roles | Current subscription status |
| POST | `/checkout` | All roles | Create Stripe checkout session |
| POST | `/cancel-subscription` | All roles | Cancel active subscription |

### Plans — `/api/plan`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/plans` | All roles | Add subscription plan |
| GET | `/plans` | All roles | List all plans |

### Dashboard & Analytics — `/api/dashboard`, `/api/chart`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/dashboard/stats` | All roles | Summary stats |
| GET | `/chart/revenue` | All roles | Monthly revenue chart data |
| GET | `/chart/task` | All roles | Task status distribution |
| GET | `/chart/growth` | All roles | User growth over time |

### Activity & Search — `/api/activity`, `/api/search`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/activity/` | All roles | Recent activity feed |
| GET | `/search/global` | All roles | Global search |
| GET | `/search/task` | All roles | Filtered task search |

---

## Frontend Pages

| Route | Page | Description |
|---|---|---|
| `/login` | LoginPage | Email login + Google OAuth |
| `/register` | RegisterPage | Create account |
| `/forgot-password` | ForgotPasswordPage | Request reset email |
| `/reset-password` | ResetPasswordPage | Set new password |
| `/dashboard` | DashboardPage | Stats, charts, activity |
| `/projects` | ProjectPage | Project listing |
| `/projects/:id` | ProjectDetailPage | Tasks within a project |
| `/team` | TeamPage | Team management |
| `/tasks` | TaskPage | All tasks across projects |
| `/billing` | BillingPage | Subscription + payment history |
| `/profile` | ProfilePage | User profile settings |
| `/search` | SearchPage | Global search results |

All routes under `/` are protected. Unauthenticated users are redirected to `/login`. Authenticated users hitting `/login` or `/register` are redirected to `/dashboard`.

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis
- A Stripe account
- A Cloudinary account
- Google OAuth credentials

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskflow
DB_USER=postgres
DB_PASSWORD=yourpassword

# Auth
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password
```

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

---

## Real-time Features

Socket.io is initialized on the HTTP server alongside Express. Clients connect via `socket.io-client` and receive live updates for task changes, activity events, and team notifications without polling.

---

## Deployment

The backend exports `app` from `app.js` and wraps it in a native Node `http.createServer` in `server.js` — this lets Socket.io share the same server instance. For production:

```bash
# Backend
npm run pm2

# Frontend
npm run build
# Serve the dist/ folder with nginx or a static host
```

---

## License

MIT
