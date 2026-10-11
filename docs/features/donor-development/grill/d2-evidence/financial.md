# D2 adversarial review — financial and integration consequences

> Evidence appendix, researched 2026-10-09. Findings are inputs to the
> [consolidated D2 review](../phase27-d2-adversarial-review.md), which
> reconciles recommendations and controls their decision status. This is
> grooming research, not a ratified specification or runtime qualification.

2026-10-09. Research and decision-support note, not a PRD, specification, issue plan, or implementation. Founder has selected the existing Ministry Assignment as the target of ordinary missionary-support cultivation. D1 remains a **continuing purpose-specific relationship journey**, including successive asks and stewardship. This review does not replace D1 with a fresh enrollment per annual ask.

## Verdict and proposed precise interpretation

**Retain the founder’s answer.** A Ministry Assignment is the correct enduring ministry reference for a person, couple or team. It avoids rebuilding cultivation whenever a participant, login or public Page changes. No finance finding requires reverting to a person target.

Suggested concise wording for the D2 decision record:

> Ordinary missionary-support cultivation concerns one exact Phase 9-owned Ministry Assignment, preserving its Tenant and Legal Entity scope, while the donor/church remains a Party. Participant changes do not by themselves replace that continuing cultivation relationship. The ministry reference is not a financial destination, supporter permission, responsibility assignment or consent. Its optional Support Assignment binding, any Designation, financial facts and public Page remain independently owned; changing one does not transfer history, money, commitments, grants, next actions or intended communications. Authorized native cultivation does not require a public Page, a Support Assignment binding or an optional Studio.

Most of this preserves existing ratified owners, rather than adding a new product restriction. Exact enrollment succession/closure, financial associations, responsibility transfer and sharing still require later P27 decisions. If D2 is understood to promise automatic continuation/transfer after the actual ministry purpose changes, that is a **material expansion** and should come back to the founder.

## Evidence status and scope

- Read D1 accepted log and D1 review in /workspace/core/docs/features/donor-development/grill/. The log still said Q2 unanswered at review time; latest founder selection is supplied by the parent, not inferred from that stale log.
- Rechecked exact P9 source amendment; P22 D19 decision, normative OpenSpec and D7 Giving; P21 binding/participation boundary; P13/P14/P16 financial contracts; effective Workflow Studio DON-14–DON-16, WS-18-CORE and specified acceptance.
- Existing domain contracts are accepted planning evidence, not implementation or deployment proof.
- Current-code exact search for MinistryAssignment, ministry_assignments, ministry_assignment and Support Binding variants in packages/api/src, packages/database, supabase/migrations, apps/admin and apps/missionary found only a CMS README warning that existing data is not D19 authority. No implementing Ministry Assignment service/table was found in these inspected paths.
- No remote mutation or code change; no tests or live financial operations run. Severity/likelihood below rate a plausible implementation error **if the guardrail is omitted**, not an observed exploitable production failure.

## Findings

### F1 — Financial destination cannot be inferred from the Ministry Assignment

**Severity:** Critical (wrong gift destination, false promise/received amount). **Likelihood:** High if the screen uses “this ministry’s fund” as one interchangeable field.

**Recognizable case:** A donor is cultivated for the Smith ministry. The ministry’s public page gives to Designation A, its Support Workspace is bound to Support Assignment S, and finance later changes the binding or page’s Giving destination. Those references do not prove which designation an existing ask or commitment meant. A team may also have different approved purposes.

**Evidence:**

- P9 PRD /workspace/core/docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:1279–1302: Ministry Assignment distinct from Support Assignment, Designation/Campaign, Page and financial account; binding cannot propagate Giving destinations/history.
- P22 decision log /workspace/core/docs/prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md:3339–3345: only separately finance-authorized P21 command writes optional prospective immutable same-scope binding.
- P22 D7 same file:1117–1123: source code/UTM/referrer neither choose nor override destination/entity/currency; Page Giving Binding itself is not contribution, commitment or payment.
- P16 PRD /workspace/core/docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:2985–2992: each recurring occurrence retains exact accepted source-purpose lineage, not current designation label, worker page or campaign copy.

**D2 answer effect:** Retain target, explicitly deny implied financial mapping. This belongs in D2 now because otherwise “ministry target” can be read as “fund owner.” Do not select an ask-to-designation cardinality yet.

**Exact amendment/acceptance to preserve later:** Changing Ministry Assignment participants, Support Binding, Page subject or Page Giving Binding causes zero writes to contribution, recurring/fixed commitment, fulfillment or existing ask financial associations. Before an ask presents an actionable Giving link, the appropriate source resolves current exact eligible destination/issuer/currency and preserves the independently selected ask meaning. If that cannot be proved, that action is unavailable; no nearest-fund/general-fund fallback.

