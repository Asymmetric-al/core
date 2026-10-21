/grill-with-docs

# Phase 28: Missionary Workspace Depth & Support-Raising CRM

**Repository:** `Asymmetric-al/core`  
**Primary surface:** Missionary Workspace, with independently authorized staff and coaching views.  
**Stable slug:** `missionary-workspace-depth`

## 1. Purpose and product outcome

Run a deeply researched founder-grooming session that resolves everything needed to fully deliver Phase 28.

Give every missionary a practical home for building and maintaining a support team inside the sending organization's existing CRM. They must be able to pursue a referral, arrange an appointment, prepare an ask, understand commitments and received gifts, complete follow-up, send a permitted newsletter, and review progress without maintaining another database or waiting for another product to synchronize.

Honor `openspec/specs/platform-product-intent/spec.md`: Asym serves missions sending organizations. A missionary is a user inside an organization, not a standalone tenant. The four product surfaces remain one connected platform with distinct responsibilities.

Optimize for ministry work, not feature count. The ordinary experience should explain what changed, why it matters, who is responsible, and what can be done next. Preserve meaningful prayer, practical, church, and financial partnerships without treating people as sales opportunities or donor-value scores.

Use the founder's latest Phase 28 brief as the proposed outcome baseline. Distinguish those requested outcomes, accepted predecessor decisions, new research, and your recommendations. Do not quietly replace any of them with an older roadmap or competitor model.

## 2. Session and approval boundaries

Research and grill only. Do not implement, modify GitHub state, activate integrations, change live data, or contact real supporters.

Do not create a PRD or formal specification until I explicitly invoke `/to-prd`. Do not draft or publish implementation tickets, issues, epics, or their dependency graph until I explicitly invoke `/to-issues`.

Read the current `/grill-with-docs` skill. Where installed skills use `/to-spec` or `/to-tickets`, explain the mapping before the transition and obtain explicit authorization. Previous authorization for another phase does not authorize this one.

Ask one meaningful decision at a time. Choose the questions dynamically from research, unresolved dependencies, and my answers. The areas below are a coverage map, not a questionnaire or predetermined implementation. Any examples are suggestions only.

Maintain research, terminology, decisions, and outstanding risks without presenting an unrequested formal specification. Answer engineering questions from evidence yourself; ask me genuine product choices with understandable context.

## 3. Establish current repository and predecessor truth

Read root and relevant scoped `AGENTS.md`, `CONTEXT.md`, ADR-0001, `docs/ai/document-authority.md`, the ownership matrix, product intent/principles/boundaries/surfaces, and relevant OpenSpec specifications and active changes.

Read the current SiteStacker parity `roadmap.md`, `phase-map.md`, `README.md`, and `parity-matrix.md`, together with `docs/prds/program-roadmap/` governance, delivery contracts, owner constraints, decisions/gates, and GitHub-impact records. Verify current numbering and amendments instead of using the older 41-phase snapshot.

Review predecessor specifications through Phase 27 and follow their exact consumer obligations. Prioritize Phases 3/4/9/10/11/12, 13/14/15/16, 6/17, 21/22, and 25/26/27. Historical PRs #465, #872, #1235, #1323, #1340, and #1558 are entry points, not a substitute for current adopted contracts.

Read Phase 27 specification issue #1992 and PR #1993 closely, including its current branch, normative volumes, `owner-reconciliation.md`, OpenSpec, published implementation index, review resolution, and correction proposal. Its latest inspected publication distinguishes the approved issue graph from proposed acceptance/dependency corrections. Recheck what has actually been approved and applied; never treat the proposal as an already-mutated tracker.

Inspect the relevant source tickets, including #1998 for Phase 9 Ministry Assignment identity, #2001/#2006 for shared partnership context, #2004 for continuing partnerships, and the Request, appeal, and shared-task producers identified by the current graph. Search for existing Phase 28 work and narrow newsletter-purpose enablers before inventing new tickets.

Distinguish ratified intent, document integration, implementation, real authorization/provider qualification, and live release. Do not claim to have read every predecessor because you searched its title. Keep an evidence map of the sections and tickets actually inspected.

