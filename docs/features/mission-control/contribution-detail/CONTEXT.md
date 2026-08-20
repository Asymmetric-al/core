# Mission Control — Contribution Detail

> **Note (2026-07-06):** The CRM/Twenty post state and repost/retry actions
> referenced in this glossary target the now-retired Twenty pipeline and are
> dormant per
> [ADR-0001](../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)
> (2026-07-06); "CRM post" survives only as a label over the dormant
> staged-gift pipeline pending the Phase 8 re-groom.

Staff-facing view of a single platform donation: financial truth, workflow state, and allowed actions. Opened from CRM donor history or Contributions Hub by the same `donation.id`.

## Language

**Gift**:
The staff-facing unit of work for one payment attempt or completion, backed by a platform donation record.
_Avoid_: Contribution (UI label only), transaction (processor jargon), payment (too broad)

**Donation**:
The platform ledger row that holds payment truth (amount, status, Stripe references, fund/missionary on record).
_Avoid_: Gift (staff term; donation is the persisted entity name)

**Fund**:
The donor-facing giving destination. A fund can represent a missionary, a project, or a campaign.
_Avoid_: Restriction, memo, generic bucket

**General Fund**:
The default fund used when a donor does not provide a specific giving designation.
_Avoid_: Unassigned, miscellaneous

**Missionary fund**:
A fund for ongoing ministry support of a specific missionary or missionary family, usually without a fixed fundraising goal or end date.
_Avoid_: Campaign, project fund

**Project fund**:
A fund for a specific ministry project or purpose, which may be ongoing or long term and may or may not have a fundraising goal.
_Avoid_: Campaign when there is no defined season/goal

**Campaign**:
A short-lived fund with a specific fundraising goal and defined fundraising season, start/end date, or progress tracking.
_Avoid_: Project fund, missionary fund

**Staged gift**:
Workflow envelope for finance review, CRM posting, and receipt orchestration; joined to a donation and may be absent.
_Avoid_: Gift (alone), contribution record

**Recurring agreement**:
The internal Mission Control business object for an ongoing donor commitment, including cadence, amount, designation, status, and linked gift history.
_Avoid_: Stripe subscription (provider object), recurring payment (too broad)

**Designation**:
One donor-intent allocation line on a gift, with its own amount and exactly one fund destination. A gift can have multiple designations, and no designation is primary by default.
_Avoid_: Primary fund, primary missionary, hidden split, legal restriction, unassigned designation

**Designation set**:
The complete set of designations for one gift; the set must reconcile to the effective gift amount.
_Avoid_: Designation summary (unless clearly derived from the full set)

**Designation row**:
The compact staff-facing display of one designation line: amount, fund, fund type, and fund reference.
_Avoid_: Primary designation row

**Designation detail**:
The expanded display of a designation line, including fund subtype context, memo evidence, legal restriction, and line-level correction/audit state.
_Avoid_: Technical allocation dump

**Allocation line**:
Implementation-facing term for a designation row. Use **Designation** in staff-facing language.
_Avoid_: Split (as noun), allocation (in UI copy unless finance users prefer it)

**Stripe reference**:
A provider identifier or dashboard link used as technical/payment evidence for a gift or recurring agreement.
_Avoid_: Recurring agreement, gift identity

**Stripe operations**:
Role-gated provider actions available from contribution detail, limited to safe workflows such as refund, webhook replay, and sync status.
_Avoid_: Raw Stripe control panel, metadata editor

**Operation result**:
The backend response after a contribution detail action, including updated detail plus audit, correction, approval, downstream effect, task, and provider outcome metadata.
_Avoid_: Minimal success response

**Downstream effect**:
A consequence of a save/action that affects another workflow, such as receipt review, CRM repost, reconciliation review, recurring agreement review, or provider sync.
_Avoid_: Side effect (too vague for staff-facing product language)

**Progressive disclosure**:
The UI pattern for showing staff a simple result first while hiding technical proof, ids, and system metadata behind expandable or role-gated details.
_Avoid_: Hide data (the data remains available when needed)

