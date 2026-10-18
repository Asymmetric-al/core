# D38 governance and owner-boundary evidence

Reviewed October 18, 2026 against repository
`9cada8f3d8ab59db391d3fd20df77fcadeb09813` and the current research tree.
This is an independent, research-only review of the founder's Q38 answer **B —
separate organization-set periods**. No application, schema, formal specification,
ticket, live setting or older verification program was changed or executed.

## Recommendation

**Accept with required amendments.** Two plainly labelled organization-wide
values satisfy the selected flexibility without a policy builder. Keep the
continued-period semantics already ratified in D36. Add an independently
configured initial period through its qualified native referral owner. Equal
values are valid; equality must not create automatic synchronization between
fields. No same/different mode switch, per-missionary override, per-referral date
picker, calendar service or second settings hierarchy is needed.

The B selection resolves configuration scope. It does not itself establish the
initial clock's authoritative start event, a default number, a universal maximum,
a deployed producer, or permission to erase the distinction between an old
introduction and a newly accepted continuation. State that limit precisely.

## Authority inspected

| Source                                                                                                                                                                                                               | Finding and exact consequence                                                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Founder brief](../phase28-founder-brief.md:21), especially lines 23–31                                                                                                                                              | Research/grill only; no PRD/OpenSpec/tickets or implementation. Resolve engineering details from evidence and ask genuine product choices one at a time.                                                           |
| [Founder referral coverage](../phase28-founder-brief.md:135)                                                                                                                                                         | Source provenance, chains, ownership, expiry and deliberate continuation are required. Referral/stage work never grants contact permission.                                                                        |
| [Document authority](../../../../ai/document-authority.md:9), [OpenSpec current/intended](../../../../../openspec/project.md:6)                                                                                      | Exact later ratified scope governs intent; current code separately establishes existing behavior. A consumer cannot silently acquire source authority.                                                             |
| [ADR-0001](../../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md:60)                                                                                                                                   | Native Asym owns CRM identity, graph and history; no external CRM or vendor timer may become authority.                                                                                                            |
| [CRM Core](../../../../../openspec/specs/crm-core/spec.md:14), [surface boundary](../../../../../openspec/specs/crm-core/spec.md:114)                                                                                | `packages/api` is the business boundary; Mission Control owns staff CRM while missionary views remain scoped consumers.                                                                                            |
| [Platform boundaries](../../../../../openspec/specs/platform-boundaries/spec.md:13)                                                                                                                                  | Shared behavior converges; do not duplicate initial/continued calculation in app-local code. CMS and Sites do not own operational lifecycle.                                                                       |
| [P9 A4](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:353)                                                                                                                       | Canonical tenant-scoped, time-bound graph edge/history; a second referral store or overwritten original edge is not authorized.                                                                                    |
| [P9 A17](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:581)                                                                                                                      | Native mutation, required audit and activity share one transaction. Minimal source change correlation is allowed; generic CRM command/provider journal is expressly excluded.                                      |
| [P28 owner constraint](../../../../prds/program-roadmap/owner-constraints.md:81)                                                                                                                                     | Referrals are native P9 graph edges with expiry/source reporting. This source does not specify an initial clock or a number of days.                                                                               |
| [Ordinary P28 access boundary](../../../../prds/program-roadmap/owner-constraints.md:143)                                                                                                                            | Active supporter/referral relationship is the ordinary Party-enumeration basis. D34's narrow ratified expired-history purpose must remain explicit.                                                                |
| [P12 spine](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1540), [current context](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552)     | Capabilities/current trusted tenant context, not role names, determine settings and actions. Saving a number grants nothing.                                                                                       |
| [P12 tenant/epoch/RLS](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1584)                                                                                                      | Tenant constraints, current authority/revocation and coarse RLS are separate requirements; period lookup is not a replacement PDP.                                                                                 |
| [P27 independent work](../../../../prds/sitestacker-parity/phase-27-donor-development/partnerships.md:15), [deliberate admission](../../../../prds/sitestacker-parity/phase-27-donor-development/partnerships.md:69) | Useful qualified referral work can precede a Ministry Assignment; never create a dummy ministry/enrollment. A referral/import alone cannot open cultivation.                                                       |
| [D34 exact decision](../phase28-d34-expired-referral-history-adversarial-review.md:14)                                                                                                                               | Expired history is a limited read purpose, not active contact/context access or a fresh period. Withdrawal/privacy revocation are different from ordinary expiry.                                                  |
| [D35 exact decision](../phase28-d35-referral-continuation-adversarial-review.md:15)                                                                                                                                  | Optional missionary continuation, initially Off; staff authority independent; accepted work/history preserved on Off; deliberate exact-cycle action and recovery.                                                  |
| [D36 exact decision](../phase28-d36-configured-referral-period-adversarial-review.md:16), [C01–C04](../phase28-d36-configured-referral-period-adversarial-review.md:231)                                             | Continued period: organization-wide positive whole elapsed days, one day = 86,400 seconds; same ordinary staff/missionary terms; source acceptance clock; no default invented. Initial period explicitly excluded. |
| [D36 C05–C11](../phase28-d36-configured-referral-period-adversarial-review.md:268)                                                                                                                                   | Preserve accepted endpoint/policy evidence; prospective edits; ordered current checks; exact-cycle recovery; precise expiry; distinct grants/retention/source caps.                                                |
| [D36 C12–C17](../phase28-d36-configured-referral-period-adversarial-review.md:329)                                                                                                                                   | Structural integrity, RLS/privileged parity, classified current disclosure, shared UI, localization and source ownership remain obligations.                                                                       |
| [Q38 original scope](q38-before-answer.txt:31), [unselected initial anchor](q38-before-answer.txt:80)                                                                                                                | Asked one versus two settings only. Do not retroactively represent B as a founder choice of initial clock or migration algorithm.                                                                                  |

