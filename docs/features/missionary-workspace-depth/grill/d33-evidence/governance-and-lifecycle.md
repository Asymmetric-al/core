# D33 governance and lifecycle evidence

Reviewed **October 18, 2026 UTC** against repository
`9cada8f3d8ab59db391d3fd20df77fcadeb09813` and the current working tree.
This is a research/grill evidence note. The founder selected optional missionary
reporting of actual offline gifts, with an organization control that starts
**Off**. The detailed amendments recommended here are not separately ratified
by that selection, implemented, or runtime-qualified. No prior evidence or
formal owner specification was changed.

## Conclusion and exact scope

**Accept with required amendments.** Extend the existing P15 operational-intake
consumer to a bounded, currently authorized missionary actor. Reuse the same
intake identity, continuation, handling, correction and financial lineage.
The new organization setting controls admission of **new missionary reports**.
It does not disable finance, erase reports, declare handling complete, or remove
independently authorized status/recovery from accepted work.

This is the smallest coherent interpretation of the founder's Off control:
**Allow missionaries to report offline gifts — Off by default.** An explanation
can say: “Turning this off stops new missionary reports. Existing reports still
go through finance, and permitted status remains available.” It needs no
per-missionary override, workflow builder, new approval ceremony, alternate
intake store, or automatic rule for inferring gifts from messages.

Turning the setting On is necessary but not sufficient. It does not give every
missionary access to every donor or report. Current P12 capability, acting
Tenant context, source-purpose/field/history permission and the qualified P15
intake envelope remain independently required. A separately authorized staff
actor can continue the ordinary staff lane while this missionary entry is Off.
One person's other staff hat cannot silently widen a missionary-context request.

## Evidence map: owner facts versus runtime facts