### F2 — Continuity is not automatic financial succession or rewritten history

**Severity:** Critical. **Likelihood:** High across transfer, retirement, spouse separation and team turnover.

**Case:** One spouse departs; the ministry continues. Later the organization retires that ministry and appoints a successor. The first change can leave the cultivation context intact; the second does not entitle the successor to the same donor promise or historical supporter access.

**Evidence:**

- P9 source amendment:1281–1293 and1315–1318: identity survives participant changes, memberships confer no responsibility/finance/access; retirement/succession requires explicit owner-domain dispositions.
- P22 D19 decision log:3449–3462: membership changes propagate nothing; rebinding requires consequence review and never transfers grants/balances/history/donor identity/progress/Giving/notifications; real legal-entity/source changes retain history and route unresolved consequences.
- P16 PRD:2994–3003: even a P21 reallocation/exit case cannot pause, cancel, redirect or select recurring successor; P16 accepts its own current authorization and preserves old occurrences.
- P16:1178–1186: genuine Commitment Party transfer is not an ordinary edit; explicit successor/fresh authority, preserving original identity and lineage.

**D2 answer effect:** Stable target remains correct. “Survives a participant change” is inherited, but should not be described as automatic transfer of relationships to a new ministry. Full pause/end/reopen/successor journey is broader P27 work.

**Exact amendment/acceptance:** Preserve original Ministry Assignment identity on accepted enrollment history, asks, encounter links and completed effects. A different ministry or Legal Entity is never silently written over the historical target. A source retirement or genuine purpose change routes an explicit disposition with a named accountable owner; unresolved work must not disappear or become completed. Historical reference does not grant current access. Test participant-only change, same-scope support rebind, ministry retirement and new-ministry succession separately.

### F3 — A single target does not permit mixed Legal Entity or currency meaning

**Severity:** Critical. **Likelihood:** Medium; particularly likely for international sending organizations and one person serving several ministries.

**Case:** The same worker participates in a US and Canadian ministry record, or one donor gives USD and THB. A person-centered shortcut gathers both under “support for Alex” and silently reports one amount.

**Evidence:**

- P9:1281–1286 and P22 D19:3318–3343: one Ministry Assignment has exactly one Tenant/Legal Entity; one Party can participate in multiple Assignments, optional Support Binding same scope.
- P16:983–993: one conserved fulfillment operation must match exact Tenant, Legal Entity, currency and designation/source/target capacity; no cross-currency fulfillment.
- P16:1569,1985: typed entity-bearing references, exact provider binding and currency; source scopes not mutable defaults.
- P14 PRD /workspace/core/docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md:453–455: per-currency subtotals, never scalar.
- Roadmap /workspace/core/docs/prds/sitestacker-parity/roadmap.md:4089: each requested/expected/source-funded amount retains entity, currency and meaning.

**D2 answer effect:** Preserve the exact target’s inherited scope now. This does not forbid an authorized organization-wide view over multiple distinct enrollments; it forbids merging their identity or money. Exact ask/appeal currency choices remain future product decisions.

**Exact amendment/acceptance:** Cross-Tenant and mismatched Legal Entity target references reject at server and database boundary. One person’s membership in several Assignments does not merge support contexts. USD/THB or US/CA rows remain separately labeled with no invented FX total. A new entity requires explicit owner successor handling, not editing the Ministry Assignment’s entity or reinterpreting old asks.

### F4 — Target identity must not become financial coverage or success evidence

**Severity:** Critical. **Likelihood:** High if “gives to the same ministry” auto-funds every open ask.

**Case:** A donor has monthly support, a one-time emergency ask and a church remittance associated with the same ministry. Counting the same received gift against all three can overstate organization results; recognizing a member can also look like a legal gift or fulfilled promise.

**Evidence:**

- P16:1007–1017: automatic fulfillment only exact provider lineage, authenticated donor instruction, or approved authenticated structured-remittance mapping. Same name/amount/memo/relationship/soft credit only suggestions. Received gift may coexist with match Needs review.
- P16:997–1003: recurring-to-fixed coverage consumes money once, pins historical plan/target; no second application.
- P16:3088–3099: shared participation never creates/merges/retargets/transfers commitment; one Party in multiple Support Assignments cannot duplicate it.
- P14:438–468: Legal and Recognition never blend; source readers only; recognition MAX-per-Party/header across roles.
- P14:1037–1040: church legal giving vs member allocation credits separate and bounded.
- P13 PRD:1624–1634: Campaign/Designation overlapping lenses, canonical distinct-source-line rollup; appeal linkage separate.

**D2 answer effect:** No objection to target. Record now that it identifies cultivation purpose, not funding coverage. Exact ask funding association, exclusivity/overlap and staff attribution rules are **pending wider P27 work**, not implicitly ratified by D2.

