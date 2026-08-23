import React from 'react';
import BaseEmail, { headingStyle, textStyle, buttonStyle } from '../BaseEmail.jsx';

export default function CleanupReminderEmail({ name, verifyUrl }) {
  return (
    <BaseEmail 
      title="Final Account Verification Reminder" 
      name={name}
      categoryBadge="Action Required"
      fallbackUrl={verifyUrl}
      securityNote="Unverified accounts purged automatically after 24h"
    >
      <h2 className="text-heading" style={headingStyle}>
        Final Account Verification Reminder
      </h2>

      <p className="text-body" style={textStyle}>
        Your LocatorX account remains unverified. To prevent unused account clutter, unverified accounts are automatically removed after 7 days.
      </p>

      <p className="text-body" style={textStyle}>
        You have <strong style={{ color: '#d97706' }}>24 hours remaining</strong> to verify your account and retain your saved locators:
      </p>
      
      <div style={{ textAlign: 'center' }}>
        <a href={verifyUrl} style={buttonStyle}>
          Verify Account Now &rarr;
        </a>
      </div>
      
      <p className="text-body" style={{ ...textStyle, fontSize: '13px', margin: '16px 0 0 0' }}>
        If you don't wish to keep this account, no action is required and it will be safely removed.
      </p>
    </BaseEmail>
  );
}
