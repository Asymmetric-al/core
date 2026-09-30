## ADDED Requirements

### Requirement: Workspace Verification Respects Package Export Boundaries

Unit-test workspace pinning MUST anchor imports to the current checkout while
preserving the installed resolver's declared export conditions, wildcard
mapping and private-subpath denials. Missing declared exports MUST NOT fall
through to private files or another checkout. Legacy filesystem lookup MAY
remain for packages without an exports field.

#### Scenario: A private source file exists behind an explicit export map

- GIVEN a workspace package exports a public entry but contains a private file
- WHEN a unit-test import requests the private subpath
- THEN resolution fails according to the package boundary

#### Scenario: A package declares conditional and wildcard exports

- GIVEN a workspace package maps its import condition and wildcard subpaths
- WHEN the unit-test resolver pins that package to the current checkout
- THEN the installed Vite resolver selects the declared runtime targets
