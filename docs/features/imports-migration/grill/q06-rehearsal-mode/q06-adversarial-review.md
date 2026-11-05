# Q6 adversarial review — rehearsal mode (Option C: practice runs plus a temporary copy)

Decision under review: Option C (`q06-decision-as-asked.md`), chosen by the founder on 2026-11-02 with "think through the edge cases". The standing standard applies: not over-engineered, fully functional, excellent UX.

Evidence:

- **Research:**
  - `research/q06-r1`: owner no-write checks, staged references, tenant lifecycle, timing, recovery.
  - `q06-r2`: vendor test loads, preview UX, sandbox data protection.
  - `q06-r3`: an inventory of every outward-effect door, the tenant model, cloning, destruction and access.
  - `q06-r4`: sandbox mechanics, wrong-environment UX, Supabase backups, regulator controls.
- **Independent reviews:** `review/q06-v1-domain-safety-review.md` and `review/q06-v2-ux-ops-review.md`.
- **Lead spot-checks (2026-11-02):**
  - `packages/api/src/stripe/tenant-client.ts:64-66`: the tenant key falls back to the platform environment key.
  - `docs/ops/environments.md:13-16`: production Stripe is live-mode, and production is "real donors, real money".
  - `packages/api/src/admin/org-settings.ts:9`: `DEFAULT_TENANT_ID = …0001` is hard-coded.
  - The CMS tenant resolver ignores `isActive` (q06-r3; repo).
  - One tenant per login (`profiles.tenant_id`; q06-r3).

Labels: **verified**, **repo**, **inference**, **assumption**, **judgment**.

## 0. The design fork that decides everything

C can be built two ways.

**(i) Copies as special tenants inside production.** No mechanism closes outward effects in one place. A copy would rely on every seam remembering to check a "rehearsal" flag, forever:

- Stripe falls back to Asym's live platform key.
- Email sending has no tenant gate (`send.ts:211`), and Payload and Supabase Auth email use project-wide credentials.
- The public CMS serves any tenant slug.
- Phase 12's `EgressDoor` covers disclosure, not sends or charges.

Production also has structural obstacles:

- one tenant per login;
- globally unique slugs, plus Phase 24 hostnames and giving addresses that are permanently reserved;
- 152 foreign keys to `tenants` (23 with no delete action);
- owner rules that forbid cascade-erasing history.

Fork (i) fails open next to live credentials (q06-r3; v1; v2; repo).

**(ii) A separate, Approved Practice environment.** Its own database and deployment, holding no live credentials, no public routes and no donor or missionary apps. Every missed door then hits nothing real, so it is closed by construction:

- copies keep production IDs, so plans and mappings bind unchanged;
- logins, slugs and scheduled jobs are isolated;
- destruction is a purge permitted only there;
- no production rule is weakened.

**Verdict: (ii).** Both reviewers reached it independently, and every finding below assumes it.

**Rejected sub-options:**

- **One Supabase project per copy.** Each would need its own Q2 clause 6 approval and wiring.
- **Vercel's login wall as the sign-in.** It only admits Vercel users or shareable-link holders (q06-v2; verified-vendor-doc).

## 1. Category review

### 1.1 Problem validity, necessity and alternatives — material concern: yes (narrows)

**The problem is real.** Vendors that migrate real donor data validate it in a copy:

- Salesforce sandboxes;
- Blackbaud's hosted test database;
- Microsoft's mock cutover "with the same data, tools, and people" (q06-r2; verified).

Previews are shallow everywhere: HubSpot checks only 1,000 rows, and none show households or links between records (q06-r2). Only real commits time the save step and exercise recovery (q06-r2 §5).

**Strongest alternative: B alone**, which is cheaper. C adds three things B lacks:

- real owner acceptance at scale;
- a measured pause, keeping Q1 clause 4's ratified "measured in rehearsal" wording, which B would have reworded;
- click-through validation.

**Concerns:**

