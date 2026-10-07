# React Doctor

Core pins **React Doctor 0.9.17** and runs a local source-quality audit across eight concrete projects: `apps/admin`, `apps/donor`, `apps/missionary`, `packages/auth`, `packages/database`, `packages/lib`, `packages/missionary`, and `packages/ui`.

## Commands and acceptance

```sh
bun run react-doctor:audit
bun run react-doctor:raw
bun run react-doctor:check
bun run test:react-cleanup
```

`react-doctor:audit` retains all applicable diagnostics and separately reports actionable findings and exact reviewed exceptions. `react-doctor:raw` also re-enables the obsolete classic JSX import check to retain the fully unsuppressed inventory. `react-doctor:check` fails for **any unexcepted warning or error**, including optional design and unused-code findings. Every target must complete with no skipped checks. A missing, stale, duplicate, or unsupported exception fails validation.

Each invocation creates a fresh physical source copy outside the checkout, runs the supported public CLI, and prints its evidence directory. Add `-- --output=<fresh-empty-directory>` to retain evidence at an explicit location. Existing output is never overwritten. The helper uses Node for React Doctor's IPC rather than forcing the Bun runtime. It inventories existing tracked and ordinary untracked source while respecting Git ignores, excludes secrets and installed/generated skill catalogs, and redirects local workspace dependencies to the copy. Original-source and snapshot manifests detect edits, additions, deletions, or scanner rewrites during the audit. No private React Doctor module API is required.

The older `react-doctor:first-party` helper remains useful for interactive diagnostics; its default advisory `blocking: none` exit status does not establish acceptance. It rejects source-rewriting flags outside the disposable audit runner. Legacy `--full`, `--offline`, and `--fail-on` arguments are normalized for compatibility.

