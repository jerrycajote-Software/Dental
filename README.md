## Dental System Monorepo

A full-stack dental clinic management system with:
- **Admin side** for dentists/staff to manage appointments, schedules, services, and patients.
- **Client side** for patients to browse services, book appointments, and chat with an AI assistant.

This project is structured as a monorepo with separate frontend, backend, and database layers.

---

## Tech Stack

- **Frontend**
  - React (Vite)
  - Tailwind CSS v4
  - React Router
  - Axios
  - Lucide React (icons)

- **Backend**
  - Node.js + Express
  - PostgreSQL (via `pg`)
  - JWT authentication (`jsonwebtoken`)
  - Password hashing (`bcryptjs`)
  - OpenAI API (for AI assistant)
  - (Optional) SendGrid for email notifications

- **Database**
  - PostgreSQL
  - SQL schema and seed scripts

---

## Project Structure

```text
Dental/
├── client/           # React frontend (Vite + Tailwind)
├── server/           # Node.js + Express backend API
├── database/         # SQL schema and seed data
└── README.md         # This file
```

Key directories:

- Frontend entry: `client/src/main.jsx`, `client/src/App.jsx`
- Backend entry: `server/server.js`
- Database scripts: `database/schema.sql`, `database/seed.sql`

---

## Prerequisites

- Node.js (LTS recommended)
- npm
- PostgreSQL server running locally (or accessible remotely)

---

## Environment Variables

In `server/.env`:

```bash
PORT=5000
DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/dental_db
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
# SENDGRID_API_KEY=your_sendgrid_api_key
```

- `PORT` – API server port (default 5000).
- `DATABASE_URL` – connection string to your PostgreSQL database.
- `JWT_SECRET` – secret used to sign JWT tokens.
- `OPENAI_API_KEY` – OpenAI API key for AI chatbot.
- `SENDGRID_API_KEY` – optional, for email notifications (not required to run the app).

> The app will run without `SENDGRID_API_KEY`; email features are simply inactive.

---

## Setup Instructions

### 1. Clone and install dependencies

From the project root:

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

### 2. Configure the database

1. Create a PostgreSQL database, for example:

```sql
CREATE DATABASE dental_db;
```

2. Run the schema script:

```bash
psql -d dental_db -f database/schema.sql
```

3. Run the seed script:

```bash
psql -d dental_db -f database/seed.sql
```

Adjust paths as necessary depending on where you run the commands from.

### 3. Configure backend environment

Create `server/.env` and fill in the variables described above.

---

## Running the App

### Backend (Express API)

From the `server` folder:

```bash
npm start
```

The API will be available at:

- `http://localhost:5000/`
- `http://localhost:5000/api/...` for specific routes

### Frontend (React + Vite)

From the `client` folder:

```bash
npm run dev
```

Vite will show the local URL, typically:

- `http://localhost:5173/` (or next available port)

Open that URL in your browser to use the app.

---

## Main Features

### Client Portal

- Landing page with services overview and hero section.
- User registration and login.
- Client dashboard:
  - View upcoming appointments.
  - Book new appointments (date, time, dentist, service, notes).
- AI chatbot integrated with OpenAI for answering dental-related questions.

### Admin Dashboard

- View and manage appointment requests.
- Confirm or cancel appointments.
- Overview cards (patients, appointments, pending requests, revenue – currently partly static).
- Designed to extend to:
  - Patient management
  - Service management
  - Dentist schedules

### API Overview

Base URL: `http://localhost:5000/api`

- `POST /auth/register` – create a new user.
- `POST /auth/login` – authenticate and return JWT + user info.
- `GET /appointments` – get appointments for the logged-in user.
- `POST /appointments` – create an appointment for the logged-in client.
- `PATCH /appointments/:id/status` – update appointment status (e.g. confirmed, cancelled).
- `GET /services` – list dental services.
- `GET /services/dentists` – list dentists (users with role `dentist`).
- `POST /ai/chat` – send a message to the AI assistant (requires auth).

> Protected routes require an `Authorization: Bearer <token>` header. The frontend handles this automatically using Axios interceptors.

---

## Frontend Structure (client)

Relevant files:

- `src/main.jsx` – React entry, wraps app with `AuthProvider`.
- `src/App.jsx` – router and page layout.
- `src/pages/Home.jsx` – landing page with hero and services.
- `src/pages/Login.jsx` / `src/pages/Register.jsx` – auth forms.
- `src/pages/Dashboard.jsx` – client dashboard.
- `src/pages/AdminDashboard.jsx` – admin dashboard.
- `src/components/Navbar.jsx` – top navigation bar.
- `src/components/Footer.jsx` – footer.
- `src/components/AppointmentForm.jsx` – appointment booking modal.
- `src/components/Chatbot.jsx` – AI assistant widget.
- `src/context/AuthContext.jsx` – global auth state.
- `src/services/api.js` – Axios instance.
- `src/services/authService.js` – auth-related API calls.
- `src/services/appointmentService.js` – appointment-related API calls.

---

## Backend Structure (server)

Key files:

- `server.js` – Express app entry, route mounting.
- `config/db.js` – PostgreSQL connection pool.
- `controllers/authController.js` – registration and login logic.
- `controllers/appointmentController.js` – appointment CRUD.
- `controllers/serviceController.js` – services and dentists listing.
- `controllers/aiController.js` – OpenAI chat integration.
- `routes/authRoutes.js` – `/api/auth` routes.
- `routes/appointmentRoutes.js` – `/api/appointments` routes.
- `routes/serviceRoutes.js` – `/api/services` routes.
- `routes/aiRoutes.js` – `/api/ai` routes.
- `middleware/authMiddleware.js` – JWT auth and admin checks.

---

## Notes and Next Steps

- **Email notifications** via SendGrid are not wired yet; once you set `SENDGRID_API_KEY`, you can extend controllers to send emails for appointment confirmations and reminders.
- **Role management** (client, dentist, admin) is basic. You may want to build dedicated admin pages for managing roles and users.
- Consider adding tests, linting commands, and CI workflow as the project grows.

---

## License

This project is for educational and internal use. Add a specific license here if you plan to distribute it.