| #   | Concern                                                                                                                                                                               | Severity      | Effect and fix                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------- |
| V1  | **C contradicts ratified text.** Q1 clause 3 ("no target-owner write"), Q2 clause 5(b) ("its own Asym Tenant") and Q2 clause 6 (non-production never holds real exports) all conflict | High; certain | Changes the answer. Explicit amendments (§3).                          |
| V2  | **"Temporary copy" is undefined.** Location, contents, access, lifetime and evidence status are all open                                                                              | High          | Clauses 2–8.                                                           |
| V3  | **B's part 3 renderer and part 4 synthetic estimate become redundant** once a real copy exists                                                                                        | —             | Delete both: a plain staged-record view, plus the copy, replaces them. |

### 1.2 Brittleness — material concern: yes

| #   | Concern                                                                                        | Severity | Fix                                                                                                                      |
| --- | ---------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| BR1 | **Release parity.** A copy on a different release or schema times and validates the wrong code | High     | A build is refused unless the Practice environment's release commit, migration head and compute size match production's. |
| BR2 | **Configuration drift in the copy job.** New tables get copied, or not, by accident            | Medium   | Every table carries a copy classification (copied, matched records only, never). CI fails when a table has none.         |
| BR3 | **Settings drift in the Practice environment.** Someone adds a live key or domain              | Critical | The environment refuses live-mode keys and custom domains. A daily settings check (monitor M-Q6-2).                      |

### 1.3 Technical debt — material concern: yes

**Defects that must be fixed wherever real data lives**, not only for copies:

- the Stripe platform-key fallback (`tenant-client.ts:64-66`);
- the hard-coded tenant in `org-settings.ts:9`;
- the CMS resolver ignoring `isActive`.

Recorded as O31. Under fork (i) each would be a copy-specific hazard to patch; under (ii) they are ordinary defects with a deadline.

**Vercel environment slot (repo; verified-vendor-doc):** `core-development` already uses Vercel Pro's one custom environment, so the Practice environment needs its own project or an add-on. This is an implementation detail and is not frozen here.

### 1.4 Edge cases — material concern: yes

