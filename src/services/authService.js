
// Mock Authentication Service
// Replicates backend behavior using localStorage

const USERS_KEY = 'locatorx_users';
const CURRENT_USER_KEY = 'locatorx_current_user';
const VERIFICATION_TOKENS_KEY = 'locatorx_verification_tokens';
const PASSWORD_RESET_TOKENS_KEY = 'locatorx_reset_tokens';
const LOGIN_ATTEMPTS_KEY = 'locatorx_login_attempts';

// Token expiry configuration (in milliseconds) - matching original backend
const TOKEN_EXPIRY = {
    VERIFICATION: 10 * 60 * 1000,        // 10 minutes
    PASSWORD_RESET: 24 * 60 * 60 * 1000, // 24 hours
};

// Rate limiting configuration
const RATE_LIMIT = {
    MAX_ATTEMPTS: 5,                     // Max failed attempts before lockout
    LOCKOUT_DURATION: 15 * 60 * 1000,    // 15 minutes lockout
    ATTEMPT_WINDOW: 30 * 60 * 1000,      // 30 minutes window for counting attempts
};

// Password hashing utility using Web Crypto API
const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const HASH_ALGORITHM = 'SHA-256';

const hashPassword = async (password) => {
    const salt = globalThis.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const passwordBuffer = new TextEncoder().encode(password);

    const baseKey = await globalThis.crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    const hashBuffer = await globalThis.crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: HASH_ALGORITHM,
        },
        baseKey,
        256
    );

    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    return `pbkdf2:${PBKDF2_ITERATIONS}:${saltHex}:${hashHex}`;
};

const verifyPassword = async (password, storedHash) => {
    if (!storedHash.startsWith('pbkdf2:')) {
        // Fallback for plain-text passwords during transition
        return password === storedHash;
    }

    const parts = storedHash.split(':');
    if (parts.length !== 4) return false;

    const iterations = parseInt(parts[1], 10);
    const saltHex = parts[2];
    const hashHex = parts[3];

    const salt = new Uint8Array(saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const passwordBuffer = new TextEncoder().encode(password);

    const baseKey = await globalThis.crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    const hashBuffer = await globalThis.crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: iterations,
            hash: HASH_ALGORITHM,
        },
        baseKey,
        256
    );

    const currentHashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    return currentHashHex === hashHex;
};

// Helper functions
const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15) +
        Date.now().toString(36);
};

const getUsers = () => {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) return new Map();
    const arr = JSON.parse(data);
    return new Map(arr);
};

const saveUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(Array.from(users.entries())));
};

const getVerificationTokens = () => {
    const data = localStorage.getItem(VERIFICATION_TOKENS_KEY);
    if (!data) return new Map();
    return new Map(JSON.parse(data));
};

const saveVerificationTokens = (tokens) => {
    localStorage.setItem(VERIFICATION_TOKENS_KEY, JSON.stringify(Array.from(tokens.entries())));
};

const getResetTokens = () => {
    const data = localStorage.getItem(PASSWORD_RESET_TOKENS_KEY);
    if (!data) return new Map();
    return new Map(JSON.parse(data));
};

const saveResetTokens = (tokens) => {
    localStorage.setItem(PASSWORD_RESET_TOKENS_KEY, JSON.stringify(Array.from(tokens.entries())));
};

// Login attempts helpers
const getLoginAttempts = () => {
    const data = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    if (!data) return new Map();
    return new Map(JSON.parse(data));
};

const saveLoginAttempts = (attempts) => {
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(Array.from(attempts.entries())));
};

const checkRateLimit = (email) => {
    const attempts = getLoginAttempts();
    const emailLower = email.toLowerCase();
    const record = attempts.get(emailLower);

    if (!record) {
        return { allowed: true, remainingAttempts: RATE_LIMIT.MAX_ATTEMPTS, lockoutTime: null };
    }

    const now = Date.now();

    // Check if currently locked out
    if (record.lockedUntil && now < record.lockedUntil) {
        const remainingLockout = Math.ceil((record.lockedUntil - now) / 1000);
        return { allowed: false, remainingAttempts: 0, lockoutTime: remainingLockout };
    }

    // Reset if lockout expired or attempt window passed
    if (record.lockedUntil && now >= record.lockedUntil) {
        attempts.delete(emailLower);
        saveLoginAttempts(attempts);
        return { allowed: true, remainingAttempts: RATE_LIMIT.MAX_ATTEMPTS, lockoutTime: null };
    }

    // Reset attempts if outside the window
    if (now - record.lastAttempt > RATE_LIMIT.ATTEMPT_WINDOW) {
        attempts.delete(emailLower);
        saveLoginAttempts(attempts);
        return { allowed: true, remainingAttempts: RATE_LIMIT.MAX_ATTEMPTS, lockoutTime: null };
    }

    const remaining = RATE_LIMIT.MAX_ATTEMPTS - record.attempts;
    return { allowed: remaining > 0, remainingAttempts: remaining, lockoutTime: null };
};

