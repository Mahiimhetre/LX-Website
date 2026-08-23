import { Profile, User, Payment } from '../models/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { sendPlanChangedEmail } from '../utils/emailService.jsx';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

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

        if (name !== undefined) {
            // Simple XSS protection - strip HTML tags
            profile.name = name.replace(/<\/?[^>]+(>|$)/g, "");
        }
        await profile.save();

        res.json({ success: true, message: 'Profile updated', profile });
    } catch (error) {
        console.error('updateProfile error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Helper to delete old avatar file from disk
const deleteOldAvatarFile = (avatarUrl) => {
    if (avatarUrl && avatarUrl.startsWith('/uploads/')) {
        try {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const oldFilePath = path.join(__dirname, '..', avatarUrl);
            
            if (fs.existsSync(oldFilePath)) {
                fs.unlink(oldFilePath, (err) => {
                    if (err) console.warn(`Could not delete old avatar: ${oldFilePath}`, err.message);
                });
            }
        } catch (err) {
            console.error('Error during old avatar cleanup:', err);
        }
    }
};

export const uploadAvatar = async (req, res) => {
    try {
        const profile = await Profile.findOne({ where: { userId: req.user.id } });
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        const oldAvatarUrl = profile.avatarUrl;

        // Check if removing avatar
        if (req.body && req.body.remove === 'true') {
            deleteOldAvatarFile(oldAvatarUrl);
            profile.avatarUrl = null;
            await profile.save();
            return res.json({ success: true, message: 'Avatar removed successfully', avatarUrl: null });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        // Delete old avatar if it exists before saving new one
        deleteOldAvatarFile(oldAvatarUrl);
        
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        profile.avatarUrl = avatarUrl;
        await profile.save();

        res.json({ success: true, message: 'Avatar uploaded successfully', avatarUrl });
    } catch (error) {
        console.error('uploadAvatar error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * Secure Plan Upgrade Endpoint
 * Verifies Razorpay payment signature & prevents replay attacks before updating profile plan.
 */
export const upgradePlan = async (req, res) => {
    try {
        const orderId = req.body.orderId || req.body.razorpay_order_id;
        const paymentId = req.body.paymentId || req.body.razorpay_payment_id;
        const signature = req.body.signature || req.body.razorpay_signature;
        const { plan } = req.body;

        if (!plan || !paymentId || !orderId || !signature) {
            return res.status(400).json({ success: false, message: 'Missing required payment verification details' });
        }

        // 1. Verify Razorpay Signature
        const body = orderId + '|' + paymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== signature) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }

        // 2. Prevent Replay Attacks
        const existingPayment = await Payment.findOne({ where: { razorpayPaymentId: paymentId } });
        if (existingPayment) {
            return res.status(400).json({ success: false, message: 'Payment already verified and processed' });
        }

        // 3. Fetch Razorpay Order to get actual amount
        let actualAmountPaid = 0;
        try {
            const razorpayOrder = await razorpay.orders.fetch(orderId);
            if (razorpayOrder) {
                actualAmountPaid = razorpayOrder.amount / 100;
            }
        } catch (fetchErr) {
            console.warn('Could not fetch Razorpay order details:', fetchErr.message);
        }

        // 4. Update Profile Plan
        const profile = await Profile.findOne({ where: { userId: req.user.id } });
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        // 5. Record Payment
        await Payment.create({
            userId: req.user.id,
            teamId: null,
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            amount: actualAmountPaid,
            planName: plan,
            planStartedAt: new Date(),
            status: 'paid'
        });

        const oldPlan = profile.plan;
        profile.plan = plan;
        await profile.save();

        if (oldPlan !== plan) {
            const user = await User.findByPk(req.user.id);
            if (user) {
                await sendPlanChangedEmail(user.email, profile.name || 'User', plan);
            }
        }

        res.json({ success: true, message: `Plan upgraded to ${plan} successfully`, profile });
    } catch (error) {
        console.error('upgradePlan error:', error);
        res.status(500).json({ success: false, message: 'Failed to process plan upgrade' });
    }
};
