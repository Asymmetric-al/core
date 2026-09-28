# Design

The web build planner passes `CORE_EVE_BUILD_MODE=artifacts` to its child
commands while retaining Turbo's dependency graph. The Eve workspace build
dispatcher defaults to full compilation/prewarming and rejects unknown modes.
Explicit `build:artifacts` and `build:full` commands remain available.

Admin's existing `withEve` integration uses one stable `build:service` command.
That dispatcher selects artifact mode only when it executes on a hosted preview.
The SDK preserves existing generated service commands, so choosing the mode only
when generating config could carry a preview skip into a later production build.
Service execution ignores the generic web artifact variable; production and
ordinary standalone commands retain the SDK's full build. A production target
overrides a conflicting preview environment marker.

Turbo hashes the mode. The Eve build task does not cache provider qualification:
an artifact build or a prior successful prewarm cannot stand in for a fresh
required full build. All auth, governance, sandbox and release code is unchanged.

Admin's generated `.eve/vercel-services` and `.vercel/output` bundles are excluded
from authored-source linting and data-boundary scans. Regression coverage checks
the exact output paths and confirms admin app/config and Eve agent/runtime source
remain checked. Actual scanner CLI fixtures reject raw database imports in
authored admin files, neighboring `.eve`/`.vercel` files, and another app's
same-named directory; retired CRM markers in authored Eve runtime still fail.

Installed Eve 0.25.1 source shows that skipping prewarm still emits app and
workflow functions. Its bundled Vercel runtime refuses a missing template rather
than prewarming it on demand. An isolated SDK fixture verified generated service
output and health without credentials or network access. Actual Core validation
must additionally exercise the package dispatcher and generated service.

Release-Off previews are unqualified artifacts. Later full sandbox/runtime
qualification and target-bound launch evidence remain required. If governance
denies that qualification, the denial remains a blocker; this change supplies no
alternate authorization path. No API, database, migration or runtime policy
change is part of this repair.
