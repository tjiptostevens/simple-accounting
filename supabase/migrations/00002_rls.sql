-- ============================================================
-- Row Level Security Policies
-- Every authenticated user can only see/modify data belonging
-- to their own company (stored in profiles.company_id).
-- ============================================================

-- ── Helper: resolve the company_id for the current user ─────
create or replace function public.current_company_id()
returns uuid language sql stable security definer as $$
  select company_id from public.profiles where id = auth.uid();
$$;

-- ─────────────────────────────────────────────────────────────
-- companies
-- ─────────────────────────────────────────────────────────────
alter table public.companies enable row level security;

create policy "Users can read their own company"
  on public.companies for select
  using (id = public.current_company_id());

create policy "Admins can update their own company"
  on public.companies for update
  using (id = public.current_company_id());

-- ─────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- periods
-- ─────────────────────────────────────────────────────────────
alter table public.periods enable row level security;

create policy "Company members can read periods"
  on public.periods for select
  using (company_id = public.current_company_id());

create policy "Company members can insert periods"
  on public.periods for insert
  with check (company_id = public.current_company_id());

create policy "Company members can update periods"
  on public.periods for update
  using (company_id = public.current_company_id());

-- ─────────────────────────────────────────────────────────────
-- chart_of_accounts
-- ─────────────────────────────────────────────────────────────
alter table public.chart_of_accounts enable row level security;

create policy "Company members can read COA"
  on public.chart_of_accounts for select
  using (company_id = public.current_company_id());

create policy "Company members can insert COA"
  on public.chart_of_accounts for insert
  with check (company_id = public.current_company_id());

create policy "Company members can update COA"
  on public.chart_of_accounts for update
  using (company_id = public.current_company_id());

-- ─────────────────────────────────────────────────────────────
-- customers
-- ─────────────────────────────────────────────────────────────
alter table public.customers enable row level security;

create policy "Company members can read customers"
  on public.customers for select
  using (company_id = public.current_company_id());

create policy "Company members can insert customers"
  on public.customers for insert
  with check (company_id = public.current_company_id());

create policy "Company members can update customers"
  on public.customers for update
  using (company_id = public.current_company_id());

-- ─────────────────────────────────────────────────────────────
-- journals
-- ─────────────────────────────────────────────────────────────
alter table public.journals enable row level security;

create policy "Company members can read journals"
  on public.journals for select
  using (company_id = public.current_company_id());

create policy "Company members can insert journals"
  on public.journals for insert
  with check (company_id = public.current_company_id());

-- ─────────────────────────────────────────────────────────────
-- journal_entries
-- ─────────────────────────────────────────────────────────────
alter table public.journal_entries enable row level security;

create policy "Company members can read journal entries"
  on public.journal_entries for select
  using (company_id = public.current_company_id());

create policy "Company members can insert journal entries"
  on public.journal_entries for insert
  with check (company_id = public.current_company_id());

-- ─────────────────────────────────────────────────────────────
-- assets
-- ─────────────────────────────────────────────────────────────
alter table public.assets enable row level security;

create policy "Company members can read assets"
  on public.assets for select
  using (company_id = public.current_company_id());

create policy "Company members can insert assets"
  on public.assets for insert
  with check (company_id = public.current_company_id());

-- ─────────────────────────────────────────────────────────────
-- equity_changes
-- ─────────────────────────────────────────────────────────────
alter table public.equity_changes enable row level security;

create policy "Company members can read equity changes"
  on public.equity_changes for select
  using (company_id = public.current_company_id());

create policy "Company members can insert equity changes"
  on public.equity_changes for insert
  with check (company_id = public.current_company_id());

-- ─────────────────────────────────────────────────────────────
-- orders
-- ─────────────────────────────────────────────────────────────
alter table public.orders enable row level security;

create policy "Company members can read orders"
  on public.orders for select
  using (company_id = public.current_company_id());

create policy "Company members can insert orders"
  on public.orders for insert
  with check (company_id = public.current_company_id());

-- ─────────────────────────────────────────────────────────────
-- payments
-- ─────────────────────────────────────────────────────────────
alter table public.payments enable row level security;

create policy "Company members can read payments"
  on public.payments for select
  using (company_id = public.current_company_id());

create policy "Company members can insert payments"
  on public.payments for insert
  with check (company_id = public.current_company_id());
