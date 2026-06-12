> **ARCHIVED (2026-06):** Historical audit from the Radix era. The UI layer
> is now Base UI only — see docs/ai/audits/base-ui-only-migration.md.

# shadcn/ui Full Turbo-repo Audit — 2026-04-16

> Superseded status: historical reference only. A 2026-04 follow-up audit found the current tree pinned to `base-maia`, `iconLibrary: lucide`, `baseColor: zinc`, and `bun run verify:shadcn-diff` reports no drift. Re-check the current working tree before applying any recommendations below.

Exacting, precise audit of the shadcn/ui footprint across the `asymmetrical-platform` monorepo (apps/admin, apps/donor, apps/missionary, packages/ui, packages/missionary, packages/lib).

Prepared using:

- `shadcn@4.3.0` CLI (`shadcn add <component> --diff`) against every installed component
- Nia MCP queries against the live `shadcn-ui/ui` repo for v4.3 best practices, Radix unified package migration, Tailwind v4 theming, icon library defaults, and the TanStack Form replacement patterns
- Nia MCP queries against `vercel/next.js` for Next.js 16 Cache Components strict client-boundary validation
- Manual inspection of `packages/ui/components/shadcn/*`, `styles/globals.css`, `styles/theme.css`, `components.json`, and consumer imports across apps

Commands used (for reproduction):

```bash
cd packages/ui
npx shadcn@latest info
# Per-component canonical diff (produces one file per component)
for c in accordion alert alert-dialog avatar badge breadcrumb button-group button \
         calendar card carousel chart checkbox collapsible command context-menu \
         dialog drawer dropdown-menu empty field form hover-card input input-group \
         input-otp item kbd label menubar navigation-menu pagination popover progress \
         radio-group resizable scroll-area select separator sheet sidebar skeleton \
         slider sonner spinner switch table tabs textarea toggle toggle-group tooltip; do
  npx shadcn@latest add "$c" --diff > "/tmp/diff-$c.txt"
done
```

---

## 0. Environment snapshot

| Thing                | Value                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| shadcn CLI           | `4.3.0`                                                                                          |
| Next.js              | `16.2.1` (all 3 apps)                                                                            |
| React / React DOM    | `19.2.3`                                                                                         |
| Tailwind CSS         | `^4` (CSS-first — no `tailwind.config.*` in apps)                                                |
| Tailwind PostCSS     | `^4`                                                                                             |
| `tw-animate-css`     | `^1.4.0` (imported in `packages/ui/styles/globals.css`)                                          |
| `cacheComponents`    | `true` on all 3 apps (Next.js 16 Cache Components mode — strict client-boundary validation)      |
| React compiler       | `reactCompiler.compilationMode: "annotation"` on all 3 apps                                      |
| View transitions     | `experimental.viewTransition: true` on all 3 apps                                                |
| `lucide-react`       | `^0.575.0`                                                                                       |
| `motion`             | `^12.34.2`                                                                                       |
| `@base-ui/react`     | `1.3.0` (used only by drawer)                                                                    |
| Radix primitives     | 28 individual `@radix-ui/react-*` packages pinned in `packages/ui/package.json`                  |
| Shared UI package    | `@asym/ui` → single `components.json` at `packages/ui/components.json`                           |
| Installed components | 51 canonical shadcn components + heavy custom additions (chart-wrappers, data-table, data-grid…) |

`packages/ui/components.json` declares `"style": "new-york"`, `"rsc": false`, `baseColor: "zinc"`, `cssVariables: true`, and `iconLibrary` (implicit → `"radix"` due to `new-york`, even though the repo uses `lucide-react` throughout).

`shadcn info` confirms:

```
framework         Manual (manual)
tailwindVersion   v4
style             new-york
base              radix
iconLibrary       radix
tailwindCss       packages/ui/styles/globals.css
```

---

## 1. Baseline — what is good and should stay

These are correct-by-design and must be preserved by any refactor:

1. **Single `components.json` and single token source-of-truth** (`packages/ui/styles/globals.css`) — follows Turbo / monorepo shadcn best practice. Apps import `@asym/ui/styles/globals.css` as the first line of their `app/globals.css`. No per-app `tailwind.config.*`. No duplicated tokens.
2. **OKLCH color space, `@theme inline`, and `@custom-variant dark (&:is(.dark *));`** — matches the shadcn v4 + Tailwind v4 canonical pattern.
3. **`new-york` style + Zinc palette** — the intentional "Maia soft + rounded" look is encoded as OKLCH tokens + `--radius: 1rem`.
4. **Deep-import-first convention** (`import { Button } from "@asym/ui/components/shadcn/button"`) with a curated barrel at `@asym/ui/components/shadcn` — keeps tree-shaking clean. The deep-import pattern is used in hundreds of call-sites across all three apps.
5. **Next.js config hygiene** — `transpilePackages: ["@asym/ui", …]`, `optimizePackageImports: ["@asym/ui", "lucide-react", "@radix-ui/react-icons"]` everywhere, and `cacheComponents: true` — all correct for Next.js 16 + Turbopack.
6. **`cn` helper** (`packages/ui/lib/utils.ts`) is the canonical shadcn helper (clsx + tailwind-merge).
7. **Reduced-motion base rule** in `styles/globals.css` and a robust **touch-target rule** for `pointer: coarse` — both exceed the default shadcn template.
8. **Form system intentionally replaced** — the repo uses a custom `@tanstack/react-form` wrapper (`Asym*Field` + `useAsymForm`), now moved to `packages/ui/components/primitives/tanstack-form.tsx`. Upstream shadcn v4 officially documents TanStack Form as an alternative to `react-hook-form` (`content/docs/forms/tanstack-form.mdx`), so keeping this is aligned with current guidance.

