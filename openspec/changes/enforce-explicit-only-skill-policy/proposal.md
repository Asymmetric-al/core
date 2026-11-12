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
- Make the policy survive an upstream refresh. The managed adapter derives it
  from Core's explicit-only frontmatter and creates the metadata file when
  upstream ships none. The two directly copied skills preserve the file.
- Route domain reading in `tdd`, `diagnosing-bugs` and
  `improve-codebase-architecture` through `docs/agents/domain.md`, and replace
  the full-suite instruction in `implement` with the repository gate policy.
  Both use reviewed replacements, so a refresh keeps them.

## Non-goals

- No skill is added, removed or reclassified. Model-invocable skills stay
  model-invocable.
- `skills-lock.json` is unchanged; its hashes describe upstream sources.
- The Cursor Team Kit refresh path gains no preservation step. A refresh that
  drops the policy from `pr-review-canvas` or
  `thermo-nuclear-code-quality-review` fails the catalog test instead.

## Impact

Affected capability: `agent-instruction-system`. The change touches canonical
skills and their mirrors, the managed refresh adapter and its config, the
installed-payload audit and two unit tests. There is no product runtime
change. Rollback is a revert.
