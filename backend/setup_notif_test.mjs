import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { User, Profile, Team, TeamMember, TeamInvitation, sequelize } from './models/index.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const setupNotifTest = async () => {
    try {
        console.log('Setting up notification test user and invitation...');

        const ownerEmail = 'apitest@locatorx.dev';
        const ownerPassword = 'ApiTest@12345!';
        const testEmail = 'notiftest@locatorx.dev';
        const testPassword = 'Password123!';

        // Ensure owner exists
        let owner = await User.findOne({ where: { email: ownerEmail } });
        if (!owner) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(ownerPassword, salt);
            owner = await User.create({
                email: ownerEmail,
                password: hashedPassword
            });
            await Profile.create({
                userId: owner.id,
                name: 'API Test Owner',
                plan: 'free',
                isVerified: true
            });
            console.log(`✓ Owner created: ${ownerEmail}`);
        } else {
            console.log(`✓ Owner already exists: ${ownerEmail}`);
        }

        // Ensure owner has a team
        let team = await Team.findOne({ where: { ownerId: owner.id } });
        if (!team) {
            team = await Team.create({
                name: 'Notification Test Team',
                ownerId: owner.id,
                memberCount: 1
            });
            await TeamMember.create({
                teamId: team.id,
                userId: owner.id,
                role: 'admin'
            });
            console.log(`✓ Team created: ${team.name}`);
        } else {
            console.log(`✓ Team already exists: ${team.name}`);
        }

        // Clean up target test user if exists
        let targetUser = await User.findOne({ where: { email: testEmail } });
        if (targetUser) {
            // Delete invitations for this email to be clean
            await TeamInvitation.destroy({ where: { email: testEmail } });
            // Delete members
            await TeamMember.destroy({ where: { userId: targetUser.id } });
            // Delete profile
            await Profile.destroy({ where: { userId: targetUser.id } });
            // Delete user
            await targetUser.destroy();
            console.log(`✓ Cleaned up old test user: ${testEmail}`);
        }

        // Create target test user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(testPassword, salt);
        targetUser = await User.create({
            email: testEmail,
            password: hashedPassword
        });
        await Profile.create({
            userId: targetUser.id,
            name: 'Notif Test User',
            plan: 'free',
            isVerified: true
        });
        console.log(`✓ Target test user created: ${testEmail}`);

        // Create a pending invitation
        const token = crypto.randomBytes(32).toString('hex');
        const invitation = await TeamInvitation.create({
            teamId: team.id,
            email: testEmail,
            role: 'member',
            invitedBy: owner.id,
            token: token,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        console.log(`✓ Pending invitation created for ${testEmail} to join "${team.name}"`);
        console.log(`  Invitation Token: ${token}`);

        console.log('\nSeed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding notification test data:', error);
        process.exit(1);
    }
};

await setupNotifTest();
