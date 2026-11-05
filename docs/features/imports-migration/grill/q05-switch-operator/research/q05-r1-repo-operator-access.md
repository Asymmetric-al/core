# Q05-R1 — Repo evidence: who may operate a Switch (F18)

Read-only research. Baseline `develop` `629cb71dc`; GitHub read 2026-11-02. Labels follow `docs/ai/document-authority.md:42-58`. "P12" = `docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md` (design ratified 2026-07-08, `:9`). "DL" = `grill/decision-log.md`. Unlabelled inferences are marked **inference**.

## 1. Platform-operator access to tenant data

**Ratified (P12), published (root `CONTEXT.md`):**

- Four principal classes go through one PDP. The fourth, **platform operator**, is "an orthogonal authority _plane_, reaching tenant data only through the resolver as an audited, purpose-bound, time-boxed grant that writes to an append-only, tenant-independent sink; never ambient god-mode" (P12 `:1552`; story 28 `:1519`). Glossary: `CONTEXT.md:2829-2835` (Principal), `:2837-2850` ("A platform operator uses one audited, purpose-bound, time-boxed Operator Tenant Grant Context").
- Tenant comes from "the exact audited tenant grant rechecked for purpose and expiry" (P12 `:1555`). Deferred operator work "re-resolve[s] … operator grant … at fire-time" (`:1587`).
- "Support, impersonation, `super_admin`, and service role create no shortcut." An operator gets the audit projection only through a grant containing `permissions.audit.read` that "passes the same floor" (P12 `:483-487`; ADR-0184 `:259-263`, accepted).
- `super_admin` becomes "capability-path only"; `profiles.role` becomes inert for authorization; use is "purpose-bound + break-glass-tempo'd" (P12 `:1588`). Delete `OR authz.is_super_admin()` from data-plane RLS (`:1585`; hazard named at `:1452`).
- **Impersonation (D7):** structurally blocked from restricted-tier tenants except by a JIT ceremony; runs under the lesser of operator and subject access; view-only by default; destructive actions blocked; needs an account opt-out flag and a reason; every event carries `acting_principal` + `on_behalf_of` + session id (P12 `:1669`; story 25 `:1513`).
- **Tenant recovery (D17):** "platform-operated, consent-logged, independently-authenticated"; excludes restricted-tier plaintext (P12 `:1671`; story 35 `:1532`).

**Proposed (OpenSpec):** the matching clause ("An operator MUST remain bounded by the exact audited, purpose-bound, time-boxed tenant grant"; deferred operator work re-proves the grant at fire time) is in `openspec/contracts/identity-and-access.md:216-220`. Only the active change delta `openspec/changes/sitestacker-parity/specs/identity-and-access/spec.md:7` references it, so under `openspec/contracts/README.md` it is proposed in OpenSpec terms. The accepted spec still lists the role set as including `super_admin` (`identity-and-access.md:174-177`, referenced by `specs/identity-and-access/spec.md:18`).

**Not ratified anywhere:**

- who approves an operator grant;
- whether the ministry must consent (only recovery is "consent-logged", and only impersonation has an opt-out);
- the allowed purposes;
- maximum duration or renewal;
- the capability ceiling for money, sends or attestations;
- an issuance surface.

**Implemented: no.**

- `PlatformOperatorPrincipal` is "Type-only: the operator plane, its grants and its sink are out of scope" (`packages/api/src/principal/types.ts:46-50`).
- `platform_admin` exists as a named grant subject with default bundles (`packages/auth/capabilities/bundles.ts:63-94`). However, `resolveEffectiveCapabilities` has no non-test consumer.
- What runs today is the anti-pattern:
  - `profiles.role = 'super_admin'` passes `hasRole` (`packages/auth/permissions.ts:60`);
  - it receives every contribution capability (`packages/api/src/admin/contribution-operations/permissions.ts:34-36`, `:270`);
  - RLS grants it cross-tenant reads through `authz.is_super_admin()` (definition `supabase/migrations/20260226113000_authz_memberships_foundation.sql:143-156`; e.g. `profiles` `20260625002117_canonical_tanstack_db_realtime_rls.sql:60-69`, `field_policies` `20261005050728_field_policy_foundation.sql:29-42`).
- The app lands a super_admin only in its profile tenant or the demo tenant (`packages/auth/context.ts:297-302`). There is no tenant switcher.
- #2281 (OPEN) is a provisional design: operator-proposed tenant, purpose `operator_support`, `validUntil` = session TTL, issuance UI out of scope. It is **proposed, not ratified**, and is looser than "purpose-bound".

## 2. Ministry-side roles and capabilities

**Implemented:**

