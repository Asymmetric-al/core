# Contribution Detail — grill session notes

> **Note (2026-07-06):** The CRM/Twenty post state and repost/retry actions
> referenced in this document target the now-retired Twenty pipeline and are
> dormant per
> [ADR-0001](../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)
> (2026-07-06); "CRM post" survives only as a label over the dormant
> staged-gift pipeline pending the Phase 8 re-groom.

> Working doc for a future PRD. Captures decisions, open questions, and codebase facts.
> Started: 2026-05-28

## User goal (north star)

Staff can open **one gift** from either the **CRM donor page** or the **Contributions Hub**, see the **same financial truth**, perform the **correct actions**, and have every update saved through the **same backend contracts** — no duplicate data, no crossed wires, no sync delay.

## Scope (in)

- Contribution detail UI + data contract
- Entry: CRM donor gift history
- Entry: Contributions Hub search/list
- Audit trail
- Receipt state + actions
- Refund / correction state
- Recurring gift link
- Stripe references
- CRM post state (Twenty)
- Donor / fund / missionary / designation context
- Save behavior (what is editable, by whom, through which API)

## Non-goals

- Full CRM redesign
- Donor portal / missionary portal redesign
- Full reporting system redesign

---

## Codebase baseline (2026-05-28)

### Entry points today

| Surface               | Route / component                                              | Opens detail?                                                | Data source                                       |
| --------------------- | -------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------- |
| **Contributions Hub** | `apps/admin/app/(app)/contributions/page-client.tsx`           | Yes — `ContributionDetailSheet` side sheet on row click      | `useAdminContributions` → `ContributionGridRow[]` |
| **CRM donor drawer**  | `apps/admin/app/(app)/crm/page-client.tsx` → gift history list | **No** — inline row only; optional **Resend receipt** button | `getAdminCrmDonorDetail` → `CrmGiftHistoryRow[]`  |

Product tile name: **Contributions Hub** (`packages/config/tiles.ts`).

### Canonical payment truth (already documented in API)

`CrmDonorDetailResponse.reconciliation`:

- `platformPaymentTruth: true`
- `twentyIsPaymentTruth: false`

Twenty / CRM post status is **downstream workflow**, not payment ledger.

### Identity keys in play

| Key                                             | Used for                                    |
| ----------------------------------------------- | ------------------------------------------- |
| `donation.id`                                   | Grid row `id`, CRM gift `id` / `donationId` |
| `staged_gift.id`                                | Workflow actions (approve, retry, receipt)  |
| `stripe_payment_intent_id` / `stripe_charge_id` | Shown as `transactionId` on grid row        |
| `twenty_record_id`                              | CRM link only (gift history)                |

### Hub detail sheet (`contribution-detail-sheet.tsx`)

- Side sheet only (no dedicated route / deep link today)
- Shows: donor, amount, date, payment method, source, fund, transaction ID, receipt sent/pending, staged gift review status, Twenty CRM post label, missionary, notes, review reason
- Actions wired: copy txn ID, send receipt, approve/post, retry posting (via `POST /api/admin/contributions/staged-gifts/:id/{approve|retry|receipt}`)
- Actions **stubbed** (no handler): Email Donor, Retry Payment
- **Missing vs stated scope**: audit trail, recurring link, designation, gross/net/fee, refund detail, Stripe dashboard links, editable fields / save

### CRM gift history row shape (`CrmGiftHistoryRow`)

Thinner than `ContributionGridRow`: amount, fund/missionary names, receipt and CRM post status, IDs, and shared inline action availability. Resend uses the shared contribution operation contract.

### Staged gift audit

Backend writes to `staged_gift_audit_events` (`packages/api/src/admin/contributions/staged-gifts.ts`) but **not surfaced in UI**.

### Branch-specific implementation gaps (cursor/contribution-operations-core-1afa)

- `packages/api/src/admin/contribution-operations/detail-read-model.ts` currently returns a **single** `designation` object (`fundId`, `missionaryId`, `projectId`) instead of first-class multiple designation lines.
- `packages/api/src/admin/contribution-operations/operations.ts` currently applies `designation_correction`, `fund_correction`, and `allocation_correction` by patching `donations.fund_id` / `donations.missionary_id`, which conflicts with the accepted adjustment-record model (D5) and first-class multi-designation direction (D9).
- `supabase/migrations/20260512190000_phase_03_giving_pipeline.sql` already has `staged_gift_allocations` with `fund_id`, `missionary_id`, `amount`, and `memo`, but the detail model does not yet expose those allocation rows as financial truth.
- Admin tables already enable column visibility in `DataTableResponsive` (`apps/admin/app/(app)/crm/page-client.tsx`, `apps/admin/app/(app)/contributions/main-body.tsx`, support table), but current usage is initial-state driven. CRM gift history needs persisted per-user column preferences, not only local table state.
- `packages/api/src/admin/contribution-operations/types.ts` currently exposes a broad `finance:manage_contributions` permission. The target product model needs user-facing roles backed by granular server-side capabilities (D26).

---

## Decision log

### D1 — Canonical gift identity (2026-05-28)

**Decision:** Staff open a gift by **`donation.id`**.

- Staged gift, CRM link, and Stripe refs are **joined context**, not the primary key.
- Workflow actions (approve, retry post, send/resend receipt) still require `staged_gift.id` when applicable.
- Gifts **without** a staged gift remain openable in detail as **read-only financial truth**; workflow actions disabled with explicit reason (not hidden silently).

**Rationale:** Matches both list UIs today, aligns with `platformPaymentTruth`, keeps deep links stable.

### D2 — Shared route-aware detail overlay (2026-05-28)

**Decision:** Use a **single global, route-aware contribution detail overlay** opened from both the Contributions Hub and CRM donor gift history.

- Hub row click and CRM gift-history row click open the same detail experience for `donation.id`.
- The open gift is represented in URL state so refresh/share/deep links work.
- The detail component and fetch contract are shared; entry surfaces do not own separate detail implementations.
- CRM should preserve donor context behind the overlay unless the final interaction design proves it creates layering or focus-management problems.
- UI must stay consistent with Mission Control design language: shared shadcn primitives, design tokens (`bg-background`, `bg-card`, `border-border`, `text-muted-foreground`, `ring-ring`, etc.), existing sheet/card/action patterns, keyboard/focus behavior, and responsive sheet behavior.
- Avoid hardcoded colors, one-off visual systems, and UI treatment that makes contribution detail feel like a separate product.

**Rationale:** Staff need the same detail regardless of entry point, but should not lose list or donor context while triaging. A global overlay gives one source of UI truth plus deep-link behavior.

### D3 — Hybrid contribution detail URL contract (2026-05-28)

**Decision:** Use a **hybrid URL model**.

- Entry surfaces preserve staff context with current-route query state:
  - CRM donor context: `/crm?donor={donorId}&gift={donationId}`
  - Contributions Hub context: `/contributions?gift={donationId}`
- Durable copy/share/bookmark links use canonical contribution detail:
  - `/contributions/{donationId}`
- Direct visits to the canonical route load the same detail contract and same contribution detail UI, without requiring CRM context.

**Rationale:** Staff can triage without losing their workspace, while shared links have one stable destination. This avoids making CRM the durable home of a gift and avoids coupling gift links to whatever filter state happened to be open.

### D4 — Full correction form, implemented as controlled correction workflow (2026-05-28)

**Decision:** Contribution detail should support a **full correction form** for authorized staff, using modern financial-system guardrails.

Editable from detail, subject to permissions and state rules:

- Fund / missionary / designation context
- Tax-deductible amount
- Receipt state and receipt suppression reason
- CRM post state / retry controls
- Internal finance notes and donor-facing memo

Not treated as casual inline overwrites:

- Gross amount, fee, net amount, payment status, Stripe payment intent / charge IDs, refund IDs, and platform donation id

Modern practice requirements:

- Corrections are explicit saved operations, not silent row mutation.
- Every correction writes an immutable audit event with before/after values, actor, timestamp, reason, and source surface.
- Saves use a single backend contract keyed by `donation.id`.
- Saves require optimistic concurrency (`updatedAt` / version) to prevent staff overwriting each other.
- Saves are idempotent and safe to retry.
- Permissions distinguish view, correction, receipt, refund, CRM-post, and admin override abilities.
- Externally meaningful effects are explicit: a correction may require re-receipt, CRM repost, reconciliation review, or refund review instead of pretending all downstream systems update magically.

**Rationale:** Staff need real correction power, but financial truth must remain traceable and reversible. The detail view can be the place to initiate corrections without becoming an unaudited ledger editor.

### D5 — Corrections and refunds use adjustment records; high-risk changes become review requests (2026-05-28)

**Decision:** Persist corrections/refunds as **separate adjustment records** linked to `donation.id`, with **review/approval requests** for high-risk changes.

- Original donation rows remain intact.
- Current effective values are derived from the original donation plus applied adjustment records.
- Contribution detail shows original and current effective values where the difference matters.
- Routine staff-safe corrections can apply immediately when permitted.
- High-risk changes create a correction request that must be approved before becoming effective.
- Every adjustment/request appears in the audit trail and links back to the actor, reason, source surface, and affected downstream systems.

**Rationale:** This preserves ledger history, supports modern auditability, and avoids pretending a correction is an in-place rewrite. Review requests keep risky downstream changes from bypassing finance controls.

### D6 — Approval required for external effects, unless super-admin policy suppresses it (2026-05-28)

**Decision:** A correction requires approval when it has already-visible external effects, unless a tenant super admin has explicitly configured Mission Control to suppress that approval requirement.

Approval required by default when a correction touches a gift that is already:

- Receipted
- CRM-posted / Twenty-synced
- Reconciled
- Refunded or partially refunded
- Involved in a Stripe action
- Included in an annual statement or downstream finance export

