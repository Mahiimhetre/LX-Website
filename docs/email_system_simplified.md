# 📧 LocatorX Email System – Simplified Guide

A **complete, child‑friendly reference** that explains every email‑related file, function, and piece of logic in the LocatorX project.  
Use this document whenever you need to understand, modify, or add a new email type without digging through the original code.

---

## 🗂️ File Overview

| File | Purpose | Key Exports |
|------|---------|-------------|
| `src/utils/emailService.js` | Central hub for sending all emails. Handles rendering, SMTP transport, and error handling. | `sendEmailByType(type, params)` |
| `backend/emails/templates/VerificationEmail.jsx` | Verification email (new‑account). | `<VerificationEmail …/>` |
| `backend/emails/templates/WelcomeEmail.jsx` | Welcome message for new users (especially OAuth sign‑ins). | `<WelcomeEmail …/>` |
| `backend/emails/templates/PasswordResetEmail.jsx` | Email with a password‑reset link. | `<PasswordResetEmail …/>` |
| `backend/emails/templates/PasswordChangedEmail.jsx` | Confirmation that a password was changed. | `<PasswordChangedEmail …/>` |
| `backend/emails/templates/PlanChangedEmail.jsx` | Notification that a user’s subscription plan was updated. | `<PlanChangedEmail …/>` |
| `backend/emails/templates/CleanupReminderEmail.jsx` | Reminder to verify an account before it’s auto‑deleted. | `<CleanupReminderEmail …/>` |
| `backend/emails/templates/PasswordExpiryReminderEmail.jsx` | Alert that a password will expire soon. | `<PasswordExpiryReminderEmail …/>` |
| `backend/emails/templates/PlanExpiryReminderEmail.jsx` | Alert that a team plan is about to expire. | `<PlanExpiryReminderEmail …/>` |
| `backend/emails/BaseEmail.jsx` | Shared HTML scaffolding & styling for **all** email templates. | `<BaseEmail …/>` |

---

## 🎨 1️⃣ Base Email Component (`BaseEmail.jsx`)

A **pure HTML/React wrapper** that provides a consistent look for every email.

```jsx
// BaseEmail.jsx
export default function BaseEmail({ title, name, children }) {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
      </head>
      <body style={styles.body}>
        <div style={styles.container}>
          {/* Header with logo */}
          {/* … more markup … */}

          {/* Main content */}
          <div style={styles.content}>{children}</div>

          {/* Footer */}
          <div style={styles.footer}>{footerContent}</div>
        </div>
      </body>
    </html>
  );
}
```

### Core Styles (`styles` object)

| Variable | Meaning | Example Value |
|----------|---------|---------------|
| `buttonStyle` | Primary CTA button (blue background, rounded). | `{backgroundColor: '#3b82f6', ...}` |
| `headingStyle` | Main heading (large, bold). | `{fontSize: '24px', fontWeight: '600', ...}` |
| `textStyle` | Body text (readable, light color). | `{fontSize: '15px', lineHeight: '1.6', ...}` |

> **Why it matters:** All emails automatically inherit the same branding, button look, and responsive layout. No need to copy‑paste CSS for each new email!

---

## 📧 2️⃣ Email Types & Their Simplified Templates

### 2.1 Verification Email (`VerificationEmail.jsx`)

```jsx
import React from 'react';
import BaseEmail, { headingStyle, textStyle, buttonStyle } from '../BaseEmail';

export default function VerificationEmail({ name, verifyUrl }) {
  return (
    <BaseEmail title="Verify your Locator-X Account" name={name}>
      <h2 style={headingStyle}>Welcome to Locator-X!</h2>
      <p style={textStyle}>
        Please click the button below to verify your email address and activate your account:
      </p>
      <div style={{ textAlign: 'center' }}>
        <a href={verifyUrl} style={buttonStyle}>Verify Email</a>
      </div>
      <p style={{ ...textStyle, margin: '16px 0 0 0' }}>
        If you didn’t request this, you can safely ignore this email.
      </p>
    </BaseEmail>
  );
}
```

### 2.2 Welcome Email (`WelcomeEmail.jsx`)

