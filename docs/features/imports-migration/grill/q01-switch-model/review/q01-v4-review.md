# Q01-V4 — Adversarial review of the Q1 switch decision (Option A)

**Reviewer track:** v4. **Categories:** (1) Source of truth, ownership and domain invariants; (2) Hidden coupling; (3) Data integrity risks; (4) Technical debt.
**Status:** COMPLETE (2026-11-01).
**Evidence baseline:** `develop` at `629cb71dc` (`git log -1` on 2026-11-01: `629cb71dc206dd9aa7b2d5ed15aaf57914eee071`, merge of PR #2423). Phase 29 spec PR #2430 is OPEN, not draft, head `1483a349514c66b458da38e0ba0992efdc2e1f31` (`gh pr view 2430`, 2026-11-01).
**Mode:** read-only. This file is the only thing written. No spec, ticket, schema or code change is proposed as decided. Every fix below is a proposal for the founder or the named owner to accept or reject.

Evidence labels: verified-vendor-doc (URL + access date 2026-11-01), snippet-only, third-party, repo-ratified, repo-published, repo-integrated, repo-implemented, inferred, assumption, unverified. Line references are `path:line` on `629cb71dc` unless noted otherwise.

## 0. What was examined

- The decision under review: founder answer to Q1 (2026-11-01). Option A, one planned switch per ministry, with four presented refinements: (1) exact repeat import means replaying the same snapshot; (2) a gifts-only reviewed catch-up after the switch that never overwrites supporter details and never wins over Asym edits; (3) attestation that SiteStacker automations (Spark), giving forms and Mailchimp sync are off; (4) recurring/processor handover stays with Phase 16, with records designed so Option B can be added later. Plus the founder's request to research what must come over, including payment-processor integration.
- Working record `grill/decision-log.md` (C1-C23, D1-D19, O1-O11, F1-F17).
- The six q01 research tracks (r1-r6) and the verifier corrections in the task digest. Where a verifier corrected a track, the correction is used.
- Governing sources re-read for this review (cited where used): `docs/prds/sitestacker-parity/roadmap.md:4320-4420`; `docs/prds/program-roadmap/owner-constraints.md:329-455`; Phase 13 PRD (`:155-168`, `:525-548`, `:655-665`, `:720-747`, `:1020-1042`, `:2188-2200`); Phase 16 PRD (`:1225-1240`, `:1260-1318`, `:2080-2088`, `:2578-2596`, `:2690-2700`); Phase 14 PRD (`:1480-1492`, `:1858-1870`); Phase 7 PRD (`:336-341`); ADR-0058 (`:15-30`); ADR-0106 (`:80-106`); `CONTEXT.md:5025-5043`; `openspec/contracts/platform-product-intent.md:305-316`.
- Current code: `packages/api/src/stripe/tenant-client.ts`, `packages/api/src/stripe/event-store.ts`, `packages/api/src/donate/saga.ts`, `packages/api/src/donor-portal/billing.ts`, `packages/api/src/missionary-portal/donors.ts`; migrations `20250101000000_init_schema.sql`, `20260214090000_foundation_1_schema.sql`, `20260223170000_atomic_rpc_and_donation_saga.sql`, `20260508000413_crm_identity_mapping.sql`, `20261005050728_field_policy_foundation.sql`.
- GitHub (read-only `gh issue view`, 2026-11-01): #711, #809, #834, #512, #2295, #2347, #2087, #2368.

## 1. Verdict summary

| Category                                         | Material concern?  | One-line verdict                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------ | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Source of truth, ownership, domain invariants | **Yes**            | Option A is the right shape. But "Asym becomes the only place" is not true by fact family. Out-of-scope SiteStacker modules (child sponsorship above all) can leave a permanent second live CRM writer. Freeze and reconciliation are still assigned by Phase 13 to an unnamed workstream. Refinements (1) and (2) conflict with published clauses that must be edited, not overridden by shorthand (C3). |
| 2. Hidden coupling                               | **Yes**            | The Phase 13 legacy reference key is Stripe-shaped (connected account, livemode), so non-Stripe history has no valid key. Live checkout and portal code turns any imported `cus_` into live control. Refinement (3) ties a one-shot "off" to duties that must keep running in the tail. One switch day ties go-live to five unbuilt owners.                                                               |
| 3. Data integrity risks                          | **Yes**            | "Counts and per-currency totals" reconciled against the import's own file proves nothing. Snapshot identity and replay keys are undefined. Catch-up facts can attach to merged or erased people. Schema defaults would invent dates, statuses and languages.                                                                                                                                              |
| 4. Technical debt                                | **Yes (moderate)** | "Designed so B can be added later" has no bound. The lineage carrier (`crm_record_links`) stays writable by staff, and #2295 does **not** fix that (this corrects decision-log D9/O7). The catch-up can harden into a standing sync. Phase 28 machinery tickets could fix run and plan identity before Phase 30 does.                                                                                     |

None of these invalidates Option A. Five concerns should be settled, or written into the decision text, before Q1 is recorded (bucket `resolve_before_recording`): v4-01, v4-02, v4-03, v4-05 and v4-08.

## 2. Category 1: Source of truth, ownership and domain invariants

**Material concern: yes.**

**What was checked.** Which system or owner holds each authoritative fact before, at and after the switch. Whether Option A's wording ("Asym then becomes the only place for supporters and their history") matches the ratified money contracts. Who owns freeze and reconciliation. Whether refinements (1) and (2) conflict with published clauses. Sources: P13 `:720-747`, `:159-165`, `:2192-2199`; P16 `:1264`, `:1314`, `:1316`, `:2581-2593`; ADR-0058 `:22-24`; ADR-0106 `:83-97`; `owner-constraints.md:370-371`, `:412`, `:424-426`; P14 `:1864-1866`; roadmap `:4363`, `:4377`, `:4395`; `platform-product-intent.md:315-316`; #711 body.

### v4-01 — "Asym becomes the only place" is not true by fact family; the decision needs an authority matrix

- **What could go wrong.** Builders and staff read "only place" as "Asym controls everything from switch day". Concretely:
  - Asym shows a recurring gift as stopped or cancelled while SiteStacker's scheduler, a PayPal subscription or a gateway-native schedule keeps charging.
  - Staff try to refund or cancel legacy charges from Asym.
  - Missionary and finance views treat Asym's imported totals as final, while the old processor keeps producing refunds, disputes and ACH returns on pre-switch gifts.
  - The reconciliation report says "complete" while money is still moving outside Asym.
- **Why it matters.** The ratified contracts deny Asym that control:
  - P13 `:735-737`: "An existing provider object may keep operating while it is observed, but observation is not control" (repo-ratified).
  - P16 `:1264`: an executor owned by another application or operator is "Externally controlled/read-only … never adopt by metadata or start a competitor" (repo-ratified).
  - P16 `:1314`: a different account or executor needs formal cutover with proof the old executor stopped (repo-ratified).
  - ADR-0058 `:22-24`: Asym "cannot atomically lock an independent connector or manual bookkeeper" (repo-ratified).
  - The glossary tells writers to avoid "universal external freeze" and "date-only go-live" (`CONTEXT.md:5042`, repo-ratified glossary).

  So the literal claim contradicts governing text. Q1 would then record a promise the money owners have already ruled out.

- **Severity:** high. **Likelihood:** high. Any ministry with recurring giving has a tail; that SiteStacker's scheduler is the executor is inferred and strong (q01-r2 §0.2; the verifier rates it unverifiable from public code, so it is a per-ministry census item).
- **Evidence.** As above, plus q01-r5 K1 and q01-r4 §7, which reach the same conclusion from different directions.
- **Effect on the answer:** changes (the wording and the meaning of "switch complete").
- **Best permanent fix.** Record Q1 together with a short authority matrix by fact family, measured from the Switch Boundary B:

  | Fact family                                                                                               | Authoritative system after B                                                                                                                                   | Asym's role                                                            |
  | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
  | Party identity, contact data, households, relationships, custom data, consent and suppression, staff work | Asym                                                                                                                                                           | Writer of record. SiteStacker copies are evidence only.                |
  | Historical gifts at or before B                                                                           | Asym holds imported settled facts (P13 D.6). The original processor stays authoritative for settlement, refund, dispute and return of the charges it executed. | Appends corrections as owner facts. Never rewrites.                    |
  | Legacy recurring arrangements                                                                             | The legacy executor (SiteStacker scheduler, PayPal, gateway-native schedule) until its own P16 formal cutover                                                  | Holds the P16 classification only, external/read-only                  |
  | Charges a legacy executor makes after B                                                                   | The processor                                                                                                                                                  | Records them through an owner command, still to be defined (see v4-04) |
  | Receipts for legacy-executed charges                                                                      | Exactly one declared issuer per cohort                                                                                                                         | See v4-04 and v4-08                                                    |
  | Accounting posting; Field Account balances                                                                | P20 and P21, each with its own boundary                                                                                                                        | None from Phase 30 (C8)                                                |

- **Decision text to add.** "From the Switch Boundary, Asym is the system of record for supporter identity, contact data, consent, relationships, custom data and staff work for the migrated Tenant. Asym does not control any legacy executor. Each legacy recurring arrangement remains Externally controlled/read-only (P16 K.1) until its own Phase 16 formal cutover. The original processor remains authoritative for the settlement, refund, dispute and return facts of every charge it executed. Asym records those facts only through owner commands, as append-only evidence. A Switch is 'live' when supporter authority has moved. It is 'closed' only when every legacy executor is proved stopped or formally cut over and the tail is closed."
- **Bucket:** resolve_before_recording.

### v4-02 — Out-of-scope SiteStacker modules, child sponsorship above all, can keep SiteStacker as a permanent live writer for the same supporters

- **What could go wrong.** A ministry runs child sponsorship in SiteStacker. Asym excludes sponsorship from the whole program, so the ministry cannot move it and keeps SiteStacker running for it after the switch. The consequences:
  - Sponsors are often also missionary donors; r1 X5 records mixed checkouts and shared schedules. SiteStacker keeps creating and updating those people (address, email, record types via Spark) and keeps charging their sponsorship recurring gifts.
  - An unsubscribe recorded in Asym never reaches SiteStacker's sponsor letters, and the reverse.
  - New sponsors created in SiteStacker after B never reach Asym.
  - The same applies to any SiteStacker module left running that creates CRM people. Examples: event or prayer forms, application workflows, and the SendGrid inbound capture that auto-creates people (r1 edge case).
  - The result is a permanent dual live writer for overlapping supporters: Option C, which the founder rejected, coming back for this population.
- **Why it matters.** The roadmap forbids "permanent dual writers" (`roadmap.md:4395`, repo-published). Consent and do-not-contact floors (C10) cannot be honoured across two live systems. C12 says Asym owns CRM truth. No research track raised this as a source-of-truth problem:
  - r1 D24 (`q01-r1…md:247`) and X5 treat sponsorship as an exclusion of records and money.
  - r2 X26 (`q01-r2…md:350`) assigns sponsorship meaning to a "sponsorship owner", but no such owner exists in Asym.
- **Severity:** high. **Likelihood:** medium. How common sponsorship is among target ministries is **unverified (assumption)**. r1 cites the vendor saying Spark is used "primarily … [for] Child Sponsorship" (`q01-r1…md:260`, V41 via r07), which suggests it is not rare.
- **Evidence.** `openspec/contracts/platform-product-intent.md:315-316` ("Child sponsorship is out of scope", repo-published contract); C13; roadmap `:4395`; q01-r1 `:247`, `:260`, `:435`; q01-r5 E-47, which allows only "website host only … no forms writing supporter or money data".
- **Effect on the answer:** narrows (Option A is achievable only where no residual SiteStacker writer for the migrated population survives, or where one is explicitly declared).
- **Best permanent fix.** Make residual live writers a census item and an eligibility gate. Then ask the founder to choose for v1 between:
  - (a) such ministries are not eligible for v1; or
  - (b) a founder-approved Residual External System declaration: SiteStacker stays system of record **only** for the named out-of-scope domain, with no sync in either direction, a stated count of overlapping people, and the ministry's written acceptance that Asym will not see consent or contact changes made there.
- **Decision text to add.** "A Switch may be scheduled only if the census shows no SiteStacker module that will, after the Switch Boundary, create or update CRM people, contact data, consent or money for anyone in the migrated population. Otherwise the founder must approve a Residual External System declaration naming the module, the out-of-scope domain, the number of overlapping people and the ministry's acceptance that Asym will not receive changes made there. v1 has no sync, refresh import or write-back for a residual system."
- **Bucket:** resolve_before_recording.

### v4-03 — Freeze, bulk reconciliation and processor coordination still belong, on paper, to an unnamed workstream; Option A takes them by shorthand

- **What could go wrong.** The Phase 30 spec writes the freeze and the reconciliation steps, but Phase 13 still assigns both elsewhere. The Phase 13 owner can then refuse them, or, more likely, each owner assumes another is building the processor half and nobody builds it:
  - processor coordination;
  - vault transfer;
  - the reauthorization campaign;
  - connected-account readiness;
  - "recurring-executor replacement at scale".

  The switch then ships with no path for recurring donors.

- **Why it matters.** The workstream is named in three places:
  - P13 `:743-746`: "The separate migration workstream owns processor coordination, credential-vault transfer, reauthorization campaigns, cutover freezes, and bulk reconciliation" (repo-ratified).
  - P13 `:2192-2199` adds "full CRM data ETL at scale … cutover freeze and reconciliation, connected-account readiness, and recurring-executor replacement at scale" (repo-ratified).
  - P13 `:165` gives "Full CRM data migration at scale" to the same workstream.

  Two further conflicts:
  - #711 (OPEN; body reconciled 2026-09-23) says the Phase 13 PRD "reserves broader historical import delivery to Phase 36". Phase 30's roadmap targets "historic gifts" (`roadmap.md:4363`), so the two routes collide (decision-log D2).
  - Under C3 (`docs/ai/document-authority.md:10-13`), a consumer phase cannot take a producer's authority by shorthand; the superseded clause must itself be edited.

  The verifier's correction stands: the CRM ETL half is effectively Phase 30's (inferred from roadmap `:4341`, `:4359`, `:4363`, `:4377`), while the processor half is unassigned (q01-r4 §6 plus verifier grep).

- **Severity:** high. **Likelihood:** high (the gap exists today).
- **Evidence.** As above; q01-r3 and q01-r4 owner-gap lists.
- **Effect on the answer:** changes (Q1 must state which part of "freeze" and "reconcile" Phase 30 owns).
- **Best permanent fix.** Record a proposed split and route the clause edits to the Phase 13 and Phase 16 owners before the Phase 30 spec starts:

  | Owner              | Proposed scope                                                                                                                                                                     |
  | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Phase 30           | Switch Boundary record, ministry attestation evidence, retained-state and source census, snapshot manifests, CRM and historical reconciliation report, catch-up transport profiles |
  | Phase 13           | Legacy money reference model (v4-06), money control-total semantics and source basis, owner commands for imported and post-boundary externally collected money                     |
  | Phase 16           | Classification, stop proof for non-Stripe executors (SiteStacker scheduler, PayPal, gateway-native), the donor confirmation or reauthorization flow, executor replacement at scale |
  | Operations runbook | Processor coordination, vault-transfer logistics, freeze communications                                                                                                            |

  Also reconcile #711's "Phase 36" routing.

- **Decision text to add.** "Q1 adopts a ministry-declared freeze and reconciliation only within Phase 30 scope: the boundary record, attestation evidence, census, manifests and the CRM and history reconciliation report. Processor coordination, vault transfer, reauthorization, connected-account readiness and executor replacement remain with the Phase 13 'separate migration workstream' until P13 `:743-746` and `:2192-2199` are edited to name their owners. The Phase 30 spec cannot be published while those clauses still assign freeze and reconciliation to an unnamed owner."
- **Bucket:** resolve_before_recording.

### v4-04 — Refinement (2)'s conflict rule ("gifts-only; never overwrites supporter details; never wins over Asym edits") does not fit append-only money

- **What could go wrong.**
  - (a) "Gifts-only" leaves out refunds, reversals, disputes, ACH returns, failures and stops on legacy charges. Asym then overstates received money, and receipts and statements are built on totals that are too high. q01-r2, q01-r5 K2 and the verifiers agree.
  - (b) "Never wins over Asym edits" is field-level last-writer-wins language. It has no meaning for append-only money facts. Suppose staff re-designated a post-boundary legacy gift in SiteStacker while Asym staff corrected the same gift in Asym. The rule decides nothing.
  - (c) No owner command exists for a gift a legacy executor collects **after** B. P13 D.6 covers pre-Asym gifts only ("stamped with a pre-Asym provenance boundary", P13 `:1028-1037`, repo-ratified).
  - (d) Receipting has no single owner:
    - Phase 13 keeps an `already_receipted` pre-Asym boundary (P13 `:726-727`).
    - The Phase 7 import fact has only two values: a pre-Asym receipt exists, or no Asym receipt is permitted (P13 `:1031-1034`).
    - Phase 7 E3 lets imported gifts "be receipted" (`phase-07…md:339`).
    - Phase 14 holds import-origin acknowledgments forever (P14 `:1489-1490`).

    Result: a catch-up gift either gets two receipts (SiteStacker's and Asym's) or none, and can never be thanked if it enters as an "import".
- **Why it matters.** This is money truth and donor-facing compliance. The roadmap already gives the seam: "Reviewed backfill is a separate bounded operation" (`roadmap.md:4395`). It does not give the money command or the receipt rule.
- **Severity:** high. **Likelihood:** high.
- **Evidence.** As above; q01-r4 G1/G2 (owner-constraints `:424-426` applies only if the catch-up becomes a standing feed); q01-r5 K2/K4.
- **Effect on the answer:** changes.
- **Best permanent fix.** Rename and reshape refinement (2) as a **reviewed legacy money-and-executor catch-up**:
  - Each run is a separate bounded reviewed backfill.
  - It carries only append-only facts through Phase 13 and Phase 16 owner commands.
  - Contradictions become owner exceptions, never precedence decisions.
  - The receipting system for each legacy cohort is declared before the first run.
- **Decision text to add.** "The post-boundary legacy catch-up carries only append-only money and executor-state facts for legacy executors: succeeded charges, refunds, reversals, disputes, ACH returns, failed attempts and stops. Each fact enters through a Phase 13 or Phase 16 owner command defined for externally collected post-boundary facts. The catch-up never creates, updates or deletes Party, contact, consent or relationship data. A catch-up fact that contradicts an Asym-held fact is never applied by precedence; it becomes an owner exception. Before the first catch-up run, each legacy cohort declares exactly one receipting system for its charges (SiteStacker, or Asym under a Phase 7 rule), and that declaration is part of run evidence."
- **Bucket:** spec_requirement.

### v4-05 — Refinement (1) narrows published "re-import updates" clauses without editing them

- **What could go wrong.** The Phase 30 spec says "repeat import = replay the same snapshot". Three published clauses still say re-import updates or converges:
  - `owner-constraints.md:370-371`: "re-import updates instead of duplicating" (repo-published).
  - P14 `:1866`: "Re-import updates instead of duplicating (the Phase 30 stable-external-ID rule)" (repo-ratified).
  - roadmap `:4363`: "Reimport converges on the same permitted target identity" (repo-published).

  A later builder could implement source-wins updates on a second snapshot. Under Option A that overwrites Asym edits once Asym is the system of record. Alternatively, an owner (Phase 14) builds its import identity around update semantics that Phase 30 then never calls.

- **Why it matters.** C3 requires the conflicting clause to be edited. Narrowing it inside a Phase 30 decision is not enough. q01-r6's verifier also notes that "exact repeat import" is left undefined at `roadmap.md:4387`, so refinement (1) is a **new founder narrowing**, not an inherited rule.
- **Severity:** medium. **Likelihood:** high (the documents conflict today).
- **Evidence.** As above; q01-r5 verifier note on `owner-constraints.md:370-372`.
- **Effect on the answer:** narrows.
- **Best permanent fix.** Record refinement (1) with its scope stated, and list the clause edits needed at Phase 30 publication.
- **Decision text to add.** "Exact repeat import (v1): replaying the same accepted Source Snapshot Manifest under the same mapping converges on the same target identities and produces no new create, update or outward effect. Any other snapshot of the same source, taken after a committed run, is a new plan:
  - unmatched source records are create proposals;
  - changed source values on bound records are shown as three-way differences (prior source, current source, current Asym) for reviewed correction through the owner command;
  - Asym values are never overwritten by source precedence.

  At Phase 30 publication, `owner-constraints.md:370-371` and P14 `:1866` are edited to scope 're-import updates' to this rule."

- **Bucket:** resolve_before_recording.

## 3. Category 2: Hidden coupling

**Material concern: yes.**

**What was checked:**

- The identity and reference keys that imported money would have to satisfy.
- Live code paths that read columns an import or catch-up might populate.
- Which donor-facing duties refinement (3)'s "off" switch actually controls.
- The release dependencies a single switch day creates.

**Sources:** P13 `:528-536`, `:723-725`; #711 acceptance; P14 `:1864`; `packages/api/src/donate/saga.ts:207-210`, `:293-301`; `supabase/migrations/20260223170000_atomic_rpc_and_donation_saga.sql:1253-1257`; `packages/api/src/donor-portal/billing.ts:17`, `:38-41`; `supabase/migrations/20261005050728_field_policy_foundation.sql:500`; `packages/api/src/stripe/tenant-client.ts:64-66`; `packages/api/src/stripe/event-store.ts:154`; P16 `:2692`; `owner-constraints.md:410-413`; ADR-0106 `:83-97`; open issues #834, #809, #512 and PR #2430.

### v4-06 — The legacy money reference key is Stripe-shaped, and Phase 14 import identity is not scoped to a source system

- **What could go wrong.**
  - (a) P13 requires imported references "bound to the exact tenant, connected account, mode, Party, and source object" (story 169, P13 `:534-536`; repo-ratified). It describes them as "exact tenant/account/livemode-scoped external references" (`:528-531`). #711's retained obligations say to "Carry exact Tenant, Legal Entity, Settlement Account Binding, connected-account, livemode/environment, provider object and source lineage". Its acceptance requires "exact same-tenant/entity/account/mode provenance". Any provenance that is missing or ambiguous "remain[s] blocked/quarantined" (repo-published, `gh issue view 711`, 2026-11-01).
  - SiteStacker gifts processed through iATS, Braintree, PaymentSpring, Authorize.net or PayPal, or identified only by SiteStacker's own transaction ID, have no connected account, no livemode and no Asym Settlement Account Binding. Several processors per ministry are normal, because gateways are chosen per Site × currency × method (q01-r2: vendor doc 151000118930 verified, and vendor-served code, inferred).
  - Read literally, the key leaves only bad outcomes: most SiteStacker history is quarantined forever, or importers fill placeholder "account/mode" values, which corrupts the provenance key that later refunds and disputes are matched on.
  - (b) Phase 14 ships `external_ref` with a partial `UNIQUE (tenant_id, external_ref)`, plus `external_source` only "where ratified". It also says "Re-import updates instead of duplicating" (P14 `:1864-1866`, repo-ratified). Numeric IDs can collide across source families: SiteStacker Contributions vs Historic Giving, a second SiteStacker installation, PayPal transaction IDs in a catch-up. With that key, a distinct legacy credit or tribute silently **updates** an unrelated one. That collisions actually happen is **inferred**; SiteStacker ID formats are unverified because no real export exists (C23, r10-gap-g3).
- **Why it matters.** Refinement (4) promises "source-snapshot identity, per-record lineage". That promise is only as good as the owners' reference keys. A wrong key here becomes permanent: append-only money cannot be cleanly re-keyed later.
- **Severity:** high. **Likelihood:** high for (a) in multi-processor and non-Stripe ministries; medium for (b).
- **Evidence.** As above.
- **Effect on the answer:** changes (refinement 4 must name the source-qualified key; owner amendment needed).
- **Best permanent fix.** Ask Phase 13 (and Phase 14 for credits and tributes) to define one **source-qualified legacy reference**: (Tenant, source system, source installation, source record family, source object ID).
  - Optional **processor provenance** sits beside it: gateway, merchant account reference, environment, processor object ID.
  - Uniqueness is enforced on the full tuple.
  - A Stripe connected account plus livemode is one variant of processor provenance, never a precondition for importing pre-boundary or legacy-executed facts.
- **Requirement / acceptance text.** "Every imported money, credit or tribute root carries a source-qualified external reference (Tenant, source system, source installation, record family, source object ID), and uniqueness is enforced on that full tuple. Processor provenance (gateway, merchant account reference, environment, processor object ID) is recorded when evidenced. It is never required to resolve to an Asym Settlement Account Binding. Acceptance (real database):
  - two rows with the same source object ID from different record families or installations import as two distinct facts;
  - the same tuple replayed converges on one fact;
  - a non-Stripe legacy gift with complete source provenance is not quarantined for lacking a connected account."
- **Bucket:** spec_requirement.

### v4-07 — Live checkout and portal code would turn any imported provider ID into live control

- **What could go wrong.** Suppose any import, catch-up or staff edit writes a legacy Stripe `cus_` into `donors.stripe_customer_id`:
  - Checkout **reuses** it for every new Asym gift. `ensureStripeCustomerId` returns `existingStripeCustomerId` when present (`saga.ts:207-210`), and the saga passes the donor's stored ID (`saga.ts:300`).
  - The completion RPC **never replaces** it: `SET stripe_customer_id = COALESCE(stripe_customer_id, p_stripe_customer_id)` (`20260223170000_atomic_rpc_and_donation_saga.sql:1255`). The first writer wins permanently.
  - The donor portal opens a whole-account Stripe Billing Portal for that ID (`billing.ts:39-41`).
  - Mission Control staff can view and edit the column (`field_policies` row `('donors','stripe_customer_id','mission_control',NULL,true,true,false,'financial')`, `20261005050728_field_policy_foundation.sql:500`; columns `visible, editable, exportable`). Whether a UI exposes it is unverified.

  The outcomes:
  - On a **new** connected account, Asym checkout fails ("no such customer"), and no code path ever repairs it.
  - After a Stripe self-serve copy, "Copied customers have the same customer ID as in the original account" (verified-vendor-doc, https://docs.stripe.com/get-started/data-migrations/pan-copy-self-serve?copy-method=full, accessed 2026-11-01). The ID then resolves, so SiteStacker-era saved cards appear in the Asym portal and checkout with no Phase 16 authorization, and the donor can change legacy objects.

  On top of that, `tenant-client.ts:64-66` falls back to the platform `STRIPE_SECRET_KEY` when the tenant row has no key, and `event-store.ts:154` routes tenants from `metadata.tenant_id`. A tenant migrated before the Phase 13 binding exists could therefore take money on Asym's own account. That contradicts P13's locked "Asym is never in the flow of funds" (P13 `:655`).

- **Why it matters.** This is money and authorization. It extends q01-r4 H1-H3 with three facts r4 did not cite: checkout reuse, the first-writer-wins RPC, and staff editability. With them, the hazard holds for checkout as well as the portal, and it cannot be undone without direct database repair.
- **Severity:** high. **Likelihood:** medium. No import writer exists yet (decision-log §8), but the hazard is on the obvious path for any builder who "maps Stripe customer ID".
- **Evidence.** All repo-integrated, as cited, plus the vendor doc.
- **Effect on the answer:** no_change to Option A, but refinement (4) needs the inert-evidence rule and a go-live gate attached.
- **Best permanent fix.**
  - An inert-evidence rule in the Phase 30 spec.
  - A real-database test.
  - A prerequisite gate that blocks go-live on the plaintext or fallback key path.
  - Ask Phase 13 to remove the fallback and the `COALESCE` first-writer rule when the binding lands. That is owner work, not Phase 30's.
- **Requirement / acceptance text.** "Phase 30 and every owner import or catch-up command store legacy provider identifiers (customer, payment method, subscription, charge, mandate) only as inert source evidence. No import, catch-up or staff mapping writes `donors.stripe_customer_id`, `donor_pledges.stripe_*`, or any column that a live checkout, portal or webhook handler reads. Acceptance (real database):
  - a donor imported from a row carrying `cus_…` keeps a null live customer column;
  - that donor's next Asym checkout creates a new customer on the bound account;
  - a Switch cannot be scheduled while the tenant resolves Stripe through `tenants.stripe_secret_key` or the platform-key fallback."
- **Bucket:** implementation_safeguard.

### v4-08 — Refinement (3) ties one "off" attestation to duties that must keep running during the tail, and it misses surfaces SiteStacker settings cannot reach

- **What could go wrong.** The ministry turns off Spark, forms and Mailchimp sync at the freeze, as refinement (3) asks. While SiteStacker (or PayPal, or a gateway) keeps charging legacy recurring gifts, these duties stop:
  - the Mastercard pre-billing reminder for annual gifts, which is a Spark automation (151000122015; q01-r2, verified-vendor-doc);
  - decline and update-card handling (151000183830);
  - Contribution Receipts, if they are treated as an "automation";
  - the donor's cancellation path (q01-r4 G3: "Merchants must provide an online or electronic cancellation method", vendor doc via r4).

  Several surfaces stay live whatever SiteStacker's settings say:
  - lists already exported to missionaries' own Mailchimp accounts (151000122392: a manual, one-way export; verified-vendor-doc per the r1 verifier);
  - PayPal Standard subscriptions (vendor-served code, inferred; capped at `srt` ≤ 52 cycles);
  - gateway-sent receipts;
  - gateway-native schedules.

  The opposite failure is also possible. The ministry leaves receipts on, Asym also activates its own receipts or notices for the same cohort, and donors get duplicates. P16 REC-19 already requires that "provider ownership does not duplicate Asym sends" (P16 `:2692`, repo-ratified).

- **Why it matters.** The rule couples a configuration toggle to who owns each donor-facing duty. Every duty must have exactly one owning system at all times, and an attestation cannot cover systems it does not control.
- **Severity:** high. **Likelihood:** high.
- **Evidence.** As above; q01-r2 edge cases; q01-r6 §9.
- **Effect on the answer:** changes.
- **Best permanent fix.** Replace refinement (3) with a **Legacy Outward Surface Register**, filled in at readiness and re-attested at the boundary. For each surface (each Spark automation, each System Message, each giving form, text-to-give URL, Mailchimp connection including each missionary's own account, PayPal subscription set, gateway receipt setting, gateway-native schedule set) it records:
  - its state: `off at boundary`, `kept on until tail closure (owner, end condition)`, or `not used`;
  - the kind of evidence held (attestation, screenshot or configuration export; the founder chooses);
  - the single system responsible for each donor-facing duty: receipt, pre-billing notice, decline notice, cancellation path, marketing.

  Asym activation of any duty for a cohort is blocked while a legacy surface for the same duty and cohort is `kept on`.

- **Decision text to add.** "Before go-live, the ministry completes a Legacy Outward Surface Register covering every SiteStacker, processor and missionary-held outward surface. Each surface is recorded as off at boundary, kept on until tail closure (with owner and end condition), or not used. Each donor-facing duty (receipt, pre-billing notice, decline notice, cancellation path, marketing) for each legacy cohort has exactly one responsible system. Asym cannot activate a duty for a cohort while a legacy surface for that duty and cohort is kept on. Surfaces outside SiteStacker's control (missionary-owned lists, PayPal, gateway settings) are listed as such and are never shown as covered by a SiteStacker setting."
- **Bucket:** resolve_before_recording.

### v4-09 — One switch day ties go-live to five unbuilt owners and invites a false link between the Phase 30 boundary and the Phase 20 and Phase 21 cutovers

- **What could go wrong.**
  - (a) Option A needs every in-scope family's target owner at once. None of the import-relevant owner commands exists (decision-log §8). These are all open on 2026-11-01:
    - #834 (P16 legacy commitment classification, blocked);
    - #809 (P16 proof-or-formal-cutover);
    - #512 (P4 non-destructive merge);
    - PR #2430 (P29 custody, unmerged);
    - the Phase 7 import fact, which is undefined (D4).

    If the switch goes ahead without the P16 classifier, legacy recurring gifts have no Asym representation. Missionaries see support "drop" (q01-r4 G15; q01-r6 §7), and teams come under pressure to ship a shortcut writer for recurring, which is exactly what #711 forbids.

  - (b) Builders treat "switch day" as one global go-live and line up Field Account activation and posting ownership with the Phase 30 boundary. A Phase 30 "complete" is then read as activation. C8 and `owner-constraints.md:410-413` forbid that: Phase 20 and Phase 21 boundaries "remain independently authoritative even when intentionally aligned".
- **Why it matters.** This is release sequencing and blast radius. Option A concentrates every dependency on one date. If any one is missing, the choice is a delay or a silent gap.
- **Severity:** high. **Likelihood:** high (the owners are unbuilt).
- **Evidence.** As cited; ADR-0106 `:83-90` (one immutable cutover "at an exact half-open boundary for every predecessor source family").
- **Effect on the answer:** narrows.
- **Best permanent fix.** Add a readiness gate and a boundary-separation rule.
- **Requirement / acceptance text.** "A Switch can be scheduled only when every source family in the census has either a qualified owner import command or an accepted visible exclusion, and every legacy recurring cohort has at least a Phase 16 external/read-only classification target. The Switch Boundary governs Phase 30 import scope only. It never activates, proves or substitutes for a Phase 20 Posting Ownership Cutover or a Phase 21 Field Account Operational Cutover, which keep their own boundaries even when set to the same instant. Acceptance: a Switch whose census lists a recurring cohort with no classification target cannot leave readiness."
- **Bucket:** spec_requirement.

## 4. Category 3: Data integrity risks

**Material concern: yes.**

**What was checked.** Whether the stated reconciliation can detect the known failure modes in a SiteStacker export:

- double counting (K19);
- ledger lines (K20);
- partial or permission-filtered exports (q01-r5 E-25, E-26);
- pending ACH (E-02);
- post-boundary rows (E-27);
- gateway-side refunds and disputes absent from SiteStacker (q01-r2).

Also checked: what "the same snapshot" means for idempotency; how catch-up facts find their person after Asym-side merges and erasures; and whether current schema defaults would invent facts.

**Sources:** roadmap `:4349`, `:4363`, `:4369`, `:4401`; C11 (PR #2430); P13 story 171 (`:539-542`) and `:745-747`; decision-log D10 and D16; migrations `20250101000000_init_schema.sql:76`, `:82`; `20260214090000_foundation_1_schema.sql:334-338`, `:382`; `packages/api/src/missionary-portal/donors.ts:174-192`.

### v4-10 — "Reconcile counts and per-currency totals" is under-partitioned and, as worded, checks the import against itself

- **What could go wrong.**
  - Reconciliation compares Asym's imported rows with the same files that were imported. It passes even when the export itself is wrong. Examples:
    - Historic Giving and Contributions both supplied, so every SiteStacker-managed gift is counted twice (K19, from vendor doc 151000122348, verified-vendor-doc per r1);
    - ledger "Expense/Project transfer" lines (K20; the verifier notes they carry `record_type=ledger`, so a mandatory filter is the guard);
    - an export run by a user whose User Group hides rows (E-26);
    - a long export that errored and was split (E-25; K5 snippet);
    - pending ACH rows imported as succeeded (E-02);
    - fee-covered gifts where the processor's gross differs from the gift amount (q01-r2);
    - refunds, chargebacks and returns made in the gateway dashboard that SiteStacker never recorded (q01-r2: "SiteStacker documents nothing on chargebacks, returns or refunds made in the gateway dashboard").
  - The founder's wording also drops two partitions the roadmap requires. The roadmap says "by Legal Entity, original currency and source basis" (`roadmap.md:4369`, repo-published). Owner-constraints says "Legal-Entity-partitioned, per-currency control totals" (`owner-constraints.md:431-436`, SiteStacker kit bullet). "Source basis" is defined nowhere (decision-log D16).
- **Why it matters.** Finance sign-off would rest on a tautology. Every later owner (receipts, statements, Field Account openings, first-gift facts per C22) inherits the error.
- **Severity:** high. **Likelihood:** high. K19 alone affects every SiteStacker-managed ministry that supplies both datasets.
- **Evidence.** As above; q01-r6 point 3 (tie to independent control totals); q01-r1 §6 R3, R5, R6.
- **Effect on the answer:** changes (the reconciliation step's definition).
- **Best permanent fix.** Define reconciliation as a **conservation proof against independent controls**:
  - Partition per Legal Entity × original currency × source basis × legacy merchant account.
  - The independent control total comes from a source screen or report count, or a processor settlement report, that was not used as import input.
  - That control total = imported + excluded with reason + quarantined + assigned to the tail, in both count and minor units, with every variance itemised.
  - Phase 13 owns the meaning of source basis and the rule of one basis per gift population and period. Phase 30 owns the report.
- **Requirement / acceptance text.** "For each Legal Entity × original currency × source basis × legacy merchant account cohort, the reconciliation report shows:
  - an independent control total, taken from a source report, source screen count or processor statement that was not used as import input;
  - that this total equals imported + excluded-with-reason + quarantined + assigned-to-tail, for count and for minor-unit amount;
  - every variance itemised by reason.

  Each gift population × period has exactly one source basis (defined by Phase 13). Where Contributions and Historic Giving are both supplied, an overlap proof is mandatory. Historic Giving rows with `record_type=ledger` are never counted as gifts. Any unexplained variance blocks go-live. Acceptance: a fixture supplying the same gifts in Contributions and Historic Giving produces a blocking overlap variance, not a doubled total."

- **Bucket:** spec_requirement.

### v4-11 — "The same snapshot" is undefined, so replay idempotency and decisions carried over from practice runs can corrupt data

- **What could go wrong.**
  - (a) If "same snapshot" means identical bytes, a fresh download of unchanged data counts as a different snapshot. If idempotency is per run, the replay creates duplicates.
  - (b) If it means business keys only, replaying a **changed** export silently applies the changes.
  - (c) Match and mapping decisions made during a practice run get reused at the final run after the source row changed. Staff may have used SiteStacker's "Move Payment Method", re-designated a gift, merged two people or deleted a fraud row (r1 X2/X3; q01-r5 E-44). The gift then attaches to the wrong person, or a vanished ID is treated as deleted.
  - C11 forbids bytes-only business dedupe (PR #2430, repo-ratified/published, unmerged). The roadmap binds plans to exact bytes (`roadmap.md:4349`). Both are right, but they answer different questions, and refinement (1) does not say which governs replay.
- **Why it matters.** Duplicate or misattached money and identity in the first committed import is exactly the failure Option A's practice runs are meant to prevent.
- **Severity:** high. **Likelihood:** medium.
- **Evidence.** As above; q01-r5 K5 (multi-file manifest); r10-gap-g4 (no change feed; missing rows never prove deletion).
- **Effect on the answer:** narrows (the definition of refinement 1).
- **Best permanent fix.** Treat these as separate things:
  - The **manifest** (Phase 29 byte identities, filters, exporter role, version, export time, screen counts) identifies what was received.
  - The **commit idempotency key** is the source-qualified record identity (v4-06) plus the owner command identity.
  - **Carried decisions** are reused only when the record's content fingerprint is unchanged.
  - **Absence** is reported, never acted on.
- **Requirement / acceptance text.** "A Source Snapshot Manifest records the Phase 29 byte identities, export filters, exporter role, source version, export time and source screen counts for one Switch. Commit idempotency is keyed on the source-qualified record identity and the target owner's command identity, never on bytes alone. A reviewer decision from a practice plan is reused only if the source record's content fingerprint is unchanged; otherwise it is shown for review again. A record absent from a later snapshot is reported as 'absent from snapshot' and never deleted or reversed automatically. Acceptance:
  - re-exporting byte-different but content-identical files and committing twice creates no new facts;
  - a practice-run match on a record whose payment method moved to another person is shown again at the final run."
- **Bucket:** spec_requirement.

### v4-12 — Catch-up and late facts can attach to merged, erased or non-existent people

- **What could go wrong.** A catch-up gift references SiteStacker person 123, which is bound to Asym Party A. Each of these can then go wrong:
  - After go-live, Asym staff merge A into B. A naive binding lookup writes to the tombstoned A, or fails. Merge redirect storage is itself unsettled: `merged_into_donor_id` vs `donor_merge_redirects` vs `parties.merged_into_party_id` (decision-log D10), and #512 is OPEN.
  - Person 123 asked to be erased. A processor report then re-identifies them, which P13 forbids: "GDPR-erased donors remain pseudonymized and must not be re-identified from provider metadata" (P13 `:745-747`, repo-ratified).
  - A **new** donor gives on a still-live SiteStacker form, or is created after B. The catch-up then "needs" a Party. Creating one through the import path is a Party write, which contradicts refinement (2)'s intent and C2/C14. q01-r5 K3 raises the question without a rule.
- **Why it matters.** Money attached to the wrong person, or an erased person brought back, is a correctness, privacy and compliance failure. P13 story 171 already requires quarantine "rather than linked by email, name, phone, or payment fingerprint" (P13 `:539-542`).
- **Severity:** high. **Likelihood:** medium (merges after go-live are routine; post-boundary new donors appear when a form is left open, E-22).
- **Evidence.** As above.
- **Effect on the answer:** changes (refinement 2 should say "never creates or updates" a supporter, not only "never overwrites").
- **Best permanent fix.** The catch-up resolves Parties only through the stored source binding followed by the Phase 4 survivor-resolution read (O6). Anything else goes to finance exception review.
- **Requirement / acceptance text.** "Catch-up and late-fact runs resolve the Party only through the stored source binding followed by the Phase 4 survivor-resolution read. A fact with no binding, an ambiguous binding or an erased subject is quarantined for finance exception review (P13 story 171). It never creates, updates or re-identifies a Party automatically. Acceptance: a catch-up gift for a source person whose Asym Party was merged after go-live lands on the survivor; a catch-up gift for an erased person creates an exception carrying no personal data."
- **Bucket:** spec_requirement.

### v4-13 — Schema defaults and status mapping would invent facts for imported rows

- **What could go wrong.** An import writer that leaves a column blank gets a fabricated value:
  - `donations.gift_date DEFAULT CURRENT_DATE` and `currency DEFAULT 'usd'`, `source DEFAULT 'direct'` (`20260214090000_foundation_1_schema.sql:334-338`);
  - `donors.joined_date DEFAULT CURRENT_DATE` and `status DEFAULT 'active'` (`20250101000000_init_schema.sql:82`, `:76`);
  - `preferred_language … DEFAULT 'en'` (`20260214090000_foundation_1_schema.sql:382`; O8).

  `normalizeDonorStatus` maps anything unknown to "Active" and drives the missionary list's "Lapsed"/"At Risk" labels (`donors.ts:174-192`). Imported partners would therefore show as joined today, active, English-speaking, and in USD. That contradicts C22 (missing history must block conclusions) and P16 `:1068`: "Unknown never defaults to healthy, lapsed, zero, or received" (repo-ratified).

- **Why it matters.** These are wrong derived facts that look plausible, so nobody notices. The `source='direct'` default also conflicts with Phase 2's `legacy` attribution (C21; D7).
- **Severity:** medium. **Likelihood:** high if any writer targets the legacy tables; low if every write goes through new owner commands.
- **Evidence.** Repo-integrated, as cited. This consolidates q01-r4 §2.7 and q01-r6 (with its verifier's corrected citations).
- **Effect on the answer:** no_change.
- **Best permanent fix.**
  - Writes go only through owner commands that take explicit values or an explicit unknown.
  - A real-database test proves no default fired for import-origin rows.
  - Projections show "history incomplete" instead of a status.
- **Requirement / acceptance text.** "No import or catch-up row relies on a column default for any business fact (date, currency, status, language, source or attribution). Unknown is stored as unknown through the owner command. Acceptance (real database): for every import-origin row, the default-bearing columns equal source values or an explicit unknown marker, and missionary and portal projections render imported Parties without person-level lapse or health labels until coverage is declared."
- **Bucket:** implementation_safeguard.

### v4-14 — Residual SiteStacker writes after go-live need detection, not just attestation

- **What could go wrong.** A giving form, text-to-give keyword, QR code or staff habit keeps writing to SiteStacker after B, despite the attestation (q01-r5 E-22; q01-r6 edge case "catch-up contains gifts from a giving form attested as off"). New donors and one-time gifts then exist only in SiteStacker, and the attestation stays "green".
- **Why it matters.** Undetected, this is Option C by accident, and the missing money shows up only at year-end.
- **Severity:** medium. **Likelihood:** medium.
- **Evidence.** As cited; r10-gap-g4 (Asym cannot freeze SiteStacker).
- **Effect on the answer:** no_change.
- **Best permanent fix.** Each catch-up run classifies post-boundary source rows. Rows that are one-time gifts, new source person IDs or non-recurring origins are residual-write signals.
- **Monitor.**
  - **Signal:** count of post-boundary source rows in each catch-up or processor report that are not charges of a legacy recurring arrangement classified at B (one-time gifts, new source person IDs, form-origin rows).
  - **Threshold:** any one row.
  - **Owner:** the Phase 30 run owner for the Switch, with the ministry admin who signed the attestation.
  - **Response:** hold the catch-up commit for those rows, require re-attestation of the Legacy Outward Surface Register (v4-08), list affected donors for the receipt owner, and route the rows through v4-12 quarantine.
- **Requirement text.** "Every catch-up plan reports post-boundary source rows that are not occurrences of a legacy recurring arrangement classified at the boundary, and any such row blocks that plan's commit pending re-attestation."
- **Bucket:** monitor.

## 5. Category 4: Technical debt

**Material concern: yes (moderate).**

**What was checked:**

- Whether refinement (4)'s "designed so B can be added later" is bounded.
- Where per-record lineage would live, and whether that place can be trusted.
- Whether the catch-up can become an unowned standing process.
- Whether parallel tickets could fix the run and plan identity before Phase 30 does.

**Sources:**

- `supabase/migrations/20260508000413_crm_identity_mapping.sql:73-90` (table), `:204-240` (grants and policies);
- `20260818010000_retire_twenty_crm_runtime.sql:21-33`;
- `20261024163000_authz_definer_execute_lockdown.sql:39-41`;
- #2295 body (`gh issue view 2295`, 2026-11-01);
- decision-log D9, D12, O7;
- `owner-constraints.md:410-413`, `:424-426`;
- roadmap `:4395`;
- #2347 and #2087 (OPEN, labelled Ready).

### v4-15 — "Designed so Option B can be added later" has no bound

- **What could go wrong.** Two opposite kinds of debt:
  - Builders build speculative Option B machinery in v1: per-family scheduling, partial live writing, a generic orchestrator.
  - Or they bake in one global boundary that later needs a data migration to split.
- **Why it matters.** The minimum that keeps B possible already exists in governing text:
  - P20 D17 and P21 D17 use one exact half-open boundary per source family (`owner-constraints.md:408-413`; ADR-0106 `:83-90`).
  - The roadmap already requires run, batch and source identity plus per-record lineage (`roadmap.md:4363`).

  q01-r5 K6 recommends "one boundary per family, all set to the same instant in v1". Anything beyond that is overengineering for v1.

- **Severity:** medium. **Likelihood:** medium.
- **Evidence.** As cited.
- **Effect on the answer:** no_change (it clarifies refinement 4).
- **Best permanent fix.** Persist a Switch grouping record with one Source-Family Boundary per in-scope family (all equal in v1), plus the run, manifest and source-binding records. Build nothing else for Option B.
- **Requirement text.** "v1 persists a Switch record grouping one Source-Family Boundary per in-scope family, all equal in v1, together with run, Source Snapshot Manifest and source-binding identities. v1 builds no other Option B capability: no per-family scheduling, no partial live writing, no refresh import. Adding Option B requires its own founder decision. Acceptance: the schema can represent two families with different boundary instants without migration, and v1 validation rejects unequal instants."
- **Bucket:** spec_requirement.

### v4-16 — The lineage carrier stays writable by staff, and #2295 does not change that (correction to decision-log D9/O7)

- **What could go wrong.** Refinement (4) depends on trustworthy per-record lineage, and v4-12 relies on bindings to resolve catch-up facts. The ratified carrier for CRM/Party source bindings is `crm_record_links` (D9, resolved). It is still:
  - **Twenty-shaped.** `twenty_object_name TEXT NOT NULL`, `twenty_record_id TEXT NOT NULL`, free-text `asym_entity_id`, a `confidence` column (`20260508000413_crm_identity_mapping.sql:73-90`). The provider CHECK was dropped at retirement (`20260818010000:21-22`).
  - **Insertable and updatable by any staff member of the tenant.** It has `GRANT SELECT, INSERT, UPDATE … TO authenticated`, with `INSERT`/`UPDATE` policies on `authz.has_staff_membership(tenant_id, NULL)` (`20260508000413:204`, `:219-240`). These were retargeted, not removed, by `20261024163000:40-41`.

  Decision-log D9 and O7 say #2295 "revokes direct access". The #2295 body (repo-published, 2026-11-01) does something else. It rewrites the `authenticated` policies on the CRM tables, `crm_record_links` included, to the pure-tenant form `tenant_id = (SELECT authz.current_tenant_id())` and removes `is_super_admin()`. Its acceptance tests only cross-tenant denial ("an INSERT/UPDATE to B fails"). It revokes no same-tenant `INSERT`/`UPDATE`. Under its OQ4 default, a table goes "pure-tenant" (no staff-role predicate at all) unless the census finds a non-staff direct reader. So same-tenant write exposure remains, and could even widen to any tenant-scoped authenticated principal (inferred from the issue text).

  Any staff session could therefore forge or redirect a binding. A later catch-up would then attach money to the wrong Party with apparent provenance.

- **Why it matters.** Provenance that anyone can edit is not provenance. This matters for data integrity (v4-12) and for financial audit. Lineage is also spread across several places with no single index: per-table `external_ref` (P13, P14), the P16 classifier provenance, staging records, and `crm_record_links`.
- **Severity:** high. **Likelihood:** medium.
- **Evidence.** As cited (repo-integrated and repo-published).
- **Effect on the answer:** no_change to Option A. The decision log should be corrected, and the Phase 30 spec must not assume #2295 settles this.
- **Best permanent fix.**
  - The Phase 30 spec names one append-only source-binding index. It is written only by the commit path or an owner command, with the actor and run recorded.
  - Owner tables keep their own source-qualified references (v4-06).
  - A dedicated ticket, separate from #2295, revokes `authenticated` `INSERT`/`UPDATE` on any table used as lineage before bindings are trusted. This follows the generalization-after-census path D9 already requires.
- **Requirement / acceptance text.** "Source bindings used for lineage, replay or catch-up resolution are append-only. They are written only by the Phase 30 commit path or an owner command, with actor and run recorded, and no authenticated role can insert or update them. Acceptance (real database): an authenticated staff session in the same tenant cannot INSERT or UPDATE a binding row; a binding correction appends a superseding row with actor and reason."
- **Bucket:** spec_requirement. Correct D9/O7 in the decision log at the next update.

### v4-17 — The catch-up can harden into a standing, manually run sync

- **What could go wrong.** Each catch-up is meant to be a "bounded reviewed backfill". But the tail can last a long time:
  - PayPal Standard subscriptions run up to `srt` = 52 cycles, about 4.3 years at monthly (vendor-served code, inferred; r1 and r2 verifiers).
  - SiteStacker's scheduler runs until each donor confirms or reauthorizes in Asym under Phase 16.
  - Dispute and return windows add months: ACH about 60 days, cards about 120 days (q01-r5 S9, citing Stripe; not re-verified here).

  Monthly manual exports, reviews and commits then continue for years. That is a money feed with no owner, run from tribal knowledge.

- **Why it matters.** The roadmap forbids "permanent dual writers" (`roadmap.md:4395`). "Recurring intake of one operational source artifact … is owned by that source domain, not by this general migration workbench" (`owner-constraints.md:424-426`). The q01-r4 verifier confirms the conflict arises exactly when the catch-up becomes a repeating feed.
- **Severity:** medium. **Likelihood:** high.
- **Evidence.** As cited.
- **Effect on the answer:** narrows.
- **Best permanent fix.**
  - Set a closure date at go-live: the later of the last legacy-executor stop proof plus the dispute and return window, and a founder-set maximum.
  - Each run is a new reviewed plan.
  - At closure, any remaining legacy executor must either be stopped or move to a Phase 13/16 owner-domain evidence feed. Phase 30 runs no further catch-ups after closure.
- **Requirement text.** "Each Switch records a tail closure date at go-live. Every catch-up is a separate reviewed bounded plan. After closure, Phase 30 runs no further catch-up for that Switch; any legacy executor still charging moves to a Phase 13/16 owner-domain evidence path or is stopped. Acceptance: a catch-up plan for a Switch past its closure date cannot be committed."
- **Bucket:** spec_requirement. A monitor is attached:
  - **Signal:** days since the boundary with the tail still open, and the catch-up run count per Switch.
  - **Threshold:** the closure date passes, or more than a founder-set number of runs (suggested: 6) is reached, with any legacy executor not yet proved stopped.
  - **Owner:** the Phase 30 product owner, with ministry finance.
  - **Response:** escalate to the founder to set a donor confirmation or stop deadline, or to reclassify the remainder as an owner-domain feed.

### v4-18 — Phase 28 machinery tickets could fix run and plan identity before Phase 30 does

- **What could go wrong.** #2347 (OPEN, Ready) puts plan storage in Phase 28 tables with no per-profile bounds. #2087 (OPEN, Ready, blocked only by #2347) adds a package (decision-log D12, from r10-gap-g1). Option A's refinement (4) needs switch-level identities shared across profiles: run, Source Snapshot Manifest, source binding. If #2347 merges first, those identities either fork into a second engine or have to be unwound. That is the duplicated logic the shared engine (C4, C5) is meant to avoid.
- **Why it matters.** Option A raises the stakes of D12. The switch-level records are the backbone of the whole lifecycle (q01-r5 §3).
- **Severity:** medium. **Likelihood:** medium. It depends on merge timing; both tickets are Ready.
- **Evidence.** `gh issue view 2347/2087` (2026-11-01: OPEN, labels include Ready); decision-log D12 and §6.
- **Effect on the answer:** no_change.
- **Best permanent fix.** The founder acts on F17 (hold or amend) before #2347 merges. This is already flagged in decision-log §6; this review adds only that refinement (4) depends on it.
- **Monitor.**
  - **Signal:** a pull request linked to #2347 or #2087 enters review, or either issue closes.
  - **Threshold:** any such event before the Phase 30 spec settles run and plan ownership.
  - **Owner:** the founder, or the Phase 30 product owner acting under founder authority.
  - **Response:** apply the F17 decision (hold, or amend to shared Phase 30 records with per-profile bounds) before merge.
- **Bucket:** monitor.

## 6. Corrections to prior research and the working record

| #      | Where                          | Claim                                                                          | Correction                                                                                                                                                                                                                                                                                     | Label                                                     |
| ------ | ------------------------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| K-v4-1 | decision-log D9, O7            | #2295 "revokes direct access" to `crm_record_links` / `crm_merge_candidates`.  | #2295 rewrites the `authenticated` policies to the pure-tenant predicate and removes `is_super_admin()`. Its acceptance tests cross-tenant denial only. Same-tenant `INSERT`/`UPDATE` stays granted (`20260508000413:204`; `20261024163000:40-41`). A separate revoke is still needed (v4-16). | repo-published (issue body); repo-integrated (migrations) |
| K-v4-2 | q01-r4 §2 H1                   | The `cus_` hazard is described as the Billing Portal.                          | It is also a **checkout** hazard: `saga.ts:207-210` reuses the stored customer for new PaymentIntents, and the completion RPC keeps the first value forever (`20260223170000:1255`). The column is editable in Mission Control at the field-policy ceiling (`20261005050728:500`).             | repo-integrated                                           |
| K-v4-3 | q01-r2 / r4 / r5 (catch-up)    | The catch-up's money owner is treated as missing only because D.6 is pre-Asym. | A second gap: P13's reference key (story 169, `:534-536`; `:528-531`) and #711's acceptance require connected-account, livemode and binding provenance that non-Stripe and SiteStacker-native history cannot supply (v4-06).                                                                   | repo-ratified / repo-published; inferred conflict         |
| K-v4-4 | All tracks (child sponsorship) | Sponsorship is treated as an exclusion of records and money.                   | It is also a potential **permanent residual live writer** for overlapping supporters, which Option A must gate or declare (v4-02).                                                                                                                                                             | inferred; prevalence unverified                           |
| K-v4-5 | Founder's Option A summary     | "Reconcile counts and per-currency totals".                                    | The roadmap requires Legal Entity × original currency × source basis (`roadmap.md:4369`), and the totals must tie to independent controls (v4-10).                                                                                                                                             | repo-published                                            |

## 7. Proposed amended Q1 wording (for the founder; not decided)

> **Q1 — Option A, one planned switch per ministry (v1).** Practice runs change nothing. The ministry declares a freeze, and Asym records an exact Switch Boundary. One final Source Snapshot Manifest is imported through owner commands. Reconciliation is a conservation proof per Legal Entity × original currency × source basis × legacy merchant account against independent controls. From the boundary, Asym is the system of record for supporter identity, contact data, consent, relationships, custom data and staff work.
>
> Legacy recurring arrangements stay with their existing executor, external and read-only, until each is formally cut over under Phase 16. The original processor stays authoritative for the charges it executed. Their money and executor facts arrive through a bounded, reviewed, outward-effect-dark catch-up of append-only facts that never creates or changes supporter data. Each catch-up cohort has exactly one declared receipting system, and the tail has a closure date.
>
> A Legacy Outward Surface Register replaces the "automations off" attestation. A Switch can be scheduled only when no residual SiteStacker module will keep writing people, consent or money for the migrated population, unless the founder approves a Residual External System declaration.
>
> Exact repeat import means replaying the same manifest with no new effect. Later snapshots are new plans with three-way review, never source-wins.
>
> v1 stores one boundary per source family (all equal), with run, manifest and source-binding identities, so Option B stays possible without building it.
>
> The Phase 13 "separate migration workstream" clauses (`:743-746`, `:2192-2199`), `owner-constraints.md:370-371` and P14 `:1866` are edited to match before the Phase 30 spec is published.

## 8. What could not be verified

- **Real SiteStacker export columns, ID formats and timestamp zones** (no artifact exists; C23, r10-gap-g3). This affects how likely the collisions in v4-06(b) are and how the v4-11 fingerprints should be designed.
- **How common child sponsorship, and other modules that stay live, are among target ministries** (v4-02).
- **Whether any Mission Control UI exposes `donors.stripe_customer_id` for editing.** Only the field-policy ceiling was checked (v4-07).
- **Whether #2295's OQ4 census will leave `crm_record_links` staff-predicated or pure-tenant** (v4-16).
- **Vendor timing figures relied on second-hand:** ACH and card dispute windows (q01-r5 S9) and the PayPal `srt` interpretation (vendor-served code; the r1 and r2 verifiers). Not re-fetched here.
- **SiteStacker processor-side behaviour** (scheduler executor, gateway-native schedules). Server code is not public; the verifiers rate it inferred or unverifiable.
- **One vendor claim re-verified in this review:** Stripe self-serve copy, "Copied customers have the same customer ID as in the original account", "You can't copy deleted customers", and "The recipient account must be an activated account" (https://docs.stripe.com/get-started/data-migrations/pan-copy-self-serve?copy-method=full, accessed 2026-11-01; verified-vendor-doc).

**Status:** COMPLETE (2026-11-01). The only file written is this one.
