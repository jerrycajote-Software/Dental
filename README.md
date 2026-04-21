# 🦷 Dental Care Plus — Full-Stack Clinic Management System

A modern, multi-platform dental clinic management system enabling seamless patient booking, doctor scheduling, and administrative oversight — available on both **Web** and **Android (React Native)**.

---

## 🚀 Overview

Dental Care Plus provides a **tri-portal experience** serving three distinct roles:

| Portal | Platform | Description |
|---|---|---|
| 🧑‍⚕️ **Patient Portal** | Web + Mobile | Book appointments, view schedules, chat with AI assistant |
| 🩺 **Doctor Portal** | Web | Manage appointments, book walk-ins, set availability |
| 🛡️ **Admin Dashboard** | Web | Full clinic oversight — doctors, patients, and analytics |

---

## 🛠️ Tech Stack

### Frontend (Web)
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS v4 + Styled Components
- **Charts**: Recharts (AreaChart for appointment analytics)
- **Icons**: Lucide React + React Icons
- **State Management**: React Context API (Auth & UI state)
- **API Client**: Axios with JWT interceptors
- **Routing**: React Router v6 with protected & public routes

### Backend
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL (relational schema with migrations)
- **Security**: JWT (1-day expiry) + Bcrypt password hashing
- **AI Integration**: OpenAI API (GPT-3.5-turbo — dental-only assistant)
- **Email**: SMTP via Nodemailer (verification, password reset, walk-in welcome)
- **Jobs**: Auto-cancellation cron (every 5 minutes)

### Mobile (Android)
- **Framework**: React Native (Expo)
- **Navigation**: React Navigation (Stack Navigator)
- **State**: AsyncStorage for persistent sessions
- **API**: Shared Axios service connecting to the same backend

---

## ✅ Implemented Features

### 🔐 Authentication & Security
- [x] JWT-based login with 1-day token expiry
- [x] Role-based access control (`admin`, `doctor`, `user`)
- [x] Email verification on registration (24-hour token)
- [x] Resend verification email
- [x] Forgot password flow (1-hour reset token)
- [x] Reset password via secure email link
- [x] Bcrypt password hashing (10 salt rounds)
- [x] Soft-delete for patients with 24-hour re-registration cooldown
- [x] Admin account auto-bootstrapped on server startup
- [x] Doctor accounts restricted to verified Gmail addresses

---

### 🧑 Patient Portal — Web (`/dashboard`)
- [x] Browse available dental services with prices
- [x] Book appointments (select doctor → service → date → time)
- [x] Real-time slot availability polling (every 30 seconds)
- [x] Smart time-slot overlap detection (blocks conflicting bookings)
- [x] Doctor schedule enforcement (slots shown within working hours)
- [x] Past date/time booking prevention (client + server validation)
- [x] Reschedule existing appointments
- [x] Cancel appointments
- [x] View complete appointment history with color-coded status badges
- [x] AI Dental Chatbot (dental-topic-restricted GPT-3.5-turbo)
- [x] Self account deletion

---

### 📱 Patient Portal — Mobile (React Native / Android)
- [x] Login with JWT session persistence (AsyncStorage)
- [x] Register new account
- [x] Dashboard showing active appointments (confirmed + pending)
- [x] Book new appointments (doctor, service, date, time selection)
- [x] Reschedule appointments via booking screen
- [x] Cancel appointments with confirmation dialog
- [x] Real-time appointment refresh on screen focus
- [x] Floating AI Chatbot button with modal overlay
- [x] 12-hour time format (PHT timezone aware)
- [x] Status badges (Confirmed / Pending / Cancelled / Completed)

---

### 🩺 Doctor Portal — Web (`/doctor`)
- [x] Personalized welcome with doctor's name
- [x] Stats overview: Total / Pending / Confirmed / Completed appointments
- [x] View full appointment schedule table (patient, service, date, time, status)
- [x] Confirm pending appointments
- [x] Mark completed (only enabled after appointment datetime has passed)
- [x] Cancel pending/confirmed appointments
- [x] **Walk-in Patient Booking Form** with full demographics:
  - First Name, Last Name, Middle Name
  - Age (auto-calculated from Date of Birth)
  - Date of Birth, Contact Number, Email
  - Home Address, Allergies, Previous Dental History
  - Blood Type, Civil Status
