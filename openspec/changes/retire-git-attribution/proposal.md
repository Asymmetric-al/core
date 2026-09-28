## Why

Commit identity checks reject legitimate human and agent handoffs. GitHub access
and signed event authorization are the correct trust boundaries.

## What Changes

- Remove local and CI commit-attribution gates, registries, and tests.
- Keep substantive CI, native branch protection, and production source checks.
- Restrict new issues and PRs to collaborators and renew the temporary native
  interaction limit before expiry.
- Authorize Eve's privileged commands using live organization membership and
  Core permission, or a specifically approved GitHub App identity.

## Capabilities

### New Capabilities

- `repository-contribution-workflow`: GitHub access and agent-command policy.

### Modified Capabilities

None.

## Impact

Core scripts, CI, Eve GitHub channel, operational documentation, and GitHub
repository settings. Existing Git history stays intact.
