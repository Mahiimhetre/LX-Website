import React from 'react';
import BaseEmail, { headingStyle, textStyle, buttonStyle } from '../BaseEmail.jsx';

export default function WelcomeEmail({ name, provider, resetUrl }) {
  return (
    <BaseEmail title={`Welcome to Locator-X, ${name}!`} name={name}>
      <h2 style={headingStyle}>
        Welcome to Locator-X!
      </h2>
      
      <p style={textStyle}>
        Thank you for joining us! We've successfully created your account using your <strong style={{ color: '#f8fafc' }}>{provider}</strong> profile.
      </p>
      
      <p style={textStyle}>
        Since you signed in via {provider}, you don't need a password. However, if you'd like to set a dedicated password for manual login later, you can do so anytime using the button below:
      </p>
      
      <div style={{ textAlign: 'center' }}>
        <a href={resetUrl} style={buttonStyle}>
          Set a Password (Optional)
        </a>
      </div>
      
      <p style={{ ...textStyle, margin: '16px 0 0 0' }}>
        We're excited to have you on board! If you have any questions, just reply to this email.
      </p>
    </BaseEmail>
  );
}