| #   | Case                                                                             | Outcome under §3                                                                                                                                                                                              |
| --- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Staff treat the copy as live and enter a real gift there                         | A banner and "Practice copy ·" title prefix on every page, plus a separate host. Every change is deleted; a one-time explainer on first entry.                                                                |
| 2   | A copy tries to email a donor (automation, receipt, reset)                       | No send provider exists there. Mail to anyone outside the access list lands in the Practice outbox, which staff can read.                                                                                     |
| 3   | Refund attempted on an imported gift carrying a real Stripe charge ID            | No Stripe keys and no fallback (O31); "Not available in a practice copy".                                                                                                                                     |
| 4   | Canadian issuer activated in a copy, which would start a second `R-` series      | Issuer and serial state are never copied, and activation is refused in the environment.                                                                                                                       |
| 5   | Public pages of the copy reachable on the web                                    | No public routes and no donor or missionary apps in the environment. Mission Control only, on its own host.                                                                                                   |
| 6   | Integrations (Mailchimp, QBO/Xero, calendar, AI) fire                            | Not copied, and connection is refused.                                                                                                                                                                        |
| 7   | Scheduled jobs (recurring schedules, reminders, statements) run on copied data   | Jobs run only against the environment's adapters, which have no live provider. Phase 16 schedules never charge (no keys).                                                                                     |
| 8   | Donor or missionary account claiming or sign-up                                  | Sign-up disabled; no donor or missionary apps.                                                                                                                                                                |
| 9   | Erasure or do-not-contact request about a person in the copy                     | The copy is destroyed within 24 hours of any erasure, new restriction or source-file disposal. The next copy is built from data that reflects it.                                                             |
| 10  | Two practice runs build copies at once                                           | One live copy per tenant. A new build destroys the old copy first.                                                                                                                                            |
| 11  | Build fails at 70%                                                               | The copy goes to destroying automatically, and the Switch shows the failure and the family where it stopped.                                                                                                  |
| 12  | Destruction fails halfway                                                        | Access is revoked first, the purge is resumable, and unfinished after 24 hours is an incident.                                                                                                                |
| 13  | Restore of the Practice environment from backup resurrects destroyed copies      | Every restore re-runs the purge for all destroyed copies before access reopens.                                                                                                                               |
| 14  | A staff member's access is reduced or removed in production while the copy lives | Mirrored within 15 minutes.                                                                                                                                                                                   |
| 15  | Asym specialist wants to help inside the copy                                    | Asym help access does not extend to copies. Help comes by coaching under Q5 rules.                                                                                                                            |
| 16  | Helper (volunteer or consultant) in the copy                                     | Only members on the access list, with their real role and clearance mirrored; the Q5 floor applies.                                                                                                           |
| 17  | Restricted missionary identities in the copy                                     | The same clearance and alias rules as production. The floor's narrowing must be done before a build.                                                                                                          |
| 18  | Copy outlives its purpose                                                        | 14 days from ready, warnings at 3 days and 1 day, one 14-day extension with a reason. Destroyed at Go, at Switch abandonment, at agreement end, or on request.                                                |
| 19  | Copy nobody opens                                                                | Destroyed when its practice run is superseded. Monitor M-Q6-5 checks whether copies earn their keep.                                                                                                          |
| 20  | Production deploys a migration while a copy is building                          | The build is pinned to its release. A release change destroys any copy whose build has not finished; finished copies are labelled with their release.                                                         |
| 21  | Large ministry (50,000 Parties, 500,000 gifts)                                   | The build may take hours. Progress shows per-family counts with no promised finish time, and one build runs at a time across the environment.                                                                 |
| 22  | Dress rehearsal times differ from the real switch                                | Go/no-go shows the measured durations for both pauses (online-giving and editing) and limits of measured × 1.5. Actual times recalibrate future switches.                                                     |
| 23  | Plan accepted a row that the copy's real commit rejected                         | Listed as a mismatch, which blocks go/no-go until fixed. This proves O28 checks match commit rules.                                                                                                           |
| 24  | Ministry on the template path with no stable IDs                                 | Q3 already blocks rows without source IDs; copies keep production IDs for existing records.                                                                                                                   |
| 25  | Copy holds data from a superseded mapping                                        | Each copy records its mapping version, and go/no-go requires a copy built on the current one.                                                                                                                 |
| 26  | Multi-Legal-Entity tenant                                                        | Configuration copies all Legal Entities without issuer or binding state; everything else per entity is unchanged.                                                                                             |
| 27  | Copy findings need fixing                                                        | Fixes are made in production Data Tools (mapping, source data). Records in the copy show source file, row and ID, so issues trace back. Nothing flows from a copy into production except content-free status. |
| 28  | A copy is ever "promoted" to go live                                             | Impossible: no promotion path exists, and the real switch always commits the final manifest into production.                                                                                                  |
| 29  | Agreement ends mid-copy                                                          | Copy destroyed.                                                                                                                                                                                               |
| 30  | Practice environment not Approved when the design partner is ready               | Switches are not offered without it; any exception is a recorded founder decision.                                                                                                                            |

### 1.5 Footguns — material concern: yes

| #   | Footgun                                      | Severity | Fix                                                                                                                      |
| --- | -------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| F1  | Connecting a provider inside the copy        | Critical | Connection refused at environment level.                                                                                 |
| F2  | Wrong-environment work                       | High     | Text banner and page-title prefix (WCAG 1.4.1 and 2.4.2: never colour alone), separate host, explainer.                  |
| F3  | Copying a table with credentials by accident | Critical | The never-copied list, the table-classification CI check, and an environment that refuses live keys even if one arrives. |
| F4  | Treating copy results as proof               | High     | Clause 8.                                                                                                                |

### 1.6 Tenant safety — material concern: yes (resolved by the fork)

Fork (ii) isolates logins, caches, slugs, jobs and hosts by environment. Inside the Practice environment each copy is its own tenant with the production tenant's ID. Two different ministries' copies never share a tenant, and one build runs at a time. The status channel back to production is server-to-server, content-free, and keyed to the Switch.

