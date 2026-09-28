# Fix missionary Partner roster safety

## Why

The extracted Partners roster hides pagination controls while retaining a ten-row
client page, making later loaded partners unreachable. Its redacted anonymous
rows also remain editable, allowing the empty visible tag draft or placeholder
identity to overwrite hidden canonical donor data.

## What Changes

- Render every loaded partner through the existing responsive/virtualized table.
- Prevent profile and tag editing of redacted rows in the UI and enforce the
  existing recipient-identity visibility policy atomically on server updates.
- Restore partner type and the Unknown location fallback in the extracted header.
- Name icon actions and reuse shared grouped choices, cards, loading/empty states
  and semantic theme tokens throughout the extracted Partners UI.
- Preserve named-partner editing, tenant/missionary scoping, task and activity
  authorization, and the existing gift-anonymity projection policy.

## Impact

Scope is the missionary Partners UI and its profile/tag commands in packages/api.
No schema, migration, payment, preference-setting or shared component API changes.
Rollback is a normal revert; no stored records are rewritten by deployment.
