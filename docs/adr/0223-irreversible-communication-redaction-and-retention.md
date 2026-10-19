# ADR-0223: Irreversible communication redaction and retention classes

**Status:** Accepted (Phase 6 F7; October 8, 2026 owner reconciliation).

Accepted target intent for [AL-551](https://github.com/Asymmetric-al/core/issues/551),
not implementation, provider qualification or activation evidence.

## Context

Communication evidence should explain interactions without becoming a sensitive body archive or rewriting immutable official money/document truth.

## Decision

Choose **irreversible redact-not-delete + purpose-owned retention + disclosure-risk audit**. Communication PII is irreversibly anonymized when admitted erasure applies while lawful separately owned immutable financial/document snapshots remain governed by their source owners. Body-free official communication evidence has the Phase 6 baseline of at least seven years, preferably permanent; operational and ephemeral evidence follow their classified schedules. This is a product design baseline, not a universal legal requirement or qualified GDPR/CPRA compliance claim.

Raw provider, prepared-message and Recent sent copy material follows its own bounded ceilings and restricted owners, never the official history retention label. Tenant Recent copy is Off/7/30 days within any shorter contract ceiling; platform v1 permits no readable copy. Expiry immediately removes read/decrypt authority even before purge. Durable events contain no body, transport address or personalized subject. Governed exports and sensitive disclosures are audited by disclosure risk; not every ordinary view becomes an audit event.

Phase 7 owns legal-donor/Statement Subject facts; Phase 13/20 and ADR-0206 preserve whole posted-financial-row immutability; Phase 18 owns exact immutable official artifacts and purpose schedules with Phase 19 coordination. Privacy cannot rewrite those snapshots or reconstruct personalized content from provider logs. GDPR/CPRA requires purpose-specific assessment, including applicable retention exceptions; this ADR makes no legal qualification and implements no erasure/pruning job.

## Trade-offs and rejected alternatives

- **Reversible masking:** rejected because retained reidentification keys do not constitute irreversible anonymization.
- **Deleting official truth or blanket permanent payload retention:** rejected because erasure and source-owned record duties require distinct treatment.
- **Body archive in history/unclassified exports:** rejected because it multiplies disclosure risk and bypasses projection governance.

The chosen pattern costs explicit typed references and qualification evidence;
it preserves one owner for each fact instead of hiding authority in transport.

## Consequences

Future retention/compliance work must qualify irreversible redaction, expiry denial, governed disclosure and immutable-source preservation. No disposal policy/job or compliance certification ships here.

## Related contracts and grounding

- [Phase 6 owner PRD, including dated amendments](../prds/sitestacker-parity/phase-06-shared-communication-event-model.md)
- [Phase 3 projection, consent and export owner](../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md)
- [Phase 17 catalog/preparation/provider owner](../prds/sitestacker-parity/phase-17-system-messages-template-management.md)
- [Existing outbound-communications delta](../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md)
- [Program README](../prds/sitestacker-parity/README.md) and [parity matrix](../prds/sitestacker-parity/parity-matrix.md)
- [Build pattern and complete owner/prerequisite links](../prds/sitestacker-parity/phase-06-communication-views-build-pattern.md)
- [ADR registry](registry.md)
- Primary grounding: [GDPR official text, Articles 5 and 17](https://eur-lex.europa.eu/eli/reg/2016/679/oj), [CPPA official statute, section 1798.105](https://cppa.ca.gov/pdf/20260101_ccpa_statute.pdf) and [IRS Publication 1771](https://www.irs.gov/pub/irs-pdf/p1771.pdf). These sources support the pattern; the owner contract determines Core's accepted scope.
