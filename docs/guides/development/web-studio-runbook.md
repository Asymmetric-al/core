# Web Studio — operations runbook

**Audience:** engineers running or debugging Web Studio locally or in CI.  
**Canonical architecture:** [`docs/guides/architecture/web-studio-living-spec.md`](../architecture/web-studio-living-spec.md)

---

## 1. Prerequisites

- Bun (see root `packageManager` in `package.json`)
- Docker (for local Supabase) — see root `AGENTS.md` Supabase section
- Node-compatible environment for Playwright when running E2E

---

## 2. Environment variables

Minimum for Payload + admin (from `.env.local` symlinked per app if needed):

| Variable                                    | Purpose                                                                                     |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                  | Supabase project URL                                                                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`             | Anon key                                                                                    |
| `PAYLOAD_SECRET`                            | Payload signing (**required** in prod; dev/test may use defaults — see `payload.config.ts`) |
| `PAYLOAD_DATABASE_URI` or `SUPABASE_DB_URL` | Postgres for Payload `cms` schema                                                           |
| `NEXT_PUBLIC_DONOR_URL`                     | Origin for preview links from admin (optional; defaults in preview helper)                  |
| `CMS_BASE_URL`                              | On **donor**: admin origin for public CMS fetches                                           |

**Per-collection rollback** (optional, default = native on):

```bash
CMS_WEB_STUDIO_NATIVE_PAGES=false
CMS_WEB_STUDIO_NATIVE_NAVIGATION=false
# … see apps/admin/src/cms-ui/web-studio/feature-flags.ts for full list
```

---

## 3. Database: SQL vs Payload

1. **Supabase SQL migrations** — schema in repo under `supabase/migrations/` (includes `cms` schema creation). Local reset: `bun run db:migrate:local` (**destructive** — resets local DB).
2. **Payload migrations** — `bun run cms:migrate`, status: `bun run cms:migrate:status`.

Order for a clean local machine: SQL migrations (or `supabase db reset`) → Payload migrate → seed if needed.

---

## 4. Import map

After changing Payload component paths or `payload.config.ts` admin components:

```bash
NODE_ENV=test bun run cms:importmap
```

`NODE_ENV=test` avoids missing `PAYLOAD_SECRET` in agents. Output: `apps/admin/app/(payload)/web-studio/importMap.js` (post-processed by `scripts/dev/postprocess-payload-importmap.mjs`).

---

## 5. Start apps

```bash
bun run dev:admin   # Mission Control + Payload at http://127.0.0.1:3030
bun run dev:donor   # Donor (for preview / public CMS consumer tests)
```

Unauthenticated visit to `/web-studio` should redirect to login.

---

## 6. Quick verification

- Native shell: `data-testid="web-studio-native-shell"` on `/web-studio/collections/pages`
- Public: `curl` or browser `GET /api/cms/public/pages/home?tenant=<slug>` on admin port
- Template gallery: `/web-studio/templates`

---

## 7. Preview / live preview gotchas

- **Preview URL** for pages is built in `apps/admin/src/cms-ui/web-studio/adapters/preview-url.ts` using `NEXT_PUBLIC_DONOR_URL` / `DONOR_APP_URL`.
- **Live preview** depends on Payload live preview config and donor app availability; nested live preview may still be **stock Payload UI** (see living spec).
- If preview opens wrong host, check env and that donor dev server matches.

---

## 8. Test commands (copy/paste)

| Command                                                                         | When                                                      |
| ------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `NODE_ENV=test bun run cms:importmap`                                           | After component path changes                              |
| `bun run lint:admin`                                                            | Before PR                                                 |
| `bun run typecheck:admin`                                                       | Before PR                                                 |
| `bun run test:unit:cms`                                                         | CMS unit tests                                            |
| `bun run test:unit`                                                             | Full unit suite                                           |
| `node scripts/run-with-ci-env.mjs -- bunx turbo run build --filter=@asym/admin` | Strict admin build                                        |
| `bun run test:e2e:cms`                                                          | Full CMS Playwright — needs **DB + ports 3005/3030 free** |
| `bun run test:e2e:smoke:cms`                                                    | Smaller CMS smoke set                                     |
| `bun run verify:data-boundary`                                                  | After adding `apps/*/app/api/**` routes                   |

**E2E failure modes:** port in use (`EADDRINUSE`); admin dev never becomes ready without Postgres for Payload — free ports and run `supabase start` or valid `PAYLOAD_DATABASE_URI`.

---

## 9. Rollback

1. Set `CMS_WEB_STUDIO_NATIVE_*=false` for affected collections; redeploy.
2. Emergency: remove `endpoints: [webStudioCreateFromTemplateEndpoint]` from `payload.config.ts` disables template instantiation only.
3. Do not drop `cms` data without backup + approval.

---

## 10. Data access boundary

Route files under `apps/admin/app/api/**/*.ts` must be **thin re-exports** to `@asym/api/*` when touching Supabase. See `docs/guides/architecture/data-access-boundary.md`.

---

## 11. Common failures

| Symptom                             | Likely cause                                      |
| ----------------------------------- | ------------------------------------------------- |
| `PAYLOAD_SECRET must be configured` | Set secret or `NODE_ENV=test` for importmap       |
| Import map wrong paths              | Re-run `cms:importmap` + check postprocess script |
| 404 on public CMS                   | Tenant not resolved or no published doc           |
| Wizard POST 403                     | Not staff / wrong session                         |
| `verify:data-boundary` fails        | Direct `@asym/database` import in `app/api`       |
