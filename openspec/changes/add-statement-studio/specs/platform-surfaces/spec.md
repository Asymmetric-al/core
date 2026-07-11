# Delta for Platform Surfaces

## ADDED Requirements

### Requirement: Mission Control Presents One Statement Studio Product

Mission Control MUST present Statement Studio as the staff-facing product for
template authoring, publication, assignment, generated artifacts, retention,
and audit. It MUST NOT present PDF Studio and Statement Studio as two competing
long-term products.

During migration, a bounded legacy template MAY open in the old editor, but the
UI MUST identify it as legacy and MUST NOT allow new Statement Studio behavior
to depend on Unlayer.

#### Scenario: Staff opens the template library during migration

- WHEN authorized staff open Statement Studio
- THEN they see one product and can distinguish native, legacy, and migration
  state for each template
- AND they are not asked to choose between two competing product surfaces

### Requirement: Portals Expose Role-Scoped Generated Documents

Donor Dashboard and Missionary Dashboard MUST expose generated documents as
role-scoped self-service records. They MUST consume authorized artifacts through
their existing server boundaries and MUST NOT expose staff template,
assignment, retention, batch, or tenant-wide artifact controls.

#### Scenario: A donor views available statements

- WHEN a donor opens statement history
- THEN the portal lists only eligible artifacts addressed to that donor in the
  active tenant
- AND Statement Studio administration remains available only in Mission
  Control