Preserve unresolved owner gates, including E7 financial temporal attribution, C-01 posted-correction policy, and the Phase 6 preparation/sealed-submission producer wherever still unresolved. A missing exact producer blocks the affected capability, not every independent workspace feature. Do not hide it with a local substitute.

## 4. Inspect the existing workspace end to end

Trace the actual missionary dashboard, supporters, tasks, analytics, profile/settings, notifications, and Ministry Update controls through `apps/missionary`, `packages/api/src/missionary-portal/`, shared database hooks/collections, source services, migrations, and tests.

Inspect `service.ts`, `model.ts`, `redaction.ts`, donor mutations, and task operations. Revalidate the previously observed capped reads, loaded recurring-gift sums, `funding_goal`/`current_funding`, USD/two-decimal fallbacks, legacy `donors.missionary_id`, and separate `missionary_tasks` storage. Investigate anonymity coverage and public/published post defaults.

These are investigation leads, not predeclared vulnerabilities or decisions to preserve. A server API, plausible screenshot, passing mock, or migration file does not establish correct source meaning or complete runtime behavior.

Identify exactly which current patterns are reusable, which are temporary, which need replacement, and which source-backed flows are missing. Preserve user changes and retained data; do not assume an empty production database.

## 5. External research, with three additional priority benchmarks

Study official documentation, tutorials, release information, public demonstrations, and published screenshots. Separate demonstrated behavior from vendor claims, dated instructions, testimonials, and announced features. When authenticated testing is unavailable, state the limit rather than inventing results.

Maintain a compact comparison: user job, documented behavior, source/date, strength to learn from, limitation, Asym owner, and unresolved product choice. Competitors are references, not new dependencies or permission to copy implementation.

### DonorElf: clarity and understandable follow-up

Read its current site, dashboard examples, and Knowledge Base, especially News Feed Events, pledges, donation types, notifications, contact/group management, Mailchimp sync, and balance adjustments. [DE1], [DE2], [DE3], [DE4]

Its documentation offers a useful pattern: explain the event, explain why it happened, and offer a relevant action. Evaluate that pattern for a calm daily queue, meaningful gift attention, optional summaries, and understandable support trends.

Its published dashboard separates recent giving, a historical monthly average, pledge-based progress, and an account balance. Learn from the distinction, not from its formulas or layout. Its current site also emphasizes prayer/prospective partners, tasks, custom properties, filtering, and mobile-browser use. [DE1]

Several detailed help articles are old. News Feed Events was last updated in 2016. Do not adopt its fixed late/stopped thresholds, inferred pledge instructions, recovery-rate claims, or donor-level labels as Asym policy. Phase 16 owns actual commitment attention. DonorElf's integration-based account model and balance-adjustment workarounds must not become a second Asym ledger. [DE2], [DE3]

### Sola: organization-connected planning and support visibility

Study its Features, FAQ, and Onboarding pages. It documents organization-provided access, monthly/one-time goals, contact plans, gift and expense visibility, multiple accounts, training, notifications, and permission-sensitive oversight. [SO1], [SO2], [SO3]

Evaluate how to make a new support raiser's starting experience and a long-term missionary's maintenance experience useful without splitting Core into different CRMs or rigid lifetime user types. Consider optional organization-approved getting-started guidance through existing resource owners, not a compulsory course or new learning-management product.

Its pages use both real-time language and daily-update descriptions. Asym must show actual source currentness, not inherit a refresh promise. Its documentation also describes report conversion at today's rates and automatic Mailchimp contact addition. Do not copy those behaviors without the exact currency and communication-purpose contracts; reported comparison is not original money truth, and a contact is not subscription authority. [SO1]

### Epistle: low-effort communication and an expanding MPD product

Research its Tour, MPD, Security, privacy, and Giving Impact pages. Do not treat it only as a newsletter tool: the MPD page also describes multi-person donor profiles, field history, multiple commitments, tasks, currencies, print export, and coaching/assistance. Verify what is documented, demonstrated, or announced. [EP1], [EP2], [EP3], [EP4]

