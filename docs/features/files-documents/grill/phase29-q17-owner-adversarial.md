# Phase 29 Q17 A — fixed fresh-read end at source issuance

2026-10-21, Asia/Bangkok. **Conrad selected A: fix the fresh completed-read deadline at issuance.** Q01–Q16 and their complete amendments are ratified. The proposed Q17 amendments below await ratification; no numerical profile, repeat rule, Q18 decision, canonical edit or runtime activation is made here.

## Disposition and scope

**Accept with eight focused amendments that reuse Q08/Q16.** The change is one source-resolved finite end, including unused access. It should remove B's entry-window/activation machinery rather than add a deadline platform. The strongest alternative was bounded first entry followed by a finite reading period; it protects late arrivals better but requires another boundary and source transition. A accepts consumed opportunity during delivery/proof/technical delays. No measured study establishes the superior model or a suitable duration.

Local HEAD was freshly verified as `3d85897ebf1515008ef5c676b1c58a15422fb9ab`; Q16's canonical ADR now records full ratification. The parent's previously checked remote snapshot was `e2761135d2952426e15be7d56c1d9680aa7b8c15`. This pass did not refresh remote state or pull. Current exact Q08/Q11/Q14/Q16, ADR0025, P12 and platform/OpenSpec sections were read. No runtime, SQL/RLS, race, provider, browser/AT, numeric-duration experiment or user study was performed. No credentials/private records were inspected. This note is the only write.

Severity/likelihood are qualitative prospective consequences, not measured incidents. The clauses below supplement the inherited contracts; they are not another permission system.

## Eight incremental findings and exact amendments

### C01 — Resolve the actual finite end at the new fresh source act

**High severity / high likelihood.** An implementer can treat staff approval, token creation or the original source fulfillment as issuance, or keep an admitted grant waiting indefinitely for first entry. An omitted duration may silently become thirty days because nearby features use it.

**Required language:** A successful new Q08 source issuance MUST durably resolve and preserve its actual finite read end and the adopted timing/calculation/limit provenance with the qualified source effect. This is the new fresh completed-read admission, not the original request issuance, original fulfillment, ended ordinary period, draft, staff click, preliminary approval, credential, message/provider acceptance, first visit or later observation. Missing, invalid, nonfinite or already-ended proposed live terms MUST NOT become a guessed period. Q17 selects when the end is established; it does **not** select an elapsed-days formula, unit, magnitude, arbitrary staff date or editable deadline.

**Proof:** Actual successful source issuance has a determinate finite end even if unused. Unsupported/missing policy yields no live grant with an unresolved business clock. Caller/event/credential timestamps cannot supply a fallback. A failed/rolled-back attempt is not issuance; a proved historical admission whose response arrives after expiry remains historical, not a newly live grant.

### C02 — Qualify source occurrence, durable effect and currentness together

**Critical severity / medium likelihood.** A transaction-start or pre-wait timestamp may qualify authority that has ended by the actual source decision. Conversely, demanding a literal physical commit timestamp as the only event can falsely reject lawful source-linearized outcomes or introduce an unnecessary clock service.

**Required language:** The owning source/P12 mutation contract MUST establish the authoritative issuance occurrence, actual eligibility at its qualified effect boundary, current checks after relevant waits, finite end resolution and coherent durable effect/audit/follow-up outcome. A stored timestamp, clock function or eventual commit alone proves none of these. Do not equate source occurrence with physical commit time by assumption; qualify boundary-spanning commits and their lawful causal result. A stale prepared request or pre-wait permission snapshot cannot freeze authority. Providers remain outside source locks; existing owner-required fencing remains binding.

This reuses Q08-C08 and Q11's established source-event distinction; it does not prescribe a new schema, isolation mode or lock framework. Supported precision and time representation must be explicit at qualification, with no client-local-string comparisons or invented positive gap.

**Proof:** Lock wait versus issuer loss, recipient change, true cap and restriction outcomes have a valid source-ordered result. Ordinary time advancing under unchanged approved terms does not force another confirmation. A late/unknown response is reconciled against the actual admitted effect; neither response time nor current time manufactures eligibility or a new end.

