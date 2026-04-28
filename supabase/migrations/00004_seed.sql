-- ============================================================
-- Seed: Demo User, Demo Company & Mockup Accounting Data
-- Run AFTER migrations 00001–00003.
--
-- Demo login credentials
--   Email   : demo@tjip.my.id
--   Password: demo@demo1
--
-- This script is idempotent – it exits early if the demo user
-- already exists, so it is safe to run more than once.
-- ============================================================

do $$
declare
  -- ── Fixed IDs (change only if you want a different seed) ─
  v_user_id    constant uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  v_company_id constant uuid := 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
  v_period_id  constant uuid := 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
  v_cust1      constant uuid := 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44';
  v_cust2      constant uuid := 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55';
  v_cust3      constant uuid := 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66';
  v_cust4      constant uuid := 'a6eebc99-9c0b-4ef8-bb6d-6bb9bd380a77';

  -- ── Journal IDs ───────────────────────────────────────────
  v_jv01 uuid; v_jv02 uuid; v_jv03 uuid; v_jv04 uuid; v_jv05 uuid;
  v_jv06 uuid; v_jv07 uuid; v_jv08 uuid; v_jv09 uuid; v_jv10 uuid;
  v_jv11 uuid; v_jv12 uuid; v_jv13 uuid; v_jv14 uuid; v_jv15 uuid;
  v_jv16 uuid; v_jv17 uuid; v_jv18 uuid; v_jv19 uuid; v_jv20 uuid;
  v_jv21 uuid; v_jv22 uuid; v_jv23 uuid; v_jv24 uuid; v_jv25 uuid;

  -- ── Order IDs ────────────────────────────────────────────
  v_ord1 uuid; v_ord2 uuid; v_ord3 uuid; v_ord4 uuid; v_ord5 uuid;

