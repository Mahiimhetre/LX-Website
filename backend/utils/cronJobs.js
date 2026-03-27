import cron from 'node-cron';
import { Op } from 'sequelize';
import { User, Team, Profile } from '../models/index.js';
import * as emailService from './emailService.jsx';

/**
 * Daily job to check for expiries at Midnight.
 */
export const initCronJobs = () => {
    console.log('--- Initializing Daily Expiry Check Cron Job ---');
    
    // Run every day at 00:00
    cron.schedule('0 0 * * *', async () => {
        console.log('CRON: Running Daily Expiry Checks...');
        await checkPasswordExpiries();
        await checkPlanExpiries();
    });
};

/**
 * Check for passwords expiring in 7, 3, and 1 day(s).
 */
export async function checkPasswordExpiries() {
    try {
        const checkDays = [7, 3, 1];
        const now = new Date();

        for (const days of checkDays) {
            const targetDate = new Date();
            targetDate.setDate(now.getDate() + days);
            targetDate.setHours(0, 0, 0, 0);

            const nextDay = new Date(targetDate);
            nextDay.setDate(targetDate.getDate() + 1);

            const users = await User.findAll({
                where: {
                    passwordExpiresAt: {
                        [Op.gte]: targetDate,
                        [Op.lt]: nextDay
                    }
                },
                include: [{ model: Profile, as: 'profile' }]
            });

            await Promise.all(users.map(async (user) => {
                const name = user.profile?.firstName || user.email.split('@')[0];
                console.log(`CRON: Sending Password Expiry Reminder (${days} days) to ${user.email}`);
                await emailService.sendPasswordExpiryReminder(user.email, name, days);
            }));
        }
    } catch (error) {
        console.error('CRON ERROR (Password Expiry):', error);
    }
}

/**
 * Check for plans expiring in 7 and 1 day.
 */
export async function checkPlanExpiries() {
    try {
        const checkDays = [7, 1];
        const now = new Date();

        for (const days of checkDays) {
            const targetDate = new Date();
            targetDate.setDate(now.getDate() + days);
            targetDate.setHours(0, 0, 0, 0);

            const nextDay = new Date(targetDate);
            nextDay.setDate(targetDate.getDate() + 1);

            const teams = await Team.findAll({
                where: {
                    planExpiresAt: {
                        [Op.gte]: targetDate,
                        [Op.lt]: nextDay
                    }
                },
                include: [{ 
                    association: 'owner',
                    include: [{ model: Profile, as: 'profile' }] 
                }]
            });

            await Promise.all(teams.map(async (team) => {
                const owner = team.owner;
                if (owner) {
                    const name = owner.profile?.firstName || owner.email.split('@')[0];
                    console.log(`CRON: Sending Plan Expiry Reminder (${days} days) to ${owner.email} for team ${team.name}`);
                    await emailService.sendPlanExpiryReminder(owner.email, name, team.name, days);
                }
            }));
        }
    } catch (error) {
        console.error('CRON ERROR (Plan Expiry):', error);
    }
}
