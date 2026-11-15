-- Bin (recycle bin): deleted items, customers and categories are kept for 30 days, then removed. Safe to run again.
alter table public.items      add column if not exists deleted_at timestamptz;
alter table public.clients    add column if not exists deleted_at timestamptz;
alter table public.categories add column if not exists deleted_at timestamptz;

-- a phone number can be used again once its customer is in the Bin
drop index if exists public.clients_phone_uq;
create unique index clients_phone_uq on public.clients (phone) where phone <> '' and deleted_at is null;

create or replace function public.purge_bin() returns integer
language plpgsql security definer set search_path = public as $$
declare n integer := 0; k integer;
begin
  delete from items      where deleted_at is not null and deleted_at < now() - interval '30 days'; get diagnostics k = row_count; n := n + k;
  delete from clients    where deleted_at is not null and deleted_at < now() - interval '30 days'; get diagnostics k = row_count; n := n + k;
  delete from categories where deleted_at is not null and deleted_at < now() - interval '30 days'; get diagnostics k = row_count; n := n + k;
  return n;
end $$;
revoke execute on function public.purge_bin() from public, anon;
grant execute on function public.purge_bin() to authenticated;

-- run the clean-up every night at 03:15 (the app also runs it each time someone signs in)
do $$ begin
  create extension if not exists pg_cron;
  perform cron.unschedule(jobid) from cron.job where jobname = 'purge-bin';
  perform cron.schedule('purge-bin', '15 3 * * *', 'select public.purge_bin()');
exception when others then
  raise notice 'pg_cron not available (%). The app still clears the Bin when someone signs in.', sqlerrm;
end $$;
