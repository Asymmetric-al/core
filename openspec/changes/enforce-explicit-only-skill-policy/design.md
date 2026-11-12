## Approach

One decision, expressed once per client. Core's frontmatter is the source of
the explicit-only decision. Codex metadata is derived from it and never
decided separately.

- **Catalog.** Seventeen skills get a policy-only `agents/openai.yaml`, the
  form the catalog already uses. Three skills that ship upstream interface
  metadata get the policy appended.
- **Refresh.** `scripts/lib/managed-skill-compatibility.mjs` already wrote the
  policy for two flagged skills and skipped silently when the file was
  missing. One exported step, `ensureExplicitOnlyNativePolicy`, now reads the
  final `SKILL.md` and writes the policy whenever its frontmatter is
  explicit-only, creating the file when needed. The managed adapter calls it,
  and so do both refresh paths in `scripts/refresh-upstream-skills.mjs` after
  their last frontmatter replacement, including the GitHub clone path that
  never runs the adapter.
- **Safety of the write.** A refreshed tree is upstream content, and the
  GitHub path copies links as links. That path now refuses an upstream skill
  directory that is a link before it copies anything. The step itself refuses
  a linked skill root and a linked or non-regular `SKILL.md`, `agents`
  directory or `agents/openai.yaml` before it reads or writes, so it cannot
  touch a file outside the staged skill.
- **Shape of the edit.** The step edits only the top-level `policy:` mapping,
  so the key text in a comment, a block scalar or a nested mapping is ignored.
  It refuses an inline mapping, a quoted `policy` key and a repeated `policy`
  mapping rather than write a second key and leave the result to the YAML
  loader. A trailing comment on the frontmatter flag still counts as
  explicit-only; a commented-out flag does not.
- **Guard.** `tests/unit/docs/explicit-only-skill-policy.test.ts` checks both
  the canonical tree and the Codex runtime tree, so a refresh on any path that
  drops the policy fails with the fix in its message.
- **Wording.** The four sentence changes are reviewed replacements in
  `scripts/refresh-overlays/managed-core-guidance.json`, applied identically to
  the canonical files.

## Verification

- Unit: the catalog test fails on the 20 skills before the change and passes
  after. The refresh test covers missing metadata, existing interface
  metadata, idempotence, agreement with the committed files, and a
  model-invocable skill that must stay without native policy. The shared step
  is also tested directly: an active `true` policy, a commented-out key, key
  text inside a block scalar, an existing mapping with its own indentation, an
  inline mapping, a quoted or repeated `policy` key, a flag with a trailing
  comment, a commented-out flag, a linked skill root and linked metadata
  paths.
- End to end: a copy of the refresh script runs against a local stand-in for
  the Cursor Team Kit repository. It writes the policy for a skill whose
  upstream ships no Codex metadata, and it fails without publishing when the
  upstream skill directory is a link. This test runs on Linux only.
- Structural: `bun run skills:verify`, the installed-payload audit test, and
  `bun run format:check`.
- Runtime: `codex debug prompt-input` renders the exact model-visible prompt
  without a model call. On Codex 0.167.0 it lists all 20 skills for implicit
  use before the change and none after it; skills that were already
  explicit-only stay absent and model-invocable skills stay listed.
