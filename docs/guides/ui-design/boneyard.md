# Boneyard (boneyard-js) in Core

## Version and upstream

- **npm:** track **`boneyard-js@^1.7.1`** (see [0xGF/boneyard releases](https://github.com/0xGF/boneyard/releases); v1.7.1 adds guided `skeletons` in config, CLI auth diagnostics, Preact/RN work, etc.).
- **Monorepo:** `@asym/ui` re-exports the React `Skeleton` as `BoneyardSkeleton` from `boneyard-js/react` but does **not** list `boneyard-js` as a runtime `dependency`. It is an **optional** `peerDependency` plus a **`devDependency`** for `@asym/ui`’s own typecheck. Apps that render Boneyard at runtime declare **`boneyard-js`** in their **`dependencies`** (`@asym/admin`, `@asym/missionary-app`, `@asym/donor`).

## Triggers

- You are adding or maintaining **pixel-matched** loading UI for complex client surfaces (tables, dense cards).
- You need to **regenerate** skeletons after layout or markup changes.

## Workflow

1. **Simple placeholders** — keep using `@asym/ui/components/shadcn/skeleton` (`Skeleton`).
2. **High-fidelity loading** — wrap the stable layout region in `BoneyardSkeleton` from `@asym/ui/components/boneyard-skeleton`, set a unique `name`, optional `fixture`, and `fallback` (usually the existing manual skeleton).
3. **Register bones at runtime** — each app imports its generated `bones/registry.js` once via `app/_providers/boneyard-registry.tsx` in the root layout (client-only; do not import the registry from server-only files).
4. **Capture** — with the app dev server running, from repo root:
   - Admin: `bun run boneyard:admin` (port **3030**, explicit URL required — not in Boneyard’s default port scan).
   - Missionary: `bun run boneyard:missionary` (port **4000**).
   - Donor: `bun run boneyard:donor` (port **3000**; script passes `--breakpoints 1280` — see **Donor capture note** below).
   - All three: `bun run boneyard:all`.
5. **Force recapture** — after **CSS-only** changes (tokens, fonts, padding) where DOM markup is unchanged: `bun run boneyard:admin:force` / `missionary` / `donor` (incremental hash is `innerHTML`-based).

## Guided crawling (`skeletons` in `boneyard.config.json`)

boneyard-js **1.7+** supports a top-level **`skeletons`** object: keys are skeleton **names**, values include **`route`** (path on the same origin as the CLI start URL) and optional **`wait`** (ms override for that page). When present, the CLI **skips** link discovery and visits only those routes — ideal for monorepos with multiple apps and public `/boneyard/*` capture pages.

Each app’s config in this repo lists its named skeleton(s) explicitly.

## Donor capture note (single breakpoint)

Next.js **Turbopack dev** can **navigate / hot-reload** between viewport resizes. For `@asym/donor`, the root scripts use **`--breakpoints 1280`** and `apps/donor/boneyard.config.json` sets **`"breakpoints": [1280]`** so capture is stable. Add more widths after verifying dev capture stays stable, or capture from a production build if you need full responsive bones.

### Donor dashboard bootstrap query

`/donor-dashboard` uses TanStack Query for a short bootstrap delay before Boneyard hands off to real content. The bootstrap **`queryFn` resolves (never rejects) when the request is aborted** (unmount, refetch, strict-mode double-invoke) so **`isError` is not shown** for benign cancellations. Real network loaders should use normal throw-on-failure semantics.

## Where files live

| App                    | Config                                 | Generated output         | Capture URL (public fixture route)               |
| ---------------------- | -------------------------------------- | ------------------------ | ------------------------------------------------ |
| `@asym/admin`          | `apps/admin/boneyard.config.json`      | `apps/admin/bones/`      | `http://localhost:3030/boneyard/contributions`   |
| `@asym/missionary-app` | `apps/missionary/boneyard.config.json` | `apps/missionary/bones/` | `http://localhost:4000/boneyard/tasks`           |
| `@asym/donor`          | `apps/donor/boneyard.config.json`      | `apps/donor/bones/`      | `http://localhost:3000/boneyard/donor-dashboard` |

`boneyard.config.json` is read from **current working directory**; scripts `cd` into each app so `out` resolves to that app’s `./bones`.

## Naming convention

Use **`{app}-{area}-{section}`** so names are unique within an app crawl (duplicate names capture only the first occurrence):

- Good: `admin-contributions-content`, `missionary-tasks-list`, `donor-dashboard-main`
- Bad: `table`, `list`, `card`

## Public capture routes (`/boneyard/*`)

Protected apps redirect unauthenticated users. Capture runs in Playwright **without** your session cookies, so pilot screens use **dedicated public routes** under `/boneyard/...`:

- **Admin / missionary:** path prefixes are allowlisted in each app’s layout public-path list.
- **Donor:** `apps/donor/proxy.ts` lists **`/boneyard/`** under `publicRoutes` so the capture URL is reachable without a session.

Missionary **`/boneyard` routes** render inside a minimal padded shell (not full `AppShell`) so viewport width is closer to the real main content column.

### Security and data

`/boneyard/*` is **intentionally public**. Do **not** wire real APIs, PII, or privileged server loaders into these routes—use **synthetic fixtures only**. In review, flag any change that pulls production data into `app/boneyard/**`.

## `data-no-skeleton` and exclusions

The attribute is **not** honored unless listed in `snapshotConfig.excludeSelectors` (e.g. `'[data-no-skeleton]'`). This repo also excludes `svg` / `svg.lucide` on pilots to reduce icon noise.

## Known limitations (align with upstream behavior)

- **Client boundary** — `BoneyardSkeleton` and generated `registry.js` are client-only; first paint may wait until `containerWidth > 0` (ResizeObserver).
- **Breakpoints** — responsive bone selection uses **viewport** width (`window.innerWidth`), not the measured container width; avoid narrow nested panels for first rollout.
- **Motion** — increase `wait` in `boneyard.config.json` if captures catch mid-animation.
- **Charts / dense SVG** — avoid or add aggressive `excludeSelectors` for chart internals.
- **Crawler** — with **`skeletons`** configured, the CLI visits only those routes; without it, the CLI combines link discovery and filesystem route scan (see upstream CLI).

## Checklist

- [ ] Chose a unique `name` for each skeleton in the app.
- [ ] Provided `fallback` for missing or stale bones.
- [ ] Capture scripts use explicit URLs with correct port.
- [ ] After global style changes, ran `--force` if skeletons look wrong.
- [ ] Did not import `bones/registry` from a server-only module.
- [ ] `/boneyard/*` pages use fixture data only (no real PII or authenticated data paths).
- [ ] `boneyard.config.json` includes **`skeletons`** entries for each named capture route.

## Playwright smoke (`tests/e2e/boneyard-smoke.spec.ts`)

The default root `playwright.config.ts` uses the donor E2E `baseURL` (port **3005**), so this spec **skips** unless you target an app explicitly.

- **Local / CI:** `bun run test:e2e:boneyard:admin`, `test:e2e:boneyard:missionary`, `test:e2e:boneyard:donor`.
- **Configs:** `playwright.admin.config.ts`, `playwright.missionary.config.ts`, `playwright.donor.config.ts` with projects **`admin-boneyard`**, **`missionary-boneyard`**, **`donor-boneyard`**.
- **Override:** `PLAYWRIGHT_BONEYARD_TARGET=admin|missionary|donor`, or rely on baseURL ports **3030** / **4000** / **3000**.
