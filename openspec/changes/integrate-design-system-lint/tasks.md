## 1. Authority and compatibility

- [x] 1.1 Verify live develop/default branch, PR #1655 body/diff/review status,
      instruction ownership, supported roles, and applicable OpenSpec authority.
- [x] 1.2 Verify official upstream docs, six guides, published exports,
      source/release provenance, supported toolchain, and compatible pinned version.
- [x] 1.3 Inventory representative existing findings and measure baseline lint
      cost for app-local, shared-UI, and broader relevant runs.

## 2. Policy and adoption

- [x] 2.1 Add meaningful failing compatibility tests using actual exported
      config; cover six rules, parsers, boundaries, imports, aliases, wrappers,
      helpers, themes, custom/external classes, and false-discovery cases.
- [x] 2.2 Implement one tooling-owned blocking policy and explicit
      consumer/authoring/runtime profiles in every relevant root/workspace config.
- [x] 2.3 Classify the full applicable inventory; fix bounded safe patterns and
      adopt only justified rule-specific legacy debt with prune/raw-report behavior.
- [x] 2.4 Prove new files and violations fail, no normal command expands debt,
      scoped/full runs agree, and authored exceptions do not leak to consumers.

## 3. Execution and evidence

- [x] 3.1 Wire discovery health, existing commands/CI, shared cache inputs,
      and affected consumer selection without adding a separate policy pipeline.
- [x] 3.2 Prove cold/warm cache reuse and shared-only invalidation/new diagnostics
      in isolated fixtures; retain default hashing and existing gates.
- [x] 3.3 Measure app-local, shared-UI, and broader cost after adoption; investigate
      material regressions and verify rendered behavior where corrections change it.

## 4. Agent workflow and completion

- [x] 4.1 Extend the Core shadcn overlay reference, scoped UI guidance, actual
      client/role routes, and instruction-routing tests; preserve explicit-only
      invocation settings and PR #1655 compatibility.
- [x] 4.2 Run skills:sync, review generated changes, and pass non-mutating
      skills:verify while preserving ecosystem-owned assets.
- [x] 4.3 Record version/provenance, matrix/exceptions, commands, debt limits,
      analysis limits, upgrade/rollback procedure, and actual verification evidence.
- [x] 4.4 Pass focused tests, strict OpenSpec validation, relevant UI guardrails,
      and the required ci:preflight gate; investigate and report genuine blockers.
- [x] 4.5 Perform independent adversarial QA and OpenSpec alignment review,
      repair substantive findings, and leave a truthful local diff/branch summary.

Implementation was initially authorized through a validated local diff. The
subsequent user request authorizes PR publication, tracked by
[AL-1864](https://github.com/Asymmetric-al/core/issues/1864). Keep this change active
until implementation is merged and accepted repository reality. Checked tasks
require actual evidence; a generated artifact or clean process exit alone is
not acceptance proof.

Verification and gate evidence: [verification.md](verification.md).

Task 4.4 passed after the user-authorized, provenance-bound attribution repair
recorded in `fix-github-merge-attribution`. That local acceptance preflight
exited 0 in 188.58 seconds, including 4,034 passing tests. No bypass, identity
or history change, commit, publication, or archive was performed during that
phase. That implementation is superseded by the now-merged team workflow in
PR #1428; the active attribution change records its reconciliation and residual
parser hardening. Published-head CI, review, and approval evidence belongs to
the linked PR.

## 5. Current-upstream modernization and complete legacy cleanup

Authorized on 2026-09-22; the user explicitly included legacy UI cleanup.

- [x] 5.1 Research latest published analyzer, official setup/rules/analysis
      documentation, package integrity, Core patch applicability and compatible
      linter/toolchain peers; record current evidence and known limits.
- [x] 5.2 Add failing regressions for resolved upstream analysis gaps, upgrade
      compatible dependencies and remove or rebase only a demonstrated patch.
      Pass all actual-config compatibility, discovery, command and cache tests.
- [x] 5.3 Produce a fresh raw inventory and a persistent per-surface cleanup
      ledger covering every applicable file and finding category.
- [ ] 5.4 Repair admin UI debt and verify affected behavior and rendering.
- [ ] 5.5 Repair donor UI debt and verify affected behavior and rendering.
- [ ] 5.6 Repair missionary app UI debt and verify affected behavior and rendering.
- [ ] 5.7 Repair shared UI and missionary library debt with consumer coverage
      and verification of affected behavior and rendering.
- [ ] 5.8 Fix ordinary lint warnings, review permanent exceptions, complete a
      full raw scan with zero findings and deliberately retire the bulk baseline.
- [ ] 5.9 Update canonical guidance and generated mirrors, version/rollback
      records and measured evidence; pass required local and published-head gates.
- [ ] 5.10 Independently audit every completion requirement against current
      source, diagnostics, behavioral/rendered evidence and PR state.
