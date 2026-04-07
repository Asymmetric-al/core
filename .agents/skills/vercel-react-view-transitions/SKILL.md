---
name: vercel-react-view-transitions
description: React View Transitions and Next.js App Router route continuity. Use for page or route transitions, shared element morphs, React ViewTransition usage, list-to-detail navigation polish, and navigation motion across admin, donor, or missionary surfaces — without fighting motion/react.
metadata:
  owner: "skills-steward"
  last_updated: 2026-04-04
  status: "active"
  upstream:
    url: "https://skills.sh/vercel-labs/agent-skills/vercel-react-view-transitions"
    repo: "vercel-labs/agent-skills"
    path: "skills/vercel-react-view-transitions/SKILL.md"
    ref: "73140fc5b3a214ad3222bcf557b397b3c02d11c1"
    license: "MIT"
---

# Vercel React View Transitions (Asymmetric.al monorepo)

Browser-native **View Transitions** coordinated by React’s `<ViewTransition>` (see [React docs](https://react.dev/reference/react/ViewTransition)). In this repo they complement — **do not replace** — `motion/react` (`@asym/lib/motion`, `docs/ai/skills/motion`, `docs/ai/skills/anim`).

## When to Apply

Use this skill when:

- Adding or tuning **route-level** continuity inside app shells (`MCShell`, missionary `AppShell`, donor public/dashboard layouts).
- Adding **shared element** morphs (same stable `name` on source + destination).
- Reviewing navigation motion so it stays **Maia / Zinc**: quiet, short, opacity-first, subtle scale/translate.
- Debugging **double animation** (VT + `motion` entrance on the same block).

Do not use this skill when:

- The surface is **Payload `/web-studio`** — keep that path free of extra client boundaries (admin already bypasses `MCShell` there).
- The task is **micro-interaction only** (hover, tap, dialog choreography) — use `motion` + `anim` instead.
- You need **production guarantees** — upstream Next docs still mark this area experimental; ship behind the repo flag (below).

## Repo Integration (source of truth)

| Concern                         | Location                                                                             |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| Next flag                       | `experimental.viewTransition: true` in each app `next.config.ts`                     |
| Rollout flag                    | `NEXT_PUBLIC_VIEW_TRANSITIONS_ENABLED` in `@asym/env` + `.env.example`               |
| Capability + naming helpers     | `@asym/lib/view-transitions`                                                         |
| Route boundary + shared wrapper | `@asym/ui/components/view-transitions`                                               |
| Global VT animation classes     | `packages/ui/styles/globals.css` (`asym-vt-*`)                                       |
| Shell insertion                 | Admin `apps/admin/app/mc-shell.tsx` `<main>`                                         |
|                                 | Missionary `apps/missionary/components/app-shell.tsx`                                |
|                                 | Donor `apps/donor/app/(public)/layout.tsx` + donor-dashboard layout                  |
| Page header vs VT               | `PageShell` quiets motion when inside route VT (`useWithinViewTransitionRouteLayer`) |

## Rollout Rules

View Transitions run only when **all** are true:

1. `NEXT_PUBLIC_VIEW_TRANSITIONS_ENABLED=true` (validated via `@asym/env`).
2. Browser supports `document.startViewTransition` (see `clientDocumentSupportsViewTransitions()`).
3. User does **not** prefer reduced motion (`useReducedMotion()` from `@asym/lib/motion`).

Otherwise render plain children — no broken navigation, no hydration tricks.

## API Surface (do not invent props)

- Import `<ViewTransition>` from **`react`** (Next 16 bundles the compatible React channel). Load types via `import {} from "react/experimental"` in client files that need canary typings.
- Props include `default`, `enter`, `exit`, `share`, `update`, and optional `name` for shared morphs — see `@types/react/canary.d.ts` in this repo.
- Prefer **`default="none"`** and opt into specific triggers to avoid noisy cross-fades on every Suspense tick (upstream skill guidance).
- **`addTransitionType`** exists for typed animations; Next.js-specific automatic transition typing is still evolving — read bundled `.next-docs/.../viewTransition.mdx` before relying on framework wiring.

## Placement Rules

1. **Keep shells stable** — wrap the changing `<main>` / content column only, not `<html>` or full provider trees.
2. **`<ViewTransition>` must be the first DOM wrapper** for enter/exit on that subtree (no extra parent `div` above it for those triggers — our `RouteMainViewTransitionBoundary` puts the optional `className` on an inner div **inside** `<ViewTransition>`).
3. **Shared elements**: one mounted `name` at a time. Use deterministic builders in `@asym/lib/view-transitions` (e.g. `worker-hero:${id}`).
4. **Payload admin**: never wrap `/web-studio` content with the route boundary (already excluded in `MCShell`).

## Avoiding Double Animation with motion/react

- **Route VT** owns screen-to-screen continuity.
- **motion/react** owns hovers, presses, `AnimatePresence`, dialogs, staggered cards, feed reactions.
- If both animate the **same** header block, pick one: `PageShell` already disables its header motion when `useWithinViewTransitionRouteLayer()` is true. Apply the same pattern elsewhere (context lives in `@asym/lib/view-transitions/context`).

## Accessibility

- Respect `prefers-reduced-motion` (wrappers return plain children; CSS `@media (prefers-reduced-motion: reduce)` zeroes VT animations in `globals.css`).
- Never animate focus rings; do not delay validation or error feedback.

## Triggers

- Page transitions, route transitions, shared element transitions, React `ViewTransition`, Next.js App Router view-transition work, list/detail navigation polish across `apps/admin`, `apps/donor`, `apps/missionary`.

## Workflow

1. Confirm `experimental.viewTransition` is enabled for the target app.
2. Decide if the change needs the **env flag** on in dev (`NEXT_PUBLIC_VIEW_TRANSITIONS_ENABLED=true`).
3. Add or reuse **stable transition names** for shared elements.
4. Wrap **only** the swapping region with `RouteMainViewTransitionBoundary`.
5. Tone down overlapping **motion** on the same surface.
6. Verify Payload `/web-studio`, auth redirects, and reduced motion.

## Checklist

- [ ] Used `@asym/ui` boundaries instead of one-off per-app VT wrappers
- [ ] Shared element `name` is deterministic and matches on both ends
- [ ] No VT wrapper around Payload admin or entire provider tree
- [ ] Reduced motion and flag-off paths tested
- [ ] No competing `motion` entrance on the same node as route VT
- [ ] After editing this skill: `bun run skills:sync` && `bun run skills:verify`

## References

- Upstream provenance: `references/upstream.md`
- Next.js config note: `.next-docs/01-app/03-api-reference/05-config/01-next-config-js/viewTransition.mdx`
- Motion stack: `docs/ai/skills/motion/SKILL.md`, `docs/ai/skills/anim/SKILL.md`