Modern practice requirements for approval suppression:

- Suppression is a **tenant-level settings policy**, not an ad hoc per-form checkbox.
- Only super admins can change the policy.
- The policy must be explicit about which external-effect gates it suppresses; avoid one vague "disable approvals" switch if possible.
- Every policy change is audited with actor, timestamp, old/new policy, and reason.
- Contribution detail still warns staff when they are editing externally visible values.
- Suppressed approval does **not** suppress audit, correction reason, downstream effect tracking, idempotency, optimistic concurrency, or permission checks.
- For legally or processor-constrained operations (for example real Stripe refund execution), approval suppression cannot bypass provider/processor requirements.

**Rationale:** Defaulting to approval protects financial and donor-facing records, while tenant-level super-admin policy gives organizations flexibility when their operating model allows trusted finance staff to act directly.

### D7 — Layered contribution audit trail (2026-05-28)

**Decision:** Contribution detail uses a **layered audit trail**.

- Default staff view shows human-readable events: corrections, approvals, receipt actions, CRM post retries, refunds, notes, and downstream warnings.
- Finance/admin users can expand audit rows for technical proof: actor/system identity, request id, Stripe event id, idempotency key, before/after payloads, job ids, provider refs, and raw error details where safe.
- Audit entries are append-only.
- Audit entries are filterable by category: financial adjustment, receipt, CRM post, Stripe/provider, system job, note, approval, settings policy.
- Technical errors are translated into staff language first, then expanded into raw details for roles that can see them.
- Restricted details must respect role and tenant boundaries; no provider secrets, credentials, or unsafe raw payloads in the staff-facing audit trail.

**Rationale:** Staff need a clear story of what happened, while finance/admin need evidence for reconciliation and debugging. A layered model avoids overwhelming normal staff with system internals without hiding proof from authorized operators.

### D8 — Recurring gift links separate business object from provider evidence (2026-05-28)

**Decision:** Contribution detail shows **both** the internal recurring agreement and Stripe references, separated by meaning.

- Primary link: internal recurring agreement / recurring gift detail.
- Secondary links: Stripe payment intent, charge, subscription, setup intent, or payment method references where available.
- If Stripe/provider data indicates recurrence but no internal agreement is linked, contribution detail shows a reconciliation warning: provider recurrence detected, no internal recurring agreement linked.
- The recurring agreement should explain donor, cadence, amount, designation, status, next expected gift, and gift history.
- Stripe references are technical/provider evidence, not the business object staff use as the primary concept.

**Rationale:** Mission Control needs a tenant-owned business object for recurring giving. Stripe references prove provider state but should not become the canonical recurring-gift experience.

### D9 — Multiple designations are first-class and equal (2026-05-28)

**Decision:** A gift may have multiple designations, and every designation on the gift is treated as an equal first-class allocation line.

- Do not model one designation as "primary" in contribution detail.
- Do not hide split designations behind audit, technical detail, or a secondary-only view.
- Contribution detail must present all designation lines with equal visual and semantic weight.
- Each designation line must include enough financial context to reconcile: amount, currency, fund, missionary/context, memo/restriction where present, and any campaign/project/designation context once defined.
- The sum of designation lines must reconcile to the effective gift amount.
- Designation corrections operate on the designation/allocation set, not on a single top-level `fundId`/`missionaryId`.

**Rationale:** Split giving is financial truth, not an edge case. A "primary + more" model would make some donor intent look secondary and creates risk in receipts, CRM/Twenty posting, reporting, and corrections.

### D10 — Designation domain language: fund is destination; restriction and memo are separate (2026-05-28)

**Decision:** Use **fund** as the canonical term for the donor's intended giving destination. A designation line allocates gift amount to a fund.

Fund subtypes / fund meanings:

- **Missionary fund:** ongoing ministry support for a missionary or missionary family; usually no fixed fundraising end date or total goal.
- **Project fund:** specific ministry project or purpose; may be ongoing/long term and may or may not have a fundraising goal.
- **Campaign:** shorter-lived fund with a specific purpose, fundraising goal, and defined season/timeframe; should support progress tracking.

Clarifications:

- A campaign is a fund in donor-facing giving, but it has stronger goal/time/progress semantics.
- A missionary may have an ongoing missionary fund and also a separate campaign for a vehicle, medical need, training event, relocation expense, etc.
- A **restriction** is not the same as a normal donor designation. Use restriction only for legal/accounting limitations.
- A **memo** is donor-provided note text, often from a paper check. It may help staff identify the intended fund, but it is not itself the fund.

**Simple rule:** Use **fund** for the donor's intended giving destination. Use **campaign** for a short-term goal-based fundraising effort. Use **restriction** only for legal/accounting limitations. Use **memo** only as donor-provided reference text.

### D11 — Every designation line requires exactly one fund (2026-05-28)

**Decision:** Every gift designation line must always be tied to exactly one fund.

- If the donor does not provide a specific designation, the gift should typically default to **General Fund**.
- "Unassigned" is not a valid final contribution detail state.
- Paper-check memo text or other donor wording can help staff determine the correct fund, but the saved designation line must still point to a fund.
- Each designation line remains editable later when needed, but later edits are audited designation corrections under D4/D5/D6.
- Multiple designation lines are still equal; the invariant is one fund per line, not one fund per gift.
- External effects such as receipts, CRM posts, reconciliation, and statements should consume fund-backed designation lines only.

**Rationale:** General Fund gives a valid default for unspecified donor intent, while one-fund-per-line keeps receipts, CRM/Twenty posting, reporting, and corrections deterministic. Later edits remain possible without allowing fundless financial truth.

### D12 — Designation lines are compact by default and expandable for fund context (2026-05-28)

**Decision:** Contribution detail presents each designation line as an equal compact row by default, with expandable details for fund subtype context, memo, restriction, and line-level correction/audit state.

Default row for every designation line:

- Amount and currency
- Fund name
- Fund type (General Fund, Missionary Fund, Project Fund, Campaign)
- Fund ID/reference

Expanded details for the same line:

- Missionary/family context when the fund is a missionary fund
- Project purpose/context when the fund is a project fund
- Campaign goal, season/dates, and progress context when the fund is a campaign
- Donor memo evidence used to identify the fund, especially for checks
- Legal/accounting restriction if present
- Line-level correction state and audit references

**Rationale:** All designations remain equal in the default view, while staff can inspect the fund-specific evidence they need without turning every gift detail into a wall of metadata.

### D13 — CRM post is parent gift plus child designation records (2026-05-28)

**Decision:** CRM posting for multi-designation gifts should use a **parent gift record** plus **child designation/allocation records**.

- One CRM parent record represents the gift/donation identity.
- Each designation line posts as a child record under the parent gift.
- Contribution detail shows CRM post state at both levels:
  - parent gift post status
  - per-designation child post status
- A CRM post failure can be parent-level or designation-line-specific.
- Staff should be able to see which designation line failed and retry the correct scope.
- If the connected CRM cannot support child designation records, that is a provider/adapter limitation that must be surfaced rather than silently collapsing data.

**Rationale:** The product has one gift identity and multiple equal designation lines. Parent + child CRM records preserves both without making each designation look like a separate donor gift.

### D14 — Receipts are gift-level and designation-line-aware (2026-05-28)

**Decision:** A gift produces one receipt object/status, and the receipt content is aware of every designation line.

- Receipt state is gift-level: pending, sent, failed, suppressed, or policy-specific equivalent.
- Receipt content lists every designation line equally.
- Audit records which designation lines and effective values were included in a sent receipt.
- If a designation correction happens after receipt, contribution detail flags the receipt as affected.
- Post-receipt corrections require the correct next step based on policy: reissue, suppression, review, or no action with reason.
- Do not create separate receipts per designation line unless a future legal/accounting requirement explicitly demands it.

**Rationale:** Donors make one gift and should generally receive one receipt. Multi-designation truth still matters, so the receipt must preserve and audit the designation set it represented.

### D15 — Stripe references are role-gated technical proof with safe operations (2026-05-28)

**Decision:** Contribution detail shows Stripe information in a role-based way: staff see payment summary; finance/admin can expand Stripe references, technical proof, and safe operational actions.

Default staff view:

- Payment status
- Payment method summary
- Amount and refund summary
- Clear labels for processor-backed evidence without exposing a wall of raw IDs

Finance/admin expanded view:

- Payment intent ID
- Charge ID
- Refund IDs
- Raw Stripe event IDs
- Copy/open dashboard links
- Safe actions: refund workflow, replay webhook, sync status

Not allowed as casual detail actions:

- Updating Stripe metadata from contribution detail
- Exposing raw provider payloads to normal staff
- Provider actions that bypass approval policy, permissions, idempotency, audit, or processor constraints

**Rationale:** Stripe data is important technical proof and may support operational recovery, but Mission Control’s donation/detail model remains the staff-facing financial truth. Provider actions must be safe, role-gated, audited, and policy-aware.

### D16 — Save responses return updated detail plus operation effects, hidden behind simple UX (2026-05-28)

**Decision:** Save/action APIs return a rich operation result: updated canonical contribution detail plus audit, correction, downstream effect, warning, task, approval, and provider outcome metadata.

Backend response should include:

- Updated canonical contribution detail
- Audit event id
- Adjustment / correction / correction request id
- Applied vs pending-approval status
- Downstream effects: receipt affected, CRM repost needed, reconciliation review needed, recurring agreement affected
- Provider outcome when applicable
- Task ids created
- Safe user-facing warnings/errors

UI/UX requirement:

- Keep the page simple, easy to understand, and easy to use.
- Show the core result in plain staff language first.
- Keep technical metadata mostly hidden behind expandable sections, audit rows, or role-gated technical drawers.
- Avoid visual noise from ids, job metadata, provider payloads, or system effects unless staff intentionally expands details.
- Use concise inline warnings/chips for important effects, with expandable "why / technical details" behind them.

