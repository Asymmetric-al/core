# Boneyard (boneyard-js) in Core

## Version and upstream

- **npm:** `boneyard-js` is pinned to **`1.10.0`** in the apps, in `@asym/ui` and in the root `boneyard:*` scripts (`bunx boneyard-js@1.10.0`); keep them in step. Pass **app origin URLs only** to the CLI so it reads each app’s `boneyard.config.json` and visits configured `skeletons` routes (not full `/boneyard/...` paths, which trigger specific-page mode and skip skeletons).
- **Monorepo:** `@asym/ui` re-exports the React `Skeleton` as `BoneyardSkeleton` from `boneyard-js/react` but does **not** list `boneyard-js` as a runtime `dependency`. It is an **optional** `peerDependency` plus a **`devDependency`** for `@asym/ui`’s own typecheck. Apps that render Boneyard at runtime declare **`boneyard-js`** in their **`dependencies`** (`@asym/admin`, `@asym/missionary-app`, `@asym/donor`).

## Triggers

- You are adding or maintaining **pixel-matched** loading UI for complex client surfaces (tables, dense cards).
- You need to **regenerate** skeletons after layout or markup changes.

## Workflow

1. **Simple placeholders** — keep using `@asym/ui/components/shadcn/skeleton` (`Skeleton`).
2. **High-fidelity loading** — wrap the stable layout region in `BoneyardSkeleton` from `@asym/ui/components/boneyard-skeleton`, set a unique `name`, optional `fixture`, and `fallback` (usually the existing manual skeleton).
3. **Register bones at runtime** — each app imports its generated `bones/registry.ts` once via `app/_providers/boneyard-registry.tsx` in the root layout (client-only; do not import the registry from server-only files).
4. **Capture** — with the app dev server running, from repo root:
   - Admin: `bun run boneyard:admin` → `http://localhost:3030` (port **3030**; origin only — routes come from `apps/admin/boneyard.config.json`).
   - Missionary: `bun run boneyard:missionary` → `http://localhost:4000`.
   - Both: `bun run boneyard:all`.
   - Donor: none. AL-2676 (WP3b part 4) removed the donor app's public capture route `/boneyard/donor-dashboard`, its `apps/donor/boneyard.config.json` and the `boneyard:donor` scripts; the donor bones are kept as captured (see **Donor bones**).
5. **Force recapture** — after **CSS-only** changes (tokens, fonts, padding) where DOM markup is unchanged: `bun run boneyard:admin:force` / `missionary` (incremental hash is `innerHTML`-based).

## Guided crawling (`skeletons` in `boneyard.config.json`)

boneyard-js supports a top-level **`skeletons`** object: keys are skeleton **names**, values include **`route`** (path on the same origin as the CLI start URL) and optional **`wait`** (ms override for that page). When present, the CLI **skips** link discovery and visits only those routes — ideal for monorepos with multiple apps and public `/boneyard/*` capture pages.

**CLI start URL:** pass the app **origin** (`http://localhost:3030` or `4000`). Do **not** pass a full capture path like `http://localhost:3030/boneyard/contributions` — that selects specific-page mode and ignores `skeletons`.

Each app’s config in this repo lists its named skeleton(s) explicitly.

## Runtime defaults in this repo

The current repo rollout intentionally keeps Boneyard on the conservative defaults already captured into the generated registries:

- `color: "rgba(0,0,0,0.06)"`
- `animate: "pulse"`

Upstream also supports `stagger`, `transition`, `boneClass`, `shimmerColor`, `darkShimmerColor`, `speed`, and `shimmerAngle`, but we do **not** enable them globally by default. Add those only when a specific loading surface benefits from them and the regenerated bones are visually verified.

## Donor bones (kept as captured)

AL-2676 (WP3b part 4) removed the donor app's capture route `/boneyard/donor-dashboard`, its `apps/donor/boneyard.config.json` (which held the single `1280` breakpoint) and the `boneyard:donor`, `boneyard:donor:force` and `test:e2e:boneyard:donor` scripts, with the CI step "Boneyard smoke (donor app)": the donor app will serve real organizations' names, and its public paths hold none. The generated bones in `apps/donor/bones/`, their registry and the dashboard's `BoneyardSkeleton` (`donor-dashboard-main`) stay as captured. Recapturing them needs a capture path that is not a public route of the donor app.

### Donor dashboard bootstrap query

`/donor-dashboard` uses TanStack Query for a short bootstrap delay before Boneyard hands off to real content. The bootstrap **`queryFn` resolves (never rejects) when the request is aborted** (unmount, refetch, strict-mode double-invoke) so **`isError` is not shown** for benign cancellations. Real network loaders should use normal throw-on-failure semantics.

## Where files live

