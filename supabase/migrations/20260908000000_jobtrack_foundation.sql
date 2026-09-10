-- JobTrack database foundation.
-- Apply with `supabase db push`; never expose the service-role key to clients.

begin;

create extension if not exists pgcrypto with schema extensions;

create type public.application_status as enum (
  'saved',
  'preparing',
  'applied',
  'screening',
  'interview',
  'technical_test',
  'offer',
  'accepted',
  'rejected',
  'withdrawn'
);

create type public.employment_type as enum (
  'full_time',
  'part_time',
  'contract',
  'temporary',
  'internship',
  'freelance',
  'other'
);

create type public.workplace_type as enum ('remote', 'hybrid', 'onsite', 'unspecified');
create type public.salary_period as enum ('hour', 'month', 'year');
create type public.document_type as enum ('resume', 'cover_letter', 'portfolio', 'certificate', 'job_description', 'offer', 'other');
create type public.contact_type as enum ('recruiter', 'hiring_manager', 'referral', 'interviewer', 'other');
create type public.interview_type as enum ('phone_screen', 'recruiter_screen', 'technical', 'behavioral', 'panel', 'case_study', 'onsite', 'other');
create type public.interview_outcome as enum ('pending', 'passed', 'failed', 'cancelled', 'rescheduled');
create type public.calendar_event_type as enum ('interview', 'deadline', 'follow_up', 'networking', 'other');
create type public.task_priority as enum ('low', 'medium', 'high');
create type public.task_status as enum ('todo', 'in_progress', 'done');
create type public.activity_type as enum ('note', 'email', 'call', 'interview', 'task', 'status_change', 'other');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  timezone text not null default 'UTC',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (display_name is null or char_length(display_name) between 1 and 120),
  constraint profiles_timezone_length check (char_length(timezone) between 1 and 64)
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  name text not null,
  website text,
  location text,
  industry text,
  size text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_name_length check (char_length(btrim(name)) between 1 and 200),
  constraint companies_website_length check (website is null or char_length(website) <= 2048),
  constraint companies_user_id_id_unique unique (user_id, id)
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  company_id uuid,
  role_title text not null,
  status public.application_status not null default 'saved',
  employment_type public.employment_type,
  workplace_type public.workplace_type not null default 'unspecified',
  location text,
  job_url text,
  source text,
  salary_min numeric(14,2),
  salary_max numeric(14,2),
  salary_currency text,
  salary_period public.salary_period,
  applied_at timestamptz,
  deadline_at timestamptz,
  archived_at timestamptz,
  job_description text,
  tags text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_role_title_length check (char_length(btrim(role_title)) between 1 and 200),
  constraint applications_job_url_length check (job_url is null or char_length(job_url) <= 2048),
  constraint applications_salary_nonnegative check (salary_min is null or salary_min >= 0),
  constraint applications_salary_max_nonnegative check (salary_max is null or salary_max >= 0),
  constraint applications_salary_order check (salary_min is null or salary_max is null or salary_min <= salary_max),
  constraint applications_salary_currency check (salary_currency is null or salary_currency ~ '^[A-Z]{3}$'),
  constraint applications_user_id_id_unique unique (user_id, id),
  constraint applications_company_owner_fk foreign key (user_id, company_id)
    references public.companies(user_id, id) on delete set null (company_id)
);

create table public.application_status_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  application_id uuid not null,
  from_status public.application_status,
  to_status public.application_status not null,
  changed_at timestamptz not null default now(),
  note text,
  constraint status_history_real_transition check (from_status is null or from_status <> to_status),
  constraint status_history_application_owner_fk foreign key (user_id, application_id)
    references public.applications(user_id, id) on delete cascade
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  application_id uuid not null,
  name text not null,
  contact_type public.contact_type not null default 'other',
  title text,
  email text,
  phone text,
  linkedin_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contacts_name_length check (char_length(btrim(name)) between 1 and 160),
  constraint contacts_email_length check (email is null or char_length(email) <= 320),
  constraint contacts_linkedin_url_length check (linkedin_url is null or char_length(linkedin_url) <= 2048),
  constraint contacts_user_id_id_unique unique (user_id, id),
  constraint contacts_application_owner_fk foreign key (user_id, application_id)
    references public.applications(user_id, id) on delete cascade
);

