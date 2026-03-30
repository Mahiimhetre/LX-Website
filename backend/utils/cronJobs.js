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
        // ⚡ Bolt: Calculate a stable 'today' midnight timestamp once per function
        // to ensure consistent bucket categorization across result processing and
        // prevent side effects from mutating shared Date objects.
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        const dateConditions = [];
        const dateMap = [];

        // Pre-calculate target dates and build the OR conditions
        for (const days of checkDays) {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + days);

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

        // ⚡ Bolt: Avoid unbounded Promise.all concurrency for large user arrays in cron jobs.
        // Process sequentially to prevent OOM errors, connection pool exhaustion, and email API rate limits.
        for (const user of users) {
            try {
                // Determine which days bucket the user falls into
                const expiryTime = new Date(user.passwordExpiresAt).getTime();
                const matchedDate = dateMap.find(d => expiryTime >= d.start && expiryTime < d.end);

                if (matchedDate) {
                    const days = matchedDate.days;
                    const name = user.profile?.firstName || user.email.split('@')[0];
                    console.log(`CRON: Sending Password Expiry Reminder (${days} days) to ${user.email}`);
                    await emailService.sendPasswordExpiryReminder(user.email, name, days);
                }
            } catch (err) {
                console.error(`CRON ERROR (Password Expiry - User ${user.email}):`, err);
            }
        }
    } catch (error) {
        console.error('CRON ERROR (Password Expiry - General):', error);
    }
}

/**
 * Check for plans expiring in 7 and 1 day.
 */
export async function checkPlanExpiries() {
    try {
        const checkDays = [7, 1];
        const now = new Date();
        // ⚡ Bolt: Calculate a stable 'today' midnight timestamp once per function
        // to ensure consistent bucket categorization across result processing and
        // prevent side effects from mutating shared Date objects.
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        const dateConditions = [];
        const dateMap = [];

        for (const days of checkDays) {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + days);

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

        // ⚡ Bolt: Avoid unbounded Promise.all concurrency for large user arrays in cron jobs.
        // Process sequentially to prevent OOM errors, connection pool exhaustion, and email API rate limits.
        for (const team of teams) {
            try {
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
            } catch (err) {
                console.error(`CRON ERROR (Plan Expiry - Team ${team.name}):`, err);
            }
        }
    } catch (error) {
        console.error('CRON ERROR (Plan Expiry - General):', error);
    }
}
