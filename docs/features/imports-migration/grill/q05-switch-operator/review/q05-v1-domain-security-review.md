# Q5 v1 review: domain correctness, authorization, data and security

Independent, read-only review of `q05-decision-as-asked.md` (Option C, eight parts, O26). Baseline `develop` `629cb71dc`; GitHub issues read 2026-11-02.

Labels: **VF** verified fact (re-read in this review) · **RF** repo fact cited by the research, not re-read · **INF** inference · **ASM** assumption.

## Verdict in brief

C's core is right: the ministry decides, helpers prepare, Asym works hands-on only under a ministry-approved grant, never through super_admin. It matches Phase 12's ratified operator plane (P12 `:1552`, `:1555`, `:1587-1588`, VF) and beats B (Asym decides, conflicting with Q1 attestations and C16) and D (no ecosystem). As written, though, it promises controls the codebase cannot deliver and is unsafe in four places:

1. Asym, not the ministry, controls who the approving "ministry admin" is.
2. Helpers get wider access than Asym, with no end date.
3. "Except as aliases" cannot work for raw or staged cells.
4. The coaching fallback, the likely v1 path, is unaudited Asym viewing of live restricted data.

**Disposition: accept with required amendments.** Hands-on Asym access becomes a gated capability; coaching (Option A) is the default until the gate is verified.

## Current, intended and best path

| Topic                        | Current (develop)                                                                                                                                                                       | Intended (owner docs)                                                                                                                | Best permanent path                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| How Asym reaches tenant data | `super_admin` reads every tenant via `authz.is_super_admin()` in RLS (definition `20260226113000:143-156`; 111 matching lines in 11 migrations). VF                                     | Operator plane through the resolver, purpose-bound and time-boxed; `OR is_super_admin()` deleted (P12 `:1552`, `:1585`, `:1588`). VF | The same, plus a ministry-approved `switch_preparation` purpose (O26)                           |
| Who adds members             | Only the service role writes `authz.memberships` (`20260226113000:74-90`) and `profiles` (`20260625002117:47`); no member-management route exists. Asym creates every ministry user. VF | Ministry groups with `granted_by`, `expires_at` (P12 `:1593`). VF                                                                    | Ministry adds members in-product; Asym only provisions agreement-named admins and runs recovery |
| Staff scope                  | "All staff subroles have full Mission Control admin access" (`packages/auth/permissions.ts:38-39`); `hasRole('admin')` is true for any staff member (`:64-71`). VF                      | Capabilities only; role names never authorize (P12 `:1552`). VF                                                                      | Preparation capabilities granted separately (ADR-0173 cl.3)                                     |
| Restricted identities        | No `security_level`, `party_restricted`, `identity_access_grants` or `security_clearance` in migrations or `packages/api`. VF                                                           | Data-layer aliases, clearance, membership-bound grants (P10 `:97`, `:101`). VF                                                       | The floor covers staged content; operators never hold clearance                                 |
| Background actor             | No actor in the envelope; runs act as the nil UUID (`workflows/events.ts:18-22`, `:77-91`). VF                                                                                          | Re-resolved when a job fires (P12 `:1587`). VF                                                                                       | Deferred operator context bounded by the grant                                                  |
| Audit                        | Any staff member or super_admin may insert `audit_logs` rows with any `user_id` (`20260226113000:452-463`). VF                                                                          | Append-only sink outside any tenant (P12 `:1552`)                                                                                    | Server-set principal kind and grant id, visible to the ministry                                 |

## Material concerns, ranked

### K1. The ministry does not control who its approving admin is

High severity; structural, so high likelihood. Changes O26.

"Approved by a ministry admin" is a control only if Asym cannot make someone an admin. Three facts break it:

- Asym creates every membership today (VF, above).
- The interim capability spine says "in-tenant widenings need a platform admin to approve" (`docs/security/capability-spine/registry.md:75-78`; `packages/auth/capabilities/bundles.ts:79`). VF
- Tenant recovery is run by the platform (P12 `:1671`). VF

A specialist under pressure could make a colleague (or their own personal email) an admin and approve their own grant; Part 3 does not forbid it. That empties the consent guarantee; Lockbox's core rule is that the vendor cannot change who approves (r4 §1). No new mechanism is needed: Phase 12 memberships record `granted_by` (`:1593`).

**Spec language:** "Only a ministry admin whose admin authority comes from the signed agreement or from another ministry admin may approve. Authority created by Asym support or tenant recovery alone never qualifies. Operator identities never hold a tenant membership. Membership changes Asym makes are shown to the ministry's admins. Tenant recovery ends every grant and pending request. The interim platform-admin approval of widenings never applies to Phase 30 or operator-grant capabilities."

