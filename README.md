# Inter-Departmental Planning & Resource Sharing Platform (NexusShare)

An enterprise-grade full-stack platform built with **React.js, Node.js, Express, and MongoDB** designed for cross-departmental coordination, shared resource scheduling (equipment, facilities, specialized workforce, software licenses), joint project planning, conflict resolution, mutual aid barter trading, and executive analytics.

---

## 🌟 Key Features

1. **Multi-Department & Role Context Switcher**:
   - Seamlessly switch between enterprise departments (Engineering, Growth & Marketing, Research & Development, Global Operations, Product Design, Corporate Finance).
   - Roles: Dept Admin, Resource Manager, Project Lead, Executive Auditor.
   - Live inter-departmental credit balance ledger.

2. **Shared Resource Catalog & Smart Booking Engine**:
   - Filter by categories: **Equipment, Facilities, Talent, Licenses**.
   - Hourly credit cost calculation, utilization tracking %, and specifications catalog.
   - Automated conflict detection engine flagging overlapping date-time reservations across departments.

3. **Inter-Departmental Joint Project Roadmap (Gantt Chain)**:
   - Visual milestone dependency chain linking cross-department deliverables (e.g. Design -> Engineering -> Marketing -> Finance).
   - Budget allocation tracking and completion progress percentages.

4. **Mutual Aid & Barter Exchange Hub**:
   - Resource swapping board where departments post excess capacity or request specialized aid (e.g., Marketing offering copywriting in exchange for GPU compute hours).
   - Credit settlement engine automatically adjusting departmental balances upon trade acceptance.

5. **Conflict Resolution Radar**:
   - Real-time detection of resource double-bookings.
   - One-click admin overrides or schedule rejection workflow.

6. **Executive Analytics & CSV Exporter**:
   - Saved capital metrics ($142,000+ saved via shared utilization).
   - Interactive departmental utilization rate bars and exportable CSV audit reports.

7. **Dual Database Mode Support**:
   - **MongoDB Mode**: Automatically connects if `MONGODB_URI` environment variable is present in `server/.env`.
   - **Embedded Enterprise Engine**: Zero setup required out-of-the-box! Runs in-memory with pre-populated seed data for immediate demonstration.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, Modern Glassmorphism CSS design system with Google Fonts (*Plus Jakarta Sans* & *JetBrains Mono*).
- **Backend**: Node.js, Express, Mongoose (MongoDB ORM), CORS, Dotenv.
- **REST APIs**: `/api/departments`, `/api/resources`, `/api/bookings`, `/api/projects`, `/api/trades`, `/api/analytics`, `/api/audit-logs`.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v16+) and npm installed.

### 1. Installation
Install all dependencies for root monorepo, backend server, and frontend client:
```bash
npm run install:all
```
*(Or install individually: `cd server && npm install` then `cd ../client && npm install`)*

### 2. Running the Application
Start both the Express REST API backend (Port 5000) and the React Vite client (Port 3000) concurrently:
```bash
npm run dev
```

Open your browser at:
`http://localhost:3000`

---

## 📁 Directory Structure

```
inter-departmental-platform/
├── package.json               # Root monorepo scripts
├── README.md                  # Project documentation
├── server/
│   ├── package.json           # Express server dependencies
│   ├── index.js               # REST API engine & in-memory fallback
│   ├── config/
│   │   └── db.js              # MongoDB connector
│   ├── models/                # Mongoose Schema Models
│   │   ├── Department.js
│   │   ├── Resource.js
│   │   ├── Booking.js
│   │   ├── Project.js
│   │   ├── TradeRequest.js
│   │   └── AuditLog.js
│   └── seed/
│       └── seedData.js        # Enterprise seed dataset
└── client/
    ├── package.json           # Vite & React dependencies
    ├── vite.config.js         # Vite proxy configuration
    ├── index.html             # HTML entry point with web fonts
    └── src/
        ├── main.jsx
        ├── App.jsx            # Main app with toasts & routing
        ├── index.css          # Glassmorphism dark theme CSS
        ├── context/
        │   └── AppContext.jsx # Global department & role state
        ├── utils/
        │   └── api.js         # API request wrapper
        ├── components/        # Reusable UI components
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx
        │   ├── ResourceCard.jsx
        │   ├── BookingModal.jsx
        │   ├── TimelineGantt.jsx
        │   ├── ConflictAlerts.jsx
        │   ├── StatsCard.jsx
        │   └── TradeModal.jsx
        └── pages/             # Platform views
            ├── Dashboard.jsx
            ├── ResourcesPage.jsx
            ├── BookingsPage.jsx
            ├── ProjectsPage.jsx
            ├── ExchangePage.jsx
            ├── ConflictsPage.jsx
            └── AnalyticsPage.jsx
```