```jsx
import React from 'react';
import BaseEmail, { headingStyle, textStyle, buttonStyle } from '../BaseEmail';

export default function WelcomeEmail({ name, provider, resetUrl }) {
  return (
    <BaseEmail title={`Welcome to Locator-X, ${name}!`} name={name}>
      <h2 style={headingStyle}>Welcome to Locator-X!</h2>
      <p style={textStyle}>
        Thank you for joining us! We’ve successfully created your account using your
        <strong style={{ color: '#f8fafc' }}>{provider}</strong> profile.
      </p>
      <p style={textStyle}>
        Since you signed in via {provider}, you don’t need a password yet.
        If you’d like to set a dedicated password later, use the button below:
      </p>
      <div style={{ textAlign: 'center' }}>
        <a href={resetUrl} style={buttonStyle}>Set a Password (Optional)</a>
      </div>
      <p style={{ ...textStyle, margin: '16px 0 0 0' }}>
        We’re excited to have you on board! Reply to this email if you have any questions.
      </p>
    </BaseEmail>
  );
}
```

### 2.3 Password Reset Email (`PasswordResetEmail.jsx`)

```jsx
import React from 'react';
import BaseEmail, { headingStyle, textStyle, buttonStyle } from '../BaseEmail';

export default function PasswordResetEmail({ name, resetUrl }) {
  return (
    <BaseEmail title="Password Reset Request" name={name}>
      <h2 style={headingStyle}>Password Reset Request</h2>
      <p style={textStyle}>
        We received a request to reset your password. Click the button below to set a new password:
      </p>
      <div style={{ textAlign: 'center' }}>
        <a href={resetUrl} style={buttonStyle}>Reset Password</a>
      </div>
      <p style={{ ...textStyle, margin: '16px 0 0 0' }}>
        If you didn’t request a reset, you can safely ignore this email.
      </p>
    </BaseEmail>
  );
}
```

### 2.4 Password Changed Email (`PasswordChangedEmail.jsx`)

```jsx
import React from 'react';
import BaseEmail, { headingStyle, textStyle } from '../BaseEmail';

export default function PasswordChangedEmail({ name }) {
  return (
    <BaseEmail title="Password Changed Successfully" name={name}>
      <h2 style={headingStyle}>Password Changed</h2>
      <p style={textStyle}>
        This is a confirmation that the password for your Locator‑X account has been
        successfully updated.
      </p>
      <p style={{ ...textStyle, margin: '16px 0 0 0' }}>
        If you did not perform this action, please <strong style={{ color: '#f8fafc' }}>
          contact support immediately
        </strong> to secure your account.
      </p>
    </BaseEmail>
  );
}
```

### 2.5 Plan Changed Email (`PlanChangedEmail.jsx`)

```jsx
import React from 'react';
import BaseEmail, { headingStyle, textStyle } from '../BaseEmail';

export default function PlanChangedEmail({ name, planName }) {
  return (
    <BaseEmail title={`Your Locator-X Plan updated to ${planName}`} name={name}>
      <h2 style={headingStyle}>Plan Updated</h2>
      <p style={textStyle}>
        Your subscription plan has been successfully updated to <strong>{planName}</strong>.
      </p>
      <p style={{ ...textStyle, margin: '16px 0 0 0' }}>
        Thank you for choosing Locator‑X for your team's consistency!
      </p>
    </BaseEmail>
  );
}
```

### 2.6 Cleanup Reminder Email (`CleanupReminderEmail.jsx`)

```jsx
import React from 'react';
import BaseEmail, { headingStyle, textStyle, buttonStyle } from '../BaseEmail';

export default function CleanupReminderEmail({ name, verifyUrl }) {
  return (
    <BaseEmail title="Final Verification Reminder" name={name}>
      <h2 style={headingStyle}>Final Reminder</h2>
      <p style={textStyle}>
        Your account is still unverified. If you don’t verify your account within the
        next 24 hours, it will be automatically removed from our system.
      </p>
      <div style={{ textAlign: 'center' }}>
        <a href={verifyUrl} style={buttonStyle}>Verify Account Now</a>
      </div>
      <p style={{ ...textStyle, margin: '16px 0 0 0' }}>
        If you don’t want to keep this account, you can ignore this email.
      </p>
    </BaseEmail>
  );
}
```