Study short photo/video updates, recoverable drafts, supporter responses, and the reduction of repeated layout work. Its tour describes daily/weekly/monthly recipient preferences and combining updates into emails. These are research candidates, not automatically approved Asym digest or scheduling requirements. [EP1]

Evaluate reuse of an approved Ministry Update in a separately prepared newsletter without making the two objects or their audiences identical. Phases 22, 25, 17, and 6 must own any proposed extension. Do not silently change existing notification cadence or introduce a second publishing/delivery pipeline.

Study its private-post, invisible-site, and notification-only email options as distinct protective ideas. Its own security guidance warns that the service is not appropriate for every high-risk communication. Do not equate private access, TLS, or the label secure email with an assurance that disclosure cannot cause harm. [EP3]

Treat claimed fundraising improvements and deliverability rankings as vendor evidence to examine, not a forecast for Asym. Email opens/clicks are also not proof of human reading or relational engagement: privacy prefetching and scanners affect them. [EP4], [EM1], [EM2]

### Wider comparison

Keep MPDX and TntConnect as specialized support-raising references; SiteStacker as an integrated ministry reference; and Virtuous, Raiser's Edge NXT, Salesforce nonprofit, Bloomerang, and Keela as comparisons for relationship context and usability. Reuse existing research where current and relevant rather than researching every feature from scratch.

Use TntConnect's distinction between planned tasks, actual interaction history, method, and purpose. Do not inherit local-database sharing or editable financial workarounds. [TN1]

Recheck current Resend, email standards, first-party UI/data-library documentation, and accessibility guidance whenever decisions depend on them. Use the installed versions and exact provider capabilities, not remembered APIs.

## 6. Carry forward the critical ownership decisions

Phase 9 owns Parties, relationship sources, Ministry Assignments, referrals, qualified interaction records, and shared tasks. Phase 27 owns continuing partnerships, Requests, Appeals, and stage meaning. Reuse them through scoped services; no personal shadow CRM or duplicated portfolio.

A login, Party, Ministry Assignment, Support Assignment, participant membership, responsible worker, Page contributor, newsletter recipient, and coach are distinct. Membership or a familiar label does not grant another person's records or money access.

Phase 13 owns contribution-line facts; Phase 14 owns recognition; Phase 16 owns commitments and fulfillment; Phase 21 owns financial balances/plans/assessments/expenses. Phase 28 owns qualified fundraising goals and its native task/audience purposes, not a second financial truth.

Phases 3/10/12 own disclosure, classification, and capabilities. Phases 6/17 own communication eligibility, approved content, sender identity, preparation, dispatch, and history. Phase 22 owns specialized Ministry Updates/public-page operations. Phase 25 retains donor preferences and the accepted newsletter-request contract. Phase 26 owns support work, not all interpersonal communication.

The newer Phase 27 contract uses continuing partnerships and financial/nonfinancial Requests. Its appeal board is Request-level, not a mutually exclusive five-bucket money status per supporter. Voluntary new shared context does not create managed enrollment, compulsory logs, quotas, financial ratings, or coaching access.

Keep three meanings distinct even when composed on one screen: operational attention, relationship interaction history, and published ministry stories. Likewise, a stage, a task status, a commitment occurrence, a newsletter preference, and a financial balance are not interchangeable status fields.

## 7. Coverage to resolve: daily work and relationships

### Daily queue and low-friction completion

Show upcoming appointments, overdue follow-up, qualified gift attention, referrals awaiting action, and deliberately managed relationships missing a next step. Explain reason, source/currentness, responsible person, and permitted action for every item.

Support phone-friendly filtering, prioritizing, rescheduling, completing, and recovering interrupted actions. Avoid duplicate cards for one obligation or a queue dominated by informational changes.

One deliberate completion may record the actual outcome and update shared history without duplicate entry. However, checking a task, opening a dialer/mail app, copying an address, or rescheduling must not invent a completed call, sent message, gift, or donor response. Preserve attempted, completed, cancelled, and deferred meanings.

### Supporters, prospects, and households

Provide complete authorized search/saved lists and useful detail for individuals, households, churches, and organizations: contact methods, relevant relationships, permitted interests/notes/history, commitments, and communication preferences.

