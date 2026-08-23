import React from 'react';
import BaseEmail, { headingStyle, textStyle, buttonStyle, infoCardStyle, infoRowStyle } from '../BaseEmail.jsx';

export default function PlanChangedEmail({ name, planName }) {
  const frontendUrl = process.env.FRONTEND_URL || 'https://locatorx.dev';
  
  return (
    <BaseEmail 
      title={`Your LocatorX Plan updated to ${planName}`} 
      name={name}
      categoryBadge="Billing Update"
      securityNote="Transaction verified via Razorpay"
    >
      <h2 className="text-heading" style={headingStyle}>
        Subscription Plan Updated
      </h2>

      <p className="text-body" style={textStyle}>
        Great news! Your subscription plan has been successfully updated to <strong className="text-heading">{planName}</strong>.
      </p>

      <div className="info-box" style={{ ...infoCardStyle, borderLeft: '3px solid #7c3aed' }}>
        <div style={infoRowStyle}>
          <span className="text-body" style={{ fontWeight: '500' }}>New Tier</span>
          <span style={{ color: '#7c3aed', fontWeight: '600' }}>{planName}</span>
        </div>
        <div style={{ ...infoRowStyle, borderBottom: 'none' }}>
          <span className="text-body" style={{ fontWeight: '500' }}>Status</span>
          <span style={{ color: '#16a34a', fontWeight: '600' }}>Active</span>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <a href={`${frontendUrl}/dashboard`} style={buttonStyle}>
          Go to Dashboard &rarr;
        </a>
      </div>

      <p className="text-body" style={{ ...textStyle, fontSize: '13px', margin: '16px 0 0 0' }}>
        Thank you for choosing LocatorX for your team's locator consistency and automation!
      </p>
    </BaseEmail>
  );
}