**Financial summary**:
The default top-level contribution detail view: amount, payment status, donor, date/source/payment method, designation rows, workflow chips, and available primary actions.
_Avoid_: Operations console

**Workflow chip**:
A compact visible status indicator for receipt, CRM post, refund, recurring, correction, or approval state.
_Avoid_: Technical badge when the chip is staff-facing

**Next-best action**:
The safest valid action Mission Control recommends for the gift's current state and the staff member's role.
_Avoid_: Full action menu by default

**Pinned row action**:
A per-user preferred inline action shown on CRM gift-history rows when valid for that gift and staff member.
_Avoid_: Permission override, forced primary action

**Pinned row action preference**:
The server-backed per-user setting that stores a staff member's preferred CRM gift-history row action by stable operation id.
_Avoid_: Browser-only row action setting

**Tenant default row action**:
The admin-configured default CRM gift-history row action for a role, team, or surface, used when a user has not pinned a valid personal row action.
_Avoid_: Permission override, one-size-fits-all action

**Pinned action fallback**:
The behavior where Mission Control shows the computed next-best action when a user's pinned row action is unavailable for a gift.
_Avoid_: Disabled primary action with no explanation

**Row action fallback chain**:
The order used to choose the visible CRM row action: valid user-pinned action, then valid tenant default action, then system-computed next-best action.
_Avoid_: Preference bypass

**More actions**:
The progressive-disclosure menu or section for secondary, high-risk, admin, or technical operations.
_Avoid_: Primary actions list

**Inline more actions**:
The CRM row menu that exposes additional contribution operations after the visible next-best action, grouped by operation category and filtered by state and capability.
_Avoid_: Dense row button list

**Blocked action**:
An action that is relevant to the gift but unavailable because of state, policy, missing data, or role constraints; shown disabled only when it helps staff understand next steps.
_Avoid_: Hidden error, dead button

**Blocked reason**:
The staff-readable explanation for why a blocked action cannot run, paired with the next step when one exists.
_Avoid_: Raw exception message

**Contributions Hub**:
Mission Control list/search surface at `/contributions` for triaging gifts across donors.
_Avoid_: Contributions page (internal route name only)

**Simple contribution search**:
The default Hub search path for everyday lookup by donor, amount, date, fund/designation, or payment reference.
_Avoid_: Advanced filter drawer

**Advanced contribution filters**:
Operational and financial filters used to find gifts by receipt state, CRM post state, refund state, correction/approval state, recurring agreement, fund type, memo/check text, or audit/action id.
_Avoid_: Default search noise

**CRM gift history row**:
The compact donor-page table row for a gift, showing amount/date/designation summary plus meaningful issue indicators before staff open contribution detail.
_Avoid_: Mini contribution detail

**Issue indicator**:
A compact CRM row signal that a gift needs attention, such as receipt affected, CRM post failed, pending approval, refund state, or designation issue.
_Avoid_: Full action workflow in the row

**Column preference**:
A per-user saved table configuration that controls which CRM gift history columns are visible.
_Avoid_: Global table setting, browser-only preference

**CRM gift-history view settings**:
The settings surface for configuring CRM gift-history display and row behavior, including columns, pinned row action, and reset behavior.
_Avoid_: Separate action preference area

**Named personal view**:
A user-saved CRM gift-history view with a name, columns, filters/sort, pinned row action, and other personal display settings.
_Avoid_: Shared tenant view

**Personal-only view**:
A named CRM gift-history view that belongs to one user and is not shareable or publishable in this PRD.
_Avoid_: Team view, shared view

**Default personal view**:
The named personal view that opens automatically for a user in CRM gift history.
_Avoid_: Tenant default

**View switcher**:
The lightweight UI control for changing between named personal CRM gift-history views.
_Avoid_: Dashboard builder

**Compact view switcher**:
The dropdown-style view switcher shown near the CRM gift-history toolbar, displaying the current named personal view without persistent tabs or chips.
_Avoid_: View tabs, chip strip

