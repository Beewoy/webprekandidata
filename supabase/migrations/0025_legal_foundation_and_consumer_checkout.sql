-- Legal foundation: immutable document versions, plan versions, legal audit, consumer checkout fields.

-- ---------------------------------------------------------------------------
-- Document versions (append-only content)
-- ---------------------------------------------------------------------------
create table public.legal_document_versions (
  id uuid primary key default gen_random_uuid(),
  doc_type text not null check (doc_type in (
    'terms',
    'privacy',
    'dpa',
    'withdrawal_notice',
    'complaints',
    'acceptable_use',
    'political_sponsor_declaration',
    'price_list',
    'early_performance_statement'
  )),
  version text not null,
  locale text not null default 'sk' check (locale = 'sk'),
  title text not null,
  content_hash text not null,
  content_markdown text not null,
  effective_from timestamptz not null,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (doc_type, version, locale)
);

create index legal_document_versions_type_effective_idx
  on public.legal_document_versions (doc_type, effective_from desc);

alter table public.legal_document_versions enable row level security;

create policy legal_document_versions_public_read
  on public.legal_document_versions
  for select
  to anon, authenticated
  using (true);

revoke insert, update, delete on public.legal_document_versions from anon, authenticated;
grant select on public.legal_document_versions to anon, authenticated;
grant insert, select on public.legal_document_versions to service_role;

-- Block content mutation after insert (new version required).
create or replace function public.prevent_legal_document_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'legal_document_immutable' using errcode = 'P0001';
end;
$$;

create trigger legal_document_versions_no_update
  before update or delete on public.legal_document_versions
  for each row execute function public.prevent_legal_document_mutation();

-- ---------------------------------------------------------------------------
-- Plan versions
-- ---------------------------------------------------------------------------
create table public.plan_versions (
  id uuid primary key default gen_random_uuid(),
  plan_code public.plan_code not null,
  version text not null,
  price_cents integer not null check (price_cents in (4999, 8999)),
  currency text not null default 'EUR' check (currency = 'EUR'),
  tax_regime text not null default 'not_vat_payer',
  duration_rule text not null default 'fixed_end_date',
  service_ends_at timestamptz not null,
  features jsonb not null default '[]'::jsonb,
  limits jsonb not null default '{}'::jsonb,
  support_summary text not null default '',
  effective_from timestamptz not null,
  effective_to timestamptz,
  created_at timestamptz not null default now(),
  unique (plan_code, version)
);

create index plan_versions_active_idx
  on public.plan_versions (plan_code, effective_from desc);

alter table public.plan_versions enable row level security;

create policy plan_versions_public_read
  on public.plan_versions
  for select
  to anon, authenticated
  using (true);

revoke insert, update, delete on public.plan_versions from anon, authenticated;
grant select on public.plan_versions to anon, authenticated;
grant all on public.plan_versions to service_role;

insert into public.plan_versions (
  plan_code,
  version,
  price_cents,
  currency,
  tax_regime,
  duration_rule,
  service_ends_at,
  features,
  limits,
  support_summary,
  effective_from
) values
(
  'basic',
  '2026.1',
  4999,
  'EUR',
  'not_vat_payer',
  'fixed_end_date',
  '2026-12-31T22:59:59.999Z',
  '["Volebný web na subdoméne", "Editor obsahu", "Aktuality", "Kontaktný formulár", "SEO základ"]'::jsonb,
  '{"projects": 1, "ai_proposals": 0}'::jsonb,
  'E-mailová a telefonická podpora v pracovných dňoch bez garancie SLA.',
  '2026-08-13T00:00:00Z'
),
(
  'plus',
  '2026.1',
  8999,
  'EUR',
  'not_vat_payer',
  'fixed_end_date',
  '2026-12-31T22:59:59.999Z',
  '["Všetko z Basic", "Vlastná doména (registrácia/poplatky registrátora nie sú zahrnuté)", "AI návrhy textov s ľudskou kontrolou", "Prioritná podpora"]'::jsonb,
  '{"projects": 1, "ai_proposals": 20}'::jsonb,
  'E-mailová a telefonická podpora v pracovných dňoch bez garancie SLA.',
  '2026-08-13T00:00:00Z'
);