**Severity:** high under (i); low under (ii).

### 1.7 Database, RLS and authorization safety — material concern: yes

**Practice environment:**

- **Same database rules as production.** Identical migrations and RLS, and the Q2 clause 6 read-back as for any Approved environment, plus three checks:
  - no live credentials;
  - no public routes;
  - email captured in the outbox.
- **Purge scope.** The purge function exists and runs only where the database identifies itself as the Practice environment (an environment marker set at provisioning, not caller input). No production code path can call it.
- **Access mirroring.** It takes role and clearance from production server-side; the copy accepts no access changes made inside itself.

**Production status records:**

- **Copy lifecycle events** are append-only and attributed.
- **The deletion receipt** records:
  - rows purged per table;
  - completion time;
  - backup expiry (Supabase daily backups kept 7, 14 or 30 days by plan; PITR 7, 14 or 28; Storage is not in database backups; q06-r4, verified-primary).

**Severity:** high. **Spec language:** clauses 3, 4, 6 and 7; AC4–AC9.

### 1.8 Overengineering — material concern: yes

**Delete:**

- B's "as it will appear" renderer;
- B's synthetic commit estimate;
- any per-copy project, Vercel-gated login or production tenant class;
- any per-seam rehearsal flag;
- copy promotion;
- Asym access into copies;
- multiple concurrent copies per tenant.

**Keep:** one environment, one copy job with an allowlist, one lifecycle, one purge, and one status channel.

**Cost** is about $25–$200 a month (q06-v2; inference). Copies with real records are capped by every vendor (Salesforce 29-day Full refresh; Zendesk 1–2; Stripe 5; q06-r4), which supports one live copy per tenant.

### 1.9 UX/UI and user friction — material concern: yes

| Moment         | Design                                                                                                                                                                                                                                                                                                |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Getting in     | An "Open practice copy" button on the Switch page sends an invitation. Separate sign-in to the practice host, with sign-up disabled.                                                                                                                                                                  |
| While building | Background build with per-family counts and an email when ready.                                                                                                                                                                                                                                      |
| In the copy    | Persistent banner "Practice copy — nothing here is real or saved. Deleted {date}", page-title prefix, a one-time explainer. Staff may view, edit, try workflows and run on-screen reports. Unavailable actions (send, charge, publish, export, documents, AI) say "Not available in a practice copy". |
| Expiry         | Countdown in the banner; warnings 3 days and 1 day before; one extension with a reason.                                                                                                                                                                                                               |
| Go/no-go       | Both measured durations, the margin, mismatches, the copy's mapping version and release.                                                                                                                                                                                                              |

Donors and missionaries never see a copy.

**Accessibility:** banner text with a role and visible focus order. Readable at 320 CSS px, though the copy is for desktop review.

**Severity:** medium.

### 1.10 Source of truth, ownership and invariants — material concern: yes

**Owners:**

- **Production:** the source of truth for configuration, access and mapping.
- **The copy:** a disposable projection that writes nothing back.
- **Phase 30:** the copy lifecycle and status.
- **Platform and ops:** the environment.
- **Phase 12:** mirrored access.

**Invariants:**

- **I1.** At most one live copy per tenant.
- **I2.** No credential, binding, host, giving address, issuer or serial state, integration, grant, login or source file exists in a copy.
- **I3.** No data flows from a copy into production except content-free status.
- **I4.** A copy is never promoted.
- **I5.** Every copy is destroyed by its earliest trigger.
- **I6.** A copy's release equals production's at build.

### 1.11 Hidden coupling — material concern: yes

**Couplings:**

- Production releases must also deploy and migrate the Practice environment.
- Hosted Inngest outside production has never been set up (q06-v1; repo).
- Builds need jobs that can carry a staff actor's authority (#2311; Q5).
- The copy job depends on every owner's import command running unchanged in the Practice environment.

**Fix:** the release pipeline treats the environment as a deploy target; a build is refused on any mismatch. **Severity:** medium.

