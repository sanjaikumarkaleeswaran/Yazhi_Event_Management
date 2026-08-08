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
13. Secure Enterprise Client Portal for client-owned events, documents, notifications, and messages

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

### Enterprise Communication Center (`/api/communications`)
- `GET /api/communications`
- `GET /api/communications/:id`
- `POST /api/communications/email`
- `POST /api/communications/sms`
- `POST /api/communications/whatsapp`
- `POST /api/communications/bulk`
- `POST /api/communications/:id/resend`
- `DELETE /api/communications/:id`

Legacy notification aliases remain available under `/api/communication`:
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

### Enterprise Client Portal (`/api/client`)
- `GET /api/client/dashboard`
- `GET /api/client/bookings`
- `GET /api/client/bookings/:id`
- `GET /api/client/calendar`
- `GET /api/client/documents`
- `POST /api/client/documents`
- `DELETE /api/client/documents/:id`
- `GET /api/client/notifications`
- `PATCH /api/client/notifications/:id/read`
- `PATCH /api/client/notifications/read-all`
- `GET /api/client/messages`
- `POST /api/client/messages`
- `GET /api/client/profile`
- `PATCH /api/client/profile`
- `GET /api/client/settings`
- `PATCH /api/client/settings`

Client portal requests require the existing JWT HTTP-only cookie authentication and
are scoped to the authenticated user's linked Client profile. The server derives
ownership from the session and does not trust client IDs supplied by the browser.

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

# Optional communication providers. Missing credentials use console simulation mode.
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
WHATSAPP_BUSINESS_NUMBER=
WHATSAPP_API_TOKEN=
WHATSAPP_WEBHOOK_URL=
BUSINESS_EMAIL=hello@yazhievents.com

# Cloudinary document uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
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
- A secure Client Portal at `/client` with dashboard, events, calendar, documents,
	notifications, messages, profile, and preferences
- Client-safe booking serializers and ownership middleware under `/api/client`
- Cloudinary-backed client document uploads with ownership and file validation

## 🔔 Module 17 — Enterprise Client Portal (completed)

Module 17 adds a separate premium client experience while reusing the existing
authentication, Client and Booking models, Notification Center, Communication
Center, Cloudinary configuration, and React Query infrastructure.

- Client routes: `/client/login`, `/client/forgot-password`, `/client/reset-password`,
	`/client`, `/client/bookings`, `/client/calendar`, `/client/documents`,
	`/client/notifications`, `/client/messages`, `/client/profile`, and `/client/settings`
- Client ownership is resolved from `User.clientId`, with an email fallback for
	legacy records, then enforced on bookings, documents, notifications, and messages
- Booking responses are transformed into client-safe DTOs and omit internal notes,
	audit data, private permissions, system secrets, and private vendor information
- Document uploads support JPEG, PNG, WebP, and PDF files up to 10 MB through the
	existing Cloudinary account
- React Query mutations invalidate the relevant client cache after document, message,
	profile, settings, and notification changes

See [COMPLETION_REPORT_MODULE_17.md](COMPLETION_REPORT_MODULE_17.md) for the full
architecture, security notes, API list, files, and verification status.

The new Module 17 files compile cleanly in focused checks. Full repository builds
remain blocked by pre-existing unrelated TypeScript errors in existing blog/admin/
public modules; see the completion report for details.

## 🔔 Module 15 — Enterprise Communication Center (completed)

Module 15 adds a persisted, multi-channel communication workspace for email, SMS,
and WhatsApp operations.

- MongoDB communication history with recipient, channel, template, status, delivery,
	related booking/client/inquiry, sender, and error fields
- Server-side search, filtering, sorting, pagination, CSV export support, bulk send,
	retry, and deletion APIs
- Nodemailer SMTP, Twilio SMS, and WhatsApp Business API integrations
- Console simulation fallback when provider credentials are unavailable, so local
	development and automated workflows do not crash
- Automatic communication dispatch for booking creation/updates/cancellations,
	inquiry creation, and completed manual payments
- Admin UI at `/admin/communications` with KPI cards, responsive data table,
	compose drawer, delivery timeline details, retry actions, loading skeletons,
	empty states, and React Query cache invalidation
