# Proposal: Eve retention and replay artifact tracer bullet

**Implemented for GitHub issue #424.** Builds on #418 (governance state) and #419
(audit/replay shape); it does not restate them.

## Why

Eve produces audit records, run summaries, and replay/debug artifacts. Without a durable retention +
artifact contract, those either pile up unbounded or get deleted before an investigation completes. The
PRD requires: **category-based retention with a 180-day default**
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:303]; **security
or incident holds that override normal retention**
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:307]; **large
replay/debug artifacts in Supabase Storage with table metadata so Postgres does not become an artifact
bucket** [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:299];
and **redacted replay/debug packages so failures can be investigated without storing unsafe raw data**
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:175]. Slice #424
makes that a spec-level contract. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:142]

**Retention-category nuance (audit finding):** the partner's model-policy answer sets gateway/model-call
logging to **metadata-only, 14–30 day rolling** — _tighter_ than the PRD's 180-day default. So gateway-usage
telemetry needs its **own retention category**, not the default. [PARTNER-RESPONSE 2026-07-02]
(see `track-b/PROPOSAL_421_NOTES.md`)

## What Changes

- Add the `eve-retention-replay` capability with a 180-day default and a
  30-day metadata-only gateway category.
- Add private Supabase Storage artifacts, queryable redacted metadata,
  tenant/owner-scoped signed access, human holds, and two-phase expiry.
- Record the implementation decision in ADR-0025.

## What Does Not Change

- No live autonomy or business-data write capability is enabled.
- Raw secrets / PII / donor data are **never** stored in artifacts — only redacted summaries.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:175]
- The **shape** of audit events / replay packages is #419's scope; the **release/kill-switch state** is
  #418's. This change governs record/artifact **lifecycle** only.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:142]
- **Memory retention is controlled separately** and is not activated here.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:310]
- Subordinate to OpenSpec, `AGENTS.md`, and `openspec/project.md`.
  [VERIFIED-REPO: AGENTS.md] [VERIFIED-REPO: openspec/project.md]

## Expected Outcome

- A validated and implemented retention + redacted-replay-artifact contract.
- A clear lifecycle boundary: #419 defines what is captured (redaction), #424 defines how long it lives and
  how it expires/holds, #418 holds the enable/emergency state.
