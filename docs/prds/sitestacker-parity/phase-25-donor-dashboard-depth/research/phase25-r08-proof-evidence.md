> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Question 08 — Executed evidence and limits

7 September 2026. Research proof for the dedicated Receipts & statements decision, not certification of the target donor document journey. This record separates actual-source mocks, actual legacy PostgreSQL observations, source inspection and unrun acceptance proof.

## Actual current source with synthetic dependencies

**13 observations passed.** Node24.15.0 ran current Core TypeScript, installed Zod and an allowlisted module loader, with synthetic auth/database/NextResponse dependencies. The process used an environment-cleared network namespace; evaluated source had no fetch, filesystem, process, real database or provider capability. Source hashes are in document-source-results.json. The outer harness only loads source and writes its results.

No browser, Next server, PDF renderer, storage or target document projection was used. Ignoring a Range request with full200 is not by itself an HTTP vulnerability. Absence of explicit Cache-Control in the mocked response is not a demonstrated cache leak. A test qualification adapter is not actual issuer/provider qualification.

<!-- prettier-ignore -->
| ID | Observation | Actual result |
| --- | --- | --- |
| D01 | No year gifts returns200 annual-looking text with zero total/count and no document-source read | `{"status": 200, "type": "text/plain; charset=utf-8", "zero": true, "tables": ["profiles", "donors", "donations"]}` |
| D02 | Next calendar year passes current route bounds and returns zero text without an issued-document check | `{"status": 200, "title": "2027 Giving Statement"}` |
| D03 | Same statement resource returns changed bytes when current donor name changes | `{"changed": true, "oldName": true, "newName": true}` |
| D04 | Current statement GET ignores Range and returns full200 text at this mocked route seam | `{"status": 200, "contentRange": null, "sameFullBody": true}` |
| D05 | Current statement response supplies no explicit Cache-Control header; no cache leak inferred | `null` |
| P01 | Domain-ready annual purpose stays dark with actual default qualification adapter | `{"state": "dark", "outcome": "not_ready", "codes": ["contract_dark"]}` |
| P02 | Explicit exact current qualified test adapter plus all gates supports that purpose | `"supported"` |
| P03 | Qualified test adapter cannot override missing issuer proof | `{"state": "dark", "codes": ["issuer_proof_missing"]}` |
| P04 | Expired affirmative qualification remains dark | `{"state": "dark", "codes": ["qualification_expired"]}` |
| P05 | Unknown purpose is absent rather than falling back to a general document | `{"state": "absent", "codes": ["purpose_unknown"]}` |
| P06 | New-purpose resolver/catalog hides inactive Canadian purposes; this is not an existing-artifact access test | `{"state": "absent", "listed": false}` |
| P07 | Admitted purpose returns catalog metadata only, no allocated logical document/artifact identity | `{"admitted": true, "keys": ["admitted", "admitted_at", "catalog_digest", "lane", "purpose_id"], "digestLength": 64}` |
| P08 | Qualification-source failure stays dark | `{"state": "dark", "codes": ["qualification_not_ready"]}` |

The generation-purpose tests establish useful fail-closed gates and metadata-only admission. They do not establish the existence of any issued donor document. Inactive new-purpose catalog state must not be reused as a historical document access decision.

## Actual legacy receipt tables after native migrations

**76 forward migrations; 19 observations passed.** The repository-native migration verifier ran against a newly created postgres:17-alpine container, server17.10. The local cached image was used with pull=never; this does not claim the latest PostgreSQL patch version. Network mode was none, no ports were published, only migrations and verifier SQL directories were mounted read-only, and storage was disposable tmpfs. No app environment, donor data or credentials were loaded. Exact migration hashes, image identity and isolation metadata are in database-results.json.

The complete native compatibility fixture is more informative than a made-up schema, but it is not hosted Supabase. Roles/grants here are the verifier's bootstrap plus all actual migrations. The existing running Supabase and other containers were not queried or changed. The disposable test container was removed after execution.

