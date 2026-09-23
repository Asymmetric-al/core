Planning contract reconciled on 2026-09-22. Read [package authority and checkpoints](README.md) and [owner amendments](adoption-map.md). Source-era evidence is dated; runtime qualification remains open.

<a id="web-acceptance"></a>

# Acceptance, qualification and operational evidence

<a id="web-h-evidence-classes"></a>

## Evidence classes

**S — Structural:** reference JSON examples, constraints, links, local task graph and traceability. This package executes only S tests.

**C — Contract:** real owner functions, serializer, adapter, receipts, deterministic compiler and domain invariants.

**D — Database:** real PostgreSQL restricted roles, grants, RLS USING/WITH CHECK, transactions, constraints, claims, races, rollback and recovery.

**B — Browser/product:** actual admitted React/Next/Payload/Puck cohort, real auth, composition, SSR/no-JS, preview and staff journey.

**O — Operational:** production-shaped scale/cost/fault and runbook evidence under the exact provider/runtime profile.

**U — User:** moderated representative content editors/designers/developers, accessibility and successful handoff.

All fourteen [HA-INT cross-product cases](integration-scenarios.md) are cumulative with the paired HW scenarios and assigned to exact checkpoint scopes. No S test substitutes for C/D/B/O/U. A benchmark target below is a proposed acceptance criterion, not an observed product result or vendor guarantee. Every HW requirement has two observable scenarios in [the matrix](acceptance-scenarios.md#web-test-matrix); extend with the boundaries below when implementing.

<a id="web-h-mandatory-qualification-gates"></a>

## Mandatory qualification gates

| Gate                          | Question and exact pass evidence                                                                                                               | Failure disposition                                                                                                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q01 Engine/toolchain cohort   | One coherent supported Payload-major-compatible set; clean install/build/start; access, versions, migrations and preview use exact source/lock | Fix/admit a suitable cohort under D34; no silent v3/raw-admin fallback                                                                                                          |
| Q02 Transaction and authority | Save, lease, revision, receipt and required dispatch commit in one physical database transaction; injected rollback and lost-response proof    | Resolve adapter transaction design before content writes ship                                                                                                                   |
| Q03 Composer/bridge/adapter   | Actual pinned Puck round-trip, composition grammar, Base Maia fit, separate origin authentication and browser behaviors, no field loss         | Correct adapter; use the same approved grammar in an accessible outline with isolated preview only as an explicitly labelled limited rollout; do not claim full visual delivery |
| Q04 Presentation SDK/runtime  | Fresh source project, exact bindings, pure public input, server/client boundary, SSR/no-JS/hydration and required old artifact coexistence     | Repair SDK/distribution; do not use runtime URL imports or broaden customer server authority                                                                                    |
| Q05 References and safety     | Qualified media, links, dynamic projections, restricted-negative fixtures, withdrawal before render and side-effect-dark preview               | Leave affected capability unavailable; no unqualified substitute or operational data copy                                                                                       |
| Q06 Exact release/cohort      | Real D1/D10/D25 candidate, head/CAS, locale census, stale/unknown/cancel/restore and current-content preservation                              | No favorable public activation until exact join passes                                                                                                                          |
| Q07 Staff/developer usability | Real participants complete content, composition, review and post-redesign edit tasks; replacement developer follows fresh-clone docs           | Fix demonstrated friction or narrow the admitted task profile; no usability claim from author demo                                                                              |
| Q08 Capacity/cost/isolation   | Named production-shaped profile with request/build queues, abusive input, recovery, provider quota and fair tenancy                            | Admit only the measured bounded profile; no speculative unlimited claim                                                                                                         |
| Q09 Migration/cutover         | Current census, old/new reader/writer matrix, interrupted transformation, private successors, retention and complete legacy-writer retirement  | Delay affected cutover; no durable dual-write or raw restore fallback                                                                                                           |

Technology/build provider selection is conditional on these gates, but the required behavior is not deferred: no alternate implementation may remove the contract to pass. Asym's mandatory reference requirements do not depend on which provider eventually satisfies them.

<a id="web-h-proposed-initial-capacity-profile"></a>

## Proposed initial capacity profile

This profile is an engineering starting point requiring explicit adoption and measurement alongside D33. It is **not a new commercial tier, promise of current scale, override of stricter owning limits, or permission to infer unlimited operation**.

| Dimension                  | Proposed qualification value                                                                                                                                     |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dataset                    | 10 Tenants × 3 Sites × 2 exact locales × 1,000 Pages = 60,000 Pages; include history/reuse/media fixtures and one deliberately skewed busy Tenant                |
| Active editing load        | 100 concurrent editor sessions total, including 20 same-Tenant sessions and same-resource conflict attempts                                                      |
| Source/build concurrency   | 10 global build attempts, maximum 2 per Tenant under the qualified test profile; remaining work queues fairly                                                    |
| Page structure             | 64 root entries, 128 expanded nodes, two container levels, 16 children per Stack/Split slot, 12 Grid items, 512 KiB canonical JSON                               |
| Source intake              | 100 MiB compressed/captured request ceiling, 500 MiB expanded source, 10,000 files; explicit archive expansion and path checks                                   |
| Build sandbox              | Initial test envelope 2 vCPU, 4 GiB memory, 10-minute wall-clock ceiling; dependency acquisition separately metered and bounded                                  |
| Package artifact           | 20 MiB compressed package artifact excluding separately qualified media; validate referenced total/rendition limits at custody owner                             |
| API feedback target        | Save acknowledgement p95 ≤500 ms of server processing at admitted load, measured separately from simulated network; no success before commit                     |
| Visual feedback target     | Local edit/move feedback p95 ≤100 ms on the declared target device/fixture; long tasks, input latency and lost caret tracked                                     |
| Git webhook                | Acknowledge durably accepted event within documented 10 seconds; proposed internal p95 ≤2 seconds                                                                |
| Fault network profiles     | Normal desktop; 1 Mbps down/256 kbps up with 300 ms RTT; 60-second disconnect; repeated response loss after commit                                               |
| Safety/integrity tolerance | Zero cross-scope disclosure, unauthorized publication, accepted-content loss, raw provider escape or duplicate authoritative effects in the qualification matrix |

Long articles have separate D11 limits; nesting limits apply to composition containers, not recursively to every rich-text node. Repeaters/galleries/cards retain their own semantic ceilings. A 512 KiB JSON limit is UTF-8 canonical byte length, not characters or transport compression. Source MiB is 1,048,576 bytes. Capacity at any larger profile needs new evidence; tenant data larger than the qualified profile is not silently truncated.

D12's approximately two-second idle debounce, five-minute inactive lease and 100 ordinary unpinned history targets are inherited qualification starting values, not newly invented tenant settings (R07). Renew during legitimate active use/reading; hidden or abandoned tabs do not retain ownership indefinitely.

<a id="web-h-required-adversarial-tests-beyond-the-paired-scenarios"></a>

## Required adversarial tests beyond the paired scenarios

<a id="web-h-data-and-concurrency"></a>

### Data and concurrency

Race save with save, takeover, permission revocation, locale disablement, source migration and restore. Repeat an old idempotency key with changed payload. Lose responses after content, receipt, candidate and activation commits. Prove no false Saved, no successor-before-unknown-resolution and no same-user tab exemption. Test row-scope transformations, forged attribution, nullable wildcard attempts and cross-Tenant foreign keys under real roles.

<a id="web-h-visual-component-contracts"></a>

### Visual/component contracts

Round-trip all supported catalog types and settings through the **actual pinned Puck adapter**. Test empty, maximum, long, unknown future version, v1/v2, Article and Phase 22 rejection paths. Move nodes without changing IDs; duplicate with fresh IDs; reject cycles and illegal slots. Verify field edits alter actual rendering rather than merely changing JSON. Ensure source migration cannot discard an unknown prior field or overwrite newer editorial changes.

<a id="web-h-preview-and-rendering"></a>

### Preview and rendering

Exercise all supported browser engines, authenticated separate-origin embedding, blocked third-party cookies, expired credentials, malicious postMessage, stale channel reuse, service-worker attempts, redirects, SVG/HTML/script injection through disallowed paths and public source-map leakage. Test no-JS output, server/client markup parity, hydration, fonts/images failing, RTL/CJK, long translations and reduced motion. Candidate links never fall through to Live and capabilities never produce actual payments/sends.

<a id="web-h-git-and-builds"></a>

### Git and builds

Forged installation callback; same GitHub user serving multiple ministries; repository rename versus transfer; removed App; private/public visibility change; archived/deleted repository; stale event after reconnect; branch force-push after source capture. Malicious archive path, huge expansion, symlink escape, unsupported submodule/LFS source, install script egress, cache poisoning, rewritten customer tests, forged status and wrong artifact digest. No permanent provider token reaches the sandbox, source metadata or logs.

<a id="web-h-publication-and-scheduling"></a>

### Publication and scheduling

Content release under existing auto/manual policy; complete design-cohort activation, locale added/removed mid-review, source code available but not active, active old version during new deployment, changed related source versus unrelated Page change. D13 nonexistent/ambiguous civil times, UTC not-before, cancellation at the execution fence, missed delivery, replay beyond 24 hours and organization-owned authorization after routine initiator departure. Current safety withdrawal defeats obsolete favorable replay and restore.

<a id="web-h-migration-retention-and-exit"></a>

### Migration, retention and exit

Code N/schema N, code N/schema N+1 and code N+1/schema N with defined compatible profile. Interrupt a batch and re-run safely; a changed editor draft conflicts without being overwritten. Retention-held active/candidate/scheduled assets survive cleanup. Expire preview compute without erasing durable source. Ministry maintainer replacement and fresh-clone export reflect real rights and supported dependencies, not a fake standalone-platform promise.

<a id="web-h-accessibility-and-handoff-scenarios"></a>

## Accessibility and handoff scenarios

Conduct automated accessibility checks plus manual keyboard, screen-reader announcements, focus restoration, touch without dragging, contrast/forced colors, 400% zoom/reflow, logical reading order, RTL/CJK and reduced motion. A desktop authoring canvas may be the richest interface, but mobile must expose supported content/review/recovery tasks clearly rather than a broken miniature desktop UI. Use the qualified outline/inspector path for narrow screens without changing the underlying grammar or permissions.

Representative tasks: create a campaign-style Page from a starter; move/add approved content; choose an image and provide usage-local accessibility metadata; compose a split/grid; preview a locale; distinguish saved from public; schedule an exact revision; recover a conflict; review a custom design; edit the headline and image after it becomes active. These are proposed research tasks, not an assertion of previously observed ministry behavior. Record participant characteristics, assistance required, failures and comprehension of public consequences.

<a id="web-h-monitoring-after-release"></a>

## Monitoring after release

| Signal                                                      | Proposed threshold                                                    | Accountable owner       | Response                                                                                        |
| ----------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------- |
| Unauthorized disclosure/effect or acknowledged-content loss | Any confirmed instance                                                | Security + source owner | Immediately contain affected operation; preserve evidence; do not treat as routine monitoring   |
| Accepted integration work not progressing                   | Oldest eligible item >5 min for 10 min                                | Integration maintainer  | Reconcile original dispatch/provider state; no blind successor request                          |
| Unknown external outcome                                    | >2 min unresolved                                                     | Effect owner            | Receipt/provider reconciliation and explicit user status                                        |
| Repeated compatibility rejection                            | Same cause on 3 distinct revisions in 24 h                            | SDK maintainer          | Review docs/tooling/SDK compatibility, never weaken validator automatically                     |
| Save latency regression                                     | p95 above admitted profile for two 5-min windows with adequate sample | CMS/runtime maintainer  | Diagnose and reduce admission/load; maintain save truth                                         |
| Build resource ceiling breach                               | 2 consecutive runs for same project/profile                           | Build maintainer        | Pause further auto-build for that cause, diagnose source/profile; keep safe public site serving |
| Unsupported active artifact/maintainer absent               | Any violation of recorded support policy                              | Presentation owner      | Named maintenance/upgrade action; current safety owner decides containment                      |

These are proposed operational triggers, not external SLA claims. Insufficient samples remain unknown. Retention and rights violations are governed by their source owners rather than arbitrary alert timers.

---
