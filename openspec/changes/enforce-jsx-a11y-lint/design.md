# Design

## Context

See `proposal.md` for the motivation and for why this change is not ratified.
Decisions D1-D3 were written on 2026-10-30 as D4-D6 of `make-shadscan-advisory`
and moved here on 2026-11-18 without change in substance. The facts below were
recorded on 2026-10-30 and must be re-checked before apply.

- `eslint-config-next@16.4.2` already registers `eslint-plugin-jsx-a11y@6.10.2`
  for the Next apps, but enables only 6 of its rules.
  - The plugin declares ESLint peers only up to 9, while Core runs ESLint
    10.13.0.
  - Its `lib/` makes no calls to the context APIs ESLint 10 removed
    (`getSourceCode()`, `getFilename()`, `getScope()`, `getAncestors()`,
    `parserOptions`).
  - It exports `flatConfigs.recommended`, which has 34 rules.
  - The Bun isolated store holds two peer variants of it.
- Native ESLint count-based suppressions already exist. They live in
  `tooling/eslint-config/suppressions.json` and are driven by
  `tooling/eslint-config/lint.mjs`. `validateSuppressions` currently allows
  only the six `@shadcn/lint` rules there. Counts cannot tell a repaired
  violation from a new one of the same rule in the same file;
  `tests/unit/scripts/design-system-suppressions.test.ts` documents that this
  same-count swap passes lint.
- No lint config sets `reportUnusedDisableDirectives`, and lint does not fail
  on warnings. First-party `apps/**` and `packages/**` sources hold 4 inline
  disable directives and one inline configuration comment
  (`/* eslint react-hooks/refs: "error" */`). Each names its rules, and none
  covers `jsx-a11y`.
- `packages/ui` exports `ButtonLink`, which renders a native `a` by default
  through `useRender`. It is used in the admin app.
- The design-system scope (`uiWorkspaces` in
  `tooling/eslint-config/design-system.mjs`) lists the three apps,
  `packages/ui` and `packages/missionary`. Two more packages have production
  JSX and lint through `tooling/eslint-config/library.mjs`:
  - `packages/lib`, whose `cms/public-page-renderer.tsx` renders the donor
    public CMS route and the admin preview, and whose
    `components/safe-html.tsx` is used by the apps and `packages/ui`;
  - `packages/database`, with two provider components.
- Six imports in two files alias shared components:
  - `apps/admin/features/mission-control/care/components/UI.tsx` imports
    `Button`, `Dialog`, `DialogContent`, `DialogHeader` and `DialogTitle` as
    `Shared*`, because it exports its own `DialogHeader` and `DialogTitle`
    wrappers under the same names;
  - `apps/admin/features/support-hub/components/labels/LabelForm.tsx` imports
    `Label as UiLabel`.

  No first-party code imports `@asym/ui` as a namespace, renames the default
  import of `next/link` or `next/image`, or rebinds a shared component with
  `const X = Component;`.

- The Shadscan score gate is retired (`make-shadscan-advisory`). The axe-based
  Playwright checks remain, but none gates a `develop` merge today.

## Goals / Non-Goals

**Goals:**

- Block new static accessibility regressions through the normal lint gate,
  using the plugin version Core already locks.

**Non-Goals:**

- Moving lint to Oxlint, or switching to a forked a11y plugin.
- Any change to the advisory Shadscan report.

## Decisions

### D1. Enable the full `jsx-a11y` recommended rules on first-party web UI

`@asym/eslint-config` declares the exact `eslint-plugin-jsx-a11y@6.10.2`,
which is already in `bun.lock`. It applies `flatConfigs.recommended.rules`
at that preset's own severities. In 6.10.2 the preset leaves
`anchor-ambiguous-text`, `control-has-associated-label`, and `label-has-for`
off. Those stay off unless a later change records an explicit override. The
scope is every first-party app and workspace package whose non-test sources
contain JSX, excluding vendored and generated trees. Today that means the
three apps, `packages/ui`, `packages/missionary`, `packages/lib` and
`packages/database`. This is deliberately wider than the design-system scope,
which leaves out the two library-config packages even though `packages/lib`
renders public pages.

Plugin registration must not collide:

- **Next app configs:** reuse the plugin object that `eslint-config-next`
  already registers.
- **Design-system packages and `library.mjs` packages:** register the
  declared copy for their JSX files.

Config tests, written red first, prove two things:

- Every entry point resolves one `jsx-a11y` namespace, with no "Cannot
  redefine plugin" error.
- Every workspace with non-test JSX sources resolves the rules for a JSX file
  inside it. The workspace list is derived from the repository, not
  hard-coded, so a package that starts rendering JSX cannot fall outside the
  scope silently.

- **Rejected: reusing `uiWorkspaces`.** It omits `packages/lib`, so public
  CMS markup regressions would pass lint.

- **Rejected: `eslint-plugin-jsx-a11y-x` (0.2.0).** It declares ESLint 10
  peers, but it would add a second, younger dependency beside the copy Next
  already brings in.
- **Rejected: the `strict` config.** It adds rules with high false-positive
  rates on Base UI composition. Use `recommended` first and tighten later
  with evidence.

