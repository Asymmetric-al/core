# Comment audit brief

Give this brief to a subagent with its group letter, its input file and its
output file. Replace `<X>` and `<section>` before you send it.

---

You are classifying code comments in one group of files in `<section>` of
this repository. Do the work yourself: start no subagents.

## Hard limits

- **Do not edit, create, format or delete any tracked file.** Do not run
  formatters, linters with `--fix`, `git` write commands, installs or tests.
- Your only output is one JSON file,
  `.tmp/comment-audit/group-<X>.result.json` (`.tmp/` is gitignored), and a
  short final message.
- Read-only commands (reading files, `rg`, `git log`, `git show`) are fine.

## Input

`.tmp/comment-audit/group-<X>.inventory.json` lists your files and every
comment in them: `file`, `line` (first line), `endLine`, `kind` (`Line`,
`Block` or `JSDoc`) and `text`. Classify every entry, each exactly once.
Machine-read directive comments are already excluded.

## What happens with your result

Every comment in this section is being removed, and a lint rule bans new
ones. What happens to each comment depends on your category:

| Category    | Definition                                                             | Consequence                                    |
| ----------- | ---------------------------------------------------------------------- | ---------------------------------------------- |
| `tautology` | Simply repeats what is already visible from the code                   | Deleted                                        |
| `stale`     | References code or implementation information that is not relevant now | Deleted                                        |
| `excuse`    | Lets a hacky implementation stand                                      | Deleted, and a GitHub issue is filed to fix it |
| `decision`  | Documents an important, non-obvious decision about the code            | Deleted, and its content moves into an ADR     |

A wrong `tautology` or `stale` loses knowledge for good, a wrong `excuse`
files a pointless issue, and a wrong `decision` pads an ADR with noise. Be
exact.

## How to judge

Read each whole file first, then judge each comment against the code as it is
now.

- **Tautology.** Deleting it loses nothing a competent reader does not get
  from the names, types and the next few lines. A JSDoc that restates the
  function name or signature, a section divider, a label such as "Arrange" or
  "Helpers", and a comment that narrates the next statement are tautologies.
- **Stale.** It names a symbol, file, flag, route, behaviour, plan step or
  history that is gone or different now. **Verify by searching the
  repository.** If you cannot show it, it is not stale. A comment that only
  tells history ("previously", "used to", "moved from") and sets no present
  constraint is stale.
- **Excuse.** The code beside it is a workaround, shortcut, temporary
  measure, suppression, cast, duplication, swallowed error, magic value or
  unfinished work (`TODO`, `FIXME`, "for now", "temporary", "hack") that a
  better implementation in **our own code** would remove, and the hack is
  still there. If the workaround is forced by something we cannot change (a
  framework, runtime, browser or provider behaviour) and no better
  implementation exists, it is a `decision`.
- **Decision.** It gives a non-obvious _why_: a constraint, invariant,
  security property, ordering requirement, fail-closed choice, trade-off,
  external-system behaviour or contract that the code alone does not show and
  that a later editor could break without knowing.
- A long comment can mix these. Classify by its most valuable content: if any
  part is a real decision, it is a `decision`, and you record only the durable
  part.
- A run of `//` lines is one entry per line. Judge the run as one thought and
  give its lines the same category, except an empty `//` line, which is a
  `tautology`.
- Prefer `tautology` over `decision` when the "why" is ordinary engineering
  that any reader would assume. Prefer `decision` when breaking the rule would
  cause a security, tenancy, money or data bug.

## Output

Write `.tmp/comment-audit/group-<X>.result.json`, valid JSON, in this shape:

```json
{
  "group": "<X>",
  "comments": [
    {
      "file": "packages/example/file.ts",
      "line": 12,
      "category": "tautology | stale | excuse | decision",
      "reason": "One sentence: why this category. For stale, what you searched for and found.",
      "symbol": "The function, constant, type or test the comment sits on, if any",
      "topic": "decision and excuse only: kebab-case slug of the topic it belongs to",
      "decision": "decision only: the decision and its reason, in 1 to 4 plain sentences that make sense in a document with no code beside them. Name the symbol and file. State facts the comment or code supports; add nothing.",
      "sources": [
        "decision only, optional: references the comment cites, such as an ADR, an issue or a plan section"
      ],
      "existingAdr": "decision only, optional: path of a file in docs/adr/ that already records this decision. Claim it only if you opened the file and it says so.",
      "hack": "excuse only: what is hacky in the code, with file and line",
      "fix": "excuse only: what a proper implementation looks like"
    }
  ],
  "topics": [
    {
      "slug": "kebab-case-slug",
      "title": "Short title that states the decision",
      "context": "2 to 5 sentences: the situation and forces that make these decisions necessary, taken from the code and comments."
    }
  ]
}
```

- `file` and `line` must match the inventory exactly, and every inventory
  entry must appear once.
- Aim for 3 to 8 topics for your group. A topic is one area a reader would
  look up.
- Write in plain, direct English. No marketing words, no filler.

## Final message

Reply with the counts per category, the topic slugs, and anything you could
not decide. Nothing else.
