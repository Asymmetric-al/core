## 1. Establish the migration boundary

- [x] 1.1 Verify the upstream release, exported API, known issues, and Core's
      existing imports/dependency ownership; record relevant compatibility findings.
- [x] 1.2 Create proposal, design, behavioral spec, and tasks before changing the
      shared implementation; preserve the existing platform/design-system boundary.

## 2. Implement and prove the shared migration

- [x] 2.1 Add focused regression coverage and establish its red/baseline evidence
      before replacing the shared engine.
- [x] 2.2 Pin `cn`, preserve shared `cn`/`ClassValue` exports, remove obsolete
      direct dependencies, and regenerate the lockfile without global aliases.
- [x] 2.3 Preserve confirmed legacy-gradient appearances with explicit
      transparency and cover representative shared component overrides.
- [x] 2.4 Run focused tests and a representative class-corpus comparison;
      investigate differences and record their disposition.
- [x] 2.5 Update shared UI documentation with usage, limitations, and rollback.

## 3. Validate and prepare review

- [x] 3.1 Run consumer typechecks/builds, UI invariant checks, and appropriate
      rendered-component verification; record exact failures or external blockers.
- [x] 3.2 Run strict OpenSpec validation, OpenSpec implementation verification,
      and the repository preflight gates; distinguish inherited blockers from
      migration regressions and leave unresolved gates visible.
- [x] 3.3 Review the final source/manifests/lockfile diff and rollback boundary,
      publish the scoped PR, and inspect its current-head checks/review state;
      track final CI/review readiness in the PR.
- [x] 3.4 Keep this change active until merge; record remaining limitations
      without claiming unmeasured application performance or universal parity.
