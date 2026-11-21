# Proposal

## Why

Core retired the Shadscan score gate on 2026-11-18 (`make-shadscan-advisory`).
That gate was the only blocking check on a static accessibility score. What
blocks a static accessibility regression now is narrow:

- `eslint-plugin-jsx-a11y@6.10.2` runs today, but `eslint-config-next` enables
  only 6 of its rules, and only in the three Next applications.
- `packages/ui`, `packages/missionary`, `packages/lib` (which renders the
  public CMS pages) and `packages/database` lint no `jsx-a11y` rule at all.
- The axe-based Playwright checks cover rendered behavior, but on a pull
  request to `develop` none of them gates the merge.

Standard tools already in Core's dependency graph can do the useful part of the
retired gate better: the plugin's own `recommended` set covers alternative
text, anchors, labels, keyboard access for handlers, roles, ARIA and focus.

## What Changes

- Enforce the full `jsx-a11y` recommended rule set in first-party web UI lint,
  covering every app and workspace package that renders production JSX,
  including `packages/lib` and its public CMS renderer. Map shared
  `packages/ui` components to their native semantics, and reject import
  aliases that would bypass that mapping. Record any violation left after
  repair as a single-line, single-rule exception that fails lint once it is
  unused. Each exception is also listed in a baseline that CI lets shrink but
  never grow, so debt can only shrink.

## Non-goals

- Changing the retired Shadscan gate or its advisory report.
- Moving lint to Oxlint, or switching to a forked a11y plugin.
- Changing the forced-light theme policy, the `@shadcn/lint` design-system
  policy, Base UI, `base-maia`, or shared `packages/ui` ownership.
- Adding new end-to-end routes or changing the existing axe severity policy.

## Authority

**Proposed. Not ratified. Implementation SHALL NOT start before the owner
ratifies this proposal.**

This work was first proposed on 2026-10-30 as section 3 and design decisions
D4-D6 of `make-shadscan-advisory`. On 2026-11-18 the owner ruled on that
change. The program step offered to the owner read:

> "One ruling that retires the Shadscan gate and hashes, the React Doctor
> ledger (PR #2705) and the fingerprint comparisons. Adopt only the retirement
> part of the Shadscan change; its jsx-a11y baseline is a new ledger."

The owner replied: "Do #2".

That ruling ratified only the retirement. It did not ratify this work, and
it named this work's debt baseline as "a new ledger". The text was moved here
unchanged in substance on 2026-11-18 so that `make-shadscan-advisory` can be
completed and archived on its own. Before ratification, the owner should
decide the open question in `design.md` about the baseline.

## Capabilities

### New Capabilities

- `ui-quality-audits`: how Core runs and reports UI audits and enforces
  accessibility. No durable spec exists yet at this path. The active
  `make-shadscan-advisory`, `modernize-shadscan-readiness` and
  `make-react-doctor-advisory` (pull request #2705) changes also propose
  ADDED requirements here, under different names. This change adds standard
  accessibility enforcement. Its delta uses `make-shadscan-advisory`'s Purpose
  word for word, so the changes can archive in any order.

### Modified Capabilities

None. No durable spec requirement changes.

## Impact

- **Lint:** `tooling/eslint-config` (Next, library and design-system entry
  points), including unused-disable reporting for first-party UI files.
  `eslint-plugin-jsx-a11y@6.10.2` is already locked. The count-based
  suppression file stays limited to `@shadcn/lint` rules.
- **Gates:** a debt-baseline comparison in the required CI lint job and the
  local preflight.
- **Product UI:** repairs of real violations at their owning components, and
  renames of components that collide with mapped names (design D2).
- **Docs:** the shared-UI guidance referenced by `docs/ai/rules/frontend.md`.
- **Untouched:** product routes, data, authorization, tenancy, money and
  deployments.

## Rollback

Revert the implementation commit. Lint rollback removes the added rules and
their inline exceptions together; repairs to real violations may stay.
