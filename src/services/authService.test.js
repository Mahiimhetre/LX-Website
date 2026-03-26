import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { verifyEmail } from './authService.js';

describe('authService - verifyEmail', () => {
    const USERS_KEY = 'locatorx_users';
    const VERIFICATION_TOKENS_KEY = 'locatorx_verification_tokens';

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