| Source                                                                                                                            | Verified fact and consequence                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Founder brief:179](../phase28-founder-brief.md:179)                                                                              | P28 must handle actual offline gifts awaiting finance; P15 owns reported gifts in hand and intake. A missionary cannot manufacture posted money or a receipt. This supports the bounded consumer, not a second financial writer.                                                                                                                                                                                                                                                                       |
| [P15 D1 and operational extension:429](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:429)              | One batch commit door writes offline money. The ratified P27 extension allows a separate operational report before financial completeness; existing valid finance entry needs no compulsory precursor.                                                                                                                                                                                                                                                                                                 |
| [P15 authority/continuation:445](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:445)                    | Report/read/correct/route are separate P12 powers; recording and handling can complete independently; unresolved handling survives departure and cleanup; exact narrow qualification is required without every future finance product.                                                                                                                                                                                                                                                                 |
| [P15 missionary story:408](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:408)                          | Existing intended missionary visibility is designated offline gifts after posting. It does not already establish a pre-posting missionary report-create action.                                                                                                                                                                                                                                                                                                                                        |
| [P27 intake contract:77](../../../../prds/sitestacker-parity/phase-27-donor-development/requests.md:77)                           | Trusted recorder, reported holder and current accountable next actor are distinct. Actual receipt assertions are not continuous independently verified custody; no ordinary photo, signature or second approval is needed.                                                                                                                                                                                                                                                                             |
| [P27 incomplete/identity/lineage:79](../../../../prds/sitestacker-parity/phase-27-donor-development/requests.md:79)               | Unknown facts stay unknown; one check with split designations stays one intake; independent reports are not deduplicated by amount/name/date/check number; finance continues or reconciles the same occurrence.                                                                                                                                                                                                                                                                                        |
| [P27 independent dimensions/recovery:85](../../../../prds/sitestacker-parity/phase-27-donor-development/requests.md:85)           | Posting can precede transfer, or transfer precede posting. Loss/return/dispute/mistake need source dispositions. No eligible handler requires owned recovery, not a guessed broadcast. Report-only actors can receive a separately permitted minimal completion projection.                                                                                                                                                                                                                            |
| [REQ27-F59:587](../../../../prds/sitestacker-parity/phase-27-donor-development/requests.md:587)                                   | Possession, assignment, role labels and appeal membership confer no report, read, routing or financial power. D33 must select and qualify the exact new missionary capability mapping.                                                                                                                                                                                                                                                                                                                 |
| [P27 owner reconciliation:25](../../../../prds/sitestacker-parity/phase-27-donor-development/owner-reconciliation.md:25)          | No reporter donor-creation/posting/receipt/fulfillment power; accepted handling and recording survive reporter departure. P15 continues one intake, and qualified minimal completion need not expose the financial record.                                                                                                                                                                                                                                                                             |
| [P12 exact context:1552](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552)                 | Authenticated missionary is not public and need not become staff. One current validated membership context plus grants/floors authorizes each request. Tenant, Legal Entity and acting-context checks remain separate from UI surfaces.                                                                                                                                                                                                                                                                |
| [P12 qualified source capabilities:1601](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1601) | Bounded P15 gift-report/read/correct/routing actions are already required as distinct powers. Projection-policy widening retains its independent approval rule. The new policy controls a source action; it does not invent a per-grant DENY or new permission resolver.                                                                                                                                                                                                                               |
| [ADR0211:16](../../../../adr/0211-distinct-human-approval-for-projection-widening.md:16)                                          | Actual projection-policy widening requires distinct-human approval; narrowing/neutral changes apply with audit. This is not routine approval of every report. Ordinary enabling within a previously qualified policy is not automatically classified as a new projection widening.                                                                                                                                                                                                                     |
| [ADR0183:622](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:622)                                   | Source-controlled completion and independent human follow-up differ. Tenant settings cannot redefine completion. Required source work and durable projection intent survive task/UI failure; each producer must prove its exact grain, permissions, predicate and end.                                                                                                                                                                                                                                 |
| [ADR0206:26](../../../../adr/0206-immutable-posted-financial-facts-and-owner-operational-state.md:26)                             | Mutable operational records belong to their source owner and do not mutate posted financial rows. Coherent accepted state/receipt/audit/outbox effects are atomic; external I/O is not promised to be in the transaction.                                                                                                                                                                                                                                                                              |
| [OpenSpec boundary:207](../../../../../openspec/specs/platform-boundaries/spec.md:207)                                            | Missionary experiences receive focused role-scoped operations, not a second staff console. The report/status flow need not expose the batch grid, bank/deposit administration or donor-identity tooling.                                                                                                                                                                                                                                                                                               |
| [OpenSpec validated context:3](../../../../../openspec/changes/sitestacker-parity/specs/identity-and-access/spec.md:3)            | Staff/donor/missionary hats cannot implicitly widen one another; deferred work re-proves its exact current context. The target does not prove implementation or require the complete future permission product before a narrow qualified capability.                                                                                                                                                                                                                                                   |
| [Generated P27 OpenSpec:6059](../../../../../openspec/changes/add-donor-development/specs/donor-development/spec.md:6059)         | Report-only actual-receipt outcome already excludes contribution, donor creation, receipt, message, journey and automatic fulfillment. [Continuation through cleanup:6221](../../../../../openspec/changes/add-donor-development/specs/donor-development/spec.md:6221) and [bounded dependencies:6363](../../../../../openspec/changes/add-donor-development/specs/donor-development/spec.md:6363) preserve these source requirements. This is a behavioral projection, not another independent owner. |

The governing documents establish **intended behavior**. They do not prove a
working missionary report, P15 intake producer, capability mapping, setting,
Supabase policy, source-task projection or live release.

**Current static implementation observations:**

- A bounded search of `packages/api/src/missionary-portal` and
  `apps/missionary/app` for gift-report/intake/awaiting-finance paths found no
  matching implementation. This is not an exhaustive absence proof across Core.