### 1.12 Failure modes — material concern: yes

| Mode                 | Safe?                | Handling                                                                                                     |
| -------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------ |
| Build fails          | Yes                  | Auto-destroy; failure shown with the family where it stopped                                                 |
| Destruction fails    | Yes after revocation | Resumable purge; incident after 24 hours                                                                     |
| Status channel fails | Yes                  | The copy stays usable; production shows "status delayed"; expiry is enforced inside the Practice environment |
| Live key appears     | Fail closed          | Refused; monitor M-Q6-2                                                                                      |
| Restore              | Yes                  | Purge re-run before access                                                                                   |
| Release mismatch     | Yes                  | Build refused                                                                                                |

**Severity:** medium.

### 1.13 Lifecycle, temporal, concurrency and idempotency — material concern: yes

**States:** requested → building → ready (→ extended once) → destroying → destroyed. Building or ready → destroying on failure or any trigger.

**Rules:**

- Destroyed is terminal.
- Build and destroy requests are idempotent per copy ID.
- A new build first destroys the old copy.
- Expiry falls at 11:59 pm in the ministry's giving time zone and is computed server-side.
- The dress rehearsal includes one forced interruption and resume, and times each family.

**Spec language:** clauses 4–7; AC7, AC8.

### 1.14 Data integrity risks — material concern: yes (low)

Mismatches between the plan and the copy's commit are listed and block go/no-go (edge case 23). Copies built on old mappings are refused at go/no-go. Nothing flows back from a copy, so production cannot be corrupted from it.

### 1.15 Security and privacy — material concern: yes

**Controls for a real-data copy** (NIST SA-3(2), ISO 27002 8.33, the EDPS via AEPD, CNIL; q06-r2, q06-r4):

- protection equal to production;
- need-to-know access;
- each copy approved and logged;
- deletion after test.

All of these are met by clauses 3–7.

**Ratified rules carried in:**

- **Restricted identities:** the same Q5 floor.
- **Agreement:** the Q2 agreement names Practice copies, the outbox, lifetime, deletion and backup expiry.
- **Backups:** deletion receipts state the backup expiry honestly. The EDPB flagged backup deletion as a problem area on 2026-02-18 (q06-r4; verified).

**Severity:** high.

### 1.16 Scalability and performance — material concern: yes

**Build time.** Commit throughput is unmeasured, and builds probably take hours for large ministries (assumption).

**Capacity:**

- Inngest limits are 1,000 steps per function and 32 MB of state, so chained runs are needed (q06-r1; verified-vendor-doc).
- One build at a time across the environment caps concurrent switches' dress rehearsals.
- Compute matches production, so timings are meaningful.

**Fix:** progress without a promised finish time; a queue position shown; monitor M-Q6-4. **Severity:** medium.

### 1.17 Operational burden — material concern: yes

- Provisioning once, deploying with each release, a daily settings check, and incident handling for failed destruction.
- No per-copy manual steps.
- No developer involvement except incidents.

**Severity:** medium.

### 1.18 Observability and auditability — material concern: yes

**The production Switch history records:**

- who requested each copy and who has access;
- build start and finish, mapping version and release;
- per-family counts, timings and mismatches;
- extensions;
- destruction trigger and receipt.

Every record is content-free.

**The Practice environment keeps:** technical logs without personal data, and an outbox the copy's own users can read.

### 1.19 Dependency and integration risks — material concern: yes

| Dependency                 | Risk                                           |
| -------------------------- | ---------------------------------------------- |
| Supabase                   | Backup retention by plan                       |
| Vercel                     | Environment or project limits                  |
| Inngest                    | Hosted environment for non-production          |
| Resend, Stripe and Payload | Must be absent or test-only in the environment |

**Fix:** environment provisioning checks and the daily settings check. **Severity:** medium.

### 1.20 Migration, rollout and upgrade — material concern: yes

**Order:**

1. O31 defect fixes.
2. Environment provisioning (O29).
3. The copy job and lifecycle (O30).
4. Approval under Q2 clause 6 plus the three checks.
5. Switches offered.

