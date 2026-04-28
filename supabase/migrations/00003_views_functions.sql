-- ============================================================
-- Database Views & Functions for Financial Reports
-- These move heavy computation from the React client to the DB,
-- which is orders of magnitude faster for large datasets.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- view: coa_with_balances
-- Computes running debit/credit/total for every COA account.
-- Pass company_id and optional date range via RLS + filters.
-- ─────────────────────────────────────────────────────────────
create or replace view public.coa_with_balances as
select
  c.id,
  c.company_id,
  c.number,
  c.name,
  c.type,
  c.parent,
  c.is_group,
  coalesce(sum(je.debit),  0) as total_debit,
  coalesce(sum(je.credit), 0) as total_credit,
  case
    when c.type in ('Assets', 'Expense')
      then coalesce(sum(je.debit), 0)  - coalesce(sum(je.credit), 0)
    else
      coalesce(sum(je.credit), 0) - coalesce(sum(je.debit), 0)
  end as balance
from public.chart_of_accounts c
left join public.journal_entries je
  on je.acc = c.number
  and je.company_id = c.company_id
group by c.id, c.company_id, c.number, c.name, c.type, c.parent, c.is_group;

-- ─────────────────────────────────────────────────────────────
-- function: get_trial_balance(p_company_id, p_start, p_end)
-- Returns COA rows with debit/credit/balance for a date range.
-- ─────────────────────────────────────────────────────────────
create or replace function public.get_trial_balance(
  p_company_id uuid,
  p_start      date,
  p_end        date
)
returns table (
  number       text,
  name         text,
  type         text,
  parent       text,
  is_group     boolean,
  total_debit  numeric,
  total_credit numeric,
  balance      numeric
) language sql stable security definer as $$
  select
    c.number,
    c.name,
    c.type,
    c.parent,
    c.is_group,
    coalesce(sum(je.debit),  0),
    coalesce(sum(je.credit), 0),
    case
      when c.type in ('Assets', 'Expense')
        then coalesce(sum(je.debit), 0)  - coalesce(sum(je.credit), 0)
      else
        coalesce(sum(je.credit), 0) - coalesce(sum(je.debit), 0)
    end
  from public.chart_of_accounts c
  left join public.journal_entries je
    on je.acc = c.number
    and je.company_id = c.company_id
    and je.posting_date between p_start and p_end
  where c.company_id = p_company_id
  group by c.number, c.name, c.type, c.parent, c.is_group
  order by c.number;
$$;

-- ─────────────────────────────────────────────────────────────
-- function: get_profit_and_loss(p_company_id, p_start, p_end)
-- ─────────────────────────────────────────────────────────────
create or replace function public.get_profit_and_loss(
  p_company_id uuid,
  p_start      date,
  p_end        date
)
returns table (
  number   text,
  name     text,
  type     text,
  parent   text,
  is_group boolean,
  balance  numeric
) language sql stable security definer as $$
  select
    c.number,
    c.name,
    c.type,
    c.parent,
    c.is_group,
    case
      when c.type = 'Income'
        then coalesce(sum(je.credit), 0) - coalesce(sum(je.debit), 0)
      else
        coalesce(sum(je.debit), 0)  - coalesce(sum(je.credit), 0)
    end as balance
  from public.chart_of_accounts c
  left join public.journal_entries je
    on je.acc = c.number
    and je.company_id = c.company_id
    and je.posting_date between p_start and p_end
  where c.company_id = p_company_id
    and c.type in ('Income', 'Expense')
  group by c.number, c.name, c.type, c.parent, c.is_group
  order by c.type desc, c.number;
$$;

-- ─────────────────────────────────────────────────────────────
-- function: get_balance_sheet(p_company_id, p_start, p_end)
-- ─────────────────────────────────────────────────────────────
create or replace function public.get_balance_sheet(
  p_company_id uuid,
  p_start      date,
  p_end        date
)
returns table (
  number   text,
  name     text,
  type     text,
  parent   text,
  is_group boolean,
  balance  numeric
) language sql stable security definer as $$
  select
    c.number,
    c.name,
    c.type,
    c.parent,
    c.is_group,
    case
      when c.type in ('Assets')
        then coalesce(sum(je.debit), 0) - coalesce(sum(je.credit), 0)
      else
        coalesce(sum(je.credit), 0) - coalesce(sum(je.debit), 0)
    end as balance
  from public.chart_of_accounts c
  left join public.journal_entries je
    on je.acc = c.number
    and je.company_id = c.company_id
    and je.posting_date between p_start and p_end
  where c.company_id = p_company_id
    and c.type in ('Assets', 'Liability', 'Equity')
  group by c.number, c.name, c.type, c.parent, c.is_group
  order by c.type, c.number;
$$;
