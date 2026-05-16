# Web Studio — operations runbook

**Audience:** engineers running or debugging Web Studio locally or in CI.  
**Canonical architecture:** [`docs/guides/architecture/web-studio-living-spec.md`](../architecture/web-studio-living-spec.md)
**Deterministic local CMS path:** [`site-studio-local.md`](./site-studio-local.md)

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
| `PAYLOAD_DATABASE_POOL_MAX`                 | Optional hosted Payload Postgres pool cap; defaults to `2` on Vercel/protected deployments  |
| `PAYLOAD_DISABLE_SCHEMA_PUSH`               | Set to `1` for deterministic local CMS migrations                                           |
| `NEXT_PUBLIC_DONOR_URL`                     | Origin for published public links from admin (optional; defaults in preview helper)         |
| `CMS_BASE_URL`                              | On **donor**: admin origin for public CMS fetches                                           |
| `RESEND_API_KEY`                            | Payload auth email adapter in production                                                    |
| `BLOB_READ_WRITE_TOKEN`                     | Payload media storage adapter in production; set by connected Vercel Blob store             |

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

For the one-command local path, use:

```bash
bun run cms:local:reset
```

For non-destructive repair, use:

```bash
bun run cms:local:bootstrap
```

---

## 4. Import map

After changing Payload component paths or `payload.config.ts` admin components:

```bash
bun run cms:importmap
```

The command loads the repo-root `.env.local`, runs Payload generation, and writes
`apps/admin/app/(payload)/web-studio/importMap.js` (post-processed by
`scripts/dev/postprocess-payload-importmap.mjs`). Do not set `NODE_ENV=test` for
the normal import-map workflow unless you also export the required public
Supabase env vars; Next.js intentionally skips `.env.local` in test mode.

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
- Authenticated preview: `/web-studio/preview/pages/<id>` redirects unauthenticated users to `/login`; signed-in staff/admin can preview drafts through Payload access control.
- Public: `curl` or browser `GET /api/cms/public/pages/home?tenant=<slug>` on admin port
- Template gallery: `/web-studio/templates`

---

## 7. Preview / live preview gotchas

- **Draft preview URL** for page-like collections and ministry updates is built in `apps/admin/src/cms-ui/web-studio/adapters/preview-url.ts` and opens `/web-studio/preview/:collection/:id`.
- The authenticated preview route reads drafts with Payload Local API, `overrideAccess: false`, and the current Web Studio user. Do not convert it to a public route.
- Public donor links in the native editor inspector use `NEXT_PUBLIC_DONOR_URL` / `DONOR_APP_URL` and are shown only for published documents.
- **Live preview** depends on Payload live preview config and donor app availability; nested live preview may still be **stock Payload UI** (see living spec).
- If preview opens wrong host, check env and that donor dev server matches.

---

## 8. Test commands (copy/paste)

| Command                                                                         | When                                                      |
| ------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `bun run cms:importmap`                                                         | After component path, Payload plugin, or admin UI changes |
| `bun run lint:admin`                                                            | Before PR                                                 |
| `bun run typecheck:admin`                                                       | Before PR                                                 |
| `bun run test:unit:cms`                                                         | CMS unit tests                                            |
| `bun run cms:local:verify`                                                      | Strict local DB/Payload/CMS seed verifier                 |
| `bun run test:e2e:cms:local`                                                    | Strict local Web Studio + public CMS Playwright proof     |
| `bun run test:unit`                                                             | Full unit suite                                           |
| `node scripts/run-with-ci-env.mjs -- bunx turbo run build --filter=@asym/admin` | Strict admin build                                        |
| `bun run test:e2e:cms`                                                          | Full CMS Playwright — needs **DB + ports 3005/3030 free** |
| `bun run test:e2e:smoke:cms`                                                    | Smaller CMS smoke set                                     |
| `bun run verify:data-boundary`                                                  | After adding `apps/*/app/api/**` routes                   |

**E2E failure modes:** port in use (`EADDRINUSE`); admin dev never becomes ready without Postgres for Payload — free ports and run `supabase start` or valid `PAYLOAD_DATABASE_URI`.

### E2E + Payload Postgres (hosted Supabase)

- **Docker is required** for `supabase start` locally (`npx supabase start` talks to Docker). Sandboxes without Docker cannot bring up `127.0.0.1:54322` automatically.
- **IPv4-only runners** often cannot open Supabase **direct** DB URLs (`db.<ref>.supabase.co` resolves to **IPv6**). Use a **Supavisor session pooler** connection string in `PAYLOAD_DATABASE_URI` (see root `.env.example` notes).
- **`test:e2e:smoke:cms` / `test:e2e:cms`:** Web Studio specs skip when Payload cannot reach Postgres (see `tests/e2e/cms-skip-if-no-payload.ts`). With a working `PAYLOAD_DATABASE_URI`, the admin `E2E_AUTH_BYPASS` cookie is mirrored into a normal Payload CMS user/tenant in the local CMS database, so shell tests should **run** and still go through Payload access control.

