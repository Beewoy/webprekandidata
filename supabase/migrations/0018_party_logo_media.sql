alter table public.media_assets
  drop constraint if exists media_assets_kind_check;

alter table public.media_assets
  add constraint media_assets_kind_check
  check (kind in ('logo', 'party_logo', 'hero', 'about', 'social', 'post', 'gallery'));
