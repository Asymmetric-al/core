# Q6 r1 — Repository evidence for rehearsal mode (F4)

Read-only, 2026-11-02. Baseline `develop` `629cb71dc`; Phase 29 at PR #2430 head `1483a349`. Read #660, #2084, #2087 and #2352 on GitHub, and the official Inngest limits through the docs MCP. Labels follow `document-authority.md:42-58`; "derived" means my inference.

The citations in `r10-gap-g4.md` §6 hold; this extends it. Correction to the brief: #2352 still shows a placeholder cap (fixture N=2). The value 1 comes from #2087's "Pins addendum (Chad for Blake, 2026-10-25)".

## 1. Validation without writing

| Owner                           | What exists                                                                                                                                                                                                                                                                                                                             | Validate-only or dry-run?                                                                                | Label                                                       |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| P4 / P9 Party                   | Merge rules (ADR-0216). D17 consumes "the qualified P9/P4 admission command" (`owner-constraints.md:336-338`).                                                                                                                                                                                                                          | No. Commit only.                                                                                         | ratified; not implemented                                   |
| P11 custom data                 | Import Template Descriptor plus "a bulk validated write API through the **same** write-path" (P11 PRD `:181`). #660 item 2: each row runs "`importParse` → Zod → policy gate"; "Phase 30 builds parsing, mapping UI … staging".                                                                                                         | No named no-write entry. The parse, Zod and policy steps are pure and could serve one (derived).         | ratified PRD, published ticket; not implemented (#645 open) |
| P13 D.6 gifts                   | Imported gifts are "pre-advanced": already-succeeded, posting eligible, review bypassed unless the match is ambiguous (`phase-13…md:1023-1039`).                                                                                                                                                                                        | No.                                                                                                      | ratified                                                    |
| P14 credits                     | Import identity substrate. "Imports fire NOTHING." Tributes "arrive stream STOPPED" (`phase-14…md:1860-1869`).                                                                                                                                                                                                                          | No.                                                                                                      | ratified                                                    |
| P16 classifier                  | Each field is classified proved, hint or unknown. Step 4 writes an import-review record. Step 9: "shadow folds and human review must reconcile before any operational enablement" (`phase-16…md:2581-2593`).                                                                                                                            | Partly. Classification is proof-only, but step 9's shadow governs **activation**, not import validation. | published PRD                                               |
| P6 / P9 consent and suppression | No import command text. P6 lists "import" only as an association type (`phase-06…event-model.md:143`).                                                                                                                                                                                                                                  | No.                                                                                                      | none                                                        |
| P21 D17 openings                | "private, chunked, resumable, non-authoritative staging and production-shaped shadow reconciliation" (ADR-0106 `:83-84`). "Before the authority fence, staging may be replaced or discarded" (`:98`). Phase 21 owns "mapping admissibility" over Phase 30 staging (`owner-constraints.md:395-402`).                                     | **Yes, for its own scope.** Owner-side validation runs over discardable staging.                         | ratified                                                    |
| P23 CMS                         | P23 owns the "import-plan validator" (ADR-0173 `:39-46`). Clause 17 (`:172-180`): "A real semantic no-write check is mandatory … without invoking any target mutation command. Payload preview, sample rows, client validation, or **a transaction that is intentionally rolled back is not this contract**." Clause 19 seals the plan. | **Yes.**                                                                                                 | ratified                                                    |

**What the plan rules require of owners.**

- `roadmap.md:4349` (published) requires a plan of "records to create, update, skip or queue for merge, dependencies, warnings and expected totals", bound to "target revisions" and re-proved at commit.
- `owner-constraints.md:364-365` (ratified, retained) requires "exactly what would be created/updated/skipped/merged, per-row detail, before anything commits".
- `roadmap.md:4377` says "Target services own validation and business acceptance."

Together these need, per owner, a no-write evaluation and a target-revision read (derived). Only P23 and P21 define one; P11 comes close.

**Owner shadow precedents:** ADR-0106; the P16 shadow folds; ADR-0173 clauses 17 and 19; Phase 21 D27, "Synthetic, sandbox, and production-shadow evidence stay distinct; the complete-cohort production shadow is non-authoritative and side-effect-dark" (`roadmap.md:2546-2547`). All are in-tenant and discardable before the authority fence. None commits in a second tenant.

## 2. Cross-file dependencies

