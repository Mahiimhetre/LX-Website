import React from 'react';
import BaseEmail, { headingStyle, textStyle, buttonStyle } from '../BaseEmail.jsx';

export default function VerificationEmail({ name, verifyUrl }) {
  return (
    <BaseEmail 
      title="Verify your LocatorX Account" 
      name={name}
      categoryBadge="Account Verification"
      fallbackUrl={verifyUrl}
      securityNote="Automated security message • Link expires in 24 hours"
    >
      <h2 className="text-heading" style={headingStyle}>
        Verify your LocatorX account
      </h2>
      
      <p className="text-body" style={textStyle}>
        Welcome to LocatorX! You're one click away from building robust, auto-healing test automation selectors for your web applications.
      </p>

      <p className="text-body" style={textStyle}>
        Please verify your email address to activate your 14-day full-featured trial (no credit card required):
      </p>
      
      <div style={{ textAlign: 'center' }}>
        <a href={verifyUrl} style={buttonStyle}>
          Verify Email Address &rarr;
        </a>
      </div>
      
      <p className="text-body" style={{ ...textStyle, fontSize: '13px', margin: '16px 0 0 0' }}>
        If you didn't request this account creation, please ignore this email.
      </p>
    </BaseEmail>
  );
}
