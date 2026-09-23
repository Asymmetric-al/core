# Mission Control Contribution Detail PRD

**Current contract amended 2026-09-16 (AL-1861).** The requirements below
incorporate the ratified owner decisions in the [owner map](README.md). They
preserve the shared staff experience and stable story IDs; implementation and
activation require their own evidence. The [original May–June PRD](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/PRD.md)
remains the immutable record of the earlier design.

## Problem Statement

Mission Control staff need one trustworthy way to work with a donor gift from
CRM donor gift history or Contributions Hub. Different layouts must not create
different money values, permissions, valid actions or post-action outcomes.

Staff open the Phase 13 contribution header, inspect its complete effective
line-level truth, and act through shared source-owned commands. Its stable UUID
preserves existing gift links through the specified ledger cutover. CRM reads
those same facts; it does not post or synchronize a second copy of the gift.

The May 2026 research found thinner CRM rows, missing actions and inconsistent
prototype read models. Those observations explain this PRD's origin. Inspect
current source and tests to establish which gaps remain before implementation.

## Solution

Provide one contribution-detail and operations experience centered on the
Phase 13 contribution header and its canonical effective fold over designation
lines and append-only postings. CRM donor history and Contributions Hub use the
same read/action contracts, permissions, revision checks, labels and filters.
Giving Campaign is an effort/attribution axis, separate from Fund/Designation.

Money corrections append the owning ledger postings; accepted history is never
rewritten or duplicated into a feature-local adjustment overlay. Phase 13 mints
action capabilities and Phase 12 enforces current access and tenant policy.
High-risk money work requires capability, reason and active audit. Second
approval is optional per tenant and off by default; enabled separation of
duties excludes the requester. Approval does not itself prove a refund,
recipient contact, artifact creation or another external result.

Phase 16 owns recurring commitment/group/line/cohort behavior. Phase 7 owns
receipt eligibility and legal facts; Phase 18 owns exact artifacts, current
heads and access; Phase 19 owns statement runs. Phase 17 prepares protected
messages from exact source facts and Phase 6 dispatches/records their outcomes.
Contribution detail requests these owned operations and shows their actual
independent states. It never generates a local receipt snapshot or revives a
Twenty posting/retry path.

CRM rows may expose the same authorized actions inline. Risky actions open the
shared contextual dialog/drawer with complete review information, and results
remain in that shell. Preserve donor context, scroll, selection, focus and safe
unsaved work; full detail remains an optional deeper view.

Use shared `@asym/ui` primitives, exact shadcn `base-maia`, Base UI and semantic
Zinc tokens. Preserve keyboard/screen-reader access, reduced motion, stable
layout and responsive operation sheets.

## User Stories

