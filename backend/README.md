#  SaaS Backend API

A robust RESTful backend for a SaaS application built with Node.js, Express, PostgreSQL (via Sequelize), and Stripe for billing.

---

##  Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express 5 |
| Database | PostgreSQL + Sequelize ORM |
| Authentication | JWT + HTTP-only cookies |
| Payments | Stripe |
| File Uploads | Cloudinary |
| Email | Nodemailer |
| Validation | express-validator |
| Scheduling | node-cron |

---

##  Project Structure

```
src/
├── controllers/       
│   ├── auth.controller.js
│   ├── payment.controller.js
│   ├── plan.controller.js
│   ├── project.controller.js
│   ├── task.controller.js
│   ├── activity.controller.js
│   ├── dashboard.controller.js
│   ├── graphicalChart.controller.js
│   ├── profile.controller.js
│   └── search.controller.js
├── middlewares/
│   ├── auth.js                  # JWT auth middleware (role-based)
│   └── validationRequest.js     # express-validator error handler
│   └── requireSubscription.js     #  Access to this resource
├── models/
│   ├── user.model.js
│   ├── project.model.js
│   ├── task.model.js
│   ├── payment.model.js
│   ├── subscription.model.js
│   ├── subscriptionPlan.model.js
│   └── activity.model.js
├── routes/
│   ├── auth.routes.js
│   ├── payment.routes.js
│   ├── plan.routes.js
│   ├── project.routes.js
│   ├── task.routes.js
│   ├── activity.routes.js
│   ├── dashboard.routes.js
│   ├── graphicalChart.routes.js
│   ├── profile.routes.js
│   └── search.routes.js
├── services/
│   └── upload.js                # Cloudinary/multer config
│   └── cronJob.js               
│   └── logActivity.js               
│   └── sendMail.js                
├── utils/
│   └── wrapAsync.js             # Async error wrapper
│   └── assignFreePlan.js  
│   └── cloudinary.js  
│   └── expressError.js  
│   └── generateToken.js  
├── validator/
│   ├── auth.validator.js
│   ├── payment.validator.js
│   ├── plan.validator.js
│   ├── project.validator.js
│   ├── task.validator.js
│   └── profile.validator.js
└── server.js                    # Entry point
└── app.js                    # Bundler
└── stripe.exe                  # Entry point
└── .env               



```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Nodemailer
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_email_password
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- A Stripe account
- A Cloudinary account

### Installation

```bash
# Clone the repository
git clone https://github.com/Ibn-Abdulsattar/SaaS.git
cd your-repo

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Start the development server
npm run dev
```

### Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Start with nodemon |
| `npm run pm2` | Start with PM2 (production) |

---

## 📡 API Reference

### Base URL
```
http://localhost:5000/api
```

### Health Check
```
GET /api/health
```

---

### 🔐 Auth  `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | ❌ | Register a new user |
| POST | `/login` | ❌ | Login with email/password |
| POST | `/logout` | ✅ | Logout current user |
| POST | `/forgot` | ❌ | Send password reset email |
| POST | `/reset-password` | ❌ | Reset password with token |
| POST | `/google` | ❌ | Google OAuth login |

---

### 💳 Billing  `/api/billing`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/history` | ✅ | Get user payment history |
| GET | `/subscription` | ✅ | Get current subscription status |
| POST | `/checkout` | ✅ | Create a Stripe checkout session |
| GET | `/plans` | ✅ | List all subscription plans |
| POST | `/plans` | ✅ | Add a new subscription plan |

#### Stripe Webhook
```
POST /api/stripe/webhook
```
Receives raw Stripe events (no JSON middleware). Must be configured in your Stripe dashboard.

---

### 📂 Projects  `/api/project`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | ✅ | Create a new project (supports image upload) |
| GET | `/` | ✅ | Get all projects for the authenticated user |
| GET | `/:id` | ✅ | Get a single project by ID |
| PUT | `/:id` | ✅ | Update a project |
| DELETE | `/:id` | ✅ | Delete a project |

---

### ✅ Tasks  `/api/project/:projectId/tasks`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | ✅ | Create a task in a project |
| GET | `/` | ❌ | Get all tasks for a project |
| GET | `/:id` | ✅ | Get a single task |
| PUT | `/:id` | ✅ | Update a task |
| DELETE | `/:id` | ✅ | Delete a task |

---

### 🔍 Search  `/api/search`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/global` | ✅ | Global search across resources |
| GET | `/task` | ✅ | Filtered task search |

---

### 📊 Dashboard  `/api/dashboard`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/stats` | ✅ | Get summary statistics |

---

### 📈 Charts  `/api/charts`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/revenue` | ✅ | Monthly revenue data |
| GET | `/task` | ✅ | Task status statistics |
| GET | `/growth` | ✅ | User growth over time |

---

### 🕓 Activities  `/api/activities`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ✅ | Get recent user activities |

---

### 👤 Profile  `/api/profile`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/me` | ✅ | Get current user profile |
| PUT | `/me` | ✅ | Update profile (supports image upload) |

---

## 🔒 Authentication

All protected routes require a valid JWT token. The token is stored in an HTTP-only cookie after login.

The `auth` middleware supports role-based access control. Roles currently in use: `user`, `admin`, `manager`.

---

## 🗄 Database Models & Associations

```
User ──< Payment
User ──< Subscription ──> SubscriptionPlan
User ──< Project ──< Task
User ──< Activity
```

All associations are managed via Sequelize in `server.js`.

---

## 🧰 Error Handling

All route handlers are wrapped with `wrapAsync` to forward errors to the global error handler. The global handler returns:

```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## 📦 Deployment

For production deployment with PM2:

```bash
npm install -g pm2
npm run pm2
```