-- Security: only signed-in staff may run the database functions.
-- Newly created functions are callable by everyone (PUBLIC, which includes the anonymous key) by default.
-- This removes that access from the functions added in the Bin migrations. Safe to run again.
revoke execute on function public.delete_bill(text)                                                  from public, anon;
revoke execute on function public.restore_bill(text)                                                 from public, anon;
revoke execute on function public.purge_bill(text)                                                   from public, anon;
revoke execute on function public.receive_client_payment(text, numeric, text, text, text)            from public, anon;
revoke execute on function public.purge_bin()                                                        from public, anon;
grant  execute on function public.delete_bill(text)                                                  to authenticated;
grant  execute on function public.restore_bill(text)                                                 to authenticated;
grant  execute on function public.purge_bill(text)                                                   to authenticated;
grant  execute on function public.receive_client_payment(text, numeric, text, text, text)            to authenticated;
grant  execute on function public.purge_bin()                                                        to authenticated;
