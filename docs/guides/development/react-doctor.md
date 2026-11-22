# React Doctor

Core pins **React Doctor 0.9.18** and runs an advisory, on-demand source-quality audit across eight concrete projects: `apps/admin`, `apps/donor`, `apps/missionary`, `packages/auth`, `packages/database`, `packages/lib`, `packages/missionary`, and `packages/ui`. The audit reports findings for review. It has no acceptance target and keeps no record of findings, and no commit or push hook, `ci:preflight` stage or CI check runs it.

## Running the audit

```sh
bun run react-doctor:audit
bun run react-doctor:audit -- --changed-since=origin/develop
bun run react-doctor:raw
bun run test:react-cleanup
```

`react-doctor:audit` scans all eight targets with the applicable rule profile and reports every finding. It exits 0 whenever every target scans completely, however many findings it reports. It exits 1 only when audit evidence is unavailable: the CLI errors or exits non-zero, one target's scan runs past its 15-minute limit, a report is unreadable or outside the supported report contract, a target skips checks, is missing or is repeated, or the source changes during the run. It then prints `React Doctor audit evidence is unavailable: <reason>` and writes no `findings.json` or `summary.md`, so a failed run never reads as a clean one. An unknown argument fails the same way before any scan. On a heavily loaded machine React Doctor can exceed its own lint batch budget and return a partial project; the reason then names the target and the scanner's `lint:partial` message, and a rerun on a quieter machine completes.

`react-doctor:raw` runs the same audit with the obsolete classic JSX import check re-enabled, to keep the fully unsuppressed inventory. It writes the same files, labeled as the raw profile.

Each run prints its evidence directory before it scans, so a run that fails still names where its logs are. Next to each target's JSON report and stderr log, `scans.json`, `snapshot.json` and `integrity.json`, it writes:

- `summary.md`: the findings per target and per rule, then the listed findings grouped by file. Start here.
- `findings.json`: every finding with its target, repository-relative file, line, column, plugin, rule, severity and message, plus the React Doctor version, the `doctor.config.json` SHA-256 and the base revision, if one was given.

Add `-- --changed-since=<revision>` to review one change. The audit resolves the merge base of that revision and `HEAD`, then lists only the findings in files that the working tree adds, modifies or renames relative to that merge base, or that are untracked and not ignored. A target's `package.json` counts like any other file. The totals still cover every finding, and in `findings.json` each finding is marked `"changed": true` or `false`. Because the merge base is used, `--changed-since=origin/develop` keeps listing only the branch's own files after `develop` moves on. A revision that does not resolve fails before the scan, and the error names it.

Add `-- --output=<fresh-empty-directory>` to keep evidence at an explicit location. Existing output is never overwritten.

Each invocation creates a fresh physical source copy outside the checkout and runs the supported public CLI on it. The helper uses Node for React Doctor's IPC rather than forcing the Bun runtime. It inventories existing tracked and ordinary untracked source while respecting Git ignores, excludes secrets and installed/generated skill catalogs, and redirects local workspace dependencies to the copy. Original-source and snapshot manifests detect edits, additions, deletions, or scanner rewrites during the audit. No private React Doctor module API is required.

The older `react-doctor:first-party` helper remains useful for interactive diagnostics. It scans the live checkout, writes no summary, and its exit status follows only its `blocking` setting (`none` by default). It rejects source-rewriting flags outside the disposable audit runner. Legacy `--full`, `--offline`, and `--fail-on` arguments are normalized for compatibility.

