# Agent profile management fixes

## Causes and implementation

- Agent accounts are `users` with role `agent`; properties belong to `users.id`. There is no separate company table. Registration, phone registration, Google registration, staff-created seller/agent accounts and role changes can all create agents. Previously only email uniqueness was enforced, with no normalized agent contact check.
- Directory and detail endpoints grouped by name alone. This combined unrelated people and could change the primary account after a location filter. They now share deterministic grouping based on normalized name plus matching email or phone. The oldest account is the public profile; all matching account IDs and locations remain available. Names alone never establish identity. Existing records and property foreign keys are preserved.
- Nullable, unique SHA-256 identity columns protect concurrent writes. The migration reserves each existing identity once, leaving additional legacy duplicates intact. A model-level check covers every Eloquent creation, editing and promotion path, including legacy records without keys. Email matching is normalized; Sri Lankan local and international phone formats match.
- Grouping precedes location/search filters and pagination. Visible property counts aggregate the complete group. The directory, company property page and agent sitemap now request subsequent API pages instead of stopping at 100 records. Property ordering includes the ID to make equal timestamps stable across pages.
- Avatar replacement previously deleted the old file first. The shared avatar service now stores the new file, saves the profile, then removes the old file only if no account still references it. Failed saves remove the new upload and preserve the old reference. Failed storage returns an avatar validation error. Existing authorization, JPEG/JPG/PNG/WebP validation and the 2 MB limit remain in place.
- The public storage disk and `avatars/` paths remain unchanged. Missing local files return null. The frontend shows initials for missing/failed image URLs and can recover when a replacement URL arrives.
- Directory cards use consistent image sizes, contact details, locations and listing counts. Detail pages show all company locations, group each property page by location, support narrow screens, and show loading/error/retry states. Admin editing retains previews and success feedback, checks selected file types, guards repeated save clicks, and shows duplicate validation errors.

## Manual review and operational requirements

Run `php artisan agents:audit-duplicates` on the intended database. It is read-only and reports account IDs, matching contact evidence, same-name review candidates and property counts. No production database or `.env` was available here, so this change does not claim to have audited live records.

Agents with the same name but different/missing contacts remain separate pending manual review. Distinct company names or contacts cannot safely establish a shared entity without a business identifier. No accounts are automatically merged or deleted, and no property ownership is reassigned. For additional listings, staff should select the existing account.

After manual approval and through the normal release process, the new migration must run before the new application code serves traffic. Existing storage setup must have a valid `APP_URL` and `php artisan storage:link` so public image URLs resolve. No deployment or live migration was performed during this task.

The directory still loads agent profiles server-side before grouping and slicing pages; it no longer performs a quadratic grouping scan. Very large directories may eventually warrant an explicit reviewed company entity and SQL-level group pagination.

## Verification

- PHPUnit: 18 tests, 81 assertions passed. Covers creation, normalized duplicates, role promotion, multiple properties per agent, staff-created duplicate rollback, legacy grouping/locations/counts, records beyond 100, uploads in all supported formats, admin/guest authorization, invalid/oversized files, replacement/removal, failed storage/save preservation, shared files, missing avatars, audit safety, unique constraints and migration preservation.
- Tests use in-memory SQLite. The test harness skips the existing MySQL-only role ENUM widening migration because SQLite already stores that field as a string; all other real migrations run. Production MySQL was unavailable.
- Laravel Pint on changed PHP files passed.
- Production Next.js build passed. Existing configuration skips type checking during builds and reports the ESLint configuration issue below.
- Headless Chrome checks with mocked API data passed at 390, 768 and 1440 pixels: directory record 101, search pagination reset, property record 101, company locations and no horizontal overflow. No browser JavaScript errors occurred. These browser checks complement the real Laravel API tests; they do not claim an end-to-end production database check.
- Full TypeScript check remains blocked by the pre-existing `src/app/contact/page.tsx:33` error: `phone` is absent from the declared contact API payload type.
- Full ESLint remains blocked by the pre-existing `eslint.config.mjs` import of `eslint-config-next/core-web-vitals`, which cannot resolve with the installed Next.js 15 ESLint config. These unrelated files were not modified.
- `git diff --check` passed. Initial sandbox build failed with `spawn EPERM`; rerunning with child-process permission succeeded. Composer installation succeeded on retry after temporary OneDrive file-write failures.

Reproduce backend checks in PowerShell with a disposable test key:

```powershell
cd backend
$env:APP_KEY = 'base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
php vendor/bin/phpunit --display-warnings
php vendor/bin/pint --dirty --test
```

The all-zero key is for isolated tests only and is not written to application configuration. Running the Artisan test wrapper without a local `.env` also emits environment-file warnings; direct PHPUnit runs pass without those warnings.
