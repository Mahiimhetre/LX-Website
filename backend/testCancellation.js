import { cancelSubscription } from './controllers/paymentController.js';
import { User, Team, Payment, sequelize } from './models/index.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Integrated Test for Cancellation & Refund Policy
 */
const mockRes = () => {
    const res = {};
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.body = data; return res; };
    return res;
};

(async () => {
    try {
        console.log('--- STARTING INTEGRATED CANCELLATION TEST ---');
        
        const testEmail = 'refund_test_user@example.com';
        const teamName = 'Integrated Refund Test';

        // 1. Cleanup & Setup User
        let user = await User.findOne({ where: { email: testEmail } });
        if (user) {
            // Clean up old teams first (due to FK)
            const oldTeams = await Team.findAll({ where: { ownerId: user.id } });
            for (const t of oldTeams) {
                await Payment.destroy({ where: { teamId: t.id } });
                await t.destroy();
            }
            await user.destroy();
        }

        user = await User.create({ email: testEmail, password: 'password123' });
        console.log('Test User created.');

        // 2. Setup Team
        const team = await Team.create({
            name: teamName,
            ownerId: user.id,
            isPaid: true,
            planName: 'premium',
            planExpiresAt: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000) 
        });

        // "Current" month (Started 10 days ago)
        await Payment.create({
            teamId: team.id,
            userId: user.id,
            razorpayOrderId: 'order_1',
            razorpayPaymentId: 'pay_1',
            amount: 500,
            planName: 'premium',
            planStartedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            status: 'paid'
        });

        // "Stacked" month (Starts in 20 days)
        const stackedStart = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
        await Payment.create({
            teamId: team.id,
            userId: user.id,
            razorpayOrderId: 'order_2',
            razorpayPaymentId: 'pay_2',
            amount: 500,
            planName: 'premium',
            planStartedAt: stackedStart,
            status: 'paid'
        });

        console.log('Setup finished: One active, one stacked.');

        // 3. Test Cancellation of Stacked Month
        console.log('\nTesting: Cancel the stacked month...');
        const res = mockRes();
        await cancelSubscription({ body: { teamId: team.id } }, res);
        
        console.log('Response Success:', res.body.success);
        console.log('Response Message:', res.body.message);

        // 4. Test Cancellation of Active Month
        console.log('\nTesting: Cancel the active month (immediately after)...');
        const res2 = mockRes();
        await cancelSubscription({ body: { teamId: team.id } }, res2);
        console.log('Response Status:', res2.statusCode);
        console.log('Message:', res2.body.message);

        console.log('\n--- TESTS COMPLETED SUCCESSFULLY ---');
        
        // Final Cleanup
        await Payment.destroy({ where: { teamId: team.id } });
        await team.destroy();
        await user.destroy();
        
        process.exit(0);
    } catch (err) {
        console.error('FATAL TEST ERROR:', err);
        process.exit(1);
    }
})();
