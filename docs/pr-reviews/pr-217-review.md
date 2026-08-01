# PR #217 Review - Refine Mission Control dashboard and module UX

- URL: https://github.com/Asymmetric-al/core/pull/217
- Base: `production`
- Head: `cursor/mission-control-ui-refinement-796e`
- Draft: yes
- GitHub state at review: `BEHIND`, `REVIEW_REQUIRED`
- Size: 32 changed files, +1,512 / -587
- Local review note: Nia MCP was unavailable in this session; fallback used `gh`, `git`, `rg`, and direct file reads.

## Merge And Tests

Local merge into `upstream/production`: clean.

Command run in `/tmp/core-pr-review`:

```sh
bun install --frozen-lockfile && bun run ci:preflight
```

Result: passed, including 104 test files and 440 tests.

## Verdict

Keep as draft until the small UI correctness issues are cleaned up.

## Findings

### P2 - Draft PR

Impact: the author has not marked the branch as merge-ready.

Suggested fix:

- Keep unmerged until marked ready.

### P2 - Event progress can divide by zero

Evidence: `apps/admin/app/(app)/events/page-client.tsx` around lines 760-775 computes progress from `event.registrants / event.capacity`.

Impact: capacity values of `0`, `null`, or unset can produce `Infinity`, `NaN`, or layout oddities.

Suggested fix:

- Clamp capacity and registrants before computing.
- Render "Capacity not set" or `0%` when capacity is not positive.
- Add a test/fixture with zero capacity.

### P2 - Animations bypass shared motion/reduced-motion conventions

Evidence: several `motion.div` usages in `apps/admin/app/(app)/support/page-client.tsx` use literal durations/easing around lines 105-188.

Impact: dashboard surfaces can ignore reduced-motion needs and drift from the repo's animation rules.

Suggested fix:

- Use shared motion presets/helpers.
- Respect `useReducedMotion`, or remove decorative motion from static dashboard panels.

### P2 - Support Hub CTAs use placeholder `href="#"`

Evidence: support page links around lines 56-92, 164-170, and 201-208 use placeholder links.

Impact: placeholder CTAs look interactive but do not navigate to real workflows.

Suggested fix:

- Point to implemented routes, or render disabled buttons until the destinations exist.

## Required Before Merge

- Mark ready.
- Fix zero-capacity progress handling.
- Replace placeholder CTAs.
- Align animation behavior with the frontend rules.
- Re-run `ci:preflight`.
