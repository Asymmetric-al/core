# Modernize agent guidance

## Why

Core's UI rule says UI SDK may only fill gaps no shared component covers. The
owner has decided that Base UI and UI SDK are both approved for shared
components (AL-2695). Seven installed skills are ones their upstream deleted or
discontinued. And walkthroughs of ordinary tasks found instructions that send
an agent the wrong way: a skill workflow that omits a step its own test
requires, and a Next.js skill that names functions Next.js 16.4 renamed.

## What Changes

- **UI policy.** Base UI and UI SDK are both approved for shared components.
  Reuse existing `@asym/ui` components first; choose UI SDK for a concrete
  benefit and say why in the change description. Prefer Base UI over Radix.
  One library owns a control's internals. Exact `base-maia`, Zinc semantic
  tokens, shared ownership in `packages/ui`, the wrapper location, the exact
  pins, the CSS layer order and the app-import ban are unchanged.
- **Retired skills.** `qa`, `request-refactor-plan`, `ubiquitous-language`,
  `design-an-interface`, `edit-article`, `obsidian-vault` and
  `tailwind-v4-shadcn` leave every source, mirror, lock entry and audit record.
- **Instruction fixes.** Skill routing states that clients list many skills by
  name only and that scoped instructions name the skill to load. The skill
  workflow gains the audit-hash step. Root instructions gain the fresh-checkout
  and docs-and-skills commands. `packages/ui` no longer asks for the shadcn
  workflow before a class fix. Stripe work, package tests, segment loading
  files, the docs-only lane and the TanStack trust order each gain one pointer.
  `nextjs-app-architecture` uses the function names the installed Next.js
  exports.

## Non-goals

- No component migration, UI SDK version change, Radix removal work or visual
  redesign. This is not an SDK-first policy.
- No new approval process, decision register or exception registry.
- No product code, database, payment, job or publication change.
- Stack-foreign skills that are not deprecated upstream, such as
  `nestjs-best-practices`, are not retired here.
- `adopt-ui-sdk-behavior-library` and other archived records are not edited.

## Capabilities

- `shared-ui-primitives`: the UI SDK requirement admits a justified UI SDK
  choice where a Base UI equivalent exists; a requirement states the Base UI
  preference over Radix.
- `agent-instruction-system`: the root UI invariant and the `ui-sdk` skill
  requirement follow the same policy; a requirement states how a skill is
  retired, and the audit requirement admits a recorded owner retirement.

## Impact

Instruction files, four rulebooks, five canonical skills and their mirrors,
three guides, the stack registry, one package readme, the skills lock, the
skill source audit and maintenance log, the shadcn review baseline, and three
unit tests. No runtime code changes.

The work overlaps the instruction files that
`integrate-ui-sdk-across-dashboards` (pull request 2694, not merged) edits, and
the active `complete-base-ui-adoption` change still proposes that ordinary
controls use Base UI primitives. The design says how each is reconciled.
Rollback reverts the change as one unit.
