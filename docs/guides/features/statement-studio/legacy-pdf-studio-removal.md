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

## Proposed Phase 0 Boundary (pending HITL merge)

- New templates, assignments, publishing, rendering, and defaults use the
  Asym-owned schema and Statement Studio lifecycle.
- Phase 0 proposes the existing server-side DocRaptor adapter as the sole
  first-slice provider behind a renderer port after qualification and HITL
  approval. Do not run a second production stack without an explicit migration
  decision.
- Unlayer is not a dependency of new Statement Studio templates; it remains a
  temporary compatibility dependency for the exercised legacy editor/export.
- Existing Unlayer templates may be migrated, archived, or removed only after
  hosted tenant-template inventory and verified replacement/cutover.
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
