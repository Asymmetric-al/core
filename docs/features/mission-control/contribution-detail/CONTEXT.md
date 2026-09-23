# Mission Control — Contribution Detail

Staff-facing view of one gift through the shared contribution contract. The
[current owner map](README.md) and amended ADR Decisions govern the terms
below. Original May–June wording remains in immutable linked Git records. Stable gift URLs survive the
Phase 13 ledger cutover because its header reuses the legacy identifier.

## Language

**Gift**:
A donor gift event identified by the Phase 13 contribution header, with one or more designation lines and source-owned effective money facts.
_Avoid_: donation-row-as-the-gift, processor transaction as business identity

**Donation**:
The legacy persisted donation entity name in the pre-Phase-13 implementation. New financial contracts use Contribution (gift), header, designation lines and postings as defined by Phase 13.
_Avoid_: a second target ledger, a flat row as effective money truth

**Fund**:
A giving destination for a permitted purpose, distinct from the campaign effort that prompted a gift.
_Avoid_: Campaign, restriction, memo, generic bucket

**General Fund**:
The default fund used when a donor does not provide a specific giving designation.
_Avoid_: Unassigned, miscellaneous

**Missionary fund**:
A fund for ongoing ministry support of a specific missionary or missionary family, usually without a fixed fundraising goal or end date.
_Avoid_: Campaign, project fund

**Project fund**:
A fund for a specific ministry project or purpose, which may be ongoing or long term and may or may not have a fundraising goal.
_Avoid_: Campaign (a separate effort, independent of the project lifetime)

**Campaign**:
A staff-defined fundraising effort with goals and reporting rollups, as defined by Phase 13. It can span multiple giving destinations and is not itself a Fund or Designation.
_Avoid_: short-lived Fund, email blast, public page, source code

**Staged gift**:
A predecessor intake/review envelope. Its source-owned review evidence may remain relevant, but it is neither canonical gift identity, receipt authority nor a prerequisite for every current command.
_Avoid_: gift ledger, CRM posting authority

**Recurring agreement**:
Historical contribution-detail wording for recurring support. Phase 16 Recurring Commitment, group and line definitions govern the current target; this label does not establish another recurring record or lifecycle.
_Avoid_: Stripe subscription as intent, a feature-local recurring authority

**Designation**:
One donor-intent allocation line on a gift, with its own amount and one eligible giving destination under Phase 13. A gift can have multiple designations, and no designation is primary by default.
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
A provider identifier or dashboard link used as technical/payment evidence for a gift or Phase 16 recurring commitment.
_Avoid_: Recurring agreement, gift identity

**Stripe operations**:
Role-gated provider actions available from contribution detail, limited to safe workflows such as refund, webhook replay, and sync status.
_Avoid_: Raw Stripe control panel, metadata editor

**Operation result**:
The backend response after a contribution detail action, including updated detail plus audit, correction, approval, downstream effect, task, and provider outcome metadata.
_Avoid_: Minimal success response

**Downstream effect**:
An independently owned consequence of an accepted source action, such as a document correction request, Phase 16 recovery case, message intent or provider operation. Request, readiness and completion remain distinct.
_Avoid_: one success flag for every owner

**Progressive disclosure**:
The UI pattern for showing staff a simple result first while hiding technical proof, ids, and system metadata behind expandable or role-gated details.
_Avoid_: Hide data (the data remains available when needed)

**Financial summary**:
The default top-level contribution detail view: amount, payment status, donor, date/source/payment method, designation rows, workflow chips, and available primary actions.
_Avoid_: Operations console

**Workflow chip**:
A compact projection of an actual source-owned posting, document, refund, recurring or approval state.
_Avoid_: a second persisted status, retired CRM-post state

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
Source-qualified filters for exact posting, document, refund, correction/approval, recurring, giving-destination, campaign-attribution and audit facts.
_Avoid_: retired CRM-post filters, client-invented financial states

**CRM gift history row**:
The compact donor-page table row for a gift, showing amount/date/designation summary plus meaningful issue indicators before staff open contribution detail.
_Avoid_: Mini contribution detail

**Issue indicator**:
A safe row projection of a current source-owned need, such as required approval, document repair, provider exception or designation integrity.
_Avoid_: CRM-copy failure, inferred source completion

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
Staff responsible for donor support. Actual read/request/mutation rights come from current Phase 12 capabilities and source scope, not this role label.
_Avoid_: implicit finance or provider authority

