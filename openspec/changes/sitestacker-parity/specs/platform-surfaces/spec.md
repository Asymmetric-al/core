# Delta for Platform Surfaces

## MODIFIED Requirements

### Requirement: Outbound Communications Are A Governed Platform Channel

Outbound communications — email today, additional channels only when explicitly
adopted — SHALL be treated as a governed channel of the connected platform
rather than as a fifth surface. In-product notifications SHALL be role-safe
attention projections inside the existing surfaces, not a separate source of
business truth, task state, or communication history.

Communications that reach donors, missionaries, staff, or the public MUST use
shared product language, honest states, and broad but contract-bounded
tenant-controlled content and presentation. They MUST reflect the same
producer-owned truth and authorization as the surfaces they reference.
Tenant control MUST NOT remove or fabricate required legal, security, payment,
receipt, consent, protected-action, recipient, or current-source meaning.

Every platform/system-generated message on an enabled catalog channel—including
email, in-product, and separately activated future SMS—MUST use the code-governed
system-message catalog and, for external delivery, the one Phase 6
recipient-specific communication seam. Human-authored support replies,
newsletters, campaigns, and missionary personal messages remain outside the
system-message catalog under their owning phases, but their external delivery
MUST still use the Phase 6 seam.
Eve Discord alerts remain a bounded operational-awareness channel under Eve
policy, destination, provider, and audit ownership. They MUST NOT appear as a
tenant System Messages channel, a Phase 6 email outcome, or durable
communication truth. The current manifest generation contains no Eve email key,
so every Eve email request is rejected before intent creation. Any later Eve
email uses a meaning-specific platform-scoped fixed Phase 17 contract and the
Phase 6 recipient-specific Resend delivery spine only after its platform proof
pack passes; no generic catch-all key is allowed. Phase 17 owns contract
publication, compiler validation, and configuration proof; Phase 6 owns
recipient resolution, runtime preparation, provider submission, and history.
That spine MUST propagate one explicit tenant/platform owner arc: tenant mail
uses tenant Party/contact/publication/connection authority, while platform mail
uses an exact revisioned verified platform-owner authority and service-only Asym
publication/connection with every tenant field null. Tenant roles cannot view or
mutate platform execution/history, and neither a caller nor provider payload can
choose scope.
Phase 17 MUST govern immutable publication, deterministic whole-message
resolution, typed facts, presentation dependencies, bounded Delivery Plans,
delivery identity, and evidence/recovery without creating a second workflow
engine, provider log, sent-mail archive, or business-record owner.

#### Scenario: An outbound email would diverge from surface truth

- GIVEN an outbound communication describes gift, support, account, task, or
  other producer-owned state
- WHEN it is composed or sent
- THEN it reflects the same operational truth and role-safe projection the
  platform surfaces show
- AND it does not soften, overstate, contradict, or fabricate the real state for copy

#### Scenario: A tenant customizes a system message

- GIVEN a Live message contract permits tenant control over surrounding copy,
  locale, branding, layout, or optional delivery choices
- WHEN authorized staff publishes a compatible immutable configuration
- THEN future eligible messages use that configuration through the governed resolver
- AND the tenant cannot alter source truth, recipients, protected actions,
  consent, permissions, or contract-required meaning

#### Scenario: A new outbound channel is proposed

- GIVEN a producer wants to add a channel that the platform has not explicitly enabled
- WHEN the contract or tenant configuration references that channel
- THEN the channel remains non-executable until its own transport, consent,
  safety, operational, and Phase 6 integration contract is adopted
- AND the existence of catalog vocabulary alone does not enable delivery