### 2.7 Password Expiry Reminder Email (`PasswordExpiryReminderEmail.jsx`)

```jsx
import React from 'react';
import BaseEmail, { headingStyle, textStyle, buttonStyle } from '../BaseEmail';

export default function PasswordExpiryReminderEmail({ name, daysRemaining, resetUrl }) {
  return (
    <BaseEmail title="Action Required: Your Password Expires Soon" name={name}>
      <h2 style={headingStyle}>Password Expiration Notice</h2>
      <p style={textStyle}>
        Your password will expire in <strong>{daysRemaining} days</strong>. For security
        reasons, please set a new password before it expires.
      </p>
      <div style={{ textAlign: 'center' }}>
        <a href={resetUrl} style={buttonStyle}>Reset Password</a>
      </div>
      <p style={{ ...textStyle, margin: '16px 0 0 0' }}>
        If you have any questions, feel free to reply to this email.
      </p>
    </BaseEmail>
  );
}
```

### 2.8 Plan Expiry Reminder Email (`PlanExpiryReminderEmail.jsx`)

```jsx
import React from 'react';
import BaseEmail, { headingStyle, textStyle, buttonStyle } from '../BaseEmail';

export default function PlanExpiryReminderEmail({ name, teamName, daysRemaining, renewUrl }) {
  return (
    <BaseEmail title={`Action Required: Your Plan for ${teamName} Expires Soon`} name={name}>
      <h2 style={headingStyle}>Plan Expiration Notice</h2>
      <p style={textStyle}>
        Your plan for <strong>{teamName}</strong> will expire in <strong>{daysRemaining} days</strong>.
        To continue using premium features, renew now:
      </p>
      <div style={{ textAlign: 'center' }}>
        <a href={renewUrl} style={buttonStyle}>Renew Plan</a>
      </div>
      <p style={{ ...textStyle, margin: '16px 0 0 0' }}>
        Need help? Reply to this email for assistance.
      </p>
    </BaseEmail>
  );
}
```

---

## ⚙️ 3️⃣ Central Email Factory (`emailService.js`)

All email‑sending logic lives in **one place**.  
You call `sendEmailByType(type, params)` and the function:

1. **Validates** required fields for the given `type`.  
2. **Lazy‑loads** the correct React component.  
3. **Renders** it to HTML.  
4. **Sends** via SMTP (via `nodemailer`).  

```js
// emailService.js (simplified)

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

/* ---------- 1️⃣ Validation Helper ---------- */
const EMAIL_TYPES = {
  VERIFICATION: 'verification',
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password-reset',
  PASSWORD_CHANGED: 'password-changed',
  PLAN_CHANGED: 'plan-changed',
  CLEANUP_REMINDER: 'cleanup-reminder',
  PASSWORD_EXPIRY: 'password-expiry',
  PLAN_EXPIRY: 'plan-expiry',
};

const validateEmailParams = (type, params) => {
  switch (type) {
    case EMAIL_TYPES.VERIFICATION:
      if (!params.to || !params.name || !params.token) throw new Error('Missing required fields for verification email');
      break;
    case EMAIL_TYPES.PASSWORD_RESET:
      if (!params.to || !params.name || !params.token) throw new Error('Missing required fields for password‑reset email');
      break;
    case EMAIL_TYPES.PLAN_EXPIRY:
      if (!params.to || !params.name || !params.teamName || !params.daysRemaining || !params.renewUrl) {
        throw new Error('Missing required fields for plan‑expiry email');
      }
      break;
    // Add similar blocks for the other types …
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
};

/* ---------- 2️⃣ Render & Send ---------- */
const render = async (Component) => {
  const module = await import(`../emails/templates/${Component}.jsx`);
  return render(<Component {...module.default.props} />);
};

const sendEmail = async ({ to, subject, component }) => {
  const html = await render(component);
  const mailOptions = {
    from: '"Locator-X Support" <noreply@locator-x.com>',
    to,
    subject,
    html,
  };
  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ Email sent: ${subject} (Message-ID: ${info.messageId})`);
};

