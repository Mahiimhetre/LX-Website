import React from 'react';

/**
 * Shared branding & typography styles for LocatorX emails.
 * High-readability, concise, designer-grade email layout.
 */
export const buttonStyle = {
  display: 'inline-block',
  padding: '14px 32px',
  backgroundColor: '#6366f1',
  background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
  color: '#ffffff !important',
  fontSize: '14px',
  fontWeight: '600',
  borderRadius: '9999px',
  textDecoration: 'none',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.35)',
  margin: '22px 0',
  letterSpacing: '-0.01em'
};

export const headingStyle = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#0f172a',
  letterSpacing: '-0.03em',
  margin: '0 0 12px 0',
  lineHeight: '1.3'
};

export const textStyle = {
  fontSize: '14px',
  lineHeight: '1.65',
  color: '#475569',
  margin: '0 0 16px 0'
};

export const infoCardStyle = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderLeft: '3px solid #2563eb',
  borderRadius: '10px',
  padding: '14px 18px',
  margin: '20px 0'
};

export const infoRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 0',
  fontSize: '13px',
  borderBottom: '1px solid #edf2f7'
};

/**
 * BaseEmail: Clean, responsive HTML email wrapper for LocatorX transactional emails.
 */
export default function BaseEmail({
  title,
  name,
  categoryBadge = 'Account Security',
  securityNote,
  fallbackUrl,
  children
}) {
  const frontendUrl = process.env.FRONTEND_URL || 'https://locatorx.dev';
  const currentYear = new Date().getFullYear();

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <style dangerouslySetInnerHTML={{
          __html: `
            @media (prefers-color-scheme: dark) {
              body, .bg-body { background-color: #090d16 !important; }
              .card { background-color: #111827 !important; border-color: #1f2937 !important; }
              .text-heading { color: #f8fafc !important; }
              .text-body { color: #94a3b8 !important; }
              .info-box { background-color: #1e293b !important; border-color: #334155 !important; }
              .footer-bg { background-color: #0b0f19 !important; border-top-color: #1f2937 !important; }
            }
          `
        }} />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif' }}>
        <table className="bg-body" width="100%" cellPadding="0" cellSpacing="0" style={{ width: '100%', backgroundColor: '#f8fafc' }}>
          <tr>
            <td align="center" style={{ padding: '40px 16px' }}>
              <div className="card" style={{ maxWidth: '520px', width: '100%', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
                
                {/* Subtle Brand Accent Bar */}
                <div style={{ height: '3px', background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)' }} />

                {/* Main Content Area */}
                <div style={{ padding: '32px 32px 24px 32px' }}>
                  
                  {/* Brand Header & Category Pill */}
                  <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '24px' }}>
                    <tr>
                      <td style={{ verticalAlign: 'middle' }}>
                        <a href={frontendUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'inline-block' }}>
                          <img
                            src="cid:locatorx_logo"
                            alt="LocatorX"
                            height="38"
                            style={{ height: '38px', width: 'auto', display: 'block', border: 'none', outline: 'none' }}
                          />
                        </a>
                      </td>
                      <td align="right" style={{ verticalAlign: 'middle' }}>
                        {categoryBadge && (
                          <span style={{ fontSize: '11px', fontWeight: '600', color: '#2563eb', backgroundColor: '#eff6ff', border: '1px solid #dbeafe', padding: '4px 10px', borderRadius: '9999px', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                            {categoryBadge}
                          </span>
                        )}
                      </td>
                    </tr>
                  </table>

                  {/* Greeting & Main Content */}
                  <div style={{ textAlign: 'left' }}>
                    {name && (
                      <p className="text-body" style={{ ...textStyle, fontSize: '15px', fontWeight: '500', color: '#334155', marginBottom: '16px' }}>
                        Hello {name},
                      </p>
                    )}
                    {children}
                  </div>

                  {/* Fallback URL Box */}
                  {fallbackUrl && (
                    <div className="info-box" style={{ marginTop: '24px', padding: '12px 14px', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b', wordBreak: 'break-all' }}>
                      Button not working? Copy &amp; paste this link:<br />
                      <a href={fallbackUrl} style={{ color: '#2563eb', textDecoration: 'underline' }}>{fallbackUrl}</a>
                    </div>
                  )}

                  {/* Security Note */}
                  {securityNote && (
                    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
                      🔒 {securityNote}
                    </div>
                  )}
                </div>

                {/* Clean Footer */}
                <div className="footer-bg" style={{ backgroundColor: '#f8fafc', padding: '20px 32px', borderTop: '1px solid #f1f5f9', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <a href={`${frontendUrl}/documentation`} style={{ color: '#64748b', textDecoration: 'none', marginRight: '16px' }}>Docs</a>
                    <a href={`${frontendUrl}/playground`} style={{ color: '#64748b', textDecoration: 'none', marginRight: '16px' }}>Playground</a>
                    <a href={`${frontendUrl}/pricing`} style={{ color: '#64748b', textDecoration: 'none', marginRight: '16px' }}>Pricing</a>
                    <a href={`${frontendUrl}/contact`} style={{ color: '#64748b', textDecoration: 'none' }}>Support</a>
                  </div>
                  <div>
                    &copy; {currentYear} LocatorX Inc. All rights reserved.
                  </div>
                </div>

              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}