**Rationale:** Rich responses prevent sync delay and crossed wires, while progressive disclosure keeps contribution detail from becoming a noisy operations console.

### D17 — Default detail view starts with financial summary (2026-05-28)

**Decision:** When contribution detail opens, the default visible view starts with the gift's financial summary and immediate workflow state.

Visible by default:

- Amount and payment status
- Donor identity/context
- Gift date, source, and payment method
- Equal designation rows
- Receipt, CRM post, refund, recurring, and correction/approval status chips
- Only the correct primary actions for the gift's current state and user role

Collapsed or expandable by default:

- Stripe technical proof
- Full audit trail
- Correction history
- Downstream operation effects
- Raw ids, provider event ids, job metadata, and idempotency keys

**Rationale:** Staff should immediately understand what the gift is, where it is going, and what needs attention. Technical proof stays available without turning the default view into an operations console.

### D18 — Actions use next-best-action visibility with risk-based progressive disclosure (2026-05-28)

**Decision:** Contribution detail uses a hybrid action model: show only the next best state-based actions by default; place secondary, high-risk, admin, and technical actions under More actions or role-gated expandable sections.

Default visible actions:

- Only the next one or two actions that are valid for the gift's current state and user role
- Examples: send/reissue receipt when receipt needs attention, approve pending correction, retry failed CRM post, resolve designation issue when it blocks external effects

Secondary / More actions:

- Edit/correct gift
- Refund workflow
- Replay Stripe webhook
- Sync status
- Copy/open technical references
- Admin override

Modern practice requirements:

- Never show actions that are unavailable for the user's role or current gift state as ordinary clickable actions.
- Disabled actions must explain why when visible.
- High-risk actions require confirmation, reason, audit, idempotency, and policy enforcement.
- Technical/provider actions stay role-gated and separated from staff-facing financial actions.
- The UI should guide staff to the safest next step, not present every possible operation at once.

**Rationale:** Staff need power without clutter. A next-best-action model keeps the default view simple while risk-based disclosure preserves advanced finance/admin workflows.

### D19 — Blocked actions use mixed visibility with clear reasons (2026-05-28)

**Decision:** Hide irrelevant or unauthorized actions, but show meaningful blocked actions disabled with a tooltip/reason and next step.

Rules:

- Hide actions that do not apply to the user's role or the gift's current context.
- Show blocked actions when their absence would confuse staff or when the blocker explains a workflow issue.
- Disabled actions must explain why they are blocked and, when possible, what staff should do next.
- Reasons should be staff-readable first, with technical details expandable or role-gated.
- The backend action-availability contract should return `available`, `blockedReason`, `nextStep`, and `riskLevel` so the UI does not invent policy locally.

Examples:

- Hide Stripe replay from normal staff.
- Show disabled **Send receipt** when blocked by unresolved fund/designation context, with "Resolve designation first."
- Show disabled **Retry CRM post** when a child designation record failed but the parent gift posted, with line-specific failure context.
- Show **Refund unavailable** only in finance/admin More actions, with reason such as "No Stripe charge ID."

**Rationale:** This preserves the clean default UI while helping staff understand meaningful workflow blockers instead of hunting for missing actions.

### D20 — Contribution Hub search uses simple default search plus advanced filters (2026-05-28)

**Decision:** Contribution Hub discovery uses a two-tier search model.

Simple default search:

- Donor name / email
- Amount
- Date
- Fund / designation name
- Stripe or payment reference

Advanced filters:

- Receipt status
- CRM post status
- Refund status
- Pending approval
- Correction state
- Recurring agreement
- Fund type (General Fund, Missionary Fund, Project Fund, Campaign)
- Campaign / project / missionary fund
- Memo / check text
- Audit event / action id

Selecting a result opens the same contribution detail overlay by `donation.id`, using the Hub context URL (`/contributions?gift={donationId}`).

**Rationale:** Staff need a simple search bar for everyday lookup, but finance operations need precise filters for receipt, CRM, refund, correction, recurring, fund, and audit workflows.

### D21 — CRM donor gift history uses compact issue-aware rows with per-user customizable columns (2026-05-28)

**Decision:** CRM donor gift history should use a compact row with issue indicators by default, and allow each admin user to add/remove visible columns based on their needs. Column choices are saved automatically per user and restored when the admin returns.

Default row should show:

- Amount
- Date
- Designation summary
- Meaningful status chips / issue indicators
- Row click opens contribution detail in CRM context (`/crm?donor={donorId}&gift={donationId}`)

Actions mostly live inside contribution detail, not inline, except for carefully chosen low-risk actions if policy later confirms them.

Column customization requirements:

- Use shared table patterns/design tokens and avoid a bespoke table system.
- Each admin can toggle columns from a column menu.
- Preferences are saved automatically per user.
- Preferences persist across sessions/devices where the user is signed in.
- The system keeps sensible defaults and supports reset-to-default.
- New columns introduced later should not break existing preferences.
- Required identity/action columns should be protected from accidental removal when needed for usability/accessibility.

Recommended column options:

- Amount
- Gift date
- Designation summary
- All designation count
- Fund names
- Fund type
- Receipt status
- CRM post status
- Refund status
- Recurring status
- Payment status
- Payment method
- Source / entry method
- Memo present
- Restriction present
- Pending correction / approval
- Issue / next-best action
- Last updated
- Stripe reference present
- Canonical gift id

**Rationale:** The CRM page should not become a second Contribution Hub, but donor-care and admin users need enough table flexibility to work their role-specific queues without losing the simple default experience.

### D22 — Table preferences use server source of truth with local responsive cache (2026-05-28)

**Decision:** Persist per-user table preferences with a hybrid model: server-side user preference is authoritative; local client state/cache makes the table feel instant and resilient.

Target stack and implementation fit:

- **TanStack Table:** Owns visible table behavior through controlled `columnVisibility` for the preference-backed slice. Do not pass `columnVisibility` to both `initialState` and controlled `state`; controlled state wins.
- **TanStack Query:** Fetches and mutates the user's table preference record; mutation success updates cached preference/detail data and invalidates relevant query keys when needed.
- **TanStack DB:** Preferred for a typed `admin_user_table_preferences` / route-backed preference collection when this becomes shared across admin tables. Use Zod schema, stable `getKey` (`userId:tableId`), optimistic updates, and server-backed sync.
- **TanStack Store:** Appropriate for transient preference-editor UI state (column chooser open state, draft toggles, saving indicators, dirty state), not as the source of truth for persisted preferences.
- **TanStack Virtual:** Remains a rendering optimization only; use stable row ids and keep virtualization independent from preference persistence.
- **Next.js:** Server/API layer enforces tenant/user ownership. Client components consume Query/DB state inside the existing admin `QueryProvider` pattern.

Preference behavior:

- Scope preferences by signed-in user and table id, e.g. `crm.giftHistory.columns`.
- Persist at least `columnVisibility`; leave room for `columnOrder`, pinned columns, density, and sort/filter saved views later.
- Use a schema/version field so newly added, removed, or renamed columns can migrate safely.
- Autosave with debounce and cancellation/race protection.
- Optimistically update the table immediately, then reconcile from server result.
- Use local browser cache only as a fast fallback/hydration cache, never as the authority.
- Provide reset-to-default.
- Protect required identity/action columns with `enableHiding: false` / equivalent table metadata.

Research notes:

- TanStack Table v8 exposes dedicated `columnVisibility` state and APIs; docs warn not to provide the same state in both `initialState` and controlled `state`.
- TanStack Table guidance: control only state slices another system needs; leave noisy internal state inside the table.
- TanStack Query docs emphasize mutation success with `setQueryData` / invalidation for related queries.
- TanStack DB docs support Zod-backed collection schemas and optimistic mutations; schemas validate data before it enters a collection.
- TanStack Virtual docs and repo guides emphasize stable item keys, realistic estimate sizes, moderate overscan, and decoupling virtualization from data freshness.

**Rationale:** This gives admins durable preferences across sessions/devices while preserving a fast, modern table UX. It also fits the repo's existing shared table, Query provider, TanStack DB, and virtualization boundaries.

### D23 — Contribution detail uses soft live sync with stale-save protection (2026-05-29)

**Decision:** Open contribution detail stays fresh through soft live sync.

- TanStack Query / TanStack DB keeps the open detail fresh through background refetch or collection sync.
- If the staff member has no unsaved edits, safe background changes can update the visible detail quietly.
- The UI should show a low-noise freshness indicator such as "Updated just now" rather than stealing focus.
- If the staff member has unsaved edits and the gift changes elsewhere, show "This gift changed elsewhere" with compare, reload, or discard options.
- Before any save/action, the backend checks version / `updatedAt` / revision and rejects stale writes with a clear recovery path.
- Audit trail updates can appear in the background without forcing the main detail panel to jump.

**Rationale:** Staff should not work from stale financial truth, but hard real-time updates can be disruptive during corrections. Soft sync plus optimistic concurrency gives current data without trampling in-progress work.

### D24 — Closing detail preserves context and updates only affected data (2026-05-29)

**Decision:** Closing contribution detail uses smart close behavior.

- Remove only the gift selection from URL state (`gift={donationId}`), preserving other route/search/filter state.
- Keep the CRM donor drawer open when detail was opened from CRM.
- Preserve Contributions Hub filters, search, table preferences, scroll position, and row selection where possible.
- Patch affected row/summary data from the operation result when available.
- Refetch or invalidate only affected queries/collections when needed.
- Return focus to the row/button that opened contribution detail.
- Avoid full page or table reset unless the underlying data is stale, missing, or unsafe to patch.

Modern practice requirements:

- Use stable row ids so focus and row targeting survive sort/filter/virtualization.
- Use Query/DB cache updates for known affected records and targeted invalidation for broader summaries.
- Keep browser history intuitive: closing overlay should behave like dismissing detail, not navigating away from staff context.
- Maintain accessible focus restoration and keyboard close behavior.

**Rationale:** Staff should return to exactly the workflow they were in, with current affected data, without a jarring list reset or lost donor context.

### D25 — PRD success criteria combine journeys, contracts, invariants, and UX (2026-05-29)

**Decision:** The later PRD should use combined acceptance criteria:

- Staff user journeys
- Data/backend contracts
- Operational invariants
- UI/UX and accessibility requirements

Required PRD success-criteria categories:

- **Journey criteria:** staff can open one gift from CRM donor history or Contribution Hub, see the same financial truth, act, save, close, and return to the same context.
- **Contract criteria:** detail fetch, save/action response, adjustment records, audit events, CRM post records, receipt state, recurring refs, Stripe refs, and table preference contracts are explicit.
- **Operational criteria:** no duplicate data, no crossed wires, no stale saves, no hidden sync delay, role/policy enforcement server-side, provider-safe Stripe behavior, complete immutable audit.
- **UX criteria:** simple financial-summary-first layout, design-token consistency, low visual noise, progressive disclosure, blocked-action reasons, focus restoration, keyboard support, responsive behavior.

**Rationale:** Contribution detail crosses financial truth, CRM/Twenty post state, receipts, Stripe, corrections, recurring gifts, audit, and user-specific table preferences. A journey-only PRD would miss integrity constraints; a contract-only PRD would miss staff comprehension and usability.

### D26 — Permissions use simple roles backed by granular capabilities (2026-05-29)

**Decision:** Contribution detail uses user-facing roles for product clarity and granular backend capabilities for enforcement.

User-facing role language:

- Donor-care staff
- Finance staff
- Finance approver / admin
- Super admin
- Technical/admin-only operator

Granular backend capabilities should gate actions such as:

- View contribution detail
- View restricted audit / technical proof
- Request correction
- Apply correction
- Approve correction
- Override approval gate
- Send/reissue/suppress receipt
- Retry CRM post
- Run refund workflow
- Replay Stripe webhook / sync provider status
- Manage approval policy settings
- Manage personal table preferences
- Manage table defaults / shared presets (if introduced later)

Baseline mapping:

- **Donor-care staff:** view gifts, open detail, see staff-safe audit, request correction.
- **Finance staff:** correct designations, manage receipt state, retry CRM post, inspect finance audit.
- **Finance approver/admin:** approve high-risk correction requests and run policy-allowed overrides.
- **Super admin:** manage tenant settings such as approval suppression policy and future table defaults.
- **Technical/admin-only:** Stripe replay, raw technical proof, provider diagnostics.

**Rationale:** Product/UI language stays understandable, while the backend avoids a single over-broad permission that can do every financial, provider, and settings action.

### D27 — Correction approval ownership is tenant-configurable policy (2026-05-29)

**Decision:** Tenants configure who can approve high-risk correction requests through approval policy settings.

Supported policy modes should include:

- No approval required for specified external-effect gates when super-admin approval suppression allows it (D6)
- One approver required
- Separation-of-duties required (requester cannot approve their own correction)
- Stronger approval required for selected categories such as refunds, annual statement changes, large amount/tax-deductible corrections, or admin overrides

Modern practice requirements:

- Default policy should be conservative: separation of duties for high-risk corrections unless tenant settings explicitly relax it.
- Only super admins can change approval policy.
- Policy changes are audited with old/new values and reason.
- Approval policy is enforced server-side.
- The UI must explain why a correction is pending and who/what role can approve it.
- Approval suppression never bypasses audit, correction reasons, idempotency, concurrency checks, or provider constraints.

**Rationale:** Tenants have different finance controls, but approval ownership is too important to be implicit. A configurable policy gives flexibility while keeping guardrails, audit, and server enforcement intact.

### D28 — Correction approval notifications use tasks plus configurable channels (2026-05-29)

**Decision:** When a high-risk correction request is created, notify eligible approvers through a **hybrid model** with tenant and user configurability.

Default delivery (tenant can change defaults; users can refine personal preferences):

- **Approval task:** Create one durable Mission Control task linked to the gift and correction request. This is the primary work item.
- **In-app notification:** Notify eligible approvers inside Mission Control.
- **Email notification:** Optional channel for approvers who opt in or when tenant defaults enable it.

Configuration model:

- **Tenant defaults (super admin):** Enable/disable channels by default and whether correction approvals must create a task.
- **Per-user preferences:** Each staff member configures how they want to be notified for correction approvals and whether a task should be created for them.
- **Policy still wins:** Notification routing respects approval ownership policy (D27) and granular capabilities (D26). Preferences cannot grant approval rights or bypass separation of duties.

Modern practice requirements:

- One correction request maps to at most one approval task; notification delivery is idempotent/deduplicated.
- Deep links open contribution detail with the pending correction request in context.
- Every task creation and notification dispatch writes an audit event (channel, targets, correction request id).
- Conservative default: task + in-app on; email off unless tenant default or user opt-in enables it.
- When tenant policy requires tasks, email/in-app preferences must not be the only durable record of the approval work item.
- Reuse existing Mission Control patterns (Tasks module, in-app alerts, email delivery) via hook contracts; do not require the full automation builder in this phase.

Codebase alignment:

- Support Hub already models per-agent notification preferences (`supportNotificationPreferencesSchema` in `packages/database/collections/support-hub.ts`).
- OpenSpec contribution-operations design explicitly allows hook contracts for notifications and tasks without implementing the full shared task product in phase 1.

**Rationale:** Finance approvals need a durable queue item plus timely alerts. Configurable channels match real tenant workflows while keeping task traceability and server-side policy enforcement.

### D29 — Correction approval outcomes close the loop simply (2026-05-29)

**Decision:** When a correction request is approved or rejected, use a simple hybrid outcome workflow.

Outcome behavior:

- **Approval task lifecycle:** Approving or rejecting the request automatically closes the linked approval task.
- **Requester notification:** Notify the original requester through their configured channels. In-app is the default; email follows preference/tenant defaults.
- **Approved request:** Apply the correction through the same contribution operations contract, refresh contribution detail, and show downstream effects in the operation result.
- **Rejected request:** Require a rejection reason. Optionally create one follow-up task for the requester to revise or abandon the request.

Modern practice requirements:

- Keep outcome handling idempotent; repeated approve/reject submissions must not duplicate tasks, notifications, or adjustment records.
- Audit the decision with actor, timestamp, approve/reject outcome, reason when present, linked correction request id, task transition, and notification delivery attempts.
- Deep links from outcome notifications and follow-up tasks open contribution detail with the correction request outcome in context.
- Do not create a new requester task on approval unless a downstream effect separately needs work.
- Keep this as contribution-operations workflow behavior, not a full generic automation product.

**Rationale:** Approvers need durable task closure; requesters need explicit feedback. Rejections need an actionable next step, but approved corrections should stay low-noise and complete quickly.

### D30 — Pending correction approvals use simple reminders and optional escalation (2026-05-29)

**Decision:** If a correction request sits pending too long, use a simple tenant-configurable SLA policy with reminders and optional escalation.

Workflow:

- **Reminder:** After a configured pending interval, remind eligible approvers through their configured channels.
- **Escalation:** After a longer configured interval, optionally escalate to the configured finance approver/admin role.
- **Visible state:** Contribution detail and Tasks show that the correction request has been pending too long.
- **No auto-approval:** Time-based rules can remind or escalate, but they must never approve or apply a correction.

Modern practice requirements:

- Tenant defaults define reminder and escalation intervals; super admins can change them.
- Reminder/escalation delivery respects approval ownership policy (D27), notification preferences (D28), and granular capabilities (D26).
- Reminder delivery is idempotent and low-noise; repeated reminders should not spam users.
- Reminder and escalation events are audited with correction request id, target role/users, channel, and timestamp.
- Pending-too-long state is derived from request timestamps and policy, not manually maintained as a separate source of truth.
- Keep this as a simple contribution-approval workflow, not a general SLA engine.

**Rationale:** Stuck approvals create operational risk, but the product does not need a heavy SLA system. Reminders and optional escalation solve the common problem while preserving human approval controls.

### D31 — Updated receipt delivery is selected at correction time (2026-05-29)

**Decision:** When an authorized admin or finance staff member makes a correction that affects already-sent receipt content, contribution detail offers a simple **receipt delivery choice** at the time of the change.

Available choices:

- **Send updated receipt by email:** Available when the donor has an email address and has not opted out of email receipts.
- **Generate updated receipt PDF:** Available when email is unavailable, disallowed by donor preference, or chosen by the admin.
- **Do not send/generate now:** Allowed only with an explicit reason when policy permits deferring receipt follow-up.

Modern practice requirements:

- Never auto-send an updated receipt solely because a correction was saved.
- Show which receipt fields changed before staff choose email/PDF/defer.
- Respect donor email availability and donor email preference; if email is not allowed, guide staff to PDF generation instead.
- Record the selected delivery action in the audit trail with actor, timestamp, correction request/adjustment id, receipt snapshot id, and delivery channel.
- The operation result shows whether an updated receipt was emailed, generated as PDF, deferred with reason, or blocked.
- PDF generation creates a durable updated receipt snapshot even if the PDF is downloaded, printed, or delivered later.

**Rationale:** Staff should be able to finish receipt follow-up while making the correction, but donor communication must remain deliberate and preference-aware. PDF fallback keeps the workflow complete when email is unavailable or inappropriate.

### D32 — Receipt delivery is proposed by requester and confirmed by approver (2026-05-29)

**Decision:** If a receipt-affecting correction requires approval, use a simple proposal-and-confirmation model.

Workflow:

- **Requester proposes:** When submitting the correction request, the requester chooses the intended updated receipt delivery action: email, PDF, or defer with reason.
- **Approver confirms:** When approving the correction, the approver sees the proposed delivery action and can confirm or change it before the correction becomes effective.
- **Approval applies both:** Once approved, the correction and confirmed receipt delivery action are processed through the same contribution operations result.

Modern practice requirements:

- The proposal must show whether email is available based on donor email address and donor email preference.
- If email is unavailable or disallowed, guide both requester and approver toward PDF generation.
- Any approver change to the proposed delivery action is audited with before/after values and reason when required.
- Rejection does not send or generate the updated receipt; it records the proposed delivery action only as request context.
- The operation result distinguishes requested delivery action from confirmed delivery action.

**Rationale:** The requester often has donor-care context, but the approver remains the final gate for donor-facing receipt action. This keeps receipt handling inside the correction workflow without adding a separate approval process.

### D33 — Tenant policy controls updated receipt delivery defaults and guardrails (2026-05-29)

**Decision:** Super admins can configure simple tenant-level policy for updated receipt delivery choices.

Policy options:

- **Default delivery choice:** Default to email when allowed, PDF, or defer when policy permits.
- **Defer guardrail:** Decide whether staff may defer updated receipt delivery and whether a reason is required.
- **Required receipt action:** Decide whether receipt-affecting corrections must select email or PDF before completion.
- **Role guardrails:** Decide which roles can send updated receipt email and which roles can generate updated receipt PDF.
- **Donor email opt-out:** Decide whether donor email opt-out blocks email absolutely; default should be absolute block.

Modern practice requirements:

- Keep the correction UI simple: show the allowed choices, default the safest policy-backed option, and explain blocked choices inline.
- Enforce policy server-side; UI state is only guidance.
- Audit policy changes with actor, timestamp, old/new values, and reason.
- Audit delivery decisions with the effective policy version used at the time.
- Default conservatively: respect donor email opt-out, allow PDF fallback, and require a reason when deferring receipt follow-up.
- Do not introduce a full generic automation/rules builder for this phase.

**Rationale:** Tenants need control over donor-facing receipt behavior, but staff need a small, policy-filtered set of choices while making a correction.

### D34 — Mission Control CRM and Contributions render the same contribution data (2026-05-29)

**Decision:** Contributions Hub, contribution detail, and CRM donor gift history must display the same effective contribution data from the same underlying database. They are not separate systems and do not need an internal sync process.

Modern practice requirements:

- There is no internal Contributions-to-CRM copy job, queue, pending status, retry task, or escalation.
- CRM donor gift history must query the same effective contribution read model as Contribution Hub/detail for shared fields.
- Shared fields must use one backend contract or shared mapping so labels, amounts, designation summaries, receipt state, correction state, and CRM/Twenty post state do not drift between surfaces.
- After a correction succeeds, both Hub and CRM surfaces show updated values through normal refetch/cache invalidation from the shared database.
- If a surface shows stale data because of client cache, treat it as a UI freshness/cache issue, not a CRM data-transfer issue.
- Audit remains attached to the correction/adjustment itself, not to a fake internal sync operation.
- External downstream systems, if any, are separate concerns from internal Mission Control CRM display parity.

**Rationale:** The goal is simple consistency: the same database-backed gift data should display correctly in both places. Adding internal sync concepts between Contributions and CRM would create unnecessary complexity and confusion.

### D35 — Overlapping CRM and Contributions fields use one shared row contract (2026-05-29)

**Decision:** Any contribution field shown in both CRM donor gift history and Contributions Hub/detail must come from the same shared read model and field mapping.

Rules:

- CRM donor gift history may show fewer columns than Contributions Hub.
- Contributions Hub may show operational columns that CRM does not need.
- But any overlapping field must have the same value, label, formatting, status vocabulary, and effective-state rules.
- The shared contract covers amount/date, donor, designation summary, receipt status, receipt affected state, correction/approval state, refund state, CRM/Twenty post state, and any other field reused across surfaces.
- Do not reimplement shared field derivation separately in CRM and Hub components.
- If a field needs different presentation density, derive that presentation from the same shared value.

**Rationale:** Different surfaces can choose different columns, but staff should never see the same concept computed two ways. Shared field mapping keeps the CRM and Contributions views clear and consistent without adding extra workflow.

### D36 — Shared contribution queries refresh softly after corrections (2026-05-29)

**Decision:** When a correction or contribution action succeeds, Mission Control invalidates/refetches the shared contribution queries used by contribution detail, Contributions Hub, and CRM donor gift history. Open surfaces update quietly with a small freshness indicator when helpful.

Rules:

- Treat this as client freshness/cache behavior, not as an internal copy status or task.
- Reuse shared query keys / TanStack Query or TanStack DB collection invalidation for overlapping contribution data.
- Patch or refetch affected rows without hard-refreshing the whole CRM or Hub workspace.
- Preserve staff context, selection, scroll position, and focus when rows refresh.
- Use low-noise copy such as "Updated just now" only when it helps staff understand why a row changed.
- If a user has an unsaved correction draft open, protect draft state with the stale-save/conflict flow from D23.

**Rationale:** The database is shared, so the only short delay should be UI cache freshness. Quiet refetch keeps both surfaces consistent without disruptive page resets or fake sync workflow.

### D37 — Shared contribution states use shared filter definitions (2026-05-29)

**Decision:** CRM donor gift history and Contributions Hub use the same filter definitions wherever contribution state overlaps. Each surface can expose a different subset of filters.

Rules:

- Contributions Hub can expose the full operational/financial filter set.
- CRM donor gift history should expose only the filters useful in donor context.
- Shared filters must use the same backend definition and status vocabulary across surfaces.
- Shared filter examples include receipt affected, pending correction, approval state, refund state, CRM/Twenty post state, designation issue, recurring gift link, and payment status.
- Do not create CRM-specific meanings for shared contribution statuses.
- If CRM needs a compact issue filter, it should be composed from the same shared state definitions used by Hub.

**Rationale:** Same meaning matters more than same filter density. Hub can be more powerful, CRM can stay focused, and staff still get consistent results when filtering for the same contribution state.

### D38 — CRM inline operations are allowed only through shared contribution contracts (2026-05-29)

**Decision:** CRM donor gift history may offer inline contribution operations, including corrections, refunds, receipt replacement, and approvals, as long as they use the same backend contracts and rules as Contributions Hub/detail.

Rules:

- CRM and Hub may present different UI affordances for the same operation.
- Inline CRM actions are alternate entry points, not separate business logic.
- Every operation uses the same backend contract, validation, permissions, approval policy, receipt delivery choices, operation result, audit trail, idempotency, optimistic concurrency, and shared query refresh behavior.
- CRM inline UI must collect all required fields/reasons before submitting the same operation contract.
- High-risk inline actions still create the same correction request / approval workflow when policy requires it.
- If an operation is too complex for a compact inline UI, CRM should open contribution detail rather than implement a partial shortcut.
- Surface context can affect placement, density, navigation, focus return, and which surrounding row/table is refreshed, but not the saved behavior.

**Rationale:** Staff may need efficient CRM-row actions, but the original one-gift/one-contract goal still holds. Inline UI is acceptable only when it is a thin surface over the same contribution operation contracts.

### D39 — CRM inline operations include all contribution detail operations in v1 (2026-05-29)

**Decision:** In the first version, CRM donor gift history can expose every contribution operation that exists in contribution detail, not just a limited safe subset.

Rules:

- Operation availability is controlled by the same shared backend capabilities and state rules as contribution detail.
- CRM inline affordances may be compact menus, dialogs, or row actions, but they submit the same shared contribution operation contracts.
- High-risk operations still require the same correction request, approval policy, receipt delivery proposal/confirmation, reasons, audit, idempotency, and optimistic concurrency as they do in contribution detail.
- Technical or role-gated operations can appear only for staff with the same capabilities that would see them in contribution detail.
- CRM inline UX must not omit required review context. If the compact UI cannot show enough context for a particular operation, it must expand into a fuller inline dialog or open contribution detail while preserving the same operation contract.
- The operation result refreshes the shared contribution row data for both CRM and Hub.

**Rationale:** The user goal is that CRM and Contributions are two views of the same gift data, not separate workflows. Full inline operation parity keeps CRM efficient while shared contracts preserve correctness.

### D40 — Risky CRM inline actions expand into contextual dialogs (2026-05-29)

**Decision:** CRM inline actions can start from a row menu or button, but risky operations must expand into a compact dialog or drawer that shows enough context to safely submit the shared operation contract.

Required context for risky operations:

- Current effective values.
- Proposed change or selected operation.
- Downstream effects such as approval, receipt, CRM/Twenty post state, refund, or provider impact.
- Required capability and blocked reason if unavailable.
- Required reason field, approval state, receipt delivery choice, and confirmation when applicable.
- Operation result after submission, using the same progressive-disclosure pattern as contribution detail.

Rules:

- The row menu is only an entry affordance for risky operations, not the whole operation UI.
- Dialog/drawer copy and fields must match the shared operation contract.
- If the compact dialog/drawer cannot show enough context, open contribution detail instead of submitting from an under-contextualized UI.
- Keyboard/focus handling must return staff to the CRM row after completion or cancellation.

**Rationale:** Full inline operation parity should not mean blind row-menu mutations. A compact contextual layer keeps CRM efficient while preserving review quality and auditability.

### D41 — CRM inline operations use a reusable operation shell (2026-05-29)

**Decision:** CRM inline operation dialogs/drawers use one reusable operation shell with action-specific content.

The shared shell owns:

- Permission and blocked-action state.
- Current effective values.
- Downstream effects.
- Required reason and confirmation framing.
- Submit/loading/error state.
- Operation result with progressive disclosure.
- Audit link and technical proof entry point when available.
- Focus return and row refresh behavior.

