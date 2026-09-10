-- Optional fictional demo data for local development.
-- This seed never creates auth users. It inserts rows only when at least one
-- user already exists, and it is safe to rerun because IDs are deterministic.

do $$
declare
  demo_user_id uuid;
  seed_company_id constant uuid := '10000000-0000-4000-8000-000000000001';
  seed_application_id constant uuid := '20000000-0000-4000-8000-000000000001';
  seed_contact_id constant uuid := '30000000-0000-4000-8000-000000000001';
  seed_interview_id constant uuid := '40000000-0000-4000-8000-000000000001';
  seed_document_id constant uuid := '60000000-0000-4000-8000-000000000001';
begin
  select id into demo_user_id from auth.users order by created_at limit 1;

  if demo_user_id is null then
    raise notice 'JobTrack seed skipped: create a local auth user first, then run supabase db reset again.';
    return;
  end if;

  insert into public.profiles (id, display_name)
  values (demo_user_id, 'Demo Candidate')
  on conflict (id) do nothing;

  insert into public.companies (id, user_id, name, website, location, industry, notes)
  values (
    seed_company_id,
    demo_user_id,
    'Northstar Paperworks',
    'https://example.com/northstar-paperworks',
    'Bandung, Indonesia',
    'Document software',
    'Fictional company used only for local demonstrations.'
  )
  on conflict (id) do nothing;

  insert into public.applications (
    id, user_id, company_id, role_title, status, employment_type,
    workplace_type, location, job_url, source, salary_min, salary_max,
    salary_currency, applied_at, job_description, notes
  )
  values (
    seed_application_id,
    demo_user_id,
    seed_company_id,
    'Frontend Engineer',
    'interview',
    'full_time',
    'hybrid',
    'Bandung, Indonesia',
    'https://example.com/jobs/frontend-engineer-demo',
    'Fictional referral',
    180000000,
    240000000,
    'IDR',
    now() - interval '10 days',
    'Build accessible interfaces for a fictional document workflow product.',
    'Demo application. All names and details are fictional.'
  )
  on conflict (id) do nothing;

  update public.application_status_history
  set from_status = null,
      to_status = 'saved',
      changed_at = now() - interval '14 days',
      note = 'Fictional role saved for review.'
  where application_status_history.user_id = demo_user_id
    and application_status_history.application_id = seed_application_id
    and application_status_history.from_status is null;

  update public.application_status_history
  set changed_at = transition.changed_at,
      note = transition.note
  from (
    values
      (
        'saved'::public.application_status,
        'preparing'::public.application_status,
        now() - interval '12 days',
        'Fictional application materials prepared.'::text
      ),
      (
        'preparing'::public.application_status,
        'applied'::public.application_status,
        now() - interval '10 days',
        'Fictional application submitted.'::text
      ),
      (
        'applied'::public.application_status,
        'screening'::public.application_status,
        now() - interval '7 days',
        'Fictional recruiter screen completed.'::text
      ),
      (
        'screening'::public.application_status,
        'interview'::public.application_status,
        now() - interval '1 day',
        'Fictional technical interview scheduled.'::text
      )
  ) as transition(from_status, to_status, changed_at, note)
  where application_status_history.user_id = demo_user_id
    and application_status_history.application_id = seed_application_id
    and application_status_history.from_status = transition.from_status
    and application_status_history.to_status = transition.to_status;

  insert into public.application_status_history (
    user_id, application_id, from_status, to_status, changed_at, note
  )
  select
    demo_user_id,
    seed_application_id,
    transition.from_status,
    transition.to_status,
    transition.changed_at,
    transition.note
  from (
    values
      (
        'saved'::public.application_status,
        'preparing'::public.application_status,
        now() - interval '12 days',
        'Fictional application materials prepared.'::text
      ),
      (
        'preparing'::public.application_status,
        'applied'::public.application_status,
        now() - interval '10 days',
        'Fictional application submitted.'::text
      ),
      (
        'applied'::public.application_status,
        'screening'::public.application_status,
        now() - interval '7 days',
        'Fictional recruiter screen completed.'::text
      ),
      (
        'screening'::public.application_status,
        'interview'::public.application_status,
        now() - interval '1 day',
        'Fictional technical interview scheduled.'::text
      )
  ) as transition(from_status, to_status, changed_at, note)
  where not exists (
    select 1
    from public.application_status_history
    where application_status_history.user_id = demo_user_id
      and application_status_history.application_id = seed_application_id
      and application_status_history.from_status = transition.from_status
      and application_status_history.to_status = transition.to_status
  );

  update public.applications
  set status = 'interview'
  where id = seed_application_id
    and user_id = demo_user_id
    and status <> 'interview';

  insert into public.contacts (
    id, user_id, application_id, name, contact_type, title, email, notes
  )
  values (
    seed_contact_id,
    demo_user_id,
    seed_application_id,
    'Maya Hartono',
    'recruiter',
    'Talent Partner',
    'maya.hartono@example.com',
    'Fictional contact; do not send email.'
  )
  on conflict (id) do nothing;

  insert into public.interviews (
    id, user_id, application_id, interview_type, starts_at, ends_at,
    timezone, meeting_url, outcome, notes
  )
  values (
    seed_interview_id,
    demo_user_id,
    seed_application_id,
    'technical',
    now() + interval '3 days',
    now() + interval '3 days 1 hour',
    'Asia/Jakarta',
    'https://example.com/meet/fictional-jobtrack-demo',
    'pending',
    'Prepare an accessibility review and a small TypeScript exercise.'
  )
  on conflict (id) do nothing;

  insert into public.calendar_events (
    id, user_id, application_id, event_type, title, starts_at, ends_at,
    location, description
  )
  values (
    '70000000-0000-4000-8000-000000000001',
    demo_user_id,
    seed_application_id,
    'interview',
    'Northstar Paperworks technical interview',
    now() + interval '3 days',
    now() + interval '3 days 1 hour',
    'Fictional video meeting',
    'Demo calendar event linked to the fictional application.'
  )
  on conflict (id) do nothing;

  insert into public.tasks (
    id, user_id, application_id, title, description, priority, status, due_at
  )
  values (
    '80000000-0000-4000-8000-000000000001',
    demo_user_id,
    seed_application_id,
    'Review accessibility examples',
    'Prepare two fictional examples before the technical discussion.',
    'high',
    'todo',
    now() + interval '2 days'
  )
  on conflict (id) do nothing;

  insert into public.documents (
    id, user_id, application_id, document_type, name, file_name, storage_path,
    mime_type, size_bytes, version, extracted_text
  )
  values (
    seed_document_id,
    demo_user_id,
    seed_application_id,
    'resume',
    'Fictional frontend resume',
    'fictional-cv.txt',
    demo_user_id::text || '/demo/fictional-cv.txt',
    'text/plain',
    0,
    1,
    'Metadata-only seed record. No Storage object is created.'
  )
  on conflict (id) do nothing;

  insert into public.document_applications (user_id, document_id, application_id)
  values (demo_user_id, seed_document_id, seed_application_id)
  on conflict (document_id, application_id) do nothing;

  insert into public.activities (
    id, user_id, application_id, contact_id, activity_type, title, body, occurred_at
  )
  values (
    '50000000-0000-4000-8000-000000000001',
    demo_user_id,
    seed_application_id,
    seed_contact_id,
    'email',
    'Technical interview scheduled',
    'Fictional recruiter confirmed the technical interview time.',
    now() - interval '1 day'
  )
  on conflict (id) do nothing;
end
$$;