create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  application_id uuid not null,
  interview_type public.interview_type not null default 'other',
  starts_at timestamptz not null,
  ends_at timestamptz,
  timezone text not null default 'UTC',
  location text,
  meeting_url text,
  outcome public.interview_outcome not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint interviews_time_order check (ends_at is null or starts_at < ends_at),
  constraint interviews_timezone_length check (char_length(timezone) between 1 and 64),
  constraint interviews_meeting_url_length check (meeting_url is null or char_length(meeting_url) <= 2048),
  constraint interviews_user_id_id_unique unique (user_id, id),
  constraint interviews_application_owner_fk foreign key (user_id, application_id)
    references public.applications(user_id, id) on delete cascade
);

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  application_id uuid,
  event_type public.calendar_event_type not null default 'other',
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean not null default false,
  location text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint calendar_events_title_length check (char_length(btrim(title)) between 1 and 200),
  constraint calendar_events_time_order check (starts_at < ends_at),
  constraint calendar_events_application_owner_fk foreign key (user_id, application_id)
    references public.applications(user_id, id) on delete set null (application_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  application_id uuid,
  title text not null,
  description text,
  priority public.task_priority not null default 'medium',
  status public.task_status not null default 'todo',
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_title_length check (char_length(btrim(title)) between 1 and 200),
  constraint tasks_completion_state check (
    (status = 'done' and completed_at is not null) or
    (status <> 'done' and completed_at is null)
  ),
  constraint tasks_application_owner_fk foreign key (user_id, application_id)
    references public.applications(user_id, id) on delete set null (application_id)
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  application_id uuid,
  document_type public.document_type not null default 'other',
  name text not null,
  file_name text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  version integer not null default 1,
  extracted_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint documents_name_length check (char_length(btrim(name)) between 1 and 200),
  constraint documents_file_name_length check (char_length(btrim(file_name)) between 1 and 255),
  constraint documents_owner_path check (storage_path like user_id::text || '/%'),
  constraint documents_size_nonnegative check (size_bytes is null or size_bytes >= 0),
  constraint documents_version_positive check (version > 0),
  constraint documents_storage_path_unique unique (storage_path),
  constraint documents_user_id_id_unique unique (user_id, id),
  constraint documents_application_owner_fk foreign key (user_id, application_id)
    references public.applications(user_id, id) on delete set null (application_id)
);

create table public.document_applications (
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  document_id uuid not null,
  application_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (document_id, application_id),
  constraint document_applications_document_owner_fk foreign key (user_id, document_id)
    references public.documents(user_id, id) on delete cascade,
  constraint document_applications_application_owner_fk foreign key (user_id, application_id)
    references public.applications(user_id, id) on delete cascade
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  application_id uuid not null,
  contact_id uuid,
  interview_id uuid,
  activity_type public.activity_type not null default 'note',
  title text not null,
  body text,
  occurred_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activities_title_length check (char_length(btrim(title)) between 1 and 200),
  constraint activities_completed_order check (completed_at is null or completed_at >= occurred_at),
  constraint activities_application_owner_fk foreign key (user_id, application_id)
    references public.applications(user_id, id) on delete cascade,
  constraint activities_contact_owner_fk foreign key (user_id, contact_id)
    references public.contacts(user_id, id) on delete set null (contact_id),
  constraint activities_interview_owner_fk foreign key (user_id, interview_id)
    references public.interviews(user_id, id) on delete set null (interview_id)
);

