# Proposal: Establish the Eve autonomous operations foundation

## Why

Eve is intended to become a governed autonomous operations layer across Mission
Control, GitHub, and repository workflows. Before runtime code, persistence,
admin surfaces, or GitHub automation are implemented, the repository needs a
durable contract for what Eve may do, where its authority comes from, how it is
stopped, and what evidence is required before activation.

Issue #417 is the governance-first foundation required by the Eve PRD and
implementation plan. It gives issues #418–#437 a stable capability contract and
an accepted architecture decision instead of asking each implementation slice
to re-derive the autonomy boundary.

## What Changes

- Add the `eve-autonomous-operations` capability contract covering authority,
  execution identity, protected areas, production writes, governance ownership,
  rollout, and verification.
- Publish the initial autonomy decision as
  `docs/adr/0018-governed-eve-autonomy.md`.
- Establish one disabled-by-default, human-controlled release gate for the
  phased delivery program.
- Define the governance data model at the behavioral level while leaving schema
  and runtime implementation to later issues.

## What Does Not Change

- No Eve package, runtime, Supabase schema, admin UI, GitHub automation, model
  provider integration, migration, or production configuration is added.
- This foundation does not authorize autonomous money movement, customer or
  donor identity changes, tenant-ownership changes, auth or security changes,
  secret rotation, RLS changes, migrations, destructive production writes, or
  production deployment.
- Merging or archiving this change does not activate Eve. Activation remains
  blocked until the #437 launch verification succeeds and a verified human uses
  the authorized control path.

## Expected Outcome

The repository has a validated and durable OpenSpec capability plus a canonical
ADR that all later Eve slices can cite. Eve remains disabled and unimplemented,
but the complete autonomy, rollout, and verification boundaries are explicit.
