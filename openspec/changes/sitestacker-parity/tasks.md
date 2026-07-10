# Tasks

## 1. Phase 0A — baseline truth (reality first)

- [x] 1.1 Record baseline commit + develop→production gap (Lane 1).
- [x] 1.2 Record repo-gate status for the baseline (Lane 1).
- [x] 1.3 Confirm donor/missionary portals follow the boundary rules (Lane 1).
- [x] 1.4 Locate + record the SiteStacker benchmark documentation source.
- [ ] 1.5 (human-only, Lane 2) Confirm the exact live commit per app and live
      health/behavior; record owner + date.

## 2. Phase 0B — program records

- [x] 2.1 Program charter (`docs/prds/sitestacker-parity/README.md`).
- [x] 2.2 25-area parity matrix (initial pass, honest verification flags).
- [x] 2.3 Phase 0 plan (`phase-00-baseline.md`).
- [x] 2.4 This OpenSpec entry + durable requirement.
- [x] 2.5 Add `SiteStacker parity` to `CONTEXT.md`.

## 2b. Roadmap v2 (2026-07-07)

- [x] 2b.1 Adopt Roadmap v2 (`docs/prds/sitestacker-parity/roadmap.md`) as the
      source of truth for phase architecture (41 phases, 0–40; v1→v2
      renumbering map; per-phase scope sections).
- [x] 2b.2 Rewrite `phase-map.md` as the compact mirror.
- [x] 2b.3 Same-commit congruence sweep of live PRDs/docs and open issues
      (#604–#618, #621, #624, #625) to v2 numbering; decoder comment on epic
      #604.
- [x] 2b.4 Record the roadmap-governance durable requirement in this change's
      `platform-product-intent` delta.

## 2c. Phase 14 (Donor Credit Operations) (2026-07-10)

- [x] 2c.1 Record the donor-credit recognition-separation durable requirement
      in this change's `platform-product-intent` delta (per
      `docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md`).

## 3. Verification

- [x] 3.1 `bunx @fission-ai/openspec@latest validate --strict` passes for this
      change.
- [ ] 3.2 Archive this change once Phase 0 is accepted (Phase 0 is done when the
      picture is complete and honest, per `phase-00-baseline.md`).

## 4. Follow-ups (not Phase 0 completion blockers)

- [ ] 4.1 Verify every matrix `Built?`/current-state `(v)` flag against code.
- [ ] 4.2 Source every benchmark `(s)` to a specific SiteStacker doc page.
- [ ] 4.3 Reconcile parity areas already governed by OpenSpec PR #462.
