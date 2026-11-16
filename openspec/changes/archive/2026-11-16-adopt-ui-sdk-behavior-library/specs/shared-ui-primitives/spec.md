## ADDED Requirements

### Requirement: UI SDK complements Base UI through shared wrappers

Base UI SHALL remain Core's primitive base. UI SDK MAY supply only interactions
that no existing shared component provides. It SHALL be declared only by
`packages/ui`, pinned to one exact release, and reach applications only through
narrow Maia-styled `@asym/ui` wrappers styled with semantic tokens and without
its optional stylesheet. Its injected styles SHALL rank below every Tailwind
layer.

#### Scenario: A shared component already provides the control

- **WHEN** a dashboard needs a control that Base UI or another existing shared
  component provides
- **THEN** it uses that shared component even though UI SDK ships an
  equivalent

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
