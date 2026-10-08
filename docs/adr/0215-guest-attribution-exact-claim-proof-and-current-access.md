# ADR-0215: Guest attribution, exact claim proof and current access

**Status:** Accepted (Phase 4 A4–A6/A10; Phase 25 IC01–IC06).

This records accepted target intent for AL-504, not runtime safety, native
admission, provider qualification or activation evidence.

## Context

A returning guest can supply an email already associated with a donor. Quiet
source-approved attribution can avoid duplicate identity; disclosing a name,
history, saved method or account existence would instead expose private data.
Native email/provider verification does not settle application claim policy or
current protected access. Later contact changes must not erase accepted claim
history or move another person's established binding.

## Decision

Recognize but never reveal. Attribute a new guest gift only under current source
rules for one eligible same-Tenant match; ambiguity goes to staff review, never
an automatic identity guess. Preserve legal donor truth. Public responses remain
enumeration-safe in shape and timing intent, including known/unknown donors and
shared credentials. Attribution grants no login, native attachment, claim,
contact-verification fact, saved-method reuse or private-data authority.

Initial exact binding requires fresh, single-use, purpose-bound proof of control
of the intended contact email/mailbox plus current source claim/link policy for
the intended principal and record. Where
policy compares contact, prove its exact scoped current revision and normalized
match. Qualified email-first entry offers one safe link and secondary code
redeeming the same issuance once; scanner GET/HEAD creates no claim or session.
Setting a password is post-authentication, not claim entry. Invitations are
branded, expiring, single-use and revocable; issuance/acceptance alone grants
nothing. Their proof and current-policy gates remain mandatory.

Accepted historical claim proof is separate from mutable contact revision and
verification. Contact changes inherit no old verified flag, erase no established
claim and cannot select or replace a differently bound person. Every protected
read independently proves current Phase 12 context, exact personal/represented
subject, purpose and source admission. History, wallet and lists require their
own admission; a record/document grant or authenticated claim cannot widen it.
Use the existing PDP/projection source resolver, not another access engine.

Google, Apple and Facebook remain selected optional donor-entry scope. New
email-matching attachment is blocked by unresolved A10/G01 and exact native and
per-provider qualification. An already-bound stable provider subject is distinct
from a new attachment; changed/absent/relay email follows IC04/IC05. No native
SDK success, verified-email flag or hidden UI proves admission. This decision
selects no broker/fork and declares no email-only completion of selected scope.

Identity owns purpose/proof; Phase 17 owns immutable prepared messages and bounded
sender identity; Phase 6 alone dispatches and records history. Wrong/missing
trusted Tenant context fails closed without default SMTP or direct-send fallback.

## Trade-offs and rejected alternatives

- **Automatic email-match attribution as claim or access:** rejected because
  quiet bookkeeping cannot prove the intended person's possession or permission.
- **Provider flag or mailbox trust as substitute for qualified proof/current
  access:** rejected because mutable verification does not establish exact
  historical binding or the current context, subject and purpose.
- **Native-link safety inferred from SDK/email verification:** rejected because
  application checks cannot repair an already-issued unqualified native credential;
  supported native G01 qualification must precede affected activation.
- **Staff action as donor possession:** rejected because administrative intent
  cannot supply the donor's required proof.

Uniform public responses and exact issuance/currentness checks add qualification
work; they avoid disclosing identity while preserving optional guest giving.

## Consequences

Future implementation must prove response/timing non-enumeration, exact claim
atomicity, expiry/replay/wrong-purpose/wrong-principal rejection, contact-change
stability and narrow protected reads. Direct native endpoint/provider proof
remains required. Document publication and mock success cannot activate any lane.

## Related contracts

- [AL-504 documentation scope](https://github.com/Asymmetric-al/core/issues/504)
- [Current Phase 4 owner PRD](../prds/sitestacker-parity/phase-04-identity-account-claiming-foundation.md)
- [Phase 25 identity contract](../prds/sitestacker-parity/phase-25-donor-dashboard-depth/contracts/identity.md)
- [Active foundation requirements](../../openspec/changes/sitestacker-parity/specs/platform-product-intent/spec.md)
- [Documentation and future implementation tasks](../../openspec/changes/sitestacker-parity/tasks.md#6-phase-4-durable-language--al-504)
- [ADR identity registry](registry.md)
- [Current claim-service tracker AL-509](https://github.com/Asymmetric-al/core/issues/509)
- [Auth-email ownership tracker AL-511](https://github.com/Asymmetric-al/core/issues/511)
