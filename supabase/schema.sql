-- AV Cosmetics & Bangle Store: database design for Supabase (Postgres).
-- Run once in Supabase > SQL Editor. Safe to run again.

-- ---------- Tables ----------
create table if not exists public.categories (
  name text primary key
);

create table if not exists public.items (
  id          text primary key,
  name        text not null,
  name_hi     text not null default '',
  category    text not null default '',
  price       numeric(12,2) not null default 0,      -- price per piece
  dozen_price numeric(12,2),                         -- null = 12 x price
  unit        text not null default 'pc' check (unit in ('pc','doz','custom')),
  unit_name   text not null default '',                 -- custom unit, e.g. Set
  unit_qty    integer not null default 1,                -- pieces in one custom unit
  unit_price  numeric(12,2),                             -- null = piece price x unit_qty
  gst         numeric(5,2) not null default 0,
  hsn         text not null default '',
  stock       integer,                               -- pieces; null = not tracked
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.clients (
  id         text primary key,
  name       text not null,
  name_hi    text not null default '',
  phone      text not null default '',
  address    text not null default '',
  created_at timestamptz not null default now()
);
create unique index if not exists clients_phone_uq on public.clients (phone) where phone <> '';

create table if not exists public.bills (
  id             text primary key,
  no             text not null unique,
  date           text not null,                      -- YYYY-MM-DD
  time           text not null,                      -- HH:MM
  client_id      text references public.clients(id) on delete set null,
  client_name    text not null,
  client_name_hi text not null default '',
  client_phone   text not null default '',
  lines          jsonb not null default '[]'::jsonb, -- items as they were sold (name, price, unit, qty)
  subtotal       numeric(12,2) not null default 0,
  discount       numeric(12,2) not null default 0,
  tax            numeric(12,2) not null default 0,
  total          numeric(12,2) not null,
  pay            text not null default 'cash',
  notes          text not null default '',
  status         text not null default 'paid' check (status in ('paid','cancelled')),
  created_at     timestamptz not null default now()
);
create index if not exists bills_client_idx on public.bills (client_id);
create index if not exists bills_date_idx on public.bills (date);

create table if not exists public.payments (
  id         text primary key,
  bill_id    text not null references public.bills(id) on delete cascade,
  date       text not null,
  time       text not null,
  amount     numeric(12,2) not null check (amount > 0),
  mode       text not null default 'cash',
  created_at timestamptz not null default now()
);
create index if not exists payments_bill_idx on public.payments (bill_id);

create sequence if not exists public.bill_no_seq;

-- ---------- Security: only signed-in staff ----------
alter table public.categories enable row level security;
alter table public.items      enable row level security;
alter table public.clients    enable row level security;
alter table public.bills      enable row level security;
alter table public.payments   enable row level security;

drop policy if exists staff_all on public.categories;
drop policy if exists staff_all on public.items;
drop policy if exists staff_all on public.clients;
drop policy if exists staff_read on public.bills;
drop policy if exists staff_read on public.payments;
create policy staff_all  on public.categories for all    to authenticated using (true) with check (true);
create policy staff_all  on public.items      for all    to authenticated using (true) with check (true);
create policy staff_all  on public.clients    for all    to authenticated using (true) with check (true);
create policy staff_read on public.bills      for select to authenticated using (true);
create policy staff_read on public.payments   for select to authenticated using (true);

revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.categories, public.items, public.clients to authenticated;
grant select on public.bills, public.payments to authenticated;   -- bills and payments change only through the functions below

-- ---------- Functions (bill numbers, stock and payments are handled safely in one step) ----------
create or replace function public.create_bill(b jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_no text; v_id text := b->>'id'; p jsonb; l jsonb;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  v_no := 'INV-' || lpad(nextval('public.bill_no_seq')::text, 4, '0');
  insert into bills(id, no, date, time, client_id, client_name, client_name_hi, client_phone, lines,
                    subtotal, discount, tax, total, pay, notes, status)
  values (v_id, v_no, b->>'date', b->>'time',
          (select c.id from clients c where c.id = nullif(b->>'clientId','')),
          coalesce(b->>'clientName','Walk-in customer'), coalesce(b->>'clientNameHi',''), coalesce(b->>'clientPhone',''),
          coalesce(b->'lines','[]'::jsonb),
          coalesce((b->>'subtotal')::numeric,0), coalesce((b->>'discount')::numeric,0), coalesce((b->>'tax')::numeric,0),
          (b->>'total')::numeric, coalesce(b->>'pay','cash'), coalesce(b->>'notes',''), 'paid');
  for p in select jsonb_array_elements(coalesce(b->'payments','[]'::jsonb)) loop
    if (p->>'amount')::numeric > 0 then
      insert into payments(id, bill_id, date, time, amount, mode)
      values (p->>'id', v_id, p->>'date', p->>'time', (p->>'amount')::numeric, coalesce(p->>'mode','cash'));
    end if;
  end loop;
  for l in select jsonb_array_elements(coalesce(b->'lines','[]'::jsonb)) loop
    update items
       set stock = greatest(0, stock - round((l->>'qty')::numeric * coalesce((l->>'factor')::numeric,1))::int)
     where id = l->>'itemId' and stock is not null;
  end loop;
  return jsonb_build_object('no', v_no);
end $$;

create or replace function public.add_payment(p_bill text, p_amount numeric, p_mode text, p_date text, p_time text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t numeric; st text; paid numeric; pid text := substr(md5(random()::text || clock_timestamp()::text), 1, 10);
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Amount must be more than zero'; end if;
  select total, status into t, st from bills where id = p_bill for update;
  if not found then raise exception 'Bill not found'; end if;
  if st = 'cancelled' then raise exception 'Bill is cancelled'; end if;
  select coalesce(sum(amount),0) into paid from payments where bill_id = p_bill;
  if p_amount > (t - paid) + 0.004 then raise exception 'More than the balance due'; end if;
  insert into payments(id, bill_id, date, time, amount, mode)
  values (pid, p_bill, p_date, p_time, round(p_amount,2), coalesce(p_mode,'cash'));
  return jsonb_build_object('id', pid);
end $$;

create or replace function public.receive_client_payment(p_client text, p_amount numeric, p_mode text, p_date text, p_time text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r record; paid numeric; due numeric; total_due numeric := 0; left_amt numeric := p_amount; x numeric;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Amount must be more than zero'; end if;
  for r in select id, total from bills where client_id = p_client and status <> 'cancelled' order by date, time, created_at for update loop
    select coalesce(sum(amount),0) into paid from payments where bill_id = r.id;
    total_due := total_due + greatest(r.total - paid, 0);
  end loop;
  if p_amount > total_due + 0.004 then raise exception 'More than the balance due'; end if;
  for r in select id, total from bills where client_id = p_client and status <> 'cancelled' order by date, time, created_at loop
    exit when left_amt <= 0;
    select coalesce(sum(amount),0) into paid from payments where bill_id = r.id;
    due := r.total - paid;
    if due > 0 then
      x := least(left_amt, due);
      insert into payments(id, bill_id, date, time, amount, mode)
      values (substr(md5(random()::text || clock_timestamp()::text || r.id), 1, 10), r.id, p_date, p_time, round(x,2), coalesce(p_mode,'cash'));
      left_amt := round(left_amt - x, 2);
    end if;
  end loop;
  return jsonb_build_object('applied', round(p_amount - left_amt, 2));
end $$;

create or replace function public.cancel_bill(p_bill text) returns void
language plpgsql security definer set search_path = public as $$
declare st text; lns jsonb; l jsonb;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  select status, lines into st, lns from bills where id = p_bill for update;
  if not found then raise exception 'Bill not found'; end if;
  if st = 'cancelled' then return; end if;
  update bills set status = 'cancelled' where id = p_bill;
  for l in select jsonb_array_elements(lns) loop
    update items
       set stock = stock + round((l->>'qty')::numeric * coalesce((l->>'factor')::numeric,1))::int
     where id = l->>'itemId' and stock is not null;
  end loop;
end $$;

-- One-time import of a backup made with the app (Backup > Copy backup)
create or replace function public.import_backup(d jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare i jsonb; c jsonb; b jsonb; p jsonb; n_items int := 0; n_clients int := 0; n_bills int := 0;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  insert into categories(name) select jsonb_array_elements_text(coalesce(d->'categories','[]'::jsonb)) on conflict do nothing;
  for i in select jsonb_array_elements(coalesce(d->'items','[]'::jsonb)) loop
    insert into items(id, name, name_hi, category, price, dozen_price, unit, unit_name, unit_qty, unit_price, gst, hsn, stock, active)
    values (i->>'id', i->>'name', coalesce(i->>'nameHi',''), coalesce(i->>'category',''), coalesce((i->>'price')::numeric,0),
            nullif(i->>'dozenPrice','')::numeric,
            case when i->>'unit' in ('doz','custom') then i->>'unit' else 'pc' end,
            coalesce(i->>'unitName',''), greatest(coalesce(nullif(i->>'unitQty','')::int,1),1), nullif(i->>'unitPrice','')::numeric,
            coalesce((i->>'gst')::numeric,0), coalesce(i->>'hsn',''), nullif(i->>'stock','')::int, coalesce((i->>'active')::boolean,true))
    on conflict do nothing;
    if coalesce(i->>'category','') <> '' then insert into categories(name) values (i->>'category') on conflict do nothing; end if;
    n_items := n_items + 1;
  end loop;
  for c in select jsonb_array_elements(coalesce(d->'clients','[]'::jsonb)) loop
    insert into clients(id, name, name_hi, phone, address)
    values (c->>'id', c->>'name', coalesce(c->>'nameHi',''), coalesce(c->>'phone',''), coalesce(c->>'address',''))
    on conflict do nothing;
    n_clients := n_clients + 1;
  end loop;
  for b in select jsonb_array_elements(coalesce(d->'bills','[]'::jsonb)) loop
    insert into bills(id, no, date, time, client_id, client_name, client_name_hi, client_phone, lines,
                      subtotal, discount, tax, total, pay, notes, status)
    values (b->>'id', b->>'no', b->>'date', b->>'time', (select cl.id from clients cl where cl.id = nullif(b->>'clientId','')),
            coalesce(b->>'clientName','Walk-in customer'), coalesce(b->>'clientNameHi',''), coalesce(b->>'clientPhone',''),
            coalesce(b->'lines','[]'::jsonb), coalesce((b->>'subtotal')::numeric,0), coalesce((b->>'discount')::numeric,0),
            coalesce((b->>'tax')::numeric,0), (b->>'total')::numeric, coalesce(b->>'pay','cash'), coalesce(b->>'notes',''),
            case when b->>'status' = 'cancelled' then 'cancelled' else 'paid' end)
    on conflict do nothing;
    for p in select jsonb_array_elements(coalesce(b->'payments','[]'::jsonb)) loop
      if (p->>'amount')::numeric > 0 then
        insert into payments(id, bill_id, date, time, amount, mode)
        values (p->>'id', b->>'id', p->>'date', p->>'time', (p->>'amount')::numeric, coalesce(p->>'mode','cash'))
        on conflict do nothing;
      end if;
    end loop;
    n_bills := n_bills + 1;
  end loop;
  perform setval('public.bill_no_seq', coalesce((select max(substring(no from '[0-9]+')::int) from bills), 0) + 1, false);
  return jsonb_build_object('items', n_items, 'clients', n_clients, 'bills', n_bills);
end $$;

revoke execute on all functions in schema public from public, anon;
grant execute on function public.create_bill(jsonb) to authenticated;
grant execute on function public.add_payment(text, numeric, text, text, text) to authenticated;
grant execute on function public.receive_client_payment(text, numeric, text, text, text) to authenticated;
grant execute on function public.cancel_bill(text) to authenticated;
grant execute on function public.import_backup(jsonb) to authenticated;

-- ---------- Bin (added later; see migration-bin.sql) ----------
-- items, clients and categories have a deleted_at column; purge_bin() removes rows older than 30 days.
