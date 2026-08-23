import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, Profile, UserSession, SecurityAuditLog, TeamInvitation } from '../models/index.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendPasswordChangedEmail, sendOAuthWelcomeEmail } from '../utils/emailService.jsx';

const generateToken = (userId, email, jti) => {
    return jwt.sign({ id: userId, email, jti }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

const failedAttemptsCache = new Map();

const getCacheRecord = (email) => {
    const emailLower = email.toLowerCase().trim();
    let record = failedAttemptsCache.get(emailLower);
    const now = Date.now();
    if (!record) {
        record = { attempts: 0, lastAttempt: 0, lockedUntil: null };
    }
    if (record.lockedUntil && now > record.lockedUntil) {
        record.attempts = 0;
        record.lockedUntil = null;
    }
    return record;
};

const setCacheRecord = (email, record) => {
    failedAttemptsCache.set(email.toLowerCase().trim(), record);
};

const safeCompare = (a, b) => {
    const aHash = crypto.createHash('sha256').update(a).digest();
    const bHash = crypto.createHash('sha256').update(b).digest();
    return crypto.timingSafeEqual(aHash, bHash);
};

// Input sanitization and email masking helpers for secure logging
const sanitizeLogInput = (input) => {
    if (typeof input !== 'string') return '';
    return input.replace(/[\r\n]/g, '');
};

const maskEmail = (email) => {
    if (typeof email !== 'string') return '';
    const parts = email.split('@');
    if (parts.length !== 2) return '***';
    const [local, domain] = parts;
    if (local.length <= 3) {
        return '***@' + domain;
    }
    return local.substring(0, 3) + '***@' + domain;
};

const dispatchSecureLog = (event, severity, details) => {
    const logPayload = {
        timestamp: new Date().toISOString(),
        event,
        severity,
        details: {
            userId: details.userId || null,
            sanitizedEmail: maskEmail(sanitizeLogInput(details.email)),
            failedAttempts: details.failedAttempts,
            lockoutDurationMs: details.lockoutDurationMs || 0,
            clientIp: sanitizeLogInput(details.clientIp),
            userAgent: sanitizeLogInput(details.userAgent),
            correlationId: details.correlationId || null
        }
    };
    console.warn(JSON.stringify(logPayload));
};

const getLockoutDurationMs = (attempts) => {
    if (attempts <= 0 || attempts % 5 !== 0) return 0;
    if (attempts === 5) return 15 * 60 * 1000;       // 15 minutes
    if (attempts === 10) return 30 * 60 * 1000;      // 30 minutes
    if (attempts === 15) return 60 * 60 * 1000;      // 1 hour
    if (attempts === 20) return 12 * 60 * 60 * 1000; // 12 hours
    return 24 * 60 * 60 * 1000;                      // 24 hours (1 day) for 25+
};

const getNextLockoutThreshold = (attempts) => {
    if (attempts < 5) return 5;
    if (attempts < 10) return 10;
    if (attempts < 15) return 15;
    if (attempts < 20) return 20;
    return Math.ceil((attempts + 1) / 5) * 5;
};

// Anti-OCR Multi-Theme Distorted SVG CAPTCHA Generator
const CAPTCHA_THEMES = [
    {
        name: 'dark_glass',
        bg: 'rgba(15, 23, 42, 0.7)',
        grad: ['#ffffff', '#93c5fd', '#c084fc'],
        particles: ['#60a5fa', '#c084fc'],
        splines: ['rgba(147, 197, 253, 0.4)', 'rgba(192, 132, 252, 0.4)']
    },
    {
        name: 'cyber_neon',
        bg: 'rgba(13, 11, 38, 0.75)',
        grad: ['#ffffff', '#22d3ee', '#f43f5e'],
        particles: ['#38bdf8', '#fb7185'],
        splines: ['rgba(34, 211, 238, 0.45)', 'rgba(244, 63, 94, 0.45)']
    },
    {
        name: 'emerald_matrix',
        bg: 'rgba(4, 47, 46, 0.75)',
        grad: ['#ffffff', '#34d399', '#a7f3d0'],
        particles: ['#6ee7b7', '#2dd4bf'],
        splines: ['rgba(52, 211, 153, 0.45)', 'rgba(45, 212, 191, 0.45)']
    },
    {
        name: 'sunset_aurora',
        bg: 'rgba(46, 16, 101, 0.75)',
        grad: ['#ffffff', '#fbbf24', '#f43f5e'],
        particles: ['#fde047', '#fb7185'],
        splines: ['rgba(251, 191, 36, 0.45)', 'rgba(244, 63, 94, 0.45)']
    },
    {
        name: 'ocean_depths',
        bg: 'rgba(3, 7, 18, 0.75)',
        grad: ['#ffffff', '#38bdf8', '#818cf8'],
        particles: ['#60a5fa', '#a5b4fc'],
        splines: ['rgba(56, 189, 248, 0.45)', 'rgba(129, 140, 248, 0.45)']
    }
];

const generateCaptchaSvg = (forcedTheme = null) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const theme = forcedTheme && CAPTCHA_THEMES.find(t => t.name === forcedTheme)
        ? CAPTCHA_THEMES.find(t => t.name === forcedTheme)
        : CAPTCHA_THEMES[Math.floor(Math.random() * CAPTCHA_THEMES.length)];

    const width = 180;
    const height = 55;
    const filterId = 'ocr_distort_' + Math.random().toString(36).substring(2, 7);

    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background: ${theme.bg}; border-radius: 9999px; user-select: none; -webkit-user-select: none;">`;

    // 1. Advanced SVG Turbulence & Displacement Filter
    const baseFreq = (0.03 + Math.random() * 0.03).toFixed(3);
    const scale = Math.floor(4 + Math.random() * 4);
    svg += `<defs>
        <filter id="${filterId}" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="${baseFreq}" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="${scale}" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <linearGradient id="captchaGrad_${filterId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${theme.grad[0]}" stop-opacity="0.95" />
            <stop offset="50%" stop-color="${theme.grad[1]}" stop-opacity="0.9" />
            <stop offset="100%" stop-color="${theme.grad[2]}" stop-opacity="0.95" />
        </linearGradient>
    </defs>`;

    // 2. Theme-Specific Background Noise & Patterns
    if (theme.name === 'cyber_neon') {
        // Digital Grid Lines
        for (let x = 15; x < width; x += 25) {
            svg += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="rgba(34,211,238,0.12)" stroke-width="1" />`;
        }
        for (let y = 10; y < height; y += 15) {
            svg += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="rgba(244,63,94,0.1)" stroke-width="1" />`;
        }
    } else if (theme.name === 'emerald_matrix') {
        // Matrix Code Particles
        for (let i = 0; i < 20; i++) {
            const rx = Math.random() * width;
            const ry = Math.random() * height;
            svg += `<rect x="${rx}" y="${ry}" width="2.5" height="2.5" fill="#34d399" opacity="${(0.2 + Math.random() * 0.4).toFixed(2)}" />`;
        }
    } else if (theme.name === 'sunset_aurora') {
        // Radial Wave Rings
        svg += `<circle cx="${width * 0.5}" cy="${height * 0.5}" r="35" fill="none" stroke="rgba(251,191,36,0.15)" stroke-width="2" stroke-dasharray="4,4" />`;
        svg += `<circle cx="${width * 0.5}" cy="${height * 0.5}" r="50" fill="none" stroke="rgba(244,63,94,0.12)" stroke-width="2" />`;
    }

    // Random Background Particles (All themes)
    for (let i = 0; i < 30; i++) {
        const cx = Math.random() * width;
        const cy = Math.random() * height;
        const r = 0.8 + Math.random() * 2.2;
        const opacity = (0.15 + Math.random() * 0.35).toFixed(2);
        const fill = Math.random() > 0.5 ? theme.particles[0] : theme.particles[1];
        svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${opacity}" />`;
    }

    // 3. Curved Interference Splines (Cuts through letters)
    for (let i = 0; i < 3; i++) {
        const x1 = 5 + Math.random() * 20;
        const y1 = Math.random() * height;
        const cx1 = width * 0.33;
        const cy1 = Math.random() * height;
        const cx2 = width * 0.66;
        const cy2 = Math.random() * height;
        const x2 = width - (5 + Math.random() * 20);
        const y2 = Math.random() * height;
        const strokeWidth = (1.5 + Math.random() * 1.5).toFixed(1);
        const strokeColor = i % 2 === 0 ? theme.splines[0] : theme.splines[1];
        svg += `<path d="M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" />`;
    }

    // 4. Distorted Text Layer
    svg += `<g filter="url(#${filterId})">`;
    for (let i = 0; i < code.length; i++) {
        const char = code[i];
        const x = 20 + i * 30 + (Math.random() - 0.5) * 6;
        const y = 36 + (Math.random() - 0.5) * 8;
        const rot = (Math.random() - 0.5) * 38;
        const skewX = (Math.random() - 0.5) * 20;
        const fontSize = Math.floor(24 + Math.random() * 8);

        svg += `<text x="${x}" y="${y}" fill="url(#captchaGrad_${filterId})" font-size="${fontSize}" font-weight="900" font-family="'Inter', 'Courier New', monospace" style="text-transform: uppercase;" transform="rotate(${rot.toFixed(1)} ${x} ${y}) skewX(${skewX.toFixed(1)})">${char}</text>`;
    }
    svg += `</g>`;

    // 5. Foreground Cross-cutting Interference Grid
    for (let i = 0; i < 2; i++) {
        const x1 = Math.random() * width;
        const y1 = 0;
        const x2 = Math.random() * width;
        const y2 = height;
        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,0.25)" stroke-width="1.2" stroke-dasharray="3,3" />`;
    }

    svg += `</svg>`;
    return { code, svg, theme: theme.name };
};

