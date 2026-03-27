import { checkPasswordExpiries, checkPlanExpiries } from './utils/cronJobs.js';
import { User, Team, Profile } from './models/index.js';
import { Op } from 'sequelize';

// Mock data generator
const now = new Date();
now.setHours(0, 0, 0, 0);

function addDays(date, days) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}

const mockUsers = [
    { email: 'u1@test.com', profile: { firstName: 'U1' }, passwordExpiresAt: addDays(now, 7) },
    { email: 'u2@test.com', profile: null, passwordExpiresAt: addDays(now, 3) },
    { email: 'u3@test.com', profile: { firstName: 'U3' }, passwordExpiresAt: addDays(now, 1) },
    { email: 'u4@test.com', profile: null, passwordExpiresAt: addDays(now, 5) }, // shouldn't match
];

const mockTeams = [
    { name: 'T1', owner: { email: 'o1@test.com', profile: { firstName: 'O1' } }, planExpiresAt: addDays(now, 7) },
    { name: 'T2', owner: { email: 'o2@test.com', profile: { firstName: 'O2' } }, planExpiresAt: addDays(now, 1) },
    { name: 'T3', owner: null, planExpiresAt: addDays(now, 1) }, // no owner, skip
    { name: 'T4', owner: { email: 'o4@test.com', profile: { firstName: 'O4' } }, planExpiresAt: addDays(now, 2) }, // shouldn't match
];

async function run() {
    let queryCount = 0;

    // Mock User.findAll
    User.findAll = async (options) => {
        queryCount++;
        // To handle both single conditions and Op.or
        let gte, lt;

        if (options.where[Op.or]) {
            return mockUsers.filter(u => {
                return options.where[Op.or].some(cond => {
                    const g = cond.passwordExpiresAt[Op.gte];
                    const l = cond.passwordExpiresAt[Op.lt];
                    return u.passwordExpiresAt >= g && u.passwordExpiresAt < l;
                });
            });
        } else {
            gte = options.where.passwordExpiresAt[Op.gte];
            lt = options.where.passwordExpiresAt[Op.lt];
            return mockUsers.filter(u => u.passwordExpiresAt >= gte && u.passwordExpiresAt < lt);
        }
    };

    Team.findAll = async (options) => {
        queryCount++;
        let gte, lt;

        if (options.where[Op.or]) {
            return mockTeams.filter(t => {
                return options.where[Op.or].some(cond => {
                    const g = cond.planExpiresAt[Op.gte];
                    const l = cond.planExpiresAt[Op.lt];
                    return t.planExpiresAt >= g && t.planExpiresAt < l;
                });
            });
        } else {
            gte = options.where.planExpiresAt[Op.gte];
            lt = options.where.planExpiresAt[Op.lt];
            return mockTeams.filter(t => t.planExpiresAt >= gte && t.planExpiresAt < lt);
        }
    };

    // Overriding console.log to suppress some output and track emails
    const originalConsoleLog = console.log;
    let emailsSent = [];
    console.log = function(...args) {
        if (args[0].startsWith('CRON: Sending')) {
            emailsSent.push(args[0]);
        }
        // originalConsoleLog(...args);
    };

    originalConsoleLog("--- BASELINE ---");
    queryCount = 0;
    emailsSent = [];
    originalConsoleLog("Running baseline checkPasswordExpiries...");
    const start1 = performance.now();
    await checkPasswordExpiries();
    const end1 = performance.now();
    originalConsoleLog(`checkPasswordExpiries took ${end1 - start1}ms with ${queryCount} queries`);
    originalConsoleLog(`Emails sent: ${emailsSent.length}`);
    emailsSent.forEach(e => originalConsoleLog('  ', e));

    queryCount = 0;
    emailsSent = [];
    originalConsoleLog("Running baseline checkPlanExpiries...");
    const start2 = performance.now();
    await checkPlanExpiries();
    const end2 = performance.now();
    originalConsoleLog(`checkPlanExpiries took ${end2 - start2}ms with ${queryCount} queries`);
    originalConsoleLog(`Emails sent: ${emailsSent.length}`);
    emailsSent.forEach(e => originalConsoleLog('  ', e));
    console.log = originalConsoleLog;
}

run();
