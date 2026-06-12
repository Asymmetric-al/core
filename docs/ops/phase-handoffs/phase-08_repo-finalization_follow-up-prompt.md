# Phase 08 Repo Finalization - Follow-Up Prompt

Repo: `Asymmetric-al/core`
Branch: `production`
Local path: `/Users/blake/Documents/asymmetrical/repos/core`

## Current Situation

Do not begin Phase 9 yet.

Phase 8 has a local completion/evidence file:

`docs/ops/phase-evidence/2026-05-15_phase-08_mission-control-platform-ux-core-modules.md`

That document says Phase 8 is `complete-local-verification`, not repo-finalized
or deployed. It also explicitly says Vercel readiness passed for baseline
commit `92292aab972182f2766c2fdb96ef6c2b96f8383d`, and that Phase 8 changes
remain local until committed and deployed.

Your task is to finish Phase 8 repo finalization only. Do not start Phase 9.

## Required Reading

Read these first:

- `AGENTS.md`
- `docs/ops/phase-handoffs/phase-08_mission-control-platform-ux-core-modules_codex-handoff.md`
- `docs/ops/phase-evidence/2026-05-15_phase-08_mission-control-platform-ux-core-modules.md`
- `docs/ops/phase-evidence/2026-05-15_phase-07_repo-finalization.md`
- `docs/features/support-hub/release-notes.md`
- `docs/features/support-hub/admin-guide.md`
- `docs/features/support-hub/operator-guide.md`
- `docs/features/support-hub/phase-07-hardening-and-release.md`

Carry forward these settled constraints:

- Twenty Cloud remains accepted.
- `TWENTY_API_URL=https://api.twenty.com/rest`.
- `TWENTY_WORKSPACE_ID` remains optional.
- `giftSummaries` exists and uses `currencyCode`.
- Production CRM writes remain disabled unless the owner explicitly approves.
- Payload CMS tenant IDs and public Supabase tenant UUIDs are intentionally distinct.
- CMS writes use Payload tenant IDs; giving/CRM validation uses public Supabase tenant UUIDs.
- CMS does not own gifts, payment state, staged gifts, allocations, receipt facts, or CRM records.
- Resend app-send/log/webhook paths are proven and should be reused.
- Sentry sourcemaps remain Phase 11 unless build/deploy requires them earlier.
- Mobilization stage-transition workflow remains deferred and must not block Phase 8.

## Immediate Tasks

1. Inspect `git status --short --branch`.
2. Separate intentional Phase 8 product/evidence changes from unrelated local scratch/tooling.
3. Pay special attention to pre-existing unrelated Vercel deployment-control edits:
   - `apps/admin/vercel.json`
   - `apps/donor/vercel.json`
   - `apps/missionary/vercel.json`
   - `docs/ops/deploy-checklist.md`
   - `docs/ops/environments.md`
   - `scripts/vercel/**`
   - `tests/unit/scripts/vercel-ignore-build.test.ts`
     Do not commit these as Phase 8 unless you can prove they are required for Phase 8 finalization. Preserve them separately if they are unrelated.
4. Verify the Phase 8 implementation matches the completion evidence:
   - Supabase support hub migration + rollback exist.
   - Support Hub adapter is Supabase-backed through `adapter/index.ts`.
   - Admin Support Hub hooks route through `/api/admin/support/**`.
   - Resend `email.received` calls `routeInboundToSupportHub()`.
   - Tenant isolation remains enforced server-side and through RLS/migration policy.
   - `/support` uses the route-backed inbox.
5. Strengthen migration proof if possible:
   - Prefer the repo migration verifier with a safe disposable `DATABASE_URL`.
   - If that is not available, repeat the disposable Postgres apply/rollback proof and document the limitation clearly.
   - Do not mutate production data.
6. Run verification before committing:

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
bunx vitest run tests/unit/packages/api/admin/support-hub tests/unit/packages/api/email --coverage=false
bun run test:e2e:smoke -- --grep "Support Hub"
```

7. Commit only intentional Phase 8 product/evidence changes.
8. Push to `origin/production`.
9. Run production readiness against the new pushed Phase 8 commit:

```bash
bun run verify:vercel-production -- --commit $(git rev-parse HEAD)
```

10. Write a repo-finalization evidence file:

`docs/ops/phase-evidence/2026-05-15_phase-08_repo-finalization.md`

That file must record:

- Starting status and commit.
- Which files were included in the Phase 8 finalization commit.
- Which files were left out as unrelated local scratch/tooling.
- Migration proof result.
- Full verification commands and results.
- New pushed commit SHA.
- Vercel production readiness result for the new pushed commit.
- Stop conditions:
  - Phase 9 not started.
  - Phase 10 not started.
  - Phase 11 not started.
  - Production CRM writes not enabled.
  - Mobilization stage-transition workflow not reopened.
  - CMS/giving/CRM ownership boundaries preserved.
  - No secrets committed.

11. Only after the finalization evidence exists, the branch is pushed, and Vercel readiness passes for the new Phase 8 commit, mark Phase 9 safe to begin.

## Expected Final Answer

End with a concise status:

- Whether Phase 8 is now repo-finalized and deployed.
- Final commit SHA.
- Link to `docs/ops/phase-evidence/2026-05-15_phase-08_repo-finalization.md`.
- Whether Phase 9 is safe to begin.
- Any unrelated files intentionally left uncommitted.
