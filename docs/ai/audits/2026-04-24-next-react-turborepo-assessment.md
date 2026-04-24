# Next.js + React + Turborepo Best-Practices Assessment

Date: 2026-04-24
Assessor: GPT-5.3-Codex (agent)

## Scope

- Monorepo-level checks for `apps/admin`, `apps/donor`, `apps/missionary`, shared UI packages, and Turborepo task config.
- Criteria driven by:
  - `vercel-react-best-practices` skill rule families (`async-*`, `bundle-*`, `server-*`, `rerender-*`).
  - Next.js production guidance (`.next-docs` fallback because local `node_modules/next/dist/docs` is not available in this environment).

## Method used

1. Read skill and repo rulebooks before scanning.
2. Read Next.js docs from `.next-docs` (production checklist + server/client components).
3. Run repo-wide static queries (`rg`) for:
   - `'use client'` boundaries
   - App Router page/layout conventions
   - barrel imports in app code
   - `<Image>` vs raw `<img>`
   - common async waterfall signatures
4. Spot-check representative files for each finding.

## Executive summary

Overall: **Partially aligned** with Next.js/React best practices.

- **Strong foundations:** modern stack versions, App Router usage, broad Metadata API usage, Turborepo outputs/env declarations, and `next/image` adoption in high-traffic surfaces.
- **Largest gap:** too many full-page Client Components in App Router routes, which increases client bundle and hydration cost.
- **Secondary gap:** barrel imports are used in app runtime paths, which can increase loaded module surface area.
- **Operational gap:** missing global App Router fallback files (`app/global-error.tsx`, `app/global-not-found.tsx`) in each app.

## What is working well

1. **Version baseline is current and coherent for monorepo apps** (`next@16.2.1`, `react@19.2.3`, `turbo@2.9.5`).
2. **Metadata API usage exists across many routes/layouts**, including dynamic metadata where needed.
3. **Turborepo build outputs and env passthrough are explicitly configured**, including Next.js outputs and env allow-lists.
4. **`next/image` is used in many UI surfaces** instead of raw image tags.

## Findings (prioritized)

### 1) Too many route `page.tsx` files are full Client Components (**High**, `bundle-*`, `server-*`)

Evidence:

- Many App Router pages start with `'use client'`, e.g.:
  - `apps/admin/app/admin/page.tsx`
  - `apps/admin/app/contributions/page.tsx`
  - `apps/missionary/app/tasks/page.tsx`
  - `apps/admin/app/pdf/page.tsx`

Why this matters:

- App Router defaults pages to Server Components. Marking full pages as client widens the client module graph and hydration scope, contrary to the “move client components down the tree” guidance.

Recommendation:

- Convert route `page.tsx` files to Server Components where possible.
- Extract only interactive islands (filters, dialogs, local state widgets) into colocated `*-client.tsx` files.
- Re-measure JS bundle and hydration after each conversion.

### 2) Barrel imports on route-critical paths (**Medium-High**, `bundle-barrel-imports`)

Evidence:

- `apps/donor/features/donor/components/index.ts` exports a barrel of dashboard components.
- Route-level file `apps/donor/app/(dashboard)/donor-dashboard/page.tsx` imports from `@/features/donor/components` (barrel path).
- `apps/donor/features/donor/components/donor-dashboard-main-body.tsx` also imports from the same barrel.

Why this matters:

- Barrel imports can pull broader module graphs than necessary and make incremental tree shaking less predictable in large feature folders.

Recommendation:

- Replace barrel imports on critical routes with direct imports to concrete files.
- Keep barrels for DX-only surfaces (tests/stories) if desired.

### 3) Missing global App Router fallbacks in top-level apps (**Medium**, Next.js production readiness)

Evidence:

- Only a nested not-found exists under `apps/admin/app/(payload)/web-studio/[[...segments]]/not-found.tsx`.
- No top-level `app/global-error.tsx` or `app/global-not-found.tsx` found for `admin`, `donor`, or `missionary` apps during repo scan.

Why this matters:

- Next.js production guidance recommends global fallback UIs for better resilience and accessibility under unexpected errors or unmatched routes.

Recommendation:

- Add app-level global fallback files for each app:
  - `apps/*/app/global-error.tsx`
  - `apps/*/app/global-not-found.tsx`

### 4) A small number of raw `<img>` tags remain (**Low-Medium**, image optimization)

Evidence:

- Raw `<img>` usage found in rich text editor rendering helper/components.

Why this matters:

- In content-rendering contexts this may be intentional, but raw `<img>` bypasses Next optimization features.

Recommendation:

- Keep raw `<img>` for untrusted/portable rich text HTML rendering paths only.
- Document the exception and ensure width/height, lazy loading, and sanitization constraints are enforced.

## Turborepo-specific assessment

Status: **Good with one caveat**.

- Good:
  - `turbo.json` defines outputs for `.next/**`, TS build info files, and common artifacts.
  - `env` + `globalEnv` are explicit and compatible with monorepo app builds.
- Caveat:
  - `envMode: "loose"` improves DX, but reduces strictness of env contract enforcement.

Recommendation:

- Keep `loose` if needed for current workflows, but add/maintain explicit env verification in CI (already partially present via verify scripts) and periodically audit task env usage.

## 30-day remediation plan

1. **Client boundary reduction pass (highest impact)**
   - Target the 10 heaviest `'use client'` pages first.
   - Split static/server-rendered frame from interactive islands.
2. **Barrel import cleanup on hot routes**
   - Replace barrel imports in dashboard/feed/landing routes with direct file imports.
3. **Add global error/not-found per app**
   - Ensure consistent accessible fallback UI.
4. **Perf verification**
   - Run bundle analysis and perf checks before/after each batch.

## Verification commands used for this assessment

- `rg -n "^'use client'|^\"use client\"" apps/*/app/**/page.tsx apps/*/app/page.tsx 2>/dev/null | head -n 120`
- `rg -n "from '@/features/donor/components'|from \"@/features/donor/components\"" apps/donor`
- `rg --files apps/admin/app apps/donor/app apps/missionary/app | rg 'global-error|global-not-found|error\.tsx$|not-found\.tsx$'`
- `rg -n "<img\\b" apps packages | head -n 120`
- `rg -n "from 'next/image'|from \"next/image\"" apps packages | head -n 80`
