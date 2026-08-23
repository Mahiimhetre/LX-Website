import React from 'react';
import BaseEmail, { headingStyle, textStyle, infoCardStyle, infoRowStyle } from '../BaseEmail.jsx';

export default function PasswordChangedEmail({ name }) {
  return (
    <BaseEmail 
      title="Password Changed Successfully" 
      name={name}
      categoryBadge="Account Protection"
      securityNote="Security event logged • Contact support if unrecognized"
    >
      <h2 className="text-heading" style={headingStyle}>
        Password Changed Successfully
      </h2>

      <p className="text-body" style={textStyle}>
        This is an automated confirmation that the password for your LocatorX account was successfully updated.
      </p>

      <div className="info-box" style={infoCardStyle}>
        <div style={infoRowStyle}>
          <span className="text-body" style={{ fontWeight: '500' }}>Action</span>
          <span className="text-heading" style={{ fontWeight: '600' }}>Password Update</span>
        </div>
        <div style={{ ...infoRowStyle, borderBottom: 'none' }}>
          <span className="text-body" style={{ fontWeight: '500' }}>Status</span>
          <span style={{ color: '#16a34a', fontWeight: '600' }}>Successful</span>
        </div>
      </div>

      <p className="text-body" style={{ ...textStyle, fontSize: '13px', margin: '16px 0 0 0' }}>
        If you did not perform this change, please <strong className="text-heading">contact support immediately</strong> to secure your account.
      </p>
    </BaseEmail>
  );
}