1. As a donor-care staff member, I want to open a gift from CRM donor gift history, so that I can investigate donor questions without leaving the donor context.
2. As a finance staff member, I want to open the same gift from Contributions Hub, so that I can triage gifts across donors.
3. As any staff member, I want CRM and Contributions Hub to show the same amount for the same gift, so that I do not wonder which number is correct.
4. As any staff member, I want CRM and Contributions Hub to use the same receipt status vocabulary, so that I can interpret receipt state consistently.
5. As any staff member, I want CRM and Contributions Hub to use the same correction and approval state, so that pending or applied corrections are not hidden by the entry surface.
6. As any staff member, I want CRM and Contributions Hub to use the same refund state, so that money movement context is not ambiguous.
7. As any staff member, I want CRM and Contributions Hub to show the same source-owned posting and reconciliation facts, so that financial workflow status is clear without a second CRM post state.
8. As any staff member, I want CRM and Contributions Hub to use the same designation summary for overlapping fields, so that donor intent is represented consistently.
9. As any staff member, I want a shared contribution row contract for overlapping fields, so that display parity is enforced by contract rather than convention.
10. As any staff member, I want CRM-only donor-context fields to be clearly separate, so that they do not redefine shared contribution truth.
11. As any staff member, I want a gift to open by its Phase 13 contribution header id, preserving its legacy UUID, so that links and actions keep the same gift identity.
12. As any staff member, I want intake, native CRM, recurring commitment and Stripe references as separately authorized context, so that they do not replace gift identity.
13. As any staff member, I want gifts without a legacy staged-gift envelope to remain readable through their owning source, so that that predecessor record is not an admission requirement.
14. As any staff member, I want action availability determined by current owner state and capability, so that missing predecessor records do not silently grant or deny unrelated actions.
15. As a staff member coming from CRM, I want the CRM donor context preserved behind contribution detail, so that I can return to the donor workflow.
16. As a staff member coming from Hub, I want Hub filters, search, selection, and scroll preserved, so that I can continue triage after closing detail.
17. As any staff member, I want copy/share links to use a canonical contribution URL, so that shared links do not depend on CRM or Hub state.
18. As any staff member, I want current-route query state to preserve local context, so that refresh/back behavior feels natural.
19. As a finance staff member, I want the default detail view to start with the financial summary, so that I immediately see amount, status, donor, date, source, payment method, designations, and workflow chips.
20. As a finance staff member, I want technical proof hidden by default, so that routine workflows are not overwhelmed by provider IDs and job metadata.
21. As a finance/admin user, I want to expand technical proof when needed, so that I can reconcile provider events, job IDs, request IDs, and before/after values.
22. As a donor-care staff member, I want every designation line shown equally, so that split gifts do not imply one donor intent is primary.
23. As a finance staff member, I want each designation line to show its source-owned amount, currency and giving destination, so that I can reconcile allocation truth.
24. As a finance staff member, I want line details for memo evidence, legal restriction, destination and related campaign context, so that different concepts remain distinct.
25. As a finance staff member, I want every line to use exactly one eligible Phase 13 giving destination, so that money, documents and reporting remain deterministic.
26. As a finance staff member, I want unspecified donor intent to default to General Fund, so that there is no final unassigned designation state.
27. As a finance staff member, I want money corrections to append source-owned postings, so that original financial history remains intact without a parallel adjustment ledger.
28. As a finance staff member, I want current effective values from the one Phase 13 header/line/postings fold, so that every surface reads the same corrected gift.
29. As a finance staff member, I want contribution detail to show original and effective values when they materially differ, so that I understand what changed.
30. As a donor-care staff member, I want to request a correction without directly applying high-risk changes, so that I can initiate work while respecting finance controls.
31. As a finance staff member, I want routine staff-safe corrections to apply immediately when permitted, so that low-risk work is not slowed down.
32. As a finance approver, I want second approval required only when the current Phase 12/13 tenant policy enables it for the action, so that the default stays capability, reason and active audit.
33. As a tenant policy administrator, I want optional second-approval rules off by default and explicitly configurable under Phase 12, so that finance teams can add preventive controls without a mandatory default queue.
34. As a tenant policy administrator, I want approval-policy changes audited and prospectively enforced, so that no settings edit bypasses money or provider constraints.
35. As a tenant policy administrator, I want enabled separation of duties to enforce requester not equal to approver, so that current policy cannot be bypassed by a role label or local suppression setting.
36. As a requester, I want to know when my correction request is approved or rejected, so that I can act on outcomes without hunting through audit logs.
37. As an approver, I want a pending source-required approval linked to at most one durable shared task, so that notification preferences cannot erase my work obligation.
38. As an approver, I want the required Phase 17 in-product attention and optional qualified email for an actual pending request, so that channels remain distinct from source completion.
39. As a staff member, I want personal preferences applied only within the message contract, so that they neither remove required attention nor grant approval rights.
40. As a tenant administrator, I want source task routing and optional email defaults configured through their respective owners, so that a notification setting cannot suppress required approval work.
41. As an approver, I want pending approvals to remind me after a configured interval, so that requests do not stall silently.
42. As a finance/admin lead, I want stale pending approvals to optionally escalate, so that important corrections do not remain stuck.
43. As any staff member, I want approval reminders and escalations to never auto-approve, so that financial controls remain human-gated.
44. As an approver, I want rejecting a correction to require a rejection reason, so that the requester knows what to fix.
45. As a requester, I want rejected corrections to optionally create a follow-up task, so that I can revise, resubmit, or abandon the request.
46. As a finance staff member, I want the source approval outcome to resolve its linked approval task while external effects keep their own state, so that task completion does not imply a refund or delivery succeeded.
47. As a finance staff member, I want receipt-affecting corrections to show which receipt fields changed, so that I can decide the right donor communication.
48. As a finance staff member, I want currently admitted receipt follow-up choices inside the correction flow, so that exact source-authorized issuance, artifact access and delivery are handled in context.
49. As a finance staff member, I want receipt email eligibility decided by the exact Phase 7/17/6 purpose and recipient policy, so that marketing preferences are not mistaken for an official-message suppression rule.
50. As a finance staff member, I want an authorized exact Phase 18 artifact available for the source-permitted print/download path when applicable, so that missing email never triggers unauthorized PDF generation.
51. As a requester, I want to propose receipt delivery when submitting a receipt-affecting correction, so that donor-care context is captured.
52. As an approver, I want the proposed exact receipt follow-up rechecked against current owner authority, so that approval cannot invent a document or bypass its admission.
53. As a tenant administrator, I want receipt-delivery defaults constrained by source eligibility and the message/document contract, so that tenant settings cannot override legal purpose or requiredness.
54. As a finance staff member, I want any permitted corrected-receipt suppression to require the source capability, reason and audit, so that content settings or a general email opt-out cannot suppress required official work.
55. As a finance staff member, I want the result to distinguish requested, artifact-ready, submitted, delivered, suppressed, deferred and blocked owner outcomes, so that a successful correction is not confused with downstream completion.
56. As a finance/admin user, I want Stripe references role-gated, so that technical payment proof is available without exposing raw provider context to every staff member.
57. As a finance/admin user, I want provider operations to be safe, audited, idempotent, and constrained, so that technical recovery does not bypass policy.
58. As a normal staff member, I want payment summary without a wall of Stripe IDs, so that the gift is understandable.
59. As a finance/admin user, I want a refund workflow gated by permissions and policy, so that refunds are handled safely.
60. As a finance/admin user, I want refund state visible in CRM, Hub, and detail where fields overlap, so that staff see the same money-movement context.
61. As any staff member, I want recurring context to link to the Phase 16 recurring commitment and its group/lines, so that the provider does not define donor intent.
62. As a finance/admin user, I want Stripe recurring references as secondary proof, so that provider evidence is available without becoming the business object.
63. As any staff member, I want unproved recurring provider mappings shown as an owner-controlled reconciliation gap, so that a subscription does not automatically create or authorize a commitment.
64. As any staff member, I want native CRM to project source-owned gift facts, so that it cannot become a second money ledger.
65. As any staff member, I want CRM history to show one contribution header with all authorized designation lines from the canonical fold, so that split gifts stay complete without duplicated CRM gift records.
66. As any staff member, I want an actual source integrity or provider exception routed to its owning recovery action, so that retired CRM repost retries are never offered.
67. As any staff member, I want CRM and Hub fields to update after corrections through shared query invalidation, so that the UI freshness delay is small and understandable.
68. As any staff member, I want stale client views treated as UI freshness issues, so that no one invents a fake internal CRM replication workflow.
69. As any staff member, I want a quiet freshness indicator when helpful, so that I understand why visible row values changed.
70. As a staff member with unsaved edits, I want stale-save protection and conflict recovery, so that background updates do not overwrite my draft.
71. As any staff member, I want smart close behavior, so that closing detail or operation UI preserves my route, filters, row selection, scroll, and focus.
72. As a CRM user, I want CRM gift history rows to show issue indicators, so that gifts needing attention stand out.
73. As a CRM user, I want CRM gift history columns to be customizable, so that I can focus on the fields I need for my role.
74. As a CRM user, I want CRM gift-history view settings to persist across browsers and devices, so that my setup follows me.
75. As a CRM user, I want local responsive cache for view settings, so that changes feel instant while still saving to the server.
76. As a CRM user, I want reset controls for columns, pinned row action, filters/sort, and all view settings separately, so that I can reset only what I intend.
77. As a CRM user, I want reset previews, so that I know what will change before applying a reset.
78. As a CRM user, I want reset to tenant defaults when they exist and system defaults otherwise, so that defaults reflect my organization first.
79. As a CRM power user, I want named personal views, so that I can quickly switch between workflows like receipts follow-up, corrections pending, refund review, and donor care.
80. As a CRM user, I want one named personal view to be my default, so that my preferred workflow loads automatically.
81. As a CRM user, I want a compact view switcher dropdown, so that named views are accessible without cluttering the donor page.
82. As a CRM user, I want named views to be personal-only in this PRD, so that the UI remains simple and does not introduce sharing complexity.
83. As a super admin, I want tenant defaults for CRM gift-history view settings, so that teams start from a sensible baseline.
84. As a super admin, I want to delegate CRM gift-history view-default management, so that donor-care or finance leads can manage routine defaults.
85. As a delegated view-default manager, I want to manage view defaults without receiving contribution operation permissions, so that settings authority is separated from financial operation authority.
86. As a super admin, I want tenant default changes audited but not approval-gated, so that routine view setup remains fast and accountable.
87. As a CRM user, I want one visible next-best row action and a More actions menu, so that row actions are discoverable without visual clutter.
88. As a CRM user, I want More actions grouped by correction, document, refund and qualified provider operations, so that advanced actions remain discoverable without a retired CRM-post category.
89. As a CRM user, I want all contribution detail operations available inline when I have permission and state allows it, so that I can finish work inside CRM.
90. As a CRM user, I want inline operations to use the same backend contracts as contribution detail, so that row actions do not become a second system.
91. As a CRM user, I want risky inline operations to open a contextual operation dialog or drawer, so that I see current values, proposed changes, downstream effects, reasons, and confirmations before submitting.
92. As a CRM user, I want the operation dialog to use a reusable shell, so that permissions, blocked states, current values, downstream effects, submit state, result, audit link, focus return, and row refresh are consistent.
93. As a CRM user, I want operation-specific fields inside the shared shell, so that each workflow remains clear and not over-generic.
94. As a CRM user, I want inline operation results in the same shell, so that I can see what changed without being navigated away.
95. As a CRM user, I want "View full contribution detail" as an optional secondary action, so that I can go deeper when needed without being forced.
96. As a CRM user, I want failed inline operations to preserve form state when safe, so that I can recover without retyping.
97. As a CRM user, I want the affected row patched or refetched in place after an inline operation, so that the visible CRM row reflects the result.
98. As a CRM user on a narrow screen, I want the operation shell to become a full-height or bottom sheet, so that I can complete the same workflows on mobile.
99. As a CRM user on touch devices, I want 44px touch targets and keyboard-safe layouts, so that operation forms are usable on narrow screens.
100. As a keyboard user, I want focus trapping, keyboard completion/cancellation, and focus return, so that inline operations are accessible.
101. As a screen-reader user, I want success/failure/result states announced accessibly, so that I understand operation outcomes.
102. As a staff member sensitive to motion, I want reduced-motion support and fast purposeful transitions, so that interactions remain comfortable.
103. As a Mission Control user, I want inline operation UI to use Maia/Zinc tokens and shared Base UI/shadcn primitives, so that it feels native to the product.
104. As a Mission Control user, I want no hardcoded colors, one-off radii, or app-local shadcn copies, so that the UI remains consistent and maintainable.
105. As a CRM user, I want to pin my preferred row action when valid, so that repeated work is faster.
106. As a CRM user, I want invalid pinned actions to fall back to tenant default or system next-best action with an explanation, so that preferences never create dead buttons.
107. As a tenant admin, I want to set a default row action by role/team/surface, so that different staff groups start with useful defaults.
108. As a tenant admin, I want tenant defaults to never bypass capabilities, row state, policy, or shared contracts, so that settings cannot become permission overrides.
109. As a user, I want pinned row action preferences stored server-side with local cache, so that they are durable and responsive.
110. As a staff member, I want operation availability to include blocked reasons and next steps, so that the UI can explain unavailable operations without inventing policy locally.
111. As a finance/admin user, I want results to include source revisions/posting references, correction request and audit ids, task references and separate document/provider/message outcomes, so that the UI does not collapse independent facts.
112. As a product owner, I want PRD acceptance criteria for CRM/Hub display parity, so that implementation cannot drift into separate field meanings.
113. As a product owner, I want PRD acceptance criteria for inline CRM operations using shared contracts, so that inline UI shortcuts cannot bypass validation, permissions, policy, audit, or result handling.
114. As a product owner, I want PRD acceptance criteria for polished inline CRM UX, so that the experience is not merely technically functional but consistent, accessible, responsive, and highly usable.

