import { z } from 'zod';

const sanitizeValue = (field, val) => {
    if (typeof val !== 'string') return '';
    // Strip HTML and script tags
    let clean = val.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '');
    // For name or username, strip special characters as well
    if (field === 'name' || field === 'username') {
        clean = clean.replace(/[^a-zA-Z0-9\s.-]/g, '');
    }
    return clean.trim();
};

const registerSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email().max(255),
    password: z.string().min(8).max(64)
});

const loginSchema = z.object({
    email: z.string().email().max(255),
    password: z.string().min(8).max(64)
});

export const validateRegister = (req, res, next) => {
    try {
        if (!req.body) {
            console.warn('Validation failed: No request body');
            return res.status(400).json({ success: false, message: 'Registration details are required.' });
        }

        // Sanitize text inputs (exclude password from HTML stripping)
        req.body.name = sanitizeValue('name', req.body.name);
        req.body.email = sanitizeValue('email', req.body.email)?.toLowerCase();
        if (typeof req.body.password !== 'string') req.body.password = '';

        // Validate schema
        registerSchema.parse({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });

        next();
    } catch (error) {
        console.warn('Validation failed for registration:', error.errors || error.message);
        const errorMsg = error.errors?.[0]?.message || 'Invalid registration details.';
        return res.status(400).json({ success: false, message: errorMsg });
    }
};

export const validateLogin = (req, res, next) => {
    try {
        if (!req.body) {
            console.warn('Validation failed: No request body');
            return res.status(400).json({ success: false, message: 'Incorrect email or password' });
        }

        // Sanitize text inputs (exclude password from HTML stripping)
        req.body.email = sanitizeValue('email', req.body.email)?.toLowerCase();
        if (typeof req.body.password !== 'string') req.body.password = '';

        // Validate schema
        loginSchema.parse({
            email: req.body.email,
            password: req.body.password
        });

        next();
    } catch (error) {
        console.warn('Validation failed for login:', error.errors || error.message);
        return res.status(400).json({ success: false, message: 'Incorrect email or password' });
    }
};
