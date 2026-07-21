# Statement Studio Handoff

> **Superseded implementation authority (Phase 18, 2026-07-21).** This handoff
> remains useful as historical repo evidence, but it is not dispatchable target
> architecture. Use the Phase 18 PRD, authority manifest, renderer qualification
> protocol, ADRs 0033-0039, and OpenSpec change. D17 requires a clean
> pre-production cutover with no legacy runtime, import, backfill, or dual
> compatibility; D13 forbids raw provider or signed object URLs as access
> authority.

Updated: 2026-07-10 Asia/Bangkok

## Triggers

Use this handoff only when interpreting the AL-312 Phase 0 audit or older issue
bodies. For current Phase 18 work, enter through the Phase 18 PRD and authority
manifest.

## Workflow Steps

1. Read the Phase 18 PRD, authority manifest, renderer qualification protocol,
   ADRs 0033-0039, and Phase 18 OpenSpec change.
2. Read `README.md`, `phase-0-audit-brief.md`, and
   `phase-0-research-evidence.md` only for historical repo evidence.
3. Read the relevant source-owner PRD and live GitHub issue; block the issue if
   its body still carries pre-Phase-18 instructions.
4. Treat source-domain contexts, private artifacts, and role-scoped BFF access
   as gates, not later cleanup.
5. Load the repo skills/rulebooks for the files being changed.

## Current State

- Repository: `Asymmetric-al/core`
- Planning PR [#367](https://github.com/Asymmetric-al/core/pull/367) merged on
  2026-07-03.
- Parent planning issue
  [#310](https://github.com/Asymmetric-al/core/issues/310) closed on 2026-07-09.
- [#312](https://github.com/Asymmetric-al/core/issues/312) is delivered by the
  completed audit/evidence and proposed OpenSpec change in
  [PR #715](https://github.com/Asymmetric-al/core/pull/715). Before that PR
  merges, its decisions remain proposed; merge records the HITL approval.
- Issues #314 through #364 preserve the historical implementation breakdown but
  are blocked from dispatch until amended or closed/reissued against Phase 18.

## Historical Phase 0 decisions — superseded

The bullets below record the earlier decision package. They explain existing
repo shapes but do not authorize implementation after Phase 18 D1-D17:

- Product name: Statement Studio; existing `/pdf` and `pdf_*` internals migrate
  pragmatically.
- Extend the existing `pdf_templates` / `pdf_template_*` family; no parallel
  document persistence family.
- Use an Asym-owned template schema. New work does not depend on Unlayer or
  treat an email editor as the PDF product.
- Qualify the existing server-only DocRaptor adapter, then use it as the sole
  first-slice provider behind a renderer port. A later renderer replacement is
  a separate migration decision.
- Start infrastructure with an admin/sample-data tracer. Keep
  `donor.statement.annual_giving` as the first donor-facing production job only
  after a canonical frozen statement snapshot/version and finance/legal
  approval.
- Production renders resolve source-domain contexts server-side.
  Browser-supplied financial `dataContext` is never official input.
- Generated PDFs are private, tenant-aware artifacts exposed through authorized
  Mission Control/donor/missionary BFF paths.
- Unlayer is retire-later; delete nothing before hosted tenant-template
  inventory and verified replacement.

## Current next-work rule

1. Do not dispatch #314-#364 or any affected Phase 7/14/17 ticket until its body
   is reconciled with the machine-readable Phase 18 congruence dispositions.
2. Run the D17 environment assertion. If it proves the no-production premise,
   delete the prototype runtime/schema/routes/dependencies before enabling the
   canonical writer. If not, stop before mutation and re-groom.
3. Run the D3 renderer qualification protocol and record zero or one winner. Do
   not assume DocRaptor or preserve a losing renderer as fallback.
4. Implement thin vertical slices through the one canonical service using
   synthetic proof data first, then source-owned immutable Facts Packages.

## Verification Expectations

For foundation/runtime work:

- Read installed Next.js docs before changing Next.js routes or components.
- Load the Supabase and Supabase Postgres skills before schema/RLS/Storage work.
- Verify and record the D17 environment assertion before destructive schema or
  route removal. Do not turn this evidence gate into migration discovery or a
  compatibility plan.
- Test cross-tenant foreign keys, immutable versions, capability differences,
  private Storage paths, recipient denial, artifact integrity, and purge
  tombstones through public seams.
- Keep app routes thin and production context resolution inside shared
  server/source-domain modules.

## Security and Privacy Notes

Do not copy donor, missionary, tenant, payment, care, or legal production data
into samples, handoffs, template JSON, render requests, or audit fixtures. Use
synthetic fixtures and reference public issue/file paths.

## Checklist

- [x] Phase 0 audit and evidence are complete.
- [x] The historical renderer, persistence, first-job, and legacy posture are
      recorded as superseded evidence.
- [x] The AL-312 HITL decision package is complete; PR #715 merge records
      approval of the proposed decisions.
- [ ] #314-#364 and affected cross-phase issue bodies are amended or
      closed/reissued before dispatch.
- [ ] The D17 environment assertion passes before the destructive clean cut.
- [ ] The D3 contest records at most one exact production renderer winner.
- [ ] Each implementation slice uses the appropriate repo skills and checks.
