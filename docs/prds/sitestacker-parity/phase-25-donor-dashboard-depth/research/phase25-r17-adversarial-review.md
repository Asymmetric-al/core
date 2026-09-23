> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Ratified,8September2026:** Conrad explicitly accepted Question17’s corrected All-first direction, including its content limits, presentation defaults and execution safeguards (A1–A4/J01–J12/V1–V8/C01–C22). T01–T15 remain required target proof. Earlier provisional wording below records review history; ratification does not certify implementation or live behavior.

# Question 17 — A calm, useful donor notification center

**Disposition: Accept with required amendments.** Conrad tentatively chose A — All notifications first, while explicitly questioning notification noise, uncertainty and upkeep. Keep A, but narrow its meaning to a curated, bounded view of relevant notices. The corrected execution below is recommended for founder ratification; it is not yet ratified.

Research conducted 7–8 September 2026. This is a completed grooming review and decision record, not a PRD, formal specification, implementation plan or published ticket set. Questions 01–16 remain accepted. Q14 G01 remains unresolved. Current source was inspected at develop `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`; source intent, present implementation and verified runtime are distinguished throughout.

## The corrected decision to record

> The donor notification bell opens All, meaning a small, relevant set of currently authorized notices. It presents genuine current actions first and recent important information below, with Needs attention available as a focused view. It does not become a feed of every gift, email or ministry post. The initial bell preview is bounded; older notices are available deliberately in the full center. Reading affects unread status only. Source resolution, current access and the existing Phase 17 presentation policies determine whether a notice remains. Ordinary use does not require the donor to maintain an inbox or reach zero unread.

The recommendation is **All with disciplined admission**, not “put everything in All and let the donor sort it.” Changing the default tab alone would not solve excess notifications.

### A1 — Explicitly limit what earns a donor bell item

Adopt the three finite families in the admission matrix below: a genuine recurring-giving action, a source-admitted material official-statement/receipt change, and a material financial correction/outcome. Every exact meaning must use its owning source and a qualified Phase 6/17 donor in-product contract. Preserve independently required donor in-product notices from their exact accepted contracts; this is not a wildcard admitting anything labeled important.

Do not add ordinary payment/receipt success, routine ACH processing, routine saves, every Ministry Update, marketing, staff repair work or historical imports. Do not add generic identity/setup notices merely because Question 12 can show an owner-qualified need on Home. Necessary in-flow status and independently required communications remain intact. This is an explicit proposed product-scope refinement, requiring ratification.

### A2 — A bounded preview, with deliberate access to more

Recommend **up to five attention groups in the desktop bell preview** and **20 groups per request in the full center**, reached by View all notifications. On a phone, the bell opens the same full-center page directly, with normal Back navigation. More results load only on deliberate request. These are reviewed presentation defaults, not industry-standard limits, retention rules or caps on real obligations. They may be tuned later with usability/performance evidence without weakening complete access, current-action prominence or the no-endless-preview outcome.

All presents current source-actionable groups first, then recent information/resolved history. A concise Needs attention section explains the ordering; Recent appears only when it has entries. Urgent precedes Attention only when the source proves that classification; within a class use the existing qualified source order and stable date/id tie-breaks. Never rank by donation amount, fundraising value, engagement or invented urgency. If more current actions exist than fit, show their correctly scoped count and an explicit route to all of them. Do not imply the five visible rows are the entire set.

### A3 — Keep the existing lifetime and make engagement predictable

Preserve ADR-0027's exact two policies. Information loses unread treatment at the earliest read, archive, correction/supersession or 30 days from availability; it stops being presented at 90 days from availability. Required actionable items remain while the source requires them and access holds; they become non-unread recent history for 90 days from the once-set source end. Access loss removes presentation earlier in either case.

The donor UI offers clear read controls and secondary Archive/Restore only where allowed. Opening the bell does not mark everything read. No automatic marking from email opens, browser prefetch, scrolling past an unrendered row or source completion. Do not add a donor Mark unread or undo-read feature that restarts an informational item's already-ended unread eligibility. Archive undo/restore remains subject to the original deadlines and current permission; it cannot revive unread treatment or required work. No new snooze engine, personal retention preference or cleanup ritual.

### A4 — Preserve one model and the actual human recipient

Phase 6/17 owns notification occurrence, grouping, local presentation and recipient engagement. Business services own actions and resolution. Resolve the human viewer/recipient separately from a represented legal donor/organization. Two treasurers must not share one read flag because both help the same organization. Keep the center inside the current Tenant, donor surface/role and selected giving context; never mix staff alerts or other represented contexts merely because the login is shared. Qualify these bindings in the canonical owner model, not a second donor notification database.

## Research: what is actually supported

