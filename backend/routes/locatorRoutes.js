import express from 'express';
import { createLocator, getUserLocators, deleteLocator } from '../controllers/locatorController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getUserLocators);
router.post('/', createLocator);
router.delete('/:id', deleteLocator);

export default router;
