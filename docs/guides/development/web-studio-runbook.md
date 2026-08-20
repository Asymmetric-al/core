# Web Studio — operations runbook

**Audience:** engineers running or debugging Web Studio locally or in CI.  
**Canonical architecture:** [`docs/guides/architecture/web-studio-living-spec.md`](../architecture/web-studio-living-spec.md)
**Deterministic local CMS path:** [`site-studio-local.md`](./site-studio-local.md)

---

## 1. Prerequisites

- Bun (see root `packageManager` in `package.json`)
- Docker (for local Supabase) — see root `AGENTS.md` Supabase section
- Node.js `24.15.0+` for Payload 4 CMS CLI commands (`cms:migrate`,
  `cms:migrate:status`, `cms:importmap`)
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
- Interim authenticated preview: `/web-studio/preview/pages/<id>` redirects
  unauthenticated users to `/login`; signed-in staff/admin can inspect the
  mutable Payload draft through Payload access control. This verifies current
  infrastructure only and is not Phase 22 D10 certification.
- Public: `curl` or browser `GET /api/cms/public/pages/home?tenant=<slug>` on admin port
- Template gallery: `/web-studio/templates`

---

## 7. Preview / live preview gotchas

- **Interim draft preview URL** for page-like collections and ministry updates
  is built in
  `apps/admin/src/cms-ui/web-studio/adapters/preview-url.ts` and opens
  `/web-studio/preview/:collection/:id`.
- The interim route reads mutable drafts with Payload Local API,
  `overrideAccess: false`, and the current Web Studio user. Do not convert it
  to a public route or expose/share its URL as a review capability. Successful
  Payload authentication, `overrideAccess: false`, or document-ID possession
  is not Phase 22 D10 authorization. D10 requires one exact saved revision or
  immutable candidate, current Phase 12/10/D9 reproof on every request, the
  production-equivalent renderer, inert consequential controls, and a
  private/no-store/non-indexable response.
- Public donor links in the native editor inspector use `NEXT_PUBLIC_DONOR_URL` / `DONOR_APP_URL` and are shown only for published documents.
- **Live preview** depends on Payload live preview config and donor app
  availability; nested live preview may still be **stock Payload UI** (see
  living spec). If later adopted for Public Ministry Pages, it is transport
  over coherently saved exact versions and cannot weaken D10 authorization.
- If preview opens wrong host, check env and that donor dev server matches.

### Phase 22 D14 public search-and-sharing certification note

The current public CMS endpoints, global metadata helpers, public URL builders,
raw media serializer, Update list endpoint, and Share UI are not D14
certification. For each exact current release, verify the real public URL,
complete initial body/head, `GET`/`HEAD` parity, canonical and reciprocal
admitted locales, crawler directive, exact-host sitemap disposition, visible-
fact JSON-LD, D9-certified card image and contextual alt, and native Share plus
Copy-link fallback from one manifest digest. Prove all three postures:
Listed-public is search eligible and shareable; Shared-by-link is shareable and
`noindex` but not path-blocked in `robots.txt`; non-public emits no content-
specific anonymous metadata or card. No public response may expose an original
filename or source metadata, and no provider submission, crawl, index, rank,
cache, share, refresh, or removal result is guaranteed by this local proof.

### Phase 22 D16 public-page writing-assistance note

Do not add provider SDK calls, credentials, prompts, hidden context retrieval,
or suggestion-application authority to Payload hooks, Lexical nodes, generic
toolbars, or browser routes. Web Studio may eventually render D16's same quiet
**Help me write** and **Translate to English** actions, but the server-owned
Phase 22 semantic authoring boundary must reauthorize the exact working
revision/field digest, consume the shared Phase 21 D10 binding and Phase 10
egress result, and return one private suggestion for explicit comparison and
CAS Use. Translation targets an existing exact Phase 24 English locale and must
show the code-owned check-work warning; it never changes locale or release
state.

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

### Phase 22 D17 certification note

