-- Supabase Auth creates a session immediately. E-mail ownership is tracked
-- separately by the application so the candidate can verify the address later.

create table public.email_verification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index email_verification_tokens_user_idx
  on public.email_verification_tokens(user_id, created_at desc);

create index email_verification_tokens_expiry_idx
  on public.email_verification_tokens(expires_at)
  where used_at is null;

alter table public.email_verification_tokens enable row level security;

-- Tokens are available only through the narrowly scoped SECURITY DEFINER RPCs.
revoke all on public.email_verification_tokens from anon, authenticated;

-- A candidate may edit their display name, but never system-managed fields such
-- as role or e-mail verification state through the generic profiles endpoint.
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

create or replace function public.issue_email_verification_token(p_token_hash text)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_last_created_at timestamptz;
  v_expires_at timestamptz := now() + interval '24 hours';
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  if p_token_hash is null or p_token_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid_verification_token' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.profiles
    where id = v_user_id and email_verified_at is not null
  ) then
    raise exception 'email_already_verified' using errcode = '22023';
  end if;

  select created_at into v_last_created_at
  from public.email_verification_tokens
  where user_id = v_user_id
  order by created_at desc
  limit 1;

  if v_last_created_at is not null and v_last_created_at > now() - interval '1 minute' then
    raise exception 'verification_rate_limit' using errcode = '22023';
  end if;

  delete from public.email_verification_tokens where user_id = v_user_id;

  insert into public.email_verification_tokens (user_id, token_hash, expires_at)
  values (v_user_id, p_token_hash, v_expires_at);

  return v_expires_at;
end;
$$;

revoke all on function public.issue_email_verification_token(text) from public;
grant execute on function public.issue_email_verification_token(text) to authenticated;

create or replace function public.revoke_email_verification_token(p_token_hash text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.email_verification_tokens
  where user_id = auth.uid() and token_hash = p_token_hash;
$$;

revoke all on function public.revoke_email_verification_token(text) from public;
grant execute on function public.revoke_email_verification_token(text) to authenticated;

create or replace function public.verify_email_token(p_token_hash text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  if p_token_hash is null or p_token_hash !~ '^[a-f0-9]{64}$' then
    return false;
  end if;

  update public.email_verification_tokens
  set used_at = now()
  where token_hash = p_token_hash
    and used_at is null
    and expires_at > now()
  returning user_id into v_user_id;

  if v_user_id is null then
    return false;
  end if;

  update public.profiles
  set email_verified_at = coalesce(email_verified_at, now()),
      updated_at = now()
  where id = v_user_id;

  insert into public.audit_logs (actor_user_id, action, target_type, target_id)
  values (v_user_id, 'email.verified', 'profile', v_user_id::text);

  return true;
end;
$$;

revoke all on function public.verify_email_token(text) from public;
grant execute on function public.verify_email_token(text) to anon, authenticated;

-- With Supabase confirmations disabled, auth.users.email_confirmed_at is filled
-- automatically. It must not leak into the application's independent status.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email_verified_at)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), null);
  return new;
end;
$$;