Release parity gates every build. **Kill switch:** disable builds and destroy all copies. **Rollback** is trivial, because copies write nothing back. **Severity:** high until sequenced.

### 1.21 Testability, traceability and proof — material concern: yes

**Acceptance criteria:** AC1–AC16 (§3).

**Glossary:** add Practice run, Practice copy and Practice environment; avoid "sandbox".

**Amendments to record:**

- Q1 clauses 3, 4, 10 (abort/reversal: copies destroyed on abort) and 12 (decommission checklist confirms no live copy);
- Q2 clauses 2, 5(a), 5(b) and 6;
- Q5 clause 5.

**Root glossary:** `CONTEXT.md:5075` (sandbox results are not production proof) is scoped to Phase 21 D27 and applied here by analogy.

### 1.22 Other development hazards — material concern: yes

| Hazard                                                                                                  | Fix                                                                  |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| The practice commit path drifts from the real one                                                       | The same owner commands; only boundary and go-live steps are omitted |
| `docs/ops/environments.md` says production Stripe is live-mode (`:14`) and elsewhere test-mode (`:377`) | Record as a discrepancy; it bears on D13                             |
| Marketing must not promise "full sandbox"                                                               | No product copy claims more than the clauses grant                   |

## 2. Disposition

**Accept with required amendments.** C is sound only as a Practice copy in a separate, Approved Practice environment. Built inside production it would fail open. The amendments:

- define where and what the copy is;
- remove B's redundant renderer and estimate;
- make the dress rehearsal a go/no-go gate that keeps Q1's "measured in rehearsal";
- amend Q1, Q2 and Q5 explicitly.

## 3. Corrected decision (to record)

**Q6 — Rehearsal mode.** Option C, amended.

1. **Practice runs** (in production, write nothing to live records). Every practice run stages the whole switch from one set of exports. Gifts, relationships and custom data point to practice donors by old-system ID. The run shows:
   - per family: create, update, skip and review counts;
   - both reconciliation levels;
   - the issue list;
   - a staged-record view showing each record's source file, row and ID.

   A new practice run replaces the previous one. Each Minimum Switch Kit area checks every row without saving, using the same acceptance rules as its commit; a rolled-back transaction does not count (O28). The real commit re-checks.

2. ★ **Dress rehearsal in a Practice copy.**
   - **Who builds it:** a ministry member holding the Switch decision capability, from a practice run.
   - **How:** the plan is committed through the same owner import commands, omitting only the boundary and go-live steps, into a **Practice copy** in the **Practice environment**.
   - **What it times:** every family, including one forced interruption and resume.
   - **Mismatches:** any row the plan accepted but the commit rejected is listed.
   - **Go/no-go gate:** the latest copy must be built on the current mapping version and production release, with no unresolved mismatches.
   - **The pauses:** go/no-go shows the measured online-giving and editing pauses, and sets limits of measured × 1.5. This keeps Q1 clause 4's "measured in rehearsal".
3. ★ **The Practice environment** (amends Q2 clause 6). An Approved environment with its own database and deployment, in production's region, at production's compute size.
   - **Release parity:** deployed and migrated with every production release; a build is refused on any mismatch.
   - **Closed doors:** no live or production credentials, no public routes, no donor or missionary apps, no sign-up.
   - **Email:** mail reaches only a copy's access list; everything else is captured in a Practice outbox.
   - **Refused there:** provider keys, domains, webhooks, settlement bindings, integrations, AI and tax-document issuers.
   - **Checks:** a daily settings check confirms all of this, as does the Q2 clause 6 read-back.
4. ★ **What a copy holds** (amends Q1 clause 3 and Q2 clause 5(b)).
   - **Holds:** the tenant's allowlisted configuration and the existing records the plan references, keeping production IDs, plus the practice run's rows.
   - **Never holds:** credentials, settlement bindings, hosts, giving addresses, issuer or serial state, integrations, grants, logins or source files.
   - **Classification:** every table is classified copied, matched-only or never, and CI fails on an unclassified table.
   - **One-way:** a copy is never promoted, and nothing flows back to production except content-free status.
