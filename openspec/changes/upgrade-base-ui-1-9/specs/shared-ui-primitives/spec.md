## ADDED Requirements

### Requirement: Base UI 1.9 release compatibility is qualified

Core's direct first-party Base UI dependencies SHALL use exact published 1.9.0 with an agreeing lockfile. The release upgrade SHALL preserve existing shared control and consumer contracts, including support for readonly multiple-value inputs through generic Select and Combobox wrappers, and SHALL account for release-sensitive popup lifecycle and highlight-event changes where used.

#### Scenario: A first-party workspace consumes the upgraded primitives

- **WHEN** a first-party workspace installs and consumes Base UI
- **THEN** all direct declarations and resolved dependencies agree on 1.9.0
- **AND** applicable shared-wrapper and consumer compatibility checks pass

### Requirement: Shared dropdown menus expose preview filtering composition

The shared dropdown-menu module SHALL expose FilterProvider, Input, List, Clear, and Empty parts using Base UI preview filtering behavior and Core's existing base-maia semantic styles. Filtering compositions SHALL preserve supported primitive props, refs, render/state callbacks, keyboard navigation, highlighted item styling, query clearing, and accessible empty states. Existing ordinary menu compositions SHALL remain supported.

#### Scenario: A consumer filters and selects a menu item

- **WHEN** a user types in a filterable dropdown input and navigates the visible list with the keyboard
- **THEN** Base UI coordinates input and item navigation and exposes the highlighted item's state
- **AND** the matching shared item visibly reflects its highlighted state
- **AND** activation invokes the selected item's existing callback

#### Scenario: Filtering produces no items

- **WHEN** no menu items match the query
- **THEN** the shared empty part provides an accessible empty state
- **AND** clearing or closing the menu can reset the query without activating an item

### Requirement: Email Studio merge-tag filtering retains registry semantics

Email Studio's merge-tag menu SHALL use the shared preview filtering composition with a controlled query and consumer-owned filtering. A trimmed, case-insensitive query SHALL match a registry definition when its key, label, OR category contains the query. Selected items SHALL invoke `onInsert` with their exact registry key once. The menu SHALL retain accessible search naming, semantic item grouping, disabled-trigger behavior, and focus restoration.

#### Scenario: A query matches a key, label, or category

- **WHEN** a user searches for text occurring in any one of a merge tag's key, label, or category
- **THEN** that tag remains selectable in the visible list
- **AND** matching is insensitive to case and surrounding query whitespace
- **AND** selection inserts its key without substituting its label or category

#### Scenario: A user selects a filtered tag using the keyboard

- **WHEN** a user searches, moves the highlight to a matching tag, and presses Enter
- **THEN** the menu invokes `onInsert` once with that tag's key
- **AND** the menu closes and restores focus to its trigger

#### Scenario: A user clears or dismisses a merge-tag search

- **WHEN** a user clears the query or dismisses the menu with Escape
- **THEN** no merge tag is inserted
- **AND** the next empty-query view offers the full registry again
- **AND** Escape restores focus to the trigger

#### Scenario: Merge-tag insertion is disabled

- **WHEN** the menu receives its disabled state
- **THEN** its trigger does not open the menu
- **AND** no search or insertion action is available through that trigger

### Requirement: Base UI 1.9 upgrade evidence states its scope

Release verification SHALL identify the official release/API evidence, applicable source migrations, checks performed, and unresolved verification limits. It SHALL distinguish this focused release upgrade from the broader Base UI documentation compliance review.

#### Scenario: The upgrade is reported as verified

- **WHEN** the release upgrade is reported as verified
- **THEN** the record identifies dependency, shared-menu, real-consumer, and applicable repository check results
- **AND** unrun physical-device, whole-product, or provider qualification remains explicitly unclaimed