- Every staff subrole maps to the same four broad capabilities (`packages/auth/permissions.ts:43`ff.).
- The code registry has no import, migration, Data Tools, merge or attestation capability (`packages/auth/capabilities/registry.ts:20-129`).
- The only live separation of duties is for contribution corrections: a tenant-configured `separation_of_duties` mode rejects requester = approver (`packages/api/src/admin/contribution-operations/approval-policy.ts:119-128`).

**Ratified patterns that would gate Data Tools:**

- **Phase 30 roadmap (published).** "Staff upload a file …" (`roadmap.md:4326`). "The authorized reviewer determines the accepted plan: staff for staff import profiles, or the permitted missionary" (`:4347`). Commit re-proves authority. Primary surface is Mission Control Data Tools (`:4335`).
- **ADR-0173 cl. 3 (accepted, Phase 23 D29).** Request, prepare, plan view, commit, repair/resume, reversal preparation, artifact download and exceptional operations are separately authorizable. "Small organizations may grant several capabilities to one trusted person; launch does not impose a needless two-person approval ritual" (`docs/adr/0173-…md:47-55`). Commit is "a separate privileged command" that re-proves "a distinct current capability" (`:200-209`).
- **P12, Phase 21 D17 amendment (ratified).** Do not collapse source submission, mapping, staging, reconciliation, review and activation "into one import, migration, finance-admin … capability". "The default may grant one finance actor the ordinary preparation and activation flow for small tenants; larger tenants may separate preparer and activator … Import access grants no activation" (P12 `:2219-2227`).
- **Phase 13 money (ratified).** No forced second approver by default, because "missions orgs often have one finance person". A tenant policy may require one (`phase-13-…md:854-860`).
- **P12 governance.** SoD is detected over resolved capabilities (D15, `:1662`). JIT plus a second approver is on at v1 for Owner, `permissions.manage` and restricted-ministry groups (`:1594`). "Support Operator" is not a seeded group ("compose on demand", `:1595`).

**C16 (DL `:173`, ratified).** "Holding a Phase 30 import role never widens a target owner's authority; deferred jobs re-prove the owner's current authority when they fire."

- Sources: P12 `:2249` ("Phase 30 import role never widens it", D17 evidence) and `:2327` (D28 admission/evidence). The deferred rule is in the identity-and-access contract `:218-220`, proposed in OpenSpec terms.
- Implications:
  - the Phase 30 role covers transport and plan work only;
  - each target commit also needs that owner's capability, including money capabilities for money families;
  - every chunk re-checks the human or operator principal at fire time, and a principal that has lost access pauses the run.

**DL §8 "background jobs cannot yet carry a staff actor's authority" — verified (implemented state).**

- The workflow envelope is strict: `tenantId`, `workflowName`, `schemaVersion`, `subject`, `dispatchRequestId`, `context`, and no actor (`packages/api/src/workflows/events.ts:77-91`).
- Runs act as the nil-UUID system actor (`:18-22`).
- `withTenant` gives isolation only, not authority (`docs/security/tenant-guard.md:1-12`, `:30`).
- #2311 (OPEN, preparation only) adds `member`/`service`/`operator` deferred contexts. It postpones the envelope field to schema v2, and the gate "fails closed until then". `principal/deferred.ts` does not exist on develop.
- Result: no background import can run as either a ministry staff member or an Asym operator today.

## 3. Restricted data (C17)

C17 (DL `:174`, ratified): an alias is required, restricted export is hard-blocked, and imported PII never leaves its governed boundary just to improve mapping.

- Phase 10 A3: a party at `restricted`/`high_risk` must have a distinct alias at the data layer, and "an API/import that sets a restricted level without an alias is rejected" (`phase-10-…md:97`, `:174`).
- P12: restricted records are "non-exportable by default" (`:1641`), with a hard-deny export budget (`:1663`), audit-before-serve and a hash-chained read audit (`:1646`, `:1660`).
- Mapping-only egress ban: `owner-constraints.md:360-362`.

What an operator (ministry or Asym) would touch:

- **Raw file.** The whole real export is "classified restricted by default under Phase 10/12 until proven otherwise" (Q2 cl. 5(e), DL `:59`, ratified). Any viewing is a restricted-tier read: audited, budgeted, and gated by clearance.
- **Staged rows.** Custody is undecided for non-D17 profiles (D11, DL `:198`).
- **Error files.** These are governed exports under ADR-0212, so restricted columns are blocked (r06 M2; C17).

**Asym staff and restricted identities (ratified constraints; no explicit ban):**

