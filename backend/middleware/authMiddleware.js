import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserSession, PersonalAccessToken } from '../models/index.js';

export const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    // Check if token is a Personal Access Token (PAT)
    if (token.startsWith('lx_pat_')) {
        try {
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
            const pat = await PersonalAccessToken.findOne({ where: { tokenHash } });

            if (!pat) {
                return res.status(401).json({ success: false, message: 'Invalid personal access token' });
            }

            if (pat.expiresAt && new Date() > new Date(pat.expiresAt)) {
                return res.status(401).json({ success: false, message: 'Personal access token has expired' });
            }

            // Update token metrics
            pat.lastUsedAt = new Date();
            pat.lastUsedIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            await pat.save();

            req.user = {
                id: pat.userId,
                isPat: true,
                name: pat.name,
                scopes: pat.scopes
            };
            return next();
        } catch (error) {
            console.error('PAT authentication error:', error);
            return res.status(500).json({ success: false, message: 'Server error during token validation' });
        }
    }

    // Fallback to standard user session JWT authentication
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.jti) {
            const session = await UserSession.findOne({ where: { jwtJti: decoded.jti } });
            if (!session) {
                return res.status(401).json({ success: false, message: 'Session not found, authorization denied' });
            }
            if (session.isRevoked) {
                return res.status(401).json({ success: false, message: 'Session has been explicitly logged out or revoked' });
            }

            // Update session last active time
            session.lastActiveAt = new Date();
            await session.save();
        }

        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid token signature.' });
        }
        return res.status(401).json({ success: false, message: `Token validation error: ${error.message}` });
    }
};
