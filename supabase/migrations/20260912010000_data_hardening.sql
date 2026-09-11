begin;

create or replace function public.tags_items_within_limit(input_tags text[])
returns boolean
language plpgsql
immutable
as $$
declare
  item text;
begin
  if input_tags is null then return true; end if;
  foreach item in array input_tags loop
    if char_length(item) > 80 then return false; end if;
  end loop;
  return true;
end;
$$;

alter table public.companies
  add constraint companies_name_trimmed_not_empty check (name = btrim(name));

alter table public.applications
  add constraint applications_tags_count_limit check (coalesce(array_length(tags, 1), 0) <= 30),
  add constraint applications_tags_item_length check (public.tags_items_within_limit(tags)),
  add constraint applications_description_length check (job_description is null or char_length(job_description) <= 30000),
  add constraint applications_notes_length check (notes is null or char_length(notes) <= 30000);

alter table public.activities
  add constraint activities_body_length check (body is null or char_length(body) <= 30000);

alter table public.contacts
  add constraint contacts_phone_length check (phone is null or char_length(phone) <= 40);

alter table public.documents
  add constraint documents_extracted_text_length check (extracted_text is null or char_length(extracted_text) <= 1000000);

create index if not exists activities_application_occurred_idx
  on public.activities (user_id, application_id, occurred_at desc);
create index if not exists tasks_user_due_idx
  on public.tasks (user_id, due_at)
  where due_at is not null and status <> 'done';
create index if not exists documents_user_updated_idx
  on public.documents (user_id, updated_at desc);

commit;
