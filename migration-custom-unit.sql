-- Custom ("Manual") selling unit for items, e.g. Set = 6 pieces. Safe to run again.
alter table public.items drop constraint if exists items_unit_check;
alter table public.items add constraint items_unit_check check (unit in ('pc','doz','custom'));
alter table public.items add column if not exists unit_name  text not null default '';
alter table public.items add column if not exists unit_qty   integer not null default 1;
alter table public.items add column if not exists unit_price numeric(12,2);

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

revoke execute on function public.import_backup(jsonb) from public, anon;
grant execute on function public.import_backup(jsonb) to authenticated;
