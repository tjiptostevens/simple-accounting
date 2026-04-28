# Simple Accounting

A web-based accounting application built with React and [Supabase](https://supabase.com). It covers the full bookkeeping workflow — from chart of accounts and journal entries through to financial reports and closing entries.

## Features

- **Authentication** — Supabase Auth with protected routes and user profiles
- **Master Data**
  - Company profile
  - Chart of Accounts (Assets, Liability, Equity, Income, Expense)
  - Accounting Periods
  - Customers
  - Users
- **Activities**
  - General Journal entry
  - Fixed Asset Depreciation
- **Reports**
  - General Journal
  - General Ledger
  - Trial Balance
  - Profit & Loss
  - Balance Sheet
  - Cash Flow Statement
  - Statement of Equity Changes
  - Closing Journal
- **Orders & Payments**
- **Excel Import** — bulk-import journal data from `.xlsx` files

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | [React 18](https://react.dev) |
| Build Tool | [Vite](https://vitejs.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Routing | [React Router v6](https://reactrouter.com) |
| Data Fetching | [TanStack React Query v5](https://tanstack.com/query) |
| Backend / Auth / DB | [Supabase](https://supabase.com) |
| Select Component | [react-select](https://react-select.com) |
| Excel Parsing | [xlsx](https://sheetjs.com) |

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/tjiptostevens/simple-accounting.git
cd simple-accounting
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

You can find these values in your Supabase project under **Settings → API**.

### 4. Apply the database schema

Run the migrations against your Supabase project using the Supabase CLI:

```bash
supabase db push
```

Or copy and run the SQL files in `supabase/migrations/` directly from the Supabase SQL editor in this order:

1. `00001_schema.sql` — tables
2. `00002_rls.sql` — Row-Level Security policies
3. `00003_views_functions.sql` — views and helper functions

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build for production (output in `dist/`) |
| `npm run preview` | Preview the production build locally |

## Project Structure

```
src/
├── components/
│   ├── dashboard/      # Master data pages (COA, period, company, customer, user)
│   │   ├── activity/   # Journal and depreciation
│   │   └── master/
│   ├── report/         # Financial report pages
│   ├── excel/          # Excel import
│   ├── form/           # Shared form components
│   ├── custom/         # Reusable UI components
│   └── site/           # Nav, login, protected route
├── context/            # React context (AuthContext)
├── lib/                # Supabase client
└── main.jsx
supabase/
└── migrations/         # SQL migration files
```
