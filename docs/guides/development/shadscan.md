# Shadscan

Shadscan is a third-party static scorer for React and shadcn interfaces. In
Core it is **advisory**: its scores and findings never fail a commit, a push,
the local `ci:preflight` or a required CI check. There are no score floors, no
score target and no findings ledger. Reviewers read the report and triage what
it finds.

Core uses the exact `@shadscan/cli` version declared in root `package.json` and
locked in `bun.lock`. The owner retired the former blocking gate on
2026-11-18; the record is the OpenSpec change `make-shadscan-advisory`.

## Where it runs

- **CI:** the non-required `shadscan-report` job (`.github/workflows/shadscan.yml`,
  called from `ci.yml`) scans the submitted head commit once per CI event,
  uploads the raw report as the `shadscan-audit` artifact and publishes a
  summary. `ci-gate` does not depend on it.
- **Locally:** only when you run it. The pre-commit hook and `ci:preflight` do
  not scan.

```sh
bun ci
bun run shadscan:audit
bun run shadscan:audit -- --output .tmp/shadscan
```

The output directory holds the unchanged `shadscan.raw.json`, a
`shadscan.summary.json` and a readable `shadscan.summary.md`. Without
`--output` the command writes to a new temporary directory and prints its
path. The command exits 0 whenever the scanner produced a valid report,
whatever the scores. It exits non-zero only when no valid report exists: the
declared and installed versions differ, the scanner fails or runs past its
nine-minute limit, or its output is not JSON in the installed report schema.

## Reading the report

The summary lists every expected application: `apps/admin`, `apps/donor`,
`apps/missionary` and the private operator Console `apps/factory-console`.
The scanner discovers every Next.js workspace as an application, so the
Console appears beside the three product apps. For each one it shows:

- the raw overall score,
- the percentage for each of the six categories (foundation, interaction,
  states, accessibility, forms, production polish), or `n/a` where no scored
  rule applies,
- the IDs of its failing rules.

An expected application the scanner did not find is shown as "not
discovered". Library projects, including `packages/ui`, are scanned
separately; their scores do not pool into the application score.

Where the summary appears:

- **Same-repository pull request:** one comment marked
  `<!-- shadscan-report -->`, updated in place on every run, and the job
  summary.
- **Fork pull request:** the job summary only. The fork token is read-only,
  and Core does not hand a write token to a workflow that processes fork
  output.
- **Push to `develop`:** the job summary and one bot-owned tracking issue
  labelled `shadscan`.

If dependency installation or the scan fails, the job publishes an
"audit evidence is unavailable" statement naming the head commit. It replaces
any earlier scores in the comment, so an older commit's scores never read as
current, and the job is marked failed. That failure blocks nothing.

## Triage

Treat each failing rule as a lead, not a verdict:

1. Inspect the exact source and the rendered behavior. The MCP
   `explain_rule` tool below, or the official documentation linked at the
   end, says what a rule checks.
2. **Confirmed defect:** repair it at the owning shared or application
   component with a focused behavior test, or open an issue that records it.
   Some rules report only their first failure, so rescan after a repair: the
   next site can appear.
3. **Scanner limitation or accepted product decision:** no change and no
   repository record. Do not change code only to raise a score.

Preserve shared `packages/ui` ownership, Base UI composition, semantic tokens
and the canonical `base-maia` configuration in every repair.

## MCP use

Agents with the read-only Shadscan MCP server can explore findings without a
full run:

- `list_projects` lists the packages it would scan and why each is an
  application or a library;
- `scan` rescans the current files, optionally filtered by `packageDir`,
  category or severity;
- `explain_rule` describes one rule by its ID.

The MCP server may run a different Shadscan version from the repository pin.
For the numbers a pull request reports, use `bun run shadscan:audit`.

## Known static-analysis limits

The audit reads source; it does not run the app. Expect these false or
irrelevant findings:

- **Shared wrappers and Base UI composition.** The scanner often cannot see
  that a shared `packages/ui` component, or a Base UI `render` prop, supplies
  the name, role or keyboard behavior a rule looks for.
- **Library projects.** App-shell rules (theme provider, metadata, toaster,
  command menu, error routes) do not apply to a component library.
- **Framework conventions.** Global Next.js recovery boundaries and
  redirect-only Suspense siblings follow framework conventions rather than
  the scanner's filename heuristics.

A static score does not prove that a route or authenticated state is
accessible, or that a deployment contains a change. The axe-based Playwright
checks and focused behavior tests are the evidence for rendered behavior.
Record the actual routes, viewport, keyboard checks, revision and environment
when reporting rendered verification.

Retiring the gate left no blocking static accessibility check beyond the six
`jsx-a11y` rules `eslint-config-next` enables in the three Next apps. Full
`jsx-a11y` enforcement is proposed, not ratified, in the OpenSpec change
`enforce-jsx-a11y-lint`.

## Core's intentional contracts

These choices outrank a finding that asks for something else:

- The three product applications force the light theme. A global theme
  shortcut would contradict that choice.
- App-local `components.json` files are prohibited; shadcn configuration
  belongs to `packages/ui`.
- Private Mission Control and missionary pages keep their publication
  restrictions rather than adding public social cards. The public donor
  site's declared social image must resolve.
- Mission Control navigation search uses the user's permitted navigation and
  guards Cmd/Ctrl+K against text editing and other active dialogs. Support
  inbox shortcuts keep their local scope. The owner approved donor and
  missionary navigation palettes on 2026-10-04; they mount once in each
  signed-in workspace, compose the shared Base UI/base-maia command widget
  and use the existing permitted destinations. Public giving, checkout and
  login flows keep their existing navigation.
- The Factory Console (`apps/factory-console`) is one owner's private control
  surface on the factory VM, reached only through that owner's SSH tunnel; it
  is not a product application. It has a visible light and dark switch and no
  toast channel, command menu, theme shortcut or social preview. The reasons
  are recorded under "Deliberate omissions" in `apps/factory-console/README.md`.
  They were proposed on 2026-11-12 and await the owner's ratification.
- Authenticated CMS preview keeps its blocking dynamic boundary.

## Updating the scanner

Check the [published package](https://www.npmjs.com/package/@shadscan/cli), its
matching [source](https://github.com/TheOrcDev/shadscan) and the
[official documentation](https://www.shadscan.com/docs). Update the exact
dependency and the lockfile together, run `bun run shadscan:audit`, and read
the new report schema, ruleset and discovery before relying on the numbers.
Preserve the Bun lockfile compatibility ceiling documented in
[CI](../../ci.md). There are no floors to raise or lower.