**Church Center is the strongest direct nonprofit precedent found.** Its current official article, published 3 September 2026, describes a bell on both web and mobile, with new/unread notifications above previous ones and simple read controls. Its giving section discusses receipt email preferences; that does not prove receipt emails each create bell items. Its chat, groups and scheduling features are not Asym donor requirements. This is a **Useful precedent** for a findable, understandable notification surface, not evidence for unlimited activity or a particular Asym catalog. [Church Center notification guide](https://help.planningcenter.com/en/141287-view-notifications-and-update-preferences.html).

The earlier Slack/Teams evidence remains useful for broad entry plus optional filtering, but it is secondary to donor needs. Neither proves All-first has measured superior donor outcomes. [Slack Activity](https://slack.com/help/articles/19693583638803-Get-your-work-done-from-the-Activity-view), [Teams Activity](https://support.microsoft.com/en-us/teams/notifications-settings/explore-the-activity-feed-in-microsoft-teams).

The recommendation is a product judgment: donors should be able to find an important recent notice without having to understand unread-versus-actionable filtering, while the application does the work of limiting noise. There is no Asym comparative usability result or donor-retention improvement established by this research. Vendor marketing and absent documentation are not evidence of an existing or missing bell.

**Do not copy a generic dropdown demo.** The current shared seed contains Inbox/General tabs, hard-coded people and 8 New. It is an **Implementation accident / visual seed**. Actual `shadcn info --json` confirms base-maia, Base UI, Zinc semantic variables, Tailwind 4, Lucide and existing Popover/Sheet/Tabs/Item/Empty primitives. Use those shared primitives and their existing motion/focus behavior. The installed Base UI declaration is 1.5.0; current documentation is guidance, not proof that every newest API exists in that pin. [shadcn Popover](https://ui.shadcn.com/docs/components/base/popover), [Sheet](https://ui.shadcn.com/docs/components/base/sheet), [Tabs](https://ui.shadcn.com/docs/components/base/tabs).

**Correct interaction semantics matter more than resembling a menu.** A notification preview contains reading content, tabs, links and optional controls. Compose an appropriately named Popover on roomy screens and open the shared full-center page on a phone; do not force the entire surface into a command menu's keyboard model. A menu remains appropriate for a small row-action overflow. The Popover needs appropriate focus, Escape, close and return-focus behavior; the full page needs ordinary route focus and Back navigation. Use live announcements sparingly; the whole changing list must not chatter at a screen-reader user. [Base UI Popover](https://base-ui.com/react/components/popover), [WAI dialog guidance](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [WAI status-message guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

## What belongs in the bell

This matrix is proposed donor-surface adoption, not a claim these keys currently execute in product. Existing email/history authority does not grant bell authority. A Reserved key remains non-executable until its full owner-approved activation generation passes; required work must be delivered through the proper release, not a shortcut sender.

<!-- prettier-ignore -->
| Family | Useful donor meaning and destination | Admission and end rule |
| --- | --- | --- |
| Genuine recurring action | “Your recurring gift needs your attention” with the source's specific safe explanation and one Review gift / Continue verification destination. | Use the existing `recurring_action_required_v1` meaning. Exact current episode, recipient, remaining action or required continuing warning, and end predicate are required. A normal bank wait, every failed retry or Q06's optional make-up review is not automatically a required action. Source resolution/cancellation/supersession/expiry ends it; opening cannot execute a charge. |
| Important official-document availability/change | “Your annual statement is ready,” “Your statement has been updated,” or a truthful source-required withdrawal/correction notice. Open the current authorized document/detail in Receipts & statements. | Use the exact P19 availability/update/withdrawal delivery occurrence and P7/18 receipt correction meaning. Readiness alone, every rendered PDF and every download do not trigger notices. Source delivery-plan/exposure, current artifact and recipient rules govern; correction/withdrawal removes obsolete actions and unread treatment as applicable. Information does not become a task merely because View statement is clickable. |
| Material financial correction/outcome | A qualified refund result or amount/designation/payment-truth correction that matters to this donor. Open the same source-owned gift detail. | Reuse the exact P13/P17 correction meaning with a qualified donor in-product step. Successful, partial and failed refunds are different facts; use only the applicable variant for one business effect. Optional Get help does not make staff repair the donor's task. Information policy applies unless a separately enumerated owner contract truly requires donor action. |

**Protected exceptions remain exact.** If an accepted required donor in-product contract supplies another current notice, preserve it under its own key, proof and source-end rule. The implementation may not invent a catch-all key, generic important flag or tenant-authored notification bypass. A new content family needs an explicit reviewed contract amendment, not a dashboard setting.

<!-- prettier-ignore -->
| Excluded from the ordinary bell | Existing place for it |
| --- | --- |
| Each successful gift, ordinary receipt, email delivery/open | Giving history, Receipts & statements and governed receipt email. |
| Normal ACH submitted/processing, provider polling/retries | Warm submission confirmation and truthful owner status/history. Actual remaining steps stay in their qualified owner journeys. |
| Routine profile, preference or wallet save | Immediate local saved feedback and the relevant settings/detail. |
| Every Ministry Update, external newsletter, appeal or invented impact milestone | Dedicated Ministry Updates, Q07's independent email choice and the responsible communication/content owner. No new bell channel or hidden subscription is added. |
| Staff approval, document-rendering, suppression or delivery-repair incidents | Mission Control and the exact staff contracts. |
| Auth codes, magic links, provider tokens, private recipient/provider fields | Qualified authentication/provider collection channels; never preview/search/log content. |
| Historical email/import backlog | Its source history/audit. No fabricated unread migration debt. |

This keeps Ministry Updates easy to access and directly linkable as ratified. It does not dilute that reading experience into a notification list. Optional notification-channel choices do not alter the underlying feed visibility, receipts, delivery suppressions or required security messages.

## The donor journey — J01–J12

<!-- prettier-ignore -->
| ID | Journey and required outcome |
| --- | --- |
| J01 | **Arrive.** Resolve current Tenant, authenticated human and selected giving context. Bell state is scoped and honestly loading until known; no global cross-organization count or guessed zero. |
| J02 | **Open the bell.** Open All on neutral entry: desktop Popover shows up to five groups; a phone opens the shared full-center page with 20-per-load. Use the correct overlay/route focus behavior and keep Needs attention available. Opening does not mark all read or alter a source record. |
| J03 | **Understand the list.** Current actions appear first, Recent below when present. Each row says what changed/what is needed, enough safe context to distinguish it, useful time and one primary destination. No raw provider status jargon. |
| J04 | **Know whether to act.** Use a clear Action needed or contract-specific continuing-status label only where the source warrants it. Ordinary information has no urgent styling; a view link is not proof of a required task. |
| J05 | **Open a notice.** One activation opens the exact current safe destination. Record read through the canonical engagement command; failed engagement persistence must not block navigation or claim the source is complete. Current action permission is re-proved at the destination. |
| J06 | **Complete the real task.** Use the already owned recurring/document/history journey and its review/authorization rules. Completion on any authorized surface ends attention from source truth; do not create an extra “finished” notification merely to celebrate clearing the first. |
| J07 | **Return.** Preserve the chosen view and stable position where still valid. A resolved item becomes ordinary recent history, with obsolete action removed. An unseen resolved item creates no leftover unread debt and no fictional read event. |
| J08 | **Focus or see more.** Needs attention shows all currently actionable notification groups, including read ones. View all notifications opens the same view in the full center;20-at-a-time deliberate loading avoids an endless popup. Count and More indicate hidden eligible results truthfully. |
| J09 | **Manage without obligation.** Read a notice or explicitly mark notifications read. Eligible information/history can be archived and restored within its original window. Required current work has no archive/dismiss action. No donor must clear the list to proceed. |
| J10 | **Handle an empty/error state.** Empty All says “No notifications to show,” with existing history/document navigation still available. A true empty attention tab says “No notifications need your attention,” not a global “Nothing needs doing.” Home can have owner needs that are not bell events. Errors say notifications could not load with Retry; they do not become empty success. |
| J11 | **Handle change or interruption.** New arrivals do not steal focus or shuffle the row under a click. Lost access removes sensitive content/actions immediately. Reconnect reconciles with the server; offline cached data does not certify current authority or financial action. |
| J12 | **Let time pass.** The service applies original policy deadlines and source end without donor cleanup. Expired presentation disappears quietly; official records remain in their owning history/document destinations under their own rules. Returning months later does not recreate old unread notices. |

## Reviewed Maia presentation defaults — V1–V8

<!-- prettier-ignore -->
| ID | Default |
| --- | --- |
| V1 | Title Notifications; All and Needs attention tabs. Use shared base-maia components, semantic colors, existing spacing/radii/type and Lucide. No competing visual kit or app-local primitive fork. |
| V2 | Up to five groups in the preview; full-center requests of 20. Keep all required current items reachable. These are reviewable presentation defaults, not deletion or retention limits. |
| V3 | Current action section before Recent; only render nonempty section headings. Keep row ordering stable during engagement. Source urgency alone earns stronger treatment; no red wall for routine information. |
| V4 | Short clear title, one concise explanatory sentence where needed, minimal allowed context and accessible date. Use text for action/status. Show money only when the specific contract permits it, with original currency/minor units. Never expose sensitive ministry detail to make a row look personalized. |
| V5 | One primary destination/action per row. Read/archive in a secondary accessible control where permitted, without nested interactive links or hover-only reachability. No “Resolve” button owned by the notification surface. |
| V6 | Bell badge means canonical unread groups, not tasks. Its accessible name says unread notifications. Any Needs attention count is separately scoped. No excessive badges on every section, sounds, automatic popup or chore-like completion meter. |
| V7 | Desktop Popover with a visible close and reliable focus return; phone opens the shared full-center page with normal Back and route focus. Long names/translations wrap; 320-CSS-pixel reflow, 200% text and keyboard/screen-reader navigation remain usable. Shared touch targets and motion/reduced-motion rules apply. |
| V8 | Quiet loading/empty/error/offline states, clear Retry, preserved position, polite meaningful status changes. No toast on ordinary age-out. A failed read/archive request is distinguishable from success; source action safety never depends on a toast. |

## Adversarial check

### What could go wrong with this answer?

All could become an event dump, bury old required work, display stale financial instructions or expose a represented donor's information. Curation, bounded preview, source-first action status and current permission are required, not optional polish.

### What hidden assumptions are we making?

We initially assumed a broad default was enough and that donor bell contracts already supplied examples. Neither is established. Current donor in-product admissions and the canonical implementation need explicit owner work; comparable products do not prove Asym outcomes.

### How does this affect the whole product?

Home remains source-owned current needs; Updates remains reading; History remains giving; Receipts & statements remains official documents. Mission Control retains staff repairs. The bell points into these services and never becomes another source or task list.

### How does this affect the end-user experience?

The donor can quickly identify a real next step or find an important notice without facing every successful gift or post as unread work. Automatic aging reduces maintenance while actual required work remains clearly discoverable.

### Does this follow modern best practices?

It uses directly documented Church Center notification behavior as precedent, task-specific donor destinations, restrained feedback and established accessible primitives. The exact catalog, five/20 defaults and action-first grouping are reasoned Asym choices, not universal industry rules.

### Does this fit Asym’s existing repo and product direction?

Yes with explicit donor contract adoption: ADR-0001/0027, P6/17, P3/4/9/10/12, P13/16, P7/18/19, Q04/Q07/Q08/Q12 and Phase24 retain ownership. Existing mock dropdown and email queues do not provide the target behavior.

### Should we adjust the recommendation?

Yes. Keep All first, but require A1–A4 and the mapped execution. Do not ratify an unbounded “all activity” feed, and do not claim the unfinished donor contract/service/proof work is already complete.

## Individual category review — C01–C22

Severity describes the consequence of an incorrect implementation. Likelihood is qualitative exposure under the uncorrected proposal, not a measured production incident rate. A concern marked material means it needs the stated prevention before release, not that the current proposal or a live tenant has already suffered that failure. Each numbered requirement below is exact proposed execution language; related detail elsewhere refines it without creating a competing requirement.

### C01 — Problem validity, necessity and alternatives

**Material concern: yes — admission was underspecified. Severity: moderate. Likelihood: likely if “All” means every event.** The original answer chose a tab before settling why a donor needs each notice. A broad list can duplicate better existing destinations and make a small nonprofit portal feel like a staff inbox. Church Center validates the bell pattern, not Asym's whole catalog. The strongest alternative is Needs attention first with All adjacent; it reduces initial clutter but adds one tab switch to find recent informational notices and overlaps Home. A no-bell approach preserves records but does not complete the donor center explicitly reserved to P25. **Effect:** narrow A, do not replace it. **Required language:** “Admit only A1's enumerated donor meanings and separately qualified required contracts; every item must have a current donor purpose and destination. Neither an email nor a source record's existence is sufficient.” Prove included and excluded fixtures, not a snapshot full of invented examples.

### C02 — Brittleness

**Material concern: yes. Severity: high. Likelihood: plausible.** A row can become false when a payment finishes elsewhere, a document is withdrawn, a role changes or a provider event arrives late. Static preview text, remembered action links and client-side status inference break outside the ideal demonstration. P17 explicitly binds source fences and current applicability. **Effect:** retain A with source-aware reads. **Required language:** “Every presentation and destination re-proves current applicability and permission; outdated protected actions become inert/current-state navigation immediately. Immutable original facts are not overwritten to pretend the old notice was always current.” Test source changes while the panel is open and between list and click; no stale response may restore a forbidden action.

### C03 — Technical debt

**Material concern: yes. Severity: high. Likelihood: likely if the visual prototype is extended directly.** The inspected dropdown has hard-coded social rows/counts; existing notification queues and contribution emails do not implement the canonical donor center. Building donor-local unread JSON or a second notification service would split truth and require later migration. **Effect:** changes the implementation route, not A. **Required language:** “Extend the canonical Phase 6/17 item/group/engagement services through packages/api and shared UI; do not use MOCK data, donor preferences, task status, email history or provider events as a substitute notification authority.” Trace real screen→API→owner→persistence before accepting an implementation.

### C04 — Edge cases

**Material concern: yes. Severity: high. Likelihood: plausible.** The common misleading cases are zero notification actions while Home still has a verification step, six required groups behind a five-row preview, a read but unresolved item, a corrected statement, two represented donors and a disappeared destination. **Effect:** clarifies A and copy. **Required language:** “Empty text is scoped to notifications. Preview limits never erase obligations. Read required items remain in Needs attention. Display only current authorized context and a safe current-state/help destination when the original action has ended.” Exercise0/1/5/6/20/21 groups, mixed read states, missing sources, long translations, one/multiple currencies and cross-device completion.

### C05 — Footguns

**Material concern: yes. Severity: high. Likelihood: likely with a generic dismiss/clear model.** A developer may make an X close required work, Mark all read complete a task, Restore restart informational unread or a GET link retry a payment. The P17 policies explicitly distinguish these effects. **Effect:** narrows controls. **Required language:** “Opening, prefetching, marking read and archiving never execute business commands. Required current items omit Archive. Informational first-read/archive endings are not reversible unread timers. Bulk engagement names and enforces its exact notification scope.” The UI and API must reject attempts to mutate source status or reassign immutable identities through an engagement request.

### C06 — Tenant safety

**Material concern: yes. Severity: critical. Likelihood: plausible.** Login-global counts, shared cache keys or an organization Party used as the human recipient can mix tenants, staff roles, represented gifts or two representatives' engagement. P3/4/9/10/12, Q04 and ADR-0027 prohibit those shortcuts. **Effect:** strengthens the exact recipient/context binding. **Required language:** “List, count, group, engagement, cursor, realtime and destination scopes include the trusted Tenant, human recipient, exact donor role/surface, giving context and current access binding. Resolve these on the server; no cross-context aggregation or household/shared-email inference.” Deny tests must include the same login in two tenants, one human representing two donors and two humans representing the same donor.

### C07 — Database, RLS and authorization safety

**Material concern: yes. Severity: critical. Likelihood: certain proof gap, plausible failure if bypassed.** The canonical target tables/services are not established as implemented in this checkout. Tenant-only SQL policies or service-role operations cannot prove exact donor access. Mutable recipient/source columns could turn a permitted row into another person's row. **Effect:** requires owner schema and database proof before activation. **Required language:** “Use same-tenant composite relationships, immutable source/recipient/policy bindings, unique semantic occurrence keys, constrained states and narrow grants. Enforce existing-row USING and proposed-row WITH CHECK behavior for permitted mutations, plus column restrictions; direct clients cannot modify source, recipient, severity, deadlines or requiredness. Privileged paths re-prove the same bounds.” PostgreSQL can implicitly reuse USING as WITH CHECK; this review does not falsely claim omission always creates a bypass. Test actual effective policies, views, functions and role grants, including bypass roles and concurrent revocation. See the detailed model below.

### C08 — Overengineering

**Material concern: yes. Severity: moderate. Likelihood: likely if a generic inbox is copied.** Saved views, search builders, snooze scheduling, daily digests, ranking, push transport, notification exports and per-tenant retention settings solve unestablished needs while increasing support and privacy costs. Staff-center controls are not automatically donor requirements. **Effect:** narrows implementation scope. **Required language:** “Deliver two simple views, bounded continuation, direct owner destinations and the allowed engagement controls. Reuse the existing policies and infrastructure; do not add a notification vendor, policy DSL, task engine, new channel, export or independent preference store.” A need for more controls must be evidenced and separately reviewed rather than hidden in reusable-component work.

### C09 — UX/UI and user friction

**Material concern: yes. Severity: high. Likelihood: likely with an unfiltered chronological dropdown.** Long lists, equally strong cards, unread-as-danger, clipped explanations and tab/menu keyboard conflicts create the uncertainty the founder identified. Direct Church Center evidence and WAI guidance favor understandable read controls and correct semantics; they do not certify a specific row limit. **Effect:** adopts J01–J12/V1–V8. **Required language:** “Use the five-group preview, action-first All sections, clear adjacent Needs attention, readable one-destination rows and deliberate full-center continuation. Preserve exact Maia and accessible focus/semantics. No cleanup requirement, fabricated urgency, hover-only meaning or endless auto-loading preview.” Verify comprehension and keyboard/mobile journeys, not beauty alone.

### C10 — Source of truth, ownership and domain invariants

**Material concern: yes. Severity: critical. Likelihood: plausible.** A notification can accidentally become authority for paid, refunded, received, document-current or task-complete, especially if its action button edits domain rows. ADR-0001/0027 and P13/16/18/19 make those facts source-owned. **Effect:** preserves A with strict boundaries. **Required language:** “Notification state records availability/engagement only. Business status and action authorization come from the owning service. A source transition can end attention; a read/archive cannot cause that transition. Notifications never calculate money, generate documents, infer consent or acquire access.” Positive tests must show one complete donor owner journey; negative tests prove every engagement operation leaves financial, identity, consent and artifact truth unchanged.

### C11 — Hidden coupling

**Material concern: yes. Severity: high. Likelihood: plausible.** Tying Home's needs, receipt availability, a provider connection or Ministry Updates to the bell makes an optional reader outage break core self-service. An email delivery failure also must not change local notification truth. **Effect:** separates composition from ownership. **Required language:** “Home and domain pages remain independently readable from their owners. The bell consumes qualified Phase 6/17 projections and links to those pages. Local-only in-product activation has no email-provider dependency; email and local outcomes remain separate. Q07 feed visibility/email and Q13 receipt delivery stay independent.” Test provider outage with local-only fixtures and notification outage with working source pages.

### C12 — Failure modes

**Material concern: yes. Severity: high. Likelihood: plausible.** The source may commit before projection/invalidation, a read command may succeed but lose its response, or a stale client may invite an already-completed action. A generic retry could duplicate communication or a payment. **Effect:** requires durable recovery, not new donor work. **Required language:** “Keep source transition and durable notification intent/end propagation within the owning transaction/outbox contract. Reconcile ambiguous engagement operations using the same identity. Treat realtime as invalidation and re-read server truth; never recreate a business command from a failed notification request. Unavailable results remain visibly unavailable.” Test lost responses, dropped invalidations, projection delay, duplicate delivery and source completion during navigation.

### C13 — Lifecycle, temporal correctness, concurrency and idempotency

**Material concern: yes. Severity: high. Likelihood: plausible.** Read/archive/restore, new child arrival, source end and access loss can race. A late event or group reopen may resurrect old unread or extend90 days indefinitely. **Effect:** preserves fixed policies with atomic guards. **Required language:** “Store original UTC instants and source revisions; source-end is once-set. Engagement cannot change deadlines or revive ended eligibility. A new meaningful transition creates its own item; transport retries do not. Batch mark-read uses an explicit authorized snapshot/cutoff and cannot consume later arrivals. Source end/access loss outranks a concurrent engagement command.” Test exact 30/90-day boundaries, DST displays, end-before-first-view, first-read/archive restore, stale revisions and multi-tab commands.

### C14 — Data integrity risks

**Material concern: yes. Severity: high. Likelihood: plausible.** Full/partial/generic refund paths, P7/P13 receipt corrections, email/in-product steps or event replay can produce duplicate notices or conflicting financial wording. Heuristic grouping can hide distinct gifts. **Effect:** narrows producer admission and dedupe. **Required language:** “Enumerate the 13 proposed semantic keys below; select mutually exclusive source variants once for each effect. A semantic occurrence tuple reused with changed meaning hard-conflicts. Group only a producer-declared compatible episode and preserve every child’s identity, facts and deadlines.” Same-tenant foreign keys, unique effects and exact positive/negative cardinality tests must prevent duplicate unread debt without erasing a genuinely later correction.

### C15 — Security and privacy risks

**Material concern: yes. Severity: critical. Likelihood: plausible.** Counts, previews, HTML, search material, cached pages, URLs or logs can disclose restricted ministries or other donors even when the destination later denies access. An old document link could expose a superseded artifact. **Effect:** requires minimal current-safe presentation. **Required language:** “Compile only contract-allowed safe facts and typed destinations. No auth/payment secrets, raw provider payloads or arbitrary URLs. Re-prove current field visibility and access on every path; remove sensitive cached presentation on context/revision loss. Document links resolve current protected access, not stored public artifact URLs. Logs, diagnostics and audit contain no notification body or recipient PII.” Treat an immutable preview as evidence, not perpetual display permission; when its safety can no longer be proved, withhold it.

### C16 — Scalability and performance risks

**Material concern: yes. Severity: moderate. Likelihood: plausible under concentrated volume.** Five visible rows do not bound backend work; unindexed counts, per-row provider calls and loading a whole retention window can exhaust resources. Ninety days is a time bound, not a record-count bound. **Effect:** adds bounded data contracts and performance evidence. **Required language:** “Filter and authorize before keyset continuation. Use bounded server reads and set-based current-source checks; no external-provider call per row. Derive counts from the same eligibility function, never from loaded-row length. Prove indexed access, bounded client work and tenant fairness on a documented production-shaped workload.” Five/20 are chosen UI defaults, not a throughput guarantee. Test malformed/oversized limits and exhausted/expired cursors as well as the normal path.

### C17 — Operational burden

**Material concern: yes. Severity: moderate. Likelihood: likely with manual cleanup or ambiguous catalog ownership.** Staff could become responsible for clearing donor rows, repairing read flags or deciding arbitrary retention. That undermines self-service and creates tribal knowledge. **Effect:** narrows owner-operated automation. **Required language:** “Source end and policy expiry perform normal cleanup automatically. Each admitted key has a named domain owner, existing communication owner and deterministic reason codes for blocked projection/recovery. Staff do not impersonate donor engagement or fix rows directly in SQL.” Operations need existing owner repair tools and finite replay/fence rules; no new Support Hub product is introduced.

### C18 — Observability and auditability gaps

**Material concern: yes. Severity: high. Likelihood: plausible.** A donor can see a stuck badge or miss a required notice while systems report a successful email. Logs alone cannot explain whether the source was actionable, local materialization committed or the viewer read it. **Effect:** requires separate evidence and named signals. **Required language:** “Trace source occurrence, catalog generation, event/step, item/group, recipient binding and engagement operation with privacy-safe identifiers. Record creation/end/denial/expiry and actual engagement without fabricating donor awareness. Distinguish domain audit, local availability evidence and technical telemetry.” Monitors below require owners, thresholds and responses; email sent/opened is never a substitute signal.

### C19 — Dependency and integration risks

**Material concern: yes. Severity: high. Likelihood: certain owner-activation gap, plausible runtime drift.** Existing keys are email/history-scoped or Reserved; changing a UI toggle cannot qualify a donor in-product step. New Base UI docs may also differ from the installed pin; current Supabase defaults distinguish explicit grants from RLS. **Effect:** requires exact compatibility and activation. **Required language:** “Adopt donor steps/profiles through the full catalog generation with exact owner proof. Retain the installed provider/component contracts unless an upgrade is separately justified. No provider webhook, template, credential presence or frontend event declares local availability.” Current Supabase guidance prohibits custom notification tables in its owned realtime schema and requires deliberate grants; use supported authorization/invalidation interfaces, not provider-internal modifications.

### C20 — Migration, rollout and upgrade risks

**Material concern: yes. Severity: high. Likelihood: likely if old email/history is backfilled indiscriminately.** Launch could create years of unread notices, mixed writers could duplicate events, or rollback could revive old access and retention. **Effect:** requires the accepted writer-fence migration. **Required language:** “Use future post-fence transitions, with any still-actionable backfill explicitly bounded and owner-approved. Create no historical informational backlog or inferred engagement. Shadow comparison is not visible donor content. Activate one writer only after schema/grants/readers/contracts are compatible; disable the old writer before visibility. Rollback preserves events and original deadlines and never replays old work.” Source owner pages must remain available through a notification rollout failure.

### C21 — Testability, traceability and proof

**Material concern: yes. Severity: critical release-evidence gap. Likelihood: certain until target implementation exists.** An attractive mock or pure helper test cannot prove donor privacy, source transitions, correct documents or concurrency. Current canonical services/migrations are not verified as complete. **Effect:** release-blocking proof requirements, not rejection of A. **Required language:** “Trace A1–A4/J01–J12/V1–V8/C01–C22 to owner contracts, exact future authorized work and independently falsifiable evidence. Require real PostgreSQL role/constraint/concurrency tests, contract activation tests and accessible composed donor journeys. No mocked result, document structural check or source inspection counts as target runtime proof.” The proof families below specify the needed positive and negative outcomes.

### C22 — Other development hazards

**Material concern: yes. Severity: moderate. Likelihood: plausible.** Ambiguous labels such as All, Archived, Delivered or No action needed can be interpreted as unlimited records, deleted tax documents, human awareness or globally complete self-service. A maintainer could also silently expand the catalog through a reusable component. **Effect:** pins meaning without adding features. **Required language:** “All means current authorized presentable notifications; archive is presentation-only; Available means the local notification was committed, not delivered, read or business completion. Delivered remains external-channel evidence and does not prove human awareness. Empty claims stay notification-scoped. Keep the glossary, reviewed key list, UI labels and acceptance evidence aligned. New meanings or requiredness changes need explicit owner/founder amendment.” Re-read the actual final artifacts before ratification and do not declare phase-wide readiness with Q14 or target proof open.

## Exact admission boundary:13 existing semantic keys to qualify

These are existing source meanings, not new generic event types. This finite donor expansion is proposed; each key's donor step, safe profile, concrete recipient, source-end rule and proof must be adopted through its owner. Current donor email/history profiles are not reused by merely replacing a role string. Existing full fact walls, required/forbidden fields and source invariants still govern.

<!-- prettier-ignore -->
| Existing key(s) | Proposed donor qualification |
| --- | --- |
| `recurring_action_required_v1` | P16 exact current action episode and arrangement/initial-activation operation revision, with a producer-specified remaining step or required continuing status. Actionable policy; once-set end on actual resolution/cancellation/expiry/supersession/inapplicability. Currently Reserved. |
| `statement_current_available_v1` | P19 frozen recipient delivery occurrence/plan explicitly includes the in-product notice; P7 subject and P18 current artifact/access are valid. Information; do not trigger from publication/render completion alone. Currently Reserved. |
| `statement_current_updated_v1` | P19 admitted current-successor/exposure/correction occurrence. Information; no false claim the donor saw an unexposed draft and no predecessor download presented as current. Currently Reserved. |
| `statement_current_withdrawn_v1` | P19 admitted withdrawal and exact recipient/exposure/jurisdiction purpose. Information with safe current-state/help; no new donor repair task. Any required continuing variant must be separately owner-qualified. Currently Reserved. |
| `giving_receipt_replaced_v1`, `contribution_receipt_corrected_v1` | Exact P7 replacement/P18 successor or P13 contribution receipt-correction effect. Add qualified informational donor steps. The two meanings must not both claim the same correction effect; preserve current-document resolution and lineage. |
| `contribution_refund_failed_v1` | `contribution.refund_failed@1` with operation and provider-outcome revision. Information says attempted refund did not complete; no claim of money moved or donor duty to repair staff operations. |
| `contribution_refund_completed_v1` | Existing unspecified-kind completion meaning only. Information; do not also emit partial/full variants for that same effect. |
| `contribution_partial_refund_completed_v1`, `contribution_full_refund_completed_v1` | Existing exact partial/full outcome sources and operation/provider revision. Source proves positive partial refund/remainder or full zero remainder; UI does not calculate them or infer a new receipt. |
| `contribution_amount_corrected_v1` | Existing source operation/correction version. Information with permitted source facts/current gift destination; not an implied refund. |
| `contribution_designation_changed_v1` | Existing source operation/correction version. Information uses only currently permitted designation context; no restricted-worker identity leak. |
| `contribution_payment_state_corrected_v1` | Existing operation/payment-state revision and owner-supplied receipt/statement effects. Information cannot infer settled/received from raw provider presence or cause recovery. |

Do not add a parallel `recurring_payment_truth_corrected_v1` donor alert for the same financial effect merely because P16 observed it too. The source/manifest reconciliation chooses the correct meaning; grouping is not a workaround for duplicate authority. Distinct meaningful later effects can produce new notices where their source admits them.

This review **does not add** `document_artifact_ready_v1`, `statement_additional_copy_ready_v1`, ordinary receipt-issued, generic identity/setup, ACH-initiation, upcoming-charge, new-post or support-message bell steps. Existing requested document fulfillment and required owner messages remain intact in their own surfaces. `contribution_donor_relinked_v1` is not part of the ordinary expansion: its separately governed safe association notice cannot preserve access to a gift or identify the other donor. Later admission requires explicit source/recipient qualification, not a catch-all material-change rule.

## Minimum permanent database and service path

No new CRM or payment source is needed. Complete/reuse the P6/P17 structures already assigned to predecessor work. Names below identify the existing forward model, not tables verified present in the checkout.

1. **The source occurrence and P6 plan/event.** A source service owns the actual operation, recipient purpose, meaningful transition and complete bounded plan. Local availability is committed through the existing compiler/intent/event spine. A local-only step has no Resend submission or provider outcome. Durable source→intent and source-end propagation survive a lost browser or worker retry.
2. **The P17 notification item.** Bind immutable Tenant, concrete recipient Party/human identity as required, donor role/surface, represented subject/giving context, source id/revision, event/plan/step, semantic occurrence, catalog generation, safe preview, destination code, exact policy/end rule and original UTC availability. An immutable preview may become unpresentable; it is not perpetual permission to display sensitive text.
3. **Canonical engagement.** One exact viewer/item/role binding with allowed engagement history and current revision. First relevant read/archive endings must remain recoverable so Restore cannot restart informational unread. Actor attribution comes from trusted server context. Engagement cannot move a row to a new recipient, source or deadline.
4. **Attention groups.** Rebuildable grouping for one declared compatible producer episode within exact recipient/privacy/meaning boundaries. A group counts once, but each child retains independent event evidence and policy. Group child expansion is itself bounded and authorized. Do not group by arbitrary date bucket, ministry, shared email or all financial changes.

**SQL invariants.** Require non-null typed scope identifiers, same-Tenant composite foreign keys, unique semantic occurrence and viewer/item identities, constrained policy/state vocabulary and immutable authority columns. Preserve required source/audit relationships rather than cascading deletes or setting authority references null. Use appropriate exact entity/source constraints where the owner requires them. Avoid money copies unless a contract explicitly needs an immutable safe amount; those use the source's original currency and integer minor units. Do not use CHECK constraints to invent cross-table/current-time authorization; those decisions need owner transactions and read-time predicates.

**Authorization.** Enable/FORCE RLS as required by Core, explicitly grant only needed operations and verify exposed views, RPCs and service-role paths independently. Target event/item/source-end writes are internal owner operations; donor engagement uses one narrow authenticated packages/api command. Where SQL mutations are granted, test both old-row eligibility and new-row admissibility and immutable-column protections. A definer function must have reviewed privileges, fixed search path, restricted execution and equivalent actor/scope proof. Neither service role nor possession of an item id is donor authorization. [PostgreSQL 17 RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html), [constraints](https://www.postgresql.org/docs/17/ddl-constraints.html).

**Read models.** One canonical current-eligibility predicate feeds list/count/detail and the declared scopes of engagement/destinations. Server checks bind source status and current access consistently; list authority never substitutes for destination authority. Filter before keyset continuation. Stable ordering uses source class/time/id, not read timestamps or arbitrary last-updated fields. Counts are complete for their declared scope and not the number of loaded rows. A bounded revision/cutoff ties continuation and bulk-read work to a stable eligible set; stale source/class changes require reconciliation rather than duplicate or skipped rows silently. No writes on GET to “fix” lifecycle state.

**Concurrency.** Use a source/authority fence and expected engagement revision or equivalent atomic owner boundary for compare-and-set. Duplicate operation ids return the same durable effect; changed immutable meaning conflicts. Source end/revocation wins over archive, restore or stale read. A later meaningful source transition creates a new item instead of reviving an old one. Batch Mark notifications read explicitly covers currently eligible notifications in the selected giving context through its accepted cutoff, not future arrivals. Apply that cutoff to each child's immutable availability identity/time, not just its group: a later child joining an existing group remains unread. A failed/unknown result reconciles rather than selecting a new unbounded set. Bulk read has no informational unread-restoring Undo. Safe archive Undo restores only still-permitted presentation. [PostgreSQL 17 transaction isolation](https://www.postgresql.org/docs/17/transaction-iso.html).

**Client state and privacy.** Use the repository-approved server-read-model path with TanStack Query for this composed protected projection; approved TanStack DB collections can serve genuinely qualified collection access, not a second client authority. A five-row preview needs neither a table framework nor virtualization. Full-center rendering/loading must pass realistic large-recipient tests using shared list facilities. Realtime carries identifiers only after commit and triggers revalidation. Do not persist protected previews in localStorage/service-worker caches by default. Clear context-bound data on tenant/viewer/role changes. A current access-check outage is unavailable, not proof of permanent revocation: withhold unsafe disclosure, but do not stamp source end or discard durable engagement merely because a service timed out.

**Provider compatibility.** Repo config pins PostgreSQL major 17; current RLS semantics were checked against 17. Supabase's current changes make new-table API exposure depend on explicit grants and prohibit custom objects in its owned realtime schema. Neither change calls for a notification-specific infrastructure fork. Realtime channel membership is not per-item source authorization; reconnection and access change must re-establish appropriate scope. [Supabase grants change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically), [Realtime schema boundary](https://supabase.com/changelog/realtime-schema-locked-down-against-modification), [Realtime authorization](https://supabase.com/docs/guides/realtime/authorization).

## Actual implementation and dependency register

<!-- prettier-ignore -->
| Evidence / dependency | Finding and disposition |
| --- | --- |
| Canonical target tables/APIs | Searches of source/migrations found no installed `in_product_notification_items`, `in_product_notification_engagement`, `in_product_attention_groups` or complete canonical donor list/engagement service. This is missing target implementation, not a verified live incident. Do not shortcut it. |
| Legacy `notification_queue` | Foundation migration has destination/payload/status fields; later membership migration grants staff-scoped CRUD. This is not donor access, local-availability semantics or the canonical P6/P17 model. |
| Staff approval notifications | Current migration revokes browser access and grants service-role/function access. It supports staff approval purposes, not donor engagement or90-day policies. The `dismissed` update at approval-notifications.ts:372 targets duplicate Mission Control tasks; it is not evidence of donor notifications being marked dismissed. |
| Visual seed | Static Inbox/General,8New and social rows are placeholders. Read-only shadcn config/docs verified exact base-maia and existing primitives; no component was added or changed. |
| Q17-01 — donor admissions | Proposed13-key expansion must receive complete donor profiles/recipients/surfaces/end predicates and atomic activation proof. The initial seven in-product mappings are staff. This remains required owner work, not a hidden assumption of a finished bell. |
| Q17-02 — canonical predecessors | Actual [#890](https://github.com/Asymmetric-al/core/issues/890) is OPEN and depends on #875/#876/#888; [#891](https://github.com/Asymmetric-al/core/issues/891) is OPEN and depends on #890. Their bodies own projection/local availability and policies/engagement/grouping/staff center. Phase 25 consumes and extends them; it does not duplicate their shared implementation. |
| Q17-03 — scope and positive proof | Qualify human recipient versus represented subject, exact role/access revision and field visibility for every admitted key. Q04 does not grant represented access or a shared read state. Target SQL/concurrency/browser proof is release-blocking. |
| Q17-04 — presentation adoption | Five/20 defaults, phone full-page entry, action-first All and restricted controls are explicit reviewed execution choices awaiting founder ratification. They are not vendor-proven magic numbers. |
| Existing Q14 G01 | Supabase identity-linking/claim boundary remains unresolved in the larger phase. Q17 adds no authentication bypass or claim that it is solved. |

## Falsifiable acceptance evidence — T01–T15

These are required target proof families, not tests run during grooming. Fixture counts are boundary/stress examples, not claims about actual tenant volume. Capture the exact code/schema/catalog/account versions and real results when implementation is authorized.

<!-- prettier-ignore -->
| ID | Required evidence |
| --- | --- |
| T01 | Each of 13 proposed exact meanings has a positive owner event→P6 local availability→P17 donor projection→correct destination case. Inputs inadmissible for the donor in-product step create no donor in-product availability event/item. Separately admitted email and source events remain unaffected; this does not allow a partially Live catalog generation. Full/partial/generic and receipt correction variants are mutually exclusive per effect. |
| T02 | Excluded successful gifts, routine receipts, normal ACH processing, each retry/poll, saves, new posts, marketing and staff events create zero ordinary donor items. Preserve an explicitly qualified required donor contract as a separate positive case. |
| T03 | Real PostgreSQL SELECT/INSERT/UPDATE/DELETE/RPC/view/grant tests with two tenants, two recipients, one human in multiple roles, two representatives of one subject, one representative of multiple subjects, revoked/current/future grants and anonymous sessions. Poisoned ids reveal neither content nor existence counts. |
| T04 | Real composite-FK, uniqueness, null/default/check and immutable-column failures. Allowed engagement update cannot change Tenant/recipient/source/policy/end. Privileged/BYPASSRLS paths enforce the same actor/meaning bounds. |
| T05 | Concurrent source resolution, read, archive, restore and access revocation; lost responses and repeated ids. One durable effect, no read-as-completion, no stale restore of unsafe actions. Transient permission outage does not stamp irreversible revocation. |
| T06 | Information just before/at/after 30 days and 90 days; first-read/archive/correction before deadlines; Restore/Mark-unread attempts; source end before first view and delayed projection/purge. Exactly original ceilings, no unread revival and no fictional read. |
| T07 | Same-episode child dedupe/grouping, different-episode isolation, independently ended children, new meaningful child reopening without extending old history. Counts reflect currently authorized eligible children/groups, not raw event count. |
| T08 |0/1/5/6/20/21 groups, more required actions than the preview, mixed information/read-action groups, archived rows and later arrivals during bulk read. All/Needs attention and their counts agree with the full declared scope; late arrivals remain unread, including a new child within a group that existed before the accepted cutoff. |
| T09 | Stale cursors, changed filters/context/roles, same-time ties, end/urgency changes during continuation, missing realtime and reconnect. No cross-scope page reuse, duplicate hidden omissions or unbounded whole-history fetch. |
| T10 | Real donor recurring action and initial-activation paths through their owning services. Opening/reading/archive/GET/prefetch produces no charge, retry, preference change or cancellation. Required review/authorization remains intact; normal ACH stays calm and source-truthful. |
| T11 | Real protected statement/correction journey: current document, superseded/withdrawn/missing artifact, no exposed predecessor, changed recipient access and optional help. No regeneration/reissue or public signed artifact cached in a notification. |
| T12 | Keyboard, screen reader and touch journey through desktop Popover and phone page, two tabs, overflow, destination, Back/close, read/archive failure, new arrival and source end. Verify visible focus, no focus theft, sensible announcements, long translations, 320 CSS-pixel reflow, 200% text and reduced motion. Automated axe complements manual proof. |
| T13 | Moderated comprehension with donor-representative scenarios: identify what needs action, find a prior notice, distinguish unread from required and know leaving is safe. Any participant attempting to clear the bell to finish a financial task, misreading processing as received, or unable to find a required action triggers correction and retest; no claimed measured conversion uplift. |
| T14 | Production-shaped load evidence, including a deliberately concentrated recipient with 10,000 eligible rows within the supported policies and a 100-Tenant fixture. Record actual query plans, p95 latency, query counts, DOM/cache growth and resource limits; prove bounded pages, indexed scopes and no provider N+1. These fixtures are test inputs, not forecast traffic or performance claims. |
| T15 | Mixed-version deployment, fence/backfill, shadow comparison, single writer, failed activation and rollback. No historical informational unread backlog, duplicate writer or revived deadline. Local-only notification works without Resend; notification outage leaves authorized source pages usable. |

## Ruthless synthesis: what to do, and in what order

**Before recording the answer as final:** obtain one founder ratification of the corrected A1–A4 direction. In particular, the 13-key content ceiling, no per-post/per-gift bell copies, five/20 preview/continuation and action-first sections are explicit proposed choices. Keep current lifetime/permission/source rules as inherited requirements rather than ask the founder to redesign them. This is a provisional Accept with required amendments, not final ratification.

**Capture in the later authorized specification/design:** the admission matrix, J01–J12, V1–V8, all 22 corrected requirements, exact recipient/subject distinction, lifecycle/read rules and cross-phase dependencies. Reconcile exact keys and mutually exclusive producers into the single P17 generated contract package. Carry canonical glossary/ADR/OpenSpec references forward; do not create a new ADR merely for choosing the first tab. A new recipient binding or donor surface/profile extension must be explicitly recorded where its owner requires it.

**Require during implementation:** finish/consume the canonical projection and engagement predecessors; extend the donor contracts; add schema/grants/fences and thin API/reader composition; implement source-qualified safe destinations and the bounded Maia UI; then prove the complete T01–T15 outcomes. Use the real shared services and PostgreSQL harness. Roll out only the qualified catalog generation with one writer and future-only transition fence. A required contract that cannot pass stays release-blocking; it is not silently dropped or delivered by a route-level shortcut.

**Monitor only what can safely be observed after those gates pass:**

<!-- prettier-ignore -->
| Signal | Threshold | Owner | Response |
| --- | --- | --- | --- |
| Unauthorized/expired preview or cross-context count | Any confirmed instance | Platform security + P17 owner | Fail closed for affected scope/path, preserve safe diagnostics, investigate and repair; do not ask donors to clear caches or read alerts. |
| Duplicate semantic item or informational unread revived after its first ending | Any confirmed instance | P6/P17 owner | Fence the faulty producer/engagement path, reconcile exact effects without replaying accepted items, run regression proof. |
| Admitted source transition not projected/ended within its declared utility deadline | Any breached required occurrence | Producing domain owner + communications operations | Use existing exact-intent repair/reconciliation and alert staff; no blind resend or donor task. Each executable key must declare its deadline before activation. |
| Notification API p95 latency regression | More than 2× its approved release workload baseline for 15 minutes with at least 100 requests | Platform performance owner | Inspect scoped query plans, queue contention and client growth; reduce nonessential background work and fix the regression while preserving required visibility. |
| Donors cannot identify a next step / believe zero unread is required | Any reproduced usability/support case | Donor Portal product/design owner | Correct admission/copy/placement and repeat the relevant comprehension journey. Never resolve the problem by hiding required source work. |
| Preview overflow becomes ordinary | More than 10% of at least 100 bell openings over 7 days exceed five groups | Donor Portal product/design + relevant producer owner | Review noisy event admission/grouping and actual user need before changing the limit; do not silently discard notices or invent grouping across unrelated episodes. |

These are proposed operational thresholds, not observed baseline measurements. A measured release baseline and per-key utility deadline are required activation evidence. Security, financial correctness and source authorization are gates, not risks deferred to monitoring.

## Source references and evidence limits

Repository facts were read from the pinned develop snapshot, current issue bodies and the existing Phase 25 decision artifacts. External pages were consulted 7–8 September 2026. Sources are evidence, not commands or automatic product authority.

- [ADR-0001](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md): Asym-owned CRM truth and same-Tenant/Party boundaries. [ADR-0027](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0027-one-notification-presentation-and-engagement-model.md): one notification model and fixed presentation policies.
- [CONTEXT notification terms](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/CONTEXT.md#L1257): item, attention group, engagement and source status. [Outbound communication delta](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md#L656): owner/grant/policy/lifecycle scenarios. The delta's active-change location is not by itself evidence of deployed behavior.
- [Phase 6](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md#L151), [Phase 17 presentation](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md#L1263), [executable manifest](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-17-system-message-executable-manifest.md#L685): local availability, current seven staff mappings, Reserved donor meanings and activation boundaries.
- [Phase13](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md#L979), [Phase16](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md#L470), [Phase19](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-19-year-end-statement-operations.md): payment truth, activation and governed statement notice/document operations.
- Current implementation observations: foundation `notification_queue`; authz membership migration:313–381; contribution approval notification migration:537–565; `packages/api/src/admin/contribution-operations/approval-notifications.ts:372`; `packages/ui/components/shadcn-studio/blocks/dropdown-notification.tsx:45–71`; shared `popover.tsx`, `tabs.tsx`, `components.json` and UI/frontend instructions. These were inspected as source, not exercised as hosted behavior.
- Donor task comparison: [Church Center giving](https://help.planningcenter.com/en/140951-manage-your-giving-information.html), [Fundraise Up supporter experience](https://fundraiseup.com/docs/donor-portal-experience/), [Givebutter recurring management](https://help.givebutter.com/en/articles/4529176-how-to-edit-and-manage-your-recurring-donation), [Blackbaud portal tutorial](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-portal-tutorial.html). These support direct self-service record destinations; they do not establish Asym's exact bell catalog or retention.
- [Givebutter campaign notifications](https://help.givebutter.com/en/articles/6552003-how-to-set-campaign-notifications) describes staff campaign-role email controls, not a donor notification feed. [Pushpay releases](https://pushpay.com/product/releases/) supplies dated giving-record/statement precedents; the exact support bell behavior could not be verified from its client-rendered support shell. No absence claim or performance statistic is made.
- [WAI tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) and [GOV.UK notification banners](https://design-system.service.gov.uk/components/notification-banner/) support accessible interaction and restrained notification treatment. Banner guidance is useful context, not a rule that Asym must use a banner for each notice.

**Verified in this review:** source/SQL/configuration/document inspection, current official documentation, actual issue bodies, independent owner/financial/UX scrutiny and documentary preservation checks. **Not verified:** implemented donor notification services/schema, effective deployed RLS, target concurrency, provider-contract activation, actual donor comprehension, accessibility or hosted behavior. No target tests, financial/provider actions, source edits, GitHub mutations, new PRD or implementation issues were performed. Earlier phase/Q16 proof bundles remain historical evidence with their original limits.

The decision review is complete. Ratification should accept the corrected direction while retaining the named owner work and release proof. It must not be recorded as a completed implementation or as Phase 25 ready for release.
