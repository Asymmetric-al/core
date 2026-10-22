## MODIFIED Requirements

### Requirement: Deployment is an explicit development checkpoint

Vercel Git deployments SHALL be disabled for develop and enabled for production.
Explicit preview QA SHALL retain the same-repository, non-draft, label, app,
team and Preview-target safeguards. Builds SHALL run on the provider from the
exact API-selected PR SHA and branch so application Secrets remain with the
provider. READY qualification MUST verify project, repository, SHA, branch and
Preview target. Automatic development deployment policy SHALL remain unchanged.

#### Scenario: A PR merges into develop

- **WHEN** develop receives a merge
- **THEN** Vercel does not automatically deploy it and development URLs keep their last deployment

#### Scenario: A preview is explicitly requested

- **WHEN** an eligible same-repository non-draft develop PR receives an explicit QA request
- **THEN** affected surfaces are built on the provider at the approved PR SHA and branch
- **AND** application Secrets are not pulled into the GitHub runner or diagnostic artifacts
- **AND** READY acceptance verifies the returned project, repository, branch, SHA and Preview target

#### Scenario: A hosted build cannot finish within its bounded wait

- **WHEN** preview delivery times out or loses a required status read
- **THEN** it cancels only a deployment whose ownership has been verified
- **AND** it fails qualification if ownership or cleanup cannot be confirmed

#### Scenario: The last commit contains only qualification changes

- **WHEN** product inputs changed since the last successful deployment on the project and branch
- **THEN** the ignore decision includes those changes even if the final commit contains only documentation
- **AND** missing or unusable previous-deployment history requires building
