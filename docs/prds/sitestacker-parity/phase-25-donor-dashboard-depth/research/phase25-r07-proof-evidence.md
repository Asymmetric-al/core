> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Question 07 — Executed evidence and limits

7 September 2026. These are research observations for two independent Ministry Update controls, not certification of an implemented donor journey.

## Actual current source with synthetic dependencies

21 observations passed. Node 24.15.0 executed actual current Core TypeScript in VM modules, using installed Zod 4.3.6, actual schema/error mapping, JSON coercion, portal model, preference/consent/posts handlers, feed hook and client-session state machine. Source file hashes are supplied in the JSON evidence.

The caller used an environment-cleared Linux user/network namespace and an import allowlist. Auth, database, Next response/cache, query hooks and session sources were synthetic mocks. No app env, real donor identity, server/browser, provider or existing database was used. Expected experimental Node VM/TypeScript warnings do not establish browser behavior. The saved source harness can reproduce these observations against the recorded source/dependencies.

IDs in this table are **source-observation IDs**. They are separate from F01–F22 concern IDs and C01–C22 requirement IDs.

<!-- prettier-ignore -->
| ID | Experiment | Actual result |
| --- | --- | --- |

| M01 | Missing preference row maps to email/follow true in actual portal model | `{"showOrgPosts": true, "showMissionaryPosts": true, "followOrg": true, "emailOrgPosts": true, "emailMissionaryPosts": true, "pushOrgPosts": false, "pushMissionaryPosts": false}` |
| M02 | Explicit false preference survives current portal model | `false` |
| R01 | Unauthenticated preference GET is rejected | `401` |
| R02 | Missing donor resolves to successful fallback with email false | `{"status": 200, "email": false}` |
| R03 | Actual GET ignores preference SELECT error and presents false email/default visible state | `{"status": 200, "email": false, "show": true}` |
| R04 | Unsupported exact-source fields are stripped and POST still reports200 with only identity/timestamp upsert | `{"status": 200, "keys": ["donor_id", "tenant_id", "updated_at"]}` |
| R05 | Actual preference POST uses fixed demo Tenant and email-only donor lookup | `{"tenant": "00000000-0000-0000-0000-000000000001", "donorFilterColumns": ["email"]}` |
| R06 | Supported partial show update does not implicitly add email field | `{"show": false, "hasEmail": false}` |
| R07 | Current POST reports database write failure | `500` |
| C01 | Do-not-contact blocks transactional email | `false` |
| C02 | Hard suppression blocks transactional email | `false` |
| C03 | Marketing opt-out alone preserves transactional exception | `true` |
| C04 | Absent donor and absent suppression are allowed by current broad gate, not affirmative subscription proof | `true` |
| C05 | Actual gate consults donor flags and suppressions only, not feed preference booleans | `["donors", "email_suppressions"]` |
| C06 | Consent lookup failure throws rather than authorizing send | `true` |
| F00 | No missionaryId query becomes null and actual schema/error handler returns400 before query | `{"status": 400, "tables": [], "error": "Invalid input: expected string, received null"}` |
| F01 | Actual published-feed handler returns mock partners_only row with no audience/hide source read | `{"status": 200, "visibility": "partners_only", "tables": ["posts"]}` |
| F02 | Current hook query key omits person/Tenant/preference revision | `["donor-feed-posts", "ministry-a", "published", null]` |
| S01 | Same-user changed profile Tenant does not trigger actual auth cache clearing in synthetic event flow | `{"clears": 0, "lastTenant": "tenant-b"}` |
| S02 | Different auth user triggers actual global query-cache clearing | `1` |
| S03 | Sign-out event triggers query-cache clearing | `2` |

The explicit-filter route's supplied partners_only row is synthetic. Its return proves the inspected control flow lacks a qualified audience/hide read, not that live protected data was disclosed. The unfiltered GET case executes actual URL/null/schema/error behavior, rather than passing a JavaScript object with an omitted property. Supported partial updates and current auth/cache/consent protections were positively checked; they must not be discarded because other paths are incomplete.

