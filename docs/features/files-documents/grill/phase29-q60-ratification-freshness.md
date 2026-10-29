# Phase 29 Q60 — Ratification runtime freshness check

2026-10-28, Asia/Bangkok. Reviewer: `/root/q31_runtime_research`. Read-only source review accompanying the user's full Q60 ratification; no redefinition of its approved decision, no native qualification claim.

## Snapshot and complete delta

Authenticated Windows `gh api` read develop at **`2b02808407d7eb1f85065ae798adf018ee8b4496`**, reconfirmed after inspection. Compare base **`9b52112df3301c72089fb7c554a3d23a9b593ec1`** is also the returned merge base. GitHub returned **16 ahead, zero behind, all 16 commits and 23 changed paths, with a patch for every path**; the path list is below and is below the comparison's file cap. No app route, PRD, ADR, OpenSpec, source capability registry or ordinary request domain file changed in this complete delta. Packages and Supabase did change: this is not a claim that product/source trees are unchanged.

The local WSL checkout remains **`3d85897ebf1515008ef5c676b1c58a15422fb9ab`**. Observed status: modified `CONTEXT-MAP.md`, `CONTEXT.md`, `apps/donor/next.config.ts`, `packages/ui/components.json`; untracked `docs/features/files-documents/`. These existing/shared changes were preserved. No pull, reset, checkout, migration, native test or provider action occurred.

## Actual changed behavior and Q60 impact

The merged change is PR #2414 / issue #2402, CRM gift-history table-preference write hardening. The complete 324-line forward migration and 39-line rollback, all four actual API files, the complete EXECUTE guide, full new real-stack test/harness and route/static acceptance sources were read at the exact listed Git blobs. The other changed security/CI/test patches were inspected for scope. A combined output truncated a middle route section; that section was read separately in full before this conclusion. These are repository-source facts, not assertions about a deployed database or successful test execution.

1. `20261025125700_crm_table_preference_session_identity.sql` moves five existing argument-trusting function bodies unchanged into `private` and installs reduced-signature public wrappers. Wrappers derive the actor through `auth.uid()` and the associated `public.profiles` record rather than caller-supplied profile/actor/can-manage flags. The helper checks the supplied Tenant against the profile and current native CRM rules: profile staff/admin or active staff membership; super-admin has the explicitly coded any-existing-Tenant branch. It restricts table IDs to `crm.giftHistory` and validates trimmed names at the database boundary. This legacy CRM rule is not Q60's qualified selected-assignment/P12/source correction capability.
2. The migration explicitly revokes schema `private` from PUBLIC/anon/authenticated, revokes each private body/helper from PUBLIC/anon/authenticated/service_role, and grants the five public wrappers only to authenticated apart from ownership. Wrappers are postgres-owned with empty `search_path`. These concrete owners, ACL statements and body behavior matter: the guide's broad sentence that DEFINER reads past RLS is not a universal rule. Effective owner privileges, FORCE, BYPASSRLS, role inheritance and actual deployment still require native inspection.
3. `request-session-client.ts:7–57` implements bearer-first, otherwise cookie-session clients. Actual write route calls at `route.ts:212–315` and `343–451`, `named-views.ts:120–260` and `service.ts:107–218` now call the reduced RPCs using that request session. They do not send acting-profile/can-manage arguments. The route still derives its Tenant from the authenticated CRM context. This is a useful current session-propagation seam, not a general authorization adapter for new source commands.
4. Reads remain scoped service-client queries: `named-views.ts:102–118` filters Tenant/profile/table; `service.ts:70–105` fetches user and Tenant defaults; `route.ts:170–210`, `244–315`, `317–341` retain service-client reads/prechecks. The allowlist correspondingly narrows seven handler contexts to three. Personal gift-history views explicitly remain personal settings snapshots with no sharing/publishing/team view (`named-views.ts:21–27`). They do not implement Q43 ordinary shared views, Q59 private resource saves or Q60 correction authority.
5. The new real-stack source defines a private throwaway-database fixture and named-role/ACL/tenant/actor/default-manager denial matrix, changed signature checks, unchanged-row snapshots, original-body differential parity and forward/rollback/forward checks. Its absence-of-URL branch skips. Route tests mock Auth/client boundaries; static tests pin SQL/CI/ACL statements. CI adds the real-stack file; older acceptance fingerprints and harness pins are updated. I did not run any test, inspect a CI result or query a hosted role catalog. No proof from those files is reported as passed here.
6. The deploy/rollback guide explicitly couples migration and app rollout: old service-role calls fail after the migration, while new signatures do not exist before it. The rollback restores original public signatures/service-role authority and leaves rows untouched by its written SQL. Neither rollout nor rollback was executed. Historical production/development statements in the guide were not independently verified as live hosted state.

