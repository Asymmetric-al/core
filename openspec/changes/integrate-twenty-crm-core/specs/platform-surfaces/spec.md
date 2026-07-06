# Delta for Platform Surfaces And User Experience Intent

> **RETIRED (2026-07-06, ADR-0001)** — this change is withdrawn; see the
> banner in [proposal.md](../../proposal.md). Preserved unedited as historical
> record.

## ADDED Requirements

### Requirement: Twenty-Backed CRM Remains A Native Mission Control Experience

When Twenty backs CRM data, Mission Control MUST remain the primary staff CRM
experience. Staff users SHOULD work through native Asym screens, tables,
actions, reports, and audit-aware flows rather than through raw Twenty UI as
the normal operating surface.

Raw Twenty UI MAY be used for non-production proof, operational diagnostics, or
carefully controlled admin escape hatches, but it MUST NOT become the default
Mission Control CRM product experience without a later explicit OpenSpec
change.

Donor, missionary, and public surfaces MAY receive role-scoped CRM projections
only after later phase work defines those slices. They MUST NOT expose
staff-depth CRM controls or raw Twenty UI.

Cross-surface projections MUST run in shadow mode before any donor,
missionary, CMS, event, public, or reporting surface depends on them. Mission
Control MUST provide staff visibility into projection drift, parity, duplicate
counts, source ownership, and rollback state before production cutover.

During production cutover, staff-facing readiness, support, and rollback
controls MUST remain native Asym operational surfaces or runbooks. Raw Twenty
UI MAY help diagnose vendor state, but it MUST NOT become the staff support
path or the source of product truth for Asym permissions, support ownership,
or rollback state.

#### Scenario: Staff opens CRM after a Twenty-backed domain cutover

- GIVEN a CRM domain has been cut over to Twenty as backing infrastructure
- WHEN a staff user opens the CRM area in Mission Control
- THEN they see a native Asym staff operations experience
- AND the Twenty dependency stays behind the Asym CRM contract

#### Scenario: Staff uses the first native Twenty-backed notes domain

- GIVEN the Notes CRM domain is cut over as the first Phase 04 Mission Control
  domain
- WHEN a staff user opens `/crm/notes`
- THEN the user sees native Asym table and note-create controls
- AND reads and writes go through `packages/api`
- AND note writes create command audit, outbound sync, replay, and rollback
  state

#### Scenario: Staff searches expanded CRM relationship domains

- GIVEN churches, organizations, households, pledges as relationship
  commitments, and relationship activity are available through Phase 05
- WHEN a staff user opens `/crm/relationships`
- THEN the user sees native Asym relationship search and reporting controls
- AND reads go through `packages/api`
- AND reports identify CRM, finance, care, and auth source-system ownership
- AND the surface does not expose donor, missionary, public, finance, care, CMS,
  payment, or raw Twenty controls

#### Scenario: A narrow surface needs CRM context

- GIVEN a donor, missionary, or public flow needs limited CRM context
- WHEN the platform exposes that context
- THEN it exposes only the role-appropriate Asym projection
- AND it does not leak raw Twenty UI, staff controls, or vendor credentials into
  the narrow surface

#### Scenario: Staff reviews cross-surface projection shadow mode

- GIVEN donor, missionary, CMS, event, and reporting projection contracts exist
- WHEN a staff user opens `/crm/projections`
- THEN Mission Control shows native Asym projection health
- AND each row identifies role scope, source ownership, drift, parity,
  duplicate counts, and rollback state
- AND the target surfaces continue using their existing Asym read models until
  a later production cutover phase

#### Scenario: Staff supports a production CRM domain

- GIVEN a Phase 07 domain is production-live
- WHEN a staff operator investigates support, drift, queue, duplicate, or
  rollback state for that domain
- THEN they use native Asym evidence, sync logs, projection state, command
  logs, and the CRM cutover runbook
- AND raw Twenty UI remains diagnostic only
- AND donor, missionary, CMS, public, finance, care, payment, receipt,
  statement, refund, reconciliation, automation, and auth authority stay in
  their Asym-owned surfaces