### C03 — Unused access shares the same end; remove first-entry mechanics

**High severity / medium likelihood.** Retaining B's enter-by/activation fields or starting on a successful file render would contradict A and mishandle status-only permissions. Failed proof, preview, mail or a new device could accidentally start/restart the clock.

**Required language:** The admitted end MUST bound never-entered and entered access alike. This standard model MUST NOT introduce an enter-by substage, first-entry business activation, first-download trigger, pause, grace or activity reset. Delayed delivery/discovery, failed proof, representation preparation, partial reads, new credentials, device changes and repeated visits leave the source terms unchanged. Current confirmation, technical entry and representation readiness remain required and separate; scanner GET/HEAD and passive traffic remain inert under ADR0025.

No extra Start access button, account, confirmation or per-file timer follows. Independent source/worker preparation is governed by its own authority; it does not require an open recipient browser or extend the recipient grant.

**Proof:** Never-entered, status-only, prompt/late entry, new device, renderer unavailable and proof-recovery cases preserve the same admitted end. An unavailable representation does not become source expiry or permission to issue another period. Static unsupported handoff cohorts remain unqualified rather than being described as usable.

### C04 — Recover the same effect before calculation; preserve historical versus current truth

**Critical severity / medium likelihood.** Recalculating on retry can lengthen the grant; comparing regenerated issue/end output as material input can reject safe recovery. Returning the newest grant for an older intent can falsely announce current access. A missing deadline in a response may become an ordinary pending-activation state.

**Required language:** Before new timing calculation, recover an already admitted matching deliberate Q08 intent and its exact original end/provenance under current disclosure. Issuance occurrence and calculated end are immutable effect outputs, not regenerated review-intent fields. Bind actual historical admission, recipient/scope, adopted policy and material reviewed terms; incompatible material input conflicts without automatically creating another intent. New transport IDs, changed defaults, resends and technical recovery MUST NOT reset the end. Unknown commitment or result lookup requires reconciliation, not absence inference or a second issuance.

Successful issuance requires a stored resolved end. An end temporarily unreadable to the caller is uncertainty/error or a disclosure restriction, not a selected business state waiting for the recipient. Preserve the initial issued result and later actual restrictions; an old replay is not current usability or delivery evidence. Separate deliberate repeat eligibility remains subject to the future Q08 policy, not Q15 by analogy.

**Proof:** Retry after wall-clock/policy movement returns the first exact effect; changed root/scope intent does not. Lost reply, post-commit error or different transport key cannot create a new period. A replay after expiry/revocation returns only permitted historical/current facts without falsely announcing that the recipient can now continue.

### C05 — Fixed is a ceiling, not an entitlement or a universal minimum of dates

**Critical severity / medium likelihood.** A fixed end can be treated as guaranteed access despite a later restriction, or recomputed later after an earlier cap clears. Taking the minimum of every technical/retention/member date can also close unrelated permitted reading. The old ordinary completed end could accidentally make every new grant already expired.

**Required language:** Resolve the fresh actual end under genuinely applicable source/purpose/overall bounds and preserve that admitted result. Later genuine authority shortening remains binding; removing/loosening its cause does not silently lengthen that same admission. Current revocation, recipient/purpose/content-use restrictions and disposition retain their scoped effects. Qualified temporary representation failure or explicitly reversible owner restrictions may recover only under unchanged still-valid authority and its existing effective end; they are not automatically permanent revocation.

An old period's ordinary elapsed end is historical evidence for fresh consideration, not itself an ongoing cap on the new grant. Genuine adverse/purpose/overall limits are not thereby bypassed. Item/action, credential/session, worker and retention limits retain their own scope instead of becoming one indiscriminate whole-grant minimum. No minimum usable interval, grace, extension right, retention change or source-lifetime cap is selected.

**Proof:** Old ordinary expiry does not clip a lawful new decision into the past. Genuine coincident hard limits and later shortening cannot be removed to recover a longer same-grant end. One file becoming unavailable does not end separately authorized status/other-file actions. Current per-door/chunk expiry and feasible restriction termination follow Q04/P12; no delivered-byte recall is promised.

