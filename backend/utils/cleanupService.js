import cron from 'node-cron';
import { User, Profile } from '../models/index.js';
import { Op } from 'sequelize';
import { sendCleanupReminderEmail } from './emailService.js';

/**
 * Cleanup Service
 * Runs every day at midnight (00:00)
 */
export const initCleanupJob = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log('Running unverified user cleanup job...');
        await performCleanup();
    });
};

export const performCleanup = async () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);

    try {
        // 1. Send Reminders (Created between 6 and 7 days ago, not verified, no reminder sent)
        const usersToRemind = await User.findAll({
            where: {
                createdAt: {
                    [Op.lt]: sixDaysAgo,
                    [Op.gt]: sevenDaysAgo
                }
            },
            include: [{
                model: Profile,
                as: 'profile',
                where: {
                    isVerified: false,
                    reminderSent: false
                }
            }]
        });

        for (const user of usersToRemind) {
            console.log(`Sending cleanup reminder to: ${user.email}`);
            const success = await sendCleanupReminderEmail(user.email);
            if (success) {
                user.profile.reminderSent = true;
                await user.profile.save();
            }
        }

        // 2. Delete Users (Created more than 7 days ago, not verified)
        const usersToDelete = await User.findAll({
            where: {
                createdAt: {
                    [Op.lt]: sevenDaysAgo
                }
            },
            include: [{
                model: Profile,
                as: 'profile',
                where: {
                    isVerified: false
                }
            }]
        });

        for (const user of usersToDelete) {
            console.log(`Deleting unverified user: ${user.email} (Created at: ${user.createdAt})`);
            await user.destroy(); // This should cascade delete the profile if configured, otherwise delete profile manually
        }

        console.log(`Cleanup completed. Reminders sent: ${usersToRemind.length}, Users deleted: ${usersToDelete.length}`);
    } catch (error) {
        console.error('Error in cleanup job:', error);
    }
};
