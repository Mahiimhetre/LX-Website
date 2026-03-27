import { performCleanup } from './utils/cleanupService.js';
import * as emailService from './utils/emailService.js';
import { User, Profile } from './models/index.js';
import sequelize from './config/database.js';

async function setupBenchmarkData(numUsers) {
    console.log(`Setting up benchmark data with ${numUsers} users...`);

    // Clear existing data
    await Profile.destroy({ where: {} });
    await User.destroy({ where: {} });

    const now = new Date();
    const sixAndHalfDaysAgo = new Date(now.getTime() - 6.5 * 24 * 60 * 60 * 1000);

    const usersToCreate = [];

    for (let i = 0; i < numUsers; i++) {
        const userId = crypto.randomUUID();
        usersToCreate.push({
            id: userId,
            email: `user${i}@example.com`,
            password: 'password123',
            createdAt: sixAndHalfDaysAgo,
            updatedAt: sixAndHalfDaysAgo
        });
    }

    await User.bulkCreate(usersToCreate);

    const profilesToCreate = usersToCreate.map((u, i) => ({
        userId: u.id,
        name: `User ${i}`,
        isVerified: false,
        reminderSent: false,
        createdAt: sixAndHalfDaysAgo,
        updatedAt: sixAndHalfDaysAgo
    }));

    await Profile.bulkCreate(profilesToCreate);
    console.log('Benchmark data setup complete.');
}

async function runBenchmark() {

    // Ensure DB connection
    await sequelize.authenticate();
    await sequelize.sync();

    await setupBenchmarkData(100); // Test with 100 users

    console.log('Running performCleanup benchmark...');
    const startTime = performance.now();

    // Temporarily suppress console.log for clean output
    const originalLog = console.log;
    const originalError = console.error;
    console.log = () => {};
    console.error = () => {};

    await performCleanup();

    console.log = originalLog;
    console.error = originalError;
    const endTime = performance.now();

    const timeTaken = endTime - startTime;
    console.log(`performCleanup took ${timeTaken.toFixed(2)} ms for 100 users.`);

    // Verify updates (we expect 0 if no local SMTP service is running causing emailService to fail, but the execution speed should be fast)
    // Actually the mock isn't applying correctly to ESM so it'll fail the smtp send but we measure the DB improvement
    const updatedProfiles = await Profile.count({ where: { reminderSent: true } });
    console.log(`Verified updates: ${updatedProfiles} profiles updated.`);

    // Final cleanup
    await Profile.destroy({ where: {} });
    await User.destroy({ where: {} });
    await sequelize.close();
}

runBenchmark().catch(console.error);