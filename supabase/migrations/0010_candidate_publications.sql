alter table public.site_publications
  add column if not exists posts jsonb not null default '[]'::jsonb,
  add column if not exists source_revision bigint not null default 1,
  add column if not exists source_fingerprint text not null default '';

alter table public.site_publications
  add constraint publications_posts_array_check check (jsonb_typeof(posts) = 'array'),
  add constraint publications_source_revision_check check (source_revision > 0),
  add constraint publications_source_fingerprint_check check (
    source_fingerprint = '' or source_fingerprint ~ '^[0-9a-f]{64}$'
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'published-media',
  'published-media',
  true,
  15728640,
  array['image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.has_publish_entitlement(p_site_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.owns_site(p_site_id)
    and exists (
      select 1
      from public.sites s
      join public.orders o on o.site_id = s.id and o.user_id = s.owner_user_id
      where s.id = p_site_id
        and s.owner_user_id = auth.uid()
        and s.deleted_at is null
        and s.plan_code is not null
        and o.status = 'paid'
        and o.plan_code = s.plan_code
        and (o.valid_until is null or o.valid_until >= now())
    );
$$;

create or replace function public.publish_candidate_site(
  p_site_id uuid,
  p_publication_id uuid,
  p_schema_version integer,
  p_content jsonb,
  p_theme jsonb,
  p_seo jsonb,
  p_media_manifest jsonb,
  p_posts jsonb,
  p_source_revision bigint,
  p_source_fingerprint text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_version integer;
  previous_publication_id uuid;
  published_time timestamptz := now();
begin
  if not public.owns_site(p_site_id) then
    raise exception 'site_access_denied' using errcode = '42501';
  end if;

  if not public.has_publish_entitlement(p_site_id) then
    raise exception 'publish_entitlement_required' using errcode = '42501';
  end if;

  if p_schema_version < 1 or p_source_revision < 1 then
    raise exception 'invalid_publication_version' using errcode = '22023';
  end if;

  if jsonb_typeof(p_content) <> 'object'
    or jsonb_typeof(p_theme) <> 'object'
    or jsonb_typeof(p_seo) <> 'object'
    or jsonb_typeof(p_media_manifest) <> 'array'
    or jsonb_typeof(p_posts) <> 'array'
    or p_source_fingerprint !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid_publication_payload' using errcode = '22023';
  end if;

  select current_publication_id into previous_publication_id
  from public.sites
  where id = p_site_id and owner_user_id = auth.uid() and deleted_at is null
  for update;

  select coalesce(max(version_number), 0) + 1 into next_version
  from public.site_publications
  where site_id = p_site_id;

  if previous_publication_id is not null then
    update public.site_publications
    set unpublished_at = published_time
    where id = previous_publication_id and site_id = p_site_id and unpublished_at is null;
  end if;

  insert into public.site_publications (
    id,
    site_id,
    version_number,
    schema_version,
    content,
    theme,
    seo,
    media_manifest,
    posts,
    source_revision,
    source_fingerprint,
    published_by,
    published_at
  ) values (
    p_publication_id,
    p_site_id,
    next_version,
    p_schema_version,
    p_content,
    p_theme,
    p_seo,
    p_media_manifest,
    p_posts,
    p_source_revision,
    p_source_fingerprint,
    auth.uid(),
    published_time
  );

  update public.sites
  set current_publication_id = p_publication_id,
      status = 'published',
      updated_at = published_time
  where id = p_site_id;

  insert into public.audit_logs (actor_user_id, site_id, action, target_type, target_id, metadata)
  values (
    auth.uid(),
    p_site_id,
    'site_published',
    'site_publication',
    p_publication_id::text,
    jsonb_build_object('version_number', next_version, 'source_revision', p_source_revision)
  );

  return jsonb_build_object(
    'publication_id', p_publication_id,
    'version_number', next_version,
    'published_at', published_time
  );
end;
$$;

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
begin
  if not public.owns_site(p_site_id) then
    raise exception 'site_access_denied' using errcode = '42501';
  end if;

  select current_publication_id into publication_id
  from public.sites
  where id = p_site_id and owner_user_id = auth.uid() and deleted_at is null
  for update;

  if publication_id is null then
    raise exception 'publication_required' using errcode = '22023';
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

revoke all on function public.has_publish_entitlement(uuid) from public;
revoke all on function public.publish_candidate_site(uuid, uuid, integer, jsonb, jsonb, jsonb, jsonb, jsonb, bigint, text) from public;
revoke all on function public.set_candidate_site_visibility(uuid, boolean) from public;
grant execute on function public.has_publish_entitlement(uuid) to authenticated;
grant execute on function public.publish_candidate_site(uuid, uuid, integer, jsonb, jsonb, jsonb, jsonb, jsonb, bigint, text) to authenticated;
grant execute on function public.set_candidate_site_visibility(uuid, boolean) to authenticated;
