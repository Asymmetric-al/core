# ADR-0038: Gate Eve activation with immutable target-bound evidence

- Status: Accepted
- Date: 2026-07-18
- Issue: #437

## Context

The preceding Eve slices establish the runtime and its safety boundaries, but a
green component test or merged PR does not prove that the deployed system works
as a composition. The existing #418 release switch needs one auditable human
activation path that cannot be triggered by Eve, CI, or deployment automation.

## Decision

Store immutable, redacted launch manifests bound to the exact deployment,
revision, migration, governance state, model policy, and eval configuration.
Deterministically require evidence for every slice, composition check, reversal
exercise, and runbook. Two independent permissioned reviewers must cover the
release and security roles. A separately permissioned human activation rechecks
the manifest hash, freshness, target, reviews, governance version, policy,
emergency state, and kill switches atomically before updating #418's existing
switch and writing #419 audit evidence.

Activation opens a 15-minute canary. Explicit failure or a one-minute watchdog
deadline engages emergency-off and rolls the launch back. Migration grants no
permissions and leaves release off. Clearing emergency state never resumes Eve.

## Consequences

- Launch readiness is evidence, not authority.
- Each deployment or governance change requires new target-bound evidence.
- Operators have a visible release/emergency surface and versioned runbooks.
- Launch metadata follows #424 retention and hold behavior.
- The final merge remains operationally inert until humans configure, review,
  and deliberately activate an exact deployed target.
