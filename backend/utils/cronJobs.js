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
 * Optimized to use a single query instead of multiple queries in a loop.
 */
export async function checkPasswordExpiries() {
    try {
        const checkDays = [7, 3, 1];
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        const orConditions = checkDays.map(days => {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + days);

            const nextDay = new Date(targetDate);
            nextDay.setDate(targetDate.getDate() + 1);

            return {
                passwordExpiresAt: {
                    [Op.gte]: targetDate,
                    [Op.lt]: nextDay
                }
            };
        });

        const users = await User.findAll({
            where: {
                [Op.or]: orConditions
            },
            include: [{ model: Profile, as: 'profile' }]
        });

        await Promise.all(users.map(async (user) => {
            const expiryDate = new Date(user.passwordExpiresAt);
            expiryDate.setHours(0, 0, 0, 0);

            const daysRemaining = Math.round((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            const name = user.profile?.firstName || user.email.split('@')[0];
            console.log(`CRON: Sending Password Expiry Reminder (${daysRemaining} days) to ${user.email}`);
            await emailService.sendPasswordExpiryReminder(user.email, name, daysRemaining);
        }));
    } catch (error) {
        console.error('CRON ERROR (Password Expiry):', error);
    }
}

/**
 * Check for plans expiring in 7 and 1 day.
 * Optimized to use a single query instead of multiple queries in a loop.
 */
export async function checkPlanExpiries() {
    try {
        const checkDays = [7, 1];
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        const orConditions = checkDays.map(days => {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + days);

            const nextDay = new Date(targetDate);
            nextDay.setDate(targetDate.getDate() + 1);

            return {
                planExpiresAt: {
                    [Op.gte]: targetDate,
                    [Op.lt]: nextDay
                }
            };
        });

        const teams = await Team.findAll({
            where: {
                [Op.or]: orConditions
            },
            include: [{
                association: 'owner',
                include: [{ model: Profile, as: 'profile' }]
            }]
        });

        await Promise.all(teams.map(async (team) => {
            const expiryDate = new Date(team.planExpiresAt);
            expiryDate.setHours(0, 0, 0, 0);

            const daysRemaining = Math.round((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            const owner = team.owner;
            if (owner) {
                const name = owner.profile?.firstName || owner.email.split('@')[0];
                console.log(`CRON: Sending Plan Expiry Reminder (${daysRemaining} days) to ${owner.email} for team ${team.name}`);
                await emailService.sendPlanExpiryReminder(owner.email, name, team.name, daysRemaining);
            }
        }));
    } catch (error) {
        console.error('CRON ERROR (Plan Expiry):', error);
    }
}
