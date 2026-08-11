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

  insert into public.domains (site_id, hostname, domain_type, is_primary)
  values (new_site_id, available_slug || '.webprekandidata.sk', 'subdomain', true);

  return new_site_id;
end;
$$;

create or replace function public.update_site_section(
  p_site_id uuid,
  p_section_key text,
  p_payload jsonb,
  p_expected_revision bigint
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_revision bigint;
begin
  if not public.owns_site(p_site_id) then
    raise exception 'site_access_denied' using errcode = '42501';
  end if;

  if p_section_key not in ('zakladne-udaje', 'kontakt', 'uvod', 'o-mne', 'preco-kandidujem', 'program', 'seo') then
    raise exception 'invalid_section' using errcode = '22023';
  end if;

  if p_section_key = 'seo' then
    update public.site_drafts
    set seo = p_payload,
        revision = revision + 1,
        updated_by = auth.uid(),
        updated_at = now()
    where site_id = p_site_id and revision = p_expected_revision
    returning revision into next_revision;
  else
    update public.site_drafts
    set content = jsonb_set(content, array[p_section_key], p_payload, true),
        revision = revision + 1,
        updated_by = auth.uid(),
        updated_at = now()
    where site_id = p_site_id and revision = p_expected_revision
    returning revision into next_revision;
  end if;

  if next_revision is null then
    raise exception 'revision_conflict' using errcode = '40001';
  end if;

  return next_revision;
end;
$$;

revoke all on function public.create_candidate_site(text, text, text, text, text) from public;
revoke all on function public.update_site_section(uuid, text, jsonb, bigint) from public;
grant execute on function public.create_candidate_site(text, text, text, text, text) to authenticated;
grant execute on function public.update_site_section(uuid, text, jsonb, bigint) to authenticated;
