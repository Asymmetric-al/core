# D39 governance and source-time review

Reviewed October 18, 2026 against `/workspace/core` at
`9cada8f3d8ab59db391d3fd20df77fcadeb09813` and its research working tree.
This is a bounded independent review for the parent D39 answer. It changes no
formal specification, application, schema, permission, ticket or live record.
No earlier program, probe, model or verifier was executed.

## Judgment

**Accept with required amendments.** The selected original-referral anchor is
coherent with P9 lineage and D34–D38. It prevents entry, import, assignment and
retry timestamps from manufacturing a new full period. An original referral date
is a fact; a work-window deadline is the result of applying an expressly selected
policy to that fact. Those facts must not collapse into one `created_at` value.

The strongest alternative was a deliberate start-of-work clock. It gives a late
record a full working period but allows initial admission timing to control its
age. The founder selected the original event instead. Do not restore the rejected
meaning through defaults, imports, reassignment or an administrative date edit.

The first review identified two semantic questions requiring explicit treatment
rather than inferred historical facts: which policy applies to a first late
record, and how an imprecise original date could produce an exact elapsed-time
endpoint. The first has a minimal coherent amendment below. **The founder has
since selected calendar-date deadlines for all New referrals, with Continued
referrals retaining elapsed-day timing.** The selected clarification and the
proposed exact counting convention are recorded below. The earlier unresolved
analysis is retained as pre-answer reasoning, not the current product status.

## Governing evidence actually inspected

| Source                                                                                                                                                                                                                                   | Verified governing consequence                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Founder boundary](../phase28-founder-brief.md:21)                                                                                                                                                                                       | Research/grill only; one meaningful product choice at a time; engineering questions should be answered from evidence.                                                       |
| [OpenSpec current/intended](../../../../../openspec/project.md:6)                                                                                                                                                                        | Ratified intent and source/runtime qualification are different. A document does not prove an activated producer.                                                            |
| [ADR-0001](../../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md:60)                                                                                                                                                       | Asym Postgres owns CRM truth; no provider-backed replacement or shadow missionary store.                                                                                    |
| [P28 owner constraint](../../../../prds/program-roadmap/owner-constraints.md:81)                                                                                                                                                         | Referral provenance is a P9 relationship edge with expiry and source reporting, not a free-text property.                                                                   |
| [P9 A4](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:353)                                                                                                                                           | Canonical same-tenant relationship edge, time-bound history, family identity and active uniqueness must survive.                                                            |
| [P9 A17](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:581)                                                                                                                                          | Native mutation, audit and activity belong in one transaction. No generic provider/CRM command journal is authorized.                                                       |
| [Original active-view guardrail](../../../../prds/program-roadmap/owner-constraints.md:143) and [D34 narrow amendment](../phase28-d34-expired-referral-history-adversarial-review.md:175)                                                | Historical recipient evidence and current history/field authority are independently required. Creation alone does not establish history access.                             |
| [D34 truthful precision](../phase28-d34-expired-referral-history-adversarial-review.md:199)                                                                                                                                              | Unknown dates stay unknown; date-only is not an instant; age alone does not prove expiry. An ordinary view does not change lifecycle.                                       |
| [D35 accepted decision](../phase28-d35-referral-continuation-adversarial-review.md:15)                                                                                                                                                   | Continuation is deliberate, source-owned and initially Off for unconfigured missionary self-service. Staff rights remain independent.                                       |
| [D35 cycle/correction invariants](../phase28-d35-referral-continuation-adversarial-review.md:201) and [adverse states](../phase28-d35-referral-continuation-adversarial-review.md:278)                                                   | Same lineage; one successor; correction is a separate authorized owner action. Withdrawal/privacy loss cannot be relabeled expiry.                                          |
| [D36 accepted terms](../phase28-d36-configured-referral-period-adversarial-review.md:268) and [exact expiry](../phase28-d36-configured-referral-period-adversarial-review.md:313)                                                        | Continued timing remains source-acceptance based, with exact elapsed days and immutable accepted terms under ordinary edits.                                                |
| [D38 exact decision](../phase28-d38-separate-referral-periods-adversarial-review.md:14)                                                                                                                                                  | Two independent organization periods; source-defined kind; no overrides, silent copying, zero-as-Off or universal number.                                                   |
| [D38 C05–C06](../phase28-d38-separate-referral-periods-adversarial-review.md:262)                                                                                                                                                        | Initial clock and late-entry meaning were expressly unresolved. Unknown historical terms cannot be inferred from current policy. Accepted windows retain their evidence.    |
| [D38 C08–C11](../phase28-d38-separate-referral-periods-adversarial-review.md:282)                                                                                                                                                        | Fresh current authority, relevant-policy ordering, one source effect, structural safety and all-egress privacy remain binding.                                              |
| [Q39 original scope](../phase28-q39-initial-referral-clock-research.md:12) and [precision warning](../phase28-q39-initial-referral-clock-research.md:98)                                                                                 | Scenario had a known original date and no previous accepted window; reassignment is not reset. The review expressly must not invent midnight, timezone or historical terms. |
| [Platform principles](../../../../../openspec/specs/platform-principles/spec.md:13), [focus](../../../../../openspec/specs/platform-principles/spec.md:68), [manual glue](../../../../../openspec/specs/platform-principles/spec.md:121) | Truth and permission outrank convenience; focus missionary UI; do not create repeated staff reconciliation as the normal solution.                                          |
| [Platform boundaries](../../../../../openspec/specs/platform-boundaries/spec.md:93) and [ADR-0209](../../../../adr/0209-static-field-policies-and-subtract-only-projection.md:16)                                                        | CRM owns operational facts; static field policy plus one subtract-only conditional resolver governs projection.                                                             |

