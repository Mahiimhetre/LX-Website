import React from 'react';

/**
 * Shared branding styles for all emails.
 */
export const buttonStyle = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '24px',
  fontWeight: '600',
  fontSize: '15px',
  textDecoration: 'none',
  display: 'inline-block',
  boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
  margin: '32px 0'
};

export const headingStyle = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#f8fafc',
  margin: '0 0 24px 0'
};

export const textStyle = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#94a3b8',
  margin: '0 0 16px 0'
};

/**
 * BaseEmail is a pure HTML/React wrapper to avoid React 19 compatibility issues
 * with @react-email/components.
 */
export default function BaseEmail({ title, name, children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
      </head>
      <body style={{ backgroundColor: '#030712', margin: 0, padding: 0, fontFamily: 'Inter, system-ui, sans-serif', color: '#f8fafc' }}>
        <table width="100%" border="0" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#030712' }}>
          <tr>
            <td align="center" style={{ padding: '48px 16px' }}>
              <div style={{ maxWidth: '600px', backgroundColor: '#080c14', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '40px', textAlign: 'left' }}>
                
                {/* Header */}
                <table width="100%" border="0" cellPadding="0" cellSpacing="0" style={{ marginBottom: '48px' }}>
                  <tr>
                    <td style={{ width: '64px', verticalAlign: 'middle' }}>
                      <div style={{ 
                        padding: '2px', 
                        backgroundColor: '#1e1b4b', 
                        borderRadius: '50%',
                        border: '1px solid rgba(59,130,246,0.3)'
                      }}>
                        <img 
                          src={`${process.env.FRONTEND_URL}/favicon.png`} 
                          alt="Logo" 
                          width="56"
                          height="56"
                          style={{ borderRadius: '100%', backgroundColor: '#030712', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                    </td>
                    <td style={{ paddingLeft: '20px', verticalAlign: 'middle' }}>
                      <h1 style={{ fontSize: '36px', fontWeight: '800', margin: 0, lineHeight: '1', letterSpacing: '-0.025em', color: '#3b82f6' }}>
                        Locator<span style={{ color: '#a855f7' }}>X</span>
                      </h1>
                      <div style={{ margin: '6px 0 0 0', fontSize: '10px', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', opacity: '0.8' }}>
                        Locator Generator &amp; Manager
                      </div>
                    </td>
                  </tr>
                </table>
                
                {/* Content Area */}
                <div style={{ minHeight: '150px' }}>
                  <p style={{ ...textStyle, fontWeight: '500', color: '#f8fafc', marginBottom: '20px' }}>
                    Hello {name || 'there'},
                  </p>
                  {children}
                </div>

                {/* Footer */}
                <div style={{ marginTop: '64px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', color: 'rgba(148,163,184,0.3)', margin: 0, fontWeight: '500' }}>
                    &copy; {new Date().getFullYear()} Locator-X. All rights reserved.
                  </p>
                </div>

              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}
