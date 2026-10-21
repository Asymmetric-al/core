## Context

See proposal.md for intent. Current code uses tenant Stripe keys and the signed
event/workflow path. Phase 13 Connect bindings remain future design. Supabase's
local exposed-schema list does not prove hosted privacy.

## Goals / Non-Goals

**Goals:** native provider authorization, private ingestion, and reproducible evidence.
**Non-Goals:** application reads, Connect, financial-domain changes, or live activation.

## Decisions

- Use the existing `pnmlrbgjiqzzsthsoikm` project and native Supabase OAuth;
  avoid a self-hosted sync engine or additional password setup for source one.
- Evaluate customers, payment intents, charges, and refunds against actual
  synthetic fixtures; the runbook records the selected subset and actual schema.
- Keep the verifier opt-in with explicit targeting and `SUPABASE_DB_URL` through
  the existing environment loader; never fall back to the CMS database.
  Inspect columns, ownership, effective grants, API exposure, and publications.
  Require actual table relation kinds and a dated operator review for indirect
  exposure through views/RPCs and application consumers. Mark provider setup and
  second-source evidence outside the single-source helper's observations.
- Use one bounded read-only helper plus focused Vitest tests instead of a
  polling service. Record fixture IDs and safe expected fields; never raw payloads.
- Keep applications, migrations, seeds, generated types, and runtime env contracts
  untouched. The operations record is not a Settlement Account Binding.

## Risks / Trade-offs

- Preview latency and idle sources → use known fixtures and bounded observation,
  allowing documented delays; do not treat stale timestamps as outages.
- Missing provider consent or account evidence → finish repository preparation
  and record one exact human handoff, with activation and movement unclaimed.
- Multiple-account and offboarding UI limitations → verify supported controls
  before acting; never invent native OAuth options or copied-data deletion guarantees.

## Migration Plan

No Core migration or deployment. Authorize only a supported sandbox pipeline after
checking existing connections and costs; verify backfill and a benign synthetic
customer change. Stop only that pipeline through provider controls, preserve
private retained data, and leave this change active until accepted and merged.
