# 🦷 Dental Care Plus — System Flowchart

A comprehensive visual map of the full Dental Care Plus system, covering all three portals (Patient, Doctor, Admin), the mobile app, and key backend processes.

---

## 🗺️ Master System Flow

```mermaid
flowchart TD
    VISITOR([🌐 Visitor]) --> HOME[Home Page]
    HOME --> AUTH{Has Account?}
    AUTH -->|No| REGISTER[Register Page]
    AUTH -->|Yes| LOGIN[Login Page]

    REGISTER --> SEND_VERIFY[📧 Send Verification Email]
    SEND_VERIFY --> VERIFY_EMAIL[/verify-email/:token/]
    VERIFY_EMAIL -->|Valid Token| VERIFIED[✅ Email Verified]
    VERIFY_EMAIL -->|Expired Token| RESEND[Resend Verification]
    RESEND --> SEND_VERIFY
    VERIFIED --> LOGIN

    LOGIN -->|Wrong Credentials| LOGIN
    LOGIN -->|Forgot Password| FORGOT[Forgot Password Page]
    FORGOT --> RESET_EMAIL[📧 Send Password Reset Email]
    RESET_EMAIL --> RESET_PAGE[/reset-password/:token/]
    RESET_PAGE -->|Valid Token| NEW_PASS[Set New Password]
    NEW_PASS --> LOGIN

    LOGIN -->|Role = admin| ADMIN_DASH
    LOGIN -->|Role = doctor| DOCTOR_DASH
    LOGIN -->|Role = user| PATIENT_DASH
```

---

## 🧑 Patient Portal Flow (Web)

```mermaid
flowchart TD
    PATIENT_DASH([🧑 Patient Dashboard]) --> P_ACTION{Choose Action}

    P_ACTION -->|Book Appointment| BOOKING[Booking Form]
    BOOKING --> SEL_SVC[Select Service]
    SEL_SVC --> SEL_DOC[Select Available Doctor]
    SEL_DOC --> SEL_DATE[Pick Date]
    SEL_DATE --> FETCH_SLOTS[⏱️ Fetch Available Slots\nPoll Every 30s]
    FETCH_SLOTS --> OVERLAP{Slot Available?}
    OVERLAP -->|No — Slot Taken| FETCH_SLOTS
    OVERLAP -->|Yes| SEL_TIME[Select Time]
    SEL_TIME --> PAST_CHECK{Future Date/Time?}
    PAST_CHECK -->|No| SEL_DATE
    PAST_CHECK -->|Yes| SUBMIT_APT[Submit Appointment]
    SUBMIT_APT --> SERVER_CHECK{Server Conflict Check}
    SERVER_CHECK -->|Conflict| OVERLAP
    SERVER_CHECK -->|Clear| APT_CREATED[🟡 Appointment Created\nStatus: Pending]

    P_ACTION -->|View History| HISTORY[Appointment List]
    HISTORY --> HIST_STATUS{Status?}
    HIST_STATUS --> PENDING_BADGE[🟡 Pending]
    HIST_STATUS --> CONFIRMED_BADGE[🟢 Confirmed]
    HIST_STATUS --> COMPLETED_BADGE[🔵 Completed]
    HIST_STATUS --> CANCELLED_BADGE[🔴 Cancelled]

    P_ACTION -->|Reschedule| RESCHEDULE[Reschedule Form\nSame as Booking — Pre-filled]
    RESCHEDULE --> SERVER_CHECK

    P_ACTION -->|Cancel Appointment| CANCEL_APT[Update Status → Cancelled]

    P_ACTION -->|AI Chatbot| CHATBOT[💬 Dental AI Assistant]
    CHATBOT --> DENTAL_CHECK{Dental Topic?}
    DENTAL_CHECK -->|Yes| GPT[OpenAI GPT-3.5-turbo\nResponse]
    DENTAL_CHECK -->|No| FALLBACK[❌ Only dental topics\naccepted!]

    P_ACTION -->|Delete Account| SOFT_DEL[Soft Delete\n24hr Re-registration Cooldown]
```

---

## 🩺 Doctor Portal Flow (Web)

