## Context and authority

The earlier branch implementation repaired an inherited GitHub merge rejection.
Canonical develop now includes PR #1428, whose exact identity registry,
actor-or-signer proof, full outgoing ranges, inherited-history handling, and
protected-integration verifier replace that narrow implementation. Adopt those
merged files and tests as the starting point. The previous hosted-merge helper
API and its branch-only tests are obsolete.

## Decisions

1. Keep the merged team workflow, hooks, registry, and signature policy unchanged.
   A same-repository unsigned registered tuple requires its matching immutable
   event actor; another actor requires a matching verified signer. User-confirmed
   authorship does not fabricate GitHub's authenticated event metadata.
2. Centralize the remaining parser correction in `parseGitHubRepoSlug` from
   `scripts/git/trusted-identities.mjs`, which is shared by pre-push coordination
   and attribution. Do not create a second verifier-local parser.
3. Parse HTTPS and SSH URLs with URL semantics for protocol, hostname and port.
   Ignore userinfo, accept only `github.com`, and accept only default transport
   ports. Preserve the upstream SCP-style `git@github.com:owner/repo.git` form.
4. Validate the original repository path, without decoding percent escapes or
   normalizing dot segments into an apparently valid target. Reject whitespace,
   controls, backslashes, query/fragment markers, extra path segments, empty
   components and encoded repository syntax. Return only `owner/repository`.
5. Preserve the merged verifier's account, provenance, history, and malformed
   provider-response tests. Remove tests tied to deleted helper APIs rather than
   restoring obsolete policy to satisfy them.

## Verification

Use the shared parser and pre-push environment builder as stable TDD seams.
First prove default-port and malformed-target failures against the unmodified
merged parser. Then run all attribution, pre-push, and related workflow contracts.
Credential-bearing fixtures must never appear in a child environment or provider
query target. Keep existing negative actor/signature/provenance tests intact.

Run focused lint/format and strict OpenSpec validation. The root task owns full
preflight and published-head CI. A different authenticated event actor remains
an operational proof requirement, not a reason to change identities or weaken
policy. No authentication or publication is performed by this reconciliation.

## Rollback

Revert only the residual parser hardening and matching tests/docs. Retain the
merged canonical team workflow and ordinary Git history. No migration or account
configuration change is involved.
