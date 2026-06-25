# ADR-CD-022: Contribution detail uses soft live sync with stale-save protection

**Status:** Accepted (grill session 2026-05-29)

## Context

Contribution detail can be open while another staff member, automation, Stripe webhook, CRM/Twenty post process, or receipt process changes the same gift. Staff need current financial truth, but hard real-time updates can disrupt in-progress corrections.

The product goal requires no crossed wires and no sync delay, while the UI goal requires simple, low-noise behavior.

## Decision

Use soft live sync:

- Keep open detail fresh with TanStack Query / TanStack DB background refetch or collection sync.
- After a correction/action succeeds, invalidate or patch the shared contribution queries used by contribution detail, Contributions Hub, and CRM donor gift history.
- Patch or refetch affected rows without hard-refreshing the whole CRM or Hub workspace.
- Preserve staff context, selection, scroll position, and focus when rows refresh.
- If there are no unsaved edits, apply safe background updates quietly.
- Show low-noise freshness indicators for routine updates.
- If unsaved edits exist and the gift changes elsewhere, show a conflict notice with compare, reload, or discard options.
- Enforce optimistic concurrency on every save/action using version, revision, or `updatedAt`.
- Reject stale saves server-side with a clear recovery path.
- Allow audit trail updates to arrive in the background without stealing focus.

## Consequences

- Detail payloads need version/revision metadata.
- Save APIs must verify the submitted version before applying changes.
- The UI needs unsaved-edit tracking and conflict recovery.
- Query/DB cache updates should not overwrite draft form state.
- Shared CRM/Hub row updates should use the same contribution query contract as detail, not a separate refresh path.

## Alternatives rejected

- **Manual refresh only:** Too stale for financial operations.
- **Refetch only on focus/action:** Better than manual, but still leaves staff reading stale state for too long.
- **Hard real-time overwrite:** Current, but risks disrupting active corrections and staff comprehension.
