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
  reserved_slugs constant text[] := array[
    'admin',
    'api',
    'app',
    'auth',
    'obchodne-podmienky',
    'ochrana-sukromia',
    'prihlasenie',
    'registracia',
    'robots.txt',
    'sitemap.xml',
    'zabudnute-heslo',
    'obnova-hesla'
  ];
begin
  if auth.uid() is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  if available_slug = any(reserved_slugs) then
    available_slug := p_slug || '-web';
  end if;

  while available_slug = any(reserved_slugs)
    or exists (select 1 from public.sites where slug = available_slug)
  loop
    suffix := suffix + 1;
    available_slug := p_slug || '-web-' || suffix::text;
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

revoke all on function public.create_candidate_site(text, text, text, text, text) from public;
grant execute on function public.create_candidate_site(text, text, text, text, text) to authenticated;

create or replace function public.purge_expired_operational_data()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  contact_count integer;
  ai_count integer;
begin
  delete from public.contact_submissions
  where retention_expires_at <= now();
  get diagnostics contact_count = row_count;

  delete from public.ai_generations
  where retention_expires_at <= now();
  get diagnostics ai_count = row_count;

  return jsonb_build_object(
    'contact_submissions', contact_count,
    'ai_generations', ai_count,
    'purged_at', now()
  );
end;
$$;

revoke all on function public.purge_expired_operational_data() from public;
grant execute on function public.purge_expired_operational_data() to service_role;
