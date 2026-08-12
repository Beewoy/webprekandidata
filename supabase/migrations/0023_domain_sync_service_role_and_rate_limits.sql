-- Harden domain provider sync: only service_role may set domain status (incl. active).
-- Authenticated clients must not call sync_domain_provider_state via PostgREST.
-- Also adds DB-backed rate_limit_buckets for serverless-safe abuse limits.

revoke all on function public.sync_domain_provider_state(uuid, text, jsonb, jsonb, timestamptz, boolean) from public;
revoke all on function public.sync_domain_provider_state(uuid, text, jsonb, jsonb, timestamptz, boolean) from anon;
revoke all on function public.sync_domain_provider_state(uuid, text, jsonb, jsonb, timestamptz, boolean) from authenticated;
grant execute on function public.sync_domain_provider_state(uuid, text, jsonb, jsonb, timestamptz, boolean) to service_role;

create table if not exists public.rate_limit_buckets (
  bucket_key text primary key,
  window_started_at timestamptz not null,
  hit_count integer not null check (hit_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.rate_limit_buckets enable row level security;

revoke all on table public.rate_limit_buckets from public, anon, authenticated;

create or replace function public.consume_rate_limit(
  p_bucket_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_window timestamptz;
  current_hits integer;
  window_start timestamptz := now() - make_interval(secs => greatest(p_window_seconds, 1));
begin
  if p_bucket_key is null or length(trim(p_bucket_key)) = 0 then
    raise exception 'invalid_rate_limit_bucket' using errcode = '22023';
  end if;
  if p_limit is null or p_limit < 1 then
    raise exception 'invalid_rate_limit' using errcode = '22023';
  end if;
  if p_window_seconds is null or p_window_seconds < 1 then
    raise exception 'invalid_rate_window' using errcode = '22023';
  end if;

  select window_started_at, hit_count
    into current_window, current_hits
  from public.rate_limit_buckets
  where bucket_key = p_bucket_key
  for update;

  if not found then
    insert into public.rate_limit_buckets (bucket_key, window_started_at, hit_count, updated_at)
    values (p_bucket_key, now(), 1, now());
    return true;
  end if;

  if current_window < window_start then
    update public.rate_limit_buckets
    set window_started_at = now(),
        hit_count = 1,
        updated_at = now()
    where bucket_key = p_bucket_key;
    return true;
  end if;

  if current_hits >= p_limit then
    return false;
  end if;

  update public.rate_limit_buckets
  set hit_count = hit_count + 1,
      updated_at = now()
  where bucket_key = p_bucket_key;

  return true;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
