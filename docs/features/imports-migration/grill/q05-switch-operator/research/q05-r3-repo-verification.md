# Q05-R3 — Repo verification of Option C (eight parts and O26)

Read-only. Baseline `develop` `629cb71dc`; PR #2430 head `1483a349`; GitHub read 2026-11-02. Labels per `docs/ai/document-authority.md:42-58`. P12 = Phase 12 PRD; P10 = Phase 10 PRD; DL = `grill/decision-log.md`. Samson-approved GitHub specs are **published, not owner-ratified** (DL §3 D12). r1's citations re-checked and hold; corrections below are new.

## 1. Operator Tenant Grant mechanics

**Ratified (P12, design 2026-07-08):**

- The operator is a separate authority plane. It reaches tenant data only through the resolver, under an audited, purpose-bound, time-boxed grant that writes to an append-only, tenant-independent sink (`:1552`, story 28 `:1519`).
- The Operator Tenant Grant Context is one of four Tenant Authorization Context variants (`:1553`). Its tenant is "the exact audited tenant grant rechecked for purpose and expiry" (`:1555`).
- Deferred operator work re-proves "operator grant … purpose, and capability at fire-time" (`:1587`).
- `super_admin` is "purpose-bound + break-glass-tempo'd" (`:1588`).
- The same text is published in root `CONTEXT.md:2845-2847` and `:3587-3588`.
- The OpenSpec clause is **proposed**: `openspec/contracts/identity-and-access.md:218-220` is referenced only by the active change delta. The accepted spec still lists `super_admin` as a role (`:174-177`).

**Is a grant a permission bundle?** Yes, by construction. Every context's token signs `caps-hash` (`:1587`). The audit clause says a grant "contains `permissions.audit.read`" (P12 `:484-486`; ADR-0184 `:260-263`, accepted). **No ratified text says which capabilities an operator grant may carry.**

Proposed and implemented bundles are much broader than Part 4:

- #2281 (proposed) resolves every operator context to the `platform_admin` bundle.
- `packages/auth/capabilities/bundles.ts:93` (implemented, unwired) already defines that bundle as `staff_base` + `contribution_admin` + `permissions_approver`. That includes `contributions.run_refunds`, `approve_corrections` and `admin.crm.manage` (`:25-30`, `:39-52`).
- `docs/security/capability-spine/registry.md:75-78` says only `platform_admin` can approve in-tenant widenings until a tenant approver exists.

**"Passes the same floor."** The floor is the subtract-only composition of Phase 3 field policy, P10 security level/clearance, P11 field gates, purpose/consent and residency (root `CONTEXT.md:2872-2875`, published). For a classified Party:

- Without clearance, the display name is the alias (P12 `:1640`). Legal identity lives in `party_restricted` (P10 A3/A5 `:97`, `:99`).
- A protected constituent disappears entirely (`:1638`).
- Per-worker identity grants work only through "a read-time JOIN with active membership" (P10 `:101`, `:142`), so a non-member operator cannot hold one.

So the floor already gives alias-only access, **if** the grant carries no `security.clearance`. That rule exists only in #2281 OQ4 (proposed). Ratified text does not decide it.

**Approver, consent, duration, revocation and tenant visibility:** none is ratified. The only tenant-consent mechanisms are for recovery ("consent-logged", `:1671`) and impersonation (account opt-out, `:1669`).

**Issues (all OPEN, "pending Ready, prep only"; none implemented: no `packages/api/src/capabilities/`, no `principal/deferred.ts`, no grant tables):**

- **#2281** (blocked by #2282, #492, #2258, #2250; blocks #2284): grant table plus sink. Owner-run SQL issues and revokes (OQ11). Operator proposes the tenant (OQ5). Purpose `operator_support` only; `valid_until` = JWT `exp`; no grant expiry. Sink has zero policies (tenant cannot read) and logs contexts opened, not actions. Backfills every `super_admin`.
- **#2282**: operator context ref (grant ref, purpose, `validUntil`, audit ref). `PURPOSE_REGISTRY` = `operations`, `public_projection`, `operator_support` (OQ6).
- **#669** (slices #2258 merged as PR #2412; #2259, #2281, #2310, #2311 open): operator is a distinct principal branch, never a membership row. OQ6: fire-time re-check, deny on failure. OQ7: envelope actor field waits for schema v2; gate fails closed.
- **#668** (14 blockers; 7 slices, (f) #2298 last): deletes `OR is_super_admin()` from data-plane RLS, kills default tenants, adds an isolation gate.
- **#2295** (d1): staff/CRM/audit tables only; revokes browser access to `audit_logs`. Spine tables are #2296 (d2). Migrations still contain 113 `is_super_admin()` calls.
- **#2311** (blocked by #2310, #2259, #2281, #2284, #2285, #2289, #2297, #666): operator deferred arm accepts only `operator_support` with `now < validUntil`. Unwired; Gate 9 classifies all four current events as `system`.

