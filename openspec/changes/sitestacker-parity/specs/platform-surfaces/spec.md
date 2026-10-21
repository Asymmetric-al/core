# Delta for Platform Surfaces

## MODIFIED Requirements

### Requirement: Outbound Communications Are A Governed Platform Channel

Outbound communications — email today, additional channels only when explicitly adopted — SHALL be treated as a governed channel of the connected platform rather than as a fifth surface.

Every clause in `openspec/contracts/platform-surfaces.md#contract-1173bcf4c60dab5f6922` MUST apply without exception.

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
