# Q1 adversarial review v2: brittleness, edge cases, failure modes, and lifecycle (temporal correctness, concurrency, idempotency)

Phase 30 Imports & Migration Tools (`imports-migration`). This is a discovery-only review of the founder's Q1 answer and its four proposed refinements. The answer chose Option A, "one planned switch per ministry". This review (v2) covers categories 1-4 only. Date: 2026-11-01.

**Status:** COMPLETE (2026-11-01). Contents: §1-§4 one section per category, §5 corrections to the research, §6 what could not be verified, §7 verdicts.

**Baseline.** develop `629cb71dc`. Phase 29 spec: PR #2430, head `1483a349514c66b458da38e0ba0992efdc2e1f31` (open, unmerged). The review is read-only; this file is the only thing it writes.

**Evidence labels.**

- verified-vendor-doc (URL, accessed 2026-11-01)
- snippet-only
- third-party
- repo-ratified
- repo-published
- repo-integrated
- repo-implemented
- inferred
- assumption
- unverified

Claims from the research tracks are cited as `q01-rN:line` and keep that track's label unless re-verified here. Where the verifier digest corrected a track, the correction governs.

---

## 0. What this review checked

**Sources read**

- The decision log (`grill/decision-log.md`, all sections).
- The Phase 30 baseline: `roadmap.md:4320-4420` and `owner-constraints.md:329-455`.
- The six q01 research tracks, with the verifier digest. Verifier corrections override the tracks.

**Governing sources re-checked**

- Phase 13 PRD `:536-546`, `:718-746`, `:1023-1040`, `:1767`, `:1934-1937`
- Phase 16 PRD `:108-114`, `:497-501`, `:1286-1318`, `:2578-2596`
- ADR-0058 `:1-30` and ADR-0106 `:80-106`
- `CONTEXT.md:4976-5045` and `:6945-6962`
- Phase 28 `relationships.md:355-430` (REQ28-R19 to R22)
- Phase 29 `founder-brief.txt:151` on PR #2430 head `1483a349`
- Issue #809 (open)

**Current code (repo-integrated, develop `629cb71dc`)**

- `packages/api/src/donate/guest/donor-matching.ts:1-17`
- `supabase/migrations/20261024140000_identity_email_normalizer_and_donor_keys.sql:162-164`
- `packages/api/src/stripe/tenant-client.ts:59-66`
- `packages/api/src/missionary-portal/donors.ts:503-506`

**Vendor docs fetched for this review on 2026-11-01**

- SiteStacker 151000115212, 151000183830 and 151000119746
- MDN `Temporal.ZonedDateTime.startOfDay`

Nothing for imports is implemented at `629cb71dc` (decision-log §8). Everything below concerns the decision and its refinements as design intent. No finding claims current product behaviour unless it is labelled repo-integrated.

---

## 1. Brittleness

**Material concern: YES.** Option A itself is sound: ADR-0106 and ADR-0058 ratify the same "one bounded cutover" shape for finance. But it relies on four assumptions that hold only when the source behaves ideally:

- the export is atomic;
- reconciling against the export proves completeness;
- three switches cover every SiteStacker writer;
- timestamps are unambiguous.

### v2-B1: "One final export" assumes a point-in-time, self-serve snapshot that SiteStacker cannot produce

**What could go wrong.** The final export is really a set of about 19 exports (q01-r1 §5) plus BI/Reports datasets, and four things make that set fragile:

- **Vendor dependency.** Some datasets are built only by WMTEK: "Currently, all reports are built by WMTEK staff" (V39, 151000119684, cited at `q01-r1:76`; scope is Motion 2 workflow data; not re-fetched). WMTEK also does billable work only on an approved estimate (`q01-r1:146`).
- **Partitioning.** Long exports error out and get partitioned (snippet-only, `r10-gap-g3.md:96`).
- **Permissions.** An export run by a restricted User Group is silently partial (q01-r5 E-26).
- **Inconsistency between files.** Files are taken hours apart while SiteStacker's cron, donor self-service and inbound-email capture keep writing, so they do not agree with each other.

As a result the freeze has no bounded length. Rehearsals as framed exercise the plan, not the export procedure.

**Why it matters.** The length of the freeze is Option A's main operational risk (v2-F1). If a dataset only the vendor can produce is missing on switch day, the outcome is either an indefinite freeze or a rushed partial import.

**Severity / likelihood.** High / high.

**Evidence.**

- Founder wording "one final export" (task statement).
- `roadmap.md:4349`: the plan binds to exact source bytes.
- There is no change feed (`r10-gap-g4.md:78`, documented absence).
- q01-r5 K5: the snapshot must be a manifest.

**Effect on answer.** Narrows: "one final export" becomes "one final export set".

**Best permanent fix.**

- Make the final export a manifest with a recorded export window that starts after the boundary.
- Rehearse the exact final-export procedure, not just the plan: same exporter User Group, same file list, same partitions, and timed.
- Handle each vendor-built dataset in one of three ways:
  - schedule and confirm it in writing before the boundary;
  - take it before the boundary with a declared as-of time, treating any later changes as late-tail evidence;
  - exclude it visibly.

**Spec language.** "The final export is a manifest of named files taken after the recorded boundary. Each file records the exporter, User Group, SiteStacker version, filter or partition, start and finish times, and the on-screen control count captured at export time. Go/no-go requires a rehearsal of the same manifest shape, completed within {N} days, whose measured duration is below the declared maximum freeze length. Any dataset that only the vendor can produce is either confirmed in writing before the boundary, taken before the boundary with a declared as-of time, or visibly excluded."

**Bucket.** spec_requirement.

### v2-B2: Reconciling only against the export cannot catch a truncated or filtered export, and the founder's wording drops Legal Entity and source basis

**What could go wrong.** "Reconcile counts and per-currency totals" proves only that Asym's accepted rows tie to the files. An export can be wrong in ways that still reconcile perfectly against itself:

- truncated by a timeout (`r10-gap-g3.md:96`);
- filtered by permissions (E-26);
- missing transactions that were deleted after a refund (`q01-r1:138`, K8);
- double-counted between Historic Giving and Contributions (K19; 151000122348 per q01-r1, verified there).

The wording also narrows a published requirement. The kit must check totals "by Legal Entity, original currency and source basis" (`roadmap.md:4369`; `owner-constraints.md:434-437`).

**Why it matters.**

- C3 forbids narrowing a published requirement by shorthand.
- Finance would sign off on totals that prove fidelity to the file, not to the books or the processor.

**Severity / likelihood.** High / high.

**Evidence.**

- `roadmap.md:4363`, "reconciliation against the source export", is per-record lineage (level 1 below).
- q01-r1 H1 (`:299`) and q01-r6 point 3 name independent controls.
- q01-r2 recommends processor reconciliation per merchant account × currency.

**Effect on answer.** Changes the recorded wording.

**Best permanent fix.** Reconcile at two levels, both per Legal Entity × original currency × source basis:

1. **Import against export.** Every source row has exactly one disposition, and accepted totals tie to export totals.
2. **Export against independent controls.** On-screen counts captured at export time, the Statements report, and processor settlement reports per merchant account × currency.

**Spec language.** Replace "reconcile counts and per-currency totals" with: "Reconcile record counts and money totals per Legal Entity × original currency × source basis at two levels: (1) every row of the final export set has exactly one disposition, and accepted totals tie to export totals; (2) export totals tie to independent controls (on-screen counts captured at export time, the SiteStacker Statements report, and processor settlement reports per merchant account × currency). Any unexplained variance at either level blocks sign-off."

**Bucket.** resolve_before_recording.

### v2-B3: Refinement 3's fixed three-switch attestation (Spark, giving forms, Mailchimp sync) fails in both directions

**What could go wrong.**

- **Turning Spark off can cause over-collection.** SiteStacker documents campaign-goal triggers: "you may want to cancel recurring gifts and notify donors when a campaign goal has been reached" (151000119746, modified 29 Sep 2023; verified-vendor-doc, accessed 2026-11-01). With Spark off, that cancellation stops firing while the cron keeps charging.
- **Turning Spark off also stops Mastercard pre-billing reminders.** They run as the Spark "Recurring Schedule Reminder" (V64, 151000122015, cited at `q01-r1:101`; not re-fetched).
- **Leaving System Messages on keeps money moving.** The "Contributions Declined" message carries a link that reprocesses a failed recurring gift: "Once the new payment method information is filled out and saved, the gift will be reprocessed automatically." No time limit is documented (151000183830, modified 22 Aug 2024; verified-vendor-doc, accessed 2026-11-01).
- **Some writers are outside all three switches:**
  - Motion 2.5 relationship automation (K23);
  - people created from inbound email;
  - text-to-give links;
  - missionary-owned Mailchimp lists populated by manual export (151000122392, verifier-verified). These cannot be "turned off" at all.
- **The attestation is never re-checked.** It records one point in time.

**Why it matters.** C23 requires zero unintended send or payment effect. A binary "off" means either the receipt and card-network duties fail or the charges continue.

**Severity / likelihood.** High / high.

**Evidence.**

- q01-r5 K4 and S3.
- q01-r6 §9 surface list.
- q01-r2 (Spark reminder exemption).
- The vendor articles above.

**Effect on answer.** Changes refinement 3.

**Best permanent fix.** Generate the checklist from the S0 automation census, with a state and an owner for each item. Re-confirm it at every catch-up and back it with detection monitors (v2-F5).

**Spec language.** "Before any Asym sending or automation activates for a migrated tenant, every SiteStacker writing or outward surface found by the readiness census is recorded with exactly one state:

- Off;
- Kept on for the recurring tail (reason, named owner, planned end date);
- Not used;
- Outside the ministry's control (with a follow-up action).

Spark outcomes that cancel recurring gifts, and recurring pre-billing reminders, may not be set to Off while any recurring schedule they govern is still charging, unless a replacement action is recorded. The Contributions Declined rerun link is either removed or recorded as a live legacy charging path. The list is re-confirmed at every catch-up run."

**Bucket.** spec_requirement.

### v2-B4: Boundary classification depends on undocumented SiteStacker time semantics and a literal "midnight"

**What could go wrong.**

- **No documented time zone.** SiteStacker documents recurring runs only as "in the early morning hours on the next run date", and a same-day edit charges "on save" (151000115212, modified 26 Apr 2024; verified-vendor-doc, accessed 2026-11-01).
- **Unknown zones in exports and Sites.** Export time zones are undocumented (q01-r5 §3.1, unverified), and Sites can be split by language or offering (V9).
- **Conflicting guidance on midnight.** q01-r5 recommends a "date-aligned boundary (00:00 local)", while q01-r6 says never to say "midnight".
- **Midnight does not always exist.** MDN notes the start of day "may be different if the midnight doesn't exist due to offset changes", with America/Sao_Paulo 2015 as its example (verified-vendor-doc, MDN Temporal.ZonedDateTime.startOfDay, accessed 2026-11-01).
- **One-day shifts.** Gift dates exported in a server zone that differs from the ministry's zone shift by one day around the boundary.

**Why it matters.** Misclassified rows near the boundary land in the wrong lane: history instead of late tail, or pre-Asym instead of not (v2-L3). That changes how they are receipted and how coverage is counted.

**Severity / likelihood.** Medium / medium.

**Evidence.**

- Phase 16 `:112` and `:497-499`: the tenant giving timezone is canonical, and Asym "never guesses from processor UTC".
- q01-r5 §3.1.
- q01-r6 freeze edge case.

**Effect on answer.** Narrows.

**Best permanent fix.**

- The boundary zone is the tenant's Phase 2/16 giving timezone.
- The boundary is the first instant of the civil date, not a literal 00:00.
- The export's timestamp zone is a reviewed, profile-level evidence fact. It is established by matching a sample of exported transactions to processor records that carry UTC times, never inferred row by row. Phase 16 `:499` still governs schedule dates.
- Rows within one civil day of the boundary whose zone is unproven go to review.