**Exact amendment/acceptance:** One gift visible in more than one authorized relationship/ask view remains one organizational money fact. Staff credit, recognition, ask association, commitment application and received money are separately labeled. A shared Ministry Assignment/participant/Support Binding cannot authorize fulfillment or satisfy an ask. Later acceptance must include concurrent asks, regular versus special gifts, church/direct/DAF paths, recurring-to-fixed linkage and refund/partial correction without double source consumption.

### F5 — Live participant/binding joins cannot rewrite historical attribution or reopen outreach

**Severity:** High. **Likelihood:** High given changing teams and the existing person-keyed code.

**Case:** An enrollment originally concerned a ministry with Designation A. A current join switches to new Support Assignment S2, so the brief drops the original gifts, shows S2’s gifts as historical performance, or generates new thank-you tasks for old records.

**Evidence:**

- P22 D19:3453–3462 expressly denies history/donor/Giving transfer on support rebinding.
- P16:2985–2992 preserves accepted purpose lineage;1001–1003 pins application and linked coverage to the historical target/plan.
- P14:2147–2159 current exact Support Assignment, source versions, privacy before amounts/counts; assignment access changes do not rewrite credit/recognition.
- Current /workspace/core/packages/api/src/missionary-portal/donors.ts:357 and506 filters by missionaryProfileId; /workspace/core/packages/api/src/missionary-portal/donor.ts:149–191 updates donor rows through profile-keyed missionary_id. P22 D19:3470–3473 explicitly calls this prototype evidence, not couples/team authority.

**D2 answer effect:** Reinforce exact enduring source identity; do not derive it from current participants or profile. The detailed authorized historic/current scope resolver is a later owner integration.

**Exact amendment/acceptance:** After a current binding changes, prior source-linked events retain original references, source versions and financial meaning; any current financial view discloses its selected scope and source coverage. Rebind/restore/import cannot replay old outreach or produce duplicate initial enrollment/thank-you effects. Current user authorization/history floor is re-proved even for old facts. No use of current participant list to backfill alleged cultivation or financial history.

### F6 — Shared ministry prevents duplicates only if staff/missionary effects share source purpose

**Severity:** High (duplicate solicitation or unhandled stewardship). **Likelihood:** High across staff/missionary handoffs and optional-workflow adoption.

**Case:** Mission Control staff create a “thank donor for this gift” task; a spouse in Missionary Workspace and an installed Studio recipe create the same task again. Conversely, deduplicating every contact at Ministry Assignment level suppresses a legitimate finance clarification or separate authorized missionary note.

**Evidence:**

- Roadmap:4103 and4167: permanent source-purpose identity shared by native/configurable work; P28 native tasks reuse owner identity.
- Workflow security /workspace/core/docs/prds/workflow-studio/05-security-and-domain-boundaries.md:27–33: source decides audience/purpose; P6 eligibility, P17 content; identical intended effects converge, distinct intended messages permitted; conflicting bodies require resolution.
- Normative /workspace/core/openspec/changes/add-workflow-studio-program-contracts/specs/workflow-studio/spec.md:341–348: effect owner deduplicates same effect across native callers/workflows/retries/publications permanently within lawful retention.
- Catalog /workspace/core/docs/prds/workflow-studio/07-core-workflow-catalog.md:1649–1753: DON14 cultivation enrollment, DON15 development case, DON16 partner review; source bindings unresolved until exact owner qualification.
- /workspace/core/docs/prds/workflow-studio/04-data-and-api-contracts.md:24–28,46: workflow task links and source semantic operation identity are separate from task ownership.

**D2 answer effect:** The ministry target must not include acting staff/missionary principal or workflow-run ID in the enduring relationship identity. No exact uniqueness or effect-key schema should be declared yet; that is upcoming P27 design. D2 can preserve shared-source/no-duplicate-effects boundary.

**Exact amendment/acceptance:** Native staff, authorized missionary and two workflow publications requesting the same source-purpose task/message converge on one accepted effect despite retry/reassignment; changed recipient/channel/body cannot silently win under the same effect identity. Deliberately distinct approved organization/missionary purposes remain distinct. A Ministry Assignment alone is too coarse for deduplication, while actor/profile/workflow-publication identity alone is too narrow.

### F7 — Shared ministry, gift or membership supplies no contact authority

**Severity:** High. **Likelihood:** High for church remittance/DAF and new spouses/team members.

**Case:** A new teammate is associated with the ministry and sees an org-sourced church member in financial recognition; the product assumes they may add that member to appeals or send reminders.

**Evidence:**