### K2. Helpers are less controlled than Asym, and a "preparation-only role" cannot exist

High severity, high likelihood. Changes Part 2.

- **The form is wrong.** Part 2 gives helpers a "preparation-only role" with no end date, but role names never authorize (P12 `:1552`; root `CONTEXT.md:2829-2835`). VF
- **Today it would be full admin.** Any staff membership is full admin, including finance, and only Asym can add one. VF
- **Clearance comes with admin.** Once Phase 10 ships, a helper in an admin-like group also gets clearance: admin "ships with it on but removable" (P10 A7 `:101`). VF

So an outside consultant could see everything, indefinitely, while the Asym specialist is alias-only and capped at 30 days. Agencies treat worker identities as need-to-know (r4 §5).

**Fix:** separate preparation capabilities (ADR-0173 cl.3 `:47-55`, VF); helper access expires at Switch closed by default; the same floor for every uncleared viewer (K3); outside helpers only once the ministry can grant scoped, expiring access in-product.

### K3. "Except as aliases" does not work for raw and staged cells

High severity, high likelihood. Changes Part 4.

- **Aliases cover only classified Parties** (P10 A3 `:97`, VF). Exports carry names and places in fund and designation names, memos, notes, custom fields, and even headers ("labels can name workers, places or programmes", Q2 cl.3(iii), DL `:56`, VF).
- **The floor does not yet reach staging.** Q2 cl.5(e) makes the whole file restricted by default, but nothing applies that to staged content: Phase 10 is unbuilt (VF) and staging custody is unsettled (D11).
- **Preview is not banned.** Part 4 bans download only, though Phase 29 authorizes preview separately (RF r3 §4; PR #2430 unmerged).
- **Uploads would break custody.** If an operator uploads, Asym staff hold source files outside custody — the "ungoverned second file store" Q2 rejected (ADR-IM-002).

**Fix (reuse, don't build): one floor for every viewer.** Operator grants never carry clearance. Staged and raw content stays restricted until a cleared ministry member narrows it column by column; free-text and label columns only after that member confirms they name no restricted person. Source files reach Asym only by a ministry member's upload; no Asym identity uploads, previews or downloads a source file, error file or export. Consequence: until Phase 10 covers staged content, no uncleared viewer sees real staged values (Q2 already implies this).

### K4. The coaching fallback is the likely v1 path and is unaudited access to live restricted data

High severity, high likelihood. Changes Part 5.

Screen-sharing real data shows Asym whatever is on screen (raw cells, real identities, match candidates), unlogged and possibly AI-transcribed. Q2 cl.4 covers only pre-agreement sessions (DL `:58`, VF); P10 A8 counts support tooling as outside the body (`:102`, VF). Given K5, the design partner probably gets this path (INF).

**Fix:** coaching rules in the decision (clause 5 below), including that restricted steps, such as a match needing a real identity, happen off the call, and that the agreement covers these sessions.

### K5. Hands-on access rests on an unbuilt plane and a draft that points the other way

High severity, high likelihood. Narrows the answer.

**Nothing of the operator plane exists** (`principal/types.ts:46-50`, "Type-only", VF).

**#2281 (open) points the other way** (VF, issue body): the operator proposes the tenant; purpose `operator_support` with `validUntil` = session TTL; no expiry column; a live grant backfilled for every super_admin; the `platform_admin` bundle (refunds, `admin.crm.manage`; `bundles.ts:28`, `:41`, `:93`, VF); no tenant read of the sink. **#2311** accepts only `operator_support` with `now < validUntil` (VF), so a long operator-started practice run is denied when it fires. **super_admin reads real data the moment it lands**, so "before any Asym access to real data" really means "before any real data" (INF from VF).

**Fix:** Phase 30 guards its own boundary (only member contexts and `switch_preparation` grants; tenant-only RLS from creation, no `is_super_admin()` or role-string escape). Amend Q2 cl.6: an Approved environment has no such escape on person, money, Phase 29 or Phase 30 tables (#668: #2295, #2296, #2298), or until then nobody holds super_admin there, re-verified at each go/no-go. List the full prerequisites and make coaching the default until they are verified.

### K6. Lifecycle gaps

Medium-high severity, high likelihood. Changes Part 3.

- **"Ends at go-live" contradicts the tail.** Q1 cl.6 runs separately reviewed backfills for up to 12 months (VF). Instead, end at the ministry's date (at most 30 days), revocation, or Switch closed or aborted; each renewal, including per backfill, is a new approval.
- **No pending-request expiry.** Silence must mean expiry (r4 §1); use 7 days.
- **Revocation during a job.** Re-check the grant per chunk (P12 `:1587`; C16) against its expiry and revocation, not the session TTL; a denied run pauses resumably. Operators never commit, so nothing partial reaches target owners. Bump the tenant epoch on revocation (P12 `:1586`, VF).

### K7. Part 1 confuses accountability with authority, and "Switch owner" collides with other terms

Medium severity, high likelihood. Changes Part 1.

- **It conflicts with ratified rules.** "Makes every decision … committing money" contradicts C16, Phase 12's D17 amendment ("Import access grants no activation", P12 `:2219-2227`, VF) and Q1 cl.12's "named ministry user" (VF).
- **"Admin" means nothing yet** (`hasRole('admin')` = any staff, VF), and nothing covers the owner leaving mid-switch.
- **"Owner" is taken:** Phase 12's locked Owner group, Phase 30 "owner commands", the NHI "human owner", Q2's "relationship owner", and the Q1 review's **Asym-side** "named Switch owner (Phase 30 operations or customer success)" for tail monitors (`q01-adversarial-review.md:1008`; `q01-v2-review.md:476`, VF).

**Fix:** rename it **Switch lead**, a per-Switch designation that grants nothing ("responsibility is not permission", Phase 29 Q24; RF r3). Without a lead, go/no-go and sign-offs block; losing it during the editing pause triggers Q1's missed-deadline abort (DL `:31`, VF).

### K8. Reconciliation independence

Medium severity, medium likelihood. Changes the ceiling.

If the specialist both maps the data and enters the level-2 controls, reconciliation ties Asym's work to Asym's numbers. Q1 cl.9 requires independent controls captured at export, and Q3 cl.4(d) requires capture independent of the templates (VF). Census answers, dispositions, exclusion acceptances and attestations are the ministry's statements.

**Fix:** all are ministry-only, outside the operator allow-list. Commit already binds to the viewed plan digest; later changes make it stale (ADR-0173 cl.19-20, `:198-209`, VF).

### K9. Monitors need an Asym-side owner and a way to see status

Medium severity, high likelihood. Changes Part 8.

Part 8 gives M2 to the Switch owner, but M2's response is "Contact the ministry" (`q04-adversarial-review.md:414`, VF), so the owner would contact itself. "No data access needed" is half true: Asym must still learn whether decommission item (i) is attested, and Q1's tail monitors and O11 (invisible post-handoff failures) need the same.

**Fix:** a content-free Switch status for Asym (stage, dates, open checklist item names, run end states; no person, gift, fund or label text), disclosed in the agreement. It follows ADR-0173 cl.30 (`:291-299`, VF) and #2282's proposed `operations` purpose (RF). M2's owner becomes Asym's relationship owner, with the Switch lead; "switch operator" is replaced in the Q3 monitor and M2.

### K10. The "never" claims need an honest break-glass exception

Medium severity, medium likelihood. Changes Parts 3 and 4.

Asym engineers hold service-role and database access outside any grant (DL §8, VF). P12 keeps super_admin "break-glass-tempo'd" (`:1588`) and keeps tenant recovery (`:1671`). Without an exception, the ministry-facing promise is false (r4 finding 2).

**Spec language:** "Incident response and legal process use a separate, logged break-glass path. It is disclosed in the agreement, shown to the ministry afterwards unless the law forbids it, and never used for Switch work."

### K11. Attribution can be forged, and the ministry cannot see it

Medium severity, medium likelihood. Adds an O26 clause.

`audit_logs` accepts any `user_id` (VF); `crm_command_logs` is similar (RF r1); the #2281 sink has no tenant read (VF).

**Fix:** Phase 30 records carry principal kind, person and grant id, set by the server and written only by server commands. The ministry sees grant lifecycles, operator sessions and operator-attributed Switch actions. No general tenant audit viewer.

### K12. Asym's own tools can leak

Medium severity, medium likelihood. Changes Parts 5 and 6.

Help logs, tickets, chat and notes count as support tooling outside the body (P10 A8). A note like "fund 'J. Smith – [country]' failed to map" discloses a restricted worker.

**Fix:** help logs record step and issue type only, and no tenant content is copied into internal tools.

### Lower-severity items

- **K13. MFA.** No ratified staff MFA rule exists (RF r3 §2). Require MFA for operator identities; recommend it for helpers (a Phase 12/44 gap).
- **K14. Agreement.** Q2 cl.5(a)'s "access" covers Asym only generically (VF). Name operator access and ceiling, coaching sessions, break-glass, where Asym staff access from (PIPEDA 4.1.3; r4) and staff confidentiality (GDPR Art. 28(3)(b); r4). Helpers are the ministry's agents; Asym contractor specialists are Asym subprocessors.
- **K15. A deny-list is brittle.** Part 4 misses preview, export, reversal, plan acceptance, match decisions, `permissions.*` and future capabilities. Use an allow-list instead. "Send" and "change consent" are already impossible on the import path (C5, C10, VF), so drop them as separate promises.
- **K16. Cross-tenant hygiene.** One grant per tenant per request (P12 `:1555`); remembered mappings and templates are never copied across tenants; operator dashboards list tenants and Switch states only; Asym endorses no helper, so Part 7 is not bypassed.
- **Accuracy wording.** "Data accuracy is the ministry's responsibility" reads as disclaiming the specialist's own errors. Say instead: the ministry decides and signs off; Asym answers for its software and for following the ministry's instructions.

## Category review

| #   | Category                          | Material?                  | What I checked                                                                                                                                                                     |
| --- | --------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Validity, necessity, alternatives | Yes (K5)                   | Helpers are needed (Q3); vendors staff conversions (r2). Strongest alternative, "A now, C once gated", is amended C. A content-free operator view was rejected as extra machinery. |
| 2   | Brittleness                       | Yes (K15, K6, K5)          | Deny-list; "ends at go-live"; "if not built in time" invites a shortcut; reliance on #2281.                                                                                        |
| 3   | Technical debt                    | Yes (K5)                   | super_admin RLS (111 lines, 11 migrations) and #2281's standing backfilled grants. Phase 30 adds none.                                                                             |
| 4   | Edge cases                        | Yes (table below)          | —                                                                                                                                                                                  |
| 5   | Footguns                          | Yes (K3, K4, K7, K12)      | Free-text columns, screen shares, "owner", internal notes. Keep grant approval separate from column narrowing.                                                                     |
| 6   | Tenant safety                     | Yes (K16, K5)              | Single-tenant context (P12 `:1555`), unrepresentable cross-tenant edges (`:1584`), expiry-capped cache (`:1586`): adequate once wired. Jobs re-check the tenant (#2311, VF).       |
| 7   | Database, RLS, authorization      | Yes (K1, K11, K6)          | Invariants below.                                                                                                                                                                  |
| 8   | Source of truth                   | Yes (K7, K8)               | Grants: Phase 12. Lead and attestations: Phase 30. Floor: Phase 10/12. Custody: Phase 29.                                                                                          |
| 9   | Hidden coupling                   | Yes (K9, K3, K1)           | Q1 tail monitors and O11; D11/O19 and Phase 10; Phase 12 member management (#685); the interim widening rule.                                                                      |
| 10  | Failure modes                     | Yes (K6)                   | Lapsed grant or absent admin delays a backfill (fails safe); lost lead mid-pause aborts; revocation pauses a run.                                                                  |
| 11  | Lifecycle, concurrency            | Yes (K6)                   | requested → active → ended (expired, revoked, closed, recovered); repeat approve or revoke is a no-op; approval re-checks the approver.                                            |
| 12  | Data integrity                    | Yes (K8, K11)              | Plan-digest binding (ADR-0173 cl.20).                                                                                                                                              |
| 13  | Security and privacy              | Yes (K1-K4, K10, K12, K13) | Allow-list for least privilege; one floor removes the helper/Asym asymmetry; raw files never reach Asym; honest break-glass.                                                       |
| 14  | Dependencies and integration      | Yes (K5)                   | The member deferred context (#2311 member arm plus envelope v2) blocks every option, not only C.                                                                                   |

### Edge cases

| Case                                                                          | Handling                                                                                                                |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| One-person ministry                                                           | One person may be lead, approver, preparer and committer (ADR-0173 cl.3; P12 `:1470`). Asym is never the second person. |
| Lead leaves mid-switch                                                        | Sign-offs block until reassigned; mid-pause, Q1's abort; sole admin: tenant recovery, which ends grants.                |
| Helper is also a donor                                                        | Separate memberships; helper expiry leaves the donor membership intact.                                                 |
| Consultant for several ministries                                             | One membership per tenant; error-file download only if separately granted; contract is with the ministry.               |
| Specialist helps another tenant                                               | One grant per tenant; no cross-tenant copying; content-free help log.                                                   |
| Grant expires or is revoked mid-run                                           | Next chunk denied; run pauses; resumable by a member or under a new grant; nothing committed.                           |
| Renewal during the 12-month tail                                              | New approval per period or backfill; a lapse delays the backfill.                                                       |
| Restricted names in fund names, memos, notes                                  | Column restricted until a cleared member narrows it (free text only after confirming no restricted person).             |
| Screen-share coaching; emergency or legal access; Asym adding ministry admins | K4; K10; K1.                                                                                                            |

### Database, RLS and authorization invariants

- **Grant rows:** non-null `tenant_id` and `switch_id`, fixed purpose, CHECK grant tenant = Switch tenant; RLS enabled and forced; `REVOKE ALL` from PUBLIC, `anon`, `authenticated`; SELECT only for the tenant's permission managers (`USING tenant_id = current_tenant_id()`).
- **Writes:** server commands only, deriving actor (`auth.uid()`), tenant (validated context) and grant id, never from the payload. Lifecycle is append-only events (trigger blocks UPDATE/DELETE).
- **Approver:** a same-tenant member with permission-management authority at that instant and K1 provenance; never an operator principal.
- **Phase 30 writes:** `WITH CHECK (tenant_id = current_tenant_id())`, server-set actor columns, no browser INSERT path like `audit_logs`. Deferred jobs serialize only the grant reference and re-resolve it per chunk.

## Disposition

**Accept with required amendments.** K1–K12 are required; K13–K16 are recommended. The amendments narrow the answer: hands-on help from Asym is gated, and coaching is the v1 default until the gate is verified. Nothing in C is reversed.

## Corrected decision text

**Q5. Who runs a switch (F18): Option C, amended.**

1. **The ministry decides.** Ministry members holding each decision's capability (C16), recorded under their own identity, decide:
   - go/no-go, the readiness census, exclusions and Legacy Surface Dispositions;
   - attestations, plan acceptance, and match and duplicate decisions;
   - reconciliation controls and sign-off;
   - commit and reversal;
   - tail closure and decommission.

   No Asym identity can make or record any of them.

   Each Switch has a **Switch lead**: the ministry member accountable for the Switch and Asym's contact. The role grants nothing. Without a lead, go/no-go and sign-offs are blocked. Losing the lead during the editing pause triggers Q1's missed-deadline default.

   The ministry answers for its data and decisions. Asym answers for its software and for following the ministry's instructions.

2. **Helpers.** Ministry staff, or a volunteer or consultant the ministry adds as a member, may prepare: mapping, practice runs, reviewing issues and proposing fixes. They do so through separately granted preparation capabilities. Their access ends at Switch closed or an earlier date the ministry sets, and their other memberships are untouched. Outside helpers are added only once a ministry admin can grant that scoped, expiring access in Asym.
3. **One floor for everyone.** The real export stays restricted until a cleared ministry member narrows it column by column. Free-text and label columns are narrowed only after that member confirms they name no restricted person. Anyone without security clearance — every Asym specialist and any uncleared helper — sees restricted people only by alias and does not see unnarrowed columns at all. Source files reach Asym only by a ministry member's upload.
4. **Asym hands-on help** happens only under an Operator Tenant Grant (O26). The grant:
   - covers one Switch;
   - is approved by an eligible ministry admin;
   - lasts up to 30 days, as the ministry chooses;
   - is revocable at any time and ends at Switch closed.

   Renewal, including for each Legacy Tail Backfill, is a new approval. The grant allows Switch preparation only. It never allows the decisions in clause 1, restricted identities, uploading, previewing or downloading any file, or any export.

   Asym never helps through super_admin, a shared or borrowed login, impersonation or a membership. No Asym employee or contractor is a member of a customer tenant.

5. **Until O26 and its prerequisites are verified, Asym only coaches.** In coaching on real data:
   - the ministry drives;
   - nothing is recorded, transcribed or summarised by AI;
   - no file leaves Asym;
   - restricted identities, raw files and unnarrowed columns stay off screen, and restricted steps happen off the call;
   - each session is logged on the Switch with its attendees.

   The design partner's switch proceeds this way if the grant is not ready. It neither waits for the grant nor works around it.

6. **Scope of help.** Help covers mapping, practice runs, issue triage and coaching. Duplicate cleanup, match decisions and contacting recurring donors stay with the ministry. Specialists keep a content-free help log (step and issue type) that feeds Q3's monitor, and they copy no tenant content into Asym's internal tools. Pricing and included hours are commercial terms.
7. **No partner programme in v1.** Asym endorses no helper.
8. **Monitoring.** Asym monitors from content-free Switch status (stage, dates, open checklist item names, run states), disclosed in the agreement.
   - Q4 M2: owned by Asym's relationship owner with the Switch lead. Response: contact the Switch lead; Asym never issues instead.
   - Q3 monitor: owned by the Phase 30 spec owner with the Switch lead and any Asym specialist.
9. **Disclosed exception.** Incident response and legal process use a separate, logged break-glass path. It is disclosed in the agreement, shown to the ministry afterwards unless the law forbids it, and never used for Switch work.
10. **Amends Q2 clause 6.** An Approved environment also has no `is_super_admin()` or role-string escape in any person, money, Phase 29 or Phase 30 policy. Until #668 lands, the alternative is that nobody holds super_admin there. This is re-verified at each go/no-go.

**Not implied:** any spec, ticket or implementation. The Phase 28 D17 self-import stays missionary-run, with no operator.

## Corrected O26

**O26 (Phase 12, with Phase 10, Phase 29 and the Phase 30 spec): Operator Tenant Grant for Switch preparation.**

- **(a) Binding.** Purpose `switch_preparation`, bound to one Tenant and one Switch (the database enforces equality). Phase 30 resources accept only member contexts and this purpose. Every other operator purpose is denied there, including `operator_support` and grants backfilled from super_admin. Phase 30 tables have tenant-only RLS from creation.
- **(b) Ceiling (allow-list).** Phase 30 preparation capabilities for that Switch only. Excluded by construction:
  - target-owner capabilities, commit, plan acceptance, and match or duplicate decisions;
  - census, disposition, attestation, reconciliation control and sign-off;
  - reversal, export, download, and source-file upload or preview;
  - security clearance, consent, sending and `permissions.*`.

  Never the `platform_admin` bundle.

- **(c) Lifecycle.**
  - A named specialist requests the grant with a reason; an unanswered request expires after 7 days.
  - An eligible ministry admin approves it; the quorum-aware single-admin path applies.
  - It stays active until the ministry's date (at most 30 days), revocation, or Switch closed or aborted.
  - Renewal is a new request.
  - Records are append-only and written only by server commands that derive the actor, tenant and grant themselves.
- **(d) Approver integrity.**
  - Eligible approvers hold admin authority that comes from the signed agreement or from another ministry admin, never from Asym support or tenant recovery alone.
  - Operator identities never hold a tenant membership.
  - Membership changes Asym makes are shown to the ministry's admins.
  - Tenant recovery ends every grant and pending request.
  - The interim platform-admin approval of widenings never covers these capabilities.
- **(e) Enforcement.** The grant is resolved through the floor on every request, and revocation takes effect at the next request (tenant epoch). Deferred work carries the grant reference and re-checks it on every chunk against the grant's expiry and revocation, never against the session's lifetime. A denied run pauses and can resume.
- **(f) Identity and visibility.** A personal operator account with MFA, named to the ministry. The ministry sees each grant's lifecycle, each operator session and every operator-attributed Switch action, with principal kind, person and grant id.
- **(g) Floor.** Operator grants never carry clearance (Phase 10). Staged and raw content stays restricted until a cleared ministry member narrows it. The staff-migration custody profile (O19) denies operators preview and download.

**Prerequisites before any Asym identity uses a grant on real data:**

- #2282;
- #669, including #2311's operator arm extended to `switch_preparation`, plus envelope v2;
- #2284 and #2285;
- #668 (#2295, #2296, #2298), or the Q2 cl.6 interim;
- Phase 10's rails applied to staged content;
- Data Tools separating prepare from decide (F7);
- a Q2 cl.5(a) agreement naming operator access and its ceiling, coaching sessions, break-glass, where Asym staff access from, and staff confidentiality.

## Delete, and do not build

**Delete from the proposal:**

- "named ministry admin … makes every decision … committing money";
- "preparation-only role";
- "ends at go-live";
- Part 4's enumerated bans, including "send anything, change consent";
- "except as aliases" as an Asym-only rule;
- "(no data access needed)";
- the incomplete "#668, #2295".

**Do not build:**

- a general tenant audit viewer;
- a content-free operator view;
- customer-managed keys;
- Asym-side two-person approval;
- SIEM export;
- mandatory notification emails;
- a consultant user type;
- partner certification;
- a forced second approver.
