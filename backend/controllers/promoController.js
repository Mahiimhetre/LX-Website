import { PromoCode } from '../models/index.js';

export const validatePromoCode = async (req, res) => {
    try {
        const { code, plan } = req.body;
        
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

        if (plan && promo.allowedPlans && promo.allowedPlans.length > 0) {
            if (!promo.allowedPlans.includes(plan)) {
                return res.status(400).json({ success: false, message: `This promo code is not valid for the ${plan} plan` });
            }
        }

        res.json({
            success: true,
            discountType: promo.discountType,
            discountValue: promo.discountValue
        });

    } catch (error) {
        console.error('validatePromoCode error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