Scoring, sharing, telemetry, and supply-chain checks are disabled. CLI/package installation may require access to the package registry if the pinned version is not already cached. This is a local source-quality assessment; it supplies no numeric score, dependency-security certification, or authenticated production-flow certification. See the [official CLI reference](https://www.react.doctor/docs/reference/cli-reference).

## Rule configuration

`doctor.config.json` explicitly registers applicable default and optional rules for the pinned version. Accessibility, component shape, correctness, data-flow, performance, design, and unused-code checks remain enabled. There is no blanket rule ignore list. The only disabled source rule is `react-doctor/react-in-jsx-scope`: all three Next.js apps use the automatic JSX transform, so gratuitous React imports are not required.

An upgraded scanner must be researched against its published rule registry and supported CLI. Reconcile removed or renamed identifiers, review newly applicable rules, and rerun the raw and applicable audits. A rule is never disabled or narrowed to hide findings; see Triage.

## Source boundaries

| Boundary                                                                              | Treatment and evidence                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.next/**`, `.next-docs/**`, `dist/**`, `coverage/**`, `node_modules/**`, `vendor/**` | Build output, dependencies, or upstream artifacts; first-party runtime source remains included.                                                                                                                                                                                                                                                            |
| `docs/**`, `tests/**`, `scripts/**`, `tooling/**`, `supabase/**`                      | Non-runtime or separately owned surfaces, verified by native lint, unit, workspace, and migration/documentation checks as appropriate. Tests outside a target still count as real consumers when reviewing unused exports.                                                                                                                                 |
| `public/maplibre/maplibre-gl-worker.mjs`, `public/maplibre/maplibre-gl-shared.mjs`    | Exactly two generated asset names, used by admin and donor. `scripts/copy-maplibre-worker-assets.mjs` copies them at Next config load. Both apps' copies were byte-identical to installed MapLibre 6.10.0 assets; Git already ignores the generated directories. Never hand-edit these bundles. Recheck package version and copy ownership when upgrading. |
| Eve generated development catalog                                                     | The audit copy excludes `packages/eve-runtime/skill-catalog/` when present. A separately authorized development catalog is maintained by its canonical sync/verification owner; this React cleanup does not install repository skills into the product runtime.                                                                                            |

## Triage

Reviewers triage findings, and nothing in the repository records them. Start with the findings in your own change (`--changed-since`), then decide each one:

- **Confirmed defect:** repair it at the owning application or shared component with a focused behavior test, or open an issue that tracks it.
- **False positive or accepted pattern:** leave it. It needs no repository record, and it keeps appearing in later reports. Do not disable or narrow a rule, and do not add an inline disable, to hide it.

Verify the actual contract before judging a finding a false positive: JSX prop/ref forwarding belongs to shared primitive APIs; grid keyboard activation belongs to the owning gridcell; intentional numeric drafts may remain empty while being edited; annotation-only compiler diagnostics must be reconciled with installed compiler behavior; lifecycle and motion claims require the existing cleanup or global policy plus relevant behavior evidence. Required synchronous Recharts child APIs and lazy module boundaries need concrete importer evidence. A false positive at one location says nothing about another location under the same rule.

Inline disables do not hide findings: disposable audits ignore them and keep their raw findings. Do not add a broad suppression or weaken a native gate to shorten a report. Review external/package/framework/test consumers before deleting an export. Preserve Base UI, exact `base-maia`, financial and permission ownership, stable draft identities, public import paths, current View Transition identities and flags, and silent revalidation.

Report the findings that remain in a change's files as findings. A completed audit is not a pass.

## Accepted patterns

These patterns are reported and stay, because the obvious fix would break something else. The list records patterns, not individual findings, and nothing validates it.

- **`next-themes` declared by `apps/donor` and `apps/missionary`.** React Doctor reports `unused-dependency` for it in both apps' `package.json`, because neither app imports `next-themes`: the shared theme provider and controls in `packages/ui` own the runtime imports. Shadscan 0.17.0's `theme-hydration-safe` rule reads the dependency from each app's own `package.json` and reports the check as not applicable without it, so removing the declaration would drop that hydration check from both apps' Shadscan audits. Revisit when Shadscan is no longer consulted or detects workspace-owned theme providers; the declarations can then be removed in their own change.

## Verification

Add regression coverage before substantive fixes. Run focused tests, workspace-aware lint/typecheck, and applicable audits after each batch. For controls and layouts, use Chromium keyboard/focus checks, narrow widths, light/dark, reduced motion, and axe.

`test:react-cleanup` runs isolated **real React components with synthetic boundaries**. It includes contribution Hub/CRM launch surfaces and shared table, popover, chart, team, and wallet fixtures. It loads no credentials and makes no live provider calls. It covers failed submissions, stale revisions, refund limits, and a completed operation followed by refresh failure. These fixtures do not certify authenticated whole-page or production-provider integration.

Core uses the supported Vitest V8 provider under Node. Its standard reports measure line, statement, branch and function coverage of imported source files; that scope is not a whole-repository denominator. Missing or zero-total reports do not establish coverage quality. Dated fallback reports remain unchanged and do not gain measured percentages retroactively. See the canonical Vitest skill and `vitest.config.mts`.

One exact native-lint false positive is documented separately in `docs/qa/react-doctor/native-exceptions.json`: the payment factory only captures refs for its returned event handler. Its file-level compiler check remains enabled under both root and app ESLint contexts. CRM CSV export now resolves its attachment URL against the current origin before native navigation, requiring no waiver. This native exception does not suppress the disposable React Doctor inventory. Existing native design-system debt counts are retained or pruned, never increased by this cleanup.

A React cleanup batch also needs affected application builds, formatting, and the full unit suite with coverage and four workers: `bunx --no-install vitest run --coverage --maxWorkers=4`. After the batch, run `bun run react-doctor:audit -- --changed-since=<base>` and report the findings that remain in the changed files, the repairs made, and browser, build and test limitations. Changes stay local and uncommitted unless the user separately authorizes publication.

## Historical audits

The September 2026 configured audits and the initial October 6 pass used narrower ignore profiles, so their results are not comparable with the all-applicable-rule profile above. The 2026-10-06 expanded planning inventory contained 10,185 raw diagnostics, of which 8,230 were the obsolete classic JSX import requirement; the remaining 1,955 required source fixes or evidence-backed adjudication. AL-1958 (October 2026) required zero unexcepted findings, with every exception recorded in a hash-bound ledger. On 2026-11-18 the owner approved retiring the ledger. The [`make-react-doctor-advisory` proposal](../../../openspec/changes/make-react-doctor-advisory/proposal.md#authority) records the quality program's interpretation that this decision also supersedes AL-1958's zero-finding acceptance and requests confirmation on the implementing pull request. Git history retains the earlier records and their reasoning. Use the commands above for current audits.

## 2026-09-19 Cleanup Decisions

Historical result (React Doctor 0.9.14, narrower configured profile): "React Doctor passes for the configured first-party audit". The eight reported targets were `@asym/admin`, `@asym/donor`, `@asym/missionary-app`, `@asym/auth`, `@asym/database`, `@asym/lib`, `@asym/missionary`, and `@asym/ui`; `doctor.config.json` ignore rules were not expanded in that pass. This dated configured result does not establish the current expanded acceptance criterion.

Current signed-upload ownership remains explicit: `packages/lib/cloudinary-server.ts` generates the SHA-256 upload signature; the email uploader in `packages/api/src/email/assets.ts` uses this helper and sends the signature, signed parameters, file, and API key. `signature_algorithm` is not submitted as a multipart upload field. Existing config-contract and signature tests guard this ownership; it is not a password-hashing assertion or a dependency-security certification.

The pre-upgrade inventory recorded `maplibre-gl@5.x` was locked at 5.23.0; that obsolete version is historical, and the current copied assets above come from 6.10.0. The September source pass also recorded: Remaining `parseJsonResponse` clones in portal hooks check `response.ok` before reading the JSON body. Cloudinary signed uploads use SHA-256 instead of SHA-1. Those statements describe specific source ownership and do not reactivate online supply-chain scoring.
