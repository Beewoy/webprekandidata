-- Reserve public template preview routes so a candidate site cannot claim /ukazka or /sablony.

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
  owner_email text;
  reserved_slugs constant text[] := array[
    'admin',
    'api',
    'app',
    'auth',
    'kampanovy-web-pre-poslanca',
    'kampanovy-web-pre-primatora',
    'kampanovy-web-pre-starostu',
    'komunalne-volby-2026',
    'not-found-domain',
    'obchodne-podmienky',
    'ochrana-sukromia',
    'prihlasenie',
    'registracia',
    'reklamacny-poriadok',
    'robots.txt',
    'sablony',
    'sitemap.xml',
    'ukazka',
    'volby-do-vuc-2026',
    'zabudnute-heslo',
    'obnova-hesla'
  ];
begin
  if auth.uid() is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  select nullif(trim(u.email), '')
  into owner_email
  from auth.users u
  where u.id = auth.uid();

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
    jsonb_strip_nulls(
      jsonb_build_object(
        'zakladne-udaje', jsonb_build_object(
          'name', p_candidate_name,
          'position', p_position,
          'city', p_locality
        ),
        'kontakt', case
          when owner_email is null then null
          else jsonb_build_object('email', owner_email)
        end
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
