# Domain Modeling Add-On

Use this when a grill-for-unknowns session reveals fuzzy terminology, overloaded concepts, or durable architectural/product decisions.

## Triggers

- A grill reveals ambiguous, conflicting, or overloaded domain terms.
- A material decision is hard to reverse, surprising without context, and
  represents a real trade-off.
- Do not create domain files merely because the templates exist.

## Workflow

1. Inspect the repository's existing language, context maps, and ADR location
   before proposing new files or terms.
2. Challenge ambiguous language during the grill and select one canonical term
   only when the evidence and user decision support it.
3. Create or update `CONTEXT.md` lazily for durable domain language, using the
   format below and the bundled template only when it fits the repository.
4. Offer an ADR only when all three ADR criteria below are satisfied, then use
   the repository's existing format and numbering convention.
5. Verify that recorded terms and decisions match current source evidence and
   the user's confirmed understanding.

## Repository files

Most projects can use:

```txt
/
├── CONTEXT.md
├── docs/
│   └── adr/
│       ├── 0001-example-decision.md
│       └── 0002-another-decision.md
└── src/
```

Multi-context projects may use:

```txt
/
├── CONTEXT-MAP.md
├── docs/adr/                 # system-wide decisions
└── src/
    ├── ordering/
    │   ├── CONTEXT.md
    │   └── docs/adr/         # context-specific decisions
    └── billing/
        ├── CONTEXT.md
        └── docs/adr/
```

Create files lazily. Do not add `CONTEXT.md` or ADRs until there is something worth recording.

## CONTEXT.md purpose

`CONTEXT.md` is a glossary / ubiquitous language file. It is **not** a spec, scratchpad, implementation notes file, or ADR.

Use it to record terms that are specific to the domain/project context.

Do not add generic programming concepts just because the project uses them.

## CONTEXT.md format

Use `../templates/CONTEXT.md` as the skeleton.

Rules:

- Be opinionated: pick one canonical term.
- Keep definitions tight: one or two sentences.
- Define what the thing **is**, not implementation details about what it does.
- Add `_Avoid_` terms when synonyms would cause confusion.
- Group terms under subheadings only when clusters naturally emerge.

## During the grill

Challenge language immediately:

- "You said `account`; do you mean `Customer`, `User`, or `Workspace`? Those are different in this codebase."
- "The code uses `Project`, but the plan says `Job`. Should `Job` become the canonical product term, or should the plan use `Project`?"
- "Your glossary defines `Cancellation` as canceling the whole order, but the new flow implies partial cancellation. Which is the domain truth?"

When a term crystallizes, update `CONTEXT.md` immediately rather than batching.

## ADR rules

Offer an ADR only when all three are true:

1. **Hard to reverse** — changing later has meaningful cost.
2. **Surprising without context** — a future reader would wonder why this path was chosen.
3. **Real trade-off** — there were genuine alternatives and the choice matters.

Skip ADRs for obvious, reversible, or purely mechanical choices.

## ADR format

ADRs live in `docs/adr/` and use sequential numbering:

```txt
docs/adr/0001-short-slug.md
docs/adr/0002-next-decision.md
```

Use `../templates/ADR.md` as the skeleton: a short title plus 1-3 sentences (context, decision, why), with Status / Considered Options / Consequences sections only when they add value.

## What qualifies for ADRs

- Architectural shape.
- Integration pattern between contexts.
- Technology choice with lock-in.
- Boundary/scope decision.
- Deliberate deviation from the obvious path.
- Constraint not visible in code.
- Non-obvious rejected alternative.

## Checklist

- [ ] The trigger is a real terminology or durable-decision need, not template
      availability.
- [ ] Existing repository language and documentation were inspected first.
- [ ] Each recorded term is canonical, concise, and supported by evidence.
- [ ] Files were created or changed lazily in the repository's established
      locations and formats.
- [ ] Every ADR satisfies all three criteria and records the real trade-off.
- [ ] The resulting domain model was checked against source evidence and the
      user's confirmed decision.
