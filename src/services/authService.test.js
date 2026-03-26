import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { login, register } from './authService';

describe('authService', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
    });

    describe('login rate limiting', () => {
        const testEmail = 'test@example.com';
        const testPassword = 'password123';

        beforeEach(async () => {
            // Register a user for testing
            await register('Test User', testEmail, testPassword);

            // Note: register auto-verifies after 2000ms, let's fast forward
            vi.advanceTimersByTime(2500);
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