## 2. Helper memberships

- **Non-employees.** P12 has no employee/consultant distinction; any human acts through a membership-backed Active Tenant Assignment (`:1552`, ratified). A non-member needs a new context, as Phase 24 D25 did (`phase-24-multi-site-management-decision-log.md:4893-4900`).
- **Expiry.** `group_membership.expires_at`, `default_membership_ttl` (`:1593`), story 8 (`:1487`); JIT plus second approver for `permissions.manage` and restricted groups (`:1594`). Ratified, unbuilt.
- **Access reviews.** D8 recertification of sensitive and restricted grants; with one admin it routes to an external reviewer (`:1661`, `:1470`).
- **MFA.** No ratified staff MFA rule. P12 claims "assurance, step-up" (`:46`, `:62-63`) without a policy. Phase 44 (published planning) covers MFA only for SSO (`enterprise-identity/specification.md:68`).
- **Offboarding.** Freeze or suspend gives zero capabilities (`:1669`, `:1514`). Membership end, revocation or expiry makes the path inert (`:410-415`). P10 grants die on departure (`:101`).
- **Role names.** "Role names never authorize" (P12 `:1552`; `:1883-1885`; ADR-0173 cl.3 `:47` "not role names"; P22 D19 "presets and labels are input conveniences, never authorization" `:2857`; root `CONTEXT.md:2834-2835`).
  - A **"Switch owner" role** and a **"preparation-only role"** are therefore wrong forms.
  - The ratified form is a **per-Switch accountable designation that grants nothing**, like Phase 29 Q24 "responsibility is not permission" (PR #2430 `source-inventory.md:54`) and ADR-0184's Access request coordinator. Authority comes from separate Phase 30 and target-owner capabilities.
  - Helpers get an expiring Access group or direct grant of the preparation atoms only (ADR-0173 cl.3 `:47-55`).

## 3. Separation of duties

**Ratified:** no rule requires different people for prepare, commit or attest.

- ADR-0173 cl.3 (`:47-55`): "no needless two-person approval ritual"; commit is a separate capability (cl.20 `:200-209`).
- P12 D17 amendment (`:2219-2227`): one finance actor by default; "Import access grants no activation."
- P13 (`:862`): no forced second approver; optional correction SoD is implemented as requester ≠ approver (`approval-policy.ts:119-128`).
- P28 D17: missionary commits with no second reviewer (`roadmap.md:4347`). Only projection widening needs a distinct human (contract `:187-201`, proposed).
- D15 detection checks one principal's set (`:1662`), so it cannot see operator-plus-member pairs.

**Effect on Option C:**

- Forbidding Asym from committing or attesting **conflicts with nothing**. It is a principal-class ceiling, not SoD, so it must not be worded as a two-person rule; the ministry alone may still prepare and commit.
- **Overlaps:** C16 (DL `:173`) denies commit without the target owner's capability; roadmap `:4347` gives the accepted plan to "**staff**"; C5, C6, C10 and C23 make every import send nothing and grant no consent.
- The commit ceiling still needs owner text, because the `platform_admin` bundle carries money atoms (§1).

## 4. Restricted identities

- **Aliases.** A restricted or high_risk Party must have a distinct alias, enforced at the data layer, and a restricted import with no alias is rejected (P10 A3 `:97`, `:174`; ratified). Uncleared contexts see the alias (P12 `:1640`).
- **Real identity.** Only clearance holders or holders of a membership-bound identity grant (P10 A7 `:101`).
- **Alias-only precedent (ratified).** "Restricted-worker mapping must use approved aliases or opaque stable identities … Inspecting restricted identity requires separate security clearance" (P10 D17 amendment `:396-400`).
- **The floor yields aliases only for classified Party rows; raw and staged rows have no alias yet.** Q2 cl.5(e) makes the whole file "restricted by default … until proven otherwise" (DL `:59`, ratified); who narrows it, and whether staged rows inherit it, is undecided (D11). An uncleared specialist sees **nothing** of that content until a cleared ministry user classifies rows (adding aliases) or narrows the default.
- **Error files.** These are governed exports under one export policy that excludes security fields (ADR-0212, accepted; annotated error downloads in roadmap `:4347`). They derive from raw rows, so the same pre-classification problem applies.
- **Raw bytes.** Phase 29 keeps preview and download as **separate** source-authorized capabilities (PR #2430 founder-brief `:205`, `:235`; AC29-D05-04; ratified/published, unmerged). It has no platform-operator rule. The staff-migration custody profile (O19) does not exist. **Part 4 bans download, not preview.**
- **Telemetry.** The platform's own pipes count as "outside the body" (P10 A8 `:102`).

## 5. Long-running jobs and actor authority

- **Implemented:** no actor in the envelope (`workflows/events.ts:77-91`); runs act as the nil system actor (`:18-22`).
- **A ministry user's commit** carries that member's deferred context, which C16 re-proves per chunk. Needs #2259 and envelope v2 (#669 OQ7: fails closed until then).
- **Practice runs** write only Phase 29/30 records (Q1 cl.3, DL `:31`) and need no target-owner capability, but they are durable jobs. Started by a specialist, a run carries #2311's operator arm (`operator_support` only, `validUntil` = JWT `exp`), so a multi-hour run is denied at fire time and a 30-day grant cannot extend it. O26 needs a `switch_preparation` purpose and a deferred bound tied to grant expiry and revocation, re-proved per chunk.
- **Run records** name actor, delegation and capabilities proved (ADR-0173 cl.30 `:291-299`, accepted).

## 6. Agreements

- Q2 cl.5(a) already requires the agreement to cover "roles, purpose, export scope, subprocessors …, hosting region, **access**, retention …, deletion and breach notice" (DL `:59`, ratified). Asym access is therefore already in scope **generically**. O26's prerequisite only makes it explicit (naming operator access and its ceiling). It is a clarification, not a new gate.
- No DPA, customer terms or staff-access text exists in the repo. `docs/guides/features/openpolicy-legal-pages.md:115` lists donor-facing subprocessors; `:174`, `:192` treat the MSA/DPA as external artifacts.
- Q2 cl.4 (DL `:58`): NOW screen-shares "show no person data and are not recorded". **Nothing covers live-data guided sessions.**

## 7. Tenant audit visibility

- **Ratified:** `access.security_audit` (P12 `:451-460`, `:461`) is the **D42 access-continuity history** projection: who got Website-recovery capability, and how. It is not a general tenant activity log.
- **P10:** the read audit of restricted persons (`:141`, story 12) records `actor_profile_id`. There is no principal kind.
- **The operator sink** is tenant-independent (`:1552`). No ratified or proposed text gives a tenant read access to it (#2281: zero policies). Only impersonation carries `acting_principal` + `on_behalf_of` (`:1669`).
- **Implemented:** `audit_logs.user_id` has no FK or principal type (`20250101000000_init_schema.sql:325-336`); any tenant staff member or super_admin may read or insert (`20260226113000…sql:440-462`); GraphQL `auditLogs` uses the admin client behind role strings (`packages/graphql/handler.ts:407-424`); Mission Control shows "Audit logs … are not available from this page" (`apps/admin/app/(app)/admin/page-client.tsx:146`).
- **Result:** a ministry cannot see operator actions today or under any plan. Part 3's "distinct identity the ministry can see" is wholly new.

## 8. Ratified terminology to align

- **Q1** (DL `:29-40`): "ministry-accepted", "written acceptance", "ministry attested", "a **named ministry user** marks each executed", "ministry-attested decommission checklist".
- **Q2:** "the ministry **names its admin**" (`:53`); Asym's **relationship owner**, evidence custodian, environment approver (`:63`).
- **Q3:** "the ministry or its **helper**" (`:75`; `CONTEXT.md:42`); monitor owner "Phase 30 spec owner, with the **switch operator**" (`:92`).
- **Q4 M2:** owner "**Switch operator (F18) with the ministry admin**"; response "**Contact the ministry.** Asym never issues instead" (`q04-adversarial-review.md:414`; DL `:258`).

## What breaks or must change in the eight parts

1. **Part 1 (Switch owner "makes every decision … committing money") conflicts with C16 and the D17 amendment.** Each decision needs its owner's capability. Money commit and Field Account activation need finance atoms, and Q1 cl.12 assigns privacy items to "a named ministry user", not one owner.
   - Reword: **every decision is made by a ministry member holding the relevant capability. The Switch owner is the accountable designation for go/no-go, sign-offs and the decommission checklist, and grants nothing by itself.**
   - "Nobody outside the ministry" is consistent with roadmap `:4347` and Q1. It also needs the interim "platform_admin approves widenings" rule (`registry.md:75-78`) not to apply to Switch decisions.
2. **Part 2:** "preparation-only role" breaks role-names-never-authorize. Use an expiring Access group or direct grant of Phase 30 preparation atoms. Membership expiry and offboarding already exist in P12. MFA or step-up for helpers is unowned (gap).
3. **Part 3 is new owner text, not a restatement.** The ratified grant has no approver, consent, cap, ministry revocation or tenant visibility. #2281 would decide these the opposite way: Asym-issued by SQL, operator-chosen tenant, no expiry, invisible sink. O26 must override #2281 before it merges.
   - Also needed: a `switch_preparation` purpose and a bundle that excludes the `platform_admin` defaults.
   - The approver must be "a ministry member holding [grant-approval capability]", not "a ministry admin".
   - "Ends at go-live" contradicts the up-to-12-month tail (Q1 cl.6) unless Legacy Tail Backfill preparation is in scope through renewal. The Q1 v1 review proposed "renewed per catch-up as an audited action" (`q01-v1-review.md:346`, proposed).
4. **Part 4:** "except as aliases" works only for classified Parties. For raw and staged rows still restricted by default, the specialist sees nothing until a cleared ministry user classifies them.
   - **Add "preview" to the raw-file ban** (Phase 29 separates it from download).
   - "Send anything, change consent" is already impossible on the import path (C5/C10/C23). Keep it only as a grant ceiling.
   - The commit/attest ban is needed because of the `platform_admin` bundle.
5. **Part 5 fallback ("Asym coaches in guided sessions while the ministry works") breaks Part 4 in practice.** Watching a ministry screen with live data is unaudited Asym access to restricted identities, outside the floor, which P10 A8 forbids.
   - Require guided sessions to show no restricted-tier or raw-file content, or limit them to synthetic or no-person-data screens as Q2 cl.4 does. Make the agreement cover them.
   - Q3's monitor signal is "developer help", not specialist help. Logging specialist help is an addition, not the same signal.
6. **Part 6:** "issue triage" must mean propose-only. Match-review and duplicate dispositions are the accepted plan (roadmap `:4347`; C2 merge is staff-deliberate). This is otherwise consistent.
7. **Part 7** is consistent with Q3 ("its helper") and the D25 precedent (non-members need a new context). It is low-cost new text.
8. **Part 8 inverts M2.** M2's response is "Contact the ministry", so its owner must be on the Asym side.
   - Set owner = **Asym relationship owner (Q2 cl.9) with the Switch owner**, and response = "Contact the Switch owner".
   - "No data access needed" holds only if Switch attestation status is exposed as content-free operational status (ADR-0173 cl.30 pattern). Otherwise the relationship owner simply asks.
   - Replace "switch operator" in Q3's monitor with "Asym specialist for that Switch".

**Prerequisites.** "#668, #2295" is incomplete. Name all of #668: (d1) #2295, (d2) #2296 and (f) #2298. Also add #2284/#2285 (`profiles.role` inert) and envelope v2 (#669 OQ7) alongside #2311.

## Minimum owner text needed

1. **P12 (O26):**
   - a `switch_preparation` purpose;
   - an operator-grant capability ceiling: Phase 30 preparation atoms only, with no target-owner commit, attestation, send, consent, raw-file preview or download, `security.clearance` or `permissions.*` atom;
   - grant approval by a ministry member holding a named capability, using the quorum-aware single-admin path;
   - ministry revocation at any time; expiry at most 30 days, renewable, scoped to one Switch, with tail backfills included only by renewal;
   - a deferred-work bound tied to the grant (not the JWT);
   - a tenant-visible projection of operator events and Phase 30 run attribution carrying the principal kind and grant id.
2. **P10:** operator grants never carry clearance. Restricted-by-default staged content is hidden from operators until a cleared ministry user classifies it.
3. **P29 + Phase 30 (O19):** the staff-migration custody profile denies raw-file preview and download to operator contexts.
4. **Phase 30 spec:** the Switch owner as a non-authorizing per-Switch designation, and separate prepare versus decide capabilities (F7).
5. **Q2 agreement:** state Asym operator access, its ceiling and guided-session rules explicitly under cl.5(a) "access".
6. **Q3 and Q4 monitor rows:** retitled as in Part 8.
