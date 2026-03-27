import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { login, register, getCurrentUser, verifyEmail, checkVerificationStatus } from './authService.js';

const USERS_KEY = 'locatorx_users';
const VERIFICATION_TOKENS_KEY = 'locatorx_verification_tokens';

describe('authService', () => {
    describe('authService - verifyEmail', () => {
        beforeEach(() => {
            localStorage.clear();
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return success: false for an invalid token', () => {
            const result = verifyEmail('invalid-token');
            expect(result).toEqual({ success: false, message: 'Invalid verification token' });
        });

        it('should return success: false and delete the token if it has expired', () => {
            const now = 1000000;
            vi.setSystemTime(now);

            const token = 'expired-token';
            const tokens = new Map([
                [token, { email: 'test@example.com', expires: now - 1000 }] // Expired 1 second ago
            ]);
            localStorage.setItem(VERIFICATION_TOKENS_KEY, JSON.stringify(Array.from(tokens.entries())));

            const result = verifyEmail(token);
            expect(result).toEqual({ success: false, message: 'Verification token has expired' });

            // Verify token was deleted
            const updatedTokens = new Map(JSON.parse(localStorage.getItem(VERIFICATION_TOKENS_KEY)));
            expect(updatedTokens.has(token)).toBe(false);
        });

        it('should return success: false if the user is not found', () => {
            const now = 1000000;
            vi.setSystemTime(now);

            const token = 'valid-token';
            const tokens = new Map([
                [token, { email: 'nonexistent@example.com', expires: now + 10000 }] // Valid token
            ]);
            localStorage.setItem(VERIFICATION_TOKENS_KEY, JSON.stringify(Array.from(tokens.entries())));

            const users = new Map([
                ['user1', { id: 'user1', email: 'other@example.com', isVerified: false }]
            ]);
            localStorage.setItem(USERS_KEY, JSON.stringify(Array.from(users.entries())));

            const result = verifyEmail(token);
            expect(result).toEqual({ success: false, message: 'User not found' });
        });

        it('should return success: true, verify user, and delete token when successful', () => {
            const now = 1000000;
            vi.setSystemTime(now);

            const token = 'valid-token';
            const targetEmail = 'test@example.com';
            const tokens = new Map([
                [token, { email: targetEmail, expires: now + 10000 }] // Valid token
            ]);
            localStorage.setItem(VERIFICATION_TOKENS_KEY, JSON.stringify(Array.from(tokens.entries())));

            const users = new Map([
                ['user1', { id: 'user1', email: 'other@example.com', isVerified: false }],
                ['user2', { id: 'user2', email: targetEmail, isVerified: false }]
            ]);
            localStorage.setItem(USERS_KEY, JSON.stringify(Array.from(users.entries())));

            const result = verifyEmail(token);
            expect(result).toEqual({ success: true, message: 'Email verified successfully' });

            // Verify user is verified
            const updatedUsers = new Map(JSON.parse(localStorage.getItem(USERS_KEY)));
            expect(updatedUsers.get('user2').isVerified).toBe(true);
            expect(updatedUsers.get('user1').isVerified).toBe(false); // Other user unaffected

            // Verify token was deleted
            const updatedTokens = new Map(JSON.parse(localStorage.getItem(VERIFICATION_TOKENS_KEY)));
            expect(updatedTokens.has(token)).toBe(false);
        });
    });

    describe('authService - login', () => {
        beforeEach(() => {
            localStorage.clear();
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.runOnlyPendingTimers();
            vi.useRealTimers();
        });

        it('should successfully log in a verified user', async () => {
            const email = 'test@example.com';
            const password = 'Password123!';

            // Register user
            const regResult = await register('Test User', email, password);
            expect(regResult.success).toBe(true);

            // Advance timers so auto-verify runs (2000ms delay in register)
            vi.advanceTimersByTime(2500);

            // Wait a bit to ensure async completes if needed
            await Promise.resolve();

            // Check if verified
            const isVerified = checkVerificationStatus(email);
            expect(isVerified).toBe(true);

            // Login
            const loginResult = await login(email, password);
            expect(loginResult.success).toBe(true);
            expect(loginResult.message).toBe('Login successful');
            expect(loginResult.user.email).toBe(email);
            expect(loginResult.user).not.toHaveProperty('password');

            // Check current user
            const currentUser = getCurrentUser();
            expect(currentUser).not.toBeNull();
            expect(currentUser.email).toBe(email);
        });

        it('should fail to log in with an incorrect password', async () => {
            const email = 'test2@example.com';
            const password = 'Password123!';

            await register('Test User 2', email, password);
            vi.advanceTimersByTime(2500);

            const loginResult = await login(email, 'WrongPassword!');
            expect(loginResult.success).toBe(false);
            expect(loginResult.message).toContain('Invalid password');
            expect(loginResult.remainingAttempts).toBeLessThan(5);
        });

        it('should fail to log in an unverified user', async () => {
            const email = 'test3@example.com';
            const password = 'Password123!';

            // Register user
            await register('Test User 3', email, password);

            // Don't advance timers! User stays unverified.

            const loginResult = await login(email, password);
            expect(loginResult.success).toBe(false);
            expect(loginResult.message).toBe('Please verify your email before logging in');
        });

        it('should enforce rate limits on failed logins', async () => {
            const email = 'test4@example.com';
            const password = 'Password123!';

            await register('Test User 4', email, password);
            vi.advanceTimersByTime(2500);

            // 5 failed attempts
            for (let i = 0; i < 5; i++) {
                const loginResult = await login(email, 'WrongPassword!');
                expect(loginResult.success).toBe(false);
                if (i < 4) {
                    expect(loginResult.message).toContain('Invalid password');
                } else {
                    expect(loginResult.message).toContain('Too many failed login attempts. Account locked for');
                    expect(loginResult.remainingAttempts).toBe(0);
                    expect(loginResult.lockoutTime).toBeGreaterThan(0);
                }
            }

            // 6th attempt should be blocked immediately by rate limit check
            const blockedResult = await login(email, 'WrongPassword!');
            expect(blockedResult.success).toBe(false);
            expect(blockedResult.message).toContain('Too many failed login attempts. Please try again in');
            expect(blockedResult.remainingAttempts).toBe(0);
        });

        it('should record failed attempts even for non-existent users', async () => {
            const email = 'nonexistent@example.com';

            for (let i = 0; i < 5; i++) {
                const loginResult = await login(email, 'Password123!');
                expect(loginResult.success).toBe(false);
                if (i < 4) {
                    expect(loginResult.message).toContain('Invalid credentials');
                } else {
                    expect(loginResult.message).toContain('Too many failed login attempts. Please try again in');
                    expect(loginResult.remainingAttempts).toBe(0);
                }
            }
        });
    });
});
