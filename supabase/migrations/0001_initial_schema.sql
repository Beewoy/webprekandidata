create extension if not exists pgcrypto;

create type public.user_role as enum ('candidate', 'admin');
create type public.site_status as enum ('draft', 'ready', 'payment_pending', 'published', 'suspended', 'archived');
create type public.plan_code as enum ('basic', 'plus');
create type public.order_status as enum ('pending', 'paid', 'failed', 'refunded', 'cancelled');
create type public.post_status as enum ('draft', 'published', 'archived');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role public.user_role not null default 'candidate',
  email_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete restrict,
  internal_name text not null,
  candidate_name text not null default '',
  locality text not null default '',
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status public.site_status not null default 'draft',
  plan_code public.plan_code,
  campaign_ends_at timestamptz,
  current_publication_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint sites_slug_unique unique (slug)
);

create table public.site_drafts (
  site_id uuid primary key references public.sites(id) on delete cascade,
  schema_version integer not null default 1 check (schema_version > 0),
  content jsonb not null default '{}'::jsonb,
  theme jsonb not null default '{"primaryColor":"#163B65","layout":"modern"}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  revision bigint not null default 1 check (revision > 0),
  validation_state jsonb not null default '{}'::jsonb,
  updated_by uuid not null references public.profiles(id) on delete restrict,
  updated_at timestamptz not null default now()
);

create table public.site_publications (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete restrict,
  version_number integer not null check (version_number > 0),
  schema_version integer not null default 1,
  content jsonb not null,
  theme jsonb not null,
  seo jsonb not null,
  media_manifest jsonb not null default '[]'::jsonb,
  published_by uuid not null references public.profiles(id) on delete restrict,
  published_at timestamptz not null default now(),
  unpublished_at timestamptz,
  constraint publications_site_version_unique unique (site_id, version_number)
);

alter table public.sites add constraint sites_current_publication_fk
  foreign key (current_publication_id) references public.site_publications(id) on delete set null;

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  owner_user_id uuid not null references public.profiles(id) on delete restrict,
  kind text not null check (kind in ('logo', 'hero', 'about', 'social', 'post')),
  storage_path text not null unique,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/svg+xml')),
  byte_size bigint not null check (byte_size > 0 and byte_size <= 15728640),
  width integer check (width > 0),
  height integer check (height > 0),
  crop_metadata jsonb not null default '{}'::jsonb,
  alt_text text not null default '',
  variants jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.domains (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  hostname text not null unique,
  domain_type text not null check (domain_type in ('subdomain', 'custom')),
  status text not null default 'pending' check (status in ('pending', 'verifying', 'active', 'failed', 'removed')),
  verification_metadata jsonb not null default '{}'::jsonb,
  ssl_metadata jsonb not null default '{}'::jsonb,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

create unique index domains_one_primary_per_site on public.domains(site_id) where is_primary;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  status public.order_status not null default 'pending',
  currency text not null default 'EUR' check (currency = 'EUR'),
  total_cents integer not null check (total_cents in (4999, 8999)),
  net_cents integer,
  tax_cents integer,
  plan_code public.plan_code not null,
  valid_until timestamptz,
  stripe_customer_id text,
  stripe_checkout_session_id text unique,
  buyer_snapshot jsonb not null,
  seller_snapshot jsonb not null,
  paid_at timestamptz,
  fulfilled_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider_event_id text not null unique,
  event_type text not null,
  processing_status text not null default 'received' check (processing_status in ('received', 'processed', 'failed', 'ignored')),
  payload_reference text,
  failure_reason text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  author_user_id uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(title) between 1 and 140),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text not null default '',
  body jsonb not null default '{}'::jsonb,
  cover_asset_id uuid references public.media_assets(id) on delete set null,
  status public.post_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_site_slug_unique unique (site_id, slug)
);

create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  sender_name text not null check (char_length(sender_name) between 1 and 120),
  sender_email text not null,
  message text not null check (char_length(message) between 1 and 5000),
  consent_recorded_at timestamptz not null,
  delivery_status text not null default 'pending' check (delivery_status in ('pending', 'sent', 'failed', 'deleted')),
  spam_score numeric(5,4),
  retention_expires_at timestamptz not null default (now() + interval '90 days'),
  created_at timestamptz not null default now()
);

create table public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete restrict,
  task_type text not null,
  provider text not null,
  model text not null,
  status text not null check (status in ('requested', 'completed', 'rejected', 'failed')),
  input_tokens integer check (input_tokens >= 0),
  output_tokens integer check (output_tokens >= 0),
  estimated_cost_cents integer check (estimated_cost_cents >= 0),
  prompt_fingerprint text not null,
  safety_category text,
  accepted_at timestamptz,
  retention_expires_at timestamptz not null default (now() + interval '90 days'),
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references public.profiles(id) on delete set null,
  site_id uuid references public.sites(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index sites_owner_idx on public.sites(owner_user_id) where deleted_at is null;
create index publications_site_idx on public.site_publications(site_id, version_number desc);
create index media_site_idx on public.media_assets(site_id) where deleted_at is null;
create index posts_site_status_idx on public.posts(site_id, status, published_at desc);
create index contact_retention_idx on public.contact_submissions(retention_expires_at);
create index ai_retention_idx on public.ai_generations(retention_expires_at);
create index audit_site_created_idx on public.audit_logs(site_id, created_at desc);

create or replace function public.owns_site(target_site_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.sites
    where id = target_site_id and owner_user_id = auth.uid() and deleted_at is null
  );
$$;

create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.sites enable row level security;
alter table public.site_drafts enable row level security;
alter table public.site_publications enable row level security;
alter table public.media_assets enable row level security;
alter table public.domains enable row level security;
alter table public.orders enable row level security;
alter table public.payment_events enable row level security;
alter table public.posts enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.ai_generations enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles_read_own" on public.profiles for select using (id = auth.uid() or public.is_platform_admin());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = 'candidate');
create policy "sites_owner_all" on public.sites for all using (owner_user_id = auth.uid() or public.is_platform_admin()) with check (owner_user_id = auth.uid() or public.is_platform_admin());
create policy "drafts_owner_all" on public.site_drafts for all using (public.owns_site(site_id) or public.is_platform_admin()) with check (public.owns_site(site_id) or public.is_platform_admin());
create policy "publications_owner_read" on public.site_publications for select using (public.owns_site(site_id) or public.is_platform_admin());
create policy "media_owner_all" on public.media_assets for all using (public.owns_site(site_id) or public.is_platform_admin()) with check (owner_user_id = auth.uid() or public.is_platform_admin());
create policy "domains_owner_read" on public.domains for select using (public.owns_site(site_id) or public.is_platform_admin());
create policy "orders_owner_read" on public.orders for select using (user_id = auth.uid() or public.is_platform_admin());
create policy "posts_owner_all" on public.posts for all using (public.owns_site(site_id) or public.is_platform_admin()) with check (author_user_id = auth.uid() or public.is_platform_admin());
create policy "contact_owner_read" on public.contact_submissions for select using (public.owns_site(site_id) or public.is_platform_admin());
create policy "ai_owner_read" on public.ai_generations for select using (user_id = auth.uid() or public.is_platform_admin());
create policy "audit_admin_read" on public.audit_logs for select using (public.is_platform_admin());

revoke all on public.payment_events from anon, authenticated;
revoke all on public.audit_logs from anon, authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, email_verified_at)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email_confirmed_at);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