### D2. Map shared components to native elements

`settings["jsx-a11y"].components` maps each shared component that renders a
native element to that element, for example `Button` to `button`,
`ButtonLink` to `a`, `Input` to `input`, `Textarea` to `textarea`, `Label` to
`label`, Next `Link` to `a`, and Next `Image` to `img`.

The plugin keys that map on the JSX name, not the import origin. Each mapped
name is reserved for the shared component the classification describes. An
unrelated `Label` that renders a span, or a local `Button` that is not the
shared button, is still evaluated as the native element, and a fixture must
show that failure. During apply, every other component that already uses a
mapped name is renamed, with its call sites. That includes the chart
annotation `Label` components in
`packages/ui/components/shadcn-studio/blocks/chart-sales-metrics.tsx` and
`chart-missionary-metrics.tsx`, and the icon exports `Image` and `Link` from
`@asym/ui/components/shadcn/icons`, which render `svg` and cannot share the
`img` and `a` mappings. The completeness test fails if another `packages/ui`
export uses a mapped name while rendering a different element.

The mapping is not a hand-picked list. During apply, a committed
classification file in `tooling/eslint-config` records, for every component
export of `packages/ui`, the native element it renders by default, or
`composite` if it renders none. It is reviewed once. `ButtonLink`, for
example, uses `useRender` with `defaultTagName: "a"`, so it is classified as
`a`. A completeness test then asserts that:

- every current `packages/ui` component export is classified, so a new export
  fails until someone classifies it;
- every export classified as a native element appears in the mapping with
  that element;
- for each mapped export that renders without required context, a
  server-render check confirms that the root element matches its
  classification.

The plugin matches components by their JSX name, so an import alias such as
`Button as SharedButton` would bypass the mapping. `no-restricted-syntax`
rejects any import of a mapped component under another local name: named
imports from its shared module through every specifier that resolves to it,
and default imports of `next/link` and `next/image`. Those specifiers are the
`@asym/ui` path and, inside `packages/ui`, both a relative path and the
internal `@/` alias, which `packages/ui/tsconfig.json` maps to the package
root, `components.json` writes and `docs/ai/rules/frontend.md` prefers. The
`@/` selectors apply only to `packages/ui` files, because elsewhere `@/`
resolves to that workspace's own root.
It also rejects namespace imports of those modules (`import * as ui from …`):
the plugin names `<ui.Button>` as `ui.Button`, which the `Button` mapping
does not match. No first-party code imports them as a namespace today.
It also rejects a local rebinding of a mapped component, such as
`const SharedButton = Button;`, using a selector on variable declarators
whose initializer is a mapped component's name. Aliases of unrelated exports,
such as `Link as LinkIcon` from an icon set, are not affected, because the
selectors match the import source or the mapped names.

All six existing aliased imports are migrated during apply. In the care
`UI.tsx` file, the local `DialogHeader` and `DialogTitle` wrappers are
renamed (for example `CareDialogHeader` and `CareDialogTitle`) and their call
sites updated. The shared `Button` and `Dialog*` components then import under
their exported names. `LabelForm.tsx` imports `Label` directly. The rule
covers only mapped exports, but all six move together, so one module never
mixes aliased and direct shared imports.

- **Rejected: listing every alias in the mapping.** Each new alias would
  silently bypass lint until someone added it.

Base UI's `render={<element />}` composition cannot be expressed through
`polymorphicPropName`. Those cases rely on the rendered axe checks, and are
recorded as a limitation in the guide.

### D3. Repair first; line-anchored exceptions for what remains

1. Run the enabled rules over the full scope and produce an inventory.
2. Repair real violations at their owning component, with focused tests where
   behavior changes.
3. For a false positive caused by the static rule, use
   `eslint-disable-next-line jsx-a11y/<rule> -- false positive: <why>`.
4. Record only what cannot be repaired safely in this change, as
   `eslint-disable-next-line jsx-a11y/<rule> -- debt #<issue>: <why>`. Open
   that issue with the residual list, and list each entry in the debt
   baseline described below.

These two forms are the only accepted way to except an accessibility rule.
Each covers one line and one rule, which gives the spec's shrink-only
behavior:

- A new violation on any other line fails lint, even in a file with
  exceptions.
- Configs for every workspace in the D1 scope set
  `linterOptions.reportUnusedDisableDirectives` to
  `"error"`, so a directive whose violation was repaired fails lint until it
  is deleted. That also applies to the 4 existing directives, and any that
  are stale are removed during apply.
- A focused verification test parses every directive in first-party sources
  in scope, whether written as a line comment or a JSX block comment. It
  fails on:
  - an `eslint-disable` or `eslint-disable-line` directive that names a
    `jsx-a11y` rule, since that covers a whole file, a block or more than
    the next line;
  - any rule-less disable directive, since it silently covers every
    accessibility rule;
  - a next-line directive that names a `jsx-a11y` rule together with any
    other rule;
  - a `jsx-a11y` exception whose reason does not start with
    `false positive:` or `debt #<issue>:`;
  - an inline configuration comment (`/* eslint <rule>: … */`) that sets any
    `jsx-a11y` rule at any severity. Such a comment reconfigures the rule for
    the whole file, and `reportUnusedDisableDirectives` does not cover it.
    Core already uses this syntax for another rule in
    `apps/donor/app/(public)/(solid)/checkout/checkout-client.tsx`, and that
    use stays allowed.

  Directives and configuration comments for other rules that name their
  rules stay allowed, so the 4 existing directives and the one existing
  configuration comment are unaffected.

