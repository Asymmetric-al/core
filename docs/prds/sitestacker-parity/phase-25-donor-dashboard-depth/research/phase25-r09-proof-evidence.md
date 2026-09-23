> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Question09 — Executed evidence and limits

7 September2026. Focused recurring-edit research; not target editor, provider or release certification. Tests use synthetic input and do not implement the proposed donor journey.

## Installed-library observations

**Nine distinct observations.** Actual BaseUI1.5.0 and TanStack React Form1.28.6 ran under Node24.15.0 with synthetic strings. A Bun1.3.14 rerun reproduced them and is not counted as nine more tests. The harness uses server-rendered React markup and the actual FormApi/FieldApi lifecycle. No target form engine, browser, focus/keyboard behavior or provider was exercised. The initial plain WSL node command lacked PATH setup and ran no assertions; the explicit supported runtime completed successfully.

<!-- prettier-ignore -->
| ID | Actual observed behavior |
| --- | --- |
| U01 | Closed default Collapsible omits input from server-rendered markup. |
| U02 | Open Collapsible includes input in server-rendered markup. |
| U03 | Closed keepMounted Collapsible retains input markup; this does not prove browser focus exclusion. |
| U04 | Mounted invalid field runs its onSubmit validator and blocks submission. |
| U05 | Unmount preserves empty value and touched flag, clears field error metadata. |
| U06 | With only an unmounted field validator, the retained empty value reaches the form submit callback; no field validation runs. |
| U07 | Remount does not overwrite touched retained input with field defaultValue. |
| U08 | A form-level onSubmit validator blocks the retained invalid value even after field unmount. |
| U09 | Explicit deleteField removes the retained value; ordinary unmount did not. Collapse must not be implemented as deleteField. |

The critical observation is U06: with only the unmounted field's validator, retained invalid data reaches the form submit callback. This is not an Asym financial acceptance or proof a server validator is bypassed. U08 proves actual form-level validation can still reject it. A proposal must be validated independently of which sections are mounted; keepMounted alone does not prove hidden focus, browser accessibility or preserved provider setup.

## Actual current Core source with synthetic dependencies

**Thirteen observations.** Node24.15.0 executed current TypeScript through an allowlisted VM loader with installed Zod4.3.6. The outer process used a cleared environment, synthetic America/Los_Angeles timezone and network namespace. Evaluated source had no process/env/filesystem/fetch capability. Source hashes are in source-results.json.

Actual code includes model/view/patch helpers, Billing Portal handler, ownership service, withOperation and errors. Auth resolution, role guard, DB rows/client, provider resolver/session, audit sink and NextResponse were mocked. Thus the control flow/error normalization is real; actual RBAC, RLS, Next deployment, Stripe-hosted actions and the target Change service are not tested.

<!-- prettier-ignore -->
| ID | Observation | Actual result |
| --- | --- | --- |
| M01 | Missing legacy cadence/status become monthly/active and count as active | `{"frequency": "monthly", "status": "active", "activeCount": 1}` |
| M02 | Conflicting legacy next dates prefer next_charge_at rather than reconcile source schedule | `"2026-09-15T00:00:00.000Z"` |
| M03 | View mapper preserves original start and explicit end date without mutation | `{"start": "2026-01-01", "end": "2026-12-31"}` |
| M04 | Recurring model divides100 by100 even when currency is JPY; valid display formatter then shows one yen | `{"amount": 1, "label": "Â¥1"}` |
| M05 | Malformed currency is displayed as USD by current formatter, not an economic conversion | `"$50.00"` |
| M06 | Date-only display is UTC-pinned despite America/Los_Angeles test process timezone | `"Jan 1, 2026"` |
| M07 | Profile patch helper preserves explicit null/false and omits undefined; not a recurring-term schema | `{"phone": null, "doNotEmail": false}` |
| M08 | Existing strict profile schema rejects recurring edit keys | `true` |
| B01 | Actual withOperation awaits ownership-service rejection and normalizes404 before provider | `{"status": 404, "hasRequestId": true, "providerCalls": 0}` |
| B02 | Missing Stripe customer returns409 with wrapper correlation and no session call | `{"status": 409, "hasRequestId": true, "providerCalls": 0}` |
| B03 | Generic portal endpoint ignores edit payload; one mocked session has only customer and wallet return | `{"status": 200, "providerCalls": 1, "keys": ["customer", "return_url"], "returnUrl": "https://synthetic.invalid/donor-dashboard/wallet", "roles": [["donor"]]}` |
| B04 | Injected role guard refusal propagates as403 before ownership query/provider; real role resolution not tested | `{"status": 403, "queries": 0, "providerCalls": 0}` |
| B05 | Unconfigured tenant Stripe boundary returns503 without session creation | `{"status": 503, "providerCalls": 0}` |

M04 is a zero-decimal money-unit interpretation error in the supplied synthetic JPY view, not a real JPY charge or proof that any connected account supports it. M05's USD display fallback is not FX conversion. M06 positively verifies a date-only display helper in a western process timezone, not the schedule kernel. B03's one provider call is a mock generic session; its200 does not claim fields were saved, and no real session was created. B01/B02/B04/B05 preserve positive current guards without claiming complete target authority. The actual awaited withOperation is distinct from the older return-without-await helper finding.

## Actual legacy PostgreSQL after native migrations

