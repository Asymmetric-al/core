# Phase25 — Source authority, evidence and testing prior art

## Status and authority

The full Q01–Q29 corrected execution is ratified; Q30 confirms thirteen donor jobs and the final F01–F14 audit completes their joins. Conrad invoked to-spec and explicitly confirmed the testing approach on9September2026. This authorizes specification creation/publication, not feature implementation. Earlier grooming-only stage prose is historical, not a current prohibition on this publication.

Current repository intent and runtime are distinguished: merged platform/capability specs and accepted ADRs remain the governing base; the explicitly listed Phase25 source amendments define this proposal's intended changes. Current code is evidence of what exists, not proof it is correct. P22–P24 active specification branches remain unmerged dependencies; they cannot be silently treated as deployed.

## Repository source snapshot

Read-only base inspected: `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd` in Core. The complete planning package is now recorded in this repository, with [decision chronology](decision-log.md), [research inventory](research/README.md) and [original/adopted source hashes](source-map.json). No product runtime code, dependency manifest, credential, provider, hosted database or financial record was changed for this specification.

| Predecessor                                                       | Live state checked9September2026 | Exact source                               |
| ----------------------------------------------------------------- | -------------------------------- | ------------------------------------------ |
| Core develop                                                      | Existing merged baseline         | `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd` |
| [Phase22 PR1323](https://github.com/Asymmetric-al/core/pull/1323) | Open                             | `70c50e8c97556c43be5543332fb0993b468b90ab` |
| [Phase23 PR1340](https://github.com/Asymmetric-al/core/pull/1340) | Open                             | `9069dcad67f9630323474ca5ee8bcc85ca7bf0f6` |
| [Phase24 PR1558](https://github.com/Asymmetric-al/core/pull/1558) | Open, draft                      | `ab1a1703a725be454376990a7fe68aef2e048026` |

Inspect final accepted predecessor versions before affected source adoption; their scope is not reopened and their current merge state is not assumed.

## Governing owners and ADRs

The root CONTEXT/CONTEXT-MAP, mapped contribution-detail context, current platform principles/boundaries and relevant capability/active-change specs were inspected. Older mapped contribution vocabulary explicitly includes retired Twenty/staging concepts; it is not authority to restore those paths. Current P13/P16 gift/line/cohort, P12 context and P18/P19 document language controls reached modern behavior.

The base source contains the following relevant accepted ADRs and source families; names are more reliable than ambiguous duplicated numeric prefixes elsewhere in the repository:

- Asym Postgres owns CRM truth, Twenty retired; single credit table with optional line scope; payer-of-record is legal donor for its stated matching/workplace context; entry-gated acknowledgments; vendor-independent rung2 matching.
- Separate recurring commitments from fixed-total pledges; explicit groups and compatible billing cohorts; product-owned rail-isolated recovery; proof-gated pledge reminders.
- Producer-owned protected actions; contract-bounded delivery plans; canonical message/document/presentation dependencies; body-free history and expiring recent copy; immutable prepared messages with whole-message recovery.
- Canonical generated-document authority and clean cutover; evidence-qualified renderer/PDF profiles; code-owned jurisdiction packs; scanner-safe exact artifact access; purpose-owned records/disposal; canonical statement-run authority; contract-derived fulfillment/containment and truthful minimized operations.
- P3 export/field policy, P4 identity/claims, P7 dating/cases, P9 contact/subtype, P10 sensitivity, P12 sole PDP, P13 ledger, P14 credit/matching, P16 recurring/pledges, P17 notifications/messages, P18 artifacts, P19 statements and P22–P24 public/host ownership.

Explicit supersessions are in Shared S04 and each owner contract: no Stripe Customer-default conflation; narrow DAF/own-employee read authorization rather than overview-only/general household access; IRA owner/custodian classification; exact US card-charge dating; narrow contact field/custody adoption; native social linking guarantee; and current source/request/document path convergence. This spec does not change unrelated owner purposes or convert read access into mutation authority.

## Concrete current behavior and testing evidence

| Inspected prior art                                               | Useful existing seam                                               | Limitation carried into this spec                                                                                   |
| ----------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Donor giving-history browser smoke                                | Main Playwright donor project and existing navigation setup        | Accepts live OR unlinked UI; not complete History/ownership proof                                                   |
| Donation browser smoke                                            | Browser route/checkout step flow                                   | Demo session and mocked configuration; stops before collection                                                      |
| Auth session/permission browser cases                             | Login, redirect, persistence, signout                              | Password-only fixtures, optional skips and bypass defaults do not certify link/code/social/P12                      |
| Donor portal auth-ownership public handler tests                  | Vitest Request/Response and exported owner behavior                | Mocked Auth/admin query clients, obsolete donor-role expectations                                                   |
| Stripe webhook/saga/recurring tests                               | Signed event/operation boundary and deterministic external doubles | No full target source/RLS or actual provider/rail qualification                                                     |
| Document-purpose catalog/availability and injected renderer tests | Actual catalog/qualification rules and provider seam               | Catalog dark state or fake PDF response is not source intake/canonical-byte/access proof                            |
| Disposable forward migration verifier                             | Real psql schema application and rollback assertion precedent      | Compatibility Auth/Storage on CI PostgreSQL15 differs configured Supabase17; not native services or donor RLS proof |
| SQL-text membership/role checks                                   | Cheap source/constraint regression guards                          | Regex cannot establish actual grants/OLD→NEW scope, bypass or concurrency                                           |
| Shared session and client collection tests                        | Stale-result/cleanup/adapter behavior                              | User-only signout clearing is not same-human Tenant/represented-subject/current-epoch proof                         |
| Existing axe/instant-navigation/Web Vitals/development smoke      | Established tooling and test shape                                 | Current public/login paths and old greeting/summary expectations need actual donor fixtures and manual task proof   |

The exact existing prior-art files are recorded in the [identity/Auth preflight](research/preflight-identity-tests.md), [money/recurring/document preflight](research/preflight-money-tests.md) and [experience/accessibility preflight](research/preflight-ux-tests.md). The founder confirmed the [testing-seam proposal](research/phase25-spec-testing-seams.md). Implementation uses these framework/owner seams, not new testing infrastructure. This spec's acceptance criteria and Shared S05 identify the target behavior independently of volatile file locations.

Before future unit tests, isolate external credentials and opt-in provider integration selection: the inspected broad unit include pattern can reach Stripe-live tests, and its current key check occurs before operations while livemode is asserted only afterward. Before real-source donor E2E, explicitly disable and assert absence of demo bypass; a strict runner name does not do this automatically. All production/test secrets remain securely injected, never in this spec, fixtures, repository config, command output or artifacts.

## Fresh external evidence and its limits

- [IRS Publication526](https://www.irs.gov/publications/p526) and [Publication590-B](https://www.irs.gov/publications/p590b) were refreshed for publication. The retained policy distinguishes actual credit-card charge date, acknowledgment timing/content and QCD no-double-benefit/documentation. The portal is not a tax eligibility calculator or a claim the IRS certified this delivery UX. Existing P7 qualified finance/tax review remains required.
- [IRS acknowledgment guidance](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-written-acknowledgments), [Publication1771](https://www.irs.gov/pub/irs-pdf/p1771.pdf), [quid-pro-quo disclosures](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-quid-pro-quo-contributions) and [Fidelity Charitable grant guidance](https://www.fidelitycharitable.org/giving-account-guide/recommending-a-grant.html) support the existing scoped record/channel/DAF distinctions. They are not blanket jurisdiction or personal deduction guarantees.
- [Supabase identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking), [Auth hooks](https://supabase.com/docs/guides/auth/auth-hooks) and [Auth v2.196.0](https://github.com/supabase/auth/releases/tag/v2.196.0) source were inspected in the final audit. BeforeUserCreated does not govern the inspected existing-account LinkAccount branch; linkage may commit before later PKCE exchange. Current public management configuration does not establish a supported target pre-link guarantee. G01 remains unresolved, not proven impossible and not an observed live exploit. Affected profile activation needs exact supported native endpoint evidence.
- Current TanStack stable registry metadata on9September reports Table9.2.4, DB0.8.7, ReactDB0.3.7, QueryCollection1.2.12, Query5.102.8, Store0.11.1 and Virtual3.14.11. Installed values differ and Labs0.0.1 declares DB^0.6.0. These are dated compatibility inputs, not a blanket upgrade instruction or tested package set. Use [Table docs](https://tanstack.com/table/latest/docs/overview), [DB](https://tanstack.com/db/latest/docs/overview) and [Query keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys) through Core's accepted shared boundaries.
- [WCAG complete processes](https://www.w3.org/WAI/WCAG22/Understanding/conformance.html#complete-processes), [name/role/value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html), [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [international names](https://www.w3.org/TR/international-specs/#names), [OWASP CSV injection](https://owasp.org/www-community/attacks/CSV_Injection) and [Excel numeric precision](https://support.microsoft.com/en-us/excel/keeping-leading-zeros-and-large-numbers) inform only unresolved mechanics. They do not supersede accepted Core typography, shared component ownership, source policy or task-specific accessibility proof.

No real donor study, browser/provider/hosted DB/migration/render/workload test ran while drafting this spec. Previous catalog/model/synthetic tests retain their exact historical scope. The publication validation proves structure, links, hashes, source coverage and live published content; it does not certify target runtime behavior. The package's separate validation record reports actual checks rather than asserting generic perfection.
