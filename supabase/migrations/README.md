# supabase/migrations/

This directory contains the SQL migration scripts for the Locator-X Supabase project.

## Directory Structure

We provide both **Modular Files** (for understanding/updating specific features) and a **Master File** (for easy complete deployment).

### 📂 Modular Files (Use these to understand or update specific features)
- **`01_profiles_and_auth.sql`**
    - Sets up the `profiles` table linked to `auth.users`.
    - Handles new user creation triggers.
- **`02_teams_and_invites.sql`**
    - Sets up `teams`, `team_members`, and `team_invitations`.
    - Includes RLS policies for team access.
- **`03_avatars_storage.sql`**
    - Configures the `avatars` storage bucket.
    - Sets RLS policies for uploads/viewing.
- **`04_promo_codes.sql`**
    - Sets up the `promo_codes` table and logic for generating codes.
- **`05_trigger_team_plan_sync.sql`**
    - **(New)** Contains the Logic to sync `profiles.plan` instantly when a user joins/leaves a team.

### 🚀 Master File (Use this for Deployment)
- **`20260114_complete_schema_setup.sql`**
    - This file is a **concatenation of all the above**.
    - It is **Idempotent** (uses `IF NOT EXISTS`), so it is safe to run on any project to bring it up to date.
    - **Usage**: Copy the content of this file and run it in the Supabase SQL Editor to set up the entire backend in one go.

## Archive
- `archive/`: Contains older migration scripts and backups. You can ignore these unless you are debugging historical changes.
