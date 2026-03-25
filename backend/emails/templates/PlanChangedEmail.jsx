import React from 'react';
import BaseEmail, { headingStyle, textStyle } from '../BaseEmail.jsx';

export default function PlanChangedEmail({ name, planName }) {
  return (
    <BaseEmail title={`Your Locator-X Plan updated to ${planName}`} name={name}>
      <h2 style={headingStyle}>
        Plan Updated
      </h2>

      <p style={textStyle}>
        Your subscription plan has been successfully updated to <strong style={{ color: '#f8fafc' }}>{planName}</strong>.
      </p>
      <p style={{ ...textStyle, margin: '16px 0 0 0' }}>
        Thank you for choosing Locator-X for your team's consistency!
      </p>
    </BaseEmail>
  );
}
