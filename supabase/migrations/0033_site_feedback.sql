-- User feedback form submissions and reserved route /spatna-vazba.

create table public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  overall_rating smallint not null check (overall_rating between 1 and 5),
  editor_rating smallint not null check (editor_rating between 1 and 5),
  highlights text[] not null default '{}',
  improvements text[] not null default '{}',
  comment text,
  email text,
  consent_public boolean not null default false,
  user_id uuid references public.profiles(id) on delete set null,
  site_id uuid references public.sites(id) on delete set null,
  request_fingerprint text,
  created_at timestamptz not null default now()
);

create index feedback_submissions_created_at_idx
  on public.feedback_submissions (created_at desc);

alter table public.feedback_submissions enable row level security;

create policy feedback_submissions_admin_read
  on public.feedback_submissions for select to authenticated
  using (public.is_platform_admin());

revoke insert, update, delete on public.feedback_submissions from anon, authenticated;
grant select on public.feedback_submissions to authenticated;
grant all on public.feedback_submissions to service_role;

-- Reserve /spatna-vazba for the feedback form route.

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
    'spatna-vazba',
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
    'spatna-vazba',
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

revoke all on function public.create_candidate_site(text, text, text, text, text) from public;
grant execute on function public.create_candidate_site(text, text, text, text, text) to authenticated;

revoke all on function public.update_site_slug(uuid, text) from public;
grant execute on function public.update_site_slug(uuid, text) to authenticated;
