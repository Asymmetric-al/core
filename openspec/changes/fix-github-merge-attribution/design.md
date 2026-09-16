## Context

See [proposal.md](proposal.md) for motivation and authority. The current guard
checks local Git configuration and effective author/committer identities, then
the latest commit. It assumes the ordinary required name also applies to
GitHub's platform committer. The inherited `develop` merge is therefore rejected
before the remaining preflight stages can run.

Live evidence on 2026-09-16 binds commit
`7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd` to merged PR #1325, whose base is
canonical protected `develop`. Its author is `ricky` with the existing trusted
human noreply email and account ID `116130409`; its committer and GitHub signer
are `web-flow`, account ID `19864447`. Both local ordered parents match the
pull request's base and head SHAs. This is diagnostic evidence, not a hardcoded
commit exemption.

## Goals / Non-Goals

**Goal:** Add one provenance-bound branch to the existing verifier, making the
real `ci:preflight` command usable on a verified inherited integration merge.

**Non-goals:** Generalizing the trusted team registry, changing local Git
configuration, validating new outgoing commit ranges, changing hosted CI or
branch settings, merging PR #1428, granting access, or publishing this branch.
No app, package runtime, API route, database, job, or product store changes.

## Decisions

1. **Verify online proof before relaxing identity checks.** Compare canonical
   REST commit metadata with the local SHA, raw names/emails, and ordered
   parents. Use GraphQL signature evidence to require `isValid`, `VALID`,
   `wasSignedByGitHub`, and signer `web-flow` / `19864447`. REST verification
   and account association alone do not establish the platform signer.
2. **Bind to the exact integration action.** Paginate compact associated-PR
   metadata, select the exact merged SHA, then verify the closed merged PR's
   canonical repository, `develop` or `production` base, ordered base/head
   SHAs, trusted merger, and current branch protection. The merge need not
   remain branch HEAD; historical merges retain their exact provenance.
3. **Keep identity changes narrow.** Preserve the ordinary `Blake` policy and
   existing trusted email/account mappings. Only the observed `ricky` alias
   paired with the exact trusted human noreply email is added, and only for
   a fully proven hosted merge. Bind author, platform, signer, and merger
   accounts to numeric IDs; do not add the broader PR #1428 identity registry.
4. **Keep subprocess output bounded.** Project only required REST fields and
   query only required GraphQL fields, avoiding full changed-file patches that
   can exceed the child-process output buffer on large merges. Missing or
   invalid responses produce failure; no acceptance cache or new skip switch.
5. **Preserve existing gates.** No hook, preflight stage, Git identity, or history
   changes. The exception is tested at the pure proof validator and the normal
   CLI boundary. Ordinary commit behavior remains unchanged.

The proof uses GitHub's
[commit API](https://docs.github.com/en/rest/commits/commits#get-a-commit),
[associated pull requests](https://docs.github.com/en/rest/commits/commits#list-pull-requests-associated-with-a-commit),
and signature metadata. GitHub owns the remote identity, signature, and branch
records; the local Git object owns the candidate identity and ancestry. Both
must describe the same commit.

## Risks / Trade-offs

- GitHub outage, rate limit, or missing read permission prevents hosted-merge
  proof. Fail closed with a clear diagnostic; retry after access is restored.
- Public email association can be imitated. Require a valid GitHub-produced
  signature, immutable account IDs, and exact merged-PR provenance together.
- Live branch protection can change after a merge. Require protection at
  verification time; this check does not reconstruct historical settings or
  grant permission to push.
- The broader team workflow remains proposed. Keep this delta distinct and
  reconcile overlapping verifier work when PR #1428 is reviewed or merged.

## Migration Plan

No data or configuration migration is needed. Add failing adversarial tests,
implement the proof path, verify the real inherited merge, and run the complete
preflight without skip flags. Revert the exception, its tests, and matching
documentation together to roll back; no identities or Git objects were changed.
