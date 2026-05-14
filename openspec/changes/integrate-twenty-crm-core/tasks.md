## 1. Phase 00 Strategy Package

- [x] 1.1 Create the `integrate-twenty-crm-core` OpenSpec change package
- [x] 1.2 Define Twenty as an internal CRM subsystem behind Asym server
      boundaries
- [x] 1.3 Document that Supabase Auth remains the platform auth authority
- [x] 1.4 Document that Mission Control remains the staff operations shell
- [x] 1.5 Document that finance, care, CMS, public, donor, and missionary
      authority do not move to Twenty

## 2. Ownership And Boundary Matrix

- [x] 2.1 Add an ownership matrix covering CRM, CMS, finance, care, auth,
      public surfaces, donor surfaces, missionary surfaces, sync, and secrets
- [x] 2.2 Include system of record, write authority, conflict winner, sync
      direction, and rollback owner for each matrix row
- [x] 2.3 Record the first safe Phase 04 cutover recommendation

## 3. Twenty Infrastructure Proof Plan

- [x] 3.1 Document the non-production topology for Twenty server, worker, Redis,
      storage, and Postgres
- [x] 3.2 Document API, Metadata API or app tooling, webhook, worker restart,
      storage, and backup/restore smoke tests
- [x] 3.3 Document evidence artifact requirements and stop criteria

## 4. Database Decision Path

- [x] 4.1 Record the Phase 00 decision to use dedicated Twenty Postgres by
      default
- [x] 4.2 Document criteria required to reopen a Supabase-hosted Postgres path

## 5. Proposed Spec Deltas

- [x] 5.1 Add proposed `platform-boundaries` requirements for Twenty as a
      subsystem and dedicated CRM backing-store isolation
- [x] 5.2 Add proposed `platform-surfaces` requirement for native Mission
      Control CRM experience

## 6. Phase Guardrails

- [x] 6.1 Confirm Phase 00 did not include production integration code,
      migrations, environment schema, app routes, or UI changes
- [x] 6.2 Confirm Phase 00 did not start Phase 01 implementation

## 7. Phase 02 Identity, Schema, And Mapping

- [x] 7.1 Define identity concepts and keep Supabase auth users, profiles,
      memberships, CRM people, donors, missionaries, CMS entities, Stripe
      customers, funds/projects, pledges, and money records distinct
- [x] 7.2 Add `crm_record_links`, `crm_merge_candidates`, and
      `crm_projection_state` schema with tenant scope and staff RLS
- [x] 7.3 Document the Twenty object model for people, companies, churches,
      households, tasks, notes, activity, and relationship commitments
- [x] 7.4 Choose Metadata API as the production schema management path and keep
      Twenty app manifests as proof-only unless a later change accepts them
- [x] 7.5 Implement deterministic duplicate scoring rules where low-confidence
      matches become review candidates rather than automatic merges
- [x] 7.6 Implement pure donor and pledge mapping transforms with unit tests
- [x] 7.7 Confirm no production import, webhook/eventing, or Phase 03 sync work
      is started

## 8. Phase 03 Sync, Eventing, And Replay

- [x] 8.1 Add signed Twenty webhook ingress that reads the raw body and rejects
      missing, stale, or invalid signatures
- [x] 8.2 Store accepted webhook events durably before processing and make
      duplicate deliveries idempotent
- [x] 8.3 Add per-domain sync pause settings for inbound, outbound, and replay
      paths
- [x] 8.4 Add outbound sync jobs with idempotency keys, retries, and
      dead-letter status
- [x] 8.5 Add replay helpers for inbound events and outbound jobs that do not
      duplicate durable records
- [x] 8.6 Add reconciliation detection for orphan links, stale projections,
      stalled jobs, duplicate candidates, and failed webhooks
- [x] 8.7 Keep Phase 03 non-production and confirm no Phase 04 user-facing CRM
      cutover is started

## 9. Phase 04 First Domain Mission Control

- [x] 9.1 Select Notes as the first safe native Mission Control CRM domain
- [x] 9.2 Add `/crm/notes` as a native Mission Control route without exposing
      raw Twenty UI
- [x] 9.3 Keep `/api/admin/crm/notes` as a thin app route that re-exports the
      `@asym/api` route handlers
- [x] 9.4 Enforce staff auth, tenant scope, and `crm.note.read` /
      `crm.note.create` authorization server-side
- [x] 9.5 Keep Twenty reads behind `packages/api` and return a safe
      not-configured mode when server-only credentials are absent
- [x] 9.6 Include search, sort, cursor, and limit state in the admin notes query
      key and use stable note row ids