**Spec language.** "The Switch Boundary is the first instant of the declared civil date in the tenant giving timezone. It is shown as 'starts at the first moment of {date}, {zone} (UTC{offset})', never as 'midnight'. Each export profile records a reviewed timestamp-zone evidence fact. Rows within one civil day of the boundary that lack proven zone evidence are held for review."

**Bucket.** spec_requirement.

---

## 2. Edge cases

**Material concern: YES.** The research catalogs (q01-r1 X1-X20, q01-r2 §7, q01-r3 PX-1 to PX-16, q01-r5 E-01 to E-52, q01-r6 §10) are broad, and I do not repeat them. Four realistic cases remain either unaddressed or under-weighted, and each one changes how the switch has to be sequenced.

### v2-E1: Giving continuity between the freeze and go-live is undefined

**What could go wrong.** The founder's sequence is freeze, final export, import, reconcile, then Asym becomes the only place. Under that sequence, SiteStacker giving forms go off at the boundary (refinement 3; q01-r5 S3 item 1), but Asym giving pages are published only at go-live, after reconciliation and sign-off (q01-r5 S8 item 2). That leaves three options, and each has a failure:

1. **A giving gap.** Online giving is unavailable for the whole freeze, import and reconcile window.
2. **Open Asym checkout early.** This produces three problems:
   - **Email collisions.** Guest checkout attaches a gift to an existing donor by normalized email (repo-integrated, `packages/api/src/donate/guest/donor-matching.ts:7-10`). The tenant has a unique index on normalized email (repo-integrated, `20261024140000_identity_email_normalizer_and_donor_keys.sql:162-164`). Supporters who give before their SiteStacker record is imported become native donors, and the later import then collides on that unique key or needs match review for active donors.
   - **Wrong welcome and first-gift effects.** Long-time supporters receive first-gift and welcome treatment, because their history is not imported yet (C22).
   - **Money in the wrong account.** Without a Phase 13 Settlement Account Binding, the current client falls back to the platform Stripe key (repo-integrated, `packages/api/src/stripe/tenant-client.ts:64-66`). Real donor money could then land in Asym's own account.
3. **Leave SiteStacker forms on until Asym opens.** New people and gifts are created in SiteStacker after the boundary (q01-r5 K3).

**Why it matters.** Every ministry has continuous online giving, and the switch weekend sits on top of it. Each option affects donors, money routing or identity.

**Severity / likelihood.** High / high.

**Evidence.** The repo-integrated files above; q01-r5 S3, S8 and K3; q01-r4 edge case "Rehearsal tenant has giving enabled without a binding"; C22.

**Effect on answer.** Changes. The freeze must say what happens to giving.

**Best permanent fix (inferred; founder choice).**

- Keep SiteStacker giving on until the moment Asym checkout opens.
- Open Asym checkout only when all three conditions hold:
  1. a proved Phase 13 binding exists (no platform-key fallback);
  2. the Parties cohort is committed and live, so checkout matches imported supporters;
  3. history coverage is declared incomplete, which blocks first-gift and welcome conclusions.
- Gifts SiteStacker takes between the boundary and forms-off arrive through the reviewed catch-up, under the K3 rule.
- A declared giving gap is the alternative. It is acceptable only with a stated maximum length and a holding page.

**Spec language.** "The switch plan states the giving-continuity rule. Asym online giving for a migrating tenant opens only after a proved Settlement Account Binding exists and the Parties cohort is live. SiteStacker giving stays available until that moment unless the ministry accepts a declared giving gap of at most {H} hours. Gifts SiteStacker takes after the boundary are catch-up facts and never create a supporter without the Phase 4 owner command."

**Bucket.** resolve_before_recording.

### v2-E2: The legacy executor charges outside its schedule (failed-gift reruns, charge-on-save, disabled goal cancellations)

**What could go wrong.** SiteStacker can charge in ways that do not appear as scheduled recurring runs:

- **Reruns of failed gifts.** A failed recurring gift is "reprocessed automatically" once the donor saves a new card through the link in the Contributions Declined message. No time limit is documented (151000183830; verified-vendor-doc, accessed 2026-11-01).
- **Charge on save.** If staff edit a recurring gift on its run date, it charges "on save" (151000115212; verified-vendor-doc).
- **Disabled goal cancellations.** Goal-reached cancellations stop if Spark is off (151000119746; verified-vendor-doc).

The rerun case is the most dangerous. Suppose a donor's gift failed in the month before the switch, and the donor clicks the link weeks later, after Phase 16 has started that cohort's Asym replacement. SiteStacker charges the missed month while Asym charges the current one. From the donor's side, that looks like a double charge, and it is exactly the kind of back-charge Asym's own policy forbids (Phase 16 `:1316` "no … blind catch-up, backcharge").

**Why it matters.** Old-executor stop proof (Phase 16 `:1314`) is usually framed as "future schedules cancelled". These paths sit outside that framing. #809 is designed around a Stripe adapter (issue #809, open; q01-r4 G20).

**Severity / likelihood.** High / medium.

**Evidence.** The three vendor articles above; Phase 16 `:1314-1316`; #809.

**Effect on answer.** Narrows refinement 4 (Phase 16 handover).

**Best permanent fix.**

- The readiness census and every Phase 16 cohort cutover list the open failed recurring gifts that still have a live rerun path.
- Stop proof for SiteStacker cohorts includes neutralising that path: remove the rerun link from the Contributions Declined message, or cancel the failed gifts.
- The catch-up labels a rerun as "legacy-executed payment for a pre-boundary occurrence" and keeps both dates.

**Spec language.** "Old-executor stop evidence for a SiteStacker-executed cohort covers future schedules, failed gifts that can still be rerun, and staff-edit charge paths. Phase 30 census and catch-up runs report open rerunnable failed gifts per cohort and classify each rerun with its original due date and its payment date."

