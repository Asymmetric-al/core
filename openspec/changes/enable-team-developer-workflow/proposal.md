## Why

Core welcomes team and public contributions, but its executable attribution
policy assumes one human developer. That contradiction blocks Conrad's truthful
Git identity despite full GitHub administrator access and lets an inherited
GitHub merge commit make a clean `develop` checkout fail before any new work is
created.

## What Changes

- Replace independent name, email, and actor allowlists with one canonical
  registry of exact human, automation, and platform identity records.
- Recognize Conrad (`cobmojo`) as a first-class internal developer while
  preserving the verified Blake, Eve, Cursor Agent, and PR-loop paths. Installed
  or historical automation is not declared supported until its current commit
  envelope is proven.
- Validate the complete outgoing commit set during pre-push instead of treating
  arbitrary `HEAD` history as the current developer's work.
- Verify PR identity claims from authenticated same-repository actors or matching
  signature signers, and verify protected integration provenance, in the
  existing required CI gate.
- Keep source-boundary verification scoped to live source rather than ignored
  Eve snapshots and generated build output created during normal development.
- Preserve reviewed external contributions without granting external authors
  canonical-repository push authority.
- Make Blake and Conrad joint default code owners and align contributor,
  ownership, CI, protected-path, and attribution documentation.
- Keep the policy forward-only: existing history is not rewritten.

## Capabilities

### New Capabilities

- `repository-contribution-workflow`: Defines trusted developer and automation
  identities, external-author handling, outgoing-commit validation, GitHub
  actor-or-signature proof, ownership routing, and protected-branch invariants.

### Modified Capabilities

None.

## Impact

- Repository tooling: `.husky/pre-push`, `scripts/git/**`,
  `scripts/verify/git-attribution.mjs`, the data-boundary scanner, and the CI
  workflow.
- Governance: both CODEOWNERS files and the contributor/ownership/CI runbooks.
- Tests: unit coverage for exact identity tuples, outgoing commit enumeration,
  forbidden identities, external authors, automation, and GitHub platform
  commits; workflow contract coverage for required CI enforcement.
- Local developer setup: truthful Git identity, Windows-backed WSL Git
  credentials, and authenticated GitHub CLI operations remain secret-free in
  committed files.
- No product applications, database behavior, runtime dependencies, or
  production deployment authorization change.

## Non-goals and rollback

- This change does not grant GitHub access. Live evidence on 2026-08-25 confirms
  `cobmojo` is an organization owner and repository admin; that external access
  remains a deployment precondition rather than a durable repository guarantee.
- It does not weaken `develop` or `production`, allow direct production pushes,
  remove review/check requirements, or add organization-admin token scopes.
- Live branch-protection check-name drift is a separate platform reconciliation
  concern; this change keeps attribution inside the existing `ci-gate` graph so
  it does not require a new protected-check name.
- Rollback restores the prior hook, verifier, workflow step, CODEOWNERS entries,
  and docs. Existing commits and GitHub permissions remain untouched.
