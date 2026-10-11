# D4 financial and effect-boundary review

2026-10-09. Research-only review of the founder's selection of **A: an authorized person deliberately starts new cultivation, individually or in a reviewed group**. D1, amended D2 and tightened D3 remain settled. This note proposes D4 safeguards; it does not ratify them, prescribe the full feature, change formal specifications or qualify runtime behavior.

## Recommendation and proposed wording

Keep A. Deliberate entry records acceptance of relationship work; it does not require a gift and cannot replace financial, communication or identity authority. Preserve contextual entry and reviewed groups without another enrollment ceremony, mandatory queue or approval layer.

Suggested narrow clarification:

> A gift, referral, import or other event can inform an authorized person's choice, but its arrival does not start new cultivation. One clear action may record an ask or referral and start or reuse the appropriate journey, with its effects apparent before submission. Previously evidenced cultivation may be migrated with its context and history; importing a supporter list does not itself accept new work. Starting, retrying, correcting or undoing enrollment does not send messages, replay historical effects or change financial or contact authority. Existing source facts and accepted follow-up may continue to update under their own owners without another enrollment decision.

“Does not send messages” applies to the admission command's effects. It does not stop independently authorized receipts or source notices caused by an actual financial transaction, and it does not create a new automatic notification policy for future cultivation tasks. Exact task/reminder behavior remains later grooming.

## Primary evidence and current-state limits

These are exact repository anchors unless a URL is given. PRDs/roadmap state intended owner contracts; current source and issues separately establish what is implemented or still pending.

