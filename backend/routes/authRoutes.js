import express from 'express';
import rateLimit from 'express-rate-limit';
import {
    register,
    login,
    logout,
    verifyEmail,
    resendVerificationEmailController as resendVerificationEmail,
    resetPasswordRequest,
    resetPasswordConfirm,
    getSession,
    googleLogin,
    googleCallback,
    githubLogin,
    githubCallback,
    mockSendVerificationEmail,
    mockSendPasswordResetEmail,
    getCaptcha
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin } from '../middleware/validationMiddleware.js';

const router = express.Router();

const loginRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: { success: false, message: 'Incorrect email or password' },
    standardHeaders: true,
    legacyHeaders: false
});

router.get('/captcha', getCaptcha);
router.post('/register', validateRegister, register);
router.post('/login', loginRateLimiter, validateLogin, login);
router.post('/logout', requireAuth, logout);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/reset-password-request', resetPasswordRequest);
router.post('/reset-password', resetPasswordConfirm);

// OAuth Routes
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);
router.get('/github', githubLogin);
router.get('/github/callback', githubCallback);

// Mock email testing endpoints (Restricted to development/testing environments)
if (process.env.NODE_ENV !== 'production') {
    router.post('/mock-send-verification', mockSendVerificationEmail);
    router.post('/mock-send-password-reset', mockSendPasswordResetEmail);
}

// Protected route to get user session (replaces supabase.auth.getSession)
router.get('/session', requireAuth, getSession);

export default router;
