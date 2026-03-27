import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { sequelize, connectDB } from './models/index.js';
import { globalErrorHandler } from './utils/errorMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet()); // Sets various HTTP headers for security

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Apply rate limiter to auth routes only (optional, but safer)
app.use('/api/auth/login', limiter);
app.use('/api/auth/register', limiter);
app.use('/api/auth/verify-email', limiter);
app.use('/api/auth/resend-verification', limiter);
app.use('/api/auth/reset-password-request', limiter);
app.use('/api/auth/reset-password', limiter);

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Locator-X Backend is running' });
});

// Routes
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import promoRoutes from './routes/promoRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/payment', paymentRoutes);

// --- GLOBAL ERROR HANDLER (MUST BE LAST) ---
app.use(globalErrorHandler);

// Optional: Serve static files for avatar uploads (if keeping files locally)
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection and Server Start
import { initCleanupJob } from './utils/cleanupService.js';
import { initCronJobs } from './utils/cronJobs.js';

connectDB().then(async () => {
    // Sync models with database
    await sequelize.sync({ alter: true });
    
    // Initialize Jobs
    initCleanupJob();
    initCronJobs();
    console.log('Automated jobs (Cleanup & Expiry) initialized');
    
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
