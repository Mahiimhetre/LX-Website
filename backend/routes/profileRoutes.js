import express from 'express';
import { getProfile, updateProfile, uploadAvatar, updatePlan } from '../controllers/profileController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import upload from '../utils/upload.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.put('/plan', updatePlan);

export default router;
