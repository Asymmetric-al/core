# Phase 27 D3 — financial and integration adversarial review

> Research input, 2026-10-09. The [consolidated D3 review](../phase27-d3-adversarial-review.md)
> reconciles these recommendations and controls decision status. This is
> grooming evidence, not an approved schema, formal specification or proof
> of application/production qualification.

Research only, 2026-10-09. Reviewer: financial-contracts subagent. Input from parent: founder chooses one ordinary continuing ministry partnership with coexisting prayer/financial participation and particular special asks; another journey requires an independently managed continuing purpose. D1 and amended D2 remain ratified and are not reopened. This file proposes safeguards; it does not ratify D3, choose a schema, qualify a source or alter owner contracts.

## Recommendation

Keep the selected answer. It reduces duplicate administration and does not require a new shared-pipeline child, financial ledger, consent record, reminder queue, provider sender, purpose engine or approval process. It needs one short clarification in the decision itself:

> Prayer and financial participation can coexist without becoming steps toward a financial outcome. Individual asks and source facts retain their own meaning and restrictions; a positive response to one does not settle the others. Legitimate existing ask-linked shared work may satisfy the journey's next-action requirement, and multiple open asks/actions are allowed. A separate journey neither changes financial truth nor bypasses contact restrictions or permits repeating the same intended task/message.

This is a product boundary, not a prescribed status taxonomy. Exact admission, stage, ask/outcome, end/reopen, task display, coverage, migration and duplicate-resolution behavior remains later grooming. In particular, do not silently decide “earliest task wins,” one mandatory additional coordination task, one communication per journey, a new database enum for every participation kind, or a generic purpose catalog.

## Evidence and observed implementation limits

Paths below are absolute. Unless explicitly marked current source, the evidence is accepted/planned owner intent, not runtime proof.