Fresh bounded searches of `packages/api/src/missionary-portal`,
`packages/api/src/crm`, `packages/api/src/admin/crm/relationships`,
`packages/database` and `supabase/migrations` for whole-word `referral`/`referred`,
`original_introduction` and `introduced_at` returned no matches. The inspected
[relationship service](../../../../../packages/api/src/admin/crm/relationships/service.ts:55)
reads donors, missionaries, profiles, pledges and care activity; its
[domain list](../../../../../packages/api/src/admin/crm/relationships/model.ts:13)
is not a qualified D39 referral source. An initial broader search included a
nonexistent `packages/database/src` path; the corrected search above used the
actual package root. Substring matches such as `preferred_contact` and unrelated
Eve expiry tables are not referral evidence. This is a bounded static observation,
not a claim that every repository path, deployed grant or runtime was inspected.

## Minimal policy selection that does not counterfeit history

Recommended exact amendment, expressly a product judgment for the reviewed
answer rather than an existing historical fact:

> **For a source-qualified first initial window with no earlier accepted window,
> the current New referral period at deliberate source acceptance SHALL be
> applied to the qualified original referral event. Preserve the applied policy
> revision, original event evidence and actual acceptance time separately. This
> is a new application of current policy; it SHALL NOT claim the same period was
> in force when the introduction occurred, backdate acceptance or grant access
> retrospectively. If the resulting endpoint has already passed, the initial
> outcome is expired and further active work requires the ordinary independently
> authorized continuation action.**

This matches D38's prospective acceptance model without introducing a historical
policy lookup engine or a second choice in every form. It needs clear explanatory
copy for late records: “The current new-referral period is measured from when the
referral was given to you.” Record time is not the anchor. A missing current New
value blocks only that dependent initial-window calculation; it does not invent
a period or block independently qualified Continued work.

Preservation takes precedence over this first-window rule:

> **A previously accepted source window SHALL retain its actual source terms,
> endpoint and lineage. A row arriving late, through import or through another
> transport SHALL not be treated as first-time merely because this table lacks
> it. Missing or contradictory prior-window evidence SHALL be reconciled by the
> source rather than inferred as absence. Imported facts do not become current
> work or disclosure authority merely on insertion.**

Applying an actually evidenced prior policy to a prior accepted window is
preservation. Guessing which old policy probably applied is not preservation.
Likewise, applying today's policy to a known first window is explicit new
acceptance, not retrospective reconstruction.

## Pre-clarification precision analysis

This section records the question exposed by the first review before the
founder's calendar-date selection. Its exact-instant initial formula and
provisional date-only restriction below are not the proposed final D39 behavior.

