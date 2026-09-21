> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Question 12 — Executed research evidence and limits

7 September 2026. Actual source and synthetic fixtures are identified separately; this is not target donor Home certification.

## Actual source runtime observations

Actual Core component SSR with mocked data hooks/Next Link/Image/view-transition context; actual bootstrap/read helpers/retry classifier/shared UI with synthetic inputs. No app env, database, providers, target attention service, browser or hosted proof.

Empty process environment and scratch cwd; fetch/http/https/net/tls/Bun.connect/WebSocket disabled in process; fetch temporarily replaced only with synthetic401 responses. Not an OS network namespace. Zero real network attempts recorded.

- **R01** — Actual Home SSR renders supplied ready summary and mapped feed row; Home requests feed limit5. Hook results are synthetic, mapper/shared visual components actual.
- **R02** — Portal pending without data renders zero/default summary labels, not a portal pending state.
- **R03** — Portal error without data produces identical Home SSR markup to portal pending for the same empty feed fixture. The supplied portal error is not displayed.
- **R04** — A successful zero summary fixture renders identically to unavailable/pending portal fixtures. This proves display conflation, not an actual incident or target behavior.
- **R05** — Feed error retains supplied portal summary and displays Updates failure copy, hiding the supplied stale feed row. Positive independent-section handling.
- **R06** — Feed pending retains supplied portal summary and renders its loading skeleton, distinct from successful empty feed. SSR only; no timing or browser announcement proof.
- **R07** — Updates can remain visible when the portal source is unavailable; portal section still displays zero/default labels.
- **R08** — When caller supplies stale portal data alongside an error, current Home renders it without an error cue. This conditional mocked-input observation does not establish an actual cross-user disclosure or bypass auth cleanup.
- **R09** — Hardcoded hero remains alongside successful empty Updates. Tax Receipt and mapped update links target generic history/feed destinations, not exact documents/stories.
- **R10** — Actual bootstrap returns the same ready singleton after timer, pre-abort and mid-delay abort, with no fetch/network attempt. This is its intentional existing gate, not owner-read readiness.
- **R11** — Actual portal/feed fetch helpers propagate synthetic401 as plain Error without status. Actual shared retry classifier returns true at failureCount0 for these errors, but false for typed401/403 controls. No real retry schedule or HTTP request executed.
- **R12** — Actual CardTitle SSR defaults to div and supplies no heading element. Visual title alone does not establish a heading.
- **R13** — Actual ItemGroup defaults to role=list, while default Item emits a div without listitem role. Correct list-item composition is caller-owned.
- **R14** — Actual Alert defaults to role=alert. SSR does not prove an assistive-technology announcement, and routine Home rows need not all be assertive alerts.
- **R15** — Actual ItemDescription includes line-clamp-2 class while full text remains in SSR. This proves a CSS configuration risk for important copy, not measured browser clipping.
- **R16** — Existing Card/Item props compose an actual h2, list/listitem, ordinary link and unclamped consequence text with no assertive alert. This is scratch SSR composition, not a Core Home implementation or keyboard/focus/browser proof.
- **R17** — Installed Item successfully uses Base UI render={<a>} composition and retains data-slot=item. No Radix asChild, Card size prop or Item xs variant is required.

## Native PostgreSQL observations

A separate networkless PostgreSQL17.10 instance ran all76 actual Core forward migrations and12 new staff-attention assertions. Mounts were read-only, no ports were published and no existing app database/env was used. The isolated container was removed.

- **D01** — authenticated staff attention read denied. Passed expected observation (SQLSTATE 42501).
- **D02** — anon staff attention read denied. Passed expected observation (SQLSTATE 42501).
- **D03** — authenticated staff attention insert denied. Passed expected observation (SQLSTATE 42501).
- **D04** — authenticated staff attention update denied. Passed expected observation (SQLSTATE 42501).
- **D05** — service role unscoped read sees both tenants. Passed expected observation: 2.
- **D06** — explicit tenant filter excludes other tenant. Passed expected observation: 1.
- **D07** — duplicate key within tenant denied. Passed expected observation (SQLSTATE 23505).
- **D08** — same dedupe key across tenants is separate. Passed expected observation: 2.
- **D09** — unsupported staff status denied. Passed expected observation (SQLSTATE 23514).
- **D10** — privileged cross tenant task reference accepted. Passed expected observation: t.
- **D11** — nullable task reference accepted. Passed expected observation: t.
- **D12** — target p17 item and group tables absent. Passed expected observation: t.

These tests show actual staff-table protections and limits; they do not prove the target donor current-needs read model. Service-role two-Tenant reads and a cross-Tenant task reference are conditional privileged mechanisms, not a demonstrated donor exposure. The named P17 item/group tables are absent in this migrated fixture.

## Provider documentation only

Stripe CLI fetched current lifecycle, Smart Retries and SetupIntent reference pages; the manifest records paths/hashes. Core remains SDK22.2.0/API2026-05-27.dahlia. No account capability or payment/provider action was tested. Full external documents are not copied into this deliverable.

## Reproducibility and qualification

The bundle retains the runnable source harness, exact input/result descriptions, source hashes, synthetic HTML, native-migration harness/SQL/results, research notes, peer critiques and their reconciliation. All17 source observations and12 SQL assertions passed their recorded expected observations; undesirable existing behavior is not a failing observation. No failed test was hidden or reclassified as target success.

No actual browser, assistive-technology, hosted configuration, target projection/API, target PostgreSQL concurrency, provider financial action, production capacity or donor study ran. The review requires those exact release evidence groups. A CSS clamp class is not measured clipping; SSR semantics are not screen-reader proof; the retry-classifier result is not a live HTTP retry.

[Full review](phase25-r12-adversarial-review.md) · [Historical bundle inventory: phase25-r12-proof-bundle.zip](README.md#historical-verification-bundles)
