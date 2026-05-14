---
name: Frontend security hardening (completed)
description: Security improvements made to adminPanelMobile frontend
type: project
---

Completed security fixes in adminPanelMobile (frontend only — user did not allow backend edits):

- **lib/api.ts**: All console.log/warn/error statements gated behind `__DEV__`. Prevents token, URL, and error details from appearing in production logs.
- **lib/auth.tsx**: Removed all verbose console.log statements that leaked token fragments, user IDs, and roles. Login/logout/session-restore are now silent in production.
- **app/(auth)/login.tsx**: Added email format regex validation (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) before submitting. Separate password non-empty check.
- **app/(admin)/add-property.tsx**: validate() now checks title/address max length, price must be non-negative integer, beds/baths/cars must be integers 0-20. Added `error` prop to beds/baths/cars TextInputField for visual feedback.
- **app/(admin)/banks.tsx**: handleSave() now validates interest_rate is numeric 0-100, max_term is integer 1-30, min/max loan are non-negative integers.
- **app/(admin)/settings.tsx**: handleSave() now uses explicit parseFloat + isNaN checks for all three fields; commissionPct validated 0-100.
- **app/(admin)/news.tsx**: handleSave() now checks title ≤255 chars, excerpt ≤1000 chars, tag ≤50 chars, read_time ≤20 chars.

**Why:** Prevent injection of oversized/invalid data to backend, protect token info from production log leaks.
