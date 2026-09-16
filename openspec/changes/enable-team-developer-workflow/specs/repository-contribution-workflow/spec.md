## Purpose

Defines how trusted team developers, approved automation, GitHub platform
commits, and public contributors participate in Core without weakening
attribution, review, or protected-branch controls.

## ADDED Requirements

### Requirement: Internal developer identities are exact and truthful

The repository SHALL maintain one canonical registry of approved internal human
and automation identities. Each approved local commit identity MUST match a
complete name-and-email tuple, and remote verification MUST bind that tuple to
its declared GitHub login and immutable numeric account ID rather than
independently allowlisting each field.

#### Scenario: Conrad develops under his own identity

- **WHEN** Conrad configures Git as `Conrad O <79217644+cobmojo@users.noreply.github.com>` and presents a same-repository change as authenticated actor `cobmojo` / `79217644`
- **THEN** local and remote attribution verification accept the identity as an internal human developer

#### Scenario: Existing maintainers and verified automation continue

- **WHEN** Blake uses an exact registered tuple, Eve or PR-loop uses its exact
  actor-bound tuple, or Cursor Agent uses its exact tuple with a signature from
  the bound `cursoragent` account
- **THEN** attribution verification accepts the path without treating display
  names, event actors, signatures, or email associations as interchangeable

#### Scenario: Automation principals are cross-wired

- **WHEN** automation uses an obsolete tuple, combines another identity's name
  with its email, substitutes Cursor's event actor for its signer, or uses an
  unregistered FastPR direct envelope
- **THEN** attribution verification rejects the claim

#### Scenario: Trusted fields are cross-wired

- **WHEN** a commit combines the name, email, GitHub login, or numeric account ID from different registered identities
- **THEN** attribution verification rejects the commit

### Requirement: Canonical pushes validate the complete outgoing commit set

The canonical pre-push path SHALL derive the union of commits introduced by all
ref updates. A deletion MUST contribute no commits. An existing-ref update MUST
include the full `remoteSha..localSha` ancestry. A new-ref update MUST include
commits reachable from the resolved local commit but not from actual ref tips
on the pushed remote. Duplicate SHAs across refs MUST be validated exactly once.
The path MUST include merge parents and MUST NOT treat an inherited branch tip
as if the current developer created it.

#### Scenario: Existing branch is updated

- **WHEN** a developer pushes an existing branch
- **THEN** every commit in the remote-to-local update range is validated exactly once

#### Scenario: New branch is pushed

- **WHEN** a developer pushes a new branch
- **THEN** commits already reachable from the canonical remote are excluded and every newly introduced commit is validated

#### Scenario: A ref is deleted

- **WHEN** a push deletes a remote ref
- **THEN** that update contributes no commits, while every other update in the
  same push is still evaluated

#### Scenario: Multiple refs or merge parents contain a bad commit

- **WHEN** one push contains duplicate reachability, multiple refs, or a disallowed commit hidden behind a valid tip or merge parent
- **THEN** validation deduplicates valid work but still finds and rejects the disallowed commit

#### Scenario: Existing forward-only history is encountered

- **WHEN** a scanned commit is proven to be an ancestor of the immutable policy baseline
- **THEN** it is treated as historical and is not re-attributed

### Requirement: Public contribution remains supported

The workflow SHALL distinguish canonical-repository push authority from
authorship. Internal canonical pushes MUST use an approved local developer or
automation identity, while attributable external authors and fork-based pull
requests MAY participate without being added to the internal registry.

#### Scenario: Internal developer carries external authorship

- **WHEN** an approved internal committer integrates a parseable, non-forbidden external author's work
- **THEN** the external author is preserved and the internal committer remains accountable for the canonical push

#### Scenario: External contributor opens a fork pull request

- **WHEN** a contributor outside the internal registry submits attributable commits from a fork
- **THEN** remote verification does not reject the contributor solely for lacking canonical push authority

#### Scenario: Forbidden legacy identity appears

- **WHEN** any author, committer, or resolved GitHub actor uses a specifically forbidden legacy identity
- **THEN** attribution verification rejects it regardless of internal, external, automation, or platform context

### Requirement: Remote CI uses event-bound commit scopes and proof

The existing required `ci-gate` SHALL derive its attribution scope from
immutable event data. For an in-scope pull request it MUST inspect every commit
reachable from the event head but not the event base, including merge parents.
For a protected push it MUST reject a non-fast-forward transition and inspect
the introduced first-parent integration spine between `before` and `after`.

Every protected integration commit MUST be an exact two-parent GitHub platform
merge with a valid `web-flow` signature made by GitHub. A `develop` integration
MUST match a closed pull request and its exact base and parent transition. A
`production` promotion MUST already be reachable from canonical `develop`.