// Captcha controller
export const getCaptcha = (req, res) => {
    try {
        const { code, svg } = generateCaptchaSvg();
        // Sign the captcha solution into a JWT with a 5-minute expiry
        const captchaToken = jwt.sign({ solution: code }, process.env.JWT_SECRET, { expiresIn: '5m' });
        res.json({
            success: true,
            captchaSvg: svg,
            captchaToken
        });
    } catch (err) {
        console.error('Error generating captcha:', err);
        res.status(500).json({ success: false, message: 'Failed to generate captcha' });
    }
};

const logSecurityEvent = async (userId, eventType, description, req) => {
    try {
        await SecurityAuditLog.create({
            userId: userId || null,
            eventType,
            description,
            ipAddress: req ? (req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress) : null,
            userAgent: req ? (req.headers['user-agent'] || null) : null
        });
    } catch (err) {
        console.error('Failed to log security event:', err);
    }
};

const parseUserAgent = (uaString) => {
    if (!uaString) return { browser: 'unknown', os: 'unknown', deviceType: 'unknown' };

    let deviceType = 'desktop';
    if (/tablet|ipad|playbook|silk/i.test(uaString)) {
        deviceType = 'tablet';
    } else if (/mobile|iphone|ipod|android|blackberry|iemobile|kindle/i.test(uaString)) {
        deviceType = 'mobile';
    }

    let os = 'unknown';
    if (/windows/i.test(uaString)) os = 'Windows';
    else if (/macintosh|mac os x/i.test(uaString)) os = 'macOS';
    else if (/iphone|ipad|ipod/i.test(uaString)) os = 'iOS';
    else if (/android/i.test(uaString)) os = 'Android';
    else if (/linux/i.test(uaString)) os = 'Linux';

    let browser = 'unknown';
    if (/chrome|crios/i.test(uaString)) browser = 'Chrome';
    else if (/firefox|fxios/i.test(uaString)) browser = 'Firefox';
    else if (/safari/i.test(uaString) && !/chrome|crios/i.test(uaString)) browser = 'Safari';
    else if (/msie|trident/i.test(uaString)) browser = 'Internet Explorer';
    else if (/edg/i.test(uaString)) browser = 'Edge';

    return { browser, os, deviceType };
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password || typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ success: false, message: 'All fields (name, email, password) are required and must be strings.' });
        }

        if (password.length > 64) {
            await logSecurityEvent(null, 'PASSWORD_LENGTH_EXCEEDED', `Registration failed: password length exceeded limit for email "${email}"`, req);
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long (maximum allowed is 64 characters).' });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            // Secure non-disclosure: return identical successful registration message
            return res.status(201).json({
                success: true,
                message: 'Registration successful. Please check your email to verify your account.'
            });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            email,
            password: hashedPassword
        });

        // Create profile
        await Profile.create({
            userId: newUser.id,
            name: name,
            plan: 'free',
            isVerified: false
        });

        // Send verification email
        const verificationToken = generateToken(newUser.id, newUser.email, crypto.randomUUID());
        await sendVerificationEmail(newUser.email, name, verificationToken);

        // Check for pending team invitations for this email
        const pendingInvitations = await TeamInvitation.findAll({
            where: { email: newUser.email, status: 'pending' }
        });

        // --- Log audit event ---
        await logSecurityEvent(newUser.id, 'REGISTER_SUCCESS', `User registered successfully under name "${name}"`, req);

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email to verify your account.',
            pendingInvitations: pendingInvitations.length > 0 ? pendingInvitations : null
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
            return res.status(401).json({ success: false, message: 'Incorrect email or password' });
        }

        const emailLower = email.toLowerCase().trim();

        // 1. Check lockout state from in-memory cache
        const record = getCacheRecord(emailLower);
        const now = Date.now();
        if (record.lockedUntil && now < record.lockedUntil) {
            const remainingMs = record.lockedUntil - now;
            const remainingSeconds = Math.ceil(remainingMs / 1000);
            res.set('Retry-After', String(remainingSeconds));

            // Progressive delay on currently locked attempts to slow down attacks
            await new Promise(resolve => setTimeout(resolve, 2000));

            return res.status(401).json({
                success: false,
                message: 'Incorrect email or password',
                lockedUntil: new Date(record.lockedUntil).toISOString(),
                retryAfterSeconds: remainingSeconds
            });
        }

        const user = await User.findOne({ where: { email: emailLower } });

        // 2. CAPTCHA Validation if failedLoginAttempts >= 3 in cache
        if (record.attempts >= 3) {
            const { captchaAnswer, captchaToken } = req.body;

            if (!captchaAnswer || !captchaToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Incorrect email or password',
                    requiresCaptcha: true
                });
            }

            try {
                const decoded = jwt.verify(captchaToken, process.env.JWT_SECRET);
                if (!decoded.solution || captchaAnswer.toUpperCase() !== decoded.solution.toUpperCase()) {
                    return res.status(400).json({
                        success: false,
                        message: 'Incorrect email or password',
                        requiresCaptcha: true
                    });
                }
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: 'Incorrect email or password',
                    requiresCaptcha: true
                });
            }
        }

        // If user not found, run generic failure path (prevent timing/brute-force email enumeration)
        if (!user) {
            await logSecurityEvent(null, 'LOGIN_FAILURE', `Failed login attempt with non-existent email "${emailLower}"`, req);

            // Increment attempts in cache
            record.attempts += 1;
            record.lastAttempt = Date.now();
            if (record.attempts >= 5) {
                record.lockedUntil = Date.now() + 15 * 60 * 1000;
            }
            setCacheRecord(emailLower, record);

            // Progressive response delay
            const delayMs = Math.min(10000, 1000 * record.attempts);
            await new Promise(resolve => setTimeout(resolve, delayMs));

            return res.status(401).json({ success: false, message: 'Incorrect email or password' });
        }

        // If the user signed up with OAuth, password might be empty.
        if (!user.password && password) {
            const providerName = user.provider ? (user.provider.charAt(0).toUpperCase() + user.provider.slice(1)) : 'your OAuth provider';
            await logSecurityEvent(user.id, 'LOGIN_FAILURE', `Rejected password login: user registered using OAuth (${providerName})`, req);
            return res.status(401).json({
                success: false,
                message: 'Incorrect email or password'
            });
        }

        // 3. Constant-Time Compare and Weak Hash Migration Check
        const isBcrypt = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');
        let isMatch = false;

        if (!isBcrypt) {
            // Legacy weak comparison: use safe constant-time comparison
            isMatch = safeCompare(password, user.password);
        } else {
            isMatch = await bcrypt.compare(password, user.password);
        }

        if (!isMatch) {
            // Increment failures in cache
            record.attempts += 1;
            record.lastAttempt = Date.now();

            const lockoutDurationMs = getLockoutDurationMs(record.attempts);
            if (lockoutDurationMs > 0) {
                record.lockedUntil = Date.now() + lockoutDurationMs;
            }
            setCacheRecord(emailLower, record);

            // Sync with user DB record
            user.failedLoginAttempts = record.attempts;
            user.lockedUntil = record.lockedUntil ? new Date(record.lockedUntil) : null;
            user.lastFailedLoginAt = new Date(record.lastAttempt);
            await user.save();

            // Send Reset Link notification on lockout
            if (record.attempts === 5) {
                try {
                    const profile = await Profile.findOne({ where: { userId: user.id } });
                    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                    await sendPasswordResetEmail(user.email, profile?.name || 'User', resetToken);
                    await logSecurityEvent(user.id, 'LOCKOUT_EMAIL_SENT', `Lockout alert with reset link sent to ${user.email}`, req);
                } catch (emailErr) {
                    console.error('Failed to send lockout reset email:', emailErr);
                }
            }

            dispatchSecureLog(
                'AUTH_FAILURE',
                'INFO',
                {
                    userId: user.id,
                    email: user.email,
                    failedAttempts: record.attempts,
                    clientIp: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                    userAgent: req.headers['user-agent']
                }
            );

            await logSecurityEvent(user.id, 'LOGIN_FAILURE', `Invalid credentials entered. Attempts: ${record.attempts}`, req);

            // Progressive response delay
            const delayMs = Math.min(10000, 1000 * record.attempts);
            await new Promise(resolve => setTimeout(resolve, delayMs));

            return res.status(401).json({
                success: false,
                message: 'Incorrect email or password'
            });
        }

        // 4. Successful login: Re-hash weak password if needed
        if (!isBcrypt) {
            const salt = await bcrypt.genSalt(12);
            user.password = await bcrypt.hash(password, salt);
            await logSecurityEvent(user.id, 'PASSWORD_MIGRATED', 'User password migrated to strong bcrypt hash on login', req);
        }

        // Clear attempts in cache & DB
        record.attempts = 0;
        record.lockedUntil = null;
        setCacheRecord(emailLower, record);

        user.failedLoginAttempts = 0;
        user.lastFailedLoginAt = null;
        user.lockedUntil = null;
        await user.save();

        const profile = await Profile.findOne({ where: { userId: user.id } });

        // --- Password Expiry & Grace Period Enforcement ---
        if (user.passwordExpiresAt) {
            const expiryDate = new Date(user.passwordExpiresAt);
            const gracePeriodEnd = new Date(expiryDate);
            gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

            if (now > gracePeriodEnd) {
                await logSecurityEvent(user.id, 'LOGIN_FAILURE', 'Login blocked: Password has expired and grace period ended', req);
                return res.status(403).json({
                    success: false,
                    message: 'Your password has expired and the 7-day grace period has ended. Please reset your password to continue.',
                    needsPasswordReset: true
                });
            }

            // If expired but within grace period, we allow login but could add a warning header/meta
            if (now > expiryDate) {
                // Note: Frontend can check this flag to show a "Change Password" banner
                res.set('X-Password-Expired', 'true');
            }
        }
        // --------------------------------------------------

        if (!profile.isVerified) {
            const verificationToken = generateToken(user.id, user.email, crypto.randomUUID());
            try {
                await sendVerificationEmail(user.email, profile.name || 'User', verificationToken);
            } catch (err) {
                console.error('Failed to send verification email during login:', err);
            }

            await logSecurityEvent(user.id, 'LOGIN_FAILURE', 'Login blocked: Email is not verified', req);
            return res.status(403).json({
                success: false,
                message: 'Please verify your email to continue. A fresh verification link has been sent to your inbox.',
                needsVerification: true
            });
        }

        // --- Session Creation & Token Generation ---
        const jti = crypto.randomUUID();
        const token = generateToken(user.id, user.email, jti);

        const ua = parseUserAgent(req.headers['user-agent']);
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        await UserSession.create({
            userId: user.id,
            jwtJti: jti,
            deviceType: ua.deviceType,
            browser: ua.browser,
            os: ua.os,
            ipAddress,
            lastActiveAt: new Date()
        });

        await logSecurityEvent(user.id, 'LOGIN_SUCCESS', 'User logged in successfully', req);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                profile
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid token' });
        }

        const profile = await Profile.findOne({ where: { userId: user.id } });
        if (profile.isVerified) {
            return res.json({ success: true, message: 'Email already verified' });
        }

        profile.isVerified = true;
        await profile.save();

        res.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
};

