# Phase 28 D49 — keep earlier gifts' campaign attribution

October 18, 2026. **Q49 answered A; selected.** The founder chose **“Keep earlier
gifts as recorded”** and requested deep current best-practice research.
**Disposition: Accept with required amendments.** The amendments below make the
selected correction/history behavior precise; they do not choose E7's remaining
recurring or hierarchy policy. This is a decision/research record, not a formal
specification, implemented feature or blanket ratification of earlier packets.
C01–C09 are required review amendments; no separate founder ratification of their
full wording is inferred from selecting A.

## Exact corrected decision

**D49 — Preserve earlier campaign attribution.** Changing a fundraising source
code's campaign assignment does not reclassify earlier gifts, including gifts
recorded with a known source code but no campaign. The change applies
prospectively through the financial owner's qualified attribution boundary.
An import, retry, delayed provider event or reopened screen does not make an
already accepted attribution new.

Authorized staff may deliberately correct mistaken earlier campaign attribution
through the existing P13 append-only correction boundary, with a reason,
before/after review, current permissions and D48's applicable approval policy.
A campaign-only correction preserves the truthful source code; staff must not
invent a different code merely to fix campaign attribution. Original posted
financial facts and correction evidence remain intact. Current effective reports
reflect an accepted correction; previously issued historical artifacts are not
silently overwritten. Attribution correction does not create money, transfer a
designation, alter donor credit or fulfill a commitment.

P13 owns the accepted campaign association and its correction history. Current
registry assignment, report caches and workspace summaries are not alternative
write authorities. The implementation must preserve the exact accepted campaign
association, including an explicit known absence, without independently editable
campaign fields on posted lines. No particular new table layout is selected here.

Tenant staff retain their governed campaign/code management and correction
permissions. There is no new tenant switch permitting ordinary setup to rewrite
past attribution. Existing report-model, currency, publication and access
controls retain their scope. Disabling management or hiding a report cannot
erase evidence or change financial meaning.

This settles ordinary code reassignment's retrospective effect. Existing recurring
commitments' later installments, campaign hierarchy changes and the exact
capture/posting/late-arrival contract still need coherent P13/P16 owner treatment.
The source-code origin already required on recurring installments is preserved;
it alone does not decide their campaign. E7 is narrowed, not declared closed.

## Evidence and why this direction wins

The [Q49 preparation](phase28-q49-campaign-remapping-history-research.md) records
the alternatives. [Current external research](d49-evidence/external-research.md)
and [UX guidance](d49-evidence/ux-research.md) provide official product and
accessibility evidence, retrieved October 18, 2026. These establish documented
patterns, not hands-on vendor verification, nonprofit prevalence, measured Asym
usability or a universal accounting rule.

