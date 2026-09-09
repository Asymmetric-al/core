> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Question 06 — Executed evidence and limits

7 September 2026. This is research evidence for the quiet optional handoff after a completed payment repair. It is not certification of an implemented feature or a successful provider financial journey.

## Ten actual-source observations

Node 24.15.0 executed current source at develop `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd` in a fresh Linux user/network namespace (`unshare --user --map-root-user --net`). The environment was cleared except a safe PATH. An allowlisted outer loader read the selected source; VM modules received controlled standard globals and mocks. No actual database, auth session, Stripe client/provider or browser call occurred.

R01–R06 used actual `packages/api/src/stripe/recurring.ts` with a synthetic pledge, subscription and invoice and a mock database. R07–R10 used actual billing/auth callback/navigation source with mocked `withOperation`, ownership, Tenant resolver, auth client, NextResponse and Stripe session creation. Those mocks do not certify those boundaries. Both groups passed their stated expected-current-behavior assertions, exit 0. The harness was in memory and was not retained as a replay script; this appendix records its input and result. Expected experimental TypeScript/VM warnings were emitted.

<!-- prettier-ignore -->
| ID | Synthetic condition | Observed current behavior | Practical limit |
| --- | --- | --- | --- |
| R01 | Cancelled snapshot plus active subscription update | Cancelled; zero writes | Positive observed-cancellation guard |
| R02 | Cancelled snapshot plus paid invoice | Cancelled; payments_completed = 1 | Lifecycle guard and collection counter only |
| R03 | Paused snapshot plus paid invoice | Active; payments_completed = 1 | Legacy projection changes; no provider subscription resumed |
| R04 | Same invoice helper invoked twice | payments_completed = 2 | Helper business-idempotency gap; full raw-event replay not simulated |
| R05 | Cancellation after mocked SELECT, before active subscription UPDATE | Newly cancelled status overwritten active | Controlled source interleaving; actual database race not run |
| R06 | No explicit Tenant and empty subscription metadata | No tenant_id lookup predicate | Scope omission observed, no demonstrated cross-tenant exploit |
| R07 | Billing POST with repair/occurrence URL hints | HTTP 200; provider payload only customer and return_url; wallet return; no second options argument | Exact result/occurrence/Connect controls not established; session still runs under resolved key |
| R08 | Repeat billing POST | Two mock session-create calls | Not evidence of duplicate charges |
| R09 | No linked payment customer | HTTP 409; no additional session call | Positive missing-customer guard |
| R10 | Valid synthetic auth code, donor role and safe targeted next path | Redirect to donor-dashboard home | Safe intended result destination lost; not an open redirect exploit |

An initial billing/callback harness link failed on a preserved empty type-only import before any target handler ran. Supplying an explicit empty mock allowed the full group to run successfully. No repository source or dependency was changed.

## Twenty-seven synthetic PostgreSQL assertions

PostgreSQL 17.10 ran from the existing `postgres:17-alpine` image in a uniquely labelled disposable container, with network disabled, no published ports and temporary bounded storage. No existing database or Core table was used. The fixture and checks are supplied in the proof bundle.

All 27 assertions passed **against their stated expected observations**, including counterexamples that reproduce failures of naive designs. These are not 27 passing Core authorization or payment tests.

<!-- prettier-ignore -->
| ID | Experiment | Observed | Expected |
| --- | --- | --- | --- |

| E01 | prepared method does not complete replacement | `f` | `f` |
| E02 | unqualified repair never offers | `f` | `f` |
| E03 | generic wallet never offers | `f` | `f` |
| E04 | qualified complete source fixture offers | `t` | `t` |
| E05 | viewing does not reserve slots | `0` | `0` |
| E06 | cross account origin fk rejected | `0` | `0` |
| E07 | wrong mode not offer | `f` | `f` |
| E08 | exact 48h cutoff denied | `f` | `f` |
| E09 | one second before cutoff fixture allowed | `t` | `t` |
| E10 | naive tab a sees eligible | `t` | `t` |
| E11 | naive tab b sees eligible | `t` | `t` |
| E12 | ui eligibility alone duplicates claims | `2` | `2` |
| E13 | first atomic claim | `accepted` | `accepted` |
| E14 | racing claim waits on source lock | `True` | `True` |
| E15 | racing claim cannot add pressure | `pressure` | `pressure` |
| E16 | one reserved slot after race | `1` | `1` |
| E17 | same business request reads existing | `existing` | `existing` |
| E18 | same request different payload rejected | `conflict` | `conflict` |
| E19 | sibling incident same credential limited | `pressure` | `pressure` |
| E20 | unknown outcome blocks new offer | `f` | `f` |
| E21 | unknown keeps reserved pressure | `1` | `1` |
| E22 | stop fences old preview | `ineligible` | `ineligible` |
| E23 | stop retains other accepted request evidence | `1` | `1` |
| E24 | paid now removes retry offer | `f` | `f` |
| E25 | historical repair result unchanged | `method_ready` | `method_ready` |
| E26 | cannot rewrite repair result | `method_ready` | `method_ready` |
| E27 | revoked viewer cannot read prior request through command | `denied` | `denied` |