**Bucket.** spec_requirement (an owner requirement on Phase 16, plus Phase 30 census and catch-up).

### v2-E3: Donor-entered changes in SiteStacker self-service during the tail are silently dropped

**What could go wrong.** The research recommends keeping the SiteStacker donor dashboard reachable during the recurring tail, so donors can cancel or update cards (q01-r2 open question 1; q01-r4 question 4). The same dashboard lets donors "manage their giving, payment methods, and year-end statements" (sitestacker.com/online-giving; marketing claim via q01-r5 S3). Refinement 2 says the catch-up "never overwrites supporter details". So an address or email a donor changes there after the boundary never reaches Asym, and receipts and statements keep going to the old details.

**Why it matters.** The donor believes the update succeeded, and the data silently diverges. q01-r5 E-21 covers staff edits but not donor-entered ones.

**Severity / likelihood.** Medium / medium.

**Evidence.** As above; `r10-gap-g4.md:118-130` (three-way cases).

**Effect on answer.** Narrows refinement 2.

**Best permanent fix.**

- Each catch-up emits a discrepancy worklist of supporter changes made on the SiteStacker side after the boundary, marked donor-entered or staff-entered where the source distinguishes them.
- The worklist is never auto-applied, and it has a named owner and a response time.
- Alternatively, disable profile editing in SiteStacker self-service while keeping cancellation available.

**Spec language.** "Each catch-up run lists supporter changes recorded in SiteStacker after the boundary as a reviewed worklist with a named owner. It never applies them automatically and never silently discards them."

**Bucket.** spec_requirement.

### v2-E4: A Phase 28 D17 missionary self-import into the same tenant before or during the switch

**What could go wrong.** A permitted missionary can self-import contacts into restricted preparation in the same tenant (C4; REQ28-R19, `relationships.md:355-371`, repo-ratified). This creates two problems:

- **Duplicates.** If that happens before the staff switch, the switch creates Parties for the same people. Hidden matches must not be disclosed (REQ28-R21-04, `:410`), so neither side sees the other and duplicates follow.
- **Stale plans.** If it happens during the frozen window, it changes target revisions bound to the final plan, which turns into stale-plan conflicts at commit (`roadmap.md:4349`).

**Why it matters.** Both profiles reuse one Phase 30 engine. Their ordering within a tenant is not defined.

**Severity / likelihood.** Medium / low (D17 is not yet active).

**Evidence.** As cited; `roadmap.md:4328-4333`.

**Effect on answer.** No change to Option A. Narrows the lifecycle.

**Best permanent fix.**

- Pause D17 intake commits for a tenant from `frozen` until `live`.
- The readiness census counts restricted preparation.
- Phase 4/9 rule how switch-imported Parties and existing restricted preparation reconcile.

**Spec language.** "While a tenant's Switch is between boundary and go-live, restricted self-import commits for that tenant are paused. The readiness census reports existing restricted preparation, and its reconciliation follows the Phase 4/9 ruling."

**Bucket.** spec_requirement.

---

## 3. Failure modes

**Material concern: YES.** Option A's risky window is boundary to go-live, together with the tail that follows. The decision does not say how that window fails safely: no freeze deadline, no not-yet-live state for committed rows, stop proof that could rest on absence, and a catch-up blind to executors outside SiteStacker.

### v2-F1: Freeze overrun with no pre-decided fallback, leaving no system authoritative between boundary and go-live

**What could go wrong.** Late on switch weekend the final export set is rejected (q01-r5 S5 → `snapshot_rejected`). Re-export may need WMTEK (v2-B1), and owner acceptance and finance sign-off are pending. The freeze stretches into days. Meanwhile:

- staff resume editing SiteStacker (drift, E-21) or start editing Asym before go-live;
- donor requests and mailed checks have no system of record (E-20).

q01-r5 cites "usually less than 48 hours" (MS Learn, verified there), but nothing bounds the window or says what happens when it is exceeded.

**Why it matters.** This is the most likely way a planned switch fails. Without a pre-agreed action, the decision gets made under pressure.

**Severity / likelihood.** High / medium.

**Evidence.** q01-r5 S3, S5, X1, X2; q01-r6 edge case "Ministry aborts after the freeze"; v2-B1.

**Effect on answer.** Narrows.

**Best permanent fix.**

1. **Declare a maximum freeze length** at scheduling.
2. **Pre-select the deadline action.** Either:
   - (a) abort before commit and unfreeze (X1); or
   - (b) a "history-incomplete go-live": go live once Parties and contactability pass, with gift-history families following as dark late history under declared-incomplete coverage. C22 already blocks first-gift conclusions on incomplete history, and `roadmap.md:4387` makes Parties the first slice. Option (b) is inferred and needs founder acceptance, because the founder said Asym becomes the only place "for supporters and their history".
3. **Keep a freeze-window intake log.** Requests received during the freeze are entered in Asym after go-live as ordinary edits, not imports.

**Spec language.** "Each Switch declares a maximum freeze length before the boundary. If go-live criteria are not met by that deadline, the Switch takes its pre-selected action: either abort before commit and unfreeze SiteStacker, or go live for the families that passed (Parties and contactability are mandatory), recording every other family as history not yet imported with coverage declared incomplete. Requests received during the freeze are logged and entered in Asym after go-live as ordinary edits."

**Bucket.** spec_requirement (the fallback choice is a founder question).

### v2-F2: Committed is not live. Rows committed before go-live leak into live surfaces, and an abort after commit has no defined dark state

**What could go wrong.** Parties commit during S6, but go-live comes only after S7 reconciliation and sign-off.