Settle private-prospect admission, staff visibility, promotion/deduplication, and correction ownership. Allow legitimate nonfinancial relationship work without inventing a donation, but do not expose the entire organizational CRM as a lookup convenience.

Resolve spouses, teams, shared church mailboxes, designated contacts, and a person participating in several ministries. Coordinate contact without giving one household member the other's private history. Reuse governed custom fields where appropriate; do not make unlimited private properties a parallel schema.

### Referrals and stages

Use source-linked referral provenance, permitted chains, ownership, expiry, and explicit cannot-pursue dispositions. Resolve duplicate referrals, loops, corrections, source privacy, and deliberate continuation after expiry without granting contact permission.

Use Phase 27's configurable stage lists for research, contact, appointment, decision, and partnership work. Preserve unassessed states, history, pauses, review, terminal dispositions, and next-action exceptions. Prayer/special/financial participation need not be a compulsory sequence.

List and board views operate on the same records. Never Ask and applicable contact restrictions must block prohibited suggestions, audience admission, and sending through the consent owner; moving a card cannot reverse them.

## 8. Coverage to resolve: support and stewardship

### Goals, commitments, and actual support

Support recurring and special-gift goals, fundraising periods, optional activity targets, and multiple concurrent commitments per partner. Preserve Legal Entity, currency, period, cadence, scope, and completeness.

Use Phase 16 for expected support and attention. Distinguish unconfirmed intent, irregular patterns, pending payment, pause, skip, partial fulfillment, and a genuinely overdue occurrence. Do not label a person lapsed or infer debt from missing data.

A missionary recording a conversation about giving does not authorize a charge or edit a donor's recurring instruction. Use the donor/staff owner's qualified path for those effects.

Phase 28 Goal Versions remain distinct from finance Support Plans. Explicit adoption from an approved plan may retain provenance; later changes do not synchronize automatically. Phase 22 separately adopts an exact goal for prospective public release.

Explain expected, received, and still-needed support without mixing currencies, double-counting recognition, or subtracting incompatible periods. A historical average is not guaranteed monthly income.

### Financial visibility and insight

Provide useful monthly progress, a 13-month trend, partnership gains/losses, appeal outcomes, and source-qualified attention. Explain what each measure counts. Changed financial support is not lost human relationship value.

Show only Phase 21's currently authorized Support Assignment and publication-profile modules. Keep confirmed balances, provisional activity since close, balance coverage, reserve position, assessments, compensation, and expenses distinct and through-dated. All authorized parallel currency balances remain discoverable; do not hide them behind a converted headline.

Do not recompute balances from gifts or rename forecast support as spendable money. Offer qualified expense and statement entry points through existing owners, not duplicate finance forms. Omit irrelevant optional modules rather than displaying false zeroes.

### Native gift-aware stewardship

Create required source-qualified tasks for a first gift, special/above-commitment gift, fulfillment, and permitted recurring attention. Define first/special relative to qualified history and purpose, not a loaded page or assumption.

Keep direct gifts, DAF recognition, household credit, church remittances, and employer matches distinguishable. Only the relevant allocation is exposed. Anonymity must survive titles, notifications, lists, exports, and linked history.

Coordinate organizational and missionary follow-up using permanent source-purpose identities. Retries, imports, duplicate events, corrections, and future workflows cannot repeat one intended effect; genuinely distinct authorized communications remain distinct.

Correct or end stale unstarted tasks when facts change without erasing completed history. Do not automatically send donor-facing thanks because an internal task exists. Qualified manual interactions remain usable during provider outages.

### Appeals and continuity

Reuse Phase 27 Requests and recorded appeal working lists, including optional goals, exact asks, responses, next actions, and qualified financial links. Working-list filters must not silently change planned recipients.

Handle partial responses, overlapping appeals, recurring support alongside special gifts, actual offline gifts awaiting finance, and incomplete attribution. Phase 15 owns reported gifts in hand and finance intake; a missionary cannot manufacture posted money or a receipt.

Preserve obligations and source history through reassignment/departure without silently transferring access. Concurrent edits and changed contact restrictions must be rechecked before consequential acceptance or dispatch.

## 9. Coverage to resolve: communication and content

### Shared interaction history