- **No owner text defines a "planned identity" or a staged reference.** A grep for planned, staged or provisional Party, forward reference and similar terms found nothing in the PRDs, ADRs or CONTEXT.
- **The only precedent is for content.** ADR-0173 clause 17 checks "relationship/link closure" without writing. Clause 23 (`:229-235`) runs two passes inside one sealed plan: "pass two connects relationships and internal links only after targets exist" (ratified).
- **Phase 30 text gives only ordering.** The plan shows "dependencies" (`roadmap.md:4349`), in "the correct owner-defined order" (`:4367`) (published).
- **Ratified Phase 30 decisions give a natural key.** "Records link by the old system's IDs" (Q3 clause 3), and convergence runs on Source Record Bindings (Q1 clause 5). A gift row can therefore reference a Party through its binding key before the Party exists (derived). Money owners would have to accept a reference resolved from a binding at commit. O16 (source-qualified money import identity) is the related owner requirement (proposed).
- **Consequence under plan-only (derived).** A gift or relationship plan can resolve its Parties only after they commit. Under Q1 clause 4's order, those plans are built and reviewed **during the editing pause**. The Q1 review recorded this hazard as v2-L6 (`q01-adversarial-review.md:1086-1093`, proposed). Its fix: "Reviewer decisions taken during practice runs … are saved without writing targets and are proposed again on the final plan."

## 3. Tenant lifecycle

- **Provisioning is outside the program.** "Tenant self-signup/provisioning … are adjacent platform-business work, not silently included here" (`roadmap.md:161`, published).
- **In code** (implemented):
  - Tenants are created only by `supabase/seed.sql:40-51` (which runs `DELETE FROM public.tenants`, then inserts), `scripts/cms/seed-local.mjs:212` and test fixtures.
  - `scripts/seed-demo.sh:6` defaults to a hosted project ref.
  - The `tenants` table (`supabase/schema.sql:13-27`) has no status, test, sandbox or lifecycle column.
- **Disposal.**
  - No tenant-delete command exists. The foreign-key graph is mixed: some tables cascade, others are NO ACTION. "Tenant delete … is not an offboarding shortcut" (`missionary-workspace-depth/grill/d3-evidence/current-runtime.md:33`).
  - Phase 24 reviews defer to "the platform's separately approved lifecycle" (`phase-24-d31…:777-779`; `d37 AC108 :1053`, both proposed), and that lifecycle does not exist.
  - Offboarding means only the Phase 21 D26 records export (`roadmap.md:2527`; `owner-constraints.md:449-454`).
- **No tenant-wide dark mode.** Darkness exists only per Site and per record:
  - A new Site starts as "private setup" with no host, provider or money effect (P24 US1 `:79`).
  - Imports are outward-effect-dark (`roadmap.md:4365`; batch-origin suppression `owner-constraints.md:386-388`), but no suppression seam exists in code (decision-log §8).
- **Code facts that block a click-through rehearsal tenant** (implemented):
  - `sendEmail` (`packages/email/resend/send.ts:211`) has no tenant gate.
  - `resolveTenantStripe` falls back to the platform's environment key (`packages/api/src/stripe/tenant-client.ts:64-66`). The Q1 review flagged that "a rehearsal or migrated tenant" would settle on Asym's account (v6-17, `q01-adversarial-review.md:360-368`).
  - Staff can invite legacy donors to log in (P4 story 18, `:92`).
- **Test and canary tenants** are Asym's own synthetic release gates: "test tenants/canaries exercise full flows" (P16 `:2566`, `:917`, published PRD); "synthetic non-production Tenants" (P24 `d40:1202`, proposed).
- **Evidence-class Avoid terms:** "sandbox success as production proof" (`CONTEXT.md:5075`); "test-mode evidence never qualifies a live Site" (P2 `:436`); "sandbox success never equals certification" (ADR-0153 `:31-34`).
- **Environments.** Preview data policy: "never use production data" (`docs/ops/environments.md:41`); Development holds demo data (`:17`). Non-production never holds real exports (Q2 clause 6, ratified). Tenant public roles are production-only (P2 `:302-304`). So option C's tenant must sit **in the Approved production environment** (derived).
- **Definition gap.** A Tenant is "a missions sending organization … with its own data" (`CONTEXT.md:33-41`). A rehearsal copy is not one.

## 4. Measuring commit duration

