-- Idempotent Stripe Checkout fulfillment and terminal session status updates.
-- Callable only via service_role (webhook / server admin client).

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

  update public.orders
  set status = 'paid',
      paid_at = now_ts,
      fulfilled_at = now_ts,
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
      'total_cents', target_order.total_cents
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
    'plan_code', target_order.plan_code
  );
end;
$$;

create or replace function public.mark_checkout_session_status(
  p_provider_event_id text,
  p_event_type text,
  p_session_id text,
  p_status public.order_status
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_event public.payment_events%rowtype;
  target_order public.orders%rowtype;
  now_ts timestamptz := now();
begin
  if p_status not in ('failed', 'cancelled') then
    return jsonb_build_object('ok', false, 'error', 'invalid_terminal_status');
  end if;
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
      return jsonb_build_object('ok', true, 'idempotent', true);
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
          return jsonb_build_object('ok', true, 'idempotent', true);
        end if;
    end;
  end if;

  select *
  into target_order
  from public.orders
  where stripe_checkout_session_id = p_session_id
  for update;

  if found and target_order.status = 'pending' then
    update public.orders
    set status = p_status
    where id = target_order.id;
  end if;

  update public.payment_events
  set processing_status = 'processed',
      processed_at = now_ts,
      failure_reason = null
  where id = existing_event.id;

  return jsonb_build_object(
    'ok', true,
    'idempotent', false,
    'order_id', target_order.id,
    'status', p_status
  );
end;
$$;

revoke all on function public.fulfill_stripe_checkout(text, text, text, text, integer, text) from public, anon, authenticated;
revoke all on function public.mark_checkout_session_status(text, text, text, public.order_status) from public, anon, authenticated;

grant execute on function public.fulfill_stripe_checkout(text, text, text, text, integer, text) to service_role;
grant execute on function public.mark_checkout_session_status(text, text, text, public.order_status) to service_role;
