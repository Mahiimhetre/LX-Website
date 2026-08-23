import { PromoCode } from '../models/index.js';

export const validatePromoCode = async (req, res) => {
    try {
        const { code, plan, planName } = req.body;
        const targetPlan = plan || planName;
        
        if (!code) {
            return res.status(400).json({ success: false, message: 'Promo code is required' });
        }

        const promo = await PromoCode.findOne({ where: { code: code.toUpperCase() } });

        if (!promo) {
            return res.status(404).json({ success: false, message: 'Invalid promo code' });
        }

        if (!promo.isActive) {
            return res.status(400).json({ success: false, message: 'Promo code is no longer active' });
        }

        if (promo.validUntil && new Date() > new Date(promo.validUntil)) {
            return res.status(400).json({ success: false, message: 'Promo code has expired' });
        }

        if (promo.maxUses && promo.currentUses >= promo.maxUses) {
            return res.status(400).json({ success: false, message: 'Promo code usage limit reached' });
        }

        if (promo.specificUserId && promo.specificUserId !== req.user.id) {
            return res.status(400).json({ success: false, message: 'This promo code is not valid for your account' });
        }

        if (targetPlan && promo.allowedPlans && promo.allowedPlans.length > 0) {
            // Convert everything to lowercase to make checking plan compatibility robust
            const allowed = promo.allowedPlans.map(p => p.toLowerCase());
            if (!allowed.includes(targetPlan.toLowerCase())) {
                return res.status(400).json({ success: false, message: `This promo code is not valid for the ${targetPlan} plan` });
            }
        }

        // Return the format expected by the frontend (both flat discountType/discountValue and nested promo object with snake_case keys)
        res.json({
            success: true,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            promo: {
                code: promo.code,
                discount_type: promo.discountType,
                discount_value: promo.discountValue
            }
        });

    } catch (error) {
        console.error('validatePromoCode error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Generate a personalized trial offer for expired trial users
export const generateTrialOffer = async (req, res) => {
    try {
        const userId = req.user.id;
        const code = `TRIAL50_${userId.substring(0, 6).toUpperCase()}`;

        // Find or create active trial offer promo code for this user
        let promo = await PromoCode.findOne({
            where: {
                specificUserId: userId,
                code,
                isActive: true
            }
        });

        if (!promo) {
            promo = await PromoCode.create({
                code,
                discountType: 'percent',
                discountValue: 50.00,
                validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Valid for 3 days
                maxUses: 1,
                currentUses: 0,
                isActive: true,
                specificUserId: userId,
                allowedPlans: ['pro', 'premium', 'team']
            });
        }

        res.json({
            success: true,
            promo: {
                code: promo.code,
                discount_type: promo.discountType,
                discount_value: promo.discountValue
            }
        });
    } catch (error) {
        console.error('generateTrialOffer error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

