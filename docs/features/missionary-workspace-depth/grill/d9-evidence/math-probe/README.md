# D9 actual-source summary math probe

Research evidence, 2026-10-16 UTC. Run from the repository root (`/workspace/core` in the recorded environment):

```sh
node --input-type=module < docs/features/missionary-workspace-depth/grill/d9-evidence/math-probe/probe.mjs
```

The stdin invocation is intentional so imports resolve from the repository root. Node v24.19.0 strips TypeScript natively. The only resolver hook maps the actual model's `./redaction` sibling import to the actual `./redaction.ts`; no model function, expression, module export or result is replaced. No installed dependency is needed by the imported pure modules.

`results.json` contains exact stdout; `run-manifest.json` contains UTC timing, command, runtime, exit status/stderr and SHA-256 hashes for all three imported source modules, the probe and result. Source hashes matched before and after execution. Compare current source hashes with the manifest before treating a rerun as evidence for the same source revision.

**9/9 checks passed.** These assertions preserve observed existing behavior, including identified defects; “passed” is not approval of financial semantics. Fixtures are synthetic and contain no personal or live financial data. The extra `refund_amount` fixture is deliberately ignored by the current model; the query's omission of refund facts is a separate inspected source fact.

No API, database, browser, React hook, JSX formatter, P12 policy, notification or provider pipeline ran. In particular, the 100× USD display finding, date-boundary findings, API row-cap coverage and commitment-query scope are **static source/wiring evidence**, not executed by this probe. The [runtime review](../current-runtime.md) states their exact evidence and limits. The D8 auth probe was not repeated.
