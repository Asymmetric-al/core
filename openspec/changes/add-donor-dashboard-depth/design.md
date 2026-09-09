## Context

See proposal.md for motivation. The current donor application mixes real legacy-backed reads with prototypes, incomplete owner contracts and tests of narrower behavior. The approved specification adopts the existing Core source and testing architecture, completes only the named owner seams and provides one coherent donor experience. Runtime and upstream qualification are not inferred from current rendering or the planning artifacts.

## Goals / Non-Goals

**Goals:** exact source-owned user outcomes; one current authorization spine; recoverable durable commands; precise amounts/dates/documents; clear conditional UI and mobile/AT behavior; complete acceptance/traceability through existing public seams.

**Non-Goals:** a new feature family, ledger/PDP/CRM/notification engine, provider broker/fork, general dashboard/report builder, foreign artifact importer, private test-only product API, tax calculator or feature implementation in this planning change.

## Decisions

The normative design is the Shared S01–S07 contract and four domain contracts linked below. They specify owners, finite logical model invariants, commands/read envelopes, scopes, source amendments, dependency adoption, failure/replay/clock semantics and exact composition. Physical names follow the actual owner convention; a logical proposed interface is not a claim it is already implemented.

- Use canonical shared business/API and source-owner modules rather than an app-local service or raw table replica; this preserves one authority and existing testing seams.
- Use exact source-reviewed commands with durable result/fencing rather than optimistic success; this keeps partial and ambiguous provider outcomes recoverable without duplicate effects.
- Use coherent bounded source snapshots and current egress rather than browser sums/loaded-page filters or long human-held transactions; this preserves membership/value and current authorization independently.
- Reuse exact shared Maia/Base UI and finite task layouts rather than generic configuration/builders; accepted local defaults and source states remain explicit.
- Preserve independent message/document/request and contact/financial subjects rather than one settings/status object; materially different clocks/cutoffs do not become a global helper.
- Use existing Playwright/Vitest/migration/provider seams with explicit fixture provenance rather than a new testing framework or demo/regex proof of native security.

| Normative contract                                                                                         | Design area                                                         |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [Shared](../../../docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth/contracts/shared.md)         | Owner amendments, testing, G01–G10, rollout and migration           |
| [Identity](../../../docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth/contracts/identity.md)     | Auth, exact contexts, credential/contact source and custody         |
| [Recurring](../../../docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth/contracts/recurring.md)   | Financial command/credential/pledge/rail source execution           |
| [Financial](../../../docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth/contracts/financial.md)   | History/filter/export/annual/credit/document coherence              |
| [Experience](../../../docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth/contracts/experience.md) | Navigation, Home, reading, preferences, messages and public request |

## Risks / Trade-offs

- Unestablished native Auth guarantee → G01 remains an explicit owned precondition for affected social activation; supported direct native proof required, no alternative architecture silently chosen. This is not treated as a safely deferrable design question.
- Current legacy roles/receipts/defaults/imported facts → source-first narrow migration and retirement of every reached caller; no fallback to known incompatible behavior.
- Partially applied or ambiguous external effect → durable exact command/result, shared admission fences and owner readback; independent successful children are retained.
- Stale/mixed data or permissions → coherent source basis plus current field/egress admission, generation fencing and bounded invalidation; no claim delivered bytes can be recalled.
- Library/test environment drift → compatible pinned adoption, explicit no-provider unit mode, real-source no-bypass acceptance and actual versioned DB/provider/renderer proof.
- Dense specification → stable story/contract/source IDs and complete trace; one accepted scope, not one new implementation per source clause.

## Migration Plan

Complete the exact owner/source/schema/protocol preconditions; qualify required external profiles and typed data adapters; compose donor slices and update reached route/copy/callback/writer consumers; prove all story and source acceptance, rollout and restore behavior; then activate only qualified lanes. The task plan records the dependency order.

Rollback contains new effects/read/egress/issuance while accepted reconciliation, lawful source correction, audit and disposal remain available. It never removes immutable money or restores unsafe generic artifacts/authorization. P22–P24 branch proposals stay explicitly unmerged until verified; their accepted final merge versions must be reconciled before affected activation. The change remains active and all implementation tasks unchecked until real implementation acceptance.
