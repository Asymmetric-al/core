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
  never runs the adapter. Only an active key counts; a commented-out key is
  not treated as a policy.
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
  model-invocable skill that must stay without native policy.
- Structural: `bun run skills:verify`, the installed-payload audit test, and
  `bun run format:check`.
- Runtime: `codex debug prompt-input` renders the exact model-visible prompt
  without a model call. On Codex 0.167.0 it lists all 20 skills for implicit
  use before the change and none after it; skills that were already
  explicit-only stay absent and model-invocable skills stay listed.
