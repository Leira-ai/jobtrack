-- The auth trigger normally creates profiles. This policy lets an authenticated
-- user safely restore only their own missing row during onboarding.
create policy "profiles_insert_own" on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);
