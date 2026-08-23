import React from 'react';
import BaseEmail, { headingStyle, textStyle, buttonStyle } from '../BaseEmail.jsx';

export default function WelcomeEmail({ name, provider, resetUrl }) {
  return (
    <BaseEmail 
      title={`Welcome to LocatorX, ${name}!`} 
      name={name}
      categoryBadge="Welcome Onboard"
      fallbackUrl={resetUrl}
      securityNote="Authenticated via OAuth • Instant setup completed"
    >
      <h2 className="text-heading" style={headingStyle}>
        Welcome to LocatorX, {name}!
      </h2>
      
      <p className="text-body" style={textStyle}>
        Your account was successfully created using your <strong className="text-heading">{provider}</strong> profile. You now have full access to the LocatorX test automation playground and suite tools.
      </p>
      
      <p className="text-body" style={textStyle}>
        Since you authenticated via {provider}, no password is required. If you ever want to set a standalone password for direct login later, you can do so anytime below:
      </p>
      
      <div style={{ textAlign: 'center' }}>
        <a href={resetUrl} style={buttonStyle}>
          Set Optional Password &rarr;
        </a>
      </div>
      
      <p className="text-body" style={{ ...textStyle, fontSize: '13px', margin: '16px 0 0 0' }}>
        We're excited to have you on board! If you have any questions, feel free to contact our support team.
      </p>
    </BaseEmail>
  );
}