- The unrelated [organization-settings handler:9](../../../../../packages/api/src/admin/org-settings.ts:9)
  defines a fixed `DEFAULT_TENANT_ID`; its reads at line 25 and writes at line 69
  use that ID. The PATCH path has a role check at lines 52–53. This proves that
  the handler is not a qualified reusable D33 tenant/context policy boundary;
  it does **not** prove cross-tenant exploitation, since effective RLS/runtime
  behavior was not tested. Do not bolt this control onto that handler unchanged.
- No live data, database migration, provider, old verifier or existing model was
  executed for this note. A reader must not promote documentation intent or a
  search result into implementation evidence.

## Required minimal lifecycle

There are separate dimensions, not one long synthetic status enum:
organization admission policy; report acceptance; current physical handling;
financial recording; bank/deposit outcomes; and current reader/action authority.
P15 already owns their valid relationship. D33 adds only its consumer and
admission condition.

| Event or race                                                     | Required result                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| New installation, upgrade, absent qualified D33 setting           | New missionary reporting is Off. Do not infer On from a legacy role, unrelated setting, past report or general financial read permission. Existing source work remains accountable.                                                                                                                                                              |
| Authorized staff enables reporting                                | Save one organization setting under the existing governed settings/source boundary. New missionary report acceptance requires current policy plus exact capability and source checks. On creates no reports, historical sweep, inbox, task or notification by itself.                                                                            |
| Maya saves while Off or policy proof is unavailable               | No new source acceptance. Off is a real policy result; lookup/authorization failure is an unavailable/denied result, not proof the organization chose Off. Preserve only still-permitted unsent input for deliberate recovery; no background auto-submit.                                                                                        |
| Report create and Off race                                        | Serialize the authoritative admission decision with the applicable current policy. Report accepted first remains accepted; Off accepted first blocks the new report. Stale UI/preflight or asynchronous cache invalidation cannot authorize post-Off creation. This requires an owner-proven ordering boundary, not a prescribed lock algorithm. |
| Source accepted report, response lost, then Off                   | Recover the original operation result without creating another report, subject to current result-read authority. Off does not convert known accepted work to failed/unaccepted; revoked read authority may limit disclosure without rolling back source truth.                                                                                   |
| Report not accepted before Off, then On again                     | No automatic replay of the old draft or old queued create. A deliberate fresh submission/review is rechecked under current policy, permissions and facts; preserve semantic operation recovery so an actually accepted prior attempt is not duplicated.                                                                                          |
| Off while reports remain open                                     | Stop new missionary report creation; retain same accepted reports, lawful evidence and current owned handling/recording work. Staff finance continues. Permitted status reads/result recovery remain independently authorized. Off is not a retention, revoke-all, completion or source-end command.                                             |
| Missionary needs to correct or update accepted handling while Off | Creation setting neither grants nor revokes separate source correction/handling powers. Expose only independently qualified current actions; otherwise provide the qualified staff/source recovery route. A status button or task checkbox cannot fabricate transfer, receipt or financial completion.                                           |
| Missionary leaves or loses exact permission                       | Stop their affected reads/actions immediately under P12; lawful retained report/history and real handling remain. Existing source recovery repairs ownership without an assumed new holder, silent responsibility transfer, finance broadcast or former-actor fallback.                                                                          |
| Finance posts before transfer                                     | Show independently permitted Recorded by finance plus Handling still needed; neither task completion nor posting asserts deposit/clearance.                                                                                                                                                                                                      |
| Transfer completes before posting                                 | Source may end only proved handling action; recording continues on the same intake. Do not post, issue a receipt or close independent recording work.                                                                                                                                                                                            |
| Same accepted item was independently posted already               | Qualified exact reconciliation links the existing financial outcome; no replacement contribution, receipt, fulfillment application or duplicate money.                                                                                                                                                                                           |
| Mistake, loss, return, rejection, dispute or duplicate            | Use P15's attributable correction/disposition and precise remaining work. No ordinary hard-delete or global Completed field substitutes for that action. A resolved exception need not keep a perpetual task.                                                                                                                                    |
| Financial reversal/NSF after completed handling                   | Financial owner updates money truth. Do not resurrect historical possession or erase original recording evidence. Required new work must have its own qualified source predicate.                                                                                                                                                                |
| Task materializer/projection down                                 | Accepted P15 report remains authoritative with required durable work intent and owned recovery. Retrying materialization cannot recreate intake or repost money.                                                                                                                                                                                 |
| Feature rollback or kill switch                                   | Fence new missionary creation, preserve accepted source work and staff continuation. Old writers that do not enforce the current policy cannot remain active. Rollback cannot delete accepted reports or reactivate old authority.                                                                                                               |

