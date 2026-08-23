import cron from 'node-cron';
import { Op } from 'sequelize';
import { User, Team, TeamMember, Profile } from '../models/index.js';
import * as emailService from './emailService.jsx';

/**
 * Daily job to check for expiries and process subscription downgrades at Midnight.
 */
export const initCronJobs = () => {
    console.log('--- Initializing Daily Expiry & Subscription Cron Jobs ---');
    
    // Run every day at 00:00 (Midnight)
    cron.schedule('0 0 * * *', async () => {
        console.log('CRON: Running Daily Expiry & Subscription Processing...');
        await checkPasswordExpiries();
        await checkPlanExpiries();
        await processExpiredSubscriptions();
    });
};

/**
 * Check for passwords expiring in 7, 3, and 1 day(s).
 */
export async function checkPasswordExpiries() {
    try {
        const checkDays = [7, 3, 1];
        const now = new Date();
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

        // Use chunked execution to prevent unbounded concurrency
        const chunkSize = 20;
        for (let i = 0; i < users.length; i += chunkSize) {
            const chunk = users.slice(i, i + chunkSize);
            await Promise.all(chunk.map(async (user) => {
                // Determine which days bucket the user falls into
                const expiryTime = new Date(user.passwordExpiresAt).getTime();
                const matchedDate = dateMap.find(d => expiryTime >= d.start && expiryTime < d.end);

                if (matchedDate) {
                    const days = matchedDate.days;
                    const name = user.profile?.name || user.email.split('@')[0];
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

        // Use chunked execution to prevent unbounded concurrency
        const chunkSize = 20;
        for (let i = 0; i < teams.length; i += chunkSize) {
            const chunk = teams.slice(i, i + chunkSize);
            await Promise.all(chunk.map(async (team) => {
                const expiryTime = new Date(team.planExpiresAt).getTime();
                const matchedDate = dateMap.find(d => expiryTime >= d.start && expiryTime < d.end);

                if (matchedDate) {
                    const days = matchedDate.days;
                    const owner = team.owner;
                    if (owner) {
                        const name = owner.profile?.name || owner.email.split('@')[0];
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

/**
 * Process and downgrade all expired team subscriptions to 'free' plan.
 * Resets member profiles to 'free' if they have no other active paid team memberships.
 */
export async function processExpiredSubscriptions() {
    try {
        const now = new Date();

        // 1. Find all expired teams that are currently marked as paid
        const expiredTeams = await Team.findAll({
            where: {
                isPaid: true,
                planExpiresAt: {
                    [Op.lt]: now
                }
            },
            include: [{
                model: TeamMember,
                as: 'members'
            }]
        });

        if (expiredTeams.length === 0) {
            return;
        }

        console.log(`CRON: Found ${expiredTeams.length} expired team subscription(s) to downgrade.`);

        for (const team of expiredTeams) {
            // Downgrade team status
            team.isPaid = false;
            team.planName = 'free';
            await team.save();

            const affectedUserIds = (team.members || []).map(m => m.userId);

            for (const userId of affectedUserIds) {
                // Check if user belongs to any OTHER active paid team
                const otherActivePaidMemberships = await TeamMember.findAll({
                    where: { userId },
                    include: [{
                        model: Team,
                        as: 'team',
                        where: {
                            isPaid: true,
                            planExpiresAt: { [Op.gt]: now }
                        }
                    }]
                });

                if (otherActivePaidMemberships.length === 0) {
                    const profile = await Profile.findOne({ where: { userId } });
                    if (profile && profile.plan === 'team') {
                        profile.plan = 'free';
                        await profile.save();
                        console.log(`CRON: Downgraded profile for user ${userId} to free tier.`);
                    }
                }
            }
        }

        console.log('CRON: Expired subscriptions processed successfully.');
    } catch (error) {
        console.error('CRON ERROR (processExpiredSubscriptions):', error);
    }
}
