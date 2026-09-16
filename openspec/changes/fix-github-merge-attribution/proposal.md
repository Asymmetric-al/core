## Why

`ci:preflight` rejects an existing GitHub-created merge on `develop` because
the local attribution guard applies the ordinary commit identity rules to
GitHub's platform committer. The user authorized fixing this blocker so the
design-system lint integration can complete its required gate.

## What Changes

- Recognize a GitHub-created, two-parent merge only after live canonical
  repository evidence proves its signature, identities, merged pull request,
  ordered parents, and protected integration destination.
- Keep ordinary commit and local Git identity checks, explicit forbidden
  identities, hooks, and preflight stages intact. Missing or mismatched proof
  cannot activate the exception.
- Add focused regression tests and document this limited exception and its
  network requirement.

## Capabilities

### New Capabilities

- `repository-git-attribution`: Provenance-bound recognition of GitHub-hosted
  integration merges while preserving existing local and ordinary attribution.

### Modified Capabilities

None.

## Impact

Affected areas are the attribution verifier, focused script tests,
`docs/ops/git-attribution.md`, and the attribution paragraph in `docs/ci.md`.
There are no product, database, deployment, credential, Git identity,
history-rewrite, branch-protection, or publication changes.

Issue [#1425](https://github.com/Asymmetric-al/core/issues/1425) and PR
[#1428](https://github.com/Asymmetric-al/core/pull/1428) cover a broader
team-based workflow. On 2026-09-16 that PR was open at
`014092e44f9e8355c9243b845501856d91ccc6cf`, with no merge recorded. Its identity
registry, outgoing-range checks, CI changes, and ownership changes remain
proposed; this fix neither merges nor silently adopts that work.

Rollback reverts this verifier exception, its tests, and matching documentation
together. Existing Git history and identities require no rollback. Keep this
OpenSpec change active until the implementation becomes accepted repository
reality.