Do not treat `project-pages.fundId`, a fund-backed wizard result, copied source
text, Payload relationship success, a public serializer field, or an
application-level duplicate precheck as Page Subject authority. D17 requires an
operational, same-scope, typed and immutable-versioned binding to one certified
source, release-time source/Phase 10 reproof, and an opaque Payload Page
reference. The setup and tests must keep subject, Giving, progress,
contributors, reach/release, and lifecycle separate; a released subject is
never changed in place.

### Phase 22 D18 runtime-composition certification note

Do not treat a Payload published read, cache tag, revalidation request,
deployment, or provider acceptance as current Public Ministry serving truth.
Phase 5 executes runtime/cache mechanics; Phase 22 owns current-serving
admission and adverse-first controlled-surface convergence. Certification must
prove that no Asym-controlled response bypasses the current-serving evaluation
and that no cache or effect path becomes a second public authority. See
[ADR-0135](../../adr/0135-release-bound-public-ministry-runtime-composition.md).

### Phase 22 D19 Ministry Assignment certification note

Do not certify `missionaryId`, a Payload relationship, one visible spouse name,
a shared login, a household edge, a page contributor, a Designation, or a
Support Assignment participant as the Missionary Page subject or as support
access. Prove one exact same-scope Ministry Assignment, non-overlapping
effective-dated Party memberships, separately current display/contributor
assignments, and—only when enabled—one prospective Phase-21-owned Support
Binding. For each support reader, prove the current Phase 12 purpose, target,
module, field, ISO-currency, history-floor, and authorization epoch; revoke
deny-first; expose no raw table or financial Realtime stream; and verify
cross-tenant, cross-entity, cross-assignment, stale-session, service-role,
concurrency, and performance cases. The **People & access** review must state
literal consequences and may never hide an implicit spouse/team grant.

### Phase 22 D20 semantic-catalog certification note

Do not certify the generic block builder, template copy, `pageType`, free CTA
URL, Payload validation, or preview/public serializer agreement as a Page Family
Semantic Catalog. Prove both code-owned family catalogs, finite role and zone
identities, tenant-profile compatibility, fail-closed unknown semantics, and a
D2 release manifest that pins every required generation. Invalid successor
input must preserve the last certified release and expose an owner-actionable
editor exception rather than silently dropping a block.

### Phase 22 D21 complete-surface adoption certification note

Do not treat a Payload publish, native/stock collection toggle, successful
shadow render, cache warm, deployment, or provider response as public-reader
authority. Certification must prove: the smallest complete host/locale/shared-
artifact dependency closure; an immutable successor plan and complete one-
disposition manifest; private side-effect-dark full-surface shadowing distinct
from D10 human preview; exact Phase 12 adoption authority; precomputed digest/
epoch reproof inside one CAS; an atomic local receipt plus D18 outbox cause;
old-code fail-closed behavior; and no raw Payload, mock `/workers`, old cache, or
legacy reader after cutover. UI rollback may restore an editor view only. It
must never reverse the D21 authority head or bypass D1-D20 owners. See
[ADR-0138](../../adr/0138-complete-public-ministry-surface-authority-cutover.md).

### Phase 22 D22 Public Pages operations certification note

Do not certify Payload list membership or `_status`, the public directory, or
generic Mission Control **Needs attention** and task state as D22 cause,
action, resolution, or Page health authority. Prove one private, rebuildable,
permission-filtered projection with exactly **To review**, **Needs attention**,
and **All pages** views; complete cause-to-impact coverage; deterministic
deduplication; and authorization before rows, counts, search, cache, or
notifications become observable. Every enabled action must reauthorize and
route to the applicable current source-owner command. Prove that owner resolution
alone clears or reopens impacts and that completing, dismissing, deleting, or
failing an optional shared task closes nothing.

### Phase 22 D23 Public Page setup/settings certification note