A source timestamp with an unambiguous offset/instant supports checked arithmetic
`E = O + N × 86,400 seconds`. This does not require asking a human for a timestamp
when a trusted source already knows it. `O` is the original referral event, not
when the referrer first met the supporter. Effective active work can begin only
after actual acceptance and current authorization, and only while trusted current
time is before `E`. The computed earlier interval does not prove that Core
authorized earlier activity.

Date-only input, missing timezone, a DST-fold local time without an offset, and an
unknown date do not identify one such `O`. There are three superficially tempting
but unsound shortcuts:

1. Parsing a date as UTC midnight fabricates an instant and shifts dates in other
   zones; choosing the browser zone on import adds another invented fact.
2. Requiring Maya to invent the exact time of an old conversation makes the form
   mathematically complete and the source less truthful.
3. Defaulting to save time gives old referrals a new clock, reversing Q39 A.

A transparent date-only calculation convention could be a valid **new product
amendment**, but it must explicitly name the calculation boundary and timezone,
keep original precision, explain that the time is a policy convention rather
than a remembered event, and reconcile D38/Q39's no-invention language. Start of
day and end of day have different usable periods and are not mere implementation
choices. Date-range/uncertainty engines add more complexity and are not necessary
for this decision.

Until such a convention is adopted, precise permanent minimum wording is:

> **Accept and preserve the factual original date at its actual precision; do
> not require invented precision to save an otherwise authorized source record.
> A missing or ambiguous original instant SHALL not be converted into an exact
> active window, Expired assertion or continuation entitlement. Show the honest
> timing-information state and the qualified next step. No guessed midnight,
> zone, current timestamp or automatic renewal is allowed. Independently
> authorized work remains independent.**

At that stage this was safe incomplete-data behavior, not a claim that forcing all date-only
referrals through staff is a good finished everyday flow. If ordinary manual
referrals are expected to be date-only, the product convention must be resolved
in this grill before initial-window activation; source qualification cannot
silently pick it later. Actual prevalence is unknown; no ministry interviews or
timing-precision census was performed in this review.

## Selected calendar-date clarification

The founder selected calendar-date deadlines for **all New referral windows**.
Continued windows keep D36's source-acceptance clock and exact elapsed-day
semantics. This explicitly amends D38's common elapsed-day language for New only;
it does not reinterpret already accepted windows or change the Continued field.
It also resolves the earlier ordinary date-only problem: a known original date
can support a deadline without requiring a remembered hour or minute.

The precise counting convention below is the parent's proposed reviewed
amendment, distinct from claiming that the founder separately chose every
arithmetic or timezone detail:

> **For New referrals, the original calendar date D counts as day one. The
> source applies the accepted positive whole-number period N through the
> calendar date D + N − 1, inclusive, in the organization policy timezone frozen
> for that window. The exclusive endpoint is the source-qualified start of
> calendar date D + N in that same timezone. At the endpoint the window is
> expired. This calendar rule applies to all newly accepted New windows,
> including those whose original source evidence includes an exact instant.
> Preserve the underlying evidence and its actual precision; a calculated
> deadline boundary is a policy fact, not an asserted introduction timestamp.**

`N = 1` therefore means through the original date, not through the next date.
This is a boundary example, not a proposed default duration. Late entry uses the
remaining calendar window or records an already expired outcome. It never adds
the full period to entry or import time. The UI can say **“Follow up through
[date] ([organization timezone])”** while retaining the exact endpoint for source
checks and clearly distinguishing Continued's date/time endpoint.

The P9 source contract must explicitly define how D is established from precise
source evidence and date-only assertions without silently converting a source
date in an unknown zone. For an exact instant, deriving its calendar date in the
accepted organization policy zone is deterministic. A day-only value retains
its actual day precision and the expressly reviewed calendar basis; the source
must not manufacture an event time to parse it. Unknown original dates remain
unknown and cannot create an initial endpoint. No new date override, clock-mode
switch, numeric default or per-missionary timezone setting is introduced.

The organization timezone and applied calendar rule must be part of accepted
policy evidence. Later timezone/configuration changes do not move that window's
accepted endpoint. Calendar addition must use dates and the zone's actual rules,
not `N × 86,400` seconds. The source must qualify midnight gaps, repeated boundary
times, skipped calendar dates, date overflow and unsupported zones against its
actual date library/database behavior. A silently normalized impossible date is
not source evidence. These are deterministic source-contract proof requirements,
not new tenant options.

