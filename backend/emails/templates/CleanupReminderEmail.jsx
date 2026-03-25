import React from 'react';
import BaseEmail, { headingStyle, textStyle, buttonStyle } from '../BaseEmail.jsx';

export default function CleanupReminderEmail({ name, verifyUrl }) {
  return (
    <BaseEmail title="Final Verification Reminder" name={name}>
      <h2 style={headingStyle}>
        Final Reminder
      </h2>

      <p style={textStyle}>
        Your account is still unverified. If you don't verify your account within the next 24 hours, it will be automatically removed from our system.
      </p>
      
      <div style={{ textAlign: 'center' }}>
        <a href={verifyUrl} style={buttonStyle}>
          Verify Account Now
        </a>
      </div>
      
      <p style={{ ...textStyle, margin: '16px 0 0 0' }}>
        If you don't want to keep this account, you can ignore this email.
      </p>
    </BaseEmail>
  );
}
