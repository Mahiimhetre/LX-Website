import React from 'react';
import BaseEmail, { headingStyle, textStyle, buttonStyle } from '../BaseEmail.jsx';

export default function PasswordExpiryReminderEmail({ name, daysRemaining, resetUrl }) {
  return (
    <BaseEmail 
      title="Password Expiry Notice" 
      name={name}
      categoryBadge="Security Notice"
      fallbackUrl={resetUrl}
      securityNote="Security policy enforcement • 7-day grace period applies"
    >
      <h2 className="text-heading" style={headingStyle}>
        Password Expiry Notice
      </h2>

      <p className="text-body" style={textStyle}>
        Your LocatorX account password is scheduled to expire in <strong style={{ color: '#d97706' }}>{daysRemaining} days</strong>.
      </p>
      
      <p className="text-body" style={textStyle}>
        To ensure uninterrupted access for your team, please update your password before the expiry date. We include a 7-day grace period, after which account access will be restricted.
      </p>
      
      <div style={{ textAlign: 'center' }}>
        <a href={resetUrl} style={buttonStyle}>
          Update Password Now &rarr;
        </a>
      </div>
      
      <p className="text-body" style={{ ...textStyle, fontSize: '13px', margin: '16px 0 0 0' }}>
        If you've already updated your password recently, you can safely ignore this email.
      </p>
    </BaseEmail>
  );
}
