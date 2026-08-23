import express from 'express';
import { createOrder, verifyPayment, cancelSubscription } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes (require login to pay/cancel)
router.post('/create-order', requireAuth, createOrder);
router.post('/verify', requireAuth, verifyPayment);
router.post('/cancel', requireAuth, cancelSubscription);

export default router;
