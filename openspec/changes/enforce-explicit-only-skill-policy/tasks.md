## 1. Native explicit-only policy

- [x] 1.1 Add a catalog test that fails for an explicit-only skill without
      native Codex policy.
- [x] 1.2 Add the policy to the 20 canonical skills.
- [x] 1.3 Derive the policy from the final frontmatter in one shared step,
      create missing metadata, and call it from the managed adapter and both
      refresh paths.
- [x] 1.4 Regenerate runtime mirrors and installed-payload hashes.
- [x] 1.5 Refuse linked skill paths and ambiguous `policy` keys instead of
      writing through or beside them, and cover the GitHub refresh path end
      to end.

## 2. Imported skill wording

- [x] 2.1 Route domain reading in `tdd`, `diagnosing-bugs` and
      `improve-codebase-architecture` through `docs/agents/domain.md`.
- [x] 2.2 Replace the full-suite instruction in `implement` with the
      repository gate policy.

## 3. Verify

- [x] 3.1 Structural and unit checks pass on Linux, including
      `skills:verify` and the installed-payload audit.
- [x] 3.2 Codex 0.167.0's rendered prompt (`codex debug prompt-input`) lists
      all 20 skills before the change and none after it, with control skills
      unchanged.
- [ ] 3.3 The pre-push `bun run ci:preflight` and pull-request CI pass.
