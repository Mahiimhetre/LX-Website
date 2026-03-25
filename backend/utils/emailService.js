import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import React from 'react';
import { render } from '@react-email/render';

// New Architecture: One import per template
import WelcomeEmail from '../emails/templates/WelcomeEmail.jsx';
import VerificationEmail from '../emails/templates/VerificationEmail.jsx';
import PasswordResetEmail from '../emails/templates/PasswordResetEmail.jsx';
import PasswordChangedEmail from '../emails/templates/PasswordChangedEmail.jsx';
import PlanChangedEmail from '../emails/templates/PlanChangedEmail.jsx';
import CleanupReminderEmail from '../emails/templates/CleanupReminderEmail.jsx';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Enhanced sendEmail function that takes a React element directly.
 */
const sendEmail = async ({ to, subject, component }) => {
    try {
        console.log(`Rendering email: ${subject}...`);
        const emailHtml = await render(component);

        const mailOptions = {
            from: '"Locator-X Support" <noreply@locator-x.com>',
            to,
            subject,
            html: emailHtml
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

export const sendVerificationEmail = async (email, name, token) => {
    const verifyUrl = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;
    return sendEmail({
        to: email,
        subject: 'Verify your Locator-X Account',
        component: React.createElement(VerificationEmail, { name, verifyUrl })
    });
};

export const sendPasswordResetEmail = async (email, name, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    return sendEmail({
        to: email,
        subject: 'Reset your Locator-X Password',
        component: React.createElement(PasswordResetEmail, { name, resetUrl })
    });
};

export const sendPasswordChangedEmail = async (email, name) => {
    return sendEmail({
        to: email,
        subject: 'Your Locator-X Password has been changed',
        component: React.createElement(PasswordChangedEmail, { name })
    });
};

export const sendPlanChangedEmail = async (email, name, planName) => {
    return sendEmail({
        to: email,
        subject: `Your Locator-X Plan has been updated to ${planName}`,
        component: React.createElement(PlanChangedEmail, { name, planName })
    });
};

export const sendCleanupReminderEmail = async (email, name) => {
    const verifyUrl = `${process.env.FRONTEND_URL}/auth/verify`;
    return sendEmail({
        to: email,
        subject: 'Final Reminder: Verify your Locator-X Account',
        component: React.createElement(CleanupReminderEmail, { name, verifyUrl })
    });
};

export const sendOAuthWelcomeEmail = async (email, name, provider) => {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password-request`;
    return sendEmail({
        to: email,
        subject: `Welcome to Locator-X, ${name}!`,
        component: React.createElement(WelcomeEmail, { name, provider, resetUrl })
    });
};
