## Context

See `proposal.md` for motivation and
`specs/repository-contribution-workflow/spec.md` for the durable contract.
Today one script combines local configuration, latest-commit inspection, and
best-effort GitHub lookup; the pre-push production guard consumes stdin before
attribution can see the pushed refs. GitHub already grants `cobmojo` full
repository administration. The design therefore changes repository policy and
evidence, not platform access.

## Goals / Non-Goals

**Goals:**

- Make trusted identities explicit, reusable, exact, and easy to extend through
  review.
- Validate all and only the commits a canonical push introduces.
- Put actor verification in required CI, where commit SHAs exist on GitHub.
- Preserve public fork contributions, DCO authorship, automation, and production
  safety.
- Make ownership and contributor documentation match the team workflow.

**Non-Goals:**

- Managing organization membership, tokens, repository roles, or live branch
  protection from committed code.
- Rewriting existing Git history or retroactively normalizing display names.
- Treating CODEOWNERS as a substitute for required independent review.
- Adding a new required check name; attribution remains within `ci-gate`.

## Decisions

### Use one canonical identity registry

Add a small repository-owned module under `scripts/git/` containing immutable
identity records. Human and automation records bind approved local Git tuples to
one GitHub login and immutable numeric account ID. Platform aliases such as
Blake's GitHub-emitted `ricky` and
Conrad's account display name `Conrad O'` remain separate from approved local
commit names. Git's identity sanitizer removes a trailing apostrophe, so
Conrad's canonical commit name is `Conrad O`. Forbidden legacy emails and logins
are evaluated before any trusted path.

Verified automation records preserve Eve's exact bot tuple, Cursor Agent's
signed `cursoragent` tuple, and PR-loop's actor-bound direct tuple. Cursor's
`cursor[bot]` event actor is not its signer. PR-loop's bot-name alias is accepted
only beneath a verified GitHub platform envelope. FastPR's historical
unassociated `pr-fast` direct envelope remains baseline-only and is not
registered without a separately proven replacement.

This replaces independent allowlists, which permit confused combinations of a
trusted name, another identity's email, and a third login. A data registry also
makes future developer onboarding a reviewed data-and-tests change instead of a
new branch of verifier logic.

### Make one pre-push coordinator own stdin

Replace the two-line hook with a Node coordinator that reads pre-push update
records once. It feeds the same parsed records to the existing production guard
and to `ci:preflight` through explicit serialized input and a sanitized
repository slug; a raw remote URL is not propagated to the preflight process
tree. No
"already verified" flag is introduced; the normal first preflight stage remains
the attribution verifier.

For existing remote refs, commit enumeration uses the complete
`remoteSha..localSha` graph. For a new ref, it resolves the pushed object to a
commit, queries the pushed remote's branch and tag tips, and fetches only
advertised tips missing from the local object database without updating refs or
`FETCH_HEAD`. It then excludes their complete histories. Deletions carry no
commits, multi-ref results are deduplicated, and malformed, unfetchable, or
unresolvable data fails closed.

### Keep a forward-only ancestry baseline

The identity registry records the immutable `develop` commit on which the new
policy began. A candidate is historical only when Git proves it is an ancestor
of that baseline. Dates, messages, and first-parent shortcuts are not trusted.
This preserves current history while still checking a newly created side commit
rooted in older history.

### Use event-bound remote scopes and proof

Local pre-push verification checks repository configuration, author/committer
environment overrides, outgoing Git metadata, and forbidden identities. An
unpushed SHA cannot be resolved through GitHub, so lack of remote metadata is
not treated as either success or a generic warning.

The CI format job gains an attribution step before formatting and checks out
full history. Ordinary pull requests audit the complete immutable event
`base..head` DAG, including merge parents.

Protected-branch pushes use the immutable `before`/`after` transition, reject
non-fast-forwards, and audit the introduced first-parent integration spine.
Every scanned commit must be a two-parent GitHub platform merge with a valid
`web-flow` signature made by GitHub. A `develop` integration must also bind to
the exact closed pull request, base, and parent transition. A `production`
promotion head must already be reachable from canonical `develop`. Side ancestry
enters only after full PR verification and behind the signed GitHub envelope; the
merge or release actor is never retroactively treated as that ancestry's author.

`workflow_dispatch` is diagnostic. A protected ref receives the same integration
checks; another branch receives the full `head --not baseline` graph and never
receives event-actor proof. PR and push events missing their immutable base fail
closed. The step receives only `github.token` and bounded event metadata, and its
failure is inherited by the already-required `ci-gate`.

GitHub's commit `author` and `committer` account associations come from the
self-asserted commit email, so they are consistency metadata rather than proof.
For a same-repository PR, an exact registered author or committer claim may be
unsigned only when either the event actor or immutable PR author matches the
registry. This preserves earlier owner commits when a coworker or bot updates
the branch while binding the updater's new tuple separately. Forks never receive
this exception. When neither presenter matches, GraphQL must report a valid
signature whose signer login and ID match every registered claim. Protected
pushes use only the platform-integration path.
`github.triggering_actor` is never attribution proof because reruns retain the
original actor's privileges; its current immutable ID is resolved and still
checked as a forbidden principal.

Signature metadata is fetched for every checked remote commit so invalid or
forbidden signers cannot hide behind actor proof. Forbidden logins and IDs are
checked independently across the workflow actor,
webhook sender, PR author, head-repository owner, triggering actor, commit
associations, and signature signer. GraphQL errors, partial signer pairs, and
missing required metadata fail closed.

### Constrain GitHub platform commits

`GitHub <noreply@github.com>` is not a trusted local developer. Remote CI accepts
it only when GraphQL reports a valid `web-flow` signature whose
`wasSignedByGitHub` flag is true. Registered authors must still resolve to their
bound login; external authors must resolve and must not be forbidden. This
covers merge and web-created commits without allowing a locally forged platform
envelope.

### Separate internal push authority from external authorship

Canonical-repository pushes require a registered local operator and registered
non-platform committers. Authors may be registered or external so reviewed
cherry-picks retain original DCO attribution. Fork pull requests may contain
unregistered authors and committers, but remote CI still requires resolvable,
non-forbidden associations. A fork may use a registered tuple only with a valid
signature from that registered account, preventing public noreply-email
spoofing.

### Treat ownership as routing, not authorization

Both CODEOWNERS files list `@II-ricky-bobby-II` and `@cobmojo`. Documentation
describes direct feature-branch work for internal collaborators and fork-based
work for external contributors. GitHub branch protection and the production
release guard remain authoritative for merge and deploy authorization.

### Keep source scanners out of ignored runtime output

The retired-runtime boundary scanner traverses live source roots, but local Eve
runs create ignored `.eve`, `.nitro`, and `.output` generated trees beneath
those roots. The scanner skips only those three exact
`packages/eve-runtime/**` roots during traversal and rejects the same prefixes at
its source-classification seam as defense in depth. Same-named directories
elsewhere and live package source remain in scope; no artifact is deleted or
rewritten.

## Risks / Trade-offs

- **GitHub API availability can block CI** -> Remote enforcement intentionally
  fails closed; local tuple checks still provide fast feedback before push.
- **Large pushes cause multiple API calls** -> Deduplicate commit SHAs and keep
  ranges bounded to event or ref updates; the expected Core push size is small.
- **A local hook can always be removed** -> Required `ci-gate` performs the
  remote actor check, so the hook is feedback rather than the final authority.
- **Protected integration metadata is defense in depth, not authorization** ->
  GitHub can report indirect PR merges; live branch protection remains the
  authorization boundary. Verify its dated state separately and never claim PR
  metadata alone proves that review protection executed.
- **Public contributors do not appear in the internal registry** -> External
  PR mode verifies resolvable actors and forbidden identities without granting
  canonical push authority.
- **Live branch-protection documentation has drifted from settings** -> Do not
  change platform rules in this PR; keep attribution under the existing
  `ci-gate` and record reconciliation separately.
- **Generated Eve artifacts can contain historical retired-provider strings** ->
  Exclude only gitignored `.eve`, `.nitro`, and `.output` segments and keep a
  regression test proving live source is still scanned.
- **Installed FastPR direct mode is not attributable** -> Preserve its historical
  `pr-fast` commits only through the baseline and track migration or retirement
  separately before direct repairs resume.

## Migration Plan

1. Land the identity registry, outgoing-range coordinator, verifier, CI step,
   tests, OpenSpec artifacts, ownership files, and documentation in one PR.
2. Exercise the branch's own pre-push hook under Conrad's truthful identity;
   successful push is the migration proof.
3. Confirm the PR's existing required `ci-gate` includes successful actor
   verification and that independent review remains required.
4. If rollback is required, revert the PR. No credentials, GitHub roles,
   protected-branch settings, or historical commits need migration.
