# Add the p3-stack and pr-review-toolkit agent packs

## Why

Core's coding agents lack two reviewed workflow packs the founder requested:
p3-stack (poteto's pstack engineering discipline, ported to T3 Code) and
Anthropic's pr-review-toolkit (aspect-specific pull request reviewers). Both
must be usable from T3 Code, Claude Code, Codex, and Cursor without taking
triggers from Core's existing skills or weakening Core's approval, branch, and
TDD rules.

## What Changes

- Vendor all 51 p3-stack skills at a pinned commit as canonical skills with
  CLI-written lock entries, the MIT notice, provenance, and marked Core
  overlays. Rename upstream `tdd` and `teach` to `p3-tdd` and `p3-teach`
  because Core already owns different skills with those names.
- Keep every p3-stack skill except `p3-help` explicit-only in every client and
  add a Core adapter that maps the pack's T3 Code tools to the other clients
  and states the Core rules that override the pack's autonomy wording.
- Adapt pr-review-toolkit's `/review-pr` command as the explicit-only
  `review-pr` skill, keep its six reviewer prompts unchanged, and publish
  Core-authored native subagent launchers for Cursor and Claude Code.
- Record both sources in the skill source audit, inventory test, and routing
  catalog, and add structural tests for pins, routing, and mirrors.

## Impact

The change adds agent instructions, provenance, generated skill and agent
mirrors, two ignore entries for p3-stack run state, one reviewed executable
mode, and their checks. It changes no product runtime, dependency, or
credential, and it does not modify Codex factory roles.