Root AGENTS.md was read. Its exact Base UI/base-maia, native CRM ownership,
permission-first, current-versus-intended and documentation-only structural
verification instructions apply. The session's D34–D37 ratification records and
Q38 branch were read; no older decision is implicitly reratified here.

## Current behavior versus intended behavior

Fresh bounded searches covered referral/referred-by terms in current CRM
OpenSpec/active changes, P9/P12/P27 documents, `packages/api/src` and
`supabase/migrations`. They found relevant planning relationships and P27 source
boundaries, but did **not** establish an implemented initial/continued referral
period producer. This is not a repository-wide absence claim or deployment audit.

Fresh reads verify these concrete reuse hazards:

- [Current organization settings](../../../../../packages/api/src/admin/org-settings.ts:9)
  uses a fixed tenant id for its existing post-visibility setting. Its PATCH has
  an explicit admin/super-admin gate at line 53 and fixed-tenant update at line
  69, but no D38 policy revision or combined source/audit acceptance. This proves
  that handler is unsuitable for reuse unchanged, not a tested production exploit.
- [Current donor editing](../../../../../packages/api/src/missionary-portal/donor.ts:25)
  exposes general statuses; its mutation at line 174 includes tenant/profile
  and anonymity predicates. Those positive checks do not make a donor status a
  referral lineage/cycle or qualify expiry calculation.
- [Current task input](../../../../../packages/api/src/missionary-portal/task.ts:25)
  accepts a caller-supplied due date; its write at line 81 and later result fetch
  are separate. A task deadline cannot substitute for referral expiry; failed
  readback must not manufacture a new continuation.

**Intended permanent path:** one qualified native referral/policy command family
with an explicit initial-versus-continued discriminator and two tenant values;
one shared temporal implementation where semantics match; attributable accepted
terms; P12-authorized staff configuration; small missionary projection. No new
runtime readiness is claimed by this documentation review.

## Material concerns and exact prevention language

Severity/likelihood describe the consequence **if protection is omitted**, not
observed production incidence. Each concern narrows B; none requires returning
to A.

