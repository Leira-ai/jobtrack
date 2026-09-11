begin;

create type public.subscription_tier as enum ('free', 'pro', 'lifetime');
create type public.subscription_status as enum ('active', 'trialing', 'past_due', 'canceled');

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_tier public.subscription_tier not null default 'free',
  status public.subscription_status not null default 'active',
  gateway text,
  gateway_customer_id text,
  gateway_subscription_id text,
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_user_id_unique unique (user_id)
);

create index subscriptions_user_status_idx on public.subscriptions (user_id, status);

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own" on public.subscriptions for select to authenticated
using ((select auth.uid()) = user_id);

commit;
