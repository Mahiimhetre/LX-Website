import bcrypt from 'bcrypt';
import { User, Profile, sequelize } from './models/index.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const setupTestUser = async () => {
    try {
        console.log('Setting up test user...');
        
        const testEmail = 'apitest@locatorx.dev';
        const testPassword = 'ApiTest@12345!';
        const testName = 'API Test User';
        
        // Check if user already exists
        let user = await User.findOne({ where: { email: testEmail } });
        
        if (user) {
            console.log(`✓ Test user already exists: ${testEmail}`);
            return testEmail;
        }
        
        // Create user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(testPassword, salt);
        
        user = await User.create({
            email: testEmail,
            password: hashedPassword
        });
        
        // Create profile
        await Profile.create({
            userId: user.id,
            name: testName,
            plan: 'free',
            isVerified: true  // Mark as verified so it can login immediately
        });
        
        console.log(`✓ Test user created: ${testEmail}`);
        console.log(`  Password: ${testPassword}`);
        console.log(`  ID: ${user.id}`);
        
        return testEmail;
    } catch (error) {
        console.error('Error setting up test user:', error.message);
        process.exit(1);
    }
};

// Run setup
await setupTestUser();
process.exit(0);
