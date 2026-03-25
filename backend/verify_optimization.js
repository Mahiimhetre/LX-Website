
import { performance } from 'perf_hooks';

// We'll mock the dependencies since we can't easily run the real ones without a DB
// and we want to measure the logic itself in the same file to be sure.

async function mockSendEmail(email, name, days) {
    return new Promise(resolve => setTimeout(resolve, 100));
}

const mockUsers = Array.from({ length: 10 }, (_, i) => ({
    email: `user${i}@example.com`,
    profile: { firstName: `User${i}` }
}));

const mockTeams = Array.from({ length: 10 }, (_, i) => ({
    name: `Team ${i}`,
    owner: {
        email: `owner${i}@example.com`,
        profile: { firstName: `Owner${i}` }
    }
}));

// Re-implementing the core logic from cronJobs.js here to verify the Promise.all pattern
// effectively, as importing it would require mocking all the sequelize imports etc.

async function optimizedCheckPasswordExpiries(users, days) {
    const start = performance.now();
    await Promise.all(users.map(async (user) => {
        const name = user.profile?.firstName || user.email.split('@')[0];
        // console.log(`CRON: Sending Password Expiry Reminder (${days} days) to ${user.email}`);
        await mockSendEmail(user.email, name, days);
    }));
    const end = performance.now();
    return end - start;
}

async function optimizedCheckPlanExpiries(teams, days) {
    const start = performance.now();
    await Promise.all(teams.map(async (team) => {
        const owner = team.owner;
        if (owner) {
            const name = owner.profile?.firstName || owner.email.split('@')[0];
            // console.log(`CRON: Sending Plan Expiry Reminder (${days} days) to ${owner.email} for team ${team.name}`);
            await mockSendEmail(owner.email, name, days);
        }
    }));
    const end = performance.now();
    return end - start;
}

async function runVerification() {
    console.log("Verifying Optimized Patterns (10 items, 100ms delay):");

    const pwTime = await optimizedCheckPasswordExpiries(mockUsers, 7);
    console.log(`Optimized Password Expiries Time: ${pwTime.toFixed(2)}ms`);

    const planTime = await optimizedCheckPlanExpiries(mockTeams, 7);
    console.log(`Optimized Plan Expiries Time: ${planTime.toFixed(2)}ms`);

    const expectedMax = 150; // Should be around 100ms + some overhead
    if (pwTime < expectedMax && planTime < expectedMax) {
        console.log("SUCCESS: Both functions executed concurrently!");
    } else {
        console.log("FAILURE: Execution seems sequential.");
    }
}

runVerification();
