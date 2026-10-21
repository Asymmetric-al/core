# D34 finite expired-referral projection model

This standard-library model contrasts unsafe disclosure choices with the proposed
D34 purpose boundary. It is documentation evidence about finite synthetic
examples, not an application implementation, schema, SQL/RLS test, concurrency
test or deployed privacy proof. The founder selected organization-permitted
limited expired-referral history, with contact/private context unavailable and
continuation separate; the detailed owner contract illustrated here remains a
proposal.

The model has 13 counterexample families and four positive controls. It compares
authority-time expiry with lagging display status; ordinary expiry with source
withdrawal; minimal history with full record serialization; independent ordinary
contact access with history policy; recipient provenance with creator/reassignment;
safe labels with placeholder/count leaks; authorized-label search with private
field matching; permitted pagination with source-row pagination; current
disclosure with stale responses; fresh reads with On→Off→On response resurrection;
current source/scope/retention gates with organization-wide permission; active-again
source state with a permanent Expired list; and current cursor authorization with
a durable historical grant.

The controls admit a qualified expired-only minimal row, a source-proved
pre-expiry handoff recipient with current history authority, a separately approved
useful alias and fresh eligible reads after explicit enablement. Read examples
also preserve source facts. They do not implement continuation, interaction,
tasks, sends, deletion or retention updates.

## What the inputs mean

`World` requires the example's time and policy setting. There is no selected
organization default. The arbitrary deadline `10` supplies a boundary for before,
at and after examples; it is not a duration or product retention policy.

The source supplies ordinary effective referral-window expiry, exact canonical
recipient/work-context provenance before expiry, current source readability,
identity qualification, ordinary readable retention and an approved useful label.
These are separate from current actor assignment, exact Tenant/work context,
history action/purpose authority and organization policy. `preexpiry_recipients`
is neither a proposed table nor a first-recipient-only rule: qualified handoff
proof may admit a past recipient, while current reassignment alone supplies no
proof. Current source readability is the per-source permission fixture, distinct
from the general history action grant.

The independent Party/contact fixture represents its own current scoped read
grant. Its success neither opens the private expired referral body nor grants
contactability or sending. Turning history Off does not cancel this independent
grant. `hold_only` and `erased` fail the ordinary readable retention gate even
when a synthetic record remains physically present in the fixture.

The minimal illustrative projection contains a source reference, a currently
approved useful label and `Expired`. This is not a final API-field prescription.
No safe useful label means no row, search match, count or pagination existence
signal. A supplied approved alias can qualify; the model invents no fallback
label and performs no search on private contact or referral context.

## Ordered schedules and pagination limits

The examples order source/authority changes before disclosure. A prepared result
must still pass current context, policy, authority and selected-source checks;
an old response cannot revive merely because On returns. A fresh read may succeed
under current authority. An externally supplied active-again fact removes a row
from the Expired projection without deleting the source. No renewal actor or
renewal command is modeled.

Cursor fixtures bind context, purpose, query and authority/policy revisions, and
each continuation filters current source projections before counting or matching.
A hidden insertion does not cause a global source-revision conflict. A formerly
visible next row that becomes private is omitted on continuation. The token is an
in-memory lookup handle, not a proposed token format, cryptographic design,
pagination contract or durable database structure. Stable IDs and finite sorting
are only illustrative; no full pagination consistency guarantee is established.

## Reproduction and limits

From the repository root, run only the new model:

```sh
python3 docs/features/missionary-workspace-depth/grill/d34-evidence/history-counterexamples.py
```

The script prints deterministic JSON including its own SHA-256, case IDs and
outcome assertion count. It does not write files. The checked-in
[result](history-counterexamples.json) records the author's first run; a separate
root-agent reproduction can compare the complete bytes. The
[analytical review](counterexample-review.md) gives the failure scenarios and
owner-document anchors. No older model or probe is required or rerun.

This evidence does not prove that P9/P12 currently supplies these inputs. It does
not exercise a database, RLS, real transactions, locks, concurrent workers,
authoritative clock service, scheduler, network, browser, client late-response
handling, cache invalidation, identity merge, handoff, restoration, erasure or hold
producer. Logical denied/missing responses are compared for value only; timing,
statistical noninterference, transport errors and production existence oracles
remain untested. The absence of write methods and unchanged source fixtures do
not test real downstream integrations. Exports, analytics, logs, realtime and
multiple-source watermarks are outside this finite model. Passing its examples
establishes neither a deployed grant nor release readiness.

No organization default, expiry duration, retention period, continuation actor,
renewal workflow or additional product queue is selected by these files.
