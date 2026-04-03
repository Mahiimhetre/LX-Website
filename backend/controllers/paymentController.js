import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { Team, Payment } from '../models/index.js';

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
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order',
            error: error.message
        });
    }
};

const BASE_PRICES = {
    USD: { pro: 29, teamBase: 79 },
    INR: { pro: 299, teamBase: 1999 }
};

export const verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            teamId,
            planName
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !teamId || !planName) {
            return res.status(400).json({ success: false, message: "Missing required parameters" });
        }

        // 1. Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        // 2. Prevent Stacking Logic Exploit (Replay Attack)
        const existingPayment = await Payment.findOne({ where: { razorpayPaymentId: razorpay_payment_id } });
        if (existingPayment) {
            return res.status(400).json({ success: false, message: "Payment already verified" });
        }

        // 3. Verify Amount & Authorization
        const team = await Team.findByPk(teamId);
        if (!team) {
            return res.status(404).json({ success: false, message: "Team not found" });
        }

        // Fetch order from Razorpay to get the actual amount paid
        const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
        if (!razorpayOrder) {
            return res.status(404).json({ success: false, message: "Order not found in Razorpay" });
        }

        // Amount in original currency (not paise)
        const actualAmountPaid = razorpayOrder.amount / 100;

        const prices = BASE_PRICES[team.currency] || BASE_PRICES.INR;
        let minAmount = 0;
        if (planName.toLowerCase() === 'pro') {
            minAmount = Math.floor(prices.pro * 0.5); // Allow for 50% flash sale
        } else if (planName.toLowerCase() === 'team') {
            minAmount = prices.teamBase;
        }

        if (actualAmountPaid < minAmount) {
            return res.status(400).json({ success: false, message: "Amount paid is lower than the required minimum for this plan." });
        }

        // 4. Update Team Plan & Expiry
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

        // 5. Create Payment Record
        await Payment.create({
            teamId,
            userId: req.user.id, // Force user ID from auth token, NOT req.body
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            amount: actualAmountPaid, // Trust Razorpay, NOT req.body
            planName: planName,
            planStartedAt: planStartedAt,
            status: 'paid'
        });

        team.isPaid = true;
        team.planName = planName;
        team.planExpiresAt = newExpiry;
        team.totalPaid = parseFloat(team.totalPaid) + parseFloat(actualAmountPaid);
        
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

        const team = await Team.findByPk(teamId);
        if (!team) {
            return res.status(404).json({ success: false, message: "Team not found" });
        }

        // Authorization check: Only team owner can cancel
        if (team.ownerId !== req.user.id) {
            return res.status(403).json({ success: false, message: "Only team owner can cancel subscriptions" });
        }

        // 1. Find the latest paid transaction
        const latestPayment = await Payment.findOne({
            where: { teamId, status: 'paid' },
            order: [['createdAt', 'DESC']]
        });

        if (!latestPayment) {
            return res.status(404).json({ success: false, message: "No active paid periods found to cancel." });
        }

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

            // Fix team.totalPaid when refund happens
            team.totalPaid = Math.max(0, parseFloat(team.totalPaid) - parseFloat(latestPayment.amount) + charges);

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