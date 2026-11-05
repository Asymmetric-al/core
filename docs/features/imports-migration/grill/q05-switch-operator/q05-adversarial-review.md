# Q5 adversarial review — who runs a switch

Decision under review: Option C as asked, with eight parts and proposed O26 (`q05-decision-as-asked.md`). The founder chose it on 2026-11-02 under the standing instruction "not over-engineered, fully functional".

Evidence:

- **Research:** `research/q05-r1` (repo access model), `q05-r2` (vendor practice), `q05-r3` (repo verification) and `q05-r4` (external verification).
- **Independent reviews:** `review/q05-v1-domain-security-review.md` and `review/q05-v2-ux-ops-review.md`.
- **Lead spot-checks (2026-11-02):**
  - Phase 12 `:480-487` (Operator Tenant Grant contains permissions and passes the same floor; support, impersonation, `super_admin` and service role "create no shortcut");
  - Phase 12 `:1552-1555`, `:1861` (principal classes; one tenant source per request);
  - root `CONTEXT.md:2840-2850`;
  - `packages/auth/permissions.ts:36-41` ("All staff subroles have full Mission Control admin access in MVP");
  - `packages/auth/capabilities/bundles.ts:92-93` (`tenant_admin` → `permissions_proposer`; `platform_admin` → `contribution_admin`, `permissions_approver`);
  - `supabase/migrations/20260226113000_authz_memberships_foundation.sql:143-156` (`is_super_admin()` reads `profiles.role`);
  - `apps/admin/app/(app)/admin/teams/teams-data.ts:23` (static team data);
  - #2281 (open: "super_admin via the capability path");
  - decision-log Q2 clauses 6 and 9, and the Q3 and Q4 monitor owners.

Labels: **verified**, **repo**, **inference**, **assumption**, **judgment**.

## 1. Category review

### 1.1 Problem validity, necessity and alternatives — material concern: yes (narrows the answer)

**The problem is real.** Q1–Q4 put every decision on the ministry, but no one was named to do the work. The market norm is vendor-assisted conversion: Bloomerang, Virtuous, DonorPerfect, Neon and Pushpay all do it, and DonorDock migrates free in under two weeks on average (q05-r2, q05-r4; verified-vendor-doc). Pure self-serve is confined to low-cost tools. No published data shows how often self-serve migrations succeed (q05-r2 §2).

**Strongest alternative: B,** Asym runs the migration as a service. It is the market norm. C still wins:

- Asym has no operator plane. The ratified one is unbuilt, and its draft design (#2281) contradicts a safe one.
- Q2 classifies the whole export as restricted by default.
- Q1–Q4 already require ministry attestations and sign-offs.
- A small team cannot staff B.

C keeps B's benefit (hands-on help) where it is safe. **The concern** is that C as asked made Asym hands-on help the plan for the first switch, even though it depends on an unbuilt plane with roughly 10 blocking issues (q05-r3).

| Concern                                                 | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **V1. The switch depends on access that may not exist** | **What goes wrong:** the design partner's switch stalls waiting for the operator plane. **Severity:** high. **Likelihood:** high. **Evidence:** #2281, #2282, #669 and #2311 are open, with 4–14 blockers each (q05-v2 §6; repo). **Effect:** changes the answer. The baseline must be that the ministry can complete everything with coaching only; the grant is an add-on. **Spec language:** clauses 2 and 9 of §3.                                                                                                                                    |
| **V2. Part 1 mixes up accountability and authority**    | **What goes wrong:** one "Switch owner" makes money decisions without finance permission, which conflicts with C16 and Q1 clause 12 ("a named ministry user"). "Role names never authorize" (Phase 12 `:1552`) forbids a role called Switch owner, and "owner" collides with Phase 12's Owner group. **Severity:** high. **Likelihood:** certain if recorded as written. **Effect:** changes the answer. A **Switch lead** designation grants nothing; each decision is made by a member holding that decision's capability. **Spec language:** clause 1. |

### 1.2 Brittleness — material concern: yes

| Concern                                                       | Detail                                                                                                                                                                                                                                        |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BR1. "Ends at go-live" vs the 12-month tail**               | Tail backfills fall after go-live, so Asym help could never cover them, or would need one renewal a month. **Severity:** medium. **Fix:** grants run for 7, 14 or 30 days, end at Switch closed at the latest, and renewal is a new approval. |
| **BR2. Jobs tied to the login session**                       | #2311's draft ends specialist-started jobs when the session ends, so long practice runs die. **Severity:** medium. **Fix:** jobs re-check the grant per chunk (O26).                                                                          |
| **BR3. "Except as aliases" works only for classified people** | Raw and staged cells have no aliases yet, Phase 10 is unbuilt, and fund names, memos, notes and even headers can name workers (q05-r3 §4; q05-r4). **Severity:** high. **Fix:** clause 4's single floor for everyone.                         |

### 1.3 Technical debt — material concern: yes

**TD1. Live shortcuts.**

- `super_admin` reads across tenants in database security policies, based on a role string (`is_super_admin()` reads `profiles.role`; used in 11 migrations; repo).
- Every staff member is a full Mission Control admin (`permissions.ts:38`).
- Permission changes can only be proposed by `tenant_admin` and approved by `platform_admin`, an Asym-side role (`bundles.ts:92-93`).
- The Teams page is demo data.

Each one contradicts the decision's assumptions. **Severity:** critical for real data. **Fix:** the prerequisite chain in §4, and Q2 clause 6's read-back amended to name the `super_admin` escape.

**TD2. A contrary draft design (#2281).** Its draft has:

- the operator picking the tenant;
- a grant lasting a session, with no real expiry;
- standing access for every super_admin;
- the full `platform_admin` bundle, including refunds (`bundles.ts:93`);
- a log the ministry cannot read.

If it merges first, Phase 30 inherits it (q05-r3 §1; repo). **Severity:** high. **Fix:** O26 must be agreed before #2281 merges. Recorded as a time-sensitive item, like §6 of the decision log.

### 1.4 Edge cases — material concern: yes

| #   | Case                                               | Outcome under the corrected decision                                                                                                                                                                                          |
| --- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | One-person ministry                                | One member may hold every capability; no forced two-person rule (ADR-0173 rejects a "needless two-person approval ritual"; repo). Asym can never decide, so vendor and customer stay separated.                               |
| E2  | Switch lead leaves mid-switch                      | Any member holding the Switch decision capability reassigns the lead. Without a lead, go/no-go and sign-offs are blocked.                                                                                                     |
| E3  | Grant expires or is revoked during a practice run  | The job pauses at its next chunk. Practice runs write nothing to target owners (Q1), so nothing needs undoing.                                                                                                                |
| E4  | A specialist helps two ministries                  | Separate grants, one tenant per request (Phase 12 `:1555`), each job pinned to one tenant and one grant.                                                                                                                      |
| E5  | A consultant helps several ministries              | Ordinary separate memberships, each with its own scoped, expiring capabilities.                                                                                                                                               |
| E6  | Restricted names in free text                      | Free-text columns stay restricted until a cleared ministry member confirms they name no restricted person.                                                                                                                    |
| E7  | Coaching by screen share                           | Shows live data with no log, possibly recorded or captured by AI notetakers. Rules: ministry's screen only, no recording, transcription, AI notes, remote control or file exchange, and the ministry uses the uncleared view. |
| E8  | Asym staff could create or elevate ministry admins | Today only service-role paths write memberships, and the Asym-side role approves. **Approver integrity:** no Asym path may create, elevate or replace an approver, or approve its own grant.                                  |
| E9  | Incident or legal access                           | A separate break-glass path: logged, disclosed and shown afterwards (q05-r4: Microsoft Lockbox excludes legal requests; Google auto-approves during outages).                                                                 |
| E10 | Unanswered request                                 | Expires after 7 days.                                                                                                                                                                                                         |

**Severity:** E7 and E8 critical; E3 and E6 high; others medium.

### 1.5 Footguns — material concern: yes

| Concern                         | Detail                                                                                                                                                                                                                                                          |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **F1. Rubber-stamping**         | A prepared plan looks identical to one the decider made. **Fix:** every specialist action and proposal shows "{name} · Asym" on the Switch, and the decider sees what was prepared for them. **Severity:** medium.                                              |
| **F2. Asym-side files**         | A ministry emails a file to the specialist to upload, which puts it outside custody. **Fix:** source files enter only through a ministry member's upload; specialists cannot upload, preview or download files. **Severity:** high.                             |
| **F3. Helpers wider than Asym** | Today a helper member is a full admin with no end date. **Fix:** outside helpers are added only once scoped, expiring capabilities exist (O27); preparation capabilities end at Switch closed by default; the floor applies to helpers too. **Severity:** high. |
| **F4. Overstated product copy** | "Asym can only see your data when you approve" is false while break-glass and developer repair exist. **Fix:** clause 6's honest-boundary wording. **Severity:** medium (legal and trust).                                                                      |

### 1.6 Tenant safety — material concern: yes (prerequisite)

Phase 12 requires a single tenant source per request, and an Operator Tenant Grant pinned to one tenant (`:1555`; repo). The live risk is `super_admin` RLS, which gives standing cross-tenant access the moment real data lands (TD1). **Severity:** critical. **Likelihood:** certain until #668 lands. **Fix:**

- Q2 clause 6 amendment: before the first real export, a live read-back shows no `is_super_admin()` or role-string escape on person, money, Phase 29 or Phase 30 tables, or nobody holds `super_admin` in that environment.
- Jobs carry exactly one tenant and one grant.

**Spec language:** clause 6; AC11, AC12.

### 1.7 Database, RLS and authorization safety — material concern: yes

**DB1. What grant storage and audit must guarantee.**

- **Grants:** tenant-scoped, append-only lifecycle events (requested, approved, declined, expired, active, revoked, ended). Approval rows are written only by an eligible tenant member, with the actor derived server-side.
- **Audit and run records:** operator actions carry a server-derived principal type and grant ID. Today `audit_logs` lets staff and `super_admin` insert rows under any user ID (q05-r3 §7; repo); that must be closed.
- **Checks:** USING and WITH CHECK both pin the tenant. No update can widen a grant's scope or extend its expiry; renewal is a new grant. The operator's effective permissions are the intersection of the grant's preparation allow-list and the Phase 12 floor.

**Severity:** critical. **Effect:** a requirement on Phase 12 (O26). **Spec language:** O26; AC4, AC5, AC9.

### 1.8 Overengineering — material concern: yes

**Delete:**

- Part 4's restatement that imports never send or change consent. That is already guaranteed (C5, C6, C10, C23). Keep it only as part of the grant's capability ceiling.
- Part 5's promise of self-serve for later switches; unproven.
- A product-built help log. Use Asym's content-free tracker instead.
- A cross-tenant Switch status screen. Use content-free operational telemetry plus in-product reminders to the Switch lead instead.

**Do not build:** customer-held keys, separate approver roles, 4–8-hour windows, or security-tool log export. Each is overkill at this scale (q05-r4).

**Keep:** one designation, one capability-based decision rule, one floor, one grant with a fixed lifecycle, honest boundary text, and the prerequisites.

### 1.9 UX/UI and user friction — material concern: yes

**Plain language.** Ministries see **Switch lead** and **Asym help access**, not "Operator Tenant Grant".

**Approval flow:**

- The request arrives by email and in-app, showing the named specialist, reason, scope and duration choices.
- Approving takes one action by an eligible member and works on a phone.
- Revocation is one action from the Switch page.
- The expiry time is shown in the ministry's giving time zone.

**Visibility.** "{name} · Asym" appears on every action and proposal.

**Coaching.** The ministry drives. This works for low-tech teams but is slower; monitor M-Q5-3 tracks stalls.

**Renewal fatigue.** Grants can last up to 30 days and are tied to Switch closed, which limits renewals across the tail.

**Accessibility.** Keyboard and screen-reader operable, readable at 320 CSS px.

**Missionaries and donors:** no effect. **Severity:** medium overall.

### 1.10 Source of truth, ownership and invariants — material concern: yes (must be stated)

**Owners:**

| Owner         | What it owns                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------- |
| Phase 12      | Grants, approvals, memberships, capabilities and audit                                        |
| Phase 10      | Clearance and aliases                                                                         |
| Phase 29      | Raw bytes and preview or download permissions                                                 |
| Phase 30      | Switch lead designation, decision records, the narrowing record, run evidence and attribution |
| Target owners | Commit authority (C16)                                                                        |

**Invariants:**

- **I1.** No decision record has a platform-operator actor.
- **I2.** Every operator action references an active grant whose tenant equals the request tenant.
- **I3.** No grant is approved by a platform principal or by a member created or elevated by one.
- **I4.** An uncleared viewer never sees un-narrowed staged content or a restricted identity.
- **I5.** Grants never extend in place.

I1–I3 and I5 are enforced in the database and at the single resolver; I4 at the Phase 10 floor and the Data Tools projection.

### 1.11 Hidden coupling — material concern: yes

Clause 5 depends on Phase 12 (#2281, #2282, O26, O27), jobs (#669, #2311), RLS slices (#668, #2295, #2296, #2298, #2284, #2285), Phase 10 and F7. The coupling is made explicit, and the baseline (clause 2) does not depend on any of it. **Severity:** medium.

### 1.12 Failure modes — material concern: yes

| Mode                                                 | Safe?                                        | Fix                |
| ---------------------------------------------------- | -------------------------------------------- | ------------------ |
| Grant ends mid-job                                   | Yes, if jobs check per chunk                 | O26                |
| Approval email lost                                  | Yes; the request expires after 7 days        | In-app request too |
| Revocation while the specialist is editing a mapping | Yes; the draft stays, attributed             | Attribution        |
| Operator plane never built                           | Yes; coaching baseline                       | Clause 2           |
| Audit write fails after an operator action           | Must fail closed (action and audit together) | O26                |

**Severity:** medium.

### 1.13 Lifecycle, temporal, concurrency and idempotency — material concern: yes

**Grant states:** requested → approved | declined | expired (7 days) → active → ended (duration, Switch closed) | revoked. All are terminal except active. No transition reopens a grant.

**Concurrency and idempotency:**

- **Revocation racing a job chunk:** the chunk re-checks the grant inside its own transaction.
- **Duplicate approval clicks:** idempotent on the request ID.

Expiry is computed server-side and displayed in the giving time zone. **Spec language:** O26; AC4, AC7.

### 1.14 Data integrity risks — material concern: yes (low)

A specialist's prepared match decisions could be committed unreviewed. They are attributed, and only a capability holder commits. Specialists never enter level-2 reconciliation controls or census answers, which keeps the reconciliation independent (q05-v1). **Severity:** medium.

### 1.15 Security and privacy — material concern: yes

| Concern                     | Detail                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1. Least privilege         | The grant's preparation allow-list is intersected with the floor. MFA-protected Asym identities.                                                                                                                                                                                                                                                                                  |
| S2. Restricted missionaries | Need-to-know, as at AIM Canada, WorldVenture and IMB (q05-r4 §5; secondary). One floor for helpers and Asym alike.                                                                                                                                                                                                                                                                |
| S3. Agreement               | GDPR Art. 28, Colorado §6-1-1305 and Quebec s.18.3 require personnel confidentiality and processor terms (q05-r4 §3; verified-primary for GDPR; secondary for some state texts). One standard agreement for all ministries names: Asym help access, coaching sessions, telemetry, break-glass, no retention after the engagement, and no tenant content in Asym's internal tools. |
| S4. Break-glass honesty     | Clause 6.                                                                                                                                                                                                                                                                                                                                                                         |

**Severity:** high.

### 1.16 Scalability and performance — material concern: yes (capacity, not compute)

**The bottleneck is specialist hours, not the database.** The reviewer estimates 20–40 specialist hours per switch (q05-v2; assumption). At 30 hours, one full-time specialist could handle about 4–5 switches a month (inference). The grant itself is negligible load.

**Fix:** monitor M-Q5-1, plus the rule that the product, not more specialists, absorbs repeated help reasons.

### 1.17 Operational burden — material concern: yes

**Asym side:** coaching sessions, grant requests, check-ins, and a content-free tracker. No direct database repair, ever; any developer repair goes through break-glass and is disclosed.

**Ministry side:** approving grants, narrowing classification, and holding decisions.

**Severity:** medium. **Fix:** clauses 2, 5, 6 and 8, plus monitors.

### 1.18 Observability and auditability — material concern: yes

**Gap today:** a ministry cannot see any audit log, and audit rows carry no principal type (q05-r3 §7; repo).

**Required:**

- A ministry-visible Switch history: grant lifecycle and every operator action, attributed.
- Asym monitors only through content-free telemetry (stage, dates, counts, job health), disclosed.
- Security audit (Phase 12) and business history (the Switch) are distinct; technical logs carry no personal data.

**Severity:** high.

### 1.19 Dependency and integration risks — material concern: yes (low)

**Third-party tools:** coaching tools (video calls, notetakers) are outside Asym; clause 2 forbids recording and AI notes. No third-party operator-access product is needed. **Severity:** low.

### 1.20 Migration, rollout and upgrade — material concern: yes

**Order:**

1. O26 and O27 agreed, and #2281 aligned before it merges.
2. #2284 and #2285, then the #668 slices (#2295, #2296, #2298).
3. #669 and #2311 (jobs carry actor and grant).
4. #2282.
5. Phase 10 floor covers staged content.
6. Read-back verification in the Approved environment.
7. Clause 5 enabled behind a flag per environment.

The baseline (clause 2) ships without any of these. **Kill switch:** disable grant requests per environment, which revokes active grants. **Rollback:** revocation is safe because grants never write target data. **Severity:** high until sequenced.

### 1.21 Testability, traceability and proof — material concern: yes

**Acceptance criteria:** AC1–AC14 in §3.

**Terminology:**

- Retire "switch operator" in the Q3 monitor (decision log `:92`) and in Q4 M2 (`q04-adversarial-review.md:414`).
- Use **Switch lead** (ministry) and **relationship owner** (Asym, Q2 clause 9).
- Q1 clause 12's "named ministry user" stays: a capability holder.
- Add glossary terms Switch lead and Asym help access.

### 1.22 Other development hazards — material concern: yes

| Concern                        | Detail                                                                |
| ------------------------------ | --------------------------------------------------------------------- |
| OD1. Liability wording         | Clause 7 splits accountability; counsel drafts.                       |
| OD2. Design-partner dependency | Clause 9.                                                             |
| OD3. Marketing copy            | No "we migrate for you" or "self-serve" claims until evidence exists. |

## 2. Disposition

**Accept with required amendments.** C's core holds: the ministry decides, helpers prepare, and Asym is hands-on only under a ministry-approved grant. As asked it:

- made an unbuilt plane the first switch's plan;
- gave one role authority it cannot carry;
- left the coaching fallback unaudited;
- gave helpers wider access than Asym;
- promised an alias view that cannot exist for raw rows;
- had no approver integrity and no break-glass honesty;
- inverted the M2 owner.

## 3. Corrected decision (to record)

**Q5 — Who runs a switch.** Option C, amended.

1. ★ **The ministry decides; a Switch lead is accountable.**
   - **The lead:** each Switch names a **Switch lead**, by default the member who created it, who receives its notices and reminders. Any member holding the Switch decision capability can reassign the lead. The designation grants nothing.
   - **Who decides:** every decision is made by a ministry member who holds that decision's capability. Money commits also need the money owner's capability (C16). This covers census answers, dispositions, attestations, plan and match decisions, level-2 reconciliation controls and sign-off, commit, reversal, tail closure and decommission.
   - **No forced second person:** one person may hold every capability.
   - **Never Asym:** no Asym identity can make or hold any decision.
2. ★ **Every step works without Asym access.** A ministry can complete a whole Switch itself. Asym's default help is coaching:
   - on the ministry's own screen, which the ministry drives;
   - no recording, transcription, AI notetaker or remote control;
   - no file exchange outside the product;
   - the ministry uses the uncleared view while sharing.
3. **Helpers are ordinary members.**
   - **What they get:** Data Tools preparation capabilities granted by the ministry, ending at Switch closed by default.
   - **When outside helpers can be added:** only once the ministry can grant scoped, expiring access in Asym itself (O27).
   - **No endorsements:** Asym endorses no helper, and there is no partner programme in v1.
4. ★ **One restricted-data floor for everyone.**
   - **Default:** a real export stays restricted (Q2) until a cleared ministry member narrows it, column by column, or by declaring that the file names no restricted person.
   - **Free text:** columns such as names, memos, notes and fund names are narrowed only after that confirmation.
   - **Uncleared viewers, helpers and Asym alike:** see restricted people only by alias, and un-narrowed content not at all. They get headers, counts and validation summaries only.
   - **Uploads:** source files enter only through a ministry member's upload.
5. ★ **Asym help access** (internally, the Phase 12 Operator Tenant Grant, purpose `switch_preparation`).
   - **Request:** a named, MFA-protected Asym specialist requests it for one Switch, with a reason. An unanswered request expires after 7 days.
   - **Approval:** one ministry member who may manage access approves it. No Asym path can approve it, or create, elevate or replace that approver.
   - **Duration:** 7, 14 or 30 days, ending 11:59 pm in the ministry's giving time zone, or at Switch closed, or on revocation, whichever comes first. Renewal, including for tail backfills, is a new approval.
   - **Allowed:** mapping, practice runs, issue triage, and preparing plan and match proposals.
   - **Never:** committing, deciding, attesting, entering census answers or reconciliation controls, sending, changing consent, uploading, previewing or downloading files, exporting, or granting clearance or permissions.
   - **When it ends or is revoked:** the specialist's running jobs pause at their next chunk.
   - **Notice:** the ministry is emailed on request, approval and expiry.
   - **Attribution:** every specialist action and proposal shows "{name} · Asym" in the Switch history.
6. ★ **Honest boundary** (amends Q2 clause 6).
   - **Only route in:** hands-on help happens only through clause 5. Never `super_admin`, a shared or borrowed login, impersonation or a ministry membership. Specialists never use SQL or service-role access on tenant data.
   - **Incident and legal access:** a separate path, logged, disclosed in the agreement, and shown to the ministry afterwards unless the law forbids it. No product copy claims Asym can never access data.
   - **Before the first real export:** a live read-back must show the Approved environment has no `is_super_admin()` or role-string escape on person, money, Phase 29 or Phase 30 tables, or that nobody holds `super_admin` there.
7. **Accountability.** The ministry is accountable for its source data and decisions. Asym is accountable for committing exactly the reviewed plan, proven by level-1 reconciliation. Contract wording is drafted by counsel.
8. **Monitoring without data access.**
   - **How Asym watches:** only through content-free operational telemetry (stage, dates, counts, job health), disclosed in the agreement. The product itself reminds the Switch lead of open items and deadlines.
   - **Retire "switch operator":** Q4 M2 and the Q3 template monitor are owned by Asym's relationship owner (Q2 clause 9) together with the Switch lead.
   - **Help log:** Asym keeps a content-free tracker.
9. **First switches.**
   - **Baseline:** the design partner's switch is planned on clause 2, and uses clause 5 only after its prerequisites are verified.
   - **No promises yet:** no profile is described as "self-serve" or "no help needed" until a switch has gone live with coaching only.

**Acceptance criteria:**

| ID   | Criterion                                                                                                                                                                                                                  |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC1  | **Decisions.** Every decision action succeeds for a ministry member holding its capability. It is refused for an Asym operator, and for a member without the capability.                                                   |
| AC2  | **Switch lead.** A Switch cannot reach go/no-go without a lead. Reassignment works for a capability holder. Being lead grants no decision.                                                                                 |
| AC3  | **No-grant switch.** An end-to-end Switch test completes with zero grants.                                                                                                                                                 |
| AC4  | **Grant lifecycle.** States requested, approved, declined, expired after 7 days, active, ended and revoked hold. No grant reopens or extends in place. Expiry displays in the giving time zone.                            |
| AC5  | **Approver integrity.** No platform principal or service path can approve a grant, or create, elevate or replace an access-managing member. Attempts fail and are logged.                                                  |
| AC6  | **Grant scope.** Under an active grant, mapping, practice runs and triage succeed. Every forbidden action is refused.                                                                                                      |
| AC7  | **Revocation.** Revoking during a practice run stops it at the next chunk, records the stop and leaves target data unchanged.                                                                                              |
| AC8  | **Floor.** Uncleared viewers, helpers and operators alike, see no un-narrowed staged content and only aliases of restricted people. Free-text narrowing requires the confirmation.                                         |
| AC9  | **Attribution.** Every operator action and proposal shows "{name} · Asym" in ministry-visible Switch history. Audit rows carry a server-derived principal type and grant ID. Inserting with an arbitrary actor is refused. |
| AC10 | **Email notices.** Sent on request, approval and expiry. Approval works on a 320 CSS px screen.                                                                                                                            |
| AC11 | **One tenant per action.** An operator with grants for two tenants sees only the current tenant per request. Each job carries exactly one tenant and one grant.                                                            |
| AC12 | **Read-back check.** It runs before the first real export and fails if any listed table has a `super_admin` or role-string escape.                                                                                         |
| AC13 | **Helpers.** A helper's preparation capabilities end at Switch closed by default; access afterwards is refused.                                                                                                            |
| AC14 | **Accessibility.** Approve, decline and revoke are keyboard- and screen-reader-operable, in plain language.                                                                                                                |

## 4. Ruthless synthesis

**Resolve before recording:** founder confirmation of the ★ clauses:

- clause 1 (decision by capability; Switch lead);
- clause 2 (no-grant baseline and coaching rules);
- clause 4 (one floor);
- clause 5 (grant terms);
- clause 6 (honest boundary; amends Q2 clause 6).

**Capture in the spec:**

- Switch lead;
- the decision-capability map (detail to F7);
- the narrowing step;
- Switch history attribution;
- reminders;
- AC1–AC14;
- glossary terms Switch lead and Asym help access;
- terminology fixes ("switch operator" retired in Q3's monitor and Q4 M2).

**Owner requirements:**

| ID           | Owner              | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| O26          | Phase 12           | Operator Tenant Grant for `switch_preparation`, as in clause 5: request, 7-day pending expiry, eligible tenant approver, approver integrity, 7/14/30-day duration, ends at Switch closed or revocation, a Phase 30 preparation allow-list intersected with the floor, per-chunk job re-check, MFA, append-only lifecycle, server-derived operator principal type on every audit and run record, a tenant-visible history, and a separate disclosed break-glass path. Agreed before #2281 merges. |
| O27          | Phase 12           | Ministry-administered membership with scoped, expiring capability grants (helpers), replacing "all staff are full admins" and Asym-side approval of in-tenant widenings for these capabilities.                                                                                                                                                                                                                                                                                                  |
| Phase 10     | Phase 10           | The floor and aliases cover Phase 30 staged content and the narrowing record.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| F7           | Phase 30           | Preparation vs decision capabilities and the narrowing UX.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Q2 agreement | Phase 30 / counsel | Names Asym help access, coaching sessions, telemetry, break-glass, personnel confidentiality and no retention after the engagement.                                                                                                                                                                                                                                                                                                                                                              |

**Safeguards:**

- the read-back gate before the first real export;
- a kill switch for grant requests per environment;
- fail closed when an audit write fails;
- no tenant content in Asym internal tools.

**Order:** §1.20.

**Time-sensitive:** #2281's draft defaults contradict O26. The founder decides whether to hold or amend it; discovery takes no tracker action.

**Monitor:**

| #      | Risk                 | Signal                                     | Threshold                                                                                                          | Owner                     | Response                                                                                     |
| ------ | -------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------- | -------------------------------------------------------------------------------------------- |
| M-Q5-1 | Assisted-switch load | Specialist hours per switch (Asym tracker) | Over 40 hours on any switch, or a median over 20 (assumption; recalibrate after the design partner)                | Phase 30 spec owner       | Fix the product steps behind the top three help reasons before taking more assisted switches |
| M-Q5-2 | Grant integrity      | Operator actions and grant events          | Any operator action without an active grant, or any approval by an ineligible or Asym-created approver (must be 0) | Phase 12 owner (security) | Disable grant requests, investigate, disclose to the affected ministry                       |
| M-Q5-3 | Coaching-only stalls | Switch stage age                           | Any design-partner switch stuck more than 14 days on one step without a grant                                      | Asym relationship owner   | Prioritize that step's UX fix; offer a grant if its prerequisites are verified               |
