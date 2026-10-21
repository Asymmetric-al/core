# Governed SMS Messaging & Channel Activation

## ADDED Requirements

### Requirement: SMS-W01 Census source contracts, preserve transport-dark generation, adopt exact successor and support profile

The system MUST complete the source-owned outcome: Census source contracts, preserve transport-dark generation, adopt exact successor and support profile.

Every clause in `openspec/contracts/governed-sms.md#contract-efae53f596a3147c6562` MUST apply without exception.

#### Scenario: SMS-AT-01 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-01`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN With only the Phase 17 generation or an unqualified profile, every SMS creation path remains unavailable; existing evidence still reads correctly.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: SMS-AT-02 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-02`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Activating one exact source purpose does not activate another purpose, tenant, sender, country or channel; missing required proof rejects before work exists.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

### Requirement: SMS-W02 Governed account/sender setup, exact registration evidence, credential rotation and visible readiness

The system MUST complete the source-owned outcome: Governed account/sender setup, exact registration evidence, credential rotation and visible readiness.

Every clause in `openspec/contracts/governed-sms.md#contract-d7cae7000cb43e8fd367` MUST apply without exception.

#### Scenario: SMS-AT-03 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-03`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN A real verified setup reaches usable readiness; partial/rejected/stale registration and forged account ownership never do.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: SMS-AT-04 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-04`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Secret rotation and route replacement preserve current scope; copied ciphertext, another tenant's account and revoked credentials fail safely.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: SMS-AT-22 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-22`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN A sender port, reassignment, disconnect or ownership change cannot attach a new correspondent to prior private conversation history.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

### Requirement: SMS-W03 Phone-purpose enrollment, withdrawal, re-consent and current eligibility through existing owners

The system MUST complete the source-owned outcome: Phone-purpose enrollment, withdrawal, re-consent and current eligibility through existing owners.

Every clause in `openspec/contracts/governed-sms.md#contract-3bc1f8b758eda8075894` MUST apply without exception.

#### Scenario: SMS-AT-05 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-05`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Explicit enrollment captures the required disclosure and phone-purpose evidence; a gift, email opt-in, imported number or staff checkbox alone cannot enroll.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: SMS-AT-06 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-06`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Shared, corrected, reassigned and changed phones do not inherit private threads or old consent; ambiguous identity remains a visible unresolved state.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: SMS-AT-07 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-07`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN A do-not-contact change or source eligibility loss between preview and admission prevents the affected send, including a required/urgent-labelled request.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: SMS-AT-08 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-08`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN STOP and reasonable withdrawal suppress before ordinary follow-up, including unresolved Party matching, repeated events and adverse orderings.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: SMS-AT-09 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-09`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN HELP changes no permission; START/provider-unblock without complete fresh applicable evidence cannot resume recurring outreach.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

### Requirement: SMS-W04 Authenticated durable ingress and control-keyword handling, including overload protection

The system MUST complete the source-owned outcome: Authenticated durable ingress and control-keyword handling, including overload protection.

Every clause in `openspec/contracts/governed-sms.md#contract-ebeff6ef4e48e75b2998` MUST apply without exception.

#### Scenario: SMS-AT-10 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-10`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Provider-generated control response is recorded without a duplicate platform response; ordinary acknowledgments cannot loop with another autoresponder.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: SMS-AT-11 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-11`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Real signature validation covers trusted proxy URL construction, all required parameters, JSON variants, tampering, replay and wrong-account routing.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: SMS-AT-20 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-20`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Fault and overload drills retain all durably accepted restrictions and outcomes, enforce fair capacity and expose independently detected outages.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

### Requirement: SMS-W05 Exact prepared text, encoding/segment proof, time-window/deadline and budget preflight

The system MUST complete the source-owned outcome: Exact prepared text, encoding/segment proof, time-window/deadline and budget preflight.

Every clause in `openspec/contracts/governed-sms.md#contract-d257c50567c8915c092d` MUST apply without exception.

#### Scenario: SMS-AT-12 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-12`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Fully personalized text crosses GSM/Unicode/concatenation boundaries correctly; no truncation, protected-link change or hidden encoding rewrite occurs.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: SMS-AT-13 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-13`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Quiet hours, unknown zone, daylight-saving boundaries, source expiration and delayed recovery produce the documented not-before/expired outcomes.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: SMS-AT-14 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-14`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Budget and provider throttling truthfully defer/refuse new optional work without dropping accepted intent or blocking withdrawal ingestion.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

### Requirement: SMS-W06 Phase 6 dispatch, permanent identities, provider evidence and ambiguity recovery

The system MUST complete the source-owned outcome: Phase 6 dispatch, permanent identities, provider evidence and ambiguity recovery.

Every clause in `openspec/contracts/governed-sms.md#contract-f8e807ab710b5bdc7d9a` MUST apply without exception.

