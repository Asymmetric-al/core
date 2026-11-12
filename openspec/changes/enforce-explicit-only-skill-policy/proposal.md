# Enforce explicit-only skill policy in every client

## Why

Ninety-two runtime skills, 83 of them canonical, are marked explicit-only with
`disable-model-invocation: true`.
Claude Code and Cursor read that frontmatter key. Codex does not: its released
parser ignores the key and allows implicit invocation unless
`agents/openai.yaml` sets `policy.allow_implicit_invocation: false`. Twenty
canonical skills lacked that native policy, so Codex could invoke skills that
Core reserves for an explicit request, including alternative design-system and
review workflows.

Four imported skills also told agents to read the whole root `CONTEXT.md`, or
to run the full test suite at the end, where the repository already defines a
narrower route.

## What Changes

- Add the native policy to the 20 skills and regenerate the runtime mirrors
  and installed-payload hashes.
- Add a catalog test: every explicit-only skill carries the native policy.
- Make the policy survive an upstream refresh. Both refresh paths derive it
  from the final explicit-only frontmatter and create the metadata file when
  upstream ships none.
- Route domain reading in `tdd`, `diagnosing-bugs` and
  `improve-codebase-architecture` through `docs/agents/domain.md`, and replace
  the full-suite instruction in `implement` with the repository gate policy.
  Both use reviewed replacements, so a refresh keeps them.

## Non-goals

- No skill is added, removed or reclassified. Model-invocable skills stay
  model-invocable.
- `skills-lock.json` is unchanged; its hashes describe upstream sources. The
  `treeHash` it records for `pr-review-canvas` and
  `thermo-nuclear-code-quality-review` predates the new metadata file. No
  script reads that value, and the next Cursor Team Kit refresh rewrites it.

## Impact

Affected capability: `agent-instruction-system`. The change touches canonical
skills and their mirrors, the managed refresh adapter and its config, the
installed-payload audit and three unit tests. There is no product runtime
change. Rollback is a revert.
