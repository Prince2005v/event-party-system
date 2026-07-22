# Eventify-Planner 🚀

Eventify-Planner is a full-stack, SaaS-grade event planning and reservation platform built with **React 18**, **Vite**, **TypeScript**, **Express 5**, and **Drizzle ORM** (PostgreSQL).

---

## 🌟 Key Features

- **Modern Glassmorphism UI:** Built with TailwindCSS, shadcn/ui components, and Framer Motion micro-animations.
- **Marketplace & Exploration:** Real-time debounced search, category pill filtering, max price slider, ratings, and Quick View modal.
- **Cart & Selection:** Persistent cart storage for guests (UUID session key) and logged-in users.
- **Checkout & Coupon System:** Subtotal, GST (18%) calculations, discount promo codes (`EVENTIFY10`, `WELCOME20`, `VIP30`), and reservation confirmation.
- **Celebration Success Screen:** Animated checkmark, `react-canvas-confetti` fireworks, unique Booking Reference ID (e.g. `EVT-2026-83JK92`), SVG QR verification code, and print receipt feature.
- **SaaS Analytics Dashboard:** 6 KPI metrics cards, Recharts spending area chart, category pie chart distribution, live reservation management, and booking cancellation.
- **Authentication:** Dual support for Passport Replit Auth & local session authentication with password hashing (`crypto.pbkdf2`).
- **REST API:** Standardized JSON envelope responses (`{ success, message, data, errors }`).

---

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, Wouter, TanStack React Query, TailwindCSS, shadcn/ui, Framer Motion, Lucide Icons, Recharts, react-canvas-confetti.
- **Backend:** Express 5, Node.js, TypeScript, Drizzle ORM, PostgreSQL (`pg`), Express Session, Passport.
- **Tooling & Containers:** Docker, Docker Compose, `tsx`, `drizzle-kit`.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v20+)
- PostgreSQL or Docker installed

### 2. Installation
```bash
git clone https://github.com/your-username/Eventify-Planner.git
cd Eventify-Planner
npm install
```

### 3. Environment Setup
Create a `.env` file from the template:
```bash
cp .env.example .env
```

### 4. Database Setup & Push
```bash
npm run db:push
```

### 5. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5000` in your browser.

---

## 🐳 Docker Deployment

To run the entire app along with PostgreSQL via Docker Compose:
```bash
docker-compose up --build
```
Access the application at `http://localhost:5000`.

---

## ☁️ Deployment Instructions

### 1. Neon PostgreSQL Database
1. Create a free serverless Postgres database on [Neon.tech](https://neon.tech).
2. Copy your connection string `postgres://user:password@ep-xyz.neon.tech/neondb?sslmode=require`.
3. Set `DATABASE_URL` in your deployment environment variables.

### 2. Render Deployment
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your Git repository.
3. Set Environment to **Node**.
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. Add environment variables: `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV=production`.

### 3. Railway Deployment
1. Create a project on [Railway.app](https://railway.app).
2. Select **Deploy from GitHub repo**.
3. Railway will automatically detect the `Dockerfile`.
4. Add `DATABASE_URL` and `SESSION_SECRET` in variables.

### 4. Vercel / Netlify (Frontend Only Mode)
If deploying the Vite bundle to Vercel:
1. Framework Preset: **Vite**
2. Build Command: `npm run build`
3. Output Directory: `dist/public`

---

## 🧪 Verification & Build Commands

```bash
# Typecheck TypeScript (Zero errors)
npm run check

# Build Production Bundle (Vite client + Express server)
npm run build

# Start Production Bundle
npm start
```

---

## 📄 License
MIT © 2026 Eventify Inc.
