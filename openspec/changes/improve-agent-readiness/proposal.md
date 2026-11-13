# Improve agent readiness of entry instructions

## Why

A review of the instruction system on 2026-11-12 found three kinds of defect
in what agents read first:

- Instructions that direct a wrong action. `/5-ship-working-tree` defaulted
  the pull-request base to `production`. Two commands called an unconditional
  build chain the canonical gate. `README.md` and the contributing guide
  contradicted the adopted route-parameter and semantic-token rules.
- Clients loading the wrong amount. Claude Code did not load seven scoped
  `AGENTS.md` files. Cursor applied six `AGENTS.md` files bundled inside
  skills, 327 KB on disk, to every session.
- No statement of product purpose at any entry point, and no mention that the
  donor application also hosts the public ministry website.

## What Changes

- Root `AGENTS.md` states the product purpose and the four surfaces carried by
  the three applications, linked to the accepted intent specs. Each app file
  names the surfaces it hosts.
- Every scoped `AGENTS.md` gains a sibling `CLAUDE.md` import, checked by a
  unit test.
- `.cursorignore` excludes compiled skill guides from Cursor's always-applied
  rules in every skill root. Skill mirrors keep the same files.
- Commands and guides follow the governing rulebooks: `develop` as the
  pull-request base, `bun run ci:preflight` as the readiness gate, the pinned
  Supabase wrapper, owning-rule pointers for route parameters and tokens, and
  an ignored path for local scratch.
- The testing rulebook names what each kind of check proves. The OpenSpec
  rulebook bounds Apply and Verify to the selected slice.

## Non-goals

- No product-runtime change and no dependency change.
- No OpenSpec version change. No edit to an existing spec, contract, change,
  PRD, ADR, roadmap or acceptance test.
- No test is removed or consolidated.
- The `shadcn@latest` examples in `docs/ai/rules/frontend.md` and
  `packages/ui/AGENTS.md` stay. Both files are hash-bound review proof in
  `tooling/shadcn/upstream-review-baseline.json`.

## Impact

Affected capability: `agent-instruction-system`. The change touches agent
instructions, contributor documentation, generated command and agent mirrors,
ignore files and one unit test. Rollback is a revert; there is no data,
migration or runtime state.
