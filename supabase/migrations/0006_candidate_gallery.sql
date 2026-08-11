alter table public.media_assets
  drop constraint if exists media_assets_kind_check;

alter table public.media_assets
  add constraint media_assets_kind_check
  check (kind in ('logo', 'hero', 'about', 'social', 'post', 'gallery'));

alter table public.media_assets
  add column if not exists caption text not null default '',
  add column if not exists sort_order integer;

alter table public.media_assets
  add constraint media_assets_caption_length_check check (char_length(caption) <= 160),
  add constraint media_assets_sort_order_check check (sort_order is null or sort_order >= 0);

create index if not exists media_gallery_order_idx
  on public.media_assets (site_id, sort_order, created_at)
  where kind = 'gallery' and deleted_at is null;

create or replace function public.reorder_gallery_assets(
  p_site_id uuid,
  p_asset_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  active_count integer;
  distinct_count integer;
begin
  if not public.owns_site(p_site_id) then
    raise exception 'site_access_denied' using errcode = '42501';
  end if;

  if cardinality(p_asset_ids) > 12 then
    raise exception 'gallery_limit_exceeded' using errcode = '22023';
  end if;

  select count(*) into active_count
  from public.media_assets
  where site_id = p_site_id and kind = 'gallery' and deleted_at is null;

  select count(distinct asset_id) into distinct_count
  from unnest(p_asset_ids) as asset_id;

  if active_count <> cardinality(p_asset_ids) or distinct_count <> cardinality(p_asset_ids) then
    raise exception 'invalid_gallery_order' using errcode = '22023';
  end if;

  if exists (
    select 1
    from unnest(p_asset_ids) as requested(asset_id)
    left join public.media_assets asset
      on asset.id = requested.asset_id
      and asset.site_id = p_site_id
      and asset.kind = 'gallery'
      and asset.deleted_at is null
    where asset.id is null
  ) then
    raise exception 'invalid_gallery_asset' using errcode = '22023';
  end if;

  update public.media_assets asset
  set sort_order = requested.ordinality - 1
  from unnest(p_asset_ids) with ordinality as requested(asset_id, ordinality)
  where asset.id = requested.asset_id and asset.site_id = p_site_id;
end;
$$;

revoke all on function public.reorder_gallery_assets(uuid, uuid[]) from public;
grant execute on function public.reorder_gallery_assets(uuid, uuid[]) to authenticated;
