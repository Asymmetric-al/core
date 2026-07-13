# Docs-Unknowns Grill Session Template

Use this as the working document for a planning/interview session.

## Triggers

- Use before complex implementation when the user selected
  `grill-for-unknowns` and material uncertainty remains after inspecting the
  available evidence.
- Do not use for routine work whose facts and low-risk defaults are already
  clear.

## Workflow

1. Capture the original request and current map without treating assumptions as
   facts.
2. Inspect the territory and record evidence before asking the user questions.
3. Classify material gaps in the unknowns ledger and sharpen domain language.
4. Walk the design tree one branch at a time, asking only the next unresolved
   material question with a recommended answer.
5. Record resolved assumptions and ADR candidates, then confirm shared
   understanding before creating an implementation launch packet.

## Request

<User's original request>

## Map

What we currently think is true:

- Goal:
- Current plan:
- Constraints stated by user:
- Existing artifacts/docs/prototypes:

## Territory inspected

Facts the agent checked instead of asking the user:

- Source paths:
- Tests:
- Docs URLs:
- Config/env/deployment:
- Existing patterns:

## Unknowns ledger

### Known knowns

- <Fact> — evidence: <path/doc/test/user statement>

### Known unknowns

- <Decision/question> — why it matters:

### Unknown knowns

Things the user may recognize only when shown examples/prototypes:

- <Taste/product/workflow criterion to expose>

### Suspected unknown unknowns

- <Blindspot> — risk: low/med/high — cheap resolution:

## Domain model

Canonical terms discovered or challenged:

| Term | Meaning | Avoid | Evidence / Source |
| ---- | ------- | ----- | ----------------- |
|      |         |       |                   |

Should update `CONTEXT.md`? yes/no

## Design tree

Walk branch-by-branch. Each branch should either be resolved, defaulted, or blocked.

### Branch: <topic>

- Decision:
- Options:
- Recommended answer:
- Evidence:
- User answer:
- Status: resolved / assumed / blocked

## One-question-at-a-time grill queue

Only ask the next unresolved material decision.

1. Question:
   - Why it matters:
   - Evidence:
   - Recommended answer:
   - If user doesn't care:

## Resolved assumptions

- <Assumption> — why safe enough:

## ADR candidates

Only if hard to reverse + surprising without context + real trade-off.

- Decision:
- Why ADR-worthy:
- Proposed ADR path:

## Implementation launch packet

Do not fill until shared understanding is confirmed. Use `launch-packet.md` from this templates folder.

## Completion Checklist

- [ ] Territory claims cite current source, tests, docs, config, or an explicit
      user decision.
- [ ] Every material unknown is resolved, visibly assumed, or marked blocked.
- [ ] Canonical terms, user decisions, and any ADR candidates are recorded.
- [ ] The user confirmed shared understanding before the launch packet was
      prepared.