- [x] Multi-service selection for walk-in appointments
- [x] Auto-creates patient account with deterministic temp password
- [x] Walk-in patient welcome email with credentials and verification link
- [x] Toggle availability (shown/hidden in patient booking dropdown)
- [x] Mark specific calendar dates as unavailable
- [x] Remove unavailable dates

---

### 🛡️ Admin Dashboard — Web (`/admin`)
- [x] **Overview Tab**: Stats widgets (Total Appointments, Unique Patients, Cancelled Count)
- [x] **Appointments Overview Chart** (Recharts AreaChart)
- [x] **Appointments Tab**: Full table with search by patient/doctor, filter by status (All / Confirmed / Pending / Cancelled / Completed), delete records
- [x] **Patients Tab**: Patient registry with join date, verification status, soft-delete indicator, delete action
- [x] **Doctors Tab**: Create doctor accounts (Gmail required, auto-sends verification), view all registered doctors with status, delete doctor accounts
- [x] **Settings Tab**: Admin profile & clinic configuration panel
- [x] Global header search bar
- [x] Notification bell indicator
- [x] Sidebar navigation with active state highlighting

---

### ⚙️ Backend System Features
- [x] **Auto-Cancellation Job**: Cancels pending appointments not approved within 1 hour (runs every 5 minutes on server startup)
- [x] **Multi-Service Appointments**: `appointment_services` junction table (supports multiple services per appointment with backward compatibility)
- [x] **Doctor Schedules**: Per-doctor, per-day-of-week working hours (`schedules` table)
- [x] **Booked Slots API**: Returns schedule + booked slots with duration data for overlap detection
- [x] **Conflict Check**: Prevents double-booking at server level
- [x] **Walk-in Upsert Logic**: Finds existing patient by email or creates new account
- [x] **Admin Bootstrap Utility**: Ensures admin account exists on every server start
- [x] **Doctor Unavailable Dates**: `doctor_unavailable_dates` table with unique constraint

---

## 📊 Database Schema

```
users              — id, name, email, password, role, email_verified,
                     is_available, is_deleted, deleted_at,
                     first_name, last_name, middle_name, age, date_of_birth,
                     contact_number, home_address, allergies,
                     previous_dental_history, blood_type, civil_status

services           — id, name, description, price, duration_minutes

appointments       — id, client_id → users, dentist_id → users,
                     service_id → services, appointment_date,
                     appointment_time, status, notes, created_at

appointment_services — appointment_id → appointments, service_id → services
                       (junction table for multi-service bookings)

schedules          — id, dentist_id → users, day_of_week (0–6),
                     start_time, end_time

doctor_unavailable_dates — id, doctor_id → users,
                           unavailable_date (UNIQUE per doctor)
```

---

## 📂 Project Structure

```text
Dental/
├── client/                   # React + Vite + Tailwind CSS v4
│   └── src/
│       ├── assets/           # Images (profile, ai icon)
│       ├── components/       # AppointmentForm, WalkinAppointmentForm,
│       │                     # Chatbot, Navbar, Footer
│       ├── context/          # AuthContext (JWT + user state)
│       ├── pages/            # Home, Login, Dashboard, AdminDashboard,
│       │                     # DoctorDashboard, VerifyEmail,
│       │                     # ForgotPassword, ResetPassword
│       └── services/         # api.js (Axios), appointmentService.js
│
├── server/                   # Node.js + Express API
│   ├── config/               # db.js (PostgreSQL pool)
│   ├── controllers/          # authController, appointmentController,
│   │                         # aiController, serviceController
│   ├── middleware/            # authMiddleware (JWT verification)
│   ├── routes/               # authRoutes, appointmentRoutes,
│   │                         # aiRoutes, serviceRoutes
│   ├── utils/                # email.js (Nodemailer), bootstrap.js
│   └── server.js             # Express entry + auto-cancellation job
│
├── Mobile/                   # React Native (Expo) — Android
│   ├── screens/              # LoginScreen, RegisterScreen,
│   │                         # DashboardScreen, BookingScreen
│   ├── components/           # ChatBot.js
│   ├── navigation/           # AppNavigator.js (Stack Navigator)
│   └── services/             # api.js (shared Axios + AsyncStorage)
│
└── database/                 # SQL migrations
    ├── schema.sql            # Initial tables
    ├── migration.sql         # Extended user fields
    ├── migration_multi_service.sql  # appointment_services table
    └── migration_walkin.sql  # Walk-in patient demographic fields
```

