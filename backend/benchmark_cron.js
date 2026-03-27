
import { performance } from 'perf_hooks';

async function mockSendEmail(email, name, days) {
    // Simulate network delay for sending email
    return new Promise(resolve => setTimeout(resolve, 100));
}

const users = Array.from({ length: 10 }, (_, i) => ({
    email: `user${i}@example.com`,
    profile: { firstName: `User${i}` }
}));

async function sequentialVersion(users, days) {
    const start = performance.now();
    for (const user of users) {
        const name = user.profile?.firstName || user.email.split('@')[0];
        // console.log(`CRON: Sending Password Expiry Reminder (${days} days) to ${user.email}`);
        await mockSendEmail(user.email, name, days);
    }
    const end = performance.now();
    return end - start;
}

async function concurrentVersion(users, days) {
    const start = performance.now();
    await Promise.all(users.map(user => {
        const name = user.profile?.firstName || user.email.split('@')[0];
        // console.log(`CRON: Sending Password Expiry Reminder (${days} days) to ${user.email}`);
        return mockSendEmail(user.email, name, days);
    }));
    const end = performance.now();
    return end - start;
}

async function runBenchmark() {
    console.log(`Benchmarking with ${users.length} users and 100ms simulated delay per email...`);

    const seqTime = await sequentialVersion(users, 7);
    console.log(`Sequential Version: ${seqTime.toFixed(2)}ms`);

    const conTime = await concurrentVersion(users, 7);
    console.log(`Concurrent Version: ${conTime.toFixed(2)}ms`);

    const improvement = ((seqTime - conTime) / seqTime) * 100;
    console.log(`Improvement: ${improvement.toFixed(2)}%`);
}

runBenchmark();
