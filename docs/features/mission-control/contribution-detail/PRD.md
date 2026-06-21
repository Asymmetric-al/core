# Mission Control Contribution Detail PRD

## Problem Statement

Mission Control staff need one trustworthy way to work with a donor gift, regardless of whether they start from CRM donor gift history or the Contributions Hub. Today, those surfaces expose different row shapes and different levels of action support. The Contributions Hub can open a contribution detail sheet, while CRM gift history mostly shows an inline row and a narrow receipt action. This creates risk that staff will see incomplete context, perform actions through inconsistent paths, or misunderstand which data is authoritative.

The core problem is not that CRM and Contributions are separate systems. They are Mission Control surfaces over the same underlying contribution data. The problem is that the product experience and contracts do not yet guarantee that the same gift displays the same effective values, exposes the same valid operations, and returns staff to the same working context after an action.

Staff need to open one gift by the canonical `donation.id`, see the same financial truth, correct or act on the gift through shared backend contracts, and trust that every update is audited, policy-aware, permission-gated, and reflected consistently anywhere that gift appears.

## Solution

Build a shared Mission Control contribution detail and operations experience centered on one canonical gift identity: `donation.id`.

Staff can open a gift from CRM donor gift history or Contributions Hub and see the same contribution detail, the same effective financial values, the same designation set, the same receipt/correction/refund/CRM/Twenty/recurring/provider context, and the same allowed operations. CRM donor gift history and Contributions Hub use a shared contribution read model and row contract for overlapping fields, so the same field means the same thing wherever it appears.

Contribution changes are saved through shared contribution operation contracts. Corrections and refunds are recorded as adjustment records linked to the original donation rather than silent donation-row rewrites. High-risk corrections create correction requests and follow tenant-configurable approval policy. Approval notifications, tasks, outcomes, reminders, and escalations stay simple and configurable.

CRM donor gift history becomes a powerful but clean entry point. It can expose all contribution operations inline in v1, but inline actions are only alternate UI affordances over the same shared backend contracts used by contribution detail. Risky inline actions expand into contextual dialogs/drawers with required review context. Operation results appear inside the same shell and keep staff in CRM, preserving donor context, scroll, row selection, and focus.

The UI must be polished and consistent with Mission Control: shared `@asym/ui` primitives, Base UI first for new behavior-heavy UI, shadcn/ui Maia theme, Zinc palette, shared Maia/Zinc design tokens, token-based Tailwind, strong accessibility, no layout shift, and responsive operation sheets on narrow screens.

## User Stories

