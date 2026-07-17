# ADR-CD-033: CRM inline contribution operations use shared contracts

> **Note (2026-07-06):** The CRM/Twenty post state and repost/retry actions
> referenced in this ADR target the now-retired Twenty pipeline and are dormant
> per
> [ADR-0001](../../../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)
> (2026-07-06); "CRM post" survives only as a label over the dormant
> staged-gift pipeline pending the Phase 8 re-groom.

**Status:** Accepted (grill session 2026-05-29)

## Context

Staff often work from CRM donor gift history and may need efficient row-level contribution actions. At the same time, the original product goal requires one gift, one financial truth, and the same backend contracts regardless of entry surface.

The trade-off is between speed in CRM and avoiding a second contribution-operations implementation.

## Decision

CRM donor gift history may expose inline contribution operations, including corrections, refunds, receipt replacement, approvals, and technical/provider actions, when those inline operations use the same shared contribution operation contracts as Contributions Hub and contribution detail.

In v1, CRM may expose every contribution operation that exists in contribution detail. The limiting factor is not a separate allowlist; it is whether the staff member has the required capability and whether the inline UI can show enough context to run the same contract safely.

Modern practice requirements:

- Inline CRM actions are alternate UI affordances, not separate business logic.
- CRM rows expose operations through one visible next-best action plus a capability/state-filtered More actions menu, grouped by correction, receipt, refund, CRM/Twenty, and provider/admin categories.
- Users may pin a preferred row action, but pinned actions are still governed by backend capabilities, row state, tenant policy, and blocked-action rules. If the pinned action is invalid, the row falls back to the computed next-best action with an explanation.
- Pinned row action preferences use a per-user server source of truth with local responsive cache, stable operation ids, and schema versioning for migration.
- Tenant admins may configure default row actions by role/team/surface. Visible row action fallback order is valid user-pinned action, valid tenant default action, then system-computed next-best action.
- Pinned/default row action settings live with CRM gift-history view settings alongside column visibility/order and reset behavior.
- CRM gift-history view settings provide granular reset controls for columns, pinned row action, filters/sort, and all view settings. Resets preview their impact and fall back to tenant defaults before system defaults.
- Every operation uses the same backend contract, validation, permissions, approval policy, receipt delivery choices, operation result, audit trail, idempotency, optimistic concurrency, and shared query refresh behavior.
- Inline UI must collect all required fields, reasons, and confirmations before submitting the shared contract.
- High-risk inline actions still create the same correction request and approval workflow when policy requires it.
- Technical or role-gated operations appear only for staff with the same capabilities that would see them in contribution detail.
- Risky operations can start from a row menu or button, but must expand into a compact dialog or drawer before submission.
- Contextual operation dialogs must show current effective values, proposed change/operation, downstream effects, blocked reasons when unavailable, required reason fields, approval/receipt requirements, confirmation, and operation result.
- Inline operation dialogs use a reusable operation shell for shared permission, blocked-state, current-value, downstream-effect, submit, result, audit-link, focus-return, and row-refresh behavior. Each action supplies action-specific fields, validation messages, risk copy, and confirmation copy.
- Operation results appear inside the same operation shell as a compact result panel. The result panel shows success/failure state, changed values, downstream effects, receipt/approval/task outcomes, audit link, and next actions.
- Inline operation completion must keep staff in CRM. "View full contribution detail" is an optional secondary action, not an automatic redirect.
- The affected CRM row is patched or refetched in place while preserving donor context, scroll position, row selection, and focus return.
- Result UX must use progressive disclosure, accessible success/failure semantics, reduced-motion-safe transitions, and stable layout with no unnecessary layout shift.
- On failure, preserve entered form state when safe and show clear recovery actions such as retry, fix required fields, open linked task, generate PDF, or view full detail.
- On mobile or narrow screens, the same operation shell becomes a responsive full-height or bottom sheet with keyboard-safe form layout, sticky actions where appropriate, at least 44px touch targets, reduced-motion-safe transitions, and preserved CRM context/focus return.
- Inline CRM operation UX must use shared `@asym/ui` primitives, existing shadcn/ui components, Base UI first for new behavior-heavy primitives, and the base-maia / Maia theme with Zinc tokens from `packages/ui/styles/globals.css`.
- Inline CRM operation UI must not introduce hardcoded colors, one-off radii, app-local shadcn copies, or a visual language that feels separate from Mission Control.
- If an operation is too complex for a compact contextual dialog or drawer, CRM opens contribution detail instead of implementing a partial shortcut.
- Surface context may affect placement, density, focus return, and row refresh behavior, but not saved behavior.

## Consequences

- CRM can stay efficient and broad in operation coverage without becoming a separate contribution operations system.
- Shared contracts and server enforcement carry the integrity guarantees.
- UI implementation must avoid duplicating validation or deriving different operation semantics per surface.
- The PRD should include product-level acceptance tests proving inline CRM operations use the same shared contracts, policies, result shapes, audit behavior, and CRM row refresh behavior as contribution detail.
- The PRD should define done for inline CRM operation UX, including Maia/Zinc design-system alignment, accessibility, focus continuity, responsive behavior, no layout shift, and polished in-place result handling.

## Alternatives rejected

- **Always open contribution detail:** Safest, but slower for staff who need high-frequency CRM-row actions.
- **Only high-frequency inline operations:** More incremental, but unnecessarily limits CRM when the shared contract already provides the safety boundary.
- **Surface-specific CRM operations:** Faster locally, but risks drift in validation, audit, permissions, and operation results.