Scoring, sharing, telemetry, and supply-chain checks are disabled. CLI/package installation may require access to the package registry if the pinned version is not already cached. This is a local source-quality assessment; it supplies no numeric score, dependency-security certification, or authenticated production-flow certification. See the [official CLI reference](https://www.react.doctor/docs/reference/cli-reference).

## Rule configuration

`doctor.config.json` explicitly registers applicable default and optional rules for the pinned version. Accessibility, component shape, correctness, data-flow, performance, design, and unused-code checks remain enabled. There is no blanket rule ignore list. The only disabled source rule is `react-doctor/react-in-jsx-scope`: all three Next.js apps use the automatic JSX transform, so gratuitous React imports are not required.

An upgraded scanner must be researched against its published rule registry and supported CLI. Reconcile removed or renamed identifiers, review newly applicable rules, rerun raw and actionable audits, and regenerate evidence only after source adjudication. A previous exception is not authorization to waive a changed finding.

## Source boundaries

| Boundary                                                                              | Treatment and evidence                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.next/**`, `.next-docs/**`, `dist/**`, `coverage/**`, `node_modules/**`, `vendor/**` | Build output, dependencies, or upstream artifacts; first-party runtime source remains included.                                                                                                                                                                                                                                                            |
| `docs/**`, `tests/**`, `scripts/**`, `tooling/**`, `supabase/**`                      | Non-runtime or separately owned surfaces, verified by native lint, unit, workspace, and migration/documentation checks as appropriate. Tests outside a target still count as real consumers when reviewing unused exports.                                                                                                                                 |
| `public/maplibre/maplibre-gl-worker.mjs`, `public/maplibre/maplibre-gl-shared.mjs`    | Exactly two generated asset names, used by admin and donor. `scripts/copy-maplibre-worker-assets.mjs` copies them at Next config load. Both apps' copies were byte-identical to installed MapLibre 6.10.0 assets; Git already ignores the generated directories. Never hand-edit these bundles. Recheck package version and copy ownership when upgrading. |
| Eve generated development catalog                                                     | The audit copy excludes `packages/eve-runtime/skill-catalog/` when present. A separately authorized development catalog is maintained by its canonical sync/verification owner; this React cleanup does not install repository skills into the product runtime.                                                                                            |

## Exact exception ledger

`docs/qa/react-doctor/exceptions.json` is the machine-validated ledger. Each record identifies the target, relative file, rule, full diagnostic identity and location, source context and whole-file hashes, concrete reason, supporting source/test/policy evidence with hashes, and a condition requiring reconsideration. No unknown or deferred real finding qualifies.

Verify the actual contract before admitting an exception: JSX prop/ref forwarding belongs to shared primitive APIs; grid keyboard activation belongs to the owning gridcell; intentional numeric drafts may remain empty while being edited; annotation-only compiler diagnostics must be reconciled with installed compiler behavior; lifecycle and motion claims require the existing cleanup or global policy plus relevant behavior evidence. Required synchronous Recharts child APIs and lazy module boundaries need concrete importer evidence. A false positive at one location does not waive another location under the same rule.

Inline disables are not acceptance evidence: disposable audits ignore them and retain their raw findings. Do not add a broad suppression or weaken a native gate to obtain a clean audit. Review external/package/framework/test consumers before deleting an export. Preserve Base UI, exact `base-maia`, financial and permission ownership, stable draft identities, public import paths, current View Transition identities and flags, and silent revalidation.

## Verification

Add regression coverage before substantive fixes. Run focused tests, workspace-aware lint/typecheck, and applicable audits after each batch. For controls and layouts, use Chromium keyboard/focus checks, narrow widths, light/dark, reduced motion, and axe.

`test:react-cleanup` runs isolated **real React components with synthetic boundaries**. It includes contribution Hub/CRM launch surfaces and shared table, popover, chart, team, and wallet fixtures. It loads no credentials and makes no live provider calls. It covers failed submissions, stale revisions, refund limits, and a completed operation followed by refresh failure. These fixtures do not certify authenticated whole-page or production-provider integration.

Core retains its existing custom coverage provider. Its current `totalScripts: 0` fallback artifact does not measure line, statement, or branch coverage; a successful coverage-enabled unit run must not be reported as 100% coverage. Record this limitation alongside the executed test results. See the canonical Vitest skill and `vitest.coverage-provider.mjs`.

One exact native-lint false positive is documented separately in `docs/qa/react-doctor/native-exceptions.json`: the payment factory only captures refs for its returned event handler. Its file-level compiler check remains enabled under both root and app ESLint contexts. CRM CSV export now resolves its attachment URL against the current origin before native navigation, requiring no waiver. This native exception does not suppress the disposable React Doctor inventory. Existing native design-system debt counts are retained or pruned, never increased by this cleanup.

Completion also requires affected application builds, formatting, the full unit suite with coverage and four workers, and strict warning-level audits of all eight targets. Use `bunx --no-install vitest run --coverage --maxWorkers=4` for the full unit command. Retain raw reports, the exact ledger, a baseline-to-current finding disposition, and browser/build/test limitations in the final report. Changes stay local and uncommitted unless the user separately authorizes publication.

## Historical audits

The September 2026 configured audits and the initial October 6 pass used narrower ignore profiles. Their advisory results are not equivalent to the expanded all-applicable-rule acceptance above. The 2026-10-06 expanded planning inventory contained 10,185 raw diagnostics, of which 8,230 were the obsolete classic JSX import requirement; the remaining 1,955 required source fixes or evidence-backed adjudication. Git history preserves the older configured-audit decisions; use the current ledger and commands for present acceptance.

## 2026-09-19 Cleanup Decisions

Historical result (React Doctor 0.9.14, narrower configured profile): "React Doctor passes for the configured first-party audit". The eight reported targets were `@asym/admin`, `@asym/donor`, `@asym/missionary-app`, `@asym/auth`, `@asym/database`, `@asym/lib`, `@asym/missionary`, and `@asym/ui`; `doctor.config.json` ignore rules were not expanded in that pass. This dated configured result does not establish the current expanded acceptance criterion.

Current signed-upload ownership remains explicit: `packages/lib/cloudinary-server.ts` generates the SHA-256 upload signature; the email uploader in `packages/api/src/email/assets.ts` uses this helper and sends the signature, signed parameters, file, and API key. `signature_algorithm` is not submitted as a multipart upload field. Existing config-contract and signature tests guard this ownership; it is not a password-hashing assertion or a dependency-security certification.

The pre-upgrade inventory recorded `maplibre-gl@5.x` was locked at 5.23.0; that obsolete version is historical, and the current copied assets above come from 6.10.0. The September source pass also recorded: Remaining `parseJsonResponse` clones in portal hooks check `response.ok` before reading the JSON body. Cloudinary signed uploads use SHA-256 instead of SHA-1. Those statements describe specific source ownership and do not reactivate online supply-chain scoring.
