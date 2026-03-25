import express from 'express';
import { validatePromoCode } from '../controllers/promoController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);
router.post('/validate', validatePromoCode);

export default router;
