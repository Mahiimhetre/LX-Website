import React from 'react';
import BaseEmail, { headingStyle, textStyle, buttonStyle } from '../BaseEmail.jsx';

export default function VerificationEmail({ name, verifyUrl }) {
  return (
    <BaseEmail title="Verify your Locator-X Account" name={name}>
      <h2 style={headingStyle}>
        Welcome to Locator-X!
      </h2>
      
      <p style={textStyle}>
        Please click the button below to verify your email address and activate your account:
      </p>
      
      <div style={{ textAlign: 'center' }}>
        <a href={verifyUrl} style={buttonStyle}>
          Verify Email
        </a>
      </div>
      
      <p style={{ ...textStyle, margin: '16px 0 0 0' }}>
        If you didn't request this, please ignore this email.
      </p>
    </BaseEmail>
  );
}