**Finance staff**:
Staff responsible for source-authorized money operations and finance review. Current Phase 12/13 action capabilities determine authority.
_Avoid_: a role name as a permission bypass

**Finance approver**:
A person currently eligible under the owner policy to decide an approval-required request. Enabled separation of duties excludes the requester.
_Avoid_: automatic authority from a role label

**Super admin**:
A tenant administration role whose settings and source actions remain subject to current capabilities, scope and non-bypassable owner rules.
_Avoid_: blanket approval suppression or financial bypass

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
The shared view and operation context for one Phase 13 contribution header, whether opened from CRM or Hub.
_Avoid_: a second gift object

**Contribution detail overlay**:
The route-aware overlay that presents contribution detail while preserving the staff member's current Mission Control context.
_Avoid_: Separate CRM gift drawer, separate Hub detail sheet

**Entry surface**:
The Mission Control place where staff start working with a gift, such as CRM donor gift history or Contributions Hub.
_Avoid_: Separate business logic

**Shared contribution operation contract**:
The backend contract used for a contribution operation regardless of whether staff start from CRM donor gift history, Contributions Hub, or contribution detail.
_Avoid_: Surface-specific save behavior

**Inline contribution operation**:
A contribution operation launched directly from a row or compact surface, such as CRM donor gift history, while still using the shared contribution operation contract.
_Avoid_: Inline shortcut with different validation

**Risky inline operation**:
An owner command requiring complete contextual review before submission, including exact current source values, proposed effects, capability and required reason/confirmation.
_Avoid_: one-click policy bypass

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
The durable share/bookmark URL for a gift: `/contributions/{giftId}` (the stable contribution-header UUID).
_Avoid_: CRM-context gift links as permanent references

**Context-preserving gift link**:
A URL that keeps the staff workspace open while selecting a gift, such as `/crm?donor={donorId}&gift={donationId}` or `/contributions?gift={donationId}`.
_Avoid_: Share link (use canonical contribution link for sharing)

**Payment status**:
The current source-qualified payment/execution fact in the Phase 13 orthogonal state model, displayed separately from posting, provider-control, document, deposit and approval facts.
_Avoid_: one mutable completed/pending/refunded status for every lifecycle

**Receipt status**:
A presentation of separately owned eligibility/issuance, current artifact and delivery facts for an exact purpose and subject.
_Avoid_: one sent/pending flag as receipt authority

**Receipt content snapshot**:
The immutable Phase 7 source facts and exact Phase 18 artifact lineage for an admitted document. This term does not name a feature-local snapshot store.
_Avoid_: current gift values as an old receipt, local rerender

**Receipt affected**:
The current source-owned correction impact requiring Phase 7 eligibility/issuance review or an exact document successor. It does not itself issue or invalidate a document.
_Avoid_: UI-generated legal verdict

**Updated receipt**:
An exact source-authorized document successor produced and resolved through Phase 18 under the governing Phase 7 purpose.
_Avoid_: rerendered current gift, original receipt resend

**Receipt delivery choice**:
An explicit selection among currently admitted owner follow-ups: exact artifact access/delivery, source-authorized issuance/replacement request, or permitted audited suppression/defer.
_Avoid_: unconditional PDF fallback, correction-save-implies-send

**Receipt delivery proposal**:
Non-executing source context proposing an exact document/message follow-up for current-authority review.
_Avoid_: issued document, prepared or sent message

**Confirmed receipt delivery**:
The exact authorized follow-up instruction admitted after current owner checks. Its preparation, provider submission and delivery results are still separate.
_Avoid_: approval proves receipt delivered

**Updated receipt delivery policy**:
Tenant defaults constrained by Phase 7 purpose/issuance, Phase 18 artifact/access and Phase 17/6 recipient/requiredness rules.
_Avoid_: a second receipt policy engine, marketing preference as official suppression

**Receipt delivery defer reason**:
A protected source explanation recorded only where the exact owner policy permits deferring follow-up.
_Avoid_: blank defer, arbitrary permission to skip required work

**Updated receipt PDF**:
The exact accessible Phase 18 artifact of an admitted source-authorized successor. Missing email never creates generation authority.
_Avoid_: local receipt snapshot, generic fallback document

**Donor email preference**:
A purpose-scoped communication choice applied by the owning recipient/consent policy. It does not automatically suppress required official messages or alter document eligibility.
_Avoid_: global receipt opt-out, staff attention preference

**CRM post status**:
A retired Twenty-integration term retained only to interpret dated evidence. It has no current workflow, filter, capability or retry command.
_Avoid_: current CRM or payment state

