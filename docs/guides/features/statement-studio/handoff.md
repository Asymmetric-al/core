# Statement Studio Handoff

Updated: 2026-07-10 Asia/Bangkok

## Triggers

Use this handoff when picking up Statement Studio after the AL-312 Phase 0
audit, reviewing a downstream issue, or deciding whether a legacy/native PDF
path is safe to change.

## Workflow Steps

1. Read `README.md`, `phase-0-audit-brief.md`, and
   `phase-0-research-evidence.md`.
2. Read `openspec/changes/add-statement-studio/` before implementation.
3. Read the relevant PRD/supporting docs and the live GitHub issue.
4. Treat source-domain contexts, private artifacts, and role-scoped BFF access
   as gates, not later cleanup.
5. Load the repo skills/rulebooks for the files being changed.

## Current State

- Repository: `Asymmetric-al/core`
- Planning PR [#367](https://github.com/Asymmetric-al/core/pull/367) merged on
  2026-07-03.
- Parent planning issue
  [#310](https://github.com/Asymmetric-al/core/issues/310) closed on 2026-07-09.
- [#312](https://github.com/Asymmetric-al/core/issues/312) is implemented by
  the completed audit/evidence and proposed OpenSpec change in this branch; it
  remains HITL until reviewed and merged.
- Canonical implementation issues remain #314 through #364, but their original
  dependency graph predates the Phase 0 findings.

## Approved-When-Merged Decisions

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

## Recommended Next Work

After AL-312 is reviewed and merged:

1. Re-groom [#322](https://github.com/Asymmetric-al/core/issues/322) with the
   newer proposed statement issues
   [#579](https://github.com/Asymmetric-al/core/issues/579),
   [#580](https://github.com/Asymmetric-al/core/issues/580),
   [#583](https://github.com/Asymmetric-al/core/issues/583), and
   [#584](https://github.com/Asymmetric-al/core/issues/584). Canonical facts,
   run/version ownership, frozen formatting, portal cutover, private artifact
   authorization, and finance/legal approval are production blockers;
   completing #320 alone is not sufficient.
2. Allow [#314](https://github.com/Asymmetric-al/core/issues/314) to proceed only
   as the Statement Studio shell, starter catalog, tenant-safe foundation, and
   safe sample preview. Do not turn it into an official statement render.
3. Implement the OpenSpec foundation in thin vertical slices: same-tenant
   constraints, immutable versions, assignments, server capabilities, private
   Storage, artifacts, retention, and tests. Coordinate tenant isolation with
   #505/#516 and outbound delivery with #552-#554/#581; do not create parallel
   guard or communication infrastructure.
4. Prove the pipeline with `letterhead.simple` or the annual starter in
   non-official sample mode before connecting Giving truth.

Do not begin with legacy Unlayer removal or a second renderer stack.

## Verification Expectations

For foundation/runtime work:

- Read installed Next.js docs before changing Next.js routes or components.
- Load the Supabase and Supabase Postgres skills before schema/RLS/Storage work.
- Verify hosted migration state before assuming committed tables exist.
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
- [x] Renderer, canonical persistence, first job, and legacy posture are recorded.
- [ ] AL-312 HITL review/merge approves the proposed decisions.
- [ ] #322 is re-groomed before production statement work.
- [ ] Hosted migration and legacy-template state are inspected before cutover.
- [ ] Each implementation slice uses the appropriate repo skills and checks.
