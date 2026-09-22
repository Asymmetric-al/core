## ADDED Requirements

### Requirement: Shared accessible primitive ownership

Core SHALL implement ordinary behavior-heavy product controls through shared Base UI primitives using the existing base-maia design system. Application compositions SHALL preserve accessible names, keyboard selection, focus management, and controlled values. Specialized libraries MAY retain distinct documented responsibilities.

#### Scenario: Keyboard selection in product controls

- **WHEN** a user navigates a product select, radio group, or tab group using the keyboard
- **THEN** shared primitives provide the corresponding keyboard and accessible-state behavior
- **AND** existing selection values and business callbacks remain unchanged

### Requirement: Consistent supported dependency

First-party workspaces importing Base UI SHALL resolve the same vetted exact published version, and SHALL NOT declare unused competing primitive dependencies.

#### Scenario: Upgrade shared primitive behavior

- **WHEN** the Base UI dependency is upgraded
- **THEN** its published release and prerelease availability are checked
- **AND** the manifest and lockfile agree with the selected version
- **AND** shared wrappers and app consumers pass applicable compatibility checks

### Requirement: Popup content covers and overlays the application

Application content SHALL occupy an isolated stacking context separate from body-level popup portals. Modal backdrops SHALL follow supported browser viewport positioning guidance while preserving interaction and dismissal behavior.

#### Scenario: Open a modal over high stacking content

- **WHEN** a modal opens above application content
- **THEN** its body portal remains outside the application's isolated stacking context
- **AND** the backdrop and popup cover and intercept the underlying content
- **AND** closing restores focus to the intended control