The real portal service's preference-read error handling was inspected separately and throws; the legacy GET masks its injected error. Do not generalize the defect to every service. Same-user synthetic Tenant change is a conditional scope risk, not proof a current Tenant-switch UI is deployed.

## Actual Core migrations and exact preference catalog

The unchanged repository-native verifier applied 76 forward migrations using the actual compatibility bootstrap in a fresh PostgreSQL 17.10 container. The existing local image was used with pull disabled, no network, no published ports, temporary storage and read-only source SQL mounts. The restricted PSQL wrapper targeted only the uniquely labelled fixture. Existing databases and the five setup-change files were preserved.

There are 81 SQL files; the native verifier intentionally excludes five named rollback scripts. This result is 76 forward migrations, not an assertion that rollback was tested. The evidence JSON retains migration hashes, exact catalog, image/isolation information and verifier exit 0.

Eleven completed role/catalog/constraint observations:

<!-- prettier-ignore -->
| Observation | Actual result and limit |
| --- | --- |
| Preference RLS/FORCE/owner | true / false / postgres; no policies on the table |
| Anon SELECT | Denied 42501 |
| Authenticated SELECT/INSERT/UPDATE/DELETE | Actual operations denied 42501; denial at grants is not a successful per-row policy test |
| Compatibility service_role INSERT | Denied 42501 despite BYPASSRLS; it lacks table privileges. Hosted grants were not inspected |
| Loose structural association | Disposable owner can insert donor A with Tenant B; separate FKs do not enforce their pairing |
| Null identity/scope | Disposable owner can insert null donor and null Tenant |
| Existing non-null donor×Tenant uniqueness | Duplicate rejected 23505; not per-ministry uniqueness |
| SQL defaults | showOrg/showMissionary/followOrg true; emailOrg/emailMissionary false |
| Coarse independent combination | Owner can store showMissionary false and emailMissionary true; not the proposed exact-source journey |

The table above groups the individual statements for readability; the JSON records all 11 observations separately. Structural writes ran as the disposable database owner because the service/browser roles were denied. Combining that owner-only structural test with mocked email lookup does not demonstrate a live cross-Tenant exploit.

An earlier run also applied the migrations but stopped its observations when an expected service-role write was denied. That incomplete result is retained in the bundle. No grant was added to make it succeed: the completed run expected the denial and performed clearly labelled owner-only structural checks. An immediate cleanup check raced Docker automatic removal; follow-up confirmed removal and the replay script now waits. Initial helper syntax/import-loader setup errors occurred before relevant observations and were corrected; no Core source was altered.

## Synthetic PostgreSQL mechanisms and counterexamples

A separate networkless PostgreSQL 17.10 fixture used synthetic sources/readers/preferences/operations/intents and real fixture database roles. All 40 assertions passed against their stated expectations, including intentional demonstrations of unsafe approaches. These are not 40 passing Core authorization tests.

<!-- prettier-ignore -->
| ID | Experiment | Actual | Expected |
| --- | --- | --- | --- |

