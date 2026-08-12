-- Human-readable order numbers and confirmation-email idempotency.

create sequence public.order_number_seq;

create or replace function public.next_order_number()
returns text
language sql
volatile
set search_path = ''
as $$
  select 'WPK-'
    || to_char(timezone('Europe/Bratislava', now()), 'YYYY')
    || '-'
    || lpad(nextval('public.order_number_seq')::text, 5, '0');
$$;

alter table public.orders
  add column order_number text,
  add column confirmation_email_sent_at timestamptz;

-- Backfill existing rows in creation order so numbers stay chronological.
do $$
declare
  r record;
begin
  for r in
    select id
    from public.orders
    where order_number is null
    order by created_at asc, id asc
  loop
    update public.orders
    set order_number = public.next_order_number()
    where id = r.id;
  end loop;
end $$;

alter table public.orders
  alter column order_number set default public.next_order_number(),
  alter column order_number set not null;

create unique index orders_order_number_unique
  on public.orders(order_number);

-- Return order_number from admin grant for confirmation email wiring.
create or replace function public.admin_grant_site_plan(
  p_site_id uuid,
  p_plan_code public.plan_code,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_site public.sites%rowtype;
  order_id uuid;
  order_number text;
  total_cents integer;
  reason text := trim(coalesce(p_reason, ''));
  previous_plan public.plan_code;
  now_ts timestamptz := now();
begin
  if not public.is_platform_admin() then
    raise exception 'admin_access_denied' using errcode = '42501';
  end if;

  if p_plan_code is null or p_plan_code not in ('basic'::public.plan_code, 'plus'::public.plan_code) then
    raise exception 'invalid_plan_code' using errcode = '22023';
  end if;

  if char_length(reason) < 8 or char_length(reason) > 2000 then
    raise exception 'invalid_reason' using errcode = '22023';
  end if;

  select *
  into target_site
  from public.sites
  where id = p_site_id and deleted_at is null
  for update;

  if not found then
    raise exception 'site_not_found' using errcode = 'P0002';
  end if;

  previous_plan := target_site.plan_code;
  total_cents := case p_plan_code
    when 'basic'::public.plan_code then 4999
    when 'plus'::public.plan_code then 8999
  end;

  insert into public.orders (
    site_id,
    user_id,
    status,
    currency,
    total_cents,
    plan_code,
    valid_until,
    buyer_snapshot,
    seller_snapshot,
    paid_at,
    fulfilled_at
  ) values (
    target_site.id,
    target_site.owner_user_id,
    'paid'::public.order_status,
    'EUR',
    total_cents,
    p_plan_code,
    null,
    jsonb_build_object(
      'source', 'admin_grant',
      'granted_by', auth.uid(),
      'reason', reason,
      'previous_plan', previous_plan
    ),
    jsonb_build_object(
      'source', 'admin_grant',
      'name', 'Ing. Tibor Antal'
    ),
    now_ts,
    now_ts
  )
  returning id, order_number into order_id, order_number;

  update public.sites
  set plan_code = p_plan_code,
      updated_at = now_ts
  where id = target_site.id;

  insert into public.audit_logs (actor_user_id, site_id, action, target_type, target_id, metadata)
  values (
    auth.uid(),
    target_site.id,
    'admin_plan_granted',
    'order',
    order_id::text,
    jsonb_build_object(
      'plan_code', p_plan_code,
      'previous_plan', previous_plan,
      'reason', reason,
      'order_id', order_id,
      'order_number', order_number,
      'total_cents', total_cents,
      'owner_user_id', target_site.owner_user_id
    )
  );

  return jsonb_build_object(
    'ok', true,
    'order_id', order_id,
    'order_number', order_number,
    'site_id', target_site.id,
    'plan_code', p_plan_code,
    'previous_plan', previous_plan
  );
end;
$$;

revoke all on function public.admin_grant_site_plan(uuid, public.plan_code, text) from public;
grant execute on function public.admin_grant_site_plan(uuid, public.plan_code, text) to authenticated;
