# Yazhi Event Management Platform

Yazhi Events is an enterprise-grade Event Management and Operations Platform designed for premium Tamil cultural event planning, client bookings, and workforce synchronization.

This system provides a full-suite SaaS portal for administrators to manage inquiry pipelines, contract bookings, vendor assignments, team schedules, financial transactions, granular staff permissions, real-time status feeds, automated messaging alerts, and dynamic PDF document generation.

---

## 🚀 Key Modules & Architecture

The application is structured as a decoupled full-stack TypeScript application:

*   **Frontend**: Built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**. Utilizes **TanStack Query** for robust, real-time data caching, polling, and automatic invalidation.
*   **Backend**: Powered by **Node.js**, **Express**, **TypeScript**, **Helmet** security guards, **Mongoose**, and **PDFKit**.
*   **Database**: **MongoDB Atlas** (using highly optimized indexing, pre-save hooks, and aggregation pipelines).

### Core Features

1.  **Lead Management (CRM)**: Custom pipelines to track leads and inquiries, with one-click conversion of leads into active bookings.
2.  **Event Booking Engine**: Manages event schedules, venues, and status lifecycles (Inquiry, Confirmed, Completed, Cancelled).
3.  **Workforce & Team Management**: Schedules employees, defines roles, tracks availability, and prevents staff double-booking overlaps.
4.  **Vendor & Resource Ledger**: Unified directory to assign specific vendor resources to bookings.
5.  **Granular Role-Based Access Control (RBAC)**: Custom permissions matrix (view, create, edit, delete, export, approve, assign) supporting Super Admin, Admin, Manager, Coordinator, Employee, Vendor, and Client.
6.  **Real-Time Notification Engine**: Decoupled, event-driven dispatcher generating instant alerts on key events (booking modifications, CRM inquiries, team assignments, security warnings). Displays alerts in a premium, real-time polling sliding drawer.
7.  **Financial Ledger & Payments**: Integrated Razorpay API transaction tracking with support for partial payments and CSV export.
8.  **Deep Analytics Dashboard**: Aggregates business performance (revenue streams, booking distributions, lead conversion percentages) using MongoDB aggregation pipelines.
9.  **Multi-Channel CRM Messaging Dispatcher**: Direct WhatsApp, SMS, and Email notification dispatcher to keep clients and workforce instant updated.
10. **Automated PDF Generator Engine**: Dynamic PDFKit generation of official Event Invoices, Service Contracts & Agreements, and Payment Receipts.

---

## 📂 Project Structure

```text
yazhi_events/
├── client/                     # Vite React Frontend App
│   ├── public/                 # Static public assets
│   └── src/
│       ├── adminApp/           # Admin portal layouts, components, and pages
│       ├── clientApp/          # Client dashboard portal
│       ├── publicApp/          # Marketing landing site
│       └── shared/             # Global Contexts, API instances, hooks, and schemas
├── server/                     # Express Node.js Backend App
│   ├── src/
│   │   ├── config/             # DB and system connection setups
│   │   ├── controllers/        # REST route controller handlers
│   │   ├── middleware/         # Security guards, RBAC, error handlers
│   │   ├── models/             # Mongoose schemas & TypeScript interfaces
│   │   ├── routes/             # Express routing definitions
│   │   └── utils/              # Seeders, admin creators, PDF generators & messaging dispatchers
│   └── tsconfig.json
└── docker-compose.yml
```

---

## 🔌 API Endpoints Summary

### Authentication & RBAC (`/api/auth`)
*   `POST /api/auth/login` - Authenticate users and set secure HttpOnly cookies.
*   `POST /api/auth/refresh` - Rotate access/refresh tokens with replay-attack protection.
*   `POST /api/auth/logout` - Clear sessions and expire active cookies.
*   `GET /api/auth/me` - Retrieve currently logged-in user profile.
*   `PATCH /api/auth/change-password` - Modify passwords with session invalidation.

### Staff & Users (`/api/users`)
*   `GET /api/users` - Search, filter, and page system users.
*   `POST /api/users` - Create user with role inheritance.
*   `PATCH /api/users/:id/permissions` - Override specific CRUD permission matrix checkboxes.
*   `PATCH /api/users/:id/role` - Modify role levels.

### Events & Bookings (`/api/bookings`)
*   `GET /api/bookings` - Retrieve all bookings (filtered by status, payment, and date).
*   `POST /api/bookings` - Establish a new booking event.
*   `PATCH /api/bookings/:id` - Modify booking details.
*   `GET /api/bookings/my-bookings` - Retrieve customer-specific bookings (Client Portal).

### Notifications (`/api/notifications`)
*   `GET /api/notifications` - Retrieve feed alerts matching user role scope.
*   `GET /api/notifications/unread-count` - Poll count of unread items.
*   `PATCH /api/notifications/:id/read` - Mark alert as read.
*   `PATCH /api/notifications/read-all` - Bulk mark all notifications as read.
*   `DELETE /api/notifications/clear` - Flush user alert history.

### Document Generation (`/api/documents`)
*   `GET /api/documents/invoice/:id` - Stream custom PDF invoice for booking.
*   `GET /api/documents/contract/:id` - Stream legally binding service contract PDF.
*   `GET /api/documents/receipt/:id` - Stream payment transaction receipt PDF.

### CRM Communication (`/api/communication`)
*   `POST /api/communication/send-whatsapp` - Dispatch WhatsApp CRM alert to customer/vendor.
*   `POST /api/communication/send-sms` - Dispatch SMS text alert.
*   `POST /api/communication/send-email` - Dispatch email notification.

### Analytics & Reports (`/api/analytics`)
*   `GET /api/analytics/dashboard` - Get monthly earnings, booking allocations, and pipeline metrics.
*   `GET /api/analytics/export-ledgers` - Compile transactions list into CSV spreadsheet.

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
Run `npm install` inside both the client and server root folders to install dependencies:
```bash
# Install Server dependencies
cd server && npm install

# Install Client dependencies
cd ../client && npm install
```

### 2. Database Seeding & Admin Setup
Create the initial Super Admin account (`admin@yazhievents.com` / `password123`) and seed mock data:
```bash
# Inside /server
npm run seed
```

### 3. Running the Project
Launch both servers concurrently:
*   **Backend Server**: Run `npm run dev` in `/server` (Starts at `http://localhost:5000`)
*   **Frontend Client**: Run `npm run dev` in `/client` (Starts at `http://localhost:5174`)

---