**Ratification conclusion: no Q60 product amendment or reopening is required by this delta.** Its eighteen approved clauses, current-applicability/history/F ordering, actual terminal remedy, explicit same-person corrective-request cohort and reminder exception are unaffected. Update current-evidence summaries so they no longer describe these five exact CRM writes as still relying on caller-supplied acting-profile flags or service-role write calls at this new head. Preserve dated 9b source evidence as historical. Q60's native real-role/every-door/source/PDP/transaction/replay/restore/user-task gates remain mandatory; a hardened adjacent CRM preference RPC does not pass them.

## Complete changed-path inventory

Git blob identifiers below bind the evidence to this exact comparison. Added acceptance files were read fully; modified older test/harness/CI files were read as changed patches, not claimed to have undergone an unrelated whole-file audit.

| Path                                                                                    | Change               | Exact final Git blob                       |
| --------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------ |
| `.github/workflows/ci-integration.yml`                                                  | modified (+1 / -1)   | `6efa67654e54f1fc5201b5f9e2cb6604d3b9a6b1` |
| `docs/security/function-execute-grants.md`                                              | modified (+79 / -9)  | `6f14f116e72848dd085a98e20cc1e96b2a74622f` |
| `docs/security/service-role-client-allowlist.json`                                      | modified (+1 / -1)   | `efeeff67eff7c7cb9d341b3418b0840260e5f0a0` |
| `docs/security/tenant-guard.md`                                                         | modified (+1 / -1)   | `216af97026b7d4abd4ee779810e67f09fffab7da` |
| `packages/api/src/admin/crm/table-preferences/named-views.ts`                           | modified (+17 / -9)  | `c5b6bf353872235ca203ce20b35ee3b4fb38720b` |
| `packages/api/src/admin/crm/table-preferences/route.ts`                                 | modified (+18 / -16) | `6b6fe99ee4537e019d3555bd66e2e5562392fbdd` |
| `packages/api/src/admin/crm/table-preferences/service.ts`                               | modified (+12 / -16) | `ad1caffff6963a653a21e53ccb5dd5c3967f824c` |
| `packages/api/src/shared/request-session-client.ts`                                     | added (+57 / -0)     | `03fc82885f77cdd9762c851c20f7797e1a0a75c4` |
| `supabase/migrations/20261025125700_crm_table_preference_session_identity.sql`          | added (+324 / -0)    | `fd273e22bb3ad8ea2d55ff4b1d3024c2e8d2fe62` |
| `supabase/migrations/rollback_20261025125700_crm_table_preference_session_identity.sql` | added (+39 / -0)     | `d4d90578abf4ed1d29626df8d90e27d4b9255be8` |
| `tests/unit/acceptance/issue-2155/postgres-ecr-gates.acceptance.test.ts`                | modified (+1 / -0)   | `d5c890d67dafe2964287d3c3ac82ce6d614582a5` |
| `tests/unit/acceptance/issue-2201/merge-group.acceptance.test.ts`                       | modified (+1 / -0)   | `23cea54a2ec10b18c1c5c2ca2b410cd1dcafdf1d` |
| `tests/unit/acceptance/issue-2250/static.acceptance.test.ts`                            | modified (+1 / -0)   | `b8ce4026d7551f13ffc7289da580901f656d0c52` |
| `tests/unit/acceptance/issue-2258/harness.ts`                                           | modified (+2 / -1)   | `713290b73654705d066ce2e51aeb04fd0e015f11` |
| `tests/unit/acceptance/issue-2402/crm-table-preferences.realstack.acceptance.test.ts`   | added (+316 / -0)    | `38c5ad919f0d938e5b5aef92079d8441e22f4f12` |
| `tests/unit/acceptance/issue-2402/harness.ts`                                           | added (+229 / -0)    | `047055cb964e7bc00d1e0bd8abcefc5d5ae646da` |
| `tests/unit/acceptance/issue-2402/routes.acceptance.test.ts`                            | added (+123 / -0)    | `111d8151c08d34c5965351d3989666681808f7eb` |
| `tests/unit/acceptance/issue-2402/static.acceptance.test.ts`                            | added (+202 / -0)    | `16b02131ff22cc76cdd40eb3d3e1b808340ba901` |
| `tests/unit/helpers/workflow-yaml.ts`                                                   | modified (+1 / -1)   | `2824d15f5f03daf645c932914f08fd023891f502` |
| `tests/unit/packages/api/admin/crm-named-views.test.ts`                                 | modified (+83 / -39) | `7e178d634dc6daa3c7e755c43c5c7d7d90fb86ec` |
| `tests/unit/packages/api/admin/crm-table-preferences-route-handler.test.ts`             | modified (+80 / -18) | `8cd3f42169188ed177bbf9451b672da7e128727b` |
| `tests/unit/packages/api/admin/crm-table-preferences-service.test.ts`                   | modified (+59 / -53) | `ea4018a82df40061ef3b6368940a96a9b69f22da` |
| `tests/unit/security/authz-definer-execute-grants.test.ts`                              | modified (+110 / -0) | `596a3626eb8f864bd56cb8baf367b8f8f110e73b` |