begin
  -- ── Guard: skip if already seeded ────────────────────────
  if exists (select 1 from auth.users where email = 'demo@tjip.my.id') then
    raise notice 'Seed already applied – skipping.';
    return;
  end if;

  -- ── 1. Auth user ─────────────────────────────────────────
  -- Handles both legacy GoTrue (with instance_id) and modern GoTrue (without).
  begin
    insert into auth.users (
      id, instance_id, aud, role,
      email, encrypted_password, email_confirmed_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'demo@tjip.my.id',
      crypt('demo@demo1', gen_salt('bf')),
      now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
      now(), now(),
      '', '', '', ''
    );
  exception when undefined_column then
    -- Modern GoTrue dropped instance_id
    insert into auth.users (
      id, aud, role,
      email, encrypted_password, email_confirmed_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      v_user_id,
      'authenticated', 'authenticated',
      'demo@tjip.my.id',
      crypt('demo@demo1', gen_salt('bf')),
      now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
      now(), now(),
      '', '', '', ''
    );
  end;

  -- ── 2. Auth identity ─────────────────────────────────────
  -- Handles GoTrue with and without the provider_id column.
  begin
    insert into auth.identities (
      id, provider_id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(),
      'demo@tjip.my.id',
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', 'demo@tjip.my.id'),
      'email',
      now(), now(), now()
    );
  exception when undefined_column then
    insert into auth.identities (
      user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', 'demo@tjip.my.id'),
      'email',
      now(), now(), now()
    );
  end;

  -- ── 3. Company ───────────────────────────────────────────
  insert into public.companies (
    id, name, abbr, address, city, country, phone, mobile, email, website
  ) values (
    v_company_id,
    'Demo Company',
    'DEMO',
    'Jl. Sudirman No. 1, Gedung Utama',
    'Jakarta',
    'Indonesia',
    '021-12345678',
    '0812-3456-7890',
    'info@democompany.id',
    'https://democompany.id'
  );

  -- ── 4. Profile ───────────────────────────────────────────
  -- The on_auth_user_created trigger already inserted a bare profile row;
  -- we upsert to set company, role and name.
  insert into public.profiles (id, company_id, role, first_name, last_name)
  values (v_user_id, v_company_id, 'admin', 'Demo', 'User')
  on conflict (id) do update set
    company_id = excluded.company_id,
    role       = excluded.role,
    first_name = excluded.first_name,
    last_name  = excluded.last_name;

  -- ── 5. Accounting Period ─────────────────────────────────
  insert into public.periods (
    id, company_id, name, description, start_date, end_date, status, created_by
  ) values (
    v_period_id, v_company_id,
    'FY 2024', 'Fiscal Year January – December 2024',
    '2024-01-01', '2024-12-31', 1, v_user_id
  );

  -- ── 6. Chart of Accounts ─────────────────────────────────
  -- Account numbering follows the cash-flow classification used in
  -- get_cash_flow(): 111x/112x = Cash, 11x = CurrentAsset,
  -- other Assets = FixedAsset, 21x = CurrentLiability,
  -- 32x = Drawing, 330 = RetainedEarnings.
  insert into public.chart_of_accounts
    (company_id, number, name, type, parent, is_group, created_by)
  values
    -- ASSETS ──────────────────────────────────────────────
    (v_company_id, '1',    'Assets',                        'Assets',    '0',  true,  v_user_id),
    (v_company_id, '11',   'Current Assets',                'Assets',    '1',  true,  v_user_id),
    (v_company_id, '1111', 'Cash on Hand',                  'Assets',    '11', false, v_user_id),
    (v_company_id, '1121', 'Bank BCA',                      'Assets',    '11', false, v_user_id),
    (v_company_id, '113',  'Accounts Receivable',           'Assets',    '11', false, v_user_id),
    (v_company_id, '114',  'Prepaid Expenses',              'Assets',    '11', false, v_user_id),
    (v_company_id, '12',   'Fixed Assets',                  'Assets',    '1',  true,  v_user_id),
    (v_company_id, '121',  'Equipment',                     'Assets',    '12', false, v_user_id),
    (v_company_id, '122',  'Acc. Depreciation – Equipment', 'Assets',    '12', false, v_user_id),
    -- LIABILITIES ─────────────────────────────────────────
    (v_company_id, '2',    'Liabilities',                   'Liability', '0',  true,  v_user_id),
    (v_company_id, '21',   'Current Liabilities',           'Liability', '2',  true,  v_user_id),
    (v_company_id, '211',  'Accounts Payable',              'Liability', '21', false, v_user_id),
    (v_company_id, '212',  'Accrued Expenses',              'Liability', '21', false, v_user_id),
    (v_company_id, '22',   'Long-term Liabilities',         'Liability', '2',  true,  v_user_id),
    (v_company_id, '221',  'Bank Loans',                    'Liability', '22', false, v_user_id),
    -- EQUITY ──────────────────────────────────────────────
    (v_company_id, '3',    'Equity',                        'Equity',    '0',  true,  v_user_id),
    (v_company_id, '31',   'Owner Equity',                  'Equity',    '3',  true,  v_user_id),
    (v_company_id, '310',  'Owner''s Capital',              'Equity',    '31', false, v_user_id),
    (v_company_id, '320',  'Owner''s Drawing',              'Equity',    '31', false, v_user_id),
    (v_company_id, '330',  'Retained Earnings',             'Equity',    '31', false, v_user_id),
    -- INCOME ──────────────────────────────────────────────
    (v_company_id, '4',    'Income',                        'Income',    '0',  true,  v_user_id),
    (v_company_id, '41',   'Revenue',                       'Income',    '4',  true,  v_user_id),
    (v_company_id, '410',  'Service Revenue',               'Income',    '41', false, v_user_id),
    (v_company_id, '420',  'Other Income',                  'Income',    '41', false, v_user_id),
    -- EXPENSES ────────────────────────────────────────────
    (v_company_id, '5',    'Expenses',                      'Expense',   '0',  true,  v_user_id),
    (v_company_id, '51',   'Operating Expenses',            'Expense',   '5',  true,  v_user_id),
    (v_company_id, '511',  'Salaries Expense',              'Expense',   '51', false, v_user_id),
    (v_company_id, '512',  'Rent Expense',                  'Expense',   '51', false, v_user_id),
    (v_company_id, '513',  'Utilities Expense',             'Expense',   '51', false, v_user_id),
    (v_company_id, '514',  'Office Supplies',               'Expense',   '51', false, v_user_id),
    (v_company_id, '515',  'Depreciation Expense',          'Expense',   '51', false, v_user_id),
    (v_company_id, '516',  'Marketing Expense',             'Expense',   '51', false, v_user_id),
    (v_company_id, '517',  'Miscellaneous Expense',         'Expense',   '51', false, v_user_id);

  -- ── 7. Customers ─────────────────────────────────────────
  insert into public.customers
    (id, company_id, name, mobile, email, address, status, created_by)
  values
    (v_cust1, v_company_id, 'PT Teknologi Maju',  '021-5551001',    'info@tekno-maju.id',    'Jl. Gatot Subroto, Jakarta',   1, v_user_id),
    (v_cust2, v_company_id, 'CV Solusi Digital',  '022-5552002',    'admin@solusidigi.com',  'Jl. Asia Afrika, Bandung',      1, v_user_id),
    (v_cust3, v_company_id, 'PT Kreasi Abadi',    '031-5553003',    'hello@kreasi.id',       'Jl. Pemuda, Surabaya',          1, v_user_id),
    (v_cust4, v_company_id, 'Budi Santoso',       '0813-4444-5555', 'budi.s@email.com',      'Jl. Mawar No. 10, Yogyakarta', 1, v_user_id);

  -- ── 8. Journals & Entries ────────────────────────────────
  -- Balance summary (Jan–Jun 2024):
  --   Revenue        : 150,000,000
  --   Expenses       :  50,500,000
  --   Net Income     :  99,500,000
  --   Owner Drawing  :   5,000,000
  --   Bank BCA (end) : 155,500,000

  -- JV/2024/0001 – Capital Injection (Opening)
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, created_by)
  values
    (v_company_id,'JV/2024/0001','Capital Injection','Opening','2024-01-01',100000000,100000000,v_user_id)
  returning id into v_jv01;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv01,'JV/2024/0001','1121','Assets', 100000000,0,        '2024-01-01',v_user_id),
    (v_company_id,v_jv01,'JV/2024/0001','310', 'Equity', 0,        100000000,'2024-01-01',v_user_id);

  -- JV/2024/0002 – Equipment Purchase
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, created_by)
  values
    (v_company_id,'JV/2024/0002','Equipment Purchase','Jurnal Umum','2024-01-15',30000000,30000000,v_user_id)
  returning id into v_jv02;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv02,'JV/2024/0002','121', 'Assets',30000000,0,       '2024-01-15',v_user_id),
    (v_company_id,v_jv02,'JV/2024/0002','1121','Assets',0,       30000000,'2024-01-15',v_user_id);

  -- JV/2024/0003 – Prepaid Rent (Annual)
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, created_by)
  values
    (v_company_id,'JV/2024/0003','Prepaid Office Rent (Annual)','Jurnal Umum','2024-01-20',12000000,12000000,v_user_id)
  returning id into v_jv03;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv03,'JV/2024/0003','114', 'Assets',12000000,0,       '2024-01-20',v_user_id),
    (v_company_id,v_jv03,'JV/2024/0003','1121','Assets',0,       12000000,'2024-01-20',v_user_id);

  -- JV/2024/0004 – Service Revenue Feb (PT Teknologi Maju)
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, pay_to_recd_from, created_by)
  values
    (v_company_id,'JV/2024/0004','Service Revenue – Feb 2024','Jurnal Umum','2024-02-10',25000000,25000000,'PT Teknologi Maju',v_user_id)
  returning id into v_jv04;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,party_type,party,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv04,'JV/2024/0004','1121','Assets','Customer','PT Teknologi Maju',25000000,0,       '2024-02-10',v_user_id),
    (v_company_id,v_jv04,'JV/2024/0004','410', 'Income','Customer','PT Teknologi Maju',0,       25000000,'2024-02-10',v_user_id);

  -- JV/2024/0005 – Salary Feb
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, created_by)
  values
    (v_company_id,'JV/2024/0005','Salary Payment – Feb 2024','Jurnal Umum','2024-02-29',8000000,8000000,v_user_id)
  returning id into v_jv05;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv05,'JV/2024/0005','511', 'Expense',8000000,0,      '2024-02-29',v_user_id),
    (v_company_id,v_jv05,'JV/2024/0005','1121','Assets', 0,      8000000,'2024-02-29',v_user_id);

  -- JV/2024/0006 – Utilities Feb
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, created_by)
  values
    (v_company_id,'JV/2024/0006','Utilities – Feb 2024','Jurnal Umum','2024-02-29',1500000,1500000,v_user_id)
  returning id into v_jv06;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv06,'JV/2024/0006','513', 'Expense',1500000,0,      '2024-02-29',v_user_id),
    (v_company_id,v_jv06,'JV/2024/0006','1121','Assets', 0,      1500000,'2024-02-29',v_user_id);

  -- JV/2024/0007 – Depreciation Jan
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, created_by)
  values
    (v_company_id,'JV/2024/0007','Depreciation – Jan 2024','Jurnal Umum','2024-01-31',500000,500000,v_user_id)
  returning id into v_jv07;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv07,'JV/2024/0007','515','Expense',500000,0,     '2024-01-31',v_user_id),
    (v_company_id,v_jv07,'JV/2024/0007','122','Assets', 0,     500000,'2024-01-31',v_user_id);

  -- JV/2024/0008 – Service Revenue Mar (CV Solusi Digital)
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, pay_to_recd_from, created_by)
  values
    (v_company_id,'JV/2024/0008','Service Revenue – Mar 2024','Jurnal Umum','2024-03-15',30000000,30000000,'CV Solusi Digital',v_user_id)
  returning id into v_jv08;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,party_type,party,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv08,'JV/2024/0008','1121','Assets','Customer','CV Solusi Digital',30000000,0,       '2024-03-15',v_user_id),
    (v_company_id,v_jv08,'JV/2024/0008','410', 'Income','Customer','CV Solusi Digital',0,       30000000,'2024-03-15',v_user_id);

  -- JV/2024/0009 – Salary Mar
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, created_by)
  values
    (v_company_id,'JV/2024/0009','Salary Payment – Mar 2024','Jurnal Umum','2024-03-31',8000000,8000000,v_user_id)
  returning id into v_jv09;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv09,'JV/2024/0009','511', 'Expense',8000000,0,      '2024-03-31',v_user_id),
    (v_company_id,v_jv09,'JV/2024/0009','1121','Assets', 0,      8000000,'2024-03-31',v_user_id);

  -- JV/2024/0010 – Utilities Mar
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, created_by)
  values
    (v_company_id,'JV/2024/0010','Utilities – Mar 2024','Jurnal Umum','2024-03-31',1500000,1500000,v_user_id)
  returning id into v_jv10;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv10,'JV/2024/0010','513', 'Expense',1500000,0,      '2024-03-31',v_user_id),
    (v_company_id,v_jv10,'JV/2024/0010','1121','Assets', 0,      1500000,'2024-03-31',v_user_id);

  -- JV/2024/0011 – Depreciation Feb
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, created_by)
  values
    (v_company_id,'JV/2024/0011','Depreciation – Feb 2024','Jurnal Umum','2024-02-29',500000,500000,v_user_id)
  returning id into v_jv11;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv11,'JV/2024/0011','515','Expense',500000,0,     '2024-02-29',v_user_id),
    (v_company_id,v_jv11,'JV/2024/0011','122','Assets', 0,     500000,'2024-02-29',v_user_id);

  -- JV/2024/0012 – Service Revenue Apr via A/R (PT Kreasi Abadi)
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, pay_to_recd_from, created_by)
  values
    (v_company_id,'JV/2024/0012','Service Invoice – Apr 2024','Jurnal Umum','2024-04-10',28000000,28000000,'PT Kreasi Abadi',v_user_id)
  returning id into v_jv12;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,party_type,party,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv12,'JV/2024/0012','113', 'Assets','Customer','PT Kreasi Abadi',28000000,0,       '2024-04-10',v_user_id),
    (v_company_id,v_jv12,'JV/2024/0012','410', 'Income','Customer','PT Kreasi Abadi',0,       28000000,'2024-04-10',v_user_id);

  -- JV/2024/0013 – Collection Apr (PT Kreasi Abadi)
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, pay_to_recd_from, created_by)
  values
    (v_company_id,'JV/2024/0013','Collection – PT Kreasi Abadi Apr','Jurnal Umum','2024-04-25',28000000,28000000,'PT Kreasi Abadi',v_user_id)
  returning id into v_jv13;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,party_type,party,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv13,'JV/2024/0013','1121','Assets','Customer','PT Kreasi Abadi',28000000,0,       '2024-04-25',v_user_id),
    (v_company_id,v_jv13,'JV/2024/0013','113', 'Assets','Customer','PT Kreasi Abadi',0,       28000000,'2024-04-25',v_user_id);

  -- JV/2024/0014 – Salary Apr
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, created_by)
  values
    (v_company_id,'JV/2024/0014','Salary Payment – Apr 2024','Jurnal Umum','2024-04-30',8000000,8000000,v_user_id)
  returning id into v_jv14;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv14,'JV/2024/0014','511', 'Expense',8000000,0,      '2024-04-30',v_user_id),
    (v_company_id,v_jv14,'JV/2024/0014','1121','Assets', 0,      8000000,'2024-04-30',v_user_id);

  -- JV/2024/0015 – Marketing Expense Apr
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, created_by)
  values
    (v_company_id,'JV/2024/0015','Marketing Expense – Apr 2024','Jurnal Umum','2024-04-30',3000000,3000000,v_user_id)
  returning id into v_jv15;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv15,'JV/2024/0015','516', 'Expense',3000000,0,      '2024-04-30',v_user_id),
    (v_company_id,v_jv15,'JV/2024/0015','1121','Assets', 0,      3000000,'2024-04-30',v_user_id);

  -- JV/2024/0016 – Depreciation Mar
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, created_by)
  values
    (v_company_id,'JV/2024/0016','Depreciation – Mar 2024','Jurnal Umum','2024-03-31',500000,500000,v_user_id)
  returning id into v_jv16;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv16,'JV/2024/0016','515','Expense',500000,0,     '2024-03-31',v_user_id),
    (v_company_id,v_jv16,'JV/2024/0016','122','Assets', 0,     500000,'2024-03-31',v_user_id);

  -- JV/2024/0017 – Service Revenue May (PT Kreasi Abadi)
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, pay_to_recd_from, created_by)
  values
    (v_company_id,'JV/2024/0017','Service Revenue – May 2024','Jurnal Umum','2024-05-15',35000000,35000000,'PT Kreasi Abadi',v_user_id)
  returning id into v_jv17;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,party_type,party,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv17,'JV/2024/0017','1121','Assets','Customer','PT Kreasi Abadi',35000000,0,       '2024-05-15',v_user_id),
    (v_company_id,v_jv17,'JV/2024/0017','410', 'Income','Customer','PT Kreasi Abadi',0,       35000000,'2024-05-15',v_user_id);

  -- JV/2024/0018 – Salary May
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, created_by)
  values
    (v_company_id,'JV/2024/0018','Salary Payment – May 2024','Jurnal Umum','2024-05-31',8000000,8000000,v_user_id)
  returning id into v_jv18;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv18,'JV/2024/0018','511', 'Expense',8000000,0,      '2024-05-31',v_user_id),
    (v_company_id,v_jv18,'JV/2024/0018','1121','Assets', 0,      8000000,'2024-05-31',v_user_id);

  -- JV/2024/0019 – Owner's Drawing May
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, created_by)
  values
    (v_company_id,'JV/2024/0019','Owner''s Drawing – May 2024','Jurnal Umum','2024-05-31',5000000,5000000,v_user_id)
  returning id into v_jv19;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv19,'JV/2024/0019','320', 'Equity',5000000,0,      '2024-05-31',v_user_id),
    (v_company_id,v_jv19,'JV/2024/0019','1121','Assets',0,      5000000,'2024-05-31',v_user_id);

  -- JV/2024/0020 – Depreciation Apr
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, created_by)
  values
    (v_company_id,'JV/2024/0020','Depreciation – Apr 2024','Jurnal Umum','2024-04-30',500000,500000,v_user_id)
  returning id into v_jv20;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv20,'JV/2024/0020','515','Expense',500000,0,     '2024-04-30',v_user_id),
    (v_company_id,v_jv20,'JV/2024/0020','122','Assets', 0,     500000,'2024-04-30',v_user_id);

  -- JV/2024/0021 – Service Revenue Jun (Budi Santoso)
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, pay_to_recd_from, created_by)
  values
    (v_company_id,'JV/2024/0021','Service Revenue – Jun 2024','Jurnal Umum','2024-06-10',32000000,32000000,'Budi Santoso',v_user_id)
  returning id into v_jv21;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,party_type,party,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv21,'JV/2024/0021','1121','Assets','Customer','Budi Santoso',32000000,0,       '2024-06-10',v_user_id),
    (v_company_id,v_jv21,'JV/2024/0021','410', 'Income','Customer','Budi Santoso',0,       32000000,'2024-06-10',v_user_id);

  -- JV/2024/0022 – Salary Jun
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, created_by)
  values
    (v_company_id,'JV/2024/0022','Salary Payment – Jun 2024','Jurnal Umum','2024-06-30',8000000,8000000,v_user_id)
  returning id into v_jv22;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv22,'JV/2024/0022','511', 'Expense',8000000,0,      '2024-06-30',v_user_id),
    (v_company_id,v_jv22,'JV/2024/0022','1121','Assets', 0,      8000000,'2024-06-30',v_user_id);

  -- JV/2024/0023 – Utilities Jun
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, created_by)
  values
    (v_company_id,'JV/2024/0023','Utilities – Jun 2024','Jurnal Umum','2024-06-30',1500000,1500000,v_user_id)
  returning id into v_jv23;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv23,'JV/2024/0023','513', 'Expense',1500000,0,      '2024-06-30',v_user_id),
    (v_company_id,v_jv23,'JV/2024/0023','1121','Assets', 0,      1500000,'2024-06-30',v_user_id);

  -- JV/2024/0024 – Depreciation May
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, created_by)
  values
    (v_company_id,'JV/2024/0024','Depreciation – May 2024','Jurnal Umum','2024-05-31',500000,500000,v_user_id)
  returning id into v_jv24;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv24,'JV/2024/0024','515','Expense',500000,0,     '2024-05-31',v_user_id),
    (v_company_id,v_jv24,'JV/2024/0024','122','Assets', 0,     500000,'2024-05-31',v_user_id);

  -- JV/2024/0025 – Depreciation Jun
  insert into public.journals
    (company_id, name, title, type, posting_date, total_debit, total_credit, created_by)
  values
    (v_company_id,'JV/2024/0025','Depreciation – Jun 2024','Jurnal Umum','2024-06-30',500000,500000,v_user_id)
  returning id into v_jv25;
  insert into public.journal_entries
    (company_id,journal_id,parent,acc,acc_type,debit,credit,posting_date,created_by)
  values
    (v_company_id,v_jv25,'JV/2024/0025','515','Expense',500000,0,     '2024-06-30',v_user_id),
    (v_company_id,v_jv25,'JV/2024/0025','122','Assets', 0,     500000,'2024-06-30',v_user_id);

  -- suppress unused-variable warnings
  perform v_jv03, v_jv07, v_jv11, v_jv16, v_jv20, v_jv24, v_jv25;

  -- ── 9. Orders ────────────────────────────────────────────
  insert into public.orders
    (company_id, customer_id, name, order_date, total, status, created_by)
  values (v_company_id, v_cust1, 'ORD/2024/001', '2024-02-10', 25000000, 1, v_user_id)
  returning id into v_ord1;

  insert into public.orders
    (company_id, customer_id, name, order_date, total, status, created_by)
  values (v_company_id, v_cust2, 'ORD/2024/002', '2024-03-15', 30000000, 1, v_user_id)
  returning id into v_ord2;

  insert into public.orders
    (company_id, customer_id, name, order_date, total, status, created_by)
  values (v_company_id, v_cust3, 'ORD/2024/003', '2024-04-10', 28000000, 1, v_user_id)
  returning id into v_ord3;

  insert into public.orders
    (company_id, customer_id, name, order_date, total, status, created_by)
  values (v_company_id, v_cust3, 'ORD/2024/004', '2024-05-15', 35000000, 1, v_user_id)
  returning id into v_ord4;

  insert into public.orders
    (company_id, customer_id, name, order_date, total, status, created_by)
  values (v_company_id, v_cust4, 'ORD/2024/005', '2024-06-10', 32000000, 1, v_user_id)
  returning id into v_ord5;

  -- ── 10. Payments ─────────────────────────────────────────
  insert into public.payments
    (company_id, order_id, amount, payment_date, method, created_by)
  values
    (v_company_id, v_ord1, 25000000, '2024-02-10', 'Bank Transfer', v_user_id),
    (v_company_id, v_ord2, 30000000, '2024-03-15', 'Bank Transfer', v_user_id),
    (v_company_id, v_ord3, 28000000, '2024-04-25', 'Bank Transfer', v_user_id),
    (v_company_id, v_ord4, 35000000, '2024-05-15', 'Bank Transfer', v_user_id),
    (v_company_id, v_ord5, 32000000, '2024-06-10', 'Bank Transfer', v_user_id);

  -- ── 11. Fixed Asset ──────────────────────────────────────
  insert into public.assets
    (company_id, name, code, type, acquisition_date, acquisition_value,
     useful_life_years, depreciation_rate, current_value, created_by)
  values (
    v_company_id,
    'Office Equipment',
    'FA/2024/001',
    'Equipment',
    '2024-01-15',
    30000000,
    5,
    20.00,
    27000000,   -- 30M - (6 months × 500K)
    v_user_id
  );

  -- ── 12. Equity Changes ───────────────────────────────────
  -- Net Income H1 2024: Revenue 150M – Expenses 50.5M = 99.5M
  insert into public.equity_changes
    (company_id, period_name, opening, profit, prive, closing, posting_date, created_by)
  values (
    v_company_id,
    'H1 2024',
    0,
    99500000,
    5000000,
    94500000,
    '2024-06-30',
    v_user_id
  );

  raise notice 'Seed applied successfully. Login: demo@tjip.my.id / demo@demo1';

end $$;
