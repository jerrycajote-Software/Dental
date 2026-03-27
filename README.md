# Dental Care Plus - Monorepo

A modern, full-stack dental clinic management system designed for seamless patient booking and efficient administrative oversight.

---

## 🚀 Overview

Dental Care Plus provides a dual-interface experience:
- **Client Portal**: Empowering patients to browse premium dental services, book appointments with real-time availability, and interact with an AI-powered dental assistant.
- **Admin Dashboard**: A centralized hub for clinic staff to manage schedules, confirm appointments, and monitor clinic performance.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (Vite-powered)
- **Styling**: Tailwind CSS v4 (Modern transitions and grid layouts)
- **Icons**: Lucide React
- **State Management**: React Context API (Auth & UI state)
- **API Client**: Axios with interceptors for JWT handling

### Backend
- **Runtime**: Node.js & Express
- **Database**: PostgreSQL (Robust relational storage)
- **Security**: JWT Authentication & Bcrypt password hashing
- **Integration**: OpenAI API (AI Dental Assistant)
- **Communication**: SMTP/Nodemailer for verification and notifications

---

## 🗺️ Project Roadmap

### Phase 1: Foundation (Completed)
- [x] Initial monorepo structure
- [x] Comprehensive database schema
- [x] Secure authentication system (JWT)
- [x] Basic CRUD for appointments and services

### Phase 2: User Experience (Completed)
- [x] **Real-Time Availability**: Booking form polls every 30s to prevent double-booking.
- [x] **Smart Overlap Detection**: Advanced algorithm to handle flexible appointment durations.
- [x] **Doctor Schedules**: Integration with specific working hours per doctor.
- [x] **Modern UI**: Horizontal, responsive time-slot selection.

### Phase 3: Advanced Features (Ongoing)
- [ ] Automated SMS/Push reminders
- [ ] Patient medical history tracking
- [ ] Integrated billing and payment gateway
- [ ] Multi-branch support

---

## 📊 Application Flow

```mermaid
graph TD
    A[Visitor] -->|Registers/Logs In| B(Dashboard)
    B --> C{Action}
    C -->|Book| D[Service/Doctor Selection]
    D -->|Real-time| E[Time Slot Selection]
    E -->|Success| F[Pending Appointment]
    C -->|AI Chat| G[Dental Assistant]
    F -->|Admin View| H[Admin Dashboard]
    H -->|Confirm/Cancel| I[Status Update]
    I -->|Notify| A
```

---

## 📥 Setup Guide

### 1. Prerequisites
- **Node.js**: v18+ recommended
- **PostgreSQL**: Local instance running on port 5432

### 2. Environment Configuration
Create a `.env` file in the `server/` directory:
```env
PORT=5000
DATABASE_URL=postgres://postgres:PASSWORD@localhost:5432/dental_db
JWT_SECRET=your_secure_secret
OPENAI_API_KEY=your_openai_key
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 3. Installation
```bash
# Install root (if using workspaces) or individual
cd client && npm install
cd ../server && npm install
```

### 4. Database Initialization
```bash
# Using psql
psql -U postgres -f database/schema.sql
psql -U postgres -f database/seed.sql
```

### 5. Start Development
```bash
# Start Backend (Server folder)
npm start

# Start Frontend (Client folder)
npm run dev
```

---

## 📂 Project Structure

```text
Dental/
├── client/           # React + Vite + Tailwind
│   ├── src/components/ # Reusable UI 
│   ├── src/pages/      # View layouts
│   └── src/context/    # State management
├── server/           # Express API
│   ├── controllers/    # Business logic
│   ├── routes/         # API endpoints
│   └── middleware/     # Auth & validation
└── database/         # SQL Migrations
```

---

## 🔐 Security & Role Management
- **Patients**: Access to booking, history, and AI chat.
- **Admins**: Full control over appointment status and clinic data.
- **Verification**: Mandatory email verification for all new accounts to ensure data integrity.

---

## 📄 License
Internal Development - All Rights Reserved.

