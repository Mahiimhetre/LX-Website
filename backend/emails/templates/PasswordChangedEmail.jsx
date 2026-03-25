import React from 'react';
import BaseEmail, { headingStyle, textStyle } from '../BaseEmail.jsx';

export default function PasswordChangedEmail({ name }) {
  return (
    <BaseEmail title="Password Changed Successfully" name={name}>
      <h2 style={headingStyle}>
        Password Changed
      </h2>

      <p style={textStyle}>
        This is a confirmation that the password for your Locator-X account has been successfully updated.
      </p>
      <p style={{ ...textStyle, margin: '16px 0 0 0' }}>
        If you did not perform this action, please <strong style={{ color: '#f8fafc' }}>contact support immediately</strong> to secure your account.
      </p>
    </BaseEmail>
  );
}
