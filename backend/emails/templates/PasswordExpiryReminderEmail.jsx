import React from 'react';
import BaseEmail, { headingStyle, textStyle, buttonStyle } from '../BaseEmail.jsx';

export default function PasswordExpiryReminderEmail({ name, daysRemaining, resetUrl }) {
  return (
    <BaseEmail title="Password Expiry Reminder" name={name}>
      <h2 style={headingStyle}>
        Security Reminder
      </h2>

      <p style={textStyle}>
        Your Locator-X account password is set to expire in <strong style={{ color: '#f8fafc' }}>{daysRemaining} days</strong>.
      </p>
      
      <p style={textStyle}>
        To maintain account security, please update your password before it expires. We provide a <strong style={{ color: '#f8fafc' }}>7-day allowance</strong> after the expiry date to ensure you aren't locked out immediately, but the account will be restricted after that period.
      </p>
      
      <div style={{ textAlign: 'center' }}>
        <a href={resetUrl} style={buttonStyle}>
          Update Password Now
        </a>
      </div>
      
      <p style={{ ...textStyle, margin: '16px 0 0 0' }}>
        If you've already updated your password recently, please ignore this email.
      </p>
    </BaseEmail>
  );
}
