-- Optional dozen selling per product + saved custom units.
alter table public.items add column if not exists allow_dozen boolean not null default false;
update public.items set allow_dozen = true where unit = 'doz' or dozen_price is not null;

create table if not exists public.units (
  name text primary key,
  qty  integer not null default 1,
  created_at timestamptz not null default now()
);
alter table public.units enable row level security;
drop policy if exists staff_all on public.units;
create policy staff_all on public.units for all to authenticated using (true) with check (true);
grant select, insert, update, delete on public.units to authenticated;
alter table public.items add column if not exists stock_unit text not null default '';
