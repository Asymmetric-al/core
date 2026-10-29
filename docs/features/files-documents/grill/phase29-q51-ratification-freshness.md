# Q51 ratification — current source freshness addendum

2026-10-26, Asia/Bangkok. Conrad has ratified Q51 A, its complete amendment package and the proposed Document Review Attention Request term; root records that ratification. This is a read-only source-freshness addendum. It preserves the 2026-10-25 review and its dated evidence rather than rewriting it as current implementation proof.

**Conclusion:** the new remote changes do not alter Q51's selected product meaning or require reopening its reviewed amendments. They add real adjacent identity schema and donor-reference integrity, with meaningful access and deployment limits. They do **not** implement the Q51 source command, stable staff resolver, P6 local transaction, P17 projection or its permission/recipient behavior. Q51's native qualification requirements remain necessary.

## Complete remote delta and read provenance

Authenticated GitHub connector compare and an independent Windows `gh api` compare both examined:

- Previous reviewed head: `2838487c27a7f9fa282356b984d8b93b8b7052f9`.
- New pinned head: `c4d4fbc5409d229927a4803b694dda818a66a641`.
- Status: **25 commits ahead, zero behind**, merge base equal to the previous head; **18 changed paths**. The REST comparison returned all 25 commit records and all 18 files, each with a patch present. No 300-file boundary is approached.
- Final authenticated branch read during this pass still returned `c4d4fbc5409d229927a4803b694dda818a66a641`.
- [Exact compare](https://github.com/Asymmetric-al/core/compare/2838487c27a7f9fa282356b984d8b93b8b7052f9...c4d4fbc5409d229927a4803b694dda818a66a641) contains the #2255 claim/invitation schema branch merged by PR #2393 (`d1f0af946c40f6d037943bb41f5de18be7ca2370`) and #2252 donor-FK branch merged by PR #2392 at the new head. The remaining commits are their acceptance, implementation, documentation, CI, synchronization and migration-renumbering refinements; no third product feature appears in the complete commit/path census.

All changed native SQL and rollback files, the complete new identity security document and the complete added tenant-guard section were read. Both new real-stack acceptance files and both harnesses were read in full, as was the focused donor-migration unit file. Relevant static acceptance assertions and every modified CI/helper/test patch were read; these are source inspection, **not test execution**. No pull, checkout update, hosted query, migration, provider action, test run or credential operation occurred.

| Changed path                                                                          | Classification and read scope                                                                                   |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/ci-integration.yml`                                                | Complete eight-line patch adds two explicit real-stack test steps after migrations; no product route.           |
| `docs/security/identity-claim-tables.md`                                              | Complete new 152-line contract/limitations/deployment document read.                                            |
| `docs/security/tenant-guard.md`                                                       | Complete added 62-line composite-FK section read; prior text not falsely called unchanged in aggregate.         |
| `supabase/migrations/20261025090000_account_claim_and_invitation_tables.sql`          | Complete new 160-line schema/grant/policy migration read.                                                       |
| `supabase/migrations/20261025100000_donations_composite_donor_fk.sql`                 | Complete new 114-line constraint/preflight/lock migration read.                                                 |
| `supabase/migrations/rollback_20261025090000_account_claim_and_invitation_tables.sql` | Complete 12-line rollback read; destructive once real rows exist.                                               |
| `supabase/migrations/rollback_20261025100000_donations_composite_donor_fk.sql`        | Complete 35-line rollback read; restores old donor FK and removes the new guards.                               |
| `tests/unit/acceptance/issue-2155/postgres-ecr-gates.acceptance.test.ts`              | Complete patch appends reviewed workflow fingerprints for both changes.                                         |
| `tests/unit/acceptance/issue-2201/merge-group.acceptance.test.ts`                     | Complete patch appends corresponding workflow fingerprints.                                                     |
| `tests/unit/acceptance/issue-2252/donor-spine-fk.realstack.acceptance.test.ts`        | Complete 404-line source read; actual database/catalog mutation assertions, not run.                            |
| `tests/unit/acceptance/issue-2252/harness.ts`                                         | Complete 186-line source read, including exact migration, seven spine FKs, 14 follow-ups and catalog evaluator. |
| `tests/unit/acceptance/issue-2252/static.acceptance.test.ts`                          | Test census and relevant migration/rollback/no-grants/CI assertions inspected; no full native-run claim.        |
| `tests/unit/acceptance/issue-2255/claim-tables.realstack.acceptance.test.ts`          | Complete 571-line source read, including actual-role fixtures, privileges, policies, constraints and rollback.  |
| `tests/unit/acceptance/issue-2255/harness.ts`                                         | Complete 123-line source read, including exact columns, policies/indexes and CI target.                         |
| `tests/unit/acceptance/issue-2255/migration-text.acceptance.test.ts`                  | Relevant static source/consumer/doc/CI assertions inspected, especially lines212–262; not run.                  |
| `tests/unit/helpers/workflow-yaml.ts`                                                 | Complete patch models/pins the two added explicit test steps, environments and positions.                       |
| `tests/unit/scripts/ci-self-hosted-workflow-mutations.test.ts`                        | Complete patch tests those pins, paths, absent conditional, allowed environment and removal cases.              |
| `tests/unit/supabase/donations-composite-donor-fk-migration.test.ts`                  | Complete 88-line static migration/rollback test source read.                                                    |

There are **no app/package, canonical PRD/ADR, OpenSpec or AGENTS paths in this complete delta**. This does not mean Supabase or all product source is unchanged: four new migration/rollback files materially change database source. It also does not establish hosted application or migration status.

## Actual changed identity boundary

Pinned migration blob `5668e9cb077f3075f1cd28d66186bfac0d1fd7af` and document blob `37843abb18dc828526f7aeaf6abc12f712b6b86d` define `account_claim_requests` and `legacy_account_invitations`. The document and migration explicitly say this slice is schema-only for later #509/#510 server-side flows. The complete delta adds no application wiring. Static acceptance source lines212–227 asserts no consumers in apps/packages/scripts/tooling and unchanged generated database types; I read that assertion but did not execute it or claim its successful result.

- Migration lines35–58 and79–109 use `(tenant_id,id)` primary keys and `(tenant_id,donor_id)` donor FKs. Claim donor may be absent; invitation donor is required. Email normalization is generated by the existing normalizer, not an identity authority or a new matching algorithm.
- Lines129–158 enable and force RLS, then create three **SELECT-only permissive policies**. Staff membership permits Tenant rows; the separate claim requester policy permits `requested_by = auth.uid()` even without membership. These are additive permitted branches, not an active-Q51-assignment/comment-purpose projection.
- PUBLIC/anon/authenticated privileges are revoked before granting authenticated SELECT and service_role ALL. The underlying service role still bypasses these RLS policies. An authenticated user has no new INSERT/UPDATE/DELETE privilege through this schema. No Q51 staff directory, source-action capability, fine-grained PDP or no-Party presentation branch is thereby qualified.
- Requesters read the allowed claim row, including matching/resolution fields, under this specific owner contract. Do not use that raw whole-row policy as precedent for Q51 recipient discovery or private comment/attention disclosure. Likewise an active staff membership here is not sufficient to send Q51 attention.
- Invitation status values, default seven-day expiry and link-token fields belong to this donor invitation source. They do not supply a Q51 deadline, grant, automatic invitation, email purpose or new recipient rule. Native Q51 remains in-product only.
- The schema checks a 32-byte token-digest shape, paired expiry and uniqueness. It cannot establish that an arbitrary 32-byte value was actually derived by hashing a legitimate token; that remains a future writer/redemption contract. Do not present a length constraint or its sample tests as complete secret-handling or invitation-lifecycle proof.
- Lifecycle transitions and timestamp relationships are explicitly left to the later writers. A status CHECK is not the complete single-use/revocation/admission protocol. `requested_by`, `resolved_by` and `invited_by` use nullable auth-user references with delete-to-null; they are not Q51's required immutable attribution/dedup contract.

The full real-stack test, blob `bd8e3b266484dc4717b280b08cc8ede901ed5272`, uses transaction/savepoint fixtures and SET LOCAL ROLE + JWT claims (lines66–91). Lines147–232 test staff isolation, own-requester reads, non-staff/anon denials, authenticated read-only grants and resetting hosted-style broad grants by reapplication. Lines235–409 cover donor scope, status/defaults, generated normalization and token-shape examples. Lines413–504 inspect actual ENABLE/FORCE, the exact three permissive SELECT policies, owner posture, FKs, columns and indexes. Lines507–571 cover reapplication and rollback/catalog preservation. This is a stronger test source than a UI fixture, but no run, deployed catalog, current session or Q51 behavior was observed.

## Actual changed donor integrity and deployment boundary

Pinned forward migration blob `cdc748db5401bacffd412b552df89014d54a40a8` replaces `donations_donor_id_fkey` with the validated composite `donations_donor_same_tenant_fk`. Its validated `donations_donor_requires_tenant` CHECK closes the MATCH SIMPLE null-Tenant escape while retaining the allowed null-donor case. The one transaction adds both NOT VALID constraints, validates them, then drops the old single-column FK. It does not rewrite existing rows, change permissions or create Q51 authority. Counts-only preflight aborts on existing cross-Tenant/null-Tenant donor references; full validation remains a separate integrity guard.

The new tenant-guard section, current full-file blob `b1a9b6f6a55469ab9dd9236f70b5ff3862c2a28e`, governs seven donor-spine FKs and a shrink-only list of 14 older single-column references. Two new claim/invitation composite FKs bring the test's total donor-reference census to 23. This is **not** a claim that every relation in Core, or even every remaining donor reference, is now composite. Read authorization remains separate from FK write integrity.

The complete real-stack donor suite, blob `1434d40bdb2d337c5c43f2acd356f3a7da649d03`, verifies cross-Tenant/null-Tenant inserts and updates, referenced-donor movement/deletion rejection, exact NO ACTION/nondeferrable catalog shape, preflight no-rewrite behavior, the seven/14/two census and mutation ratchets, exactly one PostgREST donor relation, and forward/rollback/reapplication. These are inspected assertions, not an independently executed or hosted success report.

Both forward migrations set local five-second lock timeouts. The documentation correctly separates **lock acquisition wait** from time holding locks or performing validation scans; this is not a five-second total migration budget. Claim-table FK creation can block writes on existing referenced relations. The donations CHECK addition requires a quiet window and can block reads/writes through validation. No deployment was attempted.

Rollback is not a universal safe Undo. Claim rollback blob `f764ce1a64ead60c1935b1adedfd355f8cfc2354` drops both tables and their real rows once populated; it must precede the dependent normalizer rollback. Donor rollback blob `5dd395562fb2a76267fbbf6b5782a8f5abda3e5c` restores/validates the single-column FK before removing composite/null guards, with no data rewrite but weaker scope integrity afterward. Q51's original identity, admitted facts and retained stop/dedup evidence cannot borrow either rollback as a recovery design.

## Q51 ratification impact and closure

No changed governing Q45/P6/P17/P12 or ordinary-source contract was found in the complete delta. The new identity schema does not settle or bypass Q51's explicit staff-person/assignment/no-Party qualification. The stronger donor FK illustrates why exact source constraints complement RLS, but proves none of Q51's own relations, compiler composition or current permission gates. Its current claim policies are source-specific and cannot be copied into the future Q51 schema merely because both concern people.

Accordingly, **no Q51 product amendment or change to the prior review disposition is required by this delta**. Ratification can retain the reviewed 20-paragraph decision and proposed term unchanged while recording this new source snapshot. The dated full-review hashes remain historical evidence; this addendum does not claim their source head is still the latest. Current implementation/release must use c4d4fbc or a newer verified head and re-prove actual effective roles, constraints, readers/writers and source contracts before activation.

Reviewed by `/root/q31_runtime_research`. This is scoped freshness closure, not a full unrelated security audit, test run, migration/deployment approval, native Q51 proof or an answer to Q52.
