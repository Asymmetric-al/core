# D10 actual-hook history probe

Research evidence, 2026-10-16 UTC. This is new historical-period evidence; it does not rerun D9's nine model checks or D8's auth checks.

From the repository root (`/workspace/core` in the recorded environment):

```sh
TZ=UTC D10_PROBE_CASE=utc node --input-type=module < docs/features/missionary-workspace-depth/grill/d10-evidence/history-probe/probe.mjs
TZ=Pacific/Kiritimati D10_PROBE_CASE=positive-offset node --input-type=module < docs/features/missionary-workspace-depth/grill/d10-evidence/history-probe/probe.mjs
```

The stdin form intentionally resolves imports from the repository root. The probe uses installed Node v24.19.0, real React, React DOM, Testing Library and jsdom. No dependencies were installed. Both repository modules are imported unchanged: `packages/lib/hooks/use-donation-metrics.ts` and `apps/missionary/app/analytics/analytics-data.ts`. No production file, export, arithmetic or query implementation is copied or replaced. Controlled inputs are the fetch response and the clock. The React hook itself actually executes in jsdom.

Initial fixed time is `2026-10-16T12:00:00.000Z`. The UTC scenario advances to `2026-11-16T12:00:00.000Z` for one same-subject rerender, then clears the subject input. Fixtures and request observations are fully included in each JSON output. The extra `gift_date` field tests that the hook ignores it; the inspected real endpoint omits that field entirely.

**6/6 behavior checks passed:** five in UTC and one in UTC+14. Assertions document current behavior, including defects; they do not claim desired D10 acceptance behavior. `utc-results.json` and `positive-offset-results.json` preserve exact stdout. `run-manifest.json` records actual UTC execution times, explicit timezone/scenario, runtime dependency versions, exit status/stderr and SHA-256 digests of imported source, probe and results. Source digests matched before and after both runs. Compare current files with these hashes before attributing a later result to this source revision.

Scope limits: no live HTTP request, Supabase/database, real browser, rendered app/chart, authorization/revocation command, notification or provider ran. Fetch supplied synthetic financial rows only. The empty-subject case proves hook state behavior, not that production revocation invokes that transition. The rollover case rerenders without remounting or changing the fetched data; other app paths may remount. Server history grants, capped-query coverage and corrected-versus-as-was financial semantics remain static evidence or owner proof obligations described in [the runtime note](../current-runtime.md).
