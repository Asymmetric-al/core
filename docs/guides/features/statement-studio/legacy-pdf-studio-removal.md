# Legacy PDF Studio Removal

The rebuilt product is Statement Studio. Unlayer is not part of the new product architecture.

## Triggers

Use this doc when auditing, removing, replacing, or migrating legacy PDF Studio and Unlayer-specific code, config, docs, routes, env vars, or tests.

## Workflow Steps

1. Run Phase 0 audit.
2. Identify all Unlayer-specific PDF Studio dependencies.
3. Classify each dependency as remove, migrate, temporary compatibility, or ignore.
4. Keep only code that serves the new tenant-safe Statement Studio architecture.
5. Remove user-facing confusion between PDF Studio and Statement Studio.
6. Update docs, env examples, tests, and route references.
7. Keep the Unlayer allowlist verification script in sync when removing legacy paths.

## Approved Boundary

- New templates, assignments, publishing, rendering, and defaults use the custom pdfx/React PDF path (Statement Studio target state).
- Reconcile with in-flight native PDF Studio + DocRaptor work in `docs/guides/features/pdf-studio.md` during Phase 0; do not run two production render stacks without an explicit migration decision.
- Unlayer is legacy-only and not a dependency.
- Existing Unlayer PDF templates may be migrated if useful or removed if Phase 0 confirms removal is acceptable.
- The rebuild is a clean product replacement, not a compatibility layer.

## Removal Targets To Audit

- Legacy editor UI and setup status.
- Unlayer project ID and white-label config.
- Legacy merge tags.
- Legacy PDF export assumptions.
- Old docs and screenshots.
- Old tests that assert Unlayer behavior.
- Feature flags that only exist for migration.

## Checklist

- [ ] No new Statement Studio code depends on Unlayer.
- [ ] No user-facing UI presents both Statement Studio and PDF Studio as separate products.
- [ ] Legacy removal does not break first production slice.
- [ ] Useful tests are rewritten around new product behavior.
- [ ] Env/docs no longer imply Unlayer is required for Statement Studio.
