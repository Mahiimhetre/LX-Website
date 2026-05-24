# Database Schema Document - Locator-X Website

## 1. Overview & Architecture

The Locator-X Website database is mapped using the **Sequelize ORM** using standard PostgreSQL/MySQL compatible conventions. 

All tables are defined with `underscored: true` (yielding snake_case table names and column fields in the database schema while maintaining camelCase keys within Javascript model objects). All identifier fields use standard UUID version 4 to ensure security, collision prevention, and horizontal scaling.

---

## 2. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--|| PROFILES : has
    USERS ||--o[ OWNED_TEAMS : owns
    USERS ||--o[ TEAM_MEMBERSHIPS : member_of
    USERS ||--o[ SENT_INVITATIONS : inviter
    USERS ||--o[ PERSONAL_PROMOS : has_exclusive
    USERS ||--o[ LOCATORS : creates
    USERS ||--o[ PAYMENTS : purchases
    
    TEAMS ||--o[ PAYMENTS : receives
    TEAMS ||--o[ TEAM_MEMBERSHIPS : contains
    TEAMS ||--o[ TEAM_INVITATIONS : invites
```

---

## 3. Database Table Definitions

### 3.1. `users` Table
Stores authentication details for both standard local login credentials and OAuth providers.

| Column Name | Data Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `UUIDV4` | Unique user identifier. |
| `email` | `STRING` | `UNIQUE`, `NOT NULL`, `isEmail` | N/A | User email address. |
| `password` | `STRING` | `ALLOW NULL` (OAuth logins) | `NULL` | Hashed password. |
| `provider` | `STRING` | `ALLOW NULL` | `NULL` | OAuth provider name (e.g. `'google'`, `'github'`). |
| `password_expires_at` | `DATE` | `ALLOW NULL` | `NULL` | Password expiration timestamp. |
| `created_at` | `DATE` | `NOT NULL` | `now()` | Record creation timestamp. |
| `updated_at` | `DATE` | `NOT NULL` | `now()` | Record update timestamp. |

*   **Model Hooks:**
    *   `beforeSave`: If the `password` field is modified, automatically increments the password expiration date:
        $$\text{password\_expires\_at} = \text{now()} + 180 \text{ days}$$

### 3.2. `profiles` Table
Stores user profile meta configuration and subscription tiers.

| Column Name | Data Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `UUIDV4` | Unique profile identifier. |
| `user_id` | `UUID` | `FOREIGN KEY` (references `users.id`), `UNIQUE`, `NOT NULL` | N/A | Associated user. Cascades on delete. |
| `name` | `STRING` | `ALLOW NULL` | `NULL` | Display name of the user. |
| `avatar_url` | `STRING` | `ALLOW NULL` | `NULL` | Image path or URL for profile avatar. |
| `plan` | `STRING` | `NOT NULL` | `'free'` | Active plan (e.g. `'free'`, `'pro'`, `'team'`). |
| `is_verified` | `BOOLEAN` | `NOT NULL` | `false` | Email verification status. |
| `reminder_sent` | `BOOLEAN` | `NOT NULL` | `false` | Flag indicating if cleanup reminder email has been sent. |
| `created_at` | `DATE` | `NOT NULL` | `now()` | Timestamp. |
| `updated_at` | `DATE` | `NOT NULL` | `now()` | Timestamp. |

### 3.3. `teams` Table
Stores multi-user team organizations and billing subscription details.

| Column Name | Data Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `UUIDV4` | Unique team identifier. |
| `name` | `STRING` | `NOT NULL` | N/A | Organization display name. |
| `owner_id` | `UUID` | `FOREIGN KEY` (references `users.id`), `NOT NULL` | N/A | User ID of the team creator/owner. |
| `member_count` | `INTEGER` | `NOT NULL` | `1` | Total seats filled in the team. |
| `currency` | `ENUM('USD', 'INR')`| `NOT NULL` | `'USD'` | Preferred billing currency. |
| `total_paid` | `DECIMAL(10,2)`| `NOT NULL` | `0.00` | Sum total of verified payments. |
| `is_paid` | `BOOLEAN` | `NOT NULL` | `false` | Active premium billing status. |
| `plan_expires_at` | `DATE` | `ALLOW NULL` | `NULL` | Date when the team subscription block expires. |
| `plan_name` | `STRING` | `NOT NULL` | `'free'` | Active plan tier (e.g. `'free'`, `'team'`). |
| `created_at` | `DATE` | `NOT NULL` | `now()` | Timestamp. |
| `updated_at` | `DATE` | `NOT NULL` | `now()` | Timestamp. |

### 3.4. `team_members` Table
Associates users to teams with specific roles.

| Column Name | Data Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `UUIDV4` | Membership identifier. |
| `team_id` | `UUID` | `FOREIGN KEY` (references `teams.id`), `NOT NULL` | N/A | Target team. |
| `user_id` | `UUID` | `FOREIGN KEY` (references `users.id`), `NOT NULL` | N/A | Target user. Cascades on user deletion. |
| `role` | `ENUM('admin', 'member', 'viewer')` | `NOT NULL` | `'member'` | Permission role. |
| `created_at` | `DATE` | `NOT NULL` | `now()` | Timestamp. |
| `updated_at` | `DATE` | `NOT NULL` | `now()` | Timestamp. |

*   **Indexes:**
    *   Composite unique index on columns `[team_id, user_id]`.

### 3.5. `team_invitations` Table
Manages pending team enrollment invites.

| Column Name | Data Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `UUIDV4` | Unique invitation identifier. |
| `team_id` | `UUID` | `FOREIGN KEY` (references `teams.id`), `NOT NULL` | N/A | Associated team. |
| `email` | `STRING` | `NOT NULL`, `isEmail` | N/A | Invited user's email. |
| `role` | `ENUM('admin', 'member', 'viewer')` | `NOT NULL` | `'member'` | Access role to assign on acceptance. |
| `invited_by` | `UUID` | `FOREIGN KEY` (references `users.id`), `NOT NULL` | N/A | Inviter user identifier. |
| `status` | `ENUM('pending', 'accepted', 'declined', 'expired')` | `NOT NULL` | `'pending'` | Invite state. |
| `token` | `STRING` | `UNIQUE` | N/A | Cryptographically secure activation token. |
| `expires_at` | `DATE` | `NOT NULL` | N/A | Token expiration date (typically 7 days). |
| `created_at` | `DATE` | `NOT NULL` | `now()` | Timestamp. |
| `updated_at` | `DATE` | `NOT NULL` | `now()` | Timestamp. |

*   **Indexes:**
    *   Composite unique index on columns `[team_id, email]`.

### 3.6. `promo_codes` Table
Handles checkout validation and discount rules.

| Column Name | Data Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `UUIDV4` | Unique promo identifier. |
| `code` | `STRING` | `UNIQUE`, `NOT NULL` | N/A | Code string input (e.g. `'FLASH50'`). |
| `discount_type` | `ENUM('percent', 'flat')` | `NOT NULL` | N/A | Type of deduction to apply. |
| `discount_value` | `DECIMAL(10,2)` | `NOT NULL` | N/A | Value to subtract (e.g. `50.00` or `10.00`). |
| `valid_from` | `DATE` | `ALLOW NULL` | `NULL` | Promo activation start date. |
| `valid_until` | `DATE` | `ALLOW NULL` | `NULL` | Promo expiration end date. |
| `max_uses` | `INTEGER` | `ALLOW NULL` | `NULL` | Maximum code redemptions overall. |
| `current_uses` | `INTEGER` | `NOT NULL` | `0` | Times successfully validated. |
| `is_active` | `BOOLEAN` | `NOT NULL` | `true` | Manual activation toggle. |
| `specific_user_id`| `UUID` | `FOREIGN KEY` (references `users.id`), `ALLOW NULL` | `NULL` | Restricts code to single user. |
| `allowed_plans` | `JSON` | `ALLOW NULL` | `NULL` | Array of strings defining plans allowed. |
| `created_at` | `DATE` | `NOT NULL` | `now()` | Timestamp. |
| `updated_at` | `DATE` | `NOT NULL` | `now()` | Timestamp. |

### 3.7. `locators` Table
Stores synced selector elements.

| Column Name | Data Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `UUIDV4` | Unique locator identifier. |
| `name` | `STRING` | `NOT NULL` | N/A | Locator display label. |
| `selector` | `TEXT` | `NOT NULL` | N/A | Selector string (e.g. XPath, CSS). |
| `type` | `ENUM('xpath', 'css', 'id', 'name', 'tag', 'class')` | `NOT NULL` | `'xpath'` | Strategy pattern type. |
| `element_tag` | `STRING` | `ALLOW NULL` | `NULL` | Target element tag type (e.g. `'BUTTON'`). |
| `page_url` | `TEXT` | `ALLOW NULL` | `NULL` | Web address where elements reside. |
| `user_id` | `UUID` | `FOREIGN KEY` (references `users.id`), `NOT NULL` | N/A | Creator user. Cascades on user deletion. |
| `created_at` | `DATE` | `NOT NULL` | `now()` | Timestamp. |
| `updated_at` | `DATE` | `NOT NULL` | `now()` | Timestamp. |

### 3.8. `payments` Table
Maintains transaction histories for financial auditing.

| Column Name | Data Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `UUIDV4` | Unique payment identifier. |
| `team_id` | `UUID` | `FOREIGN KEY` (references `teams.id`), `NOT NULL` | N/A | Subscription team. |
| `user_id` | `UUID` | `FOREIGN KEY` (references `users.id`), `NOT NULL` | N/A | Payer user. |
| `razorpay_order_id`| `STRING` | `NOT NULL` | N/A | Order ID from Razorpay. |
| `razorpay_payment_id`| `STRING` | `NOT NULL` | N/A | Payment transaction ID from Razorpay. |
| `amount` | `DECIMAL(10,2)`| `NOT NULL` | N/A | Paid transaction amount. |
| `plan_name` | `STRING` | `NOT NULL` | N/A | Upgraded plan tier. |
| `status` | `ENUM('paid', 'refunded', 'failed')` | `NOT NULL` | `'paid'` | Payment status. |
| `refund_amount` | `DECIMAL(10,2)`| `ALLOW NULL` | `NULL` | Total amount refunded. |
| `plan_started_at` | `DATE` | `NOT NULL` | N/A | Commencement date of this billing block. |
| `created_at` | `DATE` | `NOT NULL` | `now()` | Timestamp. |
| `updated_at` | `DATE` | `NOT NULL` | `now()` | Timestamp. |

---

## 4. Association Definitions Summary

The relationships defined in [index.js](file:///e:/LocatorX/LX-Website/backend/models/index.js) are implemented as follows:
*   `User` $\leftrightarrow$ `Profile`: One-to-One. Cascade on delete from User to Profile.
*   `User` $\leftrightarrow$ `Locator`: One-to-Many. Cascade on delete from User to Locator.
*   `User` $\leftrightarrow$ `Team` (Owned): One-to-Many via `ownerId`.
*   `User` $\leftrightarrow$ `TeamMember`: One-to-Many. Cascade on delete from User.
*   `Team` $\leftrightarrow$ `TeamMember`: One-to-Many.
*   `Team` $\leftrightarrow$ `TeamInvitation`: One-to-Many.
*   `User` $\leftrightarrow$ `TeamInvitation` (Inviter): One-to-Many via `invitedBy`.
*   `User` $\leftrightarrow$ `Payment`: One-to-Many.
*   `Team` $\leftrightarrow$ `Payment`: One-to-Many.
*   `User` $\leftrightarrow$ `PromoCode`: One-to-Many via `specificUserId`.
