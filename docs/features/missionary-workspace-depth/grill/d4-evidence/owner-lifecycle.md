# D4 owner and lifecycle evidence

Research-only, 2026-10-16 UTC. The founder selected Q4 A: **archive from active
prospects**, with excellent, simple and clear UX. This note supports the decision
review; it creates no formal specification, implementation, ticket, live action,
new access right or retention schedule. The selected scenario is Maya's unused
unshared preparation, explicitly distinct from a managed partnership or accepted
task. Evidence below is accepted owner intent, not proof of runtime enforcement.

## Recommended permanent boundary

Use a small, reversible **disposition of the existing bounded P9 preparation
source**. Archive removes that preparation from its active prospect view; a
currently authorized user can find it in the archived view and deliberately
return the same preparation to the active view while retention and source rules
permit. No separate archive service, copied contact, private CRM, ACL or task
engine is needed. Do not freeze the SQL representation in this research note.

This is a **new D4 preparation-owner extension**, not existing P9 Party archival
or P27 partnership closure. P9 A10 `phase-09-full-crm-depth-relationship-graph.md:
417–424` and its data model `:759–762` already define a global Party lifecycle
including `archived`. Reusing that field would apply the wrong scope. P27 P11/P12
separately govern closure/readiness and reopening managed work. Their constraints
are inherited boundaries; their entire workflow must not be copied into this
simple preparation action.

## Scoped concerns, evidence and exact proposed clauses

Severity and likelihood are conditional design-risk assessments, not measured
incidence or findings against running code.

### O4-01 — Scope and source identity

**Harm / assessment:** Global Party archival, duplicated “archive contact” rows,
or closing a managed relationship changes other people's useful data or creates
competing truth. **High; plausible if an existing archived status is reused by
name alone.**

**Evidence:** P9 A10/data model above; A16 `:573–579` requires source-owned
engagement and read-composed timelines. P27 partnerships P11 `:339–343` explicitly
keeps closure separate from Party/ministry lifecycle, assignments, finance and
consent. Durable `openspec/specs/crm-core/spec.md`, “CRM Identity Concepts Stay
Distinct And Linked,” preserves each source identity and prohibits automatic
low-confidence overwrite/link/merge.

**Clause:** “Archive/restore changes only the exact authorized preparation's
active-list disposition. Preserve its source identity, origin and lawful
attribution. It neither archives/deactivates a canonical Party, unshares a D2
contact, closes/reopens managed work, transfers responsibility nor changes
another worker's preparation. Restore reuses the same source, not a copied
replacement or a new canonical person.”

**Proof:** A preparation linked to a shared person, another worker's context and
managed work can leave the preparation active view without changing those other
facts. Restoring it preserves lineage and does not create a second source.

### O4-02 — Archive is not an access boundary or a new recovery right

**Harm / assessment:** A hidden tab becomes the only privacy enforcement;
archive grants staff access; restore revives revoked rights or another person's
history. **High; plausible if state, authorship or a retained ID replaces current
authorization.**

**Evidence:** P12 `phase-12-full-role-permission-configuration.md:1464–1468`
defines one current resolver and subtract-only floors. Its `:1637–1654` protects
existence, query inputs, derivatives and purpose. P27 context C03/C04 `:41–63`
requires exact history scope and current mutation authority; assignment/removal
does not grant history or erase attribution. D3 selects no continuity-access
exception. P27 P12 `:381–385` is a narrow managed-work precedent against
resurrecting grants/children, not a universal preparation-return policy.

**Clause:** “Archived preparation retains its source audience and restrictions.
Every archived list, count, search, detail, restore and result recovery requires
current exact source authority before disclosure. Archive grants or revokes no
permission by itself. Restore neither restores expired/revoked rights nor grants
historical access; the current preparation/history contract governs what is
available. Departure creates no archive custodian or successor reader.”

**Proof:** Retained IDs, deep links, search, audit, caches and restore cannot
reveal a forbidden source. Recreated membership, old email and historical
authorship do not independently authorize. An unrelated grant revocation does
not falsely deny an independently surviving valid source grant.

### O4-03 — Matching must not mistake an active-view filter for nonexistence