- **P27:** `docs/prds/sitestacker-parity/roadmap.md:4079` exact source dependencies; `:4089` requested/expected/source-confirmed financial meanings, Legal Entity and currency; `:4091` appropriate next task or actionable exception; `:4101` P9 shared tasks/identity, P13 received gifts, P14 recognition, P16 commitments and P6/P17 communications retain ownership; `:4103` native/configurable effect identity; `:4111` source-native complete journey. D4 question `docs/features/donor-development/grill/phase27-q4-intentional-entry.md:107–112` allows contextual deliberate start; `:128–138` reviewed scope and migration distinction.
- **P30 owner roadmap:** `docs/prds/sitestacker-parity/roadmap.md:4327–4337` import follows source duplicate rules, stable source identity, per-row recoverable outcomes, historical data stays outward-effect-dark, reversal preserves later staff edits and financial history; `:4343` target service owns business acceptance; `:4353–4361` preview/commit, durable restart, no synthetic source success, historical disposition cannot become prospective by editing its displayed time. This is a qualified future import contract, not an implemented bulk enrollment service.
- **P13 owner:** `docs/prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:1020–1034` imported gifts use existing payment/posting axes with pre-Asym provenance, separate Phase 7 receipt evidence, no reissue/void of another system's receipt; `:2023` posted financial rows remain frozen even against owner/service-role writes; `:2291–2295` exact source line/posting/finality projection rather than mutable donation summaries.
- **P14 owner:** `docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md:438–468` legal and recognition lenses, named readers, currency and role dedupe; `:799–803` imported tribute streams start stopped with historical coverage; `:1128` imported remittance history produces no tasks or acknowledgments; `:1167–1177` recognition is not contactability/stream enrollment; `:1843–1847` stable import identity, historical settled evidence, zero historical sends/receipts/acknowledgment regeneration.
- **P16 owner:** `docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:968` financial and certainty facts distinct; `:983–1017` conserved source application, narrow typed authorities, human relationship/import flags insufficient; `:1027–1031` corrections append exact inverses, projections cannot authorize; `:1334` saving/importing a pledge creates neither charge nor installment plan; `:1444–1468` reminders start Off and require separate current-plan/purpose proof; `:2545–2574` fresh-build census, inert cutover, classify proved/hint/unknown, no historic outbound/payment replay, source-qualified target acceptance.
- **P6 owner:** `docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md:175` source-owned bounded occurrence and fence, P6 exact semantic/immutable-command replay, provider submission identity separate, indeterminate reconciliation. Current source authorization and exact Live P17 producer contract remain necessary; enrollment alone is neither.
- **Workflow:** `docs/prds/workflow-studio/contracts/recipe-catalog.json:1397–1424` DON-14 triggers from source-accepted enrollment/transition, defaults disabled and exact binding remains unresolved. The word “owner” is domain authority, not an already-ratified human-only rule. `docs/prds/workflow-studio/10-acceptance-scenarios.md:261–271` WS-AT-022 rejects raw provider callback as posted-contribution evidence; it is `specified_not_executed`. `openspec/changes/add-workflow-studio-program-contracts/specs/workflow-studio/spec.md:329–351` source recheck survives lost wakes, permanent cross-caller semantic effect, no blind uncertain retry, required source work survives optional overload. Recipe-local lineage keys cannot replace source-owned cross-caller identity.
- **Existing code:** `packages/api/src/workflows/adapters/stripe-events.ts:23–55` intentionally changes dispatch identity by recovery attempt while the stored source event remains the same; `:76–98` bounded recovery scan. This is a useful demonstration that transport/recovery attempts are not new business facts. `packages/api/src/admin/contribution-operations/operations.ts:1109–1155` existing adjustment retry loads an existing tenant/key result; it is not P27 admission or complete P16 fulfillment. `packages/api/src/workflows/claims.ts:7–40` short-lived execution claims do not establish permanent semantic dedupe. `packages/api/src/admin/crm/detail/service.ts:244–256` legacy gift detail is capped and reports truncation; it cannot prove complete donor history for group selection.
- **Existing tests inspected, not executed:** `tests/unit/packages/api/workflows/stripe-event-recovery-scan.test.ts:20–88` covers recovery dispatch and isolated failed handoffs; `tests/unit/packages/api/stripe-event-store.test.ts:10–40` covers hashing/reference/error classification. These are not P27 admission, historic-effect or real-database proof.
- **Current issue readback:** [#823 conserved fulfillment](https://github.com/Asymmetric-al/core/issues/823) and [#833 Gentle reminder enrollment](https://github.com/Asymmetric-al/core/issues/833) fetched again 2026-10-09; both **open**, `status:blocked`, zero comments; updated 2026-07-14 22:33:42Z and 22:34:20Z respectively. Full issue bodies retain source-confirmed fulfillment and separately deliberate reminder enrollment. #833 still names an older direct intent interface; the later accepted P6/P17 whole-plan/Live-activation amendment is authoritative, so do not copy that older interface. Neither issue proves implementation. The bounded D3 implementation search found no qualified P14 named readers, P16 fulfillment or P27 enrollment identifiers in packages/apps/supabase/tests; no D4 implementation is claimed.

## Concerns, decision effects and exact safeguards

Severity/likelihood describe plausible errors if the safeguard is omitted, not observed production incidents.

### F1 — Human admission must neither launder uncertain money nor require money

**Severity:** High; Critical if it authorizes financial effects. **Likelihood:** High where a “new gift” view becomes the start action.

**Case:** Staff sees a raw successful processor callback and presses Start partnership. The app labels the person a financial partner, treats an ask as funded or creates a pledge. The opposite mistake blocks a clearly intended prayer-only/referral journey until finance sources are complete.

**Evidence:** P16 `:968,1007–1017`; P14 `:438–468`; P27 `:4089,4101`; WS-AT-022 `:261–271`.

**D4 effect:** Retain A and distinguish two proofs: the person's deliberate decision to do cultivation, and any claimed financial fact. No gift is an entry prerequisite. Viewing a financial hint and clicking Start does not upgrade that hint to posted/recognized/fulfilled truth. A fully qualified posted gift still cannot auto-admit new cultivation under A.

**Suggested language:** “Starting relationship work does not require a gift. Financial context remains qualified by its owning source; deliberate enrollment does not confirm money, commitment, fulfillment, recognition or consent.”

**Acceptance:** Independent prayer/referral case starts through current authority without fabricated giving data; raw event cannot show Posted/Received; complete posted gift alone starts no new journey; human start leaves source money/credits/commitments unchanged; stale financial coverage stays unknown. D4 boundary now; exact initial stages and source-qualified financial UI later.

### F2 — A rule that assists selection must not quietly become automatic admission

**Severity:** High. **Likelihood:** High for first-gift lists, score bands and saved groups.

**Case:** A user reviews ten donors with recent gifts. The saved filter later matches fifty additional Parties; a scheduled worker treats the previous approval as standing authority. One Party with twelve gifts appears twelve times, or the first page is silently treated as the complete group.

**Evidence:** Q4 `:107–112,128–131`; P27 `:4095` advisory score cannot change stage; P30 `:4329–4331,4353–4355`; current CRM capped gift history `:244–256`.

**D4 effect:** Reviewed group is a deliberate bounded selection, not a recurring admission rule. Evidence refresh, suggested lists and ordinary record imports remain permitted; new active cultivation must follow the adopted human choice. No mandatory new candidate queue follows.

**Suggested language:** “Reviewed-group acceptance applies to the selected reviewable set, not to future matches or unseen rows. Repeated gift/source rows do not create repeated acceptances for the same intended work.”

**Acceptance:** New arrivals after review do not join the batch; repeated source facts for one Party are resolved by D3's journey meaning; wrong scope or materially changed selection is safely rejected/reviewed under current source policy; partial results remain accurate and recoverable. Do not demand source revisions unrelated to admission solely because finance facts are displayed; revalidate facts only where the command actually relies on their qualified meaning. Exact batch snapshot/result UX later, without selecting SQL uniqueness now.

### F3 — Existing supporter history is not evidence that new cultivation was accepted

**Severity:** High. **Likelihood:** High for migration from giving or missionary contact lists.

**Case:** A donor import has gifts, “monthly supporter” status or a pledge counter but no evidenced ongoing cultivation. Import creates active journeys, fabricated due dates and stewardship stages for everyone. Conversely, real established partnership records are reset to Identification and assigned first-contact tasks.

**Evidence:** P30 roadmap `:4329–4337,4343,4361`; P16 `:2553,2562–2574`; P14 `:1128,1843–1847`; Q4 `:133–138`.

**D4 effect:** Keep migration of evidenced existing work distinct from admission of new work. Evidence may support history, relationship context or a proposed selection without establishing an operational journey. Do not invent a production migration or new engine before the retained-data/import census.

**Suggested language:** “Preserve evidenced existing cultivation with its original context, history and certainty. Imported supporter/giving status alone does not create accepted new cultivation, fabricate follow-up or reset an established relationship to a prospect.”

**Acceptance:** Proved existing work retains its meaning and actual historical dates; incomplete records remain visibly unresolved in the source import result with a cause-owned repair path, not forced into an active enrollment; current lawful responsibilities and permissions are re-proved rather than copied as authority. No re-approach, invented date, mass task storm or default financial stage. Genuine new work can be accepted as a reviewed group without retyping imported facts. Migration dark mode is not permission to discard real pending work: qualify its intended future disposition separately, keeping imported historical actions distinct from current deliberate acceptance. D4 boundary now, retained-data census and exact disposition later.

### F4 — “Start journey” must remain free of financial and messaging side effects

**Severity:** Critical for unauthorized payment/receipt; High for unwanted contact. **Likelihood:** Medium–High with shared first-gift automations.

**Case:** Starting a journey emits a generic first-gift event, producing a welcome, receipt or missionary thank-you. A migration marks old gifts as newly received by setting their timestamp to import day. Cultivation entry toggles the separate P16 reminder enrollment or activates a Reserved communication key.

**Evidence:** P13 import boundary `:1020–1034`; P14 `:799–803,1128,1845–1847`; P16 `:1334,1444–1468,2562–2574`; P30 `:4331,4361`; P6 A17 `:175`; DON-14 `:1397–1424`.

**D4 effect:** A makes new work intentional but a human click remains narrow authorization. It is not an all-purpose permission to send, charge, receipt, establish a pledge, apply money, add contactability or start other enrollment types.

**Suggested language:** “The admission action creates or reuses the intended cultivation work and its explicitly included shared work only. It sends nothing and does not issue receipts, change financial records, activate reminders or infer consent. Historical source events remain historical.”

**Acceptance:** Start alone causes zero communication intent/event/provider send, gift/posting/credit/fulfillment/commitment mutation or P16 reminder activation. A combined referral/ask action has clearly described local effects, no hidden financial write. Actual receipt/notification eligibility continues independently at its financial owner; declining or undoing cultivation cannot suppress a required source notice. Import, replay and later optional-workflow activation never catch up historical enrollment/gift events into new donor contact. D4 now; later shared task notification policy must be explicit, not inferred here.

### F5 — Event delivery, source correction and accepted cultivation have different lifetimes

**Severity:** High. **Likelihood:** High under repeated/out-of-order events and gift corrections.

**Case:** The same gift produces several callbacks or recovered dispatches; each creates a proposed/new journey. A refund causes automatic deletion or regression of human-accepted cultivation. Staff must click enroll again whenever a commitment, assignment or source cursor changes.

**Evidence:** P16 `:1023–1031` lifecycle/correction distinctions; P13 `:1012` out-of-order handling; P27 `:4101–4103`; current Stripe adapter `:23–55` recovery-attempt identity; Workflow spec `:329–351`.

**D4 effect:** A limits **new admission**, not ordinary source maintenance. Existing authorized views, owned tasks and financial projections can update automatically under their respective source contracts. They must not invent a new human choice or reverse one merely because its context changed.

**Suggested language:** “Source updates and retries do not constitute a new enrollment decision. Corrections update the relevant source facts and surface affected work when needed; they do not automatically erase or advance the accepted relationship journey.”

**Acceptance:** Duplicate callbacks and replayed corrected source facts create no additional journey/task/message; refund changes effective giving/fulfillment only via its source; accepted relationship history survives and any materially affected ask is truthfully flagged. Financial source maintenance does not require repeated human enrollment clicks, nor does optional Studio absence stop native projections/tasks. D4 boundary now; event vocabulary and stage/correction policy later.

### F6 — A retry must recover the same deliberate operation, not make a new choice

**Severity:** High. **Likelihood:** High for bulk operations and lost responses.

**Case:** A combined Record ask and start/reuse action accepts the ask and journey, then the network fails. Retry creates another ask/task or reuses a changed payload under the same command. An operator presses bulk Retry all after partial success, reproducing successful work.

**Evidence:** P30 `:4329–4331,4353–4355`; P27 `:4103`; P6 A17 `:175`; Workflow spec `:329–347`; current work claims `:7–40` and contribution retry `:1109–1155` are useful partial precedents, not proof of P27 behavior.

**D4 effect:** Keep one contextual action. Simplicity requires durable truthful results and source-effect dedupe, not another setup form or a distributed workflow builder. Journey/source operation identity must survive browser close, transient failure, import batch replay and optional workflow retries. A short-lived lock or provider dedupe window is insufficient.

**Suggested language:** “Retrying the same accepted operation returns its recorded outcome and cannot duplicate the linked ask, task or future effect. Changed intended work requires a new explicit action rather than silently changing an accepted command.”

**Acceptance:** One lost-response retry returns exact original permitted create/reuse result and linked work; immutable payload mismatch conflicts; a partial batch resumes from per-record outcomes without replaying successful effects. Local accepted changes/audit/required handoff are atomic at the appropriate source command or expose a repairable pending state; no false success with missing obligatory work. Do not invent cross-owner rollback or place provider network calls inside a DB transaction. Future real-database and public-command proof required; D4 now states the invariant, not its schema.

### F7 — Undo cannot erase independent work or rewind money

**Severity:** Critical for financial rewind; High for loss of other staff's work. **Likelihood:** Medium–High once contextual/bulk actions are introduced.

**Case:** An authorized person undoes a mistaken start that reused an existing journey/task, deleting someone else's ask. A bulk reversal removes a real Party or an already source-applied gift. A sent effect is marked “never happened.”

**Evidence:** P30 roadmap `:4337,4361` explicit reversal limits; P16 `:1027–1031,2547` append-only source correction and additive rollback; P13 `:2023` frozen financial truth; P27 `:4101` ownership.

**D4 effect:** Preserve recoverability without promising universal Undo. An admission correction changes only work the actor/source can currently correct, preserves audit and honors subsequent use. Reused work is not newly owned merely because it appears in the result.

**Suggested language:** “Correction or reversal preserves pre-existing/reused work, later edits, source history and already accepted effects. It shows what can be safely undone and routes any remaining consequence to its owning source.”

**Acceptance:** Undo of one new entry does not delete a reused task or journey, another user's follow-up, a recorded response, Party or financial fact. A linked task/ask created by this action can be withdrawn only through its owner's current rules when still safe; otherwise show explicit current disposition. Imported history/cash/receipt evidence is never rewound. A completed or in-flight communication retains its evidence and cannot be unsent by enrollment deletion. D4 boundary now; delete/archive/correct/end lifecycle and exact undo affordance later.

## Minimum complexity and remaining qualification

D4 chooses deliberate human acceptance for **new** work, including reviewed groups. It does not choose a configurable admission engine, shared child pipeline, forecast/coverage store, new import queue, financial ledger, sender, extra approval gate or one enrollment screen per person. Use the one P27 source command and existing qualified P9 task, import and financial/communication owners. Source qualification may block a particular financial claim/action while unrelated deliberate cultivation remains available.

Carry exact capability, tenant/Legal Entity scope, privacy-safe create/reuse visibility, supported contextual/group command and actual database concurrency as implementation obligations. Do not infer those proofs from the source issue labels, existing provider recovery tests or earlier isolated PostgreSQL mechanics demonstrations. First confirm retained data and narrow source availability; do not demand delivery of all P30/P34/P16 features before ordinary native entry.

No tests or live source operations were executed for this research. Changes are limited to this grooming evidence note; no formal PRD/specification, issue, product code or remote data was altered.