1. As a donor-care staff member, I want to open a gift from CRM donor gift history, so that I can investigate donor questions without leaving the donor context.
2. As a finance staff member, I want to open the same gift from Contributions Hub, so that I can triage gifts across donors.
3. As any staff member, I want CRM and Contributions Hub to show the same amount for the same gift, so that I do not wonder which number is correct.
4. As any staff member, I want CRM and Contributions Hub to use the same receipt status vocabulary, so that I can interpret receipt state consistently.
5. As any staff member, I want CRM and Contributions Hub to use the same correction and approval state, so that pending or applied corrections are not hidden by the entry surface.
6. As any staff member, I want CRM and Contributions Hub to use the same refund state, so that money movement context is not ambiguous.
7. As any staff member, I want CRM and Contributions Hub to use the same CRM/Twenty post state labels, so that downstream workflow status is clear.
8. As any staff member, I want CRM and Contributions Hub to use the same designation summary for overlapping fields, so that donor intent is represented consistently.
9. As any staff member, I want a shared contribution row contract for overlapping fields, so that display parity is enforced by contract rather than convention.
10. As any staff member, I want CRM-only donor-context fields to be clearly separate, so that they do not redefine shared contribution truth.
11. As any staff member, I want a gift to open by `donation.id`, so that links and actions target the same canonical identity.
12. As any staff member, I want staged gift, CRM, recurring, and Stripe references to appear as joined context, so that I understand related workflows without confusing them with gift identity.
13. As any staff member, I want gifts without staged gifts to be openable, so that manually entered or legacy gifts still show read-only financial truth.
14. As any staff member, I want unavailable actions on gifts without staged gifts to explain why they are blocked, so that missing workflow context is not confusing.
15. As a staff member coming from CRM, I want the CRM donor context preserved behind contribution detail, so that I can return to the donor workflow.
16. As a staff member coming from Hub, I want Hub filters, search, selection, and scroll preserved, so that I can continue triage after closing detail.
17. As any staff member, I want copy/share links to use a canonical contribution URL, so that shared links do not depend on CRM or Hub state.
18. As any staff member, I want current-route query state to preserve local context, so that refresh/back behavior feels natural.
19. As a finance staff member, I want the default detail view to start with the financial summary, so that I immediately see amount, status, donor, date, source, payment method, designations, and workflow chips.
20. As a finance staff member, I want technical proof hidden by default, so that routine workflows are not overwhelmed by provider IDs and job metadata.
21. As a finance/admin user, I want to expand technical proof when needed, so that I can reconcile provider events, job IDs, request IDs, and before/after values.
22. As a donor-care staff member, I want every designation line shown equally, so that split gifts do not imply one donor intent is primary.
23. As a finance staff member, I want each designation line to show amount, fund, fund type, and fund reference, so that I can reconcile allocation truth.
24. As a finance staff member, I want designation lines expandable for memo, restriction, fund subtype, and line audit state, so that I can inspect evidence without cluttering the default view.
25. As a finance staff member, I want every designation line to require exactly one fund, so that receipts, CRM posting, reporting, and corrections remain deterministic.
26. As a finance staff member, I want unspecified donor intent to default to General Fund, so that there is no final unassigned designation state.
27. As a finance staff member, I want corrections to create adjustment records rather than mutate original donations, so that original financial history remains intact.
28. As a finance staff member, I want current effective values to derive from original donation plus applied adjustments, so that the gift can be read correctly after corrections.
29. As a finance staff member, I want contribution detail to show original and effective values when they materially differ, so that I understand what changed.
30. As a donor-care staff member, I want to request a correction without directly applying high-risk changes, so that I can initiate work while respecting finance controls.
31. As a finance staff member, I want routine staff-safe corrections to apply immediately when permitted, so that low-risk work is not slowed down.
32. As a finance approver, I want high-risk corrections to require approval when they affect external or already-visible records, so that donor-facing and finance-facing changes are controlled.
33. As a super admin, I want tenant-level approval suppression settings, so that trusted teams can relax specified approval gates while preserving audit and provider constraints.
34. As a super admin, I want approval suppression policy changes audited, so that settings changes are accountable.
35. As a super admin, I want configurable approval ownership policy, so that tenants can require one approver, separation of duties, or stronger approval for selected categories.
36. As a requester, I want to know when my correction request is approved or rejected, so that I can act on outcomes without hunting through audit logs.
37. As an approver, I want pending correction approvals to create a durable approval task by default, so that approval work is not lost in ephemeral notifications.
38. As an approver, I want configurable in-app and email notifications for approval requests, so that I receive alerts in the channels I use.
39. As a staff member, I want personal notification preferences for correction approvals, so that the system fits my workflow without granting me extra approval authority.
40. As a super admin, I want tenant defaults for correction approval notifications and task creation, so that the organization can set a baseline workflow.
41. As an approver, I want pending approvals to remind me after a configured interval, so that requests do not stall silently.
42. As a finance/admin lead, I want stale pending approvals to optionally escalate, so that important corrections do not remain stuck.
43. As any staff member, I want approval reminders and escalations to never auto-approve, so that financial controls remain human-gated.
44. As an approver, I want rejecting a correction to require a rejection reason, so that the requester knows what to fix.
45. As a requester, I want rejected corrections to optionally create a follow-up task, so that I can revise, resubmit, or abandon the request.
46. As a finance staff member, I want approval to close the approval task automatically, so that task state matches workflow state.
47. As a finance staff member, I want receipt-affecting corrections to show which receipt fields changed, so that I can decide the right donor communication.
48. As a finance staff member, I want to choose whether to send an updated receipt by email or generate an updated receipt PDF at the time of change, so that receipt follow-up is completed in context.
49. As a finance staff member, I want email receipt delivery blocked when the donor has no email or opted out, so that donor preferences are respected.
50. As a finance staff member, I want PDF generation available when email is unavailable or disallowed, so that receipts can still be mailed, printed, or manually delivered.
51. As a requester, I want to propose receipt delivery when submitting a receipt-affecting correction, so that donor-care context is captured.
52. As an approver, I want to confirm or change proposed receipt delivery before approval applies the correction, so that donor-facing receipt action remains controlled.
53. As a super admin, I want tenant policy for updated receipt delivery defaults and guardrails, so that receipt workflows match our finance policy.
54. As a super admin, I want donor email opt-out to default to an absolute block for email receipts, so that donor communication preferences are respected.
55. As a finance staff member, I want the operation result to say whether a receipt was emailed, generated as PDF, deferred with reason, or blocked, so that I know what happened.
56. As a finance/admin user, I want Stripe references role-gated, so that technical payment proof is available without exposing raw provider context to every staff member.
57. As a finance/admin user, I want provider operations to be safe, audited, idempotent, and constrained, so that technical recovery does not bypass policy.
58. As a normal staff member, I want payment summary without a wall of Stripe IDs, so that the gift is understandable.
59. As a finance/admin user, I want a refund workflow gated by permissions and policy, so that refunds are handled safely.
60. As a finance/admin user, I want refund state visible in CRM, Hub, and detail where fields overlap, so that staff see the same money-movement context.
61. As any staff member, I want recurring gift context to link to the internal recurring agreement first, so that recurring giving is treated as a tenant-owned business object.
62. As a finance/admin user, I want Stripe recurring references as secondary proof, so that provider evidence is available without becoming the business object.
63. As any staff member, I want a warning when provider data indicates recurrence but no internal recurring agreement is linked, so that reconciliation gaps are visible.
64. As any staff member, I want CRM/Twenty post state represented as workflow metadata, not payment truth, so that CRM does not become the ledger.
65. As any staff member, I want CRM posting for multi-designation gifts to preserve parent gift and child designation records, so that CRM can represent both one gift and all designation lines.
66. As any staff member, I want parent-level and line-level CRM/Twenty post failures visible, so that retry actions target the right scope.
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
88. As a CRM user, I want More actions grouped by correction, receipt, refund, CRM/Twenty, and provider/admin categories, so that advanced operations are easy to find.
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
111. As a finance/admin user, I want operation results to include updated detail, audit event, adjustment/correction request, downstream effects, task IDs, provider outcomes, warnings, and errors, so that the UI and audit are coherent.
112. As a product owner, I want PRD acceptance criteria for CRM/Hub display parity, so that implementation cannot drift into separate field meanings.
113. As a product owner, I want PRD acceptance criteria for inline CRM operations using shared contracts, so that inline UI shortcuts cannot bypass validation, permissions, policy, audit, or result handling.
114. As a product owner, I want PRD acceptance criteria for polished inline CRM UX, so that the experience is not merely technically functional but consistent, accessible, responsive, and highly usable.