Record an actual encounter once with method, purpose, occurrence time, recording provenance, outcome, and approved audience. A newsletter, automatic receipt, or record edit is not automatically a personal conversation.

Apply Phase 27 D26: only eligible new shared context crosses surfaces under current permission and explicit historical-access rules. Do not copy, summarize, or relabel private CRM, Support, or care notes into shared material.

Make audience visible. Participation remains voluntary. A missing log does not prove inactivity, and contributing an update does not impose a next-action obligation or enroll the missionary in coaching.

### Complete native newsletter and print work

Resolve preparation, approved layouts/content/media, audience review/exclusions, mock previews, authorized test sends, scheduling scope, final confirmation, delivery outcomes, and cause-specific repair through Phases 17/6. Do not force the full staff Email Studio administration interface into the workspace or call Resend directly.

Support Email, Physical, Both, and None alongside exact topic consent, valid destinations, suppressions, and source ownership. No gift, referral, group/tag, stage, or changed contact address implicitly subscribes someone.

Preserve per-recipient privacy, current suppression at dispatch, clear recipient grouping, retry safety, partial results, and honest outcomes. A verified sender, prepared message, provider acceptance, delivery, and actual reader response are different facts.

Produce usable print lists and mailing-label data with international addresses, approved salutations, safe household deduplication, exact selection, and missing-address repair. Exported, printed, mailed, and delivered remain distinct; downloaded files cannot be recalled.

External sync belongs to Phase 32. Native newsletters must work without it. SMS is not required to complete native email/print work.

### Preserve the request-only newsletter doorway

Read Phase 25 `contracts/experience.md` EX11–EX13/EX16 with its Phase 23/17/6/12 producers. The existing public Request newsletter occurrence is a limited handoff, not subscription, verified identity, supporter admission, or a CRM prospect.

Complete the narrow P28/P12 intended-recipient projection without widening roster access. Preserve frozen recipients, current authority, request-body retention, independent notification/handoff outcomes, and the Phase 32 prohibition on automatic external enrollment from that request.

A native newsletter signup or Epistle-style preference center that changes this journey needs an explicit owner amendment. Do not convert previous requests, follows, reading, or interactions into consent.

### Ministry Updates and low-effort communication

Learn from Epistle without merging owners: make safe photo/story drafting, recovery, submission, approved reuse, and current publication state easy through Phase 22.

Settle whether short-update reuse, digest preparation, or recipient-controlled cadence belongs in this release. These are proposals requiring exact content, audience, preference, and dispatch contracts, not previously approved scope. Avoid double-sending a post notice and newsletter unintentionally.

Public, protected-reader, newsletter, and notification-only delivery have different disclosure consequences. Recheck titles, images, filenames, URLs, previews, quoted replies, tracking, and restricted-worker aliases, not only the main body.

Use source-approved engagement/response controls. Do not add another social graph, message inbox, or source of read/prayer history. Opens and clicks are diagnostic evidence with limitations, not relational truth or permission to pressure supporters.

## 10. Coverage to resolve: coaching, resources, and connections

### Invited coaching

Settle internal/external coach assurance, deliberate invitation/acceptance, exact read-only modules, duration, revocation, historical scope, and recovery. A coach is not an impersonated missionary or automatically a staff user.

Provide separately chosen activity targets, trends, qualitative check-ins, and agreed next actions. Goals must accommodate different organizations, stages of ministry, cultures, and part-time contexts rather than mandate one agency's method.

Redact through source projections. Initials plus exact amounts can still identify people in small groups; qualify aggregate/detail/compare/export behavior. No default raw donor finances, private notes, care records, or Field Account access.

Shared history cannot become compulsory reporting, missing-log penalties, rankings, or automatic coaching enrollment. Source-required operational duties remain distinct from optional coaching.

### Resources, guidance, and geography

Provide qualified internal resources and public-page/Ministry Update entry points through their owners. Consider contextual getting-started help inspired by Sola, not a new LMS or compulsory course.

Resolve the first-release resource/library/region scope. Use Phase 29 custody and exact document access rather than another storage service. Geography must be independently approved and generalized; no precise restricted locations or sensitive coordinates sent to third-party maps. Provide an accessible list alternative.

