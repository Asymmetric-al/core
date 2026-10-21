# D3 owner and lifecycle evidence

Research date: 2026-10-16 UTC. Research-only review of the founder's Q3 answer:
**“A — No new access right. Keep it simple. We want to make sure we maintain
clean useful data too. make sure UX/UI around this clear where needed, don't
overcomplicate.”** No implementation, formal specification, ADR, ticket, live
grant, contact action or retention schedule is created by this note.

## Conclusion and decision boundary

D3 selects **no new continuity-access right**. Departure or inability to continue
does not permit staff, an administrator or a successor to inspect or publish
unshared prospect preparation. D3 preserves D1's restricted preparation and D2's
deliberate ordinary CRM contact admission. “Clean useful data” supports truthful
current state, correction, ordinary workspace removal and source-governed
disposition; it does not select deletion on departure, a retention duration,
automatic deduplication, a new custodian or an exception to the access decision.

Access, active-work applicability and record disposition are three distinct
facts. End current access when the identity/access owner requires it. Stop
presenting ineligible responsibility as current work. Preserve or dispose of
records only under the exact source's qualified retention/correction contract.
None of these operations substitutes for another.

The bounded P9 preparation source remains a required owner amendment from the
D1/D2 review, not an existing generic P9 private-prospect service whose deletion
rules can be assumed. P9's ordinary notes default to standard visibility and
offer soft-delete; that is not an author-only preparation lifecycle contract.

## Findings and exact proposed clauses

Severity and likelihood below describe conditional design failures, not
observed runtime defects or measured incidence. The source documents establish
accepted intent; this pass did not inspect or execute runtime access policies.

### O3-01 — Departure must not become disclosure

**Harm:** A cleanup/export/handoff process lets a manager inspect a departed
missionary's unshared identity, contact details or planning, despite selecting A.
**Severity:** High. **Likelihood:** Plausible if organization ownership, an admin
label or the word continuity is treated as permission.

**Evidence:** P12 §I, `phase-12-full-role-permission-configuration.md:1666–1674`,
separates permission testing, impersonation, typed grants and tenant recovery.
Impersonation is subject-floor AND operator-ceiling; delegated administration is
not exercise authority. Restricted named grants die on grantor departure.
Recovery excludes restricted-tier plaintext. P12 `:1705–1712` binds grants to
exact assignments, not bare persons. These are enforcement mechanisms, not a
previously accepted unshared-preparation continuity purpose. D3 now rejects
adding that purpose. D1 restriction must not be confused with P10 restricted
physical-security classification.

**Proposed clause:** “Departure or inability to continue grants no new right to
read, export, transfer or publish unshared preparation. Administrative recovery,
assignment changes and organization ownership do not supply that right. Existing
independently authorized source functions retain their exact scope; D3 creates
no custodian or continuity-access capability.”

**Proof:** After departure, ordinary staff and generic administrators gain no
preparation body, identity, contact detail, count, search hint or result-recovery
access through handoff, cleanup, audit, impersonation or export paths. Do not
misstate D3 as revoking a separately established lawful source function.

### O3-02 — Ending access is not deletion, and return is not old-grant recovery

**Harm:** Revocation waits for cleanup; later reactivation revives expired grants
or attaches old permissions/history to a newly created assignment.
**Severity:** High. **Likelihood:** Plausible if authorization is keyed only to
the person's identity or a cached historical owner field.

**Evidence:** P12 `:1669–1672` makes freeze/suspend zero capabilities and governs
grant changes through one locked boundary. P12 `:411–416` and ADR0184 `:159–171`
make affected assignment/group paths inert without deleting history or attaching
access to a recreated assignment. Those passages specifically govern P24's D38
access source; they are not a complete missionary-preparation return policy.
P12 `:2400–2413` explicitly states the Support Workspace's global membership
deactivation and no resurrection of expired/revoked grants, invitations or
preferences. P27 assignments A12 `:242–252` makes a return to an earlier staff
member a newly valid transition, not expired-access resurrection.