## Implementation Decisions

- **Shared contribution read model:** Build or formalize one database-backed read model for the effective contribution values used by contribution detail, Contributions Hub, and CRM donor gift history. This read model consumes the one Phase 13 header/line/postings fold; it does not maintain another effective-value derivation.
- **Shared contribution row contract:** Define a row contract for fields that appear in both CRM gift history and Contributions Hub. CRM may display fewer fields and Hub may display more operational fields, but overlapping fields must share derivation, labels, formatting, status vocabulary, filters, and freshness behavior.
- **CRM row adapter/migration path:** Existing CRM gift-history row fields should migrate or adapter-map into the shared row contract for overlapping fields. The PRD should require this as an implementation constraint and acceptance criterion, without prescribing the exact migration plan.
- **Shared contribution filter definitions:** Shared states such as receipt affected, pending correction, approval state, refund state, source-owned posting state, designation issue, recurring link, and payment status must use the same backend definitions wherever exposed.
- **Canonical identity:** Use `contribution_headers.id` as canonical gift identity, preserving the legacy UUID under Phase 13 D2. Intake, native CRM, Phase 16 commitments and provider references remain separately authorized context.
- **Route-aware entry model:** Keep context-preserving URLs for CRM and Hub entry surfaces and canonical contribution links for durable sharing/bookmarking.
- **Contribution detail contract:** Detail must return financial summary, designation set, original/effective values where relevant, receipt state, correction/approval state, refund state, source-owned posting state, Phase 16 recurring commitment context, Stripe/provider proof, audit summary, action availability, and version/revision metadata.
- **Designation set module:** Model multiple designation lines as first-class and equal. Each line has source-owned amount/currency, one eligible giving destination, optional memo evidence, applicable legal restriction, and line-level posting/audit context. Campaign attribution is separate from the destination.
- **Ledger correction boundary:** Money corrections append Phase 13 postings through the shared command. Routine permitted operations apply directly; second approval applies only under enabled Phase 12/13 policy. Refund intent and provider-confirmed money movement remain separate.
- **Correction request module:** Track pending, approved, rejected, superseded, and stale/pending-too-long states. Support approval ownership policy, outcome handling, rejection reason, requester notification, and follow-up tasks.
- **Approval policy boundary:** Consume Phase 12/13 action capabilities and optional second approval, off by default. Enforce requester exclusion when separation of duties applies. Contribution source policy owns reminder/escalation occurrences; Phase 17 does not create another timer.
- **Notification/task boundary:** The source request drives its one shared task and exact Phase 17 requested/reminder/escalated/outcome key. Required in-product attention and optional email follow the manifest; Phase 6 owns dispatch/history. Engagement and preferences never complete or erase source work.
- **Receipt owner adapter:** Consume Phase 7 eligibility/issuance/correction decisions, Phase 18 exact artifact/current-head/access results, Phase 19 statement coordination and Phase 17/6 delivery outcomes. Offer only admitted follow-ups; never render a local snapshot, assume one receipt per gift, or choose a generic PDF fallback.
- **Operation result module:** Return updated canonical detail plus audit, posting/source-revision and correction-request IDs, approval/task outcomes, receipt outcomes, downstream effects, provider outcomes, warnings, and safe errors. UI should progressively disclose details.
- **Audit module:** Provide append-only human-readable events with expandable technical proof. Include corrections, approvals, receipt actions, source posting outcomes, refunds, provider actions, settings policy changes, notification/task events, and table/view-default changes.
- **Action availability module:** Compute next-best actions, More actions, inline action availability, missing capabilities, blocked reasons, next steps, and risk level from backend state and policy.
- **Granular capability model:** Use staff-friendly roles backed by backend capabilities. Split broad contribution management into capabilities for view detail, request/apply/approve corrections, manage receipts, run refunds, use provider/admin actions, manage settings, manage table preferences, and manage CRM gift-history view defaults.
- **CRM inline operation shell:** Build one reusable operation shell for inline CRM actions. It owns permissions, blocked states, current values, downstream effects, required reason/confirmation framing, submit/loading/error state, operation result, audit link, focus return, and row refresh behavior.
- **Action-specific operation content:** Each inline operation supplies its specific fields, copy, validation messages, risk copy, downstream effect copy, and confirmation copy inside the shared shell.
- **CRM inline operation affordances:** CRM rows may expose all contribution detail operations inline in v1 when staff has capability and state allows it. Full parity is allowed because shared contracts and server enforcement are the safety boundary.
- **Risky inline operation pattern:** Risky operations can start from a row menu or button, but must expand into a contextual dialog/drawer before submission. If the compact UI cannot show enough context, open contribution detail rather than submit under-contextualized.
- **Inline result panel:** After inline success/failure, show a result panel inside the same operation shell. Keep staff in CRM, refresh the affected row, preserve context/selection/focus, and offer full detail as an optional secondary action.
- **Responsive operation sheet:** On narrow screens, the operation shell becomes a full-height or bottom sheet with sticky actions where appropriate, keyboard-safe forms, 44px touch targets, reduced motion support, and CRM context preservation.
- **Design system decision:** Inline CRM operation UI must use shared `@asym/ui` primitives, existing shadcn/ui components, Base UI first for new behavior-heavy primitives, the base-maia/Maia theme, Zinc palette, and shared Maia/Zinc tokens. No hardcoded colors, one-off radii, app-local shadcn copies, or separate visual language.
- **CRM action discovery:** CRM rows show one computed next-best action plus a state/capability-filtered More actions menu grouped by correction, document, refund, and qualified provider/admin.
- **Pinned row action preference:** Users may pin a preferred row action, stored server-side by stable operation ID with local responsive cache and schema versioning. Invalid pinned actions fall back to tenant default or system next-best action with explanation.
- **Tenant default row action:** Tenant admins can configure default row actions by role/team/surface. User override wins when valid; tenant default is next; system-computed next-best action is final fallback.
- **CRM gift-history view settings:** Group columns, filters/sort, pinned row action, named personal views, and reset behavior into one CRM gift-history view settings surface. Tenant defaults live in admin settings; user overrides live in personal view settings.
- **Granular reset controls:** Support reset columns, reset pinned row action, reset filters/sort, and reset all CRM gift-history view settings. Each reset previews impact and falls back to tenant defaults before system defaults.
- **Tenant default management:** Super admins can manage CRM gift-history tenant defaults. They may delegate `crm.gift_history.manage_view_defaults` or equivalent to donor-care/finance leads. Changes are audited, not approval-gated.
- **Named personal views:** Users can save multiple personal named CRM gift-history views with columns, filters/sort, pinned row action, and personal display settings. One personal view can be default. Use a compact dropdown-style view switcher near the table toolbar.
- **Personal-only named views:** Named views are not shareable/publishable in this PRD. Tenant defaults remain the shared baseline. Shared/team named views require a separate future governance decision.
- **Client freshness module:** Use shared query invalidation/refetch or patching after actions. Treat stale client views as cache/freshness issues, not a separate internal data-transfer workflow. Preserve context, scroll, row selection, and focus.
- **Deep modules to keep testable:** The shared read model, row contract mapper, action availability engine, source correction command boundary, approval policy evaluator, receipt policy evaluator, operation result builder, preference/default resolver, and operation shell state machine should each expose narrow, testable interfaces.
- **No internal CRM replication module:** Contributions Hub and CRM donor gift history are same-database surfaces. Do not build an internal copy job, queue, pending status, retry task, or escalation between them.

