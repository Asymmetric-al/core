# Q6 v2 review: users, operations, simplicity and proof

Independent, read-only review of `q06-decision-as-asked.md` (Option C: B plus a temporary copy of the ministry's account). Baseline develop `629cb71dc`, 2026-11-02. Not legal advice.

Labels: **verified fact** (page fetched by this reviewer on 2026-11-02); **repo fact** (file:line); **inference**; **assumption** (names what would settle it). DL = `grill/decision-log.md`; Q6 = `q06-decision-as-asked.md`; env = `docs/ops/environments.md`.

## Bottom line

C is worth having: it is the only option that shows staff their own data in the real app and that **measures** the giving pause, keeping Q1 clause 4's ratified "measured in rehearsal" (DL:32) that B would have reworded (Q6:16). As asked, it is underspecified where it hurts users and a small team: copies inside production need a rehearsal check in about ten effect seams and every future all-tenant job; one person belongs to one tenant today; cloning remaps every ID; destruction collides with no-cascade owner rules.

**Design-fork verdict: a separate Practice environment (ii), narrowed.** One standing environment approved like production; Mission Control only on its own host; no live or production credential of any provider; copies keep their IDs; builds run one at a time; a copy is required once before go/no-go, lasts 14 days and is deleted with a receipt. **Keep O28** (the final switch still needs a per-row plan before commit, and mapping iteration cannot wait hours). **Delete** B's synthetic estimate and bespoke "as it will appear" renderer.

---

## Design fork: (i) special tenants inside production vs (ii) separate Practice environment

| Criterion                        | (i) Copy tenant in production                                                                                                                                                                                                                                                                                                                                                                                                         | (ii) Practice environment                                                                                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Donor-visible effect impossible? | Only if every seam honours a tenant-class check. A missed or future seam fails **open**, because live credentials sit in the same runtime. Today: the platform Stripe key fallback (`packages/api/src/stripe/tenant-client.ts:64-66`), an email seam with no tenant gate (`packages/email/resend/send.ts:211`), and a public CMS resolver that ignores `isActive` (`apps/admin/src/cms/public/resolve-tenant.ts:89-104`) (repo facts) | Structural. No credential that can reach a donor exists in the environment, so a bug produces a failed call, not a donor email or charge (inference)                                        |
| Seams to guard                   | About 10 live seams plus 9 unbuilt owner seams, each a new owner requirement (r3 §1d, minimum design 2)                                                                                                                                                                                                                                                                                                                               | About 4 live seams in one environment: email send, Stripe resolver, public routes and Payload email. Owners need not know rehearsal exists (inference)                                      |
| Logins                           | One tenant per identity (`packages/auth/context.ts:297-302`); Payload users hold one `tenantId` (r3 §2). Staff need a second email address, or an unbuilt switcher                                                                                                                                                                                                                                                                    | A separate sign-in by invitation. No identity collision                                                                                                                                     |
| Cloning                          | Global UUIDs force a new ID for every row across 152 tenant foreign keys (r3 §2); `campaigns.slug` is globally unique (`20260214090000_foundation_1_schema.sql:21`, `:665-666`)                                                                                                                                                                                                                                                       | A separate database, so rows keep their IDs and nothing is remapped (inference)                                                                                                             |
| Destruction                      | Blocked by NO ACTION keys and by no-cascade and append-only owner rules, which need class exceptions (r3 §4). Copy rows stay in production backups                                                                                                                                                                                                                                                                                    | Purge one tenant in an environment that holds nothing of record. Backups age out after 7 days on Pro ([Supabase backups](https://supabase.com/docs/guides/platform/backups), verified fact) |
| Production load                  | Multi-hour commits compete with real tenants; concurrency is keyed per tenant (r3 §6)                                                                                                                                                                                                                                                                                                                                                 | Production only reads the rows being copied                                                                                                                                                 |
| Release parity                   | Automatic                                                                                                                                                                                                                                                                                                                                                                                                                             | Must be enforced. The release-health commit already exists (env:449-451)                                                                                                                    |
| Approval and custody             | Rides on production's approval (none is Approved today, DL:62)                                                                                                                                                                                                                                                                                                                                                                        | A second Approved environment. It holds no source files, so no Phase 29 custody profile is needed there (inference)                                                                         |
| New mechanism                    | Tenant class, clone and purge inside production                                                                                                                                                                                                                                                                                                                                                                                       | A server-to-server copy job and a content-free status channel back                                                                                                                          |
| Cost                             | About $0 extra infrastructure                                                                                                                                                                                                                                                                                                                                                                                                         | A standing environment of roughly $25–$200 a month (see P1)                                                                                                                                 |

**Verdict: (ii).** The founder's bar is that a donor-visible effect must be impossible, and only (ii) makes that a property of the environment rather than of every future feature. (ii) also removes ID remapping, the identity collision and the production-side destruction exceptions. Its costs are a second Approved environment, a parity check and a copy job. These are bounded, and they belong to operations rather than to every owner. A third variant, restoring a production backup and purging the other tenants, is rejected: it briefly holds every tenant's data outside production.

---

## 1. Overengineering — material concern (moderate)

**O1. C as asked leaves its shape open, and the natural reading is the heaviest.** Sev medium · Lik high · **Changes the answer.** Q6:22 allows copying "a practice run" with no cap, place, access rule or lifetime; the minimum safe in-production design needs a tenant class, a configuration clone, nine owner permits, a destruction exception and privacy coupling (r3 §1d, §3–§5, spot-checked). **Fix:** one Practice environment, Mission Control only, one copy per Switch, required once before go/no-go. **Not in v1:** Asym access, write-back, exports, a copy per practice run, missionary or donor access, imports inside the copy.

**O2. C makes two parts of B redundant.** Sev low · Lik high · Narrows. B part 4's synthetic estimate (Q6:16) is unused once the pause is measured; B part 3's "as they will appear" rendering (Q6:15) has no owner text (r1 §6) and duplicates the copy. **Fix:** delete the estimate; replace the renderer with a staged-record view (mapped fields, linked rows by source ID, totals).

**Not overengineering: O28** (Q6:14). The ratified rule requires "exactly what would be created/updated/skipped/merged, per-row detail, before anything commits" (`owner-constraints.md:364-365`, via r1 §1); at the real switch the final manifest exists only after the boundary (DL:31), so no copy can be that plan, and practice runs are the fast inner loop. The copy **tests** O28: a row the plan accepted but the commit rejected is a defect.

## 2. UX/UI and user friction — material concern (high)

**U1. Practice and real get mixed up.** Sev high · Lik medium. Narrows. Phase 24 already required "Persistent private status" so a private Site is not mistaken for live (r1 §6); vendors use a named banner, distinct host and gated public pages (r4 §2, e.g. [Stripe](https://docs.stripe.com/sandboxes/dashboard/manage)); WCAG 1.4.1 and 2.4.2 apply (r4 §2, verified-primary). **Fix:** a text banner on every page with the deletion date and a "Go to your real account" link; every `<title>` starts "Practice copy ·"; a separate host; a one-time explanation at first sign-in; and the copy is **deleted at go-live**, so none exists once the real account is the system of record (before go-live, real work happens in the old system; inference).

**U2. Getting in.** Sev medium · Lik high. Narrows. A second sign-in is unavoidable under (ii). Supabase's built-in mailer "will refuse to deliver messages to addresses that are not part of the project's team" ([Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp), verified fact), so invitations need custom SMTP. Vercel Authentication admits only Vercel team or project members, granted Vercel users, or shareable-link holders ([Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication), verified fact), so it **cannot** be how ministry staff get in. **Fix:** an "Open practice copy" button on the real Switch page goes to the Practice sign-in with the email filled in; one invitation per member per copy; sign-ups off; a single-sign-on handoff is deferred until sign-in rates show friction (M-Q6-5).

**U3. Waiting hours for a build.** Sev medium · Lik high for large ministries. Narrows. **Fix:** a background build; the real Switch page shows stage, done/total and elapsed time per family, and queue position, with no ETA (ADR-0173 clause 27's no "time promises", r1 §4). Milestones are polite status messages (WCAG 4.1.3, [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), verified fact). Staff may leave; the Switch lead is notified on ready or failure. Cancel stops after the current chunk. A failed build offers Resume (a free recovery exercise) or Delete.

**U4. Lost edits and expiry surprise.** Sev medium · Lik medium. **Fix:** deletion date always in the banner; warnings 3 days and 1 day before (in-app and email to the Switch lead); one 14-day extension with a reason; afterwards the host shows "This practice copy was deleted on {date}". WCAG 2.2.1 is not engaged: a limit "longer than 20 hours" is excepted ([2.2.1](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html), verified fact).

**U5. Blocked actions must explain themselves.** Sev medium · Lik high. A silent no-op reads as a bug. **Fix:** sending, charging, publishing, provider connections, invitations, exports, downloads and document generation show "Not available in a practice copy", saying what would have happened ("This email would have gone to 1 person").

**U6. Turning findings into fixes.** Sev medium · Lik high. Write-back would be a reverse content path. **Fix:** each imported record shows its source file, row and source ID; the real account's practice run is searchable by source ID; staff fix the mapping there and rebuild.

**U7. Who gets in.** Finance staff checking totals is plausible (assumption; the design-partner interview settles it). **Fix:** a member picker at build (default: Switch lead and Data Tools members), each with their real-account role and clearance under the Q5 alias floor (DL:174-178); never donors, missionaries or Asym staff, who help by coaching only (DL:165-169).

**Donor and missionary effects:** impossible by construction. The donor and missionary apps are not deployed in the Practice environment, and no credential exists there that could reach a donor (inference, tested by AC1–AC3).

## 3. Operational burden — material concern (moderate)

**P1. A standing environment.** Sev medium · Lik certain. Narrows.

- **Vercel:** Pro includes **1** custom environment per project; more cost "$50 per month for each pack of five" ([Vercel environments](https://vercel.com/docs/deployments/environments), verified fact), and `development` already uses the slot (env:237-242, repo fact). Use a separate `admin-practice` project or buy the pack.
- **Supabase:** about $15 (Small) to $110 (Large) a month, billed hourly; resizing takes "less than 2 minutes of downtime" ([compute](https://supabase.com/docs/guides/platform/compute-and-disk), verified fact).
- **Inngest:** "Each environment has its own event keys and signing keys" and "Data stays inside its environment" ([Inngest environments](https://www.inngest.com/docs/platform/environments), verified fact); the Practice environment uses its own, never production keys.
- Plus custom SMTP, one DNS name and a Sentry environment tag. **Fix:** a runbook for creation, one Q2 read-back approval, re-check at every release, and teardown.

**P2. Credential drift is the main residual risk.** Sev high · Lik low-medium. One pasted production key reopens every door. **Fix:** run the existing `verify:vercel-env-inventory` (`package.json:94`) daily against the Practice environment, failing on any `sk_live_`/`pk_live_` key, production Supabase ref, or production Resend, Inngest, Blob, Cloudinary or AI credential; failure blocks builds (M-Q6-1).

**P3. Support load.** Failed builds, purge failures and queue waits each need an owner (the monitors below). The help log stays content-free (DL:194-196).

## 4. Observability and auditability — material concern (moderate)

**A1. The copy's life is invisible unless the real account records it.** Sev medium · Lik high. **Fix:** the real Switch history records each request (who, practice run, mapping version, release), the build (start, end, per-family counts and durations, forced interruption and resume, mismatches), sign-ins, extensions, and deletion with its receipt. The only channel back carries a content-free schema (stage, counts, durations, member IDs, timestamps; AC15). Q5 clause 8 telemetry (DL:194) labels the environment, so a copy never counts as a switch.

**A2. Deletion proof.** Sev medium · Lik certain. **Fix:** the receipt records time, actor or automatic reason, rows deleted per family, a census showing zero rows remain, members removed, and "Backups containing it expire by {date}" (deletion plus plan retention: 7 days Pro, 14 Team, up to 30 Enterprise; verified fact, Supabase backups). Practice backups are never restored; an environment failure means rebuilding it empty, putting backups "beyond use" (r4 §3).

## 5. Scalability and performance — material concern (moderate)

**S1. Build time is unknown and may be hours.** Sev medium · Lik high. No throughput figure exists (r1 §4); 550k rows at 50 per step is 11,000 steps, at least 11 chained runs under Inngest's 1,000-step limit (r1 §8, derived). Background jobs cannot yet carry a staff actor's authority (DL:357, repo fact); the real switch needs that anyway, but C makes it a prerequisite **before** go/no-go. **Fix:** chunked, resumable builds run as the requesting member, whose access is copied.

**S2. Concurrent switches.** Sev low-medium · Lik low early. **Fix:** one build at a time per environment (timings stay clean); others queue with position shown; no global copy cap, with disk and cost watched (M-Q6-5, M-Q6-6).

**S3. Timing fidelity.** Sev high · Lik medium. **Changes the go/no-go text.** An isolated, smaller database understates the production commit. Q1 clause 4 has two durations a single "pause" figure would hide: the **online-giving pause** (until Parties, contacts and suppression commit and reconcile) and the **editing pause** (until the remaining families commit) (DL:32). **Fix:** the Practice database uses production's compute size; go/no-go shows both legs, the first starting with the admin's own export timing (DL:56); proposed maximums are measured × 1.5, rounded up to 30 minutes, never below the measurement; at the switch each projection scales by final-manifest row counts, and Q1's abort default applies before commit if one exceeds its maximum (DL:31).

## 6. Migration, rollout and upgrade — material concern (high)

**R1. Release and schema parity.** Sev high · Lik medium. Evidence from another release proves nothing. **Fix:** a build is refused unless the Practice release commit and migration head equal production's (release health, env:449-451); the release script deploys and migrates both; a release landing mid-build marks that build not valid for go/no-go; a failed Practice migration deletes its copies and resets the environment (it holds nothing of record).

**R2. The design partner's critical path.** Sev high · Lik medium. **Changes the answer.** A required copy puts an Approved Practice environment on the path to the first switch. None is Approved today (DL:62); production's real-data status is unresolved (D13, DL:251), and env contradicts itself (Stripe "Live-mode" at :14 vs "test-mode … until go-live" at :377; repo facts). **Fix:** approve the Practice environment early; it is the easier one, since "nobody holds `super_admin` there" (DL:191) is trivially true of a new environment. If it is not ready at the partner's go/no-go, the **founder** decides between waiting and a recorded one-time estimated pause; no silent fallback.

**R3. Ratified text conflicts.** Sev high · Lik certain. C contradicts Q1 clause 3, "no target-owner write" (DL:31); Q2 clause 5(b), "its own Asym Tenant" (DL:61); and Q2 clause 6, "Non-production environments never hold real exports" (DL:62). **Fix:** the amendments in (b). The Practice environment is not "non-production": it is protected as production, authorised, logged, minimised and deleted after use, where NIST SA-3(2), the EDPS and ISO 8.33 converge (r4 §4).

## 7. Testability, traceability and proof — material concern (moderate)

**T1. Terminology.** "Practice run" is used throughout Q1–Q5 but not defined in `docs/features/imports-migration/CONTEXT.md` (grep, repo fact); the repo forbids "sandbox success as production proof" (`CONTEXT.md:5075`; also `:610-611`, `:6550`). **Fix:** add **Practice run**; **Practice copy** (_Avoid_: sandbox, test tenant, rehearsal tenant, staging account, shadow); **Practice environment** (_Avoid_: sandbox, staging, non-production, preview). Record ADR-IM-006. Say "practice" everywhere users see it; Q1's "measured in rehearsal" means "measured by the Practice copy build".

**T2. Evidence class.** Copy results set the pause and test O28; they never qualify a source profile or replace reconciliation sign-off. A forced interruption and resume in a build on the release used at the switch counts as Q2's "recovery exercised" (DL:54), settling r1 §5's open question without deliberately interrupting the real switch.

**T3. Proof.** The acceptance criteria are written to fail visibly; the plan/commit mismatch count is a direct, falsifiable test of O28.

## 8. Other development hazards — material concern (high)

- **H1. Hard-coded tenant writes.** Sev high · Lik certain once two copies coexist. `packages/api/src/admin/org-settings.ts:9` writes tenant `…0001` for any admin (repo fact; r3 §1a); in the Practice environment that is another ministry's copy. **Fix** before any copy exists (it is a production bug too).
- **H2. Stripe platform fallback** (`tenant-client.ts:64-66`, repo fact; Q1 v6-17); tenants also store secret keys in plaintext (r3 §2). **Fix:** the Practice resolver returns no key and refuses saving one; remove the fallback anyway.
- **H3. Copy-list drift.** **Fix:** CI fails on any unclassified tenant-scoped table. Never-copy covers credentials, settlement bindings, email settings, hosts and giving addresses, issuer and serial state (#944, r3 §1c), integrations, operator grants and logins.
- **H4. Forked commit path** voids timing and recovery evidence. **Fix:** same commit functions, only boundary and go-live gates removed (AC7).
- **H5. Other egress** (Eve's AI gateway, Discord webhook; r3 §1a). **Fix:** no AI or webhook credentials in the Practice environment.
- **H6. Same IDs in two environments.** **Fix:** every log, Sentry event and telemetry record carries the environment.

---

## Edge cases

- **Newer practice run exists:** the copy stays; banner reads "Built from practice run 7; latest is 9".
- **New build while a copy exists:** confirm, then delete and replace. **Expiry during a build:** the 14 days start when ready.
- **Staff inside at deletion:** session ends; the deleted-copy page shows.
- **Erasure or do-not-contact recorded against staged data:** the copy follows that practice run's F11 disposal, never outliving the staged data.
- **Real account already holds people** (for example a missionary self-import): copied, so matching is rehearsed (C23 "actual retained state", DL:231).
- **Plan/commit mismatch:** listed per row; go/no-go blocked until each is fixed or accepted as a visible exclusion.
- **Environment down:** go/no-go waits; production unaffected. **Compromised:** every copy deleted; agreement breach duties apply (Q2 clause 5(a)).
- **Legacy tail and backfills:** not rehearsed (copies end at go-live); backfills use B-style plans.

---

## (a) Disposition

**Accept C with required amendments.** Copies live in a separate, production-protected Practice environment, not in production. A copy is required once before go/no-go. Keep O28. Delete B's synthetic estimate and bespoke renderer.

Proposed owner requirements:

- **O29** Practice environment and its four seam guards (platform and operations).
- **O30** Copy or never-copy classification for every tenant-scoped table (all owners; enforced in CI).
- **O31** Background jobs carrying a member's authority (already needed for the real switch).

The `org-settings.ts` fix is a prerequisite.

## (b) Corrected decision text

**Q6 — Rehearsal mode. Option C (B plus a Practice copy), amended.**

1. **Practice runs.** As B parts 1, 2 and 5:
   - Each practice run stages the whole switch in the ministry's Tenant, with no target-owner write.
   - Each kit area provides a check without saving (O28), and the real commit re-checks.
   - Staff see staged records as mapped fields, linked rows and totals.
   - A new practice run replaces the previous one.
2. **Practice copy.** On request, a ministry member holding the Switch decision capability builds a temporary copy of the account from one practice run, in the Practice environment. That practice run is committed into the copy through the owners' import commands, using the same code as the real switch without the boundary and go-live steps. There is one copy per Switch; a new build replaces the old one.
3. **Practice environment.**
   - A separate Approved environment, protected as production, running the same release and migrations as production.
   - It serves Mission Control only, on its own host, and runs one build at a time.
   - It holds no live or production credential of any provider and never holds source files.
   - Sending, charging, publishing, public pages, provider connections, invitations, exports, downloads, document generation and AI are unavailable; each says so where it would appear.
4. **What is copied.** The Tenant's rows on the reviewed copy list, keeping their IDs, plus the practice run's staged records. Never copied: credentials, payment bindings, email settings, hosts and giving addresses, issuer and serial state, integrations, access grants, logins other than chosen members.
5. **Who gets in.**
   - Members chosen at build time (default: the Switch lead and Data Tools members), each with their real-account role and clearance; the restricted-data floor applies.
   - Members sign in by invitation to the Practice environment.
   - A reduction in a member's access in the real account applies to the copy within 15 minutes.
   - Never donors, missionaries or Asym staff.
6. **Using it.** Staff may view, search, edit, try workflows and run on-screen reports. Every change is deleted with the copy. Only content-free status (stage, counts, durations, sign-ins) returns to the real account. Imported records show their source file, row and ID; fixes are made in the real account's practice runs.
7. **Labelling.** Every page shows the text "Practice copy — changes are deleted on {date}. Nothing is sent, charged or published." with a link to the real account. Every page title begins "Practice copy ·". Meaning is never carried by colour alone. First sign-in shows a one-time explanation.
8. **Building.**
   - The real Switch page shows the stage, done/total per family, elapsed time and queue position, with no time promises, and notifies the Switch lead when the build is ready or fails.
   - Each build is interrupted once and resumed.
   - Cancel stops after the current chunk and deletes the copy; a failed build can be resumed or deleted.
   - Rows the plan accepted but the commit rejected are listed.
9. **Lifetime and deletion.**
   - **Expiry:** a copy is deleted at 11:59 pm in the giving time zone, 14 days after it is ready.
   - **Warnings:** 3 days and 1 day before deletion.
   - **Extension:** once, by 14 days, with a reason.
   - **Other triggers:** a new build, go-live, Switch cancellation, the end of the agreement, disposal of the practice run's staged data, or at any time on request.
   - **Receipt:** the Switch history keeps a deletion receipt (time, actor or reason, rows deleted per family, zero rows remaining, members removed, backup expiry date). Practice backups are never restored.
10. **Go/no-go.**
    - **Gate:** requires a completed build on the current mapping version, with no unresolved plan/commit mismatches.
    - **Measured times:**
      - (a) the online-giving pause: export as timed by the admin, then upload and checks, then people, contacts and suppression saved and reconciled;
      - (b) the remaining editing pause.
    - **Declared maximums:** default to measured × 1.5, rounded up to 30 minutes, and are never below the measurement.
    - **At the switch:** projections scale by final-manifest row counts; a projection over its maximum triggers Q1's abort default before commit.
11. **Evidence.** Practice-copy results never qualify a source profile or replace reconciliation sign-off. A build's interruption and resume, on the release used at the switch, counts as "recovery exercised".
12. **Amendments.**
    - **Q1 clause 3:** "no target-owner write in the ministry's Tenant; a Practice copy build precedes go/no-go".
    - **Q1 clause 4:** "measured in rehearsal" means measured by the Practice copy build.
    - **Q2 clause 5(b):** a Practice copy is not a Tenant.
    - **Q2 clause 6, last sentence:** "Only Approved environments hold real personal data; the Practice environment is one and never holds source files."
    - **Q5 clause 5:** Asym help access does not extend to Practice copies.
13. **Readiness.** If the Practice environment is not Approved when the design partner reaches go/no-go, the founder decides between waiting and a recorded one-time estimated pause.

## (c) Acceptance criteria

1. **AC1 — No outward effects.** In the Practice environment, every send, charge, refund, publish, invitation, provider connection, export and document action makes zero provider calls and shows "Not available in a practice copy". A copy whose Party uses a monitored inbox receives nothing.
2. **AC2 — No production credentials.** A daily inventory check finds no `sk_live_`/`pk_live_` key, no production Supabase project ref, and no production Resend, Inngest, Blob, Cloudinary or AI credential. Any hit blocks new builds within 1 hour.
3. **AC3 — No public reach.** The donor and missionary apps are not deployed. Public and CMS routes on the Practice host return 404 with `noindex`. Sign-up is refused.
4. **AC4 — Logins.** Auth users are exactly the chosen members of the current copies. Removal or reduced clearance in the real account takes effect in the copy within 15 minutes. An uncleared member sees restricted Parties only by alias.
5. **AC5 — Labelling.** Every Practice page has a text banner containing "Practice copy" and the deletion date. `document.title` starts "Practice copy ·". axe reports no violations.
6. **AC6 — Copy list in CI.** CI fails when any tenant-scoped table lacks a copy or never-copy classification. After a build, never-copy tables hold zero rows for the copy.
7. **AC7 — Same code, same counts.** The build runs the same owner commit functions as the real switch. Copied counts equal the plan's create and update counts per family, and every mismatch is listed per row.
8. **AC8 — Recovery.** Each build is interrupted once at a system-chosen chunk and resumes to identical counts, with no duplicate Source Record Binding. The interruption is recorded in the Switch history.
9. **AC9 — Go/no-go gate.** Go/no-go is refused without a completed build on the current mapping version, or with unresolved mismatches. A declared maximum below the measured leg is refused.
10. **AC10 — Projection at the switch.** At final-manifest seal, each projection equals the measured leg × (final rows ÷ rehearsal rows). A projection above its maximum shows the abort default before any commit.
11. **AC11 — Expiry.** A copy is deleted by 11:59 pm (giving zone) on its expiry date. Warnings arrive 3 days and 1 day before. A second extension is refused.
12. **AC12 — Automatic deletion.** A new build, go-live, cancellation or staged-data disposal deletes the copy within 1 hour.
13. **AC13 — Deletion receipt.** After deletion, a census of every tenant-scoped table returns zero rows for the copy. The receipt lists the time, actor or reason, per-family counts, members removed and the backup expiry date.
14. **AC14 — Real account untouched.** Building, using and deleting a copy leaves the real Tenant's target-owner tables unchanged (row counts and checksums).
15. **AC15 — Content-free channel.** Production accepts from the Practice environment only the content-free status schema (stage, counts, durations, member IDs, timestamps). Any other field is rejected.
16. **AC16 — Release parity.** A build is refused when the Practice release commit or migration head differs from production's. A release that lands mid-build marks the build not valid for go/no-go.

## (d) Monitors

| ID     | Signal                                                              | Threshold                                | Owner                                                    | Response                                                                   |
| ------ | ------------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------- |
| M-Q6-1 | Daily Practice environment credential and parity check              | Any failure                              | Asym environment approver (Q2 clause 9) with engineering | Block builds, fix, repeat the read-back                                    |
| M-Q6-2 | Copies past expiry and not purged                                   | Any copy > 24 h past expiry              | Engineering, with the relationship owner                 | Incident under the agreement, manual purge, root cause                     |
| M-Q6-3 | Actual switch legs vs measured legs                                 | Actual > measured × 1.25 at any switch   | Phase 30 spec owner, with the Switch lead                | Raise the default margin; investigate contention or compute parity         |
| M-Q6-4 | Plan/commit mismatches per build                                    | Any non-zero count at the design partner | Phase 30 spec owner, with the target owner               | Fix the O28 check; rebuild                                                 |
| M-Q6-5 | Share of invited members who sign in; builds per Switch; queue wait | < 50% sign in; > 3 builds; wait > 24 h   | Relationship owner, with the Switch lead                 | Consider a single-sign-on handoff; investigate mapping churn; add capacity |
| M-Q6-6 | Monthly Practice environment cost                                   | Above the founder-set budget             | Founder                                                  | Downsize idle compute; review need                                         |
