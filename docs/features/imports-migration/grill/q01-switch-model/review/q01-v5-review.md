# Q01 adversarial review v5: dependency/integration, migration/rollout, scalability/performance

Phase 30 Imports & Migration Tools (slug `imports-migration`). Discovery only. Reviewer v5, 2026-11-01.
Evidence baseline: `develop` 629cb71dc (worktree HEAD verified 629cb71dc206dd9aa7b2d5ed15aaf57914eee071). Phase 29 spec read from PR #2430 head 1483a349514c66b458da38e0ba0992efdc2e1f31.

Decision under review: founder Q1 answer (Option A, one planned switch per ministry) plus four presented refinements, and the founder's addition (full SiteStacker bring-over, prior payment-processor integration whether or not Stripe, edge cases).

Categories reviewed independently: (1) Dependency and integration risks; (2) Migration, rollout and upgrade risks; (3) Scalability and performance risks. Concern ids prefixed `v5-`.

Status: COMPLETE (all three categories and summary written 2026-11-01).

## 0. Method and evidence checked

- **Read in full or in sections:**
  - `grill/decision-log.md`;
  - q01-r1 §4-§7;
  - q01-r5 §3-§4;
  - prior gap research r10-gap-g1, g3, g4 and g6, and r06 (grepped).
- **Re-verified on develop 629cb71dc (repo-integrated unless noted):**
  - `roadmap.md:4320-4420`;
  - `owner-constraints.md:329-455`;
  - Phase 13 PRD `:155-167`, `:536-546`, `:655-665`, `:720-746`, `:1020-1042`, `:2188-2200`;
  - Phase 16 PRD `:1236`, `:1264`, `:1279`, `:1295`, `:1314`, `:2085`;
  - `packages/api/src/stripe/tenant-client.ts:44-66`;
  - `donor-portal/billing.ts:17-40`;
  - `stripe/event-store.ts:154` and `stripe/recurring.ts:95`;
  - `workflows/events.ts:22,75-91` and the function concurrency settings;
  - `supabase/migrations/20261024140000…:157-164` and `20261024141000…:1-30,105-117`;
  - `docs/ops/environments.md:5-16`;
  - ADR-0179 `:1-40`;
  - `roadmap.md:428-436`;
  - `apps/admin/vercel.json`, which sets no `maxDuration`.
- **GitHub (GET only, 2026-11-01):**
  - Still OPEN: #2347 (Ready), #2087 (Ready), #834, #809, #570, #645, #2295, #512, #513, #711, #692.
  - PR #2430 is OPEN, not draft and unmerged, at head 1483a349….
  - #2087 comment 6393929266 sets `IMPORT_TENANT_CONCURRENCY` = 1.
  - #2087 body AC28-R25-01 states the limits; #2347 body line 22 states the bounds.
