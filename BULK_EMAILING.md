# Greenbricks bulk emailing

## Existing architecture and implementation

The existing Next.js admin dashboard uses Sanctum bearer tokens and Laravel 11 APIs. Laravel Mail already supplies SMTP/provider configuration, and the project already includes database queues, cache locks and failed-job tables. Existing mail features remain unchanged. There was no persisted newsletter directory, marketing consent, suppression list or campaign system. The privacy page's communication checkboxes were temporary component state with defaults enabled; they were not evidence of consent.

The **Bulk Emailing** navigation item adds real campaign statistics, drafts/history, rich-text editing, safe previews, recipient groups and selection across pages, reusable templates, delivery attempts, progress, pause/resume/cancel, documented-consent entry and suppression management. Suggested template starting points cover property announcements, offers, company news, agents and general updates. Saved templates and history are paginated.

Account profiles and privacy settings now use the same persisted marketing preference control. All existing accounts start without marketing consent. An authenticated user must explicitly opt in with a verified email, or an administrator must record affirmative consent evidence for a contact. Existing customer, agent and property records are not enrolled or changed by the migration.

## Database and recipient eligibility

`backend/database/migrations/2026_11_13_100000_create_bulk_email_tables.php` creates seven new tables:

| Table | Purpose |
| --- | --- |
| `marketing_contacts` | Normalized unique email, linked account where available, consent evidence/date, opt-out and unguessable unsubscribe token |
| `email_suppressions` | Address-wide exclusion and reason |
| `email_templates` | Sanitized reusable subject/body |
| `email_campaigns` | Draft content, audience selection, unique submission key, state and timestamps |
| `campaign_recipients` | Immutable address/name snapshots, per-campaign email uniqueness, claims and sending state |
| `email_send_attempts` | Unique numbered attempts with sanitized diagnostics |
| `email_audit_logs` | Actor/action/entity references; test-send requests also have a durable claim state |

No existing table is modified. Normalized email uniqueness prevents duplicate contacts; per-campaign uniqueness prevents duplicate recipient snapshots. Campaign submission UUIDs and locked state transitions make repeated create/start submissions idempotent. Non-draft content cannot be edited.

Registered users, customer accounts (buyers/sellers), agents, newsletter contacts and explicit custom selections are supported. Eligibility always requires recorded consent, no opt-out and no suppression. Linked accounts must still exist, remain active, have verified email and retain the same address. Deleting a linked account does not turn its contact into an eligible standalone subscriber. Custom addresses still require consent; this is not an arbitrary-address sender. Newsletter enrollment is explicitly recorded by an administrator with evidence; no public newsletter subscription form existed to reuse.

Removing a suppression does not restore consent or clear an opt-out. A user's explicit later opt-in can clear an `unsubscribe` suppression, but cannot clear administrative/provider suppressions. Administrative reasons should describe the actual suppression reason rather than use the reserved `unsubscribe` value.

## Sending, retries and recovery

Confirming a campaign snapshots eligible contacts in database chunks and enqueues work after commit. Neither campaign mail nor test mail is sent from the HTTP handler. The bulk queue rejects synchronous/nonpersistent queue drivers even if the rest of the application uses `QUEUE_CONNECTION=sync`.

`ProcessEmailCampaign` uses a shared worker lock, unique pending campaign jobs, a global rate limiter, limited batches and transactional recipient claims. Each address receives an individual message. Eligibility and campaign state are checked immediately before submission. Pause/cancel affects pending work; it cannot recall a message already being handed to a transport.

Only explicit SMTP rejection codes 421, 450, 451 and 452 are automatically retried, up to the configured bound (hard maximum five attempts). Permanent SMTP rejection is failed. Timeouts, ambiguous provider errors and interrupted claims are **uncertain**, excluded from automatic resend and visible in history. Standard SMTP cannot guarantee exactly-once delivery across a crash after acceptance; provider logs must be reviewed before any separate manual resend campaign. Configured transports may have their own internal failover behavior.

The scheduled recovery command marks claims older than ten minutes uncertain and wakes active campaigns with pending recipients. Paused/cancelled campaigns are not resumed automatically. Test sends target only the requesting administrator's currently verified email, use the same rate limiter and queue, and have durable claims so queue redelivery cannot repeat a test request. Test results appear in campaign activity; Laravel failed-job storage remains available for infrastructure failures.

`sent` means accepted by the configured mail transport, not delivered or opened. No delivery, bounce or open metrics are fabricated. Provider webhooks and automatic bounce ingestion are not implemented because no verified provider event integration was available. Administrators can add known complaints/bounces to suppression management.

## Email security and unsubscribe

Admin APIs require an authenticated, active administrator. Other users cannot access recipient details. Authenticated preference APIs affect only the current verified address. Existing bearer-token authentication and web CSRF protection are preserved.

