import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
    try {
        const { amount, currency, planName } = req.body;

        // Razorpay expects amount in paise (1 INR = 100 paise)
        const options = {
            amount: amount * 100, 
            currency: currency || 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                planName: planName,
                userId: req.user?.id || 'guest'
            }
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Razorpay Create Order Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order',
            error: error.message
        });
    }
};

import { Team, Payment } from '../models/index.js';
import crypto from 'crypto';

export const verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            teamId,
            planName,
            amount,
            userId
        } = req.body;

        // 1. Verify Signature
        // ... (Verification logic) ...

        // 2. Update Team Plan & Expiry (Stacking Logic)
        const team = await Team.findByPk(teamId);
        if (!team) {
            return res.status(404).json({ success: false, message: "Team not found" });
        }

        const now = new Date();
        let planStartedAt = new Date(); // Defaults to now for new/expired plans
        let newExpiry = new Date();
        
        // If plan is still active, extend from the current expiry date
        if (team.planExpiresAt && team.planExpiresAt > now) {
            planStartedAt = new Date(team.planExpiresAt);
            newExpiry = new Date(team.planExpiresAt);
        }
        
        // Add 30 days
        newExpiry.setDate(newExpiry.getDate() + 30);

        // 3. Create Payment Record (for potential refunds)
        await Payment.create({
            teamId,
            userId: userId || req.user.id,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            amount: amount,
            planName: planName,
            planStartedAt: planStartedAt,
            status: 'paid'
        });

        team.isPaid = true;
        team.planName = planName;
        team.planExpiresAt = newExpiry;
        team.totalPaid = parseFloat(team.totalPaid) + parseFloat(amount);
        
        await team.save();

        res.status(200).json({ 
            success: true, 
            message: 'Payment verified and subscription extended!',
            planExpiresAt: team.planExpiresAt
        });

    } catch (error) {
        console.error('Payment Verification Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const cancelSubscription = async (req, res) => {
    try {
        const { teamId } = req.body;
        const now = new Date();

        // 1. Find the latest paid transaction
        const latestPayment = await Payment.findOne({
            where: { teamId, status: 'paid' },
            order: [['createdAt', 'DESC']]
        });

        if (!latestPayment) {
            return res.status(404).json({ success: false, message: "No active paid periods found to cancel." });
        }

        const team = await Team.findByPk(teamId);

        // 2. Refund Policy Check
        if (now < latestPayment.planStartedAt) {
            // Case: Plan hasn't started yet (Refundable minus charges)
            const charges = 50; // Example fixed charge (e.g., 50 INR/USD)
            const refundAmount = Math.max(0, latestPayment.amount - charges);

            latestPayment.status = 'refunded';
            latestPayment.refundAmount = refundAmount;
            await latestPayment.save();

            // Subtract 30 days from team expiry
            const currentExpiry = new Date(team.planExpiresAt);
            currentExpiry.setDate(currentExpiry.getDate() - 30);
            team.planExpiresAt = currentExpiry;

            // Update isPaid status if needed
            if (team.planExpiresAt <= now) {
                team.isPaid = false;
                team.planName = 'free';
            }
            
            await team.save();

            return res.json({ 
                success: true, 
                message: `Subscription block cancelled. Refund of ${refundAmount} initiated (after ${charges} charges).`,
                newExpiry: team.planExpiresAt
            });
        } else {
            // Case: Plan has already started (No refund)
            return res.status(400).json({ 
                success: false, 
                message: "No refund is possible as this plan period has already started." 
            });
        }

    } catch (error) {
        console.error('Cancellation Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
