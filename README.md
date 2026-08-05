# Yazhi Event Management Platform

Yazhi Events is an enterprise-grade event management and operations platform built for premium Tamil cultural events, bookings, vendor coordination, team operations, payments, analytics, and business configuration.

The system provides a full-suite SaaS experience for administrators to manage inquiries, bookings, team schedules, financial workflows, CRM communications, documents, content, and centralized enterprise settings from a single platform.

---

## 🚀 Key Modules & Architecture

The application is structured as a decoupled full-stack TypeScript solution:

- Frontend: React 19, Vite, TypeScript, Tailwind CSS, Framer Motion, and TanStack Query
- Backend: Node.js, Express, TypeScript, Helmet, Mongoose, JWT auth, RBAC, and PDF generation
- Database: MongoDB with Mongoose models, validation, and audit-ready data structures

### Core Features

1. Lead Management (CRM) for inquiries and booking pipelines
2. Event Booking Engine with booking status and lifecycle handling
3. Workforce and Team Management for scheduling and assignments
4. Vendor and Resource Management
5. Granular Role-Based Access Control (RBAC) for Super Admin, Admin, Manager, Coordinator, Employee, Vendor, and Client
6. Real-Time Notifications and messaging dispatch
7. Financial Ledger and Payments integration
8. Analytics and reporting dashboards
9. Multi-channel communication via WhatsApp, SMS, and Email
10. Automated PDF generation for invoices, contracts, and receipts
11. Enterprise Blog CMS with drafts, publishing, SEO, categories, and tags
12. Enterprise Settings & Business Configuration module for centralized business control

---

## 📂 Project Structure

```text
yazhi_events/
├── client/                     # Vite React frontend app
│   ├── public/                 # Static public assets
│   └── src/
│       ├── adminApp/           # Admin portal layouts, components, and pages
│       ├── clientApp/          # Client dashboard portal
│       ├── publicApp/          # Marketing landing site
│       └── shared/             # Global contexts, API layer, hooks, and schemas
├── server/                     # Express backend app
│   ├── src/
│   │   ├── config/             # Database and environment setup
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Auth, RBAC, validation, errors
│   │   ├── models/             # Mongoose schemas and interfaces
│   │   ├── routes/             # Express routes
│   │   ├── validators/         # Zod validation schemas
│   │   └── utils/              # Messaging, notifications, PDF helpers
│   └── tsconfig.json
└── docker-compose.yml
```

---

## 🔌 API Endpoints Summary

### Authentication & RBAC (`/api/auth`)
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PATCH /api/auth/change-password`

### Staff & Users (`/api/users`)
- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/:id/permissions`
- `PATCH /api/users/:id/role`

### Events & Bookings (`/api/bookings`)
- `GET /api/bookings`
- `POST /api/bookings`
- `PATCH /api/bookings/:id`
- `GET /api/bookings/my-bookings`

### Notifications (`/api/notifications`)
- `GET /api/notifications`
- `GET /api/notifications/unread-count`
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`
- `DELETE /api/notifications/clear`

### Document Generation (`/api/documents`)
- `GET /api/documents/invoice/:id`
- `GET /api/documents/contract/:id`
- `GET /api/documents/receipt/:id`

### CRM Communication (`/api/communication`)
- `POST /api/communication/send-whatsapp`
- `POST /api/communication/send-sms`
- `POST /api/communication/send-email`

### Blog CMS (`/api/blog`)
- `GET /api/blog`
- `GET /api/blog/slug/:slug`
- `POST /api/blog`
- `PUT /api/blog/:id`
- `POST /api/blog/:id/duplicate`
- `GET /api/blog/admin`
- `GET /api/blog/admin/stats`
- `GET /api/blog/admin/reports`

### Enterprise Settings (`/api/settings`)
- `GET /api/settings`
- `PUT /api/settings`
- `PATCH /api/settings`
- `POST /api/settings/test-email`
- `POST /api/settings/backup`
- `POST /api/settings/restore`

### Analytics & Reports (`/api/analytics`)
- `GET /api/analytics/dashboard`
- `GET /api/analytics/export-ledgers`

---

## 🛠️ Environment Variables Setup

### Server (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/yazhieve
JWT_SECRET=super_secret_access_key_123!
JWT_REFRESH_SECRET=super_secret_refresh_key_456!
CLIENT_URL=http://localhost:5174
```

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🏃 Local Setup & Running Instructions

### 1. Installation
Run `npm install` inside both the client and server directories:

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Database Seeding & Admin Setup
Create the initial Super Admin account and seed mock data:

```bash
cd server
npm run seed
```

### 3. Running the Project
Launch the backend and frontend:

- Backend: `cd server && npm run dev`
- Frontend: `cd client && npm run dev`

### 4. Verification
The current project state has been verified with:

```bash
cd client && npm run build
cd ../server && npm run build
```

---

## ✅ Current Status

The platform now includes:

- A complete enterprise settings module with protected admin APIs
- Multi-tab business configuration UI for General, Business, Booking, Payment, Email, WhatsApp, Cloudinary, Theme, Security, Backup, and Audit Logs
- Audit logging and centralized configuration support for future modules

---