- Module 13 Settings support for SMTP, WhatsApp, Twilio, email enablement, SMS
	enablement, WhatsApp enablement, and dry-run configuration

Relevant files:

- `server/src/models/Communication.ts`
- `server/src/utils/communicationService.ts`
- `server/src/controllers/communication.controller.ts`
- `server/src/routes/communication.routes.ts`
- `client/src/adminApp/pages/Communications.tsx`
- `client/src/adminApp/hooks/useCommunications.ts`

Provider settings are configured through the authenticated admin Settings page.
When credentials are missing, messages are recorded and simulated through the
console fallback instead of failing the application request.

See the full completion report: `COMPLETION_REPORT_MODULE_15.md` (root)

---

## 🔔 Module 14 — Enterprise Blog CMS (completed)

This release adds a full-featured, production-ready Blog CMS for the Admin Portal and the Public Website with SEO, media, comments, and editorial tooling.

- New backend models: `BlogCategory`, `BlogComment` (Mongoose)
- Full blog APIs: public listing, article detail (by slug or id), admin CRUD, publish/schedule/duplicate, soft delete/restore, featured, stats and CSV reports
- Category & comment management APIs and admin moderation
- Cloudinary-backed media uploads (upload/replace/delete) with audit logging
- Admin editor improvements: autosave (30s), unsaved-changes warning, markdown mode, drag & drop image upload (Cloudinary), inline `<img>` insertion, SEO audit panel, OpenGraph/Twitter preview
- Public website: blog listing, article detail with structured data (JSON-LD), comments submission and listing

Relevant files added/changed:
- `server/src/models/BlogCategory.ts`
- `server/src/models/BlogComment.ts`
- `server/src/controllers/blogCategory.controller.ts`
- `server/src/controllers/blogComment.controller.ts`
- `server/src/controllers/upload.controller.ts`
- `server/src/routes/blogCategory.routes.ts`
- `server/src/routes/blogComment.routes.ts`
- `server/src/routes/upload.routes.ts`
- `server/src/utils/cloudinary.ts`
- `client/src/adminApp/pages/BlogEditor.tsx` (editor + autosave + drag/drop upload)
- `client/src/publicApp/components/CommentArea.tsx`
- `client/src/adminApp/pages/BlogComments.tsx`
- `client/src/shared/api/upload.ts`

New/updated API endpoints (summary):
- `GET /api/blog` — listing (search, filter, pagination)
- `GET /api/blog/slug/:slug` — article detail (increments views)
- `POST /api/blog` — create (admin)
- `PUT /api/blog/:id` — update (admin)
- `DELETE /api/blog/:id` — soft delete (admin)
- `DELETE /api/blog/:id/permanent` — permanent delete (admin)
- `POST /api/blog/:id/duplicate` — duplicate
- `POST /api/blog/:id/restore` — restore soft-deleted
- `POST /api/blog/:id/like` — likes
- `POST /api/blog/:id/share` — shares
- `GET /api/blog/admin` — admin listing
- `GET /api/blog/admin/stats` — stats
- `GET /api/blog/admin/reports` — CSV dataset
- `GET /api/blog/categories` — categories
- `POST /api/blog/categories` — create category (admin)
- `PUT /api/blog/categories/:id` — update category
- `DELETE /api/blog/categories/:id` — delete category
- `POST /api/blog/comments` — submit comment (public)
- `GET /api/blog/comments` — admin comments list
- `PATCH /api/blog/comments/:id` — moderate (approve/reject)
- `DELETE /api/blog/comments/:id` — delete comment
- `POST /api/blog/upload` — upload image (admin)
- `POST /api/blog/upload/replace` — replace image
- `DELETE /api/blog/upload/:publicId` — delete image

Cloudinary environment variables (server `.env`):
```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Notes:
- Run `npm install` in both `server` and `client` after pulling changes (new deps: `cloudinary` on server, `marked` on client).
- Upload endpoints require authenticated admin access.
- For production, consider adding HTML sanitization for stored content and a block-based WYSIWYG editor (TipTap) in future work.

See the full completion report: `COMPLETION_REPORT_MODULE_14.md` (root)

