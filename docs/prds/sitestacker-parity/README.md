# SiteStacker Parity — Program Charter

This folder governs the long-term SiteStacker parity effort for
`Asymmetric-al/core`. It is the program-level home: the rules, the inventory,
and how each area is tracked. Detailed per-feature plans are written later, when
each area is actually built — not here.

## What "SiteStacker parity" means (outcome parity)

Parity means **matching what SiteStacker/WMTek lets a Christian missions
organization accomplish — built our way**, not cloning its screens.
SiteStacker is the **benchmark of operational capability**, not a UI blueprint.

For every area, the question is: _"Can a missions organization get the same
real-world job done here as they can in SiteStacker?"_ — not _"Did we replicate
SiteStacker's exact screens?"_

This is a durable product term; see the `SiteStacker parity` entry in the
root `CONTEXT.md` glossary.

## Benchmark source (what we measure against)

Parity is measured against **official SiteStacker/WMTek public documentation**:

- `https://sitestacker.training` and
  `https://forms.sitestacker.training/full-training-documentation`
- product framing at `https://sitestacker.com`

Rule: every benchmark entry in the parity matrix **cites a specific doc page**
or is marked **"not yet sourced."** No benchmark claim rests on memory.

**Known limitation:** public docs describe _features_, not always _operational
depth_ (real behavior under failure/edge cases). Deep behavioral documentation
of an area happens when that area is built, not in Phase 0.

## Scope

- **In scope:** the 25 parity areas listed in [`parity-matrix.md`](./parity-matrix.md).
- **Out of scope:** **child sponsorship** (declared out now). Other exclusions
  are recorded in the matrix with an "out of scope / not pursuing" status as
  they surface — we do not guess the full exclusion list up front.

## Guardrails (inherited, not restated)

The parity effort inherits the platform's existing, binding boundaries. It does
**not** restate them — one source of truth. The binding rules live in OpenSpec:

- `openspec/specs/platform-boundaries/spec.md` — server-side boundary for
  sensitive operations; CRM = operational truth, CMS = public/content truth;
  role-scoped surface boundaries; tenant isolation; shared-logic convergence.
- `openspec/specs/platform-surfaces/spec.md` — Mission Control owns staff
  depth; donor portal = donor self-service; missionary workspace =
  support-raising/communication; public website = public content + giving.
- `openspec/specs/platform-product-intent/spec.md` and
  `openspec/specs/platform-principles/spec.md` — product intent and the
  decision ladder.

**Parity-specific reminder:** a new SiteStacker-style capability must fit an
existing surface and use the shared `packages/api` layer — it must not become a
bolted-on module or push admin depth into donor/missionary surfaces.

## How work is sequenced

- The post-Phase-0 build order is **provisional** — recorded as best-current
  thinking in [`phase-00-baseline.md`](./phase-00-baseline.md), changeable once
  the matrix shows what is already done. Only genuine "B needs A first"
  dependencies are firm.
- Each area graduates to its own detailed PRD + OpenSpec change **when it is
  actually being built**, not before.
- **Phase 7 (Receipt & Statement Compliance Rules + Donor Identity/Credit
  Model)** is the next phase. It **fulfills the identity/party/credit seams
  reserved in Phase 4** — the persons spine, party entities, frozen-snapshot
  extension, and the `gift_credits`/tribute/matching/DAF model — which the
  provisional build order permits. Phase 7 **hard-depends on the Phase 4
  isolation-hardening foundation shipping first** (firm dependency: Phase 4
  foundation → Phase 7).
- **Phase 8 (CRM Operating Foundation)** is groomed and committed — the
  operating foundation (readiness/self-healing, `/crm/operations`) + the first
  reversible production write (Notes). It **hard-depends on Phase 4 and Phase 6
  shipping first**, and **supersedes** the earlier
  `phase-01-crm-operating-foundation.md`.

## Files in this program

- [`README.md`](./README.md) — this charter.
- [`parity-matrix.md`](./parity-matrix.md) — the 25-area inventory (the tracking
  source of truth).
- [`phase-00-baseline.md`](./phase-00-baseline.md) — the Phase 0 plan: what
  Phase 0 does, its done-definition, and the provisional order.
- [`phase-07-receipt-statement-compliance-and-donor-credit.md`](./phase-07-receipt-statement-compliance-and-donor-credit.md)
  — the Phase 7 plan (Receipt & Statement Compliance Rules + Donor
  Identity/Credit Model): a rules-first receipt/statement engine + the full
  donor credit model. Groomed and committed; tracked by epic #566 + children
  #567–#586.
- [`phase-08-crm-operating-foundation.md`](./phase-08-crm-operating-foundation.md)
  — the Phase 8 plan (CRM Operating Foundation: readiness/self-healing +
  Notes write-enable): a fail-closed write gate, a multi-tenant self-healing
  reconcile healer, a read-only `/crm/operations` windowpane, and the first
  reversible production write (Notes). Groomed and committed; hard-depends on
  Phase 4 + Phase 6 shipping; supersedes `phase-01-crm-operating-foundation.md`.
- Evidence: `docs/ops/phase-evidence/2026-07-03_sitestacker-parity-phase-00-baseline.md`
  (the 0A truth-finding output).
- OpenSpec: `openspec/changes/sitestacker-parity/` (the durable record that this
  program exists and is governed as outcome parity).

## Related in-flight work

OpenSpec PR #462 refines the platform specs and adds capability specs
(donation-lifecycle, crm-core, contribution-operations, identity-and-access,
workflow-orchestration) plus donor-money-path changes (guest giving, donor
self-service, recurring giving, staff refunds). These overlap several parity
areas and are not yet merged. The parity program **reconciles with #462 rather
than duplicating it** — where #462 already governs an area, the matrix points to
it.
