# Simple Accounting

A web-based accounting application built with React, Vite, and Supabase.

This README is written for open-source users who want to:

1. Fork the repository
2. Connect their own Supabase project
3. Deploy their fork to Netlify

Estimated setup time: 20 to 40 minutes.

## What You Get

- Authentication with Supabase Auth
- Master data modules (COA, period, customer, user)
- Journal and depreciation activities
- Financial reports (ledger, trial balance, profit and loss, balance sheet, cashflow, equity changes, closing journal)
- Orders and payments
- Excel import support

## Tech Stack

| Layer                 | Technology      |
| --------------------- | --------------- |
| Frontend              | React 18 + Vite |
| Styling               | Tailwind CSS v4 |
| Routing               | React Router v6 |
| Data Fetching         | TanStack Query  |
| Backend/Auth/Database | Supabase        |
| Hosting               | Netlify         |

## Setup Map

Complete the setup in this order:

1. GitHub platform setup (fork and clone)
2. Supabase platform setup (project, keys, migrations, seed)
3. Local machine setup (run and verify)
4. Netlify platform setup (build and environment variables)

---

## 1) GitHub Platform Setup

### Step 1. Fork this repository

1. Open this repository on GitHub.
2. Click Fork.
3. Create the fork under your own account.

Checkpoint:

- You should now have your own repo URL, for example:
  - https://github.com/your-username/simple-accounting

### Step 2. Clone your fork

Use one of the commands below.

Git Bash or macOS/Linux:

```bash
git clone https://github.com/your-username/simple-accounting.git
cd simple-accounting
```

PowerShell:

```powershell
git clone https://github.com/your-username/simple-accounting.git
Set-Location simple-accounting
```

### Step 3. Install dependencies

```bash
npm install
```

Checkpoint:

- Installation finishes without dependency errors.

---

## 2) Supabase Platform Setup

### Step 1. Create a Supabase project

1. Go to https://supabase.com and create a new project.
2. Wait until the project status is ready.

### Step 2. Copy API values

In Supabase Dashboard:

1. Open Settings
2. Open API
3. Copy:
   - Project URL
   - anon public key

### Step 3. Create local environment file

Create a .env file in the project root with:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Security note:

- Do not put your service role key in frontend environment variables.
- Only use the anon public key in this app.

### Step 4. Apply migrations

This project includes SQL migration files in supabase/migrations.

Recommended CLI flow:

```bash
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

Migration files:

| File                      | Purpose                                       |
| ------------------------- | --------------------------------------------- |
| 00001_schema.sql          | Create base tables                            |
| 00002_rls.sql             | Enable and define row-level security policies |
| 00003_views_functions.sql | Create SQL views and helper functions         |
| 00004_seed.sql            | Insert demo data for dummy/testing use        |

If you prefer SQL Editor, run files in exact order from top to bottom.

### Step 5. Optional dummy seed login

If seed data is applied, demo login is:

| Field    | Value           |
| -------- | --------------- |
| Email    | demo@tjip.my.id |
| Password | demo@demo1      |

Seed note:

- 00004_seed.sql is intended for demo/testing.
- Avoid demo seed data in production unless you intentionally want it.

Checkpoint:

- Tables exist
- Policies exist
- Demo account can authenticate (if seeded)

---

## 3) Local Machine Setup

### Step 1. Start development server

```bash
npm run dev
```

Open http://localhost:5173

### Step 2. Smoke test

1. Open login page
2. Sign in with seeded demo account (if seed applied)
3. Open dashboard
4. Verify one simple data action works

Common first-run issues:

1. Blank page or auth errors
   - Check .env values and restart dev server.
2. Database relation errors
   - Migrations may not have been applied to the same project used by your .env.
3. CLI permission issues
   - Confirm you are logged in and linked to the correct project ref.

---

## 4) Netlify Platform Setup

### Step 1. Import your fork into Netlify

1. Open https://app.netlify.com
2. Add new site
3. Import from Git provider
4. Select your forked repository

### Step 2. Confirm build settings

This project uses netlify.toml:

- Build command: npm run build
- Publish directory: dist

### Step 3. Add environment variables

In Site settings, add:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Use the same values as your local .env.

### Step 4. Deploy

1. Trigger deploy
2. Open the generated Netlify URL

Checkpoint:

- App loads successfully
- Login works
- Direct URL refresh works (SPA redirect is already configured in netlify.toml)

---

## Important Production Note

Netlify deploy does not run Supabase migrations automatically.

Recommended release order:

1. Run Supabase migrations first
2. Deploy frontend to Netlify after schema changes are applied

For team workflow, use CI to run supabase db push before production deployment.

---

## Keeping Your Fork Updated

When upstream adds new migrations:

1. Pull latest upstream changes
2. Run supabase db push again on your project
3. Redeploy your Netlify site

---

## Scripts

| Command         | Description                       |
| --------------- | --------------------------------- |
| npm run dev     | Start local development server    |
| npm run build   | Build production bundle           |
| npm run preview | Preview production bundle locally |
| npm run test    | Run test suite once               |

---

## Project Structure

```text
src/
  components/
    dashboard/
    report/
    site/
  context/
  lib/
supabase/
  migrations/
```