**Harm / assessment:** Entering the same prospect again creates accidental
canonical duplication because archived candidates disappeared; alternatively
matching exposes another worker's hidden source or a protected canonical person.
**High; plausible if the active-list query is reused as the identity lookup.**

**Evidence:** P4 A5/A7/A9 `phase-04-identity-account-claiming-foundation.md:
153,165,185` separate recognition from disclosure, forbid cross-Tenant dedup and
require source-approved nonautomatic merge. P9 A15 `:565–571` binds search to
detail/list permissions. P27 partnerships P02/P03 `:41–43,69–93` prohibits
duplicate work as a confidentiality workaround, preserves existing meaning on
reuse and requires minimum result authority before hidden-existing/absent
branches. Ratified D2-C05/C06 applies the latter discipline to canonical admission.

**Clause:** “Active-view exclusion is not identity absence. Qualified identity
resolution and same-source recovery consider relevant lawfully retained
candidates, including archived preparation where authorized. The user may be
offered their permitted existing preparation without restoring it automatically.
Protected matches remain protected; no caller receives forbidden existence or
metadata, and no duplicate canonical person or enrollment is created to evade
a restriction. Names, shared email or phone alone are not universal person keys.”

**Proof:** Exercise own visible archive, hidden preparation, protected canonical
match, no match, shared household email and ambiguous matches. Where minimum
admission-result authority is absent, gate before existence-dependent outcomes;
generic identical error wording after a revealing branch is insufficient.
Do not invent a new person-wide uniqueness rule for independent workers'
legitimate source assertions or promise perfect duplicate detection.

### O4-04 — Private content and retention do not change on restore

**Harm / assessment:** Restoring rehydrates erased bodies, republishes private
history, resets expiry or quietly keeps all archived content forever.
**High; plausible if restore is implemented as a historical snapshot copy.**

**Evidence:** P27 context C02 `:29–37` prohibits private-to-shared migration;
C07/C08 `:93–115` preserves original dates/provenance, lawful restriction and
retention, and reapplies expiry/erasure before restored data becomes readable.
P9 B17 `:678–679` says Name/Phone do not inherit mailing/financial retention
timers. D2-C04 protects private history and D3 does not select a retention period.

**Clause:** “Archive is not deletion, retention suspension or permanent storage.
Use the applicable source retention, holds, restriction and erasure rules;
bring any missing material policy choice back explicitly. Restore changes
current-list disposition only: it does not revive removed bodies, reset a
retention clock, roll back corrected canonical facts or publish prior private
content. Current lawful content and honest unavailable states replace promises
that an entire historical snapshot can always be recovered.”

**Proof:** Restore after permitted correction, expiry, restriction and partial
erasure. Preserve required structural evidence under its own audience without
restoring forbidden content. Archive/restore dates do not become last contact,
fresh assessment, gift or completed-task dates.

### O4-05 — Linked work keeps its own lifecycle

**Harm / assessment:** Archiving hides required follow-up, cancels a reminder,
falsely completes a task, or burdens a tentative idea with a mandatory closure
review. **High for stranded accepted duties; Medium for invented chores;
plausible if linked source state is cascaded.**

**Evidence:** ADR0183 `:57–100` requires independent current authorization and
source-controlled task closure; access loss is not completion. P27 assignments
A07/A08 `:156–182` prohibits guessed responsibility or implicit duty transfer.
P27 partnership P11 `:339–343` governs actual managed closure readiness; it is
not a justification for blocking this list-only operation with that workflow.

**Clause:** “Archive/restore neither completes, cancels, pauses, reassigns nor
revives independent tasks, requests, commitments, managed work or notifications.
Their source-qualified current work remains discoverable through its normal
authorized work surface. A tentative prospect creates no mandatory archive
review, successor, reminder quota or handoff task. Do not import partnership
closure readiness into a list-only preparation action.”

**Proof:** Archive with an independently valid task, completed task and ended
notification; each retains its actual source state. Restore creates no duplicate
task or attention. Ensure the task never depended solely on the now-filtered
preparation row for its authorized discoverability.

### O4-06 — Ordered archive, restore and D2 sharing