<!-- prettier-ignore -->
| ID | Experiment | Actual result / expected SQLSTATE |
| --- | --- | --- |
| DB01 | gift_receipt_records_anon_read_denied | `""`; SQLSTATE `42501` |
| DB02 | gift_receipt_records_authenticated_read_denied | `""`; SQLSTATE `42501` |
| DB03 | gift_receipt_records_authenticated_update_denied | `""`; SQLSTATE `42501` |
| DB04 | gift_receipt_records_authenticated_delete_denied | `""`; SQLSTATE `42501` |
| DB05 | contribution_receipt_snapshots_anon_read_denied | `""`; SQLSTATE `42501` |
| DB06 | contribution_receipt_snapshots_authenticated_read_denied | `""`; SQLSTATE `42501` |
| DB07 | contribution_receipt_snapshots_authenticated_update_denied | `""`; SQLSTATE `42501` |
| DB08 | contribution_receipt_snapshots_authenticated_delete_denied | `""`; SQLSTATE `42501` |
| DB09 | service_role_receipt_cross_tenant_gift_reference_accepted | `"{}"`; SQLSTATE `none` |
| DB10 | service_role_receipt_snapshot_mutable_and_version_zero_allowed | `"0"`; SQLSTATE `none` |
| DB11 | receipt_second_row_same_gift_rejected_by_unique_donation | `""`; SQLSTATE `23505` |
| DB12 | receipt_duplicate_number_different_gift_accepted | `"R08-1"`; SQLSTATE `none` |
| DB13 | service_role_receipt_hard_delete_accepted | `"88000000-0000-4000-8000-000000000051"`; SQLSTATE `none` |
| DB14 | snapshot_cross_tenant_reference_and_empty_content_accepted | `"{}"`; SQLSTATE `none` |
| DB15 | service_role_snapshot_content_mutable | `"{\"changed\": true}"`; SQLSTATE `none` |
| DB16 | donation_delete_cascades_receipt_snapshot | `"0"`; SQLSTATE `none` |
| DB17 | gift_receipt_record_restricts_donation_delete | `""`; SQLSTATE `23503` |
| DB18 | concurrent_receipt_insert_one_winner_one_unique_rejection | `{"successes": 1}`; SQLSTATE `none` |
| DB19 | concurrent_receipt_insert_preserves_single_row | `"1"`; SQLSTATE `none` |

### What the catalog actually establishes

Both sampled tables have RLS enabled, FORCE RLS false, owner postgres and no row policies in this fixture. Anon/authenticated table privileges are revoked. Service_role has BYPASSRLS and SELECT/INSERT/UPDATE/DELETE grants. Effective table access and bypass behavior matter together: a prior Q07 preference table with no service-role grant is a different table, not a contradiction.

The tests inserted synthetic succeeded gifts. A gift_receipt_records row with its own status=failed and empty snapshot was accepted, including a mismatched Tenant/gift reference. A privileged snapshot update and snapshot_version=0 were accepted. A repeated donation_id was correctly rejected, including two concurrent inserts yielding one winner and one23505. This proves that old unique key, not a target correction/current-head protocol. Receipt-number duplication across a different gift was accepted; this does not prescribe a global serial uniqueness rule.

Privileged gift-receipt deletion was accepted. The contribution snapshot's content was mutable and its donation deletion cascaded. An existing gift-receipt record instead restricted deletion of its referenced donation. Do not generalize either behavior to all records. No donor route or live user was shown able to perform these privileged actions.

Full columns/defaults/nullability, constraints, indexes, noninternal triggers, policies, role flags and effective privileges for the two tables are included in the JSON. Required target same-scope references, immutable facts/artifacts, current-head succession, records restrictions, representative access and byte-serving authorization were NOT exercised; those owners are not completed by this fixture.

### Initial harness error and cleanup

The first attempt could not execute the psql transport because Windows line endings broke its Unix shebang. It stopped before any migration or assertion and removed its unique container. database-attempt1.json records that failure. The wrapper was regenerated with LF bytes; the subsequent independent container completed all76 migrations and19 observations and was removed. No repository migration was edited to make a test pass.

## Source-only and prior evidence

Fresh inspection found the current donor navigation/history links, capped gift read, five generated years, mutable receipt and statement routes, donor-role/tenant ownership checks, partial purpose-catalog foundation, installed Maia component composition and existing auth-return/cache behavior. The legacy staff PDF endpoint has capability and no-store controls but generates through DocRaptor on request; it was not called. Legacy pdf_template_artifacts and public document-uploads policies were inspected only, not sampled by these19 assertions or accessed through a storage service. No protected file was fetched or live disclosure claimed.

Prior Q05 observations of live-text receipts, currency/history defects and helper errors, Q06 auth-return evidence, and Q07 cache user/logout observations retain their original scopes. They are not new Q08 tests. Stale async profile-load fencing was inspected, not newly race-tested. Current permission guards and cache cleanup positives were not ignored.

## Reproduction

The bundle contains the self-contained database-proof.py and LF psql-isolated.py transport, exact source harness and results/transcript. It requires the recorded Core worktree/dependencies, repository-native migration verifier and the cached Docker image. It creates a unique labelled networkless disposable database; it must not be pointed at an application database. The wrapper rejects any connection argument other than its dummy local URI and transports only to that unique container.

The actual-source command used (machine-specific installation and research roots replaced with placeholders; this is historical evidence, not a runnable repository test command):

```text
wsl -d Ubuntu-24.04 -- env -i PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin unshare --user --map-root-user --net <Node-v24.15.0> --experimental-vm-modules <historical-research-root>/phase25-r08/document-source-observations.mjs
```

Database execution used WSL python3 on work/phase25-r08/database-proof.py. No application .env/local.env file was needed or copied for either proof.

## Required but not run

Target PostgreSQL authorization/current-head/recipient races, source-to-exact-stored-PDF integration, full/range streaming integrity, actual Vercel/CDN/cache behavior, hosted roles/storage, real auth/guest browser journeys, accessible PDF validation, mobile/screen-reader journeys, load envelope and donor usability are release requirements in the main review's P01–P14. No provider/sandbox/live financial or communication action was run. This evidence does not certify those unrun contracts.
