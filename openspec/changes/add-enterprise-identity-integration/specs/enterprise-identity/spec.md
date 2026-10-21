# Enterprise Sign-In & Directory Integration

## ADDED Requirements

### Requirement: EID-W01 Qualify current identity/PDP substrate, reserved seams, exact support matrix and adopted successor

The system MUST complete the source-owned outcome: Qualify current identity/PDP substrate, reserved seams, exact support matrix and adopted successor.

Every clause in `openspec/contracts/enterprise-identity.md#contract-4322b01a89bf74969834` MUST apply without exception.

#### Scenario: EID-AT-01 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-01`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN The Phase 12 reserved generation remains inert for sign-in/provision-up while its qualified active=false safety adapter still works independently.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: EID-AT-02 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-02`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN One adopted enterprise profile cannot activate a different protocol, nested groups, ABAC, tenant provisioning or another tenant's connection.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

### Requirement: EID-W02 Verified connection/trust configuration and nonprivileged end-to-end test setup

The system MUST complete the source-owned outcome: Verified connection/trust configuration and nonprivileged end-to-end test setup.

Every clause in `openspec/contracts/enterprise-identity.md#contract-57387ad5f48760248522` MUST apply without exception.

#### Scenario: EID-AT-03 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-03`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN A real administrator configures and tests the correct tenant/provider; spoofed domains, posted provider IDs and wrong-account control cannot bind.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: EID-AT-04 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-04`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Hostile metadata, private-network URLs, invalid trust, replayed assertions, expired signatures and audience/recipient mismatches fail safely.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: EID-AT-21 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-21`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Certificate rotation, expired metadata and issuer/provider replacement use exact reviewed trust generations; no unrelated tenant is changed.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

### Requirement: EID-W03 Shared application-initiated SAML callback/session path and exact provider/tenant binding

The system MUST complete the source-owned outcome: Shared application-initiated SAML callback/session path and exact provider/tenant binding.

Every clause in `openspec/contracts/enterprise-identity.md#contract-aadc4057bd6b92fcc304` MUST apply without exception.

#### Scenario: EID-AT-05 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-05`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Application-initiated SAML and an IdP bookmark through that path preserve PKCE and the approved redirect without a separate app-local auth client.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: EID-AT-06 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-06`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Verified provider/session evidence binds the correct principal and tenant; user metadata, email domain, role label and array ordering cannot grant access.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: EID-AT-07 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-07`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN A new authenticated but unadmitted identity has no operational permissions; any permitted starter uses the current approved membership command.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: EID-AT-08 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-08`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Required SSO applies across relevant protected app routes and existing sessions; an old password/social token or alternate callback cannot bypass it.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

### Requirement: EID-W04 Reviewed existing-account transition and concurrent login/provisioning identity convergence

The system MUST complete the source-owned outcome: Reviewed existing-account transition and concurrent login/provisioning identity convergence.

Every clause in `openspec/contracts/enterprise-identity.md#contract-4b0c23f8a744370a8688` MUST apply without exception.

#### Scenario: EID-AT-09 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-09`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Existing regular and SSO accounts sharing an email require the approved proof/binding transition; they do not silently merge or union grants.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: EID-AT-10 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-10`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Identity/email succession preserves attribution, protects financial history and suspends/re-attests sensitive grants under the predecessor contract.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: EID-AT-11 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-11`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Concurrent first login, SCIM creation, repeated callback and response loss converge on one source binding without duplicate privileged accounts.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: EID-AT-12 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-12`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Partial external-auth creation before local acceptance remains unentitled and recoverable; an orphaned provider account cannot acquire authority.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

### Requirement: EID-W05 Scoped SCIM protocol, discovery, Users lifecycle, current source mutation and honest errors

The system MUST complete the source-owned outcome: Scoped SCIM protocol, discovery, Users lifecycle, current source mutation and honest errors.

Every clause in `openspec/contracts/enterprise-identity.md#contract-64ac2dfa78f4603c6690` MUST apply without exception.

#### Scenario: EID-AT-13 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-13`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN The real selected IdP completes supported SCIM discovery, lookup, create, update and PATCH cases with correct resource and error semantics.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: EID-AT-14 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-14`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Credential/body/path scope mismatch, cross-tenant external IDs, token replay after rotation and unbounded/hostile filters cannot enumerate or mutate.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: EID-AT-15 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-15`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Null/omitted/removed attributes, case rules, pagination and supported version conditions match the declared profile; unsupported operations never report false success.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

### Requirement: EID-W06 Stable group mappings, reviewed permission impact and source-provenanced membership changes

The system MUST complete the source-owned outcome: Stable group mappings, reviewed permission impact and source-provenanced membership changes.

Every clause in `openspec/contracts/enterprise-identity.md#contract-ea7b1a02866ef652e249` MUST apply without exception.

#### Scenario: EID-AT-16 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-16`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Stable external group IDs map only to approved flat groups; a rename, recycled name, nested group or forged claim cannot expand permissions.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: EID-AT-17 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-17`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Removing a mapping removes its attributable membership effect without erasing unrelated grants; the existing privacy/purpose/entity floors still subtract.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: EID-AT-18 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-18`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Directory changes cannot self-approve clearance, sensitive elevation, named care access or a financial operation through a friendly group label.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