## Implementation Decisions

- **Shared contribution read model:** Build or formalize one database-backed read model for the effective contribution values used by contribution detail, Contributions Hub, and CRM donor gift history. This read model must derive current effective values from original donation data plus applied adjustment records.
- **Shared contribution row contract:** Define a row contract for fields that appear in both CRM gift history and Contributions Hub. CRM may display fewer fields and Hub may display more operational fields, but overlapping fields must share derivation, labels, formatting, status vocabulary, filters, and freshness behavior.
- **CRM row adapter/migration path:** Existing CRM gift-history row fields should migrate or adapter-map into the shared row contract for overlapping fields. The PRD should require this as an implementation constraint and acceptance criterion, without prescribing the exact migration plan.
- **Shared contribution filter definitions:** Shared states such as receipt affected, pending correction, approval state, refund state, CRM/Twenty post state, designation issue, recurring link, and payment status must use the same backend definitions wherever exposed.
- **Canonical identity:** Use `donation.id` as the canonical staff-facing gift identity. Staged gift, CRM record, recurring agreement, and Stripe/provider references are joined context, not the primary identity.
- **Route-aware entry model:** Keep context-preserving URLs for CRM and Hub entry surfaces and canonical contribution links for durable sharing/bookmarking.
- **Contribution detail contract:** Detail must return financial summary, designation set, original/effective values where relevant, receipt state, correction/approval state, refund state, CRM/Twenty post state, recurring agreement context, Stripe/provider proof, audit summary, action availability, and version/revision metadata.
- **Designation set module:** Model multiple designation lines as first-class and equal. Each line has amount, currency, exactly one fund, fund type, optional memo evidence, optional restriction, and line-level correction/audit context.
- **Adjustment/correction module:** Persist corrections and refunds as adjustment records linked to the donation. Routine safe corrections may apply immediately; high-risk corrections create correction requests.
- **Correction request module:** Track pending, approved, rejected, superseded, and stale/pending-too-long states. Support approval ownership policy, outcome handling, rejection reason, requester notification, and follow-up tasks.
- **Approval policy module:** Support tenant-level policies for approval suppression, approval ownership, separation of duties, stronger approval categories, reminder/escalation timing, and server-side enforcement.
- **Notification/task hook module:** Use hook contracts for approval tasks, in-app notifications, optional email notifications, approval outcomes, requester follow-ups, reminders, and optional escalations. Do not require the full automation builder in this PRD.
- **Receipt policy module:** Handle receipt affected state, updated receipt delivery choices, requester proposal, approver confirmation, donor email preference checks, email send, PDF generation, defer-with-reason, and tenant delivery guardrails.
- **Operation result module:** Return updated canonical detail plus audit, adjustment/correction IDs, approval/task outcomes, receipt outcomes, downstream effects, provider outcomes, warnings, and safe errors. UI should progressively disclose details.
- **Audit module:** Provide append-only human-readable events with expandable technical proof. Include corrections, approvals, receipt actions, CRM/Twenty post actions, refunds, provider actions, settings policy changes, notification/task events, and table/view-default changes.
- **Action availability module:** Compute next-best actions, More actions, inline action availability, missing capabilities, blocked reasons, next steps, and risk level from backend state and policy.
- **Granular capability model:** Use staff-friendly roles backed by backend capabilities. Split broad contribution management into capabilities for view detail, request/apply/approve corrections, manage receipts, run refunds, retry CRM/Twenty post, use provider/admin actions, manage settings, manage table preferences, and manage CRM gift-history view defaults.
- **CRM inline operation shell:** Build one reusable operation shell for inline CRM actions. It owns permissions, blocked states, current values, downstream effects, required reason/confirmation framing, submit/loading/error state, operation result, audit link, focus return, and row refresh behavior.
- **Action-specific operation content:** Each inline operation supplies its specific fields, copy, validation messages, risk copy, downstream effect copy, and confirmation copy inside the shared shell.
- **CRM inline operation affordances:** CRM rows may expose all contribution detail operations inline in v1 when staff has capability and state allows it. Full parity is allowed because shared contracts and server enforcement are the safety boundary.
- **Risky inline operation pattern:** Risky operations can start from a row menu or button, but must expand into a contextual dialog/drawer before submission. If the compact UI cannot show enough context, open contribution detail rather than submit under-contextualized.
- **Inline result panel:** After inline success/failure, show a result panel inside the same operation shell. Keep staff in CRM, refresh the affected row, preserve context/selection/focus, and offer full detail as an optional secondary action.
- **Responsive operation sheet:** On narrow screens, the operation shell becomes a full-height or bottom sheet with sticky actions where appropriate, keyboard-safe forms, 44px touch targets, reduced motion support, and CRM context preservation.
- **Design system decision:** Inline CRM operation UI must use shared `@asym/ui` primitives, existing shadcn/ui components, Base UI first for new behavior-heavy primitives, the base-maia/Maia theme, Zinc palette, and shared Maia/Zinc tokens. No hardcoded colors, one-off radii, app-local shadcn copies, or separate visual language.
- **CRM action discovery:** CRM rows show one computed next-best action plus a state/capability-filtered More actions menu grouped by correction, receipt, refund, CRM/Twenty, and provider/admin.
- **Pinned row action preference:** Users may pin a preferred row action, stored server-side by stable operation ID with local responsive cache and schema versioning. Invalid pinned actions fall back to tenant default or system next-best action with explanation.
- **Tenant default row action:** Tenant admins can configure default row actions by role/team/surface. User override wins when valid; tenant default is next; system-computed next-best action is final fallback.
- **CRM gift-history view settings:** Group columns, filters/sort, pinned row action, named personal views, and reset behavior into one CRM gift-history view settings surface. Tenant defaults live in admin settings; user overrides live in personal view settings.
- **Granular reset controls:** Support reset columns, reset pinned row action, reset filters/sort, and reset all CRM gift-history view settings. Each reset previews impact and falls back to tenant defaults before system defaults.
- **Tenant default management:** Super admins can manage CRM gift-history tenant defaults. They may delegate `crm.gift_history.manage_view_defaults` or equivalent to donor-care/finance leads. Changes are audited, not approval-gated.
- **Named personal views:** Users can save multiple personal named CRM gift-history views with columns, filters/sort, pinned row action, and personal display settings. One personal view can be default. Use a compact dropdown-style view switcher near the table toolbar.
- **Personal-only named views:** Named views are not shareable/publishable in this PRD. Tenant defaults remain the shared baseline. Shared/team named views require a separate future governance decision.
- **Client freshness module:** Use shared query invalidation/refetch or patching after actions. Treat stale client views as cache/freshness issues, not a separate internal data-transfer workflow. Preserve context, scroll, row selection, and focus.
- **Deep modules to keep testable:** The shared read model, row contract mapper, action availability engine, adjustment/correction engine, approval policy evaluator, receipt policy evaluator, operation result builder, preference/default resolver, and operation shell state machine should each expose narrow, testable interfaces.
- **No internal CRM replication module:** Contributions Hub and CRM donor gift history are same-database surfaces. Do not build an internal copy job, queue, pending status, retry task, or escalation between them.