- **Nothing measures owner commit time without committing.** No throughput figure exists anywhere in the repo.
- **#2087 pins addendum** (published ticket ruling, Phase 28 D17 only; not founder or Phase 30 policy, per D12): `IMPORT_TENANT_CONCURRENCY = 1`; `IMPORT_PERF_ENVELOPE` "measured and published by the factory before activation". #2352 B3 measures memory, CPU, wall time, cancellation and other-tenant latency on **synthetic worst-case distributions**. AC28-R25-05 (`relationships.md:487`): "profile limits alone are not presented as demonstrated capacity".
- **#2084 (ruled OQ3):** 50 rows per **client-driven** step with a 60-second lease. These are "not SLOs". A background worker is a non-goal.
- **ADR-0173:** no "fabricated percentages or time promises" (clause 27). Size, step, concurrency and time budgets "fail before commit" (clause 30).
- **Q2 clause 3(i)** (ratified): the ministry admin measures export durations locally, so the **export** leg of the pause is measurable without any real data in Asym.
- **Phase 21 D17:** staging is "chunked resumable" (P21 US103 `:220`), with no sizes.
- **Derived.** A and B can time the export, parse, plan, staging and reconciliation legs; the commit leg is only estimable as row counts × a factory-measured owner envelope. C times commits directly, but on an empty tenant, not "actual retained state" (`roadmap.md:4403`). If a cap of 1 carries into Phase 30, family commits serialize and the pause is their sum.

## 5. Recovery exercise

