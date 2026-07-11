# Upstream source

- Repository: <https://github.com/nicobailon/grill-for-unknowns>
- Source path: `plugins/grill-for-unknowns/`
- Package version: `0.1.1`
- Reviewed commit: `dc132fc8be26529579cff896e7618550d0d9736b`
- Reviewed commit date: `2026-07-10`
- Imported into Core: `2026-07-12`
- License: MIT; the bundled `LICENSE` preserves the 2026 Matt Pocock and Nico
  Bailon copyright notices.

The complete upstream plugin tree is vendored: `SKILL.md`, `README.md`,
`LICENSE`, both files under `references/`, and all five files under
`templates/`. Core narrows the discovery description, disables implicit Claude
Code invocation, and preserves the marked `CORE-OVERLAY` section in `SKILL.md`
so generic upstream behavior stays subordinate to Core's instruction system.

## Refresh

1. Inspect the live upstream tree, version, commit, license, and changelog.
2. Run `npx --yes skills@latest add nicobailon/grill-for-unknowns -y`.
3. Run `bun run skills:refresh-grill-for-unknowns`.
4. Review the canonical diff, including any new or removed companion files, and
   update the commit metadata above.
5. Run `bun run skills:sync` and `bun run skills:verify`.

The focused refresh copies installer output from
`.agents/skills/grill-for-unknowns/`, reapplies Core discovery compatibility,
and preserves this provenance file plus the marked Core overlay. It refuses to
replace canonical content when upstream frontmatter no longer matches the
reviewed or already-adapted discovery contract; review and intentionally update
the compatibility transform before retrying.
