# Contributing

## Setup

Use Node.js 22 and install the locked dependencies:

```sh
npm ci
cp .env.example .env.local
```

`cp` works in Git Bash. In PowerShell use:

```powershell
Copy-Item .env.example .env.local
```

For database work, install Docker and use the Supabase CLI through `npx`:

```sh
npx supabase start
npx supabase db reset
npx supabase status --output env
```

Copy the local API URL and publishable/anon key into `.env.local`. A service-role key is not needed for normal development; use it only in trusted server environment when explicitly testing account deletion.

Never commit credentials, tokens, real CVs/job descriptions, account exports, signed URLs, or other personal data. Use fictional fixtures from `examples/`.

## Change rules

- Keep branches and reviews focused. This checkout currently has no Git remote; do not imply a public PR or CI run exists.
- Add forward-only migration files; do not edit migrations already applied to a shared environment.
- Every user-owned table/reference needs owner constraints, RLS, and cross-user tests.
- Regenerate and review `src/lib/supabase/database.types.ts` after schema changes.
- Preserve authenticated/demo separation. Demo must never read or mutate account rows.
- Preserve PDF/DOCX-only, 10 MiB behavior across UI, service, Storage configuration, tests, and docs. Do not claim legacy DOC/text support.
- Keep service-role access server-only and document cross-service partial failures.
- Update architecture, security, migration, deployment, methodology, and limitations when behavior changes.
- Do not commit generated coverage, Playwright reports, test results, builds, or transient screenshots.

## Standard validation

Run the package scripts rather than ad hoc equivalents:

```sh
npm run format:check
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm audit --omit=dev --audit-level=high
```

Coverage thresholds are statements 55%, branches 45%, functions 55%, and lines 55%. They are minimum gates, not target guarantees. The latest local result at the time of this documentation was 34 files/93 tests and 57.67/47.84/61.49/59.71 percent respectively.

If a prior coverage run leaves `coverage/`, ESLint normally ignores it through repository configuration; do not edit generated files to satisfy lint.

## Browser validation

Install Chromium once:

```sh
npx playwright install chromium
npm run test:e2e
```

Playwright starts a local Supabase/Auth HTTP stub and a web server. By default it uses development mode; set `PLAYWRIGHT_PRODUCTION=true` to build/run the production server. CI reuses the quality job's packaged build with `PLAYWRIGHT_SKIP_BUILD=true`.

If port 4173 is occupied in Git Bash, select free ports:

```sh
PORT=4183 JOBTRACK_AUTH_STUB_PORT=54339 npm run test:e2e
```

The latest local run had 8 passing Chromium tests across desktop and a 375 px mobile viewport. The stubbed suite validates UI wiring, not hosted Supabase behavior.

## Supabase integration validation

Prerequisites: Docker is running, the local Supabase stack is healthy, and `supabase status --output env` works. Resetting destroys **local** Supabase data:

```sh
npx supabase start
npx supabase db reset --no-seed
npx supabase db lint --level error
npx supabase test db
npm run test:integration
```

The Node integration test creates/deletes two fixed local test users and exercises RLS, owner foreign keys, status/archive RPCs, private Storage, signed URLs, MIME/size rejection, and cross-owner denial. It refuses non-loopback Supabase URLs. Never weaken this guard or run the test against staging/production.

The latest local results were 30 pgTAP assertions and 1 two-user integration test passing. These are point-in-time results and must be rerun after relevant changes.

## Documentation validation

For documentation-only changes, at minimum run:

```sh
npx prettier --check README.md CONTRIBUTING.md docs/*.md .env.example
git diff --check -- README.md CONTRIBUTING.md docs .env.example
```

Also check relative Markdown links and referenced paths. In Git Bash, a practical local-link check can be scripted with Node or reviewed from link targets; do not make network requests merely to validate external prose.

## Database and account-lifecycle review

Schema/security changes must preserve tested status and archive invariants. Document deployment order and compensating migration strategy.

Account deletion is not atomic across Storage/Auth/Postgres. Tests should cover Storage failure before Auth deletion and Auth failure after object deletion. A mocked success is not a destructive production test; production deletion requires a disposable account, explicit release approval, and operator monitoring.

Account export changes must remain paginated and must not add document bytes, `storage_path`, `extracted_text`, signed URLs, passwords, secrets, or tokens.

## UI evidence

Include updated screenshots for meaningful UI changes only after the final feature state is reached. The local `artifacts/` directory is ignored/transient; do not describe those files as production captures. Remove personal data and secrets from evidence.

## Review description

Explain user impact, authenticated versus demo behavior, schema/security implications, validation actually run, deployment order, rollback/compensation, and known gaps. State any check not run rather than presenting it as passing.

By contributing, you agree that your contribution is licensed under the project's MIT License.
