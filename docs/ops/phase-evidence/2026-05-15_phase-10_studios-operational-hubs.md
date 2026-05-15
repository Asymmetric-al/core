# Phase 10 Evidence - Studios And Operational Hubs

Date: 2026-05-15
Branch: `epic`
Product commit: `7ba815f72b0c752d8a23481fb538c82f67bc5502`
Product commit message: `feat(pdf-studio): persist mission control templates`

## Selected Scope

Phase 10 selected the Mission Control PDF Studio template persistence hub.

Selection evidence:

- `apps/admin/app/pdf/page-client.tsx` already called `/api/pdf-templates` for
  save/delete behavior.
- `supabase/schema.sql` and existing migrations already contain
  `public.pdf_templates`; Phase 10 added no migration.
- `docs/guides/features/pdf-studio.md` documented the template API as the
  outstanding PDF Studio persistence workstream.
- No `apps/admin/app/api/pdf-templates/**` route existed before this phase.

## Shipped Work

- Added thin admin App Router routes for `/api/pdf-templates` and
  `/api/pdf-templates/[templateId]`.
- Added `@asym/api/pdf-templates` route handlers and tenant-scoped store logic.
- Wired Mission Control PDF Studio load/save/archive to the new package-owned
  API.
- Documented runtime-map entries, operator workflow, provider boundaries, and
  rollback paths.
- Added focused route, store, and operator-guide tests.

## Boundary Proof

- Route handlers stay thin and re-export package handlers from `@asym/api`.
- The store uses the server admin Supabase client only inside
  `packages/api/src/pdf-templates/store.ts`.
- Templates store document metadata, Unlayer design JSON, cached HTML, and page
  layout settings only.
- Delete requests archive rows with `status='archived'`; they do not hard-delete
  operational history.
- The API does not call Unlayer, DocRaptor, Cloudinary, Resend, Stripe, Twenty,
  Payload CMS, donor portal APIs, or missionary portal APIs.
- Donor, missionary, giving, payment, CMS, CRM, and receipt ownership boundaries
  were not moved.

## Provider And Rollback

- Missing `NEXT_PUBLIC_UNLAYER_PROJECT_ID` keeps PDF Studio in free mode.
- HTML export and template save/load/archive remain available without provider
  credentials.
- Provider PDF export remains limited to the browser Unlayer document editor
  when the Unlayer document project is configured for the current domain.
- Bad templates can be rolled back by archiving in the UI or setting
  `status='archived'` for the affected tenant/template row.
- If the API route itself regresses, restore the prior admin Vercel deployment;
  Phase 10 added no migration, so existing `pdf_templates` rows remain
  compatible.

## Focused Tests

```bash
bunx vitest run tests/unit/packages/api/pdf-templates.test.ts tests/unit/packages/api/pdf-template-store.test.ts tests/unit/docs/pdf-studio-operator-guide.test.ts --coverage=false
```

Result:

- 3 test files passed.
- 12 tests passed.

```bash
bun --filter @asym/api typecheck
bun run typecheck:admin
```

Result:

- `@asym/api` typecheck passed.
- `@asym/admin` typecheck passed.

Phase 9 donor/missionary portal boundary suite:

```bash
bunx vitest run tests/unit/packages/api/donor-portal/model.test.ts tests/unit/packages/api/donor-portal/billing-boundary.test.ts tests/unit/packages/api/donor-portal/auth-ownership.test.ts tests/unit/packages/api/missionary-portal/model.test.ts tests/unit/packages/api/missionary-portal/auth-ownership.test.ts tests/unit/packages/lib/use-tasks-api-boundary.test.ts tests/unit/packages/lib/use-tasks-realtime.test.tsx --coverage=false
```

Result:

- 7 test files passed.
- 13 tests passed.

## Handoff Gate

The Phase 10 handoff gate was run before the product commit:

```bash
bun run format:check
bun run lint
bun run typecheck
bun run build
bun run test:unit
bun run verify:data-boundary
bun run verify:workspace-contract
bun run verify:eslint
bun run verify:shadcn-diff
bun run skills:verify
```

Result:

- `format:check`: PASS
- `lint`: PASS
- `typecheck`: PASS
- `build`: PASS; admin build included `/api/pdf-templates` and
  `/api/pdf-templates/[templateId]`.
- `test:unit`: PASS, 215 files passed, 945 tests passed, 1 skipped.
- `verify:data-boundary`: PASS
- `verify:workspace-contract`: PASS
- `verify:eslint`: PASS
- `verify:shadcn-diff`: PASS
- `skills:verify`: PASS

The pre-push hook re-ran `bun run ci:preflight` and passed before the product
commit push completed.

## Production Readiness

Vercel production readiness was run against the Phase 10 product commit:

```bash
bun run verify:vercel-production -- --commit 7ba815f72b0c752d8a23481fb538c82f67bc5502
```

Final result:

| App        | Status | Deployment                                      | Health check                                              |
| ---------- | ------ | ----------------------------------------------- | --------------------------------------------------------- |
| admin      | READY  | `admin-13ueutawf-asymmetric-al.vercel.app`      | HTTP 200 at `https://admin.asymmetric.al/api/health`      |
| donor      | READY  | `donor-92k8yduvd-asymmetric-al.vercel.app`      | HTTP 200 at `https://donor.asymmetric.al/api/health`      |
| missionary | READY  | `missionary-9ng005hnt-asymmetric-al.vercel.app` | HTTP 200 at `https://missionary.asymmetric.al/api/health` |

Overall result: `READY`.

The verifier reported no missing or invalid Production environment values.
Protected secret values remained present but unreadable by the Vercel CLI, which
is expected and did not block readiness.

## Worktree Boundary

The Phase 10 product commit intentionally excluded pre-existing unrelated
deployment-control scratch:

- `apps/admin/vercel.json`
- `apps/donor/vercel.json`
- `apps/missionary/vercel.json`
- `docs/ai/working-set.md`
- `docs/ops/deploy-checklist.md`
- `docs/ops/environments.md`
- `docs/ops/phase-handoffs/phase-08_repo-finalization_follow-up-prompt.md`
- `scripts/vercel/`
- `tests/unit/scripts/vercel-ignore-build.test.ts`

## Stop Condition

Phase 10 is complete for the selected PDF Studio operational hub. Phase 11 was
not started.
