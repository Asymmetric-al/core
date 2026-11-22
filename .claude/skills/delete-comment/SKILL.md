---
name: delete-comment
description: "Remove code comments from a section of Core. Classifies every comment as tautology, stale, excuse or decision record, deletes them, files an issue for each excuse, moves each decision record into an ADR, and lowers the comment ratchet. Use when the user runs /delete-comment or asks to delete, audit or clean up comments in a path, and when the `core/no-comments` lint rule or `bun run verify:comments` fails."
metadata:
  owner: core
  last_updated: 2026-11-22
  status: active
  version: "1.0.0"
---

# Delete comments

Comments are banned in Core's TypeScript and JavaScript source
([#2751](https://github.com/Asymmetric-al/core/issues/2751)). The lint rule
`core/no-comments` refuses a comment in a new file. For a file that already
had comments, `tooling/eslint-config/comment-baseline.json` records how many,
and that number only goes down. This skill takes one section to zero.

The vendored `no-comments` skill is a different tool: an explicit-only review
of the comments in one diff. Use this skill for a section of the codebase and
for anything about the ban or its baseline.

## If you only hit the gate

- **You wrote a comment.** Delete it. Say it in the code: a name, a type, a
  test. If it records a decision, write the decision where step 5 says. If it
  excuses a workaround, fix the workaround or file the issue from step 4.
- **`verify:comments` says the baseline is out of date.** Comments were
  deleted. Run `bun run verify:comments -- --write` and commit the baseline.
- **`verify:comments` says a file gained comments.** Delete the new ones. No
  flag raises a count.
- **A tool reads the comment** and the rule does not know its form. Add the
  pattern to `tooling/eslint-config/no-comments.mjs` with a case in
  `tests/unit/scripts/no-comments-lint-rule.test.ts`. Never reword prose so
  that it passes for a directive.

## The pass

Work on one section per pull request: one workspace or one directory, about
500 comments at most. Change no code in this pass.

### 1. Choose the section

The argument is a path. With no argument, run
`bun run verify:comments -- --report`, which lists comments and comment-only
lines by area, and propose the area with the most lines that fits one pull
request.

### 2. List every comment

```bash
node scripts/delete-comments.mjs list <path> > .tmp/comment-audit/inventory.json
```

`.tmp/` is gitignored. Each entry has `file`, `line`, `endLine`, `kind` and
`text`. A run of `//` lines is one entry per line: judge the run as one
thought.

### 3. Classify each one

Read the whole file before judging its comments.

| Category        | Meaning                                                              | What happens                              |
| --------------- | -------------------------------------------------------------------- | ----------------------------------------- |
| Tautology       | Repeats what the names, types and next few lines already say         | Deleted                                   |
| Stale           | Describes code, behaviour or history that is gone or different now   | Deleted                                   |
| Excuse          | Lets a workaround in our own code stand                              | Deleted, and an issue is filed to fix it  |
| Decision record | Gives a non-obvious reason that a later editor could break unknowing | Deleted, and the reason moves into an ADR |

- **Stale needs proof.** Search the repository for what the comment names. If
  you cannot show it is gone or different, it is not stale.
- **Excuse or decision.** A workaround that a better implementation in our
  code would remove is an excuse. One forced by a framework, runtime, browser
  or provider that we cannot change is a decision.
- **Tautology or decision.** Ordinary engineering that any reader assumes is
  a tautology. If breaking it would cause a security, tenancy, money or data
  bug, it is a decision.
- A long comment that mixes these takes the category of its most valuable
  part. Record only the durable part.

For a section of more than about 100 comments, split the files into groups
and give each group to a subagent with
[`references/classifier-brief.md`](references/classifier-brief.md). The
subagents write JSON and edit nothing. Then check their work yourself: every
stale, every excuse, a sample of the tautologies, and any group that put more
than 85% of its comments in one category.

### 4. File an issue for each excuse

1. Confirm the workaround is still in the code.
2. Search open issues for it. One issue per workaround, however many comment
   lines describe it.
3. Title the issue with the fix. In the body give the file and line, what is
   wrong, what a proper implementation looks like, and the comment's text.
   Apply exactly one `type:*` and one `complexity:*` label
   (`docs/ai/rules/general.md`).

File the issues when the user asked for this pass. Otherwise list them and
ask first.

A lint or TypeScript suppression (`eslint-disable`, `@ts-expect-error`) is an
excuse the pass cannot delete: the gate it silences would fail. It stays,
with the tracking reference `bun run verify:eslint` requires. Report how many
the section holds.

### 5. Move each decision record into an ADR

1. **Check it is not already recorded.** Search `docs/adr/`,
   `openspec/specs/`, `openspec/contracts/` and the rulebook for the area. If
   an accepted record says it, delete the comment and write nothing.
2. **Write it beside the code:** `<workspace>/docs/adr/NNNN-<slug>.md`, for
   example `packages/auth/docs/adr/`. For the root trees use
   `scripts/docs/adr/`, `tests/docs/adr/` and `tooling/docs/adr/`. One ADR per
   topic a reader would look up, never one per comment. Take the next free
   four-digit number in that directory and add the ADR to its `README.md`.
3. **Say what it is.** These ADRs record what the code does and why. Start
   each with a status line such as "Recorded on 2026-11-22 from code comments
   (#2751). It describes the code as it is and ratifies no product intent."
4. **Write each decision to stand alone:** name the symbol and the file,
   state the decision and its reason, and keep the references the comment
   cited. Add nothing that the comment or the code does not support.

`docs/adr/` is the platform series and records intent the owner accepted
(`docs/adr/README.md`). Do not add to it from a comment. If a comment claims
platform intent that no accepted record holds, stop and ask the user.

If a type, a test or a lint rule could enforce a decision cheaply, say so in
the report. Do not build it in this pass.

### 6. Delete

```bash
node scripts/delete-comments.mjs strip <path>
```

It removes every banned comment under the path, formats the file, and writes
it only when the syntax tree is unchanged. It names any file it left alone,
which happens when a JSX comment sits between two pieces of text: edit those
by hand and check the rendered text.

### 7. Lower the ratchet and verify

1. `bun run verify:comments -- --write`, then `bun run verify:comments`.
2. Lint, typecheck and the unit tests of the workspace.
3. A test that reads source text or pins a file's hash can fail once a
   comment is gone. Re-check what the pin protects and update the pin
   (`docs/ai/protected-paths.md`). Never restore the comment to make it pass.
4. `bunx prettier --check` on the ADRs.

### 8. Report

Give the counts per category, the issues filed, the ADRs written, the
comment-only lines removed, the new total from `--report`, and what is left
open: files `strip` refused, suppressions, and decisions worth enforcing.

## What the rule leaves alone

- Lint, TypeScript, formatter, coverage, bundler and test-environment
  directives, shebangs, `@license` headers, a JSDoc block that carries
  `@deprecated`, and JSDoc type annotations in JavaScript files.
- Paths outside `apps/`, `packages/`, `scripts/`, `tests/`, `tooling/` and
  the repository root; fixtures; generated files; `public/` assets; Payload
  migrations; and the factory pack. `inCommentBanScope` in
  `tooling/eslint-config/no-comments.mjs` is the exact list.
- SQL, Python, shell, CSS and YAML. The rule reads TypeScript and JavaScript
  only.