**Proposed clause:** “Current source access ends under the identity and
permission owners independently of records cleanup or work handoff. Return or
reactivation requires current source eligibility and authority; it does not
restore expired/revoked grants or attach historical rights to a recreated
assignment. D3 does not promise automatic access to retained preparation.”

**Proof:** End access while handoff is outstanding; attempt old sessions, cached
results and pending share commands. Then exercise return under the same valid
source versus a recreated assignment. Re-prove the applicable current source
authority rather than declaring either universal restoration or universal
permanent loss. The exact preparation source must qualify this seam.

### O3-03 — Cleanup cannot erase or quietly complete accepted duties

**Harm:** A departed missionary's accepted task or obligation disappears under
“clean up my workspace,” or staff keep seeing the departed person as healthy
coverage. Alternatively, the private prospect itself becomes an unwanted
mandatory handoff task.
**Severity:** High for real duties; Medium for invented work. **Likelihood:**
Plausible if preparation, Party assignment and accepted responsibility share one
archive/delete or completion control.

**Evidence:** P27 assignments A07–A08 `:156–182`: ineligible responsibility is
not healthy coverage or an access path; missing successors follow the existing
source exception; assignment does not transfer tasks, commitments, care or
permissions; directory/access revocation never waits for handoff. ADR0183
Decision: only a concrete source-qualified human action creates work;
responsibility grants no access; source-backed closure is source-controlled;
access loss is not completion. P27 context C01 preserves independent accepted
duties while voluntary contribution creates none.

**Proposed clause:** “A tentative prospect alone creates no continuity task or
obligation. Existing accepted organizational duties keep their source-owned
responsibility, disposition and handoff rules. Departure or workspace removal
does not complete or erase those duties, delay revocation, disclose unshared
preparation or assign a guessed successor.”

**Proof:** An unshared idea produces no new staff task. A separately accepted
duty remains source-discoverable to independently authorized staff without
exposing the private preparation. Departed responsibility is not presented as
current healthy ownership or falsely Completed.

### O3-04 — Removing preparation must not delete an independently useful person

**Harm:** “Remove prospect” deletes a canonical Party, shared contact, another
person's work or financial evidence; an automatic cleanup merge unions private
context or access.
**Severity:** High. **Likelihood:** Plausible if implemented as generic Party
CRUD, person-wide cascade or automatic same-email merge.

**Evidence:** P4 A9 `phase-04-identity-account-claiming-foundation.md:185`:
same-person merge is nonautomatic, reversible and source-approved; immutable
financial/commitment facts do not repoint; only completeness-gated empty-shell
deletion is permitted by that specific merge contract. P9 A4 `:353–367` retains
time-bound relationship history. P9 D19 `:1334–1340` requires explicit owner
dispositions on departure/merge and never unions permissions. Durable
`openspec/specs/crm-core/spec.md`, “CRM Identity Concepts Stay Distinct And
Linked,” forbids automatic low-confidence merge/overwrite/link. Ratified D2-C19
already denies inferred generic Unshare or deletion of independent CRM facts.

**Proposed clause:** “Removing or retiring unshared preparation affects that
source context only. It does not delete or unshare independent canonical
contacts, shared work, financial records or other people's facts. Identity
correction and duplicate resolution use the existing authorized P4/P9 source
commands; cleanup never merges automatically or unions history/access.”

**Proof:** Remove preparation linked to an existing Party and to a previously
shared contact; independently authorized CRM facts and duties survive. A
suspected duplicate remains unresolved without leaking a hidden match or
silently creating/merging a canonical person.

### O3-05 — “Clean” does not mean permanent storage or immediate erasure

**Harm:** The product silently keeps every body forever, deletes required
evidence on departure, or advertises deletion while audit snapshots and backups
remain readable through another route.
**Severity:** High. **Likelihood:** Plausible if a generic soft-delete or
append-only rule is mistaken for an end-to-end disposition policy.

