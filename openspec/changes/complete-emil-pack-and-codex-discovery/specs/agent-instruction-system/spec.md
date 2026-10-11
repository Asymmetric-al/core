# Delta for Agent Instruction System

## ADDED Requirements

### Requirement: Reviewed Emil Refresh Supports Explicit Source Trees

The focused Emil skill refresh SHALL accept an explicitly supplied reviewed
upstream skill directory while retaining transactional publication, Core
overlays, raw upstream content hashes, and canonical source ownership.

#### Scenario: A reviewed upstream directory is supplied

- WHEN a maintainer supplies the reviewed Emil skills directory
- THEN the refresh reads the configured skill trees from that directory
- AND preserves Core overlays and the `emil-prototype` alias
- AND records hashes of raw upstream skill bytes
- AND publishes canonical sources and lock provenance together

#### Scenario: A supplied source is invalid

- WHEN a configured source tree is missing, malformed, or unsafe
- THEN the refresh fails before publication
- AND existing canonical sources and lock provenance remain unchanged

### Requirement: Skill Installation and App Registration Have Separate Evidence

Scoped development guidance SHALL distinguish installed skill files from the
running application's registered catalog and from saved reusable cloud
environment configuration.

#### Scenario: Installed files scan successfully

- WHEN a filesystem or standalone command-line scanner reads installed skills
- THEN that result establishes file availability only
- AND it does not establish visibility in another application's picker

#### Scenario: Picker availability is claimed

- WHEN an agent claims skills are available in the running application's picker
- THEN it verifies the app-facing skill catalog and successful invocation
- AND an empty catalog remains a failed acceptance result

#### Scenario: Rebuild persistence is claimed

- WHEN an agent claims a reusable cloud environment retains a skill setup
- THEN it verifies the saved and applied setup through the supported platform
- AND publishes the setup if that platform requires publication
- AND checks a fresh environment created from that setup
- AND changes to files in an existing task do not establish reusable setup