No new product question is needed to choose a timeout, custody signature,
physical inventory model, second approver, per-subject setting, or finance
workflow. Those are not implied by A. Exact source capability keys, qualified
field projection, disposition route, and producer implementation are engineering
obligations under the already chosen owner boundary.

## Material concerns and permanent prevention

Likelihood describes a plausible design/implementation failure, not measured
production frequency. Each concern narrows or makes A precise; none invalidates
the bounded missionary reporting outcome.

| Concern                                                                 | Severity / likelihood; evidence                                                                                                                | Consequence and required amendment                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **G01 — Off becomes delete or global denial**                           | High / plausible; accepted real handling survives departure/cleanup under P15 and P27, while the new answer only adds an optional entry point. | Hidden accepted work can strand a physical gift or force duplicate entry. Record “Off stops new missionary report acceptance; accepted intake, required handling/recording, staff continuation and independently permitted reads/recovery remain.”                                                                    |
| **G02 — Default/setting substitutes for authority**                     | Critical / plausible; P12 exact contexts, floor and source capabilities; current unrelated fixed-tenant settings handler.                      | Tenant/source leakage or unauthorized reporting occurs when On, role name, possession or a stale cached boolean becomes authority. Require exact server-derived Tenant/actor/context, current policy and capabilities at acceptance; least current field/history projections on every read/result.                    |
| **G03 — Unordered create versus Off**                                   | High / plausible; delayed UI and network replies are normal, and source effects are irreversible assertions once accepted.                     | Reports arrive after staff disabled the feature or known accepted reports are falsely rejected. Require one ordered source/policy admission boundary and recover accepted same-intent receipts without recreating effects.                                                                                            |
| **G04 — Reporting manufactures money/custody or mandates a new ledger** | Critical / plausible; P15 D1, operational extension and ADR0206.                                                                               | Pending assertions inflate support totals or produce financial/receipt duplication. Keep operational assertion, physical handling, recording and clearing distinct; no posted-row flags, financial side writer, payment collection, check-image store or compelled precursor.                                         |
| **G05 — Generic Done closes required handling**                         | High / plausible; ADR0183 source-controlled completion and P27 independent recording/handling.                                                 | A green task can hide an untransferred check or unrecorded intake. Source predicates own closure for the covered action; independent follow-up may finish without falsifying the intake. Tenant On/Off cannot change that completion contract.                                                                        |
| **G06 — Read permission or normal Off grants correction/routing**       | High / plausible; P27 F59 and source capability split.                                                                                         | A report-only missionary can assign custody, alter accepted lineage or choose financial disposition. D33 grants no blanket correct/route power. Reuse separately authorized source actions; otherwise route a bounded correction/handling request to the existing recovery owner. Do not invent a new approval queue. |
| **G07 — Sender departure/no handler loses the work**                    | High / plausible; P27 source recovery and unresolved handling retention.                                                                       | Real property has no accountable continuation or is broadcast to unqualified staff. Before activation qualify existing source recovery ownership and accepted no-recipient exception, not every future finance feature. A current staff/source actor continues even when the reporter can no longer see the record.   |
| **G08 — Optional reporting becomes compulsory activity reporting**      | Medium / plausible; founder voluntary-history boundary and missionary focus.                                                                   | Reporting usage becomes a quota, missed-log penalty or automatic coaching enrollment. The optional feature creates no such requirement. Accepted physical/source obligations remain accountable under P15; optional entry does not excuse actual organizational handling obligations.                                 |
| **G09 — Projection widening is confused with ordinary use**             | High / plausible; ADR0211 and P12:1601–1615.                                                                                                   | Either unreviewed data becomes visible or every ordinary report gains unnecessary supervisory approval. Qualify actual new exposure under the projection owner; use the approved narrow policy for ordinary reports/settings without a fabricated extra approval ceremony.                                            |
| **G10 — Whole-phase dependencies or unsupported runtime claims**        | Medium / plausible; P27 narrow-qualification rule and current static absence/incompatible settings seam.                                       | A simple entry point becomes a new finance platform, or ships before exact source continuity is real. Require only the reached source/report/read/policy/recovery/financial-continuation contracts and actual release proof. Do not claim every upstream phase or every tender must be rebuilt first.                 |

