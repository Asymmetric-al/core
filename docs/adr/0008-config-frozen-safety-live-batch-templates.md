# ADR-0008: Config-frozen, safety-live batch templates

**Status:** Accepted (founder ruling, Phase 15 grill session 2026-07-11 — D7)

> Full record: `docs/prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md`
> (ratified decision D7 + its hardening amendments H1–H13).

## Context

Offline gift-entry needs reusable batch templates (column layout, default
values, required-field policy, which opt-in validation/approval policy
applies) so a fresh tenant isn't blank and repeat batches aren't retyped.
NPSP-style templates that let saved records diverge from live config, or let a
template weaken a control, are the market's fragility. The adversarial fleet
named one systemic gap: D7 said "frozen snapshot" without saying frozen _by
what_ or _where_ the line sits between presentation and money-integrity.

## Decision

**Config frozen, safety live.** A batch created from a template freezes its
**presentation** — columns, default values, required-field layout — _by
value_ onto the batch header (a typed struct with `snapshot_schema_version`,
not a versions table); a later template edit never mutates an existing batch.
But **all money-integrity is re-resolved live at commit** against current
tenant config: the D1–D6 invariants, the control-total gate, high-risk
auto-route, P7 receipt eligibility, `settlement_rail`, deposit-eligibility,
and any tightened approval policy. The always-on safety floor is never frozen
and never selectable; a template can only **add** strictness, never subtract a
control. One invariant validator enforces this — fail-closed on save,
re-derivation at commit — in the service/DB, not the UI.

## Consequences

- A tightened control protects even in-flight drafts; a template can never be
  a back door around a control, and a dead frozen designation ID is rejected
  live at commit rather than silently posted.
- No policy-versioning/effective-dating engine, no `batch_template_versions`
  history, no builder "studio", no per-template custom fields or numbering —
  the per-batch frozen snapshot _is_ the point-in-time record.
- Column control is bounded to the Phase 3 grid-eligible allowlist; restricted
  fields are filtered live per viewer through the P11/P3 projection, and
  inspector-only fields are never template-promotable to the hot-path grid.
- Personal per-user column preferences reuse `crm_table_preferences` as a
  presentation-only overlay, never entering the snapshot; a template selects an
  opt-in D2/D5 policy, never defines one.
- Composite `(tenant_id, target_id)` FKs + RLS make cross-tenant defaults
  DB-impossible; quick-entry always resolves a non-null policy, failing closed
  to the tenant default rather than to no validation.