### Production Web Studio load failure

**Symptom:** `/web-studio` redirects through login correctly, then shows the global "Something went wrong" page or the Web Studio database configuration screen. Vercel logs may include `cannot connect to Postgres`, `getaddrinfo ENOTFOUND db.<ref>.supabase.co`, `EMAXCONNSESSION`, `max clients reached in session mode`, `payloadInitError`, or `unhandledRejection: reason was undefined`.

**Blank screen variant:** if `/web-studio` loads a white screen and Vercel logs
contain `getFromImportMap: PayloadComponent not found`, the generated Payload
import map is stale for the current `payload.config.ts` or plugin set. Run
`bun run cms:importmap`, commit
`apps/admin/app/(payload)/web-studio/importMap.js`, and run
`bun run test:unit:cms` before redeploying.

**Cause:** Payload initializes before Web Studio renders. In protected Vercel deployments, Payload must not use Supabase's direct `db.<ref>.supabase.co` database host because that host is often IPv6-only and Vercel functions cannot reliably resolve or reach it. Hosted Payload also needs a bounded Postgres pool because the default node-postgres pool can open up to 10 clients per Vercel worker while the Supavisor session pool is finite.

**Fix:**

1. In the Supabase production project, open **Connect** and copy the **Session pooler** Postgres URL. The host should look like `aws-0-<region>.pooler.supabase.com`; do not use the direct `db.<ref>.supabase.co` URL.
2. For the admin Payload runtime on Vercel, set the pooler query string to `sslmode=no-verify`. `sslmode=require` can fail in Node `pg` with `SELF_SIGNED_CERT_IN_CHAIN` before Payload renders.
3. In the **admin** Vercel project, update production `PAYLOAD_DATABASE_URI` to the session-pooler URL. If `SUPABASE_DB_URL` is also used by admin runtime or hosted scripts, update it to the same pooler URL.
4. Keep `PAYLOAD_DATABASE_POOL_MAX` unset unless the Supabase pool size is deliberately raised. The runtime defaults to `2` on Vercel/protected deployments because Payload keeps one startup Postgres client checked out and needs one query slot left open.
5. Connect a Vercel Blob store to the admin project so production receives `BLOB_READ_WRITE_TOKEN`; Web Studio media uploads use Payload's official Vercel Blob adapter in hosted deployments.
6. Keep `RESEND_API_KEY` configured in production. Payload auth email uses Payload's official Resend adapter and defaults to `Mission Control <noreply@asymmetric.al>` unless `PAYLOAD_EMAIL_FROM_ADDRESS` / `PAYLOAD_EMAIL_FROM_NAME` override it.
7. Redeploy the admin app from the current production branch/commit.
8. Verify `https://admin.asymmetric.al/web-studio` while signed in, then run `vercel logs --environment production --since 30m --query web-studio --level fatal` and confirm no new Web Studio fatal entries appear.
9. Run `vercel logs --environment production --since 30m --query "No email adapter" --limit 20` and `vercel logs --environment production --since 30m --query "storage adapter" --limit 20`; both should return no new Payload startup warnings.

### Admin dev: Contributions live query + stderr noise

- **`QueryBuilderError: … alias "donation"`** was caused by **two physical copies** of `@tanstack/db` in `node_modules` (different `CollectionImpl` classes). The repo runs **`node scripts/dedupe-tanstack-db.mjs` on `postinstall`** to symlink nested copies to the workspace root package. Re-run `bun install` if the error returns after a bad install.
- `useDataTableWithLiveQuery` must pass a **callback** `(q) => …` into `useLiveQuery` (see `packages/ui/components/shadcn/data-table/hooks/use-data-table-live-query.ts`).
- **`TypeError: controller[kState].transformAlgorithm is not a function`** still appears in **Next dev / Turbopack** stderr in some runs; **admin E2E passed** with it present. Treat as **dev noise** unless it reproduces on `next start` / production builds.

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

| Symptom                                                   | Likely cause                                                                                                          |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `PAYLOAD_SECRET must be configured`                       | Set secret or `NODE_ENV=test` for importmap                                                                           |
| `.env.local` still points at hosted DB during local setup | Run `bun run cms:local:reset -- --force-env` to rewrite local CMS values                                              |
| Import map wrong paths                                    | Re-run `cms:importmap` + check postprocess script                                                                     |
| 404 on public CMS                                         | Tenant not resolved or no published doc                                                                               |
| Wizard POST 403                                           | Not staff / wrong session                                                                                             |
| `verify:data-boundary` fails                              | Direct `@asym/database` import in `app/api`                                                                           |
| Nested `<html>` / hydration warning                       | `(payload)/layout.tsx` must embed Payload `RootProvider`; do not use Payload `RootLayout` under the admin root layout |
