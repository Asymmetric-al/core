## 1. Merge Captain command

- [x] 1.1 Add `.claude/commands/merge-captain.md` with the autonomous shepherding loop
- [x] 1.2 Encode the queue rule (open non-draft develop PRs at `automation:pr-intake-ready`,
      excluding `needs-human`)
- [x] 1.3 Encode the strict priority order: CI → stale/conflict → triaged findings → test-gap →
      finalize/auto-merge
- [x] 1.4 Encode the Fix / Dismiss-with-reason / Escalate triage and the severity contract
- [x] 1.5 Encode the mandatory test-gap pass and the plain-English Merge Report
- [x] 1.6 Encode hard limits (≤5 fix-iterations, ≤6 pushes, one flaky re-run) and guardrails
      (no CI/test/workflow weakening, no `automation:*` writes, secrets scan, attribution)
- [x] 1.7 Make it model-agnostic and host-agnostic (local `/loop`, cloud session, routine)

## 2. GitHub state (maintainer-applied, out-of-band)

- [x] 2.1 Enable repository auto-merge
- [x] 2.2 Remove the required pull-request review on `develop`; keep required checks
      (`ci-gate`, `integration-gate`), `enforce_admins`, and strict up-to-date
- [x] 2.3 Create labels `needs-human`, `captain:merged-clean`, `captain:merged-with-findings`
- [x] 2.4 Confirm fine-grained PAT scopes: Contents, Pull requests, Issues, Checks,
      Administration, **Workflows** (write — required to push `.github/workflows/` deletions)

## 3. Trim the human-gate plumbing

- [x] 3.1 Delete `.github/workflows/codex-review-notify-code-owner.yml`
- [x] 3.2 Delete `.github/reviewers.yml`
- [ ] 3.3 Operator: pare the Cursor review "lens" battery to Bugbot + Security Reviewer; identify
      the "Blake's Automation" check
- [ ] 3.4 Operator: confirm Greptile severity threshold tuning is live (done as of this change)

## 4. Docs and review guidance

- [x] 4.1 Add the "Review guidelines" section to `AGENTS.md` (severity contract for review bots)
- [x] 4.2 Add `docs/guides/development/merge-captain-pipeline.md` (runbook + GitHub settings +
      how to start the loop + how to reverse each change)

## 5. Validation and rollout

- [ ] 5.1 Open this change as a PR into `develop` and let the new pipeline shepherd it
- [ ] 5.2 Release `develop` → `production` so the PR Signal Coordinator activates on the default
      branch (separate release PR)
- [ ] 5.3 Run `merge-captain` against the open-PR backlog and verify clean-merge vs. escalation
- [ ] 5.4 After burn-in, evaluate promoting `test:e2e:production-gate` to a required `develop` check
- [ ] 5.5 `bunx @fission-ai/openspec@latest validate add-merge-captain-pipeline` then archive when
      genuinely complete