## Testing Decisions

- Tests should focus on externally visible behavior, product invariants, and contract boundaries. Avoid testing incidental UI implementation details or internal helper structure.
- Shared read-model tests must prove the same Phase 13 effective fold and stable header/line identities reach CRM, Hub and detail.
- Designation set tests should prove multiple designation lines are equal, reconcile to effective gift amount, and require one eligible Phase 13 giving destination per line.
- Shared row contract tests should prove CRM and Hub overlapping fields use the same values, labels, formatting, status vocabulary, and filter meanings.
- CRM row adapter tests should prove existing CRM row fields map into the shared row contract without redefining shared contribution fields.
- Shared filter definition tests should prove CRM and Hub filters return the same gifts where filter meanings overlap.
- Action availability tests should prove next-best action, More actions, blocked reasons, risk level, and missing capability are computed server-side and consistently consumed by CRM/detail/Hub.
- Correction tests must prove capability/reason/audit admission, direct execution under the default policy, approval only when enabled, requester exclusion under separation of duties, source-version rechecks and stale-save rejection.
- Ledger tests must prove append-only postings, per-line corrections, one effective fold and preserved historical source facts; no donation-row rewrite or parallel adjustment overlay is accepted.
- Approval-policy tests cover optional/off-by-default second approval, enabled separation of duties, audited policy changes, source-owned reminder/escalation occurrences, requester outcomes and rejection reasons.
- Approval notification/task tests should prove one correction request maps to at most one approval task and notification delivery is idempotent and preference-aware.
- Document/message tests cover exact purpose and recipient eligibility, annual-cumulative cash exclusion from per-gift issuance, current-artifact access, permitted source-audited suppression, unavailable contact/content, independent provider outcomes and rejection of local-PDF fallback.
- Operation result tests should prove actions return updated detail, audit IDs, posting/source-revision and correction-request IDs, task IDs, downstream effects, provider outcomes, and safe warnings/errors.
- Inline CRM operation acceptance tests should prove inline correction, receipt, refund, approval, and provider/admin operations use the same shared operation contracts, permissions, policies, idempotency, and operation result shapes as contribution detail.
- Inline UX acceptance tests should prove risky operations show required context before submit, results stay in CRM, row data refreshes in place, focus/scroll/selection are preserved, failure recovery is clear, and full detail is optional.
- Responsive UX acceptance tests should cover the full-height/bottom-sheet operation shell, keyboard-safe layout, 44px touch targets, reduced-motion behavior, and accessible status announcements.
- CRM/Hub display parity acceptance tests should prove the same gift shows the same shared fields in both surfaces, corrections in one surface refresh the other, shared filters agree, and CRM-only donor-context fields remain bounded.
- Preference tests should cover server source of truth, local responsive cache, optimistic writes, schema versioning, reset scopes, tenant default fallback, user override fallback, invalid pinned action fallback, and named personal view default behavior.
- View-default management tests should prove delegated settings capability can change tenant defaults, changes are audited, and the capability does not grant contribution operation permissions.
- Prior art to reuse includes existing admin table patterns, support notification preference patterns, task/drawer patterns, shared DataTable-responsive patterns, TanStack Query mutation/invalidation patterns, and repo UI/a11y test expectations.