---

## 📥 Setup Guide

### 1. Prerequisites
- **Node.js**: v18+
- **PostgreSQL**: Local instance on port 5432
- **Android Studio** (for Mobile build) or **Expo Go** (for testing)

### 2. Environment Configuration
Create a `.env` file inside `server/`:
```env
PORT=5000
DATABASE_URL=postgres://postgres:PASSWORD@localhost:5432/dental_db
JWT_SECRET=your_secure_secret
OPENAI_API_KEY=your_openai_key
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
CLIENT_URL=http://localhost:5173
```

### 3. Database Initialization
```bash
psql -U postgres -f database/schema.sql
psql -U postgres -f database/migration.sql
psql -U postgres -f database/migration_multi_service.sql
psql -U postgres -f database/migration_walkin.sql
psql -U postgres -f database/seed.sql
```

### 4. Installation
```bash
# Backend
cd server && npm install

# Frontend
cd client && npm install

# Mobile
cd Mobile && npm install
```

### 5. Start Development
```bash
# Backend (server/)
npm start

# Frontend (client/)
npm run dev

# Mobile (Mobile/)
npx expo start
# or for Android APK:
npx expo run:android
```

---

## 🗺️ Project Roadmap

### Phase 1: Foundation ✅ Complete
- [x] Monorepo structure (Web + Mobile)
- [x] PostgreSQL schema with migrations
- [x] JWT authentication with email verification
- [x] Role-based access: admin / doctor / user
- [x] CRUD operations for appointments and services

### Phase 2: Core Experience ✅ Complete
- [x] Real-time slot availability (30s polling + conflict detection)
- [x] Doctor schedule integration (day-of-week working hours)
- [x] Walk-in appointment system with demographic capture
- [x] Multi-service appointment support
- [x] Auto-cancellation background job (1-hour pending timeout)
- [x] Doctor availability toggle + blackout dates
- [x] OpenAI dental assistant (dental-restricted GPT-3.5-turbo)
- [x] Forgot/Reset password email flow
- [x] React Native Android app (Login, Register, Dashboard, Booking)

### Phase 3: Advanced Features 🔄 Planned
- [ ] Automated SMS / push notification reminders
- [ ] Patient medical history & record tracking
- [ ] Integrated billing and payment gateway (e.g., GCash / PayMaya)
- [ ] Multi-branch clinic support
- [ ] Admin appointment analytics by day / week / month
- [ ] iOS build for the React Native app

---

## 🔐 Security & Role Management

| Role | Capabilities |
|---|---|
| **Patient** | Register, book, reschedule, cancel, chat with AI, delete own account |
| **Doctor** | View schedule, confirm/complete/cancel, book walk-ins, set availability |
| **Admin** | Full control — manage appointments, patients, doctors, and clinic config |

- Mandatory email verification before first login
- Admin account is seeded server-side only (cannot be registered via API)
- Doctor accounts require a Gmail address and go through email verification
- Walk-in patients automatically receive a temp password and verification email
- Pending appointments are automatically cancelled after **1 hour** of inactivity

---

## 📄 License
Internal Development — All Rights Reserved.