Each action owns:

- Action-specific fields.
- Action-specific validation messages.
- Action-specific copy for risks, downstream effects, and confirmation.

Rules:

- Do not build fully separate modal systems per contribution operation.
- Do not embed the entire contribution detail UI inside every inline dialog.
- The shell must submit the same shared contribution operation contract used by contribution detail.
- The shell must support expansion or handoff to full contribution detail when an action needs more space or context.

**Rationale:** A reusable shell keeps permissions, result handling, audit context, and accessibility consistent, while action-specific content keeps each workflow clear.

### D42 — Inline CRM operation results keep staff in CRM (2026-05-29)

**Decision:** After an inline CRM operation succeeds or fails, show the operation result inside the same operation shell and keep the staff member in the CRM workflow.

Result behavior:

- Do not navigate staff away from CRM after inline operation completion.
- Show a compact result panel in the dialog/drawer with success/failure state, changed values, downstream effects, receipt/approval/task outcomes, and audit link.
- Provide "View full contribution detail" as an optional secondary action, not an automatic redirect.
- Refresh or patch the affected CRM row in place using shared query invalidation.
- Preserve donor drawer/page context, scroll position, row selection, and focus return.
- On failure, keep entered form state where safe and show clear recovery actions.

Modern UX/UI requirements:

- Use progressive disclosure: staff-readable result first; technical proof behind expandable details for authorized roles.
- Avoid layout shift in the result panel; reserve space for result state, changed values, and actions.
- Use purposeful, fast transitions only; support reduced motion.
- Support keyboard completion and cancellation, and return focus to the row action after close.
- Use accessible status semantics for success/failure messaging.
- Keep primary next actions obvious: close, retry/fix, view full detail, or open linked task/receipt/PDF when relevant.
- Use consistent result vocabulary with contribution detail operation results.

**Rationale:** Inline CRM operations should feel excellent because they let staff finish work where they started. The system can still expose full detail when needed, but completion should not bounce staff across pages.

### D43 — Inline operation shell becomes a responsive full-height sheet on narrow screens (2026-05-29)

**Decision:** CRM inline operations use the same operation shell on mobile/narrow screens, but the presentation becomes a responsive full-height or bottom sheet.

Modern UX/UI requirements:

- Keep the same shared operation contract, permissions, validation, result panel, and audit behavior across screen sizes.
- Use a full-height or bottom sheet on narrow screens instead of a cramped desktop dialog.
- Keep title, status, and primary actions visible and understandable.
- Use sticky footer actions for submit/cancel/close where appropriate.
- Use keyboard-safe form layout so inputs, reason fields, and confirmation controls remain visible when the software keyboard opens.
- Keep touch targets at least 44px.
- Preserve CRM context behind the sheet and return focus/selection to the originating row or action after close.
- Avoid layout shift, support reduced motion, and keep transitions fast/purposeful.
- Do not disable inline operations on mobile solely because the screen is narrow.

**Rationale:** Mobile and narrow screens need the same contribution operation capability, but with a presentation that respects touch, keyboard, space, and focus constraints. This keeps one workflow with responsive ergonomics.

### D44 — CRM rows expose next-best action plus More actions (2026-05-29)

**Decision:** CRM donor gift history rows expose inline contribution operations through one visible next-best action and a capability/state-filtered **More actions** menu.

Rules:

- Show one primary next-best action directly on the row when there is a clear safe action.
- Put the remaining available operations in **More actions**.
- Group menu items by category: correction, receipt, refund, CRM/Twenty, provider/admin.
- Filter and disable actions using the same backend capabilities, state rules, and blocked reasons as contribution detail.
- Do not show a dense row of many operation buttons.
- On narrow screens, keep the row compact and place operations behind the same next-best action / More actions affordances.
- Selecting a risky More actions item opens the reusable contextual operation shell before submission.

**Rationale:** CRM needs full operation coverage without visual overload. One next-best action keeps common work fast, while More actions keeps advanced operations discoverable and governed.

### D45 — Users can pin a preferred CRM row action with validity fallback (2026-05-29)

**Decision:** Mission Control computes the safest next-best action for each CRM gift-history row, and individual users may pin a preferred row action when that action is valid for the row.

Rules:

- The system-computed next-best action remains the default.
- A user may pin a preferred inline row action such as request correction, generate PDF, resend receipt, or refund workflow entry.
- Pinned actions are still filtered by backend capabilities, row state, tenant policy, and blocked-action rules.
- If a pinned action is invalid for a row, the row falls back to the computed next-best action and explains why the pinned action is unavailable.
- Pinning affects the visible row action only; it does not change the **More actions** menu, permissions, operation contracts, approval rules, or audit behavior.
- Store this as a per-user preference with the same server-authoritative + local responsive cache pattern as table preferences.

**Rationale:** Staff workflows differ, especially in CRM. A pinned action gives useful personalization while preserving the system's guardrails and keeping invalid actions from becoming shortcuts.

### D46 — Pinned CRM row action preferences use server source of truth plus local cache (2026-05-29)

**Decision:** A staff member's pinned CRM row action preference is stored as a per-user server preference with local responsive cache.

Rules:

- The server preference is authoritative and follows the user across browsers/devices.
- Local cache can render the preferred action immediately while the server preference loads or saves.
- The preference is scoped to the CRM gift-history surface or table id, not globally to every contribution list unless intentionally extended later.
- Store the pinned action by stable operation id, not display label.
- Include a preference schema version so renamed, removed, or split operations can migrate safely.
- If the saved pinned action no longer exists or is not valid for a gift, fall back to the computed next-best action and explain why.
- Preference writes should be optimistic but reconciled with the server result.

**Rationale:** This matches the table preference model: fast UI locally, durable user preference on the server, and safe migration when operations change.

### D47 — CRM row actions use tenant defaults plus user override (2026-05-29)

**Decision:** Tenant admins can configure a default CRM row action by role/team/surface, and individual users can override that default with their own pinned row action.

Fallback order:

1. User-pinned row action, when valid for the gift and staff member.
2. Tenant default row action, when valid for the gift and staff member.
3. System-computed next-best action.

Rules:

- Tenant defaults are scoped by role/team/surface where useful; avoid one global default if workflows differ.
- User overrides remain per-user preferences with server source of truth plus local responsive cache.
- Tenant defaults and user overrides never bypass backend capabilities, row state, tenant policy, blocked-action rules, operation contracts, approval rules, or audit.
- If the user-pinned action is invalid, explain the fallback to tenant default or system next-best action.
- If the tenant default is invalid, explain the fallback to the system next-best action.
- Store defaults and user overrides by stable operation id, not display label.
- Include schema versions for safe migration when operation ids change.

**Rationale:** Teams can start from sensible role-based defaults while individual staff can tailor repeated CRM work. The fallback chain keeps personalization useful without turning preferences into permission or state overrides.

### D48 — CRM row action preferences live with CRM gift-history view settings (2026-05-29)

**Decision:** Pinned/default CRM row action settings live with CRM gift-history view settings, alongside column visibility/order and other row display preferences.

Settings placement:

- **Tenant defaults:** Admin settings for CRM gift-history defaults, including default columns, default row action by role/team/surface, and reset-to-default behavior.
- **User overrides:** Personal CRM gift-history view settings, including column preferences and pinned row action preference.
- **Row menu shortcut:** A row/action menu may offer "pin this action" for convenience, but the durable setting remains part of CRM gift-history view settings.

Rules:

- Keep row action preferences discoverable in the same place staff configure the CRM gift-history table.
- Store column preferences and pinned row action preferences as separate schema fields under the same view settings surface.
- Reset actions should clearly distinguish "reset columns," "reset pinned action," and "reset all CRM gift-history view settings."
- Tenant defaults never bypass user capabilities, row state, tenant policy, or shared operation contracts.

**Rationale:** Staff experience row actions as part of how the CRM gift-history view works. Grouping columns and row actions together keeps setup, reset, and troubleshooting understandable.

### D49 — CRM gift-history view settings use granular reset controls (2026-05-29)

**Decision:** CRM gift-history view settings provide granular reset controls instead of one destructive reset-only path.

Reset controls:

- **Reset columns**
- **Reset pinned row action**
- **Reset filters/sort**
- **Reset all CRM gift-history view settings**

Rules:

- Each reset previews what will change before applying.
- Reset returns the affected setting scope to the tenant default when one exists.
- If no tenant default exists, reset falls back to the system default.
- Reset actions are scoped; resetting columns must not reset pinned row action unless staff choose reset all.
- Reset should be reversible where practical through undo or by preserving the previous draft until save.
- Reset writes use the same server source of truth plus local responsive cache pattern as other view preferences.
- Reset copy must clearly name the scope: columns, pinned action, filters/sort, or all view settings.

**Rationale:** CRM gift-history view settings now include several independent preferences. Granular reset avoids accidental data loss while still giving staff and admins a clean path back to defaults.

### D50 — CRM gift-history tenant defaults are managed by super admins or delegated capability holders (2026-05-29)

**Decision:** Super admins can always manage CRM gift-history tenant defaults. They may delegate that authority through a granular capability for donor-care or finance leads.

Capability model:

- Suggested capability: `crm.gift_history.manage_view_defaults`.
- Capability covers tenant-level defaults for CRM gift-history columns, row action defaults, filters/sort defaults, and reset-to-default behavior.
- Capability does not grant contribution operation permissions such as correction, refund, approval, receipt sending, or provider actions.

Modern practice requirements:

- All tenant default changes are audited with actor, timestamp, changed scope, old/new values, and reason when required.
- The UI should explain whether a default is system-provided, tenant-configured, or personally overridden.
- Delegated default managers can update view defaults only within their assigned tenant/team/surface scope.
- Tenant defaults still cannot bypass user capabilities, row state, tenant policy, shared operation contracts, or donor/finance controls.
- Super admins can revoke delegated settings capability.

