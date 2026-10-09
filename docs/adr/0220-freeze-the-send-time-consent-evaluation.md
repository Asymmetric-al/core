# ADR-0220: Freeze the actual send-time consent evaluation

**Status:** Accepted (Phase 6 F4; October 8, 2026 owner reconciliation).

Accepted target intent for [AL-551](https://github.com/Asymmetric-al/core/issues/551),
not implementation, provider qualification or activation evidence.

## Context

Current consent can change after dispatch; recomputing it during a history read misstates why a send was allowed or blocked.

## Decision

Choose **immutable versioned send-time gate evidence**. At the sole seam, freeze the existing Phase 3 gate’s actual verdict and bounded evaluated inputs/version on the intent/event, without rerunning a second gate or making a parallel consent authority. Retain source revisions, purpose/channel and suppression provenance necessary to explain allow/suppress. History renders a safe summary rather than raw consent JSON.

Current consent and suppression remain authoritative for future sends and `isExportEligible`; an earlier allow snapshot grants no continuing contact or export permission. Do-not-contact and applicable channel restrictions fail closed, including receipts; record access and staff preview are separate from contact permission. Removing a provider suppression cannot automatically restore product consent.

Consent PR #502 merged July 8, 2026. Its historical helper does not qualify current-authority projection/preparation integration. That integration remains gated; #511 is an open branded auth-hook issue with independent provider/native-hook qualification.

## Trade-offs and rejected alternatives

- **View-time evaluation:** rejected because later state cannot explain an earlier send.
- **Mutable consent evidence:** rejected because edits erase the original decision.
- **Parallel gate/store:** rejected because duplicate consent authority drifts from Phase 3.

The chosen pattern costs explicit typed references and qualification evidence;
it preserves one owner for each fact instead of hiding authority in transport.

## Consequences

Future #555 must qualify one actual gate evaluation, immutable evidence, suppression and current export denial. Snapshot publication grants neither implementation nor legal qualification.

## Related contracts and grounding

- [Phase 6 owner PRD, including dated amendments](../prds/sitestacker-parity/phase-06-shared-communication-event-model.md)
- [Phase 3 projection, consent and export owner](../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md)
- [Phase 17 catalog/preparation/provider owner](../prds/sitestacker-parity/phase-17-system-messages-template-management.md)
- [Existing outbound-communications delta](../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md)
- [Program README](../prds/sitestacker-parity/README.md) and [parity matrix](../prds/sitestacker-parity/parity-matrix.md)
- [Build pattern and complete owner/prerequisite links](../prds/sitestacker-parity/phase-06-communication-views-build-pattern.md)
- [ADR registry](registry.md)
- Primary grounding: [GDPR official text, Articles 5 and 25](https://eur-lex.europa.eu/eli/reg/2016/679/oj). These sources support the pattern; the owner contract determines Core's accepted scope.