A manual dispatch on a protected ref MUST use the protected integration rules.
A dispatch on another branch MUST inspect the full `head --not baseline` graph
and MUST NOT grant event-actor proof. A commit-email GitHub association is
consistency metadata and MUST NOT authenticate a registered claim. Signature
metadata MUST be fetched for every checked commit. Missing, partial, malformed,
or contradictory GitHub metadata MUST fail closed.

#### Scenario: Pull request contains merge ancestry

- **WHEN** an in-scope PR head contains commits reachable only through a merge parent
- **THEN** every commit reachable from the head but not the immutable event base is verified

#### Scenario: Registered developer presents an unsigned same-repository PR

- **WHEN** an unsigned registered tuple appears in a same-repository pull request
- **THEN** either the authenticated event actor or immutable pull-request author
  login and numeric account ID must match that record and take responsibility
  for presenting the change

#### Scenario: Registered identity requires signature proof

- **WHEN** a registered identity appears in a fork pull request or the authenticated same-repository actor does not match
- **THEN** GitHub must report a valid signature whose signer login and numeric account ID match that registered identity

#### Scenario: Public email association is spoofed

- **WHEN** a fork commit uses a registered public noreply tuple and GitHub associates the email with that account but no matching signature exists
- **THEN** remote attribution rejects the registered identity claim

#### Scenario: Protected branch receives a direct or local merge

- **WHEN** a protected update is non-fast-forward or its integration spine contains a direct commit, locally created merge, invalid platform envelope, or unexpected transition
- **THEN** remote attribution rejects the update

#### Scenario: Reviewed side ancestry enters develop

- **WHEN** a GitHub-signed two-parent merge matches the exact closed `develop` pull request and parent transition
- **THEN** protected verification accepts the integration envelope without reassigning the merger's identity to the already-verified side ancestry

#### Scenario: Production is promoted

- **WHEN** a signed integration updates `production`
- **THEN** the promoted event head must already be reachable from canonical `develop`

#### Scenario: Attribution is dispatched manually

- **WHEN** an operator dispatches attribution on a feature branch
- **THEN** verification scans the full forward-only diagnostic graph and requires signatures without granting event-actor proof

#### Scenario: Forbidden event or signature principal participates

- **WHEN** a forbidden account appears as workflow actor, webhook sender, pull-request author, fork owner, rerun triggering actor, commit association, or signature signer
- **THEN** remote attribution rejects the event independently of commit-email association or signature validity

#### Scenario: GitHub creates a platform commit

- **WHEN** GitHub reports the exact `GitHub <noreply@github.com>` / `web-flow` committer path with a valid signature made by GitHub's signing key
- **THEN** the platform committer is accepted without being treated as a human developer

#### Scenario: Platform identity is forged locally

- **WHEN** a local or remotely unverified commit imitates GitHub's platform name or email
- **THEN** attribution verification rejects the commit

#### Scenario: GitHub metadata is unavailable in required CI

- **WHEN** a REST or GraphQL call fails, returns errors or partial data, or cannot resolve required proof
- **THEN** the required CI attribution step fails

### Requirement: Ownership and protected-branch controls remain team-safe

Core SHALL route default ownership to both active human code owners and MUST keep
attribution independent from branch authorization. Passing attribution MUST NOT
authorize a direct production push, bypass checks or review, enable force pushes,
delete a protected branch, or relax conversation-resolution requirements.

#### Scenario: A pull request touches any repository path

- **WHEN** GitHub evaluates CODEOWNERS
- **THEN** both Blake and Conrad are eligible default owners for review routing

#### Scenario: Trusted developer targets a protected branch

- **WHEN** an approved developer attempts a protected-branch operation
- **THEN** the existing GitHub and production-release protections still apply in addition to attribution

#### Scenario: Protected history is rewritten or deleted

- **WHEN** any actor attempts a force push or deletion of `develop` or `production`
- **THEN** live GitHub protection rejects the operation independently of attribution

### Requirement: Developer setup does not copy credentials into the repository

The contributor workflow SHALL document authenticated Git and GitHub CLI usage
without committing, printing, or copying tokens between Windows and WSL.

#### Scenario: Windows authentication is reused by WSL Git

- **WHEN** a Windows developer uses WSL for Core development
- **THEN** the documented setup uses an operating-system credential manager or a separate supported login and keeps secrets out of repository files and logs

### Requirement: Local verification scans live source rather than generated copies

Repository source-boundary checks SHALL exclude only the gitignored generated
roots `packages/eve-runtime/.eve/**`, `packages/eve-runtime/.nitro/**`, and
`packages/eve-runtime/.output/**`. Same-named directories elsewhere and all live
source under `apps`, `packages`, and `scripts` SHALL remain in scope. Exclusion
from a scan MUST NOT delete or rewrite an artifact.

#### Scenario: Eve local development creates archived source copies

- **WHEN** ignored `.eve`, `.nitro`, or `.output` trees contain historical retired-provider strings
- **THEN** source-boundary verification ignores those generated trees and still scans live `apps`, `packages`, and `scripts` source