**CRM gift record**:
The authorized CRM presentation of a Phase 13 contribution header through the shared effective read model. It is not a copied CRM ledger entity.
_Avoid_: second gift store, vendor parent record

**CRM designation record**:
The authorized CRM presentation of one stable Phase 13 designation line under its gift header.
_Avoid_: separately posted child gift, primary designation

**CRM post scope**:
A retired vendor-posting concept used only in historical evidence. Current source recovery uses exact owning gift/line/provider identities and commands.
_Avoid_: current retry scope, native CRM replication

**Shared contribution read model**:
The source-qualified projection of the one Phase 13 effective fold and separately owned current facts, used across Hub, detail and native CRM.
_Avoid_: duplicate CRM copy, second effective-value computation

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
The source-owned effective contribution facts from the canonical ledger and independently authoritative provider execution evidence. CRM presentation, receipt history and original base-row amounts do not independently derive money truth.
_Avoid_: processor status as the gift, a second effective fold

**Correction**:
An audited, authorized change submitted through the shared contribution contract. Phase 13 governs append-only money corrections; affected identity, document and communication owners retain their own facts and commands.
_Avoid_: overwrite, fix-up, changing another owner through a local snapshot

**Adjustment**:
Historical name for the predecessor correction overlay. Phase 13 supersedes that storage model with append-only postings and the canonical effective fold while preserving the correction history.
_Avoid_: a parallel target overlay, donation rewrite, direct money mutation

**Correction request**:
A pending correction awaiting approval when the applicable current owner policy requires it. Its presence is not proof that a money operation is effective.
_Avoid_: every high-risk operation requires second approval by default

**Approval policy**:
The current owner rule for admitting a correction. Under Phase 13 D5 and Phase 12, money operations require capability, reason and active audit; an additional approver is optional per tenant and off by default.
_Avoid_: approval suppression as the default model, per-form policy

**Approval ownership policy**:
The current Phase 12 policy determining eligible approvers when approval is required. Enabled Phase 13 separation of duties excludes the requester; a historical local setting cannot bypass that rule.
_Avoid_: informal approver choice, self-approval when separation of duties applies

**Separation of duties**:
An approval rule where the correction requester cannot approve their own high-risk correction.
_Avoid_: Self-approval

**Approval suppression**:
Historical predecessor setting from ADR-CD-005, superseded for the Phase 13 target by explicitly enabled optional second approval through Phase 12. It grants no bypass of capability, reason, audit or provider requirements.
_Avoid_: current approval default, disable audit, skip controls

**Approval task**:
A durable Mission Control task created for a pending correction request so approvers have a tracked work item linked to the gift.
_Avoid_: Notification only, inbox item

**Correction approval notification**:
The exact Phase 17 attention projection of an actual source-required approval, with required in-product and independently qualified optional email steps.
_Avoid_: notification creates or completes approval

**Approval notification preferences**:
Per-user settings for eligible correction-approval notification presentation under Phase 17. They do not create, suppress or complete source-owned approval work; task creation and assignment follow the shared task owner contract.
_Avoid_: Global tenant-only routing with no personal choice

**Correction approval outcome**:
The source approve/reject decision and its exact revision. Linked task resolution, ledger/provider execution, document creation and message delivery remain separate facts.
_Avoid_: approved means every downstream effect succeeded

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
A Phase 16 source-reconciliation warning for an unproved or conflicting recurring-provider mapping. Provider evidence alone neither creates a commitment nor authorizes collection.
_Avoid_: Broken subscription (provider-specific and too narrow)

**Correction reason**:
The source-required explanation for a consequential command, recorded under its exact action/risk policy.
_Avoid_: optional note used to bypass a mandatory reason

**Override**:
A separately authorized exceptional owner command within current scope and non-bypassable invariants. It cannot defeat money conservation, protected access or enabled separation of duties.
_Avoid_: force save, arbitrary admin lock bypass

**Mission Control design language**:
The shared admin UI look and interaction system built from repo design tokens, shadcn primitives, and existing sheet/card/action patterns.
_Avoid_: One-off contribution-detail styling, hardcoded colors

## Historical terminology record

The [original May 2026 glossary](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/CONTEXT.md)
preserves its flagged ambiguities, example dialogue and predecessor names.
The definitions above are the amended current language. The original request to
rename Twenty sync, Campaign-as-Fund and donation-row examples is not a current
implementation instruction.