**Harm / assessment:** A stale share publishes after the user's reviewed source
has changed; archive falsely appears to cancel already accepted sharing; a late
archive retry overwrites a later restore. **High for disclosure, Medium for
incorrect current-list state; plausible with delayed responses or multiple tabs.**

**Evidence:** Ratified D2-C03/C10/C11 require exact reviewed source/contact
revision, atomic source acceptance and semantic recovery. P9 A17 `:581–595`
keeps mutations with their source, with no generic provider gate/journal. P27
context C04/C05 requires current mutation authority, expected revisions and
same-effect recovery; P27 P13 `:421–445` rejects stale replay overwriting later
meaning. D4's precise preparation transition is a new owner extension.

**Recommended clause:** “Order archive/restore and sharing against the relevant
current source revision. Revalidate reviewed intent and exact authority at
acceptance; a stale pre-transition command cannot blindly apply to the changed
source. An already accepted D2 share remains accepted history and ordinary CRM
availability follows its own rules; archive is not Unshare or cancellation.
Later authorized restriction/correction remains possible. Recover the original
operation under current disclosure authority without reapplying it over a newer
archive/restore cycle. No notification or outward effect is replayed.”

**Minimal transition consequences:**

| Ordering/case                                     | Required consequence                                                                                                                                                   |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Archive wins before an old share intent           | The stale source revision cannot silently publish; obtain current qualified intent/result under D2. Archive itself does not revoke the actor's separate D2 capability. |
| D2 share wins first                               | Preserve the accepted canonical admission and its receipt/effects. A later permitted preparation archive cannot unshare it or report that no sharing occurred.         |
| Restore follows archive                           | Return the same currently permitted preparation to the active view; neither stale contact snapshots nor old effects are re-executed.                                   |
| Old archive retry arrives after restore           | Recover the old receipt; do not archive the newer state again. A genuinely new archive action remains possible.                                                        |
| Share response is unknown when Archive is pressed | Archive cannot promise to cancel that share. Recover authoritative share acceptance and show only currently permitted outcome.                                         |

Whether the archived detail exposes the existing deliberate D2 action directly
or presents **Restore**, then **Make available to staff**, is a UX/source-action
design choice, not an inherited permission rule. Do not claim D4 has selected a
new actor right, automatic share on restore, permanent prohibition on sharing
archived content, or implicit restore on share. The ordinary action should remain
small; no new approval ceremony is justified. If the post-share preparation
surface needs a broader archive policy than the selected unshared scenario,
define that exact source meaning rather than silently changing global contacts.

### O4-07 — Atomic truth with quiet, accurate presentation

**Harm / assessment:** A row vanishes optimistically despite failed archive;
conflicting counts/deep links imply deletion; private archive history leaks via
ordinary CRM activity. **Medium to High; plausible if filtering is only client
state or generic Party activity is emitted.**

**Evidence:** P9 A17 `:581–595` owns state plus required audit/activity atomically;
P27 context C08 `:106–115` governs protected metadata and derived summaries. The
preparation amendment must qualify the correct restricted evidence, not emit a
broad canonical `status_changed` event merely because a familiar emitter exists.

**Clause:** “Persist one authorized source transition with required minimized
evidence and recoverable outcome. All current/archived views, counts and results
derive from that source under current access. Failed or unknown acceptance is
not success; a failed refresh does not reverse accepted truth. Archive history
retains its source audience and does not appear in ordinary staff timelines,
notifications, logs or AI as a privacy bypass.”

**Proof:** Required-write failure rolls back; lost response reconciles once;
late result cannot clear another draft or overwrite newer state. Authorized
active/archived lists converge after refresh; forbidden counts and history
remain absent. No new alert or donor contact follows from archive/restore.

## Coverage and limits

Re-read the quoted P4/P9/P12/P27 sections, ADR0183, Q4 framing, D2 accepted
amendments and D3 owner evidence. P9's canonical archive field and P27's managed
closure/reopen contracts are explicit scope counterexamples, not ready-made
preparation implementations. No exhaustive source scan or actual authorization,
database, browser, retention or concurrency test is claimed. D4 selects a useful
reversible preparation disposition; exact storage, reached writers, owner
permissions, retention qualification and measured UX remain later authorized
design/implementation work. This file is the only mutation in this workstream.
