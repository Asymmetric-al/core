# Dependency upgrade qualification

Issue: AL-1965. Release observations were checked against the public registry on
7 October 2026. The starting repository commit is
`a630937695c15bf421fd1fa0eeb63af455920048`.

## Scope and procedure

Phase 47 documents and artifacts, vendored PDF packages, specifications,
OpenSpec intent, ADRs and PRDs are unchanged. Dependency installation may repair
links inside `node_modules`; it never rewrites the held package sources.

Each dependency family has a separate checkpoint. The sequence is:

1. Capture the baseline installation, lint, typecheck and full unit results.
2. Verify the published version, engine requirements, peer ranges and installed
   migration documentation. Record every importer, including duplicated direct
   dependencies and operational CLI/action pins.
3. Upgrade Bun/Node compatibility, compatible advisory fixes and Zod first.
4. Upgrade React/Next and their types; fix hook regressions before enabling the
   TypeScript 7 compiler in every compiled workspace.
5. Upgrade Query, Form/Store, Virtual, Table, Supabase and DB/its adapter as
   separate units. Preserve one physical DB runtime and authoritative mutation
   confirmation/rollback. Qualify joins and real Supabase-client query building.
6. Upgrade each UI/editor family separately, checking real rendered geometry,
   accessible names, focus, reduced motion and editor round trips.
7. Upgrade browser Stripe, GraphQL, workflow and AI dependencies independently.
   Qualify the Eve/Connect runtime as a coherent unit with session ownership,
   model policy, native tool capabilities and cancellation preserved.
8. Upgrade test, build, lint, CLI and GitHub Actions tooling separately. Prove
   that failing tests fail and that custom raw coverage contains actual scripts
   and functions. Keep each Playwright version with its matching browser.
9. Reconcile current develop changes, install from a clean checkout, and run
   `bun run ci:preflight -- --full`, the browser fixtures and dependency-owner
   identity checks against the same immutable checkpoint.
10. Promote only qualified families. A held family requires its own successful
    admission checks; changing a version number or weakening a gate does not
    satisfy the dependency upgrade.

Each install uses the committed Bun version and frozen lockfile. Normal Git
hooks remain enabled. Roll back a failing family's source, manifests and lock
delta together, then rerun its affected checks. Do not use a blanket override to
force an unsupported major into another package's closure.

## Version checkpoints

| Family               | Selected versions                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| Runtime              | Bun 1.4.2; Node 24.21.0, the supported LTS line                                                                 |
| React / Next         | React and React DOM 19.3.0; Next family 16.4.0                                                                  |
| Product compilers    | TypeScript 7.0.2 in all 15 compiled workspaces                                                                  |
| Query / Form / Store | Query and devtools 5.104.1; Form 1.33.5; Store 0.11.2                                                           |
| Virtual / Table      | React Virtual 3.14.13; Virtual core 3.17.11; Table/core 9.2.6; Table devtools 9.2.5                             |
| DB / Supabase        | DB 0.12.1; React DB 0.5.5; query collection 1.4.0; maintained adapter 0.1.0; Supabase JS 2.117.3 and SSR 0.12.7 |
| TanStack CLI         | CLI 0.71.1; Create 0.70.1; owner-compatible Pacer/event-client lines                                            |
| Validation / API     | Zod 4.6.5; GraphQL 16.14.2; Yoga 5.24.2; Inngest 4.22.0                                                         |
| Styles / UI          | Tailwind 4.3.3; Recharts 3.10.1; Motion 14.0.0; DayPicker 10.0.2; cropper 6.2.4; MapLibre 6.13.0; panels 4.14.2 |
| Editors / mail       | Tiptap 3.31.4; native React Email editor 1.7.12; Unlayer 2.1.3; Resend 6.32.1                                   |
| HTML / telemetry     | DOMPurify wrapper 4.5.0; HTML parser 6.1.8; Sentry 11.5.0; web-vitals 6.2.3                                     |
| Browser payments     | Stripe React 7.0.0 and Stripe JS 10.0.0                                                                         |
| AI                   | AI SDK 7.0.131; Eve/Connect remain at the qualified baseline described below                                    |
| Browser tools        | Playwright test/core 1.63.0; axe 4.13.0; Boneyard 1.10.0; agent-browser 0.38.2                                  |
| Test/build tools     | Vitest 5.0.3; Vite 8.3.3; React plugin 6.1.2; jsdom 30.1.2; Turbo 2.11.7; lint-staged 17.6.0                    |
| Lint / scaffold      | TypeScript ESLint 8.71.1; import-x 4.17.1; React hooks 7.1.1; shadcn 4.21.4                                     |

