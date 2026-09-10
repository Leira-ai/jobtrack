# Database migrations

The schema is the ordered set of files in `supabase/migrations/`, not a single foundation file:

1. `20260908000000_jobtrack_foundation.sql` — domain schema, ten application statuses, history/status/archive functions, RLS, and private document bucket.
2. `20260909000000_profiles_insert_own.sql` — lets an authenticated user restore only their own missing profile during onboarding.
3. `20260909010000_reminders.sql` — reminders, event/task owner keys, indexes, and RLS.

`supabase/tests/application_status_alignment.sql` contains 30 pgTAP assertions. `tests/integration/supabase-security.test.mjs` is a destructive **local-only** two-user test; it rejects any API hostname that is not loopback.

## Local workflow

Install Docker and use the Supabase CLI through `npx`:

```sh
npx supabase start
npx supabase db reset
npx supabase status --output env
```

`db reset` recreates the local database, applies every migration in timestamp order, and runs `supabase/seed.sql`. For a clean security-test database matching CI:

```sh
npx supabase db reset --no-seed
npx supabase db lint --level error
npx supabase test db
npm run test:integration
```

Current local evidence: DB lint reported no schema errors, pgTAP reported 30 passed, and the two-user RLS/Storage integration reported 1 passed. These are a point-in-time local result.

Copy only the local `API_URL` and a publishable/anon key to `.env.local` for normal application use. The integration test discovers local credentials via `supabase status`; never point it at a hosted project.

## Seed behavior

`supabase/seed.sql` is fictional local data. It does not create Auth users and skips owner rows when no local user exists. It can create document metadata without corresponding Storage objects, so it is not a full file fixture or backup.

## Creating a change

1. Create a forward-only file:

   ```sh
   npx supabase migration new descriptive_name
   ```

2. Add constraints, owner foreign keys, indexes, grants, RLS policies, and tests with the table/function change.
3. Rebuild locally and inspect the schema:

   ```sh
   npx supabase db reset --no-seed
   npx supabase db lint --level error
   npx supabase db diff --local
   ```

4. Regenerate types:

   ```sh
   npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
   ```

5. Run the complete validation matrix in `CONTRIBUTING.md`, including pgTAP and two-user integration.

Do not rewrite a migration already applied to a shared environment. For destructive changes, use expand-and-contract: add compatible structures, deploy code that supports both shapes, backfill in bounded batches, remove old dependencies, and only then remove the old structure in a later migration.

## Status and archive invariants

Schema changes must preserve or intentionally migrate these behaviors:

- ordered enum: `saved`, `preparing`, `applied`, `screening`, `interview`, `technical_test`, `offer`, `accepted`, `rejected`, `withdrawn`;
- first submitted status initializes `applied_at`, which later backward movement does not clear;
- each real status transition creates one immutable history row; no-op creates none;
- archive sets/clears `archived_at` independently of status/history;
- RPCs are executable by `authenticated`, not public, and remain security-invoker;
- cross-owner parent references are blocked.

## Document bucket alignment

The foundation migration sets a private 10 MiB bucket and historically lists PDF, DOC, DOCX, and plain text MIME types. Current application upload/analyzer flows accept **PDF and DOCX only**. Do not document or expose DOC/text acceptance unless a migration and all validation layers are intentionally aligned and tested.

## Remote environments

No hosted Supabase project is currently linked or documented. When staging/production projects exist, keep them separate and use an authenticated operator environment:

```sh
npx supabase link --project-ref <project-ref>
npx supabase migration list
npx supabase db push --dry-run
npx supabase db push
```

Inspect the dry run. Apply staging first, run two-user authorization/Storage smoke tests with disposable accounts, then promote the exact migration files. Never put access tokens, database passwords, or service-role keys in tracked CLI configuration.

Do not run `supabase db reset` against a remote project. The local integration test also must not be altered to permit remote endpoints as a convenience.

## Rollback and partial failures

Postgres migration files are forward-only operational artifacts. Correct an applied fault with a compensating migration. For a severe incident, stop writes, restore a verified backup/PITR snapshot, and reconcile migration history before reopening traffic.

Storage operations and Postgres writes are not a shared transaction. Migration/release plans affecting documents or account deletion must include orphan detection, retry behavior, and operator remediation rather than assuming database rollback restores Storage objects.
