---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

If the user passes a ticket reference, fetch it from the issue tracker and state its title before starting. If the reference is ambiguous, ask.

Apply Core `tdd` at an established public seam. Ask only when material behavior or the seam is ambiguous.

Run typechecking and single test files regularly. Before review, run the gate that fits the change as `docs/ai/rules/testing.md` describes: `bun run check` for a tight loop and `bun run ci:preflight` before a pull request.

Once done, call the Skill tool with "code-review" to review the work.

Commit to the current branch when the task authorizes committing, following the repository commit and verification rules.
