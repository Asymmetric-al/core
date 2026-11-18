# Frontend Rules — Rules

**Name:** `frontend-rules`
**Purpose:** Guardrails for Next.js App Router UI work (components, styling, forms, and state).
Use this before changing anything in `apps/*` or `packages/ui` that affects UI.

**Applies when:** UI/components/layout/styling changes, client interactions, or frontend data fetching.
**Do not use when:** The task is strictly backend/data/migration work (use `docs/ai/rules/backend.md`) or testing-only work (use `docs/ai/rules/testing.md`).

## Rules

### Architecture and organization

- Foundational HTML, CSS, and vanilla JS craft (semantics, selector discipline, a11y hygiene, readable JS) are summarized for agents in **`docs/ai/skills/bendc-frontend-guidelines/SKILL.md`** (vendored from [`bendc/frontend-guidelines`](https://github.com/bendc/frontend-guidelines)). That skill is **subordinate to this file** and to motion skills when they conflict. Tokens, Tailwind, TypeScript strictness, and motion gates in this doc always win.
- Shared UI primitives live in `packages/ui`. Apps should consume them via `@asym/ui`.
  The detailed `base-maia` implementation contract is `packages/ui/AGENTS.md`.
- Do not generate shadcn components inside `apps/*`.
- Shared components are built on Base UI (`@base-ui/react`, the shadcn `base-maia` base) or UI SDK (`@ui-sdk/react`); both are approved. Reuse the existing `@asym/ui` component first, choose UI SDK for a concrete benefit, and keep SDK code in `packages/ui` wrappers (see "Choosing a library" and "UI SDK implementation" in `packages/ui/AGENTS.md`, and `docs/ai/skills/ui-sdk/SKILL.md`).
- For app code, follow the existing feature structure already used in each app.

### Imports

- In `apps/*`, import shared UI from `@asym/ui` (deep imports are currently the standard). Never import `@ui-sdk/*` in an app; import its `@asym/ui` wrapper.
- In `packages/ui`, prefer the internal `@/` alias for new or touched files that apps never import. Components, primitives, and hooks that apps import use `@asym/ui/...` or relative imports, because each app typechecks them with its own `@/` mapping.
- Keep existing internal `@asym/ui/*` imports working until they are migrated; avoid mixing patterns within the same file.
- Import icons from `lucide-react`.

### Component and primitive policy

- One library owns a control's internal behavior; UI SDK code stays in a `packages/ui` wrapper. Prefer Base UI over Radix: add no `radix-ui` or `@radix-ui/*` imports, dependencies, or `--radix-*` CSS variables without a narrow Radix-specific need accepted in review.
- Keyboard shortcuts register through `useShortcut` from `@asym/ui/components/primitives/shortcut`, and their visible hints and `aria-keyshortcuts` come from `useShortcutHint` or `ShortcutHint` with the same key string. Give each one a `description`: the Shift+? help (`ShortcutHelp`, mounted once per app shell) lists it from that. Do not add a `keydown` listener or platform sniffing for a shortcut.
- Base UI components compose with the `render` prop — `asChild` does not exist here. For link-style buttons, prefer `buttonVariants` on the `Link`/`<a>` over rendering `Button` as a link.
- State styling uses Base UI data attributes: `data-open`/`data-closed`, `data-checked`, `data-pressed`, `data-active` (tabs), `data-panel-open` (collapsible/accordion triggers) — not `data-[state=...]` selectors. TanStack Table's `data-state="selected"` and the Sidebar's own `data-state` are repo-controlled and unrelated. UI SDK wrappers style that library's own documented `data-slot` and state attributes (for example `data-filled`) with semantic tokens, never its optional `web.css`.
- Use `'use client'` only when required (hooks, state, browser APIs).
- Reuse existing shared primitives before creating new ones.
- For accessibility audits or fixes involving names, semantics, keyboard/focus,
  forms/errors, announcements, contrast, touch targets, or reduced motion, load
  `docs/ai/skills/accessibility-review/SKILL.md`. Automated axe results
  complement but do not replace manual keyboard and focus verification.

### Styling rules

- Use shared Maia/Zinc tokens from `packages/ui/styles/globals.css`.
- Do not hardcode hex/oklch color values in components.
- Use Tailwind utilities and `cn()` for class merging.
- Avoid arbitrary values like `w-[123px]` unless there is no practical alternative.
- Keep spacing, typography, and radius aligned with existing shared components.

### Design-system lint

For applicable UI work, follow
`docs/ai/skills/moai-library-shadcn/references/design-system-lint.md`.
It defines the shared six-rule policy workflow, scoped commands, authoring
boundaries, raw-finding review, and legacy-debt handling. Every finding links
to the short fix guide,
`docs/ai/skills/moai-library-shadcn/references/design-system-lint-fixes.md`. Normal lint enforces
the policy; keep existing shadcn, token-drift, motion, Shadscan, and browser/a11y
checks. Do not widen a contract or exception simply to make a usage pass.

### Motion rules

For animation craft and feel, load `docs/ai/skills/emil-design-engineering/SKILL.md` first. The repo timing/CSS contract (tokens, utilities, route view transitions) is `docs/ai/skills/anim/SKILL.md`, summarized below.

When asked where motion would genuinely help, load
`docs/ai/skills/find-animation-opportunities/SKILL.md` for a read-only scan that
must also identify what should remain static. It does not replace
`improve-animations`, `review-animations`, or an explicitly authorized
implementation task.

- **Use the motion tokens, not literals.** Prefer real `--duration-*` / `--ease-*` variables (e.g. `var(--duration-standard)`, `var(--ease-out-soft)`) or `EASE_OUT_*` / `DURATION_*` from `@asym/lib/motion-presets`. All motion tokens live in `packages/ui/styles/globals.css :root`.
- **No `transition: all` / `transition-all`.** Specify exact properties (e.g. `transition-[transform,box-shadow]` or one of the shared utilities below).
- **Press feedback is automatic on `<Button>`.** Don't add `active:scale-[0.98]` inline. Native `<button>` elements that don't use the shadcn `Button` should add the `.press-feedback` utility.
- **Hover-on-touch is a bug.** Any `hover:scale-*`, `hover:-translate-*`, or `hover:shadow-*` lift must be wrapped in `@media (hover: hover) and (pointer: fine)`. Use `.hover-lift` / `.hover-scale-subtle` (already gated) when possible; otherwise `[@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[…]`.
- **Popovers / tooltips / dropdowns / selects scale from their trigger** via `transform-origin: var(--transform-origin)` (Base UI positioner variable, already wired in shared primitives — `origin-(--transform-origin)` in Tailwind). Modals stay `transform-origin: center`.
- **Route transitions** belong to `RouteMainViewTransitionBoundary`. Don't compete with it — when a `motion.div` lives inside a route VT layer, suppress its entrance via `useWithinViewTransitionRouteLayer()` (see `PageShell`).
- **Don't animate keyboard-initiated actions** (⌘K command palette is intentionally instant).
- **Don't animate `width` / `height` / layout properties.** Use `transform: scaleX/scaleY/translate` instead. The impact meter in `packages/ui/components/public/home-sections.tsx` is the canonical example.
- **Lists**: one motion grammar per row. CSS for steady-state hover/press; `motion/react` only for the parent stagger or VT shared morphs. Don't combine `motion.layout` + per-row `whileHover` springs + CSS hover-lift on the same node — it drops frames under load.
- **Springs (`motion/react`)** are for gestures, momentum, and decorative interactions only. Not for buttons, stat cards, or list rows.
- **Reduced-motion baseline lives in `packages/ui/styles/globals.css`** — apps must not redeclare it. Every TS motion primitive should call `useReducedMotion()` and either return early, set `transition: { duration: 0 }`, or pass `initial: false`.

### shadcn component workflow

- Shared `packages/ui/components.json` pins **`style: base-maia`** so CLI installs align with **Base UI first** (see “Component and primitive policy” above).
- Run shadcn additions from repo root with `--cwd packages/ui`:
  - `bunx --bun shadcn@latest add <component> --cwd packages/ui`
- Ensure generated files land in the shared UI package and remain correctly exported for `@asym/ui` consumers.
- Do not run `shadcn add` inside app workspaces.

### shadcn/studio MCP workflows (conditional)

- If you are using shadcn/studio MCP workflows (`/cui`, `/rui`, `/iui`, `/ftc`), follow `docs/ai/rules/shadcn-studio-mcp.md`.
- Do not apply shadcn/studio MCP rules for manual UI edits.
- If you use Nia (MCP) to trace UI code, keep queries scoped to `Asymmetric-al/core` and build the search preamble as `docs/ai/nia.md` describes (from `docs/ai/stack-registry.md` plus local task context; the tracked `docs/ai/working-set.md` is a historical record).

### Browser data and state management

- **Browser-visible Supabase table data:** TanStack DB Supabase collections via
  `@asym/database/hooks` are the default. Use live queries for joins, filters,
  feeds, lists, dashboards, and tables when practical.
- **Server read models / non-collection async state:** TanStack Query v5
  (`useQuery`, `useMutation`). Use array keys (e.g., `['users', id]`).
  Invalidate queries on mutation success when Realtime is not the sync path.
- **Simple RLS-authorized single-table writes:** use collection mutations when
  optimistic UI makes sense.
- **Privileged writes:** use Server Actions, `packages/api`, or thin route
  handlers for payments, receipts, email, webhooks, audit, role changes,
  reporting, RPC counters, and multi-table workflows.
- **Client state:** `useState`/`useReducer` for local state; React Context for global UI state.
- **Do not use Zustand.** It is not installed.

### Forms

- Use TanStack Form + Zod for complex client forms with multiple fields, reusable sections, array/dynamic inputs, cross-field validation, async validation, or modal/drawer workflows.
- Prefer native `<form>`, `next/form`, or server-action patterns for simple search bars, URL-sync inputs, one-field filters, and server-only forms.

### Instant Navigation

- All apps run `cacheComponents: true` + `partialPrefetching: true`; navigations must stay instant. This section is the detailed repository contract behind the compact root invariant.
- Every server `await` in a page/layout is an explicit Stream / Cache / Block decision:
  - Stream request-time data with `<Suspense fallback={...}>`.
  - Cache request-reusable data with `'use cache'`.
  - Block only deliberately with `export const instant = false` plus a one-line reason comment.
- Read the labeled fix links from Instant Insights errors (`nextjs.org/docs/messages/...`) before editing; apply the canonical pattern, not an improvised variation.
- Keep `<Suspense>` boundaries close to the dynamic read; an empty shell (boundary around the whole page body) is a regression, not a fix. A segment `loading.tsx` is right only when the whole segment is the loading unit; otherwise put the boundary inside the page. For skeletons that must match the loaded layout, see `docs/guides/ui-design/boneyard.md`.
- Deeper per-link prefetching is opt-in: `<Link prefetch={true}>` + `'use cache'`. The `prefetch` segment export accepts only `'auto'` (default), `'partial'` (redundant here: every app sets `partialPrefetching: true`) and `'force-disabled'`; Next.js 16.4 rejects any other value at build time.
- Add `instant()` assertions from `@next/playwright` for navigation-critical routes (pattern: `tests/e2e/instant-navigation.spec.ts`).

### Frontend testing

- Follow `docs/ai/rules/testing.md` for Playwright/a11y/perf expectations.

## Workflow

1. Identify if the change is Server or Client and apply `docs/ai/skills/nextjs-app-router/SKILL.md` when relevant. For page composition, feature-folder UI layout, colocated Suspense skeletons, or leaf-client UX, also load `docs/ai/skills/nextjs-app-architecture/SKILL.md`. Keep business queries and privileged mutations in `packages/api`.
2. For Tiptap / rich text editor work, apply `docs/ai/skills/tiptap/SKILL.md`.
3. Reuse shared primitives from `@asym/ui` before creating new UI.
4. Keep Tailwind usage token-based and consistent with Maia/Zinc.
5. Use `@asym/database/hooks` for browser-visible Supabase table data.
6. Use TanStack Query for server read models and non-collection async data; invalidate on mutations when Realtime is not the sync path.
7. If adding a shadcn component, use `--cwd packages/ui` and verify exports.
8. If shadcn/studio MCP is used, switch to `docs/ai/rules/shadcn-studio-mcp.md`.

## Checklists

### Implementation checklist

- [ ] `'use client'` only where required
- [ ] Shared `@asym/ui` primitives reused when possible
- [ ] Shared controls reuse `@asym/ui` first; any UI SDK use has a stated benefit and lives in a `packages/ui` wrapper
- [ ] No new `radix-ui`/`@radix-ui/*` imports without a reviewed need; Base UI components compose with `render`, not `asChild`
- [ ] Tailwind uses tokens (no arbitrary values)
- [ ] Browser table reads go through `@asym/database/hooks` or collection exports
- [ ] TanStack Query used for server read models or non-collection async data
- [ ] Privileged mutations stay server-command owned
- [ ] Complex client forms use TanStack Form + Zod
- [ ] Simple/native/server-only forms use native `<form>`, `next/form`, or server actions intentionally

### Review checklist

- [ ] App imports use `@asym/ui` (not app-local shadcn copies)
- [ ] New/touched `packages/ui` files use `@/` unless apps import them (those use `@asym/ui/...` or relative paths); legacy internal `@asym/ui/*` imports are allowed when untouched
- [ ] Icons imported from `lucide-react`
- [ ] No Zustand usage
- [ ] shadcn/studio MCP rules used only when running `/cui`, `/rui`, `/iui`, `/ftc`

## Minimal examples

### App import (shared UI)

```tsx
import { Button } from "@asym/ui/components/shadcn/button";
```

### Internal import in `packages/ui`

```tsx
import { cn } from "@/lib/utils";
```

### Add a shared shadcn component

```bash
bunx --bun shadcn@latest add button --cwd packages/ui
```

### Complex client form setup

```tsx
import { useAsymForm } from "@asym/ui/components/primitives/tanstack-form";

const form = useAsymForm({
  defaultValues,
  validators: {
    onChange: schema,
  },
  onSubmit: async ({ value }) => {
    await save(value);
  },
});

return (
  <form
    onSubmit={(event) => {
      event.preventDefault();
      form.handleSubmit();
    }}
  >
    <form.AppField name="title">
      {(field) => <field.TextField label="Title" />}
    </form.AppField>
  </form>
);
```

### Simple search / URL form

```tsx
import Form from "next/form";

export function SearchForm() {
  return (
    <Form action="/search">
      <input name="query" />
      <button type="submit">Search</button>
    </Form>
  );
}
```

## Common mistakes / pitfalls

- Marking entire pages as `'use client'` without need
- Creating app-local primitives that already exist in `@asym/ui`
- Running `shadcn add` inside `apps/*`
- Using arbitrary Tailwind values instead of tokens
- Hardcoding colors instead of shared Maia/Zinc tokens
- Using Zustand or other unapproved state libraries
- Replacing a working shared component with UI SDK without a concrete benefit, mixing Base UI and UI SDK parts in one control, importing `@ui-sdk/*` in an app, re-exporting the SDK, or loading its optional `web.css`
- Forcing TanStack Form onto trivial search/filter or server-only form surfaces