create index companies_user_name_idx on public.companies (user_id, lower(name));
create index applications_user_status_updated_idx on public.applications (user_id, status, updated_at desc);
create index applications_user_active_updated_idx on public.applications (user_id, updated_at desc)
where archived_at is null;
create index applications_user_archived_idx on public.applications (user_id, archived_at desc)
where archived_at is not null;
create index applications_user_company_idx on public.applications (user_id, company_id) where company_id is not null;
create index applications_user_deadline_idx on public.applications (user_id, deadline_at) where deadline_at is not null;
create index applications_user_applied_idx on public.applications (user_id, applied_at desc) where applied_at is not null;
create index status_history_application_changed_idx on public.application_status_history (application_id, changed_at desc);
create index contacts_application_idx on public.contacts (application_id, name);
create index interviews_application_starts_idx on public.interviews (application_id, starts_at);
create index interviews_user_upcoming_idx on public.interviews (user_id, starts_at) where outcome in ('pending', 'rescheduled');
create index calendar_events_user_starts_idx on public.calendar_events (user_id, starts_at);
create index calendar_events_application_idx on public.calendar_events (application_id, starts_at) where application_id is not null;
create index tasks_user_status_due_idx on public.tasks (user_id, status, due_at);
create index tasks_application_idx on public.tasks (application_id, status) where application_id is not null;
create index documents_application_idx on public.documents (application_id, document_type) where application_id is not null;
create index documents_user_type_idx on public.documents (user_id, document_type, created_at desc);
create index document_applications_user_application_idx on public.document_applications (user_id, application_id);
create index activities_application_occurred_idx on public.activities (application_id, occurred_at desc);
create index activities_user_occurred_idx on public.activities (user_id, occurred_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger companies_set_updated_at before update on public.companies
for each row execute function public.set_updated_at();
create trigger applications_set_updated_at before update on public.applications
for each row execute function public.set_updated_at();
create trigger contacts_set_updated_at before update on public.contacts
for each row execute function public.set_updated_at();
create trigger interviews_set_updated_at before update on public.interviews
for each row execute function public.set_updated_at();
create trigger calendar_events_set_updated_at before update on public.calendar_events
for each row execute function public.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks
for each row execute function public.set_updated_at();
create trigger documents_set_updated_at before update on public.documents
for each row execute function public.set_updated_at();
create trigger activities_set_updated_at before update on public.activities
for each row execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Backfill profiles if this migration is applied to an existing project.
insert into public.profiles (id, display_name)
select id, nullif(coalesce(raw_user_meta_data ->> 'display_name', raw_user_meta_data ->> 'full_name'), '')
from auth.users
on conflict (id) do nothing;

create function public.maintain_application_applied_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and old.applied_at is not null then
    new.applied_at := old.applied_at;
  elsif new.applied_at is null and new.status in (
    'applied',
    'screening',
    'interview',
    'technical_test',
    'offer',
    'accepted',
    'rejected',
    'withdrawn'
  ) then
    new.applied_at := now();
  end if;

  return new;
end;
$$;

create trigger applications_maintain_applied_at
before insert or update of status, applied_at on public.applications
for each row execute function public.maintain_application_applied_at();

create function public.record_application_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  transition_note text;
begin
  if new.user_id <> (select auth.uid())
    and coalesce((select auth.jwt() ->> 'role'), '') <> 'service_role' then
    raise exception 'Application access denied' using errcode = '42501';
  end if;

  transition_note := nullif(
    left(btrim(current_setting('jobtrack.application_status_change_note', true)), 2000),
    ''
  );

  if tg_op = 'INSERT' then
    insert into public.application_status_history (
      user_id,
      application_id,
      from_status,
      to_status,
      note
    )
    values (new.user_id, new.id, null, new.status, transition_note);
  elsif new.status is distinct from old.status then
    insert into public.application_status_history (
      user_id,
      application_id,
      from_status,
      to_status,
      note
    )
    values (new.user_id, new.id, old.status, new.status, transition_note);
  end if;
  return new;
end;
$$;

create trigger applications_record_status
after insert or update of status on public.applications
for each row execute function public.record_application_status_change();

create function public.change_application_status(
  application_id uuid,
  new_status public.application_status,
  change_note text default null
)
returns public.applications
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_application public.applications;
  changed_application public.applications;
begin
  select applications.*
  into current_application
  from public.applications
  where applications.id = change_application_status.application_id
    and applications.user_id = (select auth.uid())
  for update;

  if current_application.id is null then
    raise exception 'Application not found or access denied' using errcode = 'P0002';
  end if;

  if current_application.status is not distinct from change_application_status.new_status then
    return current_application;
  end if;

  perform set_config(
    'jobtrack.application_status_change_note',
    coalesce(nullif(left(btrim(change_application_status.change_note), 2000), ''), ''),
    true
  );

  update public.applications
  set status = change_application_status.new_status
  where applications.id = current_application.id
    and applications.user_id = current_application.user_id
  returning * into changed_application;

  perform set_config('jobtrack.application_status_change_note', '', true);

  return changed_application;
end;
$$;

revoke all on function public.change_application_status(uuid, public.application_status, text) from public;
grant execute on function public.change_application_status(uuid, public.application_status, text) to authenticated;

create function public.set_application_archived(
  application_id uuid,
  archived boolean
)
returns public.applications
language plpgsql
security invoker
set search_path = ''
strict
as $$
declare
  changed_application public.applications;
begin
  if set_application_archived.archived is null then
    raise exception 'Archived must not be null' using errcode = '22004';
  end if;

  update public.applications
  set archived_at = case
    when set_application_archived.archived then coalesce(applications.archived_at, now())
    else null
  end
  where applications.id = set_application_archived.application_id
    and applications.user_id = (select auth.uid())
  returning * into changed_application;

  if changed_application.id is null then
    raise exception 'Application not found or access denied' using errcode = 'P0002';
  end if;

  return changed_application;
end;
$$;

revoke all on function public.set_application_archived(uuid, boolean) from public;
grant execute on function public.set_application_archived(uuid, boolean) to authenticated;

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.applications enable row level security;
alter table public.application_status_history enable row level security;
alter table public.contacts enable row level security;
alter table public.interviews enable row level security;
alter table public.calendar_events enable row level security;
alter table public.tasks enable row level security;
alter table public.documents enable row level security;
alter table public.document_applications enable row level security;
alter table public.activities enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated
using ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "companies_select_own" on public.companies for select to authenticated
using ((select auth.uid()) = user_id);
create policy "companies_insert_own" on public.companies for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "companies_update_own" on public.companies for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "companies_delete_own" on public.companies for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "applications_select_own" on public.applications for select to authenticated
using ((select auth.uid()) = user_id);
create policy "applications_insert_own" on public.applications for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and (
    company_id is null
    or exists (
      select 1
      from public.companies
      where companies.user_id = applications.user_id
        and companies.id = applications.company_id
    )
  )
);
create policy "applications_update_own" on public.applications for update to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and (
    company_id is null
    or exists (
      select 1
      from public.companies
      where companies.user_id = applications.user_id
        and companies.id = applications.company_id
    )
  )
);
create policy "applications_delete_own" on public.applications for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "status_history_select_own" on public.application_status_history for select to authenticated
using ((select auth.uid()) = user_id);
-- History writes are trigger/function controlled; clients cannot edit audit records.

