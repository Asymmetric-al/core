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
overrides a conflicting preview environment marker. The dispatcher uses the
canonical deployment-environment helpers so case and whitespace cannot hide a
production target. Hosted core-development and legacy staging retain artifact
mode; an explicit local development target retains full mode.

Both named build commands select their explicit mode through the same dispatcher,
overriding an inherited generic build mode. Full mode rejects the SDK's
skip-prewarm flag before starting Eve, while ordinary SDK arguments still pass
through. Explicit selectors cannot be combined with a forwarded service or
another mode selector. The Node 24 dispatcher imports the declared environment workspace
directly; it does not introduce another environment classifier.

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

## Shared-context validation follow-up

The canonical full gate exposed a pre-existing relation-ID false positive:
the valid UUID `01234567-8910-4111-8123-456789012345` contains a substring matching
the payment-number detector. A generated related claim ID could therefore
reject an otherwise valid disagreement. This is the narrow repair already
preserved from #1862 in #1905's reviewed integration candidate.

After the existing UUID schema validation, sensitive-content scanning excludes
only the top-level `relatedClaimIds` metadata. It still scans claim values,
provenance, evidence and other content, including UUID-shaped payment text.
The original IDs are retained in the claim and still require visible existing
claims for the same field, tenant and root run. Invalid IDs and relationships
remain rejected. This restores the accepted structured context and disagreement
preservation requirements in `eve-subagent-catalog-shared-run-context`; it
does not grant new authority or change any release gate.

The deterministic relation-ID regression and UUID-shaped-content rejection
control travel with this repair. #1862's design packs and the remaining #1905
work are still pending separate integration; this small repair does not
establish either PR's full supersession.