### Calendar, email, imports, and continuity

Decide required connection scope with Phase 31: exact accounts, read/write powers, mapping, sync direction, currentness, revocation, conflict and recovery. A settings card is not a connector. An invitation is not evidence a meeting happened.

No broad mailbox/address-book ingestion or shared credentials by default. Imported records use source-owned validation, identity, provenance, suppression, and qualified Phase 30 migration. Never trigger historical outreach or infer consent from an imported list.

Incumbent DonorHub/TntConnect/MPDX continuity is a bounded transition capability, not middleware inside native Asym. Preserve a useful manual path during external outages.

Phone usability and interrupted-submit recovery ship here. Full offline synchronization remains separately qualified with Phase 39; do not persist restricted data or silently replay unapproved sends, opt-ins, publication, or money commands after reconnect.

### Qualified assistance

Core treats AI assistance as a product direction, but no competitor announcement establishes a ready Asym capability. Evaluate helpful drafting, explanation, and preparation only through qualified source/assistance contracts. State what ships here versus later; ordinary work must function without AI.

Do not send private/care context to a model, fabricate stories or commitments, infer wealth, or autonomously contact supporters. Source writes, donor-facing sends, and financial effects retain explicit human approval and current authority. Preserve the author's voice without importing a competitor's theological curriculum or donor-pressure tactics.

## 11. Implementation, migration, and usability

Use current Bun/Turborepo/Next.js and the exact shared Base UI/base-maia system in `packages/ui`. No Radix substitution, local theme, or primitive fork. Shared hooks/collections and TanStack tools serve justified jobs, not a requirement to turn every interaction into a grid.

Business database logic stays in `packages/api`; app API routes remain thin. Server-derived context, current permissions, source eligibility, expected revisions, scope-complete uniqueness, and permanent operation identities protect consequential commands.

Apply authorization before enumeration, joining, counts, facets, ranking, paging, export, and serialization. Protect against disclosure through totals, task titles, notifications, cache keys, logs, or invalidation payloads. Context changes must clear unsafe client state and reject late responses even when cancellation fails.

Keep forms short, progressive, and recoverable. Preserve focus and list position. Use accessible list/board alternatives, keyboard/single-pointer operation, readable status, mobile reflow, touch targets, long international names, and honest local errors.

Saved means server-acknowledged. Lost response means reconcile the same operation, not silently retry with new meaning. A succeeded write stays succeeded when a refresh fails. Unknown and unavailable are not zero, empty, or completed.

Migrate reached duplicate supporter/task/personal-note models only after a retained-data census. Preserve IDs/provenance, lawful history, current restrictions, completed effects, and unresolved work; fence old writers. Restore/rollback cannot revive consent, access, or outreach.

Phases 32/34/35/43/44 extend native work without becoming blanket prerequisites. Give each exact dependency an owner, contract, source ticket, qualification, unavailable state, and repair path. Do not build substitute source authorities to avoid a blocker.

## 12. First-principles evaluation and human explanations

Use the repository as evidence, not unquestioned authority. Evaluate actual user need, correct surface, clean source of truth, necessary data, who may see/change it, leakage risks, duplication, simplicity, five-year maintainability, and avoidable future refactors.

Before relying on a material pattern, classify it and explain why:
- **Durable pattern:** intentional, documented, and aligned.
- **Useful precedent:** helpful, possibly needing refinement.
- **Temporary bridge:** useful earlier, not automatically permanent.
- **Implementation accident:** shaped by past constraints or incomplete work.
- **Conflict with first principles:** technically possible but wrong for product, safety, ownership, or usability.

Ask whether we would choose it again today and whether newer phases change its suitability. Challenge accidental structures and overcomplicated replacements. Accepted decisions require explicit scoped amendments, not silent reinterpretation.

For each founder question, start with a recognizable real-world situation and the whole Asym product. Explain what we are deciding, why it matters, what changes for users, what could go wrong, and which future features it affects.

Then explain the implementation consequences in normal language: records, APIs, permissions, services, screens, workflows, tests, and eventual tickets. Define jargon at first use. Assume zero technical experience, not weak product judgment.