Preserve previous accepted New windows with their original actual semantics even
when those were elapsed-time based. Migration and mixed-version clients cannot
reinterpret them as calendar windows; newly accepted windows need an explicit
semantic discriminator/equivalent source proof. This need not prescribe a new
table or additional user-facing field. Continued remains elapsed from its fresh
authoritative acceptance instant without change.

## Material concerns and exact prevention

Likelihood estimates are reasoned engineering judgments for an unamended
implementation, not measured incident rates. “High” severity indicates material
truth, work-loss or permission consequences; “Critical” indicates plausible
cross-tenant disclosure or mutation.

| Concern                                                                                      | Severity / likelihood and evidence                                                                                                                        | Decision effect and exact required prevention                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Late first record silently gets current timestamp as origin                                  | High / likely if a generic create timestamp is reused. Q39 A; P9 provenance. Old data becomes freshly eligible.                                           | Changes implementation, preserves A. **Original referral event, recording/ingestion time and source acceptance SHALL be distinct. Insertion, view, retry and import SHALL not reset origin.**                                                                                                              |
| Current policy is presented as historical policy                                             | High / plausible when the deadline is reconstructed. D38 C05–C06. The UI/audit would claim facts never observed.                                          | Narrows A with explicit first-acceptance rule above. **Apply current policy at first qualified acceptance; preserve its actual revision/time and never infer historical applicability. Preserve any prior accepted window instead.**                                                                       |
| Date-only evidence is fabricated as an exact event, or New and Continued arithmetic is mixed | High / likely in ordinary date form/parser reuse. D34 C05 and the founder-selected calendar clarification distinguish source facts from policy endpoints. | Changes New timing explicitly; preserves Continued. **Keep actual source precision. Apply the New calendar rule in its accepted organization zone; preserve Continued elapsed timing. Never present the computed endpoint convention as an exact introduction timestamp or reinterpret accepted windows.** |
| Late record backdates source acceptance and disclosure                                       | High / plausible. D34 C03 and current-authority rules. A computed past interval could be mistaken for historical authorization.                           | Narrows history/projection. **Retain actual acceptance time; computed historical dates do not establish earlier access or completed work. Historical belonging needs qualified recipient evidence and current history authority.**                                                                         |
| Reassignment/merge/reimport creates a second initial window                                  | High / plausible. P9 edge identity; Q39 line28; D35 C04/C12. People can bypass continuation by changing identity representation.                          | Changes lineage enforcement. **Source-defined lineage and prior-cycle identity survive reassignment, merge and import. Only a source-proved genuinely distinct introduction can receive separate initial treatment; a new row/owner is not that proof.**                                                   |
| Correcting a date doubles as an expiry override                                              | High / plausible. D38 C06 and D35 C12. An ordinary edit can lengthen permission-bearing work or erase prior history.                                      | Narrows mutation. **Factual correction SHALL be a separately authorized, versioned source command with evidence and explicit lifecycle consequences. It SHALL preserve the prior assertion, actual acceptance and later cycles; generic date/status PATCH and accidental renewal are forbidden.**          |
| Old policy previews or grant changes accepted after waits                                    | Critical for scope; High for wrong terms / plausible. D38 C08–C10. UI permission is stale and period choice races Save.                                   | Requires source transaction ordering. **At acceptance recheck current tenant, actor, exact lineage, responsibility, relevant New policy and restrictions after waits. A changed relevant basis needs refreshed permitted terms; an unrelated Continued edit alone does not invalidate a New action.**      |
| “Expired on save” is treated as error, lost record or refusal                                | Medium; privacy consequence High / plausible. D34 status meaning and D35 continuation. The user may alter facts to make the form succeed.                 | Changes UX. **Preserve the authorized record and show successful recording with its truthful expired outcome and eligible continuation action. Do not fail solely because the calculated initial window has already ended or imply donor refusal.**                                                        |
| Missing current New or prior-window evidence causes broad shutdown                           | Medium / plausible. D38 independent readiness. Staff lose unrelated qualified work and invent shortcuts.                                                  | Narrows blocking. **Only the dependent unqualified initial operation is unavailable. Ordinary record capture, separately authorized source work and qualified Continued paths keep their independent rules.**                                                                                              |
| A late accepted initial fact automatically sends, creates a task or changes coaching metrics | High / plausible if generic creation automation is reused. D35 C11; P28 owner constraints. Imported history creates unselected side effects.              | Changes integration behavior. **No outreach, contact consent, task, interaction credit, coaching sharing or retention extension follows solely from recording or calculating this initial window. Any separate effect needs its existing qualified source purpose.**                                       |
| Legacy/import rows gain safe-history entitlement from fake expiry                            | High / plausible. D34 C03/C06 and Q39 prior-window exclusion. A missing field can widen history data exposure.                                            | Requires migration proof. **Unknown expiry/recipient facts remain unknown; reconcile source facts and current projections before admission. No bulk default origin, endpoint, historical recipient or Active/Expired label is permitted.**                                                                 |

