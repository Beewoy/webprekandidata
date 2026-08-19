-- Migration 0029 stores admin grants with total_cents = 0, but the original
-- orders.total_cents check only allowed catalog prices (4999, 8999).

alter table public.orders
  drop constraint if exists orders_total_cents_check;

alter table public.orders
  add constraint orders_total_cents_check
  check (total_cents in (0, 4999, 8999));