const recordFailedAttempt = (email) => {
    const attempts = getLoginAttempts();
    const emailLower = email.toLowerCase();
    const now = Date.now();

    let record = attempts.get(emailLower);

    if (!record || now - record.lastAttempt > RATE_LIMIT.ATTEMPT_WINDOW) {
        record = { attempts: 1, lastAttempt: now, lockedUntil: null };
    } else {
        record.attempts += 1;
        record.lastAttempt = now;
    }

    const remaining = RATE_LIMIT.MAX_ATTEMPTS - record.attempts;

    // Lock out if max attempts reached
    if (record.attempts >= RATE_LIMIT.MAX_ATTEMPTS) {
        record.lockedUntil = now + RATE_LIMIT.LOCKOUT_DURATION;
        attempts.set(emailLower, record);
        saveLoginAttempts(attempts);
        return {
            remainingAttempts: 0,
            lockedOut: true,
            lockoutTime: Math.ceil(RATE_LIMIT.LOCKOUT_DURATION / 1000)
        };
    }

    attempts.set(emailLower, record);
    saveLoginAttempts(attempts);
    return { remainingAttempts: remaining, lockedOut: false, lockoutTime: 0 };
};

const clearLoginAttempts = (email) => {
    const attempts = getLoginAttempts();
    attempts.delete(email.toLowerCase());
    saveLoginAttempts(attempts);
};
export const register = async (name, email, password) => {
    const users = getUsers();

    // Check if email already exists
    for (const [, user] of users) {
        if (user.email.toLowerCase() === email.toLowerCase()) {
            return { success: false, message: 'Email already registered' };
        }
    }

    // Validate password
    if (password.length < 8) {
        return { success: false, message: 'Password must be at least 8 characters' };
    }

    const userId = generateId();
    const hashedPassword = await hashPassword(password);
    const newUser = {
        id: userId,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        isVerified: false,
        createdAt: new Date().toISOString(),
    };

    users.set(userId, newUser);
    saveUsers(users);

    // Generate verification token
    const token = generateToken();
    const tokens = getVerificationTokens();
    tokens.set(token, {
        email: email.toLowerCase(),
        expires: Date.now() + TOKEN_EXPIRY.VERIFICATION,
    });
    saveVerificationTokens(tokens);

    // Auto-verify for demo purposes (in real app, this would send an email)
    setTimeout(() => {
        verifyEmail(token);
    }, 2000);

    const { password: _, ...userWithoutPassword } = newUser;
    return {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        user: userWithoutPassword,
    };
};