- [x] 9.7 Queue note writes through command logging, outbound jobs, sync logs,
      and deterministic idempotency keys
- [x] 9.8 Reuse Phase 03 replay for outbound jobs and preserve durable webhook
      replay behavior
- [x] 9.9 Document rollback by pausing the `notes` sync domain and restoring
      the existing Mission Control CRM path
- [x] 9.10 Confirm Phase 04 does not start Phase 05, people writes, donor,
      missionary, finance, CMS, care, public, or payment authority transfer

## 10. Phase 05 Relationship Expansion

- [x] 10.1 Add `/crm/relationships` as a native Mission Control relationship
      graph, search, and reporting route
- [x] 10.2 Keep `/api/admin/crm/relationships` as a thin app route that
      re-exports the `@asym/api` route handler
- [x] 10.3 Enforce staff auth, tenant scope, and `crm.relationship.read`
      authorization server-side
- [x] 10.4 Normalize people, churches, organizations, households, relationship
      commitments, and relationship activity behind `packages/api`
- [x] 10.5 Deduplicate church-like companies against custom church records
      within the same tenant
- [x] 10.6 Derive deterministic household membership keys from sorted unique
      member ids
- [x] 10.7 Keep pledges as relationship commitments only and exclude payment
      execution, receipt, statement, refund, and reconciliation truth
- [x] 10.8 Exclude care-sensitive activity rows from CRM relationship activity
      reporting
- [x] 10.9 Add tenant-safe CRM search and source-system relationship reporting
- [x] 10.10 Document rollback by hiding `/crm/relationships` and pausing the
      relationship domains without touching finance, care, CMS, auth, donor,
      missionary, public, or payment authority
- [x] 10.11 Confirm Phase 05 does not start Phase 06 cross-surface projections

## 11. Phase 06 Cross-Surface Projections And Shadow Mode

- [x] 11.1 Define role-scoped projection contracts for donor, missionary,
      project/fund, CMS, event, and reporting contexts
- [x] 11.2 Keep donor projections limited to donor-safe CRM context without
      staff CRM depth, payment internals, duplicate controls, or care records
- [x] 11.3 Keep missionary projections limited to assigned-supporter context
      without organization-wide CRM controls
- [x] 11.4 Keep CMS linkage status separate from CMS public content authority,
      publish state, moderation, and release rules
- [x] 11.5 Keep event attendee CRM context scoped to tenant and event-owned
      attendance state
- [x] 11.6 Keep reporting projections explicit that finance, donation ledger,
      receipts, refunds, statements, and reconciliation remain Asym-owned
- [x] 11.7 Store projection state in `crm_projection_state` and make projection
      rows markable for replay without changing user-visible read models
- [x] 11.8 Add Mission Control shadow-mode dashboard at `/crm/projections` with
      drift, parity, duplicate, missing, failed, and conflicting-record
      metrics
- [x] 11.9 Keep `/api/admin/crm/projections` as a thin app route that
      re-exports the `@asym/api` route handler
- [x] 11.10 Document rollback by hiding `/crm/projections` and disabling
      projection names while each target surface keeps its prior Asym read
      model
- [x] 11.11 Confirm Phase 06 does not start Phase 07 production cutover or make
      donor, missionary, CMS, event, or reporting surfaces depend on Twenty

## 12. Phase 07 Production Cutover And Operations

- [x] 12.1 Freeze the Phase 07 production domain catalog and confirm no new CRM
      domains are added during cutover
- [x] 12.2 Document domain-by-domain cutover gates for staging parity,
      monitoring, rollback rehearsal, backup/restore proof, load/rate-limit
      evidence, security review, support owner, rollback owner, and
      CI/OpenSpec validation
- [x] 12.3 Define monitoring coverage for Twenty server, worker, Redis,
      dedicated Postgres, webhooks, queues, projections, rate limits, auth
      denials, and command failures
- [x] 12.4 Add the Twenty CRM operations runbook for outage, replay, outbound
      retry, rate-limit pressure, duplicate merge review, projection drift,
      import failure, rollback, upgrade, restore, and secret rotation
- [x] 12.5 Require dedicated Twenty database backup/restore proof before
      production reads and again after the first production write window
- [x] 12.6 Document the server-only Twenty secret rotation process without
      exposing credentials
- [x] 12.7 Align OpenSpec boundaries and surfaces with domain-gated,
      monitored, reversible production cutover
- [x] 12.8 Document the CRM production cutover release gate in `docs/ci.md`
- [x] 12.9 Confirm Phase 07 does not transfer finance, CMS publish, care, auth,
      payment, receipt, statement, refund, reconciliation, automation, donor
      account, missionary workspace, or public website authority to Twenty