**76 actual forward migrations and12 observations.** The repository-native verifier ran against a newly created postgres:17-alpine container, server17.10, cached image with pull=never. Network none, no published ports, readonly migration/verifier-SQL mounts and disposable tmpfs. No existing application database, .env, real donor or provider credentials were used. Exact migration hashes/image/role/catalog metadata and SQL transcript are bundled. The unique container was removed.

<!-- prettier-ignore -->
| ID | Experiment | Actual result / SQLSTATE |
| --- | --- | --- |
| DB01 | anon_select_granted_but_initial_fixture_has_no_visible_rows | `"0"` / `none` |
| DB02 | authenticated_direct_insert_denied | `""` / `42501` |
| DB03 | authenticated_direct_update_denied | `""` / `42501` |
| DB04 | authenticated_direct_delete_denied | `""` / `42501` |
| DB05 | anon_cannot_read_inserted_private_pledge | `"0"` / `none` |
| DB06 | actual_authenticated_own_pledge_select | `"1"` / `none` |
| DB07 | actual_authenticated_unrelated_pledge_denied | `"0"` / `none` |
| DB08 | owner_negative_amount_rejected | `""` / `23514` |
| DB09 | owner_null_scope_accepted | `"t"` / `none` |
| DB10 | owner_cross_tenant_donor_reference_accepted | `"99000000-0000-4000-8000-000000000052"` / `none` |
| DB11 | authenticated_owner_can_read_preexisting_poisoned_tenant_row | `"1"` / `none` |
| DB12 | owner_arbitrary_cadence_status_and_contradictory_dates_accepted | `"t"` / `none` |

The final donor_pledges catalog has RLS enabled, FORCE false, owner postgres. Anon and authenticated have SELECT but no INSERT/UPDATE/DELETE grants. Only authenticated has the owner/staff SELECT policy. Service_role has BYPASSRLS but no table grants in this native compatibility fixture; do not equate bypass with access. Normal own/unrelated tests use the compatibility auth.uid function and synthetic request.jwt.claim.sub values, not real Supabase login or HTTP.

The normal donor saw its own row and not the unrelated donor's row. Anon saw no inserted private row. The table rejects negative amounts. These are positive controls. Database-owner fixture writes then demonstrated nullable scope, a TenantB row linked to TenantA's donor, and arbitrary frequency/status plus contradictory start/end/next dates. Under the real policy in this fixture, the linked authenticated donor could read that pre-poisoned cross-Tenant row. Donors were not shown able to insert the poison; production rows/grants/application exposure were not inspected. The finding concerns structural scope plus the exact policy, not a demonstrated hosted exploit.

This is actual legacy schema/role proof after all migrations, not target term/calendar/command/subject/provider tables or a concurrent preview/apply/stop test. The earliest migration's disabled-RLS statement is obsolete after the current chain. No migration was changed to make the checks pass.

### Failed assumption retained

Attempt1 expected anon's SELECT itself to be permission-denied. It actually succeeded with zero rows because SELECT is granted and RLS supplies the filtering boundary. The script stopped, removed its container and saved database-attempt1.json. The expectation was corrected from the observed catalog, a populated private-row check added, and a fresh complete run finished all12 observations. This correction was to the research harness, not the product schema.

## Current Stripe/documentation evidence

SDK22.2.0/API2026-05-27.dahlia remain pinned in current source/lockfile. stripe docs fetched five current pages: subscription prorations, billing cycle, save-and-reuse routing, SetupIntents and request idempotency. The save-and-reuse response is a short routing page, not a full Elements implementation guide. Material conclusions also use the substantive SetupIntent/subscription references and existing owner contracts; no raw-card/provider-integration claim is based on the routing stub.

Existing default/test CLI GET scope again returned zero connected accounts, no additional page and platform charges/payouts disabled with empty capabilities. Only allowlisted nonsecret fields were saved. This does not describe unseen production, and no connected-account tracer, financial action, setup, bank verification, subscription update or send was performed. A preliminary shell-quoting error ran no Stripe research; the generated script then completed these read-only calls.

## Reproduction and source-only scope

The bundle includes installed-ui-semantics.mjs, source-observations.mjs, their JSON outputs, database-proof.py, LF psql-isolated.py, results/transcript and the initial failed expectation. All require the recorded Core worktree/dependencies. The database harness creates only a unique labelled networkless temporary container and removes it; its transport accepts a dummy local URI and exact generated container ID. It must not be pointed at an application database.

The source harness was run with environment cleared, a safe PATH, synthetic TZ=America/Los_Angeles, unshare --user --map-root-user --net, Node24.15.0 and --experimental-vm-modules. The library harness needs no application env and uses only installed local libraries with synthetic strings. No target implementation was written to produce passing observations.

Fresh source-only work includes the actual pledge page, generic Billing Portal, owned projections/absence of target commands, current ADR/OpenSpec/P16/P24 contracts, issue bodies/native blockers and exact installed shared UI wrappers. These facts are kept distinct from executed tests. Historical Q03–Q08 results are not added to any new count.

## Required but not run

Target PostgreSQL compound authorization/current-head/CAS/concurrent stop/claim tests; actual provider no-charge/multi-leg/setup-return contracts; hosted grants; real donor mobile/screen-reader/keyboard/focus; complete form/error/collapse journey; secure redirect/login; end-to-end accepted-result recovery; rollout/load/comprehension evidence. These are the main review's P01–P14 release gates. The three bounded experiment sets do not certify them.
