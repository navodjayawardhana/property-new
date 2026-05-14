---
name: Backend security issues (not yet fixed)
description: Critical backend security vulnerabilities in the Laravel API that need to be fixed by the developer
type: project
---

Admin credentials are hardcoded in `backend/app/Http/Controllers/AuthController.php` (lines 22-23) as PHP constants — plaintext password `Admin@1234` and email `admin@greenbrick.net` visible in source code. Must be moved to `.env` as `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

**Why:** Anyone with repo access has the admin password. Hardcoded secrets in source code is a critical security risk.
**How to apply:** When the user asks about backend security or admin login, remind them these need to be moved to .env and the login check updated to use `env('ADMIN_EMAIL')` and `env('ADMIN_PASSWORD')`.

Also: `updatePassword()` in AuthController (line 228) calls `$request->user()->update(['password' => $request->password])` without explicitly calling `Hash::make()`. Relies on model cast — should use explicit hashing.

Also: No rate limiting on `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-otp` routes in `routes/api.php`. These are vulnerable to brute-force.

Also: Internal error messages exposed to client in AdminController (lines 160, 306): `'Failed to load properties: ' . $e->getMessage()` reveals DB structure in production.

Also: `per_page` in NewsController `index()` (line 31) has no upper limit cap — attacker could request millions of records.

Also: Filter query params like `role`, `status`, `listing_type` in list endpoints are used without enum validation.
