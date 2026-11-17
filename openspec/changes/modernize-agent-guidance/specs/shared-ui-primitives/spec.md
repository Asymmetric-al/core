## MODIFIED Requirements

### Requirement: UI SDK complements Base UI through shared wrappers

Base UI and UI SDK SHALL both be approved for shared components, held to one
base-maia and accessibility standard. Shared work SHALL start from existing
shared components. UI SDK MAY be chosen for a concrete benefit where a Base UI
equivalent exists. It SHALL be declared only by `packages/ui`, pinned to one
exact release, and reach applications only through narrow Maia-styled
`@asym/ui` wrappers without its optional stylesheet. Its injected styles SHALL
rank below every Tailwind layer.

#### Scenario: A shared component already provides the control

- **WHEN** a dashboard needs a control that an existing shared component
  provides
- **THEN** it reuses or improves that shared component
- **AND** UI SDK shipping an equivalent is not by itself a reason to replace it

#### Scenario: UI SDK offers a concrete benefit

- **WHEN** UI SDK would improve a shared control's interaction, accessibility,
  implementation simplicity, maintainability or demonstrated performance
- **THEN** UI SDK MAY implement it although a Base UI equivalent exists
- **AND** the change description states the benefit
- **AND** no formal decision record or per-control approval is required

#### Scenario: Components from both libraries are composed

- **WHEN** a UI SDK-backed control is used with a Base UI-backed one, such as
  inside a dialog
- **THEN** each control keeps one library for its internal behavior
- **AND** focus, naming, dismissal and overlay behavior across them are
  verified

#### Scenario: A dashboard uses a UI SDK-backed control

- **WHEN** Mission Control, the missionary workspace or the donor portal renders
  a UI SDK-backed control
- **THEN** it imports the `@asym/ui` wrapper
- **AND** no application manifest or source declares or imports a UI SDK
  package
- **AND** every dashboard shares one SDK runtime and one React runtime

#### Scenario: A UI SDK-backed control renders on the server and hydrates

- **WHEN** the shared wrapper renders on the server and hydrates in a browser
- **THEN** hydration reuses the server markup without a mismatch
- **AND** the control is named, keeps one tab stop, responds to its keys and
  submits its form value
- **AND** Maia tokens give it a visible focus ring and at least 3:1 graphical
  contrast in light and dark themes

#### Scenario: The SDK injects runtime styles

- **WHEN** UI SDK adds its runtime rules to a page
- **THEN** they live in the `ui-sdk` cascade layer
- **AND** that layer ranks below the theme, base, components and utilities
  layers in every application

## ADDED Requirements

### Requirement: Base UI is preferred over Radix

Core SHALL prefer Base UI over Radix for shared components. Registry output,
generated components and tutorials SHALL be checked for their actual
dependencies before acceptance. A narrow Radix-specific need MAY be accepted
through normal review. Existing integrations, transitive packages and
historical records SHALL NOT be treated as violations.

#### Scenario: A registry item or example depends on Radix

- **WHEN** a registry item, generated component or tutorial would add a Radix
  dependency
- **THEN** the Base UI build or equivalent is used instead
- **AND** a Radix dependency is added only for a narrow need accepted in review

#### Scenario: Radix arrives through an existing integration

- **WHEN** a specialist package brings Radix transitively or an existing
  integration already uses it
- **THEN** it is not a violation and no removal work is required
