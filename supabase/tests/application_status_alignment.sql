begin;

create extension if not exists pgtap with schema extensions;

select plan(30);

select is(
  (
    select array_agg(enumlabel order by enumsortorder)::text
    from pg_enum
    where enumtypid = 'public.application_status'::regtype
  ),
  '{saved,preparing,applied,screening,interview,technical_test,offer,accepted,rejected,withdrawn}',
  'application_status has the canonical ordered values'
);

select is(
  (
    select column_default
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'applications'
      and column_name = 'status'
  ),
  '''saved''::application_status',
  'applications default to saved'
);

select volatility_is(
  'public',
  'change_application_status',
  array['uuid', 'public.application_status', 'text'],
  'v',
  'change_application_status is volatile'
);

select is(
  (
    select prosecdef
    from pg_proc
    where oid = 'public.change_application_status(uuid, public.application_status, text)'::regprocedure
  ),
  false,
  'change_application_status is security invoker'
);

select volatility_is(
  'public',
  'set_application_archived',
  array['uuid', 'boolean'],
  'v',
  'set_application_archived is volatile'
);

select is(
  (
    select prosecdef
    from pg_proc
    where oid = 'public.set_application_archived(uuid, boolean)'::regprocedure
  ),
  false,
  'set_application_archived is security invoker'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.change_application_status(uuid, public.application_status, text)',
    'EXECUTE'
  ),
  'authenticated can execute change_application_status'
);

select ok(
  not has_function_privilege(
    'public',
    'public.change_application_status(uuid, public.application_status, text)',
    'EXECUTE'
  ),
  'public cannot execute change_application_status'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.set_application_archived(uuid, boolean)',
    'EXECUTE'
  ),
  'authenticated can execute set_application_archived'
);

select ok(
  not has_function_privilege(
    'public',
    'public.set_application_archived(uuid, boolean)',
    'EXECUTE'
  ),
  'public cannot execute set_application_archived'
);

select has_index(
  'public',
  'applications',
  'applications_user_active_updated_idx',
  'active owner queries have an index'
);

select has_index(
  'public',
  'applications',
  'applications_user_archived_idx',
  'archived owner queries have an index'
);

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000000',
  '90000000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'status-tests@example.invalid',
  '',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"90000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);

insert into public.applications (id, role_title)
values ('91000000-0000-4000-8000-000000000001', 'Default status test');

select is(
  (select status::text from public.applications where id = '91000000-0000-4000-8000-000000000001'),
  'saved',
  'application row receives the saved default'
);

select is(
  (select count(*) from public.application_status_history where application_id = '91000000-0000-4000-8000-000000000001'),
  1::bigint,
  'insert creates one immutable initial history row'
);

select ok(
  (select applied_at is null from public.applications where id = '91000000-0000-4000-8000-000000000001'),
  'saved application has no applied_at'
);

select lives_ok(
  $$select public.change_application_status(
    '91000000-0000-4000-8000-000000000001',
    'technical_test',
    'Direct jump note'
  )$$,
  'status RPC accepts a direct jump to a submitted status'
);

select ok(
  (select applied_at is not null from public.applications where id = '91000000-0000-4000-8000-000000000001'),
  'direct submitted-status jump initializes applied_at'
);

select is(
  (
    select note
    from public.application_status_history
    where application_id = '91000000-0000-4000-8000-000000000001'
      and from_status = 'saved'
      and to_status = 'technical_test'
  ),
  'Direct jump note',
  'RPC note belongs to its exact transition'
);

select lives_ok(
  $$select public.change_application_status(
    '91000000-0000-4000-8000-000000000001',
    'technical_test',
    'Must not overwrite'
  )$$,
  'status RPC handles a no-op explicitly'
);

select is(
  (select count(*) from public.application_status_history where application_id = '91000000-0000-4000-8000-000000000001'),
  2::bigint,
  'status no-op creates no history row'
);

select is(
  (
    select note
    from public.application_status_history
    where application_id = '91000000-0000-4000-8000-000000000001'
      and from_status = 'saved'
      and to_status = 'technical_test'
  ),
  'Direct jump note',
  'status no-op does not alter the prior note'
);

select lives_ok(
  $$select public.change_application_status(
    '91000000-0000-4000-8000-000000000001',
    'preparing',
    null
  )$$,
  'status can move backward'
);

select ok(
  (select applied_at is not null from public.applications where id = '91000000-0000-4000-8000-000000000001'),
  'moving backward never clears applied_at'
);

select lives_ok(
  $$select public.set_application_archived(
    '91000000-0000-4000-8000-000000000001',
    true
  )$$,
  'archive RPC archives the owner application'
);

select ok(
  (select archived_at is not null from public.applications where id = '91000000-0000-4000-8000-000000000001'),
  'archive RPC sets archived_at'
);

select is(
  (select status::text from public.applications where id = '91000000-0000-4000-8000-000000000001'),
  'preparing',
  'archive RPC does not change status'
);

select is(
  (select count(*) from public.application_status_history where application_id = '91000000-0000-4000-8000-000000000001'),
  3::bigint,
  'archive RPC does not change history'
);

select lives_ok(
  $$select public.set_application_archived(
    '91000000-0000-4000-8000-000000000001',
    false
  )$$,
  'archive RPC unarchives the owner application'
);

select is(
  (select count(*) from public.application_status_history where application_id = '91000000-0000-4000-8000-000000000001'),
  3::bigint,
  'unarchive RPC does not change history'
);

select ok(
  (select archived_at is null from public.applications where id = '91000000-0000-4000-8000-000000000001'),
  'archive RPC clears archived_at'
);

select * from finish();
rollback;