### C06 — Keep the scope and business lifecycle unchanged

**Critical severity / medium likelihood.** Copying the unfinished fixed-clock implementation could add another completion transition, restart Q07, import original requirement scope or apply Q15's repeat/cardinality rules. A new clock might be used to revive a disposed file or later version.

**Required language:** Preserve Q16's exact lawful completion-established member/submitted-original-version/action/context ceiling, current eligibility and deliberately reviewed subset for both origins. Status-only remains status-only; nonuse is not absent historical permission. Qualified new rendition revisions of the same admitted original remain possible under their owners without adding original members/versions or actions. The source request is already completed: no new fulfillment event, unfinished-to-completed stage, F-plus-default period, intake/correction, later-file membership, historical-byte archive or request reopening follows.

Q08's current issuer administration/live assignable ceiling and actual continuing dependencies, current recipient proof, same-tenant data/RLS/service boundaries, every-door private serving and independent custody/retention remain binding. An expired recipient grant need not authorize the staff decision. No new capability role or generic admin bypass is created by choosing a clock.

**Proof:** Both Q16 origins and metadata-only scope use the same model without widening. Completion/retention facts stay unchanged. Original-download and preview rights remain independent. No Q14 numeric period, Q15 no-count-cap/nonoverlap rule or automatic third stage appears in the read-only lane.

### C07 — Show one meaningful reviewed rule and one actual result

**High severity / medium likelihood.** Staff may promise a full interval to a late entrant, show an estimate as an admitted end or require endless reconfirmation as time moves. A green issuance result can hide failed handoff, missing proof or already-ended current access.

**Required language:** Reuse Q08's existing **Grant read access** review/action and completed-request context. Before issuance show the adopted standard terms, exact reviewed scope and known controlling bounds; label estimates. After confirmed issuance show the actual relevant end with appropriate localized date/time/zone precision and truthful current operation/access state. Ordinary time movement under unchanged reviewed terms does not require another confirmation; material changes still require refreshed review.

Do not promise the full selected future interval on late arrival, guaranteed delivery, or current usability merely because a grant committed. Status-only permission must not promise files. Use existing accessible proof/focus/status, safe neutral help and low-bandwidth recovery without a date picker, countdown-only meaning, origin selector, extra account, routine reason form, second approver or new portal. Genuine failure stays distinct from rejection, expiry and unknown commitment. No protected deadline/request facts are exposed through an unqualified public link.

**Proof:** Staff see one real result; late recipients see actual remaining terms and current allowed actions. Missing/unreadable end is handled truthfully. Recipient, staff and support can distinguish issued, expired, revoked, proof failure, representation failure and unknown effect. Composed accessibility and meaningful supported opportunity remain future qualification requirements; no count is chosen as a substitute for that evidence.

### C08 — Specialize the clock reservation and keep the unresolved policy gates explicit

**High severity / high likelihood of policy drift.** A blanket statement that Q08 is now complete would invent its duration and repeat policy; unchanged conditional wording could retain B's business-activation state beside A. Reusing a previous thirty-day timeout experiment would also falsely assume the new duration.

**Required language:** Explicitly specialize Q08-C06's fresh clock/unused model, C07/P17's end-resolution/display language and the corresponding Q16-C06/C08 references: successful fresh source issuance now resolves the end, and unused access shares it; proof/usability/delivery remain separate. Preserve Q16's earlier eligibility successor and all other applicable Q08 safeguards. The complete numerical calculation/profile, remaining repeat/cumulative/overlap behavior, exact native mapping and qualification remain open before activation. No 14/30/60-day value, elapsed-day formula, calendar treatment, staff-editable date, automatic renewal or other lane's policy is inferred.

Adopt prospectively through canonical owner sources and declared projections at the authorized publication stage; preserve dated history and old admitted terms. Compatible migration/restore must preserve original effects and current adverse facts; missing legacy provenance cannot become a default end. Reuse existing bounded source checks/durable follow-up and P12 fences/budgets, not a resident-timer authority, full-history scan, extra scheduler or second write authority. The future duration must be checked against actual platform limits once selected; Q17 alone does not establish a Node timer overflow.

