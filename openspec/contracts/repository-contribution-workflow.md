# repository-contribution-workflow normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-9521f7647d8b904d1832"></a>

## Remote CI uses event-bound commit scopes and proof

<!-- BEGIN CONTRACT {"id":"9521f7647d8b904d1832","name":"Remote CI uses event-bound commit scopes and proof"} -->

The existing required `ci-gate` SHALL derive its attribution scope from
immutable event data. For an in-scope pull request it MUST inspect every commit
reachable from the event head but not the event base, including merge parents.
For a protected push it MUST reject a non-fast-forward transition and inspect
the introduced first-parent integration spine between `before` and `after`.

Every protected integration commit MUST be an exact two-parent GitHub platform
merge with a valid `web-flow` signature made by GitHub. A `develop` integration
MUST match the exact closed Core pull request, target branch, merge commit SHA
and second-parent head SHA. Its recorded PR base SHA MUST equal the first parent
or be positively proven to be an ancestor of that first parent. A stale base
snapshot alone MUST NOT reject an otherwise valid platform merge. Missing or
invalid SHAs, unavailable history, failed ancestry commands, and unrelated or
reversed ancestry MUST fail closed. A `production` promotion MUST already be
reachable from canonical `develop`.

A manual dispatch on a protected ref MUST use the protected integration rules.
A dispatch on another branch MUST inspect the full `head --not baseline` graph
and MUST NOT grant event-actor proof. A commit-email GitHub association is
consistency metadata and MUST NOT authenticate a registered claim. Signature
metadata MUST be fetched for every checked commit. Missing, partial, malformed,
or contradictory GitHub metadata MUST fail closed.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-4388fd5790cd44d87e99"></a>

## Canonical pushes validate the complete outgoing commit set

<!-- BEGIN CONTRACT {"id":"4388fd5790cd44d87e99","name":"Canonical pushes validate the complete outgoing commit set"} -->

The canonical pre-push path SHALL derive the union of commits introduced by all
ref updates. A deletion MUST contribute no commits. An existing-ref update MUST
include the full `remoteSha..localSha` ancestry. A new-ref update MUST include
commits reachable from the resolved local commit but not from actual ref tips
on the pushed remote. Duplicate SHAs across refs MUST be validated exactly once.
The path MUST include merge parents and MUST NOT treat an inherited branch tip
as if the current developer created it.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
