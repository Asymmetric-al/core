# Q5 v2 review: users, operations, simplicity and proof

Independent read-only review of `q05-decision-as-asked.md` (Option C, eight parts, O26). Baseline develop `629cb71dc`, 2026-11-02. Not legal advice.

Labels: **verified fact** (external page fetched by this reviewer on 2026-11-02, or by r2/r4 where marked); **repo fact** (file:line); **inference**; **assumption** (names what would settle it). DL = `grill/decision-log.md`; P12 = `docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md`; Q1R = `grill/q01-switch-model/q01-adversarial-review.md`.

## Bottom line

C is the right base: the customer stays accountable while the vendor helps under customer-approved, scoped access (r2 §5, verified-primary), and it fits P12's operator plane. As asked:

- **The grant is load-bearing but unbuilt**, with one of the programme's longest dependency chains. The honest v1 baseline is self-serve plus coaching; the grant is additive.
- **Every decision rests on one possibly part-time person** who cannot be reassigned, under a name that collides with P12's Owner group and Q1's Asym-side "Switch owner".
- **Some promises are not keepable today:** ministries cannot add helpers; an uncleared specialist sees almost nothing of restricted-by-default staged content; the ministry cannot see what Asym did.
- **Part 4 restates owner rules, and the help log is manual.**

**Minimum fully functional set:** a non-authorizing Switch owner designation; helpers as members; a self-serve path that finishes without Asym; one help-access flow reusing People & access; attribution on the Switch page; an honest incident-access sentence; corrected monitor owners.

## Part-by-part verdict

| Part             | Verdict                                                                                         | Concerns   |
| ---------------- | ----------------------------------------------------------------------------------------------- | ---------- |
| 1 Ministry owns  | Keep intent. The designation grants nothing; capability holders decide; reassignable            | U1, U2     |
| 2 Helpers        | Keep. Drop "preparation-only role" and add an end date. Needs P12 invitations                   | O1, U3     |
| 3 Grant          | Keep, narrowed. Ends at a chosen date or Switch closed, not go-live. Covers backfills. Additive | U4, U5, R1 |
| 4 "Never" list   | Collapse into the ceiling plus the floor                                                        | O1, U6     |
| 5 First switches | Baseline is self-serve plus coaching, with session rules and no unproven self-serve claim       | R1, H2, H4 |
| 6 Help scope     | Keep. Matches and duplicates are decisions                                                      | U7         |
| 7 No partners    | Keep                                                                                            | none       |
| 8 M2             | Invert the owner                                                                                | T2         |
| O26              | Trim. Add approver integrity. Fix the super_admin gate                                          | U5, R2     |

---

## 1. Overengineering: material concern (moderate)

**O1. Restated rules and invented forms.** Severity low; likelihood high (two copies drift). Narrows the answer.

- **Part 4 repeats owner rules.**
  - "Send anything, change consent" is already impossible on the import path (C5, C10, C23; DL:162, :167, :180).
  - Aliases for uncleared contexts are a floor property (P12:1640, via r3 §1).
  - Commit already needs the target owner's capability (C16, DL:173).
  - Only the bundle ceiling is new. It is needed because the unwired `platform_admin` bundle carries refund and correction atoms (`packages/auth/capabilities/bundles.ts:93`, repo fact).
- **"Preparation-only role" is the wrong form.** Role names never authorize (P12:1466; r3 §2).
- **The specialist-kept help log duplicates the reason a grant request would carry.**
- **"Renewable" duplicates simply requesting again** (the ticket-lifetime model, r4 §1).

**Fix:** one ceiling sentence; helper access through People & access; a reason category per request; delete "renewable". **Keep** approval, end date, revocation and attribution, the "minimum credible version" (r4 §1, verified). **Do not build in v1:** an operator-sink viewer, a cross-tenant dashboard, Asym-side second approval, SIEM export.

## 2. UX/UI and user friction: material concern (high)

### U1. Single point of failure, conflicting with capabilities

**What could go wrong.** Part 1 says the Switch owner "makes every decision", including committing money.

- If a sole part-time admin is absent during the editing pause, Q1's abort default applies (DL:31). That is safe but wastes the pause.
- If they are absent during the tail of up to 12 months (DL:34), backfill reviews and the per-backfill re-confirmation of dispositions stall (DL:35). Meanwhile the SiteStacker licence keeps running (DL:30).
- There is no way to reassign the Switch owner.