- **Rejected: `linterOptions.noInlineConfig`.** It would also disable the
  next-line exceptions this decision relies on.

`validateSuppressions` stays limited to `@shadcn/lint` rules, so
accessibility debt cannot move into the count-based file.

- **Rejected: native count-based suppressions for `jsx-a11y`.** Counts cannot
  detect a same-count swap: repairing one violation and adding another of the
  same rule in the same file passes. Core's own suppression test documents
  this. It would break the spec's guarantee that a new violation fails.
- **Residual limit:** a different violation of the same rule on the same
  excepted line stays hidden. Review covers that narrow case.

**Debt baseline.** Line anchoring stops a debt exception from hiding other
lines, but on its own it would still let a change add a new violation with a
fresh, well-formed `debt #` exception. Residual debt is therefore frozen at
adoption:

- `tooling/eslint-config/a11y-debt-baseline.json` lists each residual
  exception with its file, rule, issue, trimmed source text, and the line
  number for review. The line number is not the identity, and neither is a
  count of identical lines by itself. The check follows the directive
  through the diff. An insertion or deletion above it, of a line that is
  not the same trimmed source, leaves the entry valid and the recorded line
  number may be updated. Moving the directive onto another identical line
  fails. That failure remains when the original line is deleted in the same
  change, even if only one identical line is left: the deleted line's entry
  is a removal, and the directive on the survivor is a new entry. The
  adoption commit always creates the file, even as an empty list when the
  repair pass leaves no debt, and it is reviewed once. A test requires the
  file to exist and match its schema, so no later change can delete it.
- The directive verification fails on any `debt #` exception that has no
  exactly matching baseline entry, and on any baseline entry with no matching
  live exception. Debt directives cannot be added, transferred to another
  occurrence, or edited. A line shift that the diff maps to the same
  directive is not a transfer. Stale entries must be pruned.
- A check in the required CI lint job reads the baseline at the pull
  request's base commit, fetching it if the checkout is shallow. It fails if
  the head adds an entry or changes its file, rule, issue, or source text,
  or if the diff does not map the directive to the same entry. Updating only
  the recorded line number passes. Removals pass. The local
  preflight runs the same comparison against the merge base with
  `origin/develop` when that ref exists.
- **One-time adoption.** If the base commit has no baseline, the change is
  the adoption change, and the comparison accepts the head's entries. Each
  entry must still match a live `debt #` exception, and reviewers check the
  list once in that pull request. This cannot repeat: the existence test
  blocks any later change that deletes the file, so every later base commit
  has one.

A new static false positive after adoption still uses the
`false positive:` form. Such a directive is visible in review and cannot
reference an issue as debt.

- **Rejected: a count of debt exceptions per file.** It would reopen the
  same-count swap.

## Risks / Trade-offs

- **[Risk]** A future ESLint release breaks jsx-a11y 6.10.2, whose peer range
  is out of date. → The config test and the required lint job fail visibly.
  The fallback is `eslint-plugin-jsx-a11y-x`, adopted as a separate change.
- **[Risk]** The jsx-a11y inventory is larger than expected. → D3's
  line-anchored exceptions, frozen baseline and tracked issue keep the
  change bounded without accepting new debt, at the cost of one directive and
  one baseline entry per residual line.
- **[Risk]** The debt baseline is itself a ledger, the kind of bookkeeping
  the owner retired on 2026-11-18. → It is not hash-bound and only shrinks,
  but it still needs maintenance. See the open question below.
- **[Risk]** A real violation is labeled as a false positive after adoption.
  → The baseline check cannot judge the label, so review is the control.
  Each such directive names its rule and reason in the diff.
- **[Risk]** Unused-disable reporting at error also covers the 4 existing
  directives for other rules. → Any stale ones are deleted during apply.
  Deleting an unused directive cannot change behavior.
- **[Trade-off]** Static lint cannot see through Base UI `render` composition.
  The existing axe browser checks remain the authority for those cases.

## Migration Plan

Land the work in one commit after ratification: the lint config, the
inventory, repairs, alias renames and any inline exceptions (D1-D3).

**Rollback:** revert the commit. Lint rollback removes the added rules and
their inline exceptions together.

## Open Questions

- Should residual debt be frozen in a baseline (D3), or should adoption
  require zero residual debt, repairing or marking as a false positive every
  violation, so that no baseline file exists? The owner described the
  baseline as "a new ledger" on 2026-11-18. This must be decided before
  ratification.
- How many jsx-a11y recommended violations exist today? This decides
  whether D3 ends with zero residual exceptions or a tracked residual. It
  does not change the tasks.
