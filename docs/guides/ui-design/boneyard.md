# Boneyard (boneyard-js) in Core

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
   - Both: `bun run boneyard:all`.
5. **Force recapture** — after **CSS-only** changes (tokens, fonts, padding) where DOM markup is unchanged: `bun run boneyard:admin:force` / `boneyard:missionary:force` (incremental hash is `innerHTML`-based).

## Where files live

| App                    | Config                                 | Generated output         | Capture URL (public fixture route)             |
| ---------------------- | -------------------------------------- | ------------------------ | ---------------------------------------------- |
| `@asym/admin`          | `apps/admin/boneyard.config.json`      | `apps/admin/bones/`      | `http://localhost:3030/boneyard/contributions` |
| `@asym/missionary-app` | `apps/missionary/boneyard.config.json` | `apps/missionary/bones/` | `http://localhost:4000/boneyard/tasks`         |

`boneyard.config.json` is read from **current working directory**; scripts `cd` into each app so `out` resolves to that app’s `./bones`.

## Naming convention

Use **`{app}-{area}-{section}`** so names are unique within an app crawl (duplicate names capture only the first occurrence):

- Good: `admin-contributions-content`, `missionary-tasks-list`
- Bad: `table`, `list`, `card`

## Public capture routes (`/boneyard/*`)

Protected apps redirect unauthenticated users. Capture runs in Playwright **without** your session cookies, so pilot screens use **dedicated public routes** under `/boneyard/...` that render the same skeleton + fixture. Those path prefixes are allowlisted in each app’s layout public-path list.

Missionary **`/boneyard` routes** render inside a minimal padded shell (not full `AppShell`) so viewport width is closer to the real main content column.

### Security and data

`/boneyard/*` is **intentionally public**: admin and missionary layouts allowlist this prefix so capture tooling can load pages without a session. Do **not** wire real donor or task APIs, PII, or privileged server loaders into these routes—use **synthetic fixtures only**. In review, flag any change that pulls production data into `app/boneyard/**`.

## `data-no-skeleton` and exclusions

The attribute is **not** honored unless listed in `snapshotConfig.excludeSelectors` (e.g. `'[data-no-skeleton]'`). This repo also excludes `svg` / `svg.lucide` on pilots to reduce icon noise.

## Known limitations (align with upstream behavior)

- **Client boundary** — `BoneyardSkeleton` and generated `registry.js` are client-only; first paint may wait until `containerWidth > 0` (ResizeObserver).
- **Breakpoints** — responsive bone selection uses **viewport** width (`window.innerWidth`), not the measured container width; avoid narrow nested panels for first rollout.
- **Motion** — increase `wait` in `boneyard.config.json` if captures catch mid-animation.
- **Charts / dense SVG** — avoid or add aggressive `excludeSelectors` for chart internals.
- **Crawler** — starting URL should be the public `/boneyard/...` capture page; the CLI may crawl other internal links (login, etc.) where no named skeletons exist.

## Checklist

- [ ] Chose a unique `name` for each skeleton in the app.
- [ ] Provided `fallback` for missing or stale bones.
- [ ] Capture scripts use explicit URLs with correct port.
- [ ] After global style changes, ran `--force` if skeletons look wrong.
- [ ] Did not import `bones/registry` from a server-only module.
- [ ] `/boneyard/*` pages use fixture data only (no real PII or authenticated data paths).

## Playwright smoke (`tests/e2e/boneyard-smoke.spec.ts`)

The default root `playwright.config.ts` uses the donor `baseURL` (port **3005**), so this spec **skips** unless you target admin or missionary explicitly.

- **Local / CI:** `bun run test:e2e:boneyard:admin` and `bun run test:e2e:boneyard:missionary` (each config starts its own dev server on **3030** / **4000**).
- **Manual:** `-c playwright.admin.config.ts` / `playwright.missionary.config.ts` with `--project=admin-boneyard` / `missionary-boneyard`.
- **Override:** set `PLAYWRIGHT_BONEYARD_TARGET=admin` or `missionary` if `baseURL` uses port **3030** / **4000** but project names differ.