**Granular reset**:
A scoped reset action that restores one CRM gift-history view setting area, such as columns, pinned row action, or filters/sort, without resetting unrelated preferences.
_Avoid_: Wipe all settings

**Reset preview**:
The confirmation view that shows what a reset will change before applying it.
_Avoid_: Surprise reset

**Tenant default**:
The admin-configured default value used when a user resets a CRM gift-history view setting and a tenant-specific default exists.
_Avoid_: System default when tenant has configured policy

**Table preference source of truth**:
The server-side per-user preference record for one table id; local browser state may cache it but does not own it.
_Avoid_: Local-only column setting

**Preference draft**:
The temporary client-side column chooser state before or during autosave.
_Avoid_: Saved preference

**Preference schema version**:
The version attached to saved table preferences so new, renamed, or removed columns can be migrated safely.
_Avoid_: Unversioned blob

**Soft live sync**:
The freshness model where contribution detail updates in the background when safe, without forcing focus changes or interrupting in-progress edits.
_Avoid_: Hard real-time overwrite

**Shared query invalidation**:
The client freshness step that refetches or patches shared contribution queries after a correction or action succeeds.
_Avoid_: Internal copy workflow, full page refresh

**Quiet row refresh**:
A low-disruption update to an already visible CRM or Hub row after shared contribution data changes.
_Avoid_: Workspace reset, forced reload

**Stale save**:
A save attempt based on an older contribution version than the current server record.
_Avoid_: Conflict-free save

**Freshness indicator**:
A low-noise UI message that tells staff the open detail has updated, such as "Updated just now."
_Avoid_: Blocking modal for routine background updates

**Smart close**:
The close behavior for contribution detail: remove only selected gift URL state, preserve CRM/Hub context, patch affected data, and restore focus.
_Avoid_: Full page reset, navigate away

**Focus return target**:
The row or button that opened contribution detail and should receive focus again when the overlay closes.
_Avoid_: Focus loss

**Donor-care staff**:
Staff role focused on donor support workflows; can view gift context and request corrections but does not directly perform high-risk financial/provider actions.
_Avoid_: Finance staff

**Finance staff**:
Staff role responsible for contribution operations such as designation corrections, receipt state, CRM post retries, and finance audit review.
_Avoid_: Donor-care staff

**Finance approver**:
Role that can approve high-risk correction requests and policy-allowed overrides.
_Avoid_: Super admin when the action is workflow approval rather than settings ownership

**Super admin**:
Tenant-level administrator who can manage contribution operation settings, including approval suppression policy.
_Avoid_: Finance approver for routine workflow approvals

**Capability**:
A backend-enforced permission for one action or class of actions, such as applying corrections, approving corrections, managing receipts, replaying Stripe events, or changing settings.
_Avoid_: UI-only role check

**CRM gift-history default manager**:
A staff member with delegated capability to manage tenant-level CRM gift-history view defaults without receiving contribution operation permissions.
_Avoid_: Super admin for all routine view-default changes

**View-default change audit**:
The audit record for a tenant-level CRM gift-history view default change, including actor, scope, old/new values, affected role/team/surface, and timestamp.
_Avoid_: Approval request for routine view settings

**Contribution detail**:
The shared detail experience for one `donation.id`, regardless of whether staff arrived from Hub or CRM.
_Avoid_: Detail sheet (implementation shape), gift drawer

**Contribution detail overlay**:
The route-aware overlay that presents contribution detail while preserving the staff member's current Mission Control context.
_Avoid_: Separate CRM gift drawer, separate Hub detail sheet

**Entry surface**:
The Mission Control place where staff start working with a gift, such as CRM donor gift history or Contributions Hub.
_Avoid_: Separate business logic

**Shared contribution operation contract**:
The backend contract used for a contribution operation regardless of whether staff start from CRM donor gift history, Contributions Hub, or contribution detail.
_Avoid_: Surface-specific save behavior

**Contribution command**:
A typed staff action against one Gift, executed by Contribution Operations Core. HTTP and stored correction requests still carry `actionType` plus a JSON payload bag; the Core parses that bag at its seam.
_Avoid_: treating `payload?: Record<string, unknown>` as the Core interface, or duplicating the action catalog in Mission Control shells