export const resendVerificationEmailController = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ success: false, message: 'Incorrect email or password' });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.json({ success: true, message: 'If that email is registered, you will receive a verification link' });
        }

        const profile = await Profile.findOne({ where: { userId: user.id } });
        if (profile.isVerified) {
            return res.json({ success: true, message: 'If that email is registered, you will receive a verification link' });
        }

        const verificationToken = generateToken(user.id, user.email, crypto.randomUUID());
        await sendVerificationEmail(user.email, profile.name || 'User', verificationToken);

        res.json({ success: true, message: 'If that email is registered, you will receive a verification link' });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ success: false, message: 'Incorrect email or password' });
    }
};

export const resetPasswordRequest = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ success: false, message: 'Incorrect email or password' });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            await logSecurityEvent(null, 'PASSWORD_RESET_FAILURE', `Password reset requested for non-existent email "${email}"`, req);
            return res.json({ success: true, message: "If that email is registered, you'll receive a reset link" });
        }

        const profile = await Profile.findOne({ where: { userId: user.id } });
        const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        await sendPasswordResetEmail(user.email, profile?.name || 'User', resetToken);

        await logSecurityEvent(user.id, 'PASSWORD_RESET_REQUESTED', `Password reset link requested for user ${user.email}`, req);

        res.json({ success: true, message: "If that email is registered, you'll receive a reset link" });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Incorrect email or password' });
    }
};

