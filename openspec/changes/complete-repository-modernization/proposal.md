## Why

Core contains an urgently vulnerable framework release, unsupported tooling,
unreproducible imported PDF implementations, and outdated integration contracts
and instructions. Modernize the complete stack while preserving money, identity,
tenant isolation, document compatibility, and the shared design system.

## What Changes

- Inventory direct and locked dependencies, overrides, patches, imported artifacts,
  runtimes, operational CLIs, MCPs, Actions, containers, protocols, and skills.
  Every finding needs an owned, evidence-backed disposition.
- Patch Next.js, React and Node first, with all three applications and production
  partial-prefetch behavior qualified before merging the security checkpoint.
- Upgrade tooling, data/workflow/API families, UI/editors, telemetry, and AI in
  compatible cohorts, including supported major versions.
- **BREAKING internally:** migrate the complete Payload cohort from the internal
  v4 snapshot to the official public v4 beta, preserving public media contracts
  and records through committed migrations and an isolated restore rehearsal.
- Recover the shipped PDF package sources with provenance in their owning
  repository, modernize there, and reproducibly rebuild consumed artifacts.
- **BREAKING internally:** migrate Stripe request serialization only after a
  successful payment drain; modernize legal generators while preserving wording.
- Enforce provider-call governance and exactly-once usage settlement across AI
  retries, cancellation, restart and child execution, with Eve still disabled.
- Reconcile active documentation and imported skills, remove misleading obsolete
  instructions, and add automated maintenance/provenance checks and weekly updates.

## Capabilities

### New Capabilities

- `dependency-maintenance`: reproducible supported toolchains, complete upgrade
  ownership, bounded vulnerability exceptions, qualified migration checkpoints,
  drift prevention, and a production release package with safe cutover boundaries.

### Modified Capabilities

None. Product contracts remain binding; integration rewrites implement them.

## Impact

All three applications, workspace packages, imported PDF artifacts and their
owner repository, Payload data, payment workers/webhooks, legal outputs,
provider adapters, CI, developer setup, documentation and skills are in scope.
Track implementation under AL-1965. Reconcile OpenSpec PR #2172 and CI PR #2160
without duplicating or overwriting their work.

Delivery requires reviewed family PRs merged into develop, exact-head CI and
working deployed previews, a final clean installation, and an immutable
production release package. Production migrations/deployment are excluded.
Keep Eve and native PDF rollout at their current settings. Preserve opaque
credentials and user work. Rollback boundaries, write pauses, backups and
payment drains must be rehearsed before any data-format cutover is qualified.

## Preview delivery amendment

The modernization `development-build-policy` delta explicitly supersedes the
older GitHub prebuilt-preview clause so current Vercel Secrets remain provider
owned. Existing automatic-deployment, scope, credential and exact-commit guards
remain. See the design's explicit supersession and the modified requirement.
