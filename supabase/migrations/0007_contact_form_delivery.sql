alter table public.contact_submissions
  add column if not exists sender_phone text,
  add column if not exists request_fingerprint text;

alter table public.contact_submissions
  add constraint contact_submissions_sender_phone_length_check
    check (sender_phone is null or char_length(sender_phone) <= 40),
  add constraint contact_submissions_request_fingerprint_check
    check (request_fingerprint is null or request_fingerprint ~ '^[a-f0-9]{64}$');

create index if not exists contact_submissions_rate_limit_idx
  on public.contact_submissions (site_id, request_fingerprint, created_at desc)
  where request_fingerprint is not null;

create index if not exists contact_submissions_email_rate_limit_idx
  on public.contact_submissions (site_id, sender_email, created_at desc);
