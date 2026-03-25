import { Profile, User } from '../models/index.js';

export const getProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ where: { userId: req.user.id } });
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }
        res.json({ success: true, profile });
    } catch (error) {
        console.error('getProfile error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        const profile = await Profile.findOne({ where: { userId: req.user.id } });
        
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        if (name !== undefined) profile.name = name;
        await profile.save();

        res.json({ success: true, message: 'Profile updated', profile });
    } catch (error) {
        console.error('updateProfile error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        
        const profile = await Profile.findOne({ where: { userId: req.user.id } });
        profile.avatarUrl = avatarUrl;
        await profile.save();

        res.json({ success: true, message: 'Avatar uploaded successfully', avatarUrl });
    } catch (error) {
        console.error('uploadAvatar error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

import { sendPlanChangedEmail } from '../utils/emailService.js';

export const updatePlan = async (req, res) => {
    try {
        const { plan } = req.body;
        const profile = await Profile.findOne({ where: { userId: req.user.id } });
        
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        const oldPlan = profile.plan;
        profile.plan = plan;
        await profile.save();

        if (oldPlan !== plan) {
            const user = await User.findByPk(req.user.id);
            await sendPlanChangedEmail(user.email, plan);
        }

        res.json({ success: true, message: `Plan updated to ${plan}`, profile });
    } catch (error) {
        console.error('updatePlan error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