---

## 2. Findings ranked by severity

Each finding lists: severity, what is wrong, evidence, why it matters, recommended fix, and rough scope.

### S0 — Must fix (correctness / Next.js 16 Cache Components compliance)

#### S0-1 `"use client"` missing on Radix-based components

**Evidence.** `grep` of `"use client"` on the first line of every file under `packages/ui/components/shadcn/*.tsx`:

Files **without** `"use client"` that nevertheless use Radix / Base UI client primitives (or other client-only constructs):

- `accordion.tsx` — has `"use client"` ✓ (kept)
- `badge.tsx`, `alert.tsx`, `breadcrumb.tsx`, `card.tsx`, `empty.tsx`, `input.tsx`, `item.tsx`, `kbd.tsx`, `pagination.tsx`, `skeleton.tsx`, `spinner.tsx`, `textarea.tsx` — **pure presentational / DOM-only, OK without `"use client"`** (upstream v4 removed `"use client"` from these in the `new-york` + `rsc:false` base).
- `button.tsx` — correctly server-safe (Slot.Root is server-renderable).
- `button-group.tsx` — uses `Slot` from `@radix-ui/react-slot` which is safe at SSR — OK to omit.
- **Critical problem:** `navigation-menu.tsx` imports `@radix-ui/react-navigation-menu` (which internally uses `React.createContext`, `useState`, `useEffect`) but has **no `"use client"` directive**. With `cacheComponents: true` under Next.js 16 this will fail the strict client-boundary validator whenever a parent `"use cache"` segment tries to render it.

Per Nia + v4 changelog: when `rsc: false`, the CLI no longer auto-appends `"use client"`. You must add it manually to any component that touches hooks, context, portals, or event handlers.

**Why it matters.** Next.js 16 with `cacheComponents: true` treats uncached dynamic data outside of `<Suspense>` or a `"use client"` boundary as a build-time error (`"Uncached data was accessed outside of <Suspense>"` / `"This module must be marked with 'use client'"`). The error is usually caught at build, but when it's not (e.g. compiled by RSC with an optimistic boundary) the component silently hydrates wrong and every Radix context lookup returns `null`, which manifests as "useSidebar must be used within a SidebarProvider"-style runtime errors.

**Action.** Add `"use client"` to `navigation-menu.tsx`. Audit every remaining presentational component explicitly against the upstream `new-york-v4` base and remove the directive only where upstream also removes it (and adopt that version wholesale — see S1-1 below).

**Scope.** 1 file at minimum; the bulk migration is covered by S1-1.

---

#### S0-2 Hardcoded non-theme colors (dark-mode and token discipline regressions)

**Evidence.** `rg 'bg-white|text-zinc-\d|bg-zinc-\d|border-zinc-\d|text-slate-|bg-slate-|border-slate-|text-black'` inside `packages/ui/components/shadcn/`:

| File                                | Issue                                                                                                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `button.tsx`                        | `variant: maia` and `maia-outline` hardcode `bg-slate-900`, `bg-white`, `text-slate-600`, `border-slate-200`, `hover:bg-slate-50`, `hover:bg-slate-800` |
| `slider.tsx`                        | Thumb hardcodes `bg-white` — invisible on dark theme                                                                                                    |
| `chart-wrappers.tsx`                | `ChartTooltip` + `KpiTile` hardcode `bg-white`, `text-zinc-400/600/900`, `border-zinc-50/100/200`, `bg-zinc-50/100`, `bg-white/80` with no dark variant |
| `data-grid/data-grid-cell.tsx`      | `bg-white` on inline edit input — invisible on dark                                                                                                     |
| `data-table/data-table-wrapper.tsx` | `text-zinc-900`, `text-zinc-500` in the error / empty states — invisible on dark                                                                        |
| `filter-bar.tsx`                    | Multiple `bg-white`, `text-zinc-400/600/900`, `border-zinc-100/200`, `bg-zinc-100/200` strings                                                          |
| `image-cropper.tsx`                 | Hardcoded `bg-white`, `border-zinc-100/200`, `text-zinc-400/500/600/900`, `bg-zinc-900`, `hover:bg-zinc-800` — has its own mini palette                 |
| `image-upload.tsx`                  | Hardcoded `border-zinc-200/400`, `text-zinc-400`, `bg-zinc-50`                                                                                          |
| `map.tsx`                           | ~20 hardcoded `zinc-*` / `bg-white` rules (does pair them with `dark:` so it's partially OK, but drifts from the token system)                          |

**Why it matters.** `AGENTS.md` and `docs/ai/ADMIN-UX-STANDARDS.md` explicitly ban non-semantic color usage. These components visibly break in dark mode or regress the Maia palette contract whenever someone re-themes the palette (light or dark). This is the top visible regression risk in the UI.

**Action.** Replace with semantic tokens:

- `bg-white` → `bg-background` or `bg-card` / `bg-popover` depending on surface
- `text-zinc-900` → `text-foreground`
- `text-zinc-500/600` → `text-muted-foreground`
- `text-zinc-400` → `text-muted-foreground/80`
- `border-zinc-100/200` → `border-border` (or `border-border/50` where lighter)
- `bg-zinc-50/100/200` → `bg-muted` / `bg-accent`
- `bg-zinc-900` → `bg-primary` (only if the surface is inverse), else `bg-foreground`

Keep `maia` and `maia-outline` variants (they are consumed in `apps/missionary/app/feed/worker-feed-page-client.tsx`) but swap the hardcoded slate classes for the same semantic tokens.

**Scope.** 9 files. Mostly one-to-one class swaps. Needs a visual QA pass on light + dark.

---

#### S0-3 `useIsMobile` duplicated between `@asym/lib` and `@asym/ui`

**Evidence.**

- `packages/lib/hooks/use-mobile.ts` — 142 lines
- `packages/ui/hooks/use-mobile.ts` — 138 lines, byte-level near-identical
- `packages/ui/components/shadcn/sidebar.tsx` imports `useIsMobile` from `@asym/lib/hooks/use-mobile` — bypassing the `@asym/ui` hook entirely.

**Why it matters.** Two sources of truth for breakpoint state drift over time; one will eventually return a different value than the other. Also, `@asym/lib/hooks/use-mobile.ts` references `@asym/lib/responsive` while `@asym/ui/hooks/use-mobile.ts` references `../lib/responsive` — they're the same hook in two packages, which means the `BREAKPOINTS` constant is imported from two different places and can diverge silently.

**Action.** Pick one owner — `@asym/ui/hooks/use-mobile` is the correct location per shadcn convention (`packages/ui/components.json` already declares `hooks: @/hooks`). Update `sidebar.tsx` to import from the local hooks file. Make `@asym/lib/hooks/use-mobile.ts` re-export from `@asym/ui/hooks` or delete it entirely (after updating the other ~6 consumers).

**Scope.** 1 hook file to retire, 1 sidebar import to fix, ~6 consumer import-path updates, run `bun run typecheck` twice.

---

### S1 — Should fix (drift from canonical, affects upgradeability)

#### S1-1 Full-registry drift — 50 components diverge from `shadcn@4.3.0` canonical

**Evidence.** `shadcn add <component> --diff` dry-run against every installed component. Measured lines of diff (LOW = small cosmetic delta, HIGH = important semantic delta):

| Tier            | Components                                                                                                                                                                                                             | Diff lines |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Trivial (< 30)  | `sonner`, `spinner`, `collapsible`, `label`, `skeleton`, `kbd`, `textarea`, `input`                                                                                                                                    | 15–30      |
| Low (30–60)     | `hover-card`, `separator`, `input-otp`, `checkbox`, `radio-group`, `alert`, `switch`, `toggle`, `empty`, `tooltip`, `progress`, `breadcrumb`, `accordion`                                                              | 30–60      |
| Medium (60–110) | `card`, `badge`, `scroll-area`, `slider`, `toggle-group`, `table`, `resizable`, `popover`, `navigation-menu`, `select`, `tabs`, `dialog`, `sheet`, `dropdown-menu`, `avatar`, `carousel`, `context-menu`, `pagination` | 60–110     |
| High (110–300)  | `menubar`, `item`, `field`, `button-group`, `drawer`, `calendar`, `alert-dialog`, `input-group`, `command`, `sidebar`, `chart`                                                                                         | 110–300    |
| Custom (≥ 300)  | `form` (899 line diff — intentional TanStack Form rewrite)                                                                                                                                                             | 899        |

**Common drift patterns** (present in roughly every file):

1. **Import style** — upstream now uses the unified `radix-ui` package (`import { Dialog as DialogPrimitive } from "radix-ui"`). The repo still uses individual `@radix-ui/react-*` packages. `shadcn migrate radix` exists specifically for this.
2. **Import alias** — upstream canonical is `@/lib/utils`; the repo uses `@asym/ui/lib/utils` — **this is intentional and correct** for the monorepo split, so every `--diff` line about `@/lib/utils` is a false positive. Do NOT change.
3. **`"use client"` removal** — upstream removed `"use client"` from presentational components (`alert`, `badge`, `card`, `breadcrumb`, `input`, `label`, `skeleton`, `spinner`, `textarea`, `empty`, `kbd`, `item`, etc.). The repo has mostly done this already, but inconsistencies remain (`navigation-menu` needs one; `pagination` is fine).
4. **`<Slot>` → `<Slot.Root>`** — small API rename with the new `radix-ui` package. Only matters after the `migrate radix` step.
5. **Button variants** (`button.tsx`):
   - Missing: `size="xs"` and `size="icon-xs"` **Note**: `icon-xs` exists but with a different class string than upstream.
   - Missing: `data-variant={variant}` / `data-size={size}` data attributes (used by v4 for style-in-style recipes).
   - Default variant of `variant`/`size` is `undefined` instead of explicitly `"default"`, which breaks CSS attribute selectors.
   - Dark mode pairs missing: `dark:bg-destructive/60`, `dark:hover:bg-accent/50`, `dark:border-input`, `dark:bg-input/30`, `dark:hover:bg-input/50` — these are the four additions that make the v4 Zinc palette read correctly in dark mode on non-primary buttons.
   - Transition changed from `transition-colors` → `transition-all` in v4.
   - Focus ring changed from `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` → `focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50` (this is the v4 "glowy ring" style — used consistently across every other input in the repo already, but the button still has the v3 2-px ring + offset).
6. **Input** — upstream adds `min-w-0`, `selection:bg-primary selection:text-primary-foreground`, `file:inline-flex file:h-7`, `disabled:pointer-events-none`, and the glow-ring. Repo still has the v3 `focus-visible:ring-1`.
7. **Card** — upstream uses `gap-6 / py-6 / px-6 / pb-6 / pt-6` (size up from 4 to 6). Repo remains on `gap-4 / py-4 / px-4 / pb-4 / pt-4`. This is a design decision, not a bug per se, but it is the single biggest visual delta versus upstream.
8. **Dialog/Sheet overlay class string bug** — upstream removed the concatenated-without-space string `"data-[state=closed]:animate-outdata-[state=closed]:fade-out-0"` (missing whitespace). The repo has the same typo, which makes the close-out animation not apply. See `/tmp/diff-dialog.txt` line 27 and `/tmp/diff-sheet.txt` line 25.
9. **Sheet `showCloseButton` prop** — upstream added an opt-out toggle (`showCloseButton = true`). Repo always renders the close button — breaks designs that need a Sheet without a built-in X.
10. **Badge** — upstream added `ghost` + `link` variants, moved `border-transparent` into the base so each variant doesn't repeat it, added `data-variant` attribute.
11. **Tooltip** — upstream removed the implicit `<TooltipProvider>` wrapper around every `<Tooltip>` (big perf win — one provider per subtree is better than one per tooltip). Repo keeps the provider wrapper.
12. **Alert-dialog / Command / Sidebar / Chart / Calendar / Input-group / Drawer** — 150–300 line diffs driven mostly by the same 5 patterns above multiplied across many slots.

**Why it matters.** Every future `shadcn add <component>` becomes a merge conflict. Whenever a new v4 feature (e.g. `Sheet` `showCloseButton`, `Tooltip` arrow, new button sizes) lands, you have to hand-port it. The drift will only grow.

**Action.** Three-stage, gated approach:

1. **Stage A — Zero-risk migration (`shadcn migrate radix`)**. Run `npx shadcn@latest migrate radix --cwd packages/ui`. This rewrites every `@radix-ui/react-*` import to `radix-ui` and swaps `Slot` → `Slot.Root`. Add `radix-ui` dependency, verify the 28 `@radix-ui/react-*` packages can be retired (keep them until nothing in apps references them directly). Run `bun run typecheck && bun run build` after.
2. **Stage B — Canonical resync, one component at a time**, in order of smallest-to-largest diff:
   - Trivial (8 files): `sonner`, `spinner`, `collapsible`, `label`, `skeleton`, `kbd`, `textarea`, `input`. Accept upstream wholesale; re-apply the `@asym/ui/lib/utils` path; commit per file.
   - Low (13 files): as above.
   - Medium (18 files): hand-review diff. For `card` specifically, decide whether to adopt upstream's `gap-6 / p-6` (visual review required).
   - High (11 files): hand-port per slot. `sidebar` is the riskiest because of the `useIsMobile` import-path change and because upstream has added new slot variants.
3. **Stage C — Keep our intentional customizations**: `tanstack-form.tsx` (TanStack Form), `button.tsx` `maia` / `maia-outline` variants, and the repo’s first-party shared compositions (`chart-wrappers.tsx`, `filter-bar.tsx`, `motion-preset.tsx`, `ripple-button.tsx`, `image-upload.tsx`, `image-cropper.tsx`, `map.tsx`, `page-shell.tsx`, `responsive-container.tsx`, `theme-toggle.tsx`, `RichTextEditor.tsx`) stay in the shared UI package, but live in `packages/ui/components/primitives/` rather than the CLI-managed primitive folder.

**Scope.** 50 components, ~2000 lines of diff total. Split across 3 PRs (Stage A, Stage B by tier, Stage C rename/re-home).

---

#### S1-2 `components.json` — `iconLibrary` mis-declared

**Evidence.** `packages/ui/components.json` does not explicitly set `iconLibrary`. `shadcn info` resolves it to `iconLibrary = "radix"` because `style = "new-york"` and the default for `new-york` is `radix` icons (per `packages/shadcn/src/utils/get-config.ts`).

However, every single component in the repo uses `lucide-react` (0.575.0 is pinned). The repo even has a first-party `lucide-react` → `optimizePackageImports` entry in every `next.config.ts`. Nothing in the repo uses `@radix-ui/react-icons` beyond the declared `optimizePackageImports` list.

**Why it matters.** Whenever someone runs `shadcn add <component>` today, the CLI transforms the icon imports to `@radix-ui/react-icons` variants (e.g. `CheckIcon` → `<CheckIcon>` from `@radix-ui/react-icons`) and then the PR author has to hand-revert the icon imports back to lucide. This is exactly what the diff output shows for `checkbox.tsx`:

```
-  import { Check } from "lucide-react"
+  import { CheckIcon } from "lucide-react"
```

— note the CLI kept it on `lucide-react` only because it was already there; if the file did not already import from lucide, the CLI would have added `@radix-ui/react-icons`.

**Action.** Add `"iconLibrary": "lucide"` to `packages/ui/components.json`. Small PR, zero runtime impact, major maintenance win.

**Scope.** 1 line.

---

#### S1-3 Orphaned dependency: `@radix-ui/react-toast`

**Evidence.** `@radix-ui/react-toast@^1.2.4` is declared in `packages/ui/package.json` dependencies, but `grep "@radix-ui/react-toast"` finds no source files that import it. The repo uses `sonner` for toasts (see `packages/ui/components/shadcn/sonner.tsx`).

**Why it matters.** Unused dep ships to every consumer. Minor bundle / install-time cost.

**Action.** Remove `@radix-ui/react-toast` from `packages/ui/package.json`. `bun install && bun run typecheck`.

**Scope.** 1 line.

---

#### S1-4 First-party "custom" components lived next to canonical shadcn files

**Evidence.** At audit time, `packages/ui/components/shadcn/` contained, mixed together:

- 51 canonical shadcn components (the ones you'd install via CLI).
- First-party additions: `chart-wrappers.tsx`, `filter-bar.tsx`, `image-upload.tsx`, `image-cropper.tsx`, `map.tsx`, `motion-preset.tsx`, `ripple-button.tsx`, `page-shell.tsx`, `responsive-container.tsx`, `theme-toggle.tsx`, `rich-text-editor/`, `RichTextEditor.tsx`, `data-table/`, `data-grid/`, `icons/`.

The `shadcn info` command did not claim these as "Installed components" (good), but there was no structural distinction on disk.

**Why it matters.** When running `shadcn add <x>` the CLI has no signal that `chart-wrappers.tsx` is custom. Nothing breaks today, but it makes the `--diff` audit noisy and it is fragile — a future upstream `chart-wrappers.tsx` would overwrite ours silently.

**Action taken.**

Moved first-party additions into `packages/ui/components/primitives/` and left compatibility re-export shims at the legacy `components/shadcn/*` paths so existing consumers continue to work during the transition. A `packages/ui/components/shadcn/CUSTOM.md` manifest also remains as a maintenance note for future CLI updates.

**Outcome.** The shared UI package now has a clearer separation:

- `components/shadcn/` -> CLI-managed / canonical primitives, plus compatibility shims
- `components/primitives/` -> first-party shared wrappers and compositions

Downstream app/package imports have been updated to the new `@asym/ui/components/primitives/*` paths where practical.

---

#### S1-5 `form.tsx` was misnamed

**Evidence.** At audit time, `packages/ui/components/shadcn/form.tsx` exported `AsymTextField`, `AsymSelectField`, `AsymSubmitButton`, `useAsymForm`, etc. — a fully custom TanStack Form integration. Anyone running `shadcn add form` against this project would overwrite it with the canonical react-hook-form version (899-line diff).

**Why it matters.** Dangerous footgun during any future shadcn CLI sync. Also the CLI `shadcn info` lists `form` as an installed component, so tooling treats it as canonical.

**Action taken.** Renamed to `packages/ui/components/primitives/tanstack-form.tsx`, updated re-exports, and moved live consumers to `@asym/ui/components/primitives/tanstack-form`. Compatibility re-export stubs remain at the legacy `components/shadcn/tanstack-form` path.

**Outcome.** Future `shadcn add form` calls can no longer collide with the repo’s TanStack Form layer.

---

### S2 — Nice to fix (consistency, docs, DX)

#### S2-1 Button focus-ring drift

`button.tsx` uses the v3 focus ring (`focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`). Every other input (`textarea`, `select`, `checkbox`, `radio-group`, `switch`, `toggle`, `tabs`, `item`, `accordion`, `badge`) uses the v4 "glow ring" (`focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50`). That means a focused button has a distinctly different focus indicator than a focused input in the same form. This is an accessibility / consistency smell, not a blocking bug.

**Action.** Unify on the v4 glow-ring via the `shadcn add button` adoption in Stage B above.

#### S2-2 Two different `TooltipProvider` patterns

Current `tooltip.tsx` wraps every `<Tooltip>` in a `<TooltipProvider delayDuration={0}>`. Upstream v4 requires the app to mount one `<TooltipProvider>` at the tree root and makes `<Tooltip>` assume it exists. Either pattern works, but the current pattern means `delayDuration` is fixed at `0` globally and cannot be overridden per subtree.

**Action.** Adopt upstream's single-provider pattern. Mount `<TooltipProvider>` once per app root (`app/layout.tsx` of admin/donor/missionary). Remove the inner wrapper. Document it.

#### S2-3 Navigation-menu `focus-visible:ring-offset-background` absent, and `focus-visible:outline-1` present

`navigation-menu.tsx` uses `focus-visible:ring-[3px] focus-visible:outline-1`. The `outline-1` on a focused element combined with a `ring-[3px]` creates a double outline in most browsers. Upstream has dropped the `outline-1` on focus-visible in `tabs.tsx` since v4.2. Minor visual jitter.

**Action.** Drop `focus-visible:outline-1` from `navigation-menu.tsx` and `tabs.tsx` (and anywhere else). Adopt upstream via Stage B.

#### S2-4 `drawer.tsx` uses `@base-ui/react/drawer` directly

This is intentional (Base UI's drawer replaces Vaul under the `new-york` + `drawer` recipe). It's working. But:

- The `@base-ui/react` dep version is pinned at `1.3.0` exactly (no caret) — good.
- The rest of the package uses Radix for everything else. A future migration to Base UI (shadcn now has `base-*` style presets) should be considered explicitly.

**Action (no code yet).** Track a small ADR in `docs/ai/audits/base-ui-migration-decision.md` noting that we intentionally opt into Base UI for the drawer only. If we ever do a full Base UI migration, that ADR is the starting point.

#### S2-5 Consumer import style is inconsistent (barrel vs deep vs flat)

Three patterns exist in the app code:

- `import { Button } from "@asym/ui/components/shadcn/button"` — deep, most common (~300 call-sites)
- `import { Button } from "@asym/ui/components/shadcn"` — barrel (less common, ~10 files)
- `import { Button } from "@asym/ui"` — flat (not used in apps today)

Per `packages/ui/README.md`:

> Current repo standard (apps): `import { Button } from "@asym/ui/components/shadcn/button"`

…so the deep import is the rule. Enforce it via an eslint rule (`import/no-internal-modules` or a custom restriction on `"@asym/ui"`, `"@asym/ui/components/shadcn"`). Prevents the two non-deep forms from re-appearing.

**Action.** Add ESLint rule in `eslint.config.mjs` under an `overrides` block for `apps/**`. One commit.

#### S2-6 `Spinner` exported without the `"use client"` directive (SSR trap for `aria-label`)

`spinner.tsx` renders a plain SVG with `aria-label="Loading"` and `role="status"`. It has no client-only code. It is safe to stay server-rendered. Leave as-is.

(Included here only because the diff tool flagged it — it's a no-op.)

#### S2-7 `chart-wrappers.tsx` should move under `primitives/charts/` rather than `shadcn/`

Same reasoning as S1-4. Lower priority.

---

### S3 — Opportunistic

#### S3-1 Tailwind v4 token surface audit

`styles/globals.css` is comprehensive but has a few improvements latent:

1. `--color-chart-1 … --color-chart-5` are OKLCH; good, but they're the same in light and dark modes. In v4 + OKLCH the canonical shadcn chart palette uses slightly-desaturated variants in dark. See `shadcn-ui/ui/apps/v4/content/docs/(root)/theming.mdx`. Consider a dark-mode pass.
2. `--radius: 1rem` is an intentional Maia/soft look. The derived `--radius-sm: calc(var(--radius) - 4px)` works out to 12 px at the `sm` step — bigger than shadcn default 6 px. This is intentional; document it in `docs/ai/ADMIN-UX-STANDARDS.md`.
3. The global `@layer base` `:focus-visible { @apply outline-none ring-2 ring-ring ring-offset-2 ring-offset-background; }` is the v3 style. Consider updating to the v4 "glow" pattern (`ring-[3px] ring-ring/50 border-ring`) to match what every component is doing inline. Reduces duplication.
4. `:root` has gap/spacing variables (`--space-*`, `--gap-*`, `--section-gap`, `--card-padding`) that Tailwind v4 can already generate via its built-in spacing scale. The custom variables add indirection but no new capability. Candidates for removal; or at minimum, hoist them into `@theme` so Tailwind knows about them.

**Action.** Small cleanup PR after Stage B is in.

#### S3-2 `@asym/ui/styles/theme.css` is stale

The file duplicates 280 lines of `globals.css` but is not imported anywhere (`rg '@import "@asym/ui/styles/theme\.css"'` returns zero matches). Same tokens, slightly older version (missing some of the more recent responsive tokens).

**Action.** Delete `packages/ui/styles/theme.css` (and the `./styles/*` export is already a wildcard, so nothing breaks).

#### S3-3 `packages/ui/tailwind-preset.ts`

`packages/ui/package.json` exports `"./tailwind-preset": "./tailwind-preset.ts"` but the file does not exist. Dead export.

**Action.** Remove the export from `packages/ui/package.json`.

#### S3-4 Orphaned top-level `shadcn-extension.json` + `SKILL.md` + `skills-lock.json` at repo root

These are boilerplate from cursor skills setup. They live at the repo root and are easy to confuse with `packages/ui/components.json`. They are NOT shadcn CLI configs — they're agent skills metadata. Consider moving to `docs/ai/` or `.agents/`.

**Action.** Optional cleanup, not related to shadcn correctness.

---

## 3. Prioritized fix plan

Split the work into 3 PRs so each one can be shipped independently and reverted if a visual regression is found.

### PR 1 — "shadcn hygiene, zero behavior change"

_(Branch: `cursor/shadcn-ui-audit-hygiene-6047`)_

- S0-3 — Consolidate `useIsMobile` into `@asym/ui/hooks` and update `sidebar.tsx` import.
- S0-1 — Add `"use client"` to `navigation-menu.tsx`.
- S1-2 — Add `"iconLibrary": "lucide"` to `components.json`.
- S1-3 — Remove orphan `@radix-ui/react-toast`.
- S1-5 — Rename `form.tsx` → `tanstack-form.tsx`, update barrel.
- S3-2 — Delete `packages/ui/styles/theme.css`.
- S3-3 — Remove dead `./tailwind-preset` export.

Tests / gates:

- `bun run typecheck`
- `bun run lint`
- `bun run test:unit`
- `bun run build` for all 3 apps
- `bun run test:e2e:smoke`

Expected risk: **low**. One import path change in the sidebar is the only runtime delta.

---

### PR 2 — "Resync to shadcn@4.3.0 canonical, tiered"

_(Branch: `cursor/shadcn-ui-audit-resync-6047`)_

Order (smallest-diff first, so the first commits are mechanical):

1. Run `npx shadcn@latest migrate radix --cwd packages/ui` for the Radix unified-package swap + `<Slot.Root>` rename. Commit as `chore(ui): migrate to unified radix-ui package`.
2. Adopt upstream wholesale for the 8 **trivial** components (`sonner`, `spinner`, `collapsible`, `label`, `skeleton`, `kbd`, `textarea`, `input`). Preserve `@asym/ui/lib/utils` import only. One commit per component. Smoke-test after each.
3. Adopt upstream for the 13 **low** components (`hover-card`, `separator`, `input-otp`, `checkbox`, `radio-group`, `alert`, `switch`, `toggle`, `empty`, `tooltip`, `progress`, `breadcrumb`, `accordion`). Note: `tooltip` requires S2-2 (mount `<TooltipProvider>` in each app's root layout).
4. Adopt upstream for the 18 **medium** components, one PR sub-commit per component.
   - Decision gate for `card`: if adopting `gap-6 / p-6`, do a visual QA pass. Otherwise preserve `gap-4 / p-4` explicitly and add a comment noting the intentional divergence.
5. Port the **high-diff** components manually:
   - `sidebar` — re-apply the `@asym/ui/hooks/use-mobile` import (from PR 1) before adopting upstream.
   - `chart` — preserve the ChartStyle/ChartConfig custom API.
   - `calendar` — tiny diff once the `button` variants propagate.
   - `alert-dialog`, `command`, `menubar`, `item`, `field`, `button-group`, `drawer`, `input-group`: hand-port per slot.
6. `button.tsx` is the keystone — resync everything **except** preserve `maia` and `maia-outline` variants, but rewrite them with semantic tokens (S0-2).
7. Fix the dialog/sheet whitespace bug in the animation class strings (`animate-outdata-[state=closed]` → `animate-out data-[state=closed]`).

Tests / gates: same as PR 1 + visual regression on Playwright e2e (`bun run test:a11y`, `bun run test:perf`, manual smoke on all 3 apps light + dark).

Expected risk: **medium**. Every visual change gets a screenshot review. If anything regresses, revert only that commit.

---

### PR 3 — "Theme discipline and first-party re-home"

_(Branch: `cursor/shadcn-ui-audit-theme-discipline-6047`)_

- S0-2 — Sweep hardcoded non-semantic colors into tokens across: `slider.tsx`, `chart-wrappers.tsx`, `data-grid-cell.tsx`, `data-table-wrapper.tsx`, `filter-bar.tsx`, `image-cropper.tsx`, `image-upload.tsx`, `map.tsx`, `button.tsx (maia variants)`.
- S1-4 — Move first-party additions out of `shadcn/` into `primitives/` and leave compatibility shims.
- S2-1 — Button focus ring unification (already covered by S1-1 Stage B for button, but verify here).
- S2-2 — Mount `<TooltipProvider>` at each app root. Remove inner wrapper from `tooltip.tsx`.
- S2-3 — Drop redundant `focus-visible:outline-1` on navigation-menu / tabs.
- S2-5 — Add ESLint rule enforcing deep-import convention for `@asym/ui`.
- S3-1 — Dark-mode chart-palette tweak, focus-ring `@layer base` modernization, optional removal of `--space-*` / `--gap-*` custom variables.

Tests / gates: full `bun run check` + full Playwright suite (e2e, a11y, perf) on all 3 apps.

Expected risk: **medium**. S0-2 requires visual QA in dark mode.

---

## 4. Deferred / non-goals

- **Switching from Radix UI to Base UI** for all components. Worth an ADR but not in scope of this audit. Upstream shadcn now supports both `base-<style>` and `radix-<style>` presets.
- **Adopting a new visual style** (Vega / Nova / Maia / Lyra / Mira). The repo's design is already called "Maia" by internal docs but is implemented as `new-york` with a Zinc palette — it is NOT the upstream Maia preset. No migration planned; the current choice is intentional and compatible.
- **Moving from `new-york` to the unnamed default v4 style**. Not worth the churn.
- **ADR for shadcn registries** (`@ss-components`, `@shadcnuikit`, `@reactbits-*`, `@efferd`). They're declared but not used beyond `shadcn-studio/blocks`. Consider pruning in a future pass.

## 4. Shipped outcome

The implementation that followed this audit completed the originally proposed staged work on the branch:

- shared hook / config hygiene landed
- official `shadcn migrate radix` landed
- canonical v4 primitive resync landed
- tooltip-provider-at-root pattern landed
- semantic-token cleanup on custom shared surfaces landed
- first-party shared wrappers/compositions were moved into `packages/ui/components/primitives/`
- compatibility re-export shims were left under `packages/ui/components/shadcn/*` to keep deep imports stable during migration

---

## 5. Verification checklist

Before closing each PR:

- [ ] `bun run lint`
- [ ] `bun run typecheck`
- [ ] `bun run test:unit`
- [ ] `bun run build` (all 3 apps, no strict errors)
- [ ] `bun run test:e2e:smoke`
- [ ] `bun run test:a11y`
- [ ] `npx shadcn@latest info` from `packages/ui` matches expected output (style, baseColor, iconLibrary, aliases)
- [ ] `npx shadcn@latest add button --diff` shows **no** diff on `button.tsx` other than the deliberate `@asym/ui/lib/utils` import path (and the intentional `maia`/`maia-outline` variants)
- [ ] Dark mode eyeball pass on: `/admin`, `/admin/contributions`, `/admin/mobilize`, `/admin/care`, `/donor-dashboard`, `/donor-dashboard/wallet`, `/missionary/feed`, `/missionary/tasks`, `/missionary/donors`
- [ ] No runtime console errors related to "Rendered more hooks than previous render" or "must be used within … Provider" in any of the above routes

---

## 6. Appendix — generated artifacts

All `shadcn add <component> --diff` outputs live in `/tmp/diff-<component>.txt` after running the reproducer. Copy them into the PR description for the relevant component when opening Stage B commits.

Reference links used while building this plan:

- [shadcn v4 changelog](https://ui.shadcn.com/docs/changelog)
- [shadcn `components-json.mdx`](https://ui.shadcn.com/docs/components-json) — `rsc` flag semantics
- [shadcn `tailwind-v4.mdx`](https://ui.shadcn.com/docs/tailwind-v4) — `@theme inline`, `@custom-variant dark`
- [shadcn `theming.mdx`](https://ui.shadcn.com/docs/theming) — OKLCH chart palette
- [shadcn `migrate radix` command](https://ui.shadcn.com/docs/cli#migrate) — Radix unified-package migration
- [shadcn `tanstack-form.mdx`](https://ui.shadcn.com/docs/forms/tanstack-form) — TanStack Form best practice
- [Next.js `cacheComponents.mdx`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) — strict client-boundary validation
- [Next.js `use-cache.mdx`](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- Current repo docs that overlap this audit: `docs/ai/ADMIN-UX-STANDARDS.md`, `packages/ui/README.md`, `packages/ui/styles/README.md`, `AGENTS.md`.
