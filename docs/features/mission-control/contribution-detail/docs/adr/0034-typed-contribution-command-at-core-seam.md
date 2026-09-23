# ADR-CD-0034: Typed Contribution command at the Core seam

- Status: Accepted
- Date: 2026-08-18
- Deciders: Mission Control / Contribution Operations Core
- Tags: contribution-command, contribution-operations, core-seam, adapters

## Context

Contribution Operations Core is one public function (`executeContributionAction`). Until this ADR, that function's interface was a bag of context plus `actionType` and `payload?: Record<string, unknown>`. The Core then re-learned each action's required keys inside a ~1,400-line switch.

Mission Control shells (`operation-shell.tsx`, `contribution-detail-sheet.tsx`) independently re-learned the same action catalog (titles, descriptions, field lists, dollar-to-cents payload builders). HTTP JSON, stored correction-request payloads, and batch callback bags still need `actionType` + record shape.

OpenSpec requires a single Contribution Operations Core. The deepening is therefore the Core's **command** type and a shared staff catalog, not a split into many public functions.

## Decision

1. **Typed command at the Core seam.** `executeContributionAction` takes `command: ContributionCommand` (discriminated union). `actionType` and `payload` are not on `ExecuteContributionActionInput`. Generic `TContribution` remains the canonical contribution, not the command.

2. **HTTP, storage, and batch callbacks stay bags.** `actionRequestSchema`, correction-request rows, and `ProcessContributionBatchInput.executeContributionAction` keep `actionType` + `payload`. Route and correction-request adapters parse into `ContributionCommand` immediately before calling Core. The batch Core callback type is unchanged; the batch **route** wrapper parses.

3. **Parse does not 400 on empty strings.** Empty-string 400s stay in executor normalize after permission and approved-correction overlay, before reason/confirmation, so 403-before-400 is preserved. Missing required fields (refund amount, donorId) still throw in the handler after reason/confirmation.

4. **Extras round-trip.** Parse keeps unknown keys and wrong-typed known keys on `extras` so stored correction payloads and HTTP bags do not lose fields.

5. **Shared staff catalog lives in Core.** `packages/api/src/admin/contribution-operations/catalog.ts` is the SSOT for `OPERATION_DEFINITIONS`, titles, and `buildPayload`. Mission Control shells import it. Catalog copy and field lists stay verbatim with the previous shell. Catalog is a **client-safe** subpath export; it is not re-exported from the server-only barrel.

6. **Handlers are internal.** Action bodies live under `action-handlers/`. Tests stay at `executeContributionAction`. Handlers are not part of the public interface.

7. **Context `stagedGiftId` stays on execute input.** The command may also carry it; the executor merges `input.stagedGiftId ?? command payload stagedGiftId`.

## Consequences

- Callers that already have JSON bags must parse at the adapter (`parseContributionCommand`). Tests that built bag-shaped execute input use `executeContributionActionFromBag`.
- Adding a Contribution action means: extend `ContributionCommand`, add a handler, add a catalog entry, keep HTTP bag keys stable.
- Product behavior is unchanged: same HTTP contract, same permission/approval/empty-string ordering, same settlement authorities (Stripe, Staged Gift).

## Alternatives considered

- **Keep `actionType` + `payload` on execute and add a typed command beside it.** Rejected: dual-shape compatibility would leak the bag into every caller and leave the Core interface shallow.
- **Public handler-per-action interface.** Rejected: OpenSpec requires one Core function; handlers stay internal.
- **Rewrite Mission Control shells onto a new UI module.** Rejected: the catalog is the SSOT; 1,300-line shell rewrites are out of scope.
- **Parse empty strings as 400.** Rejected: would invert 403-before-400 for permission failures.
