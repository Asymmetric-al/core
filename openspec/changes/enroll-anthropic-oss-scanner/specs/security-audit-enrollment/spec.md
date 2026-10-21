## ADDED Requirements

### Requirement: Reproducible Isolated Audit Environment

Core SHALL provide its complete source, development dependencies, three app builds,
and explicit service/test commands in a scanner-compatible image. Audit commands
MUST exclude live credentials and preserve existing product security boundaries.

#### Scenario: An investigator starts the offline image

- **WHEN** the investigator invokes the documented helpers without networking
- **THEN** local migrations, synthetic fixtures, and supported tests are available
- **AND** unavailable hosted services are identified as limits rather than bypassed

### Requirement: Separate Security Evidence From Demonstration

Normal audit commands MUST retain authorization and environment validation.
Demonstration bypasses SHALL require an explicit command profile. Real database
enforcement, mocked provider tests, and browser demonstrations MUST be described separately.

#### Scenario: A demonstration test passes

- **WHEN** a test uses synthetic authentication or mocked provider responses
- **THEN** its result is not described as proof of full Supabase Auth or RLS enforcement
- **AND** supported SQL enforcement checks run under actual nonprivileged database roles

### Requirement: Truthful Enrollment And Private Findings

Maintainers SHALL use the owner-designated contact, preserve private triage, and
record preparation, submission, acceptance, service build, scan, and receipt separately.
Required contributor signatures MUST come from the authorized human.

#### Scenario: An application is submitted but service evidence is absent

- **WHEN** the enrollment PR is open or eligibility is unresolved
- **THEN** the work item records the actual external dependency and next action
- **AND** scanning and report delivery are not claimed without evidence
