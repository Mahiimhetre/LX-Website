import React from 'react';
import BaseEmail, { headingStyle, textStyle, buttonStyle, infoCardStyle, infoRowStyle } from '../BaseEmail.jsx';

export default function TeamInvitationEmail({ inviterName, teamName, inviteUrl }) {
  return (
    <BaseEmail 
      title={`Team Invitation - ${teamName}`} 
      name="Team Member"
      categoryBadge="Team Invitation"
      fallbackUrl={inviteUrl}
      securityNote="Invitation valid for 7 days"
    >
      <h2 className="text-heading" style={headingStyle}>
        You've been invited to join {teamName}
      </h2>
      
      <p className="text-body" style={textStyle}>
        <strong className="text-heading">{inviterName}</strong> has invited you to join the workspace on LocatorX to collaborate on automated locators and suite management.
      </p>
      
      <div className="info-box" style={infoCardStyle}>
        <div style={infoRowStyle}>
          <span className="text-body" style={{ fontWeight: '500' }}>Invited By</span>
          <span className="text-heading" style={{ fontWeight: '600' }}>{inviterName}</span>
        </div>
        <div style={infoRowStyle}>
          <span className="text-body" style={{ fontWeight: '500' }}>Team Workspace</span>
          <span className="text-heading" style={{ fontWeight: '600' }}>{teamName}</span>
        </div>
        <div style={{ ...infoRowStyle, borderBottom: 'none' }}>
          <span className="text-body" style={{ fontWeight: '500' }}>Assigned Role</span>
          <span style={{ color: '#7c3aed', fontWeight: '600' }}>Member (Full Access)</span>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <a href={inviteUrl} style={buttonStyle}>
          Accept &amp; Join Workspace &rarr;
        </a>
      </div>
      
      <p className="text-body" style={{ ...textStyle, fontSize: '13px', margin: '16px 0 0 0' }}>
        If you don't have an account yet, you will be guided to set up your profile upon accepting.
      </p>
    </BaseEmail>
  );
}
