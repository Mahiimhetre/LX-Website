import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { verifyEmail } from '../authService.js';

describe('authService - verifyEmail', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should return error for invalid token', () => {
        const result = verifyEmail('invalid-token');
        expect(result).toEqual({ success: false, message: 'Invalid verification token' });
    });

    it('should handle expired verification token', () => {
        // Setup mock data in localStorage
        const token = 'expired-token-123';
        const email = 'test@example.com';

        // Setup an expired token (expires in the past)
        const expiredTokens = new Map([
            [token, { email, expires: Date.now() - 1000 }] // Expired 1 second ago
        ]);

        localStorage.setItem('locatorx_verification_tokens', JSON.stringify(Array.from(expiredTokens.entries())));

        // Call verifyEmail
        const result = verifyEmail(token);

        // Assert expected output
        expect(result).toEqual({ success: false, message: 'Verification token has expired' });

        // Assert token is removed from localStorage
        const tokensData = localStorage.getItem('locatorx_verification_tokens');
        const remainingTokens = new Map(JSON.parse(tokensData));
        expect(remainingTokens.has(token)).toBe(false);
    });

    it('should verify email successfully for valid token', () => {
        // Setup mock data
        const token = 'valid-token-123';
        const email = 'test@example.com';
        const userId = 'user-123';

        // Setup valid token
        const validTokens = new Map([
            [token, { email, expires: Date.now() + 10000 }] // Expires in 10 seconds
        ]);
        localStorage.setItem('locatorx_verification_tokens', JSON.stringify(Array.from(validTokens.entries())));

        // Setup user
        const users = new Map([
            [userId, { id: userId, email, isVerified: false }]
        ]);
        localStorage.setItem('locatorx_users', JSON.stringify(Array.from(users.entries())));

        // Call verifyEmail
        const result = verifyEmail(token);

        // Assert successful output
        expect(result).toEqual({ success: true, message: 'Email verified successfully' });

        // Assert user is marked as verified
        const updatedUsers = new Map(JSON.parse(localStorage.getItem('locatorx_users')));
        expect(updatedUsers.get(userId).isVerified).toBe(true);

        // Assert token is removed
        const tokensData = localStorage.getItem('locatorx_verification_tokens');
        const remainingTokens = new Map(JSON.parse(tokensData));
        expect(remainingTokens.has(token)).toBe(false);
    });
});
