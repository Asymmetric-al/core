# Proposal: Refine durable platform OpenSpec layers

## Why

The initial platform specs established a useful OpenSpec baseline, but the
merged versions are still too thin and too implementation-leaning to serve as
the durable context layer future coding agents actually need. This change
refines the four platform specs so they work together as a stable product and
boundary contract for a brownfield monorepo that must behave like one
high-trust ministry platform.

## What Changes

- Rewrite `platform-product-intent` as the durable product "why" layer with
  seven named requirements covering mission, unified platform span, audience
  tradeoffs, admin foundation, CRM/CMS product truth, long-horizon success, and
  scope discipline.
- Rewrite `platform-surfaces` as the durable "what each major surface is for"
  layer with seven named requirements covering Mission Control, donor portal,
  missionary workspace, public website, shared-record ownership, connected
  flows, and cross-surface coherence.
- Rewrite `platform-principles` as the durable "when in doubt" judgment layer
  with eight named requirements covering safety, money integrity, admin
  foundation, donor trust, anti-glue-work, clarity, cross-surface coherence,
  and product-level done.
- Rewrite `platform-boundaries` as the durable structural-and-trust boundary
  layer with ten named requirements covering shared-logic convergence, CRM/CMS
  ownership and alignment, server-side sensitive operations, role and tenant
  scope, honest money state, publication boundaries, public/auth separation,
  and boundary-doc alignment.
- During active review, keep refinements in OpenSpec delta files under this
  change; fold approved text into `openspec/specs/<id>/spec.md` when landing (see
  tasks). Canonical merged specs under `openspec/specs/**` are what OpenSpec
  discovers; this archive folder is a historical snapshot of the change.
- Standardize all new requirement scenarios around concrete
  GIVEN / WHEN / THEN decisions so future AI agents can reject the wrong path
  before writing code.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `platform-product-intent`: Replace the loose baseline product-intent
  requirements with a durable ministry-platform "why" layer.
- `platform-surfaces`: Replace the generic surface-intent baseline with precise
  durable definitions of what each major surface is for and how surfaces relate.
- `platform-principles`: Replace the shallow decision-criteria baseline with a
  stronger product-judgment layer for tradeoffs, trust, and cross-surface
  coherence.
- `platform-boundaries`: Replace implementation-leaning boundary wording with
  durable structural and trust boundaries for truth ownership, scope, and
  sensitive operations.

## Impact

- Affects OpenSpec source-of-truth interpretation for the four platform
  capabilities under `openspec/specs/`.
- Affects future planning, implementation, and review work by giving coding
  agents stronger durable guidance before they touch code.
- Requires corresponding fold-forward / archive review before merged specs are
  updated.