### Requirement: EID-W07 Lifecycle-aware deactivation/reactivation, current epoch/stream denial and unmatched-event recovery

The system MUST complete the source-owned outcome: Lifecycle-aware deactivation/reactivation, current epoch/stream denial and unmatched-event recovery.

Every clause in `openspec/contracts/enterprise-identity.md#contract-6b8ec9f80660328d2028` MUST apply without exception.

#### Scenario: EID-AT-19 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-19`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Received active=false denies applicable tenant assignments within the existing Phase 12 enforcement bound and invalidates protected streams and queued user authority.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: EID-AT-20 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-20`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Deactivate → reactivate → deactivate is processed correctly; duplicate old messages and stale positive updates cannot swallow the second revocation.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: EID-AT-22 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-22`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Unmatched deactivation is durably visible, repairable and fences a later first login/create; valid negative security events are not delayed by optional workflow or campaign limits.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: EID-AT-23 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-23`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN SCIM deletion/deactivation in tenant A does not delete Party/gifts or tenant B authority; any broader provider reauthentication effect is accurately disclosed.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

### Requirement: EID-W08 Optional/required staff enforcement, tested step-up and controlled administrator recovery

The system MUST complete the source-owned outcome: Optional/required staff enforcement, tested step-up and controlled administrator recovery.

Every clause in `openspec/contracts/enterprise-identity.md#contract-a0fd6233c8df7cbd8b4d` MUST apply without exception.

#### Scenario: EID-AT-24 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-24`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Required assurance and step-up are actually proved; SSO, asserted MFA, SMS availability and provider logout cannot substitute for local authorization.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: EID-AT-25 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-25`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN A tested authorized administrator recovery works during IdP failure without a permanent shared bypass or automatic sealed-data access.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: EID-AT-26 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-26`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Last-owner protection and legitimate emergency/deprovisioning follow the approved owner policy; unsafe access is not retained silently for convenience.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

### Requirement: EID-W09 Complete directory reconciliation, operational freshness and safe mapping-change review

The system MUST complete the source-owned outcome: Complete directory reconciliation, operational freshness and safe mapping-change review.

Every clause in `openspec/contracts/enterprise-identity.md#contract-fced6092bd7870c1966e` MUST apply without exception.

#### Scenario: EID-AT-27 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-27`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Incomplete directory snapshots, provider silence, removed scope and upstream deletion quarantine remain visible uncertainty, not mass local deletion.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: EID-AT-28 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-28`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Reviewed mapping changes show exact impact; concurrent native edits or changed authorization invalidate stale plans instead of overwriting current grants.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

### Requirement: EID-W10 Certificate/provider succession, scoped disconnection, privacy and restore controls

The system MUST complete the source-owned outcome: Certificate/provider succession, scoped disconnection, privacy and restore controls.

Every clause in `openspec/contracts/enterprise-identity.md#contract-59e1838dd4055cd91929` MUST apply without exception.

#### Scenario: EID-AT-29 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-29`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Disconnect/reconnect and provider transition fence old positive work, reject newly presented retired credentials, retain accepted safe revocation/recovery and do not automatically enable password fallback.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: EID-AT-30 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-30`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Privacy and backup restore retain required minimal revocation/identity evidence without restoring deleted contents, old tokens or revoked memberships.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

### Requirement: EID-W11 Downstream authority propagation through source tasks, workflows, finance and content

The system MUST complete the source-owned outcome: Downstream authority propagation through source tasks, workflows, finance and content.

Every clause in `openspec/contracts/enterprise-identity.md#contract-549a8ce05b28ab94f6db` MUST apply without exception.

#### Scenario: EID-AT-31 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-31`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN A revoked workflow human owner cannot authorize a queued NHI action; no automation ownership or task responsibility transfers by directory inference.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: EID-AT-32 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-32`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Legitimate organization-owned content appointments follow their source policy; directory changes cannot erase finance/care history or redirect money.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

### Requirement: EID-W12 Certified provider interoperability, accessibility, fault/load tests, user pilot and operating release

The system MUST complete the source-owned outcome: Certified provider interoperability, accessibility, fault/load tests, user pilot and operating release.

Every clause in `openspec/contracts/enterprise-identity.md#contract-3d663eef1694a49cf0dd` MUST apply without exception.

#### Scenario: EID-AT-33 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-33`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN Administrator and staff finish setup, sign-in, denied-access recovery and required migration using keyboard, screen reader and narrow-screen layouts.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation

#### Scenario: EID-AT-34 source acceptance

- GIVEN the exact Phase 44 source profile, permission context and source conditions specified for `EID-AT-34`
- WHEN the corresponding user operation or adverse-condition qualification runs
- THEN All selected Entra/Google sign-in and selected SCIM profiles complete the three checkpoints, production-shaped fault/load tests and documented user pilot.
- AND acceptance is recorded only from the required real source/profile evidence, not from planning or structural validation
