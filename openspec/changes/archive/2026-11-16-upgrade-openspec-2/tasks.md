## 1. Scenario triggers

- [x] 1.1 Give a criterion that states no trigger its owning story, verbatim,
      as the scenario's `GIVEN` step in the Phase 28 and Phase 29 renderers.
- [x] 1.2 Regenerate both projections from their canonical volumes.
- [x] 1.3 Prove no loss: each spec minus the inserted lines is byte-identical
      to its previous version, each inserted line equals its owning story,
      and the contract companions, traceability files, main PRD files and
      canonical volumes are unchanged.
- [x] 1.4 State the trigger rule next to each renderer in
      `docs/ai/document-authority.md`.

## 2. Reviewed cohort

- [x] 2.1 Pin `@fission-ai/openspec` 2.0.0 in `package.json` and `bun.lock`.
- [x] 2.2 Move the refresh tag to `v2.0.0`, refresh the seven imported
      skills, and regenerate their mirrors and installed-payload hashes.
- [x] 2.3 Move the pin constants in
      `tests/unit/docs/openspec-modernization.test.ts`.
- [x] 2.4 Rebind the manifest and lockfile hashes in the Shadscan findings
      and React Doctor exceptions after confirming the lockfile change is
      confined to the OpenSpec record.
- [x] 2.5 State how an upgrade moves, and what `openspec update` does here,
      in `docs/ai/rules/openspec.md`.
- [x] 2.6 Record the v2.0.0 source review for the seven skills in
      `docs/ai/skill-source-audit.json` and the skills maintenance log, and
      make the pin test check it.

## 3. Verify

- [x] 3.1 Strict validation passes on 1.14.3 after the projection commit and
      on 2.0.0 after the cohort commit, with no warnings.
- [x] 3.2 The archive audit, delta compatibility, phase checks, skill mirror
      verification, formatting and the five OpenSpec unit test files pass on
      2.0.0.
- [x] 3.3 The pre-push `bun run ci:preflight` and pull-request CI pass.
