import { z } from 'zod';

// Email validation
export const emailSchema = z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters');

// Password validation with detailed requirements
export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Name validation
export const nameSchema = z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens and apostrophes');

// Login form schema
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
});

// Register form schema
export const registerSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

// Password reset schema
export const resetEmailSchema = z.object({
    email: emailSchema,
});

// Change password schema
export const changePasswordSchema = z.object({
    email: emailSchema,
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
});

export const checkPasswordStrength = (password) => {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    };

    const score = Object.values(requirements).filter(Boolean).length;

    const strengthMap = {
        0: { label: 'weak', color: 'hsl(0, 84%, 60%)' },
        1: { label: 'weak', color: 'hsl(0, 84%, 60%)' },
        2: { label: 'fair', color: 'hsl(30, 100%, 50%)' },
        3: { label: 'fair', color: 'hsl(30, 100%, 50%)' },
        4: { label: 'good', color: 'hsl(45, 100%, 50%)' },
        5: { label: 'strong', color: 'hsl(142, 69%, 58%)' },
    };

    return {
        score,
        ...strengthMap[score],
        requirements,
    };
};

// Validate single field and return error message or null
export const validateField = (schema, value) => {
    const result = schema.safeParse(value);
    if (!result.success) {
        return result.error.errors[0]?.message || 'Invalid input';
    }
    return null;
};