**Proof:** Current policy/status text closes only the model/unused question and keeps numerical/repeat gates explicit. No first-entry mechanism remains in the prospective standard. Both origins preserve exact effects across versions/restores. A source cannot activate issuance with missing full timing/repeat/type policy. Structural/arithmetic or adjacent test evidence is not reported as native readiness.

## Proposed corrected meaning

For each lawfully admitted Q08 fresh completed-read effect, establish and durably preserve its actual finite read end at the qualified new source issuance under the fully adopted timing terms and genuine limits. The same end governs unused access. First entry, delivery/proof/representation recovery, activity and retry neither begin a second period nor move that end. Same-intent recovery precedes recalculation, while current restrictions and later genuine shortening remain binding at their actual scope.

Keep Q16's exact historical ceiling, current issuer/recipient/source authority and Q08's read-only lifecycle unchanged. The recipient's proof, usability, representation and notification remain separate from source issuance. Use one existing staff action and one truthful localized end; no first-entry stage or new framework is needed. The actual numerical profile and Q08 repetition/cumulative/overlap policy remain unselected and block activation until resolved and qualified.

## Primary owner evidence and exact mappings

Paths are relative to `/home/conrad/code/core`.

| Source                                                                                                      | Governing evidence                                                                                                                                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/features/files-documents/grill/phase29-q17-question.md:10–32,78–114,126–136`                          | Selected A fixes end at issuance, including unused access; numbers, calculation profile, repeat policy and runtime activation were not selected.                                                                                                                 |
| `docs/features/files-documents/grill/phase29-q08-adversarial-review.md:382–390`                             | C06 complete policy gate; C07 meaningful reviewed timing/end when resolved; C08 qualified durable source mutation; C09 stable semantic outputs; C10 communication separation; C11 data facts; C12 private current reads; C13/C14 simple truthful UX.             |
| Same review:632–640                                                                                         | P14 missing policy/currentness gate; P15/P16 exact serving/representation; P17 end resolution without endless reconfirmation; P19–P22 actual states, independent communications and unchanged historical/retention facts.                                        |
| `docs/features/files-documents/docs/adr/0016-fresh-read-recovery-both-completed-routes.md:45–76,81–92`      | Current fully ratified scope/expiry/recovery, exact administration/proof, effect semantics, shared UI and remaining Q08 clock/profile gates.                                                                                                                     |
| `docs/features/files-documents/docs/adr/0011-fixed-unfinished-deadline-at-source-issuance.md:19–37,45–59`   | Compatible fixed-at-issuance pattern explicitly distinguishes end-establishment from a numerical formula, source effect outputs from intent, source occurrence from physical commit, and failed proof from failed issuance. It is not already authority for Q08. |
| `docs/features/files-documents/docs/adr/0014-thirty-day-fresh-unfinished-access.md:19–39,57–79`             | Fresh unfinished numeric/unused model and resolved-end specialization are scoped to Q13. Useful pattern, not Q08 duration or lifecycle authority.                                                                                                                |
| `docs/adr/0025-producer-owned-protected-actions.md:28–50,74–92`                                             | Producer owns protected action/expiry; presentation and credentials cannot widen it; fixed host/current checks and inert GET/HEAD; technical entry is not another business issuance.                                                                             |
| `docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1542–1548,1645–1648,1670–1672` | Sole capability PDP, scoped R6 governed-read budget, tiered metering and per-chunk expiry, exact administrative live ceiling/continuing dependencies and sole grant mutation fencing. Do not replace or globally broaden these.                                  |
| `openspec/specs/platform-boundaries/spec.md:13–35`; `openspec/project.md:6–19`                              | Shared source convergence rather than app-specific timing forks; explicit intended-owner successors versus actual implementation; generated projections are not independent authority.                                                                           |

The source/reference table does not claim all specialized owners or native consumers were re-audited. Q08/Q16's broader existing qualification remains required. Earlier Q14 timer arithmetic was specific to720hours; no such Q17 numerical experiment or result exists yet.

## Independent 22-category check

| #   | Category                               | Incremental concern / applicable control                                                                                                |
| --- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Problem validity / alternatives        | One end favors clarity; bounded entry better protects delayed discovery. A's opportunity cost is real and unmeasured; C03/C07/C08.      |
| 2   | Brittleness                            | Wrong event, string/date semantics or assumed number; C01/C02/C08.                                                                      |
| 3   | Technical debt                         | Copying another lane or per-app calculator creates drift; inherit one Q08 source path, C06/C08.                                         |
| 4   | Edge cases                             | Never-entered, post-wait restriction, same-effect replay, status-only and already-expired historical response; C01–C07.                 |
| 5   | Footguns                               | Resend, first render, changed defaults or new transport key extends time; C03/C04.                                                      |
| 6   | Tenant safety                          | End/context must stay bound to exact source/recipient lineage; inherited Q08/P12 and C02/C06.                                           |
| 7   | Database / RLS / authorization         | Trusted finite outputs, current post-wait source checks and sole mutation/old-new-row paths; C02/C04/C06.                               |
| 8   | Overengineering                        | No entry stage, deadline editor, new grant type, clock service or timer framework; C03/C07/C08.                                         |
| 9   | UX/UI friction                         | Estimate/full-period/green-success misrepresentation, pointless reconfirmation or countdown-only meaning; C07.                          |
| 10  | Source of truth / invariants           | Exact admitted end and qualified source occurrence, later restrictions distinct from original output; C01/C02/C05.                      |
| 11  | Hidden coupling                        | Token/mail/proof/render/retention clocks do not establish source lifetime; C03/C05/C06.                                                 |
| 12  | Failure modes                          | Unknown effect/end cannot become activation-pending forever, absent grant or a retry-created period; C01/C04/C07.                       |
| 13  | Lifecycle / time / races / idempotency | Post-wait source qualification, expiry/shortening/current serving and exact original replay; C02/C04/C05.                               |
| 14  | Data integrity                         | Old ends/history must not be overwritten by new terms or late observations; C04/C06/C08.                                                |
| 15  | Security / privacy                     | Fixed end is no guarantee; per-door/chunk checks, current proof and scoped metadata remain; C05–C07.                                    |
| 16  | Scalability / performance              | Existing source checks and bounded wakes rather than timer correctness/full scans; scoped R6/fences preserved; C08.                     |
| 17  | Operational burden                     | Lost opportunity cannot be repaired by hidden reissue/date/clone bypass; useful owned help/current diagnostics, C04/C07.                |
| 18  | Observability / audit                  | Record actual source effect/end/policy and separate delivery/current states, not sensitive raw documents; inherited Q08 and C01/C04.    |
| 19  | Dependencies / integrations            | Provider/token/worker cannot become source clock; no new dependency or generic Workflow default; C02/C03/C08.                           |
| 20  | Migration / rollout                    | Prospective exact model, compatible versions, preserved adverse state and no guessed ends; C08.                                         |
| 21  | Testability / traceability             | Specialize named model/display clauses only; real native proof still required, no numerical test invented; C08.                         |
| 22  | Other hazards                          | No new money, public sharing, notifications, retention, file editing or source completion capability needed. C06/C08 retain exclusions. |

## Minimal follow-through and limits

No new glossary term is necessary. Do not silently broaden the existing glossary's original Document Request Access Issuance definition to mean every fresh effect; ordinary prose “fresh source issuance” suffices here. After full-package ratification, update current-status/model assertions and the exact Q08/Q16 conditional-end specialization, retaining dated provenance and all other gates.

Next choose one complete numerical profile for A, then resolve Q08's remaining repeat/cumulative/overlap policy. Those decisions are not made by this note. Formal owner/OpenSpec publication and ticket publication remain separate stages. Native source/data/serving, boundary races, supported-cohort usability and browser/AT proof are still absent; a source review and a fixed-end declaration do not establish them.
