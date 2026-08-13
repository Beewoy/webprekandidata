-- Withdrawal requests, magic-link tokens, and complaints (LB-03 / LB-04).

create table public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  site_id uuid not null references public.sites(id) on delete restrict,
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  email text not null,
  channel text not null check (channel in ('online', 'email', 'admin')),
  status text not null default 'draft' check (status in (
    'draft',
    'submitted',
    'confirmed',
    'refund_pending',
    'refunded',
    'rejected',
    'cancelled'
  )),
  statement_text text not null,
  submitted_at timestamptz,
  confirmed_at timestamptz,
  confirmation_email_sent_at timestamptz,
  refund_deadline_at timestamptz,
  refund_amount_cents integer,
  refund_currency text default 'EUR',
  stripe_refund_id text,
  refunded_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index withdrawal_requests_one_active_per_order
  on public.withdrawal_requests (order_id)
  where status in ('draft', 'submitted', 'confirmed', 'refund_pending', 'refunded');

create index withdrawal_requests_refund_deadline_idx
  on public.withdrawal_requests (refund_deadline_at)
  where status in ('confirmed', 'refund_pending');

create table public.withdrawal_tokens (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  token_hash text not null unique,
  email text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index withdrawal_tokens_order_idx on public.withdrawal_tokens (order_id);

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  complaint_number text not null unique,
  order_id uuid references public.orders(id) on delete set null,
  site_id uuid references public.sites(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  email text not null,
  channel text not null default 'online' check (channel in ('online', 'email', 'admin')),
  description text not null,
  desired_remedy text,
  status text not null default 'received' check (status in (
    'received',
    'in_progress',
    'resolved',
    'rejected',
    'withdrawn'
  )),
  received_at timestamptz not null default now(),
  confirmation_email_sent_at timestamptz,
  deadline_at timestamptz not null,
  decision_at timestamptz,
  decision_reason text,
  remedy text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence if not exists public.complaint_number_seq;

create or replace function public.next_complaint_number()
returns text
language plpgsql
as $$
begin
  return 'R-' || to_char(now() at time zone 'Europe/Bratislava', 'YYYY')
    || '-' || lpad(nextval('public.complaint_number_seq')::text, 5, '0');
end;
$$;

alter table public.complaints
  alter column complaint_number set default public.next_complaint_number();

alter table public.withdrawal_requests enable row level security;
alter table public.withdrawal_tokens enable row level security;
alter table public.complaints enable row level security;

create policy withdrawal_requests_owner_read
  on public.withdrawal_requests for select to authenticated
  using (user_id = auth.uid() or public.is_platform_admin());

create policy complaints_owner_read
  on public.complaints for select to authenticated
  using (user_id = auth.uid() or public.is_platform_admin());

revoke insert, update, delete on public.withdrawal_requests from anon, authenticated;
revoke insert, update, delete on public.withdrawal_tokens from anon, authenticated;
revoke insert, update, delete on public.complaints from anon, authenticated;
grant select on public.withdrawal_requests to authenticated;
grant select on public.complaints to authenticated;
grant all on public.withdrawal_requests to service_role;
grant all on public.withdrawal_tokens to service_role;
grant all on public.complaints to service_role;
