## Why

PR #1428 is now merged into canonical `develop` at
`e811fc9f14a727d4e71b23df3ba356b5f645207b`. Its team contribution workflow
supersedes this branch's earlier narrow hosted-merge exception. The lint branch
must adopt that accepted policy instead of retaining a competing verifier.

The shared upstream remote parser already handles ordinary credentialed HTTPS
origins, but still rejects an explicit default HTTPS port and accepts malformed
repository paths, query strings, and fragments. Those remaining cases affect
which credential-free repository target reaches attribution and pre-push checks.

## What Changes

- Adopt the merged canonical verifier, identity registry, hooks, CI event proof,
  history handling, and documentation without changing their trust policy.
- Retain only repository URL parsing hardening in the shared
  `scripts/git/trusted-identities.mjs` seam. Preserve HTTPS, SCP-style SSH, and
  `ssh://` GitHub remotes, including default ports, while rejecting malformed
  targets and never forwarding transport credentials.
- Replace the superseded hosted-merge test suite with the merged workflow's
  coverage and retain focused parser and credential-sanitization regressions.

## Capabilities

### New Capabilities

- `repository-git-attribution`: Canonical GitHub repository target parsing and
  credential isolation within the accepted team contribution workflow.

### Modified Capabilities

None. The merged `repository-contribution-workflow` contract remains authoritative
for identities, signatures, commit scopes, provenance, and push authority.

## Impact

The residual change affects the shared remote parser, focused attribution and
pre-push tests, and attribution documentation. Existing contributor policy comes
from the merged upstream change. This work does not change identity records,
authentication configuration, credentials, Git history, branch protection,
production data, or deployment authority.

Rollback of the residual parser change restores the merged upstream parser and
its matching tests. It must not restore the superseded single-developer verifier.
Keep this change active until the remaining implementation is accepted repository
reality; local reconciliation is not publication or merge evidence.
