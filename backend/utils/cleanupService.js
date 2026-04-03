import { User, Profile } from '../models/index.js';
import { Op } from 'sequelize';
import * as emailService from './emailService.js';
import cron from 'node-cron';

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

        const successfulUserIds = [];
        const CHUNK_SIZE = 20;

        // Process in chunks to balance performance and SMTP rate limits
        for (let i = 0; i < usersToRemind.length; i += CHUNK_SIZE) {
            const chunk = usersToRemind.slice(i, i + CHUNK_SIZE);
            const chunkResults = await Promise.all(chunk.map(async (user) => {
                console.log(`Sending cleanup reminder to: ${user.email}`);
                const success = await emailService.sendCleanupReminderEmail(user.email);
                return { id: user.id, success };
            }));

            chunkResults.forEach(res => {
                if (res.success) successfulUserIds.push(res.id);
            });
        }

        // Perform a single bulk update for the reminderSent flag
        if (successfulUserIds.length > 0) {
            await Profile.update(
                { reminderSent: true },
                {
                    where: {
                        userId: {
                            [Op.in]: successfulUserIds
                        }
                    }
                }
            );
        }

        // 2. Delete Users (Created more than 7 days ago, not verified)
        const usersToDelete = await User.findAll({
            // ⚡ Bolt: Only fetch the user ID instead of materializing full User and Profile objects into memory
            attributes: ['id'],
            where: {
                createdAt: {
                    [Op.lt]: sevenDaysAgo
                }
            },
            include: [{
                model: Profile,
                as: 'profile',
                attributes: [], // ⚡ Bolt: Skip fetching Profile columns entirely, we just need the INNER JOIN
                where: {
                    isVerified: false
                }
            }],
            raw: true // ⚡ Bolt: Return plain JS objects to bypass Sequelize instance overhead
        });

        if (usersToDelete.length > 0) {
            const userIds = usersToDelete.map(user => user.id);
            console.log(`Deleting ${usersToDelete.length} unverified users...`);

            await User.destroy({
                where: {
                    id: {
                        [Op.in]: userIds
                    }
                }
            });
        }

        console.log(`Cleanup completed. Reminders sent: ${successfulUserIds.length}, Users deleted: ${usersToDelete.length}`);
    } catch (error) {
        console.error('Error in cleanup job:', error);
    }
};
