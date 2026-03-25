# 🚀 LocatorX

A modern, high-performance platform for advanced localization and management. Built with a decoupled architecture featuring a **React** frontend and an **Express/MySQL** backend.

---

## 🏛️ Architecture Overview

LocatorX uses a decoupled frontend and backend to ensure scalability and maintainability.

- **Frontend**: A lightning-fast Single Page Application (SPA) powered by Vite, React, and Tailwind CSS.
- **Backend**: A robust RESTful API built with Express.js, utilizing Sequelize ORM for MySQL database management.
- **Communication**: Secure API calls via Axios with JWT authentication.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: `React 18` + `Vite` (Ultra-fast build tool)
- **Styling**: `Tailwind CSS` (Utility-first CSS)
- **UI Components**: `Shadcn UI` (Accessible Radix-based components)
- **Querying**: `TanStack Query` (React Query)
- **Icons**: `Lucide React`
- **Charts**: `Recharts`
- **Forms**: `React Hook Form` + `Zod` (Type-safe validation)
- **Auth**: `JWT` + `Supabase` (Legacy migration in progress)

### **Backend**
- **Server**: `Express.js`
- **Database**: `MySQL`
- **ORM**: `Sequelize`
- **Security**: `Helmet`, `CORS`, `Express Rate Limit`
- **Scheduling**: `node-cron` (Automated cleanup and expiry tasks)
- **Payments**: `Razorpay` Integration
- **Emails**: `Nodemailer` + `React Email` (Beautiful HTML templates)
- **Validation**: `Joi` / `Zod` (Request validation)

---

## 📂 Project Structure

```text
LocatorX-Website(react)/
├── .env                  # Root environment variables
├── backend/              # Express Backend Source
│   ├── config/           # Database & App configurations
│   ├── controllers/      # Business logic
│   ├── models/           # Sequelize (Database) Models
│   ├── routes/           # Express Route definitions
│   ├── utils/            # Helper functions (Cron, Cleanup, Middleware)
│   ├── package.json      # Backend dependencies
│   └── server.js         # Entry point
├── src/                  # React Frontend Source
│   ├── api/              # Axios API clients
│   ├── components/       # Reusable UI components (Shadcn)
│   ├── pages/            # Page-level components
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # Authentication & Global State
│   ├── services/         # External API integrations
│   └── main.jsx          # Entry point
├── package.json          # Root dependencies
└── vite.config.js        # Vite configuration
```

---

## ⚙️ Quick Start

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MySQL** (Running instance)

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DB_HOST=localhost
DB_USER=your_user
DB_PASS=your_password
DB_NAME=locatorx_db
JWT_SECRET=your_super_secret_key
RAZORPAY_KEY_ID=your_razorpay_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```
Run the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
# Return to root
npm install
```
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=... (for legacy features)
VITE_SUPABASE_ANON_KEY=...
```
Run the frontend:
```bash
npm run dev
```

---

## 📧 Features

### **🔐 Advanced Authentication**
Secure login/registration system with JWT-based session management, password hashing (Bcrypt), and automated email verification.

### **💳 Payment Integration**
Seamless subscription and payment flow integrated with **Razorpay**, including automatic plan expiry handling via server-side cron jobs.

### **👥 Team Management**
Collaborative features allowing users to create teams, invite members, and manage permissions.

### **🏢 Playground**
An interactive environment for testing localization and dynamic components in real-time.

### **🔍 Persistent Search**
Unified, glassmorphism-inspired search interface with smooth transitions and persistent state.

---

## 🛠️ Automated Tasks
The backend includes automated jobs for maintaining system health:
- **Daily Cleanup**: Removes orphaned files and temporary data.
- **Expiry Check**: Automatically updates subscription statuses on plan expiration.

---

## 📜 License
This project is private and proprietary.