-- ---------------------------------------------------------------------------
-- Append-only legal audit events
-- ---------------------------------------------------------------------------
create table public.legal_audit_events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor_user_id uuid references public.profiles(id) on delete set null,
  actor_service text,
  action text not null,
  entity_type text not null,
  entity_id text,
  entity_version text,
  correlation_id text,
  result text not null default 'ok' check (result in ('ok', 'denied', 'error')),
  legal_basis_tag text,
  before_hash text,
  after_hash text,
  metadata jsonb not null default '{}'::jsonb
);

create index legal_audit_events_entity_idx
  on public.legal_audit_events (entity_type, entity_id, occurred_at desc);
create index legal_audit_events_correlation_idx
  on public.legal_audit_events (correlation_id)
  where correlation_id is not null;

alter table public.legal_audit_events enable row level security;

create policy legal_audit_events_admin_read
  on public.legal_audit_events
  for select
  to authenticated
  using (public.is_platform_admin());

revoke insert, update, delete on public.legal_audit_events from anon, authenticated;
grant select on public.legal_audit_events to authenticated;
grant insert, select on public.legal_audit_events to service_role;

create or replace function public.prevent_legal_audit_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'legal_audit_immutable' using errcode = 'P0001';
end;
$$;

create trigger legal_audit_events_no_update
  before update or delete on public.legal_audit_events
  for each row execute function public.prevent_legal_audit_mutation();

-- ---------------------------------------------------------------------------
-- Consumer checkout columns on orders
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists plan_version_id uuid references public.plan_versions(id),
  add column if not exists customer_type text check (customer_type in ('b2c', 'b2b')),
  add column if not exists customer_type_statement text,
  add column if not exists customer_type_statement_version text,
  add column if not exists early_performance_requested boolean not null default false,
  add column if not exists early_performance_statement_version text,
  add column if not exists early_performance_statement_text text,
  add column if not exists service_starts_at timestamptz,
  add column if not exists service_ends_at timestamptz,
  add column if not exists public_activation_at timestamptz,
  add column if not exists activation_deferred boolean not null default false,
  add column if not exists terms_version_id uuid references public.legal_document_versions(id),
  add column if not exists privacy_version_id uuid references public.legal_document_versions(id),
  add column if not exists withdrawal_notice_version_id uuid references public.legal_document_versions(id);

create table public.order_legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  document_version_id uuid references public.legal_document_versions(id),
  acceptance_kind text not null check (acceptance_kind in (
    'terms_ack',
    'privacy_ack',
    'early_performance',
    'customer_type_declaration',
    'political_sponsor'
  )),
  statement_text text not null,
  statement_version text not null,
  accepted boolean not null,
  accepted_at timestamptz not null default now(),
  actor_user_id uuid references public.profiles(id) on delete set null,
  ip_hash text,
  user_agent text
);

create index order_legal_acceptances_order_idx
  on public.order_legal_acceptances (order_id);

alter table public.order_legal_acceptances enable row level security;

create policy order_legal_acceptances_owner_read
  on public.order_legal_acceptances
  for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
    or public.is_platform_admin()
  );

revoke insert, update, delete on public.order_legal_acceptances from anon, authenticated;
grant select on public.order_legal_acceptances to authenticated;
grant all on public.order_legal_acceptances to service_role;