## Testing Decisions

- Tests should focus on externally visible behavior, product invariants, and contract boundaries. Avoid testing incidental UI implementation details or internal helper structure.
- Shared contribution read model tests should prove effective values derive correctly from original donations plus adjustments.
- Designation set tests should prove multiple designation lines are equal, reconcile to effective gift amount, and always require one fund per line.
- Shared row contract tests should prove CRM and Hub overlapping fields use the same values, labels, formatting, status vocabulary, and filter meanings.
- CRM row adapter tests should prove existing CRM row fields map into the shared row contract without redefining shared contribution fields.
- Shared filter definition tests should prove CRM and Hub filters return the same gifts where filter meanings overlap.
- Action availability tests should prove next-best action, More actions, blocked reasons, risk level, and missing capability are computed server-side and consistently consumed by CRM/detail/Hub.
- Correction operation tests should prove routine corrections apply directly, high-risk corrections create requests, approval policies are enforced, and stale saves are rejected.
- Adjustment record tests should prove original donations remain intact and effective values derive from applied adjustments.
- Approval policy tests should cover separation of duties, approval suppression, stronger approval categories, reminders, optional escalations, requester notifications, and rejection reasons.
- Approval notification/task tests should prove one correction request maps to at most one approval task and notification delivery is idempotent and preference-aware.
- Receipt policy tests should cover email availability, donor email opt-out, PDF fallback, defer-with-reason, requester proposal, approver confirmation/change, and delivery audit.
- Operation result tests should prove actions return updated detail, audit IDs, adjustment/correction IDs, task IDs, downstream effects, provider outcomes, and safe warnings/errors.
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
- A full shared task product beyond hook contracts and linked approval/follow-up tasks needed for contribution operations.
- Shared/team/published named CRM gift-history views.
- View ownership transfer, share-by-link, or shared-view conflict resolution.
- A separate internal CRM copy or replication workflow between CRM donor gift history and Contributions Hub.
- A step-by-step engineering migration plan for existing CRM rows.
- Treating Stripe/provider objects as canonical gift or recurring agreement identity.
- Updating Stripe metadata casually from contribution detail or CRM inline actions.
- Provider actions that bypass permissions, approval policy, idempotency, audit, or processor constraints.
- Making CRM/Twenty payment truth.
- Creating separate receipts per designation line unless a future legal/accounting requirement explicitly demands it.
- Allowing final fundless or unassigned designation states.
- Adding a new visual language, app-local shadcn component set, or theme outside Maia/Zinc.

## Further Notes

- The domain glossary in `CONTEXT.md` is the canonical language source for this PRD. Use **gift** for the staff-facing unit of work, **donation** for the persisted platform ledger row, **designation** for donor-intent allocation lines, **fund** for donor-facing giving destination, and **adjustment** for immutable correction/refund records.
- The accepted ADRs under this feature directory are the decision source of truth for implementation agents. If a future plan conflicts with an ADR, resolve the ADR explicitly rather than layering contradictory behavior.
- The codebase baseline found several implementation gaps: CRM gift history does not currently open shared detail, the detail sheet is thinner than the target scope, branch code returns a single designation object rather than a designation set, branch operations patch donation fields rather than writing adjustment records, table preferences are not yet persisted per user, and current contribution operation permissions are too broad.
- The final implementation should avoid adding compatibility shims for in-progress branch behavior that conflicts with the accepted product decisions. Replace unshipped branch behavior with the accepted model.
- The PRD intentionally includes product-level acceptance criteria, not a full automated test plan. Implementation planning can split these criteria into unit, integration, component, and end-to-end tests.
