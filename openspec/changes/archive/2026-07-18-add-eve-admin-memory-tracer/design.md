# Design / ADR — Eve private admin memory tracer bullet

## Context

Eve's PRD makes memory a first-class governance surface: memory **starts as private admin memory** for
communication preferences, project working context, and decisions, **with strict exclusions**
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:434]; memory is
part of the governance data model that Supabase owns
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:408]; and memory
is one of the operational production records Eve may write under policy
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:420]. This change
implements the memory **contract** — the categories, the hard exclusion set,
audited auto-save, full admin control, and a disabled future-tenant schema.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:115]

## Decision

- **Private admin scope, three categories, advisory-only.** Memory starts private-admin-scoped and holds
  preferences, project context, and decisions; it is used as advisory context and never overrides product
  intent, repo rules, OpenSpec, or `AGENTS.md`.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:434]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:116]
- **Hard exclusion set at write time.** Secrets, credentials, payment data, donor/customer PII, private keys,
  one-time codes, and sensitive tenant facts are excluded before storage — a boundary, not a later redaction
  pass — and the exclusion applies equally on the auto-save path.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:123]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:124]
- **Audited auto-save.** Auto-save of allowed memory emits an audit event; the event **shape** is #419's, so
  this change requires emission only and does not re-specify the event.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:441]
- **Full admin control with change history.** View, search, edit, delete, disable, category, scope, and
  change history; disable stops future auto-save without destroying existing entries.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:443]
- **Future-tenant schema, disabled.** The schema is designed for tenant-scoped operational memory, but that
  memory stays off until its categories, retention, deletion, export, and audit rules are explicit — so
  tenant facts are never stored casually.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:437]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:138]
- **Ownership-scoped access; separate retention; no autonomy.** Memory access enforces user + tenant
  ownership; memory retention is controlled separately from run logs; the capability grants no autonomy and
  cannot override #417 protected-area/approval rules.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:431]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:310]

## Boundaries (relation to sibling changes — do not duplicate)

- **vs #418 (governance kernel / release switch):** #418 owns the release-switch + emergency-off **state**
  that decides whether memory is live. #422 owns the memory **contract** (categories, exclusions, control).
  #422 ships disabled behind #418. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:118]
- **vs #419 (audit tracer bullet):** #419 defines the **shape** of the audit event; #422 requires that a
  memory write **emits** one. #422 consumes #419's event, it does not restate it.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:441]
- **vs #424 (retention/replay):** #424 owns run-log/artifact retention lifecycle. **Memory retention is a
  separate control** (US69) and is not activated here.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:310]
- **Tenant operational memory** is out of scope: schema-ready only, disabled until explicit rules exist.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:437]

## Data-boundary alignment (partner-fleet charter)

The hard exclusion set (secrets/credentials/payments/PII/keys/one-time-codes/sensitive-tenant-facts) is the
spec-level expression of the partner fleet's own data-boundary law — donor PII, payments, and secrets never
enter this infrastructure. Encoding it as a write-time MUST-exclude, not a redaction pass, keeps memory from
ever becoming a hidden leak channel.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:123]

## Implementation

- `eve_admin_memory_entries` binds private memory to tenant and owner, with a
  generated full-text search vector and optimistic version.
- `eve_admin_memory_history` records immutable created, updated, and deleted
  snapshots; category settings disable future auto-save without deletion.
- One application classifier rejects every sensitive candidate before an RPC
  and records only exclusion categories. Database checks provide defense in
  depth.
- Service-role-only RPCs make the entry, history, and ADR-0020 audit mutation
  atomic. Browser roles receive no table or function access.
- The admin workspace exposes create, view, search, edit, soft delete,
  category control, auto-save control, and version history.
- `tenant_operational` is schema-representable but rejected by application
  validation and database mutation functions.

The accepted architectural record is
[ADR-0023](../../../../docs/adr/0023-eve-private-admin-memory.md).

## Verification contract

- `openspec validate --strict` passes; `eve-judge --change` PASS; `cite-verify` clean; `qa-gates.sh --change`
  machine gates (0/1/3) PASS. [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Memory tests MUST cover auto-save categories, exclusions, search, edit, delete,
  disable, change history, audit events, and future tenant-scope schema constraints.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:574]
- Ships disabled behind the #418 release switch; final activation is the #437 launch gate. Human (code owner)
  sign-off is required before any PR to `core:develop`.
