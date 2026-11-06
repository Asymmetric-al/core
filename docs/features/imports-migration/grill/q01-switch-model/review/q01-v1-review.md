# Q1 adversarial review v1: Option A "one planned switch per ministry"

Reviewer track: v1 (categories: problem validity/necessity/alternatives; overengineering; operational burden; UX/UI and user friction).
Status: COMPLETE (2026-11-01). Twenty concerns, v1-01 to v1-20; summary and proposed amended Q1 record in §5.
Evidence baseline: develop 629cb71dc (worktree), Phase 29 spec PR #2430 head 1483a349514c66b458da38e0ba0992efdc2e1f31 (open, unmerged). Access date for every external URL: 2026-11-01.
Mode: discovery review only. Read-only except this file. No spec, ticket or implementation authority.

Evidence labels: verified-vendor-doc, snippet-only, third-party, repo-ratified, repo-published, repo-integrated, repo-implemented, inferred, assumption, unverified.

## 0. What was reviewed and how

**Decision under review (founder answer to Q1, 2026-11-01; `decision-log.md:19-23`).** Option A "one planned switch per ministry": practice runs that change nothing; a ministry-declared freeze; one final export; import; reconcile counts and per-currency totals; "Asym then becomes the only place for supporters and their history". The four presented refinements are, per the decision log, _not yet recorded as decided_ (`decision-log.md:23`):

1. "exact repeat import" = safely replaying the same source snapshot;
2. a reviewed, gifts-only catch-up for what SiteStacker records after the switch, never overwriting supporter details and never winning over Asym edits;
3. before Asym automation or sending activates, the ministry confirms SiteStacker automations (Spark), giving forms and Mailchimp sync are off;
4. recurring/processor handover stays with Phase 16, and records carry run identity, source-snapshot identity and per-record lineage so Option B can be added later.

The founder also asked that we fully research what must be brought over, including how the integration with the previous payment processor works (Stripe or not), and think through the edge cases.

**Scope of this review (v1 track).** Four categories, each judged on its own: (1) problem validity, necessity and alternatives; (2) overengineering; (3) operational burden; (4) UX/UI and user friction. Other categories (security, data integrity, tenancy, RLS and so on) belong to sibling reviewers. I mention them only where they change a finding in my four categories.

**Method.** I read the decision log in full. I read the q01 r4, r5 and r6 research in the sections relevant to my categories, and used the r1 to r6 digest, including its verifier corrections, which override the research where they conflict. I independently re-read these governing sources on develop `629cb71dc`:

- `roadmap.md:4320-4420`
- `owner-constraints.md:329-455`
- P16 `:1230-1238`, `:1262-1266`, `:1287-1296`, `:1312-1317`, `:1066-1069`
- P13 `:157-166`, `:729-747`, `:657-663`, `:2190-2200`
- P28 `finance-stewardship.md:50-53`
- `CONTEXT.md:2826-2852`, `:5030-5045`

Live code checked: `packages/api/src/missionary-portal/donors.ts:173-191`, `packages/api/src/email/consent.ts:15-20`, `:187-200`, `packages/api/src/stripe/tenant-client.ts:59-66`, `supabase/migrations/20250101000000_init_schema.sql:76`, `:82`, and `supabase/migrations/20260214090000_foundation_1_schema.sql:334`. Tracker GETs: #809, #834, #711, #512 and #2295 are all OPEN; PR #2430 is OPEN.

I re-fetched three SiteStacker vendor articles myself (accessed 2026-11-01):

- **151000122015** "Payment Spring: Mastercard Regulation Changes" (modified 19 Sep 2023): "For any recurring payment plan that bills a cardholder less frequently than every six months … the merchant must send a notification at least seven days, but no more than 30 days, before the billing date". It is implemented as the Spark "Recurring Schedule Reminder" with a "Send a message" outcome. verified-vendor-doc.
- **151000183830** "Rerun Failed Recurring's Feature - System Message" (modified 22 Aug 2024): "When a contribution fails for any reason the donor will receive an email". The "Contributions - Contributions Declined" message carries "You can update your payment method and re-run your gift by clicking here", and "the gift will be reprocessed automatically". verified-vendor-doc.
- **151000191779** "Checkout Customization Options" (modified 28 May 2024): "Generally, the only time a donor needs to create an account is when they are giving an auto-recurring gift". A section is headed "Allow recurring gifts to checkout without needing a login", and an option exists to "push the account creation to after the recurring gift is completed". verified-vendor-doc.

**Current vs intended vs best permanent path, in one line.** _Current_ (repo-integrated): nothing for imports exists. The Stripe client falls back to the platform key (`tenant-client.ts:64-66`), and missionary views render stored "Lapsed"/"At Risk" labels and default unknown to "Active" (`donors.ts:173-191`). _Intended_ (repo-ratified/published): Phase 30 handles transport, plans and run evidence only. Money owners keep every money rule. A different executor is a formal cutover with old-stop proof (P16 `:1314`), and no permanent dual writers are allowed (`roadmap.md:4395`). _Best permanent path_ (inferred): Option A for supporter data and staff work, plus an **explicitly planned, bounded external recurring tail**. I call this A′ below.

---

## 1. Problem validity, necessity, and alternatives

**Material concern: YES.** The root problem is real and sits at the right level. Option A is the right base model for supporter data and staff work. As worded, though, the decision promises an outcome that cannot be delivered on switch day for any ministry with recurring giving. It also conflates "first Phase 30 release" with "first ministry switch". Three of its four refinements are too narrow or mis-sourced.

### 1.1 Is the problem real and at the right level?

- **Real, named user need (repo-published).** The roadmap names the SiteStacker migration kit a "delivery requirement, not an incidental example" (`roadmap.md:4326`) and requires a "representative SiteStacker migration" as an acceptance gate (`:4403`). Owner text: "Migration friction is SiteStacker's moat; this is the battering ram" (`owner-constraints.md:436-437`). A switch model is needed because every later Phase 30 choice depends on it (F1 hub, `decision-log.md:107`).
- **Right level.** The decision is a product-level cutover model, not an implementation detail. It names no tables, states or UI. Good.
- **Known user, unknown instance (repo-published, verified absence).** No consenting SiteStacker ministry, real export, vendor sandbox or WMTEK exit-package answer exists (`r10-gap-g3.md:16`, `:51`). So the ministry workflow is still inferred from 2023-2024 training articles. See v1-03.

### 1.2 Strongest alternatives compared

