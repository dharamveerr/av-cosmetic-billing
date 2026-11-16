-- Daily shop expenses (soft delete to the Bin like everything else). Safe to run again.
create table if not exists public.expenses (
  id         text primary key,
  date       text not null,
  category   text not null default 'Other',
  amount     numeric(12,2) not null check (amount > 0),
  mode       text not null default 'cash',
  note       text not null default '',
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists expenses_date_idx on public.expenses (date);
alter table public.expenses enable row level security;
drop policy if exists staff_all on public.expenses;
create policy staff_all on public.expenses for all to authenticated using (true) with check (true);
grant select, insert, update, delete on public.expenses to authenticated;

create or replace function public.purge_bin() returns integer
language plpgsql security definer set search_path = public as $$
declare n integer := 0; k integer;
begin
  delete from items      where deleted_at is not null and deleted_at < now() - interval '30 days'; get diagnostics k = row_count; n := n + k;
  delete from clients    where deleted_at is not null and deleted_at < now() - interval '30 days'; get diagnostics k = row_count; n := n + k;
  delete from categories where deleted_at is not null and deleted_at < now() - interval '30 days'; get diagnostics k = row_count; n := n + k;
  delete from bills      where deleted_at is not null and deleted_at < now() - interval '30 days'; get diagnostics k = row_count; n := n + k;
  delete from expenses   where deleted_at is not null and deleted_at < now() - interval '30 days'; get diagnostics k = row_count; n := n + k;
  return n;
end $$;
revoke execute on function public.purge_bin() from public, anon;
grant execute on function public.purge_bin() to authenticated;
