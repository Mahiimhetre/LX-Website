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
import PasswordExpiryReminderEmail from '../emails/templates/PasswordExpiryReminderEmail.jsx';
import PlanExpiryReminderEmail from '../emails/templates/PlanExpiryReminderEmail.jsx';
import TeamInvitationEmail from '../emails/templates/TeamInvitationEmail.jsx';

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

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Enhanced sendEmail function with CID inline logo attachment support.
 */
const sendEmail = async ({ to, subject, component }) => {
    try {
        console.log(`Rendering email: ${subject}...`);
        const emailHtml = await render(component);

        // Single bulletproof path relative to emailService file location
        const actualLogoPath = path.resolve(__dirname, '../../public/image.png');

        const mailOptions = {
            from: `"LocatorX Support" <${process.env.SMTP_USER || 'noreply@locatorx.dev'}>`,
            to,
            subject,
            html: emailHtml,
            attachments: actualLogoPath ? [{
                filename: 'logo.png',
                path: actualLogoPath,
                cid: 'locatorx_logo',
                contentDisposition: 'inline'
            }] : []
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
        component: <VerificationEmail name={name} verifyUrl={verifyUrl} />
    });
};

export const sendPasswordResetEmail = async (email, name, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    return sendEmail({
        to: email,
        subject: 'Reset your Locator-X Password',
        component: <PasswordResetEmail name={name} resetUrl={resetUrl} />
    });
};

export const sendPasswordChangedEmail = async (email, name) => {
    return sendEmail({
        to: email,
        subject: 'Your Locator-X Password has been changed',
        component: <PasswordChangedEmail name={name} />
    });
};

export const sendPlanChangedEmail = async (email, name, planName) => {
    return sendEmail({
        to: email,
        subject: `Your Locator-X Plan has been updated to ${planName}`,
        component: <PlanChangedEmail name={name} planName={planName} />
    });
};

export const sendCleanupReminderEmail = async (email, name, token = '') => {
    const verifyUrl = token
        ? `${process.env.FRONTEND_URL}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`
        : `${process.env.FRONTEND_URL}/auth/verify?email=${encodeURIComponent(email)}`;
    return sendEmail({
        to: email,
        subject: 'Final Reminder: Verify your Locator-X Account',
        component: <CleanupReminderEmail name={name} verifyUrl={verifyUrl} />
    });
};

export const sendOAuthWelcomeEmail = async (email, name, provider) => {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password-request`;
    return sendEmail({
        to: email,
        subject: `Welcome to Locator-X, ${name}!`,
        component: <WelcomeEmail name={name} provider={provider} resetUrl={resetUrl} />
    });
};

export const sendPasswordExpiryReminder = async (email, name, daysRemaining) => {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password-request`;
    return sendEmail({
        to: email,
        subject: 'Action Required: Your password expires soon',
        component: <PasswordExpiryReminderEmail name={name} daysRemaining={daysRemaining} resetUrl={resetUrl} />
    });
};

export const sendPlanExpiryReminder = async (email, name, teamName, daysRemaining) => {
    const renewUrl = `${process.env.FRONTEND_URL}/billing`;
    return sendEmail({
        to: email,
        subject: `Action Required: Your plan for ${teamName} expires soon`,
        component: <PlanExpiryReminderEmail name={name} teamName={teamName} daysRemaining={daysRemaining} renewUrl={renewUrl} />
    });
};

export const sendTeamInviteEmail = async (email, inviterName, teamName, token) => {
    const inviteUrl = `${process.env.FRONTEND_URL}/join-team?token=${token}`;
    return sendEmail({
        to: email,
        subject: `You've been invited to join ${teamName} on Locator-X`,
        component: <TeamInvitationEmail inviterName={inviterName} teamName={teamName} inviteUrl={inviteUrl} />
    });
};
