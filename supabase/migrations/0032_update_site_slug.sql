-- Allow site owners to change the platform path slug after project creation.

create or replace function public.update_site_slug(
  p_site_id uuid,
  p_new_slug text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.sites%rowtype;
  normalized_slug text := lower(trim(p_new_slug));
  previous_slug text;
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

  if not public.owns_site(p_site_id) then
    raise exception 'site_access_denied' using errcode = '42501';
  end if;

  select * into target
  from public.sites
  where id = p_site_id
    and deleted_at is null
  for update;

  if not found then
    raise exception 'site_access_denied' using errcode = '42501';
  end if;

  if target.admin_hold then
    raise exception 'admin_hold_active' using errcode = '42501';
  end if;

  if normalized_slug is null
    or char_length(normalized_slug) < 2
    or char_length(normalized_slug) > 80
    or normalized_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  then
    raise exception 'invalid_slug' using errcode = '22023';
  end if;

  if normalized_slug = any(reserved_slugs) then
    raise exception 'slug_reserved' using errcode = '22023';
  end if;

  if normalized_slug = target.slug then
    return jsonb_build_object('ok', true, 'slug', target.slug);
  end if;

  if exists (
    select 1
    from public.sites
    where slug = normalized_slug
      and id <> p_site_id
      and deleted_at is null
  ) then
    raise exception 'slug_taken' using errcode = '23505';
  end if;

  previous_slug := target.slug;

  update public.sites
  set slug = normalized_slug,
      updated_at = now()
  where id = p_site_id;

  update public.domains
  set hostname = normalized_slug || '.webprekandidata.sk'
  where site_id = p_site_id
    and domain_type = 'subdomain'
    and status <> 'removed';

  insert into public.audit_logs (actor_user_id, site_id, action, target_type, target_id, metadata)
  values (
    auth.uid(),
    p_site_id,
    'site_slug_updated',
    'site',
    p_site_id,
    jsonb_build_object('previous_slug', previous_slug, 'new_slug', normalized_slug)
  );

  return jsonb_build_object('ok', true, 'slug', normalized_slug);
end;
$$;

revoke all on function public.update_site_slug(uuid, text) from public;
grant execute on function public.update_site_slug(uuid, text) to authenticated;