- **P27 source roadmap:** `/workspace/core/docs/prds/sitestacker-parity/roadmap.md:4079` exact P13/P14/P16 source dependencies; `:4089` asks retain requested/expected/source-confirmed amount meaning, Legal Entity and currency; `:4091` active enrollment has shared next task+due date or actionable exception; `:4095` advisory score cannot advance stage or measure relationship value; `:4101` P9 tasks/identity, P13 money, P14 recognition, P16 commitment, P6/P17 communications remain separate owners; `:4103` native/configured follow-up shares source-purpose identity; `:4111` reuse shared task controls.
- **P16 primary owner:** `/workspace/core/docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:968` financial facts remain distinct; `:983–995` one atomic, conserved, same-Tenant/Legal-Entity/currency application with source/target capacity and authority fences; `:997–1003` linked recurring/fixed coverage consumes money once; `:1007–1017` only typed current evidence authorizes fulfillment, with received money visible during match review; `:1023–1031` lifecycle/correction/staleness separate; `:1037` health applies to a recurring line or fixed pledge, never a person; `:1444–1468` reminders start Off, current purpose/contact/send-time proof, permanent semantic identity, no ordinary-state tasks; `:1476–1498` structural scope and API/auth rules.
- **P14 primary owner:** `/workspace/core/docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md:438–468` legal/recognition lenses separate, three named consumers, per-currency subtotals, MAX per Party/header across recognition roles; `:264` Party merge preserves strictest preferences and document coverage without remailing; `:1167–1177` church-member recognition is visible-not-contactable, no automatic prayer-letter/newsletter enrollment.
- **P13 primary owner:** `/workspace/core/docs/prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:1624–1634` source attribution, designation and campaign distinct; overlapping campaign/fund views do not add money; distinct source-line rollup sets; P27 owns appeal linkage. Existing campaign association timing inconsistency identified in the initial financial note remains an owner conflict; D3 neither resolves it nor needs that resolution to accept one ordinary partnership.
- **P6 primary communication owner:** `/workspace/core/docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md:175` accepted A17: complete bounded plan occurrence through shared compiler; recipient-specific child identity/fences are private to P6; exact semantic/immutable-command conflict checks; provider submission identity distinct from intent identity; timeout becomes indeterminate and reconciles before retry; intent cannot authorize payment, change pledge or create a general journey engine.
- **Workflow secondary consumer:** `/workspace/core/docs/prds/workflow-studio/05-security-and-domain-boundaries.md:27–35` source owns audience/purpose, P17 content, P6 dispatch; delivered means no more than provider evidence; donation is not newsletter consent; identical organization/missionary effects converge, genuinely distinct messages permitted, conflicting bodies resolve explicitly. `/workspace/core/openspec/changes/add-workflow-studio-program-contracts/specs/workflow-studio/spec.md:319–351` live owner revocation, durable wait recheck, permanent cross-caller effect identity, no blind uncertain retry, required withdrawal survives optional overload. This is an active specification, not deployment evidence.
- **Current source rechecked:** exact search in `packages`, `apps`, `supabase`, `tests` found no `getPartyCreditActivity`, `getMatchingActivity`, `getSupporterRoster`, `cultivation_enrollments`, `cultivationEnrollments`, `cultivationEnrollment`, `fulfillment_applications`, or `commitment_fulfillment` implementation identifiers. This bounded search does not establish that no differently named partial work exists. CRM detail still reads at most 100 legacy flat gifts and reports truncation (`/workspace/core/packages/api/src/admin/crm/detail/service.ts:244–256`, constant `:11`). It cannot stand in for complete P13/14/16 data.
- **Current patterns, not target qualification:** `/workspace/core/packages/api/src/workflows/claims.ts:7–40` 300-second work claims call an RPC to serialize current attempts; temporary claim exclusion alone is not permanent effect deduplication. `/workspace/core/packages/api/src/donate/saga.ts:293–342` provider creation carries idempotency key and later completes a claimed outbox through an RPC; this illustrates a network/local-commit boundary, not proof of P27/P6 recovery. `/workspace/core/supabase/migrations/20260611100000_contribution_adjustments.sql:7–45` has tenant+idempotency partial uniqueness and service-only access, but its tenant/donation FKs are separate and key nullable: not a complete example of new scope/conservation invariants.
- **Current identity merge helper:** `/workspace/core/packages/api/src/donate/guest/donor-merge.ts:124–163,191–215` produces audit/redirect and preserves receipt snapshots as pure output, not evidence of a transactional P27 journey merge or a reason to invoke Party merge when consolidating cultivation records. `/workspace/core/supabase/migrations/20260704140000_donor_matching_merge_candidates.sql:74–75` specifically says possible matches require review, never auto-merge.
- **GitHub readback retained from the same research session, 2026-10-09:** [P13 #690](https://github.com/Asymmetric-al/core/issues/690), [P14 #719](https://github.com/Asymmetric-al/core/issues/719), [P16 #793](https://github.com/Asymmetric-al/core/issues/793) open; pertinent [#695](https://github.com/Asymmetric-al/core/issues/695), [#726](https://github.com/Asymmetric-al/core/issues/726), [#735](https://github.com/Asymmetric-al/core/issues/735), [#820](https://github.com/Asymmetric-al/core/issues/820), [#823](https://github.com/Asymmetric-al/core/issues/823), [#826](https://github.com/Asymmetric-al/core/issues/826) open/blocked as recorded in `/workspace/scratch/phase27-financial-issue-evidence.json`. Full bodies/statuses and sampled comments were inspected in that earlier pass; not re-fetched for D3. C02 financial Party amendments on #695/#726/#735 last updated 2026-09-23. Open or groomed tickets are not deployed interfaces.

## Adversarial concerns

Severity/likelihood rate plausible future errors if omitted, not observed production incidents. “D3 now” means preserve the boundary in ratification; it does not require designing the whole feature now.

### F1 — A combined journey can hide independent intentions behind one positive outcome

**Severity:** High. **Likelihood:** High with a single prayer/financial dropdown or strongest-response rollup.

**Case:** A church says yes to prayer updates, declines equipment funding, and continues existing monthly support. An “engaged/positive/partner” badge could conceal the refusal, mark equipment Received, trigger another ask, or imply permission for fundraising email.

**Evidence:** P27 roadmap `:4089,4095`; P16 `:968,1015–1023,1037`; P14 `:1167–1177`; P6 A17 `:175`; Workflow security `:29–33`.

**Answer effect:** Supports one journey but requires coexisting, meaning-specific facts. Prayer is neither a lower rung nor evidence of giving; financial participation does not prove prayer participation. Staff may record legitimate human context without manufacturing behavior from delivery/open/click events.

**Exact amendment:** “One ordinary partnership does not collapse ask responses, participation, commitment, money, contact permission or stage into one success status. A positive response to one matter does not answer another.” Avoid treating any aggregate positive-response label as source authority. D3 now; precise response buckets/stage policies later.

**Acceptance proof:** On one journey show prayer participation, a declined special ask and an independently source-confirmed active commitment without contradiction. Confirm the declined ask remains declined, no consent changes, no new automatic charge/pledge/fulfillment/stage, and authorized staff can understand each fact. Delivery acceptance/open/click cannot create a reply, agreement, gift or completed task.

### F2 — Journey deduplication is different from conserving money across asks

**Severity:** Critical. **Likelihood:** High if “gives to the same ministry” funds every associated ask.

**Case:** A $100 gift is visible in regular support, an equipment ask, a church campaign, and another legitimate continuing purpose. Eliminating duplicate journeys does not prevent $400 reporting; allowing a second legitimate purpose does not authorize consuming the gift twice.

**Evidence:** P16 D11 `:983–1017` exact conserved applications; P14 `:438–468`; P13 `:1626,1631`; P27 `:4089`.

**Answer effect:** Keep additional genuine purposes; do not use restrictive journey uniqueness as a financial control. Separate four meanings without creating four new stores: journey business purpose; ask/outcome reference; P16 fulfillment application; source-owned communication/task effect identity. Existing sources own the last two.

**Exact amendment:** “A gift may appear in relevant contextual views without creating additional received money or fulfillment. Ask/journey associations do not themselves allocate gifts or create, merge, fulfill or cancel commitments.” D3 now as boundary; precise ask-funding attribution and reporting policy remain later grooming under P13/P16.

**Acceptance proof:** One source line referenced by two asks and two journeys remains one legal gift in portfolio totals. A second request to consume the same money cannot exceed current capacity, including concurrent calls; any valid split is explicit and conserved. Correct/return/re-designate the original gift and verify authoritative inverses/unknown coverage propagate. Do not treat campaign/source-code tracking, Page Giving links, a positive answer, a recognition credit or matching-gift expectancy as fulfillment authority.

### F3 — One continuing partnership does not erase amount, scope or uncertainty

**Severity:** Critical for false money; High for misleading cultivation. **Likelihood:** Medium–High with a single progress total.

**Case:** Requested USD1,000, expected USD500, fixed promise USD500, received USD100 and recognition USD100 are added; or USD100 and CAD100 become “200.” A source outage is then interpreted as no support, forcing relationship downgrade/outreach.

**Evidence:** P27 `:4089,4113`; P14 `:442–455,468`; P16 `:983–987,1017,1031,1037`; P16 immutable LE/money schema `:1476–1498`. D2 already establishes exact Ministry Assignment scope and does not need reopening.

**Answer effect:** Currency/representative/annual renewal alone does not justify a second journey. Keep currency and financial source scope on the underlying business facts rather than splitting journeys to make a misleading scalar easy.

**Exact amendment:** “Combined relationship context preserves each financial measure's meaning, source, Legal Entity, currency, completeness and freshness. Source-unavailable or stale is unknown, not zero, lapsed, fulfilled or a negative relationship judgment.” D3 now at boundary; dashboard layout/formulas and admissible ask currencies later.

**Acceptance proof:** Legal and recognition separate; money received, commitment fulfillment and pipeline expectation separately labeled; no cross-currency scalar or implied FX; correct source-supported per-currency aggregates after filtering authorized rows. Truncated 100-gift CRM history is explicitly insufficient for whole-history RFM. P14/P16 source unavailable blocks only dependent claims/commands, preserves independently valid human context/tasks and permits truthful Received plus Match needs review.

### F4 — Combining participation cannot loosen purpose-specific contact restrictions

**Severity:** High. **Likelihood:** High when one journey supplies a global “contactable” badge.

**Case:** A prayer-letter subscriber declines fundraising, a church member is only on a remittance breakdown, or a donor stops fixed-pledge reminders. The unified journey sends an equipment appeal under “partnership update,” or a new distinct-purpose journey retries it.

**Evidence:** P14 J1 `:1167–1177`; P16 `:1444–1466` purpose-bound enrollment, current send-time gates, no donated/read implication, narrow reminder stop; P6 A17 `:175`; Workflow security `:31–35`.

**Answer effect:** A shared partnership is correct only when the relevant permission remains independent. Declining an ask need not mean declining all relationship contact; consent to prayer updates is not consent to every ask. The source owner must decide the actual purpose, not let P27 relabel it to evade suppression.

**Exact amendment:** “One journey preserves the supporter's distinct intentions and current purpose/channel restrictions. Creating, combining or ending a journey never grants, broadens or substitutes consent.” D3 now; exact contact/decline/end semantics later.

**Acceptance proof:** Fundraising-restricted, prayer-permitted recipient receives only qualifying prayer content, not mixed fundraising content hidden inside it. Org-sourced recognized member has no contact affordance or automatic stream enrollment. Stopping P16 reminders stops that purpose without ending pledge or partnership. A genuinely permitted distinct message still works. Restriction change racing dispatch follows the source fence/dispatch boundary and cannot be worked around with a new journey ID.

### F5 — Multiple asks need coordination without duplicate administrative tasks

**Severity:** Medium for redundant work; High when pending work silently disappears. **Likelihood:** High if one-next-action wording is interpreted as an extra task per enrollment or one exclusive slot.

**Case:** One existing shared task schedules a conversation covering ordinary support and an equipment request. The product creates a second “manage partnership” task solely to satisfy the active-journey rule. Alternatively completing one task closes all ask follow-ups or reassigning the journey loses the remaining ask owner.

**Evidence:** P27 roadmap `:4091,4101,4103,4111–4113`; P16 `:1468` ordinary reminder states do not create tasks; P9 owns shared tasks rather than P27 copying them.

**Answer effect:** Strengthens the practical case for A. One journey can contain multiple open asks/actions without constructing separate shared pipelines beneath it. One real task may satisfy the journey obligation when its source-linked meaning, accountability and due date legitimately do so.

**Exact amendment:** “Reuse an existing suitable shared task, including ask-linked work, to meet next-action discipline. Multiple pending asks/actions remain independently visible and accountable; the journey itself does not require another administrative task.” D3 now; no automatic earliest-task/combined-follow-up rule selected. Exact display/coverage and completion relations later.

**Acceptance proof:** Existing valid ask-linked next task satisfies the requirement without another task. Two different due actions survive, and finishing one does not complete the other. A task covering two matters is only shared where its actual meaning supports both; contradictory/independently due work is not silently deduplicated. Empty next-action state yields the adopted explicit actionable exception, not a fabricated due date or completed task.

### F6 — Native, workflow and staff/missionary callers must converge on the actual effect

**Severity:** High. **Likelihood:** High if dedupe key is journey UUID, actor, recipe/run, publication or a temporary lease alone.

**Case:** Native staff sends a gift acknowledgment; a missionary workflow follows the same source event; prayer/financial journeys are consolidated; an old event replays beyond provider dedupe. Per-journey keys allow repeated contact. A coarse Party+ministry key would instead suppress a different legitimate communication.

**Evidence:** P27 `:4103`; P6 A17 `:175`; Workflow security `:27–35`; WS spec `:339–351`; current workflow claims `:7–40` only exclude concurrent attempts for a bounded lifetime.

**Answer effect:** Preserve ordinary unified journey while separating journey admission from source-effect identity. Neither more nor fewer journey records solves cross-caller duplication. P6/P17 and source domain already own the solution, so D3 must not create its own sender/intents/provider-effect ledger.

**Exact amendment:** “Deduplicate the same intended task/message at its owning source across native, optional workflows, staff/missionary callers and journey corrections/consolidation. Genuinely distinct intentional effects remain possible; conflicting content for one effect is explicit.” D3 now; exact source semantic identity and channel plan qualification later.

**Acceptance proof:** One intended acknowledgment remains one after two journeys, different callers, retries, transferred staff, recipe publication and eventual consolidation. Distinct eligible prayer update and ask follow-up both remain possible. Changed immutable payload for occupied identity conflicts, not arbitrary first/last writer. Workflow absence/disable/overload does not block native task creation, accepted source work, mandatory notice or restriction withdrawal. Studio owner revocation is rechecked; relationship responsibility alone is no grant.

### F7 — Consolidation is not Party merge, financial repair or consent union

**Severity:** High; Critical if historical receipts/coverage change. **Likelihood:** Medium, conditional on actual retained separate prayer/financial records or future imports.

**Case:** Two old cultivation entries represent one partnership, each with independent asks, tasks, notes and follow-up receipts. “Keep the more advanced status” converts prayer yes to financial yes; concatenating histories duplicates already accepted contact; invoking donor merge changes records outside P27.

**Evidence:** P14 `:264` strictest preferences/coverage preserved; P16 append-only correction `:1027–1031`; P6/WS permanent effect identity; current donor-merge helper `:124–163,191–215` preserves receipt snapshots but is not a cultivation consolidation service. No qualifying P27 table found in bounded current-source search.

**Answer effect:** Do not add a migration program to D3 or assume production data. First census actual data and intended imports. New fresh-build data should use accepted ordinary-partnership meaning; conditional future consolidation must preserve provenance and source effects.

**Exact amendment:** “If duplicate prayer/financial cultivation records must be reconciled, preserve their independently valid asks, source facts, histories, intentions, restrictions and accepted effect identities; surface real conflicts rather than selecting the strongest status. This is not a Party merge or a financial rewrite.” Later implementation acceptance; short history/restriction boundary sufficient for D3 now.

**Acceptance proof:** Migration/import replay yields the same result without extra tasks/messages or source consumption. Record genuine independent continuing purposes separately. Consolidation never creates opt-in, promotes status, adds balances, edits original donor snapshots, rewrites fulfillment, re-mails old acknowledgments or erases unresolved ownership. Old identifiers retain audited resolution if needed for retries; exact alias/schema choice is not selected now. If no retained data exists, record that evidence and avoid needless migration machinery.

### F8 — Database and partial-failure handling must protect the boundary without a second engine

**Severity:** Critical for cross-scope writes/duplicate financial effects; High for false completion. **Likelihood:** Medium–High if client orchestration or service role is mistaken for transaction/authorization.

**Case:** Two sessions create the same ordinary partnership; one local write succeeds while task linkage fails; financial source finishes before workflow wait registration; provider accepts a message before local confirmation fails. A retry with a new journey/effect key duplicates work or marks it complete with no source proof.

**Evidence:** P16 `:983–995,1476–1498`; P6 A17 `:175`; WS `:329–351`; existing saga `:303–342` shows provider/local commit boundary; adjustment migration `:7–45` demonstrates incomplete scope/key precedent. Official Supabase evidence below.

**Answer effect:** Feasible using Postgres and existing source commands. No universal saga engine, purpose classifier, reconciliation scheduler or new financial table follows from this business decision. Exact new-record uniqueness predicate cannot be chosen before admission/duplicate behavior is groomed; names/fuzzy text or prayer-vs-financial flags are insufficient substitutes.

**Exact amendment:** D3 needs no SQL rule now. Carry an implementation constraint: authoritative scope, expected revision and semantic replay/immutable-payload checks run at the owning server/database command; local accepted state, audit and required outbox fact are atomic as applicable. Required cross-owner work uses existing source receipts/reconciliation; provider calls do not occur inside a database transaction. Failure/uncertainty is visible and repairable without manufacturing completion or a fresh duplicate command.

**Acceptance proof:** Real-DB concurrency—not only mocks—shows concurrent duplicate admission converges or explicitly conflicts according to the later rule; concurrent money application/reversal obeys P16 capacity/authority fences; wrong Tenant/LE and revoked capability fail even with service-only backend access. Exact retry after lost response returns original result; immutable payload reuse conflicts; source completion before wait registration is discovered; timeout stays indeterminate until reconciled; bounded lease expiry alone never licenses repeat effect. Partial task creation/link failure is visibly pending/repairable, not a silently valid journey or an extra administrative task. Preserve source-driven mandatory corrections if optional workflow fails.

## Supabase check and minimum complexity

Applied Supabase skill `c1/supabase`. Official docs retrieved 2026-10-09, cached only under `/workspace/scratch`; no live database or Management API mutations:

- [Securing your Data API](https://supabase.com/docs/guides/api/securing-your-api): grants and RLS solve different layers; existing projects may auto-grant new `public` objects; API functions require controlled EXECUTE and deliberate privileged-function review. Source cache `/workspace/scratch/d3-finance-supabase-api.md:25–43,193,229`.
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security): `service_role` bypasses RLS (`/workspace/scratch/d3-finance-supabase-rls.md:53`); default views may bypass underlying RLS and exposed views need `security_invoker=true` where supported or other deliberate protection (`:88–90,528–538`). RLS alone neither proves source-specific human capability nor enforces conserved financial allocation.
- [Changelog](https://supabase.com/changelog): checked latest 2026-10-08 status-page change and 2026-10-06 scoped PAT change; no relevant release excuses missing application/source authorization. Cache `/workspace/scratch/d3-finance-supabase-changelog.md`.

Smallest sound approach for later build: one native P27 source model consuming P9 shared work plus typed P13/P14/P16 projections, not a second copy of their authority; ordinary indexes/constraints plus source command transactions for accepted invariants; source-owned permanent replay receipts where external effects exist; P6/P17 for all messaging. Restrict rows before amount/count/aggregate/score composition, including existence and error output. Do not expose an aggregate view through `service_role` and presume membership filtering occurs automatically. Do not add extra pipeline levels, configurable approval policy, materialized roster, full purpose engine or nightly financial recount without a measured/domain-owned need.

## D3-now versus deferred decisions

**Settle now:** coexisting participation and specific asks are independently meaningful; none implies financial or consent authority; legitimate existing shared work can satisfy next action; additional journeys cannot manufacture money or repeat/bypass intended contact; retained source history/restrictions survive consolidation.

**Keep for later P27 grooming:** precise continuing-purpose admission/uniqueness; automatic vs deliberate entry; stages and response buckets; asked/expected/funded attribution; reporting composition; legal entity/currency admissibility at ask creation; task selection/coverage/completion UX; lifecycle and duplicate correction; qualified source interfaces; migration census; performance/retention and production activation proofs. These questions do not invalidate D3 and should not be answered by accidental schema choices now.

No product code, PRD, OpenSpec, issue, external application or live database was changed. No tests were executed: acceptance proofs above are future requirements, not passing results.
