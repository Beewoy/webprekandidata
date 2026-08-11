-- Platform operator admin: audit read grant, admin_hold, RPCs.

alter table public.sites
  add column if not exists admin_hold boolean not null default false,
  add column if not exists admin_hold_at timestamptz,
  add column if not exists admin_hold_by uuid references public.profiles(id) on delete set null;

create index if not exists audit_created_idx on public.audit_logs (created_at desc);
create index if not exists sites_admin_hold_idx on public.sites (admin_hold) where admin_hold and deleted_at is null;

grant select on public.audit_logs to authenticated;

create or replace function public.set_candidate_site_visibility(
  p_site_id uuid,
  p_visible boolean
)
returns public.site_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_status public.site_status;
  publication_id uuid;
  hold boolean;
begin
  if not public.owns_site(p_site_id) then
    raise exception 'site_access_denied' using errcode = '42501';
  end if;

  select current_publication_id, admin_hold into publication_id, hold
  from public.sites
  where id = p_site_id and owner_user_id = auth.uid() and deleted_at is null
  for update;

  if publication_id is null then
    raise exception 'publication_required' using errcode = '22023';
  end if;

  if p_visible and hold then
    raise exception 'admin_hold_active' using errcode = '42501';
  end if;

  if p_visible and not public.has_publish_entitlement(p_site_id) then
    raise exception 'publish_entitlement_required' using errcode = '42501';
  end if;

  next_status := case when p_visible then 'published'::public.site_status else 'suspended'::public.site_status end;

  update public.sites
  set status = next_status, updated_at = now()
  where id = p_site_id;

  insert into public.audit_logs (actor_user_id, site_id, action, target_type, target_id, metadata)
  values (
    auth.uid(),
    p_site_id,
    case when p_visible then 'site_resumed' else 'site_suspended' end,
    'site',
    p_site_id::text,
    jsonb_build_object('publication_id', publication_id)
  );

  return next_status;
end;
$$;

create or replace function public.admin_set_site_hold(
  p_site_id uuid,
  p_hold boolean,
  p_reason text,
  p_category text,
  p_scope text,
  p_duration_days integer,
  p_candidate_message text
)
returns public.site_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_status public.site_status;
  publication_id uuid;
  current_hold boolean;
  reason text := trim(coalesce(p_reason, ''));
  category text := trim(coalesce(p_category, ''));
  scope text := trim(coalesce(p_scope, ''));
  message text := trim(coalesce(p_candidate_message, ''));
begin
  if not public.is_platform_admin() then
    raise exception 'admin_access_denied' using errcode = '42501';
  end if;

  if char_length(reason) < 8 or char_length(reason) > 2000 then
    raise exception 'invalid_reason' using errcode = '22023';
  end if;
  if category not in ('illegal_content', 'terms_violation', 'safety', 'impersonation', 'other') then
    raise exception 'invalid_category' using errcode = '22023';
  end if;
  if scope not in ('whole_site', 'specific_content') then
    raise exception 'invalid_scope' using errcode = '22023';
  end if;
  if p_hold and (p_duration_days is null or p_duration_days < 1 or p_duration_days > 3650) then
    raise exception 'invalid_duration' using errcode = '22023';
  end if;
  if not p_hold and p_duration_days is not null and (p_duration_days < 1 or p_duration_days > 3650) then
    raise exception 'invalid_duration' using errcode = '22023';
  end if;
  if char_length(message) < 8 or char_length(message) > 4000 then
    raise exception 'invalid_candidate_message' using errcode = '22023';
  end if;

  select current_publication_id, admin_hold, status
  into publication_id, current_hold, next_status
  from public.sites
  where id = p_site_id and deleted_at is null
  for update;

  if not found then
    raise exception 'site_not_found' using errcode = 'P0002';
  end if;

  if p_hold then
    update public.sites
    set
      admin_hold = true,
      admin_hold_at = now(),
      admin_hold_by = auth.uid(),
      status = 'suspended'::public.site_status,
      updated_at = now()
    where id = p_site_id;
    next_status := 'suspended'::public.site_status;
  else
    update public.sites
    set
      admin_hold = false,
      admin_hold_at = null,
      admin_hold_by = null,
      status = case
        when publication_id is not null then 'published'::public.site_status
        else status
      end,
      updated_at = now()
    where id = p_site_id
    returning status into next_status;
  end if;

  insert into public.audit_logs (actor_user_id, site_id, action, target_type, target_id, metadata)
  values (
    auth.uid(),
    p_site_id,
    case when p_hold then 'admin_site_suspended' else 'admin_site_released' end,
    'site',
    p_site_id::text,
    jsonb_build_object(
      'reason', reason,
      'category', category,
      'scope', scope,
      'duration_days', p_duration_days,
      'candidate_message', message,
      'publication_id', publication_id,
      'previous_admin_hold', current_hold
    )
  );

  return next_status;
end;
$$;

create or replace function public.admin_search_users(
  p_query text default '',
  p_limit integer default 50
)
returns table (
  id uuid,
  full_name text,
  email text,
  role public.user_role,
  email_verified_at timestamptz,
  created_at timestamptz,
  site_count bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  q text := trim(coalesce(p_query, ''));
  lim integer := least(greatest(coalesce(p_limit, 50), 1), 100);
begin
  if not public.is_platform_admin() then
    raise exception 'admin_access_denied' using errcode = '42501';
  end if;

  return query
  select
    p.id,
    p.full_name,
    u.email::text,
    p.role,
    p.email_verified_at,
    p.created_at,
    (
      select count(*)::bigint
      from public.sites s
      where s.owner_user_id = p.id and s.deleted_at is null
    ) as site_count
  from public.profiles p
  join auth.users u on u.id = p.id
  where
    q = ''
    or p.full_name ilike '%' || q || '%'
    or u.email ilike '%' || q || '%'
    or p.id::text = q
  order by p.created_at desc
  limit lim;
end;
$$;

create or replace function public.admin_dashboard_metrics()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if not public.is_platform_admin() then
    raise exception 'admin_access_denied' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'registrations', (select count(*)::int from public.profiles),
    'sites_by_status', coalesce((
      select jsonb_object_agg(status, cnt)
      from (
        select status::text as status, count(*)::int as cnt
        from public.sites
        where deleted_at is null
        group by status
      ) s
    ), '{}'::jsonb),
    'admin_holds', (
      select count(*)::int from public.sites where deleted_at is null and admin_hold
    ),
    'orders_by_status', coalesce((
      select jsonb_object_agg(status, cnt)
      from (
        select status::text as status, count(*)::int as cnt
        from public.orders
        group by status
      ) o
    ), '{}'::jsonb),
    'ai_failed', (
      select count(*)::int from public.ai_generations where status = 'failed'
    ),
    'ai_completed', (
      select count(*)::int from public.ai_generations where status = 'completed'
    ),
    'recent_audit', coalesce((
      select jsonb_agg(row_to_json(a) order by a.created_at desc)
      from (
        select
          id,
          actor_user_id,
          site_id,
          action,
          target_type,
          target_id,
          metadata,
          created_at
        from public.audit_logs
        order by created_at desc
        limit 15
      ) a
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_set_site_hold(uuid, boolean, text, text, text, integer, text) from public;
revoke all on function public.admin_search_users(text, integer) from public;
revoke all on function public.admin_dashboard_metrics() from public;

grant execute on function public.admin_set_site_hold(uuid, boolean, text, text, text, integer, text) to authenticated;
grant execute on function public.admin_search_users(text, integer) to authenticated;
grant execute on function public.admin_dashboard_metrics() to authenticated;