/* ---------- 3️⃣ Public API ---------- */
export const sendEmailByType = async (type, params) => {
  validateEmailParams(type, params);

  const templates = {
    [EMAIL_TYPES.VERIFICATION]: () => import('../emails/templates/VerificationEmail.jsx'),
    [EMAIL_TYPES.WELCOME]: () => import('../emails/templates/WelcomeEmail.jsx'),
    [EMAIL_TYPES.PASSWORD_RESET]: () => import('../emails/templates/PasswordResetEmail.jsx'),
    [EMAIL_TYPES.PASSWORD_CHANGED]: () => import('../emails/templates/PasswordChangedEmail.jsx'),
    [EMAIL_TYPES.PLAN_CHANGED]: () => import('../emails/templates/PlanChangedEmail.jsx'),
    [EMAIL_TYPES.CLEANUP_REMINDER]: () => import('../emails/templates/CleanupReminderEmail.jsx'),
    [EMAIL_TYPES.PASSWORD_EXPIRY]: () => import('../emails/templates/PasswordExpiryReminderEmail.jsx'),
    [EMAIL_TYPES.PLAN_EXPIRY]: () => import('../emails/templates/PlanExpiryReminderEmail.jsx'),
  };

  const TemplateComponent = await templates[type]();
  let componentJSX;

  switch (type) {
    case EMAIL_TYPES.VERIFICATION:
      componentJSX = <TemplateComponent name={params.name} verifyUrl={params.verifyUrl} />;
      break;
    case EMAIL_TYPES.WELCOME:
      componentJSX = <TemplateComponent name={params.name} provider={params.provider} resetUrl={params.resetUrl} />;
      break;
    case EMAIL_TYPES.PASSWORD_RESET:
      componentJSX = <TemplateComponent name={params.name} resetUrl={params.resetUrl} />;
      break;
    case EMAIL_TYPES.PASSWORD_CHANGED:
      componentJSX = <TemplateComponent name={params.name} />;
      break;
    case EMAIL_TYPES.PLAN_CHANGED:
      componentJSX = <TemplateComponent name={params.name} planName={params.planName} />;
      break;
    case EMAIL_TYPES.CLEANUP_REMINDER:
      componentJSX = <TemplateComponent name={params.name} verifyUrl={params.verifyUrl} />;
      break;
    case EMAIL_TYPES.PASSWORD_EXPIRY:
      componentJSX = <TemplateComponent name={params.name} daysRemaining={params.daysRemaining} resetUrl={params.resetUrl} />;
      break;
    case EMAIL_TYPES.PLAN_EXPIRY:
      componentJSX = <TemplateComponent name={params.name} teamName={params.teamName} daysRemaining={params.daysRemaining} renewUrl={params.renewUrl} />;
      break;
    default:
      throw new Error('Unhandled email type');
  }

  await sendEmail({
    to: params.to,
    subject: params.subject || getSubjectForType(type), // helper that returns a sensible default subject
    component: componentJSX,
  });
};

/* ---------- Helper: default subjects ---------- */
const getSubjectForType = (type) => {
  switch (type) {
    case EMAIL_TYPES.VERIFICATION: return 'Verify your Locator-X Account';
    case EMAIL_TYPES.WELCOME: return 'Welcome to Locator-X!';
    case EMAIL_TYPES.PASSWORD_RESET: return 'Reset your Locator-X Password';
    case EMAIL_TYPES.PASSWORD_CHANGED: return 'Your Locator-X Password Has Been Changed';
    case EMAIL_TYPES.PLAN_CHANGED: return 'Your Locator-X Plan Has Been Updated';
    case EMAIL_TYPES.CLEANUP_REMINDER: return 'Final Verification Reminder';
    case EMAIL_TYPES.PASSWORD_EXPIRY: return 'Action Required: Your Password Expires Soon';
    case EMAIL_TYPES.PLAN_EXPIRY: return 'Action Required: Your Plan for … Expires Soon';
    default: return 'Subject not configured';
  }
};
```

### How to Use It (Example)

```js
// Somewhere in your backend controller
import { sendEmailByType } from '../utils/emailService.js';

