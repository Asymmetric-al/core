# eve-email-discord-notifications Specification

## Purpose

Govern accountable Eve email and Discord notification delivery through qualified server-side channels, durable claims, verified scope, and existing pause and policy controls.

## Requirements

### Requirement: Every Notification Starts From A Safe Typed Envelope

Eve MUST normalize a governed source event into a typed notification envelope containing stable event and notification ids, event type, severity, safe source/target references, occurred time, safe decision summary, explicitly allowed detail fields, policy/redaction versions, dedupe key, intended channel class, and expiry.

Every clause in `openspec/contracts/eve-email-discord-notifications.md#contract-7e4a26799e80712133a9` MUST apply without exception.

#### Scenario: A monitor finding requests notification

- **GIVEN** #435 emits a current governed finding eligible for external notification
- **WHEN** #436 builds the envelope
- **THEN** it includes only typed safe fields and evidence references allowed by policy
- **AND** the monitor's raw payload is not forwarded to a channel

#### Scenario: The source contains an unknown field

- **GIVEN** a source event includes content outside the envelope allowlist
- **WHEN** envelope validation runs
- **THEN** the unknown content is excluded or the notification is denied
- **AND** uncertainty never defaults to external disclosure

### Requirement: V1 Email Goes Only To Configured Platform Owners

Email destinations MUST resolve only from enabled app-owned platform-owner notification records whose current identity and permission state is valid.

Every clause in `openspec/contracts/eve-email-discord-notifications.md#contract-fbe307c965d7eef68c5e` MUST apply without exception.

#### Scenario: A platform-owner notification is eligible

- **GIVEN** an enabled verified platform owner is configured for the event class
- **WHEN** policy permits an email delivery
- **THEN** the recipient resolves from app-owned configuration
- **AND** the durable message contains the safe summary and permitted references only

#### Scenario: Event content supplies an address

- **GIVEN** a prompt, finding, issue, or tool output includes a different email address
- **WHEN** destination resolution runs
- **THEN** the supplied address is ignored and cannot become a recipient
- **AND** no message is sent unless a valid configured platform-owner destination exists

### Requirement: Discord Is Urgent And Rich Only After Safe-Content Policy

Discord MUST receive only events that meet app-owned urgency/severity routing policy and MUST resolve only an enabled app-owned operational destination.

Every clause in `openspec/contracts/eve-email-discord-notifications.md#contract-ee53334be56dfa02432d` MUST apply without exception.

#### Scenario: An urgent safe alert is sent minimally

- **GIVEN** an urgent event is eligible for Discord but no rich fields are approved
- **WHEN** the message is rendered
- **THEN** it contains only event class, severity, safe summary, time, and permitted reference
- **AND** operational awareness does not depend on exposing raw detail

#### Scenario: A rich detail field passes policy

- **GIVEN** a configured rich field is allowlisted and its redacted value passes deterministic safety checks
- **WHEN** an urgent Discord message is rendered
- **THEN** that field may be included with the policy/redaction version recorded
- **AND** all other unapproved fields remain omitted

#### Scenario: A model says sensitive detail is safe

- **GIVEN** a model recommends including a raw log, donor/payment detail, or credential-like value
- **WHEN** deterministic content policy evaluates the field
- **THEN** the field is denied regardless of the model recommendation
- **AND** the denial is audited safely

### Requirement: Sensitive Material Never Enters External Notification Content

Email and Discord content MUST exclude secrets, credentials, environment values, service-role keys, raw production records, donor/payment data, unapproved identity/tenant data, raw logs, unredacted replay/debug artifacts, hidden reasoning, and arbitrary model/tool output.

Every clause in `openspec/contracts/eve-email-discord-notifications.md#contract-5ddc2fea00291b11b913` MUST apply without exception.

#### Scenario: A safe summary links to an unsafe URL

- **GIVEN** a notification contains a URL with a credential or sensitive query parameter
- **WHEN** URL policy runs before rendering
- **THEN** the URL is removed or replaced with an approved safe internal route
- **AND** the unsafe URL is never submitted to the provider

#### Scenario: A replay artifact is referenced

- **GIVEN** the source event relates to a #424 replay/debug artifact
- **WHEN** notification content is built
- **THEN** it may include only a permitted safe metadata/reference summary
- **AND** it never embeds the unredacted artifact or bypasses its access controls

### Requirement: Notification Delivery Is Deduplicated, Idempotent, Bounded, And Pausable

Every notification MUST use a stable dedupe key and lifecycle state.

Every clause in `openspec/contracts/eve-email-discord-notifications.md#contract-bf1d5e6bc9ff031e9175` MUST apply without exception.

#### Scenario: A duplicate alert is observed

- **GIVEN** the same event class, target, severity band, and channel occur inside the dedupe window
- **WHEN** delivery is considered
- **THEN** a duplicate external message is suppressed according to policy
- **AND** the suppression links to the existing lifecycle and is audited

#### Scenario: Pause begins before a retry

- **GIVEN** a provider attempt failed retryably but notification or global pause becomes active
- **WHEN** the retry is due
- **THEN** the retry does not execute
- **AND** resume requires the existing authorized control path and current policy

### Requirement: Notification Decisions And Outcomes Are Audited And Retained By Existing Owners

The #419 audit boundary MUST record the explicit source initiator/trigger, #426-verified service delivery actor, event class, policy/redaction versions, severity, dedupe outcome, channel and destination class, attempt identity, provider response class, and delivery result without storing credentials or unsafe payloads.

Every clause in `openspec/contracts/eve-email-discord-notifications.md#contract-59edd140c3fb2323c546` MUST apply without exception.

#### Scenario: Source content claims a different actor or tenant

- **GIVEN** an event or generated field supplies an actor, user, or tenant different from verified context
- **WHEN** notification generation or delivery begins
- **THEN** #426-derived service identity and scope remain authoritative and the supplied values are ignored
- **AND** audit links the real source initiator/trigger to the verified delivery actor without cross-scope access

#### Scenario: Provider delivery fails terminally

- **GIVEN** bounded retries are exhausted or the provider returns a terminal result
- **WHEN** the lifecycle closes
- **THEN** the safe response class and terminal outcome are audited and visible in Mission Control
- **AND** raw provider payloads, credentials, and unsafe content are not retained

### Requirement: This Change Grants No Uncontrolled Delivery Or Runtime Authority

Delivery MUST remain behind disabled and paused app-owned channel configuration and the existing verified server-side delivery and governance boundaries.

Every clause in `openspec/contracts/eve-email-discord-notifications.md#contract-7f376dc6968e5e37849d` MUST apply without exception.

#### Scenario: The package is reviewed for scope

- **GIVEN** this change is under review
- **WHEN** repository effects are inspected
- **THEN** durable schema, runtime, provider boundaries, controls, tests, and documentation are present
- **AND** no external message can be sent until separately configured channels and existing governance gates allow it
