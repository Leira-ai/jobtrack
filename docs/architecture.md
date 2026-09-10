# Architecture

JobTrack is a Next.js 16 App Router application with two explicit data modes:

- **Authenticated mode:** Supabase Auth, Postgres, and private Storage are the source of truth.
- **Demo mode:** fictional fixtures and browser storage are isolated from the authenticated account.

## Request and authorization flow

1. `src/proxy.ts` recognizes protected routes, refreshes Supabase cookies, and validates account sessions with `auth.getUser()`.
2. `/dashboard?demo=true` sets an HTTP-only, same-site demo cookie for 24 hours. Demo requests bypass account loading; `/dashboard?demo=false` clears the cookie.
3. Authenticated users whose profile is missing or has not completed onboarding are redirected to `/onboarding`.
4. Server Components, actions, and route handlers create a request-scoped client with `src/lib/supabase/server.ts`; Client Components use `src/lib/supabase/client.ts`.
5. Queries execute with the caller's JWT. Postgres RLS and Storage policies, not the proxy or UI, are the authorization boundary.
6. The service-role client exists only in `src/lib/supabase/admin.ts` and is used by same-origin account deletion.

Missing public Supabase variables are supported for static previews, builds, and demo mode. Non-demo protected routes do not silently fall back to demo data.

## Authenticated data paths

- **Applications:** `ApplicationsRepository` reads and mutates applications, companies, status history, and note activities. Status changes and archive toggles call owner-scoped database RPCs.
- **Planning:** `PlanningRepository` provides calendar-event and task CRUD. Server actions validate input and revalidate affected dashboard routes.
- **Documents:** the document service validates PDF/DOCX files, uploads to private Storage, writes metadata/relations, creates 60-second signed URLs, and coordinates deletion.
- **Profiles/settings:** onboarding and settings actions upsert the current user's profile. Account export reads owner-scoped tables; deletion uses a server-only admin client.
- **Reminders:** the repository reads, creates, marks, and dismisses reminders. The current UI displays/updates reminders but does not expose a dedicated creation form.
- **Statistics:** application dashboards derive metrics from the current applications provider. Archived rows are excluded where active-only behavior is intended.

The main dashboard still contains some fixed date/hint copy and only shows demo agenda/tasks in its summary cards. The dedicated authenticated Applications, Calendar, Tasks, Documents, Statistics, Profile, and Settings flows are Supabase-backed.

## Demo data flow

The demo cookie selects a local `JobTrackStore`, seeded from `src/data`. The store persists applications, status history, archive timestamps, notes, events, tasks, and initial document metadata under `jobtrack.demo.v1`. Reminder read/dismiss state uses `jobtrack.demo.reminders.v1`; the theme uses `jobtrack-theme`.

Demo document uploads add metadata only to component state; file bytes are neither persisted nor downloadable. Edited demo profile state is also component-local. Reset restores fictional data and preferences. Demo account deletion is a no-op and does not call the account endpoint.

## Domain model

- `profiles`: one-to-one extension of `auth.users`, created by trigger or restored by own-row onboarding upsert.
- `companies`: user-owned employers.
- `applications`: tracked role, ten-state pipeline, first application timestamp, and independent archive timestamp.
- `application_status_history`: append-only, trigger-generated initial state/transitions.
- `contacts` and `interviews`: application-owned recruitment records.
- `calendar_events` and `tasks`: user-owned planning records with optional application relation.
- `reminders`: exactly one event or task reference, plus read/dismiss timestamps.
- `documents`: private-file metadata; `document_applications` links one document to multiple applications.
- `activities`: application timeline rows, including user notes and generated status changes.

Every owned table carries `user_id`. Composite foreign keys pair owners with parent IDs, preventing a row owned by one user from referencing another user's application, company, contact, interview, event, task, or document.

## Status and archive semantics

The ordered status enum is:

```text
saved → preparing → applied → screening → interview
      → technical_test → offer → accepted / rejected / withdrawn
```

The database permits direct jumps and backward movement. Entering any submitted status (`applied` through `withdrawn`) initializes `applied_at`; later movement does not clear it. A real status change creates one history row; a no-op creates none. The status RPC can attach a bounded transition note.

Archive is orthogonal to status. `set_application_archived` sets `archived_at` idempotently or clears it on restore. It neither changes status nor adds status history.

## Documents and browser analysis

Authenticated document storage accepts only PDF and DOCX at the application layer, with a 10 MiB maximum. Object paths are `<user-id>/<document-id>/file.<ext>`. Upload writes Storage first and then metadata/links, with compensating cleanup on later failure. Download uses a 60-second signed URL.

CV-versus-job-description analysis is a separate browser-only flow. It accepts pasted text or extracts PDF/DOCX text with PDF.js/Mammoth. The deterministic bilingual analyzer scores document match and structure without an external AI call. It does not write extracted text to Supabase.

## Account lifecycle

Account export is paginated and includes account identity plus owner-scoped relational data. It excludes Storage object bytes, `storage_path`, `extracted_text`, signed URLs, tokens, secrets, and passwords.

Account deletion reauthenticates the user, validates same origin, lists/deletes Storage objects, and then deletes the Auth user so database cascades run. Storage, Auth, and Postgres do not share a transaction; an Auth failure after successful object removal can leave the account rows present without files. The operation needs `SUPABASE_SERVICE_ROLE_KEY` and has not been destructively tested in production.

## Test architecture

- Vitest covers libraries, repositories, stores, components, route handlers, document extraction, export, and mocked deletion.
- Playwright uses an Auth/Supabase HTTP stub and runs desktop/mobile flows against a local production build in CI.
- pgTAP checks the status enum, RPC permissions/semantics, history, archive behavior, and indexes.
- The Node integration test starts from local Supabase credentials, refuses non-loopback URLs, creates two users, and exercises cross-owner RLS and private Storage behavior.

## Type ownership

`src/lib/supabase/database.types.ts` represents the applied migrations. Regenerate and review it after schema changes:

```sh
npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
```
