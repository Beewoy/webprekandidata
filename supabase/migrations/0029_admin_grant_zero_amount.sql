-- Admin-granted plans are complimentary: store total_cents = 0 (status stays paid for entitlement).
-- Existing rows keep catalog amounts; UI detects grants via buyer_snapshot.source = 'admin_grant'.

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
  v_order_id uuid;
  v_order_number text;
  total_cents integer := 0;
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
  returning id, order_number into v_order_id, v_order_number;

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
    v_order_id::text,
    jsonb_build_object(
      'plan_code', p_plan_code,
      'previous_plan', previous_plan,
      'reason', reason,
      'order_id', v_order_id,
      'order_number', v_order_number,
      'total_cents', total_cents,
      'owner_user_id', target_site.owner_user_id
    )
  );

  return jsonb_build_object(
    'ok', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'site_id', target_site.id,
    'plan_code', p_plan_code,
    'previous_plan', previous_plan
  );
end;
$$;

revoke all on function public.admin_grant_site_plan(uuid, public.plan_code, text) from public;
grant execute on function public.admin_grant_site_plan(uuid, public.plan_code, text) to authenticated;
