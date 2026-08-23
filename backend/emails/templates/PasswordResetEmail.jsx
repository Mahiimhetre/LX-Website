import React from 'react';
import BaseEmail, { headingStyle, textStyle, buttonStyle } from '../BaseEmail.jsx';

export default function PasswordResetEmail({ name, resetUrl }) {
  return (
    <BaseEmail 
      title="Password Reset Request" 
      name={name}
      categoryBadge="Security Action"
      fallbackUrl={resetUrl}
      securityNote="If you didn't request this, you can safely ignore this email."
    >
      <h2 className="text-heading" style={headingStyle}>
        Password Reset Request
      </h2>

      <p className="text-body" style={textStyle}>
        We received a request to reset the password for your LocatorX account.
      </p>

      <p className="text-body" style={textStyle}>
        If you initiated this request, please click the button below to establish a new password:
      </p>
      
      <div style={{ textAlign: 'center' }}>
        <a href={resetUrl} style={buttonStyle}>
          Reset Password &rarr;
        </a>
      </div>
      
      <p className="text-body" style={{ ...textStyle, fontSize: '13px', margin: '16px 0 0 0' }}>
        For security purposes, this password reset link will expire shortly.
      </p>
    </BaseEmail>
  );
}