- Phase 10 A8: under the Art. 9(2)(d) "no disclosure outside the body" posture, "the platform's own pipes count as 'outside the body'". Locked-room fields are redacted from "Sentry, logs, support tooling, demo seeds" (`:32`, `:102`).
- Recovery may not read restricted plaintext (P12 `:1671`). Impersonation into restricted-tier tenants needs a JIT ceremony (`:1669`). "Platform-cannot-decrypt" is a target, not a v1 property (`:1656`).
- Phase 10 locked-room grants are effective only through "a read-time JOIN with active membership" (`:101`, `:142`). **Inference:** a non-member operator cannot hold one. Whether an Operator Tenant Grant may ever carry `security_clearance` is unaddressed.

## 4. Roadmap and owner text on who runs migrations

- **Phase 30 roadmap (published).** Tenant staff, or the missionary for D17. No Asym service, specialist or partner is named (`roadmap.md:4326-4351`).
- **Q3 (ratified).** The template path is "prepared by the ministry or its helper" (DL `:75`). The adversarial check flagged "'any system' misread as 'Asym migrates it for you'", so Q3 "promises no migration service" (`:86`, `:94`).
- **Q2 (ratified).** Named Asym roles are the relationship owner, evidence custodian and environment approver; the ministry names its admin (`:53`, `:63`). The LATER agreement must cover "roles … access … subprocessors" (`:59`).
- **Q1 (ratified).** Exclusions are "ministry-accepted" and residual systems need the ministry's "written acceptance" (`:29`). Surface states are "ministry attested" (`:35`). A "named ministry user" marks privacy items, and the decommission checklist is "ministry-attested" (`:40`).
- **Q4 monitor M2 (ratified with Q4).** Owner: "Switch operator (F18) with the ministry admin". Response: "Contact the ministry" (`q04-adversarial-review.md:414`). This implies the operator may not be the ministry, but it is not a decision.
- **Phase 21 D17.** "Staff use one … Start Field Accounts flow" (ADR-0106 `:127`, accepted). One finance actor may do it in a small tenant (P12 `:2222-2224`).
- **Phase 23 CMS.** Staff without capability "can request a migration" (ADR-0173 `:50-52`). "Other CMS or custom site" is a request/approved-sample lane (`:116-122`). "Migration specialists" appear only as a usability-test persona (`:317-322`). The copy "Imports are prepared with an authorized migration specialist" exists only in research (`phase-23-d29-content-portability-ux-benchmark.md:128`, proposed).
- **Phase 28 D17.** The missionary is the reviewer and committer, "without a staff-role substitution or routine second reviewer" (`owner-constraints.md:333-340`; `roadmap.md:4328-4333`). This is self-serve.
- **Term search.** Owner documents contain no "white-glove", "professional services", "Asym-assisted", "onboarding team" or "migration service" (repo grep). Vendor practice is staff-led (`q01-r6-…md:65`, research).

## 5. Existing operator surfaces

None.

- The sidebar has product areas plus System → "Admin" (`apps/admin/app/mc-shell.tsx:88-118`). There is no route for platform, operator, tenant switching or onboarding (`find apps/admin/app`).
- `/admin/eve` "platform owner" means a `super_admin` profile in the same tenant (trigger `20260718093000_eve_email_discord_notifications.sql:75-86`; `packages/api/src/eve/launch-readiness/control.ts:123-131`). It controls the engineering agent, not tenant data.
- Tenants are created only by seed or migration (`20250101000000_init_schema.sql:550`; `scripts/cms/seed-local.mjs:212`).
- There is no "Operator Tenant" table, function or role in code or migrations.
- Interim rule (implemented, unwired): only `platform_admin` can approve in-tenant projection widenings until a tenant approver grant exists (`docs/security/capability-spine/registry.md:75-78`). This is a precedent of Asym acting as an approver inside a tenant.

## 6. Audit and attribution

**Ratified:**

- An operator plane with an append-only, tenant-independent sink (P12 `:1552`).
- The impersonation triad (`:1669`).
- D29 run records capture "actor, delegation, capabilities proved" (ADR-0173 `:291-299`).
- Phase 10 `sensitive_read_audit.actor_profile_id` (`:141`).

**Implemented:**

- `crm_command_logs` has only `actor_user_id`/`actor_profile_id` (`20260507234343_crm_command_logs.sql:1-16`). INSERT is granted to `authenticated`, and the policy lets a super_admin insert any `actor_user_id` (`:46-56`).
- `audit_logs.user_id` has no FK. Any tenant staff member or super_admin may INSERT any `user_id` (`20260226113000_…sql:452-463`).
- Workflows record the nil actor.
- No table records a principal kind, an on-behalf-of field or a grant id.