| App                    | Config                                 | Generated output                       | CLI origin (scripts)    | Skeleton route (`skeletons.*.route`) |
| ---------------------- | -------------------------------------- | -------------------------------------- | ----------------------- | ------------------------------------ |
| `@asym/admin`          | `apps/admin/boneyard.config.json`      | `apps/admin/bones/`                    | `http://localhost:3030` | `/boneyard/contributions`            |
| `@asym/missionary-app` | `apps/missionary/boneyard.config.json` | `apps/missionary/bones/`               | `http://localhost:4000` | `/boneyard/tasks`                    |
| `@asym/donor`          | none (removed by AL-2676)              | `apps/donor/bones/` (kept as captured) | none                    | none                                 |

`boneyard.config.json` is read from **current working directory**; scripts `cd` into each app so `out` resolves to that app’s `./bones`.

## Naming convention

Use **`{app}-{area}-{section}`** so names are unique within an app crawl (duplicate names capture only the first occurrence):

- Good: `admin-contributions-content`, `missionary-tasks-list`, `donor-dashboard-main`
- Bad: `table`, `list`, `card`

## Public capture routes (`/boneyard/*`)

Protected apps redirect unauthenticated users. Capture runs in Playwright **without** your session cookies, so pilot screens use **dedicated public routes** under `/boneyard/...`:

- **Admin:** `apps/admin/proxy.ts` lists **`/boneyard`** under `publicRoutes` so nested capture routes remain reachable without a session. The admin capture page lives at `apps/admin/app/(auth)/boneyard/`.
- **Donor:** none. `apps/donor/proxy.ts` no longer lists `/boneyard` (AL-2676, WP3b part 4), so `/boneyard/donor-dashboard` answers `404`.
- **Missionary:** `apps/missionary/proxy.ts` takes its public routes from `MISSIONARY_PUBLIC_ROUTES` in `apps/missionary/lib/route-policy.ts`, which includes `/boneyard`.

Missionary **`/boneyard` routes** render inside a minimal padded shell (not full `AppShell`) so viewport width is closer to the real main content column.

### Security and data

`/boneyard/*` is **intentionally public**. Do **not** wire real donor or task APIs, PII, or privileged server loaders into these routes—use **synthetic fixtures only**. In review, flag any change that pulls production data into `app/boneyard/**`.

Each public capture route exports **`metadata.robots`** with **`index: false`** and **`follow: false`** so search engines do not index fixture pages.

## `data-no-skeleton` and exclusions

The attribute is **not** honored unless listed in `snapshotConfig.excludeSelectors` (e.g. `'[data-no-skeleton]'`). This repo also excludes `svg` / `svg.lucide` on pilots to reduce icon noise.

## Known limitations (align with upstream behavior)

- **Client boundary** — `BoneyardSkeleton` and generated `registry.ts` are client-only; first paint may wait until `containerWidth > 0` (ResizeObserver).
- **Breakpoints** — responsive bone selection uses **viewport** width (`window.innerWidth`), not the measured container width; avoid narrow nested panels for first rollout.
- **Motion** — increase `wait` in `boneyard.config.json` if captures catch mid-animation.
- **Charts / dense SVG** — avoid or add aggressive `excludeSelectors` for chart internals.
- **Crawler** — with **`skeletons`** configured, the CLI visits only those routes; without it, the CLI may combine link discovery and filesystem route scan (see upstream CLI) and crawl other internal links where no named skeletons exist.

## Checklist

- [ ] Chose a unique `name` for each skeleton in the app.
- [ ] Provided `fallback` for missing or stale bones.
- [ ] Capture scripts use origin-only URLs with correct port.
- [ ] After global style changes, ran `--force` if skeletons look wrong.
- [ ] Did not import `bones/registry` from a server-only module.
- [ ] `/boneyard/*` pages use fixture data only (no real PII or authenticated data paths).
- [ ] Public capture routes set **`robots: { index: false, follow: false }`** in page/layout metadata.
- [ ] `boneyard.config.json` includes **`skeletons`** entries for each named capture route.
- [ ] Root capture scripts pass **origin URLs only** (not full `/boneyard/...` paths).
- [ ] The app's proxy public-route list includes `/boneyard` so nested capture routes stay public.

## Playwright smoke (`tests/e2e/boneyard-smoke.spec.ts`)

The default root `playwright.config.ts` uses the donor E2E `baseURL` (port **3005**), so this spec **skips** unless you target an app explicitly.

- **Local / CI:** `bun run test:e2e:boneyard:admin`, `test:e2e:boneyard:missionary`. The donor target and `test:e2e:boneyard:donor` were removed with the donor capture route (AL-2676, WP3b part 4).
- **Configs:** `playwright.admin.config.ts`, `playwright.missionary.config.ts` with projects **`admin-boneyard`**, **`missionary-boneyard`**. `playwright.donor.config.ts` and its project **`donor-boneyard`** remain, and the smoke spec skips there.
- **Override:** `PLAYWRIGHT_BONEYARD_TARGET=admin|missionary`, or rely on baseURL ports **3030** / **4000**.
