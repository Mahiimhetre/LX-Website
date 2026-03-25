import React from 'react';
import BaseEmail, { headingStyle, textStyle, buttonStyle } from '../BaseEmail.jsx';

export default function PasswordResetEmail({ name, resetUrl }) {
  return (
    <BaseEmail title="Password Reset Request" name={name}>
      <h2 style={headingStyle}>
        Password Reset Request
      </h2>

      <p style={textStyle}>
        We received a request to reset your password. Click the button below to set a new password:
      </p>
      
      <div style={{ textAlign: 'center' }}>
        <a href={resetUrl} style={buttonStyle}>
          Reset Password
        </a>
      </div>
      
      <p style={{ ...textStyle, margin: '16px 0 0 0' }}>
        If you didn't request a password reset, you can safely ignore this email.
      </p>
    </BaseEmail>
  );
}
