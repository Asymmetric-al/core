# Delta for Eve Admin Workspace Shell

## MODIFIED Requirements

### Requirement: Workspace Access And Controls Are Server Role-Gated

Workspace access MUST be checked server-side against verified current-session
role context. Privileged mutations MUST be authorized again in their API
boundaries. Model-policy changes MUST retain the dedicated
`ai.settings.manage` permission. Client visibility MUST NOT be an authorization
mechanism.

#### Scenario: An unauthorized role requests the workspace

- **WHEN** a verified user without an authorized admin role requests `/settings/eve`
- **THEN** the server redirects the user to the no-access surface
- **AND** the Client Component and controls are not rendered as an authority boundary

#### Scenario: A general admin lacks AI settings permission

- **WHEN** the admin attempts a model-policy mutation
- **THEN** the API denies it unless `ai.settings.manage` or super-admin authority is present
- **AND** read access does not imply mutation access