**Evidence:** P9 notes B8 `:634–636` supports soft-delete; data model `:788–810`
retains author snapshots and uses audit before/after snapshots as edit history.
These establish retained representations, not permanent retention or new staff
access. P27 assignments `:209–222` prohibits destructive cascades and requires
lawful retention/redaction, explicitly not infinite plaintext or arbitrary hard
deletion. P27 context C08 `:106–115` distinguishes bodies, body-free contact
facts, business history, security audit and operational telemetry; append-only
is not permanent retention; restoration reapplies restrictions/erasure/expiry.
P9 B17 `:678–679` says ordinary Name/Phone do not inherit mailing/financial
retention timers.

**Proposed clause:** “D3 sets no retention duration, immediate-deletion rule or
permanent archive. The preparation owner must qualify ordinary removal and
lawful retention/disposition of the source and its reached derivatives, keeping
required evidence under its proper audience. Retaining a record does not grant
staff access. UI labels state the actual effect and do not promise recall of
previously permitted copies.”

**Proof:** Qualify the exact preparation source's removable content, retained
evidence and required disposition before claiming that lifecycle works. Apply
the same restriction/erasure/expiry on restored copies before reading or
dispatch. No invented countdown, blanket purge, perpetual archive or separate
cleanup platform is required by D3. An unqualified lifecycle is an owner seam to
resolve, not permission to advertise a behavior that is absent.

### O3-06 — Useful correction changes the proved source, not unrelated authority

**Harm:** A stale or mistaken private assertion overwrites a shared person's
current contact information, clears an independent value, verifies a channel or
reopens follow-up merely to make the data look complete.
**Severity:** Medium to High. **Likelihood:** Plausible if correction is a
last-writer-wins person update or trusts authorship as global edit authority.

**Evidence:** P9 B17 `:661–679` requires an exact-Tenant proved person,
field/purpose capability, validation, monotonic revision, atomic evidence,
conflict detection and same-operation recovery. It separates contact values
from login, verification, consent, billing and released identity. This command
does not already grant arbitrary missionaries permission to correct third-party
canonical contacts. P27 context C07 `:93–102` preserves attributed corrections
without reopening work or inventing contact, consent, completion or money.

**Proposed clause:** “Use ordinary source-authorized correction and duplicate
resolution to maintain useful facts. A missionary may correct only the
preparation or canonical fields currently permitted by their exact source
authority. Authorship, a stale assertion and departure do not authorize canonical
overwrite, channel verification, consent changes or reopening completed work.”

**Proof:** Concurrent canonical updates cannot be overwritten by stale private
preparation. Correction is attributable, preserves independent source values,
and does not reset factual interaction dates or create new outward effects.

## Minimal UX consequence

Keep one ordinary restricted/shared distinction with accurate audience text.
The restricted explanation may say **“Not shared with staff. Leaving does not
share this automatically.”** Do not claim personal ownership, “only you
forever,” automatic deletion, or global invisibility of existing independent
CRM records. Surface removal consequences at the removal control; source-owned
accepted work uses its existing handoff/status presentation. Avoid a new
custodian picker, departure wizard, mandatory private-prospect review queue,
routine confirmation ladder or repeated privacy warnings.

The proposed copy is a design direction, not a claim that the exact source
audience and lifecycle are implemented. D3 selects no new access right and
requests clarity/simplicity; any materially different retention/disclosure
choice still needs an explicit decision rather than being hidden in cleanup.

## Evidence coverage and limits

Re-read the exact sections cited above, root AGENTS, `openspec/project.md`,
protected-path guidance, current D1 owner/lifecycle evidence, D2-C19 and session
Q3 framing. Checked the durable CRM identity boundary and searched current
identity/OpenSpec change paths; no exhaustive scan or runtime qualification is
claimed. P12's D38 and Support Workspace examples have explicit narrower scopes
and are used as owner precedents, not copied as prospect authorization policy.
No complete preparation retention schedule or automatic return-access contract
was found in the scoped source reads. No code, formal specification, ADR,
external system or other agent's document was modified.
