# Legacy PDF Studio Removal

> **Superseded implementation authority (Phase 18, 2026-07-21).** This file is
> retained as prototype-removal evidence, not as a migration plan. Phase 18 D17
> controls: prove the environment is pre-production, then delete the obsolete
> PDF Studio, Unlayer, receipt-render, and dual-runtime paths before the new
> canonical system is enabled. Do not build import, backfill, compatibility, or
> fallback runtime for data that has never served production users.

The rebuilt product is Statement Studio. Unlayer is not part of the new product architecture.

## Triggers

Use this doc to locate and remove obsolete PDF Studio, Unlayer, native-preview,
direct receipt-render, flag, config, route, dependency, documentation, and test
surfaces after the D17 environment assertion passes.

## Workflow Steps

1. Run and record the Phase 18 D17 environment assertion before mutation.
2. Stop the line if any real production or irreplaceable-data reliance exists;
   return to grooming rather than improvising migration.
3. Inventory every obsolete runtime/schema/route/dependency/config/test/doc
   symbol and classify it as delete or retained non-runtime evidence.
4. Delete obsolete writers, readers, flags, fallbacks, provider adapters, schema,
   routes, and dependencies before enabling the canonical writer.
5. Build one tenant-safe canonical Phase 18 runtime and one user-facing product.
6. Replace useful behavioral tests with canonical public-seam tests and add
   forbidden-symbol/route/dependency checks for removed paths.
7. Record clean-cut closure; never ship a compatibility or rollback-to-legacy
   switch.

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
