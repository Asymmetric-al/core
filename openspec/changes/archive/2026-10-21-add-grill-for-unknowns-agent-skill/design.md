# Design: Grill for Unknowns Integration

## Context

The reviewed upstream repository at
`dc132fc8be26529579cff896e7618550d0d9736b` contains one version `0.1.1` skill
with ten interdependent files under `plugins/grill-for-unknowns/`. The skill is
self-contained, but its broad discovery description and generic file-writing
guidance overlap Core's existing instruction system.

## Decisions

### Canonicalize the complete plugin tree

Promote all ten plugin files into `docs/ai/skills/grill-for-unknowns/`, retain
the bundled MIT license and lineage references, and add Core's normal pinned
`references/upstream.md`. The canonical tree, not installer output, is the
durable source for all runtime mirrors.

### Make deep grilling explicit and non-overlapping

Narrow the discovery description and set `disable-model-invocation: true` for
Claude Code. `AGENTS.md` supplies the equivalent Codex/Cursor route:

- ordinary plan stress test -> `grilling`;
- ordinary repo-backed grill plus domain persistence -> `grill-with-docs`;
- stateless no-codebase interview -> `grill-me`;
- deep unknown taxonomy, blindspot/prototype pass, or launch packet ->
  `grill-for-unknowns`;
- work too large for one context -> `wayfinder`.

Explicit user invocation always wins. Complexity alone is not enough to pause
authorized implementation.

### Preserve Core authority with a marked overlay

The overlay translates upstream Explore/Plan language into a client-neutral
planning posture, requires current evidence before questions, and keeps writes
within the user's authorized scope. OpenSpec and Core's canonical
`domain-modeling` formats govern durable intent, glossaries, and ADRs. Bundled
templates remain available for portability and temporary working artifacts.

### Keep upstream refresh deterministic

The Skills CLI updates `.agents/skills/` and `skills-lock.json`. A focused repo
refresh copies that tree into the canonical location, reapplies narrowed
frontmatter, preserves the Core overlay/provenance, and is followed by
`skills:sync` plus `skills:verify`. Before replacing canonical content, the
focused refresh requires either the reviewed upstream frontmatter or Core's
already-adapted form, then asserts the explicit-only description and invocation
guard after transformation. Unrecognized upstream discovery drift fails
without touching the canonical skill.

## Verification

- Assert the expected ten upstream files plus Core provenance.
- Assert the lock source/path/hash and explicit-only frontmatter.
- Assert every canonical file is byte-identical in `.agents`, `.cursor`, and
  `.claude`, while allowing legitimate runtime-only extras.
- Assert deterministic routing and `CLAUDE.md`'s one-line import.
- Run the focused refresh, sync regression suite, formatting, clean-snapshot
  skill verification, and strict OpenSpec validation.
