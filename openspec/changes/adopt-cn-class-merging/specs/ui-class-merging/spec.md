## Purpose

Provide one predictable class-composition contract for shared UI and its app
consumers, preserving component overrides and independent visual states.

## ADDED Requirements

### Requirement: Shared class composition remains compatible for consumers

The shared UI package SHALL expose one class-composition function and its input
type through existing public import paths. It MUST combine conditional strings,
nested arrays, and truthy object keys while omitting disabled conditional input.

#### Scenario: A consumer combines conditional class inputs

- **WHEN** a component supplies base classes, nested arrays, conditional values,
  and objects whose keys are classes
- **THEN** the shared helper includes the enabled classes in input order before
  resolving conflicts
- **AND** existing consumers require no import-path or argument-shape migration

### Requirement: Later overrides preserve unrelated utilities and states

The shared helper MUST resolve supported Tailwind conflicts using the later
applicable class while retaining utilities that affect independent properties
or variant contexts. Core's semantic tokens and unknown custom class names
MUST remain usable through the shared helper.

#### Scenario: A consumer overrides a shared component's padding

- **WHEN** base classes contain `px-4 py-2` and a consumer appends `px-8`
- **THEN** the result retains `py-2` and `px-8` and removes `px-4`

#### Scenario: A state-specific utility coexists with its base utility

- **WHEN** a component combines `bg-primary`, `hover:bg-accent`, and
  `data-open:bg-muted`
- **THEN** those independent background states survive together

#### Scenario: Typography size and semantic color are independent

- **WHEN** a component combines `text-sm text-foreground` and appends
  `text-muted-foreground`
- **THEN** `text-sm` survives and the semantic foreground color is overridden

#### Scenario: A custom non-conflicting class accompanies utilities

- **WHEN** a component combines a Core custom class such as `press-feedback`
  with supported Tailwind utilities
- **THEN** the custom class survives without requiring app-local merge logic

### Requirement: Merge changes preserve Core's shared visual contract

Changes to the shared merge implementation MUST retain Core's existing shared
component import paths, exact `base-maia` configuration, Base UI primitives,
semantic CSS tokens, and component variants. Verification MUST exercise
representative Core class combinations and consumer integration; upstream
parity and benchmark claims alone MUST NOT constitute acceptance evidence.

#### Scenario: A merge dependency is replaced

- **WHEN** the shared implementation changes dependencies
- **THEN** existing app consumers continue to use the shared UI entry point
- **AND** focused tests cover conditional inputs, utility overrides, modifiers,
  arbitrary values, and representative shared components
- **AND** validation reports distinguish successful checks from unavailable or
  failing checks without promising universal parity or an unmeasured speedup
