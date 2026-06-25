# 🔐 Secure Authentication & Authorization System

A **full-stack web application** with a sleek dark-themed frontend and a production-grade backend REST API. Implements secure user authentication with JWT tokens, role-based access control (RBAC), brute-force protection via rate limiting and account lockout, and real-time session management — all served from a single Express server.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Web-Based GUI** | Modern glassmorphism UI with dark theme, animated backgrounds, and toast notifications |
| **User Registration** | Validated form with real-time password strength indicator and server-side enforcement |
| **JWT Authentication** | Stateless token-based authentication stored in localStorage with expiry countdown |
| **Role-Based Access Control** | Admin panel restricted to admin users — non-admins see an "Access Denied" screen |
| **Account Lockout** | Automatically locks accounts after 5 failed login attempts for 30 minutes |
| **Rate Limiting** | IP-based rate limiting on login (5 attempts / 15 min) to prevent brute-force |
| **Password Hashing** | Passwords hashed with bcrypt (10 salt rounds) — never stored in plaintext |
| **Session Timer** | Live countdown showing remaining session time — auto-redirects on expiry |
| **Input Validation** | Client-side validation with matching server-side enforcement via express-validator |
| **Security Headers** | HTTP security headers via Helmet (CSP, HSTS, X-Content-Type-Options, etc.) |
| **Responsive Design** | Mobile-friendly with collapsible sidebar and adaptive layouts |

---

## 📸 Screenshots

> Replace the descriptions below with actual screenshots after running the app.

| Screen | Description |
|--------|-------------|
| **Login Page** | Glassmorphism card with email/password fields, animated gradient background |
| **Register Page** | Account creation form with real-time password strength indicator |
| **Dashboard** | Sidebar navigation, user info cards, session countdown timer |
| **Admin Panel** | Admin-only content with system security status overview |
| **Access Denied** | Role-based denial screen shown to non-admin users |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3 (Glassmorphism), Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose ODM |
| **Authentication** | JSON Web Tokens (jsonwebtoken) |
| **Password Hashing** | bcryptjs |
| **Validation** | express-validator |
| **Security** | Helmet, CORS, express-rate-limit |
| **Logging** | Morgan |
| **Dev Tooling** | Nodemon |

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                     Express Server                        │
│                                                          │
│  ┌───────────────────┐    ┌────────────────────────────┐ │
│  │   Frontend (GUI)   │    │       Backend (API)        │ │
│  │   public/          │    │                            │ │
│  │                    │    │  POST /api/auth/register   │ │
│  │  login.html    ───►│───►│  POST /api/auth/login     │ │
│  │  register.html     │    │  POST /api/auth/logout    │ │
│  │  dashboard.html    │    │  GET  /api/dashboard      │ │
│  │  admin.html        │    │  GET  /api/admin           │ │
│  │                    │    │                            │ │
│  │  css/styles.css    │    │  Middleware:               │ │
│  │  js/api.js         │    │  ├── JWT Verification     │ │
│  │  js/app.js         │    │  ├── RBAC Authorization   │ │
│  │                    │    │  └── Rate Limiting         │ │
│  └───────────────────┘    └────────────────────────────┘ │
│                                       │                   │
│                              ┌────────┴────────┐          │
│                              │    MongoDB       │          │
│                              │  (Users, Auth)   │          │
│                              └─────────────────┘          │
└──────────────────────────────────────────────────────────┘
```

**Key architectural decisions:**
- **Frontend and backend share one server** — `express.static()` serves the GUI files, while `/api/*` routes handle business logic
- **API client module** (`js/api.js`) — all frontend API calls go through a single module that automatically attaches JWT tokens and handles authentication errors
- **No frontend framework** — vanilla HTML/CSS/JS keeps the project lightweight, with zero build tools required
- **Separation of concerns** — the GUI only calls REST endpoints; all security logic lives server-side in middleware and controllers

---

## 📁 Folder Structure

```
secure_auth_system/
├── config/
│   └── db.js                   # MongoDB connection logic
├── controllers/
│   ├── authController.js       # Register, Login, Logout handlers
│   └── protectedController.js  # Dashboard and Admin panel handlers
├── middleware/
│   ├── authMiddleware.js       # JWT verification middleware
│   ├── rateLimiter.js          # Rate limiting configuration
│   └── roleMiddleware.js       # RBAC authorization middleware
├── models/
│   └── User.js                 # Mongoose user schema with lockout support
├── public/                     # ← Frontend GUI
│   ├── css/
│   │   └── styles.css          # Complete design system (dark glassmorphism)
│   ├── js/
│   │   ├── api.js              # Centralized API client (fetch + JWT)
│   │   └── app.js              # UI helpers (toasts, guards, session timer)
│   ├── login.html              # Login page
│   ├── register.html           # Registration page
│   ├── dashboard.html          # User dashboard (protected)
│   └── admin.html              # Admin panel (admin-only)
├── routes/
│   ├── authRoutes.js           # Auth endpoints with validation rules
│   └── protectedRoutes.js      # Protected endpoint definitions
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore rules
├── LICENSE                     # MIT License
├── package.json                # Project metadata and dependencies
├── server.js                   # Application entry point
└── README.md                   # This file
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** v14 or higher
- **npm** (included with Node.js)
- **MongoDB** — running locally on port `27017`, or a [MongoDB Atlas](https://www.mongodb.com/atlas) cloud instance

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/secure_auth_system.git
cd secure_auth_system

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env

# 4. Edit .env with your configuration
#    - Set MONGO_URI to your MongoDB connection string
#    - Generate a strong JWT_SECRET:
#      node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 5. Start the development server
npm run dev
```

You should see:
```
Server running on port 5000
GUI available at http://localhost:5000
MongoDB Connected: 127.0.0.1
```

### Usage

1. Open **http://localhost:5000** in your browser
2. **Register** a new account at the registration page
3. **Login** with your credentials — you'll be redirected to the Dashboard
4. View your **account details** and **session timer** on the Dashboard
5. Try accessing the **Admin Panel** — you'll see "Access Denied" (as expected for regular users)

### Testing the API directly (Postman / cURL)

The REST API endpoints are still fully functional for direct testing:

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","email":"john@example.com","password":"Password123!"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123!"}'

# Access dashboard (use the token from login response)
curl http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔒 Security Features

| Attack Vector | Mitigation |
|--------------|------------|
| **Brute-force login** | IP-based rate limiting + account lockout after 5 failed attempts |
| **Password cracking** | bcrypt hashing with 10 salt rounds |
| **Privilege escalation** | Role field is server-controlled; users cannot self-assign admin |
| **XSS / Injection** | Helmet security headers + express-validator input sanitization |
| **Password leaks** | Password field has `select: false` in Mongoose schema |
| **Token theft** | Short-lived JWT tokens (1 hour expiry) with client-side countdown |
| **CSRF** | Stateless JWT in `Authorization` header (not cookies) |

---

## 🔮 Future Improvements

- [ ] Refresh token rotation with long-lived refresh tokens
- [ ] Email verification during registration
- [ ] Password reset flow with time-limited reset tokens
- [ ] Token blacklist via Redis for server-side logout
- [ ] Admin user management panel (CRUD operations on users)
- [ ] Unit & integration tests with Jest and Supertest
- [ ] Auto-generated Swagger/OpenAPI documentation
- [ ] Docker containerization for deployment

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