Blackbaud's [Recurring Gift Amendments](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-ca/content/bb-recurring-gift-amendments.html)
explicitly preserves processed payments while changes apply to future installments;
it also documents a pending-retry exception. That is a useful temporal analogue,
not Core's exact code-remapping operation. Donorbox's
[individual-gift correction](https://donorbox.zendesk.com/hc/en-us/articles/360020293052-How-to-move-a-donation-to-another-campaign)
requires a chosen destination and confirmation. Its separate recurring-plan edit
does not document earlier-installment effects. Salesforce NPSP's campaign-copy
setting and CiviCRM's source precedence show that recurring attribution needs an
explicit contract; neither can settle Core's remaining choice by implication.

The strongest alternative is live regrouping: staff can reorganize campaign
reports without correcting individual old gifts. It is useful for a deliberately
current organizational lens, but requires a distinct historical-report contract.
The selected answer avoids surprising changes to earlier campaign performance
when someone edits setup. It retains a deliberate correction path. This is the
founder's product choice supported by history-preserving patterns, not an external
practice overriding Core's owners.

Core facts that require explicit reconciliation:

- P13 [story 143](../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:456)
  and [D14's live exception](../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:1608)
  would move earlier campaign results on registry edit. D49 supersedes that
  retrospective behavior for source-code reassignment.
- P13 [the campaign seam](../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:1611)
  says linking an unmapped code populates campaign results without a retrofit.
  Under D49, earlier no-campaign attribution needs an explicit correction.
- P13 [frozen campaign/immutable-mapping clauses](../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:1624)
  and its [inventory rule](../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:1633)
  also cannot remain an absolute ban on prospective remapping after gifts.
  Preserve accepted attribution while permitting the selected governed future change.
- P13 [source-code override](../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:1609)
  describes changing the code, not a campaign-only correction. Extend that same
  authoritative correction contract rather than manufacture an inaccurate code.
- P13 [rollup equality](../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:1631)
  must account for known no-campaign lines. For the identical admitted scope,
  campaign-attributed lines plus known no-campaign lines reconcile to all eligible
  lines, per currency. Incomplete/unknown coverage is not known no-campaign.
- [ADR-0206](../../../adr/0206-immutable-posted-financial-facts-and-owner-operational-state.md),
  [P27's E7 gate](../../../prds/sitestacker-parity/phase-27-donor-development/owner-reconciliation.md:41)
  and the [program gate](../../../prds/program-roadmap/decisions-and-gates.md#e7--campaign-temporal-attribution-exposed-by-phase-27)
  preserve financial immutability and required source qualification. They do not
  supply a shortcut around the unresolved parts of E7.

The [independent source review](d49-evidence/governance-review.md) distinguishes
legacy contribution readers/correction code from the intended temporal source
contract. Existing code is not evidence that prospective remapping, campaign-only
correction or all dependent reports are qualified. No production database or
vendor state was inspected or modified.

## Whole staff and reader journey

Use the existing source-code/campaign editor with one labeled campaign selector,
current assignment and concise consequence text: **“Earlier gifts keep their
recorded campaign.”** Show the proposed assignment before **Save assignment**;
provide Cancel. Use Core's shared Base UI/base-maia components, semantic tokens,
keyboard/focus behavior and phone layouts. No additional timing selector, history
rewrite toggle, duplicate settings page or mandatory multi-step wizard is needed.

Only show assignments and actions the actor may know or perform. Do not expose
hidden campaign names through picker results, impact counts or error text.
Read-only staff can view their permitted attribution without being offered an
unauthorized mutation. Tenant policy controls existing capabilities; it does not
change D49's history rule. Closed, archived, retired or invalid targets follow the
current owner lifecycle; never silently reopen or substitute a target.

Save success is source-backed. On validation or concurrency failure, preserve
safe entered data, explain the specific permitted problem and return to review.
A lost response reconciles the same operation; another click does not create a
second mapping version or correction. Accessible status feedback announces the
result without stealing focus. A changed permission or campaign can invalidate a
previous preview at final acceptance.

**Correct attribution** is a separate deliberate action on permitted existing
gift lines, with old/new attribution, reason and D48's appropriate Apply correction
or Request approval outcome. Existing supported bulk operations may reuse the
same per-line contract, exact selected scope and truthful partial results. D49
adds neither a blanket historical rewrite nor a separate bulk-correction engine.

Maya sees stable authorized campaign results; no new task, donor contact, coaching
obligation or checkout step is created by an administrative reassignment. A real
correction may change current effective totals and carries a permitted factual
explanation. History/artifact views retain their recorded basis. Existing labels
must distinguish campaign totals from designation totals and known no-campaign
from unavailable/incomplete data, without exposing internal IDs or policy jargon.

## Required amendments and permanent safeguards

These are exact requirements to carry into the owning contract after `/to-prd`.
They are not a separately approved implementation plan.

- **C01 — Stable accepted attribution.** Source-code reassignment SHALL leave
  every previously accepted campaign association and known absence unchanged.
  Persist/reconstruct it from authoritative accepted evidence, never today's
  registry join or a caller-supplied backdate. Qualify each entry path's actual
  attribution boundary; do not choose a new event implicitly during replay.
- **C02 — Truthful campaign-only correction.** P13 SHALL support an append-only,
  exact-source-line campaign attribution correction that preserves the original
  source code unless that code is itself being corrected. Record actor, reason,
  before/after association, source revision and durable operation identity.
  Current effective projection applies the valid correction once; original posted
  facts stay immutable. No synthetic donation, money reversal, fake source code
  or independent P28 ledger is permitted merely to reclassify attribution.
- **C03 — Same-scope command.** Resolve tenant, actor and authorization context
  through trusted server context. Prove exact source-line, code, campaign, legal
  entity and currency compatibility where the owner requires them. Enforce
  current mutation authority for both old and resulting states across API/RPC,
  database grants/RLS and privileged/import paths. Deny caller-controlled owner,
  audit actor or approval substitution; display access does not grant mutation.
- **C04 — Deterministic acceptance and recovery.** Serialize competing assignment
  and correction commands at the exact owner revision; reject stale previews or
  revalidate them before deliberate acceptance. Required authoritative effect,
  audit and secondary-work intent commit coherently. Retry/lost response/replay
  returns the same accepted effect. Derived-report failure cannot produce a false
  new attribution or require repeating a financial command.
- **C05 — Correction and refund lineage.** Refunds, reversals and partial
  corrections follow the exact affected gift's source-owned attribution lineage,
  including its qualified correction version. They never use an unrelated current
  registry assignment or create a second gift. Signed net effects preserve
  currencies, source amounts and existing fulfillment/receipt owners. Previously
  issued reports/artifacts are not silently replaced; current effective reporting
  and historical evidence have explicit source revision and basis.
- **C06 — One coherent projection.** All surfaces consume the P13-owned
  attribution/progress contract. Its version/invalidation includes attribution-only
  corrections even when no new money-posting sequence exists. Include known
  no-campaign in reconciliation;
  exclude unavailable coverage from a falsely complete total. Aggregate distinct
  admitted lines by currency and permitted scope; enforce disclosure before
  totals. Do not sum campaign and designation views as disjoint money or duplicate
  parent/child sets. Existing first/last-touch controls do not become permission
  to reassign accepted campaign facts.
- **C07 — Explicit adoption.** Preserve supported prior snapshots, correction
  history and explicit tenant permissions. Census retained records before migration.
  Where historical assignment cannot be proved, mark affected attribution
  unavailable/incomplete for reconciliation; never infer it from today's mapping
  or classify unknown as known no-campaign. Deploy compatible readers/writers and
  qualify reconstruction before activation. Rollback/restore cannot revive live
  regrouping or erase newly accepted correction history.
- **C08 — Honest, accessible operation.** Show current and proposed campaign,
  the effect on earlier gifts and the source-backed result in the existing editor.
  Apply existing policy at acceptance and never claim an awaiting-approval or
  indeterminate action completed. Preserve permitted input on recoverable error.
  Accessible status and keyboard/phone operation use the shared design system.
- **C09 — Scope and dependencies.** D49 SHALL NOT silently decide recurring
  campaign attribution or hierarchy history, change money/designation/recognition/
  fulfillment, re-open retired sources, or infer financial access from missionary
  visibility. Keep the remaining E7 owner decisions and exact adapter gates
  explicit; independently qualified relationship work continues.

## Material findings

Likelihoods below are qualitative implementation judgments, not measured incident
rates. Each concern changes the required design or narrows a completion claim;
none rejects the selected no-retroactive-remapping answer.

| ID  | What could go wrong and why it matters                                                                                                          | Severity / likelihood without prevention                                   | Evidence, effect on answer and permanent prevention                                                                                                                                                                              |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | A live registry join moves old totals; a blanket immutability rule instead prevents the selected future reassignment.                           | High / high if the conflicting P13 instructions are implemented literally. | P13:456/1608/1611 versus 1624/1633. Reconcile all named clauses, preserve accepted association, allow governed prospective change: C01/C09.                                                                                      |
| F2  | Campaign correction requires a fake source code, or a direct posted-row edit; current reports then misstate what prompted a gift.               | High / likely if the old override shape is reused unchanged.               | P13:1609 only specifies code override; ADR0206 forbids mutable posted facts. Extend the same owner command for campaign-only correction: C02/C03/C05.                                                                            |
| F3  | Late events, imports, stale forms, concurrent edits or response loss choose today's mapping or duplicate an effect.                             | High / plausible during normal asynchronous operation.                     | P13 capture/recurring snapshots and ADR0206 exact revision/idempotency rules. Reuse accepted evidence and permanent operation identity; qualify event-time seams and transactions: C01/C04/C09.                                  |
| F4  | Unmapped gifts vanish from reconciliation, refund totals move to the wrong campaign, or report copies disagree.                                 | High / likely with naive live joins or P13's incomplete equality.          | P13:1631 omits known no-campaign from equality; P27 requires complete source-covered measures. Use same-scope effective lineage, explicit no-campaign bucket and one projection: C05/C06.                                        |
| F5  | Picker, impact preview, report total or privileged correction crosses tenant/role/privacy boundaries.                                           | High / conditional; no exploit or production exposure established.         | P12/P10 source authority and P13 tenant-composite references/disclosure-before-aggregate. Enforce existing authorization through every read/write path: C03/C06/C08.                                                             |
| F6  | Migration fabricates history from current setup, or rollback restores an older live-regrouping reader.                                          | High / plausible where snapshots are missing or versions mixed.            | Retained-data requirement in founder brief; conflicting intended contracts and incomplete code are not a safe backfill source. Evidence-based adoption and compatible cutover: C07.                                              |
| F7  | Staff cannot tell reassignment from correction; extra toggles/wizards make a simple task harder and encourage accidental retrospective changes. | Medium / plausible; user testing not yet performed.                        | Official review/status guidance plus the distinct selected jobs. Keep one editor, explicit consequence, separately governed correction and source-backed result: C08.                                                            |
| F8  | Replaying full history per row or maintaining duplicate counters produces slow or divergent reports.                                            | Medium to high / workload-dependent, unmeasured.                           | Existing P13 one-projection/no-stored-counter boundary. Use indexed same-scope access and only measured, rebuildable projections; require representative plan/latency evidence: C06/C07. No arbitrary performance claim is made. |

## Category-by-category adversarial review

References to F1–F8 carry the evidence, severity, likelihood and exact prevention
above. “No additional concern” means this scoped decision adds no material risk
in that category after checking the named boundary; it is not runtime proof.

| Category                                                     | Material concern and consequence for this answer                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Problem validity, necessity and alternatives                 | **Yes — F1/F7.** Stable historic attribution is a real reporting contract already required by E7. Live regrouping is the strongest alternative, deliberately rejected for ordinary reassignment. Preserve useful correction rather than banning change.                                                |
| Brittleness                                                  | **Yes — F1/F3.** A current-only mapping or timestamp guess fails under delayed/imported work. C01/C04 keep accepted evidence authoritative.                                                                                                                                                            |
| Technical debt                                               | **Yes — F1/F2/F8.** Contradictory owners, fake-code corrections and per-surface rollups compound future rework. Reconcile one source boundary and its projections.                                                                                                                                     |
| Edge cases                                                   | **Yes — F2/F3/F4/F6.** Known-unmapped, unknown history, partial refunds, retired codes, changed targets and mixed versions require the exact cases below.                                                                                                                                              |
| Footguns                                                     | **Yes — F2/F7.** A history-rewrite checkbox, direct line update or accidental “save as new gift” violates intent. C02/C08 remove those paths.                                                                                                                                                          |
| Tenant safety                                                | **Yes — F5.** Tenant-scoped code text is not globally unique authority; composite identity and safe previews are mandatory.                                                                                                                                                                            |
| Database, RLS and authorization safety                       | **Yes — F2/F3/F5.** Qualify same-tenant references, uniqueness/current revision, immutable posted rows, grants and both old/new-state mutation authorization, including USING/WITH CHECK where applicable. Audit/tenant/actor fields come from trusted context. D49 does not claim current RLS passed. |
| Overengineering                                              | **Yes — F7/F8.** A general temporal rules engine, competing report modes or tenant history toggle is unnecessary. Preserve sufficient source evidence and existing command/projection seams; choose physical optimizations only with measured need.                                                    |
| UX/UI and user friction                                      | **Yes — F7.** Staff need predictable Save and a separate correction action. Keyboard, focus/status, small screens, long localized labels, exact dates/currencies and network uncertainty are C08 proof obligations; no new donor/missionary step.                                                      |
| Source of truth, ownership and invariants                    | **Yes — F1/F2/F4.** P13 owns association/correction, P16 commitments, P14 recognition; reports are derived. At most one effective campaign association per admitted line/model, with known no-campaign distinct from missing evidence.                                                                 |
| Hidden coupling                                              | **Yes — F1/F4.** Ordinary registry edits must not mutate historic reporting through an implicit live join; hierarchy and recurring rules remain separate explicit dependencies.                                                                                                                        |
| Failure modes                                                | **Yes — F3/F6.** Unknown save/report outcomes must not invite a second financial effect. C04 reconciles the durable operation; C07 prevents guessed recovery.                                                                                                                                          |
| Lifecycle, temporal correctness, concurrency and idempotency | **Yes — F3.** Mapping change, correction, retirement, stale approval and replay require one accepted revision and valid transitions. UI time/backdating does not select authority.                                                                                                                     |
| Data integrity risks                                         | **Yes — F2/F4/F6.** Preserve immutable original evidence, corrected effective association, same-scope conservation and faithful adoption. Never turn absent history into zero/unmapped fact.                                                                                                           |
| Security and privacy risks                                   | **Yes — F5.** Campaign names, exported attribution, impact counts and small totals can reveal restricted ministry information. Reuse source disclosure/retention; no raw UTM copied into immutable correction evidence.                                                                                |
| Scalability and performance risks                            | **Yes — F8.** Qualify indexed lookups, correction folds and batched report access against representative tenant/data shapes. No unbounded per-row history scan or measured-speed claim.                                                                                                                |
| Operational burden                                           | **Yes — F6/F7.** Unrepairable migration gaps or per-gift manual triage would create recurring support work. Use source evidence, bounded reconciliation and existing qualified bulk correction where supported, without auto-reclassifying history.                                                    |
| Observability and auditability gaps                          | **Yes — F3/F4.** Technical logs are not durable correction history. Preserve actor/reason/operation/source revision and distinguish accepted mapping, correction and report refresh; use the named signals below.                                                                                      |
| Dependency and integration risks                             | **No additional vendor dependency.** Official products are references only; no CRM sync, accounting service or attribution SDK is introduced. Existing delayed/provider/import risks remain material under F3/C01/C04.                                                                                 |
| Migration, rollout and upgrade risks                         | **Yes — F6.** Mixed readers/writers, absent snapshots and rollback may silently restore live semantics. C07 gates activation and requires preserved history/replay proof.                                                                                                                              |
| Testability, traceability and proof                          | **Yes — F1/F6.** A selected answer cannot prove E7 closed. Exact owner supersessions, explicit unresolved forks and outcome cases below must trace into later authorized artifacts.                                                                                                                    |
| Other development hazards                                    | **No additional independent concern found.** Checked money/designation/receipt/credit authority, compulsory missionary work, new glossary concepts and release claims; C09 preserves boundaries. Remaining financial/tenant hazards are captured above.                                                |

## Adversarial check

### What could go wrong with this answer?

The obvious live-registry implementation rewrites past attribution. The less
obvious correction workaround invents a new source code. C01/C02 require stable
accepted campaign evidence and an honest campaign-only correction instead.

### What hidden assumptions are we making?

We cannot assume all retained gifts have a campaign snapshot, all current code
uses P13's intended ledger, or a source-code snapshot contains campaign meaning.
Actual data inventory and event-boundary qualification remain required. No
vendor-specific workflow is treated as a proven ministry requirement.

### How does this affect the whole product?

P13 must reconcile source management, correction and reporting; P16/P27/P28 and
public/analytics consumers must use that same qualified projection. D48 governs
applicable correction approval. Money, designation and communication owners do
not change, and E7 is not closed prematurely.

### How does this affect the end-user experience?

Staff can organize future fundraising without unexpectedly moving past results.
Mistakes remain fixable through deliberate review. Maya receives a stable,
permission-correct view, without another setting, administrative task or report
mode to understand.

### Does this follow modern best practices?

The official research supports separating prospective setup, deliberate
correction and preserved processed history. Products differ in detailed campaign
and recurring models; none supplies a universal rule. WCAG/GOV.UK support clear
consequences, review and accessible truthful feedback; they do not require extra
confirmation steps for every short edit.

### Does this fit Asym’s existing repo and product direction?

Yes with the explicit P13 amendments above. It respects ADR0206, one source
projection, tenant/privacy boundaries and the existing design system. It replaces
the contradictory live-remapping exception rather than pretending it agrees.

### Should we adjust the recommendation?

**Accept with required amendments C01–C09.** Preserve the chosen behavior; make
the campaign-only correction, no-campaign accounting and temporal-source limits
explicit. Those safeguards complete the selected job without selecting the
separate recurring/hierarchy product policies.

## Outcome proof to require

1. A gift attributed to Campaign A remains there when its code is assigned to B;
   amounts, designation, donor credit and commitment fulfillment do not change.
2. An earlier known-code/no-campaign gift remains no-campaign. Unknown historical
   evidence stays distinguishable from that known absence.
3. A new eligible ordinary gift uses the owner-qualified prospective mapping;
   a retry, delayed callback, existing accepted capture or imported old event does
   not become new merely because it is processed later.
4. An authorized campaign-only correction changes effective attribution once,
   preserves the real source code and original posted row, and records a reason.
5. D48-required approval waits truthfully; loosening policy does not auto-apply
   it. Unauthorized, cross-tenant or stale before/after state is rejected.
6. Two concurrent mapping/correction commands cannot both claim the same current
   revision; retry and lost response recover one accepted semantic effect.
7. Full/partial refunds and corrections net to the correct effective gift
   lineage under either correction/refund ordering; no new money or double count.
8. Reconciliation includes attributed and known-unattributed eligible lines in
   identical entity/currency/viewer scope. Unavailable coverage cannot become zero.
9. Renaming/retiring codes, closing/archiving campaigns or changing permissions
   preserves history and blocks only currently forbidden actions.
10. Every consumer/export applies disclosure before rows/totals; hidden campaign
    identity cannot leak through search, counts, errors, logs or caches.
11. Prior artifacts remain intact; refreshed effective reports identify their
    basis. Current and historical reports do not silently contradict their labels.
12. Adoption, mixed versions, restore and rollback preserve accepted association
    and correction history, including no-campaign and unprovable-history cases.
13. Phone, keyboard and screen-reader users can review/save/correct/recover with
    clear status, long localized names and currencies, without redundant steps.
14. Representative report/query plans and operation latency meet predeclared owner
    budgets at the tested tenant/data shapes. Passing document checks is not this
    performance or user proof.

## Synthesis and status

**Resolved before recording:** earlier-gift and known-unmapped behavior, separation
of ordinary reassignment from deliberate correction, required campaign-only
correction and scoped P13 supersession. No new glossary term is introduced.

**Capture in the developing owner design:** C01–C09 and exact recurring/hierarchy/
late-arrival reporting meaning. Formal P13/P16/P27/OpenSpec/ADR reconciliation
awaits `/to-prd`; tickets await `/to-issues`. The existing immutable-financial-facts
ADR is sufficient for the storage invariant; this interview adds no premature
formal ADR or duplicate implementation graph.

**Implementation safeguards after authorization:** census source evidence;
reconcile command and projection contracts; qualify database/auth/concurrency;
migrate compatibly; prove full correction/report journeys and restore; activate
only the qualified consumers. No direct database repair is the proposed user
workflow. Independent relationship work remains useful while gated financial
measures are unavailable.

**Monitor only after qualification:** P13 operations owns attribution
reconciliation: any nonzero unexplained same-scope line/amount discrepancy or any
accepted-line campaign movement without a qualified correction stops the affected
report publication and triggers source reconciliation before rebuild. Security
owns any observed unauthorized cross-tenant disclosure: threshold one, disable
the affected path and investigate under existing incident procedures. UX/product
owns pilot comprehension: any observed critical belief that setup moved received
money or that a pending correction completed blocks activation until corrected
and retested. These are proposed release safeguards, not running monitors or
measured incidents; unresolved core semantics are never assigned to monitoring.

The [session continuation](phase28-session.md#next-conversation-step) owns the
next single question. No prior executable/model/checker was run; no application,
schema, live setting, GitHub record or real communication changed. Documentary
verification and research do not establish runtime or Phase 28 completion.
