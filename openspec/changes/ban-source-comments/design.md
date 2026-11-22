# Design

## Context

ESLint is the live linter. Each workspace under `apps/` and `packages/` runs
its own configuration, all built on `tooling/eslint-config/base.mjs`.
`bun run lint` does not lint `scripts/`, `tests/` or the root files, which
hold 58% of the comments. The move to Oxlint is planned and paused
(`adopt-ultracite-quality-toolchain`).

The repository already keeps count-based suppressions for six design-system
rules in `tooling/eslint-config/suppressions.json`, guarded so that no other
rule and no other workspace can use them.

## Goals / Non-Goals

**Goals:**

- One definition of "a banned comment", used by the lint rule, the gate and
  the removal script.
- A ratchet that holds for every first-party source tree, including the ones
  ESLint does not lint, and that a hand-edited baseline cannot defeat.
- Comment removal that cannot change code.

**Non-Goals:**

- Banning comments in languages other than TypeScript and JavaScript.
- Deciding the fate of each existing comment mechanically. Classification is
  judgement, and the skill owns it.

## Decisions

### D1. An ESLint rule plus a standalone gate

The rule gives feedback where ESLint already runs: the editor, the agent edit
hook, pre-commit and each workspace's `lint`. It cannot be the whole ratchet,
because ESLint does not lint `scripts/`, `tests/` or the root files, and
because a rule sees one file at one moment and cannot tell whether a count
went up.

`scripts/verify/comment-ratchet.mjs` parses every tracked source file in
scope with the same parser and the same definition
(`bannedComments` in `tooling/eslint-config/no-comments.mjs`). It does not
depend on ESLint's configuration, so it keeps working when the linter
changes.

Alternative considered: ESLint's native bulk suppressions. Rejected. They
exist only where ESLint runs, the shared file is guarded for six other rules,
and the mechanism is part of what the Oxlint migration replaces.

### D2. The ratchet compares trees, not baselines

For each file changed since the merge base with the base branch
(`origin/develop` by default, the pull request's base in CI), the gate counts
the banned comments in the file now and in its base version. The count must
not be higher. A renamed file is compared with the file it was renamed from,
so a rename keeps its comments. A new file must have none.

The gate then requires the committed baseline to equal the tree. Because the
tree cannot gain comments and the baseline must mirror the tree, nobody can
raise a baseline entry by hand. `--write` refuses to write while any file has
gained comments.

Alternative considered: compare the baseline with the base branch's baseline
and refuse widened entries. Rejected: it cannot tell a rename from a new
file, and a change to the rule's own definition would need an override.

### D3. The baseline is a count per file

`tooling/eslint-config/comment-baseline.json` maps each file to its number of
banned comments, sorted by path. The rule reads it to decide whether a file
is over its allowance, and reports every comment in a file that is, because a
count cannot say which one is new.

Alternative considered: a hash per comment, which would name the new comment
exactly. Rejected: the file would be opaque to a reviewer, and editing a
comment's wording would count as a new comment.

### D4. Machine-read comments are not comments

The rule keeps a fixed list of directive forms. Forms that ESLint reads only
in a block comment (`global`, `eslint`, `exported`) are honoured only in a
block comment, so prose that happens to start with one of those words is
still banned. A JSDoc block is kept when it carries `@deprecated`, which
TypeScript and editors read, and, in a JavaScript file only, when it carries
a type tag, because there the JSDoc is the type annotation.

### D5. Removal proves the code is unchanged

`scripts/delete-comments.mjs strip` removes the banned comments, formats the
file with Prettier, and compares the syntax tree before and after, ignoring
positions, layout and JSX comment containers. It writes the file only when
the trees are equal. A JSX comment between two pieces of text changes how the
text is split, so those files are left for a hand edit.

### D6. Decision records live beside the code

`docs/adr/` is the platform series and records intent the owner accepted. A
decision taken from a comment describes what the code does and why; it
ratifies nothing. It goes in `<workspace>/docs/adr/`, numbered within that
directory, with a status line that says so. A decision that an accepted
record already states is not copied: the workspace ADR points to the record.

## Risks

- **A test pins a comment.** Some tests read source text or hash a file.
  The skill says to re-check what the pin protects and update the pin.
- **Friction on every comment deletion.** The baseline must be rewritten in
  the same change. The gate prints the command.
- **Agents route around the ban.** Prose dressed as a directive is still
  banned by D4; a new directive form needs a rule change with a test.
