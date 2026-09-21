# PRD 2: Email Studio Donor Correction Notifications

**Current requirements amended 2026-09-16 (AL-1861).** These bodies use the
ratified [owner contracts](../../features/mission-control/contribution-detail/README.md).
The [original PRD](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/mission-control-contribution-operations/02-email-studio-donor-correction-notifications.md)
records the earlier requirements and delivery history (split PRs #395–#396). Those
original delivery claims do not establish implementation of the amended target.

## Problem statement

Donors need correct, privacy-safe explanations of actual money and official-
document changes. Staff need to see whether a notice was required, prepared,
submitted, delivered, blocked or lawfully suppressed without confusing that
state with the underlying correction.

## Solution

Contribution operations emit exact typed source occurrences and safe fact
projections into the Phase 17 system-message contract. Phase 17 owns content,
publication resolution, protected facts/actions and whole-message preparation;
Phase 6 owns recipient intent, consent checks, dispatch, provider outcomes,
recovery and body-free history. Neither the producer nor automation calls
Resend directly or rereads a mutable template after message preparation.

Use the [executable manifest](../sitestacker-parity/phase-17-system-message-executable-manifest.md)
for exact key, source fence, recipient resolver, purpose, requiredness, locale,
retention and proof. Missing/invalid/incompatible content blocks the notice and
creates owner-routed repair; it does not undo an already completed source action.
Financial corrections have no cross-language/protected-default content fallback.

## Goals

- Use one catalog and protected message preparation pipeline.
- Keep authorized surrounding-copy authoring in governed Email Studio/Tiptap;
  content editing cannot alter source facts, recipient, action or requiredness.
- Use exact source-derived financial/document facts and safe personal-note slots.
- Preserve source decision, message preparation and provider outcome separately.
- Reconcile retries against the same sealed message and effect identity.
- Route actionable failure through the actual repair/source owner and shared tasks.

## Initial template families

Use only the exact qualified Target Live keys from Phase 17:

- refund failed; unspecified-kind, partial and full refund completed;
- amount corrected; designation changed; payment-state corrected; donor relinked;
- receipt corrected, only with the current source correction effect and exact
  ready Phase 18 successor artifact; do not duplicate receipt-replaced meaning;
- the statement-owning keys for actual Phase 19 run/fulfillment occurrences.

These are navigation labels, not new key definitions. A refund-started or other
unlisted meaning must remain unavailable until its owning catalog contract is
qualified; never alias it to a completed-refund or generic correction key.

## Default notification policy

The contribution source determines whether the exact donor financial notice is
required under `source_required_with_audited_suppression@1`. A permitted money/
official-document suppression requires source capability, reason and immutable
audit. Phase 17 content/settings cannot suppress it or turn a personal/marketing
preference into an official-message block.

Receipt messages use their exact Phase 7 issuer/purpose/recipient policy. The
named corrected-receipt source suppression exception is not a generic override.
A missing or unauthorized recipient blocks with source-owned repair; no template
may substitute another Party. The old per-action auto/ask table is not a second
notification policy engine.

## Implementation decisions

- Consume Phase 17 catalog/source adapters and qualified Tiptap authoring.
  Existing template-store/system-binding rows are migration inputs, not parallel
  activation or message-identity authority.
- Validate and resolve a whole compatible publication before preparation;
  preserve its immutable facts, recipient, actions and effect identity afterward.
- For donor corrections, keep requested-locale inheritance within the exact
  permitted scope; missing content opens repair without a weaker fallback.
- Receipt-corrected messages wait for the exact current ready artifact and
  retain Phase 7 recipient authority; reading a receipt never generates one.
- Optional personal notes exist only in the source-approved safe slot; donor
  relink messages never expose old/new donor identities from template input.
- Required in-product repair attention and task routing follow their owner
  contract. Notification preferences never erase source work.

## Testing decisions

Test exact source/recipient/key/fence identity, protected facts/actions,
publication qualification, whole-message immutability, locale restrictions,
source-audited suppression and read/dispatch-time access loss. Verify attempted
refund wording never claims money moved; full/partial completion uses proved
source amounts. Prove receipt-corrected notices require the exact current
artifact and cannot duplicate receipt replacement. Verify no local Resend call,
mutable-template reread, richer optional-email leak or unsupported fallback.

Exercise idempotent source and provider recovery separately; a blocked notice
must not reverse a completed correction or make a later retry a new effect.

## Definition of done

- All reached producer paths use exact qualified Phase 17 contracts and Phase 6
  dispatch/history, including single, inline, automation and bulk entrypoints.
- Requiredness, suppression, source facts, recipient scope and artifact gates
  are proved under negative, stale, duplicate and recovery cases.
- Governed authoring preserves protected meaning; no legacy binding/template
  path remains an alternate authority for this scope.
- Staff see honest source, preparation, provider and repair outcomes.
- Relevant unit/integration/browser and owner qualification checks pass; these
  document edits do not claim those runtime gates already passed.
