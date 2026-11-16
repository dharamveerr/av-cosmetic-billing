-- Extra phone numbers per customer: [{"t":"WA"|"Mob","n":"9876543210"}]. The main number stays in the phone column (WhatsApp).
alter table public.clients add column if not exists phones jsonb not null default '[]'::jsonb;