**Inline contribution operation**:
A contribution operation launched directly from a row or compact surface, such as CRM donor gift history, while still using the shared contribution operation contract.
_Avoid_: Inline shortcut with different validation

**Risky inline operation**:
An inline contribution operation that can affect financial truth, donor-facing receipts, approvals, refunds, provider actions, or CRM/Twenty post state and therefore requires contextual review before submission.
_Avoid_: One-click risky action

**Contextual operation dialog**:
A compact dialog or drawer launched from an inline action that shows current values, proposed change, downstream effects, required reason/confirmation, and operation result before submitting a risky operation.
_Avoid_: Blind row-menu mutation

**Operation shell**:
The reusable dialog/drawer frame for inline contribution operations, responsible for shared permission, blocked-state, current-value, downstream-effect, submit, operation-result, audit-link, focus-return, and row-refresh behavior.
_Avoid_: One-off modal per action

**Responsive operation sheet**:
The narrow-screen presentation of the operation shell, using a full-height or bottom-sheet layout while preserving the same operation contract and CRM workflow continuity.
_Avoid_: Separate mobile workflow

**Inline operation result panel**:
The success or failure state shown inside the operation shell after an inline contribution operation, including changed values, downstream effects, audit link, and next actions while keeping staff in the CRM context.
_Avoid_: Toast-only result, automatic navigation

**Inline operation UX done**:
The acceptance standard for inline CRM operations: shared Maia/Zinc UI, accessible operation shell, required review context, in-place result panel, preserved CRM context, and responsive sheet behavior.
_Avoid_: Works technically but feels separate from Mission Control

**CRM workflow continuity**:
The UX expectation that staff who start an inline contribution operation from CRM remain in CRM after submit, with context, scroll, selection, and focus preserved unless they explicitly choose to open full detail.
_Avoid_: Forced navigation after save

**Operation affordance**:
The UI entry point for an operation, such as a row button, menu item, form, or detail action. Affordance can differ by surface; saved behavior cannot.
_Avoid_: Separate operation

**Canonical contribution link**:
The durable share/bookmark URL for a gift: `/contributions/{donation.id}`.
_Avoid_: CRM-context gift links as permanent references

**Context-preserving gift link**:
A URL that keeps the staff workspace open while selecting a gift, such as `/crm?donor={donorId}&gift={donationId}` or `/contributions?gift={donationId}`.
_Avoid_: Share link (use canonical contribution link for sharing)

**Payment status**:
Donation lifecycle state: completed, pending, failed, refunded.
_Avoid_: Receipt status, CRM post status, staged gift status

**Receipt status**:
Whether a tax receipt was sent, pending, failed, or suppressed for this gift.
_Avoid_: Payment status, email delivery (implementation)

**Receipt content snapshot**:
The designation lines and effective gift values represented by a sent receipt.
_Avoid_: Current designation set (when corrections have happened after send)

**Receipt affected**:
State shown when a later correction changes values that were already represented on a sent receipt.
_Avoid_: Receipt invalid (too strong unless policy/legal review says so)

**Updated receipt**:
A new receipt representation generated after a correction changes values that were already included on a sent receipt.
_Avoid_: Original receipt resend

**Receipt delivery choice**:
The staff selection made during a receipt-affecting correction: send updated receipt by email, generate updated receipt PDF, or defer with reason when policy allows.
_Avoid_: Automatic receipt send

**Receipt delivery proposal**:
The requester's selected updated receipt delivery action on a correction request before an approver confirms it.
_Avoid_: Final receipt action

**Confirmed receipt delivery**:
The updated receipt delivery action approved with the correction request and processed when the correction becomes effective.
_Avoid_: Suggested receipt action

**Updated receipt delivery policy**:
Tenant-level settings that define default receipt delivery choice, defer rules, role guardrails, and donor email opt-out handling for updated receipts.
_Avoid_: Generic automation rules

