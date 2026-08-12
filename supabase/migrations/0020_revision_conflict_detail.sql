-- Append current draft revision to revision_conflict DETAIL so clients can show
-- the authoritative version without a second round-trip (and without overwriting).

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
  current_revision bigint;
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
    select revision into current_revision
    from public.site_drafts
    where site_id = p_site_id;

    raise exception 'revision_conflict'
      using errcode = '40001',
            detail = coalesce(current_revision::text, '0');
  end if;

  return next_revision;
end;
$$;

revoke all on function public.update_site_section(uuid, text, jsonb, bigint) from public;
grant execute on function public.update_site_section(uuid, text, jsonb, bigint) to authenticated;
