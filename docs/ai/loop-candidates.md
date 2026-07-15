# Repo Groundtruth — Loop Candidates

Unresolved items from run `20260713T064439Z-0ebb0cc3` (snapshot
`0ebb0cc3494608f630f556c0a6c3a9ffcbbe59e7`) that warrant future work. These are
**not** groundtruth and were **not** patched. Only items with a real missing
discriminator belong here.

## LC-01 — Effective TypeScript version vs `apps/donor` manifest range

- **Question.** Root `package.json` pins `typescript: 6.0.3` and `README.md`
  documents `6.0.3`, but `apps/donor/package.json` declares `typescript: ^5.7.3`
  (a range that excludes 6.x). Which TypeScript version actually resolves for the
  donor app under Bun workspace hoisting?
- **Current classification.** Likely (root/README say TS 6; a prior repo note also
  states "core is on TS 6") — but not proven for `apps/donor` from manifests alone.
- **Evidence already checked.** Root + `apps/donor` `package.json`; `README.md:369`.
- **Missing evidence.** Resolved version from the install tree (e.g. the version
  under `node_modules/.bun`/hoisted `typescript`), or a `tsc --version` run per app.
- **Next discriminator.** Inspect the installed `typescript` package version the
  donor typecheck actually uses (lockfile resolution or `bunx tsc --version` inside
  the donor workspace).
- **Expected value.** Medium — clarifies whether the `^5.7.3` range is dead (hoisted
  to 6.x) or a genuine per-app divergence that could drift.
- **Access/authority.** None beyond a working `bun install` tree.
- **Could change groundtruth?** No for the app inventory; it would only refine the
  "TypeScript version" nuance (C-03) and possibly surface a manifest-hygiene
  follow-up.

## LC-02 — GitHub branch-protection and code-owner enforcement

- **Question.** Are the required checks documented in `docs/ci.md`
  (`develop`: `ci-gate`/`integration-gate`/`e2e-smoke-gate`; `production`:
  `release-source-gate`/`ci-gate`/`integration-gate`/`e2e-gate`) and the
  `CODEOWNERS` review requirement actually enforced on GitHub?
- **Current classification.** Needs human judgment / platform access (Unknown).
- **Evidence already checked.** `docs/ci.md` §Branch protection; `CODEOWNERS`;
  `.github/workflows/release-source.yml`.
- **Missing evidence.** GitHub repo branch-protection settings (API/admin UI).
- **Next discriminator.** Read branch-protection rules via GitHub settings/API for
  `develop` and `production`.
- **Expected value.** High for anyone reasoning about merge safety.
- **Access/authority.** Requires GitHub repo admin/settings read access.
- **Could change groundtruth?** It would upgrade U-01 from Unknown to a confirmed
  policy-vs-platform match/mismatch. Out of scope for this loop (no PR/issue/repo
  settings actions permitted).

## LC-03 — Exact workflow job → script wiring for the six unlisted workflows

- **Question.** What do `auto-merge.yml`, `autofix.yml`,
  `configure-resend-production-webhook.yml`, `nia-source-check.yml`,
  `qa-smoke-preview-deploy.yml`, and `sync-vercel-production-env.yml` actually run,
  step by step, and should any be added to `docs/ci.md`?
- **Current classification.** Likely-benign omission from `docs/ci.md` (bounded
  limitation U-03), not staleness.
- **Evidence already checked.** File listing + first-20-line trigger sampling of
  each.
- **Missing evidence.** Full YAML job/step parse; a policy decision on whether
  `docs/ci.md`'s scope should enumerate them.
- **Next discriminator.** Read each workflow's `jobs:` in full and compare against
  `docs/ci.md`'s stated scope.
- **Expected value.** Low–Medium — `docs/ci.md` is scoped to the gate pipeline, so
  this may be intentional; confirming avoids a false "docs are exhaustive" reading.
- **Access/authority.** None (repo-local).
- **Could change groundtruth?** Only if a workflow turns out to be a hidden required
  gate; nothing sampled suggests that.

## LC-04 — Stale architecture docs (RESOLVED this run)

- **Question.** `docs/guides/architecture/overview.md` (Next 16.1 / TS 5.9 / "seven
  shared packages") and `docs/ai/monorepo-architecture.md` (omits
  `packages/mock-data`) were Confirmed stale (repo-groundtruth §7 S-01/S-02) but
  were not writable under the original loop scope. Who updates them?
- **Current classification.** **Resolved.** A follow-up instruction expanded scope
  and both docs were corrected in this run: `overview.md` version rows → 16.2.6 /
  6.0.3, package count → "eleven", and `api`/`graphql`/`missionary`/`mock-data`
  added to its directory tree; `monorepo-architecture.md` → `packages/mock-data →
@asym/mock-data` added to the tree and Packages list.
- **Evidence already checked.** Direct version/count comparison against manifests
  (see repo-groundtruth §6/§7); post-edit `prettier --check` and `git diff --check`.
- **Missing evidence.** None.
- **Next discriminator.** None — closed.
- **Expected value.** Realized: onboarding docs no longer state false counts/versions.
- **Access/authority.** Was granted by the follow-up scope expansion.
- **Could change groundtruth?** No — the edits brought those docs into line with the
  already-confirmed groundtruth.
