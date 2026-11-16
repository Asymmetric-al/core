## ADDED Requirements

### Requirement: Next.js Fallback Docs Mirror The Installed Release

The committed `.next-docs/` fallback SHALL be an exact mirror of the
documentation bundled with the installed `next` package. Regeneration MUST use
the installed package and MUST NOT depend on a moving release tag. Repository
verification MUST fail when the fallback and the installed docs differ.

#### Scenario: The Next.js version changes

- **WHEN** a change moves the installed `next` version
- **THEN** the fallback is regenerated from the installed package in the same
  change
- **AND** unit verification fails until the fallback matches

#### Scenario: An agent works before dependencies are installed

- **WHEN** an agent reads `.next-docs/` because installed docs are unavailable
- **THEN** the pages it reads describe the pinned release

#### Scenario: The fallback is checked

- **WHEN** the mirror script runs without its write option
- **THEN** it reports drift and the command that fixes it
- **AND** it changes no file
