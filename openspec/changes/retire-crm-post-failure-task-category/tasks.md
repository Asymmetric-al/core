## 1. Reconcile the requirement with shipped behavior

- [x] 1.1 Confirm the shipped behavior matches the delta. Evidence
      (2026-11-16): `listContributionNeedsAttention` excludes
      `RETIRED_NEEDS_ATTENTION_ISSUE_TYPES` and keeps the rows
      (`packages/api/src/admin/mission-control-tasks/store.ts`);
      `tests/unit/packages/api/admin/mission-control-needs-attention.test.ts`
      and `tests/unit/apps/admin/app/contributions-page.test.tsx` pass (2
      files, 40 tests). No code change and no new test are needed.
- [x] 1.2 Confirm no other accepted spec, contract or active delta lists CRM
      post failures as live follow-up work. Evidence (2026-11-16):
      `git grep -i "CRM post failure"` outside the archive finds only this
      requirement and dated Contribution Detail design records.
- [x] 1.3 Pass strict validation of this change
      (`bun run openspec -- validate retire-crm-post-failure-task-category --strict`)
      and `bun run verify:openspec-deltas`.

## 2. Acceptance

- [ ] 2.1 Owner reviews the corrected wording and the change merges through an
      ordinary pull request. Verify with the merged PR.

## Workflow follow-up

- Archive after merge so the corrected requirement reaches
  `openspec/specs/platform-boundaries/spec.md`.