| ID  | What can go wrong and why it matters                                                                                                                              | Severity / likelihood                             | Evidence, permanent fix and exact language to carry forward                                                                                                                                                                                                                                                                                                                                                                                                            |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G01 | B silently changes D36's continued terms or imports a staff override, creating inconsistent dates by actor.                                                       | High / plausible                                  | D36 lines 16–29, 231–238. **“Keep one continued-referral period for all ordinary independently authorized staff and permitted missionary continuations. D38 adds a separate initial-referral period; it does not change D36's continued-window clock, unit, actor semantics or accepted history.”**                                                                                                                                                                    |
| G02 | A UI toggle or blank/zero period means Never, or Off retroactively ends all work; users lose access unpredictably or acquire indefinite access.                   | High / plausible                                  | D35 lines 38–43; D36 C02/C03/C11. **“Disabling missionary continuation blocks only future missionary acceptance. Current permission administration may independently disable eligible source actions. Neither operation erases accepted periods, disables expiry enforcement, creates an indefinite duration, revokes unrelated access or removes lawful history.”**                                                                                                   |
| G03 | Old introductions imported/recorded today receive a fresh active window without a deliberate current action, bypassing expiry and possibly exposing contact data. | High / plausible                                  | Q38 explicitly leaves anchor open; P9 source history; D35 source-cycle rules. **“Initial acceptance must use a source-qualified initial start event, preserving original introduction, recorded/accepted time and provenance as distinct facts. Import time, page load, ordinary edit or migration time shall not silently become the initial start. An already expired introduction requires the ordinary qualified continuation path for new active work.”**         |
| G04 | An unknown initial date is guessed, or engineers conflate event time with recorded time; opposite implementations both appear compliant.                          | High / likely without an explicit source contract | No inspected owner defines initial clock. **“Before initial-window activation, the P9 owner shall publish and test the exact initial event/clock, accepted date precision, current eligibility, late-recorded/date-only/unknown introduction treatment, and lawful legacy mapping. Missing facts shall not be fabricated or silently obtain Active status.”** This is a named qualification gate, not a hidden default.                                                |
| G05 | Having two fields creates implicit linking, a new mode, copies changes into the other field, or wrong discriminator uses continued duration for initial work.     | Medium / plausible                                | Selected B; D36 shared unit. **“Expose two directly labelled independent values: New referrals and Continued referrals. Equal values are valid. Editing one does not edit the other. Persist and audit which purpose's value was applied; do not infer purpose from equality, last-edited field or display labels.”**                                                                                                                                                  |
| G06 | Unset initial value disables valid continuation, or unset continued value prevents new referral work; one invalid draft prevents Off.                             | Medium / plausible                                | D36 C02/C03 limits dependencies. **“Validate and gate only the source action dependent on the missing/unqualified period. Preserve independently valid configured work. Off remains available regardless of unrelated invalid numeric drafts. Saving one field shall not silently initialize the other.”**                                                                                                                                                             |
| G07 | Existing end dates are recomputed under new settings or migration blindly copies the continued value into initial policy.                                         | High / plausible                                  | D36 C05/C06; Q38 lines 87–93. **“Prospective policy changes preserve accepted starts, ends, duration and source/policy evidence. Retain existing explicit qualified initial and continued values independently. A migrated value must preserve documented semantics; never infer initial policy from the presence of a continued setting.”**                                                                                                                           |
| G08 | Concurrent admin edits overwrite each other, or policy A→B→A resurrects stale acceptance; revision design overcouples unrelated periods.                          | High / plausible                                  | D36 C06–C09. **“Use expected authoritative revision for settings and ordered relevant-policy checks at source acceptance. Reject silent lost updates; recover the original save/outcome after lost responses. A command shall depend on its relevant period and common authority, not an unrelated period draft.”** A whole-policy storage revision may be used, but conflicts should retain the user's draft and identify relevant changes; no schema is frozen here. |
| G09 | Settings manager acquires continuation, a missionary caller supplies tenant/actor/end, or privileged handler bypasses source policy.                              | High / plausible on legacy reuse                  | P12 spine/current context and actual fixed-tenant settings handler. **“Derive tenant, actor, assignment, capabilities and attribution from current trusted context. Settings management, initial-source action, continuation and read permissions remain separately enforced. Caller values cannot author accepted start/end, source lineage or policy evidence.”**                                                                                                    |
| G10 | Referral window doubles as retention/contact/grant expiry or a new active cycle silently restores private historical context.                                     | High / plausible                                  | D34/D35/D36 C11; P12. **“An active follow-up window is not contact permission, a retention extension, cultivation admission or a grant. Resolve current disclosure independently at every result/list/export/recovery boundary; preserve source restrictions and erased-body disposition.”**                                                                                                                                                                           |
| G11 | Generic settings JSON/raw row PATCH permits cross-tenant links, null or infinite endpoints, policy deletion cascading away historical evidence.                   | High / plausible                                  | Native graph and D36 C12/C13. **“Enforce tenant-aware relationships, purpose-discriminated valid finite terms, required non-null identity/provenance and protected accepted fields through the source boundary and structural constraints. Policy replacement/deletion shall not delete accepted history; raw or privileged paths obey the same invariants.”**                                                                                                         |
| G12 | Review claims B is a proven ministry norm, or documentation is treated as source qualification and shipped through legacy routes.                                 | Medium / plausible                                | Document authority and bounded current-code evidence. **“Record B as the founder's flexibility choice. Keep public vendor behavior, product judgment, planning acceptance, implementation and deployment qualification distinct. Two settings alone do not prove a safe initial referral producer.”**                                                                                                                                                                  |

