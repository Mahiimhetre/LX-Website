import { describe, it, expect, beforeEach } from 'vitest';
import { register, login, resetPassword, changePassword, verifyEmail } from './authService.js';

describe('authService - Password Hashing', () => {
    const USERS_KEY = 'locatorx_users';
    const VERIFICATION_TOKENS_KEY = 'locatorx_verification_tokens';
    const RESET_TOKENS_KEY = 'locatorx_reset_tokens';

    beforeEach(() => {
        localStorage.clear();
    });

    it('should register a user with a hashed password', async () => {
        const password = 'password123';
        const result = await register('Test User', 'test@example.com', password);
        expect(result.success).toBe(true);

        const users = new Map(JSON.parse(localStorage.getItem(USERS_KEY)));
        const user = Array.from(users.values())[0];

        expect(user.password).toContain('pbkdf2:');
        expect(user.password).not.toBe(password);
    });

    it('should login successfully with a hashed password', async () => {
        const password = 'password123';
        const email = 'test@example.com';

        // Register user first
        await register('Test User', email, password);

        // Manually verify email to allow login
        const tokens = new Map(JSON.parse(localStorage.getItem(VERIFICATION_TOKENS_KEY)));
        const token = Array.from(tokens.keys())[0];
        verifyEmail(token);

        const loginResult = await login(email, password);
        expect(loginResult.success).toBe(true);
        expect(loginResult.message).toBe('Login successful');
    });

    it('should login successfully with a plain-text password (fallback)', async () => {
        const password = 'plainpassword';
        const email = 'plain@example.com';

        // Manually inject a plain-text user
        const users = new Map([
            ['user1', { id: 'user1', name: 'Plain User', email, password, isVerified: true }]
        ]);
        localStorage.setItem(USERS_KEY, JSON.stringify(Array.from(users.entries())));

        const loginResult = await login(email, password);
        expect(loginResult.success).toBe(true);
    });

    it('should fail login with incorrect password (hashed)', async () => {
        const password = 'password123';
        const email = 'test@example.com';

        await register('Test User', email, password);

        const loginResult = await login(email, 'wrongpassword');
        expect(loginResult.success).toBe(false);
        expect(loginResult.message).toContain('Invalid password');
    });

    it('should reset password and store it as a hash', async () => {
        const email = 'test@example.com';
        const initialPassword = 'initialPassword';
        const newPassword = 'newSecurePassword';

        await register('Test User', email, initialPassword);

        // Request reset
        await requestPasswordReset(email); // Note: I didn't export it in my previous check but it is exported in authService.js

        const resetTokens = new Map(JSON.parse(localStorage.getItem(RESET_TOKENS_KEY)));
        const token = Array.from(resetTokens.keys())[0];

        const resetResult = await resetPassword(token, newPassword);
        expect(resetResult.success).toBe(true);

        const users = new Map(JSON.parse(localStorage.getItem(USERS_KEY)));
        const user = Array.from(users.values())[0];

        expect(user.password).toContain('pbkdf2:');

        // Verify we can login with the new password
        // Manually verify email just in case (though it was already registered)
        user.isVerified = true;
        users.set(user.id, user);
        localStorage.setItem(USERS_KEY, JSON.stringify(Array.from(users.entries())));

        const loginResult = await login(email, newPassword);
        expect(loginResult.success).toBe(true);
    });

    it('should change password and store it as a hash', async () => {
        const email = 'test@example.com';
        const currentPassword = 'currentPassword';
        const newPassword = 'newSecurePassword123';

        await register('Test User', email, currentPassword);

        const changeResult = await changePassword(email, currentPassword, newPassword);
        expect(changeResult.success).toBe(true);

        const users = new Map(JSON.parse(localStorage.getItem(USERS_KEY)));
        const user = Array.from(users.values())[0];

        expect(user.password).toContain('pbkdf2:');

        // Manually verify email
        user.isVerified = true;
        users.set(user.id, user);
        localStorage.setItem(USERS_KEY, JSON.stringify(Array.from(users.entries())));

        const loginResult = await login(email, newPassword);
        expect(loginResult.success).toBe(true);
    });
});

// Helper for requesting password reset if not directly imported from authService.js
async function requestPasswordReset(email) {
    const { requestPasswordReset: req } = await import('./authService.js');
    return req(email);
}
