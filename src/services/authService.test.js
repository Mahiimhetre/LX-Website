import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { login, register, verifyEmail, logout } from './authService.js';

vi.mock('../api/client', () => {
    return {
        default: {
            post: vi.fn(() => Promise.resolve({ data: { success: true } })),
            get: vi.fn(() => Promise.resolve({ data: { success: true } })),
        }
    };
});

describe('authService', () => {
    const USERS_KEY = 'locatorx_users';
    const VERIFICATION_TOKENS_KEY = 'locatorx_verification_tokens';
    const CURRENT_USER_KEY = 'locatorx_current_user';

    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
        localStorage.clear();
    });

    describe('logout', () => {
        it('should remove CURRENT_USER_KEY from localStorage', () => {
            const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ id: '123' }));

            logout();

            expect(removeItemSpy).toHaveBeenCalledWith(CURRENT_USER_KEY);
            expect(localStorage.getItem(CURRENT_USER_KEY)).toBeNull();

            removeItemSpy.mockRestore();
        });
    });

    describe('verifyEmail', () => {
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

    describe('login rate limiting', () => {
        const testEmail = 'test@example.com';
        const testPassword = 'password123';

        beforeEach(async () => {
            // Register a user for testing
            await register('Test User', testEmail, testPassword);

            // Mock auto-verify directly for testing purposes
            const tokens = JSON.parse(localStorage.getItem(VERIFICATION_TOKENS_KEY));
            if (tokens && tokens.length > 0) {
                const token = tokens[0][0];
                verifyEmail(token);
            }
        });

        it('should decrement remaining attempts on failed login', async () => {
            const result = await login(testEmail, 'wrongpassword');
            expect(result.success).toBe(false);
            expect(result.remainingAttempts).toBe(4);
        });

        it('should lockout user after 5 failed attempts', async () => {
            for (let i = 0; i < 4; i++) {
                await login(testEmail, 'wrongpassword');
            }

            const result = await login(testEmail, 'wrongpassword');
            expect(result.success).toBe(false);
            expect(result.remainingAttempts).toBe(0);
            expect(result.message).toContain('Account locked for 15 minutes');
        });

        it('should prevent login when locked out, even with correct password', async () => {
            // Lock out user
            for (let i = 0; i < 5; i++) {
                await login(testEmail, 'wrongpassword');
            }

            // Attempt with correct password
            const result = await login(testEmail, testPassword);
            expect(result.success).toBe(false);
            expect(result.remainingAttempts).toBe(0);
            expect(result.message).toContain('Too many failed login attempts');
        });

        it('should reset lockout after LOCKOUT_DURATION', async () => {
            // Lock out user
            for (let i = 0; i < 5; i++) {
                await login(testEmail, 'wrongpassword');
            }

            // Fast forward 15 minutes + 1 second
            vi.advanceTimersByTime(15 * 60 * 1000 + 1000);

            const result = await login(testEmail, testPassword);
            expect(result.success).toBe(true);
            expect(result.message).toBe('Login successful');
        });

        it('should clear login attempts upon successful login', async () => {
            // Fail once
            await login(testEmail, 'wrongpassword');

            // Fail again to check count
            const failedResult = await login(testEmail, 'wrongpassword');
            expect(failedResult.remainingAttempts).toBe(3);

            // Successful login should clear the attempts
            await login(testEmail, testPassword);

            // Fail again, count should be reset
            const resultAfterSuccess = await login(testEmail, 'wrongpassword');
            expect(resultAfterSuccess.remainingAttempts).toBe(4);
        });

        it('should record failed attempt for non-existent users (prevents email enumeration)', async () => {
            const nonExistentEmail = 'nonexistent@example.com';

            for (let i = 0; i < 4; i++) {
                const res = await login(nonExistentEmail, 'wrongpassword');
                expect(res.remainingAttempts).toBe(4 - i);
            }

            const lockoutResult = await login(nonExistentEmail, 'wrongpassword');
            expect(lockoutResult.success).toBe(false);
            expect(lockoutResult.remainingAttempts).toBe(0);
            expect(lockoutResult.message).toContain('Too many failed login attempts');
        });
    });
});