**Receipt delivery defer reason**:
The staff-provided explanation required when policy allows delaying updated receipt email or PDF generation after a receipt-affecting correction.
_Avoid_: Blank defer, skip receipt

**Updated receipt PDF**:
A generated PDF receipt snapshot used when email is unavailable, disallowed by donor preference, or not selected by staff.
_Avoid_: Screenshot, ad hoc printout

**Donor email preference**:
The donor's communication choice that controls whether Mission Control may send receipts by email.
_Avoid_: Staff notification preference

**CRM post status**:
Downstream Twenty sync state for a staged gift; workflow metadata, not payment truth.
_Avoid_: Payment status, reconciliation (broader finance term)

**CRM gift record**:
The parent CRM record representing one donor gift/donation.
_Avoid_: Designation record, payment truth

**CRM designation record**:
The child CRM record representing one designation line under a CRM gift record.
_Avoid_: Separate gift, primary designation

**CRM post scope**:
Whether a CRM/Twenty post event applies to the parent gift record or a child designation record.
_Avoid_: Generic CRM status when line-level status matters

**Shared contribution read model**:
The database-backed contribution view used by Contributions Hub, contribution detail, and CRM donor gift history for shared gift fields.
_Avoid_: Duplicate CRM copy, internal replication layer

**Shared contribution row contract**:
The field contract for contribution values that appear in more than one surface, ensuring the same value, label, formatting, and status vocabulary wherever the field is shown.
_Avoid_: CRM-specific field derivation, Hub-specific field derivation

**CRM row adapter**:
The transition layer or mapping that lets existing CRM gift-history rows use the shared contribution row contract for overlapping fields.
_Avoid_: Separate CRM row truth

**Overlapping contribution field**:
A gift field shown in both CRM donor gift history and Contributions Hub or contribution detail.
_Avoid_: Similar-but-different field

**Shared contribution filter definition**:
The backend definition for a contribution state filter reused across surfaces, ensuring CRM and Hub mean the same thing when filtering by the same state.
_Avoid_: Surface-specific status meaning

**CRM issue filter**:
A compact donor-context filter composed from shared contribution state definitions, such as receipt affected, pending correction, refund state, or designation issue.
_Avoid_: CRM-only status logic

**Display parity**:
The product invariant that the same gift fields show the same effective values and labels in Contributions Hub, contribution detail, and CRM donor gift history.
_Avoid_: Eventually consistent internal CRM copy

**Stale client view**:
A browser/cache freshness problem where one surface has not refetched the latest shared database values yet.
_Avoid_: CRM data-transfer failure

**Financial truth**:
Fields derived from the platform donation (and authoritative processor refs), not from CRM or receipt logs alone.
_Avoid_: Source of truth (use only in reconciliation docs)

**Correction**:
An audited staff-initiated change to gift context or externally reported state, saved through the contribution detail contract and linked to the original donation.
_Avoid_: Edit (too casual), overwrite, fix-up

**Adjustment**:
An immutable record that changes the current effective gift view while preserving the original donation row.
_Avoid_: Donation rewrite, direct mutation

**Correction request**:
A pending approval item for a high-risk correction; it is not effective until approved.
_Avoid_: Draft correction (too ambiguous)

**Approval policy**:
Tenant-level rules that decide whether externally visible corrections require approval before becoming effective.
_Avoid_: Per-form approval toggle

**Approval ownership policy**:
Tenant-level rules that decide who can approve a correction request, including whether self-approval is allowed and when stronger approval is required.
_Avoid_: Informal approver choice

**Separation of duties**:
An approval rule where the correction requester cannot approve their own high-risk correction.
_Avoid_: Self-approval

**Approval suppression**:
A super-admin settings choice that allows specified externally visible corrections to apply without an approval request while preserving audit and downstream warnings.
_Avoid_: Disable audit, skip controls, bypass

**Approval task**:
A durable Mission Control task created for a pending correction request so approvers have a tracked work item linked to the gift.
_Avoid_: Notification only, inbox item

**Correction approval notification**:
An alert to eligible approvers that a high-risk correction request needs review, delivered through configured channels such as in-app and email.
_Avoid_: Generic system alert

