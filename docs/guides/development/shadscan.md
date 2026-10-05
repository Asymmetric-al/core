# Shadscan

Core uses the exact `@shadscan/cli` version in root `package.json` and `bun.lock`.
The pre-commit hook, local CI preflight and GitHub CI use the same repository
gate. CI's reusable reporter publishes the gate's existing artifacts; it does
not download another scanner or run a second audit.

```sh
bun ci
bun run verify:shadscan
bun run verify:shadscan -- --output /tmp/core-shadscan
```

The output directory contains the unchanged `shadscan.raw.json`, an annotated
`shadscan.summary.json` and a readable `shadscan.summary.md`. The ordinary command
fails when coverage, compatibility, any application floor or finding review fails.
For investigation, `--report-only` retains the failing gate result while allowing
the command to exit successfully. Hooks and CI never use that option.

## Coverage and scores

The scan starts at the workspace root. All three deployed applications must be
discovered: `apps/admin`, `apps/donor` and `apps/missionary`. The gate also retains
the reviewed library inventory, including the workspace root. Missing projects,
truncated discovery, incomplete source coverage, incompatible report versions
and unassessed scores fail the gate.

`tooling/shadscan/policy.json` binds the engine, ruleset and report schema and
protects each application's raw score independently. Policy schema 2 also requires
all six category floors for each app. Categories are recomputed from the unchanged
raw assessments; a higher pooled or application score cannot compensate for a
regressing category. Missing or unassessed categories fail even at a zero floor.
A 100-point application or category floor requires every applicable scored point,
not a percentage rounded to 100. Current floors capture the verified baseline;
they do not claim the 100/100 target has been reached.

Library findings remain visible and reviewed;
their scores do not contribute to the scanner's pooled application score. Core
does not calculate an adjusted score or present exceptions as passing raw rules.

The audit before AL-1931 used 0.1.1 on `packages/ui` alone and scored 31/100.
Using published 0.17.0 on the same library scored 33/100; its complete workspace
audit scored 40/100, with admin 35, donor 41 and missionary 47. These are different
audit scopes. The 63 initial failing app-rule results included both real defects
and scanner limitations. The final protected floors live in policy, after repairs.

This static audit complements lint, unit tests and browser verification. It does
not prove that every route or authenticated state is accessible, nor that a
production deployment contains local changes. Record the actual routes, viewport,
keyboard checks, revision and environment when reporting rendered verification.

## Reviewing a finding

First inspect the exact source and rendered behavior. Repair confirmed defects
at the owning component and rescan: some rules report only the first failure, so
a successful fix can expose another site. Preserve shared `packages/ui` ownership,
Base UI composition, semantic tokens and the canonical `base-maia` configuration.

The remaining scored failures require exact entries in
`tooling/shadscan/findings.json`. Each entry binds the project, rule, normalized
raw evidence fingerprint, rationale and SHA256 hashes of its source or policy
proof. Scanner limitations additionally require executable repository tests whose
files are included in that proof. Proof paths must be safe repository source
files; credentials, environment files, generated output and symlinks are rejected.

The classifications are:

- `scanner-limitation`: the scanner cannot resolve correct behavior through a
  shared wrapper, Base UI composition or a supported framework convention.
- `product-decision`: an explicit product or architecture choice intentionally
  omits the suggested feature.
- `library-applicability`: the finding requires application ownership that the
  inspected library does not have.
- `confirmed-defect`: a real defect still needs repair and blocks the gate.

New evidence for the same rule is a new finding. Stale source hashes, stale entries,
ambiguous entries, unclassified failures and confirmed defects block the gate.
There are no whole-rule exemptions. Refresh proof only after reviewing the change;
bulk rehashing to restore green checks is not evidence review.

## Core's intentional contracts

Applications currently force the light theme. A global theme shortcut would
contradict that choice. App-local `components.json` files are prohibited; shadcn
configuration belongs to `packages/ui`. Private Mission Control and missionary
pages keep their publication restrictions rather than adding public social cards
for a score. The public donor site's declared social image must resolve.

Mission Control navigation search uses the user's permitted navigation and guards
Cmd/Ctrl+K against text editing and other active dialogs. Support inbox shortcuts
retain their local scope. The owner approved useful donor and missionary
navigation palettes on 2026-10-04. They mount once in each signed-in workspace,
compose the shared Base UI/base-maia command widget, and use the existing
permitted destinations. Public giving, checkout and login flows retain their
existing navigation. The published scanner still misses this shared-package
composition; executable caller and keyboard/focus tests support that finding.

Authenticated CMS preview retains its blocking dynamic boundary. Redirect-only
Suspense siblings retain invisible fallbacks. Global Next.js recovery boundaries
are verified against the framework conventions rather than duplicated to match a
scanner filename heuristic.

## Updating the scanner

Check the [published package](https://www.npmjs.com/package/@shadscan/cli), its
matching [source](https://github.com/TheOrcDev/shadscan) and the
[official documentation](https://www.shadscan.com/docs). As of 2026-10-03 the
website advertised 0.17.1 while the public registry's latest installable package
was 0.17.0. Core pins the published package, not an unavailable website version.

Update the exact dependency and lock together, then review the new report schema,
ruleset, discovery and every finding. Preserve the Bun lockfile compatibility
ceiling documented in [CI](../../ci.md). Re-run source and browser regressions and
ratchet honest app floors after verified repairs. Do not lower a floor or rewrite
raw statuses to make an upgrade pass.

The pre-commit audit uses a temporary Git-index snapshot, including staged policy
and proof. Unstaged fixes cannot hide a staged regression. Stage a coherent change
before committing; the snapshot is removed after the audit.
