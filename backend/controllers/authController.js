import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, Profile } from '../models/index.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';

const generateToken = (userId, email) => {
    return jwt.sign({ id: userId, email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
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
        const verificationToken = generateToken(newUser.id, newUser.email);
        await sendVerificationEmail(newUser.email, verificationToken);

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email to verify your account.'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // If the user signed up with OAuth, password might be empty.
        if (!user.password && password) {
            const providerName = user.provider ? (user.provider.charAt(0).toUpperCase() + user.provider.slice(1)) : 'your OAuth provider';
            return res.status(401).json({ 
                success: false, 
                message: `Please login using ${providerName}.` 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const profile = await Profile.findOne({ where: { userId: user.id } });
        
        // --- Password Expiry & Grace Period Enforcement ---
        if (user.passwordExpiresAt) {
            const now = new Date();
            const expiryDate = new Date(user.passwordExpiresAt);
            const gracePeriodEnd = new Date(expiryDate);
            gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

            if (now > gracePeriodEnd) {
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
            return res.status(403).json({ 
                success: false, 
                message: 'Please verify your email before logging in.',
                needsVerification: true 
            });
        }

        const token = generateToken(user.id, user.email);

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
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const profile = await Profile.findOne({ where: { userId: user.id } });
        if (profile.isVerified) {
            return res.status(400).json({ success: false, message: 'Email already verified' });
        }

        const verificationToken = generateToken(user.id, user.email);
        await sendVerificationEmail(user.email, verificationToken);

        res.json({ success: true, message: 'Verification email resent successfully' });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const resetPasswordRequest = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            // Return success even if user not found to prevent email gathering
            return res.json({ success: true, message: 'If an account exists, a reset link has been sent' });
        }

        const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        await sendPasswordResetEmail(user.email, resetToken);

        res.json({ success: true, message: 'Password reset link sent to your email' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const resetPasswordConfirm = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid token' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        // Send password changed confirmation email
        await sendPasswordChangedEmail(user.email);

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Reset confirm error:', error);
        res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
};

import axios from 'axios';

// --- OAuth Google ---
export const googleLogin = (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.FRONTEND_URL}/api/auth/google/callback`;
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;
    res.redirect(url);
};

export const googleCallback = async (req, res) => {
    const { code } = req.query;
    if (!code) return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=NoCode`);

    try {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = `${process.env.FRONTEND_URL}/api/auth/google/callback`;

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

        const token = generateToken(user.id, user.email);

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
    const redirectUri = `${process.env.FRONTEND_URL}/api/auth/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
    res.redirect(url);
};

export const githubCallback = async (req, res) => {
    const { code } = req.query;
    if (!code) return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=NoCode`);

    try {
        const clientId = process.env.GITHUB_CLIENT_ID;
        const clientSecret = process.env.GITHUB_CLIENT_SECRET;
        const redirectUri = `${process.env.FRONTEND_URL}/api/auth/github/callback`;

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

        const token = generateToken(user.id, user.email);

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