## Candidate exact clauses for the D33 amendment

**R01 — Bounded entry and default.** The organization SHALL have one optional
control, **Allow missionaries to report offline gifts**, defaulting Off for
new/unconfigured installations and unconfigured upgrades; later upgrades preserve
an already deliberately selected qualified value. Enabled policy permits admission
only through the qualified P15 reporting action and current P12 capability.
Neither role, current possession, supporter relationship, ministry assignment
nor On alone grants the action or new data visibility.

**R02 — Current admission fence.** New missionary report acceptance SHALL prove
the current organization policy and exact actor/source authority atomically
with the authoritative report admission decision. A policy change to Off SHALL
prevent later new acceptance across every reached command path. A stale client,
pending local draft or unaccepted queued operation SHALL not bypass Off.

**R03 — Accepted continuity.** Off SHALL not erase, cancel, source-end or complete
an accepted report, handling obligation or financial-recording obligation.
Qualified staff/source continuation, correction/disposition and required work
recovery SHALL remain usable. Missionary status/read/result recovery remains
subject to its separate current permission. Source changes that revoke that
permission SHALL still stop access; acceptance grants no permanent audience.

**R04 — Separate action powers.** D33 report-create and permitted status access
SHALL not confer donor creation, financial entry/post/correction, custody
assignment, routing, report correction, bank clearance, receipt, fulfillment,
export or communication power. Existing separately qualified current source
actions may be offered for accepted work; otherwise show the permitted source
handoff/recovery action. No new approval queue or generic Done action SHALL
replace the source contract.

**R05 — Same occurrence and truthful dimensions.** Reporting SHALL create or
recover one operational P15 occurrence, with immutable trusted recording
provenance and separately attributed receipt/handling assertions. Finance
SHALL continue or exactly reconcile that occurrence through existing owner
commands. Unknown facts remain unknown within the qualified intake envelope.
Reporting SHALL not post money, inflate received-support/public progress,
establish donor identity, prove continuous custody or bank clearance, or admit
receipt/acknowledgment/fulfillment/sending effects.

**R06 — Source work and safe recovery.** Every accepted report SHALL retain the
current source-owned accountable next action or owned unresolved exception.
Required source state, history/receipt and durable work intent SHALL commit
coherently; derived tasks/status can recover independently. Role loss,
departure, Off, archive or projection failure SHALL neither erase unresolved
handling nor recreate a gift. Retry SHALL recover accepted effect identity
before a new acceptance, and disclose the result only with current authority.

**R07 — Re-enable and rollback.** Enabling SHALL not submit drafts, replay old
unaccepted creates, discover historical gifts or create tasks by itself.
Deliberate new submissions still prove current facts and authority. Rollback,
kill-switch and mixed-version deployment SHALL preserve accepted intake and
staff continuation, deny incompatible old writers, and never restore revoked
permissions or erase accepted evidence.