- **Rules.** Undo is time-boxed and blocked once downstream coverage exists (`owner-constraints.md:378-385`); no universal undo (`roadmap.md:4395`); reversal must not delete a Party, erase staff edits or rewind finance (`:4371`); recover after a closed browser (`:4387`); acceptance covers "partial failure, interrupted batch" (`:4401`). "Publish target-specific reversal and reconciliation procedures before tenant use" (`:4403`): **no owner has published one** for Party, consent or money targets.
- **Q1 clause 10:** abort before go-live leaves "committed rows … invisible". No owner defines an invisible committed state. The Q1 review asks for "a tenant-level invisible-until-live gate" (`:947`, proposed).
- **Content only:** ADR-0173 clauses 27-29 — **Cancel import** before writes, **Stop after the current safe batch** after, and **Prepare reversal** as a checked plan.
- **Without a real commit (derived):**
  - B can exercise interruption and resume of Phase 30 staging jobs.
  - Commit-path recovery (lease loss, lost acknowledgement, resume; #2084 A6 pattern) and reversal need real commits. Those can come from Asym's real-database qualification on synthetic data (`:4401`), from the live switch, or from C.
- **Whether rehearsal-tenant evidence satisfies Q2's "recovery exercised" is unruled.** The Avoid terms in §3 and P21 D27's distinct evidence classes point against it.
- **Phase 29 caution:** "a database backup cannot create a false assurance of recovery" (US29-D15, `phase-29…md:621`, at the PR head).

## 6. Previews

- **No owner text** describes rendering a staged record as it will appear ("what this donor will look like").
- **What exists:** "Keep preview and commit separate" (`roadmap.md:4387`); "Preview writes no contact facts" and a stale preview "cannot authorize different effects" (REQ28-R20 `relationships.md:380`, AC28-R20-02); ADR-0173's "Live impact: None — private drafts only" (clause 12) and "Nothing was published" (clause 31).
- **Restrictions:** the Phase 3/10 floor applies before any "preview" (`phase-10…md:386-388`, in the P21 D17 amendment); uncleared viewers see restricted people only by alias (Q5 clause 4); file previews create no CRM copy or retention purpose (AC29-D07-08). Phase 24 named the risk of "a private Site being mistaken for live" and required "Persistent private status" (`phase-24…decision-log.md:540-542`). Real app screens over a C tenant carry the same risk (derived).

## 7. Custody of a second tenant

- **A second tenant creates separate governed copies** (published, unmerged PR). Phase 29 identity binds Tenant and environment (`custody-and-integration.md:13`; Q63-C04 `records-policies.md:117`); each copy keeps its class obligations, backups included (AC29-D12-05 `:182`); disposal runs "across originals, versions, renditions, staging, indexes, provider copies, and applicable backups" (`founder-brief.txt:299`; AC29-D13-05 `:196`). Phase 29 covers **bytes**; a rehearsal tenant's committed rows have no disposal contract (§3).
- **Duplicate copies.** "No second file store or invented retention period" (`owner-constraints.md:170`, D17 scope); ADR-IM-002 `:15` rejected "an ungoverned second file store". **No text forbids a governed second copy**, but Q2 clause 5 applies to it: (a) agreement covers "retention including backups, deletion"; (d) custody qualified "in that environment"; (e) restricted by default.
- **Classification setup is per tenant.** Phase 10 classification is tenant-sovereign: the `country_risk` table is tenant-owned (A2), and the alias is enforced per Party (A3, `phase-10…md:96-97`). A rehearsal tenant would need identical classification set up before any data lands (derived).
- **Repeated runs multiply copies.** "Repeated practice runs multiply stored copies" (`q01-adversarial-review.md:264`, proposed). This applies to B's staging too.

## 8. Job capacity at scale (example: 50k Parties, 500k gifts)

- **Implemented.** Inngest 4.25.0 (`packages/api/package.json:204`); seven functions, none for imports (`workflows/serve.ts:21-32`); tenant-keyed concurrency limits of 1-5 (e.g. `donation-saga-recovery.ts:27-30`).
- **Inngest limits** (official `usage-limits/inngest.mdx`): 1,000 steps per function; 4 MB per step return; 32 MB run state; step timeout up to 2 hours, host-dependent.
- **Published guidance.** Consume manifests "in bounded chunks"; workers yield and record "another durable continuation"; fairness is "best-effort, so load certification remains required" (`workflow-studio/03-runtime-and-recovery.md:79-83`). Step state holds identifiers only (ADR-0173 clause 26).
- **Authority.** Background jobs cannot yet carry a staff actor's authority, and the service-role allowlist is frozen (decision-log §8). Deferred jobs re-prove authority (C16).
- **Arithmetic (derived).**
  - 550k rows at 50 rows per step is 11,000 steps. Under the 1,000-step limit that needs at least 11 chained function runs.
  - B writes every row at least twice (staging, then final commit) for each practice run.
  - C writes every row at least three times (staging, rehearsal commit, real commit), plus a tenant disposal.
- **No scale profile exists.** No staff-migration size profile exists (F11 open), and "unknown limits block a profile" (C11). SiteStacker's long exports error out (decision-log §9).

## Gaps and conflicts

1. **C collides with ratified Q1 clause 3** ("no target-owner write"): owner commits in a second tenant are target-owner writes, and Q2 clause 2 qualifies pilots through those practice runs. C needs a Q1 amendment or a different framing.
2. **No CRM or money owner offers a no-write validation entry**; all options need one.
3. **No planned-identity or staged-reference contract** exists for gifts, relationships or custom data.
4. **No tenant provisioning, disposal, tenant-wide dark mode or configuration clone.** The Stripe fallback and ungated email seam are live code.
5. **Evidence-class Avoid terms conflict with using C** as Q2's "recovery exercised" or reconciliation proof.
6. **Q2 clause 5(b) says "its own Asym Tenant"** (singular); a second tenant fed by the same installation is unaddressed (Q1 clause 1).
7. **C rehearses on an empty tenant,** not "actual retained state" (`roadmap.md:4403`).
8. **Staged-content custody is unsettled (D11, O19)**, and B maximizes staged volume.
9. **The cap of 1 is a Phase 28 ticket ruling**, not Phase 30 policy (D12).
10. **Target reversal procedures are unpublished;** "invisible committed rows" is undefined.
11. **No rule routes erasure, suppression or do-not-contact facts** arriving during rehearsal to a rehearsal copy (compare Q1 clause 12).

## What each option would require from owners

| Option                                                    | Requirements (all proposed; none agreed)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — plan only, per file**                               | Per-owner no-write validation plus a target-revision read (P4/P9 Party and consent, P11 via #660, P13, P14, P16). A Phase 4 match-evidence read (O6). Optionally, carried reviewer decisions (v2-L6). Measures only the export, parse and plan legs; recovery is proved only in Asym qualification or the live switch.                                                                                                                                                                                                                                                                                                                                                                                            |
| **B — full-sequence staged rehearsal in the real tenant** | Everything in A, plus: owners validate rows whose Party is a **binding-key reference** to a staged row and re-resolve it at commit (P13/P14/P16 with O16; P9 relationships; P11 collection parent keys). P29 and the Phase 30 spec settle staging custody, retention and disposal at full scale (D11, O19). Reconciliation totals computed from staging. Discard before commit (ADR-0106 `:98` pattern).                                                                                                                                                                                                                                                                                                          |
| **C — B plus a disposable rehearsal tenant**              | Everything in B, plus: the founder pulls tenant provisioning into scope (`roadmap.md:161`). A rehearsal-tenant class with a tenant-wide dark gate across P6 sends, P13 checkout and the Stripe fallback (fail closed), P4 invitations and claims, P24 Sites and domains, P31 webhooks, P34 automations and Inngest functions. P12 memberships and a separate O26 grant per rehearsal tenant (Q5 clause 6 forbids Asym membership). Tenant configuration copy (Legal Entities, P11 catalog, P10 classification, settlement bindings). Tenant disposal across database rows, P29 copies and backups, with proof. Q2 agreement coverage. Amendments to Q1 clause 3 and Q2 clause 5(b), and an evidence-class ruling. |
