alter table public.posts
  add column if not exists seo_title text not null default '',
  add column if not exists seo_description text not null default '',
  add column if not exists revision bigint not null default 1,
  add column if not exists deleted_at timestamptz;

alter table public.posts
  add constraint posts_excerpt_length_check check (char_length(excerpt) <= 320),
  add constraint posts_seo_title_length_check check (char_length(seo_title) <= 70),
  add constraint posts_seo_description_length_check check (char_length(seo_description) <= 170),
  add constraint posts_revision_check check (revision > 0),
  add constraint posts_body_shape_check check (
    jsonb_typeof(body) = 'object'
    and char_length(coalesce(body ->> 'html', '')) <= 20000
  );

alter table public.ai_generations
  add column if not exists target_id uuid;

create index if not exists posts_site_active_updated_idx
  on public.posts (site_id, updated_at desc)
  where deleted_at is null;

create index if not exists ai_article_quota_idx
  on public.ai_generations (site_id, task_type, status, created_at desc)
  where task_type = 'article_draft';

create or replace function public.has_plus_entitlement(p_site_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.owns_site(p_site_id)
    and exists (
      select 1
      from public.orders
      where site_id = p_site_id
        and user_id = auth.uid()
        and status = 'paid'
        and plan_code = 'plus'
        and (valid_until is null or valid_until >= now())
    );
$$;

create or replace function public.create_candidate_post(p_site_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_post_id uuid;
  available_slug text := 'novy-clanok';
  suffix integer := 1;
begin
  if not public.owns_site(p_site_id) then
    raise exception 'site_access_denied' using errcode = '42501';
  end if;

  if (select count(*) from public.posts where site_id = p_site_id and deleted_at is null) >= 100 then
    raise exception 'post_limit_exceeded' using errcode = '22023';
  end if;

  while exists (select 1 from public.posts where site_id = p_site_id and slug = available_slug) loop
    suffix := suffix + 1;
    available_slug := 'novy-clanok-' || suffix::text;
  end loop;

  insert into public.posts (site_id, author_user_id, title, slug, body)
  values (p_site_id, auth.uid(), 'Nový článok', available_slug, '{"html":""}'::jsonb)
  returning id into new_post_id;

  return new_post_id;
end;
$$;

create or replace function public.reserve_post_ai_generation(
  p_site_id uuid,
  p_post_id uuid,
  p_model text,
  p_prompt_fingerprint text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  generation_id uuid;
  used_count integer;
begin
  if not public.owns_site(p_site_id) then
    raise exception 'site_access_denied' using errcode = '42501';
  end if;

  if not public.has_plus_entitlement(p_site_id) then
    raise exception 'plus_required' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.posts
    where id = p_post_id and site_id = p_site_id and deleted_at is null
  ) then
    raise exception 'post_not_found' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_site_id::text, 0));

  select count(*) into used_count
  from public.ai_generations
  where site_id = p_site_id
    and task_type = 'article_draft'
    and status in ('requested', 'completed');

  if used_count >= 20 then
    raise exception 'ai_quota_exceeded' using errcode = '22023';
  end if;

  insert into public.ai_generations (
    site_id, user_id, target_id, task_type, provider, model, status, prompt_fingerprint
  ) values (
    p_site_id, auth.uid(), p_post_id, 'article_draft', 'openai', p_model, 'requested', p_prompt_fingerprint
  ) returning id into generation_id;

  return generation_id;
end;
$$;

revoke all on function public.has_plus_entitlement(uuid) from public;
revoke all on function public.create_candidate_post(uuid) from public;
revoke all on function public.reserve_post_ai_generation(uuid, uuid, text, text) from public;
grant execute on function public.has_plus_entitlement(uuid) to authenticated;
grant execute on function public.create_candidate_post(uuid) to authenticated;
grant execute on function public.reserve_post_ai_generation(uuid, uuid, text, text) to authenticated;
