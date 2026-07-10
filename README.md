# Yazhi Event Management

Premium Tamil cultural event management platform. 

## Project Architecture (Phase 1 MVP)

This is a full-stack MERN application built with modern tooling:
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, TanStack Query, React Hook Form, Zod.
- **Backend**: Node.js, Express, TypeScript, Mongoose.
- **Database**: MongoDB Atlas.

### Folder Structure
```
d:\yazhi_events
├── client/          # Vite React application
│   ├── public/      # Static assets (sitemap, robots)
│   └── src/         # React source code (components, hooks, pages, api)
├── server/          # Node.js/Express backend
│   └── src/         # API source code (controllers, routes, models, middleware)
└── docker-compose.yml
```

## Available API Endpoints

- `GET /api/gallery` - Retrieve gallery images (supports `?eventType=` filter)
- `GET /api/testimonials` - Retrieve approved client testimonials
- `GET /api/packages` - Retrieve pricing packages
- `GET /api/team` - Retrieve team members
- `POST /api/inquiries` - Submit a new booking inquiry (Rate limited, validation enabled)
- `GET /health` - Server health check

## Environment Variables

### Server (`server/.env`)
```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/yazhi
CLIENT_URL=http://localhost:5174
```

### Client (`client/.env`)
```
VITE_API_URL=http://localhost:5000/api
```

## Build & Run Instructions

### 1. Installation
Run `npm install` in both the `client/` and `server/` directories.

### 2. Development
Start both servers simultaneously in two terminal windows:
- **Backend**: `cd server && npm run dev` (Runs on port 5000)
- **Frontend**: `cd client && npm run dev` (Runs on port 5174)

### 3. Production Build
- **Backend**: `cd server && npm run build` (Compiles TypeScript to `dist/`)
- **Frontend**: `cd client && npm run build` (Compiles Vite React to `dist/`)

## Deployment Guide

This project is prepared for modern PaaS deployment.

### Frontend -> Vercel
1. Connect your GitHub repository to Vercel.
2. Select the `client` directory as the Root Directory.
3. Vercel will automatically detect Vite and configure the build settings.
4. Add Environment Variable: `VITE_API_URL=https://your-render-url.onrender.com/api`

### Backend -> Render
1. Connect your GitHub repository to Render (Web Service).
2. Set the Root Directory to `server`.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start` (Make sure to add `"start": "node dist/server.js"` to your server package.json)
5. Add Environment Variables: `MONGO_URI`, `CLIENT_URL=https://your-vercel-url.vercel.app`, `PORT=5000`.

### Database -> MongoDB Atlas
1. Ensure the IP Access List in Atlas is set to allow connections from Render (or `0.0.0.0/0` for universal web service access).

## Recommended Phase 2 Roadmap
After collecting feedback on this MVP, Phase 2 will introduce:
- Full Booking System & Calendar
- Admin & Client Dashboards
- Razorpay Payments
- WhatsApp Business Integration
- Multi-language toggle (English/Tamil)
