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

-- ─────────────────────────────────────────────────────────────
-- function: get_cash_flow(p_company_id, p_start, p_end)
-- Returns cash-flow components using the indirect method.
-- Account classification follows Indonesian SME conventions:
--   Cash        : number LIKE '111%' OR '112%', or name ilike '%kas%' / '%bank%'
--   CurrentAsset: number LIKE '11%' and not cash
--   FixedAsset  : Assets type, not 11x
--   CurrentLiab : number LIKE '21%'
--   LTLiab      : Liability, not 21x
--   Capital     : Equity, not 32x, not '330'
--   Drawing     : Equity, 32x
--   Income/Expense : as typed
-- ─────────────────────────────────────────────────────────────
create or replace function public.get_cash_flow(
  p_company_id uuid,
  p_start      date,
  p_end        date
)
returns table (
  section       text,   -- 'Operating' | 'Investing' | 'Financing' | 'Summary'
  label         text,
  amount        numeric
) language sql stable security definer as $$

  with
  -- All journal entries for the period
  period_je as (
    select je.acc, je.debit, je.credit
    from public.journal_entries je
    where je.company_id = p_company_id
      and je.posting_date between p_start and p_end
  ),
  -- All journal entries before the period (for beginning cash)
  prior_je as (
    select je.acc, je.debit, je.credit
    from public.journal_entries je
    where je.company_id = p_company_id
      and je.posting_date < p_start
  ),
  -- COA reference
  coa as (
    select number, name, type, is_group
    from public.chart_of_accounts
    where company_id = p_company_id
  ),
  -- Aggregate period debits/credits per account
  period_agg as (
    select acc, sum(debit) as d, sum(credit) as c
    from period_je group by acc
  ),
  prior_agg as (
    select acc, sum(debit) as d, sum(credit) as c
    from prior_je group by acc
  ),
  -- Classify each account
  classified as (
    select
      c.number,
      c.name,
      c.type,
      case
        when c.type in ('Assets') and (
          c.number like '111%' or c.number like '112%' or
          c.name ilike '%kas%' or c.name ilike '%bank%' or c.name ilike '%cash%'
        ) then 'Cash'
        when c.type = 'Assets'    and c.number like '11%' then 'CurrentAsset'
        when c.type = 'Assets'                             then 'FixedAsset'
        when c.type = 'Liability' and c.number like '21%' then 'CurrentLiability'
        when c.type = 'Liability'                         then 'LongTermLiability'
        when c.type = 'Equity'    and c.number like '32%' then 'Drawing'
        when c.type = 'Equity'    and c.number = '330'    then 'RetainedEarnings'
        when c.type = 'Equity'                            then 'Capital'
        when c.type = 'Income'                            then 'Income'
        when c.type = 'Expense'                           then 'Expense'
        else 'Other'
      end as category
    from coa c
    where not c.is_group
  ),
  -- Period net balance per classified account
  period_net as (
    select
      cl.number,
      cl.name,
      cl.type,
      cl.category,
      case
        when cl.type in ('Assets','Expense')
          then coalesce(pa.d,0) - coalesce(pa.c,0)
        else
          coalesce(pa.c,0) - coalesce(pa.d,0)
      end as net
    from classified cl
    left join period_agg pa on pa.acc = cl.number
    where coalesce(pa.d,0) + coalesce(pa.c,0) > 0
  ),
  -- Beginning cash
  cash_beg as (
    select coalesce(sum(pa.d - pa.c), 0) as beg
    from prior_agg pa
    join classified cl on cl.number = pa.acc
    where cl.category = 'Cash'
  )

  -- ── Operating: Net Income
  select 'Operating', 'Net Income / (Loss)',
    sum(case when category = 'Income'  then net else 0 end) -
    sum(case when category = 'Expense' then net else 0 end)
  from period_net

  union all

  -- ── Operating: Working-capital – current assets (non-cash)
  select 'Operating', 'Change in ' || name, -net
  from period_net where category = 'CurrentAsset'

  union all

  -- ── Operating: Working-capital – current liabilities
  select 'Operating', 'Change in ' || name, net
  from period_net where category = 'CurrentLiability'

  union all

  -- ── Investing: Fixed assets
  select 'Investing', name, -net
  from period_net where category = 'FixedAsset'

  union all

  -- ── Financing: Equity & long-term debt
  select 'Financing', name, net
  from period_net where category in ('Capital', 'LongTermLiability')

  union all

  select 'Financing', name || ' (Drawing)', -net
  from period_net where category = 'Drawing'

  union all

  -- ── Summary: Cash beginning / ending
  select 'Summary', 'Cash at Beginning of Period', beg from cash_beg
$$;