## Correction and assignment detail

An origin correction can change what is factually true and therefore cannot be
prohibited absolutely. It must be distinguishable from ordinary continuation.
The owner must preserve both assertions and attribution, require the applicable
correction capability, and describe whether any dependent initial endpoint is
being corrected. Using the accepted policy evidence avoids applying a new period
merely because a fact was corrected. A correction must not erase, replay or
silently reorder later accepted continuation cycles. A current legitimate
correction may change the currently truthful state only through that qualified
owner transition and current authorization; the UI must not synthesize it by
recalculating a displayed date.

Responsibility and introduction recipient must also stay distinct. Reassigning
the work does not assert that the referral happened again. D34 allows a source-
proved prior handoff recipient to qualify for history, but current reassignment
alone does not transfer someone else's private history. Multiple legitimate
referrals to the same Party remain source-distinct; name matching is not lineage
identity and does not justify merging expiry clocks.

## Falsifiable proof cases for the parent review

1. An original event entered late but before its calendar endpoint receives only
   the remaining window; it never receives `acceptance + New days`. With `N = 1`,
   the original date is the last permitted calendar date. An exact-source event
   uses the same New calendar rule as an admitted date-only event.
2. The same first record entered at or after `E` is recorded as a truthful expired
   initial outcome, with no momentary active disclosure. Qualified continuation
   is a separate deliberate effect using the Continued period.
3. An already accepted window arrives through import with a different current New
   period; its endpoint and applied evidence remain unchanged.
4. A first late record uses the policy actually accepted now and does not claim
   that policy existed when the introduction occurred. Concurrent policy changes
   are ordered and attributable.
5. A known original date plus a qualified organization calendar zone produces the
   proposed New endpoint while preserving day-only source precision. Unknown
   date, missing/unqualified calendar basis, impossible date and future asserted
   event never silently gain invented source facts or active work. Explicit
   fixtures cover DST folds/gaps, skipped dates and date overflow.
6. New calendar arithmetic and Continued elapsed arithmetic behave differently
   across 23/25-hour civil days as specified. Later organization/display-zone
   changes and clock rounding cannot change an accepted endpoint or turn
   `T = E` into active. Actual prior accepted elapsed New windows remain intact.
7. Reassignment, Party merge, duplicate import and a second transport key do not
   create another initial cycle or bypass the consumed-expired-cycle invariant.
8. A failed or lost response recovers the same current-permitted result; retries
   do not recompute policy or reopen later expired cycles.
9. Wrong-tenant, former-recipient, withdrawn, privacy-revoked and generic-date-
   patch attempts cannot grant active work or expired-history disclosure.
10. Qualified correction preserves original evidence and later cycles, uses its
    own authority and distinguishes factual repair from renewal.
11. Turning the existing missionary continuation setting Off blocks new actions
    under that grant without erasing dates/history, altering staff rights or
    preventing an otherwise valid restriction action because a date draft is bad.
12. Migration/restore includes retained accepted, date-only, unknown and duplicate
    source records; no fabricated initial history appears, and old clients cannot
    reset it through omitted fields or generic updates.

These are required future implementation proofs, not executed source tests.
The review is complete as a governance contribution; it does not claim empirical
usability, a fully qualified P9 producer or live authorization proof.
