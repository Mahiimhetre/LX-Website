import React from 'react';
import BaseEmail, { headingStyle, textStyle, buttonStyle } from '../BaseEmail.jsx';

export default function PlanExpiryReminderEmail({ name, teamName, daysRemaining, renewUrl }) {
  return (
    <BaseEmail title="Plan Expiry Reminder" name={name}>
      <h2 style={headingStyle}>
        Subscription Reminder
      </h2>

      <p style={textStyle}>
        Your subscription for team <strong style={{ color: '#f8fafc' }}>{teamName}</strong> is set to expire in <strong style={{ color: '#f8fafc' }}>{daysRemaining} days</strong>.
      </p>
      
      <p style={textStyle}>
        Renew your plan now to ensure uninterrupted access to all of Locator-X's premium features for your team.
      </p>
      
      <div style={{ textAlign: 'center' }}>
        <a href={renewUrl} style={buttonStyle}>
          Renew Subscription
        </a>
      </div>
      
      <p style={{ ...textStyle, margin: '16px 0 0 0' }}>
        If you have any questions about your billing or plan, feel free to contact our support team.
      </p>
    </BaseEmail>
  );
}
