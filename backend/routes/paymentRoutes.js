import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes (require login to pay)
router.post('/create-order', requireAuth, createOrder);
router.post('/verify', requireAuth, verifyPayment);

export default router;
