# Legacy PDF Studio Removal

> **Current Phase 18 cutover guide.** Phase 18 D-prime-R, its PRD, and
> `openspec/changes/add-statement-studio` are authoritative. The old Phase 0
> gradual-migration/compatibility plan is superseded. The production-shaped
> renderer contest yields at most one exact winner; an environment-gated,
> destructive pre-production cutover then removes every competing editor,
> renderer, receipt store, flag, dependency, and fallback. There is zero legacy
> runtime, no import or backfill of prototype data, and no preselected DocRaptor
> path.

The rebuilt product is the Phase 18 generated-document system. Unlayer and the
old PDF Studio are not part of its runtime.

## Triggers

Use this doc when inventorying and removing legacy PDF Studio, Unlayer, parallel
receipt stores, renderers, flags, config, routes, dependencies, or tests during
the proof-gated Phase 18 pre-production cutover.

## Workflow Steps

1. Run and record the Phase 18 D17 environment assertion before mutation. Stop
   and return to grooming if any real production or irreplaceable-data reliance
   exists.
2. Use the Phase 18 Cutover Coverage Manifest to enumerate every legacy and
   competing runtime, schema, route, dependency, config, test, and documentation
   path.
3. Complete the bounded production-shaped renderer contest and record at most
   one exact production winner.
4. Prove the winning generated-document path and artifact contract in the
   cutover environment; block cutover if coverage or required proof is
   incomplete.
5. Execute the environment-gated destructive pre-production cutover atomically:
   remove every non-winning editor, renderer, store, flag, route, dependency,
   environment key, test, and fallback.
6. Verify only the canonical Phase 18 schema, writer, renderer, and artifact
   path remain; replace useful behavioral tests with canonical public-seam
   tests and update docs and deployment configuration in the same change.
7. Record clean-cut closure and fail CI if a deleted legacy identifier or path
   is reintroduced; never ship a rollback-to-legacy switch.

## Phase 18 clean-cut boundary

- New templates, publication graphs, generation requests, artifacts, logical
  heads, access, and records use the one canonical Phase 18 system.
- D3 selects zero or one production renderer from evidence. DocRaptor and
  Unlayer have no assumed role, and a losing candidate is not a fallback.
- No prototype template, artifact, or row is migrated, imported, backfilled,
  archived as a product surface, or made readable by the canonical runtime.
- Historical repo references remain only as labeled evidence and removal
  inventory.
- After the first canonical official artifact, recovery is forward repair; it
  never re-enables an obsolete writer.
- Unlayer, old PDF Studio, competing receipt stores, live render paths, and
  losing renderers are deleted, not hidden behind compatibility flags.
- Failure before the atomic cutover leaves the old development environment
  untouched; failure after cutover requires restoring the environment from the
  cutover backup or fixing the one canonical path, never re-enabling a fallback.

## Removal Targets To Audit

- Legacy editor UI and setup status.
- Unlayer project ID and white-label config.
- Legacy merge tags.
- Legacy PDF export assumptions.
- Old docs and screenshots.
- Old tests that assert Unlayer behavior.
- Feature flags that only exist for migration or dual-runtime selection.

## Checklist

- [ ] No new Statement Studio code depends on Unlayer.
- [ ] No user-facing UI presents both Statement Studio and PDF Studio as separate products.
- [ ] The environment proof passes before removal, and the canonical system is
      enabled only after obsolete runtime closure is verified.
- [ ] Useful tests are rewritten around new product behavior.
- [ ] Env/docs no longer imply Unlayer is required for Statement Studio.
- [ ] No import, backfill, alias, shadow read/write, compatibility adapter, or
      legacy fallback exists.
