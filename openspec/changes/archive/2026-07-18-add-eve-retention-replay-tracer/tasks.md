## 1. Spec

- [x] 1.1 Author the capability spec (`specs/eve-retention-replay/spec.md`) with MUST/SHALL + GIVEN/WHEN/THEN scenarios
- [x] 1.2 Validate: `bunx @fission-ai/openspec@latest validate add-eve-retention-replay-tracer --strict`

## 2. Gates

- [x] 2.1 Replace draft-only partner gates with repository lint, typecheck, unit, build, strict OpenSpec, and isolated migration-chain proof

## 3. Retention model (spec-level; implemented in a later PR)

- [x] 3.1 Category set with a 180-day default and per-category overrides
- [x] 3.2 Dedicated 30-day metadata-only category for gateway/model-call telemetry
- [x] 3.3 Incident/legal hold override (recorded human set/clear)
- [x] 3.4 Replay/debug artifacts in Supabase Storage + queryable relational metadata + redacted summaries
- [x] 3.5 Two-phase deletion/expiry jobs + tenant/owner-scoped signed access

## 4. Boundary check

- [x] 4.1 No overlap with #418 (state), #419 (audit shape), #420 (kill-switch); memory retention out of scope

## 5. Review

- [x] 5.1 Open a non-draft stacked PR for human code-owner review; no autonomy activation
