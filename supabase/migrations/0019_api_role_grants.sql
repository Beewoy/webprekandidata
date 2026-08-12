-- Local Supabase no longer auto-grants API roles on migrated tables.
-- RLS still enforces row access; these grants only allow role-level table access.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated, service_role;
grant select on all tables in schema public to anon;

grant usage, select on all sequences in schema public to anon, authenticated, service_role;

-- Restrictions preserved from earlier migrations (API roles only; service_role keeps full access).
revoke all on public.payment_events from anon, authenticated;
revoke all on public.email_verification_tokens from anon, authenticated;

revoke insert, update, delete on public.audit_logs from anon, authenticated;
grant select on public.audit_logs to authenticated;

revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;
