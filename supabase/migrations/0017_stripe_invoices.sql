-- Persist Stripe post-purchase invoices without coupling them to plan fulfillment.

alter table public.orders
  add column stripe_invoice_id text,
  add column stripe_invoice_pdf_url text,
  add column stripe_hosted_invoice_url text;

create unique index orders_stripe_invoice_id_unique
  on public.orders(stripe_invoice_id)
  where stripe_invoice_id is not null;

create or replace function public.record_stripe_invoice(
  p_provider_event_id text,
  p_event_type text,
  p_order_id uuid,
  p_customer_id text,
  p_invoice_id text,
  p_invoice_pdf_url text,
  p_hosted_invoice_url text
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
  if p_provider_event_id is null or length(trim(p_provider_event_id)) = 0 then
    return jsonb_build_object('ok', false, 'error', 'missing_provider_event_id');
  end if;
  if p_invoice_id is null or length(trim(p_invoice_id)) = 0 then
    return jsonb_build_object('ok', false, 'error', 'missing_invoice_id', 'retryable', false);
  end if;
  if p_customer_id is null or length(trim(p_customer_id)) = 0 then
    return jsonb_build_object('ok', false, 'error', 'missing_customer_id', 'retryable', false);
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
        p_invoice_id
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
  where id = p_order_id
  for update;

  if not found then
    update public.payment_events
    set processing_status = 'failed',
        failure_reason = 'order_not_found',
        processed_at = now_ts
    where id = existing_event.id;
    return jsonb_build_object('ok', false, 'error', 'order_not_found', 'retryable', true);
  end if;

  if target_order.stripe_customer_id is not null
    and target_order.stripe_customer_id is distinct from trim(p_customer_id) then
    update public.payment_events
    set processing_status = 'failed',
        failure_reason = 'customer_mismatch',
        processed_at = now_ts
    where id = existing_event.id;
    return jsonb_build_object('ok', false, 'error', 'customer_mismatch', 'retryable', false);
  end if;

  if target_order.stripe_invoice_id is not null
    and target_order.stripe_invoice_id is distinct from trim(p_invoice_id) then
    update public.payment_events
    set processing_status = 'failed',
        failure_reason = 'invoice_mismatch',
        processed_at = now_ts
    where id = existing_event.id;
    return jsonb_build_object('ok', false, 'error', 'invoice_mismatch', 'retryable', false);
  end if;

  update public.orders
  set stripe_customer_id = coalesce(stripe_customer_id, trim(p_customer_id)),
      stripe_invoice_id = trim(p_invoice_id),
      stripe_invoice_pdf_url = nullif(trim(p_invoice_pdf_url), ''),
      stripe_hosted_invoice_url = nullif(trim(p_hosted_invoice_url), '')
  where id = target_order.id;

  update public.payment_events
  set processing_status = 'processed',
      processed_at = now_ts,
      failure_reason = null
  where id = existing_event.id;

  return jsonb_build_object(
    'ok', true,
    'idempotent', false,
    'order_id', target_order.id,
    'invoice_id', trim(p_invoice_id)
  );
end;
$$;

revoke all on function public.record_stripe_invoice(text, text, uuid, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.record_stripe_invoice(text, text, uuid, text, text, text, text)
  to service_role;
