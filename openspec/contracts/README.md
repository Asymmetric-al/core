# Binding contract sections

Core requirements keep concise observable descriptions alongside their original
scenarios. Where a full contract exceeds the CLI's description limit, its
unabridged clauses live in a content-addressed section here. The requirement
unconditionally incorporates that section with:

```text
Every clause in `openspec/contracts/<capability>.md#contract-<digest>` MUST apply without exception.
```

These are repository-root references, independent of the referencing file's
depth. Read the exact referenced section before interpreting, implementing,
verifying, synchronizing, or archiving the requirement. Its clauses apply to
every scenario and every other applicable context; a short description or a
single scenario never limits them. This is a Core authoring convention.

The reference determines status. A section referenced by a proposed delta is
proposed; it is not accepted merely because its file exists. Different versions
of a requirement retain different sections. Historical sections remain available
for provenance and impose no present behavior without a current reference.
Normal owner authority and explicit supersession still apply.

Preserve every clause when editing or replacing a reference. Never change a
content-addressed section in place. Create a new section for a ratified amendment
and reconcile its reference through the usual OpenSpec workflow. The digest
includes capability, requirement identity, and exact complete body; only line
endings and surrounding blank space are normalized. Inline code, list nesting,
and fenced examples retain whitespace. Prettier ignores bounded
sections to retain the original contract text.

For source-owned projections, edit the declared canonical source. The generator
passes its complete formatted projection through
`scripts/lib/openspec-contracts.mjs` (or the stdin CLI
`scripts/openspec-contract-view.mjs`). Write mode adds missing sections; check
mode verifies them without writes. Generated sections are derived views, not
independent authoring sources. `summaries.json` supplies concise descriptions
only when a complete first sentence will not fit; it cannot replace any clause.

`bun run verify:openspec-deltas` verifies references before and after the pinned
merger, including requirement identity, unconditional incorporation, section
presence, and content digest. It also checks durable and archived references.
Strict upstream validation remains enabled.

Once a requirement identity has a companion, subsequent versions keep a full
binding section even when their body becomes short. This makes omission,
conditional prefixes, comments, and fenced examples fail closed. The explicitly
listed pre-migration archives in `legacy-archives.json` retain their original
inline format as immutable history. They predate this convention; current and
newly archived contracts receive the full reference check.