export const resetPasswordConfirm = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!newPassword || typeof newPassword !== 'string') {
            return res.status(400).json({ success: false, message: 'Incorrect email or password' });
        }

        if (newPassword.length > 64) {
            await logSecurityEvent(null, 'PASSWORD_LENGTH_EXCEEDED', `Password reset failed: password length exceeded limit`, req);
            return res.status(400).json({ success: false, message: 'Incorrect email or password' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'Incorrect email or password' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            await logSecurityEvent(null, 'PASSWORD_RESET_FAILURE', 'Password reset confirmation failed: Invalid token', req);
            return res.status(400).json({ success: false, message: 'Incorrect email or password' });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        const profile = await Profile.findOne({ where: { userId: user.id } });
        await sendPasswordChangedEmail(user.email, profile?.name || 'User');

        await logSecurityEvent(user.id, 'PASSWORD_RESET_SUCCESS', `Password successfully updated by user`, req);

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Reset confirm error:', error);
        await logSecurityEvent(null, 'PASSWORD_RESET_FAILURE', `Password reset confirmation error: ${error.message}`, req);
        res.status(400).json({ success: false, message: 'Incorrect email or password' });
    }
};

export const logout = async (req, res) => {
    try {
        if (req.user && req.user.jti) {
            const session = await UserSession.findOne({ where: { jwtJti: req.user.jti } });
            if (session) {
                session.isRevoked = true;
                await session.save();
            }
            await logSecurityEvent(req.user.id, 'LOGOUT_SUCCESS', 'User logged out successfully', req);
        }
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, message: 'Server error during logout' });
    }
};