5. **Access and use.**
   - **Who gets in:** a ministry member with the Switch decision capability chooses current members, who get their real role and clearance. Production removals and reductions apply within 15 minutes.
   - **Who never gets in:** donors, missionaries and Asym staff. Asym help access does not extend to copies (amends Q5 clause 5).
   - **What staff can do:** view, edit, try workflows and run on-screen reports. Every change is deleted.
   - **Unavailable actions** say "Not available in a practice copy".
   - **Labelling:** a persistent text banner and a "Practice copy ·" page-title prefix, never colour alone, on a separate host.
6. ★ **Lifetime.**
   - **One live copy per tenant;** a new build destroys the old one first.
   - **Duration:** 14 days from ready, ending 11:59 pm in the giving time zone, with warnings at 3 days and 1 day and one 14-day extension with a reason.
   - **Destroyed earlier on:** Go, Switch abort or abandonment, agreement end, a ministry request, a release change before the build finishes, or within 24 hours of any erasure, new restriction or source-file disposal (amends Q1 clauses 10 and 12; decommission confirms no live copy).
7. **Destruction.** Access is revoked first, then a resumable purge runs, permitted only where the database identifies itself as the Practice environment.
   - **Receipt in the Switch history:** rows purged per table, completion time and backup expiry.
   - **After a restore:** every destroyed copy is purged again before access reopens.
   - **Deadline:** unfinished after 24 hours is an incident.
8. ★ **Evidence.** Copy results are rehearsal evidence only (amends Q2 clause 2). They never qualify a source profile, replace reconciliation sign-off, satisfy "recovery exercised" or meet the zero-effect acceptance gate. Q2's "recovery exercised" is met only by production evidence at the pilot switch: a planned interruption-and-resume of one commit stage, or a real recovery.
9. **Readiness.** Switches are not offered until the Practice environment is Approved. Any exception is a recorded founder decision.
10. **Not adopted:** copies inside production; a project per copy; Vercel-gated sign-in; promotion; Asym access to copies; more than one copy per tenant; B's renderer and synthetic estimate.

**Acceptance criteria:**

| ID   | Criterion                                                                                                                                                                  |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC1  | A practice run stages all families together. Dependent rows resolve to staged donors by old-system ID, and nothing is written to target owners.                            |
| AC2  | Each Minimum Switch Kit area returns per-row verdicts without writing. A rolled-back transaction implementation fails the check.                                           |
| AC3  | Go/no-go is refused without a copy built on the current mapping version and release with zero unresolved mismatches.                                                       |
| AC4  | The Practice environment refuses live-mode keys, custom domains, webhooks, settlement bindings and issuer activation. The daily check fails if any is present.             |
| AC5  | Mail to anyone outside the access list lands in the Practice outbox, and no external send occurs. A test enumerates every send path, including Payload and auth emails.    |
| AC6  | No public route, donor app, missionary app or sign-up exists in the environment.                                                                                           |
| AC7  | A second build request destroys the first copy before building. At most one live copy per tenant at any time.                                                              |
| AC8  | Expiry, warnings and the single extension follow clause 6, in the giving time zone. Every trigger destroys within 24 hours.                                                |
| AC9  | The purge refuses to run outside the Practice environment. Its receipt lists rows per table and backup expiry. After a restore, destroyed copies are purged before access. |
| AC10 | Copied tables match the classification. CI fails on an unclassified table, and no never-copied data appears in a copy (property test over all tables).                     |
| AC11 | Only listed members can sign in. A production removal locks them out within 15 minutes. Donors, missionaries and Asym operators are refused.                               |
| AC12 | Every page shows the banner text and title prefix. Unavailable actions show their message. Axe passes, and the banner is announced to screen readers.                      |
| AC13 | The dress rehearsal records per-family durations and one forced interruption and resume. Go/no-go shows the measured pauses and × 1.5 limits.                              |
| AC14 | Nothing from a copy writes to production except content-free status events (schema-checked).                                                                               |
| AC15 | A copy build is refused when release or migration head differ from production's.                                                                                           |
| AC16 | Copy evidence cannot be attached to source-profile qualification or reconciliation sign-off.                                                                               |