#### Scenario: SMS-AT-15 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-15`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Double submit, response loss, concurrent native/Studio requests and replay beyond provider caches preserve one semantic effect identity.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: SMS-AT-16 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-16`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Cancel/withdrawal versus admission has a deterministic boundary; already-submitted work remains truthfully irreversible or uncertain.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: SMS-AT-17 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-17`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Provider acceptance with a lost response, including no stored provider ID, cannot cause a fresh-key retry or automatic route/provider failover.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: SMS-AT-18 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-18`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Late, duplicate and reordered delivery observations do not invent reading or business completion; incompatible evidence requires reconciliation.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

### Requirement: SMS-W07 Qualified source notice through its explicit Phase 17 contract, without workflow dependency

The system MUST complete the source-owned outcome: Qualified source notice through its explicit Phase 17 contract, without workflow dependency.

Every clause in `openspec/contracts/governed-sms.md#contract-f9447e67b09440cfddca` MUST apply without exception.

#### Scenario: SMS-AT-19 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-19`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN One actual source-backed system notice succeeds with optional Workflow Studio absent; existing required email/in-product behavior stays intact.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

### Requirement: SMS-W08 Complete Support Hub inbound, assignment, safe reply and correspondent lifecycle

The system MUST complete the source-owned outcome: Complete Support Hub inbound, assignment, safe reply and correspondent lifecycle.

Every clause in `openspec/contracts/governed-sms.md#contract-d563ce12dbd1106e3f6f` MUST apply without exception.

#### Scenario: SMS-AT-21 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-21`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN An inbound message, assignment, collision-safe staff reply and later response work through the actual Support Hub and one communication history.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: SMS-AT-23 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-23`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Internal notes, raw attachments, sealed-care context and unrelated recipient details cannot escape through SMS, exports, previews or diagnostics.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

### Requirement: SMS-W09 Public keyword-to-giving-link with bounded unknown-correspondent requested-response contract

The system MUST complete the source-owned outcome: Public keyword-to-giving-link with bounded unknown-correspondent requested-response contract.

Every clause in `openspec/contracts/governed-sms.md#contract-c03213392022f59b8973` MUST apply without exception.

#### Scenario: SMS-AT-24 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-24`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Known and unknown keyword requesters receive only a permitted source-coded public giving link; no Party claim, consent enrollment or payment occurs.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: SMS-AT-25 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-25`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN A retired designation, changed route, malicious keyword/URL, repeated request and link scanner cannot misdirect a gift or perform a hidden action.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

### Requirement: SMS-W10 Organization campaign send/schedule/stop and source-labelled outcomes

The system MUST complete the source-owned outcome: Organization campaign send/schedule/stop and source-labelled outcomes.

Every clause in `openspec/contracts/governed-sms.md#contract-bd3f13dcbfff469b1bdd` MUST apply without exception.

#### Scenario: SMS-AT-26 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-26`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN A reviewed campaign sends only currently eligible intended recipients, shows exact exclusions and does not execute twice through native/provider lanes.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: SMS-AT-27 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-27`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Schedule/change/stop and partial campaign failure retain original occurrence identity and truthful per-recipient outcomes without blocking email-only work.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

### Requirement: SMS-W11 Consent-preserving migration, route replacement, privacy disposition and safe restore

The system MUST complete the source-owned outcome: Consent-preserving migration, route replacement, privacy disposition and safe restore.

Every clause in `openspec/contracts/governed-sms.md#contract-4c1d472ca794b3bdbb22` MUST apply without exception.

#### Scenario: SMS-AT-28 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-28`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Import or provider migration retains provenance and restrictions; incomplete legacy evidence remains unconsented rather than silently repaired.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: SMS-AT-29 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-29`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Privacy/retention and backup restore preserve minimal required restriction/effect evidence without resurrecting removed content or repeating messages.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: SMS-AT-30 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-30`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Killing new SMS sends preserves withdrawal, authenticated late-outcome intake, authorized history and recovery; reconnect does not replay old campaigns.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

### Requirement: SMS-W12 All-profile load, accessibility, user pilot, independent outage monitoring and release evidence

The system MUST complete the source-owned outcome: All-profile load, accessibility, user pilot, independent outage monitoring and release evidence.

Every clause in `openspec/contracts/governed-sms.md#contract-1b6faa65b22650945bf6` MUST apply without exception.

#### Scenario: SMS-AT-31 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-31`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Real administrator, campaign author and support agent complete their jobs with keyboard, screen reader and narrow-screen layouts.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: SMS-AT-32 source acceptance

- GIVEN the exact Phase 43 source profile, permission context and source conditions specified for `SMS-AT-32`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN The approved provider/market profile completes all three checkpoints with measured performance/cost, operating runbooks and a representative tenant pilot.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation
