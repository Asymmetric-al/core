# ADR-CD-022: Contribution detail uses soft live sync with stale-save protection

**Status:** Accepted (grill session 2026-05-29)

**Current amendment — 2026-09-16 (AL-1861):** The Decision below uses the
ratified [owner contracts](../../README.md); unchanged UI decisions remain valid.

## Context

Contribution detail can be open while another staff member, automation, Stripe webhook, source posting process, or receipt process changes the same gift. Staff need current financial truth, but hard real-time updates can disrupt in-progress corrections.

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
- Enforce optimistic concurrency on every save/action using the exact owner revision (Phase 13 monotonic source sequence for money), never a timestamp-only substitute.
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

## Original decision provenance

The [original dated record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/docs/adr/0022-soft-live-sync-stale-save-protection.md) preserves earlier wording and
rationale. Current terminology and applicability were amended on 2026-09-16;
documentation does not establish runtime activation.
