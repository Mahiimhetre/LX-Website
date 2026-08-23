import React from 'react';
import BaseEmail, { headingStyle, textStyle, buttonStyle } from '../BaseEmail.jsx';

export default function PlanExpiryReminderEmail({ name, teamName, daysRemaining, renewUrl }) {
  return (
    <BaseEmail 
      title="Team Subscription Expiring Soon" 
      name={name}
      categoryBadge="Subscription Notice"
      fallbackUrl={renewUrl}
      securityNote="Automated billing notice for workspace owner"
    >
      <h2 className="text-heading" style={headingStyle}>
        Team Subscription Expiring Soon
      </h2>

      <p className="text-body" style={textStyle}>
        The subscription for your team workspace <strong className="text-heading">{teamName}</strong> will expire in <strong style={{ color: '#dc2626' }}>{daysRemaining} days</strong>.
      </p>
      
      <p className="text-body" style={textStyle}>
        Renew your plan now to prevent any downtime or feature restrictions for your team members.
      </p>
      
      <div style={{ textAlign: 'center' }}>
        <a href={renewUrl} style={buttonStyle}>
          Renew Subscription &rarr;
        </a>
      </div>
      
      <p className="text-body" style={{ ...textStyle, fontSize: '13px', margin: '16px 0 0 0' }}>
        If you have any questions regarding billing or plan options, feel free to contact our support team.
      </p>
    </BaseEmail>
  );
}