- **Phase 29 spec at PR head** (`openspec/changes/add-files-documents/specs/files-documents/spec.md`): AC29-D22-01 and AC29-D23-01.
- **External sources (verified-vendor-doc, accessed 2026-11-01):**
  - Inngest usage limits (https://www.inngest.com/docs/usage-limits/inngest);
  - Stripe rate limits and read allocations (https://docs.stripe.com/rate-limits);
  - Microsoft Learn go-live checklist (https://learn.microsoft.com/en-us/dynamics365/guidance/implementation-guide/prepare-go-live-checklist).
- **Not re-fetched:** Stripe self-serve copy. The fetch returned only the variant index, so its claims are taken from the r4 and r5 verifier corrections, which accessed it on 2026-11-01. help.sitestacker.com was not retried; it gave HTTP 402 and TLS failures in prior tracks (decision-log.md:139).

Every concern below separates current behaviour, intended behaviour and the best permanent path. Nothing for imports is implemented on develop (decision-log.md:150).

---

## 1. Dependency and integration risks

**Material concern: YES.** Option A turns "one switch" into three dependencies at once:

- about eight unbuilt owner commands, all needed simultaneously;
- a hostile source vendor with no contract (SiteStacker/WMTEK), plus several processors, for a tail that lasts months;
- a current Stripe prototype path that would turn legacy provider IDs into live control.

What was checked: owner readiness (roadmap, owner-constraints, issue states); the Phase 13 migration-workstream text; Stripe integration code; SiteStacker export and vendor evidence (r1, r2, r7, g3); processor-side outward effects (r2-r5 verifier notes); and Stripe read allocations and rate limits.

### v5-D1 — One switch requires every in-kit owner command at once; missing owners silently convert Option A into area-by-area

- **What could go wrong:** Option A promises "one final export; import; reconcile …; Asym then becomes the only place for supporters and their history". Each family can only be written through its owner's typed import command, and none of those commands exists. So either no ministry can switch until the slowest owner ships, or ministries switch with history families excluded and import them later. The second path is a per-family sequence: Option B by owner readiness, which the founder rejected.
- **Why it matters:** It decides whether the first ministry switch can happen in the Phase 30 timeline at all, and whether the Q1 promise is true when it is made.
- **Evidence:**
  - `owner-constraints.md` (Phase 30, "Owner-domain import adapters") says adapters for "parties, relationships, historic gifts, commitments, custom fields/entities, files, and content activate only after the target phase and its typed import command exist" (repo-published).
  - `roadmap.md:4387` says "Begin with a complete low-risk source-to-Party import and exact repeat import, then add relationship/custom-data and source-qualified money/document/content targets" (repo-published). Money is sequenced after Party.
  - Issue states on 2026-11-01 (repo-published), all OPEN:
    - #570 Party spine;
    - #645 custom fields epic;
    - #512 and #513 merge/dedupe;
    - #711, whose body routes broader historical import "to the Phase 36 source owner" (D2);
    - #834 P16 classifier;
    - #809 formal cutover.
  - The Phase 7 import fact is undefined (D4).
  - The Phase 29 custody spec is unmerged (PR #2430). AC29-D23-01 says "Unknown limits block that profile".
  - Nothing is implemented (decision-log.md:150).
- **Severity / likelihood:** high / high.
- **Effect on answer:** narrows.
- **Best permanent fix:** Record Option A with an explicit **Minimum Switch Kit**: the families that must be owner-ready and committed before a ministry may go live.
  - Every other family is **Deferred History**. Its final-snapshot bytes are retained in Phase 29 custody, and it is imported later only as a manifest extension against the same Switch Boundary. Its coverage is declared incomplete until then (C22).
  - This is not Option B, because SiteStacker is authoritative for nothing after the boundary. Only Asym-side history arrives later.
  - The founder must say whether historic gifts are in the Minimum Switch Kit. If they are, the first switch waits on the Phase 13 typed import command, the Phase 7 import fact and Legal Entity evidence (O4).
- **Spec language:** "Q1 (amended): A ministry switch goes live only when every Minimum Switch Kit family is owner-ready, committed and reconciled. The v1 Minimum Switch Kit is [founder to list; proposed: Parties and households, contact points, consent and suppression evidence]. A family outside the kit, or not owner-ready at the switch, is recorded on the Switch as Deferred History. Its final-snapshot artifacts are retained under Phase 29 custody, and it may be imported later only as a manifest extension bound to the same Switch Boundary. Until that import is reconciled, the family's history coverage is declared incomplete. 'Asym becomes the only place for supporters and their history' applies to committed families; for Deferred History it means 'no other system is authoritative', not 'history is present'."
- **Bucket:** resolve_before_recording.

### v5-D2 — SiteStacker/WMTEK is an uncontracted, version-drifting integration for the whole tail

- **What could go wrong:** Refinement (2) and the tail need SiteStacker to stay licensed and readable, with an export user and a stable export shape, for months after the switch. Over that time:
  - SiteStacker keeps shipping releases, and the release notes are login-gated.
  - The help centre is inactive.
  - Exports have no documented columns.
  - Some BI datasets must be built by WMTEK.
  - A Stripe vault held on a SiteStacker-controlled Connect platform can only be copied with the platform owner's cooperation.

  The failure modes follow directly. A mid-tail SiteStacker upgrade changes headers and invalidates the catch-up mapping. Contract termination removes the source. A WMTEK refusal blocks BI-only families.

- **Why it matters:** Asym holds none of these levers. The owner text names SiteStacker's incentive: "Migration friction is SiteStacker's moat; this is the battering ram" (`owner-constraints.md`, kit bullet; repo-published).
- **Evidence:**
  - decision-log.md:139: the help centre returns HTTP 402, and releases reach at least 2.56 (snippet-only).
  - decision-log.md:160: there is no documented relational export, read API or exit package.
  - The vendor manual says WMTEK builds BI reports (r1 summary; verified-vendor-doc via r1).
  - Copying out of a Connect platform needs the platform owner, and partial copy is unavailable for Connect accounts (r4 and r5 verifier notes; verified-vendor-doc, docs.stripe.com pan-copy-self-serve, 2026-11-01).
  - SiteStacker has no change feed (g4; decision-log.md:140).
  - Export version is recorded per file in r1 R19/X13 and r5 E-24, but only for practice versus final runs, not for the tail.
- **Severity / likelihood:** medium-high / medium.
- **Effect on answer:** changes. Refinement (2) needs source and continuity conditions.
- **Best permanent fix:**
  - Make SiteStacker continuity a go/no-go readiness item: licence, an unrestricted export user and read access are kept until the recorded tail closure date.
  - Every catch-up is a new manifest with a header-set check against the version-pinned profile. A changed header set means the manifest is rejected and re-mapped, never parsed.
  - Processor reports are the primary source of tail money facts. SiteStacker exports corroborate them (see v5-D3).
  - Every WMTEK-dependent item is recorded as a readiness dependency with a named fallback (census-only or visible exclusion).
- **Spec language:** "Readiness requires the ministry to attest that its SiteStacker licence, an unrestricted export user and read access remain in place until the Switch's recorded tail closure date. Every catch-up is a new source manifest. A header set or SiteStacker version that differs from the pinned catch-up profile rejects the manifest with a cause-owned 're-map required' action. No catch-up row is parsed under a stale mapping. Each family whose only source is a WMTEK-built dataset is marked 'vendor-dependent' at readiness with a declared fallback disposition."
- **Bucket:** spec_requirement.

### v5-D3 — Tail money linkage depends on an unverified export column (gateway transaction ID)

- **What could go wrong:** Several post-switch money facts exist only at the processor:
  - dashboard refunds;
  - chargebacks;
  - ACH returns;
  - PayPal subscription charges after SiteStacker is off.

  Linking these to imported gifts requires each SiteStacker export row to carry the processor charge or transaction ID, and that is unverified (r1 R10). Without the ID, Phase 13 forbids linking by email, name, phone or fingerprint, so every such fact goes to quarantine. Refinement (2)'s catch-up then produces a growing finance-exception backlog instead of reconciled history.

- **Why it matters:** Whether the tail can be reconciled at all, and finance staff workload for months.
- **Evidence:**
  - Phase 13 story 171 (`:539-542`): "quarantined for review rather than linked by email, name, phone, or payment fingerprint" (repo-ratified).
  - r1 R10: "Whether processor transaction, customer, token or subscription IDs appear in any export" (proposition, unverified).
  - r1 D13 (`q01-r1…:236`): SiteStacker refunds create a new "refund" transaction, but "Linkage to the original is undocumented". Chargebacks and ACH returns are "processor-only, unverified".
  - r1 verifier: PayPal tail gifts never reach SiteStacker once it is off (inferred).
  - AC29-D22-01 (PR head; repo-ratified, unmerged): "an imported CSV cannot certify financial coverage".
- **Severity / likelihood:** high / medium (unknown until a real export).
- **Effect on answer:** narrows refinement (2).
- **Best permanent fix:** Make R10 a readiness gate, measured on the first real export.
  - If the ID is present, tail facts from processor reports link by exact scoped external reference (Phase 13 `:723-725`).
  - If it is absent, processor-sourced tail facts enter only as unlinked finance exceptions. Before go/no-go, the ministry sees the expected exception volume, measured from the processor's last 120 days in the practice run.
- **Spec language:** "Readiness records, per processor account, whether SiteStacker Transaction View rows carry the processor's charge or transaction identifier. Where they do not, every processor-sourced late-tail fact is imported only as an unlinked finance exception under Phase 13 story 171. The go/no-go report states the projected exception count from the most recent 120 days of processor activity in the final practice run. Phase 30 never links tail money by amount, date, name, email or payment fingerprint."
- **Bucket:** spec_requirement.

### v5-D4 — Outward effects that originate at processors or SiteStacker are outside Asym's control and outside C23's measurable scope

- **What could go wrong:** Refinement (3) names three SiteStacker surfaces, and C23 requires "zero unintended send, enrollment, payment or public effect". Many sends originate outside Asym:
  - Stripe ACH mandate-confirmation emails on payment-method imports that include emails. These are avoidable only by importing as bank-account objects or omitting emails.
  - Stripe refund emails on the old account.
  - Gateway receipts (PaymentSpring `send_receipt`).
  - PayPal subscription notices.
  - SiteStacker Contribution Receipt and Declined messages.
  - Missionaries' own Mailchimp lists. These come from a one-way manual export, so turning sync off does not stop them.

  Asym can neither measure nor stop any of these. An acceptance claim of "zero unintended send" is therefore unfalsifiable as written.

- **Why it matters:** C23 is the release gate. A gate that cannot be tested gets signed off on assumption.
- **Evidence:**
  - `roadmap.md:4399`, `:4403` (repo-published).
  - Stripe payment-method-imports "ACH emails" and the Stripe refunds email setting (r5 verifier; verified-vendor-doc, 2026-11-01).
  - PaymentSpring `send_receipt` (r2 edge cases; verified-vendor-doc via r2).
  - Mailchimp missionary module 151000122392 (r1 verifier; verified-vendor-doc).
- **Severity / likelihood:** medium / high.
- **Effect on answer:** narrows refinement (3) and what C23 means in operation.
- **Best permanent fix:** Split acceptance in two:
  - **Measured:** zero Asym-originated unintended effect, testable through batch-origin suppression evidence (`owner-constraints.md`, "Background processing").
  - **Attested:** every external effect source in the census is recorded as confirmed off, intentionally on (with a named owner and reason), or not used.
- **Spec language:** "Switch acceptance proves zero unintended Asym-originated send, enrollment, payment or public effect from run evidence. External effect sources (SiteStacker messages and automations, processor or gateway emails, PayPal notices, Stripe import emails, missionary-owned Mailchimp accounts, text-to-give replies) are listed in the outward-effect census. Each is recorded as 'confirmed off', 'intentionally on' (with a named owner and reason) or 'not used', with actor and time. The Switch never claims these are silent."
- **Bucket:** spec_requirement.

### v5-D5 — The current Stripe prototype would turn a migrated Stripe ministry's legacy account into live control

- **Current behaviour (repo-integrated):**
  - `resolveTenantStripe` reads a plaintext `tenants.stripe_secret_key` and falls back to the platform key (`tenant-client.ts:44`, `:65-66`).
  - The donor portal opens Stripe's whole-account Billing Portal for `donors.stripe_customer_id` (`billing.ts:39-40`).
  - Event and recurring tenant routing comes from metadata (`event-store.ts:154`, `recurring.ts:95`).
- **Intended behaviour (repo-ratified):**
  - Account Links onboarding of a new connected account, with "Do **not** use OAuth".
  - An effective-dated Settlement Account Binding, "never a stored tenant key" (Phase 13 `:659-665`).
  - Any other account or executor is a formal cutover (P16 `:1314`).
- **What could go wrong:**
  - For a ministry already on Stripe, the path of least resistance is to paste its existing secret key. That is exactly the same-account reuse the ratified design forbids.
  - Stripe self-serve copy keeps Customer IDs identical across accounts (r4 verifier; verified-vendor-doc, 2026-11-01). Suppose any SiteStacker-era `cus_` ID is written into `donors.stripe_customer_id`. A donor could then open the old account's Billing Portal and change the payment method SiteStacker's cron charges. Or the same ID resolves on two accounts.
  - #692 (Connect slice and account-scoping wrapper) is still OPEN.
- **Severity / likelihood:** high / medium. The likelihood depends on whether #692 lands before the first switch.
- **Effect on answer:** no_change to Option A; it is a safeguard Option A needs.
- **Best permanent fix:**
  - A migrated tenant cannot go live while the plaintext-key or platform-fallback path can serve it.
  - Provider IDs from SiteStacker or processor exports are inert lineage. They are never written to `donors.stripe_customer_id` or any field a live client resolves.
- **Spec language:** "Go/no-go is blocked while the tenant can resolve a Stripe client from `tenants.stripe_secret_key` or the platform-key fallback. Provider identifiers from source exports are stored only as scoped, inert source lineage (tenant, provider, account, mode, object). No import writes them to any column read by checkout, the donor portal, refunds or webhook routing. Acceptance includes a fixture in which the same `cus_` ID exists on two accounts and no live path resolves it."
- **Bucket:** implementation_safeguard.

### v5-D6 — Option A's "freeze" and "reconcile" are assigned by name to a separate migration workstream that no phase owns

- **What could go wrong:**
  - Phase 13 assigns "cutover freezes, and bulk reconciliation" to "the separate migration workstream". Its Out of Scope list adds "connected-account readiness, and recurring-executor replacement at scale".
  - If Option A, including its freeze and its count and per-currency reconciliation, is recorded as a Phase 30 decision, a consumer acquires a producer's duty by shorthand. C3 forbids that unless the producer clause is edited.
  - Go-live does not need the processor half, because legacy executors stay external read-only. Tail closure does need it.
  - With no owner, the processor half never starts: no vault transfer, no re-authorization, no executor replacement. The tail then never closes (v5-M5).
- **Why it matters:** This governance dependency decides whether the tail can ever close.
- **Evidence:**
  - Phase 13 `:743-746`, `:2192-2199` (repo-ratified).
  - Phase 13 `:165` assigns "Full CRM data migration at scale … historical giving" to "the migration workstream" (deps 4/9/11). That portion is effectively Phase 30's (roadmap `:4341`, `:4363`; inferred, per the r4 verifier).
  - C3 (`docs/ai/document-authority.md:10-13`, `:30-38`).
- **Severity / likelihood:** medium / high.
- **Effect on answer:** changes. The decision must state the split and the owner edit it needs.
- **Best permanent fix:** Record the split explicitly:
  - **Phase 30:** CRM/history ETL, the Switch record, boundary and freeze attestation as run evidence, and the reconciliation report.
  - **Phase 16 or a named owner:** stop proof, the re-authorization campaign and executor replacement at scale.
  - **Phase 13:** connected-account readiness and mapping evidence.
  - **Ops runbook:** processor coordination.

  Then edit Phase 13 `:743-746` and `:2192-2199` to point at the named owners.

- **Spec language:** "Phase 30 owns the Switch record, Switch Boundary, freeze attestation evidence and the switch reconciliation report as import-run evidence. Processor coordination, credential-vault transfer, re-authorization campaigns, connected-account readiness and recurring-executor replacement at scale remain outside Phase 30. They must be assigned to a named owner by an edit of Phase 13 `:743-746` and `:2192-2199` before the first tenant switch. Go-live does not depend on them; tail closure does."
- **Bucket:** resolve_before_recording.

### v5-D7 — Reconciling or observing through the Stripe API would hit read allocations sized for a young platform

- **What could go wrong:** Suppose any switch reconciliation, old-stop observation or tail sourcing lists historical objects through the API. A Connect platform's read allocation for requests on behalf of connected accounts is "500 requests per transaction based on the aggregate transaction count across its connected accounts", with a minimum of 10,000 per month. Migration-style bursts also trigger rate limiting (live mode: 100 requests per second global, 25 per endpoint). A new platform with low volume has a small allocation, and increases need "at least 6 weeks" notice.
- **Evidence:** https://docs.stripe.com/rate-limits (verified-vendor-doc, accessed 2026-11-01): "Calls to … Reporting products … are excluded from the above allocation limits"; "Running a large volume of closely-spaced requests … Often this is part of an analytical or migration operation."
- **Severity / likelihood:** low / low-medium. No current plan uses the API for history.
- **Effect on answer:** no_change.
- **Best permanent fix:** Source processor reconciliation evidence from report or export artifacts, which are excluded from the allocation, not from paginated list calls.
- **Spec language:** "Switch and catch-up reconciliation consume processor report/export artifacts held in Phase 29 custody; bulk API listing of historical objects is not a reconciliation source."
- **Bucket:** implementation_safeguard.

**Category 1 verdict:** material. Settle two items before recording (v5-D1, v5-D6). Add three spec requirements (v5-D2, v5-D3, v5-D4) and two implementation safeguards (v5-D5, v5-D7).

---

## 2. Migration, rollout and upgrade risks

**Material concern: YES.** The Q1 text says nothing on five points:

- the switch is irreversible once live;
- the activation order on switch day, which decides between a giving outage and concurrent live writers;
- refinement (1) is too narrow for Option A's own abort-and-retry and supplemental paths;
- the first switch closes the fresh-build window;
- the tail is unbounded.

What was checked:

- r5 lifecycle §3.1-§3.14;
- the roadmap and owner-constraints convergence and undo clauses;
- Phase 16 formal cutover;
- the live donor-creation path (`begin_donation_saga`);
- `roadmap.md:428-436`, ADR-0179 and `environments.md`, for first-tenant posture;
- PayPal and cron tail evidence from the r1 and r2 verifiers;
- refinement (4) against the per-family boundary evidence.

### v5-M1 — Option A is irreversible after go-live, the Q1 text does not say so, and there is no halt control

- **What could go wrong.** Option A moves a whole ministry at once, so the blast radius is every supporter and every family in the kit. Once Asym-native facts exist (new gifts, consent withdrawals, staff edits), returning to SiteStacker would need an outbound migration Phase 30 does not provide. Re-enabling SiteStacker giving forms as a fallback creates a forbidden active-active writer.
  - No import machinery exists at all, so there is no halt or kill control for in-flight runs.
  - Run failures are invisible after handoff today (O11).
- **Why it matters.** A founder-level decision for a big-bang cutover should say plainly when it stops being reversible. MS Learn names "A rollback plan in case something goes wrong" as part of a cutover plan.
- **Evidence:**
  - r5 §3.14 X3 (proposed): "No rollback to SiteStacker in v1 … Re-enabling SiteStacker giving forms as an emergency fallback is an active-active state."
  - `roadmap.md:4395`: "Do not promise universal time-window undo, permanent dual writers" (repo-published).
  - P16 `:1314`: "no active-active replacement" (repo-ratified).
  - `roadmap.md:4403`: "Publish target-specific reversal and reconciliation procedures before tenant use" (repo-published).
  - decision-log.md:97 (O11) and :150.
  - MS Learn cutover guide via r10-gap-g4:194 (verified-vendor-doc).
- **Severity / likelihood:** high / medium. Some post-go-live problem is likely in the first switches.
- **Effect on answer:** changes. The decision must state the reversibility boundary.
- **Best permanent fix:**
  - Record that abort is allowed only before go-live. Before commit, discard. After commit but before go-live, quarantine the cohort and converge on retry; never delete. After go-live, correction is roll-forward only.
  - Spec a per-Switch and per-run halt that stops dispatch of new chunks without rewinding committed rows.
  - Spec that target-specific reversal procedures are rehearsed in the representative migration before tenant use.
- **Spec language:** "Q1 (amended): The switch is reversible only before go-live. Before go-live, the ministry may abort; committed rows are quarantined from ordinary views and coverage, never mass-deleted, and a later attempt converges on the same source bindings. After go-live, correction is roll-forward only, through owner corrections, reviewed supplemental plans or visible exclusion. Re-enabling any SiteStacker giving entry point after go-live requires an explicit, recorded founder exception. Every Switch and every run has an authorized Halt that stops new chunk dispatch, leaves committed rows intact and records who halted, when and why."
- **Bucket:** resolve_before_recording.

### v5-M2 — Switch-day activation order is undefined: giving outage vs concurrent live writers vs suppression-before-sending

- **What could go wrong.** The Q1 sequence is: freeze → final export → import → reconcile → Asym becomes the only place. Read literally, every in-kit family is imported, reconciled and signed off before Asym giving opens. Three hazards follow.
  - **(a) Giving outage.** SiteStacker giving forms are off from the freeze, and Asym giving opens only after the full import, owner acceptance and finance sign-off. Online giving is unavailable for that whole window. MS Learn: "During cutover, you can't use your old system or your new one."
  - **(b) Concurrent live writer.** If Asym giving opens before the Party import commits, live gifts create donor rows through `begin_donation_saga`. These are keyed by `(tenant_id, profile_id)`, and the saga "still writes no donor email". The import's email-based matching cannot find them, so they become duplicate pairs that only Phase 4 may merge (C2). The plan's target revisions also change underneath it. `roadmap.md:4349`: "a changed target is a conflict".
  - **(c) Suppression before sending.** Refinement (3) gates Asym sending on SiteStacker being quiet. It does not gate it on Asym having committed the final consent and suppression evidence, including the final Mailchimp export. If any Asym automation or newsletter activates first, SiteStacker-era unsubscribes are not yet floors.
- **Why it matters.** Lost gifts and donor frustration during the outage; duplicate supporters from the first day; sending to opted-out people.
- **Evidence:**
  - `supabase/migrations/20261024141000_begin_donation_saga_donor_conflict_reuse.sql:13-17`, `:105-117` (repo-integrated, current legacy donor model). The target Party model (#570) is unbuilt.
  - `roadmap.md:4349`, `:4381` (repo-published).
  - C10 (repo-ratified).
  - r5 §3.9 orders consent and suppression second, but the order is not tied to activation (proposed).
  - MS Learn quote via r10-gap-g4:194 (verified-vendor-doc).
- **Severity / likelihood:** high / high for any ministry with steady online giving.
- **Effect on answer:** changes.
- **Best permanent fix.** Specify a fixed activation order and measure the outage it implies.
  1. Boundary.
  2. Final export.
  3. Commit and reconcile Parties and households, contact points, and consent and suppression floors.
  4. A human publishes Asym giving. SiteStacker forms are confirmed off or redirected.
  5. The remaining in-kit families commit dark while the tenant is live.
  6. Each owner activates its automations or sending only after its coverage declaration.

  The founder chooses one of two options:
  - (i) Full import before go-live, with a longer giving outage.
  - (ii) Party-first go-live, with history committing dark afterwards. The outage is then steps 2-3 only.

- **Spec language:** "Switch activation order: (1) record the boundary; (2) accept the final snapshot; (3) commit and reconcile Parties, households, contact points and consent/suppression evidence, including the final Mailchimp export; (4) only then may a human publish Asym giving and confirm SiteStacker giving entry points off or redirected; (5) remaining in-kit families commit outward-effect-dark; (6) no Asym automation, newsletter or first-support activation runs for the tenant until step (3) is reconciled and the owning phase has accepted its coverage declaration. The go/no-go report states the expected online-giving outage (step 2 start to step 4), computed from the measured profile (v5-S1)."
- **Bucket:** resolve_before_recording. Founder choice between (i) and (ii).

### v5-M3 — Refinement (1) "exact repeat = same snapshot replay" is too narrow for Option A's own recovery and supplemental paths

- **What could go wrong.** Several Option A paths import a _different_ snapshot of the same source:
  - the second attempt after an abort following commit (r5 X4);
  - a forgotten-file manifest extension (r5 E-40);
  - Deferred History (v5-D1);
  - every tail catch-up.

  All of them must recognize rows already accepted and never duplicate them. If refinement (1) is read as "v1 only guarantees replay of the identical bytes", then cross-snapshot identity convergence is out of v1 scope and every one of these paths duplicates. The owner text requires convergence across snapshots.

- **Why it matters.** Duplicated supporters and gifts on the very paths that make Option A safe.
- **Evidence:**
  - `owner-constraints.md`: "re-import updates instead of duplicating" (repo-published).
  - `roadmap.md:4363`: "Reimport converges on the same permitted target identity instead of creating another copy" (repo-published).
  - The r5 verifier notes the tension with `owner-constraints.md:370-372`.
  - The r6 verifier says refinement (1) is a new founder narrowing.
- **Severity / likelihood:** medium-high / high.
- **Effect on answer:** changes refinement (1).
- **Best permanent fix.** Separate the two guarantees.
  - **Identity convergence across any snapshot of the same source instance is required in v1.** Bindings are tenant + source instance + entity kind + source ID. Existing bindings are recognized, never duplicated.
  - **Field updates from a newer snapshot are not applied in v1.** They appear as source-changed conflicts for review. This keeps the founder's caution while meeting the owner text.
- **Spec language:** "Refinement (1) (amended): v1 guarantees (a) byte-identical replay of a sealed plan is a no-op, and (b) any later snapshot of the same source instance converges on existing source bindings, never creating a second target identity. Field differences from a later snapshot are presented as source-changed conflicts and are never applied automatically in v1. Missing rows are reported as 'absent from this snapshot', never as deletions."
- **Bucket:** resolve_before_recording.

### v5-M4 — The first switch closes the fresh-build window on schemas that do not exist yet

- **What could go wrong.** The first SiteStacker ministry switch is almost certainly first-tenant onboarding.
  - The roadmap says the fresh-build posture "is a one-time window that closes at first tenant onboarding".
  - ADR-0179's clean-replacement approach depends on "Core is not in production".
  - Option A writes a whole ministry's history in one go into target schemas that are still unbuilt (the Party spine is #570, OPEN). Every later owner schema change becomes a live backfill over imported rows.
  - Production status is contradictory (D13): `environments.md:5` says production holds real donor data and live Stripe transactions, while other texts say Core is not in production.
- **Why it matters.** It locks in permanent compatibility obligations, and the census must happen before any switch.
- **Evidence:**
  - `roadmap.md:432-434` (repo-published).
  - ADR-0179 `:3`, `:14-18` (repo-ratified).
  - `docs/ops/environments.md:5`, `:14-16` (repo-published).
  - decision-log.md:73 (D13).
- **Severity / likelihood:** medium / medium.
- **Effect on answer:** no_change to the choice of A. It adds a rollout gate.
- **Best permanent fix.** The first-tenant go/no-go requires three things:
  - a read-only hosted census that resolves D13;
  - each in-kit owner declaring its schema forward-migratable, with imported-row lineage (Switch, snapshot, run, source binding) sufficient for owner backfills;
  - a recorded acknowledgement that pre-production replacement is no longer available to those owners afterwards.
- **Spec language:** "Before the first tenant switch: a read-only census of the target hosted environment resolves D13. Each Minimum Switch Kit owner records that its schema is forward-migratable over imported rows. Every imported row carries Switch, snapshot, run and source-binding lineage. The go/no-go record notes that this switch ends the fresh-build posture (`roadmap.md:434`) for those owners."
- **Bucket:** spec_requirement.

### v5-M5 — The "bounded" tail can run for years and become the standing dual feed the roadmap forbids

- **What could go wrong.** Two executors keep the tail open.
  - **PayPal Standard subscriptions** built by SiteStacker run in PayPal until cancelled or until `srt`. `srt` is clamped to between 2 and 52 cycles, which is about 4.3 years at monthly cadence (inferred from vendor-served code, per the verifier).
  - **SiteStacker's own cron** charges until a Phase 16 formal cutover. That cutover depends on #809 and #834 (OPEN) and on an unowned workstream (v5-D6).

  Repeating catch-ups for years would be the recurring operational intake and permanent dual writer the texts exclude. Without a closure rule, the tail never ends.

- **Why it matters.** Operational burden. It also contradicts "Reviewed backfill is a separate bounded operation".
- **Evidence:**
  - Payment.js:1388-1422 (verifier; inferred).
  - P16 `:1279`, `:1314` (repo-ratified).
  - `roadmap.md:4395` (repo-published).
  - `owner-constraints.md:424-430` (C18; repo-published).
  - r5 §3.12 proposes a closure date but sets no cap.
- **Severity / likelihood:** medium-high / high.
- **Effect on answer:** narrows refinement (2).
- **Best permanent fix:**
  - The Switch records a tail closure date at go/no-go: the later of last expected legacy charge + 120 days and dispute closure, capped at a founder-set maximum such as 12 months.
  - At closure, every executor still running is either (i) proved or attested stopped, or (ii) reclassified by Phase 16 as an ongoing external arrangement. Its later gifts then enter only through a money-owner intake (Phase 13/15), never through Phase 30.
  - Catch-ups run on a fixed cadence.
- **Spec language:** "Each Switch records a tail closure date at go/no-go. Late-tail catch-ups run on a fixed cadence until that date and never after it. At closure, every legacy executor still active is either evidenced stopped or reclassified by Phase 16 as an ongoing external arrangement. Its subsequent money facts enter only through a Phase 13/15 owner intake, not a Phase 30 catch-up. The tail cap is [founder value, proposed 12 months after go-live]."
- **Bucket:** spec_requirement.

### v5-M6 — Refinement (4) overstates what run, snapshot and lineage records buy for a future Option B

- **What could go wrong.** Run identity, snapshot identity and per-record lineage do not make Option B addable later. B's hard problems are different:
  - per-family authority, where some families are authoritative in SiteStacker and others in Asym;
  - cross-system references. A SiteStacker-authoritative gift for a Party created in Asym after the boundary has no SiteStacker ID.

  Building B machinery now would be speculative. Claiming B is "designed in" would mislead.

- **Evidence:**
  - Per-source-family half-open boundaries are an existing pattern: ADR-0106 via r5 A24/K6 (repo-ratified for Field Accounts).
  - Nothing in the refinement addresses reverse identity (inferred).
- **Severity / likelihood:** low / medium.
- **Effect on answer:** narrows refinement (4).
- **Best permanent fix.** Store a boundary row per source family, all at the same instant in v1. This is cheap and matches the existing pattern. Record that adding B needs its own decision on per-family authority and reverse identity. Build no B machinery now.
- **Spec language:** "Refinement (4) (amended): the Switch stores one boundary per source family, all equal in v1. No other Option B mechanism is built. Any later area-by-area mode requires its own decision on per-family authority and on identities created in Asym that SiteStacker must reference."
- **Bucket:** spec_requirement.

**Category 2 verdict:** material. Three items must be resolved before recording (v5-M1, v5-M2, v5-M3). Three spec requirements follow (v5-M4, v5-M5, v5-M6).

---

## 3. Scalability and performance risks

**Material concern: YES.** Option A puts the whole ministry's data through one window under time pressure, but several numbers it depends on are either unknown or wrong for that use:

- The window length cannot be predicted from "practice runs that change nothing".
- The only numeric parser bounds published are D17 bounds, far below a ministry's history.
- Inngest's platform limits shape the run design.
- Catch-up cost grows with history, not with the delta.

There is no verified size distribution of SiteStacker ministries. Every volume below is labelled as an assumption or illustration.

**What was checked:**

- #2347 and #2087 bounds (repo-published);
- the #2087 `IMPORT_TENANT_CONCURRENCY` pin;
- the D17 per-profile clause (via r10-gap-g1);
- Phase 29 AC29-D23-01;
- Inngest usage limits (vendor);
- the Vercel host config;
- the SiteStacker long-export behaviour (snippet via g3);
- the r5 rehearsal limits;
- the MS Learn go-live checklist (vendor).

### v5-S1 — The freeze and outage window cannot be predicted, because no-write practice runs never exercise commits

- **What could go wrong:**
  - The window from final export to go-live (or to step 4 in v5-M2) covers several things: the commit of every in-kit family in dependency order, owner acceptance, and finance sign-off. r5 orders eleven stages, each with "one committing run per target cohort at a time".
  - The only concurrency pin published is `IMPORT_TENANT_CONCURRENCY` = 1.
  - A no-write plan measures parse and plan time, not write throughput, chunk recovery or owner-command latency.

  So the first real switch is the first time anyone learns how long the outage lasts. For a large ministry it can overrun the weekend window that cutover guidance assumes.

- **Why it matters:** Giving outage (v5-M2), staff left idle, and pressure to cut corners on switch day.
- **Evidence:**
  - r5 §3.4: "What a rehearsal cannot prove: Chunk recovery under real commit, late commits, reversal, and target-owner acceptance (nothing commits)" (proposed, citing `r10-gap-g4.md:174`).
  - r5 §3.9 (proposed).
  - #2087 comment 6393929266 (repo-published ticket pin, D17-scoped).
  - MS Learn go-live checklist (verified-vendor-doc, accessed 2026-11-01): "Test data migration several times before cutover" and "make sure performance fits in the cutover time window".
  - The MS Learn cutover guide: "usually less than 48 hours" (verified-vendor-doc via r10-gap-g4:194).
- **Severity / likelihood:** high / high (for any ministry beyond a small one).
- **Effect on answer:** narrows. "Practice runs that change nothing" must be complemented.
- **Best permanent fix:**
  - The representative migration (C23) measures committed throughput per family at a declared size profile, on production-shaped infrastructure, including owner commands.
  - Each tenant's go/no-go compares its census counts with the measured profile, computes the expected outage, and selects the v5-M2 option.
  - Practice runs also time the ministry's manual export procedure.
  - A tenant above the measured profile cannot schedule a switch until the profile is re-measured.
- **Spec language:** "The representative SiteStacker migration records committed rows per minute per family (with owner commands, quarantine and chunk recovery) for a declared size profile. Each Switch's go/no-go report states the tenant's census counts, the expected commit duration and the expected online-giving outage, both computed from that profile. It also states the timed duration of the ministry's final-export procedure from the last practice run. A tenant whose counts exceed the measured profile cannot be scheduled until a larger profile is measured."
- **Bucket:** spec_requirement.

### v5-S2 — The only numeric parser bounds published are D17's, and a ministry export exceeds them by orders of magnitude

- **What could go wrong:**
  - #2347 (Ready, unblocked) hard-codes 10,000 rows, 500,000 slots, 32,768-byte cells and 16,384 columns as module-level acceptance constants.
  - #2087 AC28-R25-01 adds 10 MiB uploaded bytes and "500,000 parsed slots across the whole file/workbook including explicit empty slots".
  - The r1 checklist asks the ministry to export "every column ticked". Illustration (assumed column counts): a 60-column Contributions export caps at about 8,333 rows under the slot bound, and a 150-column People export at about 3,333.
  - Any ministry with more than 10,000 historical transactions (assumption: most with a few years of recurring giving) exceeds the row bound in a single file.

  Option A needs the whole final snapshot accepted inside one window, so a bound breach on switch day blocks go-live.

- **Why it matters:**
  - Either the SiteStacker profile cannot run on the shared reader, or someone raises shared constants that D17 tests pin.
  - The D17 text says its limits are qualification limits "not … universal" and must be "configured per qualified profile".
  - Phase 29 blocks any profile whose limits are unknown.
- **Evidence:**
  - #2347 body line 22 (repo-published).
  - #2087 body AC28-R25-01 (repo-published).
  - `phase28-d17-contact-import-adversarial-review.md:395-399`, via r10-gap-g1:164 (repo-ratified D17).
  - AC29-D23-01 at PR #2430 head (repo-ratified, unmerged): "Before each profile activates, publish finite measured units … Unknown limits block that profile".
  - decision-log D12 and §6 (time-sensitive).
- **Severity / likelihood:** medium-high / high.
- **Effect on answer:** no_change to choosing A. It is a precondition for any A switch.
- **Best permanent fix:**
  - Bounds become a field of the caller-supplied profile (the D17 profile keeps its ratified values).
  - The SiteStacker staff-migration profile declares its own measured bounds, from a real census, before any switch is scheduled.
  - The manifest model accepts partitioned files whose union is checked against UI counts (r5 E-25).
- **Spec language:** "Parser and staging bounds are per-profile configuration. The SiteStacker staff-migration profile publishes measured bounds (bytes, rows, slots, columns, cell bytes, files per manifest, wall time) before any Switch is scheduled. A family that exceeds them is partitioned into manifest members whose union must reconcile to the source UI count with no overlap. The D17 bounds are never the SiteStacker profile's bounds."
- **Bucket:** spec_requirement.

### v5-S3 — Inngest platform limits make "one run per family" a fan-out design, not one function

- **What could go wrong:** A naive design, with one Inngest function per family run, one step per chunk, and per-row outcomes or plan slices carried in step results, breaks at real volume:
  - "1,000 steps" per function;
  - "4 MiB of data returned by one step";
  - "32 MiB across event data, step data, function return data, and metadata";
  - step duration capped by the function host's timeout. `apps/admin/vercel.json` sets no `maxDuration`, so the Vercel default applies; the value is unverified for this project's plan.

  Plan-based ceilings also apply. Asym's Inngest plan is unverified. For example, the Free tier allows 5 concurrent steps, 100,000 queue depth and 500,000 events ingested per month. Per-row events from a large import would also defeat "batch-origin event suppression".

- **Why it matters:** Runs fail partway, or silently stall at limits, in the middle of the switch window.
- **Evidence:**
  - https://www.inngest.com/docs/usage-limits/inngest (verified-vendor-doc, accessed 2026-11-01).
  - `owner-constraints.md` "Background processing via Inngest: chunked … batch-origin event suppression (an import must not fan out ten thousand automation emails)" (repo-published).
  - r06 6.1: one shared app `asym-core-workflows`, with tenant as the concurrency key (repo-integrated).
  - `workflows/events.ts:75-91`: a strict envelope that carries no payloads (repo-integrated).
- **Severity / likelihood:** medium / medium-high (if not designed in).
- **Effect on answer:** no_change.
- **Best permanent fix:**
  - A family run is a parent record in Postgres. Inngest dispatches child chunk executions keyed by (run id, chunk index), with an idempotent chunk commit and a DB-held cursor.
  - No per-row events; no per-row outcomes in step state.
  - Chunk size is set from measured wall time, below the host timeout.
  - Confirm the Inngest plan's concurrency, queue-depth and ingestion limits against the measured profile (v5-S1).
- **Spec language:** "Import runs hold plan, cursor and per-row outcomes in Postgres. Inngest executes bounded chunks keyed by (run, chunk index). Each chunk commit is idempotent on that key, and the cursor never advances past an uncommitted lower chunk. No import emits a per-row event. Chunk size is set so that measured p99 chunk wall time stays below half the host function timeout. The deployment records its Inngest plan limits and its host timeout as part of the measured profile."
- **Bucket:** implementation_safeguard.

### v5-S4 — Catch-up cost grows with history, not delta, because SiteStacker has no change feed

- **What could go wrong:** Each catch-up needs a fresh SiteStacker export and diff, because there is no change feed. Two further unknowns make this worse:
  - Whether grids can filter by modified date is unverified.
  - Long exports error out (2.48 snippet), which forces manual partitioning.

  Refunds appear as new transaction rows, so a date filter can catch them. But schedule status changes, re-designations and "Move Payment Method" edits alter existing rows. A purely date-filtered catch-up misses them, and a full re-export each cycle costs as much as the original final export. The final snapshot is also large and manual: about 19 export families (r1 §5), plus partitions, per-processor reports, Mailchimp per-status files and per-missionary Mailchimp files.

- **Why it matters:** Ministry admin effort repeated every cycle, export failures, and missed changes.
- **Evidence:**
  - decision-log.md:140 (g4: "SiteStacker has no change feed") (research).
  - `r10-gap-g4.md:272`: modified-date filtering "not verified".
  - `r10-gap-g3.md:105`: 2.48 long exports "will result in an error" (snippet-only).
  - r1 D13: refund "creates a new 'refund' transaction" (verified-vendor-doc via r1).
  - r1 X2: Move Payment Method and re-designation (verified-vendor-doc via r1).
- **Severity / likelihood:** medium / high.
- **Effect on answer:** narrows refinement (2).
- **Best permanent fix:** Each catch-up profile defines two bounded windows:
  - transactions dated from (boundary − 120 days) to now, which covers in-flight settlement and refunds;
  - the full Recurring view, which is small.

  Diff by source ID against the prior manifest. Changes to rows before the window are out of tail scope and appear only in a final pre-closure full snapshot. Cadence is fixed (v5-M5), and export elapsed time is recorded per catch-up.

- **Spec language:** "A late-tail catch-up manifest contains (a) Contributions transactions dated from the Switch Boundary minus 120 days to the export time, and (b) the complete Recurring and Recurring Campaign views. The plan diffs by source ID against the previous manifest. One full final snapshot is taken before tail closure to surface changes to older rows as source-changed conflicts. Each catch-up records the ministry's export elapsed time and its partition count."
- **Bucket:** spec_requirement.

### v5-S5 — The quarantine and exception backlog can grow unobserved across catch-ups

- **What could go wrong:** Unlinked processor facts (v5-D3), catch-up gifts with no matching Party (r5 K3) and absent-from-snapshot rows accumulate in quarantine with every catch-up. With no threshold, the backlog grows until tail closure, when it is too large to review. Run failures are invisible today after handoff (O11).
- **Why it matters:** Finance truth decays quietly, and tail closure becomes unreachable.
- **Evidence:**
  - Phase 13 story 171 (repo-ratified).
  - decision-log.md:97 (O11).
  - r5 E-49 and E-22 (proposed).
- **Severity / likelihood:** medium / medium.
- **Effect on answer:** no_change.
- **Best permanent fix:** Monitor per Switch:
  - **Signal:** open migration exceptions by class (unlinked processor fact, unmatched Party, absent row, source-changed conflict), their age, and the share of tail rows quarantined per catch-up.
  - **Threshold:** any catch-up with more than 5% of its rows quarantined (proposed); or any exception older than 30 days; or any unexplained exception at the tail-closure review.
  - **Owner:** the Switch's named Phase 30 run owner, with the ministry finance approver.
  - **Response:** pause further catch-ups for that Switch, escalate money exceptions to Phase 13 finance exception review, and record the disposition before the next cadence.
- **Spec language:** "Each Switch shows open migration exceptions by class and age. A catch-up whose quarantined share exceeds the configured threshold (default 5%), or any exception older than 30 days, pauses the next scheduled catch-up and notifies the Switch's run owner and finance approver. Tail closure requires zero unexplained exceptions."
- **Bucket:** monitor.
- **Monitor:**
  - **signal:** quarantined share per catch-up, exception count and age by class;
  - **threshold:** more than 5% per catch-up, or any exception over 30 days, or any unexplained exception at closure;
  - **owner:** Phase 30 Switch run owner with the ministry finance approver;
  - **response:** pause catch-ups, escalate to Phase 13 finance exception review, and disposition before resuming.

### v5-S6 — Proving overlap between Contributions and Historic Giving row by row may be infeasible at scale without a shared ID

- **What could go wrong:** For every SiteStacker-managed ministry, Historic Giving automatically copies native Contributions income (K19), so the two sources double-count. r1 R5 asks for proof that copied rows "can be matched one-to-one". It is unknown whether copied rows carry the Contributions transaction ID. Without one, a row-level match over years of history is either fuzzy matching on amount, date and person, which is unsafe for money, or a very large manual review.
- **Why it matters:** It blocks the money families or produces doubled lifetime totals (C22).
- **Evidence:**
  - r1 K19 (`q01-r1…:149`): "It is unknown whether the copied rows carry the Contributions transaction ID" (verified-vendor-doc via r1 for the overlap; the column is unverified).
  - Phase 13 story 171 (repo-ratified).
- **Severity / likelihood:** medium / medium.
- **Effect on answer:** no_change.
- **Best permanent fix:**
  - Choose the gift basis per period by aggregate proof: counts and per-currency totals by period and Site.
  - Import only the chosen basis for that period. Keep the non-chosen source as provenance.
  - Use row-level pairing only where a shared ID exists. Never pair by amount, date or name.
- **Spec language:** "For each period, the kit selects exactly one gift basis (Contributions or Historic Giving), supported by aggregate count and per-currency total comparisons by period and Site. Row-level pairing between the two sources uses only an exported shared identifier. Without one, the non-selected source for that period is retained as provenance and never imported as gifts."
- **Bucket:** spec_requirement.

**Category 3 verdict:** material. Four spec requirements (v5-S1, v5-S2, v5-S4, v5-S6), one implementation safeguard (v5-S3) and one monitor (v5-S5).

---

## 4. Summary for the orchestrator

| Bucket                   | Concerns                                                                                                                                                                                                                                                                      |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| resolve_before_recording | v5-D1 (Minimum Switch Kit and Deferred History); v5-D6 (migration-workstream split, plus Phase 13 edit); v5-M1 (irreversible after go-live; Halt); v5-M2 (activation order: giving outage vs Party-first); v5-M3 (refinement 1 must keep cross-snapshot identity convergence) |
| spec_requirement         | v5-D2, v5-D3, v5-D4, v5-M4, v5-M5, v5-M6, v5-S1, v5-S2, v5-S4, v5-S6                                                                                                                                                                                                          |
| implementation_safeguard | v5-D5, v5-D7, v5-S3                                                                                                                                                                                                                                                           |
| monitor                  | v5-S5                                                                                                                                                                                                                                                                         |

**Overall effect on the Q1 answer:** Option A survives as the v1 model, but its recorded wording must change in five places.

1. "Asym becomes the only place for supporters and their history" must be bounded by a Minimum Switch Kit and Deferred History.
2. The freeze and reconcile duties must be split from the unowned processor workstream, with an owner edit.
3. Irreversibility after go-live must be explicit.
4. The switch-day activation order must be chosen.
5. Refinement (1) must not drop cross-snapshot convergence.

Refinements (2) and (4) are narrowed (v5-D3, v5-M5, v5-S4; v5-M6).

**What I could not verify:**

- the real SiteStacker export columns, including R10 gateway IDs and the K19 shared ID;
- SiteStacker ministry size distributions;
- Asym's Inngest plan and Vercel function timeout;
- whether grids filter by modified date;
- the full text of the Stripe self-serve copy page (only the variant index was retrieved; claims rely on the 2026-11-01 verifier notes);
- PayPal `srt` behaviour beyond the verifier's reading of vendor-served code.

Status: COMPLETE (2026-11-01).