HTML uses a small server-side tag allowlist. Scripts, style, images, embedded content, forms, handlers and unsafe URLs are removed. Paste into the rich-text editor is plain text; previews use sandboxed iframes and a restrictive content policy. `{{recipient_name}}` is escaped before substitution. Other placeholders are intentionally unsupported; property descriptions/links can be included as campaign content without granting template access to arbitrary application data. Subject line breaks are rejected. Subjects and names are not interpreted as Blade templates.

Every marketing message includes a stable, unguessable unsubscribe URL. GET displays a confirmation without changing preferences, so link scanners cannot opt someone out. POST is CSRF protected and records both opt-out and address suppression. Repeated unsubscribe is safe, requires no login and stops pending jobs at their eligibility check. This is a normal unsubscribe link, not an RFC one-click endpoint. Tokens are hidden from JSON; no recipient addresses or raw SMTP responses are written into campaign audit logs. Administrators see safe error categories, SMTP codes, attempt numbers and timestamps.

## Configuration and manual release

No production SMTP settings, credentials, live database or deployment were changed. After PR approval, use the normal release process to apply the new migration before serving the feature. Keep the existing working Laravel mail provider configuration; do not put credentials in source control. For live sending, confirm the configured mailer is a real provider rather than the development `log` or `array` mailer.

Optional new environment settings (defaults shown):

```dotenv
BULK_EMAIL_QUEUE_CONNECTION=database
BULK_EMAIL_BATCH_SIZE=20
BULK_EMAIL_PER_MINUTE=30
BULK_EMAIL_MAX_ATTEMPTS=3
BULK_EMAIL_RETRY_DELAY=120
```

Use a shared database or Redis cache/lock store for all workers. Existing `jobs`, `failed_jobs`, `cache` and `cache_locks` tables must be available when using database drivers. Run a supervised dedicated worker, for example:

```sh
php artisan queue:work database --queue=bulk-email --sleep=1 --timeout=60
```

The queue's `retry_after` must exceed the 60-second job timeout; the existing database default is 90 seconds. Shared locks expire after 120 seconds, and interrupted transport claims are reconciled after ten minutes. Choose batch/rate limits for the provider's quota and latency. Queue release counts are independent of bounded recipient transport attempts. Keep `APP_KEY` stable and `APP_URL` set to the public backend HTTPS URL so email unsubscribe links and CSRF forms work.

Run Laravel's scheduler every minute through the normal scheduler service/cron. `bulk-email:recover` is already scheduled in `routes/console.php`; it can also be invoked manually. The command only reconciles records and queues jobs; it does not itself send emails.

## Verification

- PHPUnit: **27 tests, 131 assertions passed**, with fake mail transports only. Includes real database queue serialization/worker middleware, admin authorization, drafts/idempotency, immutable active campaigns, normalization, groups/filtering/pagination, custom deduplication, opt-in/out, suppression, template CRUD, safe HTML, subject injection, queued tests, durable test claims, rate limits, temporary/permanent failures, partial results, uncertain failures, recovery and cancellation.
- Tests use isolated in-memory SQLite. The harness excludes the pre-existing MySQL-only role ENUM widening migration because SQLite stores the role as a string. No production MySQL or external SMTP provider was exercised.
- Chrome checks with completely mocked API responses pass at 390px, 768px and 1440px: admin navigation, rich editor, selection across recipient pages, preview, draft save, confirmation before campaign/test sending, pause, templates and persisted preference controls. No actual email is sent by these checks.
- Production build succeeds with 95 generated pages. The existing build configuration skips TypeScript validation and reports the existing ESLint configuration issue.
- New TypeScript files pass targeted ESLint checks for unused variables, explicit `any`, hook rules and hook dependencies using a temporary configuration. Full-project ESLint is blocked by the existing `eslint.config.mjs` import of `eslint-config-next/core-web-vitals`.
- Full TypeScript checking reports the existing `src/app/contact/page.tsx:33` error: `phone` is absent from its contact API payload type. There are no new TypeScript diagnostics.
- PHP formatting and `git diff --check` pass. No dependency manifests, SMTP settings or deployment workflows are modified.

Reproduce backend tests with a disposable test-only key:

```powershell
cd backend
$env:APP_KEY = 'base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
php vendor/bin/phpunit --display-warnings
```

Do not use this test key in a running environment. Production transport acceptance, inbox delivery, provider quotas, shared-cache behavior across multiple hosts and sender-domain authentication require operational verification after manual review; real email was deliberately not sent during implementation.

## File map

- Backend: `BulkEmailController`, `MarketingPreferenceController`, `BulkEmailAdmin`, seven email/contact models, `BulkEmailService`, `MarketingAudience`, `EmailContent`, `ProcessEmailCampaign`, `SendCampaignTest`, `CampaignEmail`, `RecoverEmailCampaigns`, new configuration/migration/views and API/web/scheduler routes.
- Frontend: `BulkEmailDashboard`, `MarketingPreference`, `bulk-email-api`, the exported shared API request helper, admin navigation, account profile and privacy email preferences.
- Verification/documentation: `backend/tests/Feature/BulkEmailTest.php` and this runbook.
