import { User, Profile, connectDB } from './models/index.js';

async function verifyUser() {
    try {
        await connectDB();
        const user = await User.findOne({ where: { email: 'test-user-789@example.com' } });
        if (user) {
            await Profile.update({ isVerified: true }, { where: { userId: user.id } });
            console.log('User verified successfully');
        } else {
            console.log('User not found');
        }
    } catch (error) {
        console.error('Error verifying user:', error);
    } finally {
        process.exit(0);
    }
}

verifyUser();