import axios from 'axios';

// --- OAuth Google ---
export const googleLogin = (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.FRONTEND_URL}/api/v1/auth/google/callback`;
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;
    res.redirect(url);
};

export const googleCallback = async (req, res) => {
    const { code } = req.query;
    if (!code) return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=NoCode`);

    try {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = `${process.env.FRONTEND_URL}/api/v1/auth/google/callback`;

        // Exchange code for token
        const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
        });

        const { access_token } = tokenRes.data;

        // Fetch user profile
        const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const { email, name, picture } = userRes.data;

        // Find or create user
        let user = await User.findOne({ where: { email } });
        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            user = await User.create({
                email,
                password: '',
                provider: 'google'
            });
            await Profile.create({
                userId: user.id,
                name: name,
                avatarUrl: picture,
                plan: 'free',
                isVerified: true
            });
        }

        const jti = crypto.randomUUID();
        const token = generateToken(user.id, user.email, jti);

        const ua = parseUserAgent(req.get('User-Agent'));

        // Record UserSession in DB for OAuth logins
        await UserSession.create({
            userId: user.id,
            jwtJti: jti,
            deviceType: ua.deviceType,
            browser: ua.browser,
            os: ua.os,
            ipAddress: req.ip || req.connection?.remoteAddress,
            lastActiveAt: new Date()
        });

        // Send welcome email if new user
        if (isNewUser) {
            await sendOAuthWelcomeEmail(user.email, name, 'Google');
        }

        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
        console.error('Google OAuth Error:', error.response?.data || error.message);
        res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=OAuthFailed`);
    }
};

// --- OAuth GitHub ---
export const githubLogin = (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = `${process.env.FRONTEND_URL}/api/v1/auth/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
    res.redirect(url);
};