**Inference:** an Asym specialist given a ministry membership would be recorded as ministry staff. One using super_admin would appear as a profile id with no operator marker. Direct inserts can forge both.

## 7. GitHub issues (all OPEN, read-only)

| #                      | Relevance                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| #665 epic; #667; #2282 | PDP and EffectiveAccess (the resolver "prepared, not wired")                                  |
| #669; #2281            | Principal classes; super_admin via an audited platform grant + sink (provisional; needs spec) |
| #2311                  | Deferred member/service/operator context; envelope v2                                         |
| #668; #2295            | Remove `is_super_admin()` from RLS                                                            |
| #2284                  | `profiles.role` inert                                                                         |
| #684                   | Impersonation (D7)                                                                            |
| #685                   | Named grants, delegated admin, tenant recovery (D17)                                          |
| #635; #641             | Phase 10 identity-access grants/break-glass; Settings → Security                              |
| #2368; #2369           | Phase 29 custody and Phase 30 target for D17 self-import only                                 |
| #1407, #1409           | Phase 23 stage/check and reverse a CMS import                                                 |

Searches for "operator grant", "Operator Tenant Grant", "support access", "tenant onboarding", "migration service" and "Data Tools" returned no migration-operator or onboarding-service issue.

## Gaps and conflicts

1. **No approval rule.** Nothing ratified says the ministry approves an Asym operator grant. #2281's defaults (operator picks the tenant; session-TTL expiry) would decide it by implementation unless an owner rules first.
2. **Duration vs tail.** "Time-boxed" sits against a tail of up to 12 months (DL `:34`). The Q1 v1 review proposed "renewed per catch-up as an audited action" (`q01-v1-review.md:346`, proposed).
3. **Restricted tier.** Phase 10 grants are bound to membership, and recovery and impersonation exclude restricted data. Whether an operator can see restricted identities in raw files or match review is an unowned P10/P12 ruling.
4. **Attestations.** Q1 attestations name the ministry. **Inference:** an operator may prepare but not attest, accept exclusions or sign off on the ministry's behalf.
5. **Status split.** The operator clause is ratified in the PRD but proposed in OpenSpec. The accepted spec still names `super_admin` as a role.
6. **Live god-mode.** Today's `is_super_admin()` RLS is the pattern P12 forbids. Using it for a Switch would breach P12 `:483-487` and the D24-class hazard posture.
7. **Partners.** A non-member third party fits no Tenant Authorization Context. Phase 24 D25 (ratified) needed a new fifth context for one non-member reviewer (`phase-24-multi-site-management-decision-log.md:4893-4900`). A partner therefore needs either a ministry membership or a new P12 context.
8. **Background actor.** No acting context exists for any human (§2). This blocks every model equally.
9. **Data processing terms.** If Asym staff operate the switch, the Q2 cl. 5(a) agreement must name Asym operator access and any subprocessor.

## Implications for F18

| Model                                                 | What existing owners must supply                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Ministry admin self-serve**                      | P3/P12 registry atoms for Phase 30 actions (separated per ADR-0173 cl. 3, combinable for one person); target-owner commit capabilities (C16); a membership deferred context (#669/#2311 envelope v2); Data Tools route/nav; capture of ministry attestations. No new authority plane. Risk: template-path burden (Q3 monitor, DL `:92`).                                                                                                                                                                                                          |
| **B. Asym specialist under an Operator Tenant Grant** | Everything in A, plus a built operator plane (#2281/#2282/#669/#2311) and `is_super_admin()` removed (#668/#2295). P12 owner rulings on grant approver (ministry consent), a migration purpose, duration/renewal across the tail, and a capability ceiling (money commit, sends, attestations, reversal). A P10 ruling on restricted-tier visibility. A tenant-visible operator audit with principal kind and grant id in every Phase 30 and target receipt. Agreement terms naming Asym access. Heaviest dependency chain; nothing exists today. |
| **C. Partner or consultant**                          | Machinery from A. The ministry grants the helper a staff membership with scoped capabilities and expiry (P12 groups/named grants, #685; restricted clearance only by the ministry). The helper is recorded as tenant staff (no partner marker today). Membership-free access would need a new P12 context (D25 precedent). The contract is between the ministry and its processor, not Asym.                                                                                                                                                      |
| **D. Mix**                                            | Supported by ratified capability separation: helper or Asym prepares; a named ministry user commits money families (owner capability), attests and signs off. Native with A + C. Adding Asym requires B's full dependency set.                                                                                                                                                                                                                                                                                                                    |

**Inference:** only A and C are buildable on ratified contracts plus already-tracked Phase 12 work. B needs new P12/P10 owner rulings before it can be specified.
