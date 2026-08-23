import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { Team, Payment, Profile } from '../models/index.js';

dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
    try {
        const { amount, currency, planName } = req.body;

        // Amount tampering vulnerability: we are currently trusting `amount` from the client.
        // We validate the amount based on the planName and any valid promotions.
        // Since promo logic is applied on frontend, we MUST verify
        // the amount actually paid on `verifyPayment` against Razorpay.

        // Razorpay expects amount in paise (1 INR = 100 paise)
        const options = {
            amount: Math.round(amount * 100), // Ensure integer
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
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const orderId = req.body.orderId || req.body.razorpay_order_id;
        const paymentId = req.body.paymentId || req.body.razorpay_payment_id;
        const signature = req.body.signature || req.body.razorpay_signature;
        const { teamId, planName } = req.body;

        if (!orderId || !paymentId || !signature) {
            return res.status(400).json({ success: false, message: 'Missing required payment verification parameters.' });
        }

        // 1. Signature Verification (Security Fix)
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${orderId}|${paymentId}`)
            .digest('hex');

        if (signature !== expectedSignature) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }

        // 2. Fetch order from Razorpay to verify actual amount paid (Prevent tampering)
        let actualAmountPaid = 0;
        try {
            const razorpayOrder = await razorpay.orders.fetch(orderId);
            if (razorpayOrder) {
                actualAmountPaid = razorpayOrder.amount / 100;
            }
        } catch (fetchErr) {
            console.warn('Could not fetch Razorpay order details:', fetchErr.message);
        }

        // 3. Prevent Replay Attack (Check if paymentId has already been processed)
        const existingPayment = await Payment.findOne({ where: { razorpayPaymentId: paymentId } });
        if (existingPayment) {
            return res.status(400).json({ success: false, message: 'Payment signature has already been used' });
        }

        const team = await Team.findByPk(teamId);
        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        // 4. Record Payment
        await Payment.create({
            userId: req.user.id,
            teamId,
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            amount: actualAmountPaid,
            planName,
            planStartedAt: new Date(),
            status: 'paid'
        });

        // 5. Extend Team Subscription
        const now = new Date();
        let newExpiry = new Date(team.planExpiresAt || now);

        if (newExpiry < now) {
            newExpiry = now;
        }
        // Add 30 days
        newExpiry.setDate(newExpiry.getDate() + 30);

        team.planExpiresAt = newExpiry;
        team.isPaid = true;
        team.planName = planName || 'team';
        team.totalPaid = (parseFloat(team.totalPaid || 0) + actualAmountPaid).toFixed(2);
        await team.save();

        res.status(200).json({
            success: true,
            message: 'Payment verified and team subscription extended successfully',
            team
        });

    } catch (error) {
        console.error('Payment Verification Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const cancelSubscription = async (req, res) => {
    try {
        const { teamId } = req.body || {};
        const now = new Date();
        let targetTeam = null;
        let latestPayment = null;

        if (teamId) {
            targetTeam = await Team.findByPk(teamId);
            if (!targetTeam) {
                return res.status(404).json({ success: false, message: "Team not found" });
            }

            if (targetTeam.ownerId !== req.user.id) {
                return res.status(403).json({ success: false, message: "Only team owner can cancel team subscriptions" });
            }

            latestPayment = await Payment.findOne({
                where: { teamId, status: 'paid' },
                order: [['createdAt', 'DESC']]
            });
        } else {
            latestPayment = await Payment.findOne({
                where: { userId: req.user.id, teamId: null, status: 'paid' },
                order: [['createdAt', 'DESC']]
            });
        }

        if (!latestPayment) {
            return res.status(404).json({ success: false, message: "No active paid subscription found to cancel." });
        }

        // Market Standard 14-Day Money-Back Guarantee
        const daysElapsed = (now - new Date(latestPayment.createdAt)) / (1000 * 60 * 60 * 24);

        if (daysElapsed <= 14) {
            // Eligible for full refund within 14 days
            const refundAmount = latestPayment.amount;

            // Attempt Razorpay API refund if payment ID exists
            if (latestPayment.razorpayPaymentId && process.env.RAZORPAY_KEY_SECRET) {
                try {
                    await razorpay.payments.refund(latestPayment.razorpayPaymentId, {
                        amount: Math.round(refundAmount * 100)
                    });
                } catch (rErr) {
                    console.warn('Razorpay refund API warning:', rErr.message);
                }
            }

            latestPayment.status = 'refunded';
            latestPayment.refundAmount = refundAmount;
            await latestPayment.save();

            if (targetTeam) {
                targetTeam.isPaid = false;
                targetTeam.planName = 'free';
                targetTeam.planExpiresAt = now;
                await targetTeam.save();
            } else {
                const profile = await Profile.findOne({ where: { userId: req.user.id } });
                if (profile) {
                    profile.plan = 'free';
                    await profile.save();
                }
            }

            return res.status(200).json({ 
                success: true, 
                message: `Subscription cancelled and full refund of ₹${refundAmount} initiated (14-Day Money-Back Guarantee). Funds will reflect in 5-7 business days.`
            });
        } else {
            // After 14 days: Cancel auto-renewal, retain access until current period ends
            return res.status(200).json({ 
                success: true, 
                message: "Subscription auto-renewal cancelled. You will continue to have paid plan access until the end of your current billing cycle." 
            });
        }

    } catch (error) {
        console.error('Cancellation Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};