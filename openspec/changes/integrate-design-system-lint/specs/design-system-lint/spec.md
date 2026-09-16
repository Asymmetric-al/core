## Purpose

Protect Core's shared visual and component contracts through consistent,
offline lint enforcement while exposing legacy debt and analysis failures.

## ADDED Requirements

### Requirement: Applicable web UI SHALL share one blocking policy

Normal root and workspace lint commands MUST enforce one shared policy in
all first-party web-UI consumers and shared-UI compositions. The policy
MUST preserve existing parsers, architecture restrictions, coverage, and
generated/vendor exclusions. Backend, email, and document renderers MUST
retain their unrelated lint coverage without acquiring web-style rules.

#### Scenario: A developer chooses a supported lint entry point

- **WHEN** the same UI source is linted from the root or its workspace
- **THEN** all six design-system rules make equivalent decisions
- **AND** new files in the applicable source scope receive enforcement
- **AND** normal check, preflight, and existing CI lint gates reach that policy

### Requirement: Enforcement SHALL preserve the Core design system

The policy MUST block consumer overrides of component-owned appearance,
raw colors, unjustified arbitrary values, unnecessary inline styles,
unknown classes, and uninspectable component class expressions.
Existing variants, sizes, semantic tokens, Base UI state/composition,
and runtime class-merging behavior MUST remain authoritative.

#### Scenario: A consumer uses a shared control

- **WHEN** consumer code overrides owned sizing, focus, hover, or press behavior
- **THEN** enforcement rejects the override unless the component's documented
  API explicitly delegates that aspect
- **AND** ordinary placement and allowed composition remain possible

#### Scenario: A primitive or runtime integration requires special behavior

- **WHEN** component authoring, measurement, chart styles, or library-owned
  inline properties require an exception
- **THEN** the exception is scoped to the actual implementation and reason
- **AND** applicable token and class-validity checks remain active
- **AND** shared compositions and first-party editor chrome remain consumers

### Requirement: Analysis health SHALL be verified independently of a clean exit

Acceptance MUST prove actual component resolution, shared theme loading,
and Tailwind-backed class validation in every applicable workspace.
A degraded fallback or failed discovery MUST produce actionable failure
evidence rather than a successful acceptance claim.

#### Scenario: Imports and classes are valid

- **WHEN** deep imports, barrels, renamed imports, aliases, or forwarding
  wrappers reference actual shared components
- **THEN** the compatibility checks prove that those components are recognized
- **AND** unrelated same-name components are not falsely identified

#### Scenario: Theme analysis is broken

- **WHEN** a theme path or import cannot load, or the compiler is unavailable
- **THEN** health verification fails with the affected setup identified
- **AND** an invalid variant on a plain element cannot pass as fallback success

### Requirement: Legacy debt SHALL remain explicit and bounded

Accepted legacy findings MUST be narrowly tracked for the new rules only.
Normal lint and CI MUST NOT enlarge that acceptance. Permanent authoring
contracts MUST remain distinct from temporary debt and preserve repository
tracking requirements for disable comments and configuration exceptions.

#### Scenario: Existing debt is adopted

- **WHEN** legacy findings cannot safely be repaired in the focused change
- **THEN** their acceptance is reviewed, counted, and scoped to existing files
  and rules
- **AND** new unaccepted findings fail normal lint
- **AND** the documented process supports raw diagnostics and deliberate pruning

#### Scenario: Count-based suppressions are used

- **WHEN** a per-file/per-rule count is accepted
- **THEN** guidance states that counts do not identify individual violations
- **AND** reviewers inspect raw findings for affected code to detect replacement
  of old debt by new violations

### Requirement: Shared changes SHALL invalidate relevant consumer checks

Changes to shared components, variants, theme/imports, component configuration,
exports, resolution metadata, policy, suppressions, and relevant dependencies
MUST select and invalidate affected consumer lint results. Default workspace
hashing MUST be preserved.

#### Scenario: A consumer is unchanged after a shared contract changes

- **WHEN** a cached consumer lint result exists and a shared dependency changes
- **THEN** affected checking includes the relevant consumer
- **AND** the consumer is analyzed again and receives any new diagnostic
- **AND** isolated verification demonstrates this without changing user files

### Requirement: Adoption and upgrades SHALL use meaningful verification

The integration MUST use reproducible tooling dependencies, supported
configuration/APIs, real exported configuration in tests, and offline
execution after installation. Acceptance MUST include positive, negative,
exception, baseline, cache, discovery, and command-equivalence evidence,
representative cost measurements, required repository gates, and independent
review when available.

#### Scenario: A release or policy change is adopted

- **WHEN** the package, contracts, or discovery configuration changes
- **THEN** the compatibility suite exercises all six rules and representative
  Core components, variants, helpers, motion/focus, and runtime integrations
- **AND** reviewers inspect exception widening and raw findings separately
- **AND** browser/a11y evidence is obtained for rendered behavior changes
- **AND** unsupported behavior is reported without weakening broad enforcement

#### Scenario: Rollback is needed

- **WHEN** integration causes an unacceptable regression
- **THEN** the documented rollback removes its dependency, policy, wiring,
  suppressions, and matching guidance together
- **AND** existing complementary UI and repository gates remain intact
