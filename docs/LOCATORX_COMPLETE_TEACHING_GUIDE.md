# 🎯 LocatorX - Complete Teaching Guide & Rewrite Reference

**Single-file reference for understanding, simplifying, and rewriting every feature.**  
*No need to ask for help feature-by-feature – everything is here.*

---

## 📋 TABLE OF CONTENTS

1. [Architecture Overview](#1-architecture-overview)
2. [Database Strategy: Supabase vs MySQL/PostgreSQL](#2-database-strategy-supabase-vs-mysqlpostgresql)
3. [Backend Features (Simplified)](#3-backend-features-simplified)
4. [Frontend Components (Simplified)](#4-frontend-components-simplified)
5. [Shared Patterns & Utilities](#5-shared-patterns--utilities)
6. [How to Use This Guide](#6-how-to-use-this-guide)

---

## 1. ARCHITECTURE OVERVIEW

### The Two-House Analogy

```
┌─────────────────────────────────────────────────────────────┐
│                    LOCATORX CITY                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🏠 FRONTEND HOUSE (React + Vite)                          │
│  ├── Living Room: Layout, Header, Footer                   │
│  ├── Bedrooms: Pages (Dashboard, Playground, etc.)         │
│  ├── Kitchen: Components (UI, Playground, Payment)         │
│  └── Workshop: Hooks, Contexts, Services                   │
│                                                             │
│  🏢 BACKEND FACTORY (Node.js + Express)                    │
│  ├── Reception: server.js (routes traffic)                 │
│  ├── Departments: Controllers (auth, team, payment, etc.)  │
│  ├── Filing Cabinet: Models (User, Team, Payment, etc.)    │
│  ├── Security: Middleware (auth, validation, rate-limit)   │
│  └── Automation: Cron Jobs (cleanup, expiry checks)        │
│                                                             │
│  🗄️ DATABASE WAREHOUSE (MySQL/PostgreSQL)                  │
│  ├── Tables for each model                                  │
│  ├── Relationships (foreign keys)                          │
│  └── Indexes for performance                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Communication Flow

```
User clicks "Login" 
    │
    ▼
Frontend (AuthContext) → POST /api/v1/auth/login
    │
    ▼
Backend (server.js) → authRoutes → authController.login()
    │
    ▼
Database (User, Profile, UserSession tables)
    │
    ▼
JWT Token returned → Frontend stores in localStorage
    │
    ▼
All future requests include: Authorization: Bearer <token>
```

---

## 2. DATABASE STRATEGY: SUPABASE VS MYSQL/POSTGRESQL

### The Decision Matrix

| Factor | **Supabase (PostgreSQL)** | **MySQL/PostgreSQL (Self-Hosted)** |
|--------|---------------------------|-----------------------------------|
| **Setup Time** | ✅ 5 minutes | ⚠️ 30-60 minutes |
| **Auth Built-in** | ✅ Yes (with 2FA, OAuth) | ❌ Build yourself |
| **Real-time** | ✅ Built-in subscriptions | ❌ Need Socket.io |
| **Cost (Start)** | ✅ Free tier generous | ✅ Free (your server) |
| **Cost (Scale)** | ⚠️ Gets expensive | ✅ Predictable |
| **Control** | ❌ Limited | ✅ Full |
| **Compliance** | ⚠️ Shared infra | ✅ Your choice |
| **Team Skill** | ✅ Low SQL needed | ⚠️ Need SQL skills |

### Recommendation for LocatorX

**Use MySQL (current) for:**
- Payment data (compliance, audit trails)
- Team/permission data (complex relationships)
- Locators (high write volume)

**Use Supabase for (optional):**
- Real-time notifications
- Quick prototyping new features
- Auth if you want to offload it

### Current Schema Overview

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │◄─────►│  Profile    │       │UserSession  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ email       │       │ userId (FK) │       │ userId (FK) │
│ password    │       │ name        │       │ jwtJti      │
│ provider    │       │ avatarUrl   │       │ deviceType  │
│ failedLogin │       │ plan        │       │ browser     │
│ lockedUntil │       │ isVerified  │       │ ipAddress   │
│ passwordExp │       │ reminderSent│       │ lastActive  │
└─────────────┘       └─────────────┘       └─────────────┘
        │                                        ▲
        │                                        │
        ▼                                        │
┌─────────────┐       ┌─────────────┐            │
│    Team     │◄─────►│TeamMember   │            │
├─────────────┤       ├─────────────┤            │
│ id (PK)     │       │ id (PK)     │            │
│ name        │       │ teamId (FK) │            │
│ ownerId(FK) │       │ userId (FK) │            │
│ memberCount │       │ role        │            │
│ currency    │       └─────────────┘            │
│ totalPaid   │              │                   │
│ planExpires │              ▼                   │
│ isPaid      │       ┌─────────────┐            │
│ planName    │       │TeamInvitation          │
└─────────────┘       ├─────────────┤            │
                      │ id (PK)     │            │
                      │ teamId(FK)  │            │
                      │ email       │            │
                      │ role        │            │
                      │ token       │            │
                      │ status      │            │
                      │ expiresAt   │            │
                      └─────────────┘            │
                                                 │
┌─────────────┐       ┌─────────────┐            │
│  Locator    │       │  Payment    │            │
├─────────────┤       ├─────────────┤            │
│ id (PK)     │       │ id (PK)     │            │
│ userId(FK)  │       │ teamId(FK)  │            │
│ name        │       │ userId(FK)  │            │
│ selector    │       │ razorpayOrderId        │
│ type        │       │ razorpayPaymentId      │
│ elementTag  │       │ amount        │            │
│ pageUrl     │       │ planName      │            │
└─────────────┘       │ status        │            │
                      │ planStartedAt │            │
                      └─────────────┘            │
                                                 │
                    ┌─────────────┐              │
                    │PromoCode    │              │
                    ├─────────────┤              │
                    │ id (PK)     │              │
                    │ code        │              │
                    │ discountType│              │
                    │ discountValue              │
                    │ validFrom/Until            │
                    │ maxUses      │             │
                    │ specificUserId             │
                    │ allowedPlans (JSON)        │
                    └─────────────┘              │
                                                 │
                    ┌─────────────┐              │
                    │SecurityAuditLog            │
                    ├─────────────┤              │
                    │ id (PK)     │              │
                    │ userId(FK)  │              │
                    │ eventType   │              │
                    │ description │              │
                    │ ipAddress   │              │
                    │ userAgent   │              │
                    └─────────────┘              │
                                                 │
                    ┌─────────────┐              │
                    │PersonalAccessToken         │
                    ├─────────────┤              │
                    │ id (PK)     │              │
                    │ userId(FK)  │              │
                    │ name        │              │
                    │ tokenHash   │              │
                    │ scopes (JSON)              │
                    │ lastUsedAt  │              │
                    │ expiresAt   │              │
                    └─────────────┘              │
```

---

## 3. BACKEND FEATURES (SIMPLIFIED)

### 3.1 Auth System (`authController.js`)

#### Original Problems
- ❌ 800+ lines in one file
- ❌ Mixed: login, register, OAuth, password reset, CAPTCHA, sessions
- ❌ In-memory cache + DB sync duplicated
- ❌ Magic numbers for lockout durations

#### Simplified Structure

```
backend/
├── controllers/
│   ├── authController.js          # ~100 lines - routes only
│   ├── passwordController.js      # Reset, change, expiry
│   ├── oauthController.js         # Google, GitHub
│   └── sessionController.js       # Get session, logout
├── services/
│   ├── authService.js             # Core logic (validate, token)
│   ├── passwordService.js         # Hash, validate, migrate
│   ├── lockoutService.js          # Track attempts, calculate lockout
│   ├── captchaService.js          # Generate, verify SVG CAPTCHA
│   └── sessionService.js          # Create, revoke, validate
├── utils/
│   ├── tokenUtils.js              # JWT helpers
│   └── securityLogger.js          # Audit logging
└── middleware/
    ├── validateAuth.js            # Input validation
    └── rateLimitAuth.js           # Auth-specific limits
```

#### Key Rewrite Patterns

**Before (Monolithic):**
```javascript
// 300+ line login function doing everything
export const login = async (req, res) => { ... }
```

**After (Modular):**
```javascript
// authController.js - thin router
export const login = async (req, res) => {
    const result = await authService.login(req.body, req);
    sendAuthResponse(res, result);
};

// authService.js - pure logic
export const login = async ({ email, password, captchaAnswer, captchaToken }, req) => {
    const user = await findUserByEmail(email);
    await lockoutService.checkAndRecord(email, req);
    const valid = await passwordService.verify(password, user);
    const token = await sessionService.create(user, req);
    return { user, token };
};
```

#### CAPTCHA Simplification
```javascript
// captchaService.js
export const generateCaptcha = () => {
    const code = generateRandomCode(5);
    const svg = generateSvg(code);
    const token = jwt.sign({ solution: code }, JWT_SECRET, { expiresIn: '5m' });
    return { code, svg, token };
};

export const verifyCaptcha = (answer, token) => {
    const { solution } = jwt.verify(token, JWT_SECRET);
    return answer.toUpperCase() === solution.toUpperCase();
};
```

---

### 3.2 Team Management (`teamController.js`)

#### Original Problems
- ❌ 400+ lines with repeated admin checks
- ❌ Each function: find team → check permission → do action
- ❌ No reusable permission logic

#### Simplified Structure

```
backend/
├── controllers/
│   └── teamController.js          # ~80 lines - routes only
├── services/
│   ├── teamService.js             # CRUD operations
│   ├── membershipService.js       # Add, remove, update roles
│   └── invitationService.js       # Create, accept, cancel invites
├── utils/
│   └── teamPermissions.js         # isAdmin, isOwner, canInvite
└── middleware/
    └── validateTeamAccess.js      # Check membership before route
```

#### Permission Utility (Replaces Duplicate Code)

```javascript
// teamPermissions.js
export const checkTeamPermission = async (teamId, userId, requiredRole = 'member') => {
    const membership = await TeamMember.findOne({ where: { teamId, userId } });
    if (!membership) return { allowed: false, reason: 'Not a member' };
    
    const hierarchy = { viewer: 1, member: 2, admin: 3 };
    const userLevel = hierarchy[membership.role] || 0;
    const requiredLevel = hierarchy[requiredRole] || 0;
    
    if (userLevel < requiredLevel) {
        return { allowed: false, reason: `Requires ${requiredRole} role` };
    }
    return { allowed: true, membership };
};

// Usage in service
export const removeMember = async (teamId, requesterId, memberId) => {
    const perm = await checkTeamPermission(teamId, requesterId, 'admin');
    if (!perm.allowed) throw new Error(perm.reason);
    
    // ... rest of logic
};
```

---

### 3.3 Payment Processing (`paymentController.js`)

#### Original Problems
- ❌ Trusts client-side amount (security risk)
- ❌ Mixed: verify, cancel, refund logic
- ❌ Magic numbers (50% discount, 50 charge)

#### Simplified Structure

```
backend/
├── controllers/
│   └── paymentController.js       # ~60 lines
├── services/
│   ├── paymentVerificationService.js  # Verify + record
│   ├── subscriptionService.js         # Extend, cancel, refund
│   └── razorpayService.js             # Razorpay API wrapper
├── config/
│   └── pricing.js                    # All prices in one place
└── utils/
    └── currency.js                   # Paise/rupee conversion
```

#### Secure Verification Pattern

```javascript
// paymentVerificationService.js
export const verifyAndRecordPayment = async (data, userId) => {
    // 1. Verify signature (trust Razorpay, not client)
    const isValid = razorpayService.verifySignature(
        data.razorpay_order_id,
        data.razorpay_payment_id,
        data.razorpay_signature
    );
    if (!isValid) throw new Error('Invalid signature');

    // 2. Fetch actual amount from Razorpay
    const order = await razorpayService.fetchOrder(data.razorpay_order_id);
    const actualAmount = order.amount / 100; // paise → rupees

    // 3. Validate against expected pricing
    const expected = pricing.getPlanPrice(data.planName, order.currency);
    if (actualAmount < expected.minimum) {
        throw new Error('Amount too low for this plan');
    }

    // 4. Record payment + update team (atomic)
    return await db.transaction(async (t) => {
        await Payment.create({ ...data, amount: actualAmount, userId }, { transaction: t });
        await Team.update(
            { isPaid: true, planName: data.planName, planExpiresAt: newExpiry },
            { where: { id: data.teamId }, transaction: t }
        );
    });
};
```

#### Pricing Config (No Magic Numbers)

```javascript
// config/pricing.js
export const PRICING = {
    INR: {
        pro: { base: 299, flashSaleMin: 149 },  // 50% min
        team: { base: 1999, flashSaleMin: 1999 }
    },
    USD: {
        pro: { base: 29, flashSaleMin: 14.5 },
        team: { base: 79, flashSaleMin: 79 }
    }
};

export const getPlanPrice = (planName, currency = 'INR') => {
    const prices = PRICING[currency] || PRICING.INR;
    const plan = planName.toLowerCase();
    return prices[plan] || { base: 0, flashSaleMin: 0 };
};
```

---

### 3.4 Locator Management (`locatorController.js`)

#### Simplified Structure (Already Clean)

```
backend/
├── controllers/
│   └── locatorController.js       # ~50 lines - good!
├── services/
│   └── locatorService.js          # CRUD + validation
└── validators/
    └── locatorValidator.js        # Zod schemas
```

#### Validation Example

```javascript
// validators/locatorValidator.js
import { z } from 'zod';

export const createLocatorSchema = z.object({
    name: z.string().min(1).max(100),
    selector: z.string().min(1).max(500),
    type: z.enum(['xpath', 'css', 'id', 'name', 'tag', 'class']).default('xpath'),
    elementTag: z.string().max(50).optional(),
    pageUrl: z.string().url().max(500).optional()
});

// Usage in controller
export const createLocator = async (req, res) => {
    const validated = createLocatorSchema.parse(req.body);
    const locator = await Locator.create({ ...validated, userId: req.user.id });
    res.json({ success: true, locator });
};
```

---

### 3.5 Promo Codes (`promoController.js`)

#### Simplified Structure

```
backend/
├── controllers/
│   └── promoController.js         # ~40 lines
├── services/
│   ├── promoValidationService.js  # Validate code + calculate discount
│   └── promoManagementService.js  # CRUD for admin
└── validators/
    └── promoValidator.js
```

#### Validation Logic

```javascript
// promoValidationService.js
export const validatePromoCode = async (code, planName) => {
    const promo = await PromoCode.findOne({ 
        where: { code: code.toUpperCase(), isActive: true } 
    });
    
    if (!promo) throw new Error('Invalid code');
    if (promo.validFrom && new Date() < promo.validFrom) throw new Error('Not yet valid');
    if (promo.validUntil && new Date() > promo.validUntil) throw new Error('Expired');
    if (promo.maxUses && promo.currentUses >= promo.maxUses) throw new Error('Max uses reached');
    if (promo.specificUserId && promo.specificUserId !== currentUserId) throw new Error('Not for you');
    if (promo.allowedPlans && !promo.allowedPlans.includes(planName)) throw new Error('Wrong plan');

    // Calculate discount
    const discount = calculateDiscount(promo.discountType, promo.discountValue, planPrice);
    
    // Increment usage atomically
    await promo.increment('currentUses');
    
    return { promo, discount };
};
```

---

### 3.6 Cleanup Service (`cleanupService.js`)

#### Simplified Structure

```
backend/
├── services/
│   ├── cleanupService.js           # Main orchestrator
│   ├── reminderService.js          # Send verification reminders
│   └── deletionService.js          # Delete unverified users
├── config/
│   └── cleanupConfig.js            # All timing constants
└── utils/
    └── dateUtils.js                # Date boundary calculations
```

#### Configuration (No Magic Numbers)

```javascript
// config/cleanupConfig.js
export const CLEANUP_CONFIG = {
    REMINDER_DAYS_AFTER_SIGNUP: 6,      // Send reminder at day 6
    DELETION_DAYS_AFTER_SIGNUP: 7,      // Delete at day 7
    EMAIL_BATCH_SIZE: 20,               // SMTP rate limit
    EMAIL_RETRY_ATTEMPTS: 3,
    EMAIL_RETRY_DELAY_MS: 5000
};

// dateUtils.js
export const getCleanupBoundaries = () => {
    const now = new Date();
    return {
        reminderStart: new Date(now.getTime() - (CLEANUP_CONFIG.DELETION_DAYS_AFTER_SIGNUP * 24 * 60 * 60 * 1000)),
        reminderEnd: new Date(now.getTime() - (CLEANUP_CONFIG.REMINDER_DAYS_AFTER_SIGNUP * 24 * 60 * 60 * 1000)),
        deletionThreshold: new Date(now.getTime() - (CLEANUP_CONFIG.DELETION_DAYS_AFTER_SIGNUP * 24 * 60 * 60 * 1000))
    };
};
```

---

### 3.7 AI Assistant (`aiController.js`)

#### Simplified Structure

```
backend/
├── controllers/
│   └── aiController.js             # ~30 lines
├── services/
│   ├── aiService.js                # Gemini wrapper
│   └── chatHistoryService.js       # Optional: save conversations
├── middleware/
│   ├── validateChatRequest.js      # Input validation + rate limit
│   └── rateLimitChat.js            # Per-user limits
└── config/
    └── aiConfig.js                 # Model, temperature, limits
```

#### Service Layer

```javascript
// aiService.js
import { GoogleGenAI } from '@google/genai';

const AI_CONFIG = {
    model: process.env.AI_MODEL || 'gemini-2.5-flash',
    maxTokens: 2048,
    temperature: 0.7
};

let client = null;
const getClient = () => {
    if (!client) {
        if (!process.env.GEMINI_API_KEY) throw new Error('AI not configured');
        client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return client;
};

export const generateResponse = async (message) => {
    const ai = getClient();
    const response = await ai.models.generateContent({
        model: AI_CONFIG.model,
        contents: message,
        config: { maxOutputTokens: AI_CONFIG.maxTokens, temperature: AI_CONFIG.temperature }
    });
    return {
        reply: response.text || 'I could not generate a response.',
        meta: { provider: 'Google Gemini', model: AI_CONFIG.model }
    };
};
```

---

### 3.8 Validation Middleware (`validationMiddleware.js`)

#### Factory Pattern (Already Good)

```javascript
// validationFactory.js
import { z } from 'zod';

export const createValidator = (schema, sanitizeMap = {}, errorMessage = 'Invalid request') => {
    return (req, res, next) => {
        try {
            if (!req.body) return res.status(400).json({ success: false, message: errorMessage });
            
            // Sanitize copy (don't mutate original)
            const sanitized = { ...req.body };
            for (const [field, sanitizer] of Object.entries(sanitizeMap)) {
                if (sanitized[field] !== undefined) {
                    sanitized[field] = sanitizer(sanitized[field]);
                }
            }
            
            const result = schema.safeParse(sanitized);
            if (!result.success) {
                return res.status(400).json({ success: false, message: errorMessage });
            }
            
            req.validatedBody = result.data;
            next();
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    };
};
```

---

### 3.9 Auth Middleware (`authMiddleware.js`)

#### Separated Token Types

```javascript
// tokenUtils.js
export const TOKEN_TYPES = { PAT: 'pat', JWT: 'jwt' };
export const PAT_PREFIX = 'lx_pat_';

export const extractToken = (header) => header?.startsWith('Bearer ') ? header.split(' ')[1] : null;
export const getTokenType = (token) => token?.startsWith(PAT_PREFIX) ? TOKEN_TYPES.PAT : TOKEN_TYPES.JWT;

// validatePAT.js
export const validatePAT = async (token, req) => {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const pat = await PersonalAccessToken.findOne({ where: { tokenHash: hash } });
    if (!pat) return { valid: false, reason: 'Invalid PAT' };
    if (pat.expiresAt && new Date() > pat.expiresAt) return { valid: false, reason: 'PAT expired' };
    
    // Update usage
    await pat.update({ lastUsedAt: new Date(), lastUsedIp: req.ip });
    
    return { valid: true, user: { id: pat.userId, isPat: true, name: pat.name, scopes: pat.scopes } };
};

// validateJWT.js
export const validateJWT = async (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.jti) {
            const session = await UserSession.findOne({ where: { jwtJti: decoded.jti } });
            if (!session || session.isRevoked) return { valid: false, reason: 'Session revoked' };
            await session.update({ lastActiveAt: new Date() });
        }
        return { valid: true, user: decoded };
    } catch (error) {
        if (error.name === 'TokenExpiredError') return { valid: false, reason: 'Token expired' };
        return { valid: false, reason: 'Invalid token' };
    }
};

// authMiddleware.js (clean!)
export const requireAuth = async (req, res, next) => {
    const token = extractToken(req.headers.authorization);
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    
    const type = getTokenType(token);
    const result = type === TOKEN_TYPES.PAT 
        ? await validatePAT(token, req)
        : await validateJWT(token);
    
    if (!result.valid) return res.status(401).json({ success: false, message: result.reason });
    
    req.user = result.user;
    next();
};
```

---

### 3.10 Database Config (`database.js`)

#### Current (Good)
```javascript
// Uses Sequelize with MySQL
// Connection pooling configured
// Logging disabled for production
```

#### Optional: Dual Database Support

```javascript
// database.js (if you want Supabase option)
const USE_SUPABASE = process.env.USE_SUPABASE === 'true';

let sequelize;
if (USE_SUPABASE) {
    sequelize = new Sequelize(process.env.SUPABASE_DB_URL, { dialect: 'postgres' });
} else {
    sequelize = new Sequelize(
        process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD,
        { host: process.env.DB_HOST, dialect: 'mysql', ... }
    );
}
```

---

## 4. FRONTEND COMPONENTS (SIMPLIFIED)

### 4.1 Layout System

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.jsx           # Root wrapper (theme, auth, notifications)
│   │   ├── Header.jsx           # Navigation + user menu
│   │   ├── Footer.jsx           # Links + social
│   │   ├── DashboardLayout.jsx  # Sidebar + content for dashboard pages
│   │   └── Sidebar.jsx          # Dashboard navigation
│   └── ui/                      # Shadcn components (40+ files)
```

#### Layout.jsx - The Root Component
```javascript
// What it does:
// 1. Providers: QueryClient, Theme, Auth, Notification, Tooltip
// 2. Router with lazy-loaded pages
// 3. Global click ripple effect
// 4. Animated background blobs
// 5. Page transition loader (skeleton)
```

#### Header.jsx - Key Patterns
```javascript
// State management patterns:
// - useAuth() for user/profile
// - useLocation() for active link highlighting
// - useOutsideClick() for dropdown menus
// - apiClient for team admin check

// Key sub-components:
// - HeaderSearch (persistent search)
// - NotificationBell + Dropdown
// - User avatar with plan badge (Trial/Pro/Team)
// - Edit-name-in-place with toast feedback
// - Mobile responsive menu
```

---

### 4.2 Page Components

| Page | Key Features | Simplification Opportunities |
|------|-------------|------------------------------|
| **Index.jsx** | Hero, Features, Pricing, FAQ | Extract sections to components |
| **Dashboard.jsx** | Stats cards, recent activity | Move stats to separate components |
| **Playground.jsx** | 6 demo systems in tabs | Each system = separate component ✓ |
| **TeamDashboard.jsx** | Members, invitations, roles | Split into MemberList, InvitationManager |
| **Settings.jsx** | Profile, security, billing tabs | Tab content = lazy components |

---

### 4.3 Playground Components (Already Modular!)

Each playground component is a **self-contained demo**:

| Component | Purpose | Key Pattern |
|-----------|---------|-------------|
| **DataSystem.jsx** | Product table with search, sort, pagination | `React.memo` + `useMemo` for filtering |
| **FormValidation.jsx** | Email, phone, password validation | Real-time validation + visual feedback |
| **ModalSystem.jsx** | Dialog, Confirm, Drawer examples | Shadcn Dialog/Drawer composition |
| **RatingSystem.jsx** | Star ratings + file upload | Accessible star rating + drag-drop files |
| **SignaturePad.jsx** | Canvas drawing + export | `useRef` canvas + touch/mouse events |
| **UserProfile.jsx** | Tabbed profile editor | Tabs + edit mode toggle + iframe ToS |

---

### 4.4 Payment Components

```
src/components/payment/
├── PaymentModal.jsx      # Main dialog (timer, promo, Razorpay)
├── PromoCodeInput.jsx    # Apply/remove promo with validation
└── RazorpayButton.jsx    # Razorpay checkout integration
```

#### PaymentModal Flow
```
Open Modal → 10 min timer starts
    │
    ├─ User enters promo → POST /api/v1/promo/validate
    │                         │
    │                         └─ Success → recalculate total
    │
    ├─ User clicks Pay → RazorpayButton opens checkout
    │                         │
    │                         └─ Success → handlePaymentSuccess()
    │                                            │
    │                                            └─ setIsSuccess(true)
    │                                                  │
    │                                                  └─ Show receipt screen
    │                                                       │
    │                                                       ├─ Download receipt
    │                                                       └─ Copy payment ID
    │
    └─ Timer hits 0 → Show "Session Expired" → Refresh button
```

---

### 4.5 AI Chat Widget (`AIChatWidget.jsx`)

#### Current Structure (Good)
```javascript
// Single component with:
// - useState for messages, input, loading
// - useOutsideClick for close-on-outside-click
// - useEffect for auto-scroll
// - apiClient.post('/ai/chat') for backend communication
```

#### Recommended Split (for learning)
```
src/components/ai/
├── AIChatWidget.jsx          # Main container
├── ChatHeader.jsx            # Title, status, close button
├── ChatMessages.jsx          # Message list + loading indicator
├── ChatInput.jsx             # Input field + send button
├── ChatToggleButton.jsx      # Floating bubble button
└── hooks/
    └── useAIChat.js          # All logic extracted here
```

---

### 4.6 Custom Hooks

| Hook | Purpose | Location |
|------|---------|----------|
| `useAuth` | AuthContext consumer | `src/contexts/AuthContext.jsx` |
| `useTheme` | Dark/light mode + persistence | `src/hooks/useTheme.jsx` |
| `useOutsideClick` | Close dropdowns on outside click | `src/hooks/useOutsideClick.jsx` |
| `useMobile` | Responsive breakpoint detection | `src/hooks/use-mobile.jsx` |
| `useToast` | Sonner toast wrapper | `src/hooks/use-toast.js` |

---

### 4.7 Services & Utilities

| File | Purpose |
|------|---------|
| `src/api/client.js` | Axios instance with interceptors |
| `src/services/authService.js` | Mock captcha fallback |
| `src/services/receiptService.js` | PDF receipt generation |
| `src/services/notificationAdapter.js` | Notification permission helper |
| `src/lib/utils.js` | `cn()` className merger (clsx + tailwind-merge) |
| `src/lib/validations.js` | Zod schemas for frontend validation |

---

## 5. SHARED PATTERNS & UTILITIES

### 5.1 Error Handling Pattern (Backend)

```javascript
// Every controller follows this:
export const someController = async (req, res) => {
    try {
        // 1. Validate input (via middleware or inline)
        // 2. Call service layer
        const result = await someService.doThing(req.validatedBody, req.user);
        // 3. Return success
        res.json({ success: true, data: result });
    } catch (error) {
        // 4. Handle known errors
        if (error instanceof ValidationError) {
            return res.status(400).json({ success: false, message: error.message });
        }
        if (error instanceof NotFoundError) {
            return res.status(404).json({ success: false, message: error.message });
        }
        // 5. Log unexpected errors
        console.error('Controller error:', error);
        // 6. Return generic error
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
```

### 5.2 Database Transaction Pattern

```javascript
// For operations needing atomicity (e.g., payment + team update)
await sequelize.transaction(async (t) => {
    await Payment.create(paymentData, { transaction: t });
    await Team.update(teamData, { where: { id: teamId }, transaction: t });
    await Profile.update(profileData, { where: { userId }, transaction: t });
});
```

### 5.3 Frontend API Client Pattern

```javascript
// src/api/client.js
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});

// Request interceptor: add token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('locatorx_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Response interceptor: handle 401
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('locatorx_token');
            window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);
```

### 5.4 Loading & Error States (Frontend)

```javascript
// Standard pattern in components:
const [data, setData] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const { data } = await apiClient.get('/endpoint');
        setData(data);
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to load');
    } finally {
        setIsLoading(false);
    }
};

// In JSX:
{isLoading && <Spinner />}
{error && <Alert variant="destructive">{error}</Alert>}
{data && <DataDisplay data={data} />}
```

---

## 6. HOW TO USE THIS GUIDE

### For Understanding a Feature

1. **Find the feature** in Section 3 (Backend) or 4 (Frontend)
2. **Read the "Original Problems"** to know what was wrong
3. **Study the "Simplified Structure"** - this is the target architecture
4. **Look at code examples** for the key patterns

### For Rewriting a Feature

Follow this **step-by-step process**:

#### Step 1: Create the Service Layer
```bash
# Create service file
touch backend/services/[feature]Service.js

# Move business logic from controller to service
# Controller becomes thin router
```

#### Step 2: Add Validation
```bash
# Create validator
touch backend/validators/[feature]Validator.js

# Use Zod schemas
# Add to validationMiddleware.js factory
```

#### Step 3: Extract Utilities
```bash
# Common functions → backend/utils/
# Config constants → backend/config/
# Types/enums → backend/constants/
```

#### Step 4: Update Controller
```javascript
// Before: 200 lines of mixed logic
// After: 20 lines calling services
export const controller = async (req, res) => {
    const result = await featureService.doThing(req.validatedBody, req.user);
    res.json({ success: true, result });
};
```

#### Step 5: Test
```bash
# Run existing tests
npm test

# Or manual test with curl/Postman
curl -X POST http://localhost:5000/api/v1/feature \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'
```

### Frontend Rewrite Process

1. **Identify large component** (>200 lines or multiple responsibilities)
2. **Extract sub-components** into same folder
3. **Extract logic** into custom hook (`useFeature.js`)
4. **Move styles** to CSS modules or keep Tailwind classes
5. **Add Storybook stories** if available

---

## 📦 QUICK REFERENCE: FILE STRUCTURE TARGET

### Backend (After Simplification)
```
backend/
├── config/
│   ├── database.js
│   ├── pricing.js
│   ├── cleanupConfig.js
│   └── aiConfig.js
├── constants/
│   ├── tokenTypes.js
│   ├── userRoles.js
│   └── paymentStatus.js
├── controllers/
│   ├── authController.js          # Thin routers only
│   ├── teamController.js
│   ├── paymentController.js
│   ├── locatorController.js
│   ├── promoController.js
│   ├── aiController.js
│   └── profileController.js
├── middleware/
│   ├── authMiddleware.js          # Clean, separated
│   ├── validationMiddleware.js    # Factory pattern
│   ├── rateLimitAuth.js
│   └── rateLimitChat.js
├── models/
│   ├── index.js                   # Associations
│   ├── User.js
│   ├── Profile.js
│   ├── Team.js
│   ├── Payment.js
│   ├── Locator.js
│   ├── PromoCode.js
│   ├── PersonalAccessToken.js
│   ├── SecurityAuditLog.js
│   └── UserSession.js
├── services/
│   ├── authService.js
│   ├── passwordService.js
│   ├── lockoutService.js
│   ├── captchaService.js
│   ├── sessionService.js
│   ├── teamService.js
│   ├── membershipService.js
│   ├── invitationService.js
│   ├── paymentVerificationService.js
│   ├── subscriptionService.js
│   ├── razorpayService.js
│   ├── locatorService.js
│   ├── promoValidationService.js
│   ├── reminderService.js
│   ├── deletionService.js
│   └── aiService.js
├── utils/
│   ├── tokenUtils.js
│   ├── sanitizer.js
│   ├── dateUtils.js
│   ├── currency.js
│   └── securityLogger.js
├── validators/
│   ├── authValidator.js
│   ├── teamValidator.js
│   ├── paymentValidator.js
│   ├── locatorValidator.js
│   └── promoValidator.js
├── routes/
│   ├── authRoutes.js
│   ├── teamRoutes.js
│   ├── paymentRoutes.js
│   ├── locatorRoutes.js
│   ├── promoRoutes.js
│   ├── aiRoutes.js
│   └── profileRoutes.js
├── server.js
└── package.json
```

### Frontend (After Simplification)
```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.jsx
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── DashboardLayout.jsx
│   │   └── Sidebar.jsx
│   ├── ui/                        # Shadcn (keep as-is)
│   ├── ai/
│   │   ├── AIChatWidget.jsx
│   │   ├── ChatHeader.jsx
│   │   ├── ChatMessages.jsx
│   │   ├── ChatInput.jsx
│   │   └── ChatToggleButton.jsx
│   ├── payment/
│   │   ├── PaymentModal.jsx
│   │   ├── PromoCodeInput.jsx
│   │   └── RazorpayButton.jsx
│   ├── playground/
│   │   ├── DataSystem.jsx
│   │   ├── FormValidation.jsx
│   │   ├── ModalSystem.jsx
│   │   ├── RatingSystem.jsx
│   │   ├── SignaturePad.jsx
│   │   └── UserProfile.jsx
│   ├── notifications/
│   │   ├── NotificationBell.jsx
│   │   ├── NotificationDropdown.jsx
│   │   └── NotificationItem.jsx
│   └── marketing/
│       └── PromoBanner.jsx
├── contexts/
│   ├── AuthContext.jsx
│   └── NotificationContext.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useTheme.js
│   ├── useOutsideClick.js
│   ├── useMobile.js
│   ├── useToast.js
│   └── useAIChat.js
├── services/
│   ├── apiClient.js
│   ├── authService.js
│   ├── receiptService.js
│   └── notificationAdapter.js
├── lib/
│   ├── utils.js                   # cn()
│   └── validations.js
├── pages/
│   ├── Index.jsx
│   ├── Dashboard.jsx
│   ├── Playground.jsx
│   ├── TeamDashboard.jsx
│   ├── Settings.jsx
│   ├── Pricing.jsx
│   ├── Documentation.jsx
│   ├── About.jsx
│   ├── Contact.jsx
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── VerifyEmail.jsx
│   │   └── OAuthCallback.jsx
│   └── legal/
│       ├── PrivacyPolicy.jsx
│       ├── TermsOfService.jsx
│       └── RefundPolicy.jsx
├── App.jsx
├── main.jsx
└── index.css
```

---

## 🎯 NEXT STEPS FOR YOU

### Priority 1: Backend Services Extraction
1. Create `backend/services/` folder
2. Extract `authService.js` from `authController.js`
3. Extract `teamService.js` from `teamController.js`
4. Extract `paymentService.js` from `paymentController.js`

### Priority 2: Validation Factory
1. Move all Zod schemas to `backend/validators/`
2. Use `createValidator` factory in `validationMiddleware.js`
3. Remove inline validation from controllers

### Priority 3: Config Constants
1. Create `backend/config/` with pricing, cleanup, AI configs
2. Remove all magic numbers from code

### Priority 4: Frontend Component Splitting
1. Split `AIChatWidget.jsx` into 4 components + hook
2. Split `Header.jsx` user menu into separate components
3. Split `TeamDashboard.jsx` into MemberList, InvitationManager

### Priority 5: Dual Database (Optional)
1. Add Supabase config option in `database.js`
2. Create migration scripts if switching

---

## 📝 NOTES SECTION

*Add your own notes here as you work through the rewrites:*

```
Feature: ________________
Status: [ ] Not Started  [ ] In Progress  [ ] Done
Notes: _______________________________________________

Feature: ________________
Status: [ ] Not Started  [ ] In Progress  [ ] Done
Notes: _______________________________________________
```

---

**This guide is your complete reference. No need to ask for feature-by-feature help - everything is documented above with simplified patterns and rewrite targets. Happy coding! 🚀**