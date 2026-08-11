insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'candidate-media',
  'candidate-media',
  false,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.storage_object_site_id(object_name text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
declare
  first_folder text;
begin
  first_folder := (storage.foldername(object_name))[1];
  return first_folder::uuid;
exception
  when invalid_text_representation then
    return null;
end;
$$;

revoke all on function public.storage_object_site_id(text) from public;
grant execute on function public.storage_object_site_id(text) to authenticated;

create policy "candidate_media_owner_read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'candidate-media'
  and public.owns_site(public.storage_object_site_id(name))
);

create policy "candidate_media_owner_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'candidate-media'
  and public.owns_site(public.storage_object_site_id(name))
);

create policy "candidate_media_owner_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'candidate-media'
  and public.owns_site(public.storage_object_site_id(name))
)
with check (
  bucket_id = 'candidate-media'
  and public.owns_site(public.storage_object_site_id(name))
);

create policy "candidate_media_owner_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'candidate-media'
  and public.owns_site(public.storage_object_site_id(name))
);
