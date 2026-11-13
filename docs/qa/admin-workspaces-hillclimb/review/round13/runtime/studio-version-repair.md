# Round 13 Web Studio publication-status repair

Task date: 2026-11-12.

## Scope and boundaries

All work ran in `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`.
The repair changes only:

- `apps/admin/src/cms-ui/web-studio/flows/MissionariesHubView.tsx`
- `tests/unit/apps/admin/web-studio-missionaries-hub.test.tsx`
- This report.

The hub already had uncommitted changes and its existing test was untracked.
Their existing implementation, 14 tests, and other owners' files were retained.
Git was used only for read-only status, diff, and whitespace inspection. No git
mutations, server/environment/provider operations, children, browser automation,
or collector operations were performed.

Read the root/admin/shared-UI instructions, frontend/testing rulebooks, local
TDD/Vitest/Payload/shadcn guidance, installed Next.js error-handling guidance,
the publication and CRM/CMS ownership contracts, active Web Studio proposals,
and `historical-studio-reconciliation.md`. The existing Maia/Base UI components,
semantic tokens, authenticated reads, and publication boundaries remain intact.

## Failure and repair

Previously, `fetchChangedPageIds` returned an empty set both when no published
predecessor existed and when the versions request failed. The caller interpreted
`changedIds.has(id) === false` as proof of Draft. Consequently, a live page with
a newer draft could lose its Changed distinction after an HTTP or transport
failure without any uncertainty notice.

The secondary lookup now returns `null` for HTTP, transport, JSON decoding, or
missing-documents failures. A successful, empty `docs` array still returns an
empty set and still proves Draft for an otherwise valid draft page.

- Affected draft rows show **Unavailable**, not Draft.
- A publication-specific status notice offers **Retry publication status**.
- Successful primary page data remains available: existing page names and Edit
  actions retain their saved page IDs; known Published rows remain Published.
- Create remains possible only where the successful primary lookup established
  no existing page. Secondary uncertainty never turns an existing page into a
  create target.
- Retry refetches the giving-page query without refetching the missionary
  directory. Existing rows and their safe links remain available while retry is
  pending, and the Retry button is disabled during that request.
- A successful retry restores Changed/Draft distinctions and removes the
  publication failure notice.
- If the primary page lookup fails during retry, the existing stronger safety
  state takes precedence: Create/Edit are hidden, names open the filtered giving
  pages list, and the primary lookup's retry notice is shown. Directory rows
  remain visible.

No collection schema, server endpoint, public content, publishing action,
shared primitive, or authentication behavior changed.

## Red/green evidence

The existing rendered-component seam exercises the actual hub with mocked fetch
boundaries, real QueryClient behavior, and existing shared grid/card components.
Eight new regression cases cover HTTP and transport failures at 1024 and 390
CSS-pixel viewport settings, a held-open retry, invalid JSON, a missing `docs`
array, a valid empty versions result, recovery to Changed/Draft, and restoration
of duplicate-creation guards when the primary lookup fails on retry.

Commands below ran from the r12 root unless noted. No dependencies were installed.

| Command                                                                                                                                                                                                                                              | Result                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bunx --no-install vitest run tests/unit/apps/admin/web-studio-missionaries-hub.test.tsx --maxWorkers=1`                                                                                                                                             | Baseline: PASS, 14 tests.                                                                                                                                                 |
| `bunx --no-install vitest run tests/unit/apps/admin/web-studio-missionaries-hub.test.tsx --maxWorkers=1 -t 'keeps publication status uncertain' --reporter=dot`                                                                                      | RED before product repair: exit 1, both HTTP and transport cases failed; expected two Unavailable rows, received zero. After repair: PASS, both initial regression cases. |
| `bunx --no-install vitest run tests/unit/apps/admin/web-studio-missionaries-hub.test.tsx --maxWorkers=1 -t 'keeps a .* versions response uncertain' --reporter=dot`                                                                                  | Additional RED before the response-shape guard: exit 1, missing-docs case failed with zero Unavailable rows; invalid-JSON case already passed.                            |
| `bunx --no-install vitest run tests/unit/apps/admin/web-studio-missionaries-hub.test.tsx tests/unit/apps/admin/web-studio-missionaries-pagination.test.ts tests/unit/apps/admin/web-studio-missionary-context.test.ts --maxWorkers=1 --reporter=dot` | Final GREEN: PASS, 3 files / 27 tests, including 22 hub tests.                                                                                                            |
| `bunx --no-install tsc --noEmit --incremental false -p apps/admin`                                                                                                                                                                                   | PASS, exit 0, no diagnostics; no build-info emission.                                                                                                                     |
| `bun run lint:ui apps/admin/src/cms-ui/web-studio/flows/MissionariesHubView.tsx`                                                                                                                                                                     | PASS, exit 0.                                                                                                                                                             |
| `bun run lint:ui apps/admin/src/cms-ui/web-studio/flows/MissionariesHubView.tsx tests/unit/apps/admin/web-studio-missionaries-hub.test.tsx`                                                                                                          | Exit 1: four pre-existing test-harness import-boundary errors and one pre-existing type-import warning; no product-source findings. Details below.                        |
| `bunx --no-install prettier --write apps/admin/src/cms-ui/web-studio/flows/MissionariesHubView.tsx tests/unit/apps/admin/web-studio-missionaries-hub.test.tsx`                                                                                       | PASS; formatted the two owned files only.                                                                                                                                 |
| `bunx --no-install prettier --write docs/qa/admin-workspaces-hillclimb/review/round13/runtime/studio-version-repair.md`                                                                                                                              | PASS; formatted this evidence report only.                                                                                                                                |
| `bunx --no-install prettier --check apps/admin/src/cms-ui/web-studio/flows/MissionariesHubView.tsx tests/unit/apps/admin/web-studio-missionaries-hub.test.tsx docs/qa/admin-workspaces-hillclimb/review/round13/runtime/studio-version-repair.md`    | PASS, all three owned files.                                                                                                                                              |
| `bunx --no-install --bun shadcn info --json` from `packages/ui`                                                                                                                                                                                      | PASS; confirmed existing `base-maia`, Base UI base, shared aliases, and Lucide configuration.                                                                             |
| `git diff --check -- apps/admin/src/cms-ui/web-studio/flows/MissionariesHubView.tsx`                                                                                                                                                                 | PASS; read-only whitespace verification. The untracked test is covered by Prettier instead.                                                                               |

### Test-file lint limitation

The root lint configuration rejects the existing test imports of the admin
workspace's QueryClient at line 13 and the component under test at line 17, with
two `no-restricted-imports` errors per import. The existing Payload mock's
`import()` type annotation at line 23 produces one
`@typescript-eslint/consistent-type-imports` warning. These harness lines were
present before the repair and were not changed. No lint configuration,
suppression, rule, or import-resolution boundary was weakened to obtain a pass.

## Qualification limits and handoff

- Evidence is terminal-only: Vitest/jsdom behavior, scoped source lint,
  formatting, and admin TypeScript compilation. The viewport cases exercise the
  responsive render branches; they are not screenshots or browser layout proof.
- No live Payload/version endpoint, actual published-to-draft-to-publication
  lifecycle, real-browser retry, keyboard/screen-reader interaction, production
  build, deployment, or full-monorepo gate was run.
- Existing captures are not evidence of this repaired source. The collector
  owner must refreeze and recapture the affected missionary hub, including the
  secondary-version HTTP/transport failure and successful retry. Collectors and
  server state were left untouched.
- This repair does not establish a Round 13 visual score or acceptance, and does
  not alter the separate Account or public-address reconciliation outcomes.
