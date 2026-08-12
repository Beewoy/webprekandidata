-- Fix 0021: RAISE EXCEPTION rolled back the cooldown row, so storms never entered
-- the quiet path and kept flooding postgres_logs. Return JSON instead of raising
-- on revision conflict so the cooldown can commit and ERROR spam stops.

drop function if exists public.update_site_section(uuid, text, jsonb, bigint);

create function public.update_site_section(
  p_site_id uuid,
  p_section_key text,
  p_payload jsonb,
  p_expected_revision bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_revision bigint;
  current_revision bigint;
  cooldown_until timestamptz;
  cooldown_revision bigint;
begin
  if not public.owns_site(p_site_id) then
    raise exception 'site_access_denied' using errcode = '42501';
  end if;

  if p_section_key not in ('zakladne-udaje', 'kontakt', 'uvod', 'o-mne', 'preco-kandidujem', 'program', 'seo') then
    raise exception 'invalid_section' using errcode = '22023';
  end if;

  select conflict_until, last_revision
    into cooldown_until, cooldown_revision
  from public.draft_revision_cooldowns
  where site_id = p_site_id;

  if cooldown_until is not null and cooldown_until > now() then
    return jsonb_build_object(
      'ok', false,
      'conflict', true,
      'cooldown', true,
      'revision', coalesce(cooldown_revision, 0)
    );
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

    insert into public.draft_revision_cooldowns (site_id, conflict_until, last_revision, updated_at)
    values (p_site_id, now() + interval '5 seconds', current_revision, now())
    on conflict (site_id) do update
      set conflict_until = excluded.conflict_until,
          last_revision = excluded.last_revision,
          updated_at = excluded.updated_at;

    return jsonb_build_object(
      'ok', false,
      'conflict', true,
      'cooldown', false,
      'revision', coalesce(current_revision, 0)
    );
  end if;

  delete from public.draft_revision_cooldowns where site_id = p_site_id;

  return jsonb_build_object(
    'ok', true,
    'conflict', false,
    'revision', next_revision
  );
end;
$$;

revoke all on function public.update_site_section(uuid, text, jsonb, bigint) from public;
grant execute on function public.update_site_section(uuid, text, jsonb, bigint) to authenticated;
