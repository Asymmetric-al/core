---
source_name: nolly-studio/components-build-skill (components-build)
source_url: https://github.com/nolly-studio/components-build-skill
source_type: github
upstream_path: skills/components-build/SKILL.md
skills_lock_hash: 55c76ed69a72f69b9e0a19ac08422f64bf88624f4f5f4069903f418883efba97
last_reviewed: 2026-09-16
---

# Upstream: components-build

Canonical copy in this repo: `docs/ai/skills/components-build/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/nolly-studio/components-build-skill
- **Upstream path:** `skills/components-build/SKILL.md`
- **Install via Skills CLI:** `npx skills add nolly-studio/components-build-skill --skill components-build -y`

## Refresh from ecosystem

1. `npx skills add nolly-studio/components-build-skill --skill components-build -y`
2. Reconcile into `docs/ai/skills/components-build/`, restoring the **This repository** Base UI / `base-maia` overlay (no Radix / `asChild`).
3. Preserve this file. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is **not** updated by `bun run skills:refresh-upstream` today.

## Core class-helper adaptation (2026-10-22)

Core component examples consume `cn` from `@asym/ui/lib/utils`; they do not
define another wrapper or install the generic `clsx`/`tailwind-merge` recipe.
The generic npm dependency example is retained as non-operative upstream
material. The existing Base UI / `base-maia` overlay and upstream authors,
MIT attribution, source identity and original `skills_lock_hash` remain intact.

`scripts/lib/components-build-adapter.mjs` applies the reviewed substitutions
and the existing scoped class-helper note to `SKILL.md`, `README.md`, `AGENTS.md`,
`rules/overview.md`, `rules/styling.md` and `rules/npm.md`. The reviewed merge
examples use semantic `bg-primary` / `bg-background` tokens. The same adapter
restores the Base UI render/state guidance described below. Its data file
retains the original reviewed excerpts alongside the Core replacements. It
validates all ten selected documents, including the indices and compiled
snippets, before writing any of them. Competing helper, active legacy
composition/state code and reviewed-source drift fail closed. Provenance,
license notices and raw captures are outside its write set.

Apply that adapter to a complete staged tree during a reviewed manual source
reconciliation, before canonical promotion. `skills:sync` also restores this
contract in `docs/ai/skills/components-build` before any mirror pruning, copying
or manifest publication. Canonical and all three client copies therefore share
the restored bytes, including after raw canonical restoration. This local adapter does not add an
upstream refresh source group or change upstream lock metadata. It preserves an
existing Core Base UI overlay; restore that overlay separately if an upstream
replacement erased it. After review,
run `bun run skills:sync` and non-mutating `bun run skills:verify`.

## Core composition and state adaptation (2026-10-23)

`rules/as-child.md` remains a compatibility index for older references. Its
active recipes use the existing Base UI `render` API, a button host for actions,
and a link with the shared `buttonVariants` for navigation. Custom render hosts
forward the primitive's props and ref to the same DOM node. Only primitives
that support `nativeButton` may use `nativeButton={false}` when deliberately
rendering a non-button host.

The adapter also restores `rules/state.md` and `rules/composition.md`. Examples
reuse Core's flat Accordion exports and the primitive's existing
`value`/`defaultValue`/`onValueChange` or
`checked`/`defaultChecked`/`onCheckedChange` contract. No Radix state helper,
new controllable-state abstraction or inert `asChild` prop is part of these
recipes. The `SKILL.md` / `README.md` indices and compiled `AGENTS.md` chapters
are restored together. The compilation metadata in `rules/_sections.md` uses
the same section 6/9 descriptions; all other metadata sections and unrelated
compiled guidance are retained.

The maintenance fixtures record local pre-correction text as test inputs,
separately from immutable upstream captures. Regression tests cover raw
restoration, formatted idempotence, canonical equality with all three mirrors,
and rejection before any document or mirror/manifest write.

This adaptation grants no new rights. The components-build source-license gap
in `docs/ai/skill-source-audit.json` remains **OPEN**; the retained MIT labels
and author attribution do not resolve that gap. Original source identity,
raw captures, authors, license metadata and `skills-lock.json` identity remain
unchanged.

References: [Base UI composition](https://base-ui.com/react/handbook/composition)
and [shadcn Base UI Button](https://ui.shadcn.com/docs/components/base/button).