## Out of Scope

- Full CRM redesign.
- Donor portal redesign.
- Missionary portal redesign.
- Full reporting system redesign.
- A generic automation/rules builder.
- A generic shared task product beyond contribution-operations approval,
  follow-up, and Needs Attention work. The required contribution task model is
  owned by PRD 3 in `docs/prds/mission-control-contribution-operations/`.
- Shared/team/published named CRM gift-history views.
- View ownership transfer, share-by-link, or shared-view conflict resolution.
- A separate internal CRM copy or replication workflow between CRM donor gift history and Contributions Hub.
- A step-by-step engineering migration plan for existing CRM rows.
- Treating Stripe/provider objects as canonical gift or recurring commitment identity.
- Updating Stripe metadata casually from contribution detail or CRM inline actions.
- Provider actions that bypass permissions, approval policy, idempotency, audit, or processor constraints.
- Restoring Twenty clients, sync, post/repost commands, capability names or rollback routes.
- Choosing document granularity outside the exact Phase 7/18 purpose and issuer contract.
- Allowing final fundless or unassigned designation states.
- Adding a new visual language, app-local shadcn component set, or theme outside Maia/Zinc.

## Further Notes

- The [glossary](CONTEXT.md) and [owner map](README.md) use current terms:
  Contribution/Gift, header, Designation line, Posting, Giving Campaign and
  Phase 16 Recurring Commitment. “Donation” and “adjustment” identify legacy
  implementation records only where explicitly dated.
- Feature ADRs record the compatible staff experience and their explicit later
  amendments. They do not override the money, identity, document or communication
  owner contracts; use qualified file links and the document authority guide.
- The original May research/code gaps remain in the immutable original PRD and
  [historical grill record](grill-session.md). They are not a September runtime
  audit. Implement against current source and owner-qualified seams.
- Apply the Phase 13 atomic cutover and Phase 18 clean document replacement
  requirements in their owning work; do not add a compatibility runtime merely
  to satisfy an older local model. This PRD supplies acceptance requirements,
  not proof those changes have shipped.
