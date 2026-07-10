# SiteStacker Parity Program

## Why

The repo is beginning a long-term effort to match SiteStacker/WMTek's
operational capability for Christian missions organizations. Without one durable
record that this program exists and how it is governed, parity work risks
fragmenting into disconnected bolt-on modules — the dominant failure mode the
platform boundaries already warn against.

## What Changes

- Add one durable requirement to `platform-product-intent` recording the
  SiteStacker parity program: it means **outcome parity** (match what an org can
  accomplish, built our way — not UI cloning), governed by the existing platform
  boundaries, benchmarked against cited official SiteStacker documentation, and
  tracked in the parity matrix. Per-area behavior is specified in its own change
  when that area is built. Child sponsorship is out of scope.
- The program's operating detail (charter, 25-area matrix, Phase 0 plan) lives
  in `docs/prds/sitestacker-parity/`; the baseline truth lives in
  `docs/ops/phase-evidence/2026-07-03_sitestacker-parity-phase-00-baseline.md`.
- **Amended 2026-07-07 (Roadmap v2):** add a second durable requirement
  recording that the program's phase architecture (41 phases, 0–40) is
  governed by one roadmap source of truth
  (`docs/prds/sitestacker-parity/roadmap.md`), with `phase-map.md` as its
  compact mirror, "Phase N (Name)" citation discipline, and a mandatory
  renumbering-map + congruence-sweep rule for any future re-sequencing.
  Roadmap v2 renumbered every phase above 9; pre-2026-07-07 documents citing
  higher numbers are decoded via the roadmap's v1→v2 map.
- **Amended 2026-07-10 (Phase 14 (Donor Credit Operations)):** add a third
  durable requirement recording that donor-credit operations (soft credits,
  DAF advisor recognition, tribute notifications, matching-gift expectancies,
  church-member attribution) keep recognition structurally separate from money
  truth — recognition rows never mint receipts, never enter money totals, and
  render only through the governed recognition read models — per
  `docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md`.

## Impact

- Affected specs: `platform-product-intent`
- Affected docs: `docs/prds/sitestacker-parity/**` (including `roadmap.md`,
  the source of truth for phase architecture), the Phase 0 evidence file
- No product code changes (this change is baseline + governance only).