**Conflicts.** Money commit needs finance capabilities (C16); Q1R:497 proposes a finance sign-off capability; Q1 clause 12 says "a named ministry user" (DL:40).

**Assessment.** "Small ministries often have one part-time admin" is an **assumption** (the Q2 discovery declaration and a design-partner interview settle it). Severity high; likelihood medium-high. Changes the wording.

**Fix.** The designation grants nothing; capability holders decide; any member with the decide capability can reassign it; P12 tenant recovery covers a lost sole admin (P12:1671).

### U2. Ambiguous name

**Problem.** P12 seeds an "Owner (locked, ≥1)" group (P12:1595, repo fact); Q1R:1008 used "Switch owner (Phase 30 operations or customer success)" for an Asym person; "operator grant" is internal jargon.

**Rating.** Severity medium; likelihood high for spec writers.

**Fix.** Keep the glossary term, defined as granting nothing. The UI always says "Switch owner" in full, with the helper line "Gets updates and makes sure each decision is made. Does not change anyone's access." It never says "operator", "grant", "tenant" or "super admin"; the grant is **Asym help access**.

### U3. Ministries cannot add helpers today

**Repo facts.** The Teams page is static demo data (`apps/admin/app/(app)/admin/teams/teams-data.ts:23`) whose "Invite User" button has no handler (`teams-sections.tsx:610-613`). `authz.memberships` is writable only by `service_role` (`supabase/migrations/20260226113000_authz_memberships_foundation.sql:81-90`). An interim rule lets only `platform_admin` approve in-tenant widenings (`bundles.ts:70-72`; `docs/security/capability-spine/registry.md:75-78`).

**What could go wrong.** Asym creates every helper and every ministry admin. Each helper becomes an Asym ticket, and approver integrity fails (U5).

**Rating.** Severity high; likelihood certain unless P12 People & access and a tenant approver grant ship first.

**Fix.** Make both a prerequisite. Helper access ends at Switch closed by default.

### U4. Unspecified approval flow

Severity medium; likelihood high. Narrows the answer.

**Fix: the flow.**

- **Surface.** Reuse P12's Access requests lane (P12:623-631) and in-product item "Review in People & access" (P12:705-706), plus a status card on the Switch page. No second request surface.
- **Email.** The ratified optional email needs the tenant's own Resend connection Ready (`CONTEXT.md:3670-3683`, repo fact), which a preparing tenant may lack (inference). Email is best-effort; the specialist also tells the ministry directly.
- **Clicks after sign-in.** Approve: open item, pick end date, approve. End: "End Asym access", confirm.
- **Card copy.** Who ("Jane Doe · Asym") and why; what Jane sees ("the people and gifts in your import files, and possible matches already in Asym; protected missionary records stay hidden"); what she cannot do (import into live records, sign or approve, send, open or download files); end date with time zone; how to end.
- **End date.** 7, 14 or 30 days (Google offers 5, 15 or 30; verified fact, Workspace Access Approvals page), ending 11:59 pm in the tenant's giving time zone, the Switch Boundary's zone (DL:31), shown with the zone name. Test daylight-saving changes.
- **Approver.** A member who can manage access, not "a ministry admin"; one suffices (P12:1470).
- **Mobile.** Reflow at 320 CSS px (WCAG 2.2 SC 1.4.10, AA; verified fact, w3.org).
- **Pending requests.** Expire after 7 days, not r4's 72 hours, because part-time admins may check weekly (**assumption**).

**Fix: renewal fatigue.** "Ends at go-live" leaves backfills unassisted, yet recurring schedules are where help matters most (r4 §6, Neon, verified-vendor-doc); monthly renewals would mean 12+ approvals. Instead the grant covers backfill preparation, ends at the chosen date or Switch closed, and the specialist re-requests when needed. Expect 2–5 requests per assisted switch (**assumption**; the design-partner log measures it).

### U5. Approver integrity

**Problem.** Lockbox's guarantee rests on the vendor being unable to change who approves (r4 §1, verified). Here Asym creates memberships (U3), approves widenings through `platform_admin`, and receives single-admin recertification ("a platform/delegated external reviewer when the pool is 1", P12:1661, repo fact). Asym could create or approve its own approver.

**Rating.** Severity high. Misuse is unlikely, but the gap is certain until fixed.

**Fix.** No Asym-side path creates, promotes or approves a member able to approve help access while a Switch is open, other than P12 tenant recovery. Approval never degrades to a platform reviewer.

### U6. What the specialist can see

**Problem.** Q2 clause 5(e) makes the whole file restricted by default (DL:59), so an uncleared specialist sees nothing of staged rows until a cleared ministry user narrows or classifies them (r3 §4, inference from ratified text). Fund-name and memo cells can name restricted workers (r4 finding 5). Help shrinks to headers, counts and validation and reconciliation summaries.

**Rating.** Severity medium-high; likelihood high. Narrows the answer.

**Fix.** Put the narrowing step on the Switch checklist (owner text: D11/F7); the approval card says what is visible.

### U7. The handoff from preparing to deciding is invisible

**Problem.** Prepared plans look the same as the decider's own. Match and duplicate dispositions form part of the accepted plan (roadmap `:4347` via r3 part 6; C2; Q4 3(d) "waits for a staff decision", DL:121), so the ministry may rubber-stamp Asym's merges.

**Rating.** Severity medium.

**Fix.** Every mapping, plan and backfill plan shows "Prepared by {name} · Asym" (or "· helper") and the date; the Switch page lists what waits on the ministry; match and duplicate decisions need the decide capability.

### Other users

Finance staff: U1. **Missionaries and donors: no material concern** (checked: no send or consent capability; restricted workers aliased or hidden; their views unchanged; imports fire nothing, C5/C6/C23; cross-border disclosure is Q2 agreement territory, r4 §3). Accessibility: AC11.

## 3. Operational burden: material concern

### P1. Nobody named as specialist

**Problem.** With few staff, the specialist is likely the founder or an engineer (**assumption**). Engineers hold database access, and "fixing it in SQL" at go-live would break Part 3 and Q3's developer-help signal (DL:92).

**Rating.** Severity high; likelihood medium.

**Fix.** Specialists use product tools only. Any developer repair or incident access on a Switch tenant is logged as developer help, disclosed, and triggers Q3's monitor.

### P2. Unquantified effort

**Vendor anchors** (r2, verified-vendor-doc): Virtuous customer testing 8–10 h; DonorPerfect a 1-hour mapping call then about two weeks; Neon 8–12 weeks; Givebutter 1–2 days of active import. Asym adds censuses, practice runs, two-level reconciliation and up to 12 backfills.

**Assumption.** 20–40 specialist hours per assisted SiteStacker switch (more on the template path) plus 1–2 h per backfill, so one half-time specialist carries about 3–5 concurrent assisted switches. Timing the design partner settles it.

### P3. Check-ins and scheduling

**Problem.** M2 and Q1's tail monitor (Q1R:1008) need someone to ask; the pause spans Pacific to Newfoundland time. **Rating.** Low. **Fix.** Check-in dates fixed at go/no-go go on the relationship owner's calendar; the product reminds the Switch owner; schedule the pause when coaching is available.

### P4. Help requests by email

**Problem.** Screenshots and CSVs sent to Asym breach Q2 clause 4 custody (DL:58).

**Rating.** Severity medium; likelihood high.

**Fix.**

- A pre-filled "Contact Asym about this step" link warns: "don't attach files or donor details".
- Person data that still arrives goes through clause 4's quarantine and incident process.
- Tracker and session notes hold no donor data (Quebec s.18.3, r4 §3; F11).

## 4. Observability and auditability: material concern

### A1. The ministry cannot see what Asym did

**Repo facts.** Mission Control says "Audit logs and security scans are not available from this page." (`apps/admin/app/(app)/admin/page-client.tsx:146`); `audit_logs` has no principal type (r3 §7); #2281's sink has no tenant policies (r3 §1); workflows record the nil actor (`packages/api/src/workflows/events.ts:18-22`, `:77-91`).

**Rating.** Severity medium-high.

**Fix.** Build a Switch activity list from Phase 30 run records, which already name actor, delegation and capabilities (ADR-0173 cl. 30, via r1 §6). Add the grant lifecycle and the dates sessions were opened. Do not build a general audit viewer. This needs principal kind and grant id on Phase 30 records, plus the envelope actor (#669 OQ7, #2311).

### A2. What Asym sees without data access

Grant requests, approvals, ends and reasons sit on the operator plane (inference). They feed the help log and Q3's monitor with no tenant read. Switch status relies on check-ins in v1. A content-free status view waits for the capacity monitor.

## 5. Scalability and performance: material concern (capacity, not compute)

**Compute: no concern.** Checked: the resolver checks the grant on each request, and deferred work re-proves it per chunk (P12:1587).

**Capacity: the self-serve proof is circular.**

- Part 5 makes switches self-serve "once Supported".
- But Supported is earned on the assisted design-partner switch (DL:52).
- Template switches "will often need a helper" (ADR-0003).

**Rating.** Severity medium-high; likelihood high.

**Fix.** Make no self-serve claim until a switch on that profile goes live with coaching only. Thresholds are in the monitors.

## 6. Migration, rollout and upgrade: material concern

### R1. The grant may not exist in time

**Evidence** (r3 §1, GitHub read 2026-11-02; repo fact): #2281 has four blockers, #668 fourteen, #2311 eight; `PlatformOperatorPrincipal` is type-only (`packages/api/src/principal/types.ts:46-50`).

**Conflict.** #2281's defaults contradict Part 3: Asym issues grants by SQL, the operator chooses the tenant, expiry follows the JWT, and the sink is invisible.

**Rating.** Severity high; likelihood high.

**Fix.** Self-serve plus coaching is the baseline; O26 is ratified before #2281 is Ready; Data Tools shows no help-access UI until the operator plane qualifies.

### R2. Mis-sequenced super_admin gate

**Problem.** `is_super_admin()` RLS gives standing cross-tenant reads (r1 §1). Access therefore exists the moment real data lands, so "before any Asym access" cannot be verified.

**Rating.** Severity high.

**Fix.** Before the first representative export, the Q2 clause 6 read-back shows #668's data-plane removal complete (#2295, #2296, #2298) or zero super_admin accounts. `/admin/eve` relies on super_admin (r1 §5) and needs another path.

### R3. Coupling

F4 must keep rehearsal inside the ministry's tenant (DL:60); F7 owns prepare and decide capabilities and the "waiting on" list; F11 covers session notes.

## 7. Testability, traceability and proof: material concern

### T1. Untestable as written

"Makes every decision", "the ministry can see", "ends at go-live or sooner after a period", "renewable", "except as aliases" and "an Asym contact checking in". The ACs below replace them.

### T2. Inconsistent terms

M2 is self-monitoring. Its owner, "Switch operator (F18) with the ministry admin" (`q04-adversarial-review.md:414`), is the party being monitored.

| Term                  | Used at                                        | Meaning            | Fix                                                                    |
| --------------------- | ---------------------------------------------- | ------------------ | ---------------------------------------------------------------------- |
| Switch owner          | Q5 Part 1                                      | Ministry designate | Keep; grants nothing                                                   |
| Switch owner          | Q1R:572, :1008                                 | Asym operations    | Use "Asym relationship owner"                                          |
| switch operator       | DL:92, DL:258, q04:414, Q1R:1245, :1481, :1567 | Unclear (Asym)     | Retire; use "Asym specialist" (holding access) or "relationship owner" |
| ministry admin        | DL:53; Q5 Parts 1, 3                           | Contact; approver  | Keep the Q2 meaning only; approver = "member who can manage access"    |
| named ministry user   | DL:40                                          | Any member         | Keep (the capability holder)                                           |
| Operator Tenant Grant | `CONTEXT.md:2846`                              | Plane term         | Internal only; UI says "Asym help access"                              |

## 8. Other development hazards: material concern

### H1. Break-glass honesty

**Problem.** Engineers with service-role or database access exist outside any grant (r4 finding 2; r1 §1). Copy saying "Asym can only see your data when you approve" would be false.

**Rating.** Severity high; likelihood high.

**Fix.** Use the sentence in (b) §5.

### H2. Guided sessions are an unaudited view of live data

**Problem.** Screen sharing shows restricted identities; remote control amounts to a borrowed login (inference); recordings and AI notetakers copy data out; Q2's session rules cover only NOW material (DL:58; r3 §6).

**Rating.** Severity medium-high; likelihood high, because sessions are the baseline.

**Fix.** Session rules plus agreement coverage.

### H3. "Data accuracy is the ministry's responsibility" is a contract term, not product text

**Problem.** It is unfair when Asym prepared the mapping or Asym's import mis-executes a reviewed plan. Vendors keep their own remedy obligation (Bloomerang §2.2, r2, verified-primary).

**Rating.** Severity medium.

**Fix.** The ministry answers for its source data and decisions; Asym for imports matching the reviewed plan. Counsel words the agreement.

### H4. Design-partner dependency and service promises

An assisted pilot can mask self-serve gaps (§5); Q3 "promises no migration service" (DL:94). Severity medium. **Fix.** Copy says "Asym can help, with your permission", never "Asym migrates".

---

## (a) Disposition

**Accept C with required amendments.** The amendments narrow and reword C; they do not invalidate it. Parts 1, 3, 4, 5 and 8 cannot be recorded as worded.

## (b) Corrected decision text

**Q5 — Who runs a switch. C: the ministry owns its switch; Asym may help hands-on with permission.**

1. **The ministry decides.**
   - Each Switch names a **Switch owner**: a ministry member, by default its creator.
   - The Switch owner receives the Switch's notices and is accountable for completion. The designation grants nothing.
   - Members holding the matching capability make every decision: exclusions, dispositions, attestations, matches and duplicates, go/no-go, commits, sign-off, tail closure and decommission. That capability is either the Phase 30 decide capability or the target owner's (C16).
   - Any member with the decide capability can reassign the Switch owner; the change is recorded.
   - Asym never decides and never holds or sets the designation.
   - If decisions are delayed, Q1's defaults apply.
2. **Helpers are members.** Staff, volunteers and consultants get Data Tools preparation access through People & access. It ends at Switch closed unless the ministry chooses an earlier date. Clearance stays a Phase 10 ministry choice.
3. **Works without Asym access.** A ministry member can complete every step with no Asym action.
   - Asym may coach in sessions where the ministry shares its own screen.
   - Sessions allow no recording, transcription or AI notetaker, and no remote control.
   - No files are exchanged outside the product, and protected missionary records are not shown.
   - Help requests carry no attachments or donor details.
4. **Asym help access** (Phase 12 Operator Tenant Grant, switch-preparation purpose).
   - **Request.** A named Asym specialist requests it for one Switch, with a reason category. An unapproved request expires after 7 days.
   - **Approval.** One member who can manage access approves it in People & access.
   - **Asym limits.** No Asym path approves it, or creates or promotes such a member while a Switch is open, other than Phase 12 tenant recovery.
   - **End.** Access ends at the earliest of:
     - 11:59 pm on the chosen date (7, 14 or 30 days), in the tenant's giving time zone, shown with the zone name;
     - Switch closed;
     - any such member ending it.

     The specialist requests again when needed.

   - **Scope.** Preparation only: mapping, practice runs, backfill plans and issue notes. It never carries a decide, commit, attest, send, consent, file-preview or download, clearance or permission capability. Restricted content appears as it would to an uncleared member.
   - **When access ends.** Ending it pauses the runs the specialist started.
   - **Visibility.** The Switch page shows the access history, with each action labelled "{name} · Asym".
5. **Honest boundary.**
   - Asym staff work on Switch data only through approved help access or a session the ministry shares.
   - The agreement describes separate, logged access for security incidents and legal requests. No copy says Asym cannot access data.
   - Specialists never use database or service-role access on a Switch. Any developer repair is logged and disclosed.
   - The ministry answers for its source data and decisions; Asym answers for imports matching the reviewed plan. Counsel sets the contract terms.
6. **First switches.**
   - The design partner's switch is planned on clause 3, with clause 4 added if it is built.
   - No profile is called self-serve until a switch on it goes live with coaching only.
   - Help is logged by category (grant reasons plus Asym's tracker, with no donor data) and feeds Q3's monitor.
   - Duplicate cleanup and recurring-donor contact stay with the ministry.
   - Pricing is a commercial term. There is no partner programme in v1.
7. **Monitors and terms.**
   - Q4 M2 and Q3's monitor are owned by "Asym relationship owner with the Switch owner"; M2's response is "contact the Switch owner".
   - "Switch operator" is retired.

**O26 (Phase 12):** the purpose; the capability ceiling; tenant approval never routed to a platform reviewer; no Asym-side member creation in Switch tenants; 7-day pending expiry; the end conditions; deferred work bound to the grant; principal kind and grant id on Phase 30 records.

**Before the first real export:** the Q2 clause 6 read-back shows #668 complete (#2295, #2296, #2298) or zero super_admin accounts; #2284 and #2285; P12 tenant invitations and an approver grant; agreement terms for help access, sessions and incident access. Envelope v2 and #2311 come before any specialist-started run. F7 settles prepare and decide capabilities.

## (c) Acceptance criteria

1. **Ceiling.** An operator context with approved help access is denied, with no write, on target commit, attestation, disposition, exclusion, go/no-go, sign-off, match or duplicate decision, send, consent change, file preview or download, clearance and `permissions.*`.
2. **Scope.** The same context can create a mapping, start a practice run and draft a backfill plan on its Switch. It is denied on another Switch, another tenant and non-Data-Tools routes.
3. **Approver integrity.** No operator context, `platform_admin`, service-role product path or recertification fallback can create, approve or extend help access, or create or promote an eligible approver while a Switch is open. A single eligible member approves alone.
4. **Expiry and end.**
   - A request still pending after 7 days becomes Expired.
   - Access ends at 11:59 pm in the giving time zone on the chosen date (with a daylight-saving test), at Switch closed, or on "End Asym access".
   - After the end, every specialist request is denied within P12's revocation bound.
5. **In-flight runs.** When access ends, a specialist-started run pauses at its next chunk with "Paused: Asym help access ended". A member with prepare capability can resume or discard it. No target write occurs.
6. **Attribution.**
   - Every record a specialist creates shows "{name} · Asym" and stores principal kind and grant id.
   - The Switch page lists the request, approver, end reason and session dates.
   - Attribution cannot be forged in either direction.
7. **Designation.**
   - A Switch requires a Switch owner.
   - A Switch owner without commit capability cannot commit.
   - A member with decide capability can reassign the role, and the change is recorded.
   - Asym cannot hold or set it.
8. **Self-serve.** With help access disabled, a ministry member completes the full Q1 sequence on the template profile end to end, with no Asym action.
9. **Helpers.** Helper access ends on its end date. An uncleared helper sees only aliases for classified Parties.
10. **Restricted by default.** While a file is restricted by default, the specialist sees only headers, counts, and validation and reconciliation summaries.
11. **Accessibility.** The approval card and access panel have zero serious or critical axe violations, full keyboard operation, reflow at 320 CSS px, live-region results and text (not colour-only) status. Emails carry no person or gift data and include a plain-text part.
12. **Copy.** No UI string or email says "operator", "grant", "tenant" or "super admin", or claims Asym can never access data. The card states what is visible, what is barred, the end date with time zone, and how to end access.
13. **Help log.** Every request has one reason category (mapping, validation, practice run, reconciliation, backfill, other). Q3's report is produced without tenant data access.
14. **Pre-real-data gate.** Before the first representative export:
    - the Q2 clause 6 read-back shows no data-plane `is_super_admin()` policy or zero super_admin accounts;
    - counsel-reviewed clauses cover help access, sessions and incident access.

## (d) Monitor items

| Signal                                                                        | Threshold                                                                                                                             | Owner                                    | Response                                                                                             |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Hands-on hours per assisted switch; concurrent assisted switches              | Hours not falling by the third switch on a profile; more than 4 per half-time specialist (assumption); help wait over 5 business days | Founder with the relationship owner      | Fix the top help category in product; pause new assisted switches; price help                        |
| Help-access friction (expired requests, time to approve, requests per switch) | Any expired request on a live switch; median over 2 business days; more than 6 per switch                                             | Phase 30 spec owner                      | Adjust end-date options, or make the step self-serve                                                 |
| Developer repair or incident access on a Switch tenant                        | More than zero                                                                                                                        | Founder with the security owner          | Disclose to the ministry, find the root cause, apply Q3's response                                   |
| Coaching-only live switches per Supported profile                             | None after 3 switches                                                                                                                 | Phase 30 spec owner                      | No self-serve claim; improve guidance                                                                |
| Work waiting on the ministry                                                  | Backfill more than cadence + 7 days overdue (Q1R:1008), or a privacy item open more than 10 business days (Q1R:1245)                  | Relationship owner with the Switch owner | Check in; suggest reassigning the Switch owner; extend the tail only as a recorded ministry decision |
| Q4 M2: decommission item (i) unattested                                       | As in Q4                                                                                                                              | Relationship owner with the Switch owner | Contact the Switch owner; Asym never issues                                                          |
