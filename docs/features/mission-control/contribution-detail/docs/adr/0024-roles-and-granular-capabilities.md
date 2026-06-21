# ADR-CD-024: Contribution detail uses roles backed by granular capabilities

**Status:** Accepted (grill session 2026-05-29)

## Context

Contribution detail supports viewing financial truth, corrections, approvals, receipts, CRM posting, refunds, Stripe operations, audit proof, approval-policy settings, and table preferences. Current branch code exposes a broad `finance:manage_contributions` permission, but the product model needs clearer control boundaries.

Product/UI language should remain understandable to staff. Backend enforcement needs to be precise enough that one permission does not accidentally authorize every financial, provider, and settings operation.

## Decision

Use simple user-facing roles backed by granular backend capabilities.

User-facing roles:

- Donor-care staff
- Finance staff
- Finance approver / admin
- Super admin
- Technical/admin-only operator

Backend capabilities gate individual actions such as viewing restricted proof, requesting corrections, applying corrections, approving corrections, overriding approval gates, managing receipts, retrying CRM post, running refund workflow, replaying Stripe webhooks, managing approval policy, managing table preferences, and managing CRM gift-history view defaults.

CRM gift-history tenant defaults can be managed by super admins or by staff granted a delegated settings capability such as `crm.gift_history.manage_view_defaults`. This capability covers tenant-level defaults for columns, row action defaults, filters/sort defaults, and reset behavior; it does not grant contribution operation permissions such as correction, refund, approval, receipt sending, or provider actions.

CRM gift-history view-default changes are capability-gated and audited, but do not require a separate approval workflow. High-risk contribution corrections still follow their own approval policies.

## Consequences

- The UI can explain access in staff-friendly language.
- APIs must enforce capabilities server-side for every action.
- Action availability metadata should include missing capability / role-safe reason when useful.
- Existing broad contribution permission should be split or adapted before implementation reaches production-grade behavior.
- Tenant-default setting changes must be audited with actor, timestamp, changed scope, old/new values, affected role/team/surface, and reason when provided.

## Alternatives rejected

- **Simple roles only:** Easy to understand but too coarse for provider and financial controls.
- **Granular permissions only:** Precise but hard to communicate in product UX.
- **Tenant-defined custom roles immediately:** Powerful but too much scope for the contribution detail PRD; can be supported later if the capability layer is clean.
