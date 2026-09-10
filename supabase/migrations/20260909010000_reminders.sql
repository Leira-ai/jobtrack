begin;

alter table public.calendar_events
  add constraint calendar_events_user_id_id_unique unique (user_id, id);
alter table public.tasks
  add constraint tasks_user_id_id_unique unique (user_id, id);

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  event_id uuid,
  task_id uuid,
  remind_at timestamptz not null,
  read_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint reminders_exactly_one_reference check (num_nonnulls(event_id, task_id) = 1),
  constraint reminders_user_id_id_unique unique (user_id, id),
  constraint reminders_event_owner_fk foreign key (user_id, event_id)
    references public.calendar_events(user_id, id) on delete cascade,
  constraint reminders_task_owner_fk foreign key (user_id, task_id)
    references public.tasks(user_id, id) on delete cascade,
  constraint reminders_read_order check (read_at is null or read_at >= created_at),
  constraint reminders_dismissed_order check (dismissed_at is null or dismissed_at >= created_at)
);

create index reminders_user_active_due_idx
  on public.reminders (user_id, remind_at)
  where dismissed_at is null;
create index reminders_event_idx on public.reminders (event_id) where event_id is not null;
create index reminders_task_idx on public.reminders (task_id) where task_id is not null;

alter table public.reminders enable row level security;

create policy "reminders_select_own" on public.reminders for select to authenticated
using ((select auth.uid()) = user_id);
create policy "reminders_insert_own" on public.reminders for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "reminders_update_own" on public.reminders for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "reminders_delete_own" on public.reminders for delete to authenticated
using ((select auth.uid()) = user_id);

commit;