export const githubCallback = async (req, res) => {
    const { code } = req.query;
    if (!code) return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=NoCode`);

    try {
        const clientId = process.env.GITHUB_CLIENT_ID;
        const clientSecret = process.env.GITHUB_CLIENT_SECRET;
        const redirectUri = `${process.env.FRONTEND_URL}/api/v1/auth/github/callback`;

        // Exchange code
        const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: redirectUri
        }, { headers: { Accept: 'application/json' } });

        const { access_token } = tokenRes.data;
        if (!access_token) throw new Error('No access token received from GitHub');

        // Fetch user profile
        const userRes = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        // Fetch emails since they might be private
        const emailRes = await axios.get('https://api.github.com/user/emails', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const primaryEmailObj = emailRes.data.find(e => e.primary) || emailRes.data[0];
        const email = primaryEmailObj?.email;
        if (!email) throw new Error('No email found in GitHub profile');

        const { name, login, avatar_url } = userRes.data;
        const finalName = name || login;

        let user = await User.findOne({ where: { email } });
        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            user = await User.create({
                email,
                password: '',
                provider: 'github'
            });
            await Profile.create({
                userId: user.id,
                name: finalName,
                avatarUrl: avatar_url,
                plan: 'free',
                isVerified: true
            });
        }

        const jti = crypto.randomUUID();
        const token = generateToken(user.id, user.email, jti);

        const ua = parseUserAgent(req.get('User-Agent'));

        // Record UserSession in DB for OAuth logins
        await UserSession.create({
            userId: user.id,
            jwtJti: jti,
            deviceType: ua.deviceType,
            browser: ua.browser,
            os: ua.os,
            ipAddress: req.ip || req.connection?.remoteAddress,
            lastActiveAt: new Date()
        });

        // Send welcome email if new user
        if (isNewUser) {
            await sendOAuthWelcomeEmail(user.email, finalName, 'GitHub');
        }

        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
        console.error('GitHub OAuth Error:', error.response?.data || error.message);
        res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=OAuthFailed`);
    }
};

export const getSession = async (req, res) => {
    try {
        // req.user is populated by authMiddleware
        const user = await User.findByPk(req.user.id);
        const profile = await Profile.findOne({ where: { userId: req.user.id } });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                profile
            }
        });
    } catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const mockSendVerificationEmail = async (req, res) => {
    try {
        const { email, name, token } = req.body;

        if (!email || !token) {
            return res.status(400).json({ success: false, message: 'Email and token are required' });
        }

        await sendVerificationEmail(email, name || 'User', token);

        res.json({ success: true, message: 'Verification email sent successfully' });
    } catch (error) {
        console.error('Mock send verification error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const mockSendPasswordResetEmail = async (req, res) => {
    try {
        const { email, name, token } = req.body;

        if (!email || !token) {
            return res.status(400).json({ success: false, message: 'Email and token are required' });
        }

        await sendPasswordResetEmail(email, name || 'User', token);

        res.json({ success: true, message: 'Password reset email sent successfully' });
    } catch (error) {
        console.error('Mock send password reset error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