create policy "contacts_select_own" on public.contacts for select to authenticated
using ((select auth.uid()) = user_id);
create policy "contacts_insert_own" on public.contacts for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "contacts_update_own" on public.contacts for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "contacts_delete_own" on public.contacts for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "interviews_select_own" on public.interviews for select to authenticated
using ((select auth.uid()) = user_id);
create policy "interviews_insert_own" on public.interviews for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "interviews_update_own" on public.interviews for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "interviews_delete_own" on public.interviews for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "calendar_events_select_own" on public.calendar_events for select to authenticated
using ((select auth.uid()) = user_id);
create policy "calendar_events_insert_own" on public.calendar_events for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "calendar_events_update_own" on public.calendar_events for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "calendar_events_delete_own" on public.calendar_events for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "tasks_select_own" on public.tasks for select to authenticated
using ((select auth.uid()) = user_id);
create policy "tasks_insert_own" on public.tasks for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "tasks_update_own" on public.tasks for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "tasks_delete_own" on public.tasks for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "documents_select_own" on public.documents for select to authenticated
using ((select auth.uid()) = user_id);
create policy "documents_insert_own" on public.documents for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "documents_update_own" on public.documents for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "documents_delete_own" on public.documents for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "document_applications_select_own" on public.document_applications for select to authenticated
using ((select auth.uid()) = user_id);
create policy "document_applications_insert_own" on public.document_applications for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "document_applications_delete_own" on public.document_applications for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "activities_select_own" on public.activities for select to authenticated
using ((select auth.uid()) = user_id);
create policy "activities_insert_own" on public.activities for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "activities_update_own" on public.activities for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "activities_delete_own" on public.activities for delete to authenticated
using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Object names must be `<auth.uid()>/<uuid-or-folder>/filename.ext`.
create policy "documents_storage_select_own" on storage.objects for select to authenticated
using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "documents_storage_insert_own" on storage.objects for insert to authenticated
with check (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "documents_storage_update_own" on storage.objects for update to authenticated
using (bucket_id = 'documents' and owner_id = (select auth.uid())::text)
with check (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "documents_storage_delete_own" on storage.objects for delete to authenticated
using (bucket_id = 'documents' and owner_id = (select auth.uid())::text);

commit;
