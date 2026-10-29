# ADR-0001: Confirm recipients for external private document requests

**Status:** Ratified by Conrad on 2026-10-20: Phase 29 Q01 A, including the
required safeguards and explicit compatible source amendments in the reviewed
C01–C18 clauses and P01–P18 proof obligations.
No implementation, owner-contract publication, provider qualification or
activation is implied. This is a feature-scoped ADR, not the platform ADR-0001.

## Context

The requested Phase 29 product includes native private document collection
without requiring the recipient to become a donor or missionary. An invitation
can be forwarded; its possession does not establish the intended recipient's
current mailbox control. Conversely, compulsory full-platform enrollment adds
friction and does not itself establish stronger real-world identity.

The founder chose confirmation for every private request over eligible routine
requests relying on the invitation alone. The adversarial review distinguishes
mailbox proof, native identity, source recipient authority and current access.
Current Core signup assigns a donor profile, and the current human authorization
context assumes membership. Neither is a suitable unmodified implementation.

## Decision

Every newly admitted external private-document collection request requires
confirmation bound to its source-authorized recipient before protected request
details or permitted document actions are exposed. The invitation alone is
insufficient. The unit is the logical request and its relevant recipient/purpose
revision, not every HTTP call.

Use the existing shared identity, authorization and protected-action owners for
request-only access. Do not require donor, missionary, staff or organization
enrollment, fabricate a Party, or introduce another login or permission system
merely to respond.

After deliberate eligible entry, obtain fresh proof at the fixed source-approved
mailbox using the qualified safe-link/code issuance, unless a current proof is
explicitly qualified for the principal, exact mailbox revision, request, purpose
and required freshness. Ordinary sign-in, an email string or an email-verified
flag alone is insufficient. Confirmation of one request does not grant another.

Mailbox confirmation is evidence of control of that mailbox. It proves neither
legal identity, exclusive human ownership, representation, signature, document
authenticity nor business acceptance, and is not represented as MFA,
phishing-resistant authentication or a NIST assurance level. Source-required
stronger proof remains mandatory. Source-owned correction, representation and
lost-inbox recovery preserve attribution and cannot bypass proof.

Every protected operation rechecks its current source/request authority,
including finalization, processing promotion, result recovery and any separately
admitted read. Revocation/expiry/supersession fences new affected participant
authority and unaccepted late submissions. Durably received intake may continue
independently authorized source scanning, review or retention after a browser
session ends, without restoring participant access. Source withdrawal fences
promotion where its contract requires it. Ending access does not erase retained
evidence or recall already delivered copies.

## Required owner adoption

These substantive compatible amendments were included in Conrad’s explicit
ratification of Q01. They must now be reconciled into canonical owner sources
and declared OpenSpec projections at the later authorized specification stage,
before implementation or activation. This ADR does not pretend those sources
already support the new lane.

- Phase 4/native Auth and Phase 12 must narrowly admit an authenticated human
  to the exact current source request without organization enrollment, using
  the sole PDP. This is not a generic fifth role/context, public-context
  widening, alternate JWT issuer or membership fallback. Existing context
  semantics and unrelated memberships remain intact.
- Adopt a closed document-request-recipient authority for legitimate recipients
  without a Party. Its exact tenant/environment/source/request/revision,
  recipient/address revision and purpose bind the producer. Phase 17 prepares
  the exact presentation; Phase 6 alone dispatches. Phase 28's newsletter-only
  no-Party exception does not already authorize this purpose.
- Preserve ADR-0025/0037's existing scanner-resistant doorway, frozen qualified
  Tenant Donor Portal Host, deliberate POST, non-authorizing landing state,
  private delivery and secret rules. Any continuation to an existing
  participant surface requires its qualified same-tenant handoff.
- The requesting source retains recipient eligibility, action scope, stronger
  assurance, review, acceptance, correction and retention. Phase 29 retains
  byte custody. The exact shared seam precedes its consumers; complete Phase
  34/41 products are not prerequisites.

This decision does not amend unrelated Phase 18 receipt access, Phase 21
collaboration, Phase 28 newsletter confirmation, guest giving or every external
task. Unknown recipient/assurance policy blocks only the affected profile.

## Consequences and rejected alternatives

- A forwarded invitation alone no longer completes admission. Fresh confirmation
  adds a step where qualified proof is absent; appropriate current proof avoids
  repeated email and broad signup.
- Keep one logical paste/autofill-capable code input and the qualified safe-link
  alternative; do not copy demo permissions or local-only success. Missing
  proof, wrong account, mail delay and response loss need supported recovery.
- Treat proof, admission, upload, scan, review and source acceptance as distinct
  facts. The access grant is not a file-sharing, publication or financial command.
- Bearer invitation alone was rejected for this private-request profile because
  forwarding can transfer its practical authority. Full enrollment was rejected
  as unnecessary friction; a bespoke File Manager authentication stack was
  rejected because it duplicates existing owners.
- Actual native identity, real-role RLS/command, concurrency, provider/host,
  accessibility and participant proof are release gates. Passing existing unit
  tests or this document's publication establishes none of them.

## Evidence

The [complete 22-category review](../../grill/phase29-q01-adversarial-review.md)
contains the dated owner, runtime and external evidence notes. Its local IDs
are grooming traceability, not a formal PRD or published ticket graph.

Governing repository sources: ADR-0025 producer-owned protected actions,
ADR-0037 scanner-resistant artifact access, ADR-0214 tenant isolation,
ADR-0215 exact claim proof/current access, Phase 25 IC01–IC03, Phase 29 retained
owner constraints, and Workflow Studio participant surfaces/WS-Q02. The current
runtime reviewed was develop `3d85897ebf1515008ef5c676b1c58a15422fb9ab`.

## Ratification record

On 2026-10-20 Conrad explicitly instructed: “Yes, Ratify A with the required
amendments. Record it and move to the next question in this phase 29
grill-with-docs session, with the research, practical options, and your
recommendation.”

The adopted wording includes the final review corrections: request-specific
proof application versus qualified parent-proof reuse; native email uniqueness
versus business identity; participant session expiry versus independently
authorized source processing; scanner-resistant rather than scanner-proof
behavior; the qualified transient verifier-fragment exception; and preservation
of source-required stronger authentication. C12 uses operation-specific actor
and source authority for worker processing.

Ratification establishes accepted intent. Cross-owner canonical publication,
implementation, environment qualification and activation remain distinct later
stages. The existing research-only and `/to-prd` / `/to-issues` boundaries remain.
