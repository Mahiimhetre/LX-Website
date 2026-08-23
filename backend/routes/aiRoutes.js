import express from 'express';
import rateLimit from 'express-rate-limit';
import { handleChat } from '../controllers/aiController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * AI Service Rate Limiter
 * Restricts AI chat invocations to maximum 20 requests per 15-minute window per IP.
 * Prevents automated bot scraping, API key abuse, and Gemini quota exhaustion.
 */
const aiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15-minute sliding window
    max: 20, // Max 20 requests per window per IP
    standardHeaders: true, // Return RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    message: {
        success: false,
        message: 'AI chat request limit exceeded. Please wait a few minutes before trying again.'
    }
});

/**
 * @route   POST /api/v1/ai/chat
 * @desc    Protected AI assistant endpoint for generating test locators and automation advice
 * @access  Private (Requires valid JWT Bearer token + Rate Limiting)
 * 
 * Middleware Execution Pipeline:
 * 1. requireAuth    -> Verifies JWT token in Authorization header and populates req.user
 * 2. aiRateLimiter  -> Enforces 20 requests per 15-minute window rate limit per client
 * 3. handleChat     -> Executes AI generation logic via Google Gemini SDK on backend
 */
router.post('/chat', requireAuth, aiRateLimiter, handleChat);

export default router;