**Approval notification preferences**:
Per-user settings that control how correction approval events reach that user and whether those events create a task for them.
_Avoid_: Global tenant-only routing with no personal choice

**Correction approval outcome**:
The approve or reject decision recorded for a correction request, including actor, decision time, reason when present, and resulting task/notification state.
_Avoid_: Silent status update

**Rejection reason**:
The required explanation an approver provides when rejecting a correction request.
_Avoid_: Optional note, generic denial

**Rejection follow-up task**:
A task for the original requester to revise, resubmit, or abandon a rejected correction request.
_Avoid_: New approval task, duplicate notification

**Correction approval SLA**:
Tenant-level timing rules for reminding or escalating pending correction requests that have not been approved or rejected.
_Avoid_: Auto-approval timer, generic SLA engine

**Approval reminder**:
A low-noise notification that a correction request is still waiting for an eligible approver.
_Avoid_: New correction request

**Approval escalation**:
Routing a still-pending correction request to a configured higher-level approver role after the reminder window has passed.
_Avoid_: Automatic approval, bypass approval

**Pending too long**:
Derived state shown when a correction request has exceeded the tenant's configured approval timing threshold.
_Avoid_: Failed approval, expired request

**Audit trail**:
The append-only history of staff, system, processor, receipt, CRM, correction, and approval events for one gift.
_Avoid_: Activity feed (too generic), logs (too technical for staff)

**Restriction**:
A legal or accounting limitation on how a gift can be used. Use only when the gift has a legally binding limitation, such as a restricted grant.
_Avoid_: Normal donor designation, fund, campaign, memo

**Memo**:
The note or wording provided by the donor, often from a paper-check memo line, used as supporting information to identify intended fund designation.
_Avoid_: Fund, designation, restriction

**Technical proof**:
Expandable audit detail for authorized finance/admin users, including request ids, provider event ids, job ids, idempotency keys, and before/after values.
_Avoid_: Raw logs (do not imply unrestricted payload exposure)

**Recurring link warning**:
A reconciliation warning shown when provider data indicates a recurring relationship but no internal recurring agreement is linked.
_Avoid_: Broken subscription (provider-specific and too narrow)

**Correction reason**:
The staff-provided explanation required before saving a correction that affects designation, receipt, CRM post, tax-deductible amount, or reconciliation review.
_Avoid_: Note (too broad)

**Override**:
An admin-only correction that bypasses a normal lock, still audited and still explicit about downstream effects.
_Avoid_: Force save

**Mission Control design language**:
The shared admin UI look and interaction system built from repo design tokens, shadcn primitives, and existing sheet/card/action patterns.
_Avoid_: One-off contribution-detail styling, hardcoded colors

## Flagged ambiguities

**Transaction ID (UI label today):** Currently maps to Stripe payment intent / charge / donation id fallback. Product should distinguish **processor payment intent**, **charge id**, and **platform donation id** in detail — not one blurred field.

**Twenty (UI label today):** Label means CRM post status; rename to staff language (**CRM post** or **Twenty sync**) in detail spec.

**Correction vs refund:** A correction changes gift metadata or reporting context; a refund changes money movement/payment state. Do not use "correction" to mean "refund."

**Primary designation:** Rejected language for contribution detail. Multiple designations are equal; summary labels may be derived for compact list views but must not imply one line owns the gift.

**Restriction vs designation:** A normal donor designation to a missionary fund, project fund, or campaign is not automatically a legal restriction. Use **restriction** only when legal/accounting treatment requires it.

**Memo vs fund:** Donor memo text can help identify the intended fund, but the memo itself is not the fund or designation.

**Unassigned designation:** Rejected as a final state. If donor intent is unspecified, assign the designation line to **General Fund**.

## Example dialogue

**Staff:** “Open this gift from the donor’s CRM history.”  
**System:** Loads contribution detail for `donation.id=…`, same payload as Hub.  
**Staff:** “Why can’t I approve it?”  
**System:** “No staged gift on this donation — read-only financial view. Manual gifts post through [path TBD].”