```mermaid
flowchart TD
    DOCTOR_DASH([🩺 Doctor Portal]) --> D_ACTION{Choose Action}

    D_ACTION -->|View Schedule| APT_TABLE[Appointment Table\nPatient · Service · Date · Time · Status]
    APT_TABLE --> APT_ACTION{Appointment Action}
    APT_ACTION -->|Pending| CONFIRM_BTN[✅ Confirm → Status: Confirmed]
    APT_ACTION -->|Confirmed + Past| COMPLETE_BTN[🔵 Mark Completed]
    APT_ACTION -->|Confirmed - Future| DISABLED_BTN[🚫 Disabled\nAppointment Not Yet Passed]
    APT_ACTION -->|Pending or Confirmed| CANCEL_BTN[❌ Cancel → Status: Cancelled]

    D_ACTION -->|Walk-in Booking| WALKIN_FORM[Walk-in Form]
    WALKIN_FORM --> DEMO_FIELDS[Patient Demographics:\nFirst/Last/Middle Name, DOB, Age\nContact, Email, Address\nAllergies, Dental History\nBlood Type, Civil Status]
    DEMO_FIELDS --> MULTI_SVC[Select Multiple Services]
    MULTI_SVC --> WALKIN_CHECK{Email Exists?}
    WALKIN_CHECK -->|Existing Patient| LINK_USER[Link to Existing User]
    WALKIN_CHECK -->|New Patient| CREATE_USER[Auto-Create Patient Account\nTemp Password: Fn+Ln+BirthYear]
    CREATE_USER --> WALKIN_EMAIL[📧 Send Welcome Email\nWith Credentials + Verify Link]
    LINK_USER --> WALKIN_APT[✅ Create Appointment\nStatus: Confirmed Immediately]
    WALKIN_EMAIL --> WALKIN_APT

    D_ACTION -->|Availability Settings| AVAIL_TOGGLE[Toggle Available / Unavailable\nShown in Patient Booking Dropdown]
    D_ACTION -->|Block Dates| BLOCK_DATES[Mark Specific Dates Unavailable\nStored in doctor_unavailable_dates]
    BLOCK_DATES --> REMOVE_DATE[Remove Blocked Date]

    D_ACTION -->|View Stats| STATS[Stats Cards:\nTotal · Pending · Confirmed · Completed]
```

---

## 🛡️ Admin Dashboard Flow (Web)

```mermaid
flowchart TD
    ADMIN_DASH([🛡️ Admin Dashboard]) --> ADMIN_TAB{Navigate Tab}

    ADMIN_TAB -->|Overview| OVERVIEW[Stats Widgets\nTotal Appointments · Unique Patients · Cancelled]
    OVERVIEW --> CHART[📊 Appointments Area Chart\nRecharts — Week / Month View]

    ADMIN_TAB -->|Appointments| APT_MGT[Appointments Table]
    APT_MGT --> SEARCH_APT[🔍 Search by Patient or Doctor]
    APT_MGT --> FILTER_APT[Filter: All / Confirmed / Pending\nCancelled / Completed]
    APT_MGT --> DELETE_APT[🗑️ Delete Appointment Record]

    ADMIN_TAB -->|Patients| PAT_MGT[Patient Registry Table\nName · Email · Joined · Status]
    PAT_MGT --> PAT_STATUS{Account Status}
    PAT_STATUS -->|Verified| VERIFIED_BADGE[🟢 Verified]
    PAT_STATUS -->|Unverified| UNVERIF_BADGE[🟡 Unverified]
    PAT_STATUS -->|Soft-Deleted| DELETED_BADGE[🔴 Deleted]
    PAT_MGT --> DELETE_PAT[🗑️ Soft Delete Patient]

    ADMIN_TAB -->|Doctors| DOC_MGT[Doctor Management]
    DOC_MGT --> CREATE_DOC_FORM[Add New Doctor Form\nName · Gmail · Password]
    CREATE_DOC_FORM --> GMAIL_CHECK{Gmail Address?}
    GMAIL_CHECK -->|No| FORM_ERROR[❌ Validation Error]
    GMAIL_CHECK -->|Yes| CREATE_DOC_ACC[✅ Create Doctor Account]
    CREATE_DOC_ACC --> DOC_VERIFY_EMAIL[📧 Send Verification Email]
    DOC_MGT --> DOCTOR_LIST[Registered Doctors Table]
    DOCTOR_LIST --> DELETE_DOC[🗑️ Delete Doctor + Schedules]

    ADMIN_TAB -->|Settings| SETTINGS[Admin Profile & Clinic Settings]
```

---

## 📱 Mobile App Flow (React Native / Android)

