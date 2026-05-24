import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize, connectDB } from './models/index.js';
import { globalErrorHandler } from './utils/errorMiddleware.js';
import { initCleanupJob } from './utils/cleanupService.js';
import { initCronJobs } from './utils/cronJobs.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import promoRoutes from './routes/promoRoutes.js';
import locatorRoutes from './routes/locatorRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

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
app.use('/api/v1/auth/login', limiter);
app.use('/api/v1/auth/register', limiter);
app.use('/api/v1/auth/verify-email', limiter);
app.use('/api/v1/auth/resend-verification', limiter);
app.use('/api/v1/auth/reset-password-request', limiter);
app.use('/api/v1/auth/reset-password', limiter);

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Basic health check route
app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'ok', message: 'Locator-X Backend is running' });
});

// Routes

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/teams', teamRoutes);
app.use('/api/v1/promo', promoRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/locators', locatorRoutes);
app.use('/api/v1/ai', aiRoutes);

// --- GLOBAL ERROR HANDLER (MUST BE LAST) ---
app.use(globalErrorHandler);

// Optional: Serve static files for avatar uploads (if keeping files locally)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection and Server Start

connectDB().then(async () => {
    // Sync models with database
    await sequelize.sync();
    
    // Initialize Jobs
    initCleanupJob();
    initCronJobs();
    console.log('Automated jobs (Cleanup & Expiry) initialized');
    
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