**Rationale:** Tenant-wide view defaults affect many staff workflows, so they need controlled ownership. Delegating to trusted donor-care or finance leads avoids super-admin bottlenecks without weakening operation security.

### D51 — CRM gift-history tenant default changes require audit, not approval (2026-05-29)

**Decision:** CRM gift-history tenant default setting changes do not require a separate approval workflow. A super admin or delegated settings capability holder can apply changes directly, and every change is audited.

Rules:

- This applies to CRM gift-history view defaults such as columns, row action defaults, filters/sort defaults, and reset behavior.
- Required control is capability + audit, not approval.
- Audit records actor, timestamp, changed scope, old/new values, reason when provided, and affected role/team/surface.
- UI should show staff whether current settings are system defaults, tenant defaults, or personal overrides.
- This does not change high-risk contribution correction approval rules; contribution operations still follow the approval policies already documented.
- Delegated settings capability can be revoked by super admins.

**Rationale:** View defaults shape workflow ergonomics but do not directly change financial truth. Requiring approval for every default adjustment would slow routine admin work without adding much control. Audit keeps changes accountable.

### D52 — CRM gift history supports clean named personal views (2026-05-29)

**Decision:** Users can save multiple named personal CRM gift-history views. The UI must stay clean and easy to use.

Named personal view contents:

- Column visibility/order.
- Filters and sort.
- Pinned row action preference.
- Any other CRM gift-history view setting that is personal and display-oriented.

UX rules:

- One personal view can be marked as the user's default.
- The default view loads automatically when the user opens CRM gift history.
- Use a simple view switcher with clear names, not a heavy dashboard-builder UI.
- Common actions: save current view, rename, duplicate, set as default, reset, delete.
- Deleting the default view requires choosing another default or falling back to tenant/system default.
- Keep tenant defaults separate from named personal views.
- Shared tenant/team views are not part of this decision unless explicitly introduced later.
- Views are server-backed with local responsive cache and schema versioning.

**Rationale:** Power users need fast pivots like "Receipts follow-up" or "Corrections pending," but most staff should see a simple default and an unobtrusive switcher. Named personal views add workflow speed without introducing shared-view governance yet.

### D53 — Named personal views use a compact view switcher dropdown (2026-05-29)

**Decision:** Named personal CRM gift-history views are accessed from a compact view switcher dropdown near the table toolbar, not as persistent tabs/chips above the table.

View switcher behavior:

- Show the current view name in a compact control.
- Dropdown lists named personal views.
- Dropdown or adjacent menu exposes actions: save current view, rename, duplicate, set as default, reset, and delete.
- Indicate which view is the default.
- Avoid showing many persistent chips/tabs that clutter donor context.
- Keep keyboard navigation and screen-reader labels clear.
- On narrow screens, the switcher should remain compact and accessible from the table toolbar.

**Rationale:** Named views are useful, but the CRM donor page should stay focused on the donor and gift history. A compact switcher gives power users speed without visual clutter.

### D54 — Named CRM gift-history views are personal-only in this PRD (2026-05-29)

**Decision:** Named CRM gift-history views are personal-only for this PRD. Staff cannot share, publish, or assign named views to other users in this scope.

Rules:

- Users can create, rename, duplicate, delete, reset, and set a default for their own named personal views.
- Tenant defaults remain the shared/admin-controlled mechanism for common starting configurations.
- No share-by-link, publish-to-team, view ownership transfer, shared-view permissions, or shared-view conflict resolution in this PRD.
- If shared/team views are introduced later, they need separate governance, ownership, defaults, and audit rules.

**Rationale:** Personal named views help power users without adding collaboration/governance complexity. Tenant defaults already provide the controlled shared baseline.

### D55 — PRD requires migration to the shared contribution row contract (2026-05-29)

**Decision:** The PRD should include an implementation constraint that CRM gift-history rows and Contributions Hub rows use a shared contribution row/read-model contract for overlapping fields.

Rules:

- Existing CRM gift-history row fields should be migrated or adapter-mapped into the shared contribution row contract.
- The PRD should define the product invariant and acceptance criteria, not a step-by-step engineering migration plan.
- Overlapping fields must share value derivation, labels, formatting, status vocabulary, filters, and freshness behavior.
- CRM may still display a subset of the shared row contract.
- Any CRM-only donor-context fields must be clearly identified as CRM-specific and must not redefine shared contribution field meaning.
- Implementation should avoid duplicating row derivation logic in separate CRM and Hub code paths.

**Rationale:** This protects the "same data, same places" invariant without over-specifying implementation. Existing CRM rows can evolve through an adapter/migration path while the PRD remains product-focused.

### D56 — PRD includes product-level CRM/Hub display-parity acceptance tests (2026-05-29)

**Decision:** The PRD should include product-level acceptance tests for CRM/Hub display parity.

Acceptance criteria examples:

- The same gift shows the same amount, date, donor, designation summary, receipt state, correction/approval state, refund state, CRM/Twenty post state, and payment status in CRM donor gift history and Contributions Hub where those fields appear in both places.
- A correction made inline from CRM updates the corresponding Contributions Hub row after shared query refresh.
- A correction made from Contributions Hub updates the corresponding CRM gift-history row after shared query refresh.
- Shared filters return the same gifts when the filter meaning overlaps between CRM and Hub.
- CRM-only donor-context fields may appear only in CRM, but must not redefine shared contribution fields.
- Stale client views are handled as UI freshness behavior, not as separate data truth.

**Rationale:** Display parity is a core product invariant, so it needs PRD-level acceptance coverage. The PRD should protect the behavior without prescribing the full automated test suite.

### D57 — PRD includes product-level inline CRM operation acceptance tests (2026-05-29)

**Decision:** The PRD should include product-level acceptance tests proving inline CRM operations use the same shared backend contracts and result behavior as contribution detail.

Acceptance criteria examples:

- Inline correction from CRM submits the same shared contribution operation contract as contribution detail and returns the same operation result shape.
- Inline receipt action respects the same receipt policy, donor email preference, PDF fallback, audit behavior, and operation result vocabulary as contribution detail.
- Inline refund action follows the same permission, approval, idempotency, provider-safety, and audit rules as contribution detail.
- Inline approve/reject action follows the same approval ownership, task lifecycle, requester notification, rejection reason, and outcome audit rules.
- Inline operation results render inside the CRM operation shell, keep staff in CRM, and refresh the affected CRM row through shared query invalidation.
- Invalid inline operations show the same blocked reason semantics as contribution detail.
- Technical/provider actions are visible inline only for staff with the same capabilities that would see them in contribution detail.

**Rationale:** Full inline operation parity is only safe if inline actions are proven to be alternate UI affordances over the same operation contracts. Product-level acceptance tests protect that invariant without prescribing test framework details.

### D58 — PRD defines done for polished inline CRM operation UX (2026-05-29)

**Decision:** The PRD should define "done" for inline CRM operation UX with product-level acceptance criteria. The experience must be consistent with the repo design system and highly polished.

Design-system requirements:

- Use shared `@asym/ui` primitives and existing shadcn/ui components.
- Follow the repo's **Base UI first** primitive policy for new behavior-heavy UI.
- Preserve the **base-maia / Maia theme** with the **Zinc palette**.
- Use shared Maia/Zinc design tokens from `packages/ui/styles/globals.css`.
- Do not hardcode colors, one-off radii, arbitrary visual systems, or app-local shadcn copies.
- Keep Tailwind usage token-based and consistent with existing Mission Control components.

Inline CRM UX acceptance criteria:

- Staff can complete inline contribution operations without leaving CRM.
- Risky actions always show required context before submit: current values, proposed operation, downstream effects, required reason/confirmation, approval/receipt requirements, and blocked reasons.
- Operation result panel clearly shows what changed, what happened next, and any linked task/receipt/PDF/audit reference.
- Result panel uses progressive disclosure: staff-readable result first, technical proof only when expanded and authorized.
- Focus, scroll, donor context, selected row, and CRM drawer/page state are preserved after completion or cancellation.
- Mobile/narrow screens use the responsive operation sheet with keyboard-safe layout and 44px touch targets.
- Keyboard navigation, screen-reader labels, focus trapping/return, reduced motion, and accessible status semantics are required.
- Dynamic content must avoid layout shift; result panels reserve space for status, changed values, and actions.
- Animations are purposeful and fast; no `transition-all` or hover-only interactions for core behavior.
- Inline operation UI uses the same result vocabulary as contribution detail.

**Rationale:** Inline CRM operations are a core staff workflow, not a secondary shortcut. Defining done at the PRD level keeps the experience polished, accessible, and visually consistent without requiring full mockups in the PRD.

---

## Open questions queue

