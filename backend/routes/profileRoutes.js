import express from 'express';
import { getProfile, updateProfile, uploadAvatar, upgradePlan } from '../controllers/profileController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import upload from '../utils/upload.js';
import multer from 'multer';

const router = express.Router();

router.use(requireAuth);

router.get('/', getProfile);
router.put('/', updateProfile);

// Custom Multer error handling wrapper
router.post('/avatar', (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'Image size must be less than 5MB' });
            }
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
}, uploadAvatar);

router.post('/upgrade-plan', upgradePlan);

export default router;