- P9:1288–1302; P22 D19:3332–3345: association gives no donor purpose, responsibility, notification, financial or supporter access.
- P14:1084–1093 and1167–1173: roster field floor; member visible but no contact affordance/auto-enrollment. Contactability remains separate from P6 purpose consent.
- Workflow security:31–33: donation is not newsletter consent; current channel preferences/consent at dispatch; required financial notices separate.
- P16:1425–1466: Gentle pledge reminders specifically scoped, Off by default, exact plan/contact/purpose proof; no generic cultivation reminder substitution.

**D2 answer effect:** Clarification only, required now to avoid implying a shared ministry record is a shared donor network. Actual P27/P28 interaction visibility and missionary actions remain open.

**Exact amendment/acceptance:** Add/remove participant or cultivate a supporter creates no consent, recipient enrollment, contact affordance, reminder or delivery. A restrictive change between prepare/dispatch fences the unstarted effect. Existing permitted service/required financial notice remains independently evaluated; it must not be suppressed merely because an unrelated cultivation flow ends.

### F8 — No dependency on a public page, finance binding or Studio; no legacy substitute when source is missing

**Severity:** High for operational usability and authority. **Likelihood:** Medium/High while source implementations are incomplete.

**Case:** A new ministry starts cultivating prayer/support partners before finance assigns its support context or editors publish its page. A screen refuses all cultivation, or “helps” by using a current missionary profile/fund as a synthetic Ministry Assignment.

**Evidence:**

- P22 D19:3298–3302,3346–3350: Page work itself independent of Support Binding/P21; no support card/placeholder unless independently configured and authorized.
- Roadmap:4079,4091,4157: native development independent of optional workflows; exact source qualification only for affected features.
- P27 target owner is P9, not P22 CMS. Source creation belongs to P9; phase source consumer status does not relocate ownership.
- /workspace/core/docs/prds/workflow-studio/09-implementation-backlog.md:299–313 splits WS-18-CORE from WS-18-GIVING. Development-only CORE depends WS05/09/10/14; GIVING source certification not an all-pack back-gate.
- Acceptance DON14–16 at /workspace/core/docs/prds/workflow-studio/10-acceptance-scenarios.md:1295–1329 is **specified_not_executed**, not runtime proof.
- Current exact-source scan found no implementing Ministry Assignment service/table in inspected paths; person-keyed code cannot substitute.

**D2 answer effect:** Include independence from page and optional finance binding; that follows choosing a CRM identity. Native tasks/reminders must remain independent from P34/P42 per user request. Does not waive genuine qualification of P9 source or communication/financial owners.

**Exact amendment/acceptance:** With a qualified Ministry Assignment but no Page/Support Binding, authorized native Party enrollment, nonfinancial asks/notes/tasks and source-linked history remain usable to the extent independently qualified. Financial summaries show accurate omitted/unavailable/not-configured state as appropriate, never zero or another fund. With Studio unavailable, complete assign→enroll→ask→response→next-action journey still works; later activation reuses completed native effect identity. If Ministry Assignment owner itself unqualified, block dependent action explicitly; do not mint one in P27 or infer from worker profile.

## Financial boundaries that D2 does not decide

These should stay on the upcoming coverage list, not be disguised as safeguards already chosen by the founder:

1. Enrollment uniqueness among Party × purpose × Ministry Assignment; duplicate discovery versus allowed distinct purpose; no automatic enrollment from roster, gift, Page or relationship edge.
2. Who can initiate, see, edit and end an enrollment; accountability and staff/missionary/private encounter policy; no assumption that contributors or participants own it.
3. What changes constitute same continuing purpose versus explicit successor/closure, and how open asks/tasks/reminders are disposed.
4. What “accepted ask” means versus a P16 evidence-backed promise; exact source coverage and ask outcome links; how recurring support and appeal-specific asks relate.
5. Staff attribution and recognition vs organization-wide conserved totals; overlapping appeals, households, churches/DAFs, refunds and partial corrections.
6. RFM source grain/window/currency/entity, minimum completeness and missing data; no person financial worth inference.
7. Native effect identity and allowed independent organization/missionary stewardship, communication purpose and suppression.
8. P13 campaign live-association vs frozen/immutable linkage conflict remains P13-owned (already logged E7); D2 neither resolves nor depends on it.

## Minimal material consequences to explain to the founder

“Your choice lets a donor’s partnership stay connected to the ministry when its team changes. It does not hand a departing missionary’s donor relationships, private history, promises or gifts to whoever joins next. The ministry, the people involved, the giving destination and the staff responsible remain separate. If the actual ministry closes or changes purpose, the organization must deliberately decide what continues and what ends.”

No further answer is necessary merely to preserve these settled financial boundaries. If the founder intended automatic transfer or shared access, that intent must be surfaced as a material owner amendment before ratifying it. The next genuine product question can focus on deliberate enrollment entry or accountable sharing; finance details can follow without reopening the Ministry Assignment choice.
