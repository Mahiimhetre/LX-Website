import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import { User, Profile, sequelize } from './models/index.js';

const BASE_URL = 'http://localhost:5000/api/v1';

async function makeRequest(method, endpoint, body = null, token = null) {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        return { error: error.message };
    }
}

async function verifyUserInDB(email) {
    try {
        const user = await User.findOne({ where: { email } });
        if (user) {
            const profile = await Profile.findOne({ where: { userId: user.id } });
            if (profile) {
                profile.isVerified = true;
                await profile.save();
                console.log(`  [DB] Successfully marked ${email} as verified`);
            } else {
                console.log(`  [DB] Profile not found for email: ${email}`);
            }
        } else {
            console.log(`  [DB] User not found for email: ${email}`);
        }
    } catch (err) {
        console.error(`  [DB] Error verifying user ${email}:`, err.message);
    }
}

async function runTests() {
    console.log('🧪 TESTING HYBRID INVITE-ON-REGISTER FLOW\n');
    console.log('=' .repeat(60));

    // Test 1: Register User A (Team Owner)
    console.log('\n✅ TEST 1: Register User A (Team Owner)');
    const userA = {
        name: 'User A',
        email: `userA_${Date.now()}@test.com`,
        password: 'TestPass123!'
    };
    const registerAResult = await makeRequest('POST', '/auth/register', userA);
    console.log(`Status: ${registerAResult.status}`);
    console.log(`Response:`, JSON.stringify(registerAResult.data, null, 2));
    const userAEmail = userA.email;

    // Direct DB verification for User A
    await verifyUserInDB(userAEmail);

    // Test 2: Login User A
    console.log('\n✅ TEST 2: Login User A');
    const loginAResult = await makeRequest('POST', '/auth/login', {
        email: userAEmail,
        password: userA.password
    });
    console.log(`Status: ${loginAResult.status}`);
    if (loginAResult.data.token) {
        console.log(`✅ Got token for User A`);
    }
    const tokenA = loginAResult.data.token;

    // Test 3: Create Team
    console.log('\n✅ TEST 3: Create Team');
    const teamResult = await makeRequest('POST', '/teams', {
        name: 'Test Team'
    }, tokenA);
    console.log(`Status: ${teamResult.status}`);
    console.log(`Response:`, JSON.stringify(teamResult.data, null, 2));
    const teamId = teamResult.data.team?.id;
    console.log(`Team ID: ${teamId}`);

    // Test 4: Invite User B (Not yet registered)
    console.log('\n✅ TEST 4: Invite User B (Not registered yet)');
    const userBEmail = `userB_${Date.now()}@test.com`;
    const inviteResult = await makeRequest('POST', '/teams/invite', {
        teamId,
        email: userBEmail,
        role: 'member'
    }, tokenA);
    console.log(`Status: ${inviteResult.status}`);
    console.log(`Response:`, JSON.stringify(inviteResult.data, null, 2));
    const invitationToken = inviteResult.data.invitation?.token;
    console.log(`Invitation Token: ${invitationToken}`);

    // Test 5: Register User B (Should see pending invitations)
    console.log('\n✅ TEST 5: Register User B (Should see pending invitations)');
    const userB = {
        name: 'User B',
        email: userBEmail,
        password: 'TestPass123!'
    };
    const registerBResult = await makeRequest('POST', '/auth/register', userB);
    console.log(`Status: ${registerBResult.status}`);
    console.log(`Response:`, JSON.stringify(registerBResult.data, null, 2));
    
    if (registerBResult.data.pendingInvitations) {
        console.log(`✅ PENDING INVITATIONS FOUND: ${registerBResult.data.pendingInvitations.length}`);
    } else {
        console.log(`⚠️ No pending invitations returned`);
    }

    // Direct DB verification for User B
    await verifyUserInDB(userBEmail);

    // Test 6: Login User B
    console.log('\n✅ TEST 6: Login User B');
    const loginBResult = await makeRequest('POST', '/auth/login', {
        email: userBEmail,
        password: userB.password
    });
    console.log(`Status: ${loginBResult.status}`);
    const tokenB = loginBResult.data.token;
    if (tokenB) {
        console.log(`✅ Got token for User B`);
    }

    // Test 7: Get Pending Invitations for User B
    console.log('\n✅ TEST 7: Get Pending Invitations for User B');
    const getPendingResult = await makeRequest('GET', '/teams/pending/invitations', null, tokenB);
    console.log(`Status: ${getPendingResult.status}`);
    console.log(`Response:`, JSON.stringify(getPendingResult.data, null, 2));

    // Test 8: Accept Multiple Invitations
    console.log('\n✅ TEST 8: Accept Multiple Invitations');
    const acceptMultipleResult = await makeRequest('POST', '/teams/accept-multiple', {
        tokens: [invitationToken]
    }, tokenB);
    console.log(`Status: ${acceptMultipleResult.status}`);
    console.log(`Response:`, JSON.stringify(acceptMultipleResult.data, null, 2));

    // Test 9: Verify User B is now in Team
    console.log('\n✅ TEST 9: Verify User B is now in Team');
    const getUserTeamsResult = await makeRequest('GET', '/teams', null, tokenB);
    console.log(`Status: ${getUserTeamsResult.status}`);
    console.log(`Teams:`, JSON.stringify(getUserTeamsResult.data.teams, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS COMPLETED');

    // Close DB connection cleanly
    await sequelize.close();
}

runTests().catch(async (error) => {
    console.error(error);
    await sequelize.close();
});
