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

#### Scenario: Dialog content exceeds a short viewport

- **WHEN** a consumer selects the shared dialog's optional scrolling API
- **THEN** the implementation bounds the popup by the dynamic viewport and
  existing spacing scale, and its content and actions remain keyboard reachable
- **AND** the default dialog API and Base UI focus and dismissal behavior remain
  intact
- **AND** ordinary consumer height and overflow overrides remain rejected

#### Scenario: A closing popup's animation is cancelled

- **WHEN** an exit animation is cancelled and no replacement animation remains
- **THEN** the popup, backdrop and portal finish unmounting and focus returns
  according to the existing Base UI contract
- **AND** a real replacement animation is allowed to finish before unmounting
- **AND** normal and reduced-motion dismissal remain operational without
  removing the design system's motion to make verification pass

#### Scenario: A cleaned-up form uses shared field components

- **WHEN** a shared text, number, textarea, select or switch field renders a label
- **THEN** that label names its actual control, including a caller-supplied ID
- **AND** visible validation errors and descriptions resolve through the control's
  accessibility relationships and resolved errors are removed
- **AND** invalid-state labels, typed values and error messages remain readable
  in both themes, with an error accent that does not depend on low-contrast text
- **AND** a select displays its selected option label before its popup first opens
- **AND** dialog forms retain reachable controls and named pending actions on
  short viewports, without changing their existing submission semantics

#### Scenario: A cleaned-up task surface uses shared controls

- **WHEN** responsive table controls, tabs or the due-date calendar are used
- **THEN** the page-size and icon-only actions retain accessible names
- **AND** inactive and active tab labels remain readable in both themes after
  their state transitions settle
- **AND** the due-date calendar opens the selected month and can shift within a
  short viewport so its last row stays reachable
- **AND** shared popover positioning keeps its existing defaults unless the
  caller explicitly chooses the supported collision-avoidance option

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
The authorized completion phase MUST retire all accepted bulk legacy debt
through verified UI corrections. Permanent exceptions MUST remain justified
by implementation semantics and fixtures, not by the number of findings.

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

#### Scenario: The complete setup and legacy cleanup are accepted

- **WHEN** completion is claimed for the 2026-09-22 scope
- **THEN** the full configured raw scan has zero shadcn findings and no
  ordinary lint warnings, and the bulk suppression inventory is empty
- **AND** substantive UI changes have appropriate behavioral and rendered
  verification across their affected surfaces
- **AND** no broad exception, disabled surface or opaque style relocation
  substitutes for fixing a verified violation

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