Do not certify mutable `org-settings`, Payload preferences or collection
defaults, tenant-only browser selection, or toast-reported saves as D23 truth.
Prove one private, complete-scope, permission-filtered disposable projection;
distinct organization-choice, built-in, safe-fallback, creation-seed, Off,
unavailable, partial, unknown, and not-applicable states; and authorization
before labels, rows, options, counts, history, preview, deep links, or caches.
Every enabled Change action must reauthorize and invoke exactly one owner command
with immutable successor, idempotency, CAS, ambiguous-outcome inspection, and
authoritative readback. Prove D23 failure cannot block public serving and that
no operation can activate D21, clear D22 work, publish, expose a credential, or
change per-Page truth.

### Phase 22 D24 Staff-authored Page Revision certification note

Do not certify broad tenant/Payload roles, locks, autosave/version history,
`_status`, restore, Publish/Unpublish, API access, or the current coarse audit
hook as D24 authority. Prove independent edit/review/release capabilities,
complete same-scope actor/predecessor/content-source evidence, D3/D20 target
enforcement, current authorization and safety reproof, expected-head CAS,
idempotency, authoritative readback, ambiguous-outcome inspection, and orphan
reconciliation. Test concurrent editors, stale tabs, revocation, active and
submitted contributor supersession, `Use as starting point`, retention pins,
unknown legacy attribution, tenant isolation, and negative review/release/public
effects. Actor-context Payload calls must set `overrideAccess: false` and
`overrideLock: false`, while remaining subordinate to the product command.

### Phase 22 D25 Derived actionability and recovery certification note

Do not certify Payload autosave age, locks, `_status`, version history/caps,
restore, trash, audit hooks, browser storage, or retained bytes as current
actionability, recovery, access, or retention authority. Prove that the finite
server resolver derives each action from exact current D1-D24 owner heads and
that the owning command independently re-proves at commit. Verify zero D25
operational status/queue/content/per-autosave event/expiry-scan persistence.

Against the exact installed Payload prerelease, certify one coalesced recovery
buffer for the exact Page and locale: two-second trailing dirty debounce,
15-second maximum wait, explicit **Save draft**, safe navigation/handoff flush,
digest no-op suppression, one in-flight write per generation, late-write
fencing, and no semantic-head or candidate advancement. Prove deliberate
semantic sealing before reference, blind native pruning disabled, D24-only
reference-safe scratch cleanup, ambiguity-preserving quarantine, and negative
review/release/public/notification effects. Test stale and losing tabs,
concurrent editors, revoked access, old submitted candidates, changed catalogs/
media/subjects/safety, same-scope reuse, cross-scope denial, save ambiguity,
orphan cleanup races, mobile recovery comparison, and accessible quiet status.

### Phase 22 D26 Public Content Sharing Attestation certification note

Do not certify upload completion, D9 sanitization, terms, Payload roles,
autosave, `_status`, or native publish as permission evidence. Prove that the
existing D4/D5 final action visibly carries the correct code-owned sentence and
atomically freezes the exact candidate plus statement version, actual actor,
server time, complete scope, normalized digest, and action. Verify unchanged
staff approval creates no second attestation, while a material D24 successor
requires its own actual-actor action.

Test every client, service, import, clone, translation, restore, native publish,
and ambiguous-retry path for bypass and inheritance denial; prove tenant and
scope isolation, CAS concurrency, legacy **not captured** classification,
current Phase 10 override, D9/D2/D11/D18 containment, content-free diagnostics,
and no public-render lookup or D26 table. Complete mobile, keyboard,
screen-reader, reflow, localization, forced-colors, and no-extra-step usability
proof before certification.

### Phase 22 UI-quality evidence

For any Phase 22 implementation slice that changes `packages/ui`, run
`bunx @shadscan/cli@0.1.1 ./packages/ui --json --no-interactive` before and
after the slice. Record both scores, the configured floor, and the exact changed
paths in the release evidence manifest. Treat an unassessed or below-floor
result as a failed gate; never treat the score as accessibility, browser,
performance, or public-safety certification.
