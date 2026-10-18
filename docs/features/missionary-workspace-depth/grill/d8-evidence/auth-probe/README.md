# D8 actual-source auth probe

Research evidence only. `probe.mjs` preserves the exact five-check script first executed during the D8 runtime review. It imports the repository's actual pure auth modules, not a recreated model. It was rerun once to save timestamped output and source hashes; this did not broaden the check scope or change application files or dependencies.

From the repository root (`/workspace/core` in the recorded environment), run:

```sh
node --input-type=module < docs/features/missionary-workspace-depth/grill/d8-evidence/auth-probe/probe.mjs
```

The input redirection is intentional: these original relative imports resolve against the repository root when Node reads the module from stdin. Do not run the saved file directly with `node path/to/probe.mjs`. Recorded Node version: v24.19.0, with native TypeScript stripping; no dependency installation or application server is needed.

`results.json` is the exact captured stdout. `run-manifest.json` records UTC start/end time, command, runtime, exit status, empty-or-present stderr, and SHA-256 digests for both imported source files, the probe and output. The source hashes were checked before and after the rerun and matched. Compare current source digests with the manifest before treating a later result as evidence for the same source revision.

Five checks passed. This verifies only the pure auth helpers' observed role/route behavior. The unsupported `coach` value deliberately tests the current boundary; it is not a valid declared `UserRole`. The two-Tenant input tests the helper's caller precondition, while current request loaders filter to the profile tenant. It does not demonstrate a deployed cross-Tenant exploit or prove server, browser, database/RLS, JWT, invitation, P12 grant/revocation or provider behavior. See [the runtime review](../current-runtime.md) for the source-backed integration findings and deferred proof.