No direct financial mutation or new transport/vendor dependency is introduced by
B. Money precision, ledger conservation, gift attribution, payment APIs and donor
checkout are unchanged. A settings page must not accumulate those unrelated
concerns or create donor-facing configuration friction.

## Initial-clock branch: avoid an invented answer

Three dates must never be collapsed: the historical introduction event, Core's
recording/acceptance time, and the current work cycle's accepted start/end. D36
already resolves the latter for continued cycles. A newly entered referral may
also be an old introduction; importing it does not prove fresh introduction or
renewed permission.

A source contract may legitimately define initial work from a qualified event or
from a clearly deliberate fresh-work acceptance while retaining introduction
provenance. The user selected neither in Q38. The review must not pick one by
silently writing “created_at + N.” If the owner contract remains absent, the
initial branch cannot activate until its exact supported behavior is reconciled;
that does not prevent recording the independently clear two-period decision or
implementing other qualified work later. If the remaining initial clock changes
what Maya expects the product to do, it is a suitable next one-at-a-time product
question after this answer is reviewed, rather than a hidden engineering guess.

Date-only historical introductions require an explicit source precision rule,
not guessed midnight or the reporter's current travel timezone. Unknown facts
need a source-defined truthful state/path rather than a guessed expiry or a new
unnecessary approval queue. Current restrictions may block action earlier than a
valid work endpoint; a shorter permission grant must not rewrite the source end.

## Minimal whole journey implied by the owner boundaries

1. **Staff discovers one settings section:** “Referral follow-up periods.” Two
   numeric fields with a persistent “days” unit, saved-state display and concise
   helper text. The initial helper must name its qualified start event; the
   continued helper states it begins when continuation is accepted. State
   “Changes apply to future accepted windows; current end dates stay the same.”
2. **Staff configures only valid relevant values:** preserve an existing explicit
   qualified number; otherwise require a deliberate positive finite value.
   No prefilled industry number is justified by repository evidence. Permit the
   same number in both fields without an extra switch.
3. **Staff controls participation using existing authority:** retain D35's one
   “Allow missionaries to continue expired referrals” control and ordinary P12
   grants. Do not bury Off behind validating an unsaved numeric form. Saving
   duration does not enable the action.
4. **Maya sees work, not policy administration:** show the applicable accepted end
   date/time/zone on the ordinary referral view. No choice between policy types,
   date input, source mode or duplicate setup step. Deliberate Continue remains
   contextual with estimated terms before acceptance and actual terms after.
5. **Existing data or failure:** preserve current known end; disclose changed
   terms before consequential acceptance; recover uncertain results without new
   cycles. Helpful messages identify the next authorized actor without exposing
   hidden records or implying that a blank setting equals Never.

These are design recommendations, not tested usability findings. Shared
Base UI/base-maia and semantic Zinc tokens remain mandatory; the UX researcher
owns detailed primary design evidence and accessibility scenarios.

## Synthesis and owner outputs

**Before recording the reviewed answer:** make explicit that D38 selects B and
adds initial configuration scope while preserving D36's continued semantics;
state the unselected initial-clock boundary; define Off precisely; remove any
suggestion of linked values, automatic duration defaults or retrospective edits.

**Capture in the eventual authorized owner specification/design:** the two
independent policy purposes; relevant-only prerequisites; exact initial-clock
contract and import/unknown/date-only treatment; accepted-term provenance;
prospective migration; authority/disclosure boundaries; clear field/action
labels and feedback. P9/API owns source/policy semantics, P12 owns authority and
projection, P28 owns presentation. Existing settings authority must be identified
rather than creating a new permission hierarchy by shorthand.

**Require implementation safeguards before activation:** source/policy/authority
ordering, semantic idempotency, tenant-aware constraints and protected fields,
actual ACL/RLS/privileged-path qualification, endpoint precision/range proof,
no silent fallback between periods, faithful mixed-version migration and
production-shaped tests. The P9/API owner supplies the exact producer and temporal
proof; P12 supplies current access proof; release engineering supplies mixed-
version/backfill/rollback proof. Retained evidence survives a feature rollback.

**Monitor only after proof, never in place of it:** UX/product owner records any
observed test participant who thinks saving a period enables continuation,
changes existing deadlines or removes contact restrictions; threshold **one
observed misunderstanding** triggers copy/flow correction and another scoped
comprehension check before enabling the affected cohort. The release/P9 owner
monitors **any accepted cycle with wrong purpose policy or rewritten prior end**;
threshold **one** triggers stopping new affected acceptances, preserving prior
truth and diagnosis/correction through the source owner. These are proposed
operational triggers, not claims of installed telemetry or a measured defect rate.