export const login = async (email, password) => {
    // Check rate limit first
    const rateCheck = checkRateLimit(email);
    if (!rateCheck.allowed) {
        const minutes = Math.ceil((rateCheck.lockoutTime || 0) / 60);
        return {
            success: false,
            message: `Too many failed login attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
            remainingAttempts: 0,
            lockoutTime: rateCheck.lockoutTime || undefined
        };
    }

    const users = getUsers();

    for (const [, user] of users) {
        if (user.email.toLowerCase() === email.toLowerCase()) {
            const isPasswordCorrect = await verifyPassword(password, user.password);
            if (!isPasswordCorrect) {
                const attemptResult = recordFailedAttempt(email);
                if (attemptResult.lockedOut) {
                    const minutes = Math.ceil(attemptResult.lockoutTime / 60);
                    return {
                        success: false,
                        message: `Too many failed login attempts. Account locked for ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
                        remainingAttempts: 0,
                        lockoutTime: attemptResult.lockoutTime
                    };
                }
                return {
                    success: false,
                    message: `Invalid password. ${attemptResult.remainingAttempts} attempt${attemptResult.remainingAttempts !== 1 ? 's' : ''} remaining.`,
                    remainingAttempts: attemptResult.remainingAttempts
                };
            }

            if (!user.isVerified) {
                return { success: false, message: 'Please verify your email before logging in' };
            }

            // Clear failed attempts on successful login
            clearLoginAttempts(email);

            const { password: _, ...userWithoutPassword } = user;
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

            return { success: true, message: 'Login successful', user: userWithoutPassword };
        }
    }

    // Record failed attempt even for non-existent users (prevents email enumeration)
    const attemptResult = recordFailedAttempt(email);
    if (attemptResult.lockedOut) {
        const minutes = Math.ceil(attemptResult.lockoutTime / 60);
        return {
            success: false,
            message: `Too many failed login attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
            remainingAttempts: 0,
            lockoutTime: attemptResult.lockoutTime
        };
    }
    return {
        success: false,
        message: `Invalid credentials. ${attemptResult.remainingAttempts} attempt${attemptResult.remainingAttempts !== 1 ? 's' : ''} remaining.`,
        remainingAttempts: attemptResult.remainingAttempts
    };
};

export const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = () => {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (!data) return null;
    return JSON.parse(data);
};

export const verifyEmail = (token) => {
    const tokens = getVerificationTokens();
    const tokenData = tokens.get(token);

    if (!tokenData) {
        return { success: false, message: 'Invalid verification token' };
    }

    if (Date.now() > tokenData.expires) {
        tokens.delete(token);
        saveVerificationTokens(tokens);
        return { success: false, message: 'Verification token has expired' };
    }

    const users = getUsers();
    for (const [id, user] of users) {
        if (user.email === tokenData.email) {
            user.isVerified = true;
            users.set(id, user);
            saveUsers(users);
            tokens.delete(token);
            saveVerificationTokens(tokens);
            return { success: true, message: 'Email verified successfully' };
        }
    }

    return { success: false, message: 'User not found' };
};

export const requestPasswordReset = async (email) => {
    const users = getUsers();
    let userExists = false;

    for (const [, user] of users) {
        if (user.email.toLowerCase() === email.toLowerCase()) {
            userExists = true;
            break;
        }
    }

    if (!userExists) {
        return { success: false, message: 'No account found with this email' };
    }

    const token = generateToken();
    const tokens = getResetTokens();
    tokens.set(token, {
        email: email.toLowerCase(),
        expires: Date.now() + TOKEN_EXPIRY.PASSWORD_RESET,
    });
    saveResetTokens(tokens);

    // In real app, this would send an email with the reset link

    return { success: true, message: 'Password reset link sent to your email' };
};

export const resetPassword = async (token, newPassword) => {
    const tokens = getResetTokens();
    const tokenData = tokens.get(token);

    if (!tokenData) {
        return { success: false, message: 'Invalid reset token' };
    }

    if (Date.now() > tokenData.expires) {
        tokens.delete(token);
        saveResetTokens(tokens);
        return { success: false, message: 'Reset token has expired' };
    }

    if (newPassword.length < 8) {
        return { success: false, message: 'Password must be at least 8 characters' };
    }

    const users = getUsers();
    for (const [id, user] of users) {
        if (user.email === tokenData.email) {
            user.password = await hashPassword(newPassword);
            users.set(id, user);
            saveUsers(users);
            tokens.delete(token);
            saveResetTokens(tokens);
            return { success: true, message: 'Password reset successfully' };
        }
    }

    return { success: false, message: 'User not found' };
};

export const changePassword = async (
    email,
    currentPassword,
    newPassword
) => {
    const users = getUsers();

    for (const [id, user] of users) {
        if (user.email.toLowerCase() === email.toLowerCase()) {
            const isPasswordCorrect = await verifyPassword(currentPassword, user.password);
            if (!isPasswordCorrect) {
                return { success: false, message: 'Current password is incorrect' };
            }

            if (newPassword.length < 8) {
                return { success: false, message: 'New password must be at least 8 characters' };
            }

            user.password = await hashPassword(newPassword);
            users.set(id, user);
            saveUsers(users);

            return { success: true, message: 'Password changed successfully' };
        }
    }

    return { success: false, message: 'User not found' };
};

export const resendVerification = async (email) => {
    const users = getUsers();

    for (const [, user] of users) {
        if (user.email.toLowerCase() === email.toLowerCase()) {
            if (user.isVerified) {
                return { success: false, message: 'Email is already verified' };
            }

            const token = generateToken();
            const tokens = getVerificationTokens();
            tokens.set(token, {
                email: email.toLowerCase(),
                expires: Date.now() + TOKEN_EXPIRY.VERIFICATION,
            });
            saveVerificationTokens(tokens);

            // Auto-verify for demo purposes
            setTimeout(() => {
                verifyEmail(token);
            }, 2000);

            return { success: true, message: 'Verification email resent' };
        }
    }

    return { success: false, message: 'User not found' };
};

export const checkVerificationStatus = (email) => {
    const users = getUsers();

    for (const [, user] of users) {
        if (user.email.toLowerCase() === email.toLowerCase()) {
            return user.isVerified;
        }
    }

    return false;
};
