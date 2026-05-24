# Product Requirements Document (PRD) - Locator-X Website

## 1. Executive Summary & Objective

The **Locator-X Website** is the central cloud synchronization and testing hub for the Locator-X ecosystem. While the Locator-X Chrome Extension allows direct browser inspection and locator generation, the website serves as the central control plane, collaborative workbench, and interactive training/testing environment. 

### Core Objectives:
1.  **Cloud Synchronization:** Provide premium cloud backup, POM management, and element synchronization for users of the Chrome Extension.
2.  **Team Collaboration:** Enable QA teams, automation engineers, and organizations to share elements, Page Object Models, and locator strategies, avoiding duplicated effort.
3.  **Playground Testing Suite:** Offer an interactive, highly realistic "Playground" web app sandbox loaded with modern web patterns (dynamic tables, forms, shadow hosts, nested iframes) to serve as a target for Chrome Extension locator extraction and manual inspection training.
4.  **Monetization and Tiers:** Support user subscription billing (Free, Pro, Teams) with multi-currency (USD, INR) checkouts, promo code discounts, and block cancellation/refund handling.
5.  **Automated Security & Lifecycle Management:** Provide clean lifecycle controls such as unverified account deletions, password change enforcement (180-day rotation), and team subscription expiration alerts.

---

## 2. Target Audience & User Personas

### Persona A: QA Lead / Automation Manager
*   **Need:** Standardize locator strategies across a team of 15 QA engineers. Needs to monitor team memberships, control access roles (Admin, Member, Viewer), and ensure everyone uses the same synced selectors for pages under test.
*   **Pain Point:** Engineers overriding each other's custom XPaths. Managing team seat licensing, billing budgets, and currency conversion.

### Persona B: Junior SDET / Learning Automation Engineer
*   **Need:** A safe, realistic sandbox environment containing complex frontend components (like rating controls, dynamic checkout lists, nested modals) to practice writing CSS/XPath selectors and validating them.
*   **Pain Point:** Real target websites constantly change code or restrict access. Need local mock environments that resemble production code (including nested Shadow roots and frames).

### Persona C: Solo Test Engineer
*   **Need:** Fast sync of locators between their work laptop, home desktop, and test runner machine without copy-pasting code blocks.
*   **Pain Point:** Losing saved selectors if Chrome cache is cleared.

---

## 3. Scope of Features

### 3.1. User Account & Lifecycle Management
*   **Authentication Flow:** Support email/password registration with mandatory email verification, as well as direct OAuth 2.0 logins via Google and GitHub.
*   **Password Security Policy:** Passwords automatically expire 180 days after creation or update. Daily background jobs alert users 7 days, 3 days, and 1 day prior to expiration.
*   **Account Cleanup:** To keep database storage lean, unverified accounts are sent a reminder email on Day 6 and permanently purged on Day 7 of creation.

### 3.2. Cloud Synchronization & Dashboard
*   **Locator Sync API:** Secure REST endpoints allowing the Chrome Extension to sync Page Object Models and locators instantly.
*   **Web Dashboard:** View all synced page structures, locators, selectors, element tags, and target pages.
*   **Delete & Organize:** Clean controls to edit or remove locator entries in the browser that sync automatically back to the extension client.

### 3.3. Playground Testing Suite
A comprehensive front-end sandbox simulating a real-world web application. It includes:
*   **Data System Tab:** Renders data tables and listings to practice locating rows, columns, and pagination elements.
*   **Checkout Suite:** Simulates an e-commerce cart. Useful for inspecting dynamic items, price labels, and order buttons.
*   **Form Validation:** Multi-step forms with dynamic error states to inspect and test input/error selectors.
*   **Modal System:** Renders standard overlay modals, nested modals, and alert popups to test overlay detection and focus states.
*   **Rating System:** Star-rating controls (interactive SVG grids) to practice locating complex interactive widgets.
*   **User Profile:** Interactive profile edit cards including mock avatar uploads.

### 3.4. Team Collaboration & Dashboards
*   **Team Creation:** Owners can create dedicated teams, which automatically updates their account profile plan to the 'team' tier.
*   **Invitation System:** Admins can invite team members via email. Generates secure 7-day invitation tokens.
*   **Role-Based Access Control (RBAC):** Admin (can invite/remove, manage payments), Member (can read/write synced locators), Viewer (can only read synced locators).

### 3.5. Subscription Billing, Checkout, & Promotions
*   **Razorpay Integration:** Complete subscription upgrade checkout supporting `INR` and `USD` currency systems.
*   **Discount Code Engine:** Supports flat rate or percentage discounts with expiration validation, max usage limits, and specific plan/user restrictions.
*   **Prorated Expiry & Stack Protection:** Extensions to plans are applied relative to the current expiry date to prevent loss of remaining days. Replay-attack and double-verification protections are hardcoded.
*   **Pre-booked Block Cancellation & Refund:** Users can pre-book future subscription blocks (e.g. extending by another 30 days). If they cancel a pre-booked block *before* its start date, they are refunded the amount paid minus a fixed cancellation transaction charge (50 units in their currency). Once a block starts, it is non-refundable.

### 3.6. AI Chat Widget
*   **Assistant:** A floating chatbot powered by Google Gemini (`gemini-2.5-flash`) that assists users with creating custom XPath axes, learning test automation syntax, or troubleshooting selectors.

---

## 4. Usage Tiers & Restriction Matrix

The website checks user/team tiers to enforce limits:

| Feature/Limit | Free Tier | Pro Tier | Team Tier |
| :--- | :--- | :--- | :--- |
| **Max Synced Locators** | 50 locators | Unlimited | Unlimited |
| **Team Membership** | Read-only member | Create 1 Team | Create Unlimited Teams |
| **Seats per Team** | N/A | Up to 3 seats | Unlimited seats (defined by payment) |
| **Playground Sandbox** | Full Access | Full Access | Full Access |
| **AI Assistant Messages** | 10 per day | Unlimited | Unlimited |
| **Support SLA** | Community | 24h Email | Priority Slack/Email |

---

## 5. Key Business Rules & Verification Conditions

### 5.1. Password Rotation Hooks
*   `beforeSave` database hooks verify if the password hash has changed. If true, `password_expires_at` is set to `now() + 180 days`.
*   Users are blocked from logging in with an expired password and are redirected to the Password Reset page.

### 5.2. Registration Grace Period
*   Users have exactly 168 hours (7 days) from the registration timestamp to click the verification email link.
*   If unverified at hour 144 (Day 6), they receive a warning reminder. At hour 168 (Day 7), their record is deleted.

### 5.3. Payment & Plan Extensions
*   The billing period is locked to a 30-day block.
*   Extensions stack sequentially: `team.plan_expires_at = Math.max(now, current_expiry) + 30 days`.
