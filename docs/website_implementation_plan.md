# Future Implementation Plan - Locator-X Website

This implementation plan outlines the blueprint for rebuilding the **Locator-X Website** (Express Backend API & Vite-React Frontend Client) from scratch.

---

## Phase 1: Environment Setup & Foundation

### Backend Foundation
1.  Initialize Node.js package environment supporting ES Modules (`type: "module"`).
2.  Install dependencies: `express`, `cors`, `dotenv`, `sequelize`, `pg`/`mysql2`, `helmet`, `express-rate-limit`.
3.  Configure database client connection logic [database.js](file:///e:/LocatorX/LX-Website/backend/config/database.js) utilizing environment variables.
4.  Configure core entrypoint server setup [server.js](file:///e:/LocatorX/LX-Website/backend/server.js) with Helmet security headers, global JSON parser, and CORS policies.

### Frontend Foundation
1.  Initialize Vite project with React 18 template: `npm create vite@latest client -- --template react`.
2.  Install client dependencies: `react-router-dom`, `lucide-react`, `@tanstack/react-query`, `tailwind-merge`, `clsx`.
3.  Configure tailwind configuration variables and build the CSS layout design system [index.css](file:///e:/LocatorX/LX-Website/src/index.css).
4.  Establish API Client wrapper [client.js](file:///e:/LocatorX/LX-Website/src/api/client.js) using axios defaults pointing to backend dev server port.

---

## Phase 2: Security, User Identity & Authentication

### Database Schema Implementation
1.  Create [User.js](file:///e:/LocatorX/LX-Website/backend/models/User.js) and [Profile.js](file:///e:/LocatorX/LX-Website/backend/models/Profile.js).
2.  Attach Sequelize hook `beforeSave` inside User model to refresh `passwordExpiresAt` on credentials update:
    ```javascript
    if (user.changed('password')) {
        user.passwordExpiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
    }
    ```

### Server Auth Routes
1.  Implement password hashing (using BCrypt) and JWT token generation methods.
2.  Configure controllers [authController.js](file:///e:/LocatorX/LX-Website/backend/controllers/authController.js) and router mappings [authRoutes.js](file:///e:/LocatorX/LX-Website/backend/routes/authRoutes.js).
3.  Add rate limiter middleware restricting auth requests.
4.  Setup Passport/OAuth middlewares to handle Google and GitHub credentials callback redirects.

### Client Auth UI
1.  Create React authorization provider context [AuthContext.jsx](file:///e:/LocatorX/LX-Website/src/contexts/AuthContext.jsx).
2.  Build frontend login pages (`Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `VerifyEmail.jsx`).

---

## Phase 3: Synced Locators & Cloud Dashboard

### Backend Integration
1.  Implement [Locator.js](file:///e:/LocatorX/LX-Website/backend/models/Locator.js) containing selector string, tag type, page context URL, and user reference fields.
2.  Establish locator API endpoints [locatorRoutes.js](file:///e:/LocatorX/LX-Website/backend/routes/locatorRoutes.js) to retrieve, add, and destroy selectors, verifying authorization via JWT token headers.

### Client Dashboard UI
1.  Develop landing screen layout (`Index.jsx`) and private sync area (`Dashboard.jsx`).
2.  Set up React hook event listener within `AuthContext` to broadcast custom event logs to the Chrome extension:
    ```javascript
    document.dispatchEvent(new CustomEvent('SYNC_LOCATOR_X', { detail: userData }));
    ```

---

## Phase 4: Collaborative Team Engine

### Team Schema Definition
1.  Implement models inside [Team.js](file:///e:/LocatorX/LX-Website/backend/models/Team.js): `Team`, `TeamMember`, and `TeamInvitation`.
2.  Define associations within model entrypoint [index.js](file:///e:/LocatorX/LX-Website/backend/models/index.js).

### Invitation & Permissions Controllers
1.  Establish team creator route [teamController.js](file:///e:/LocatorX/LX-Website/backend/controllers/teamController.js) and add validation rules checking owner IDs.
2.  Create cryptographic invitation token generator mapping email addresses to targeted team roles with a 7-day expiration time limit.
3.  Develop invite acceptance endpoints. Verify that the current user's email address matches the invitation email.

### Client Team UI
1.  Develop team settings screen (`TeamDashboard.jsx`). Renders active member seats, invites, and role configurations.
2.  Implement invitation landing check gateway page (`JoinTeam.jsx`).

---

## Phase 5: Payment Subsystem & Daily Cron Jobs

### Razorpay Checkout Integration
1.  Create model details [Payment.js](file:///e:/LocatorX/LX-Website/backend/models/Payment.js) and billing routes [paymentRoutes.js](file:///e:/LocatorX/LX-Website/backend/routes/paymentRoutes.js).
2.  Implement Razorpay order creator in [paymentController.js](file:///e:/LocatorX/LX-Website/backend/controllers/paymentController.js).
3.  Build Payment Verification method:
    *   Generates HMAC-SHA256 hash using the Razorpay order and payment IDs.
    *   Compares the hash against the Razorpay signature.
    *   Verifies the database to prevent duplicate payment submissions.
    *   Saves the transaction details to the database and extends the team's plan expiration date by 30 days.

### Stack Block Cancellations & Refund Policies
1.  Implement cancel subscription controller checking if `now() < planStartedAt` (future stacked blocks).
2.  Calculate refund deduction amount minus a fixed cancellation charge of 50 units.
3.  Update total paid invoice amounts in database.

### Automated Server Cron Services
1.  Establish [cleanupService.js](file:///e:/LocatorX/LX-Website/backend/utils/cleanupService.js): runs daily to notify unverified accounts (at 6 days) and delete unverified users (at 7 days).
2.  Establish [cronJobs.js](file:///e:/LocatorX/LX-Website/backend/utils/cronJobs.js): runs daily to check and notify users of password expirations (at 7, 3, 1 days) and plan expirations (at 7, 1 days).

---

## Phase 6: Sandbox Playgrounds & AI Assist Widget

### Testing Playgrounds
1.  Build main entry page (`Playground.jsx`).
2.  Implement individual sandbox test tabs inside client playgrounds folder:
    *   `DataSystem.jsx` - Tables and paginations.
    *   `CheckoutSuite.jsx` - Dynamic lists, price adjustments, and promo boxes.
    *   `FormValidation.jsx` - Interactive form inputs with dynamic error rendering.
    *   `ModalSystem.jsx` - Overlay popups.
    *   `RatingSystem.jsx` - SVG grids.
3.  Implement iframe elements containing Shadow DOM roots for nested inspector tests.

### Gemini AI Support Widget
1.  Setup Gemini REST API chat controller [aiController.js](file:///e:/LocatorX/LX-Website/backend/controllers/aiController.js) using GoogleGenAI package and model `gemini-2.5-flash`.
2.  Develop floating chat bubble widget UI (`AIChatWidget.jsx`) communicating with `/api/v1/ai/chat`.

---

## Verification Plan

### Automated API Validation Tests
Verify backend routes by running Mocha/Vitest tests:
```bash
# Run backend api route integration tests
npm run test:api
```

### Manual Testing Procedures
1.  **OAuth & Signup Flows:** Verify registration, confirm email verification triggers Nodemailer output, and complete Google/GitHub logins.
2.  **Locator Synchronization:** Edit elements using the side panel of the Chrome Extension and verify they sync to the dashboard table.
3.  **Playground Element Extraction:** Test extension extraction tools on playground sections (nested iframes and Shadow DOM tabs) to verify locator accuracy.
4.  **Razorpay Sandbox Payments:** Execute upgrade checks on payment configurations using Razorpay test credentials.
5.  **Cancellation Refunds:** Book multiple payment blocks, cancel a future block, and verify that the plan expiration date shifts back and a partial refund is processed.