```mermaid
flowchart TD
    MOBILE_START([📱 Open App]) --> TOKEN_CHECK{JWT in AsyncStorage?}
    TOKEN_CHECK -->|Yes| MOBILE_DASH
    TOKEN_CHECK -->|No| MOBILE_LOGIN[Login Screen]
    MOBILE_LOGIN --> MOBILE_REG[Register Screen]
    MOBILE_REG --> MOBILE_LOGIN
    MOBILE_LOGIN -->|Authenticated| MOBILE_DASH[Dashboard Screen]

    MOBILE_DASH --> M_ACTION{Choose Action}
    M_ACTION -->|View Schedule| ACTIVE_APTS[Active Appointments\nConfirmed + Pending]
    ACTIVE_APTS --> M_APT_ACTION{Appointment Action}
    M_APT_ACTION -->|Reschedule| MOBILE_BOOKING[Booking Screen\nPre-filled for Reschedule]
    M_APT_ACTION -->|Cancel| CONFIRM_DIALOG[⚠️ Confirm Dialog]
    CONFIRM_DIALOG -->|Yes| MOBILE_CANCEL[Update Status → Cancelled]
    CONFIRM_DIALOG -->|No| ACTIVE_APTS

    M_ACTION -->|Book New Appointment| MOBILE_BOOKING
    MOBILE_BOOKING --> M_SEL_DOC[Select Doctor]
    M_SEL_DOC --> M_SEL_SVC[Select Service]
    M_SEL_SVC --> M_SEL_DATE[Pick Date]
    M_SEL_DATE --> M_SEL_TIME[Pick Time]
    M_SEL_TIME --> M_SUBMIT[Submit Booking]
    M_SUBMIT --> APT_CREATED_M[🟡 Appointment Created\nStatus: Pending]

    M_ACTION -->|AI Chatbot| MOBILE_CHATBOT[💬 Chatbot Modal Overlay]
    MOBILE_CHATBOT --> DENTAL_AI[Dental-Only AI Assistant]
```

---

## ⚙️ Backend Automation Flow

```mermaid
flowchart TD
    SERVER_START([🚀 Server Start]) --> BOOTSTRAP[Bootstrap Admin\nCreate if not exists]
    SERVER_START --> AUTO_JOB[Start Auto-Cancellation Job]

    AUTO_JOB --> RUN_NOW[Run Immediately on Startup]
    RUN_NOW --> JOB_LOGIC{Pending Appointments\n> 1 hour old?}
    JOB_LOGIC -->|Yes| AUTO_CANCEL[Update Status → Cancelled\nLog Cancelled Count]
    JOB_LOGIC -->|No| WAIT[Wait 5 Minutes]
    WAIT --> JOB_LOGIC
    AUTO_CANCEL --> WAIT

    SERVER_START --> ROUTES[Register API Routes]
    ROUTES --> AUTH_ROUTE[/api/auth/*\nRegister, Login, Verify,\nForgotPw, ResetPw,\nDoctors, Patients,\nAvailability, Me]
    ROUTES --> APT_ROUTE[/api/appointments/*\nGet, Create, Update,\nStatus, Delete,\nBooked Slots, Walk-in]
    ROUTES --> AI_ROUTE[/api/ai/chat\nOpenAI Proxy — Dental Only]
    ROUTES --> SVC_ROUTE[/api/services\nGet All Services]
```

---

## 🔄 Appointment Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending : Patient Books Online\nor Doctor Books Walk-in
    Pending --> Confirmed : Doctor Confirms\nor Walk-in Auto-Confirmed
    Pending --> Cancelled : Doctor / Admin Cancels\nor Auto-Cancel after 1hr
    Confirmed --> Completed : Doctor Marks Complete\nOnly after appointment datetime passes
    Confirmed --> Cancelled : Doctor / Admin Cancels
    Completed --> [*]
    Cancelled --> [*]
```

---

## 🏗️ System Architecture

```mermaid
graph LR
    subgraph Client["💻 Web Client (React + Vite)"]
        HOME_PAGE[Home Page]
        AUTH_PAGES[Auth Pages\nLogin · Register · Verify · Reset]
        PATIENT_PAGE[Patient Dashboard]
        DOCTOR_PAGE[Doctor Portal]
        ADMIN_PAGE[Admin Dashboard]
        AI_WIDGET[AI Chatbot Widget]
    end

    subgraph Mobile["📱 Mobile (React Native)"]
        LOGIN_SCR[Login / Register]
        DASH_SCR[Dashboard]
        BOOK_SCR[Booking Screen]
        CHAT_SCR[Chatbot Modal]
    end

    subgraph Backend["🖥️ Backend (Node.js + Express)"]
        AUTH_API[Auth API]
        APT_API[Appointment API]
        AI_API[AI API]
        SVC_API[Services API]
        JOB[Auto-Cancel Job]
        MAILER[Nodemailer SMTP]
    end

    subgraph DB["🗄️ PostgreSQL"]
        USERS_TBL[(users)]
        APTS_TBL[(appointments)]
        SVCS_TBL[(services)]
        SCHEDS_TBL[(schedules)]
        UNAVAIL_TBL[(doctor_unavailable_dates)]
        APT_SVC_TBL[(appointment_services)]
    end

    subgraph External["☁️ External Services"]
        OPENAI[(OpenAI\nGPT-3.5-turbo)]
        GMAIL[(Gmail SMTP)]
    end

    Client -->|Axios + JWT| Backend
    Mobile -->|Axios + AsyncStorage| Backend
    Backend --> DB
    AI_API --> OPENAI
    MAILER --> GMAIL
```
