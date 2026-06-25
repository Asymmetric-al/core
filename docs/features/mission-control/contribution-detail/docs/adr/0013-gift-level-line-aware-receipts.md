# ADR-CD-013: Receipts are gift-level and designation-line-aware

**Status:** Accepted (grill session 2026-05-28)

## Context

One gift can have multiple equal designation lines. Receipts need to preserve that designation truth without making one donor gift look like multiple independent gifts.

Corrections can happen after a receipt is sent, so contribution detail must distinguish the current effective designation set from what the donor already received.

## Decision

Use one receipt object/status per gift, with line-aware receipt content.

- Receipt state is gift-level.
- Receipt content lists every designation line equally.
- Audit records which designation lines and effective values were included in a sent receipt.
- Later corrections that affect sent receipt content mark the receipt as affected.
- Policy determines whether affected receipts require reissue, suppression, review, or no action with reason.
- Later decision ADR-CD-029 specifies the simple correction-time delivery choice for updated receipts: email when allowed, PDF when email is unavailable/disallowed or chosen by staff, or defer with reason when policy permits.

## Consequences

- The detail API needs current effective designation lines and receipt content snapshot references.
- Correction workflows need to report whether a saved adjustment affects a sent receipt.
- Receipt resend/reissue UI must explain whether it is sending the original receipt, an updated receipt, or a policy-approved replacement.

## Alternatives rejected

- **One receipt per designation:** Fragments one donor gift and increases donor confusion.
- **Single receipt without line awareness:** Loses multi-designation truth.
- **Tenant-configurable receipt granularity:** Too much variation for a core tax-receipt contract unless a future legal/accounting need requires it.
