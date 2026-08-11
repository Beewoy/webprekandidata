-- Domain management: platform subdomain is active without DNS; Plus custom domains via RPC.

update public.domains
set status = 'active',
    verified_at = coalesce(verified_at, now()),
    ssl_metadata = case
      when coalesce(ssl_metadata, '{}'::jsonb) = '{}'::jsonb
        then jsonb_build_object('provider', 'platform', 'ready', true, 'verified', true)
      else ssl_metadata
    end
where domain_type = 'subdomain'
  and status = 'pending';

create or replace function public.create_candidate_site(
  p_internal_name text,
  p_candidate_name text,
  p_locality text,
  p_position text,
  p_slug text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_site_id uuid;
  available_slug text := p_slug;
  suffix integer := 1;
begin
  if auth.uid() is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  while exists (select 1 from public.sites where slug = available_slug) loop
    suffix := suffix + 1;
    available_slug := p_slug || '-' || suffix::text;
  end loop;

  insert into public.sites (owner_user_id, internal_name, candidate_name, locality, slug)
  values (auth.uid(), p_internal_name, p_candidate_name, p_locality, available_slug)
  returning id into new_site_id;

  insert into public.site_drafts (site_id, content, updated_by)
  values (
    new_site_id,
    jsonb_build_object(
      'zakladne-udaje', jsonb_build_object(
        'name', p_candidate_name,
        'position', p_position,
        'city', p_locality
      )
    ),
    auth.uid()
  );

  insert into public.domains (
    site_id,
    hostname,
    domain_type,
    is_primary,
    status,
    verified_at,
    ssl_metadata,
    verification_metadata
  )
  values (
    new_site_id,
    available_slug || '.webprekandidata.sk',
    'subdomain',
    true,
    'active',
    now(),
    jsonb_build_object('provider', 'platform', 'ready', true, 'verified', true),
    jsonb_build_object('mode', 'platform_path')
  );

  return new_site_id;
end;
$$;

create or replace function public.resolve_active_custom_domain(p_hostname text)
returns table (site_id uuid, slug text)
language sql
stable
security definer
set search_path = ''
as $$
  select s.id, s.slug
  from public.domains d
  join public.sites s on s.id = d.site_id
  where lower(d.hostname) = lower(trim(p_hostname))
    and d.domain_type = 'custom'
    and d.status = 'active'
    and s.status = 'published'
    and s.deleted_at is null
    and s.current_publication_id is not null
  limit 1;
$$;

create or replace function public.attach_custom_domain(p_site_id uuid, p_hostname text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized text := lower(trim(p_hostname));
  new_domain public.domains%rowtype;
begin
  if not public.owns_site(p_site_id) then
    raise exception 'site_access_denied' using errcode = '42501';
  end if;

  if not public.has_plus_entitlement(p_site_id) then
    raise exception 'plus_entitlement_required' using errcode = '42501';
  end if;

  if normalized is null or normalized = '' or char_length(normalized) > 253 then
    raise exception 'invalid_hostname' using errcode = '22023';
  end if;

  if normalized ~ '[[:space:]/:@]' then
    raise exception 'invalid_hostname' using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.domains
    where site_id = p_site_id
      and domain_type = 'custom'
      and status <> 'removed'
  ) then
    raise exception 'custom_domain_exists' using errcode = '23505';
  end if;

  if exists (
    select 1
    from public.domains
    where lower(hostname) = normalized
      and status <> 'removed'
  ) then
    raise exception 'hostname_taken' using errcode = '23505';
  end if;

  insert into public.domains (
    site_id,
    hostname,
    domain_type,
    status,
    is_primary,
    verification_metadata
  )
  values (
    p_site_id,
    normalized,
    'custom',
    'pending',
    false,
    jsonb_build_object('requested_at', now())
  )
  returning * into new_domain;

  insert into public.audit_logs (actor_user_id, site_id, action, target_type, target_id, metadata)
  values (
    auth.uid(),
    p_site_id,
    'domain.attach',
    'domain',
    new_domain.id,
    jsonb_build_object('hostname', normalized)
  );

  return jsonb_build_object(
    'id', new_domain.id,
    'hostname', new_domain.hostname,
    'status', new_domain.status
  );
end;
$$;

create or replace function public.sync_domain_provider_state(
  p_domain_id uuid,
  p_status text,
  p_verification_metadata jsonb,
  p_ssl_metadata jsonb,
  p_verified_at timestamptz default null,
  p_make_primary boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.domains%rowtype;
begin
  select * into target from public.domains where id = p_domain_id for update;
  if not found then
    raise exception 'domain_not_found' using errcode = 'P0002';
  end if;

  if not public.owns_site(target.site_id) then
    raise exception 'site_access_denied' using errcode = '42501';
  end if;

  if target.domain_type <> 'custom' or target.status = 'removed' then
    raise exception 'invalid_domain' using errcode = '22023';
  end if;

  if p_status not in ('pending', 'verifying', 'active', 'failed') then
    raise exception 'invalid_domain_status' using errcode = '22023';
  end if;

  if p_make_primary and p_status = 'active' then
    update public.domains
    set is_primary = false
    where site_id = target.site_id
      and id <> target.id
      and is_primary;
  end if;

  update public.domains
  set status = p_status,
      verification_metadata = coalesce(p_verification_metadata, verification_metadata),
      ssl_metadata = coalesce(p_ssl_metadata, ssl_metadata),
      verified_at = case
        when p_status = 'active' then coalesce(p_verified_at, verified_at, now())
        else verified_at
      end,
      is_primary = case
        when p_make_primary and p_status = 'active' then true
        else is_primary
      end
  where id = target.id
  returning * into target;

  return jsonb_build_object(
    'id', target.id,
    'hostname', target.hostname,
    'status', target.status,
    'is_primary', target.is_primary,
    'verified_at', target.verified_at
  );
end;
$$;

create or replace function public.remove_custom_domain(p_domain_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.domains%rowtype;
  was_primary boolean;
begin
  select * into target from public.domains where id = p_domain_id for update;
  if not found then
    raise exception 'domain_not_found' using errcode = 'P0002';
  end if;

  if not public.owns_site(target.site_id) then
    raise exception 'site_access_denied' using errcode = '42501';
  end if;

  if target.domain_type <> 'custom' or target.status = 'removed' then
    raise exception 'invalid_domain' using errcode = '22023';
  end if;

  was_primary := target.is_primary;

  update public.domains
  set status = 'removed',
      is_primary = false
  where id = target.id
  returning * into target;

  if was_primary then
    update public.domains
    set is_primary = true
    where site_id = target.site_id
      and domain_type = 'subdomain'
      and status <> 'removed';
  end if;

  insert into public.audit_logs (actor_user_id, site_id, action, target_type, target_id, metadata)
  values (
    auth.uid(),
    target.site_id,
    'domain.remove',
    'domain',
    target.id,
    jsonb_build_object('hostname', target.hostname)
  );

  return jsonb_build_object('id', target.id, 'hostname', target.hostname, 'status', 'removed');
end;
$$;

create or replace function public.set_primary_domain(p_domain_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.domains%rowtype;
begin
  select * into target from public.domains where id = p_domain_id for update;
  if not found then
    raise exception 'domain_not_found' using errcode = 'P0002';
  end if;

  if not public.owns_site(target.site_id) then
    raise exception 'site_access_denied' using errcode = '42501';
  end if;

  if target.status <> 'active' then
    raise exception 'domain_not_active' using errcode = '22023';
  end if;

  update public.domains
  set is_primary = false
  where site_id = target.site_id
    and id <> target.id
    and is_primary;

  update public.domains
  set is_primary = true
  where id = target.id
  returning * into target;

  return jsonb_build_object(
    'id', target.id,
    'hostname', target.hostname,
    'is_primary', true
  );
end;
$$;

create index if not exists domains_active_hostname_idx
  on public.domains (lower(hostname))
  where status = 'active';

revoke all on function public.resolve_active_custom_domain(text) from public;
grant execute on function public.resolve_active_custom_domain(text) to anon, authenticated, service_role;

revoke all on function public.attach_custom_domain(uuid, text) from public;
grant execute on function public.attach_custom_domain(uuid, text) to authenticated;

revoke all on function public.sync_domain_provider_state(uuid, text, jsonb, jsonb, timestamptz, boolean) from public;
grant execute on function public.sync_domain_provider_state(uuid, text, jsonb, jsonb, timestamptz, boolean) to authenticated;

revoke all on function public.remove_custom_domain(uuid) from public;
grant execute on function public.remove_custom_domain(uuid) to authenticated;

revoke all on function public.set_primary_domain(uuid) from public;
grant execute on function public.set_primary_domain(uuid) to authenticated;