**R08 — Focused optional experience.** The missionary flow SHALL show what was
reported, its actual acceptance outcome, separately permitted current handling
and finance status, and the next permitted action. It SHALL remain voluntary
without reporting quotas or coaching enrollment. It adds no finance grid,
payment collection, required image/signature, new routine approval, mandatory
donor checkout or automatic donor contact. Existing source-required physical
handling and financial controls remain binding.

## Required proof and ordered integration

1. **Record this precise interpretation before calling the amendment complete.**
   The selected facts are optional missionary reporting and default Off;
   creation-only policy scope and accepted-work continuity are the recommended
   owner-consistent amendment, not a fictitious separate founder answer.
2. **Reconcile exact owner intent when formal publication is authorized.** P15
   owns the report/lifecycle and financial continuation; P28 owns the focused
   consumer and organization admission choice; P12 owns capabilities and acting
   context; P3/P10 own the disclosure floor; Tasks Hub exposes qualified source
   actions. The P27 normative volume and generated OpenSpec projection must
   remain congruent. A new financial model or broad ADR is unnecessary.
3. **Qualify the narrow producer and consumer.** Prove permitted actual receipt,
   honest incomplete/wrong-payee intake, safe canonical identity resolution,
   existing-post reconciliation, no-recipient owned recovery, source disposition,
   same-item finance continuation and minimal status without full finance access.
   Money/receipt/fulfillment/communication owners keep their own acceptance gates.
4. **Require real acceptance tests.** Default Off; On without capability denied;
   role/context switch; cross-Tenant and source/field/history denials; create/Off
   both orderings; response loss followed by Off; On again without automatic
   replay; correction/read without create power; finance after reporter loss;
   post-before-transfer and transfer-before-post; accepted task projection
   outage; actual exceptions; restore and old-writer rejection. Verify outcomes
   through actual server/database boundaries, not only a synthetic state model.
5. **Pilot the complete handoff.** Maya must understand “reported” versus
   “recorded,” know the next permitted step and recover a lost response on a
   phone without entering the same gift twice. Staff must continue that same
   report. Browser accessibility, low-bandwidth recovery and source workload
   evidence remain release requirements; no timing/volume number is invented.

Only the following operational residuals are monitorable after correctness proof:

| Signal                                                                                                  | Threshold                                                                                | Owner                                                 | Response                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New missionary report accepted after effective Off, wrong Tenant/context, or duplicate financial effect | Any verified occurrence                                                                  | P15 reporting owner with P12/security and P13 finance | Fence affected create/financial lane, preserve accepted evidence and real handling, reconcile source truth and requalify the failed boundary before reopening.                                                                                                             |
| Accepted intake missing its required source work/projection or terminal reconciliation retry            | Older than the existing P27 five-minute operating trigger, or one terminal retry failure | P15 integration/operations owner                      | Show accepted report separately from delayed projection; replay exact intent/reconcile without a second report or posting. This inherits [MON27-110](../../../../prds/sitestacker-parity/phase-27-donor-development/operations.md:116), not a new human handling deadline. |
| Unresolved handling has no accountable current handler or owned source exception                        | Any confirmed occurrence                                                                 | P15 intake recovery owner with P12                    | Repair qualified source routing; do not broadcast or silently mark complete.                                                                                                                                                                                               |
| User mistakes reporting for posted money, clearance, or permission to dispose of the physical gift      | Any observed unsafe misunderstanding                                                     | Product/UX owner with finance-intake lead             | Contain the affected presentation, revise copy/actions and repeat observed handoff testing before expansion.                                                                                                                                                               |

No correctness or privacy gap is deferred to monitoring. This note creates no
formal specification, ticket, application/schema change or new live capability.