Explain reasonable options, practical cost/risk/flexibility/maintenance tradeoffs, and your recommended direction. Ask one clear question. Consider missionaries, supporters, donors, staff, finance, editors, coaches, public visitors, and organizational leadership. Do not hide complexity or bury the choice in technical vocabulary.

## 13. Adversarial check after every answer

Use these exact headings with brief, specific findings:

## Adversarial check
### What could go wrong with this answer?
### What hidden assumptions are we making?
### How does this affect the whole product?
### How does this affect the end-user experience?
### Does this follow modern best practices?
### Does this fit Asym’s existing repo and product direction?
### Should we adjust the recommendation?

Pressure-test security, privacy, financial meaning, source ownership, duplicate effects, unnecessary monitoring, confusing UX, operational burden, and future rework. Check the real user problem, not only consistency with existing code or a competitor.

When needed, say: “I would push back on that. The reason is...” Explain the assumption, risk, cleaner approach, and decision to reconsider.

Bring material findings back before ratification. Incorporate and briefly record minor safeguards that preserve my intent. A scope, access, ownership, or compulsory-reporting change is never minor hardening.

## 14. Readiness and complete-journey proof

Maintain a decision log, terminology map, coverage checklist, source register, and dependency/conflict register. Separate confirmed choices, proposals, assumptions, deferred scope, and evidence not obtained.

Resolve enough for an implementation-ready specification: journeys, source ownership, permissions, business transitions, financial/communication meaning, migration, failure/recovery, operations, and measurable acceptance. No required outcome disappears because it has a difficult predecessor.

Prove a representative missionary can go from referral to appointment, record an appropriate Request and source-owned commitment, recognize a qualifying arriving gift, finish follow-up once, send a permitted native newsletter, and review approved progress with an invited coach.

Include real source-service and database proof for multiple currencies/commitments, shared households/churches, anonymous gifts, partial recognition, incomplete history, stale balances, changed consent, revoked access, duplicate events, concurrent edits, and interrupted submissions. Completing work must not fabricate an interaction or a financial effect.

Prove newsletter-recipient-only and coach-only access cannot become supporter/finance access; private notes cannot be laundered into shared updates; and recipient preference changes stop applicable unstarted mail without rewriting delivered history.

Prove native tasks/newsletters remain usable without optional workflows, external newsletter sync, SMS, or AI. Include manual paths during outages, migration/restore without replay, bounded query/client-memory behavior, and accessible phone/desktop journeys.

Mocks, documentation checks, demo authentication, and vendor claims are not runtime qualification. Use actual owner test seams, disposable real-role PostgreSQL/Supabase checks, concurrency tests, provider-contract evidence, and representative missionary/staff/coach pilots.

Set measurable task-success, time-on-task, navigation, and poor-network budgets from real journeys. Do not invent performance claims or measure success only by ticket count, log volume, or notification engagement.

Only after `/to-prd`, write the formal specification. Only after `/to-issues`, publish granular, nonduplicative tickets with exact predecessors, blockers, acceptance, and proof; verify the resulting GitHub records and dependencies by readback.

Begin with a short plain-language orientation, the important inherited decisions, and the single highest-leverage unresolved question you choose.

## Research starting points

[DE1]: https://www.donorelf.com/
[DE2]: https://donorelf.helpscoutdocs.com/article/34-news-feed-events
[DE3]: https://donorelf.helpscoutdocs.com/article/14-making-balance-adjustments
[DE4]: https://donorelf.helpscoutdocs.com/
[SO1]: https://www.trustsola.com/features
[SO2]: https://www.trustsola.com/faq
[SO3]: https://www.trustsola.com/onboarding
[EP1]: https://www.epistle.org/tour/
[EP2]: https://www.epistle.org/mpd/
[EP3]: https://www.epistle.org/security/
[EP4]: https://www.epistle.org/giving-impact/
[EM1]: https://mailchimp.com/help/about-bot-activity/
[EM2]: https://mailchimp.com/help/apple-privacy-faq/
[TN1]: https://www.tntware.com/tntconnect/help/en/pages/taskhistory_tasktypes.aspx