- **Leaks.** Today's missionary donor list reads `donors` by tenant and missionary with no cohort or visibility gate (repo-integrated, `packages/api/src/missionary-portal/donors.ts:503-506`; legacy schema, the target Party readers are unbuilt). Committed rows would therefore reach missionaries, donor claim matching and reports before sign-off, with false "Lapsed" or "joined today" signals (q01-r6 §10).
- **Abort after commit.** If reconciliation then fails, q01-r5 X2 recommends "quarantine the migration cohort", but no Party owner defines such a state; the Party tables do not exist yet (decision-log §8, #570). `roadmap.md:4371` forbids deleting a Party after a merge or erasing staff edits. So an abort after commit leaves two systems showing the same people.

**Why it matters.** ADR-0106 `:86-91` establishes the pattern: discardable staging before the fence, then "only the short Asym-side authority transition is atomic". The Q1 answer has no such fence for CRM data.

**Severity / likelihood.** High / high, unless it is designed in.

**Evidence.** As cited.

**Effect on answer.** Narrows.

**Best permanent fix (proportionate).**

- **New tenants.** For a new tenant with no live missionary or donor users, which is the expected case, gate the whole tenant: missionary and donor surfaces, checkout and claim matching, automations and coverage stay off until one atomic go-live, and staff see the data marked provisional.
- **Tenants with live users.** Only where the retained-state census finds live users (D13) does an owner-provided per-cohort not-yet-live state become necessary.
- **Abort after commit.** The data stays dark and is kept for a superseding Switch (X4). It is never deleted.

**Spec language.** "Data committed under a Switch is not visible to missionary or donor surfaces, checkout or claim matching, reports, automations or coverage until one atomic, audited go-live transition. For a tenant without live users this is a tenant-level gate. For a tenant with live users the target owners provide a cohort-level not-yet-live state before any switch is scheduled. An abort after commit leaves the data not live and available to a superseding Switch, and never deletes a Party."

**Bucket.** spec_requirement.

### v2-F3: Stop proof inferred from the absence of charges in a Phase 30 snapshot

**What could go wrong.** Phase 30 catch-up evidence says "no legacy charges since X", and that evidence gets treated as old-executor stop proof (Phase 16 `:1314`). It fails in two ways:

- A charge can occur after the snapshot's as-of time but before Asym activates.
- Some charges never appear in SiteStacker at all: PayPal Standard subscriptions (Payment.js `:1388-1422`, inferred from vendor code; verifier-confirmed), gateway-native schedules (q01-r2), and reruns (v2-E2).

Either way the result is an active-active double charge. #809 already says local suppression is not stop proof (issue #809 body), but it does not address non-Stripe evidence (q01-r4 G20).

**Why it matters.** Charging donors twice is the most damaging money failure in the handover.

**Severity / likelihood.** High / medium.

**Evidence.** As cited; q01-r2 edge case "Ministry pauses SiteStacker cron… restart behaviour unverified".

**Effect on answer.** Narrows refinement 4.

**Best permanent fix.**

- Phase 30 evidence states its as-of time and which executors it can observe.
- Phase 16 stop proof requires cancellation evidence from each executor class: SiteStacker schedule cancelled and rerun path neutralised; PayPal subscription profile cancelled; gateway-native schedule cancelled.

**Spec language.** "Phase 30 catch-up evidence states its as-of time and the executors it can observe. Absence of legacy charges in Phase 30 evidence is never sufficient old-executor stop proof. Phase 16 requires executor-side cancellation evidence for each executor class."

**Bucket.** spec_requirement (an owner requirement on Phase 16).

### v2-F4: Refinement 2 assumes SiteStacker records every post-switch money fact

**What could go wrong.** Refinement 2 catches up "anything SiteStacker records after the switch". Several kinds of money never reach SiteStacker:

- PayPal Standard subscriptions keep charging after SiteStacker is off, for up to 52 cycles (`srt` clamp, Payment.js `:1388-1422`; verifier-confirmed). Any notification to a frozen SiteStacker is unverified.
- Gateway-native schedules.
- Refunds, chargebacks and ACH returns made in the gateway dashboard, which SiteStacker does not document (q01-r2).
- Transactions deleted after a refund (K8).

Money collected or reversed after the switch then appears in neither system, and a SiteStacker-only reconciliation shows no variance.

**Why it matters.** This is silent loss of financial truth, exactly the case that level-2 reconciliation (v2-B2) exists to catch.

**Severity / likelihood.** High / medium-high. How many ministries use PayPal is unknown.

**Evidence.** Verifier "r1 missed" item 2; q01-r2 summary; q01-r3 PayPal catch-up profile.

**Effect on answer.** Changes refinement 2.

**Best permanent fix.**

- Source the catch-up per executor: SiteStacker for cron-run gifts, the ministry's PayPal reports for PayPal subscriptions, and processor reports for reversals and native schedules.
- Run level-2 reconciliation on every catch-up.

**Spec language.** Replace refinement 2 with: "A reviewed catch-up of money facts collected or reversed by any legacy executor after the boundary, sourced per executor (SiteStacker, the ministry's PayPal account and each processor's reports), reconciled per merchant account × currency, never writing supporter details and never winning over Asym edits."

**Bucket.** resolve_before_recording.

### v2-F5: Tail evidence decays and attestations drift unnoticed (monitor)

**What could go wrong.** Over a tail lasting months:

- SiteStacker licensing lapses, or the processor account closes before dispute windows end (q01-r5 E-52; q01-r4 edge case);
- a ministry re-enables a form for a campaign;
- a catch-up silently stops running.

None of this is visible today. Post-handoff run failures are invisible outside the run (O11).

**Why it matters.** The tail is where Option A's "only place" promise is weakest.

**Severity / likelihood.** Medium / medium.

**Evidence.** O11; q01-r5 S9-S10; q01-r6 edge case "Catch-up after go-live contains gifts from a giving form attested as off".

**Effect on answer.** No change.

**Best permanent fix.** Switch-level monitors with a named owner.

**Spec language.** "Each open Switch tail is monitored for catch-up recency, attestation breaches, level-2 variance and source-shutdown risk, with alerts to the named Switch owner."

**Bucket.** monitor.

- **Signals:**
  - (1) days since the last successful catch-up per executor;
  - (2) any post-boundary one-time gift or new SiteStacker person in a catch-up;
  - (3) unexplained level-2 variance per merchant account × currency;
  - (4) SiteStacker contract end or processor account closure date earlier than the planned tail closure.
- **Thresholds:**
  - (1) more than the cadence plus 7 days;
  - (2) at least 1 row;
  - (3) not zero;
  - (4) any.
- **Owner.** The named Switch owner (Phase 30 operations or customer success) with the ministry finance contact.
- **Response:**
  - (1) run the catch-up or record the reason;
  - (2) re-attest, list the affected donors for the receipt owner, and raise an urgent exception;
  - (3) block tail closure and investigate;
  - (4) take final exports and processor reports before shutdown, or extend the tail.

---

## 4. Lifecycle, temporal correctness, concurrency and idempotency

**Material concern: YES.** Refinement 1 is safe only if "same snapshot" describes scope and never identity. The single-boundary framing collides with ratified per-family boundaries. The catch-up needs three time axes and its own idempotency keys for money and reversals.

### v2-L1: Refinement 1 must not make the snapshot the idempotency key

**What could go wrong.** Suppose v1 recognises prior work by snapshot identity (a digest or manifest ID). Every switch path that uses a different snapshot then duplicates:

- the forgotten-file extension (E-40);
- a superseding Switch after an abort that followed a commit (X4);
- catch-ups that overlap the final export window;
- a re-export that is byte-identical but uploaded as a new custody item.

Parties that were merged away or erased also get recreated on replay.

**Why it matters.** The repo already ratified binding-based recognition for the shared engine:

- "row number/file hash/tool name alone is not identity authority" (REQ28-R21, `relationships.md:396-401`, repo-ratified);
- "Qualified external IDs bind Tenant, exact target/workspace, source instance, entity kind and established source binding" (same lines);
- reimport cannot "revive erased content" (`:403`).

Phase 29 states that "a matching digest proves byte equality, not identical provenance … or business significance" (`founder-brief.txt:151`, PR #2430, unmerged). The roadmap requires that reimport "converges on the same permitted target identity" (`roadmap.md:4363`). Owner-constraints says "re-import updates instead of duplicating" (`owner-constraints.md:373-374`). Refinement 1 narrows that last clause for Party fields, so the narrowing must be recorded and the clause edited (C3).

**Severity / likelihood.** High / medium.

**Evidence.** As cited; `r10-gap-g4.md:254` (three identities); O6 (survivor resolution); q01-r5 E-50.

**Effect on answer.** Changes refinement 1's wording.

**Best permanent fix.**

- Record refinement 1 as a scope narrowing of update behaviour only.
- Key Party idempotency on the source-record binding, and money idempotency on the owner's scoped external reference (v2-L2).
- Replaying the same manifest is a no-op re-validation. Any other snapshot converges through bindings.
- Bindings follow Phase 4 survivors. After erasure they remain as non-identifying tombstones that block re-creation.
- Allow one non-terminal Switch per tenant and source instance, and one committing run per Switch and target family at a time.

**Spec language.** "Exact repeat import in v1 means re-running the same sealed source manifest. It recognises all prior accepted work and proposes no new effects. Independently of the manifest, every import and catch-up run converges on the source-record binding (Tenant, source system, source instance, entity kind, source ID). A file digest, row number or manifest identity alone is never identity. A binding whose target was merged follows the Phase 4 survivor. A binding whose target was erased blocks re-creation without keeping identifying data. A tenant and source instance have at most one non-terminal Switch, and each Switch has at most one committing run per target family at a time. In v1, owner-constraints 're-import updates' is narrowed for Party fields to corrective replay (v2-L7), and the clause is edited to say so."

**Bucket.** resolve_before_recording.

### v2-L2: The same gift arrives from several sources, and the legacy external-reference scope is Stripe-shaped

**What could go wrong.** One gift can arrive three ways: as a SiteStacker transaction (ID A), a processor settlement row (gateway ID G), and a Historic Giving row (external_id H; K19 superset). That can produce up to three money facts, or a reconciliation row imported as a gift.

Phase 13 scopes legacy external references to "tenant, connected account, livemode, source object" (`phase-13-…:722-724`, repo-ratified). That scope has no slot for SiteStacker, PayPal, Braintree or other merchant accounts. Phase 13 idempotency is keyed on Stripe ingest event IDs and saga keys (`:1937`), which imported legacy rows do not have.

**Why it matters.** Widening the catch-up to processor and PayPal reports (v2-F4) makes cross-source duplication likely. Story 171 forbids fuzzy linking (`:539-542`), so duplicates can only be prevented by exact keys plus a declared source basis.

**Severity / likelihood.** High / high.

**Evidence.** As cited; q01-r1 K19; verifier note that a Stripe copy keeps `cus_` IDs on both accounts.

**Effect on answer.** Narrows.

**Best permanent fix.**

- Each gift population and period has exactly one authoritative source basis. Other bases are reconciliation evidence, linked only by exact exported cross-reference IDs.
- Processor-only rows go to finance exception review.
- Owner requirement on Phase 13: scope non-Stripe legacy references by source system and instance, executor or gateway, merchant account, environment, object kind and ID.
- Phase 30 tests include identical IDs across two merchant accounts and across SiteStacker versus processor sources.

**Spec language.** "For each gift population and period the Switch records exactly one authoritative source basis. Rows from any other basis are reconciliation evidence and link to the authoritative row only by an exact exported cross-reference ID. They never create a second money fact. Legacy external references are scoped to Tenant, source system and instance, executor or gateway, merchant account, environment, object kind and ID."

**Bucket.** spec_requirement.

### v2-L3: The catch-up conflates late-arriving pre-boundary facts with post-boundary legacy-executed facts

**What could go wrong.** q01-r5 S9 classifies catch-up rows "as late-tail facts against the boundary". Three kinds of row then land in the wrong lane:

- a pre-boundary ACH that settles after the boundary (E-02; Phase 16 `:1295` says such a payment "may later resolve normally");
- a check dated before the boundary but keyed after it (E-20);
- a rerun of a pre-boundary due date (v2-E2).

Receipt treatment then goes wrong: pre-Asym `already_receipted` (`phase-13-…:1031-1035`) versus the open Phase 7 import fact (D4/K4). History coverage declared complete at S7 changes after the fact, so first-gift conclusions drawn from "complete" coverage become wrong (C22).

**Why it matters.** `roadmap.md:4363` requires "occurrence and recorded times". `roadmap.md:4395` says "a source event marked historical cannot become prospective by changing a displayed timestamp". ADR-0106 `:99-104` already ratified three times for late pre-cutover facts: "source-effective/pre-cutover, discovery, and current record times".

**Severity / likelihood.** Medium-high / high.

**Evidence.** As cited; the Phase 19 Late Fact Obligation (q01-r5 A28).

**Effect on answer.** Narrows.

**Best permanent fix.**

- Every catch-up row carries three times: source-effective (occurrence or submission), source-recorded (where exported), and Asym discovery.
- Classify each row by its source-effective time relative to the boundary, into one of three lanes:
  - (a) late pre-boundary history: dark, pre-Asym, and revising coverage;
  - (b) post-boundary legacy-executed money: a separate lane, receipted according to the Phase 7 ruling;
  - (c) post-boundary reversal of a pre-boundary gift: linked to the original and handled through the Phase 7/19 late-fact path.
- Coverage is versioned "complete through boundary, as of {discovery time}".

**Spec language.** "Every catch-up row records its source-effective, source-recorded (where available) and discovery times. It is classified by source-effective time into late pre-boundary history, post-boundary legacy-executed money, or post-boundary reversal of a pre-boundary gift. Each class has its own coverage, receipt and late-fact treatment. History coverage is declared 'complete through the boundary as of {time}' and is revised when late pre-boundary history arrives."

**Bucket.** spec_requirement.

### v2-L4: "One boundary for every family" collides with the ratified per-family and per-executor boundaries

**What could go wrong.** q01-r5 K6 proposes "v1: the same instant for all families". If the CRM switch instant is reused elsewhere, two things break:

- **As the Phase 20 posting-ownership boundary**, it splits payouts from the old processor that span the instant. ADR-0058 `:7-12` forbids this ("cannot split a payout, Deposit Group … merely because dates cross"), and the glossary lists "calendar-date-only cutoff" under Avoid (`CONTEXT.md` Posting Ownership Cutover entry, ~`:6952-6957`).
- **As Phase 16's "protected boundary"** (`:1295`), it turns every planned legacy tail charge into "an urgent reconciliation/refund exception". The result is an incident storm, or wrongful refunds of legitimate gifts.

Phase 20 and Phase 21 boundaries "remain independently authoritative even when intentionally aligned" (`owner-constraints.md:411-413`).

**Why it matters.** Refinement 4 ("design records so Option B can be added later") gets this right only if each boundary stays owned by its owner.

**Severity / likelihood.** Medium-high / medium.

**Evidence.** As cited; ADR-0106 (per-family half-open boundaries).

**Effect on answer.** Narrows refinement 4 and corrects q01-r5 K6.

**Best permanent fix.**

- The Switch records only the boundary for CRM and gift-history authority.
- It references, and never sets, the Phase 20 and Phase 21 boundaries.
- Each legacy executor cohort gets its own Phase 16 control boundary at formal cutover.
- The glossary keeps the terms distinct.

**Spec language.** "The Switch Boundary governs only which source facts are pre-switch history for CRM and gift-history import. It never sets or implies a Phase 20 Posting Ownership Cutover, a Phase 21 Field Account Operational Cutover or a Phase 16 executor boundary. The Switch references those owner-set boundaries where they exist. A legacy-executed charge after the Switch Boundary but before its cohort's Phase 16 cutover is a planned tail fact, not a control-loss exception."

**Bucket.** spec_requirement.

### v2-L5: A catch-up reversal can duplicate an Asym-recorded correction

**What could go wrong.** A donor calls. Staff refund the gift in the old processor, as q01-r4 and q01-r5 E-05 recommend, and record the reversal or write-off in Asym. The next catch-up then imports the same refund from SiteStacker or the processor, creating a second reversal. Phase 13 invariant 6 clamps only total over-reversal ("reject if the requested reversal exceeds the header's effective total", `phase-13-…:1936`), so a duplicated partial refund passes. Invariant 7 keys idempotency on Stripe event IDs (`:1937`), which do not exist for legacy refunds.

**Why it matters.** Two valid actions together violate money conservation. This is precisely the "duplicate delivery" race the roadmap asks to be tested (`roadmap.md:4401`, "concurrent target edits").

**Severity / likelihood.** High / medium.

**Evidence.** As cited; q01-r4 edge case "Refund or chargeback after the switch".

**Effect on answer.** Narrows refinement 2.

**Best permanent fix.**

- Legacy reversals are idempotent on their source reversal identity: the gateway refund ID or the SiteStacker refund transaction ID.
- Staff who record an old-processor action in Asym must enter that identity.
- A catch-up reversal with no matching identity, on a gift that already has an Asym correction, is held for finance review. It is never auto-skipped and never auto-posted.

**Spec language.** "A reversal of an imported legacy gift is idempotent on its source reversal identity. Staff recording an old-processor refund in Asym enter that identity. A catch-up reversal that matches no recorded identity but targets a gift that already has an Asym-recorded correction is held for finance review."

**Bucket.** spec_requirement.

### v2-L6: Practice runs that persist nothing push every review decision into the freeze window

**What could go wrong.** Rehearsal plans "never authorize the final commit" (q01-r5 S1), and a changed input requires "a new reviewed plan" (REQ28-R20-02 pattern). Only tenant mappings are remembered (`roadmap.md:4347`). Hundreds of match-review choices (D19), value maps and exclusion dispositions made in rehearsal must therefore be redone on the final plan during the freeze.

**Why it matters.** Under that time pressure, reviewers either rubber-stamp or overrun the freeze (v2-F1).

**Severity / likelihood.** Medium-high / high.

**Evidence.** As cited.

**Effect on answer.** Narrows.

**Best permanent fix.**

- Save reviewer decisions without writing to targets, keyed by binding plus per-record source-content digest.
- Propose them again on the final plan where both the source content and the target revision are unchanged. Changed records return to review.
- The final plan is still new and sealed, and needs its own commit authority.

**Spec language.** "Reviewer decisions taken during practice runs (mappings, value maps, match choices, exclusions) are saved without writing targets. They are proposed again on the final plan for every record whose source content and target revision are unchanged. Changed records return to review. Carried decisions are labelled as carried and still need the final plan's commit authority."

**Bucket.** spec_requirement.

### v2-L7: There is no corrective path for a mapping error found after go-live

**What could go wrong.** Suppose a mapping error is found after go-live, such as a Data Group mapped to the wrong field. Refinement 1 defines only exact replay, and Options B and C (refresh imports) are rejected. The only remedies left are hand-correcting thousands of records, or a reversal that downstream coverage may block (`owner-constraints.md:378-385`).

**Why it matters.** Mapping errors are common. The roadmap acceptance list already requires proof of "changed mapping" (`roadmap.md:4401`). The per-field base that distinguishes "only the source changed" from "Asym edited" is already identified as missing (`r10-gap-g4.md:118-130`).

**Severity / likelihood.** Medium / high.

**Evidence.** As cited.

**Effect on answer.** Narrows refinement 1.

**Best permanent fix.**

- Re-running the same sealed manifest with a corrected mapping yields a reviewed update plan.
- A field is updated only if its current value equals the value last imported for that binding.
- Fields edited in Asym since import are conflicts.
- Money changes only through owner corrections.
- This requires storing the last-imported value per bound field.

**Spec language.** "Re-running the same sealed manifest with a corrected mapping produces a reviewed update plan. A field is proposed for update only if its current value equals the value last imported for that binding. Fields edited in Asym since import are conflicts, and money facts change only through their owner's correction path."

**Bucket.** spec_requirement.

---

## 5. Corrections to the research found in this review

| #   | Research claim                                                       | Correction                                                                                                                                                        | Evidence                                                 |
| --- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| RC1 | q01-r5 K6: in v1, the same boundary instant applies to all families. | The Switch must not set Phase 20/21 boundaries. Phase 20's must be a drained atomic source boundary that never splits a payout.                                   | ADR-0058 `:7-12`; `owner-constraints.md:411-413` (v2-L4) |
| RC2 | q01-r5 S9: catch-up rows are "late-tail facts against the boundary". | They split into late pre-boundary history, post-boundary legacy money, and post-boundary reversals, using three time axes.                                        | ADR-0106 `:99-104`; Phase 16 `:1295` (v2-L3)             |
| RC3 | q01-r5 §3.1: the boundary is "00:00 local".                          | It is the first instant of the civil date. Midnight can be absent.                                                                                                | MDN startOfDay (verified-vendor-doc) (v2-B4)             |
| RC4 | q01-r5 X2: "quarantine the migration cohort".                        | No owner defines that state. A tenant-level gate covers new tenants, and a cohort state is needed only where live users exist.                                    | decision-log §8; `donors.ts:503-506` (v2-F2)             |
| RC5 | q01-r2 / q01-r1: failed gifts re-run after a card update.            | Confirmed. In addition, no time limit is documented, so reruns can happen after a Phase 16 cutover and must be covered by stop proof.                             | 151000183830 (verified-vendor-doc) (v2-E2)               |
| RC6 | q01-r1 H1: "Many reports are built by WMTEK".                        | V39's wording is "Currently, all reports are built by WMTEK staff", in a Motion 2 workflow context. The scope is narrower, but the point about dependence stands. | `q01-r1:76` (not re-fetched)                             |
| RC7 | Refinement 3 (task): turning Spark off is purely protective.         | Spark goal outcomes can cancel recurring gifts, so turning Spark off can cause over-collection.                                                                   | 151000119746 (verified-vendor-doc) (v2-B3)               |

## 6. What I could not verify

- **SiteStacker export details.** Column sets, timestamp zones, and whether exports carry gateway transaction or refund IDs. All need a real export (F2).
- **Rerun links.** Whether they require login, expire, or survive SiteStacker being taken read-only. The article is silent.
- **PayPal notifications.** Whether SiteStacker still records PayPal IPN after the freeze.
- **Live usage.** How many ministries use Spark goal cancellations or PayPal recurring.
- **Re-fetching.** V39 and V64 were not re-fetched here, and help.sitestacker.com was not retried.
- **Shared engine.** Whether the Phase 28 D17 profile and the staff switch will share binding tables. This is not specified anywhere.
- **Implementation.** None of the proposed fixes exists on develop `629cb71dc`.

## 7. Verdict by category

| Category                                           | Material concern | Verdict                                                                                                                                                                                                                       |
| -------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 Brittleness                                      | Yes              | Option A holds. Its wording assumes an atomic export, reconciliation against itself, three switches and an unambiguous midnight. Fix the wording (B2) and add manifest, rehearsal and attestation requirements.               |
| 2 Edge cases                                       | Yes              | Giving continuity (E1) must be settled before the decision is recorded. Legacy reruns, donor self-service edits and D17 ordering become spec requirements.                                                                    |
| 3 Failure modes                                    | Yes              | Add a freeze deadline with a fallback, a not-yet-live gate, stop proof that is never inferred from absence, and a per-executor catch-up (F4 changes refinement 2).                                                            |
| 4 Lifecycle / temporal / concurrency / idempotency | Yes              | Idempotency is keyed on the binding, not the snapshot (L1 changes refinement 1). Add cross-source money keys, three time axes, owner-set boundaries, reversal idempotency, carried rehearsal decisions and corrective replay. |

**Status:** COMPLETE (2026-11-01).
