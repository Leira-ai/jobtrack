# Security model

## Trust boundaries

The browser is untrusted. Supabase publishable/anon keys are intentionally public and grant only what RLS and Storage policies allow. `src/proxy.ts` improves route UX but is not an authorization layer.

`SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. It is read only by the server-only admin client for account deletion and must never be prefixed with `NEXT_PUBLIC_`, imported into Client Components, logged, or committed.

## Authentication and onboarding

Authorization decisions use `supabase.auth.getUser()`, which validates the session with Supabase Auth. Auth callback destinations are restricted to internal paths. The proxy routes incomplete profiles to onboarding; onboarding can upsert only the authenticated user's profile.

Production Auth is not configured yet. Before launch, configure exact site/callback URLs, production SMTP, enumeration protections, rate limits, administrator MFA, and credential rotation procedures.

## Database isolation

All application tables have RLS enabled and owner-scoped policies for the `authenticated` role. Composite owner foreign keys prevent cross-user parent references even when a caller controls submitted IDs. This includes reminders referencing events/tasks and document/application links.

Application history is append-only to clients. A security-definer trigger with an empty `search_path` records initial state and real transitions; the status/archive RPCs are security-invoker and filter on `auth.uid()`.

Current local evidence includes 30 pgTAP assertions and one two-user integration test covering read/write/delete isolation, cross-parent references, RPC ownership, and Storage access. These local results do not replace a post-deployment test against staging/production.

## File isolation

The `documents` bucket is private and has a 10 MiB object limit. Current application UI/service accepts only:

- PDF: `application/pdf`
- DOCX: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

Legacy DOC and plain text are not accepted or supported by current application flows. The original foundation migration still lists their MIME types in bucket configuration; the application-level allowlist is deliberately narrower.

Object names use `<auth.uid()>/<document-id>/file.<ext>`. Storage policies require the caller's UUID as the first path segment; update/delete also check recorded ownership. Temporary downloads use signed URLs with a 60-second lifetime.

Upload ordering is Storage object, document metadata, then application links. Metadata/link failures trigger compensating deletion, but Storage and Postgres are not one transaction; cleanup errors are reported. Single-document deletion removes Storage first and retains metadata when object removal fails so the user can retry. If Storage succeeds and metadata deletion fails, an orphan metadata row may remain without a file.

Do not log file content, extracted text, signed URLs, or tokens. Treat filenames and extracted text as untrusted. The analyzer uses raw text rather than rendering Mammoth HTML.

## Browser-local CV analysis

PDF.js and Mammoth execute in the browser for CV and job-description extraction. The analyzer makes no external AI request by default and does not persist input or results. PDF scans require external OCR; encrypted or malformed documents are rejected.

No browser-only processing claim applies to authenticated document-library upload: that separate feature intentionally sends PDF/DOCX bytes to private Supabase Storage.

## Reminders and notifications

Reminder records are RLS-protected. The center displays due/upcoming reminders and persists read/dismiss state. Browser Notification permission is optional and creates a notification only while the application is open. There is no service worker, push subscription, background scheduler, or reminder email.

## Export privacy

The JSON account export includes relational rows and document metadata but excludes:

- Storage object bytes;
- `storage_path` and `extracted_text`;
- signed URLs;
- password/secret/token-like fields.

The export is returned with `private, no-store`. It is not a complete document backup, and the downloaded JSON can still contain personal data such as application notes and contact details; users must protect it.

## Account deletion

The UI requires the exact confirmation phrase and current password. Password reauthentication goes directly through Supabase Auth. The DELETE endpoint requires a valid same-origin `Origin`/host/protocol, a validated user session, and a server-only admin client.

Deletion order is:

1. recursively list user Storage objects with pagination;
2. move each object into a unique, server-only quarantine prefix in the same private bucket;
3. if any move fails, move already-quarantined objects back and stop before Auth deletion;
4. delete the Auth user; database rows then cascade from `profiles`;
5. if Auth deletion fails (other than an already-missing user), restore the quarantined objects;
6. after Auth deletion succeeds, remove the quarantined objects in batches.

Storage and Auth are not one transaction, but quarantine keeps file removal recoverable until Auth deletion succeeds. Quarantine prefixes use a UUID per attempt, stay in the existing private bucket, and are accessible only through the server-side service-role workflow. A failed post-deletion cleanup does not report account deletion as failed; the endpoint returns a path-free `cleanupPending` state for operator follow-up. Failed restoration similarly returns only `restorationPending`, never object paths, signed URLs, or secrets.

Mock tests and local code validation cover success and failure stages. Real deletion has **not** been destructively tested in production, and the feature is unavailable unless `SUPABASE_SERVICE_ROLE_KEY` is configured on the server.

## Demo isolation

Demo mode bypasses account queries and mutations and uses fictional browser data. Demo uploads store no bytes, and demo account deletion calls no server endpoint. The mode cookie is HTTP-only/same-site and can be cleared with `?demo=false`; localStorage remains until reset/clear.

## Operational checklist

- Keep the bucket private and verify its limit/policies after every migration.
- Test with two dedicated users after staging/production migration.
- Enable MFA and least privilege for Supabase/deployment administrators.
- Configure SMTP, Auth rate limits, exact redirects, backups, and restore drills.
- Rotate an exposed service-role key immediately and inspect deletion logs without recording sensitive content.
- Add secret/dependency scanning once a hosted source repository exists.
- Monitor Auth failures, RLS denials, Storage cleanup errors, account deletion stages, and application exceptions.
- Re-run pgTAP, local integration, and production smoke tests for security-sensitive releases.

There is currently no public security-reporting address or public repository issue tracker documented. Do not publish secrets, personal documents, or exploit details in a public issue.
