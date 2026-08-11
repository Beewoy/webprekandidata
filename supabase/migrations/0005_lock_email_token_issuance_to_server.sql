-- Token issuance must be server-only. Otherwise an authenticated browser could
-- create a known token and mark its own address as verified without opening mail.

create or replace function public.issue_email_verification_token(
  p_user_id uuid,
  p_token_hash text
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_last_created_at timestamptz;
  v_expires_at timestamptz := now() + interval '24 hours';
begin
  if p_user_id is null or not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'profile_not_found' using errcode = '22023';
  end if;

  if p_token_hash is null or p_token_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid_verification_token' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.profiles
    where id = p_user_id and email_verified_at is not null
  ) then
    raise exception 'email_already_verified' using errcode = '22023';
  end if;

  select created_at into v_last_created_at
  from public.email_verification_tokens
  where user_id = p_user_id
  order by created_at desc
  limit 1;

  if v_last_created_at is not null and v_last_created_at > now() - interval '1 minute' then
    raise exception 'verification_rate_limit' using errcode = '22023';
  end if;

  delete from public.email_verification_tokens where user_id = p_user_id;

  insert into public.email_verification_tokens (user_id, token_hash, expires_at)
  values (p_user_id, p_token_hash, v_expires_at);

  return v_expires_at;
end;
$$;

revoke all on function public.issue_email_verification_token(text) from public, anon, authenticated;
drop function public.issue_email_verification_token(text);
revoke all on function public.issue_email_verification_token(uuid, text) from public, anon, authenticated;
grant execute on function public.issue_email_verification_token(uuid, text) to service_role;

create or replace function public.revoke_email_verification_token(
  p_user_id uuid,
  p_token_hash text
)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.email_verification_tokens
  where user_id = p_user_id and token_hash = p_token_hash;
$$;

revoke all on function public.revoke_email_verification_token(text) from public, anon, authenticated;
drop function public.revoke_email_verification_token(text);
revoke all on function public.revoke_email_verification_token(uuid, text) from public, anon, authenticated;
grant execute on function public.revoke_email_verification_token(uuid, text) to service_role;
