---
name: vercel-react-best-practices
description: React and Next.js performance optimization guidelines from Vercel Engineering. Use when writing, reviewing, or refactoring React components or Next.js App Router code for performance (waterfalls, bundle size, server/client performance, rerenders, rendering performance).
metadata:
  owner: "skills-steward"
  last_updated: 2026-02-17
  status: "active"
  upstream:
    url: "https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices"
    repo: "vercel-labs/agent-skills"
    path: "skills/react-best-practices/SKILL.md"
    ref: "e23951b8cad2f4b1e7e176c5731127c1263fe86f"
    license: "MIT"
---

# Vercel React Best Practices

Performance optimization guide for React and Next.js applications (adapted from Vercel Engineering's agent skill; see `references/upstream.md` for attribution).

## When to Apply

Use this skill when:

- Writing new React components or Next.js pages/layouts
- Implementing data fetching (server-side or client-side)
- Reviewing code for performance issues (slow TTFB, slow LCP, janky interactions)
- Refactoring React/Next.js code where perf regressions are likely
- Optimizing bundle size or load times

Do not use this skill when:

- The task is purely visual/styling with no behavioral change (use `react-component-dev` instead)
- The task is primarily caching/invalidation strategy (use `cache-components` instead)

## Rule Categories by Priority

| Priority | Category                  | Impact      | Prefix       |
| -------- | ------------------------- | ----------- | ------------ |
| 1        | Eliminating Waterfalls    | CRITICAL    | `async-`     |
| 2        | Bundle Size Optimization  | CRITICAL    | `bundle-`    |
| 3        | Server-Side Performance   | HIGH        | `server-`    |
| 4        | Client-Side Data Fetching | MEDIUM-HIGH | `client-`    |
| 5        | Re-render Optimization    | MEDIUM      | `rerender-`  |
| 6        | Rendering Performance     | MEDIUM      | `rendering-` |
| 7        | JavaScript Performance    | LOW-MEDIUM  | `js-`        |
| 8        | Advanced Patterns         | LOW         | `advanced-`  |

## Quick Reference (Rule IDs)

These are the rule IDs used by the upstream skill; use them as a vocabulary when discussing fixes.

### 1) Eliminating Waterfalls (CRITICAL)

- `async-defer-await` - Move `await` into branches where actually used
- `async-parallel` - Use `Promise.all()` for independent operations
- `async-dependencies` - Use partial dependency parallelism (upstream calls this "better-all")
- `async-api-routes` - Start promises early, await late in API routes
- `async-suspense-boundaries` - Use `Suspense` to stream content

### 2) Bundle Size Optimization (CRITICAL)

- `bundle-barrel-imports` - Import directly, avoid barrel files
- `bundle-dynamic-imports` - Use `next/dynamic` for heavy components
- `bundle-defer-third-party` - Load analytics/logging after hydration
- `bundle-conditional` - Load modules only when the feature is activated
- `bundle-preload` - Preload on hover/focus for perceived speed

### 3) Server-Side Performance (HIGH)

- `server-auth-actions` - Authenticate server actions like API routes
- `server-cache-react` - Use `React.cache()` for per-request deduplication
- `server-cache-lru` - Use an LRU cache for cross-request caching
- `server-dedup-props` - Avoid duplicate serialization in RSC props
- `server-serialization` - Minimize data passed to client components
- `server-parallel-fetching` - Restructure components to parallelize fetches
- `server-after-nonblocking` - Use `after()` for non-blocking operations

### 4) Client-Side Data Fetching (MEDIUM-HIGH)

- `client-swr-dedup` - Use SWR for automatic request deduplication
- `client-event-listeners` - Deduplicate global event listeners
- `client-passive-event-listeners` - Use passive listeners for scroll
- `client-localstorage-schema` - Version and minimize localStorage data

### 5) Re-render Optimization (MEDIUM)

- `rerender-defer-reads` - Don't subscribe to state only used in callbacks
- `rerender-memo` - Extract expensive work into memoized components
- `rerender-memo-with-default-value` - Hoist default non-primitive props
- `rerender-dependencies` - Use primitive dependencies in effects
- `rerender-derived-state` - Subscribe to derived booleans, not raw values
- `rerender-derived-state-no-effect` - Derive state during render, not effects
- `rerender-functional-setstate` - Use functional `setState` for stable callbacks
- `rerender-lazy-state-init` - Pass function to `useState` for expensive values
- `rerender-simple-expression-in-memo` - Avoid memo for simple primitives
- `rerender-move-effect-to-event` - Put interaction logic in event handlers
- `rerender-transitions` - Use `startTransition` for non-urgent updates
- `rerender-use-ref-transient-values` - Use refs for transient frequent values

### 6) Rendering Performance (MEDIUM)

- `rendering-animate-svg-wrapper` - Animate a div wrapper, not the SVG element
- `rendering-content-visibility` - Use `content-visibility` for long lists
- `rendering-hoist-jsx` - Extract static JSX outside components
- `rendering-svg-precision` - Reduce SVG coordinate precision
- `rendering-hydration-no-flicker` - Use inline script for client-only data
- `rendering-hydration-suppress-warning` - Suppress expected mismatches
- `rendering-activity` - Use Activity component for show/hide
- `rendering-conditional-render` - Prefer ternary over `&&` for conditionals
- `rendering-usetransition-loading` - Prefer `useTransition` for loading state

### 7) JavaScript Performance (LOW-MEDIUM)

- `js-batch-dom-css` - Group CSS changes via classes or `cssText`
- `js-index-maps` - Build `Map` for repeated lookups
- `js-cache-property-access` - Cache object properties in loops
- `js-cache-function-results` - Cache function results in module-level `Map`
- `js-cache-storage` - Cache localStorage/sessionStorage reads
- `js-combine-iterations` - Combine multiple filter/map into one loop
- `js-length-check-first` - Check array length before expensive comparison
- `js-early-exit` - Return early from functions
- `js-hoist-regexp` - Hoist `RegExp` creation outside loops
- `js-min-max-loop` - Use a loop for min/max instead of sort
- `js-set-map-lookups` - Use `Set`/`Map` for O(1) lookups
- `js-tosorted-immutable` - Use `toSorted()` for immutability

### 8) Advanced Patterns (LOW)

- `advanced-event-handler-refs` - Store event handlers in refs
- `advanced-init-once` - Initialize app once per app load
- `advanced-use-latest` - `useLatest` for stable callback refs

## Workflow

1. **Pick a measurable target** (load time, TTFB, interaction jank, bundle size, server cost).
2. **Start with waterfalls** (`async-*`): restructure to parallelize independent work and stream via `Suspense` where appropriate.
3. **Reduce bundle cost** (`bundle-*`): avoid barrel imports; split heavy, rarely-used UI with `next/dynamic`; defer third-party scripts.
4. **Fix server-to-client boundaries** (`server-*`): avoid over-serializing props; keep heavy compute and secrets on the server; parallelize server fetches.
5. **Fix client fetching** (`client-*`): dedupe requests, avoid repeated global listeners, keep storage reads/versioning sane.
6. **Remove rerender hotspots** (`rerender-*`): prefer derived state, stable callbacks, and moving effects to events when possible.
7. **Triage rendering + JS micro-opts** (`rendering-*`, `js-*`): only after structural issues are addressed.
8. **Verify** with repo gates and any perf checks the task requires:
   - `bun run format:check && bun run lint && bun run typecheck && bun run build && bun run test:unit`
   - Optional: `bun run test:perf` (Playwright Web Vitals checks) when relevant

## Checklist

- [ ] No obvious async waterfalls (parallelize independent work, stream with `Suspense`)
- [ ] No accidental bundle bloat (avoid barrel imports, consider `next/dynamic` for heavy UI)
- [ ] Server/client boundary is intentional (minimal props; no heavy objects serialized)
- [ ] Client data fetching is deduped; no repeated global listeners
- [ ] Rerenders are controlled (derived state, stable handlers, memo used only when warranted)
- [ ] Rendering issues addressed (long lists, hydration mismatches handled intentionally)
- [ ] Repo CI gates pass locally

## Additional Resources

- Upstream source + attribution: `references/upstream.md`
