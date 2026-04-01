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
        const dateConditions = [];
        const dateMap = [];

        // Pre-calculate target dates and build the OR conditions
        for (const days of checkDays) {
            const targetDate = new Date();
            targetDate.setDate(now.getDate() + days);
            targetDate.setHours(0, 0, 0, 0);

            const nextDay = new Date(targetDate);
            nextDay.setDate(targetDate.getDate() + 1);

            dateConditions.push({
                passwordExpiresAt: {
                    [Op.gte]: targetDate,
                    [Op.lt]: nextDay
                }
            });
            dateMap.push({ days, start: targetDate.getTime(), end: nextDay.getTime() });
        }

        // Single query for all matching days
        const users = await User.findAll({
            where: {
                [Op.or]: dateConditions
            },
            include: [{ model: Profile, as: 'profile' }]
        });

        // ⚡ Bolt: Chunked execution to prevent unbounded concurrency memory spikes and SMTP rate limits
        // Processing in batches of 20 balances performance with resource stability.
        const CHUNK_SIZE = 20;
        for (let i = 0; i < users.length; i += CHUNK_SIZE) {
            const chunk = users.slice(i, i + CHUNK_SIZE);
            await Promise.all(chunk.map(async (user) => {
                // Determine which days bucket the user falls into
                const expiryTime = new Date(user.passwordExpiresAt).getTime();
                const matchedDate = dateMap.find(d => expiryTime >= d.start && expiryTime < d.end);

                if (matchedDate) {
                    const days = matchedDate.days;
                    const name = user.profile?.firstName || user.email.split('@')[0];
                    console.log(`CRON: Sending Password Expiry Reminder (${days} days) to ${user.email}`);
                    await emailService.sendPasswordExpiryReminder(user.email, name, days);
                }
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
        const dateConditions = [];
        const dateMap = [];

        for (const days of checkDays) {
            const targetDate = new Date();
            targetDate.setDate(now.getDate() + days);
            targetDate.setHours(0, 0, 0, 0);

            const nextDay = new Date(targetDate);
            nextDay.setDate(targetDate.getDate() + 1);

            dateConditions.push({
                planExpiresAt: {
                    [Op.gte]: targetDate,
                    [Op.lt]: nextDay
                }
            });
            dateMap.push({ days, start: targetDate.getTime(), end: nextDay.getTime() });
        }

        const teams = await Team.findAll({
            where: {
                [Op.or]: dateConditions
            },
            include: [{
                association: 'owner',
                include: [{ model: Profile, as: 'profile' }]
            }]
        });

        // ⚡ Bolt: Chunked execution to prevent unbounded concurrency memory spikes and SMTP rate limits
        // Processing in batches of 20 balances performance with resource stability.
        const CHUNK_SIZE = 20;
        for (let i = 0; i < teams.length; i += CHUNK_SIZE) {
            const chunk = teams.slice(i, i + CHUNK_SIZE);
            await Promise.all(chunk.map(async (team) => {
                const expiryTime = new Date(team.planExpiresAt).getTime();
                const matchedDate = dateMap.find(d => expiryTime >= d.start && expiryTime < d.end);

                if (matchedDate) {
                    const days = matchedDate.days;
                    const owner = team.owner;
                    if (owner) {
                        const name = owner.profile?.firstName || owner.email.split('@')[0];
                        console.log(`CRON: Sending Plan Expiry Reminder (${days} days) to ${owner.email} for team ${team.name}`);
                        await emailService.sendPlanExpiryReminder(owner.email, name, team.name, days);
                    }
                }
            }));
        }
    } catch (error) {
        console.error('CRON ERROR (Plan Expiry):', error);
    }
}