## Complete intervening commit inventory

| Commit                                     | Subject                                                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `3f05642fd7ddbf8ca98933202a3d31d1cb066a77` | test(acceptance #2402): acceptance tests for session-identity CRM table preference functions                             |
| `531cf5847526b558a3c5233f167eeccb9454f586` | feat(db): session-identity wrappers for CRM table-preference writes (#2402)                                              |
| `389abc706e913c2eb5dbe8372ff63154cf20151e` | fix(api): CRM table-preference writes use the request session (#2402)                                                    |
| `3b3e73f627f32d2ac49901228bd7afcedfd2e2cf` | docs(security): CRM table-preference EXECUTE contract, deploy and rollback (#2402)                                       |
| `18169600f6444090fd259a75003718dcbdf8b483` | ci: run the #2402 CRM table-preferences real-stack file in the tenant isolation step                                     |
| `d99a1fc40e5044d7e1cd64c3fac86dde8a1c8d82` | chore(security): shrink table-preferences route allowlist entry after #2402 narrowing                                    |
| `16d0cdeb066b9a8859afdd1985f3c3474abd01f4` | test(acceptance): #2402 case-16 index fix, allowlist path, 2250/2155/2201 re-pins                                        |
| `3fbe532aecfbad2935be2a62be96ed0977c59c76` | Merge develop f8ef44f89e0f into builder/2402                                                                             |
| `e9968c79b3d48bf45960af2cd7fa51d844e43607` | test(acceptance): #2402 re-pin 2155/2201/2250 after develop sync; §6/9 base f8ef44f8                                     |
| `b3b2d34a749e20dab453c7e6dcbb000f1a631312` | test(acceptance): #2258 12/2 re-freeze at e1d784fc (#2402 531cf5847); allow issue-2258/harness.ts in #2402 §6/9          |
| `5e5b1d620f998372c07a332431a360234d8b74e8` | test(acceptance): #2402 realstack harness bootstraps like the passing harnesses (fix permission denied)                  |
| `6cbea4f957e5e7e2e6cf01de4818ff170760e8de` | fix(db): revoke schema private from PUBLIC, anon, authenticated (#2402)                                                  |
| `27cd6961e595fda88c15993efa558cdf4ef05a50` | test(security): expect schema private revoke (#2402)                                                                     |
| `28ac3c133a5265f4ce8fbcd9685e9979e2ce5f3e` | Merge develop 9b52112d into builder/2402                                                                                 |
| `770643b0f284aac763752674a4ec8ab1e6161727` | test(acceptance): #2402 re-pins on 28ac3c13 (2250 STEP_RUN, 2155/2201 prints, §6/9 base 9b52112d, 2258 12/2 -> 596a3626) |
| `2b02808407d7eb1f85065ae798adf018ee8b4496` | Merge pull request #2414 from Asymmetric-al/builder/2402                                                                 |

## Next-question implication

The complete Q60 founder-outcome/source/proof register was reread. Its concrete mistaken-acceptance recovery gap is now resolved by Q60 ratification. Its remaining source-binding, all-family custody/use/hold/processor completeness, exact future-consumer ledger, provider/byte backup/restore/exit, mixed-writer and intended-user qualification rows are mandatory work, not optional safe-versus-unsafe product votes. This delta does not introduce another file/resource product owner or settle a new Phase 29 user choice. Owner and UX census are being coordinated before recommending any Q61 fork; no new feature, readiness certificate or formal publication is inferred.

## Ratification preservation contract

Full Q60 adoption preserves exact C01–C17 and changes only C18 stage/adoption wording. All22 categories,40 journeys,32 proofs,six profiles,six controls,seven founder checks and17 reviewed refinements remain. The exact approved term and Avoid list add one33rd Files definition; all32 earlier definitions and root glossary stay unchanged. The task-local verification artifact is phase29-q60-ratification-verification.json. This source/record evidence is not native qualification or formal specification publication.