1. ~~Canonical open key: donation vs staged gift vs composite?~~ → **donation.id (D1)**
2. ~~Detail surface: shared sheet vs full page vs route + sheet?~~ → **global route-aware overlay (D2)**
3. ~~CRM entry: deep link to hub detail vs embed same component?~~ → **same global overlay (D2)**
4. ~~URL contract: query state vs canonical route?~~ → **hybrid query + canonical route (D3)**
5. ~~What is editable in detail vs read-only financial truth?~~ → **full correction form with controlled correction workflow (D4)**
6. ~~Refund/correction: adjustment model vs in-place amendment?~~ → **adjustment records, high-risk review requests (D5)**
7. ~~What counts as high-risk and requires approval?~~ → **external effects by default; super-admin approval suppression setting (D6)**
8. ~~Audit trail: scope, visibility, pagination?~~ → **layered staff timeline + expandable technical proof (D7)**
9. ~~Recurring: link target (agreement detail? subscription in Stripe?)~~ → **internal recurring agreement primary, Stripe refs secondary (D8)**
10. ~~Designation vs fund vs missionary — display rules for split gifts?~~ → **all designations first-class and equal (D9)**
11. ~~What is the canonical designation object?~~ → **amount allocated to a fund; restriction and memo are separate (D10)**
12. ~~Should every designation line require exactly one fund?~~ → **yes; default unspecified gifts to General Fund (D11)**
13. ~~How should fund type determine context shown on a designation line?~~ → **compact equal rows, expandable subtype context (D12)**
14. ~~How should CRM post state work for multi-designation gifts?~~ → **parent gift + child designation records (D13)**
15. ~~How should receipt state work for multi-designation gifts?~~ → **gift-level receipt, line-aware content and correction impact (D14)**
16. ~~How should Stripe references be displayed and acted on?~~ → **role-gated technical drawer; safe operations only (D15)**
17. ~~What should save behavior return and refresh?~~ → **updated detail + operation effects; progressive disclosure in UI (D16)**
18. ~~What is visible by default in contribution detail?~~ → **financial summary first (D17)**
19. ~~Which actions are primary vs secondary?~~ → **next-best visible actions + risk-based More actions (D18)**
20. ~~How should invalid/blocked actions be explained?~~ → **hide irrelevant; show meaningful blocked actions disabled with reason (D19)**
21. ~~What should the Contribution Hub search entry point support?~~ → **simple search + advanced operational/financial filters (D20)**
22. ~~What should the CRM donor gift history entry point show before opening detail?~~ → **compact issue-aware rows + per-user customizable columns (D21)**
23. ~~Where should per-user table preferences be stored?~~ → **server source of truth + local responsive cache, built on TanStack stack (D22)**
24. ~~What should happen when a gift is opened from CRM and its underlying detail changes while open?~~ → **soft live sync + stale-save protection (D23)**
25. ~~What should happen after staff close contribution detail?~~ → **preserve context, patch/refetch affected data, restore focus (D24)**
26. ~~What should be included in the PRD success criteria?~~ → **journeys + contracts + operational invariants + UX/a11y requirements (D25)**
27. ~~Which permission model should contribution detail use?~~ → **user-facing roles + granular backend capabilities (D26)**
28. ~~Who should approve high-risk correction requests?~~ → **tenant-configurable approval ownership policy (D27)**
29. ~~How should approvers be notified of pending correction requests?~~ → **task + in-app + optional email, tenant/user configurable (D28)**
30. ~~What happens when a correction request is approved or rejected?~~ → **simple hybrid outcome workflow: close approval task, notify requester, apply or create rejection follow-up (D29)**
31. ~~What happens when a correction request sits pending too long?~~ → **simple SLA: reminders + optional escalation, never auto-approve (D30)**
32. ~~When an approved correction changes already-sent receipt values, what should happen?~~ → **admin selects email or PDF updated receipt at correction time (D31)**
33. ~~If a receipt-affecting correction requires approval, when is delivery choice made?~~ → **requester proposes, approver confirms or changes (D32)**
34. ~~Should receipt delivery choices be configurable by tenant policy?~~ → **tenant defaults and guardrails for updated receipt delivery (D33)**
35. ~~How should Contributions Hub and CRM donor history stay consistent after corrections?~~ → **same database/read model; no internal sync workflow (D34)**
36. ~~Which CRM gift-history fields must be display-identical with Contributions Hub/detail?~~ → **same shared row contract wherever fields overlap (D35)**
37. ~~How should UI freshness work when one open surface has cached data?~~ → **shared query invalidation/refetch with quiet row updates and freshness indicator (D36)**
38. ~~Should CRM gift history and Contributions Hub use the same filters for shared contribution states?~~ → **same filter definitions where state overlaps; different exposed subsets (D37)**
39. ~~What happens when staff edit from CRM versus Contributions Hub?~~ → **CRM inline operations allowed only through shared contribution contracts (D38)**
40. ~~Which inline CRM operations should be allowed in the first version?~~ → **all operations that exist in contribution detail, capability-gated and contract-shared (D39)**
41. ~~How should CRM inline actions show enough context for risky operations?~~ → **row action opens compact contextual dialog/drawer before submission (D40)**
42. ~~Should CRM inline operation dialogs be custom per action or shared?~~ → **reusable operation shell with action-specific content (D41)**
43. ~~How should operation results show after inline CRM operations?~~ → **result panel in same operation shell; stay in CRM with optional detail link (D42)**
44. ~~How should inline CRM operations behave on mobile or narrow screens?~~ → **same shell becomes responsive full-height/bottom sheet (D43)**
45. ~~How should staff discover inline CRM operations without overwhelming the row?~~ → **next-best action plus capability/state-filtered More actions menu (D44)**
46. ~~Can users customize which inline action appears as the row's next-best action?~~ → **system default plus user-pinned preferred action with validity fallback (D45)**
47. ~~Where should the user's pinned CRM row action preference live?~~ → **server source of truth plus local responsive cache (D46)**
48. ~~Can tenant admins set the default CRM row action before a user pins their own?~~ → **tenant default by role/team/surface plus user override and validity fallback (D47)**
49. ~~Should pinned/default CRM row actions be included with table column preferences?~~ → **same CRM gift-history view settings, tenant defaults plus user overrides (D48)**
50. ~~How should reset-to-default work for CRM gift-history view settings?~~ → **granular reset controls with preview and tenant/system default fallback (D49)**
51. ~~How should tenant defaults for CRM gift-history view settings be managed?~~ → **super admin plus delegated settings capability, audited (D50)**
52. ~~Do tenant default CRM gift-history settings need approval before they change?~~ → **no approval; capability-gated changes with audit only (D51)**
53. ~~Can users save multiple named CRM gift-history views?~~ → **yes, named personal views with one default and clean switcher UI (D52)**
54. ~~How should named personal views be displayed?~~ → **compact view switcher dropdown near table toolbar (D53)**
55. ~~Should named personal views be shareable with other staff later, or explicitly personal-only for this PRD?~~ → **personal-only in this PRD; tenant defaults handle shared baseline (D54)**
56. ~~Should the PRD require migration from today's CRM gift-history rows to the shared contribution row contract?~~ → **yes, as implementation constraint and acceptance criteria (D55)**
57. ~~Should the PRD include acceptance tests for CRM/Hub display parity?~~ → **yes, product-level acceptance tests for shared fields, refresh, and filters (D56)**
58. ~~Should the PRD require acceptance tests for inline CRM operations using shared backend contracts?~~ → **yes, product-level acceptance tests for shared contracts/results/policies (D57)**
59. ~~Should the PRD define "done" for inline CRM operation UX specifically?~~ → **yes, polished Maia/Base UI/shadcn UX acceptance criteria (D58)**

---

## PRD Drafting Notes

Use this grill session to draft a PRD with these sections:

1. **Problem / Goal:** same financial truth from CRM and Contribution Hub; same backend contracts; no duplicate data, crossed wires, or sync delay.
2. **Personas:** donor-care staff, finance staff, admin/super admin.
3. **Core journeys:** open from CRM, open from Hub, correct designation through shared contracts, run any permitted contribution operation inline from CRM, review risky inline operation in contextual dialog/drawer, view inline result while staying in CRM, submit/approve/reject correction request, propose/confirm updated receipt delivery, refresh shared rows after correction, manage receipt impact, handle CRM post failure, inspect Stripe proof, process refund, customize CRM gift history columns.
4. **Data contracts:** contribution detail payload, shared contribution read model, shared contribution row contract, CRM row adapter/migration constraint, shared contribution filter definitions, shared contribution operation contracts, designation set, adjustment/correction records, correction request outcomes, operation result, audit trail, CRM parent/child links, receipt content snapshot, updated receipt delivery proposal/result, recurring agreement refs, table preferences, pinned row action preference, named personal CRM gift-history views.
5. **Operational invariants:** donation id canonical, every designation line has one fund, original donation preserved, adjustments derive effective truth, CRM and Hub render the same database-backed effective values for overlapping fields, existing CRM row fields migrate/adapt to shared row contract, CRM/Hub operations use the same backend contracts, optimistic concurrency, idempotency, audit immutability.
6. **UX requirements:** financial summary first, equal designation rows, progressive disclosure, design-token consistency, `@asym/ui` shared primitives, Base UI first for behavior-heavy UI, shadcn/ui Maia theme with Zinc tokens, next-best actions, optional user-pinned row action with fallback, More actions grouped by operation category, blocked-action reasons, smart close, soft live sync, quiet shared-row refresh, same field labels/statuses/filter meanings across CRM and Hub where state overlaps, inline CRM operations must not omit required review context, compact inline affordances expand into contextual dialogs/drawers when an operation needs more context, reusable inline operation shell for consistent permissions/results/a11y, inline results keep staff in CRM with preserved context/focus, responsive full-height/bottom-sheet presentation on narrow screens, granular reset controls with preview for CRM gift-history view settings, clean named-view switcher with one personal default.
7. **Permissions:** user-facing roles, granular backend capabilities, delegated CRM gift-history view-default management capability, audit-only governance for view-default changes, server-side enforcement for each action.
8. **Settings:** approval suppression policy, approval ownership policy, correction approval SLA defaults, correction approval notification defaults, updated receipt delivery policy, CRM gift-history view settings, tenant default row action, per-user notification preferences, per-user table preferences, per-user pinned row action preference, personal-only named views, reset-to-default.
9. **Non-goals:** full CRM redesign, donor/missionary portal redesign, full reporting system.
10. **Acceptance criteria:** product-level CRM/Hub display parity tests for shared fields, shared filters, shared query refresh after corrections, CRM-only donor-context field boundaries, inline CRM operation parity with shared backend contracts/results/policies, and polished inline CRM UX acceptance criteria grounded in Maia/Zinc, Base UI, shadcn/ui, accessibility, focus continuity, and responsive behavior.
