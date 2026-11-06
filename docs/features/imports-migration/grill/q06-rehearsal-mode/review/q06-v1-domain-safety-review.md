# Q6 v1 review: domain correctness, safety and data

Independent, read-only review of `q06-decision-as-asked.md` (Option C: B plus a temporary copy of the ministry's account). Baseline `develop` `629cb71dc`. External pages fetched 2026-11-02.

Labels: **VF** verified fact (re-read or fetched in this review) · **RF** repo fact cited by research, not re-read · **INF** inference · **ASM** assumption.

## Verdict in brief

C is worth having. Only C lets staff see their own data in the real app, measures commit time, and exercises interrupted-commit recovery before the live switch. Salesforce, Blackbaud, Microsoft and Chargebee all test-load into a separate copy (r2 §1, §5). But the shape implied by the question, a special tenant inside production, is the wrong build. It needs a permanent tenant-class predicate in about ten owner seams (r3 §1d) and changes to the login model. It also needs exceptions to global uniqueness and a production purge path that deletes append-only history. Every future all-tenant job would have to remember the exception.

**Disposition: Accept with required amendments.** Build C as **Practice copies in one Approved rehearsal environment** (fork ii). Make one passed dress rehearsal a go/no-go gate. Keep O28. Treat copy results as rehearsal evidence, never production proof.

## Design fork: production tenant (i) vs Approved rehearsal environment (ii)

| Issue           | (i) Special tenant in production                                                                                                                                                                                                                                                                                                                                                                                                                 | (ii) Separate rehearsal environment                                                                                                                                                                                                                                                                                                                                                                                                               | Verdict          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Outward effects | Default-open. The platform Stripe key fallback (VF `tenant-client.ts:64-66`) plus a USD lane for any tenant (VF `settlement.ts:13-23`) send charges to Asym's live account. `sendEmail` has no tenant gate (VF `send.ts:211`). Payload email uses the platform key (VF `payload-runtime-integrations.ts:20-33`). The public resolver serves any slug (VF `resolve-tenant.ts:89-104`). Every door, including future ones, must test a class flag. | Default-closed by construction: no live credential exists in the environment, so a missed door hits a sandbox or a capture. Tenant-supplied keys are the remaining door, closed once at environment level.                                                                                                                                                                                                                                        | (ii)             |
| Identity        | One tenant per login (VF `context.ts:297-302`; RF Payload `cms-users` has one `tenantId`). Needs a second email or a tenant switcher that does not exist.                                                                                                                                                                                                                                                                                        | Separate `auth.users`, separate host and session. INF: Supabase cookie names carry the project ref, so sessions cannot collide.                                                                                                                                                                                                                                                                                                                   | (ii)             |
| Identifiers     | Must re-key the tenant and every configuration row, and collides on `campaigns.slug` (VF `foundation_1:21`, `:665`), `tenants.slug`, Payload slugs, P24 hostnames and giving addresses (RF).                                                                                                                                                                                                                                                     | Keeps the production tenant UUID and configuration IDs, so practice-run plans and remembered mappings bind unchanged. Source Record Bindings already key on environment (VF imports `CONTEXT.md:72`).                                                                                                                                                                                                                                             | (ii), decisively |
| Destruction     | 152 foreign keys reference `tenants`, 23 with no delete action (VF count over migrations). Needs a production purge of audit, receipt and append-only history, an exception to D40-AC104, D41-AC018, D31 and Q1 clause 10. The copy also sits in production backups for production's retention.                                                                                                                                                  | The purge command exists only where the database's own identity says "rehearsal". The environment gets short daily backups with PITR off. No production rule is weakened.                                                                                                                                                                                                                                                                         | (ii)             |
| Load and timing | Copy commits compete with live tenants.                                                                                                                                                                                                                                                                                                                                                                                                          | Isolated, and builds can be serialized for clean timing.                                                                                                                                                                                                                                                                                                                                                                                          | (ii)             |
| Cost            | No new infrastructure, but permanent seam tax.                                                                                                                                                                                                                                                                                                                                                                                                   | One Supabase project in production's region. Vercel custom environments: Pro includes **1 per project** (VF vercel.com/docs/deployments/environments), already used by `core-development`, so add a $50/month pack on two projects (admin, missionary; donor is not deployed). One Inngest custom environment with its own keys, where "Data stays inside its environment" (VF inngest.com/docs/platform/environments). One Q2 clause 6 approval. | Acceptable       |

**Whole short-lived projects per copy: reject.** Deleting a project does remove its backups (VF supabase.com/docs/guides/platform/backups). But each project would need its own non-builder live read-back (Q2 clause 6), migrations and Vercel wiring. A tenant purge plus 7-day backup expiry reaches the same end state with less machinery.

**Vercel deployment protection: do not require it.** Vercel Authentication admits only Vercel users (VF vercel.com/docs/deployment-protection), so ministry staff could not get in. Password Protection costs $20/month per project and adds a shared password. The Approved bar is production-equal, and production relies on app login. Require app login on every route, public routes returning 404, sign-up off and an access-list allowlist instead.

## Material concerns, ranked

### K1. Outward effects (critical; likelihood high under fork i)

- **What goes wrong:** a copy charges a real card on Asym's live account, emails donors from the ministry's domain, publishes giving pages, or invites donors to log in.
- **Why:** there is no single effect chokepoint (r3 §1d). Microsoft shows that a flag alone leaks: plug-ins and scheduled flows keep running (r4 §1).
- **Evidence:** VF the code doors listed in the fork table. RF `receipts.ts:316-327`: staff can connect a Resend key at any time. RF Eve AI gateway and Discord doors (`governance-boundary.ts:29`, `delivery.ts:279`).
- **Effect:** changes the answer to fork (ii). It still narrows (ii), because tenant-level credentials are a door there too.
- **Fix and spec:** "The rehearsal environment holds no live provider credential. Startup and environment validation fail on a live Stripe key, a production Resend, Inngest or Sentry key, or a production database URL. Stripe uses only a dedicated sandbox with no connected accounts. Every email, including Payload and Auth email, is delivered only to the copy's access list. All other messages land in the copy's **Practice outbox**, visible to staff and destroyed with the copy. Connecting a provider key, domain, webhook, Settlement Account Binding, AI integration or tax-document issuer is refused there. Public routes return 404, and the donor app is not deployed. One test per door."

### K2. Ratified text forbids this (high; certain)

- **What goes wrong:** C breaches three ratified clauses. Q1 clause 3 says "no target-owner write" (VF `decision-log.md:31`). Q2 clause 5(b) says "its own Asym Tenant" (`:61`). Q2 clause 6 says "Non-production environments never hold real exports" (`:62`).
- **Effect:** narrows. Exact amendments are given below. Q2 clause 6's real purpose (production-equal protection, EDPS/ISO 8.33/NIST SA-3(2), r2 §3, r4 §4) is kept by making the rehearsal environment an _Approved_ environment with three extra checks.

### K3. Destruction and deletion proof (high; medium)

- **What goes wrong:** the purge stops halfway with access still open. Rows survive in backups, Storage, logs or Inngest state. A backup restore silently resurrects a destroyed copy.
- **Evidence:** VF Supabase docs: Pro keeps 7 days of daily backups; enabling PITR stops daily backups; Storage objects are not in backups; no per-backup purge exists. VF: Sentry tags the environment as `VERCEL_ENV` (`sentry.server.config.ts:8`), so rehearsal events would read "preview". RF: no hosted retention documented (`scale-observability-reliability.md:78-92`).
- **Effect:** narrows.
- **Fix and spec:** "Destroying a copy first revokes every session and access grant and cancels its jobs. It then deletes every row of that tenant in the rehearsal environment (append-only and audit tables included), its Storage objects by exact list, and its Practice outbox. The purge is idempotent and resumable. The copy becomes _Destroyed_ only after a read-back finds nothing. Asym then issues a deletion receipt: 'Removed from the live database at {T}; backups containing it expire by {T + 7 days}.' If destruction is not complete within 24 hours it is an incident. The rehearsal environment keeps daily backups for 7 days, with PITR off, and a content-free purge ledger. Any restore re-runs the ledger before the environment reopens. Sentry and logs for the environment use their own project, tagged `rehearsal`, with retention of no more than 30 days. Inngest steps hold identifiers only."

### K4. Privacy facts do not reach the copy (high; medium)

- **What goes wrong:** a donor asks the ministry to erase them, or a missionary is newly restricted. The copy still shows them, and the next dress rehearsal re-creates them.
- **Why:** bindings and suppressions are per tenant and per environment (VF imports `CONTEXT.md:72`; RF suppressions). Q1 clause 12 routes only post-boundary requests (VF `:40`).
- **Effect:** narrows.
- **Fix and spec:** "Recording an erasure, a new restriction, a tighter narrowing, or a disposal of the practice run's source destroys any live copy within 24 hours. Every later copy is built from current exclusions."

### K5. Access and Q5 (high; medium)

- **What goes wrong:** a departed staff member keeps access to a copy. Uncleared staff see restricted names because classification was not copied. Asym enters through a second, unmonitored grant plane.
- **Evidence:** VF Q5 clause 4 floor and clause 5 grant scope (`:174-187`). RF: Phase 10 classification is tenant-owned and alias enforcement is per Party (r3 §5).
- **Effect:** narrows.
- **Fix and spec:** "Production is the control plane. The copy's access list is chosen by a ministry member with the Switch decision capability, from current members holding Switch preparation or decision capability. Removing that membership or capability in production revokes copy access. The copy carries the production clearance and narrowing state, and the build is blocked until Phase 10 classification is in place. Asym help access never enters a copy. Specialists see only its content-free results in the production Switch. If nobody is given access, the copy is destroyed as soon as the dress rehearsal finishes."

### K6. Evidence status (high; high)

- **What goes wrong:** a green copy is cited as reconciliation sign-off, as "recovery exercised" for Supported status, or as C23 zero-effect proof.
- **Evidence:** VF `CONTEXT.md:5075` scopes "sandbox success as production proof" to the Phase 21 D27 manifest. RF `roadmap.md:2546` says "Synthetic, sandbox, and production-shadow evidence stay distinct". So the principle carries over by analogy, not by direct rule.
- **Effect:** narrows.
- **Fix and spec:** "Copy results are _rehearsal evidence_. They set the measured pause length and show write-path errors, the stop-and-resume exercise, and whether the import path tried any outward effect (Practice-outbox entries of import origin must be zero). They never stand in for practice runs, level-1 or level-2 sign-off, recovery exercised at the live switch, the C23 gate or production readiness."

### K7. Timing validity and release parity (medium-high; high)

- **What goes wrong:** the copy runs a different release, schema or compute size than production, or contends with nothing, so the measured pause is optimistic.
- **Evidence:** INF. The production tenant is nearly empty before the switch, because giving opens only after the Parties commit (Q1 clause 4, VF `:32`). The "empty tenant" objection (r1 gap 7) is therefore weak. The remaining gaps are release, schema, compute and contention.
- **Effect:** narrows.
- **Fix and spec:** "The rehearsal environment is deployed from the same commit as production by the production release, which also applies its migrations. A copy cannot be built unless its migration set equals production's. It runs on production's compute size, and builds run one at a time. Each dress rehearsal records release, migration set, compute, row counts and per-family commit durations. At go/no-go the pause length is measured time plus a 50% margin (ASM, recalibrate after the first switch). If production's release has changed since, go/no-go shows it, and the Switch lead re-runs the dress rehearsal or records acceptance."

### K8. Configuration copy (medium; high)

- **What goes wrong:** credentials, hosts or issuer state get copied, or too little gets copied for the plans to bind.
- **Effect:** narrows.
- **Spec:** "Copied with original IDs: Legal Entities (identity only); funds, designations, campaigns; the Phase 11 catalog; Phase 10 classification; Phase 3 field-policy overrides; Phase 12 roles and groups (memberships never); Sites as private setup; the existing records the plan matches or updates, at their current revision; the plan's rows. Never copied: Settlement Account Bindings, `acct_` IDs, keys, email settings, hosts, giving addresses, P20 grants, P18/P7 issuer activation and serial state, P31 endpoints, operator grants, donor and missionary logins, source files, Web Studio content and media."

### K9. Lifecycle and concurrency (medium; high)

- **What goes wrong:** two copies exist at once, copies are orphaned, a copy outlives the Switch, or a build that fails at 70% is left half-visible.
- **Effect:** narrows.
- **Spec:** "States: _Building → Ready_ or _Stopped → Destroying → Destroyed_. A _Stopped_ copy can be opened (labelled 'Incomplete — stopped at {family} {n}%') and resumed. Each dress rehearsal deliberately stops and resumes its commit once. One live copy per Tenant. A new dress rehearsal destroys the old copy before building. A copy lives 14 days from Ready, ending 11:59 pm in the giving time zone. One extension of up to 14 days is allowed, with a reason. The Switch lead is warned 3 days and 1 day before. Destruction is automatic at the earliest of: expiry, replacement, go/no-go 'Go', Switch abandoned, the K4 triggers, the end of the agreement, or a ministry request. Copies are never promoted, and no data flows from a copy back to production beyond content-free results and source-ID references to rows production already holds."

### K10. O28 is still needed (medium; certain)

- **Why:** the copy cannot be used during the editing pause, because the final plan is built after the boundary and a second commit would double the pause. A copy for every practice run would multiply real-data copies and make the rehearsal environment a dependency of every iteration. ADR-0173 clause 17 already rejects commit-and-discard as a no-write check (RF).
- **Effect:** none on B. Keep O28 and B's staged references by old-system ID.

### K11. Wrong-environment mistakes (medium; high)

- **What goes wrong:** staff update a real donor's address in the copy, think a captured email went out, or work in production thinking it is the copy.
- **Fix and spec:** "A persistent text banner on every page: 'Practice copy — nothing here is sent or kept · deleted {date}'. Page titles prefixed 'Practice'. A separate host (`practice-admin.…`). Forms note that changes are discarded and that real changes belong in the current system. After destruction the host shows 'This practice copy was deleted on {date}'. Not colour alone (WCAG 1.4.1, 2.4.2; r4 §2)."

### K12. Hidden coupling and existing defects (medium; medium)

- **Coupling:** the production release must also deploy and migrate the rehearsal environment. Hosted Inngest outside production has never been set up (VF `environments.md:355`). `@asym/env` treats only production, core-development and staging as protected (VF `target-env.ts:44`), so a new target must be added.
- **Defect:** `org-settings.ts:9` hard-codes tenant `…0001` (VF), so writes go to whichever copy holds that ID. Fix it before any copy exists.
- **Production status:** `environments.md:14` says production Stripe is live-mode, but `:377` says test-mode until go-live (VF). This is more evidence for D13.

### K13. Agreement and tax documents (low-medium; low)

- **Agreement:** Q2 clause 5(a) must name Practice copies (see amendments).
- **Serials:** RF #944 keys serials per tenant and environment, so an activated issuer in a copy would start a second `R-` series. Activation stays refused (K1); imported gifts are Recorded outside Asym anyway.

## Category review

| #   | Category                            | Material?     | Where / what was checked                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --- | ----------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Problem validity, alternatives      | Yes, narrowed | B cannot time commits or show the real app (r2 §5). Fork goes to (ii); per-copy projects and "all practice in copies, drop O28" rejected (K10).                                                                                                                                                                                                                                                                                                                                       |
| 2   | Brittleness                         | Yes           | (i): every seam and future job carries the flag. (ii): release, schema and compute parity (K7).                                                                                                                                                                                                                                                                                                                                                                                       |
| 3   | Technical debt                      | Yes           | (i): permanent predicate and production purge. (ii): one environment and release coupling (K12).                                                                                                                                                                                                                                                                                                                                                                                      |
| 4   | Edge cases                          | Yes           | Below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 5   | Footguns                            | Yes           | Wrong environment (K11), tenant-supplied keys (K1), hard-coded tenant (K12), restored backups (K3).                                                                                                                                                                                                                                                                                                                                                                                   |
| 6   | Tenant safety                       | Yes           | (i) fails. (ii) leaves production RLS unchanged; copies are isolated by the same RLS; builds serialized.                                                                                                                                                                                                                                                                                                                                                                              |
| 7   | Database, RLS, authorization        | Yes           | No-action foreign keys, one login per tenant, purge gated on database identity, Q5 floor in the copy (K5).                                                                                                                                                                                                                                                                                                                                                                            |
| 8   | Source of truth                     | Yes           | Never authority, never promoted, only content-free results flow back (K9).                                                                                                                                                                                                                                                                                                                                                                                                            |
| 9   | Hidden coupling                     | Yes           | K12, plus the cross-environment control channel (K5).                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 10  | Failure modes                       | Yes           | Build stops at 70% (K9), destruction halfway (K3), environment down blocks scheduling (edge 24).                                                                                                                                                                                                                                                                                                                                                                                      |
| 11  | Lifecycle, concurrency, idempotency | Yes           | K9: idempotent, resumable build and purge; one copy per Tenant; one build per environment.                                                                                                                                                                                                                                                                                                                                                                                            |
| 12  | Data integrity                      | Yes           | Release and schema parity; matched records copied at current revision (K7, K8).                                                                                                                                                                                                                                                                                                                                                                                                       |
| 13  | Security, privacy                   | Yes           | Backups, logs, receipts, K4 coupling, agreement terms (K3, K4, K13).                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 14  | Dependencies                        | Yes           | Supabase backups, Vercel custom-environment limit and protection model, Inngest environments (all VF); Stripe sandbox; Resend capture; Payload media off. No Management API needed. Auth's default SMTP sends only to project team members, 2 per hour (VF supabase.com/docs/guides/auth/auth-smtp), so custom SMTP goes through the guard. The before-user-created hook denies sign-ups (VF), but invite coverage is undocumented, so the invite command enforces the allowlist too. |

## Edge cases (outcomes under the corrected design)

| #   | Case                                                                              | Outcome                                                                                                                                                             |
| --- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Build stops at 70% (owner rejects rows, timeout, crash)                           | _Stopped_. The Switch shows the furthest family and percentage and the errors. Staff can open it as Incomplete, resume, or replace it. It does not count as passed. |
| 2   | Destruction fails halfway                                                         | Access is already revoked, so retries continue. After 24 hours it is an incident. The ministry sees "Deletion delayed". No receipt until a read-back finds nothing. |
| 3   | Erasure request during the copy's life                                            | The copy is destroyed within 24 hours, and the next copy excludes the person.                                                                                       |
| 4   | Opt-out or do-not-contact during the copy's life                                  | No exposure, because the copy sends nothing. It is applied from the next export.                                                                                    |
| 5   | A missionary is newly restricted, or narrowing is tightened                       | The copy is destroyed.                                                                                                                                              |
| 6   | Narrowing is widened                                                              | The copy stays as it is (more restrictive).                                                                                                                         |
| 7   | A staff member leaves, or loses the capability, in production                     | Their copy access is revoked.                                                                                                                                       |
| 8   | Asym specialist with help access asks to look in                                  | Refused. They see content-free results; coaching on the ministry's screen is allowed.                                                                               |
| 9   | Helper (O27) on the access list                                                   | Allowed while their production preparation access lasts.                                                                                                            |
| 10  | Same person on two ministries' copies                                             | Refused while the first is live (one login per copy).                                                                                                               |
| 11  | Staff clicks Send, Resend receipt or Test email                                   | Captured in the Practice outbox. Only access-list staff can be delivered to.                                                                                        |
| 12  | Staff invites a donor to the portal                                               | Captured. No user is created.                                                                                                                                       |
| 13  | Staff connects a Resend or Stripe key, a domain or a webhook                      | Refused: "Not available in a practice copy".                                                                                                                        |
| 14  | Staff records a gift in the copy                                                  | Saved in the copy only. No tax document, because issuers cannot activate. The banner applies.                                                                       |
| 15  | Staff fixes a real donor's address in the copy                                    | Discarded. The form note points to the current system.                                                                                                              |
| 16  | Production release changes after the dress rehearsal                              | Go/no-go shows it; re-run or record acceptance.                                                                                                                     |
| 17  | Rehearsal environment migrations lag production                                   | Build refused: "Rehearsal environment updating".                                                                                                                    |
| 18  | Two dress rehearsals requested together                                           | The second waits, or replaces the first after confirmation. Builds queue environment-wide.                                                                          |
| 19  | Copy expires mid-session or mid-build                                             | The session ends with a notice. Jobs cancel at the next chunk, then the copy is destroyed.                                                                          |
| 20  | Go/no-go "Go", or the Switch is abandoned                                         | Destroyed automatically.                                                                                                                                            |
| 21  | Agreement ends                                                                    | All copies are destroyed and custody is disposed.                                                                                                                   |
| 22  | Practice-run source file disposed                                                 | Its copy is destroyed.                                                                                                                                              |
| 23  | Rehearsal environment restored from backup                                        | The purge ledger re-runs before the environment reopens.                                                                                                            |
| 24  | Rehearsal environment down or unapproved near go/no-go                            | The Switch cannot pass go/no-go (stated dependency). A monitor alerts Asym.                                                                                         |
| 25  | Ministry asks to keep the copy for training                                       | No. Destroyed at "Go".                                                                                                                                              |
| 26  | Production tenant already holds Parties (for example from a Phase 28 self-import) | Matched records are copied at their current revision, so match and update paths are rehearsed.                                                                      |
| 27  | Plan references a fund created after the copy                                     | Configuration is fixed at build; rebuild.                                                                                                                           |
| 28  | Rehearsal deployment configured with the production database URL                  | Startup fails: a database identity singleton must read "rehearsal".                                                                                                 |
| 29  | No access list chosen                                                             | Measure-only: destroyed when the run ends.                                                                                                                          |

## Disposition

**Accept with required amendments.** C is built as Practice copies in one Approved rehearsal environment. Fork (i) is rejected. A passed dress rehearsal is required before go/no-go. This keeps Q1 clause 4's ratified "measured in rehearsal" and makes B part 4's rewording unnecessary.

## Corrected decision text

**Q6 — Rehearsal mode: B's practice runs plus a dress rehearsal in a Practice copy.**

1. **Practice runs** are B parts 1–5 unchanged (O28 included), in the production Tenant.
2. **Dress rehearsal.**
   - **What it does:** commits one practice run's plan through the owners' import commands into a **Practice copy** of the Tenant in the Approved rehearsal environment. It stops and resumes once, and records per-family commit times.
   - **Gate:** go/no-go requires that the latest dress rehearsal passed.
   - **Pause length:** its measured time plus margin sets the declared pause length. Go/no-go shows its date and release, and any later release change.
3. **Rehearsal environment.**
   - **Separate:** its own database and deployment in production's region, deployed and migrated with each production release.
   - **Closed by construction:** no live provider credential, no public route, no donor app, no sign-up. Email reaches only the copy's access list; everything else stays in the copy's Practice outbox.
   - **Refused there:** provider keys, domains, webhooks, settlement bindings, AI integrations and tax-document issuers.
4. **What a copy holds:**
   - the allowlisted configuration, with original IDs;
   - the existing records the plan matches or updates;
   - the plan's rows.

   Nothing else. It is never promoted, and returns only content-free results to production.

5. **Access and identification.**
   - **Who:** a ministry member with the Switch decision capability chooses current members holding Switch capabilities. Production revokes their access when their membership or capability ends.
   - **Same floor:** the Q5 floor applies unchanged.
   - **Asym:** Asym help access never enters a copy.
   - **Identification:** a persistent text banner with the deletion date, a "Practice" page-title prefix and a separate host.
6. **Lifetime.**
   - **Count:** one live copy per Tenant; a new dress rehearsal replaces the old one.
   - **Duration:** 14 days from ready, with one extension of up to 14 days and a reason.
   - **Ends early on:** go/no-go "Go", the Switch abandoned, the agreement ending, a ministry request, or any erasure, new restriction or source disposal on the Switch. Measure-only copies end when the run ends.
7. **Destruction.**
   - **Order:** access revoked first, then a resumable purge of all of the copy's rows and objects.
   - **Receipt:** stating the live deletion time and the backup expiry (7-day backups, PITR off; restores re-purge).
   - **Delay:** destruction unfinished after 24 hours is an incident.
8. **Evidence.** Copy results are rehearsal evidence only. They never stand in for practice runs, reconciliation sign-off, recovery exercised at the live switch, the C23 gate or production readiness.

## Required amendments to Q1, Q2 and Q5

- **Q1 clause 3:** after "no outward effect" add "in the production Tenant; a dress rehearsal additionally commits one practice run's plan into a Practice copy in the Approved rehearsal environment (Q6), never into the production Tenant".
- **Q1 clause 4:** "measured in rehearsal" becomes "measured in the latest passed dress rehearsal, plus margin".
- **Q1 clause 10:** add "This applies to the production Tenant; Practice copies are destroyed whole (Q6)".
- **Q1 clause 12:** add "Any erasure, new restriction or source disposal on a Switch destroys its live Practice copy within 24 hours".
- **Q2 clause 2:** add "Practice-copy results are rehearsal evidence and never qualify a profile or stand in for recovery exercised at the live switch".
- **Q2 clause 5(a):** the agreement covers Practice copies (purpose, environment, region, access, lifetime, deletion receipt, backup expiry).
- **Q2 clause 5(b):** add "A Practice copy is a disposable rehearsal of that Tenant, not a Tenant for Q1 clause 1".
- **Q2 clause 6:** replace its last sentence with "Real exports and data derived from them are held only in Approved environments: production, and one Approved rehearsal environment used only for Practice copies. Preview, development and local never hold them." Add checks for the rehearsal environment:
  - (7) no live provider credential, confirmed by live read-back;
  - (8) no public route, sign-up disabled, and users limited to copy access lists;
  - (9) 7-day backups with PITR off, a purge ledger, and the same region as production.
- **Q5 clause 5:** "Allowed" adds "never inside a Practice copy".

## New owner requirements

| #   | Requirement                                                                                                                                                                                                                                                                                                                      | Owner                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| O29 | Approved rehearsal environment: a Supabase project, Vercel custom environments for admin and missionary, an Inngest custom environment, a separate Sentry project; deployed and migrated by the production release; a database identity singleton checked at startup; a live-key refusal in `@asym/env`; a new protected target. | Platform / security         |
| O30 | Environment-level effect guard at the single email seam, the Payload adapter and Auth SMTP (allowlist plus Practice outbox), and refusal of tenant provider credentials, domains, webhooks, AI egress and issuer activation in the rehearsal environment. One test per door.                                                     | Phase 6 / 12 / 13 / 18 / 24 |
| O31 | Remove the platform-key Stripe fallback and the any-tenant USD lane for tenant-scoped charges (also Q1 review v6-17). Fix the hard-coded tenant in `org-settings.ts`.                                                                                                                                                            | Phase 13 / 12               |
| O32 | Practice-copy access: grants from production, revoked by production, with an allowlisted invite command and a deny-by-default before-user-created hook.                                                                                                                                                                          | Phase 12                    |
| O33 | Practice-copy purge and deletion receipt, gated on database identity. A ratified statement that tenant lifecycle retention rules (D40-AC104, D41-AC018, D31) do not apply to Practice copies in the rehearsal environment.                                                                                                       | Phase 24 / 29 with Phase 30 |

## Delete, and do not build

- A tenant class or effect predicate in production.
- Production tenant provisioning or purge.
- A tenant switcher for copies.
- Per-copy Supabase projects.
- Vercel Authentication on the rehearsal hosts.
- Donor-app or public-page rehearsal.
- Asym access to copies.
- Copy promotion.
- Rewording B part 4.
