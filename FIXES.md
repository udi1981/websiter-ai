# UBuilder AI — Fixes & Known Issues

## Format
Each entry: `[Date] [File] — Description of the bug and its fix`

---

## 2026-03-17 — Full Pipeline Fix Session

### Fix 1: AbortController premature abort on Windows/Next.js
**Files:** `apps/web/src/app/api/ai/planning/route.ts`, `apps/web/src/app/api/ai/generate-site-stream/route.ts`, `apps/web/src/app/api/ai/generate-site/route.ts`, `apps/web/src/app/api/ai/discovery/route.ts`
**Bug:** `AbortController` in Next.js API routes on Windows causes `fetch()` to abort immediately, even with generous timeouts (25-55s). All AI API calls (Claude + Gemini) were failing with `AbortError`.
**Fix:** Removed `AbortController` entirely from all API routes. Server-side timeouts are handled by Vercel's `maxDuration` setting instead.

### Fix 2: Planning API maxDuration too short
**File:** `apps/web/src/app/api/ai/planning/route.ts`
**Bug:** `maxDuration` was 30s but Claude needs ~90s for complex build plans.
**Fix:** Increased `maxDuration` from 30 to 120.

### Fix 3: Gemini model 404
**File:** `apps/web/src/app/api/ai/planning/route.ts`
**Bug:** Gemini model accidentally changed from `gemini-2.5-flash` to `gemini-2.0-flash` which returns 404 ("model no longer available to new users").
**Fix:** Reverted to `gemini-2.5-flash`.

### Fix 4: Generation HTML truncated (no body content)
**Files:** `apps/web/src/app/api/ai/generate-site-stream/route.ts`, `apps/web/src/app/api/ai/generate-site/route.ts`, `apps/web/src/lib/generation-prompt.ts`, `apps/web/src/app/dashboard/new/page.tsx`
**Bug:** Generated HTML was 31K chars but only contained `<head>` and CSS — no `<body>` content. Caused by two issues:
1. `max_tokens: 32000` was too small for Claude to generate full site (Claude was spending all tokens on verbose CSS)
2. Client-side stream timeout was 90s, cutting the stream before completion
**Fix:**
- Increased `max_tokens` from 32000 to 64000 (Claude Sonnet 4 supports this)
- Increased client-side stream timeout from 90s to 300s
- Added "TOKEN BUDGET MANAGEMENT" section to generation prompt instructing Claude to keep CSS concise (~250 lines) and prioritize HTML content
- Added reminder to never stop before closing `</html>` tag
- Increased server `maxDuration` from 60s to 300s on generate-site route

### Fix 5: Landing page blank (hero invisible)
**Files:** `apps/web/src/components/landing/hero-section.tsx`, `apps/web/src/components/landing/landing-styles.tsx`
**Bug:** Hero elements used `.reveal` class (opacity: 0) which depends on IntersectionObserver JS running after hydration. On production SSR, there's a visible blank period.
**Fix:** Replaced `.reveal` on hero elements with CSS-only `@keyframes hero-enter` animation that fires immediately on render without JS dependency.

### Fix 6: Login auth reliability
**Files:** `apps/web/src/app/dashboard/layout.tsx`, `apps/web/src/app/(auth)/login/page.tsx`
**Bug:** Multiple auth issues: no loading gate before auth check, `router.push` causing back-button loop, no JSON.parse error handling for corrupted localStorage, no auto-redirect if already logged in on login page.
**Fix:** Added `authChecked` state gate, wrapped JSON.parse in try/catch, used `router.replace` instead of `router.push`, added already-logged-in redirect on login page.

---

## 2026-03-17 — Database Connection + Persistence Layer

### Feature: Neon PostgreSQL Integration
**Files:** `packages/db/src/schema/sites.ts`, `packages/db/src/schema/users.ts`, `packages/db/src/index.ts`, `apps/web/src/app/api/sites/route.ts`, `apps/web/src/app/api/sites/[siteId]/route.ts`, `apps/web/src/lib/sites-api.ts`, `apps/web/src/app/dashboard/new/page.tsx`, `apps/web/src/app/editor/[siteId]/page.tsx`
**Description:** Connected the web app to Neon PostgreSQL database. Created `sites` table with full schema (html, build_plan, logo_svg, industry, version, etc.). Built CRUD API routes and hybrid localStorage+DB persistence layer that syncs data to both stores. Site creation, HTML edits, logo changes, and name changes now persist to database. localStorage remains the fast cache, DB is the durable store.

---

## Known Issues (non-blocking)

- **React duplicate key warnings** in discovery chat — suggestion buttons rendered with duplicate keys. Cosmetic only.
- **Stale `.next` cache** on Windows can cause blank pages or module-not-found errors. Fix: `rm -rf apps/web/.next` and restart dev server.
