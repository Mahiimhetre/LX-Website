import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { register, verifyEmail } from './authService.js';

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

describe('authService - register', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        vi.useFakeTimers(); // Mock timers for setTimeout
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('should register a new user successfully', async () => {
        const result = await register('Test User', 'test@example.com', 'password123');

        expect(result.success).toBe(true);
        expect(result.message).toBe('Registration successful. Please check your email to verify your account.');
        expect(result.user).toBeDefined();
        expect(result.user.name).toBe('Test User');
        expect(result.user.email).toBe('test@example.com');
        expect(result.user.password).toBeUndefined(); // Should not return password
        expect(result.user.isVerified).toBe(false);

        // Check if user is saved in localStorage
        const usersData = localStorage.getItem('locatorx_users');
        expect(usersData).toBeDefined();
        const users = new Map(JSON.parse(usersData));
        expect(users.size).toBe(1);
        const savedUser = Array.from(users.values())[0];
        expect(savedUser.email).toBe('test@example.com');
        expect(savedUser.password).toBe('password123'); // Saved in localStorage

        // Check if verification token is generated
        const tokensData = localStorage.getItem('locatorx_verification_tokens');
        expect(tokensData).toBeDefined();
        const tokens = new Map(JSON.parse(tokensData));
        expect(tokens.size).toBe(1);
        const savedToken = Array.from(tokens.values())[0];
        expect(savedToken.email).toBe('test@example.com');

        // Test auto-verification (setTimeout)
        vi.advanceTimersByTime(2000); // Fast-forward 2 seconds

        // After 2 seconds, the user should be verified and the token should be deleted
        const updatedUsersData = localStorage.getItem('locatorx_users');
        const updatedUsers = new Map(JSON.parse(updatedUsersData));
        const updatedUser = Array.from(updatedUsers.values())[0];
        expect(updatedUser.isVerified).toBe(true);

        const updatedTokensData = localStorage.getItem('locatorx_verification_tokens');
        const updatedTokens = new Map(JSON.parse(updatedTokensData));
        expect(updatedTokens.size).toBe(0);
    });

    it('should return error if email is already registered', async () => {
        // Seed a user
        const initialUsers = new Map([
            ['userId1', { id: 'userId1', email: 'existing@example.com', password: 'password123' }]
        ]);
        localStorage.setItem('locatorx_users', JSON.stringify(Array.from(initialUsers.entries())));

        const result = await register('New User', 'existing@example.com', 'password123');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Email already registered');
    });

    it('should return error if email is already registered (case-insensitive)', async () => {
        // Seed a user with uppercase email
        const initialUsers = new Map([
            ['userId1', { id: 'userId1', email: 'ExiStinG@ExAmPlE.CoM', password: 'password123' }]
        ]);
        localStorage.setItem('locatorx_users', JSON.stringify(Array.from(initialUsers.entries())));

        // Attempt to register with lowercase email
        const result = await register('New User', 'existing@example.com', 'password123');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Email already registered');
    });

    it('should return error if password is less than 8 characters', async () => {
        const result = await register('Test User', 'test@example.com', 'short');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Password must be at least 8 characters');
    });
});
