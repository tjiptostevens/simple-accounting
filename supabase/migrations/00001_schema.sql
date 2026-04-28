-- ============================================================
-- Simple Accounting – Initial Schema
-- Run against your Supabase project via the SQL editor or
-- the Supabase CLI:  supabase db push
-- ============================================================

-- Enable the pgcrypto extension (used by gen_random_uuid)
create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- 1.  companies
-- ─────────────────────────────────────────────────────────────
create table if not exists public.companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  abbr        text,
  address     text,
  city        text,
  country     text,
  phone       text,
  mobile      text,
  email       text,
  website     text,
  other       text,
  logo        text,
  created_at  timestamptz default now() not null
);

-- ─────────────────────────────────────────────────────────────
-- 2.  profiles  (extends Supabase auth.users)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  company_id  uuid references public.companies (id),
  first_name  text,
  last_name   text,
  mobile      text,
  role        text not null default 'user',   -- 'admin' | 'user'
  created_at  timestamptz default now() not null
);

-- Automatically create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- 3.  periods
-- ─────────────────────────────────────────────────────────────
create table if not exists public.periods (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies (id),
  name        text not null,
  description text,
  start_date  date not null,
  end_date    date not null,
  status      smallint not null default 1,  -- 1=Active, 0=Closed
  created_by  uuid references auth.users (id),
  created_at  timestamptz default now() not null
);

-- ─────────────────────────────────────────────────────────────
-- 4.  chart_of_accounts
-- ─────────────────────────────────────────────────────────────
create table if not exists public.chart_of_accounts (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies (id),
  number      text not null,
  name        text not null,
  type        text not null check (type in ('Assets','Liability','Equity','Income','Expense')),
  parent      text not null default '0',
  is_group    boolean not null default false,
  created_by  uuid references auth.users (id),
  created_at  timestamptz default now() not null,
  unique (company_id, number)
);

-- ─────────────────────────────────────────────────────────────
-- 5.  customers
-- ─────────────────────────────────────────────────────────────
create table if not exists public.customers (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies (id),
  name        text not null,
  mobile      text,
  email       text,
  address     text,
  status      smallint not null default 1,  -- 1=Active, 0=Inactive
  created_by  uuid references auth.users (id),
  modified_by uuid references auth.users (id),
  created_at  timestamptz default now() not null
);

-- ─────────────────────────────────────────────────────────────
-- 6.  journals  (journal header)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.journals (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references public.companies (id),
  name            text not null,   -- e.g. JV/2024/0001
  title           text,
  type            text not null,   -- 'Jurnal Umum', 'Opening', 'Closing', etc.
  posting_date    date not null,
  total_debit     numeric(18,2) not null default 0,
  total_credit    numeric(18,2) not null default 0,
  pay_to_recd_from text,
  user_remark     text,
  ref             text,
  ref_id          text,
  created_by      uuid references auth.users (id),
  created_at      timestamptz default now() not null
);

-- ─────────────────────────────────────────────────────────────
-- 7.  journal_entries  (journal lines)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.journal_entries (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references public.companies (id),
  journal_id   uuid not null references public.journals (id) on delete cascade,
  parent       text,               -- journal name (denorm for quick look-up)
  acc          text not null,      -- COA number
  acc_type     text,
  party_type   text,
  party        text,
  debit        numeric(18,2) not null default 0,
  credit       numeric(18,2) not null default 0,
  posting_date date not null,
  created_by   uuid references auth.users (id),
  created_at   timestamptz default now() not null
);

-- ─────────────────────────────────────────────────────────────
-- 8.  assets  (fixed assets / depreciation)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.assets (
  id                uuid primary key default gen_random_uuid(),
  company_id        uuid not null references public.companies (id),
  name              text not null,
  code              text,
  type              text,
  acquisition_date  date,
  acquisition_value numeric(18,2),
  useful_life_years integer,
  depreciation_rate numeric(5,2),
  current_value     numeric(18,2),
  created_by        uuid references auth.users (id),
  created_at        timestamptz default now() not null
);

-- ─────────────────────────────────────────────────────────────
-- 9.  equity_changes  (period equity summary)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.equity_changes (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references public.companies (id),
  period_name  text not null,
  opening      numeric(18,2),
  profit       numeric(18,2),
  prive        numeric(18,2),
  closing      numeric(18,2),
  posting_date date,
  created_by   uuid references auth.users (id),
  created_at   timestamptz default now() not null
);

-- ─────────────────────────────────────────────────────────────
-- 10. orders
-- ─────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references public.companies (id),
  customer_id  uuid references public.customers (id),
  name         text,
  order_date   date,
  total        numeric(18,2),
  status       smallint not null default 1,
  created_by   uuid references auth.users (id),
  created_at   timestamptz default now() not null
);

-- ─────────────────────────────────────────────────────────────
-- 11. payments
-- ─────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references public.companies (id),
  order_id     uuid references public.orders (id),
  amount       numeric(18,2),
  payment_date date,
  method       text,
  created_by   uuid references auth.users (id),
  created_at   timestamptz default now() not null
);