| Alternative                                                                 | What it is                                                                                                                                                                                                                                                                                                      | Verdict                                                                                                                                                                                                                                                                                           | Evidence                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A as worded**                                                             | One switch; Asym is "the only place" afterwards                                                                                                                                                                                                                                                                 | Right for supporter data and staff work. **Not deliverable for recurring money** on switch day.                                                                                                                                                                                                   | P16 `:1314` (formal cutover needs old-stop proof plus applicable fresh authorization, otherwise the old executor stays external/read-only); P16 `:1312` ("Release may be cohort-by-cohort"); P13 `:735-737` ("An existing provider object may keep operating while it is observed, but observation is not control"). All repo-ratified. |
| **A′ (recommended)**                                                        | A for supporter data, history and staff work at one boundary, plus an **explicitly planned, bounded external recurring tail**. SiteStacker stays licensed in "tail mode" (forms off, CRM editing off, recurring engine and donor recurring messages on) until each cohort is handed over or deliberately ended. | **Dominates A as worded.** Same simplicity for data; honest about money; matches ratified P16/P13 text.                                                                                                                                                                                           | as above, plus `roadmap.md:4395` ("Reviewed backfill is a separate bounded operation"; no "permanent dual writers")                                                                                                                                                                                                                     |
| **B (area by area)**                                                        | Families switch at different times                                                                                                                                                                                                                                                                              | Correctly rejected for **supporter data and staff work** (doubles the freeze and boundary work, prolongs competing writers). It is **de facto required for recurring money**, because P16 releases cohort by cohort (`:1312`). The decision should say so rather than imply B is wholly excluded. | P16 `:1312`; `owner-constraints.md:411-413` (P20/P21 boundaries are independently authoritative)                                                                                                                                                                                                                                        |
| **C (side-by-side refresh imports)**                                        | SiteStacker stays the writer and Asym is refreshed                                                                                                                                                                                                                                                              | **Correctly rejected.** It would need source-wins deltas or three-way field merges. Vendor practice warns that source-wins deltas overwrite target edits (`r10-gap-g4.md:207`), and the roadmap forbids "permanent dual writers" (`:4395`).                                                       | repo-published; third-party via g4                                                                                                                                                                                                                                                                                                      |
| **Asym-operated migration service, no ministry self-serve switch UI in v1** | Same A′ model, run by an Asym migration specialist under an audited operator grant, with the ministry approving                                                                                                                                                                                                 | **Not an alternative to A; an alternative to _how_ A is delivered.** Strongly plausible for v1 (see v1-10). Every nonprofit CRM conversion found is staff-led (r6 X11, §2.1).                                                                                                                     | r6 `:61`, `:66` (vendor marketing pages/absence); `CONTEXT.md:2845-2846` (operator access = "one audited, purpose-bound, time-boxed Operator Tenant Grant Context", repo-published)                                                                                                                                                     |
| **No-build or manual (Asym staff load data directly)**                      | SQL or table loads                                                                                                                                                                                                                                                                                              | **Forbidden.**                                                                                                                                                                                                                                                                                    | `roadmap.md:4395` "No raw table loads"; `owner-constraints.md:441` "never raw table loads" (repo-published)                                                                                                                                                                                                                             |

### 1.3 Concerns

#### v1-01 — "Asym becomes the only place" overpromises and invites a ministry to switch SiteStacker off while it is still the recurring executor

- **What could go wrong.** A ministry reads "Asym then becomes the only place for supporters and their history" and ends its SiteStacker contract or disables it at go-live. SiteStacker's own scheduler charges card and bank recurring gifts. Turning it off very probably stops those charges (inferred, strong: r2 citing vendor articles 151000097037/151000115212; server code unverifiable per the r2 verifier). Failed-gift recovery disappears too, because the declined email with its update-and-rerun link is a SiteStacker System Message (151000183830, verified-vendor-doc, re-fetched 2026-11-01). Missionaries' recurring support silently ends. PayPal Standard subscriptions built by SiteStacker keep charging in PayPal until cancelled or until their srt cap of at most 52 cycles (inferred from vendor-served code Payment.js ~:1388-1422, verifier-corrected), and no system records them.
- **Why it matters.** Missionary support is mostly recurring. Silent loss is the worst outcome a migration can produce. It contradicts P13 "do not silently create a gap, overlap, duplicate charge, or fresh mandate" (`phase-13-…:740-741`, repo-ratified).
- **Severity:** critical. **Likelihood:** medium (ministries take a vendor headline literally, and nothing in the current wording tells them to keep SiteStacker running).
- **Evidence.**
  - P16 `:1314` formal cutover.
  - P16 `:1264` "Externally controlled/read-only".
  - P16 `:1289` "Planned disconnect is blocked until inventory proves every executor canceled, migrated, or explicitly handed off".
  - P13 `:735-737` "An existing provider object may keep operating while it is observed".
  - All of the above are repo-ratified and verified on develop. r5 K1 reaches the same conclusion; I raise the severity because SiteStacker _is_ the executor.
- **Effect on answer:** changes (wording plus an explicit tail commitment).
- **Best permanent fix.** Record A′. Asym becomes the system of record for supporters, history and staff work at the boundary. SiteStacker stays licensed and running in a defined tail mode until the tail closes (see v1-11).
- **Exact language to record.** "At the switch boundary Asym becomes the system of record for supporters, their history and all staff work. Legacy recurring gifts are not moved by the switch. They keep running on SiteStacker, its processor or PayPal as named external, read-only arrangements until each cohort is either handed over under Phase 16 formal cutover or deliberately ended with donor notice. The ministry keeps SiteStacker licensed, with its recurring engine and donor-facing recurring messages running, until the switch's recurring tail is closed. Go-live readiness lists every such arrangement by executor."
- **Bucket:** resolve_before_recording.

#### v1-02 — The first Phase 30 release is not the first ministry switch: A depends on owner commands that do not exist