## 4. Ruthless synthesis

**Resolve before recording:** founder confirmation of the ★ clauses:

- **Clause 2:** the dress rehearsal gate.
- **Clause 3:** the Practice environment; amends Q2 clause 6.
- **Clause 4:** contents; amends Q1 clause 3 and Q2 clause 5(b).
- **Clause 6:** lifetime and erasure; amends Q1 clauses 10 and 12.
- **Clause 8:** evidence; amends Q2 clause 2 and defines its "recovery exercised".

**Capture in the spec:**

- the copy job and its classification;
- lifecycle and status channel;
- the go/no-go presentation;
- banner and UX;
- AC1–AC16;
- glossary terms Practice run, Practice copy and Practice environment;
- ADR-IM-006.

**Owner requirements:**

| ID  | Owner                               | Requirement                                                                                                                                                                                                                                                                                     |
| --- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| O28 | Phases 4, 9, 11, 13, 14, 16         | No-write per-row check using the same rules as commit. Cheapest if each import command is built as separate validate and apply steps.                                                                                                                                                           |
| O29 | Platform and ops                    | The Practice environment as clause 3: provisioning, release and migration parity in the deploy pipeline, region and compute parity, refusal rules, Practice outbox, daily settings check, environment marker, hosted Inngest. Approved under Q2 clause 6 plus three checks.                     |
| O30 | Phase 30 with Phase 12 and Phase 29 | Copy job (allowlist and CI classification), mirrored access (15 minutes), content-free status channel, lifecycle, Practice-environment-only purge with receipt and restore re-purge. A ratified statement that tenant-lifecycle retention and no-cascade rules do not apply to Practice copies. |
| O31 | Phase 13 and admin owners           | Remove the Stripe platform-key fallback (`tenant-client.ts:64-66`) and the any-tenant USD lane. Fix `org-settings.ts:9`'s hard-coded tenant. Make the CMS resolver honour `isActive`. Required before any real data in any environment.                                                         |

**Safeguards:**

- environment-level refusal plus the daily check;
- the purge marker;
- release parity;
- one-copy rule;
- 24-hour destruction deadline.

**Discrepancy to record:** `docs/ops/environments.md` says production Stripe is live-mode (`:14`) and test-mode (`:377`).

**Order:** O31 → O29 → O30 and O28 → approval → switches offered.

**Monitor:**

| #      | Risk                                | Signal                                                                                          | Threshold                                                                               | Owner                                           | Response                                                                                     |
| ------ | ----------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------- |
| M-Q6-1 | Plan checks drift from commit rules | Plan-accepted rows rejected at copy commit                                                      | Any, on a go/no-go candidate copy                                                       | Phase 30 spec owner with the area owner         | Fix that area's check before go/no-go                                                        |
| M-Q6-2 | Outward-effect leak                 | Daily settings check; outbox captures for non-access-list recipients; any provider call attempt | Any live credential, domain or outbound attempt                                         | Platform and ops owner                          | Freeze builds, destroy all copies, investigate, tell affected ministries                     |
| M-Q6-3 | Copies outlive their purpose        | Destruction receipts vs triggers                                                                | Any copy alive more than 24 hours after a trigger                                       | Platform and ops owner                          | Incident; finish the purge; tell the ministry                                                |
| M-Q6-4 | Timing accuracy                     | Actual switch pauses vs measured                                                                | Actual more than measured × 1.5                                                         | Phase 30 spec owner                             | Recalibrate the margin; investigate the gap                                                  |
| M-Q6-5 | Copies not earning their keep       | Copies opened by any member, and issues found in copies that previews missed                    | Across the first three switches, fewer than half of copies opened, or zero issues found | Phase 30 spec owner with the relationship owner | Founder decides whether the dress rehearsal stays a go/no-go requirement or becomes optional |
