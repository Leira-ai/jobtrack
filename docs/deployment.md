# Deployment

## Current status

JobTrack is **not deployed**. There is no verified application URL, hosted Supabase project, public GitHub repository/remote, production Auth/SMTP configuration, production smoke-test result, or production screenshot URL. Local build/test results must not be represented as production evidence.

## Required environments

Create separate Supabase projects for staging and production. Apply the migration process in `docs/migrations.md`; do not use `db reset` on either remote project.

For each project:

1. Apply all migrations in order and verify the `documents` bucket is private.
2. Verify RLS policies, composite owner foreign keys, the ten-status enum, archive RPC, reminder table, 10 MiB bucket limit, and signed URL access.
3. In Auth URL Configuration, set the exact canonical Site URL and `/auth/callback`. Add preview URLs only when they require Auth.
4. Configure a production SMTP provider, sender identity, email templates, rate limits, and enumeration protections. Built-in development email is not a production mail service.
5. Configure backups/PITR appropriate to the recovery objective and test restoration.

## Application environment

Set:

- `NEXT_PUBLIC_APP_URL`: canonical origin without trailing slash.
- `NEXT_PUBLIC_SITE_URL`: compatibility alias; normally the same canonical origin.
- `NEXT_PUBLIC_SUPABASE_URL`: environment-specific Supabase URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: preferred public browser/server key.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: legacy fallback; use one public key variable.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only, required only to enable account deletion.

Do not configure `AI_API_KEY`, `AI_PROVIDER`, or `AI_MODEL`; current analysis does not use an external AI service. Never expose the service-role key to browser bundles, preview logs, screenshots, or source control.

Missing public Supabase values do not fail the static build and allow demo mode, but authenticated features are unavailable. This is preview/CI resilience, not a production-ready configuration.

## Build and release validation

Use Node.js 22 and the committed lockfile:

```sh
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm audit --omit=dev --audit-level=high
```

Install Chromium and run the local browser suite:

```sh
npx playwright install chromium
npm run test:e2e
```

With a local Supabase stack:

```sh
npx supabase db reset --no-seed
npx supabase db lint --level error
npx supabase test db
npm run test:integration
```

Current local evidence is 34/34 Vitest files and 93/93 tests, with 57.67% statements, 47.84% branches, 61.49% functions, and 59.71% lines—above the configured 55/45/55/55 thresholds. A 24-route build, 8 Playwright tests, 30 pgTAP assertions, one two-user integration test, and zero production audit vulnerabilities are also evidenced locally. These snapshots must be rerun for a release.

## Release order

For additive changes, apply backward-compatible migrations before deploying code that uses them. For removals/renames, deploy code that no longer depends on the old shape before a later removal migration. Stage the same build and migration files intended for production.

Do not enable account deletion until the service-role secret is available only to the trusted server runtime and partial-failure monitoring/operator procedures exist.

## Post-deployment smoke test

No production smoke test has run yet. Before publishing a URL, verify with disposable accounts:

- sign-up, production email delivery/confirmation, sign-in, password reset, sign-out, and session refresh;
- onboarding profile creation and route redirects;
- authenticated application CRUD, ten status transitions, one history row per real transition, archive/restore without status changes;
- calendar/task CRUD, timezone rendering, `.ics` download, and Google Calendar links;
- in-app reminders, read/dismiss behavior, and truthful foreground-only Notification wording;
- PDF and DOCX uploads at valid sizes, rejection of DOC/text/wrong MIME/oversize, private listing/download/delete, and 60-second signed URL behavior;
- two-user inability to read/write/reference the other's rows or Storage objects;
- account export contents and exclusion of bytes, paths, extracted text, signed URLs, and secrets;
- account deletion first with a disposable staging account, observing Storage and Auth stages; do not use a real user for the first test;
- logs contain no tokens, service-role values, document content, extracted text, or signed URLs.

A successful local mocked deletion test is not evidence of a destructive production deletion test.

## CI and source hosting

`.github/workflows/ci.yml` defines:

- `quality`: install, Prettier, ESLint, TypeScript, coverage, build artifact, and production dependency audit;
- `browser`: Chromium Playwright against the packaged production build;
- `supabase-integration`: local Supabase, reset without seed, DB lint, pgTAP, and two-user RLS/Storage integration.

It targets pull requests and pushes to `main`, but the local repository currently has no remote/public GitHub project, so there is no hosted workflow run or badge to cite. Configure the default branch trigger when a remote is created.

## Screenshots and publication

Local captures exist under ignored `artifacts/` directories. They are transient, not versioned, and not production screenshots. Final post-feature captures and a public production screenshot URL remain pending. Capture only after the deployed commit and smoke test are verified; avoid personal data, secrets, and signed URLs.

## Recovery and monitoring

Monitor Auth delivery/failures, RLS denials, database saturation, Storage upload/cleanup, application exceptions, reminder errors, and account deletion stages. Define owners for secret rotation, backup restoration, orphan cleanup, and partial deletion remediation.

Account deletion is cross-service and non-atomic: Storage is removed before Auth/database cascade. Storage failure preserves the account; later Auth failure can leave account rows without file objects. Monitoring and retry/runbook support are launch requirements.

Provider free tiers may impose changing limits for database, Storage, egress, Auth/email, functions, builds, inactivity, backups, observability, or SLA. Verify current provider terms rather than copying quota numbers into this project. The application's 10 MiB per-file rule does not describe the provider's total quota.
