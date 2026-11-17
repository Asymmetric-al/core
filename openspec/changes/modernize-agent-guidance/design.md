## Context

`adopt-ui-sdk-behavior-library` (AL-2667) admitted UI SDK on 2026-11-14 with a
gaps-only rule, stated in two accepted requirements, root and `packages/ui`
instructions, the frontend rulebook, three skills, three documents and one
test. The owner has since decided both libraries are approved choices. This
change amends each owner once, with the same sentence, and leaves the dated
adoption record as it is.

The skill and instruction parts come from evidence gathered for this change:
the upstream histories of the candidate skills, and four walkthroughs in which
an agent followed the instructions for a shared-record bug, a small route
change, a UI control and a documentation fix.

## Decisions

### One policy, stated where each reader already looks

Root `AGENTS.md` keeps one bullet. `packages/ui/AGENTS.md` owns the detail in a
new "Choosing a library" section, and its existing UI SDK rules stay under "UI
SDK implementation", marked as applying to UI SDK code only. The rulebook,
skill overlay, routing catalog and guides point there.

The policy has four parts:

- Reuse or improve the existing `@asym/ui` component first.
- Base UI and UI SDK are both approved. UI SDK needs a concrete benefit, stated
  in a sentence in the change description. An equivalent Base UI control does
  not rule it out; availability alone does not justify a replacement.
- Prefer Base UI over Radix. A narrow Radix-specific need goes through normal
  review.
- One library owns a control's internals. Controls from different libraries
  may be composed, with focus, naming, dismissal and overlay stacking checked
  across the boundary.

### Keep the structural protections

`tests/unit/packages/ui/ui-sdk-integration.test.ts` is unchanged. It protects
the exact pins, one runtime, the wrapper location under
`components/primitives`, no barrel re-export, no app import, no optional
stylesheet and the layer order. So a UI SDK implementation is a wrapper in
`components/primitives`, not an in-place rewrite of a `components/shadcn`
file. When it supersedes a shared component, consumers move and the old
component is removed.

`tests/unit/packages/ui/base-ui-dependencies.test.ts` also stays. It fails if a
manifest declares Radix. That is the practical form of the preference: a
reviewed Radix exception edits that test in the same pull request, which is
normal review and needs no registry.

Only the first test in `tests/unit/docs/ui-sdk-skill.test.ts` changes, because
it asserted the gaps-only wording.

### Keep scenario names, change their steps

OpenSpec applies a MODIFIED requirement only if every existing scenario name is
still present. "A shared component already provides the control" and "An agent
needs an interaction no shared component provides" keep their names. The first
now says to reuse or improve the component; the second is still true as
written. New scenarios carry the new cases.

### Retire by upstream evidence, not by a 404

`mattpocock/skills` deleted `qa`, `request-refactor-plan`,
`ubiquitous-language` and `design-an-interface` in `c66bdeee` (2026-08-05) and
named their replacements, all of which Core already routes: `triage` with
`to-tickets`, `to-spec` with `improve-codebase-architecture`,
`domain-modeling`, and `codebase-design`, whose `DESIGN-IT-TWICE.md` carries
the old technique. The same commit deleted `edit-article` and `obsidian-vault`
as the author's personal skills. `obsidian-vault` hardcodes a path on his
machine and is model-invocable. `qa` and `request-refactor-plan` file GitHub
issues without Core's required labels. `tailwind-v4-shadcn` teaches pnpm, Vite
and a slate base, has no licence file, and its upstream path is gone.

Kept, each for a stated reason: `writing-great-skills` and
`resolving-merge-conflicts` (Core's refresh adapter routes to both and four
tests assert it), `create-agent` (the only Eve scaffolding flow), and
`nestjs-best-practices` (not deprecated upstream; a different argument).

The accepted audit requirement said a removed-source snapshot "remains
explicitly recorded". Read strictly, that forbids retiring one. Its scenario
now admits a recorded owner retirement, and a new requirement says what a
retirement must remove.

The audit JSON has no retired state: a test hashes the installed tree for
every record. So retired records are removed, and the maintenance log keeps
each name, source, path and last hashes. `4ab4054c8` is the last commit with
the payloads.

### Fix instructions only where a walkthrough failed

- Clients cap the skill listing. In a session with Core's catalog, 87 of 152
  model-invocable skills were listed by name only, including `shadcn`, `tdd`,
  `supabase` and all seven OpenSpec skills. Root instructions said descriptions
  were the routing layer; they now say scoped instructions name the skill.
- Editing a skill fails `skill-inventory-audit.test.ts` until
  `scripts/update-skill-audit-hashes.mjs` runs. The routing workflow did not
  say so.
- `packages/ui/AGENTS.md` numbered the shadcn configuration check and two
  skill loads ahead of "ordinary text/class/layout fixes". The workflow now
  says which steps a small fix needs.
- `nextjs-app-architecture` printed `unstable_prefetch()` and
  `unstable_navigation()`. The installed Next.js 16.4.5 exports only
  `prefetch()` and `navigation()`.
- No instruction named a skill for Stripe work, a test location for
  `packages/api`, or a lane for a documentation-only edit.

Rejected: raising the client's skill-listing budget. Showing every description
costs about 13,000 tokens in each session and helps one client only.

## Risks

- **`integrate-ui-sdk-across-dashboards` (pull request 2694) merged first.**
  It edited `packages/ui/AGENTS.md`, the frontend rulebook, the `ui-sdk`
  overlay, the audit and the shadcn baseline. This change is merged with it:
  its shared owners (shortcuts, the sortable list, the one agent bridge, the
  pattern checks) and its shortcut rule are kept, the overlay's triggers now
  point at those owners, and the two baseline hashes and the audit hashes were
  recomputed from the merged files. Its requirements are additions under
  different names, and delta compatibility passes with both changes active.
- **`complete-base-ui-adoption` is still active.** Its proposed requirement
  "Shared accessible primitive ownership" says ordinary behavior-heavy controls
  use shared Base UI primitives. It is a proposal, not accepted intent, and
  this change does not edit it. Before it is archived its sentence needs to
  read "through shared `@asym/ui` components", so the accepted spec does not
  hold both rules.
- **An agent over-reads "both approved".** The wording says reuse first, that
  availability alone is no reason, and that this is not an SDK-first migration.

## Rollback

Revert the change. The seven skills return from Git history with their lock
and audit entries.
