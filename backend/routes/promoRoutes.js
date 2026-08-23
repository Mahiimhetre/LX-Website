import express from 'express';
import { validatePromoCode, generateTrialOffer } from '../controllers/promoController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);
router.post('/validate', validatePromoCode);
router.post('/generate-trial-offer', generateTrialOffer);

export default router;

