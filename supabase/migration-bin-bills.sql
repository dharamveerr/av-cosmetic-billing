-- Invoices go to the Bin (30 days) instead of being removed. Safe to run again.
alter table public.bills add column if not exists deleted_at timestamptz;

create or replace function public.delete_bill(p_bill text) returns void
language plpgsql security definer set search_path = public as $$
declare st text; lns jsonb; l jsonb; dl timestamptz;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  select status, lines, deleted_at into st, lns, dl from bills where id = p_bill for update;
  if not found or dl is not null then return; end if;
  if st <> 'cancelled' then
    for l in select jsonb_array_elements(lns) loop
      update items set stock = stock + round((l->>'qty')::numeric * coalesce((l->>'factor')::numeric,1))::int
       where id = l->>'itemId' and stock is not null;
    end loop;
  end if;
  update bills set deleted_at = now() where id = p_bill;
end $$;

create or replace function public.restore_bill(p_bill text) returns void
language plpgsql security definer set search_path = public as $$
declare st text; lns jsonb; l jsonb; dl timestamptz;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  select status, lines, deleted_at into st, lns, dl from bills where id = p_bill for update;
  if not found or dl is null then return; end if;
  if st <> 'cancelled' then
    for l in select jsonb_array_elements(lns) loop
      update items set stock = greatest(stock - round((l->>'qty')::numeric * coalesce((l->>'factor')::numeric,1))::int, 0)
       where id = l->>'itemId' and stock is not null;
    end loop;
  end if;
  update bills set deleted_at = null where id = p_bill;
end $$;

create or replace function public.purge_bill(p_bill text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  delete from bills where id = p_bill and deleted_at is not null;
end $$;

create or replace function public.purge_bin() returns integer
language plpgsql security definer set search_path = public as $$
declare n integer := 0; k integer;
begin
  delete from items      where deleted_at is not null and deleted_at < now() - interval '30 days'; get diagnostics k = row_count; n := n + k;
  delete from clients    where deleted_at is not null and deleted_at < now() - interval '30 days'; get diagnostics k = row_count; n := n + k;
  delete from categories where deleted_at is not null and deleted_at < now() - interval '30 days'; get diagnostics k = row_count; n := n + k;
  delete from bills      where deleted_at is not null and deleted_at < now() - interval '30 days'; get diagnostics k = row_count; n := n + k;
  return n;
end $$;

-- customer payments must skip invoices that are in the Bin
create or replace function public.receive_client_payment(p_client text, p_amount numeric, p_mode text, p_date text, p_time text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r record; paid numeric; due numeric; total_due numeric := 0; left_amt numeric := p_amount; x numeric;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Amount must be more than zero'; end if;
  for r in select id, total from bills where client_id = p_client and status <> 'cancelled' and deleted_at is null order by date, time, created_at for update loop
    select coalesce(sum(amount),0) into paid from payments where bill_id = r.id;
    total_due := total_due + greatest(r.total - paid, 0);
  end loop;
  if p_amount > total_due + 0.004 then raise exception 'More than the balance due'; end if;
  for r in select id, total from bills where client_id = p_client and status <> 'cancelled' and deleted_at is null order by date, time, created_at loop
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

grant execute on function public.delete_bill(text) to authenticated;
grant execute on function public.restore_bill(text) to authenticated;
grant execute on function public.purge_bill(text) to authenticated;
revoke execute on function public.purge_bin() from public, anon;
grant execute on function public.purge_bin() to authenticated;