await sendEmailByType('verification', {
  to: user.email,
  name: user.profile.name,
  verifyUrl: `http://localhost:3000/auth/verify?token=${jwt}`,
});
```

> **Benefit:** Adding a new email type now only requires:
> 1. Adding an entry to `EMAIL_TYPES`.
> 2. Adding a tiny validation case in `validateEmailParams`.
> 3. Adding a new React component in `templates/`.
> 4. Adding a `case` in the `switch` block that renders the component.
> 5. (Optional) Adding a default subject in `getSubjectForType`.

No need to touch any other file!

---

## 📋 4️⃣ Quick‑Reference Cheat Sheet

| Email Type | Required Params | Default Subject | React Component |
|------------|----------------|----------------|-----------------|
| `verification` | `to`, `name`, `token` | *Verify your Locator-X Account* | `VerificationEmail` |
| `welcome` | `to`, `name`, `provider`, `resetUrl` | *Welcome to Locator-X!* | `WelcomeEmail` |
| `password-reset` | `to`, `name`, `token` | *Reset your Locator-X Password* | `PasswordResetEmail` |
| `password-changed` | `to`, `name` | *Your Locator-X Password Has Been Changed* | `PasswordChangedEmail` |
| `plan-changed` | `to`, `name`, `planName` | *Your Locator-X Plan Has Been Updated* | `PlanChangedEmail` |
| `cleanup-reminder` | `to`, `name`, `verifyUrl` | *Final Verification Reminder* | `CleanupReminderEmail` |
| `password-expiry` | `to`, `name`, `daysRemaining`, `resetUrl` | *Action Required: Your Password Expires Soon* | `PasswordExpiryReminderEmail` |
| `plan-expiry` | `to`, `name`, `teamName`, `daysRemaining`, `renewUrl` | *Action Required: Your Plan for … Expires Soon* | `PlanExpiryReminderEmail` |

---

## 🛠️ 5️⃣ Adding a **NEW** Email Type – Step‑by‑Step

1. **Create the React component**  
   `backend/emails/templates/YourNewEmail.jsx` (copy the pattern of an existing file).  
2. **Export it** as the default export.  
3. **Add a constant** to `EMAIL_TYPES` (e.g., `YOUR_NEW_TYPE: 'your-new-type'`).  
4. **Extend validation** in `validateEmailParams` with the needed fields.  
5. **Add a `case`** in the `switch` block inside `sendEmailByType` that renders the component.  
6. **Add a default subject** in `getSubjectForType` (or pass a custom one when you call the function).  
7. **Write a test** (or manually trigger the function) to confirm it sends correctly.

---

## 🗒️ 6️⃣ Track Your Progress

To make sure you cover every part of the email system, consider using the **TodoWrite** tool:

```json
{
  "todos": [
    {
      "content": "Create VerificationEmail.jsx",
      "status": "pending"
    },
    {
      "content": "Create WelcomeEmail.jsx",
      "status": "pending"
    },
    {
      "content": "Create PasswordResetEmail.jsx",
      "status": "pending"
    },
    {
      "content": "Create PasswordChangedEmail.jsx",
      "status": "pending"
    },
    {
      "content": "Create PlanChangedEmail.jsx",
      "status": "pending"
    },
    {
      "content": "Create CleanupReminderEmail.jsx",
      "status": "pending"
    },
    {
      "content": "Create PasswordExpiryReminderEmail.jsx",
      "status": "pending"
    },
    {
      "content": "Create PlanExpiryReminderEmail.jsx",
      "status": "pending"
    },
    {
      "content": "Write emailService.js simplified version",
      "status": "pending"
    },
    {
      "content": "Create docs/email_system_simplified.md",
      "status": "pending"
    }
  ]
}
```

You can later query this list with the **TodoWrite** tool to see what’s left, mark items as **in_progress**, or **completed**.

---

## 📦 7️⃣ All‑In‑One Master File (Already Created)

> **File:** `docs/email_system_simplified.md`  
> The content above lives in that file, ready for you to open, read, or edit.  
> You can reference it anytime you need to work on a new email type or understand an existing one.

---

### 🎉 Next Steps

- **Pick an email type** you’d like to add or modify.  
- Follow the **“Adding a New Email Type”** checklist.  
- Use **TodoWrite** to keep track of completed steps.  
- When you’re done, feel free to ask for a review or for help with testing the new email.

---

*Happy coding! 🚀*