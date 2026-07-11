# Design / ADR — Eve retention and replay artifact tracer bullet

## Context

The PRD requires category-based retention (180-day default), incident/legal holds, and redacted
replay/debug artifacts stored in Supabase Storage with queryable metadata so Postgres stays a query store,
not an artifact bucket. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:299]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:415] The
retention/replay records are part of the governance data model #418 defines at spec level
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:410]; this
change specifies their **lifecycle**.

## Decision

- **Category-based retention, 180-day default, per-category overrides.** Categories MAY set shorter or
  longer windows; larger artifacts MAY expire earlier when their purpose lapses.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:415]
- **A dedicated short category for gateway/model-call telemetry: metadata-only, 14–30 day rolling** — no
  prompt/response bodies. This is _tighter_ than the 180-day default and must be its own category.
  [PARTNER-RESPONSE 2026-07-02]
- **Incident/legal holds override retention** and prevent deletion of affected records until cleared; set
  and clear are recorded human actions. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:307]
- **Artifacts are redacted and stored outside Postgres**: large replay/debug artifacts live in Supabase
  Storage with relational metadata + redacted summaries in Postgres.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:412]
- **Deletion/expiry jobs enforce retention** and the state is queryable/auditable.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:590]
- **Access enforces user + tenant ownership** for replay/debug artifact reads.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:544]

## Boundaries (relation to sibling changes — do not duplicate)

- **vs #418 (governance kernel / release switch):** #418 owns the release-switch + emergency-off **state**
  and the kernel gate. #424 owns the **retention/replay records and their lifecycle**. #424 does not gate
  autonomy. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:62]
- **vs #419 (audit tracer bullet):** #419 defines the **shape** of audit events and redacted replay/debug
  packages (what is captured, how it is redacted). #424 defines **how long** those records and artifacts
  live and how they expire or are held. #424 consumes #419's redaction guarantee.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:75]
- **vs #420 (kill-switch control path):** a legal/incident **hold** is a retention override, not a
  kill-switch; #424 never pauses automation. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:88]
- **Memory retention** is controlled separately (US69) and is out of scope here.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:310]

## Verification contract

- `openspec validate --strict` passes; `eve-judge --change` PASS; `cite-verify` clean; `qa-gates.sh
--change` machine gates (0/1/3) PASS. [VERIFIED-REPO: docs/ai/rules/openspec.md]
- When implemented (later PR), retention tests MUST cover 180-day defaults, category overrides, artifact
  expiration, incident holds, and deletion jobs.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:590]
- Ships disabled behind the #418 release switch; final activation is the #437 launch gate. Human (code
  owner) sign-off is required before any PR to `core:develop`.