Root TypeScript 6.0.3 supplies the full AST, parser and editor/tsserver APIs that
the TypeScript 7 compiler shim does not expose. Root compiler commands use the
explicit native 7.0.2 alias. This tooling exception does not change the product
workspace compiler versions. ESLint remains on its supported 9.39.5 line;
GraphQL 17 is excluded by the preserved Payload cohort's peer constraints.

## Explicit holds and the next admission step

| Family                | Retained version / reason                                                                                                                                            | Required next step                                                                                                                                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 47 PDF packages | Exact existing local packages and declared compatibility pins; user instruction                                                                                      | Leave their documents, artifacts and package sources unchanged                                                                                                                                                              |
| Payload               | Existing coherent `4.0.0-internal.1f9ae9a` cohort; public canary `.38` fails three current API contracts                                                             | Migrate supported request/media APIs, prove data-preserving `sizes` to `variants` migration and old-reader compatibility, then generated/schema/build, disposable DB restore/tenant, editor/public-output and browser gates |
| Eve / Connect         | Eve 0.25.1 and Connect 0.4.0; actual Eve 0.73 nested workflow bypasses per-child plan admission and leaves cap/state tracking pending                                | Qualify a supported durable pre-child admission and per-step lifecycle boundary, preserving declared children, policy revalidation, unique call identities and completion tracking                                          |
| Server Stripe         | 22.2.0 / `2026-05-27.dahlia`; 23/Endive renames a request parameter while previously submitted outbox requests may retry the same idempotency key                    | Prove legacy-request replay against test mode or use a reviewed pause/drain with zero unresolved previously submitted requests                                                                                              |
| OpenSpec              | 1.9.0; strict validation passes 82/82 items, while 1.14.1 fails 57 unchanged items                                                                                   | Obtain authorization for the required specification migration before changing protected intent                                                                                                                              |
| OpenPolicy            | Core/react/SDK 0.0.17 and renderers 0.0.14; unused CLI declaration retired upstream; 0.0.34 removes required Terms APIs and fails existing three-document generation | Qualify a supported Terms renderer and configuration/generator API without inventing legal policy                                                                                                                           |
| Prettier              | 3.8.2; 3.9.9 changes formatting of protected PRDs/specs, while 3.8.2 passes all 17 affected protected files                                                          | Obtain authorization for document formatting migration; retain the current complete formatting gate                                                                                                                         |

## Verification boundary

The original baseline passed 805 unit files / 6,482 tests. All 124 researched
public names are accounted for: 105 selected targets, 16 held names and three
retired direct declarations. The cold-install checker must confirm this
accounting against the final installed graph. Isolated dependency
families have focused regression, type and runtime evidence. These are distinct
from the final combined gate, whose result must be recorded after the branch
freeze.

Provider-free checks use disposable/local transports, fake credentials and
artifact-only Eve builds with sandbox prewarming disabled. They do not prove
production credentials, live provider behavior, hosted authentication, a
Payload schema rollout, the held Eve migration or unresolved Stripe replay compatibility. No deployment
or production migration is included.

Advisory reports match installed versions to published vulnerable ranges.
They are not exploitability proof or a claim that the full dependency graph is
free of advisories. Held dependencies and legitimate owner-specific versions
remain visible in the audit.
