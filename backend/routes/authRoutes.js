import express from 'express';
import {
    register,
    login,
    verifyEmail,
    resendVerificationEmailController as resendVerificationEmail,
    resetPasswordRequest,
    resetPasswordConfirm,
    getSession,
    googleLogin,
    googleCallback,
    githubLogin,
    githubCallback
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/reset-password-request', resetPasswordRequest);
router.post('/reset-password', resetPasswordConfirm);

// OAuth Routes
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);
router.get('/github', githubLogin);
router.get('/github/callback', githubCallback);

// Protected route to get user session (replaces supabase.auth.getSession)
router.get('/session', requireAuth, getSession);

export default router;
