## 1. Spec

- [ ] 1.1 Author the capability spec (`specs/eve-retention-replay/spec.md`) with MUST/SHALL + GIVEN/WHEN/THEN scenarios
- [ ] 1.2 Validate: `bunx @fission-ai/openspec@latest validate add-eve-retention-replay-tracer --strict`

## 2. Gates

- [ ] 2.1 `eve-judge --change` PASS; `cite-verify` clean; `qa-gates.sh --change` machine gates (0/1/3) PASS

## 3. Retention model (spec-level; implemented in a later PR)

- [ ] 3.1 Category set with a 180-day default and per-category overrides
- [ ] 3.2 Dedicated short (14–30 day) metadata-only category for gateway/model-call telemetry
- [ ] 3.3 Incident/legal hold override (recorded human set/clear)
- [ ] 3.4 Replay/debug artifacts in Supabase Storage + queryable relational metadata + redacted summaries
- [ ] 3.5 Deletion/expiry jobs + ownership-scoped access

## 4. Boundary check

- [ ] 4.1 No overlap with #418 (state), #419 (audit shape), #420 (kill-switch); memory retention out of scope

## 5. Review

- [ ] 5.1 Human sign-off (code owner) before any PR to `core:develop`; ships disabled behind #418 release switch
