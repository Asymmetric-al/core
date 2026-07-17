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

## 2d. Phase 16 (Pledges & Recurring Commitments) (2026-07-13)

- [x] 2d.1 Record the separate recurring-commitment/fixed-total-pledge truth
      boundary and the Phase 16 lifecycle scenarios in this change's
      `platform-product-intent` delta, including exact featured-cadence,
      line-term/schedule, final-date, pause, count-once linkage, payment/ledger,
      and product-owned-recovery contracts.
- [x] 2d.2 Correct the merged legacy recurring-lifecycle wording through this
      change's dated `donation-lifecycle` `MODIFIED` delta, keeping occurrence
      execution, payment finality, ledger posting, and retry authority separate.
- [x] 2d.3 Reconcile `add-recurring-giving` so it consumes explicit groups,
      stable independently manageable lines, effective line-term versions,
      schedule epochs, compatible billing cohorts, exact provider-item
      bindings, product-owned recovery, and separate payment/ledger evidence
      instead of one subscription linked to one legacy pledge.
- [x] 2d.4 Reconcile the recurring portion of `add-donor-self-service` with
      line/cohort scopes, separate append-only term/schedule/lifecycle facts,
      truthful pause/resume, date validation, in-flight/finality states,
      provider-retry exclusion, and provider-control quarantine without
      changing its statement work.
- [x] 2d.5 Record the closed D11 fulfillment-authority contract: exact provider
      lineage, authenticated donor instruction, or approved authenticated
      versioned structured-remittance mapping may each auto-apply independently;
      authority/version/revocation and source/target conservation fail closed,
      structured authority winners serialize deterministically, donor instructions
      are single-use, apply and invalidation share an authority fence, correction
      evidence/targets remain distinct from application authority, and heuristic
      evidence remains suggestion-only.

## 3. Verification

- [x] 3.1 `bunx @fission-ai/openspec@latest validate --all --strict` passes.
- [ ] 3.2 Archive this change once Phase 0 is accepted (Phase 0 is done when the
      picture is complete and honest, per `phase-00-baseline.md`).

## 4. Follow-ups (not Phase 0 completion blockers)

- [ ] 4.1 Verify every matrix `Built?`/current-state `(v)` flag against code.
- [ ] 4.2 Source every benchmark `(s)` to a specific SiteStacker doc page.
- [ ] 4.3 Reconcile parity areas already governed by OpenSpec PR #462.
