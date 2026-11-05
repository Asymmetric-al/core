# Q01 adversarial review v6: observability, proof, footguns and other development hazards

Reviewer track v6 · Phase 30 Imports & Migration Tools (`imports-migration`) · discovery only.
Status: COMPLETE (2026-11-01). Sections were written incrementally.

**Decision under examination.** Founder answer to Q1 (2026-11-01): Option A, one planned switch per ministry for the first release (practice runs that change nothing; ministry-declared freeze; one final export; import; reconcile counts and per-currency totals; Asym becomes the only place for supporters and their history), with four presented refinements (exact repeat import = replay of the same snapshot; reviewed gifts-only catch-up that never overwrites supporter details and never wins over Asym edits; ministry confirms Spark, giving forms and Mailchimp sync are off before Asym automation/sending activates; recurring/processor handover stays with Phase 16 and records carry run identity, source-snapshot identity and per-record lineage so Option B can be added later). The founder added: research fully what must come over from SiteStacker, including the prior payment-processor integration (Stripe or not), and think out the edge cases.

**Categories evaluated (each independently):** 1. Observability and auditability gaps · 2. Testability, traceability and proof · 3. Footguns · 4. Other development hazards.

**Evidence baseline.** Worktree at `develop` `629cb71dc` (verified `git rev-parse HEAD` 2026-11-01). Phase 29 spec read only via `git show 1483a349514c66b458da38e0ba0992efdc2e1f31:<path>` (PR #2430, open, unmerged). Evidence labels: verified-vendor-doc, snippet-only, third-party, repo-ratified, repo-published, repo-integrated, repo-implemented, inferred, assumption, unverified. This review was read-only except for this file.

## 0. Bottom line

Option A is a defensible first-release shape. The repo already uses the same pattern for accounting and Field Accounts: one recorded boundary, a final inspection, and no dual writers. Nothing in my four categories invalidates it. But the answer as worded is **not yet observable, provable or safe to hand to builders**. Five things must change before it is recorded as settled:

1. **Post-switch overlap-and-gap monitoring is missing.** Where Asym cannot lock the previous writer, the repo's ratified precedent is "No known overlap in the inspected scope, followed by post-activation overlap-and-gap monitoring" (ADR-0106:94-96; ADR-0058:22-24). Option A leans on an unevidenced ministry attestation and has no detector for a SiteStacker writer, form, PayPal subscription or gateway schedule that is still live (v6-01, v6-06, v6-07).
2. **The decision text drifts from published acceptance.** It says "counts and per-currency totals"; the roadmap requires totals by Legal Entity × original currency × source basis, checked against independent controls (v6-08). "Asym becomes the only place" cannot be falsified, and it is untrue during the recurring tail (v6-09).
3. **Refinement 2's "reviewed" catch-up runs into a workflow-runtime rule.** That rule lets a _reviewed bounded backfill_ release outward effects, and catch-ups run _after_ Asym automations are live. A catch-up gift could therefore fire thank-yous, receipts or first-gift tasks unless the decision gives it an import-origin outward-effect class (v6-19). Its gift source and join key also need naming, or the same charge arrives twice (v6-20).
4. **Refinement 4's list of identities is incomplete for audit.** It needs a Switch record, a per-family boundary, attestation records, versioned reconciliation sign-off, executor lineage and actor attribution. Background jobs today act as a nil-UUID system actor (v6-02, v6-03). The decision log also pins the lineage safeguard on #2295, which **does not** revoke direct staff writes (v6-04, new finding).
5. **Owner sequencing can force Option B through the back door.** If a ministry switches before the money owner commands exist, its gifts stay in SiteStacker by area (v6-26). The processor half of the "separate migration workstream" still has no owner (v6-25).

---

## 1. Observability and auditability gaps

**Material concern: YES.**

**What I checked.** I read the decision log (C1–C23, O11, §8) and the Option A refinements against:

- ADR-0106:85-104 and ADR-0058:18-28 (cutover-with-unlockable-writer precedent);
- Phase 13 PRD :728-747 and :2190-2200, and Phase 16 PRD :1291-1316 and :2581-2593;
- the workflow-studio runtime PRD (`docs/prds/workflow-studio/03-runtime-and-recovery.md:26`);
- current code: `packages/api/src/workflows/events.ts:16-22` (system actor), `packages/api/src/workflows/summaries.ts:6-33` (run states), `audit_logs` (`20250101000000_init_schema.sql:325-336`), `crm_record_links` RLS (`20260508000413_*.sql:200-240`; `20261024163000_authz_definer_execute_lockdown.sql:39-41`);
- issue #2295 (gh issue view, read 2026-11-01);
- the SiteStacker Change Log vendor article (re-fetched);
- research r10-gap-g4, r10-gap-g6, q01-r2, q01-r5 §3 and q01-r6.

**Verdict.** Option A can be audited only if the answer names the durable records it depends on, and only if Asym monitors for the competing writer it cannot lock. As worded, it has neither.

### v6-01 — No post-switch overlap-and-gap monitor; the attestation is the only control (HIGH / high)

- **What could go wrong.** Asym cannot see SiteStacker: there is no change feed or read API (r10-gap-g4.md:78, vendor documented absence). The ministry could leave a writer live: a forgotten giving form, a text-to-give or QR link, a gateway-native schedule (Authorize.net ARB, Braintree or PaymentSpring plans), PayPal Standard subscriptions, a staff member still keying checks, or a missionary's own Mailchimp list. Nobody would notice until a donor complains, a duplicate charge appears, or a later catch-up happens to contain the row. PayPal-run subscriptions may never appear in a SiteStacker re-export at all (q01-r1 verifier note; q01-r2 §0; inferred).
- **Why it matters.** Option A's promise depends on there being no competing writer, and the repo already says how to be truthful when a prior writer cannot be locked:
  - ADR-0106:94-96 (repo-ratified): "the truthful proof is **No known overlap in the inspected scope**, followed by post-activation overlap-and-gap monitoring."
  - ADR-0058:22-24 (repo-ratified): "cannot atomically lock an independent connector … A final bounded inspection and post-activation overlap detection therefore remain active."
  - P13 :735-736 (repo-ratified): "observation is not control".

  Option A as worded has the inspection (the final export) but no monitoring.

- **Evidence.** As cited above; q01-r2 §0 (gateway-native schedules invisible to SiteStacker exports; inferred from vendor docs and code); q01-r3 PX-1.
- **Effect on answer.** Changes: the answer gains a monitoring obligation.
- **Best permanent fix.** Make overlap-and-gap checking part of every catch-up cycle until tail closure. Compare post-boundary rows from processor reports (per merchant account × currency) and from a fresh filtered SiteStacker export against the Switch's declared list of external executors. Anything unexplained raises an urgent switch exception. Record the inspected scope at go-live and use the ratified proof wording.
- **Spec language.** "At go-live the Switch records its inspected scope (accepted snapshot manifest, processor reports through a stated instant, attestation set) and states 'No known overlap in the inspected scope'; Asym never states that SiteStacker was frozen or switched off. Until tail closure, every catch-up cycle runs an overlap-and-gap check. Any post-boundary source fact that cannot be attributed to a listed external executor (executor type, gateway, merchant account, source schedule ID) is an _unexplained post-boundary fact_. It blocks the next catch-up commit and opens an urgent switch exception for the named ministry owner and the Asym switch operator."
- **Bucket.** spec_requirement.

### v6-02 — Refinement 4 omits the records an audit needs (HIGH / high)

- **What could go wrong.** Refinement 4 lists run identity, source-snapshot identity and per-record lineage. It leaves out the records that answer the questions asked after a disputed switch:
  - When exactly was the boundary, and in which time zone?
  - Who declared the freeze?
  - What did each attestation item say?
  - Which reconciliation report version did finance sign?
  - Which executor (SiteStacker cron, PayPal, gateway-native schedule; which gateway and merchant account) charged a late-tail gift?
  - Which catch-up run brought it in?

  Without a per-family boundary record, classifying any gift as history or late-tail cannot be reproduced later. Without executor lineage, Phase 16 stop proof and Phase 7 receipt decisions cannot be audited.

- **Why it matters.** The roadmap already asks Phase 30 to preserve "batch identity, occurrence and recorded times, historical/cutover disposition and coverage" and to "Provide per-record lineage and reconciliation against the source export" (roadmap.md:4363, repo-published). No owner text defines a switch-level record (q01-r6 owner gaps; q01-r5 §3.1 proposes one). O11 shows run evidence is invisible today (decision-log.md:97). The repo's nearest precedent, the Field Account activation manifest (ADR-0106:85-104), records exactly this kind of boundary-plus-inspected-scope evidence.
- **Evidence.** roadmap.md:4363; decision-log.md:97; ADR-0106:85-104; q01-r5 §3.1 and K6; q01-r2 recommendation "lineage should carry gateway, merchant account and executor type" (inferred).
- **Effect on answer.** Changes: refinement 4 is widened.
- **Best permanent fix.** Specify one durable Switch record and its children. Keep the design-for-B part cheap but tested: store one boundary per source family (all equal in v1) and test that classification reads the family's own boundary.
- **Spec language.** "Each ministry switch has one durable Switch record (Tenant; source system and instance; state; named roles). It owns:
  - a per-source-family boundary (UTC instant, declared IANA zone and civil time, half-open; equal for all families in v1);
  - snapshot manifests (per-file digest, filter, exporter role, source version, export time, UI control counts);
  - runs (plan digest, approver, committer, terminal outcome);
  - attestation items (item key, scope, state, actor, time, evidence reference or 'none supplied');
  - reconciliation report versions and their sign-offs;
  - catch-up runs with their boundary classification;
  - tail closure.

  Per-record lineage resolves to switch → manifest → file → source ID/row → run → plan, and for money also to executor type, gateway and merchant account. Acceptance: a classifier test with two source families at different boundaries passes, even though v1 sets them equal."

- **Bucket.** spec_requirement.

### v6-03 — The committing human is lost when background jobs run the import (HIGH / high)

- **What could go wrong.** Final runs and catch-ups will execute as background jobs. Today:
  - workflow steps act as the nil-UUID `WORKFLOW_SYSTEM_ACTOR_ID`;
  - `audit_logs.user_id` has no FK, so "the nil UUID identifies the workflow executor" (`packages/api/src/workflows/events.ts:16-22`, repo-integrated);
  - the event envelope has no actor slot (r06 6.3/V4, verified);
  - the principal model has no consumer (r06 7.6).

  Every import write would therefore be attributed to "the workflow executor", not to the staff member who approved and committed the plan. C16 also requires deferred jobs to "re-prove the owner's current authority when they fire" (decision-log.md:46), which cannot happen without carrying the principal. No Phase 12 capability exists for declaring the boundary, committing a final run, signing off reconciliation or going live (decision-log.md:150; q01-r6 owner gaps).

- **Why it matters.** Without durable actor attribution, staff cannot safely correct a switch. They cannot tell who approved which plan, and a committer who lost access mid-freeze would keep writing under system authority.
- **Evidence.** As cited; repo-integrated (code), repo-ratified (C16).
- **Effect on answer.** Narrows: no tenant switch until this exists.
- **Best permanent fix.** Carry a durable reference to the approved plan and the committing principal through background execution, and re-prove authority per chunk. Reserve the system actor for mechanical steps.
- **Spec language.** "These switch acts record the human principal, the Phase 12 capability exercised and the time: boundary declaration, each attestation item, final-run commit, catch-up commit, reconciliation sign-off, go-live, abort and tail closure. Background steps executing an approved plan record the plan digest and committing principal and re-prove that principal's current authority before each chunk (C16). A run whose committer loses authority pauses as `authority_lost` with a visible next action; it never continues as the workflow system actor."
- **Bucket.** spec_requirement.

### v6-04 — The lineage and binding carrier is writable by any staff member, and the safeguard is pinned to the wrong ticket (HIGH / medium) — new finding

- **What could go wrong.** The ratified carrier for source bindings and imported provenance is `crm_record_links` (decision-log D9). Every authenticated staff member of the tenant can INSERT and UPDATE it directly: `GRANT SELECT, INSERT, UPDATE … TO authenticated` plus staff-membership policies (`20260508000413_*.sql:204`, `:220-240`), re-scoped to `authenticated` but not removed in `20261024163000_authz_definer_execute_lockdown.sql:39-41` (repo-integrated). The decision log says this lasts "until #2295 … revokes direct access" (D9) and assigns O7 to #2295. **#2295 does not do that.** Its body rewrites the `authenticated` policies to the pure-tenant form and removes `is_super_admin()`. Its done criteria test only cross-tenant denial; there is no revoke of INSERT/UPDATE (gh issue view 2295, read 2026-11-01; repo-published).
- **Why it matters.** Refinement 4's per-record lineage, and the convergence key behind repeat import and catch-up, would sit in a table any staff member can rewrite without a typed audited command. One edited binding makes the next catch-up create a duplicate or attach money to the wrong Party. Forged lineage destroys the audit trail.
- **Evidence.** As cited.
- **Effect on answer.** Changes: the decision log's own safeguard is mis-pinned.
- **Best permanent fix.** Correct D9 and O7 now. Name the owner and ticket that will revoke direct DML. Write bindings only through a typed, audited, append-only command.
- **Spec language.** "Source-record bindings and per-record lineage are written only through the owner's typed command. Direct `authenticated` INSERT, UPDATE and DELETE on the binding carrier is revoked, and a real-database test proves it. Every binding change appends a history row with actor and reason. Decision-log D9 and O7 are corrected: #2295 rewrites policy predicates and does not revoke direct DML; owner [TBD] and ticket [TBD] own the revoke."
- **Bucket.** resolve_before_recording (the decision-log correction); the revoke itself is an implementation safeguard.

### v6-05 — Option A packs the O11 visibility gap into the freeze window (MEDIUM-HIGH / medium)

- **What could go wrong.** Option A puts every final run inside one short window: SiteStacker frozen, Asym not yet live, recommended at under 48 hours (q01-r5 S3, MS Learn, verified-vendor-doc via r5). A stalled or dead-lettered run today surfaces only three ways:
  - as a dispatch row on `/workflows`, which is unlinked from navigation (r10-gap-g6.md:109);
  - as an urgent notification under the tenant notification policy, with no import meaning (g6 :166, :196-197);
  - as a summary state from the fixed set `dispatching|processing|retrying|action_required|completed|failed|dead_letter` (`summaries.ts:6-13`).

  None of these tells the switch operator _which run of which switch_ stalled. Every hour of delay extends the freeze, during which giving forms are off and staff cannot edit.

- **Why it matters.** It turns a known gap (O11) into ministry-visible downtime.
- **Evidence.** As cited; decision-log O11.
- **Effect on answer.** No change to the choice; it sharpens O11.
- **Best permanent fix.** Give the Switch page a run-level status during the frozen-to-live window, with active notification of named roles. Block go-live until every in-scope run is terminal and verified.
- **Spec language.** "Between boundary declaration and go-live, every in-scope run shows one run-level state on the Switch page (`queued`, `running`, `paused_for_review`, `authority_lost`, `failed_needs_action`, `completed_verified`). The named Asym switch operator and ministry owner are notified within [N] minutes of non-progress or a terminal failure. Go-live is blocked while any in-scope run is non-terminal, unverified, or failed without an accepted visible exclusion."
- **Bucket.** spec_requirement.

### v6-06 — Attestation is unevidenced self-declaration with no scope (MEDIUM / high)

- **What could go wrong.** Refinement 3 says the ministry "confirms". In a later dispute ("we turned the form off"), or when a catch-up contains a gift from a form attested as off (q01-r6 edge case), Asym has nothing to re-check. Some evidence does exist on the SiteStacker side. Its Change Log records "users who made changes, where the change was made, and a date/time stamp" for "many of the changes taking place in the system". The article documents no filtering, export or retention (https://training.sitestacker.com/support/solutions/articles/151000096704, modified 25 Sep 2023, accessed 2026-11-01, verified-vendor-doc). Configuration screens and processor dashboards can also be captured. Attestations need scope too: gateways and forms are per Site or Site Channel (q01-r2, 151000118930), and Mailchimp exports are per missionary (151000122392 via q01-r1 verifier).
- **Why it matters.** Without an artifact, an attestation cannot be audited. Without scope, "Mailchimp off" silently omits missionary-owned lists, and "forms off" omits a second Site.
- **Evidence.** As cited.
- **Effect on answer.** Changes the wording of refinement 3.
- **Best permanent fix.** Record each attestation item per scope, with an optional evidence artifact held in Phase 29 custody, and record "none supplied" explicitly. Where the Change Log can be viewed, capture it for the period from the boundary to the final export as freeze evidence. Asym's displayed claim stays "ministry attested".
- **Spec language.** "Each attestation item is recorded per scope (Site, Site Channel, connected missionary account where applicable) with state `confirmed_off` | `kept_on_with_reason` | `not_used`, actor, time, and either a Phase 29 evidence reference (screenshot, configuration export or Change Log view) or 'no evidence supplied'. Asym displays 'ministry attested' and never 'off'."
- **Bucket.** spec_requirement.

### v6-07 — Monitor: tail and external-executor drift (HIGH impact if missed / medium)

- **What could go wrong.** During the recurring tail, legacy executors keep charging. Charges after a recorded Phase 16 stop, or from executors nobody listed, mean duplicate charges or money nobody owns.
- **Why it matters.** P16 :1314 forbids active-active, and P16 :1295 makes a provider attempt evidenced after the protected boundary "an urgent reconciliation/refund exception" (repo-ratified).
- **Evidence.** As cited; q01-r2 §0; q01-r4 §11.
- **Effect on answer.** No change.
- **Best permanent fix.** Monitor.
  - **Signal:** per catch-up cycle, the count and amount of post-boundary charges per external executor × merchant account × currency, from processor reports and SiteStacker exports; and the age of each "Cancellation requested — provider confirmation pending" item (P16 :1293).
  - **Threshold:** any charge on a schedule after its recorded stop proof → urgent; any charge attributable to no listed executor → urgent; any pending cancellation older than one billing cycle → escalate; tail reaching its planned closure date with charges still arriving → escalate to the ministry and founder.
  - **Owner:** Asym switch operator (signal); Phase 16 owner (stop proof and schedule state); ministry finance (refunds in the old processor).
  - **Response:** hold activation of the related Asym schedule, open a refund exception, notify the donor through the Phase 16/17 path, and record the outcome on the Switch.
- **Spec language.** "The Switch records a planned tail-closure date and runs the tail drift monitor defined above every catch-up cycle; closure requires zero unexplained post-boundary facts and stop proof or a recorded end for every listed external executor."
- **Bucket.** monitor.

---

## 2. Testability, traceability and proof

**Material concern: YES.**

**What I checked.** I compared the founder's wording, phrase by phrase, with Phase 30's published acceptance and its retained owner obligations:

- `roadmap.md:4363`, `:4369`, `:4387`, `:4395`, `:4401-4403`;
- `owner-constraints.md:370-372`, `:378-388`, `:431-437`.

I also checked:

- the Phase 29 founder brief on PR head `1483a349`, `:151` and `:283`;
- the workflow-studio runtime PRD `:26`;
- the Field Account glossary in `CONTEXT.md:5035-5043`;
- Phase 13 story 173 (`:546`) against Phase 16 `:1314`;
- the ID namespaces used across the six q01 research files (grep count);
- the export propositions R1–R20 in q01-r1 §6;
- the absence of any real SiteStacker artifact (decision-log §7 g3).

**Verdict.** Option A's key verbs ("reconcile", "only place", "change nothing", "exact repeat") are not yet falsifiable, and one of them is narrower than published acceptance. Every acceptance criterion also rests on export properties nobody has observed.

### v6-08 — Reconciliation wording is narrower than published acceptance and would only check Asym against itself (HIGH / high)

- **What could go wrong.** The decision says "reconcile counts and per-currency totals". Published acceptance requires "record counts and financial totals by Legal Entity, original currency and source basis" (roadmap.md:4369) and "Legal-Entity-partitioned, per-currency control totals" (owner-constraints.md:434-437, repo-published). Three gaps follow:
  - **Source basis.** It is undefined (decision-log D16). Without it, the Historic Giving copy of native income (q01-r1 K19, verified-vendor-doc 151000122348) can double-count on _both_ sides of a reconciliation and still "tie".
  - **Legal Entity.** SiteStacker has none (q01-r2; C19), so totals per Legal Entity need a recorded assertion per merchant account or cohort (q01-r5 E-31).
  - **Independence.** Reconciling Asym's rows against the same files it parsed proves only the parser (r10-gap-g5; q01-r6 finding 3). Independent controls exist: SiteStacker screen counts (q01-r1 R3), the Statements report (R18), and processor reports per merchant account × currency (q01-r2).
- **Why it matters.** Finance sign-off on a self-referential, currency-only total is a false proof. It hides the most likely money defect, the double-count, and it drifts from published acceptance.
- **Evidence.** As cited.
- **Effect on answer.** Changes the decision wording.
- **Best permanent fix.** Record the reconciliation clause in published-acceptance terms, with independent controls. Define source basis before any money profile.
- **Spec language.** "Switch reconciliation reports, for each fact family, source / accepted / rejected / quarantined / excluded / unchanged counts. For money it reports totals by Legal Entity × original currency × source basis, never summed across currencies. Each figure is compared with at least one control total not derived from the imported files: SiteStacker screen counts or the Statements report, and processor reports per merchant account × currency for processor-executed money. Every variance is explained by a named category or it blocks sign-off. 'Source basis' is defined in the Phase 30 spec before any money profile is enabled. The Legal Entity for each money cohort comes from a recorded, reviewer-accepted assertion, never from Site."
- **Bucket.** resolve_before_recording.

### v6-09 — "Asym becomes the only place for supporters and their history" cannot be falsified, and it is untrue during the tail (MEDIUM-HIGH / high)

- **What could go wrong.** Legacy recurring gifts keep running in SiteStacker, PayPal or gateway schedules until a Phase 16 formal cutover. Imported executors default to external read-only (P16 :2581-2593), a different executor needs stop proof first (P16 :1314), and "An existing provider object may keep operating while it is observed" (P13 :735-736). All three are repo-ratified. Ministries will be told they can switch SiteStacker off at go-live, which they cannot (q01-r5 K1). No test can pass or fail "only place".
- **Why it matters.** A false promise becomes a support incident. An unfalsifiable claim also cannot be an acceptance criterion.
- **Evidence.** As cited.
- **Effect on answer.** Changes the wording.
- **Best permanent fix.** Restate it as a testable authority statement with a closure condition.
- **Spec language.** "From go-live, Asym is the system of record for in-scope supporter data, giving history and staff work. SiteStacker and the legacy processors may continue only as listed external read-only executors for named legacy recurring schedules, and for refund and dispute handling on legacy charges, until each schedule's Phase 16 formal cutover or recorded end. Acceptance at tail closure: zero unexplained post-boundary source facts, and every listed executor has stop proof or a recorded end."
- **Bucket.** resolve_before_recording.

### v6-10 — "Exact repeat import" is narrowed without saying so, and could be test-passed by a file-digest shortcut (MEDIUM-HIGH / medium)

- **What could go wrong.** The published texts say more than refinement 1:
  - "exact repeat import" (roadmap.md:4387);
  - "Prove exact reimport" (:4401);
  - "Reimport converges on the same permitted target identity" (:4363);
  - "re-import updates instead of duplicating" (owner-constraints.md:370-372).

  Refinement 1 narrows v1 to replaying the same snapshot. That is a founder narrowing, not an inherited meaning (q01-r6 verifier). It must be recorded as one. The cheapest implementation, "same file digest ⇒ skip", would pass a naive test and violate Phase 29: "A matching digest proves byte equality, not identical provenance, rights, purpose, authority, or business significance" (founder-brief `:151`, PR #2430 head, ratified/published, unmerged). C11 adds "no bytes-only business dedupe". Even in v1, non-identical inputs must still converge row by row through source-record bindings: catch-up snapshots, a forgotten file added later (q01-r5 E-40), and a superseding Switch after an abort (X4). A digest skip would also wrongly skip identical bytes re-uploaded after a reversal.

- **Why it matters.** A misread acceptance criterion produces either duplicates or skipped re-plans, and both corrupt history.
- **Evidence.** As cited.
- **Effect on answer.** Changes: clarifies refinement 1.
- **Best permanent fix.** Define the replay identity (manifest plus plan digest) and the row-level convergence identity (source-record binding) separately, and test both.
- **Spec language.** "v1 'exact repeat import' (a founder narrowing of roadmap.md:4387/:4401) means re-submitting the same snapshot manifest and plan digest. It returns the prior run, with zero target writes and zero new identities. Idempotency never rests on file digest alone. Identical bytes uploaded under a new Switch, or after a reversal, are re-planned. Any later snapshot (catch-up, manifest extension, superseding Switch) converges per row through source-record bindings: previously accepted and unchanged rows show 'no write', changed rows show a reviewed disposition, and nothing is duplicated."
- **Bucket.** spec_requirement.

### v6-11 — "Practice runs that change nothing" is not literally true and has no falsifiable definition (MEDIUM / high)

- **What could go wrong.** A rehearsal _does_ write. It stores exact source bytes (Phase 29 custody, C11), plans, staged derivatives, and possibly a discardable staged shadow (q01-r5 S1, R3). Phase 29's own text says "Uploading a CSV does not import its rows" (founder-brief `:283`), but the bytes and their PII are still retained. A test literally asserting "nothing changed" either fails or gets weakened ad hoc. Ministries may also be misled about what Asym holds after a practice run.
- **Why it matters.** It is a privacy and expectation problem as well as a test gap.
- **Evidence.** As cited.
- **Effect on answer.** Changes the wording.
- **Best permanent fix.** Enumerate permitted rehearsal writes and prove everything else is zero.
- **Spec language.** "A practice run writes only: Phase 29 source custody, Phase 30 plan and staging records, its own audit and run records, and (where a target owner requires one) a discardable staged shadow invisible to ordinary views. A real-database test proves zero rows written to target-owner tables, source-record bindings, outward-effect outbox or dispatch rows, provider API calls and Giving Address issuance. The ministry is shown what was retained and its retention rule."
- **Bucket.** spec_requirement.

### v6-12 — The "zero unintended effect" proof is scoped neither to catch-ups nor to senders outside Asym (HIGH / high)

- **What could go wrong.** Acceptance requires "zero unintended send, enrollment, payment or public effect" (roadmap.md:4401; C23). Under Option A this fails to be provable in two ways:
  - **Catch-ups run while automations are live.** Catch-ups run _after_ go-live, with Asym receipts, automations and Phase 35 recipes active. A test suite that proves darkness only for the pre-go-live final run, with tenant automations still off, proves nothing about the riskiest path.
  - **Some senders are outside Asym.** Several outward effects happen where Asym cannot observe or prove them: SiteStacker System Messages and Spark; gateway-sent receipts; Stripe's automatic ACH mandate-confirmation emails when bank methods are imported as PaymentMethods with emails (verified-vendor-doc via q01-r5 verifier, docs.stripe.com/get-started/data-migrations/payment-method-imports, accessed 2026-11-01); Stripe refund emails on the old account.
- **Why it matters.** Without explicit scope the gate is either unprovable or quietly reinterpreted.
- **Evidence.** As cited; q01-r1 R20 (outward-effect census); r10-gap-g5 §6 (no suppression carrier integrated; grep, 2026-11-01).
- **Effect on answer.** Changes: the proof scope is split.
- **Best permanent fix.** Split the gate into (a) Asym-provable effects and (b) a census and attestation for senders outside Asym, and test catch-ups with automations fully live.
- **Spec language.** "The zero-unintended-effect gate is proven by production-shaped real-database tests for every run kind, including catch-up runs executed with all tenant automations, receipt issuance and workflow recipes active. Each test asserts no email, SMS, workflow trigger, acknowledgment release, receipt, provider call, enrollment, Giving Address issuance or public change. Effects outside Asym (SiteStacker messages, gateway and Stripe emails) are outside Asym's proof. They are listed in the outward-effect census and covered by attestation items, and the switch evidence states that limit."
- **Bucket.** spec_requirement.

### v6-13 — Every acceptance criterion rests on SiteStacker export properties nobody has seen; risk of "synthetic source success" (HIGH / high)

- **What could go wrong.** No real SiteStacker export or supplier exists (decision-log §7 g3). Each Option A mechanism assumes an unverified export property (q01-r1 §6):
  - the snapshot manifest assumes stable IDs (R1) and reproducibility (R2);
  - reconciliation assumes screen-count parity (R3) and that the Statements and processor reports tie out (R18);
  - catch-up joins assume explicit join columns (R4) and processor references (R10);
  - boundary classification assumes known timestamp zones (R8).

  Tests built on invented columns will pass while proving nothing. The roadmap forbids "synthetic source success" (roadmap.md:4395) and requires a representative SiteStacker migration (C23).

- **Why it matters.** It is the largest hidden-assumption risk in the decision.
- **Evidence.** As cited; label: the R1–R20 properties are unverified.
- **Effect on answer.** Narrows: Option A's mechanisms are provisional until the export propositions are proven.
- **Best permanent fix.** Trace each acceptance criterion to the propositions it relies on. Label fixtures as synthetic. No SiteStacker profile, catch-up profile or reconciliation control is "supported" until a real export proves its propositions.
- **Spec language.** "Every SiteStacker-profile acceptance criterion names the q01-r1 R-propositions it depends on. Fixtures not derived from a real export are labelled synthetic and cannot satisfy C23. A profile (CRM, giving, recurring, catch-up from processor reports) is marked supported only after a representative real export has proven its propositions; unproven profiles stay visibly unsupported."
- **Bucket.** spec_requirement.

### v6-14 — Traceability hygiene: colliding research IDs, overloaded terms and contradictory upstream text (LOW-MEDIUM / high)

- **What could go wrong.** Four separate problems:
  - **Colliding IDs.** The six q01 research files reuse the same prefixes for different things. K appears in r1 (K1–K26 corrections) and r5 (K1–K10 amendments). M appears in r2, r4 (M1–M19 money contracts) and r6 (M1–M10 communications). X appears in r1, r2, r3, r5 and r6. R appears in r1 (propositions), r3 and r6. A appears in r1, r4 and r5. P appears in r2, r4 and r6 (grep count, 2026-11-01). A decision-log amendment citing "K4" or "X3" is ambiguous.
  - **Overloaded terms.** "Freeze" against "boundary": the glossary avoids "date-only go-live" and "universal external freeze" (CONTEXT.md:5042-5043; q01-r5 K10). "Catch-up" overlaps with "reviewed backfill" (roadmap.md:4395) and with C18's "recurring intake". "Coverage" has two meanings (D18). "Source basis" is undefined (D16).
  - **Contradictory upstream text.** Phase 13 story 173 still calls re-authorization a fallback "when zero-gap isn't possible" (P13 :546, repo-ratified PRD text), while Phase 16 governs (`:1314`).
  - **Mis-pinned ticket.** O7 points at #2295 (v6-04).
- **Why it matters.** Spec and tickets will inherit ambiguous references.
- **Evidence.** As cited.
- **Effect on answer.** No change to the choice.
- **Best permanent fix.** Use file-qualified IDs in the decision log. Add glossary candidates. Note the governing clause wherever upstream texts conflict.
- **Spec language.** "Decision-log entries cite research items with file-qualified IDs (for example `q01-r5:K4`, `q01-r1:R10`). Glossary candidates before spec: Switch, Switch Boundary (half-open, per source family), Freeze (ministry behaviour, attested), Snapshot Manifest, Catch-up Run (a bounded reviewed backfill of late-tail facts; not recurring intake), Source Basis, History Coverage vs Reversal Coverage. Where Phase 13 story 173 and Phase 16 differ, Phase 16 `:1314` governs."
- **Bucket.** resolve_before_recording.

### v6-15 — Boundary and cross-source classification have no falsifiable acceptance criteria or adversarial fixtures (MEDIUM-HIGH / medium)

- **What could go wrong.** The boundary is the most consequential computation in Option A: every row becomes history or late-tail. These cases can each misclassify, duplicate or lose a gift:
  - DST transitions and timestamps whose zone is unknown (q01-r1 R8 unverified);
  - date-only facts;
  - a card authorized but not captured at the boundary, or ACH still pending (q01-r5 E-01/E-02);
  - the same charge appearing in a SiteStacker export (keyed by its transaction ID) and in a processor report (keyed by a gateway ID);
  - the same `cus_` ID on two Stripe accounts after a self-serve copy ("Copied customers have the same customer ID", verified-vendor-doc via q01-r4 verifier).

  None of these is in the decision or in published acceptance (roadmap.md:4401 lists generic cases only).

- **Why it matters.** Defects here are silent and financial.
- **Evidence.** As cited.
- **Effect on answer.** No change to the choice; it adds acceptance criteria.
- **Best permanent fix.** Add named boundary fixtures to the Phase 30 acceptance list.
- **Spec language.** "Acceptance includes real-database fixtures for:
  - a row exactly at the boundary instant (it classifies as late-tail);
  - DST-gap and DST-overlap civil times;
  - rows within one day of the boundary with an unknown zone (they go to review);
  - date-only rows on the switch day;
  - authorized-not-captured and pending-ACH rows (excluded from history; arrive in catch-up when settled);
  - one charge present in both a SiteStacker export and a processor report (exactly one gift, or both rows quarantined);
  - identical `cus_` IDs on two accounts (never cross-resolved);
  - a staff edit in Asym followed by a catch-up refund on the same gift (refund appended; the Asym edit is preserved)."
- **Bucket.** spec_requirement.

---

## 3. Footguns

**Material concern: YES.**

**What I checked.** Integrated code that a migration would touch:

- `packages/api/src/stripe/tenant-client.ts:55-72` (key fallback);
- `packages/api/src/donor-portal/billing.ts:17-42` (whole-account Billing Portal);
- `packages/api/src/stripe/webhooks.ts:422-445` and `recurring.ts:104-112` (metadata routing; tenant filter applied only when a tenant is known);
- column defaults in `20250101000000_init_schema.sql:76-82` and `20260214090000_foundation_1_schema.sql:333-338`;
- `packages/api/src/missionary-portal/donors.ts:174-192` (unknown status shown as "Active");
- `packages/api/src/admin/contribution-operations/action-handlers/resend-receipt.ts:17-55` (live receipt send).

Ratified and published text:

- Phase 7 `:339` (E3: imported/historical gifts "can be receipted");
- Phase 13 D.6 `:1023-1039` ("pre-Asym" provenance);
- workflow-studio runtime PRD `:26`;
- `roadmap.md:4395`;
- `owner-constraints.md:378-385` ("time-boxed batch undo").

Research: SiteStacker attestation hazards in q01-r1, q01-r2 and q01-r5.

**Verdict.** Several easy, plausible developer, admin and ministry actions produce wrong money, live control of an external executor, or duplicate donor communications. Most are cheap to prevent if named now.

### v6-16 — Imported processor IDs placed in live columns hand Asym control of an external executor (CRITICAL / medium)

- **What could go wrong.** A natural mapping ("Stripe Customer ID" → `donors.stripe_customer_id`) lets a migrated donor open a **whole-account** Stripe Billing Portal session (`billing.ts:37-40`, repo-integrated). From there the donor could change or cancel payment methods that SiteStacker's cron, or another platform, still uses. Two further paths make it worse:
  - Stripe's self-serve copy keeps customer IDs ("Copied customers have the same customer ID as in the original account", docs.stripe.com/get-started/data-migrations/pan-copy-self-serve, accessed 2026-11-01, verified-vendor-doc via q01-r4 verifier), so the same `cus_` resolves on both accounts.
  - Any `sub_` written to `donor_pledges.stripe_subscription_id` would be updated by webhook events routed by metadata (webhooks.ts) through a pledge lookup that filters by tenant only when a tenant is known (`recurring.ts:104-112`). This is adoption by metadata, which P16 K.1/K.2 forbids.
- **Why it matters.** It is a direct violation of "Externally controlled/read-only … never adopt by metadata" (P16 via q01-r4 M7) and C14 ("a provider/source ID is a link, not an identity").
- **Evidence.** As cited.
- **Effect on answer.** No change; this is an implementation safeguard.
- **Best permanent fix.** Store provider IDs only as scoped provenance, and guard against it structurally.
- **Spec language.** "No Phase 30 profile maps a processor identifier into a column read by a live payment, portal or webhook path (today `donors.stripe_customer_id`, `donor_pledges.stripe_subscription_id`, `donor_pledges.stripe_payment_method_id`). Provider identifiers are held only as provenance scoped by tenant, provider, account, mode and object type. A real-database test proves the import path cannot write those columns. A unit test proves no mapping preset targets them."
- **Bucket.** implementation_safeguard.

### v6-17 — Platform-key fallback can send a migrated tenant's donations into Asym's own Stripe account (CRITICAL / low-medium)

- **What could go wrong.** `resolveTenantStripe` falls back to the platform `STRIPE_SECRET_KEY` when the tenant row has no key (`tenant-client.ts:64-66`, repo-integrated). Go-live publishes Asym giving pages (q01-r5 S8). For a rehearsal or migrated tenant that has no tenant key or binding yet, donations would settle on Asym's platform account. That contradicts Phase 13 D1, "Asym never in the flow of funds" (q01-r4 §2.2 and H3).
- **Why it matters.** It puts money in the wrong legal account, the hardest kind of error to unwind.
- **Evidence.** As cited.
- **Effect on answer.** No change.
- **Best permanent fix.** Fail closed. Go-live requires a verified binding; the Phase 13 owner removes the fallback for tenant-scoped charges.
- **Spec language.** "Go-live of a switch is blocked unless the tenant has a verified settlement binding for every Legal Entity × currency whose giving pages will be published. A tenant-scoped charge path never falls back to platform credentials (test: a tenant with no key or binding gets `stripe_unconfigured` and no charge)."
- **Bucket.** implementation_safeguard.

### v6-18 — Column defaults and status normalization manufacture false facts on import (HIGH / medium)

- **What could go wrong.** Any import writer that omits a column gets a default:
  - `donors.joined_date DEFAULT CURRENT_DATE` and `status DEFAULT 'active'` (`init_schema.sql:76`, `:82`);
  - `donations.gift_date DEFAULT CURRENT_DATE`, `currency DEFAULT 'usd'` and `source DEFAULT 'direct'` (`foundation_1_schema.sql:334-338`).

  The missionary portal also maps any unknown status to "Active" (`donors.ts:191`). The results: imported partners "joined today"; everyone looks healthy (contrary to P16 :1068, "Unknown never defaults to healthy", via q01-r6); and a CAD gift with a dropped currency becomes USD. If the reconciliation reads Asym-side currency, the wrong currency reconciles against itself (see v6-08). The Party spine is not built (#570 OPEN), so a v1 writer may well target these legacy tables.

- **Why it matters.** These are silent, plausible-looking corruptions that reach missionaries and finance totals.
- **Evidence.** As cited (repo-integrated); gh #570 state read 2026-11-01.
- **Effect on answer.** No change.
- **Best permanent fix.** Import commands set every fact explicitly or record it as unknown, and tests prove no default is consumed.
- **Spec language.** "Import commands never rely on column defaults. Every written fact is explicit or recorded as unknown. A real-database test commits an import row with optional source fields absent and asserts that no defaulted `joined_date`, `gift_date`, `currency`, `status` or `source` value was written. Imported records with unknown status never display as Active, New, Lapsed or At Risk."
- **Bucket.** implementation_safeguard.

### v6-19 — The "reviewed" catch-up can unlock outward effects, and suppression switched off at go-live would expose it (HIGH / high)

- **What could go wrong.** Four texts combine into a trap:
  - The workflow runtime PRD says: "For imported or historical events, `historical=true` is explicit and outward effects stay dark **unless a bounded backfill request was reviewed**" (`03-runtime-and-recovery.md:26`, repo-published).
  - The roadmap calls "Reviewed backfill … a separate bounded operation" (`:4395`).
  - Refinement 2 calls the catch-up "reviewed".
  - Refinement 3 gates darkness on "before any Asym automation or sending activates", which is tenant-level. Catch-ups run _after_ that activation.

  Catch-up gifts occur after the boundary, so they are not "pre-Asym" in Phase 13 D.6's sense (`:1031-1035`). A darkness rule keyed on "historical" or "pre-Asym" may not reach them. Meanwhile Phase 7 E3 says imported or historical gifts without a staged-gift record "can be receipted" (`:339`, decision-log D4), and the integrated `resend_receipt` action sends through Resend without any provenance check (`resend-receipt.ts:17-55`). If someone implements darkness as a tenant "migration mode" that is switched off at go-live, the first catch-up could fire thank-yous, first-gift or "new partner" tasks, or a second receipt for a charge SiteStacker already receipted. Whether late-tail gifts may ever earn Asym acknowledgments is still open founder question F5 (decision-log.md:111).

- **Why it matters.** Duplicate or wrong donor communications break the published C23 gate and donor trust.
- **Evidence.** As cited.
- **Effect on answer.** Changes the wording of refinement 2.
- **Best permanent fix.** Bind catch-up facts to the import-origin outward-effect class and suppress per fact, never per tenant mode. Make outward effects for late-tail gifts a separate, explicitly bounded request decided under F5 and Phase 7.
- **Spec language.** "Every catch-up fact carries the import-origin outward-effect class (`historical=true` for workflow subscriptions; import-origin for Phase 14 holds), whatever its post-boundary occurrence time, together with the source's receipt evidence. Approving a catch-up plan approves data only. Any outward effect for late-tail gifts needs a separate, explicitly bounded backfill request under the F5 decision and Phase 7 rules. Suppression is keyed to the fact's origin and never to a tenant-level migration mode. Live send actions (receipt resend, acknowledgments) refuse import-origin and catch-up facts unless the governing owner rule allows them."
- **Bucket.** resolve_before_recording.

### v6-20 — Catch-up can double-import a charge under two IDs, or duplicate a check keyed in both systems (HIGH / medium-high)

- **What could go wrong.** The base import converges on SiteStacker transaction IDs. A catch-up drawn from processor or PayPal reports (needed because PayPal-run subscriptions may never reach SiteStacker; q01-r1 verifier, q01-r3 PX-2) carries gateway IDs. Whether SiteStacker exports include gateway IDs is unverified (q01-r1 R10). Story 171 forbids linking by email, name, phone or fingerprint (P13 :539-542, repo-ratified). So a charge settled near the boundary arrives twice, or every processor row quarantines. Separately, freeze-period checks keyed in Asym's offline batches (Phase 15) and also in SiteStacker produce two gifts with no shared ID (q01-r5 E-20 says "don't key in SiteStacker" but has no detection).
- **Why it matters.** Duplicate giving history corrupts totals, statements and first-gift facts.
- **Evidence.** As cited.
- **Effect on answer.** Changes: refinement 2 must name its sources.
- **Best permanent fix.** Declare one gift source per executor × period. Use processor reports as reconciliation evidence only, unless a real export proves a join key. Send post-boundary manual or offline tender rows to review.
- **Spec language.** "Each catch-up population declares exactly one gift source per executor × period (for example, SiteStacker Contributions for cron-executed cards; the PayPal report for PayPal subscriptions). Rows from any other source are reconciliation evidence only, unless a proven shared identifier links them. Post-boundary SiteStacker rows with manual or offline tender go to review as possible dual entry and are never auto-created."
- **Bucket.** spec_requirement.

### v6-21 — A blunt "turn it off" checklist breaks card-network duties and misses lists missionaries own (HIGH / medium)

- **What could go wrong.** Several "off" items cause harm or miss the target:
  - **Spark off.** SiteStacker's own PaymentSpring guidance says receipts must be sent "after every billing" and an online cancellation method must exist, and the Mastercard pre-billing reminder is a Spark automation (151000122015, verified-vendor-doc via q01-r4 §4 and q01-r2). Turning Spark off while SiteStacker still charges annual gifts stops required notices.
  - **Contribution Receipt and Declined messages off.** This leaves tail charges unreceipted (q01-r5 K4).
  - **Pausing the cron during the freeze.** Restart behaviour is unknown, so a burst of back-charges is possible (q01-r2 §7, unverified).
  - **Mailchimp sync off.** Missionary Mailchimp is a manual one-way export into missionary-owned accounts (151000122392, verified-vendor-doc via q01-r1 verifier). Turning sync off does nothing to lists already exported.
- **Why it matters.** Compliance and donor harm, caused by following the checklist exactly as written.
- **Evidence.** As cited.
- **Effect on answer.** Changes refinement 3.
- **Best permanent fix.** Use a three-state, item-level checklist with a defined "keep on during tail" set.
- **Spec language.** "The attestation checklist has named items, each `confirmed_off` | `kept_on_with_reason` | `not_used`. These are kept on through the tail unless re-homed by an owner ruling: SiteStacker recurring cron; Contribution Receipt; Contributions Declined; the recurring reminder; the donor cancel path. These are turned off: giving forms and checkout; text-to-give replies; non-transactional Spark events and Motion workflows; org Mailchimp sync; SiteStacker imports and rollbacks. Lists exported to missionary-owned Mailchimp accounts are a separate per-missionary item: disconnect, suppression export requested, or recorded out of scope."
- **Bucket.** resolve_before_recording.

### v6-22 — A generic "Undo batch" or emergency fallback after go-live recreates dual writers (MEDIUM-HIGH / low-medium)

- **What could go wrong.** owner-constraints.md:378-385 promises "time-boxed batch undo" while no downstream coverage exists. A generic Undo on a final switch run after go-live could hide or remove records that Asym-native gifts, consent withdrawals or staff edits now reference. Under pressure, a ministry might re-enable SiteStacker giving forms "temporarily", which is an active-active state the repo forbids (q01-r5 X3, E-48; roadmap.md:4395 "permanent dual writers").
- **Why it matters.** Data loss, or a dual writer, from a well-meant recovery.
- **Evidence.** As cited.
- **Effect on answer.** No change.
- **Best permanent fix.** After go-live, switch runs expose only "Prepare reversal" through owner successors. Re-enabling a SiteStacker writer is a recorded founder exception on the Switch.
- **Spec language.** "After go-live, a switch run offers no batch Undo. Corrections use owner successor commands through a prepared, reviewed reversal or correction plan. Re-enabling any SiteStacker writer after go-live is recorded on the Switch as a founder-approved exception with scope and end date, and the overlap monitor (v6-01) treats its writes as expected-but-reviewed."
- **Bucket.** spec_requirement.

### v6-23 — Intake footguns: partial exports, credential-bearing packages, card numbers (HIGH / medium)

- **What could go wrong.** Research already names each of these (q01-r5 E-26; q01-r1 X-full-DB; q01-r3 PX-11/PX-12). They are listed here because each needs an acceptance criterion:
  - an export run by a permission-restricted user is silently partial;
  - a full database or WMTEK package carries password hashes, API secrets and processor tokens;
  - a ministry uploads a processor's PAN file or Stripe mapping file.

  Phase 13 story 172 forbids Asym handling raw card or bank credentials (P13 :543-545).

- **Why it matters.** PCI scope expansion; silent data loss.
- **Evidence.** As cited.
- **Effect on answer.** No change.
- **Best permanent fix.** Detect these at intake.
- **Spec language.** "Intake rejects and quarantines, without parsing, any file matching card-number (Luhn plus pattern) or bank-credential patterns, credential-bearing table or column names, or unlisted tables, with Phase 29 disposal. Every snapshot file records its exporter's role. Row counts below the recorded screen control count block snapshot acceptance."
- **Bucket.** implementation_safeguard.

### v6-24 — One person can declare, commit, sign off and go live with no record of it (MEDIUM / medium)

- **What could go wrong.** Nothing separates the boundary declarer, the final-run committer, the finance sign-off and go-live. A rubber-stamped reconciliation then ships a wrong total. Small ministries may genuinely have one operator (assumption; to be verified by a ministry interview).
- **Why it matters.** Unreviewed money sign-off.
- **Evidence.** q01-r6 open question; no Phase 12 capability exists (decision-log.md:150).
- **Effect on answer.** No change.
- **Best permanent fix.** Proportionate: when money families are in scope, require a distinct finance approver by default. Allow one operator only with an explicit recorded acknowledgment.
- **Spec language.** "When any money family is in scope, the reconciliation sign-off is recorded by a principal holding the finance sign-off capability. If that principal also committed the run, the Switch records an explicit single-operator acknowledgment."
- **Bucket.** spec_requirement.

---

## 4. Other development hazards

**Material concern: YES.**

**What I checked.**

- Ownership text: Phase 13 PRD `:159-165`, `:728-747`, `:2190-2200`; `roadmap.md:4341`, `:4377`, `:4387`, `:4403`; decision-log C1, C3, D12, D13.
- Live issue states read 2026-11-01: #711, #809, #834 and #570 are OPEN; #2347 and #2087 are OPEN and labelled `Ready`.
- Environment truth: `docs/ops/environments.md:5`, `:16`, `:41`, `:206`, and `scripts/seed-demo.sh:6-8`, `:99-104`.
- The roadmap's reversal and correction duty: `roadmap.md:4371`, `:4403`.

**Verdict.** The biggest development hazards are unclear ownership and sequencing, not code. Without explicit rules, Option A either quietly turns into Option B, or Phase 30 absorbs another owner's authority.

### v6-25 — Option A's freeze and reconciliation steps straddle a workstream nobody owns (HIGH / high)

- **What could go wrong.** Phase 13 assigns "processor coordination, credential-vault transfer, reauthorization campaigns, cutover freezes, and bulk reconciliation" to "the separate migration workstream" (`:743-746`). It widens that list to "cutover freeze and reconciliation, connected-account readiness, and recurring-executor replacement at scale" (`:2192-2199`). All of this is repo-ratified PRD text, and no phase is named. The CRM ETL half is effectively Phase 30's (P13 `:165`; roadmap.md:4377, inferred). The founder's "ministry-declared freeze" and "reconcile" steps sit on the seam between the two halves. Two failure modes follow:
  - the Phase 30 spec quietly takes on freeze and processor-reconciliation authority by shorthand, which C3 forbids;
  - nobody builds processor reconciliation or stop proof for non-Stripe executors. #809 is designed around a Stripe adapter (q01-r4 G20).
- **Why it matters.** Unowned duties are not built, and money owners lose authority they still hold.
- **Evidence.** As cited; q01-r4 §6 and its verifier.
- **Effect on answer.** Narrows: Phase 30's part of "freeze" and "reconcile" gets an explicit scope.
- **Best permanent fix.** Record the split now and add an owner requirement for the processor half.
- **Spec language.** "Phase 30 owns the Switch record, boundary, attestation evidence, snapshot manifests, reconciliation-report mechanics and catch-up transport. The following belong to the separate migration workstream (P13 :743-746, :2192-2199), owner [TBD, new O12]: processor coordination, vault transfer, re-authorization campaigns, stop proof for non-Stripe executors, and the money meaning of bulk processor reconciliation. Phase 30 records their outputs as switch evidence and never decides them."
- **Bucket.** resolve_before_recording.

### v6-26 — Switching before the money owner commands exist forces Option B through the back door (HIGH / high)

- **What could go wrong.** None of the money targets exist:
  - no Phase 13 typed import command (#711 OPEN);
  - no Phase 16 classifier (#834 OPEN) or formal cutover (#809 OPEN);
  - no Party spine (#570 OPEN);
  - no import-origin hold or batch-origin suppression carrier (r10-gap-g5 C1, grep);
  - nothing for imports implemented (decision-log §8).

  The roadmap starts with "a complete low-risk source-to-Party import" (`:4387`). If a ministry switches when only Parties are importable, its giving history stays in SiteStacker, family by family. That is the Option B the founder rejected. Later, the money families would arrive months after go-live as a manifest extension against the old boundary (q01-r5 E-40), after Asym-native gifts exist. First-gift and inactivity conclusions would then flip (C22), and Phase 19 statements would see late facts.

- **Why it matters.** It contradicts the decision's own promise ("supporters and their history") and the rejection of Option B.
- **Evidence.** As cited.
- **Effect on answer.** Narrows: when a ministry may switch.
- **Best permanent fix.** A readiness rule: a ministry switch is scheduled only when every family in the kit is owner-ready, or is excluded with ministry sign-off and a history-coverage declaration that blocks first-gift and inactivity conclusions. Any later family import uses the same Switch and boundary as a reviewed manifest extension.
- **Spec language.** "A ministry switch may be scheduled only when every family the ministry needs for 'supporters and their history' is either owner-ready (typed import command qualified) or recorded as a visible exclusion signed by the ministry, with a history-coverage declaration that blocks first-gift and inactivity conclusions for that scope. A family imported after go-live is a reviewed manifest extension under the same Switch and boundary. It is outward-effect-dark, and it revises coverage without triggering first-support work."
- **Bucket.** resolve_before_recording.

### v6-27 — Monitor: Phase 28 factory tickets can pre-empt the shared run and snapshot machinery (MEDIUM / medium)

- **What could go wrong.** #2347 (OPEN, labelled `Ready`, updated 2026-10-26) and #2087 (OPEN, `Ready`) design plan storage in Phase 28 tables with no per-profile bounds, and add a parser package (decision-log D12; §6). Refinement 4's run, snapshot and lineage identities would then be retrofitted onto Phase 28-named machinery.
- **Why it matters.** Rework, and a second importer, against roadmap.md:4377 and ADR-0173.
- **Evidence.** As cited.
- **Effect on answer.** No change.
- **Best permanent fix.** Monitor.
  - **Signal:** a PR linked to #2347 or #2087 opened or moved to review, or either issue closed.
  - **Threshold:** any such event before the Phase 30 spec settles plan and run ownership and per-profile bounds.
  - **Owner:** founder, with the Phase 30 grooming lead.
  - **Response:** the founder decides to hold or amend the ticket (tracker action needs founder authorization; discovery cannot write).
- **Spec language.** "The Phase 30 spec names the shared plan, run and snapshot identity model and per-profile bounds. Phase 28 D17 consumes them, never the reverse."
- **Bucket.** monitor.

### v6-28 — Environment truth: rehearsal and census can hit the wrong database, or put real PII outside production (HIGH / low-medium)

- **What could go wrong.** The docs disagree about whether production holds real donors and live Stripe money (`environments.md:5`, `:16`, `:206`) or Core is not in production (decision-log D13). `scripts/seed-demo.sh` in `hosted` mode expects project ref `btewedpsxwsjczvmegby` by default (`:6-8`), which `environments.md:206` lists as Production. Preview must "never use production data" (`environments.md:41`), yet Option A rehearsals need real ministry exports. Hosted databases drift from the migration files (D13). The retained-state census (C23) could run against a database whose schema differs from what CI tested, or a rehearsal could load real PII into a shared preview project.
- **Why it matters.** It undermines the census evidence and is a privacy exposure.
- **Evidence.** As cited (repo-integrated and repo-published).
- **Effect on answer.** No change.
- **Best permanent fix.** Each Switch pins the target environment and project, and records schema evidence. Real exports are processed only in the tenant's production project under Phase 29 custody, never in preview or development.
- **Spec language.** "Every census, practice run and final run records the Supabase project ref and the applied-migration list, which must match the release under test. Real ministry exports are accepted only into the target tenant's production project under Phase 29 custody; preview and development reject them."
- **Bucket.** implementation_safeguard.

### v6-29 — No repair path for a systematic mapping error found after go-live (HIGH / medium)

- **What could go wrong.** Option A commits all of history in one go. A wrong mapping rule (for example, a designation mapped to the wrong campaign, or a fee line treated as a gift) affects thousands of rows. After go-live there is no rollback (q01-r5 X3). Money corrections are append-only per fact (P13 `:1767` via q01-r5). The roadmap forbids "mass outward replay" (`:4395`) and requires "target-specific reversal and reconciliation procedures before tenant use" (`:4403`). No bulk, reviewed correction mechanism is defined. Repair would fall to developers doing direct database fixes, which the repo forbids for money.
- **Why it matters.** It creates operational burden and a temptation to bypass owner commands.
- **Evidence.** As cited.
- **Effect on answer.** No change to the choice; it adds a release gate.
- **Best permanent fix.** Before tenant use, define a reviewed bulk correction run. Phase 30 transport invokes owner correction commands per affected row, with the same plan, review and darkness rules. Add a go/no-go check: per-mapping-rule spot checks on the final rehearsal.
- **Spec language.** "Before any tenant switch, the Phase 30 spec publishes, per target, a reviewed bulk-correction plan type. It selects affected rows by run and mapping rule, previews owner correction successors, commits through owner commands only, stays outward-effect-dark, and is recorded on the Switch. Go/no-go requires a signed per-mapping-rule spot-check sample from the final practice run."
- **Bucket.** spec_requirement.

---

## 5. Corrections to the decision log and to prior research found by this review

| #     | Correction                                                                                                                                                                                                                                                             | Evidence                                                                                                   | Label                           |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------- |
| V6-K1 | Decision-log D9 and O7 say #2295 will revoke direct staff DML on `crm_record_links`. #2295 only rewrites `authenticated` policies to the pure-tenant form and removes `is_super_admin()`; INSERT/UPDATE stay granted. No ticket that revokes them has been identified. | `gh issue view 2295` (body, read 2026-11-01); `20260508000413_*.sql:204-240`; `20261024163000_*.sql:39-41` | repo-published; repo-integrated |
| V6-K2 | The workflow runtime PRD lets "a bounded backfill request [that] was reviewed" release outward effects for historical events. This collides with refinement 2's "reviewed" catch-up. No research track cites it in that context.                                       | `docs/prds/workflow-studio/03-runtime-and-recovery.md:26`                                                  | repo-published                  |
| V6-K3 | r5 cites ADR-0106's proof wording but not its paired obligation, "followed by post-activation overlap-and-gap monitoring". ADR-0058 has the same pairing. Option A needs both halves.                                                                                  | ADR-0106:94-96; ADR-0058:22-24                                                                             | repo-ratified                   |
| V6-K4 | Phase 29 already rules that a matching digest is not business identity. That makes a digest-based reading of refinement 1 non-conforming.                                                                                                                              | PR #2430 head founder-brief `:151`                                                                         | ratified/published, unmerged    |
| V6-K5 | A live staff action (`resend_receipt`) sends a receipt through Resend without checking gift provenance. Any import or catch-up path that creates staged gifts would expose imported gifts to it.                                                                       | `resend-receipt.ts:17-55`                                                                                  | repo-integrated                 |
| V6-K6 | Research ID namespaces collide across q01-r1 to q01-r6 (K, M, X, R, A, P).                                                                                                                                                                                             | grep count, 2026-11-01                                                                                     | repo (working files)            |

---

## 6. What I could not verify

- Whether SiteStacker's Change Log can be filtered or exported. The vendor article (151000096704) is silent, and the help-site snippet in r07 is unverified. v6-06 therefore treats Change Log evidence as "where available".
- Whether SiteStacker exports carry gateway, customer or subscription IDs (q01-r1 R10). v6-20 is designed to be safe either way.
- Whether a v1 importer would write the legacy `donors`/`donations` tables or the unbuilt Party spine. v6-18 applies to whichever writer touches defaulted columns.
- Whether #2295's pure-tenant predicate (`tenant_id = authz.current_tenant_id()`) changes _which_ authenticated users can write `crm_record_links`. I did not analyse `authz.current_tenant_id()`.
- I did not re-fetch Stripe or PayPal documentation. Vendor claims about Stripe copy, ACH emails and PayPal `srt` come from the verifier-corrected research digest, and are labelled as such.
- I did not read the Phase 12 PRD directly for import capabilities. The absence of a capability rests on decision-log §8 and q01-r6/r10-gap-g6.
- The single-operator reality of small ministries (v6-24) is an assumption. A ministry interview would confirm it.

---

## 7. Summary table

| ID    | Category      | Title                                                                           | Severity / likelihood    | Effect    | Bucket                   |
| ----- | ------------- | ------------------------------------------------------------------------------- | ------------------------ | --------- | ------------------------ |
| v6-01 | Observability | No post-switch overlap-and-gap monitor                                          | high / high              | changes   | spec_requirement         |
| v6-02 | Observability | Refinement 4 omits Switch, boundary, attestation, sign-off and executor records | high / high              | changes   | spec_requirement         |
| v6-03 | Observability | Committing human lost in background execution; no capability                    | high / high              | narrows   | spec_requirement         |
| v6-04 | Observability | Lineage carrier staff-writable; #2295 mis-pinned                                | high / medium            | changes   | resolve_before_recording |
| v6-05 | Observability | O11 gap packed into the freeze window                                           | medium-high / medium     | no_change | spec_requirement         |
| v6-06 | Observability | Attestation unevidenced and unscoped                                            | medium / high            | changes   | spec_requirement         |
| v6-07 | Observability | Tail and external-executor drift                                                | high / medium            | no_change | monitor                  |
| v6-08 | Testability   | Reconciliation narrower than acceptance and checks Asym against itself          | high / high              | changes   | resolve_before_recording |
| v6-09 | Testability   | "Only place" cannot be falsified and is untrue during the tail                  | medium-high / high       | changes   | resolve_before_recording |
| v6-10 | Testability   | Repeat-import narrowing; digest shortcut                                        | medium-high / medium     | changes   | spec_requirement         |
| v6-11 | Testability   | "Change nothing" undefined                                                      | medium / high            | changes   | spec_requirement         |
| v6-12 | Testability   | Zero-effect proof scope (catch-ups; senders outside Asym)                       | high / high              | changes   | spec_requirement         |
| v6-13 | Testability   | Acceptance rests on unseen export properties                                    | high / high              | narrows   | spec_requirement         |
| v6-14 | Testability   | ID collisions, overloaded terms, contradictory upstream text                    | low-medium / high        | no_change | resolve_before_recording |
| v6-15 | Testability   | Boundary and cross-source fixtures missing                                      | medium-high / medium     | no_change | spec_requirement         |
| v6-16 | Footgun       | Provider IDs in live columns                                                    | critical / medium        | no_change | implementation_safeguard |
| v6-17 | Footgun       | Platform-key fallback at go-live                                                | critical / low-medium    | no_change | implementation_safeguard |
| v6-18 | Footgun       | Defaults manufacture false facts                                                | high / medium            | no_change | implementation_safeguard |
| v6-19 | Footgun       | "Reviewed" catch-up unlocks outward effects; suppression by tenant mode         | high / high              | changes   | resolve_before_recording |
| v6-20 | Footgun       | Catch-up duplicates under two IDs; dual-keyed checks                            | high / medium-high       | changes   | spec_requirement         |
| v6-21 | Footgun       | Blunt "off" checklist breaks network duties; misses missionary lists            | high / medium            | changes   | resolve_before_recording |
| v6-22 | Footgun       | Post-go-live Undo or emergency fallback                                         | medium-high / low-medium | no_change | spec_requirement         |
| v6-23 | Footgun       | Intake: partial, credential-bearing or card-number files                        | high / medium            | no_change | implementation_safeguard |
| v6-24 | Footgun       | No separation-of-duties record                                                  | medium / medium          | no_change | spec_requirement         |
| v6-25 | Other         | Freeze and reconcile straddle an unowned workstream                             | high / high              | narrows   | resolve_before_recording |
| v6-26 | Other         | Switching before money owners are ready forces B through the back door          | high / high              | narrows   | resolve_before_recording |
| v6-27 | Other         | Phase 28 tickets pre-empt shared machinery                                      | medium / medium          | no_change | monitor                  |
| v6-28 | Other         | Environment truth and PII placement                                             | high / low-medium        | no_change | implementation_safeguard |
| v6-29 | Other         | No bulk-correction path after go-live                                           | high / medium            | no_change | spec_requirement         |

Status: COMPLETE (2026-11-01).