| E01 | own reader sees only two scopes | `2` | `2` |
| E02 | other reader sees own scope only | `other` | `other` |
| E03 | browser direct update not granted | `f` | `f` |
| E04 | cross tenant command denied | `denied` | `denied` |
| E05 | missing email preference is unset | `unset` | `unset` |
| E06 | naive whole snapshot loses hide | `false` | `false` |
| E07 | hide accepted | `saved:1` | `saved:1` |
| E08 | independent field write serializes | `True` | `True` |
| E09 | email accepted despite other field revision | `saved:1` | `saved:1` |
| E10 | both intents preserved | `true,on` | `true,on` |
| E11 | duplicate request replays | `replay:1` | `replay:1` |
| E12 | same key changed payload conflicts | `conflict` | `conflict` |
| E13 | email off changes only email | `saved:2` | `saved:2` |
| E14 | old on retry cannot undo off | `replay:1` | `replay:1` |
| E15 | current result distinct from old response | `off,2` | `off,2` |
| E16 | fresh stale on denied | `stale` | `stale` |
| E17 | restore accepted | `saved:2` | `saved:2` |
| E18 | restore does not enable email | `false,off` | `false,off` |
| E19 | cross scope fk rejected | `0` | `0` |
| E20 | post limit then hide false empty | `0` | `0` |
| E21 | hide before limit yields real next posts | `3,4` | `3,4` |
| E22 | email on saved | `saved:3` | `saved:3` |
| E23 | preference commands create no messages | `0` | `0` |
| E24 | dispatch waits for prior optout | `True` | `True` |
| E25 | optout before admission suppresses | `suppressed` | `suppressed` |
| E26 | reenable does not revive old intent | `suppressed` | `suppressed` |
| E27 | hidden but email on can admit | `dispatching` | `dispatching` |
| E28 | optout waits for existing admission | `True` | `True` |
| E29 | optout still saves after admission | `saved:6` | `saved:6` |
| E30 | cannot recall already admitted | `dispatching` | `dispatching` |
| E31 | unknown effect not requeued | `unknown` | `unknown` |
| E32 | new contact not inherit old intent | `suppressed` | `suppressed` |
| E33 | revoked scope removed from reader | `0` | `0` |
| E34 | revoked scope denies old operation result | `denied` | `denied` |
| E35 | history immutable | `on` | `on` |
| E36 | weak command waits after authority read | `True` | `True` |
| E37 | unfenced authority read outlives revocation | `saved:1` | `saved:1` |
| E38 | fenced command waits on authority | `True` | `True` |
| E39 | fenced command denies committed revocation | `denied` | `denied` |
| E40 | rejected authority race keeps field revision | `1` | `1` |

Interpretation:

- A full stale settings snapshot loses a sibling change. Field-specific updates/revisions preserve concurrent Hide and Email changes even when storage serializes their short transactions.
- Same-request replay returns old operation evidence while current state remains newer. A fresh stale On is denied. Restore does not enable email. Preferences themselves create zero notification intents.
- Filtering after a limited page can yield a false empty result; filtering the eligible ordinary view before the limit reaches the next real posts.
- Off committed before admission suppresses a queued intent. An already admitted intent remains in-flight when Off later saves; unknown is not requeued. Re-On and changed contacts do not revive old-version intent.
- The original fixture command deliberately checks authority before waiting for the preference lock; it can commit after revocation. A bounded wrapper locks the fixture authority rows, reads their current values, and rejects the revoked command without changing the field. This proves the mechanism gap/prevention in the fixture, not every Core grant, role or governance fence.

SESSION_USER models a fixed trusted database principal in separate fixture connections; it is not a Supabase pooled-connection/JWT authorization recommendation. Fixed canonical source identities, one simplified recipient and revision rules are fixture assumptions. Higher contact floors, complete plan compilation, real provider behavior, dynamic owner role grants, all current contact continuities and the browser fresh-Off workflow are not implemented by this fixture.

The initial 35-case fixture passed; its immediate --rm check raced Docker cleanup, independently confirmed afterward. A new concern about authorization while waiting justified adding five race/prevention cases and rerunning the complete 40-case fixture in a fresh container. The final recorded run verifies removal directly. Both unique fixture containers and the migration containers were removed; no existing data was touched.

## What is and is not established

Established: the recorded current source behavior, actual legacy migration/catalog results, and precise simplified PostgreSQL mechanisms. Not established: certified canonical source mapping, implemented per-source preference/consent commands, target real RLS and authorization, full compiled-plan/provider behavior, browser accessibility/UX, comparative donor preference, production workload or a working external newsletter request.

The full review's 15 proof groups are required before activating the target. This review made no provider email, financial, subscription or live configuration change and created no PRD/issues/implementation. The public newsletter request remains a separate owner-qualified workflow; Q07 switches do not certify it.