- **What could go wrong.** The first Phase 30 slice is "a complete low-risk source-to-Party import and exact repeat import" (`roadmap.md:4387`). A switch that makes Asym the place for "their history" also needs pieces that are all missing on develop:
  - Phase 13 D.6 historic-gift import (#711 OPEN);
  - the Phase 7 import fact (D4, undefined);
  - the Phase 16 classifier (#834 OPEN);
  - Phase 4 merge (#512 OPEN);
  - Party tables (#570/#645 open, `decision-log.md:150`);
  - the Phase 11 catalog (unbuilt);
  - Phase 29 custody (PR #2430 unmerged).

  Commercial pressure ("battering ram", `owner-constraints.md:436-437`) could push a first switch with Parties only. SiteStacker would then be frozen while Asym holds supporters without giving history.

- **Why it matters.** That is an unplanned Option B (CRM now, money later): the model the founder rejected, without B's safeguards. C22 blocks first-gift and inactivity conclusions until history arrives (`decision-log.md:52`), so staff and missionaries would work blind.
- **Severity:** high. **Likelihood:** medium.
- **Evidence.** `roadmap.md:4387`, `:4367` ("Target readiness, not a generic upload success, determines what can be committed"); `owner-constraints.md:389-392` (adapters "activate only after the target phase and its typed import command exist"). Repo-published. gh issue states checked 2026-11-01.
- **Effect on answer:** narrows. "First release" means the first release in which a ministry switch is offered, not the first Phase 30 release.
- **Best permanent fix.** Add a switch-eligibility precondition. Any fallback is an explicit founder exception, never a default.
- **Exact language.** "A ministry switch may be scheduled only when the target commands for every family the ministry needs for day-to-day work are owner-ready. At minimum: Parties and households; contact points with consent and suppression evidence; one-time giving history including reversals; recurring evidence for the Phase 16 classifier. Otherwise the switch is not scheduled, except under a named, dated founder exception that keeps SiteStacker as the read-only reference for the missing family and imports it later as a separate reviewed backfill."
- **Bucket:** resolve_before_recording.

#### v1-03 — "Fully research and understand what must be brought over" cannot be finished from desk research

- **What could go wrong.** The decision gets recorded as though the inventory and processor picture are settled. These points remain unknown:
  - **Unverified:** export columns; whether exports carry processor IDs; whether SiteStacker records PayPal subscription payments; which gateways an installation uses ("STI" unknown); whether gateway-native schedules exist (r1 Unverified; r2 §11).
  - **Unverifiable:** server-side cron behaviour (r2 verifier).

  Verifiers already corrected several research claims (K22 login population, PayPal srt cap, OAuth scope). Documentation-only conclusions are fragile.

- **Why it matters.** A kit built on assumed columns or processor behaviour fails on the first real export. The honest answer to the founder is "complete to the limit of public evidence".
- **Severity:** high. **Likelihood:** high (this is the current state).
- **Evidence.** `r10-gap-g3.md:16`, `:51` (no artifact, no supplier, no consenting tenant). K22 correction re-verified by me (151000191779, verified-vendor-doc).
- **Effect on answer:** narrows.
- **Best permanent fix.** Record the inventory as provisional. Make F2 (source of the first real export) the next blocking founder question. Make a per-ministry processor-and-automation census a readiness input before the first practice run, retaken at the final export.
- **Exact language.** "The SiteStacker bring-over inventory (q01-r1) and processor analysis (q01-r2 to r4) are complete to the limit of public vendor evidence as of 2026-11-01. They are provisional and become kit requirements only once a representative export confirms them. Each ministry switch begins with a processor-and-automation census, retaken at the final export. It covers: every gateway and merchant account per Site and currency; every executor type (SiteStacker scheduler, PayPal subscriptions, gateway-native schedules); recurring arrangements counted with and without a linked SiteStacker login; gateway-sent donor emails; Stripe topology."
- **Bucket:** resolve_before_recording.

#### v1-04 — Refinement (2) "gifts-only catch-up" is too narrow and assumes the wrong source

- **What could go wrong.**
  - **Too narrow.** Refunds, ACH returns, chargebacks and dispute outcomes, failed renewals, and donor stops or changes keep arriving against imported gifts after the switch. A gifts-only catch-up leaves Asym totals overstated and gives Phase 16 no stop evidence.
  - **Wrong source.** "Anything SiteStacker records after the switch" may miss several things. PayPal-run payments, if SiteStacker is frozen or off, are unverified (digest r1 verifier). Gateway-native schedules are invisible to SiteStacker (r2; vendor ARB/PaymentSpring docs verified there). Gateway-dashboard refunds are not documented as reaching SiteStacker (r2).
  - **Missing rule for unmatched gifts.** A catch-up gift with no matching Party must not be linked by email or name (P13 story 171, `:539-542`). No rule yet says whether it waits in match review or creates a Party via Phase 4 (r5 K3).
- **Why it matters.** Money truth (Phase 13/20) and old-stop proof (P16 `:1314`) depend on these facts. A standing feed would breach `owner-constraints.md:424-430`. The ratified seam is a bounded reviewed backfill (`roadmap.md:4395`).
- **Severity:** high. **Likelihood:** high (every ministry with recurring giving has refunds and returns).
- **Evidence.** P13 `:1767` append-only reversal postings (via r5 A17, repo-ratified). P16 `:1295`, where a post-boundary attempt becomes a "reconciliation/refund exception" (verified). `roadmap.md:4395`. r4 G1 as verifier-corrected (the conflict exists only if the catch-up is a standing feed).
- **Effect on answer:** changes.
- **Best permanent fix.** Rename and widen the catch-up to money facts and stop evidence. Keep both founder protections. Source it from SiteStacker re-exports first. Processor or PayPal statements are used only for populations SiteStacker does not record; v1-08 keeps the build cost down.
- **Exact language.** "After the switch, facts recorded by SiteStacker or a legacy executor enter only through a **reviewed money-and-stop catch-up**. This is a bounded series of separately reviewed backfills on a fixed cadence with a recorded closure date, never a standing feed. Each catch-up carries:
  - settled gifts;
  - refunds, returns, chargebacks and dispute outcomes linked to the imported original;
  - schedule stop or change evidence for Phase 16.

  It never writes supporter fields and never overrides an Asym edit; differences are listed for ordinary correction. A fact with no exact source-binding match waits in match review, with no email, name or fingerprint linking. Every fact is classified against the switch boundary at plan approval and cannot become prospective later."

- **Bucket:** resolve_before_recording.

#### v1-05 — Refinement (1) narrows "exact repeat import" without restating the convergence duty for later snapshots

- **What could go wrong.** Under A, Asym still receives other snapshots of the same source: catch-ups, a forgotten file found after go-live (r5 E-40), a second attempt after an abort (r5 X4). If v1 promises only that replaying the same snapshot is safe, a builder can treat any different snapshot as fresh creates and duplicate people and gifts. "One final export" is also misleading. SiteStacker exports come from several screens, and long exports may be split because they error out (2.48, snippet-only, `r10-gap-g3.md:96`).
- **Why it matters.** Published text requires that "Reimport converges on the same permitted target identity instead of creating another copy" (`roadmap.md:4363`), and that "re-import updates instead of duplicating" (`owner-constraints.md:373-374`). The r5/r6 verifiers flagged the tension and noted that refinement (1) is a new founder narrowing, not inherited.
- **Severity:** medium. **Likelihood:** medium.
- **Effect on answer:** narrows (clarifies).
- **Best permanent fix.** Keep the narrow meaning of "exact repeat", add a convergence floor, and define "final export" as a manifest (r5 K5).
- **Exact language.** "'Exact repeat import' means replaying the same source snapshot manifest (all files, digests, filters, exporter role, SiteStacker version and export times). It produces no new writes and recognizes prior work. Any other snapshot of the same source converges on existing source bindings and never creates a second copy. In v1, differences from what Asym holds are shown for review and never applied source-wins. 'One final export' means one final snapshot manifest, taken after the boundary, that may contain several files."
- **Bucket:** resolve_before_recording.

#### v1-06 — "Reconcile counts and per-currency totals" omits Legal Entity, source basis and independent control totals

- **What could go wrong.** The founder wording drops two dimensions the owners require, and a reconciliation that re-derives totals from the same file proves nothing. Historic Giving automatically copies native Contributions income ("If you are using SiteStacker for donor management, then the income data will populate in Historic Giving automatically", 151000122348 via r1 K19, verifier-checked). Summing both double-counts by design. SiteStacker has no Legal Entity concept (r2 owner gap), so a per-currency total alone hides a wrong Legal Entity.
- **Why it matters.** Finance sign-off on a misleading report is worse than no report.
- **Severity:** medium. **Likelihood:** high (the short wording will be copied into the spec).
- **Evidence.** `roadmap.md:4369` ("by Legal Entity, original currency and source basis"); `owner-constraints.md:433-437`; D16 ("source basis" undefined, `decision-log.md:76`). All repo-published.
- **Effect on answer:** changes (wording).
- **Best permanent fix.** Amend the wording when the decision is recorded.
- **Exact language.** "Reconciliation compares Asym's accepted, rejected, quarantined, excluded and unchanged counts, and money totals by Legal Entity × original currency × declared source basis, against control totals SiteStacker itself reports (screen counts or its own reports), never against figures re-derived from the imported file. Exactly one source basis is declared per gift population and period, with an overlap proof. Each variance is categorized; any unexplained variance blocks sign-off."
- **Bucket:** resolve_before_recording.

---

## 2. Overengineering

**Material concern: YES, but in the research proposals, not in the founder's decision.** The founder's Option A and refinement (4) are minimal. Run identity, source-snapshot identity and per-record lineage are already required by published text ("Preserve external IDs, source system, batch identity … Provide per-record lineage", `roadmap.md:4363`; acceptance "exact reimport … interrupted batch", `:4401`). They are not speculative.

The risk is that the research layered on top gets copied into the spec as v1 scope. That layer includes:

- a 17-plus-state switch machine;
- per-family boundary configuration;
- per-processor import profiles;
- full-history processor tie-out;
- an OAuth amendment;
- about 130 edge cases written as bespoke requirements;
- a self-serve switch cockpit with new shared UI patterns.

All of this would be built before one real export or consenting ministry exists (v1-03).

**Not overengineering (checked and kept):**

- the boundary instant, which is needed so "A source event marked historical cannot become prospective" (`roadmap.md:4395`);
- snapshot-manifest integrity checks against SiteStacker screen counts, needed because exports are long and permission-filtered (r5 K5, E-25, E-26);
- the attestation checklist, which costs only ministry time;
- visible exclusions for owner-gated families (`roadmap.md:4395` "quarantine unresolved records for a visible disposition");
- the R2 cross-file no-write plan. Inspected: in practice it is per-file plans plus referential checks across files in the same manifest (gift → person source ID). That is cheap and replaces a staged shadow (r5 K9).

#### v1-07 — A persisted 17-plus-state Switch machine and per-family boundary configuration are more than v1 needs

- **What could go wrong.** r5 §3.2 proposes these persisted Switch states:
  - main line: `draft`, `readiness_blocked`/`ready`, `rehearsing`, `scheduled`, `frozen`, `snapshot_received`, `snapshot_accepted`/`snapshot_rejected`, `importing`, `reconciling`, `accepted`, `live`, `tail_open`, `tail_closed`, `decommissioned`;
  - branches: two abort states and `supersedes`.

  r5 K6 also proposes storing one boundary per source family "so B is later configuration". Most of those states can be derived from child facts: manifests, runs, sign-offs and tail closure. Persisting them creates a second source of truth that can drift from run states. Each state also needs transitions, permissions, tests and UI. Per-family CRM boundaries add classification paths that v1 never exercises, because the founder rejected B.

- **Why it matters.** The cost lands on the critical path to the first switch. It also contradicts the Phase 29 UI rule against "blanket new wizard" machinery (R10, PR #2430 `phase-29-files-documents.md` line 736, repo-ratified, unmerged).
- **Severity:** medium. **Likelihood:** medium (research momentum).
- **Evidence.** r5 `:93-95`, `:69`. Money owners already keep _their own_ independent boundaries: "Phase 20 and Phase 21 boundaries remain independently authoritative even when intentionally aligned" (`owner-constraints.md:411-413`, repo-published). Phase 30 does not need to model them.
- **Effect on answer:** no_change to the founder decision; narrows the spec.
- **Best permanent fix.** Keep a light Switch record that stores facts only:
  - tenant and source instance;
  - the single boundary (UTC instant, IANA zone, civil time);
  - snapshot manifest references;
  - attestation items with actor and time;
  - the reconciliation report version signed off;
  - live-at;
  - tail closure date and closure evidence;
  - abort or supersede reason.

  Derive the displayed stage from these facts. Money owners keep their own cutover boundaries. Refinement (4) stays exactly as the founder worded it: lineage, run and snapshot identity.

- **Exact language (spec requirement).** "v1 stores one switch boundary per Switch, applied to every Phase 30 family. Phase 20, Phase 21 and Phase 16 keep their own cutover records. The Switch persists facts, not a workflow state. Displayed stage is derived from recorded facts, and no stage can be set directly. Adding area-by-area switching later must not require changing per-record lineage, run identity or snapshot identity."
- **Bucket:** spec_requirement.

#### v1-08 — Per-processor import profiles, full-history processor tie-out and an OAuth "observation grant" are disproportionate for v1

- **What could go wrong.** The research proposes several pieces of processor machinery:
  - catch-up "import profiles for PayPal reports and processor reports" (r3 owner gap; r3 PX-2);
  - reconciliation "per merchant account x currency against processor reports" as a switch gate (r2 Q4);
  - Stripe mapping-file ingestion (r4 §6 item 3);
  - a Phase 13 amendment for a "migration-only read-only OAuth observation binding" (r4 §5.1 A, Q9).

  The gateways named across r2 and r3 are Stripe, Braintree, Authorize.net, PaymentSpring/Nelnet, iATS, Payeezy, STI and PayPal. Building a parser per gateway and per report format for an unknown first customer is speculative. A full-history processor tie-out reconciles the _source system's_ accuracy across years, not the migration's fidelity. That is ministry finance work, and its books are presumably already closed for prior years (assumption; verify per ministry).

- **Why it matters.** Each profile is a maintained adapter against an external format that can change without notice. The OAuth amendment reopens a ratified Phase 13 decision ("Do **not** use OAuth", `phase-13-…:659`, verified) for a convenience that ministry-supplied reports can provide.
- **Severity:** medium. **Likelihood:** medium.
- **Evidence.**
  - Phase 30 owns fidelity, and money owners own money truth: `roadmap.md:4377` (repo-published) and `decision-log.md:31` (C1).
  - Stripe's OAuth restriction applies to `read_write` on platform-controlled Standard accounts, so it is narrower than the research stated (verifier-corrected, https://docs.stripe.com/connect/oauth-standard-accounts, verified-vendor-doc via verifier, accessed 2026-11-01).
  - The decision log already lists a "Generic canonical CSV from field catalog" profile (`decision-log.md:170`).
- **Effect on answer:** narrows.
- **Best permanent fix.**
  1. The v1 catch-up source is a SiteStacker re-export through the same SiteStacker profile.
  2. Anything SiteStacker does not record (PayPal-run, gateway-native schedules) enters through **one** canonical "external money facts" template generated from the field catalog, which the ministry fills from its processor statements. No per-gateway parsers.
  3. Processor statements are attached as reconciliation evidence. The hard gate is import against SiteStacker control totals.
  4. Processor tie-out is required only for the open fiscal period and the tail. Earlier periods rely on the ministry's attestation that its books were reconciled.
  5. No OAuth amendment in v1. Revisit only if real switches show it is needed.
- **Exact language (spec requirement).** "v1 has one SiteStacker source profile and one canonical external-money-facts template. It has no per-processor parser. The hard reconciliation gate compares the import with SiteStacker's own control totals. Processor statements are evidence: they are tied out for the ministry's open fiscal period and the recurring tail, and prior periods carry a ministry finance attestation. Asym does not connect to a ministry's legacy processor account in v1."
- **Bucket:** spec_requirement.

#### v1-09 — About 130 overlapping edge cases risk becoming bespoke requirements instead of a few invariants and a runbook

- **What could go wrong.** Edge-case lists overlap heavily (the same PayPal, absent-row, form-left-on and receipt cases appear in four or five tracks):

  | Source | Cases            |
  | ------ | ---------------- |
  | r5     | E-01 to E-52     |
  | r1     | X1 to X20        |
  | r2     | 27 payment cases |
  | r3     | PX-1 to PX-16    |
  | r4 §11 | 16               |
  | r6 §10 | 20               |

  Turning each into an acceptance criterion produces a huge, contradictory spec. Most cases reduce to a few invariants plus ministry runbook steps.

- **Why it matters.** Overlapping criteria drift, and tests multiply without adding assurance. Runbook items (key staff unavailable, QR codes, text-to-give keywords) are not software.
- **Severity:** medium. **Likelihood:** medium-high.
- **Evidence.** Digest edge-case arrays. The repo already has the invariants: absent ≠ deleted (`r10-gap-g4.md:77`); outward-effect-dark (`roadmap.md:4365`); no permanent dual writers (`:4395`); external read-only until formal cutover (P16 `:1314`); quarantine instead of guessing (P13 `:539-542`).
- **Effect on answer:** no_change.
- **Best permanent fix.** In the spec, express the switch edge cases as about ten invariants, each with one or two representative production-shaped fixtures. Move operational cases into a published ministry switch runbook, which `roadmap.md:4403` already requires as "target-specific reversal and reconciliation procedures".
- **Exact language (spec requirement).** "Switch edge cases are specified as invariants with representative fixtures, not as one requirement per scenario. At minimum: (1) a row absent from a later snapshot is never treated as deleted; (2) every fact is classified once against the boundary; (3) imports and catch-ups fire no outward effect; (4) every legacy executor stays external and read-only until a Phase 16 formal cutover; (5) unmatched money waits in match review; (6) a later snapshot converges on source bindings and never applies source-wins; (7) money totals never cross Legal Entity or currency; (8) post-go-live correction is roll-forward only; (9) the catch-up is bounded by a closure date; (10) provider IDs are inert evidence. Operational scenarios live in the published ministry switch runbook."
- **Bucket:** spec_requirement.

#### v1-10 — A self-serve ministry "switch cockpit" is being designed before deciding who runs a switch

- **What could go wrong.** r6 §4 proposes several new pieces:
  - a ministry-facing switch status page with ordered stages and task lists;
  - a readiness view;
  - a finance sign-off artifact;
  - a go-live attestation screen;
  - two new shared UI patterns (an upload control and a stage-status pattern; r6 owner gap for `packages/ui`).

  But every nonprofit CRM conversion found is staff-led (r6 X11, §2.1: "a ministry switch will in practice be a supported (assisted) migration"). The first switches will almost certainly be hand-held by Asym (inferred). A polished self-serve cockpit for a handful of early ministries is speculative.

- **Why it matters.** It is the largest UI cost in the proposals. It also needs Phase 12 capabilities that nobody has defined (r6 owner gap: "no capability defines who may commit a final run, declare the freeze, sign off reconciliation or press go-live").
- **Severity:** medium. **Likelihood:** medium.
- **Evidence.** r6 `:61`, `:66` (marketing pages; absence of a published nonprofit runbook). `roadmap.md:4389` requires only the shared grid, file controls, clear counts and cause-owned next actions per run (repo-published). Operator access in a tenant is "one audited, purpose-bound, time-boxed Operator Tenant Grant Context" (`CONTEXT.md:2845-2846`, repo-published).
- **Effect on answer:** narrows (delivery shape, not the switch model).
- **Best permanent fix.** Add a founder question to the frontier, next to F7: who runs a switch? Recommended default for v1: an Asym migration specialist operates under an audited operator grant while the ministry's admin and finance lead approve. v1 UI = the per-run screens the roadmap already requires, plus a read-only switch summary (boundary, manifests, runs, reconciliation report, attestations, tail closure date). Defer the self-serve cockpit until real switches show which steps ministries actually do themselves.
- **Exact language (frontier item).** "F-new: Who operates a ministry switch in v1: the ministry admin self-serve, an Asym migration specialist under an Operator Tenant Grant, or a partner? Until this is decided, the v1 switch UI is limited to the per-run plan, commit, progress and result screens plus a read-only switch summary."
- **Bucket:** spec_requirement.

---

## 3. Operational burden

**Material concern: YES.** Option A moves the burden. It does not remove it. The ministry gets a short CRM freeze, but the money tail is long and manual, and its length is not bounded. During the tail the ministry must keep paying for SiteStacker, export and review catch-ups on a cadence, and answer donors in two systems. The processor-side work belongs to a workstream nobody owns. Each switch also needs Asym operator or developer involvement that no one has designed.

#### v1-11 — The recurring tail is unbounded: SiteStacker licence, catch-ups and two-system support continue for an unknown time

- **What could go wrong.** Under the ratified text, every moved recurring gift needs old-stop proof plus applicable fresh authorization (P16 `:1314`; `:1236` "Supersede and create fresh", verified). Several things push the tail out:
  - The P16 formal-cutover and classifier tickets are OPEN (#809, #834; gh 2026-11-01).
  - ACH recurring is blocked until P13 D.7 ships (r4 G10).
  - A processor's vault export "can take anywhere from a few days to several months" (https://docs.stripe.com/get-started/data-migrations/pan-import, verified-vendor-doc via r5, accessed 2026-11-01).
  - Card disputes run about 120 days and ACH returns about 60 days after the last legacy charge (Stripe docs via r5 S9, verified-vendor-doc).

  The ministry therefore keeps SiteStacker licensed and runs periodic catch-ups for many months, possibly indefinitely if Phase 16 handover never ships for its processor. That is the money-side "permanent dual writer" `roadmap.md:4395` forbids, arrived at by drift (r5 E-49).

- **Why it matters.** Recurring cost and staff time for the ministry. A catch-up review backlog that grows each cycle. Staff and donors confused about which system is authoritative for a given gift. The longer it runs, the more likely someone turns SiteStacker off early (v1-01).
- **Severity:** high. **Likelihood:** high.
- **Evidence.** As cited. The SiteStacker licence cost and contract terms are unverified. Phase 16 "external read-only" is a legitimate steady state (P16 `:1264`), so nothing in the text forces closure.
- **Effect on answer:** changes. The founder must pick a tail policy.
- **Best permanent fix.** Record a tail policy now:
  1. A target maximum tail length, chosen by the founder (for example, a number of months after the boundary).
  2. A fixed catch-up cadence.
  3. A closure rule. At the closure date, any remaining legacy recurring arrangement is either already handed over under Phase 16 or deliberately ended by the ministry, with donor notice and an invitation to restart in Asym (fresh authorization). No arrangement is left running untracked.
  4. A final catch-up after the dispute and return windows for the last legacy charge.
  5. A monitored signal on the switch.
- **Monitor.** Signal: legacy external arrangements still active, and days since boundary. Threshold: any arrangement still active 30 days before the closure date. Owner: Phase 16 owner plus the ministry's named switch owner. Response: escalate per cohort to handover or deliberate end with donor notice.
- **Exact language.** "Each switch records a recurring-tail closure date at scheduling, a fixed catch-up cadence, and a final catch-up after the dispute and return windows for the last legacy charge. By the closure date, every legacy recurring arrangement is either handed over under Phase 16 or ended by the ministry with donor notice and an invitation to restart in Asym. None continues untracked after closure. Extending the closure date is a recorded ministry decision with a reason."
- **Bucket:** resolve_before_recording.

#### v1-12 — Option A's "freeze" and "reconcile" steps overlap the processor-side migration workstream, which has no owner

- **What could go wrong.** Phase 13 assigns several jobs to an unnamed "separate migration workstream" (`phase-13-…:743-746`, verified):
  - "processor coordination, credential-vault transfer, reauthorization campaigns, cutover freezes, and bulk reconciliation" (`:743-746`);
  - "connected-account readiness, and recurring-executor replacement at scale" (`:2192-2199`, verified);
  - CRM data migration (`:165`), which is effectively Phase 30's (roadmap `:4363`, `:4377`; verifier-corrected).

  The founder's Option A includes a freeze and a reconciliation. If Phase 30 absorbs "cutover freezes" and "bulk reconciliation" by shorthand, it takes on authority that C3 forbids (`decision-log.md:33`). If nobody takes them, each switch becomes ad hoc founder work: processor letters, STOP dates, WMTEK cooperation for platform-Stripe copies (Stripe pan-copy doc via verifier), and a donor re-authorization campaign. Phase 30 roadmap text never mentions processors, vaults or re-authorization (grep absence via r4 verifier).

- **Why it matters.** This is tribal-knowledge work that has to happen for every ministry with recurring giving. Without an owner it falls on whoever is closest, and the money rules have no enforcer.
- **Severity:** high. **Likelihood:** high.
- **Evidence.** As cited (repo-ratified P13). r4 §6 proposes a split (recommendation, inferred).
- **Effect on answer:** changes. It narrows what Phase 30 owns inside Option A.
- **Best permanent fix.** Record the split in the Q1 decision and make the owner edits at spec time. Phase 30 owns:
  - recording the ministry's freeze attestation and the boundary;
  - snapshot intake;
  - reconciliation _reports_.

  Phase 13 owns connected-account readiness and mapping-file evidence. Phase 16 (with Phase 17/6 for messages) owns old-stop proof and the re-authorization or confirmation flow. A named operational role owns processor coordination and the ministry runbook.

- **Exact language.** "Within a switch, Phase 30 records the ministry-declared freeze attestation and the boundary, receives snapshots, and produces reconciliation reports. It does not coordinate processors, transfer vaults, run re-authorization campaigns or prove that an old executor stopped. Those duties are assigned by owner edits before the first switch: connected-account readiness and vault-mapping evidence to Phase 13; old-stop proof and donor re-authorization or confirmation to Phase 16 with Phase 17/6 messaging; processor coordination to a named operations role with a published runbook."
- **Bucket:** resolve_before_recording.

#### v1-13 — Each switch needs Asym operator or developer work nobody has designed: a hosted census, months-long operator access, and live-code hazards

- **What could go wrong.**
  1. "Census actual retained state before migration" is an acceptance gate (`roadmap.md:4403`). Who runs the hosted read-only census, and how, is open (D13, `decision-log.md:73`), so each switch risks ad hoc developer database work.
  2. An Asym-assisted switch uses "one audited, purpose-bound, time-boxed Operator Tenant Grant Context" (`CONTEXT.md:2845-2846`). A months-long tail with periodic catch-ups means repeated grants or an over-long one. Whether the operator grant is implemented is unverified.
  3. Live code would turn a migrated tenant's money into a hazard. The Stripe client falls back to the platform key when a tenant has none (`packages/api/src/stripe/tenant-client.ts:64-66`, verified). r4 G9 lists metadata routing and a whole-account Billing Portal. A rehearsal or early go-live on that path could take donor money into the wrong account (r4 edge case, inferred).
- **Why it matters.** Recurring developer involvement per tenant, and a rollback-hostile failure if live money is touched.
- **Severity:** high (item 3), medium (items 1-2). **Likelihood:** medium.
- **Evidence.** As cited (repo-integrated code; repo-published glossary and roadmap).
- **Effect on answer:** no_change to the model. Adds preconditions.
- **Best permanent fix.** A scripted, read-only, repeatable retained-state census with a fixed output format, run by a named role. A standard migration-purpose operator grant template whose renewal for each catch-up is a one-step audited action. A hard sequencing gate: no migrated tenant takes live gifts, and no rehearsal runs, while the tenant has no verified Phase 13 Settlement Account Binding or could hit the platform-key fallback.
- **Exact language (implementation safeguard).** "No rehearsal or switch may run for a tenant that lacks a verified Phase 13 Settlement Account Binding or that could resolve to the platform Stripe key. The retained-state census is a scripted read-only procedure with recorded output, run by a named role, and it never involves direct database repair. Asym operator access for a switch uses a migration-purpose Operator Tenant Grant, renewed per catch-up as an audited action."
- **Bucket:** implementation_safeguard.

#### v1-14 — The cutover year forces manual statement and receipt work for ministry finance staff

- **What could go wrong.** A mid-year switch leaves the switch year's giving split across two systems:
  - SiteStacker issued statements per household. Asym's are per legal donor (r1 edge case).
  - Phase 19 cumulative coverage includes only "compatible, source-eligible posted cash with no existing current official coverage" (`phase-19-…:944`, repo-published, verified). The pre-switch portion has no clear Asym issuer (r4 G8).
  - Churches that switch mid-year typically issue two statements (snippet-only, r6 M4).

  If the ministry decommissions SiteStacker before year-end, nobody can produce the pre-switch portion.

- **Why it matters.** Manual reconciliation for finance staff, two statements with different totals for donors, and for annual-receipting jurisdictions (for example Canada) a possible compliance gap (inferred; not verified per jurisdiction).
- **Severity:** medium. **Likelihood:** medium (depends on the switch date).
- **Evidence.** As cited. Phase 19 Late Fact Obligation (`:976-982`, verified) covers facts arriving after Start, but no pre-Asym exemption is written (r5 A28).
- **Effect on answer:** no_change to the model. Adds a scheduling rule and a runbook step.
- **Best permanent fix.** The switch scheduler warns against boundaries between mid-November and the year-end statement run. The runbook requires the ministry to produce SiteStacker statements for the pre-boundary part of the switch year before decommissioning. If SiteStacker keeps running through year-end, that is the default. Phase 7/19 owners rule on cutover-year statements (F13).
- **Exact language (spec requirement).** "Scheduling a switch boundary between 15 November and the ministry's year-end statement run requires an explicit ministry acknowledgement. Before decommissioning SiteStacker, the ministry confirms that statements or receipts for the pre-boundary part of the switch year have been issued from SiteStacker or are covered by a Phase 7/19 rule."
- **Bucket:** spec_requirement.

---

## 4. UX/UI and user friction

**Material concern: YES.** For the data move itself, Option A is the lowest-friction model for staff and donors: one short pause in editing, then one place to work. The friction concentrates at four points, and the decision as worded makes two of them worse:

1. Refinement (3), as written, would switch off the donor-facing messages that keep legacy recurring gifts alive and compliant.
2. A freeze that turns giving forms off before Asym giving is live creates a giving outage.
3. Missionaries will see false "lapsed" or "dropped" signals. Some come from live code, some from catch-up lag.
4. Donors in the recurring tail face two systems and re-authorization requests that look like phishing. Some donors cannot be contacted at all.

#### v1-15 — Refinement (3) would turn off the SiteStacker messages that keep legacy recurring gifts alive and compliant (and r6 §9's checklist would too)

- **What could go wrong.** Refinement (3) gates Asym sending on the ministry confirming that "SiteStacker automations (Spark), giving forms and Mailchimp sync are off". r6 §9 extends the list to "Contributions Declined", the Spark Recurring Schedule Reminder and System Messages, all marked "confirmed off". That is wrong while SiteStacker is still charging. Three verified vendor facts show why (all accessed 2026-11-01, verified-vendor-doc):
  - SiteStacker's PaymentSpring/Mastercard article says "Merchants must send a receipt by email message or by other electronic method after every billing" and "Merchants must provide an online or electronic cancellation method". It also says "The Contribution Receipt notification must be on for online contributions" and "The Recurring Scheduling Confirmation notification must be on" (151000122015, modified 19 Sep 2023).
  - The pre-billing notice ("at least seven days, but no more than 30 days, before the billing date" for plans billed "less frequently than every six months") is implemented as the Spark "Recurring Schedule Reminder" (same article).
  - Failed recurring gifts recover only through the "Contributions - Contributions Declined" message link: "the gift will be reprocessed automatically" (151000183830, modified 22 Aug 2024).

  If these are switched off, annual donors lose required pre-billing notices, donors lose per-billing receipts and the cancellation link, and every card that expires during the tail silently ends a gift.
  - **Mailchimp correction.** "Mailchimp sync off" cannot cover missionary-owned Mailchimp lists. Those are manual one-way exports into each missionary's own account (151000122392 via the r1 verifier, verified-vendor-doc).

- **Why it matters.** It causes donor drop-off with no visible failure. It also creates a card-network compliance gap for the merchant (the ministry). r6's proposed checklist would make this easier to get wrong, not harder.
- **Severity:** high. **Likelihood:** medium-high (r6 already wrote the checklist this way).
- **Evidence.** As cited. r2 edge case ("exempt the Spark Recurring Schedule Reminder and keep Contribution Receipt, Declined and dashboard cancel path on during the tail") and r4 G2/G3 agree. The Mastercard primary rule text was not read (unverified beyond SiteStacker's restatement).
- **Effect on answer:** changes.
- **Best permanent fix.** Split the attestation into three lists. This also settles r4 G2's "exactly one receipting system per gift" for the tail, with SiteStacker receipting what SiteStacker charges.
  - **OFF at the boundary:**
    - giving forms and checkout;
    - text-to-give and QR targets repointed;
    - Spark and Motion automations that send appeals or change CRM records;
    - Mailchimp sync;
    - SiteStacker imports and rollbacks;
    - staff CRM editing.
  - **KEEP ON until each cohort is handed over or ended:**
    - the recurring engine;
    - Contribution Receipt for legacy charges;
    - Recurring Scheduling Confirmation and Updated messages;
    - Contributions Declined with the update link;
    - the Recurring Schedule Reminder;
    - donor dashboard cancel and update.
  - **OUTSIDE ministry control, listed:** per-missionary Mailchimp lists, each with a disconnection request and a suppression-export request.
- **Exact language.** "Before Asym sending or automations activate, the ministry attests per item, with actor and time, that SiteStacker giving forms and checkout, giving links and text-to-give targets, appeal and record-changing automations, Mailchimp sync, imports and rollbacks, and staff CRM editing are off. Until each legacy recurring cohort is handed over or ended, the ministry keeps SiteStacker's recurring engine, its receipts for legacy charges, its recurring confirmation and update messages, its declined-payment message with the update link, its recurring schedule reminder and its donor cancellation path running. SiteStacker alone receipts gifts it charges. Missionary-owned Mailchimp lists are listed as outside ministry control."
- **Bucket:** resolve_before_recording.

#### v1-16 — Turning giving forms off at the freeze, before Asym giving is live, creates a giving outage

- **What could go wrong.** The founder's freeze includes giving forms off. In r5's lifecycle, Asym giving pages are published by a human only at go-live (S8). That comes after the final export, integrity checks, import runs, reconciliation and sign-off (r5 `:137`, `:182-187`). Between the freeze and go-live, which could be days if review is heavy, donors find dead or disabled forms and QR codes. The ratified Phase 13 connected-account topology is not built: current code is a plaintext-key prototype with platform-key fallback (`tenant-client.ts:64-66`; r4 §2). So Asym giving cannot simply be switched on.
- **Why it matters.** Lost one-time gifts and missionary income. Peak-season switches make it worse. Donors who hit a dead form may not come back (assumption; no measured figure found).
- **Severity:** high. **Likelihood:** medium.
- **Evidence.** r5 §3.6/§3.11 (proposed ordering); decision text; `tenant-client.ts:64-66` (repo-integrated). Giving pages issue Giving Addresses only through a human publish (C20, `decision-log.md:50`, repo-ratified).
- **Effect on answer:** changes (adds a sequencing rule).
- **Best permanent fix.** Make "Asym giving live and verified" a precondition of the boundary, not a post-import step. Asym giving pages, the Phase 13 binding and exact redirects of SiteStacker giving URLs go live at the boundary, at the same moment SiteStacker forms go off. Gifts made in Asym before the final import completes create records that the final plan resolves through match review, with no auto-merge (C2). Asym giving does not depend on imported data, so the sequencing works.
- **Exact language (spec requirement).** "A switch boundary may be declared only when the ministry's Asym giving pages are published, its Phase 13 Settlement Account Binding is verified, and exact redirects for SiteStacker giving URLs are ready. SiteStacker giving forms go off at the boundary, never before Asym giving is live. Donors who give in Asym before the final import completes are resolved in the final plan's match review, with no automatic merge."
- **Bucket:** spec_requirement.

#### v1-17 — Missionaries will see false "lapsed", "joined today" or "support dropped" signals from live code and from catch-up lag

- **What could go wrong.** Five things combine:
  1. **Live missionary donor list** (repo-integrated, verified). `normalizeDonorStatus` renders stored "lapsed"/"at risk" values as "Lapsed"/"At Risk" and maps anything unknown to "Active" (`packages/api/src/missionary-portal/donors.ts:173-191`).
  2. **Schema defaults** (repo-integrated, verified). `donors.joined_date DATE DEFAULT CURRENT_DATE` and `status TEXT DEFAULT 'active'` (`20250101000000_init_schema.sql:76`, `:82`). `donations.gift_date` defaults to `CURRENT_DATE` (`20260214090000_foundation_1_schema.sql:334`). A careless import writer makes long-time partners look new and healthy, or a stored legacy status makes them look lapsed.
  3. **Published rules contradict the code** (repo-published, verified). Display "SHALL NOT label the person or relationship 'lapsed'" (`phase-28-…/finance-stewardship.md:50-53`). P16: "Unknown never defaults to healthy, lapsed, zero, or received" (`:1068`).
  4. **Catch-up lag** (inferred). Gifts SiteStacker charges reach Asym only at each catch-up, so with a monthly cadence a missionary sees a missing month.
  5. **External-control projection.** External read-only arrangements fall into "a qualified attention bucket" (P16 `:1316`). Every legacy recurring gift may look at risk on day one (r4 G15).
- **Why it matters.** Missionaries depend on this view for their livelihood. False signals cause anxiety and wrong outreach to long-time partners, and they erode trust in Asym in the first weeks, when trust is most fragile.
- **Severity:** high. **Likelihood:** high (live code).
- **Evidence.** As cited.
- **Effect on answer:** no_change to the model. Adds preconditions.
- **Best permanent fix.** Before any migrated tenant goes live:
  - retire person-level lapse labels in the missionary view, or gate them on coverage;
  - require import writers to set dates and status explicitly or leave them unknown;
  - add a Phase 16 D13 / Phase 28 "planned external tail" display distinct from incident quarantine, for example "Given through the previous system; last updated {date}" with "Status updating" semantics and negative outreach suppressed;
  - set a catch-up cadence that keeps that "last updated" date honest.
- **Exact language (implementation safeguard).** "No migrated tenant goes live while the missionary donor list can render a person-level lapse label or default an unknown status to Active. No import or catch-up writer relies on a column default for joined, status or gift dates. Legacy recurring gifts in a planned external tail are shown to missionaries as given through the previous system, with the last catch-up date, and never as lapsed, missed or needing attention solely because of catch-up lag."
- **Bucket:** implementation_safeguard.

#### v1-18 — Recurring donors in the tail face two systems, phishing-shaped requests, and some cannot be contacted at all

- **What could go wrong.**
  - **Two systems.** During the tail, a donor's history is in the Asym portal but their recurring gift is changed or cancelled in SiteStacker's dashboard, and they may receive SiteStacker's "update your card" link (151000183830, verified).
  - **Phishing-shaped requests.** Any Asym re-authorization or confirmation request then arrives as a second payment-update request from a second system. That is the shape the FTC teaches consumers to distrust ("claim there's a problem with your account or your payment information", https://consumer.ftc.gov/articles/how-recognize-and-avoid-phishing-scams, via r6 M2, verified-vendor-doc).
  - **Donors who cannot be reached** (repo-integrated, verified). Asym's consent gate blocks even transactional email for `do_not_contact` and for bounce, spam and manual suppressions (`packages/api/src/email/consent.ts:15-20` doc table; enforced at `:81-85` `HARD_SUPPRESSION_TYPES`, `:199-212`).
  - **Donors without SiteStacker logins.** Recurring donors can exist without a SiteStacker login, because account creation can be pushed after the gift (151000191779, verified). They cannot self-serve in SiteStacker either.
  - **No reassuring account.** Imported donors get no Asym account automatically (`roadmap.md:4365`, repo-published).
- **Why it matters.** Re-authorization is where donor drop-off happens. No measured attrition benchmark exists (r3 §4.3; r6 P7 "70-80%" is unsourced). Silent ending for uncontactable donors breaks P13's "do not silently create a gap".
- **Severity:** medium-high. **Likelihood:** medium.
- **Evidence.** As cited.
- **Effect on answer:** changes (adds donor-experience rules for the tail).
- **Best permanent fix.** Set one donor rule per tail:
  - SiteStacker stays the front door for changing or cancelling legacy recurring gifts until handover.
  - The Asym portal shows those arrangements as "managed by the previous system until {date}".
  - Any handover request is one message per donor covering all their arrangements, sent through a Phase 16/17 contract, offering "sign in at the ministry's site" instead of a bare link.
  - Donors who cannot be contacted are listed for a Phase 6/16/17 owner ruling and are never reached through a Phase 30 bypass. The default is that their gift runs externally until it ends or the tail closes, with ministry follow-up offline.
- **Exact language (spec requirement).** "During the recurring tail, donors change or cancel legacy recurring gifts in SiteStacker, and Asym shows them as managed by the previous system. Each donor receives at most one handover request covering all their legacy arrangements, sent under a Phase 16/17 message contract. Donors whose consent or suppression state blocks transactional email are listed for an owner-approved path and are never contacted through import tooling."
- **Bucket:** spec_requirement.

#### v1-19 — "Freeze" and the switch time need precise wording and time-zone handling

- **What could go wrong.** The glossary's Avoid list includes "date-only go-live", "universal external freeze" and "mutable cutoff" (`CONTEXT.md:5043`, repo-published, verified). Staff in different time zones, a "midnight" deadline, or a DST change can make people stop editing at different moments and misclassify boundary-day gifts. GOV.UK guidance notes "midnight" "can be read in two ways" (https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/style-guides/a-to-z-style-guide/, via r6 X3, verified-vendor-doc). SiteStacker's export time zone is undocumented (r5 §3.1, unverified).
- **Why it matters.** Confusing language at the highest-stakes moment, and gifts misclassified as history or tail.
- **Severity:** low-medium. **Likelihood:** medium.
- **Evidence.** As cited. r5 K10 recommends separating "boundary" (recorded fact) from "freeze" (ministry behaviour).
- **Effect on answer:** no_change.
- **Best permanent fix.** In UI and decision wording, say "switch time" for the recorded boundary and "pause editing in SiteStacker" for the ministry action. Align the boundary to the start of a civil day in a named IANA zone. Show civil time, zone, UTC offset and viewer-local time, never "midnight". Send any timestamp within a day of the boundary whose zone is unknown to review.
- **Exact language (spec requirement).** "The switch time is recorded as the start of a civil day in the ministry's named time zone and is shown with zone, UTC offset and the viewer's local time. User-facing copy uses 'switch time' and 'pause editing in SiteStacker', not 'freeze' or 'midnight'. Facts within one day of the switch time whose time zone is unknown go to review."
- **Bucket:** spec_requirement.

#### v1-20 — Handover attrition has no benchmark: monitor it per cohort instead of assuming a number

- **What could go wrong.** Ratified Phase 16 text requires a donor-completed step for every moved recurring gift (P16 `:1236`, `:1230` "replace/bind method" → "Complete with donor now", verified). No measured attrition figure exists. r3 §4.3 cites a Tithe.ly claim of 75%+ within 4-6 weeks (vendor marketing) and the Whole Whale 70-80% loss without tokens (unsourced, r6 P7). A cohort can quietly lose a large share of missionary support while everyone assumes "most donors will confirm".
- **Why it matters.** This is the single biggest money-at-risk variable in Option A for recurring-heavy ministries, and nothing measures it.
- **Severity:** high. **Likelihood:** medium (unknown).
- **Evidence.** As cited.
- **Effect on answer:** no_change.
- **Best permanent fix.** Make handover completion a visible, monitored measure per cohort and per missionary, with a set follow-up response. The founder's open choice (r3 Design 1 vs a Phase 16 "proved continuation" amendment) can then be revisited with real numbers.
- **Monitor.**
  - **Signal:** share of legacy recurring arrangements in a cohort confirmed in Asym, plus amount at risk per missionary, by days since the handover request.
  - **Threshold:** below 60% confirmed at 21 days, or any missionary with more than 25% of monthly recurring support unconfirmed at 21 days. These are proposed starting values, to be recalibrated after the first switch.
  - **Owner:** Phase 16 owner, with the ministry's named switch owner.
  - **Response:** personal follow-up through missionaries or staff (Phase 28 visibility permitting), extend the external tail for that cohort before the closure date, and bring the measured rate back to the founder for the Design 1 vs Design 2 decision.
- **Exact language (spec requirement and monitor).** "Each recurring handover cohort reports its confirmation rate and amount at risk per missionary by day since the request. Crossing the agreed threshold triggers personal follow-up and a recorded decision to extend that cohort's external tail. Measured rates are reported to the founder after each switch."
- **Bucket:** monitor.

---

## 5. Summary for the founder

| Category                                  | Material concern?                          | Verdict                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problem validity, necessity, alternatives | **Yes**                                    | The model is right, but the wording overpromises. Record **A′**: one switch for supporters, history and staff work, plus a planned and bounded external recurring tail. C is correctly rejected. B is correctly rejected for data, but recurring money necessarily moves cohort by cohort. Refinements (1) and (2) and the reconciliation wording need amendment. The "first release" must mean the first release in which a switch is offered. The bring-over inventory stays provisional until a real export exists. |
| Overengineering                           | **Yes (research layer, not the decision)** | Keep run, snapshot and lineage identity, the boundary, integrity checks and visible exclusions. Do **not** carry the 17-plus-state switch machine, per-family CRM boundaries, per-processor parsers, full-history processor tie-out, an OAuth amendment, about 130 bespoke edge-case requirements or a self-serve cockpit into v1.                                                                                                                                                                                     |
| Operational burden                        | **Yes**                                    | The tail is unbounded and manual. The processor-side workstream has no owner. Each switch needs operator and census work and a fix for the live platform-key fallback. Cutover-year statements create manual finance work.                                                                                                                                                                                                                                                                                             |
| UX/UI and user friction                   | **Yes**                                    | Refinement (3), as worded (and r6 §9), would turn off the donor messages that keep legacy gifts alive and compliant. The freeze could cause a giving outage. Missionaries face false signals from live code and catch-up lag. Tail donors face two systems and phishing-shaped requests, and some cannot be contacted. Attrition is unmeasured.                                                                                                                                                                        |

### 5.1 Proposed amended Q1 record (for the founder to accept, amend or reject; not decided)

> **Q1. Option A′ — one planned switch per ministry.** Practice runs change nothing. The ministry pauses editing in SiteStacker at a recorded switch time. One final snapshot manifest is taken after the switch time, then imported. Counts and money totals are reconciled by Legal Entity × original currency × source basis against SiteStacker's own control totals. Asym then becomes the system of record for supporters, their history and all staff work.
>
> Legacy recurring gifts are not moved by the switch. They stay external and read-only on SiteStacker, its processor or PayPal until each cohort is handed over under Phase 16 or deliberately ended with donor notice, by a recorded closure date. Until then SiteStacker stays licensed, with its recurring engine, receipts, declined-payment and reminder messages and donor cancellation path running. Gifts, reversals and stop evidence recorded after the switch arrive only through a bounded, reviewed money-and-stop catch-up that never writes supporter fields or overrides Asym edits.
>
> "Exact repeat" means replaying the same manifest. Any later snapshot converges on source bindings. A switch is offered only when every family the ministry needs day to day is owner-ready, and Asym giving is live at the switch time. Records carry run, snapshot and per-record lineage so area-by-area switching can be added later.
>
> Not in v1: area-by-area switching of supporter data (B), side-by-side refresh imports (C), and any rollback to SiteStacker after go-live.

### 5.2 Corrections to the research made by this review

1. **r6 §9 go-live checklist.** It lists "Contributions Declined", the Spark Recurring Schedule Reminder and System Messages to be "confirmed off". While SiteStacker still charges, these must stay **on**: SiteStacker's own article requires them (151000122015 receipt, cancellation and pre-billing statements; 151000183830 recovery link; both re-fetched 2026-11-01). r2 had this right; r6 did not (v1-15).
2. **r5 lifecycle ordering.** Asym giving pages go live at S8, after import and sign-off, while forms go off at S3. That ordering creates a giving outage. Asym giving should be live at the boundary (v1-16).
3. **r5 §3.2 / K6 and r6 §4.** Proportionality: persist facts and derive stages; keep one switch boundary; defer the self-serve cockpit until "who runs a switch" is decided (v1-07, v1-10).
4. **r2/r3/r4 processor proposals.** Per-processor catch-up profiles, full-history processor tie-out and the OAuth observation grant are research options, not v1 requirements (v1-08).

### 5.3 What I could not verify

- Whether SiteStacker records PayPal subscription payments once its checkout is disabled, or at all (IPN handling not visible in public code).
- SiteStacker server-side recurring cron behaviour; restart behaviour after a pause.
- SiteStacker licence cost and whether a reduced "tail mode" subscription exists.
- Whether the Phase 12 Operator Tenant Grant is implemented.
- The Mastercard primary rule text (only SiteStacker's restatement was read).
- Real handover attrition rates (no primary source exists; vendor figures are marketing or unsourced).
- Statement and receipt obligations per jurisdiction for a mid-year switch (for example Canadian annual receipting).
- help.sitestacker.com articles (TLS failure reported by sibling tracks; not retried here).
- Any off-repo ministry, prospect or WMTEK conversation that would supply a representative export.

Status: COMPLETE (2026-11-01). Twenty concerns: v1-01 to v1-06 problem validity; v1-07 to v1-10 overengineering; v1-11 to v1-14 operational burden; v1-15 to v1-20 UX.
