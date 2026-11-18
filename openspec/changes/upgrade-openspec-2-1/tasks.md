## 1. Reviewed cohort

- [x] 1.1 Move the pin constants in
      `tests/unit/docs/openspec-modernization.test.ts` and shape the refresh
      test's upstream fixture like 2.1; watch both fail.
- [x] 1.2 Pin `@fission-ai/openspec` 2.1.0 in `package.json` and `bun.lock`,
      and confirm every added lockfile record descends from it.
- [x] 1.3 Move the refresh tag to `v2.1.0`, remove the three replacements that
      match nothing in 2.1, and remove the new Store sentence from Apply.
- [x] 1.4 Refresh the seven imported skills, read each diff, and regenerate
      their mirrors and installed-payload hashes.
- [x] 1.5 Record the v2.1.0 source review for the seven skills in
      `docs/ai/skill-source-audit.json` and the skills maintenance log.
- [x] 1.6 Record `skillsScope: project` in `openspec/config.yaml` and state
      what the 2.1 updater does here in `docs/ai/rules/openspec.md`.
- [x] 1.7 Rebind the manifest hash in the Shadscan findings after confirming
      the eight findings that cite it still hold.

## 2. Refresh portability

- [x] 2.1 Make the refresh check upstream out with its committed line endings
      and find the Prettier launcher Bun installs, so Windows and Linux write
      the same bytes.
- [x] 2.2 Give canonical skill sources the LF rule their mirrors already have,
      so a sync on Windows copies the committed bytes.

## 3. Verify

- [ ] 3.1 The local wrapper reports 2.1.0, and strict validation, the archive
      audit, delta compatibility, the phase checks, skill mirror verification
      and formatting pass.
- [ ] 3.2 The OpenSpec and skill unit tests pass on 2.1.0.
- [ ] 3.3 The pre-push `bun run ci:preflight` and pull-request CI pass.