The positive offer fixture explicitly sets a synthetic qualification Boolean. It is a mechanism assumption, not an identified and provider-proved completed repair. The one-unit credential ceiling tests serialized pressure, not the full product/network policy. The cutoff cases exercise the fixture's specific rule, not every D7 timing predicate. Retaining another accepted request after Stop does not simulate an in-flight financial operation. Authorization is a simplified function check, not complete Core RLS/grants/RPCs.

The fixture shows two tabs can both see eligibility; a naive claim admits both. A guarded source claim waits on the shared lock and prevents the second reserved claim. Same-request/same-payload reads the existing result; a conflicting payload is rejected. Unknown outcomes retain pressure; paid/Stop/revoked states remove or deny the action without rewriting original repair evidence.

The first container attempt encountered PostgreSQL's temporary initialization readiness phase before any SQL assertion. The readiness check was corrected to wait for completed initialization and pg_isready; full timestamp literals were used. The complete suite ran in a new container. Both temporary containers were removed. `container_removed=true` is recorded for the successful run.

## Prior actual Core migration evidence reused

The Q05 native `scripts/verify/supabase-migrations.mjs` run verified 76 forward migrations against fresh isolated PostgreSQL 17.10; the five explicitly named rollback files were excluded by the native verifier. Q06 did not rerun these migrations.

Its exact catalog observations: authenticated direct donation INSERT/UPDATE/DELETE privileges were all false; donation-to-donor FK used donor_id alone; service_role receipt UPDATE/DELETE privileges were true; receipt user-trigger count was zero; the compatibility bootstrap service_role had BYPASSRLS. This does not prove donor_pledges privileges, target Phase 16 constraints/policies, current authorization races, real Supabase hosted roles or receipt writer behavior.

A false permissive policy is not a veto over another permissive allow. Missing explicit UPDATE WITH CHECK alone is not proof of a hole because PostgreSQL can reuse USING. SECURITY DEFINER needs effective-role/owner/privilege analysis. The report requires actual target positive/negative and permitted-row-to-forbidden-state tests.

[Q05 executed evidence and limits](phase25-r05-proof-evidence.md).

## Stripe facts and explicit qualification gap

The explicitly invoked Stripe skill and relevant references were reconciled with current primary documentation, installed Core SDK types and read-only provider account evidence. Core remains on stripe-node 22.2.0 / API 2026-05-27.dahlia. The current official version page and release evidence were newer than the skill header; no upgrade was made.

Read-only established CLI default/test scope, pinned API, no live flag:

```json
{
  "mode": "existing CLI default/test; no live flag",
  "pinned_api": "2026-05-27.dahlia",
  "financial_mutations": 0,
  "account": {
    "type": "standard",
    "country": "US",
    "charges_enabled": false,
    "payouts_enabled": false,
    "details_submitted": false,
    "capabilities": {}
  },
  "connected_accounts": {
    "count": 0,
    "has_more": false
  }
}
```

These are limited V1 account flags for the established credential scope, not production facts or full V2 readiness. No connected-account positive setup/binding/old-recovery tracer was possible or claimed. API field support and provider documentation are not an executed account contract.

No actual provider save, retry, authentication, bank verification, financial action or live mutation occurred. No credentials were printed or copied. Raw downloaded provider documentation is excluded from the deliverable bundle.

## What remains required before activation

Prove one named full original repair intent completes with no surprise collection and leaves exactly the related failed occurrence eligible under the true owner/provider/account/mode/rail contract. Resolve the exact donor-present timing predicate; complete target source commands, current authorization and real PostgreSQL races; verify provider controls and unknown/replay behavior; test the actual authenticated accessible browser journey and production-shaped workload. If no positive repair kind qualifies, show truthful completion/detail/help without this offer.

No UI/browser visual or accessibility pass, hosted database test, production latency measurement or complete target acceptance was run. These gaps are mandatory release gates, not monitored-after-launch risks.