-- ---------------------------------------------------------------------------
-- Fulfillment: defer site.plan_code when activation_deferred
-- ---------------------------------------------------------------------------
create or replace function public.fulfill_stripe_checkout(
  p_provider_event_id text,
  p_event_type text,
  p_session_id text,
  p_customer_id text,
  p_amount_total integer,
  p_currency text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_event public.payment_events%rowtype;
  target_order public.orders%rowtype;
  site_updated integer;
  now_ts timestamptz := now();
  activation_at timestamptz;
  should_activate boolean;
begin
  if p_provider_event_id is null or length(trim(p_provider_event_id)) = 0 then
    return jsonb_build_object('ok', false, 'error', 'missing_provider_event_id');
  end if;
  if p_session_id is null or length(trim(p_session_id)) = 0 then
    return jsonb_build_object('ok', false, 'error', 'missing_session_id');
  end if;

  select *
  into existing_event
  from public.payment_events
  where provider_event_id = p_provider_event_id
  for update;

  if found then
    if existing_event.processing_status = 'processed' then
      return jsonb_build_object(
        'ok', true,
        'idempotent', true,
        'order_id', null,
        'site_id', null
      );
    end if;
  else
    begin
      insert into public.payment_events (
        provider_event_id,
        event_type,
        processing_status,
        payload_reference
      ) values (
        p_provider_event_id,
        p_event_type,
        'received',
        p_session_id
      )
      returning * into existing_event;
    exception
      when unique_violation then
        select *
        into existing_event
        from public.payment_events
        where provider_event_id = p_provider_event_id
        for update;
        if existing_event.processing_status = 'processed' then
          return jsonb_build_object(
            'ok', true,
            'idempotent', true,
            'order_id', null,
            'site_id', null
          );
        end if;
    end;
  end if;

  select *
  into target_order
  from public.orders
  where stripe_checkout_session_id = p_session_id
  for update;

  if not found then
    update public.payment_events
    set processing_status = 'failed',
        failure_reason = 'order_not_found',
        processed_at = now_ts
    where id = existing_event.id;
    return jsonb_build_object('ok', false, 'error', 'order_not_found', 'retryable', true);
  end if;

  if target_order.status = 'paid' and target_order.fulfilled_at is not null then
    update public.payment_events
    set processing_status = 'processed',
        processed_at = coalesce(processed_at, now_ts),
        failure_reason = null
    where id = existing_event.id;

    return jsonb_build_object(
      'ok', true,
      'idempotent', true,
      'order_id', target_order.id,
      'site_id', target_order.site_id
    );
  end if;

  if target_order.status is distinct from 'pending' then
    update public.payment_events
    set processing_status = 'failed',
        failure_reason = 'order_not_pending',
        processed_at = now_ts
    where id = existing_event.id;
    return jsonb_build_object('ok', false, 'error', 'order_not_pending', 'retryable', false);
  end if;

  if lower(coalesce(p_currency, '')) is distinct from 'eur' then
    update public.payment_events
    set processing_status = 'failed',
        failure_reason = 'currency_mismatch',
        processed_at = now_ts
    where id = existing_event.id;
    return jsonb_build_object('ok', false, 'error', 'currency_mismatch', 'retryable', false);
  end if;

  if p_amount_total is distinct from target_order.total_cents then
    update public.payment_events
    set processing_status = 'failed',
        failure_reason = 'amount_mismatch',
        processed_at = now_ts
    where id = existing_event.id;
    return jsonb_build_object('ok', false, 'error', 'amount_mismatch', 'retryable', false);
  end if;

  -- Immediate activation unless B2C without early performance (activation_deferred=true).
  should_activate := not coalesce(target_order.activation_deferred, false);

  if should_activate then
    activation_at := now_ts;

    update public.sites
    set plan_code = target_order.plan_code,
        updated_at = now_ts
    where id = target_order.site_id
      and owner_user_id = target_order.user_id
      and deleted_at is null;

    get diagnostics site_updated = row_count;
    if site_updated = 0 then
      update public.payment_events
      set processing_status = 'failed',
          failure_reason = 'site_not_found',
          processed_at = now_ts
      where id = existing_event.id;
      return jsonb_build_object('ok', false, 'error', 'site_not_found', 'retryable', false);
    end if;
  else
    activation_at := coalesce(target_order.public_activation_at, now_ts + interval '14 days');

    -- Ensure the site still exists; do not set plan_code yet.
    select count(*)::integer into site_updated
    from public.sites
    where id = target_order.site_id
      and owner_user_id = target_order.user_id
      and deleted_at is null;

    if site_updated = 0 then
      update public.payment_events
      set processing_status = 'failed',
          failure_reason = 'site_not_found',
          processed_at = now_ts
      where id = existing_event.id;
      return jsonb_build_object('ok', false, 'error', 'site_not_found', 'retryable', false);
    end if;
  end if;

  update public.orders
  set status = 'paid',
      paid_at = now_ts,
      fulfilled_at = now_ts,
      service_starts_at = case when should_activate then now_ts else service_starts_at end,
      public_activation_at = activation_at,
      stripe_customer_id = coalesce(nullif(trim(p_customer_id), ''), stripe_customer_id)
  where id = target_order.id;

  insert into public.audit_logs (actor_user_id, site_id, action, target_type, target_id, metadata)
  values (
    target_order.user_id,
    target_order.site_id,
    'order.fulfilled',
    'order',
    target_order.id::text,
    jsonb_build_object(
      'plan_code', target_order.plan_code,
      'stripe_checkout_session_id', p_session_id,
      'provider_event_id', p_provider_event_id,
      'total_cents', target_order.total_cents,
      'activation_deferred', not should_activate,
      'public_activation_at', activation_at
    )
  );

  insert into public.legal_audit_events (
    actor_user_id,
    actor_service,
    action,
    entity_type,
    entity_id,
    correlation_id,
    result,
    metadata
  ) values (
    target_order.user_id,
    'stripe_webhook',
    'order.fulfilled',
    'order',
    target_order.id::text,
    p_provider_event_id,
    'ok',
    jsonb_build_object(
      'activation_deferred', not should_activate,
      'public_activation_at', activation_at,
      'early_performance_requested', target_order.early_performance_requested
    )
  );

  update public.payment_events
  set processing_status = 'processed',
      processed_at = now_ts,
      failure_reason = null
  where id = existing_event.id;

  return jsonb_build_object(
    'ok', true,
    'idempotent', false,
    'order_id', target_order.id,
    'site_id', target_order.site_id,
    'plan_code', target_order.plan_code,
    'activation_deferred', not should_activate
  );
end;
$$;

-- Activate deferred paid orders whose public_activation_at has passed.
create or replace function public.activate_deferred_orders(p_limit integer default 50)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
  activated integer := 0;
  now_ts timestamptz := now();
begin
  for r in
    select o.id, o.site_id, o.user_id, o.plan_code, o.public_activation_at
    from public.orders o
    join public.sites s on s.id = o.site_id
    where o.status = 'paid'
      and o.activation_deferred = true
      and o.public_activation_at is not null
      and o.public_activation_at <= now_ts
      and s.plan_code is null
      and s.deleted_at is null
    order by o.public_activation_at asc
    limit greatest(1, least(coalesce(p_limit, 50), 200))
    for update of o skip locked
  loop
    update public.sites
    set plan_code = r.plan_code,
        updated_at = now_ts
    where id = r.site_id
      and plan_code is null
      and deleted_at is null;

    update public.orders
    set activation_deferred = false,
        service_starts_at = coalesce(service_starts_at, now_ts)
    where id = r.id;

    insert into public.legal_audit_events (
      actor_service,
      action,
      entity_type,
      entity_id,
      result,
      metadata
    ) values (
      'activation_cron',
      'order.public_activation',
      'order',
      r.id::text,
      'ok',
      jsonb_build_object(
        'site_id', r.site_id,
        'plan_code', r.plan_code,
        'public_activation_at', r.public_activation_at
      )
    );

    activated := activated + 1;
  end loop;

  return jsonb_build_object('ok', true, 'activated', activated);
end;
$$;

revoke all on function public.activate_deferred_orders(integer) from public, anon, authenticated;
grant execute on function public.activate_deferred_orders(integer) to service_role;
