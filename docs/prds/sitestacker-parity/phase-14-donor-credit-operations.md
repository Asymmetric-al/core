# Phase 14 — Donor Credit Operations: Soft Credits, DAFs, Tributes & Matching Gifts

## Status

Groomed via `grill-with-docs` (2026-07-10). All five decision families **D1–D5** ratified, plus the five consolidated close-out items (member contactability; donor-facing recognition v1; household display rule; standing-rules auto-apply + the superseded church-member acknowledgment stream; the formal P27-ranking defer). Pressure-tested by **three ruthless adversarial review fleets** (two of them 17-category — the D1 and D4 passes — plus the D3 adversarial pass: D1 spine `wf_8173b0a3-b3b`, D3 tribute `wf_d2a57022-c30`, D4 matching `wf_ac3d918a-9f6` — 14 hardening amendments each) and **two focused design passes** (D2 entry-UX fleet `wf_12c9023f-c40`; D5 supporter-roster pass `wf_7e3f6fa5-88d`), on top of an 11-agent repo + external research fleet (`wf_4b707877-a88`: CiviCRM, IRS Pub 1771 / Notice 2017-73, Salesforce NPSP & Nonprofit Cloud, Blackbaud RE NXT, Virtuous, Double the Donation/HEPdata). PRD authored from the decision log. Program posture: **groomed-not-built** — a design against not-yet-built Phase 7/9/13 contracts; no live/shipped claims. Tracked by **epic #719 + children #720–#741** (minted 2026-07-10 via `/to-tickets`; every child `status:blocked` on the predecessor spine — dispatch is a separate founder decision). Repo anchors are **evidence as of authoring**, never brittle build instructions.

**Slug:** `donor-credit-ops` · **Roadmap position:** Phase 14 of 41 (roadmap v2) · **Status:** PRD (design ratified 2026-07-10 via grill-with-docs — D1–D5 + close-outs 1–5. Highest-signal rulings, preserved verbatim from the record: the founder **reversed** the recommended letter-review queue into **entry-gated auto-send** for DAF advisor thank-yous (D2 — the identity decision at entry IS the review); the D4 ratification carries a **binding "don't over-engineer" rider** — v1 ships the leanest compliant shape of every amendment and the reviewers' cuts stand (6 states not 8, no ratio column, no archive table until a non-staff producer, worklists not per-row tasks, no proposal queues); and D5 **dropped member thank-you letters entirely** (not even a tenant toggle) in favor of the supporter-roster requirement. READY). Tracked by epic #719 + children #720–#741.

> **Program:** SiteStacker Parity · **Base:** `develop` · **Charter / matrix:** `docs/prds/sitestacker-parity/README.md`, `parity-matrix.md`, `roadmap.md`
> **Hard dependencies:** Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) — the header/lines/postings ledger every credit row keys to; Phase 7 (Receipt & Statement Compliance Rules + Donor Identity/Credit Model) — the legal receipt/statement wall and immutable official facts this phase must not contaminate; Phase 9 (Full CRM Depth & Relationship Graph) — the party spine, Giving tab, and merge machinery. Phase 14's credit core can land first. **Communication activation additionally hard-depends on** Phase 17 (governed content), Phase 18 (canonical print/PDF artifacts), and Phase 6 (consent, dispatch, and history); no email or print-letter purpose activates until all three owner paths prove the typed facts contract.
> **Downstream consumers (named seams, not builds):** Phase 15 (Offline Gift & Batch Entry — remittance batch-grid + per-row match-capture cell contracts), Phase 16 (Pledges & Recurring Commitments), Phase 19 (Year-End Statement Operations), Phase 25 (Donor Dashboard Depth), Phase 27 (Donor Development & Portfolio Management), Phase 28 (Missionary Workspace Depth & Support-Raising CRM), Phase 30 (Imports & Migration Tools), Phase 31 (Platform API, Webhooks & Connector Framework — matching-vendor rungs 3/4), Phase 33 (Reporting & BI / Report Studio), Phase 36 (Peer-to-Peer & Advocacy Campaigns — reserved `peer_fundraiser` role).
> **Fresh-build posture:** the product has **no users** (founder ruling 2026-07-06) — no migration ceremony, no compatibility shims; every table ships correct-from-start, and the D1.14 cross-PRD amendment package renames predecessor vocabulary freely because nothing it names is built.
> **Production gate:** the receipt/acknowledgment/notification/statement surfaces this phase feeds are tax-adjacent and require review by **qualified finance/tax counsel** before production use (this document is not legal or tax advice) — see Counsel Review for the enumerated items (DAF advisor letter language, tribute aggregate totals, matching-gift receipt posture, church-remittance receipting).

> **Binding Phase 18 document amendment (2026-07-21).** Phase 14 owns
> DAF/matching/tribute/recognition meaning, eligible recipients, privacy, and the
> typed source facts for its acknowledgment/notification purposes. Phase 18 owns
> every generated-document definition, publication, request, render, exact PDF
> artifact, current head, access, and generated-document record. Phase 17 owns
> email/message presentation and delivery. Existing Statement/PDF Studio,
> DocRaptor, and Unlayer paths cited below are prototype evidence only and are
> removed by the Phase 18 D17 clean cut; they are not preserved as runtime or
> migration inputs. Historical language below is read through this ownership
> amendment.

> **Controlling Phase 19 statement-recognition amendment (2026-07-24).**
> Phase 14 owns the closed, versioned, donor-visible **Recognition Subject**
> projection; it never owns or alters Phase 7's legal-donor **Statement
> Subject**. Household membership, shared destinations, soft credit, DAF
> advisory status, and staff preference may not merge official documents or
> produce a household deductible total. Phase 19 may freeze the Phase 14
> projection only for the separately purposed
> `giving.summary.informational@1` **Support overview — Not a tax document**,
> default Off. Launch recognition is limited to source-authorized household
> support and sufficiently disclosed, unambiguous DAF recommendations. The
> overview has independent population, run, artifact, access, delivery,
> correction, and completion truth and cannot block or change an official
> statement. Older "one joint statement," "recognition section," "indirect
> section," and credit-keyed official-statement language below is superseded by
> this purpose-separated contract; Phase 14's gift-date, time-bounded
> recognition derivation and privacy walls remain controlling.

This is the phase where the platform learns that **the person who caused a gift and the person who legally gave it are usually different people** — and that a ministry lives or dies on honoring both correctly. Phase 7 (Receipt & Statement Compliance Rules + Donor Identity/Credit Model) defined the truth model: exactly one hard-credit legal donor owns the receipt; soft credit is recognition-only and structurally non-receiptable. Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) built the append-only ledger and explicitly left the credit table as "a Phase 14 seam." Phase 14 makes complicated donor-credit reality **operational** — the credit spine, DAF sponsor/advisor operations with an entry-gated automatic thank-you stream, tribute/memorial gifts with a second letter stream that never leaks an amount, the matching-gift expectancy lifecycle and the employer's separate legal gift, church remittance attribution flowing onto the missionary's supporter roster, household recognition derived at read, and standing rules for affiliated parties — across gift entry, Contribution Detail, the CRM Giving tab, reports, statements, acknowledgments, and dashboards.

---

## Problem Statement

Real gifts are rarely simple. The one-person-one-check-one-receipt gift is the degenerate case; the gifts that sustain a missions organization arrive wearing someone else's name:

1. **The DAF grant.** A $5,000 check arrives from Fidelity Charitable. The legal donor is Fidelity — the sponsor owns and controls the funds (IRS Notice 2017-73); the advisor already took their deduction. The human behind the gift is the Miller family, who recommended it. A CRM without credit machinery does one of two wrong things: it receipts the Millers (a **wrong tax document** — double-deduction exposure, §4967 excise risk if any benefit attaches), or it records "Fidelity Charitable" and the Millers silently vanish — unthanked, absent from their own giving history, invisible to the missionary they have supported for a decade.

2. **The church check covering twenty members.** First Baptist remits one monthly check collected from twenty families. The church is the legal donor and gets the receipt — easy. But the twenty families are the actual supporter relationships, and without member attribution the missionary's donor list shows one row named "First Baptist Church." This is the **documented pain of the entire missionary-CRM ecosystem**: TntConnect's official help (tntware.com `gifts_dealingwith.aspx`) instructs users to enter **negative gifts** — fake offsetting transactions — to hack member attribution into a donor-of-record data model. When the sector's flagship tool teaches its users to falsify the ledger to represent reality, the data model is wrong.

3. **The employer match.** Emily gives $100; months later Microsoft — or the GE Foundation, or Benevity administering the program — sends $100 more. **Two separate legal gifts** (the employer deducts the match; Emily deducts nothing extra), yet staff need to see Emily as a $200 supporter and development needs the promised-not-yet-received match as a trackable expectancy. Wrong one way: double-counted revenue. Wrong the other: matched money vanishes from Emily's story and the match pipeline is invisible — or counted as money before any check arrives (phantom revenue). NPSP's tracker documents a third mode: duplicate soft credits from colliding generators (NPSP #5796).

4. **The memorial gift.** Gifts arrive "in memory of Ruth." Her family wants to know **who** gave — names and addresses, so they can send their own thanks — and must **never** be told how much each gave (the documented sector norm: LGL, Hospice NW, UMaine all render names without amounts). The failure modes are brutal because the moment is tender: the family never told anyone gave; per-gift amounts leaked into a condolence letter; a letter mailed to a family member who has since died; an anonymous donor named to the family on the phone.

When a CRM gets credit wrong, the damage lands in four places. **Wrong receipts** — a tax document to someone who did not legally give (the DAF advisor, the church member, the soft-credited spouse) cannot be walked back after filing season. **Double counts** — recognition summed into money; CiviCRM's own docs warn its combined hard-plus-soft "Both" report double-counts, and its community lists conflating third-party _payers_ with recognition credits as a documented regret. **Unthanked humans** — the advisor, the member, the grieving family: relationally the most expensive failure, because thanking no one (or the wrong one) is how a ministry loses a supporter it never knew it had. **The hack economy** — negative gifts, memo conventions, spreadsheet sidecars: unaudited, unreportable, rotting.

Today the platform has **none of this machinery, and none of the debt**: the repo survey found zero product code for credits, tributes, matching, or DAF handling (verified at authoring — no matching tables in `supabase/`, no matching symbols in `packages/`; all six credit objects are net-new). Phase 7 designed the truth model on paper; Phase 13 ratified the ledger and pinned the seam. What is missing is the operational layer this PRD specifies — built once, on one spine, so gift entry, Contribution Detail, the Giving tab, statements, letter streams, and the missionary dashboard read one credit truth and none can contradict it.

## Solution

Five pillars, one substrate. Everything hangs off a single credit spine keyed to the Phase 13 ledger; the lifecycle features are separate objects that **generate** credit rows rather than each inventing its own attribution store. (Depth lives in Sections A–K; this is the shape.)

- **One credit spine [D1] — Sections A–C.** A single `contribution_credits` table keyed to the contribution header with optional line scope; a fixed TEXT+CHECK role vocabulary; **three amount classes** — `allocation` (bounded, sums ≤ scope), `recognition` (defaults to full scope; deliberately unbounded across parties — both-spouses-full is industry-legal), `annotation` (never in any sum). Recognition exposure is a **derivation** through one canonical fold keyed on the Phase 13 `effective_seq` cursor — credit rows are historical facts corrections never silently mutate. The reporting split is permanent: **Legal giving** (hard credit only) vs **Recognition giving**, never one mixed column — the CiviCRM "Both" trap is structurally impossible. Three named read models (`getPartyCreditActivity`, `getMatchingActivity`, `getSupporterRoster`) are the _sole_ consumer interfaces, so the Giving tab today and Phase 25/27/28/33/36 tomorrow can never compute credit differently.

- **DAF operations that thank the human [D2] — Section D.** Stronger than any surveyed vendor: gift entry **requires** an attribution answer — an identified household, "Not Provided," or "Anonymous" — and a confidently identified attribution **auto-sends** the non-receipt advisor thank-you. Fund-name memory with QBO/Xero-grade provenance chips makes the repeat grant a zero-keystroke confirm; a hold-then-send window, ambiguity holds, and an acknowledgment state machine make auto-send safe without reintroducing a queue; every "Not Provided" lands in a finite, owned **Attribution Inbox**. The sponsor still gets the compliance receipt per Phase 7 — delivery suppressed by default, because sponsors ask not to be mailed.

- **Tribute and memorial, done with care [D3] — Sections E–F.** A second letter stream structurally incapable of the classic blunders: setup-gated **automated digest letters** on an age-anchored cadence (weekly while the loss is fresh, monthly after, never stopping silently); an explicit coverage ledger guaranteeing a "Mom and Dad" watcher is told about each gift exactly once; per-gift amounts **structurally absent** from the notification purpose at both owning public seams (Phase 17 message and Phase 18 generated document); an opt-in aggregate total with a monotonic floor so a family never sees the memorial shrink; a first-class **mail channel** with governed print custody; restricted and anonymous donors rendered identically as "an anonymous friend." Phase 17 owns message authoring/delivery and Phase 18 owns the generated print document; Phase 14 supplies only the typed tribute facts and eligibility.

- **Matching gifts without phantom money [D4] — Section G.** The universal two-gift model, kept honest: `matching_gift_expectancies` (six states, staff-driven) whose rows are **never gifts and never in any money vocabulary**, joined to real employer contributions through `matching_gift_settlements` — a junction that survives batch checks and quarterly installments; the employee's recognition credit is generated only from **received** money; the match's legal donor is the **payer-of-record** (dated Phase 7 A11 amendment — GE Foundation and Benevity are real payers). Vendor posture is **rung 2, seam-only**: a versioned vendor-agnostic ingest event contract now, no Double-the-Donation contract this phase (DTD's 2025 HEPdata acquisition makes seam-don't-couple the only defensible posture); rungs 3/4 = Phase 31 (Platform API, Webhooks & Connector Framework).

- **Church remittances + the supporter-roster moat [D5] — Sections H, I, J, K.** When the church provides the member breakdown, it is recorded once — per-line allocation credits, the sole stored attribution truth — and **flows straight onto the missionary's supporter roster**: `getSupporterRoster` is the designation-centric dual of `getPartyCreditActivity`, computed from the same substrate with zero copies, so Mrs. Jones giving directly _and_ through First Baptist is one roster row with two labeled paths, arithmetic guaranteed identical to the staff view by acceptance fixture. This is a **genuine market moat**: the missionary-tool ecosystem (TntConnect/MPDX/DonorElf/Karani, fed by DonorHub) is structurally locked to donor-of-record grain — the member-level via-church view they cannot build costs this platform one read model, because CRM and missionary dashboard share one database. Around it: D2-grade entry guards for the twenty-member check (copy-last-remittance, CSV paste with staged preview), capped **standing rules** auto-applying with provenance chips (Section K), household recognition **derived at read** from Phase 9 time-bounded membership (Section I), and fail-closed member privacy — visible-not-contactable, and no member ever sees a via-church line on their own statement (Section J).

The result: every complicated gift is captured as it actually happened; every human behind a gift is thanked exactly once, in the right document class, with the right facts withheld; money and recognition totals can never contaminate each other; and the missionary's dashboard finally shows the twenty families behind the church check — perfectly aligned with the books, because it _is_ the books.

---

## Goals / Non-Goals

### Goals

- **Build the credit spine** — `contribution_credits` with the D1.1 identity key, D1.2 scope exclusivity, D1.3 amount classes, D1.5 mutability regime, D1.7 generation topology; all constraints in the first migration (Sections A–B, Data Model).
- **Make the two-vocabulary split permanent** — Legal vs Recognition, the D1.4 canonical recognition fold on the Phase 13 `effective_seq` cursor, the CI non-money grep gate, and `getPartyCreditActivity` / `getMatchingActivity` / `getSupporterRoster` as sole consumer interfaces (Section C).
- **Ship DAF operations** — the required 4-state attribution field, entry-gated auto-send with the full guardrail set, fund-name memory, the Attribution Inbox, and the `daf_sponsors` party-extension + alias registry (Section D).
- **Close the Phase 7 A10 hole** — define the purpose-class fact wall and typed tribute DTO once in Phase 14, then require refusal at the Phase 17 message-preparation and Phase 18 Generated Document service seams (acknowledgment: no deductibility fields; notification: no per-gift amounts + controlled donor identity) before the first letter (Section E). No Phase 14 render engine is created.
- **Ship the tribute/memorial stream** — tributes / `contribution_tributes` / `tribute_notify_parties` / `tribute_notification_items`, the digest engine, honor-immediate path, preference model, mail channel with governed print custody, and the aggregate-total monotonic floor (Section F).
- **Ship matching at rung 2** — expectancies + settlements, payer-of-record, the shared `party_payer_aliases` registry, the received flow (the only credit-minting slice), the aging worklist, and the versioned ingest-socket contract (Section G).
- **Ship remittance attribution + the roster** — per-line allocation credits as stored truth, `getSupporterRoster` with `supports_policy_v2`, effective-dated designation-assignment resolution, dual staff/missionary projections, the seven never-leak fixtures (Section H).
- **Derive household recognition at read** (explicit exception rows only) and pin the household display rule (Sections I, J); ship capped auto-applying standing rules (Section K).
- **Mint the Phase 14 capabilities and SoD pairs** in the Phase 12 CAPABILITY_REGISTRY; ship Phase 3 census rows (fail-closed) for every new record type; extend `contribution_operation_audit_events` rather than adding an audit spine (Permissions section).
- **Land the consolidated poison-fixture tier** (D1 tier + D3.14's nine + D4.14's ten + D5's seven never-leak) and the D1.14 cross-PRD amendment package as one dated congruence commit (Testing; OpenSpec & Docs Updates).

### Non-Goals (reserved seams, not builds)

- **No vendor matching contract.** No Double-the-Donation / HEPdata integration, embed, or sync this phase (DTD acquired HEPdata 2025-03 — an effective monopoly; seam-don't-couple). Rungs 3/4 = Phase 31 (Platform API, Webhooks & Connector Framework), via the ratified event-shape contract only [D4].
- **No church-member thank-you letters — at all.** The founder dropped even the tenant toggle; the church receipted its members. The D2 scope note is amended: the church-member acknowledgment stream is **superseded by D5** and does not exist [D5, close-out 4b].
- **No donor-portal match or roster surfaces in v1.** The matched employee's moment is the received thank-you; members never see via-church lines on their own portal/statement; Phase 25 (Donor Dashboard Depth), Phase 27 (Donor Development & Portfolio Management), and Phase 28 (Missionary Workspace Depth & Support-Raising CRM) revisit via the named read models [D4.10, D5 close-outs 1–2].
- **No volunteer-grant (Dollars for Doers) or payroll-deduction-giving tables.** Payroll giving rides the `workplace_giving_donor` credit lane on ordinary contributions; both vendor programs are reserved to Phase 31 [D4.14].
- **No template or renderer runtime.** Phase 14 defines two bounded house content purposes and their typed facts/copy constraints, but creates no template tables or parallel render path. Phase 17 owns message authoring/bindings; Phase 18 owns the canonical print/PDF artifact [D3.6].
- **No Phase 27 ranking semantics.** Formal defer: Phase 14 ships zero ranking/portfolio logic; Phase 27 consumes the three read models, so staff and missionary rankings can never diverge [D5 close-out 5].
- **No proposal/review queues.** Standing rules auto-apply with provenance chips; DAF thank-yous auto-send (no letter-review queue); matching uses one age-bucketed worklist, never per-row tasks [D5 close-out 4a, D2, D4.8].
- **No new audit spine and no ingest archive table yet.** Audit rides `contribution_operation_audit_events` (extended with a polymorphic subject); the socket archive table ships with the first non-staff producer, per the binding D4 don't-over-engineer rider [D1.5, D4.12, D4.14].

---

## Binding Predecessor Decisions & Constraints

Phase 14 operationalizes contracts ratified in Phases 3–13 and may not re-litigate them. Violating any row below is a defect, not a design choice. Anchors were verified against the predecessor PRDs at authoring; load-bearing language is quoted **verbatim**.

| Predecessor                             | Binding anchor (verbatim where load-bearing)                                                                                                                                                                                                                                                                                                                                                                             | Phase 14 consequence                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 7 §A A8**                       | "One hard-credit legal donor per gift; soft credit is recognition-only and structurally non-receiptable." Credits carry `is_receiptable = FALSE` "enforced by DB CHECK **and** service layer; a soft credit can never create receipt facts or enter any money/receipt/cash total. Do not add a second donor FK."                                                                                                         | Every credit row, role, and generator inherits this. The CHECK ships as tripwire; the primary wall is structural—the Phase 7 official-facts path takes no `contribution_credits` input, and Phase 18 renders only the exact Phase 7 version (Section E, [D1.11]).                                                                                                                                                                                                                         |
| **Phase 7 §A A9**                       | Typed party spine — `party_kind ∈ {person, household, org}`; `org_type` includes `daf_sponsor`; "a household is a group of persons, never an account that absorbs them."                                                                                                                                                                                                                                                 | Credits key to `parties`; `daf_sponsors` is a party-extension (PK = party_id); household recognition never absorbs a member (Sections D, I).                                                                                                                                                                                                                                                                                                                                              |
| **Phase 7 §A A10**                      | "The three-document wall is structural." Acknowledgment → "**no** deductibility merge-fields available to the template"; notification → "**amount hidden**, never a tax document"; "DAF advisor = acknowledgment with $0 deductible + 'this is not a tax receipt.'"                                                                                                                                                      | Phase 14 owns the purpose-specific typed fact contracts and carries the single dated A10 amendment for governed `tribute_aggregate_total`; Phase 17 enforces message-variable/content bindings and Phase 18 enforces the canonical print/PDF artifact contract before activation (Sections E, F, [D1.11, D3.4]).                                                                                                                                                                          |
| **Phase 7 §A A11**                      | "Matching = two contributions; tribute = annotation; recurring = per-installment." The match is a separate Phase 13 contribution whose frozen legal donor is the payer-of-record; the employee gets recognition credit only.                                                                                                                                                                                             | Preserved: the linked contribution's legal donor is the proved payer-of-record (normally the employer; a workplace-giving intermediary may be the real payer), while Phase 14 owns the expectancy/settlement/recognition link (Section G, [D4.4]).                                                                                                                                                                                                                                        |
| **Phase 7 tracking (T4–T6; #571/#572)** | Phase 7's ticket list nominally builds `gift_credits`, `daf_sponsors`, `matching_gifts`, and the tribute tables.                                                                                                                                                                                                                                                                                                         | **Phase 14 takes build ownership of all six credit objects**; P7 T5/T6 rescope to receipt/statement _consumption_; names migrate (`gift_credits` → `contribution_credits`, etc.) via D1.14 — free, nothing is built (OpenSpec & Docs Updates).                                                                                                                                                                                                                                            |
| **Phase 13 §E rule 13**                 | "The header total is hard tender only. Soft credits live in a **separate table keyed to the header** — never a line, never in the sum (a Phase 14 seam; no double-count)."                                                                                                                                                                                                                                               | The spine honors this; the tension with P13's `church_remittance` tender row (per-line attributions `[{party_id, soft_credit_amount}]`, story 105) resolves via D1.2 scope exclusivity — header-scoped XOR line-scoped per (party, role) per header — and P13's capture fields become **input only**: `contribution_credits` is the sole stored truth (Sections A, H).                                                                                                                    |
| **Phase 13 §E rules 2/3/7 + §F**        | Posted rows immutable (`BEFORE UPDATE OR DELETE` trigger — RLS/REVOKE cannot; `service_role` has `BYPASSRLS`); "corrections/reversals are new negating entries, never status flips"; "effective value is readable only through the derivation" + CI grep gate; corrections **never change the frozen legal-donor snapshot**.                                                                                             | Credit reads fold through the same cursor discipline (D1.4); the correction cascade stamps affected credits + emits `credit_recheck`; Phase 14 reacts **only** to P13 correction/reversal domain events, never raw Stripe webhooks (Section A, [D1.6]).                                                                                                                                                                                                                                   |
| **Phase 13 §H (D8 DAF shape)**          | DAF is "a **payer + soft-credit + suppression _shape_, NOT a tender or subtype**"; `is_daf_grant = true` ⇒ hard-credit donor = the sponsor party; "suppression _becomes_ the hard-credit-donor identity — NOT a parallel `tax_receipt_suppressed` boolean"; `no_quid_pro_quo = true` (§4967); carry `daf_pledge_no_sponsor_reference` (Notice 2017-73).                                                                  | Section D operates this shape: the advisor = credit row + acknowledgment stream; "an unmatched sponsor alias → fail-closed to review" becomes the one-click triage surface.                                                                                                                                                                                                                                                                                                               |
| **Phase 9**                             | "Gift-level facts are never party edges" — the P9 modeling table rules "donor recommended DAF gift" **NOT an edge**, naming it Phase 14 territory; `parties` carries "**zero denormalized giving/engagement columns**"; a giving-derived role **never authorizes**; the Giving tab links source truth (full soft credit/DAF → Phases 7/14).                                                                              | All credit facts live on gift-keyed tables, never `crm_relationships`; the Giving tab's reserved credit rows are fed by `getPartyCreditActivity`; roster membership grants nothing (Sections C, H).                                                                                                                                                                                                                                                                                       |
| **Phase 10**                            | Restricted workers are un-targetable/un-enumerable; `toPublicProjection` is "the sole public door"; the restricted descriptor is an **alias / fund-code, never the worker's real legal name**.                                                                                                                                                                                                                           | Extended to _credited_ parties: restricted-tier credited/honoree/notify party ⇒ row **omitted** — invisibility, not aliasing (an aliased credit still confirms a relationship); alias substitution only on already-public surfaces (Sections F, H, [D1.10]).                                                                                                                                                                                                                              |
| **Phase 3**                             | `resolveProjection` is the one fail-closed chokepoint ("no row ⇒ invisible/non-exportable"); exports governed via `csvSafeCell`; the surface registry already **reserves `acknowledgment` and `notification` as distinct document classes** for merge-tag governance.                                                                                                                                                    | Every new record type ships census rows in its first migration (fail-closed by construction); Section E builds on the reserved document classes; all roster/credit egress is projection-governed.                                                                                                                                                                                                                                                                                         |
| **Phase 12**                            | "Capabilities are the sole enforcement unit" — branded `Capability` from `CAPABILITY_REGISTRY`, never strings; every money read/write verifies an HMAC-signed, tenant-branded `EffectiveAccess`; SoD pairs are declared by the owning phase, enforced by the PDP.                                                                                                                                                        | Phase 14 mints `finance:record_credit / revoke_credit / manage_credit_rules + approve_credit_rules / apply_retroactive_credits (+ approve) / manage_daf_sponsors / manage_matching_gifts / fulfill_tribute_letters` and declares the SoD pairs (Permissions section).                                                                                                                                                                                                                     |
| **Phase 4 §A A5, A9**                   | A5: the six safety rules — "recognize but never reveal," enumeration-safe forms, "anything ambiguous → staff review… never a silent guess." A9: merge is non-destructive/replayable; "the re-point child list is expected to grow in later phases to cover Phase-7 party/soft-credit rows."                                                                                                                              | Payer/alias matching and the ingest socket are enumeration-safe (no synchronous match/no-match echo); all credit, tribute, and expectancy tables join the merge re-point list with the ratified collision rules — strictest preference wins, coverage untouched (Sections D, F, G, [D3.11]).                                                                                                                                                                                              |
| **Phase 6 §A A2, A6, A8, A12**          | "The shared `sendEmail` surface is the sole email delivery point" (CI import-lint); consent snapshotted at send by the fail-closed gate; the `kind` enum reserves **`acknowledgment`** and **`notification`** (reserved-not-built); `communication_event_relations.related_type` reserves `gift_credit`, `tribute`, `donation_tribute`, `matching_gift`; a fourth visibility value `credited_party_visible` is reserved. | Every Phase 14 letter — advisor thank-you, tribute digest, employee thank-you — is a communication event through the seam, consent-gated, related to its records. The reserved literals rename with the tables (`gift_credit`→`contribution_credit`, `donation_tribute`→`contribution_tribute`, `matching_gift`→`matching_gift_expectancy`) — free, reserved-not-built [D1.14, D3.14, D4.14]. Phase 14 adds the reserved **`mail` channel** via a dated P6 amendment (Section F, [D3.5]). |

_Real-vs-forward evidence (as of authoring):_ the predecessor contracts above are **FORWARD** — groomed PRDs, not shipped code (Phases 3–13 are groomed-not-built). Verified **REAL** anchors: the sole email seam exists (`packages/email/resend.ts` — `export async function sendEmail(…)`); the message-type-aware fail-closed consent gate exists (`packages/api/src/email/consent.ts`); and there is **zero** existing credit/tribute/matching/DAF product code (no matching tables in `supabase/`, no matching symbols in `packages/`) — all six credit objects are net-new, with no legacy to migrate, per the fresh-build posture.

## User Stories

Stories are grouped by actor and numbered continuously. Every story traces to a ratified Phase 14 decision, cited as `[Dn]` / `[Dn.m]` (with `[D2.g#]` for the numbered D2 auto-send guardrails and `[D5 close-out #]` for the five consolidated close-out ratifications). Stories state behavior; the full mechanics behind each tag live in the Implementation Decisions sections (A–K) — stories never restate them. Cross-phase touchpoints cite the phase by name, e.g. Phase 7 (Receipt & Statement Compliance Rules + Donor Identity/Credit Model). Two bars govern every story: the founder's binding **don't-over-engineer** posture (v1 = the leanest compliant shape of every amendment; reviewers' cuts stand) and the fresh-build posture (no users; correct-from-start).

**Repo status for builders:** every surface below is **FORWARD** — the repo contains **zero product code** for credits, tributes, matching gifts, or DAF operations today (Phase 14 research digest; Phase 14 owns the build of all six credit-spine objects per `[D1.14]`). Predecessor seams are owned by their phases: the Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) ledger/fold/correction cascade, Phase 3 (Minimum Permission & Role-Scoped Projection Foundation) `resolveProjection` + census rows, Phase 6 (Shared Communication Event Model) events + the sole `sendEmail` seam, Phase 12 (Full Role & Permission Configuration) capabilities. One **REAL** anchor: the fail-closed, message-type-aware outbound consent gate exists at `packages/api/src/email/consent.ts` (verified) — every letter stream below passes through it via the Phase 6 seam.

### Finance staff — gift entry & attribution

1. As a **finance staffer** entering a DAF grant, I want a **required** attribution field with exactly four states — auto-matched household, searched/created household, "Not Provided", "Anonymous (donor requested)" — so that a DAF gift can never save with a silent null attribution. `[D2]`
2. As a **finance staffer**, I want DAF-specific fields to appear only when the payer/tender indicates a DAF (progressive disclosure), so that ordinary gift entry stays uncluttered. `[D2]`
3. As a **finance staffer** entering a repeat grant, I want the household prefilled from fund-name memory with an evidence chip ("matched from 3 prior grants" — hover shows rule, who confirmed, when), so that the correct path is Tab-past with zero keystrokes. `[D2]`
4. As a **finance staffer** linking a fund name for the first time, I want a "Remember: 'Miller Family Giving Fund' → Millers" checkbox at save (suggest mode), with the confirmed rule superseding fuzzy suggestion on later grants, so that my one explicit confirmation is what justifies future auto-sends. `[D2]`
5. As a **finance staffer**, I want search-as-you-type household lookup (≤10 quiet rows, `Name — City · spouse · last gift $X`) with inline create-new and a duplicate alert, so that finding or minting the right party is one motion. `[D2]`
6. As a **finance staffer**, I want "Not Provided" and "Anonymous" below a listbox divider, never pre-selected, with "Not Provided" taking a one-tap reason chip and visibly queueing into the Attribution Inbox, so that explicit unknowns are deliberate and their consequence is honest. `[D2]`
7. As a **keyboard-only staffer**, I want the attribution field as a WAI-ARIA APG combobox whose unknown states are real listbox options, so that the whole flow completes without a mouse. `[D2]`
8. As a **finance staffer**, I want an ambiguity hold whenever two candidates clear the threshold or the payer doesn't match the fund pattern — forced explicit pick, letter held, word-tier confidence + provenance badges (never raw scores) — so that the system never guesses for me. `[D2.g9]`
9. As a **finance staffer**, I want an in-form disclosure — "Thank-you (not a receipt) will email to John & Susan Miller — [hold this one]" — so that I know what my save triggers and can suppress it per-entry. `[D2.g2]`
10. As a **finance staffer** fixing a mis-attribution, I want a re-attribute flow that relinks the gift, offers rule update/delete in the same dialog, and — if a letter already went to the wrong party — offers "send correction?" via the consent-gated correction-notice idiom, so that one fix repairs everything it touched. `[D2.g11]`
11. As a **finance staffer**, I want every Not-Provided gift in a finite, owned Attribution Inbox worklist with a dashboard completeness % (no per-record nag emails), so that unknowns are a workable pile with an owner. `[D2]`
12. As a **finance staffer** identifying a donor late, I want the link to offer ONE consolidated thank-you covering all unthanked grants in the window, so that late identification never fires a letter burst. `[D2]`

### DAF operations — advisor stream & sponsor handling

13. As a **finance staffer**, I want a confidently identified attribution to release the non-receipt advisor thank-you request with no letter-review queue, so that the identity decision at entry IS the review while Phase 6 remains the sole dispatcher. `[D2]`
14. As a **finance staffer**, I want a hold-then-release window (~10 min default, tenant-config) cancelable from the toast and the gift record, so that I can catch a mistake after save — undo beats confirm. `[D2.g1]`
15. As a **finance staffer**, I want acknowledgment purpose/readiness/coverage as a STATE on the gift — `{not_applicable, held, ready, released, canceled}` — with an "Unacknowledged" work view joined to exact Phase 6 outcomes, so that no thank-you is fire-and-forget without Phase 14 claiming communication outcomes. `[D2.g3]`
16. As a **finance staffer**, I want Phase 6 suppressed/failed outcomes (consent gate + bounce/complaint suppression) surfaced as visible communication events, never copied into Phase 14 state and never silent, so that a blocked letter is a known fact. `[D2.g4]`
17. As a **finance staffer** thanking an advisor with no email, I want the letter routed to a print/letter fulfillment queue — a fulfillment pile, not a review queue — so that offline donors are thanked too. `[D2.g5]`
18. As a **finance staffer**, I want the first-ever send to a brand-new party to take a longer hold plus an outbox flag (not a modal), so that the riskiest sends get extra time without interrupting entry. `[D2.g6]`
19. As a **tenant admin**, I want the amount OMITTED by default in auto-sent advisor thank-yous (tenant merge-field toggle), so that a wrong-person send has minimal blast radius — no substantiation duty applies to a non-receipt. `[D2.g7]`
20. As a **finance staffer**, I want imports to NEVER auto-send, so that a data load can't blast letters. `[D2.g8]`
21. As a **tenant admin**, I want every auto-send recorded as a timeline event on the party plus a tenant-wide "Sent automatically" outbox feed, so that automation is auditable at a glance. `[D2.g10]`
22. As a **finance staffer**, I want Phase 7 to evaluate the sponsor's receipt eligibility and create official facts when required, Phase 18 to create the canonical artifact, and Phase 6 to suppress outbound delivery by default, so that compliance truth is preserved without mailing sponsors who ask not to be mailed. `[D2]`
23. As a **finance staffer**, I want repeat grants keyed on (sponsor, memo) to suggest the prior advisor attribution, so that recurring DAF grants are recognized, not re-researched. `[D1 forward-carried]`
24. As a **finance staffer** entering a check from an unfamiliar payer matching a known sponsor alias, I want one-click sponsor-alias triage — never a silent misfile — so that payer-name variants converge on one party. `[D1 forward-carried, D4.5]`
25. As a **DAF advisor**, I want my letter to be a warm $0 non-deductible acknowledgment, structurally unable to carry deductibility language, so that I'm thanked without ever receiving a second receipt. `[D1.11; Phase 7 A10]`

### Tribute & memorial — setup, preferences & cadence

26. As a **finance staffer** entering a memorial gift, I want inline tribute creation to be exactly 2 fields (type + honoree name) that NEVER gates gift posting, so that money capture is never blocked by ceremony. `[D3.12]`
27. As a **donor-care staffer**, I want incomplete tributes in a "Tributes awaiting setup" worklist with a visible "no one will be notified yet" chip, so that setup debt is a finite pile with honest consequences. `[D3.12]`
28. As a **donor-care staffer**, I want tribute SETUP to be the one deliberate human moment — notify parties, channel, preferences confirmed there — after which digests run automatically, so that the confidence gate lives at setup, not per-letter. `[D3]`
29. As a **notify party** (via staff), I want preferences `{stream_default, immediate, monthly, once, never}` plus `paused_until`, with `once` producing one consolidated letter then auto-flipping to `never`, so that a pause is never a never and "just once" means exactly that. `[D3.7]`
30. As a **donor-care staffer**, I want `never` treated as a suppression-grade fact (reason recorded, capability-gated + audited unset, checked by the consent gate at send) and notify-party removal as a tombstone with stream-scoped suppression — staff adjudicate nothing in family feuds, only record who asked, reason required — so that a family's "stop" can never be casually undone. `[D3.7]`
31. As a **grieving family member**, I want letters weekly during the tribute's first 4 weeks and then at least 28 days apart, so that cadence decays with the season of grief instead of dripping condolences for a year. `[D3]`
32. As a **family member**, I want a gift arriving years later to still eventually compose — no automatic stream stop, ever; late gifts just ride the monthly pace — so that no memorial gift goes unreported. `[D3]`
33. As a **donor-care staffer**, I want a burst (≥5 gifts/7 days) on a slow stream surfaced as a staff re-promotion suggestion only, so that pacing stays under human judgment. `[D3]`
34. As a **notify party watching two tributes** ("Mom and Dad"), I want coverage keyed on (notify_party, header) so I'm told about each gift exactly once, so that overlapping tributes and merges never double-mail me. `[D3, D3.1]`
35. As a **donor-care staffer**, I want a per-tribute "compose consolidated letter NOW" action that advances coverage so the scheduler can't double-send, so that I can hand a funeral home a complete donor record on demand. `[D3.3]`
36. As a **family member**, I want each letter to carry donor names and addresses (per-donor `share_address_in_tribute_letters`, default TRUE, distinct from anonymity) with per-gift amounts structurally absent, so that we can thank donors ourselves without the letter putting a price on grief. `[D3.8, D3.4]`
37. As a **family member** who opted in, I want an aggregate total rendered only when my notify row has `include_total = true` — the single governed `tribute_aggregate_total` field — frozen per letter ("as of this letter, N gifts totaling $X"), so that totals are a per-family choice. `[D3.4]`
38. As a **family member**, I want the printed total monotonic — MAX(last printed, live fold); a shrinking fold omits the total line and routes a staff task — so that we never watch the memorial shrink. `[D3.4]`
39. As an **anonymous donor**, I want to be rendered "an anonymous friend" and still counted, so that my gift is honored without my name. `[D3.8]`
40. As a **donor**, I want per-gift overrides — `notify_party_override_id` ("notify my aunt for THIS gift") and a donor display override — so that one gift can carry its own instructions. `[D3.8]`
41. As a **donor** flipping to anonymous after a letter printed, I want the flip forward-only with the `rendered_donor_as` snapshot immutable and NO automatic correction letter (it would re-broadcast my name) — staff see a banner instead — so that the fix never repeats the harm. `[D3.8]`
42. As a **living honoree**, I want honor gifts to notify me directly and immediately per gift, in celebratory framing (honor print batches weekly — "immediate mail" is fiction), with the notify row auto-created pre-checked (email if known) when I'm a real party at setup, so that being honored feels like a celebration with zero staff clicks. `[D3.12, D3.6]`
43. As a **donor-care staffer** with a name-only honoree, I want the stream off and no junk party minted, with a catch-up consolidated letter when a real party is later attached, so that hygiene and coverage both hold. `[D3.12, D1.12]`
44. As a **finance staffer** entering a gift whose memo says "in memory of Ruth", I want memo-line memory matching only the tenant's ACTIVE TRIBUTES (never fuzzy person matching, never auto-create) with the D2 evidence-chip/ambiguity-hold controls verbatim, so that gifts link to the right tribute without inventing tributes. `[D3.12]`
45. As a **donor-care staffer**, I want occasion as a curated picklist plus internal-only free text, with family-facing copy in a distinct `family_message` field set at the setup gate, so that internal notes can never leak into a family's letter. `[D3.12]`
46. As a **donor-care staffer**, I want the tribute record page as THE ops surface — dual-pane donor list (internal vs as-the-family-sees-it), stream states, next-letter preview, compose-now, stop/resume — so that a phone call can be answered without leaking an anonymous donor. `[D3.12]`
47. As a **family member of a large memorial** (>~75 names, tenant-config), I want the letter to carry count + framing (plus opted-in total) with the full name/address registry as an appendix in the same print bundle, so that scale never turns a letter into a phone book. `[D3.12]`
48. As a **donor-care staffer**, I want a passive preview — "next letter composes Friday — 4 gifts, to Margaret (mail) + Tom (email)" — on the tribute page, so that I always know what automation does next. `[D3.9]`
49. As a **family member**, I want the FIRST letter to carry a provenance line and a how-to-stop line, with the stop footer on every letter, so that the stream introduces itself and always offers the exit. `[D3.9]`
50. As a **donor-care staffer**, I want a bounce, returned mail, or "who is this?" reply to move the stream to `attention`/paused fail-closed with a routed task, so that a wrong recipient stops the letters immediately. `[D3.9]`
51. As a **donor-care staffer**, I want deceased checks on the honoree AND every notify party at compose AND at send, so that we never mail a condolence letter to someone who has died mid-stream. `[D3.8]`
52. As a **tenant admin** importing tribute history, I want imported tributes to arrive stream-STOPPED with a `notified_through` watermark / bulk coverage backfill, producing zero sends even after streams are enabled — activation is an explicit staff act — so that a data load can never mail a grieving family. `[D3.10]`
53. As a **donor-care staffer** flipping honor→memorial, I want close-and-guided-successor (notify parties carried with re-confirmation, coverage NOT carried), type immutable after the first letter, and a deceased honoree auto-pausing the honor stream with a conversion task, so that the saddest transition is handled with care. `[D3.12]`
54. As a **donor-care staffer**, I want a refund after listing to leave the item standing (no retraction letter; only the total floor reacts) and a refund before first listing filtered at compose with a `skipped_reversed` item, so that letters never re-open wounds over bookkeeping. `[D3.13]`
55. As a **tenant admin**, I want the memorial digest engine behind a per-tenant enable (default OFF), a `tribute_stream_paused` switch, and a global kill — checked at compose AND at the send/print seam — so that automation is opt-in and instantly stoppable. `[D3.14, D3.2]`
56. As a **print-fulfillment staffer**, I want mail statuses `queued → printed → mailed / returned` (manual transitions), print custody as a capability-gated GOVERNED EXPORT with download audit and post-fulfillment purge, and a no-address mail party HELD with a task rather than silently skipped, so that a stack of letters with family addresses is handled like the sensitive export it is. `[D3.5]`
57. As a **family member**, I want plain fact-first copy ("died"/"death", never "passed away"), ≤1 page, WCAG 2.2 AA email and tagged-PDF print ≥12pt single-column, so that letters are readable, respectful, and accessible. `[D3.6]`

### Matching gifts — expectancy lifecycle & receiving

58. As a **finance staffer**, I want expectancy creation to be ONE checkbox — "Employer match expected" — with the employer combobox prefilled from the Phase 9 (Full CRM Depth & Relationship Graph) employment relationship with an evidence chip and zero other required fields, so that capturing an expectancy costs one click. `[D4.6]`
59. As a **finance staffer** receiving an employer check, I want a Find-Matched-Gifts-style list of open expectancies for that employer, aggregated per employee, so that linking is a pick-list, not a hunt — and duplicate credits are impossible by construction. `[D4.6, D1.1]`
60. As a **finance staffer** holding a match check with no recorded expectancy, I want inline retro-create directly in the received flow (same transaction) — never spawn-without-expectancy — so that out-of-order reality still lands correctly. `[D4.6]`
61. As a **finance staffer** entering one employer check covering N employees, I want a minimal single-header multi-line entry surface where each line settles its own expectancy (a line settles at most one; one expectancy may settle across multiple lines/checks), with fulfilled totals always DERIVED over effective line amounts — never a cached counter — so that batch checks and quarterly installments are ordinary, refund-proof entry. `[D4.1, D4.6]`
62. As a **development staffer**, I want expectancy stages to generate ZERO credit rows — only the received employer contribution mints the line-scoped `matched_employee` credit, from settlements, async — so that pipeline hope never inflates recognition. `[D4.1, D1.12]`
63. As a **development staffer**, I want `expected_amount_minor` nullable and advisory-only (own currency column; never blocks received; never on money surfaces; variance = derived display at close) and match ratios kept as program-notes prose (no `match_ratio` column), so that a guess stays a guess and we never maintain a pretend-database of employer policies. `[D4.7]`
64. As a **development staffer**, I want ONE age-bucketed aging worklist (highlight default 180d, tenant-config; owned by development staff) instead of per-expectancy tasks, with `expires_at` staff-set and seeded from the one structured employer field `match_claim_deadline` — auto-behavior reading ONLY `expires_at`, never notes — so that quarterly-check reality doesn't page me about healthy expectancies. `[D4.8]`
65. As a **finance staffer** receiving a check from GE Foundation or Benevity, I want the contribution's legal donor to be the payer-of-record (defaulting to the employer) while the expectancy keeps `employer_party_id` as program attribution, so that legal truth follows the actual payer. `[D4.4]`
66. As a **finance staffer**, I want the ONE shared payer-intelligence registry (sponsor + workplace-giving-intermediary aliases, per-tenant seeded) to raise a blocking hint with reason-to-override in BOTH directions on the match path — never silent — so that intermediaries and sponsors are never misfiled. `[D4.5]`
67. As a **finance staffer**, I want match-looking lines from an `is_matching_gift_company` payer that settle nothing to land in an "unlinked match lines" worklist, so that orphan match money surfaces as work. `[D4.6]`
68. As a **finance staffer**, I want exactly six states (`identified | submitted | received | reversed | closed | superseded`, `closed_reason ∈ {denied, expired, written_off}`), with `received`/`reversed` unreachable by plain UPDATE and money always winning — a settlement from `closed`/`reversed` re-enters `received`, audited — so that the lifecycle is small, honest, and unbrickable. `[D4.3, D4.2]`
69. As a **finance staffer** processing a $200 refund on a 5-employee batch, I want per-line correction UI by default with proration behind explicit confirm — `reversed` only when the settled fold hits zero; partial refunds surface variance + task, never a status flip — so that refunds stay precise. `[D4.3]`
70. As a **finance staffer**, I want dupe guards at expectancy create (a uniqueness guard on open origin+employer pairs plus an advisory warning) with the origin gift nullable — pre-platform and DAF-paid origin gifts are real — and entry strongly encouraging linkage, so that duplicates are blocked without blocking reality. `[D4.9]`
71. As **the matched employee**, I want a thank-you when my employer's match is received — D2 guardrails verbatim: amount omitted by default, designation via `toPublicProjection` alias, my origin gift's anonymity inherited onto my credit — so that my role in the match is celebrated safely. `[D4.10]`
72. As a **donor**, I want the documented honest copy — "Many programs exclude gifts to religious organizations — a match is never guaranteed" — and NO "double your donation" default banner, so that the product never over-promises employer programs. `[D4.14]`
73. As a **finance staffer**, I want an origin-gift reversal to set an "origin reversed" flag and route a task — never auto-cancel the expectancy — so that a refunded origin gift becomes a human decision. `[D4.11]`
74. As a **development staffer**, I want `getMatchingActivity` as the SOLE read model for pipeline facts and funnel aggregates (Contribution Detail, Giving tab, later-phase seams), with expectancies excluded from BOTH money vocabularies and recognition rollups computed MAX-per-(party, header) across roles, so that hoped-for money never pollutes any number and an employee-also-org-contact never double-counts. `[D4.13]`

### Church remittances & the supporter roster

75. As a **finance staffer** entering a monthly church remittance, I want copy-last-remittance prefill so month 2+ is confirm-not-retype, so that a 20-member roster costs seconds. `[D5]`
76. As a **finance staffer**, I want CSV paste with a staged preview classifying rows matched / create-new / ambiguous — bulk-create behind ONE explicit confirm with dupe flags, per-row ambiguity holds — so that one bad name never blocks the batch. `[D5]`
77. As a **finance staffer**, I want member allocation rows bounded so their sum never exceeds their church line (generator + deferred-trigger enforced), so that attribution can never invent money. `[D1.3]`
78. As a **finance staffer**, I want remittance-created parties to carry provenance and enter the Phase 9 dupe-review stream eagerly — name-only parties CREATED, not held — so that visibility wins now and identity binds later. `[D5]`
79. As a **missionary**, I want church members who give through my supporting church on my supporter roster with via-church chips, per-path recognized amounts, dates, fund (alias-governed), and a support/recency label — plus commitment status only when a typed Phase 16 recurring or fixed-pledge subject exists — so that I finally see the people behind the church check without recognition inventing a commitment. `[D5]` _(Amended 2026-07-13, Phase 16 A13/D11/D14.)_
80. As a **missionary**, I want Mrs. Jones who gives directly AND through her church shown as ONE row with distinct paths inside (direct legal amounts; church_member recognized amounts), so that one person never appears twice or double-counts. `[D5]`
81. As a **missionary**, I want anonymous members folded into one "Anonymous church members (N)" sub-row per church path, so that anonymity is honored while support stays visible. `[D5, D3.8]`
82. As a **missionary**, I want a do-not-contact supporter visible with the contact affordance suppressed and no reason shown, so that I respect the boundary without learning private details. `[D5]`
83. As a **missionary**, I want members visible-NOT-contactable in v1 — no contact details, no contact affordance, zero auto-enrollment into any Phase 6 stream; a member becomes contactable only by acting directly (direct gift, portal signup, explicit opt-in with consent provenance) — so that I can never accidentally email 200 church members who have never heard of us. `[D5 close-out 1]`
84. As a **missionary**, I want roster AGGREGATE tiles in the Legal vocabulary only, per-row display in Recognition with via-chips, so that my totals reconcile to real money while rows tell the recognition story. `[D5, D1.4]`
85. As a **missionary**, I want roster membership via `supports_policy_v2` — recognized fold > 0 on any effective line in scope trailing 365 days OR a typed Phase 16 active commitment; lapsed band 365–730d display-only; drop after 730d — so that a church skipping a month never falsely lapses a supporter. `[D5]` _(Amended 2026-07-13, Phase 16 A13.)_
86. As a **missionary**, I want corrections to self-heal silently through the recognition fold (no notification to me), so that bookkeeping noise never reaches my dashboard. `[D5]`
87. As a **missionary**, I want a member who changes churches to simply grow a second path (nothing migrates), and two churches attributing the same member to be legal distinct facts — with multi-currency shown as per-currency subtotals, never a scalar — so that real-world messiness never corrupts the roster. `[D5]`
88. As a **missionary who left the field**, I want my roster to end at designation un-assignment and my successor to inherit it — designation assignment effective-dated, resolved at read — so that roster scope always reflects who holds the designation. `[D5]`
89. As a **finance staffer**, I want the staff FINANCE roster projection — a designation-pivot sibling page of the Phase 9 Giving tab with full parties, attribution-split math, provenance chips — consuming the SAME `getSupporterRoster` read model as the missionary view, with a "perfectly aligned" acceptance fixture reconciling it to `getPartyCreditActivity` in both lenses, so that staff and missionary numbers can never diverge. `[D5]`
90. As a **missionary**, I want org-sourced roster rows VIEW-ONLY with provenance chips (flag-not-edit), so that I can report a problem without corrupting attribution truth. `[D5]`
91. As a **missionary**, I want a member covered by a standing rule to receive a clear repeat-support/recency label without being represented as a recurring or fixed commitment, so that faithful via-church recognition is visible without inventing promise, fulfillment, or Party authority. `[D5]` _(Amended 2026-07-13, Phase 16 A13/D11/D14.)_
92. As a **church member**, I want my via-church attribution NEVER on my own portal or statement — the church was receipted, not me — so that I'm never confused into claiming a deduction that isn't mine. `[D5 close-out 2]`
93. As a **church treasurer**, I want NO member thank-you letters generated from our remittance breakdown, so that our members hear from their church, not a stranger. `[D5]`

### Households — derived recognition and purpose-separated presentation

94. As a **spouse**, I want household recognition DERIVED at read from Phase 9 time-bounded household membership — no per-gift rows except explicit exceptions/suppressions, which override the derivation — so that a divorce or backdated membership edit is automatically correct everywhere. `[D1.12, D5 close-out 3]`
95. As a **spouse**, I want my view to show household-derived recognition LABELED as household, never merged into my personal legal giving, so that I always know which number is legally mine. `[D5 close-out 3]`
96. As a **couple**, we want each official document to remain with its source-owned legal donor and, when enabled, one separate **Support overview — Not a tax document** to present authorized household recognition, so that convenience never corrupts tax truth. `[Phase 19 D3/D15]`
97. As a **development staffer**, I want both spouses recognizable at the full gift amount (recognition-class cross-party sums deliberately unbounded — the RE-legal norm), so that recognition reflects relationships, not arithmetic rationing. `[D1.3]`

### Donor-care & development staff — credits, rules & reporting

98. As a **development staffer**, I want every recognition number computed by the ONE canonical recognition read model (`recognized_minor = LEAST(amount_minor, scope_effective_minor)`, 0 when the scope is reversed/voided, keyed on the Phase 13 `effective_seq` cursor), so that refunds and corrections flow into recognition without anyone editing credit rows. `[D1.4]`
99. As a **development staffer**, I want exactly TWO report vocabularies forever — **Legal giving** (hard credit only) and **Recognition giving** — never one mixed column, so that we never fall into the double-count trap. `[D1.4]`
100.  As a **donor-care staffer**, I want credits editable-with-audit until their FIRST external reference (statement run item or sent document), then frozen supersede-only, so that history referenced by a real document can never silently change. `[D1.5]`
101.  As a **donor-care staffer**, I want a Phase 13 correction to re-derive GENERATED credits (supersede-and-diff) but never auto-delete MANUAL credits — those route a review task ("re-attach recognition to the +Y line?") — so that human judgment is corrected by humans. `[D1.6]`
102.  As a **donor-care staffer**, I want standing rules auto-applied at posting with provenance chips and NO proposal queue, capped at the v1 shape `{giver → credited, role, full/NULL amount, effective_from/to}` (no percent formulas, no designation filters), prospective-only, so that faithful monthly attribution is zero-touch and rules stay simple enough to trust. `[D5 close-out 4a, D1.13]`
103.  As a **finance manager**, I want retroactive application as an explicit governed backfill under a separation-of-duties pair that REFUSES statement-referenced headers, so that rewriting the past is deliberate, dual-controlled, and can never contradict an issued statement. `[D1.13]`
104.  As a **development staffer**, I want tenant-custom recognition labels as Phase 11 (Custom Fields & Custom Collections) custom fields — never new credit roles — so that the role registry stays a fixed, testable set. `[D1.13]`
105.  As a **development staffer**, I want the Phase 9 Giving tab's soft-credit rows fed exclusively by `getPartyCreditActivity` — the sole consumer interface for credit activity — so that every surface shows the same numbers. `[D1 forward-carried]`
106.  As a **finance staffer**, I want recognition to NEVER fail the money path — single-row credits sync in the posting transaction, fan-out is async and resumable with no duplicates (die-at-117 safe), and any Phase 19 informational run freezes one exact reviewed recognition cursor — so that recognition is eventually consistent and gifts always post. `[D1.7; Phase 19 D15]`
107.  As a **donor-care staffer** merging duplicate parties, I want credit and tribute tables on the Phase 9 merge re-point list — strictest preference wins, `include_total=false` wins, coverage untouched — so that a merge never re-mails or double-mails a family. `[D1.5, D3.11]`

### Donors & families — document truth

108. As a **donor**, I want receipt truth unchanged by this phase: exactly ONE hard-credit legal donor owns the receipt, and the receipt-mint path structurally takes no `contribution_credits` input, so that no credit can ever mint a receipt or enter deductible totals. `[D1.11; Phase 7 binding]`
109. As a **donor**, I want acknowledgments and notifications constrained by purpose — acknowledgment: no deductibility facts; notification: no per-gift amounts + controlled donor identity — with atomic refusal at the Phase 17 message and Phase 18 document seams, so that the wrong fact can never appear in the wrong presentation. `[D1.11, D3.6]`
110. As an **anonymous or suppressed donor** named in a notification, I want to appear as "an anonymous friend" — per-donor `notify_donor_identity` defaulted from my anonymity flag — so that notification letters respect my identity choice by default. `[D1.10]`
111. As a **donor**, I want eligible DAF-recommendation and household recognition rendered only in the optional, separately purposed **Support overview — Not a tax document**, so that my official statement remains unambiguous. `[Phase 19 D15]`

### Missionaries — visibility floor

112. As a **missionary**, I want to see only display name, city/state, per-path amounts/dates/fund, via-chips, support/recency label, and commitment status only for a typed Phase 16 subject — NEVER home address, email, phone, notes, household internals, provenance internals, or staff notes — so that I can shepherd relationships without holding PII I don't need. `[D5]` _(Amended 2026-07-13, Phase 16 A13.)_
113. As a **missionary**, I want every credit surface in my workspace to inherit FINANCE visibility floors through `resolveProjection` (fail-closed census rows), so that nothing reaches me the boundary hasn't cleared. `[D1.10]`
114. As a **missionary**, I want the never-leak guarantees enforced by fixture: no other missionaries' supporters (enumeration guard), no church-wide totals, no member giving to other designations, no residual arithmetic, no PII beyond the v1 set, no restricted existence via counts, no anonymous unmasking via cross-referencing. `[D5]`

### Admin & compliance — capabilities, audit & data health

115. As a **tenant admin**, I want Phase 14 to mint its own capabilities in the Phase 12 (Full Role & Permission Configuration) registry — record/revoke credit, manage + approve credit rules (SoD), apply + approve retroactive credits (SoD), manage DAF sponsors, manage matching gifts, fulfill tribute letters (full names in the Permissions section) — so that every credit operation is capability-gated from day one. `[D1 forward-carried, D3.5]`
116. As a **compliance officer**, I want all credit mutations through one locked SECURITY DEFINER function taking the SAME per-contribution advisory lock as the Phase 13 axis RPC, so that credits and money can never race. `[D1.8]`
117. As a **compliance officer**, I want audit riding `contribution_operation_audit_events` — extended with a nullable polymorphic subject for pre-received expectancy transitions — so that one audit spine covers everything. `[D1.5, D4.12]`
118. As a **tenant admin**, I want the six Phase 14 data-health signals in the Phase 8 catalog (credit-generation drift, tribute-notification drift, stale print queue, expectancy-aging stall, ingest-quarantine age, matching-fulfillment drift — the aging signal data-derived so a dead aging job self-reports), so that silent decay in any credit pipeline surfaces on its own. `[D1 forward-carried, D3.13, D4.13]`
119. As a **platform engineer**, I want machine enforcement of the walls — the CI gate classifying credit sums and expected amounts as non-money, the allowlist-lint asserting `tribute_aggregate_total` is the ONLY notification amount field, and the `is_receiptable = FALSE` CHECK tripwire asserted by schema lint — so that vocabulary and wall discipline never depend on review vigilance. `[D1.4, D4.7, D3.4, D1.11]`
120. As a **tenant admin**, I want `daf_sponsors` tenant-scoped FOREVER — the global Fidelity/Schwab list shipping only as per-tenant seed suggestions, never a shared registry — so that one tenant's sponsor edits can never bleed into another's. `[D1.9]`
121. As a **platform engineer**, I want the matching ingest socket ratified as an event-shape contract now — versioned typed payload, tenant from per-tenant registration NEVER from the payload, quarantine distinct from dead-letter, NO synchronous match/no-match echo — so that Phase 31 vendors plug in without a redesign or an enumeration oracle. `[D4.14]`
122. As a **compliance officer**, I want Phase 14 to react ONLY to Phase 13 correction/reversal domain events — never raw Stripe webhooks — with an acceptance criterion that the stream includes MANUAL check-bounce corrections, so that credit reactions cover every correction source uniformly. `[D1.6, D4.11]`
123. As a **tenant admin**, I want zero ranking semantics in this phase — later ranking consumes `getPartyCreditActivity` + `getMatchingActivity` + `getSupporterRoster` — so that staff and missionary rankings can never diverge when Phase 27 builds them. `[D5 close-out 5]`

### Safety — restricted parties, minors & employment privacy

124. As a **restricted-tier worker** who is a credited party, honoree, or notify party, I want my credit/tribute rows OMITTED from all external egress and from staff below clearance — INVISIBILITY, not aliasing, because an aliased credit still confirms a relationship — so that my safety never depends on a rename. `[D1.10]`
125. As a **restricted-tier donor** in a tribute letter, I want to be rendered EXACTLY as an anonymous donor ("an anonymous friend", counted), so that crowd-blending leaves no arithmetic trail pointing at me. `[D3]`
126. As a **restricted-tier employee**, I want my matching expectancy invisible below clearance with aging-task suppression — census rows classifying employer fields sensitive — so that a worklist never leaks my employment. `[D4.10]`
127. As a **compliance officer**, I want employer-facing surfaces and receipts to NEVER itemize employee identities — an invariant with its fixture written before any org surface exists — so that a company statement can never become an employee roster. `[D4.10]`
128. As a **guardian**, I want a minor in a remittance folded to the household/guardian at entry — never a roster row, minors' addresses always withheld from letters — so that children never accrue independent giving records or appear in mailings. `[D5, D3.8]`
129. As a **missionary**, I want a restricted member's roster row omitted AND my view rendering ZERO split arithmetic (attributed/unattributed reconciliation is FINANCE-view-under-clearance only; visible counts computed post-projection), so that members-don't-sum inference can never expose a hidden person. `[D5]`
130. As a **compliance officer**, I want every new credit, tribute, and matching table registered as a record type with fail-closed Phase 3 (Minimum Permission & Role-Scoped Projection Foundation) census rows, composite tenant FKs, FORCE RLS, and per-generator cross-tenant negative tests — the generators run as service_role, where RLS won't save a bad join — so that tenant isolation holds inside the machinery too. `[D1.9, D3.11]`
131. As a **compliance officer**, I want credit and tribute tables on the search/AI exclusion list with the reserved `credited_party_visible` visibility value honored per credit, so that recognition data never leaks through discovery surfaces. `[D1.10]`
132. As a **donor-care staffer**, I want future public tribute capture (when Phase 5 plumbs it) to quarantine named parties behind staff review before any letter, so that an anonymous web form can never trigger mail to an unvetted address. `[D1 forward-carried]`

## Implementation Decisions

Decisions are labeled `D#` to trace to the Phase 14 grill-with-docs decision log (D1 credit spine → D2 DAF advisor stream → D3 tribute/memorial → D4 matching gifts → D5 standing rules / church remittances / supporter roster, plus the five consolidated close-out rulings). This first block covers the **credit substrate** — the one table every other decision in this PRD hangs off — plus the **role/amount-class registry** and the **reporting vocabulary + named read models** that are the only sanctioned ways to consume it. Two governing founder rulings bind everything below:

- **R-LEAN — "Don't over-engineer."** The founder's D4 ratification rider ("Ratify D4 as mentioned but don't over engineer") is a **binding interpretive posture for this entire PRD**: v1 ships the leanest compliant shape of every amendment; the adversarial reviewers' cuts stand (6 states not 8, no ratio column, no archive table until a non-staff producer exists, worklists not per-row tasks, no proposal queues); no speculative machinery. Where this document offers a shape, build exactly that shape — not a generalization of it.
- **R-FRESH — no users, correct-from-start.** The product has no users ([[no-users-fresh-build-posture]]); there is no migration ceremony and no constraint can be deferred to a "hardening pass." Concretely: **all identity/uniqueness/exclusivity constraints in this block ship in the FIRST migration, before any credit generator merges** [D1.1].

Everything below consumes, and never re-litigates, the Binding Predecessor Decisions section of this PRD — in particular Phase 7 (Receipt & Statement Compliance Rules + Donor Identity/Credit Model)'s one-hard-credit-legal-donor + structurally non-receiptable soft credit (A8), Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart)'s append-only header/lines/postings ledger with the monotonic `seq` fold, and Phase 9 (Full CRM Depth & Relationship Graph)'s rule that gift-level facts are never party relationship edges.

---

### A. Credit spine & substrate (D1) — one `contribution_credits` table, header-keyed with optional line scope

**Founder ruling (RATIFIED 2026-07-10, Path 2):** Phase 14 builds **ONE `contribution_credits` table keyed to the contribution header with OPTIONAL line scope**; lifecycle objects (`tributes`/`contribution_tributes`, `matching_gift_expectancies`, standing rules, the `daf_sponsors` registry) are **separate tables that GENERATE credit rows** — they are never themselves credits and never enter any sum. The choice survived a 17-category adversarial pass (`wf_8173b0a3-b3b`; briefs in the session's `p14adv/` set) whose verdict was **architecture SURVIVES** with **14 hardening amendments**, all folded in below (D1.1–D1.14; D1.3 is specified in section B, D1.10 in the Permissions & Safety section, D1.11 in section E, D1.12 in sections F and I, D1.13 in section B, D1.14 in the OpenSpec & Docs Updates section).

**Why one table with optional line scope — the P13 reconciliation story.** Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) ratified two seemingly contradictory statements that Phase 14 was explicitly chartered to reconcile:

- P13 ledger rule 13 (D3.13): _"The header total is hard tender only. Soft credits live in a **separate table keyed to the header** — never a line, never in the sum (a Phase 14 seam; no double-count)."_
- P13 story 105 + the `church_remittance` tender row: a church bulk remittance carries **per-line soft-credit attributions** `[{party_id, soft_credit_amount}]` — _"a reporting overlay on the lines, **not** extra headers/lines/postings."_

The reconciliation is that both are right about different things: header-keying is the **default grain**, and line scope is a **narrow, named exception** for allocation-style attribution (a church's members gave against _specific designation lines_ of one remittance header). The adversarial pass attacked line scope directly and the attack **failed**: the vendors' gift-level-only credits are single-designation legacy, not wisdom (Salesforce Nonprofit Cloud's `GiftSoftCredit` has no designation reference; NPSP soft credits do not interact with GAU allocations) — and P13 had _already_ ratified per-line remittance attributions, so the grain question was settled before this phase opened. The D1.14 amendment package (see OpenSpec & Docs Updates) closes the loop on the P13 side: **the `church_remittance` tender's per-line attribution array becomes capture-INPUT only — `contribution_credits` is the SOLE stored truth** for the attribution; nothing about credits is ever duplicated into tender metadata.

The credit row's semantic identity: **(tenant, header, optional line, party, role)** plus an amount whose meaning is fixed by the role's amount class (section B). Credit rows are recognition/attribution facts hanging off the money; they are **not money rows** — the ledger's header total, postings, and `sum(lines) = header` invariant (P13 rules) are untouched by anything in this PRD.

#### A.1 Identity & dedupe [D1.1]

- **The identity key (VERBATIM, ships in the first migration):** partial `UNIQUE NULLS NOT DISTINCT (tenant_id, header_id, line_id, party_id, credit_role) WHERE active`. `NULLS NOT DISTINCT` is load-bearing: a header-scoped row has `line_id IS NULL`, and without it Postgres would treat every NULL as distinct and the dedupe guarantee would silently vanish for the _default_ grain.
- **Provenance is ON the row but OUT of the identity key:** `source_kind` TEXT + CHECK over `{manual, rule, daf, match, tribute, remittance, import}`, `source_ref uuid` (the generating lifecycle row), and `generation_run_id` (A.6). Keeping provenance out of the key is the anti-double-credit decision: **generators converge on the same identity** — a manual `household` credit and a standing-rule `household` credit for the same party on the same header are _the same row_, making the NPSP #5796 duplicate-soft-credit bug class (manual + automated rows coexisting) **impossible by construction**, not by cleanup job.
- **Import identity:** nullable `external_ref` + `external_source`, with a partial `UNIQUE (tenant_id, external_ref)` for Phase 30 (Imports & Migration Tools) idempotent re-runs.
- **Sequencing rule (R-FRESH):** _all_ of the above constraints ship in the **first** migration, **before any generator merges** — a generator that lands ahead of its dedupe key is exactly how duplicate-credit debt is born.

#### A.2 Scope exclusivity [D1.2]

A `(party_id, credit_role)` pair is **header-scoped XOR line-scoped per header**, enforced by a **constraint trigger** — mixed scopes for the same party+role on one header are **forbidden, not interpreted** (the adversarial split went 4-of-5 for forbid). Consequence: naive per-party sums over a header are **correct by construction** — no reader ever needs "take the line rows unless there's a header row" precedence logic, which is precisely the interpretation bug that would have crept into every report.

`line_id` is **never a general UI field**. It is set only by four **named flows**: the remittance attribution editor (section H), Phase 30 (Imports & Migration Tools) import, the credit-review re-attach task (A.5), and the Section G settlement generator (generator-only, never a UI field). Everything else writes header-scoped rows. (The settlement generator writes line-scoped `matched_employee` rows — the remittance-class fan-out path.)

#### A.3 Recognition exposure is a DERIVATION [D1.4]

Credit rows are **historical facts**; what a credit is _worth right now_ is a **read-time derivation**, never a stored mutation:

- **The sole aggregator** is one canonical recognition read model: **`recognized_minor = LEAST(amount_minor, scope_effective_minor)`, 0 when the scope is reversed/voided** — where _scope_ is the credit's line when line-scoped, else its header, and `scope_effective_minor` is the P13 effective fold of that scope. For `recognition`-class rows whose `amount_minor` is NULL ("full scope," section B), the fold value itself is the recognized amount. `annotation`-class rows derive nothing — they are never in any sum.
- **Cursor keying:** the read model is keyed on the P13 **`effective_seq`** version cursor (FORWARD: Phase 13 PRD §E rule 8 — the cursor-invalidated effective read model; epic #690) so a stale recognition read is structurally detectable, exactly like fund progress.
- **Credits are never auto-mutated by corrections.** A refund, re-designation, or void changes `scope_effective_minor` and therefore the _derived_ number; the credit row itself is untouched (see A.5 for the only sanctioned writes).
- **CI non-money gate:** the P13 CI grep gate that forbids direct base-money reads is **extended to classify credit sums as non-money** — no code path may add `contribution_credits.amount_minor` into any receipt, deductible, cash, or ledger total. The two-vocabulary consequence (Legal vs Recognition) is specified in C.1.

#### A.4 Mutability — freeze-on-external-reference, supersede chain, one sanctioned in-place write [D1.5]

Adjudicated **4:1 over pure append-only**: credits are not money — there is no fold that reversing entries would feed — so full P13-style append-only ceremony would be over-engineering (R-LEAN). The ratified middle:

- **Editable-with-audit until the FIRST external reference** — inclusion in a Phase 19 Support-overview facts package that freezes the reviewed Phase 14 recognition cursor (C.6), or a sent document linked via `communication_event_relations` (FORWARD: Phase 6 (Shared Communication Event Model) PRD, epic #550) — **then frozen, supersede-only**: corrections after freeze create a new row with `supersedes_id` pointing at the old one, and the old row leaves the `active` predicate (which is what scopes the A.1 identity key and every index in C.7). Official annual-statement run items are Statement Subjects, not credit rows, so official statements do not freeze credits merely by covering the same source gift.
- **Enforcement is a `BEFORE UPDATE OR DELETE` trigger that `RAISE`s** on frozen rows — not RLS, not grants, because **`service_role` bypasses RLS** (the P13 lesson, Phase 13 PRD §E rule 2; the credit generators themselves run as `service_role`, so the trigger is guarding against _our own_ code first).
- **The ONLY sanctioned in-place write is the party-merge re-point of `party_id`** — `contribution_credits` (and every Phase 14 lifecycle table) joins the Phase 9 (Full CRM Depth & Relationship Graph) merge re-point list, and a merge rewrites `party_id` in place rather than superseding (superseding on merge would fork recognition history for what is one human).
- **Audit rides the existing spine — no new audit table.** Every credit mutation writes a `contribution_operation_audit_events` row (REAL: created in `supabase/migrations/20260526132000_contribution_operations_core.sql`; written today by `packages/api/src/admin/contribution-operations/operations.ts`), extended per [D4.12] with a **nullable polymorphic subject** (`subject_type`/`subject_id`, composite tenant FK) so credit rows, expectancies, and tribute objects get an audit home without a second spine.

#### A.5 Corrections coupling — how P13 money changes reach credits [D1.6]

- **The P13 correction cascade (same advisory lock, same transaction) stamps affected line-scoped credits and emits a `credit_recheck` outbox event.** This is a dated Phase 13 PRD amendment riding the D1.14 package — the emission is cheap to add now, and the seam costs nothing until Phase 14's consumer exists.
- **Generated credits re-derive; manual credits get a human.** On `credit_recheck`, generator-owned rows (`source_kind ∈ {rule, daf, match, tribute, remittance}`) are recomputed **supersede-and-diff** against their lifecycle source. **MANUAL credits are never auto-deleted** — an affected manual row routes a review task ("re-attach recognition to the +Y line?") into the staff worklist instead.
- **Event discipline (VERBATIM):** _"P14 reacts ONLY to P13 correction/reversal domain events, never raw Stripe webhooks."_ The matching expectancy's `received → reversed` transition is driven by P13 domain events on the _employer_ header (section G); the acceptance criterion in G explicitly requires the event stream to include **manual check-bounce corrections**, not just Stripe-originated ones [D4.11].
- **Verified ground truth bounding the risk:** under P13 rules 4+6, a posted line's designation can **never change in place** (re-designation is a paired-delta posting against line ids; designation identity is snapshotted). So the drift class Phase 14 must handle is **amounts-under-credit shrinking or zeroing** — never a credit silently pointing at money that now belongs to a different fund.

#### A.6 Generation topology — sync capture, async fan-out, `credit_generation_runs` [D1.7]

- **Single-row capture credits are SYNCHRONOUS** in the posting/entry transaction: the manual credit a staffer adds on the entry form, the DAF advisor credit minted from the D2 attribution field, the tribute-link annotation row. One row, same transaction, no queue.
- **Fan-out generation is ASYNC** via the repo's outbox/Inngest idiom (REAL: `packages/api/src/donate/outbox.ts` + `packages/api/src/donate/saga.ts` transactional outbox; `packages/api/src/workflows/functions/donation-saga-recovery.ts` Inngest recovery scan — the durable template Phase 14 instantiates, not modifies): church-remittance member sets and standing-rule application run as jobs recorded in a **`credit_generation_runs`** table, each run performing a **full-target-set idempotent upsert** against the A.1 identity key. The sizing scenario that ratified this: a 200-member remittance whose generator dies at member 117 must be **resumable with zero duplicates** — the run record plus the identity key make the retry a no-op for the 117 already written.
- **The money path NEVER fails on recognition.** No credit generator can abort, delay, or roll back a posting. Recognition is **eventually consistent** by design; a Phase 19 Support-overview run freezes the exact Phase 14 cursor it reviewed. Late or corrected recognition never edits frozen bytes and follows that informational purpose's successor/supplemental lane.

#### A.7 Locking [D1.8, as amended by D4.2]

- **One locked function, one lock.** All credit mutations go through **one locked `SECURITY DEFINER` function taking the SAME per-contribution advisory lock as the P13 axis RPC** (FORWARD: Phase 13 PRD §G — the five-axis RPC's per-contribution advisory lock; epic #690). Credits serialize with money movements on the same header; there is no second lock namespace to deadlock against.
- **The D4.2 amendment (dated; supersedes the original D1.8 match-received wording):** staff entry of a received employer match batch is an **ORDINARY P13 entry transaction** — header + lines + settlements + expectancy state transitions, synchronous, under the **new header's** advisory lock, with expectancy rows taken `FOR UPDATE ORDER BY id` and `lock_timeout` set (deterministic lock order kills the two-clerks-two-batches deadlock).
- **`received`/`reversed` are UNREACHABLE via plain `UPDATE`:** a `BEFORE UPDATE` trigger `RAISE`s; only the settlement-writing locked function and the P13-event consumer may set them (kills the phantom-`received` bricking class where a stray status write strands an expectancy). Full state machine in section G.
- **The spawn-saga survives only for the future auto-spawn (ingest) path**, re-keyed `tenant + ingest_event_id`; and **credit minting is ALWAYS async via the A.6 fan-out** — one uniform path, no small-N synchronous special case (R-LEAN: one code path, not two).

#### A.8 Tenant envelope [D1.9]

- **Composite `(tenant_id, …)` FKs on `contribution_credits` AND every lifecycle table** (`contribution_tributes`, `tribute_notify_parties`, `tribute_notification_items`, `matching_gift_expectancies`, `matching_gift_settlements`, `credit_generation_runs`, standing rules, `daf_sponsors`, `party_payer_aliases`) — following the P13 §E rule 12 brand. The reason is not belt-and-suspenders aesthetics: **the generators run as `service_role`, so RLS won't save a bad join** — the composite FK is the only thing that makes a cross-tenant reference _unresolvable_ rather than merely _unreadable_.
- **`FORCE ROW LEVEL SECURITY` everywhere**, and **per-generator cross-tenant negative tests** at the Phase 4 (Identity & Account-Claiming Foundation) tenant-isolation test tier — one test per generator proving a mis-joined foreign tenant id is rejected by the FK shape, not just filtered by policy.
- **P13 lines-table amendment (rides D1.14):** `contribution_designation_lines` gains `UNIQUE (tenant_id, header_id, id)` so line-scoped credits can carry the full composite FK `(tenant_id, header_id, line_id)` — a credit that names a line can name only a line of _its own header in its own tenant_.
- **`daf_sponsors` is a party-extension:** PK = `party_id`, 1:1 with the org party, **no duplicated identity columns** (name/address live on the party). Its alias child generalizes per [D4.5] into the shared **`party_payer_aliases`** table (org-party-keyed, `payer_kind ∈ {daf_sponsor, workplace_giving_intermediary}`) feeding ONE matcher and ONE one-click triage surface — specified in sections D and G.
- **Tenant-scoped FOREVER:** there is **no shared/global sponsor registry**. The well-known list (Fidelity Charitable, Schwab Charitable, etc.) ships as **per-tenant seed suggestions**; a shared registry would make one tenant's alias edits leak into another's matching behavior.
- Census/record-type registration for all new tables (fail-closed `resolveProjection` rows) is D1.10 territory — see Permissions, SoD & Audit.

---

### B. Credit roles & amount classes — a fixed registry, three arithmetic behaviors [D1.3, D1.13]

Plain-language: every credit row names a **role** (why this party is recognized) and every role belongs to exactly one **amount class** (what its amount column is allowed to mean). Reports never inspect roles case-by-case — they dispatch on the class. This is the smallest registry that makes both the church-remittance bounded math and the both-spouses-full recognition math correct at the same time.

#### B.1 Roles v1 — TEXT + CHECK, fixed set of 9, one reserved [D1.13]

`credit_role` is **TEXT + CHECK** (house rule: never a native enum), fixed v1 set:

| Role                     | Meaning                                                                                                                                                                                                                                                  | Amount class   |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `daf_advisor`            | The recommending advisor behind a DAF grant (sponsor is the hard-credit donor) — section D                                                                                                                                                               | recognition    |
| `household`              | Explicit per-gift household exception/suppression rows ONLY — ordinary household recognition is **derived at read** from Phase 9 (Full CRM Depth & Relationship Graph) time-bounded household membership, never materialized per gift [D1.12]; section I | recognition    |
| `church_member`          | Member attribution under a church remittance line — section H                                                                                                                                                                                            | **allocation** |
| `matched_employee`       | The employee recognized on a _received_ employer match line, generated from `matching_gift_settlements`; **expectancy stages generate ZERO credit rows** [D1.12] — section G                                                                             | recognition    |
| `workplace_giving_donor` | Benevity/YourCause-style workplace giving: the intermediary payer is hard-credit, the employee is recognized. **NOT `matched_employee`** — different lifecycle, no expectancy                                                                            | recognition    |
| `foundation_affiliate`   | The individual behind a family-foundation gift (a family foundation is **not** a DAF sponsor)                                                                                                                                                            | recognition    |
| `solicitor`              | The person credited with soliciting the gift                                                                                                                                                                                                             | recognition    |
| `org_contact`            | The signing/contact person on an organizational gift                                                                                                                                                                                                     | recognition    |
| `tribute`                | The honoree annotation row, generator-emitted from `contribution_tributes`, optional-per-tenant, never manual [D1.12] — section F                                                                                                                        | **annotation** |
| `peer_fundraiser`        | **RESERVED, not implemented** — Phase 36 (Peer-to-Peer & Advocacy Campaigns)                                                                                                                                                                             | —              |

Fixed-set rules: **honor vs memorial lives on `tributes.tribute_type` — single source, no role split.** **Tenant-custom recognition labels are Phase 11 (Custom Fields & Custom Collections) custom fields on the credit's record type — NEVER new roles**: a role changes arithmetic and document routing; a label changes neither, and letting tenants mint roles would let them mint arithmetic.

(The decision log fixes `church_member` = allocation and `tribute` = annotation explicitly; every other v1 role carries recognition semantics — none of them bounds or sums money. This is the leanest compliant class assignment under R-LEAN.)

#### B.2 The three amount classes — exact constraints [D1.3]

The class lives **on the role registry**, not per-row; the DB enforces per-class shape:

- **`allocation`** — `amount_minor` **required and bounded**: the member rows under one remittance line must **sum ≤ that line's amount**, enforced by the generator AND a **deferred constraint trigger** (generator bugs must not be able to over-allocate a line). This is the only class whose cross-party sum is constrained.
- **`recognition`** — `amount_minor` NULL means **defaults to full scope** (the A.3 fold value); when set, **per-row ≤ scope**; the **cross-party sum is deliberately UNBOUNDED** — both spouses recognized for the full gift is legal and is the Blackbaud RE NXT norm ("full-to-each"). Bounding recognition across parties was considered and rejected: it is not money, and the bound would break the most common household case.
- **`annotation`** — `amount_minor` **always NULL; never in any sum**. The tribute honoree row exists so tribute facts surface on credit-consuming UIs; it carries no arithmetic at all.

#### B.3 Currency inheritance — an invariant, not a column [D1.3]

**Credit currency = header currency by construction: an invariant, with NO currency column on `contribution_credits`.** This is a **deliberate, documented non-application of P13 §E rule 9** ("explicit currency on every row") — that rule governs _money rows_, and credits are not money rows; a currency column here would imply cross-currency credits are a representable state. The one documented exception in this PRD: `matching_gift_expectancies.expected_amount_minor` carries an explicit currency column because an expectancy **predates its header** [D4.7] — see section G.

#### B.4 Standing rules — the v1 capped shape [D1.13]

The standing-rule object (workflow and UX in section K) is **CAPPED** in v1 to: **`{giver_party → credited_party, credit_role, full-or-NULL amount, effective_from/effective_to}`**. Explicitly excluded: percent formulas, designation filters, per-fund conditions — every one of them is a rules-engine seed that R-LEAN forbids. Application is **prospective-only at posting time** (rules auto-apply with provenance chips, **no proposal queue** — D5 close-out item 4a, founder-confirmed); **retroactive application is a separate, explicit, governed backfill** behind the `finance:apply_retroactive_credits` / `finance:approve_retroactive_credits` SoD pair that **refuses statement-referenced headers** (a frozen credit is supersede-only per A.4, and a backfill that touched issued statements would be a silent restatement). (Full ≡ NULL under the recognition class, so the rules table carries NO amount column — see the Data Model section's capped shape.)

---

### C. Reporting vocabulary & named read models — two vocabularies, three interfaces [D1.4, D4.13, D5]

Plain-language: there are exactly **two** ways to say "how much did this party give," and exactly **three named read models** through which any surface may consume credit data. Everything else — Giving tab, Contribution Detail, dashboards, statements, future phases — composes these; nothing reaches into `contribution_credits` directly.

#### C.1 The two-vocabulary rule (VERBATIM, forever) [D1.4]

> **TWO report vocabularies forever: "Legal giving" (hard credit only) vs "Recognition giving" — never one mixed column.**

This is the CiviCRM "Both" trap, named and banned: CiviCRM's combined hard+soft report option is its documented double-counting footgun. Binding consequences:

- Every money-bearing surface declares which vocabulary it speaks. **Legal** = the P13 effective fold of hard-credit lines — receipts, deductible totals, accounting exports, ledger reconciliation. **Recognition** = the A.3 derivation over credits — donor development, Giving-tab recognition rows, the supporter roster's per-row display.
- **No UI column, export column, or API field may sum the two vocabularies together.** Side-by-side is fine; blended is never fine.
- Both vocabularies are **registered in the CI non-money gate** (A.3): Legal reads must come through the P13 fold; Recognition reads must come through the A.3 read model; raw-table sums of either fail CI.
- Roster aggregate tiles are **Legal only**; per-row roster display is **Recognition with via-chips** [D5] — the worked example of the rule, detailed in section H.

#### C.2 `getPartyCreditActivity` — the sole credit consumer interface [D1 forward-carried]

**The ONE party-centric read model. Every surface that shows a party's credit/recognition activity consumes this — the Phase 9 (Full CRM Depth & Relationship Graph) Giving tab's reserved soft-credit and receipt/ack-status columns (FORWARD: Phase 9 PRD, epic #604), Phase 27 (Donor Development & Portfolio Management), Phase 33 (Reporting & BI / Report Studio), and Phase 36 (Peer-to-Peer & Advocacy Campaigns) all consume this same interface** — which is precisely what guarantees staff-facing and future donor-development ranking semantics can never diverge (D5 close-out item 5 formally defers all ranking semantics to Phase 27; Phase 14 ships zero).

Contract (binding):

- **Input:** `(tenant_id, party_id, lens ∈ {legal, recognition}, optional scope filters)`.
- **Output rows:** per (header, optional line, role): the vocabulary-correct amount — Legal lens returns hard-credit effective-fold facts for headers where the party IS the legal donor; Recognition lens returns A.3 `recognized_minor` per credit row plus derived household recognition per [D1.12]/section I — with role, scope grain, `source_kind` provenance, and dates. Multi-currency output is **per-currency subtotals, never a scalar** (P13 §E rule 9 discipline at the read edge).
- **Substrate:** the A.3 recognition read model keyed on the P13 `effective_seq` cursor — **no roster/rollup tables, no counters, no nightly rebuild**; cursor-invalidated like every P13 read model.
- **Exclusions:** matching expectancies NEVER ride this interface (C.3); `annotation`-class rows surface as facts, never amounts.

#### C.3 `getMatchingActivity` — pipeline facts, outside both vocabularies [D4.13]

**The SOLE consumer interface for matching-gift data**: expectancy pipeline facts + funnel aggregates for Contribution Detail, the Giving tab, and the Phase 25 (Donor Dashboard Depth) / Phase 27 (Donor Development & Portfolio Management) / Phase 33 (Reporting & BI / Report Studio) seams. **Excluded from BOTH the Legal and Recognition money vocabularies — an expectancy is never money and never recognition; it is a pipeline fact** (the phantom-revenue guard: RE-style MG pledges inflating giving totals is the documented failure mode this exclusion kills). Full shape in section G.

#### C.4 `getSupporterRoster` — named here, specified in section H [D5]

`getSupporterRoster(missionary_scope, lens)` is the **designation-centric dual of `getPartyCreditActivity`**: same substrate (hard-credit effective lines UNION credits through the ONE A.3 fold), **zero copies**, cursor-keyed, one row per `(tenant, missionary_scope, party)` with `paths[]`. Its "perfectly aligned" acceptance fixture — every roster row's path sums ≡ `getPartyCreditActivity` filtered to scope, both lenses — is what enforces that the two duals can never drift. Grain, projections, churn policy, and the never-leak fixture list are section H's lane.

#### C.5 The MAX-per-(party, header) rollup rule [D4.13]

**Per-party recognition rollups take MAX per (party, header) across roles — never SUM across roles.** A party holding two roles on one gift (the employee who is also the `org_contact` on the employer's match check; a solicitor who is also in the household) is recognized **once** for that gift. This is a **fixture-backed** invariant (the employee-also-org*contact fixture ships in the Testing section) and is the rule the roster's household path reuses [D5]. Role-faceted views may still show each role row; the \_rollup* is MAX.

#### C.6 Statement inclusion facts — the Phase 19 grain amendment [D1.14 amendment of Phase 7]

Phase 7 (Receipt & Statement Compliance Rules + Donor Identity/Credit Model) defined legacy `statement_run_items` as per-gift statement lines keyed `donation_id XOR gift_credit_id` (FORWARD: Phase 7 PRD data model, epic #566). Phase 19 supersedes that run-item grain for annual statement operations: a Phase 19 Run Item is one governed Statement Subject and document candidate; source gifts and recognition lines remain subordinate inclusion facts, not run items.

- **No Phase 14 table or contract may key annual run membership by `contribution_header_id XOR contribution_credit_id`.** Phase 14 supplies recognition inclusion facts and cursor-pinned projections; Phase 19 owns the Statement Subject run item.
- **Official totals draw from hard-credit receiptable lines ONLY** (P7 A8: `is_receiptable = FALSE` is structural). Credit-keyed recognition is absent from the official document and may render only through Phase 19's independently purposed Support overview.
- **Credit rows are not Phase 19 run items and are not official-statement freeze triggers** (A.4). A credit freezes only when an externally referenced Support-overview facts package or sent document includes the reviewed recognition fact.
- **Purpose-pinned informational runs freeze the exact reviewed recognition cursor** (A.6): a credit generated after the run never retro-edits frozen bytes and may enter only a later informational successor/supplemental operation.
- Statement composition also runs the same deceased check as letter composition [D1.10]: a deceased-flagged recipient party's statement is held with a routed task, never auto-mailed.

#### C.7 Index plan — the v1 covering set [D1]

Indexes ship with the first migration, sized to the named consumers (all partial on the `active` predicate that scopes the A.1 identity key):

- **Party-centric:** `(tenant_id, party_id, credit_role) WHERE active` — `getPartyCreditActivity`, Giving-tab reads, roster path assembly.
- **Header-centric:** `(tenant_id, header_id) WHERE active` — Contribution Detail, statement-run composition, and the A.1 dedupe key's leading columns.
- **Partial line index:** `(tenant_id, line_id) WHERE line_id IS NOT NULL AND active` — the A.5 correction-cascade stamp resolves affected line-scoped credits without scanning header-scoped rows (which dominate).
- **Rules partial index:** on the standing-rules table, `(tenant_id, giver_party_id) WHERE active` over the `effective_from/effective_to` window — posting-time rule matching (B.4) is an index probe, not a scan, on every gift entry.

No other indexes ship in v1 (R-LEAN); Phase 33 (Reporting & BI / Report Studio) owns any analytic shapes later.

---

_(This block covers the credit substrate: D1's spine and hardening amendments D1.1–D1.9, the role/class registry D1.3 + D1.13, and the reporting vocabulary. The operational streams — D2 DAF advisor thank-yous (section D), document classes & merge-field allowlists (E), tribute/memorial D3 (F), matching gifts D4 (G), church remittances & the supporter roster D5 (H), household recognition (I), donor-facing visibility (J), and standing-rule workflow (K) — are specified in the subsequent Implementation Decisions blocks of this PRD.)_

### D. DAF operations & the advisor acknowledgment stream (D2) — entry-gated auto-send, required attribution, guardrails not queues

When a donor-advised-fund grant arrives, the check is from Fidelity Charitable — not from the Millers whose generosity caused it. Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) already settled the money side: the sponsor is the hard-credit legal donor, the advisor is recognition-only, and receipt suppression _is_ the hard-credit-donor identity. Phase 14 makes the human side operational: who gets thanked, how the advisor's identity is captured without silent nulls, and how the thank-you goes out without either a letter-review queue or a wrong-person blast.

**Founder ruling (RATIFIED 2026-07-10 — this REVERSED the drafted Option-2 letter-review-queue recommendation):** the admin entering the gift **MUST fill the attribution field — an identified household/donor, "Not Provided", or "Anonymous" — and a confidently identified attribution AUTO-SENDS the non-receipt thank-you. No letter-review queue; the identity decision at entry IS the review.** [D2]

Research validated the model: **Bloomerang** ("send acknowledgment now" at entry, executes on save) and **Little Green Light** (saving a DAF gift generates BOTH letters) are direct precedents; receipts already auto-send industry-wide; the manual-review norm is legacy-CRM ceremony. The founder's model **exceeds** market: no vendor _requires_ attribution (Virtuous even hides the field) — required-with-explicit-unknowns kills silent nulls. The confidence gate lives **at entry**, not downstream. [D2]

#### D.1 The capture shape (consumed from Phase 13, never re-litigated)

Binding facts this section builds on, all FORWARD (groomed in `docs/prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md`, Data Model bullets and Testing invariant 6):

- `is_daf_grant = true` makes the **hard-credit donor = the sponsor party** (org-kind, `org_type = daf_sponsor` per Phase 7 (Receipt & Statement Compliance Rules + Donor Identity/Credit Model) A9); the advisor attaches as **soft credit only** (`is_receiptable = FALSE`). **"Suppression becomes the hard-credit-donor identity — not a parallel `tax_receipt_suppressed` boolean that could disagree with the wall."**
- `no_quid_pro_quo = true` (IRC §4967) and `daf_pledge_no_sponsor_reference` (IRS Notice 2017-73) ride the header — see D.10.
- **"An unmatched sponsor alias fails closed to review"** — Phase 14 supplies the registry and triage surface that Phase 13 declared (D.7 below).

The advisor's recognition is one `contribution_credits` row: `credit_role = 'daf_advisor'`, `source_kind = 'daf'`, minted **synchronously in the entry/posting transaction** (the D1.7 single-row-capture class — no fan-out job for one row). Role semantics and amount class are owned by Section B (credit roles & amount classes); dedupe is by the Section A identity key, so re-entry or re-generation can never double-credit the advisor [D1.1, D1.7].

#### D.2 The required attribution combobox — four states, keystroke asymmetry

One field, always required when the DAF disclosure is active, four states [D2]:

1. **Auto-matched household** — prefilled from fund-name memory (D.5) **with an evidence chip** ("matched from 3 prior grants"; hover reveals the rule, who confirmed it, and when). The correct path is **Tab past — zero keystrokes**.
2. **Searched/created household** — search-as-you-type, **≤10 quiet rows** formatted `Name — City · spouse · last gift $X`; inline create-new with a duplicate alert (the Salesforce Alert pattern).
3. **"Not Provided"** — takes a **one-tap reason chip** and **visibly queues the gift into the Attribution Inbox** (D.6). Friction by consequence-honesty, not obstruction.
4. **"Anonymous (donor requested)"** — a deliberate recorded fact, not a missing value.

States ③ and ④ live **below a listbox divider** (the GOV.UK "or" divider precedent) and are **never pre-selected**. The keystroke asymmetry — zero keys for the confident match, deliberate taps for the unknowns — is grounded in the Jachimowicz et al. default-effect meta-analysis (d ≈ 0.63–0.68): defaults powerfully steer behavior, so the default must be the _identified_ path and the unknowns must be real choices. [D2]

Accessibility and disclosure rules: the control implements the **WAI-ARIA APG combobox pattern**; the unknown states are **real listbox options** so the field is keyboard-only completable. **DAF fields appear ONLY when the payer/tender indicates DAF** (progressive disclosure, NN/g) — a cash gift never shows an attribution combobox. [D2]

#### D.3 Per-grant advisor identity tier — anonymity is a first-class state

Each grant carries an **advisor identity tier: `{full | fund_name_only | anonymous}`** (TEXT + CHECK, per house rules — never a native enum) recording what the sponsor's paperwork actually disclosed [D2 defaults bundle]:

- **`full`** — advisor person/household named → combobox states ① or ②.
- **`fund_name_only`** — only a fund name ("The Miller Family Giving Fund"). Fund-name memory (D.5) may still resolve it to a confirmed household; absent a confirmed rule, the gift records the fund name and rides "Not Provided" into the Attribution Inbox.
- **`anonymous`** — the donor requested anonymity via the sponsor → combobox state ④; no attribution is ever solicited; the acknowledgment request/readiness axis is `not_applicable`.

The session's DAF operational research brief found National Christian Foundation — the sponsor missions donors use most — culturally promotes anonymous giving (DOCUMENTED: ncfgiving.com), so anonymous/partial grants likely exceed Fidelity's ~4% for missions tenants (INFERRED). Anonymity interacts with rendering per Section E (controlled donor identity) and with Section J (donor-facing recognition visibility).

#### D.4 The eleven auto-release guardrails (ratified set — none reintroduce a queue) [D2]

1. **Hold-then-release window** — default **~10 minutes, tenant-configurable**; cancelable from the save toast **and** from the gift record. A save-trigger has no proofreading moment, so the window is minutes, not Gmail-seconds; undo-beats-confirm (NN/g: confirmation dialogs habituate).
2. **In-form disclosure line** — "Thank-you (not a receipt) will email to John & Susan Miller — [hold this one]" — per-entry suppression parity with Zeffy/Givebutter.
3. **Acknowledgment purpose/readiness/coverage is a STATE on the gift** — `{not_applicable, held, ready, released, canceled}` (TEXT + CHECK) — plus an **"Unacknowledged" work view joined to exact Phase 6 outcomes**. `released` means Phase 14 froze and handed off the exact owner request; it never means sent or delivered. Natural mappings: identified → `ready` after the hold window → `released`; ambiguity, staff hold, new-party hold, or "Not Provided" → `held`; Anonymous tier → `not_applicable`; reattribution or withdrawal can move unstarted work to `canceled`. Phase 6 outcomes never rewrite this axis.
4. **Phase 6 alone applies the consent gate, dispatches, and owns bounce/complaint suppression and communication outcomes** — the shipped gate in `packages/api/src/email/consent.ts` (REAL: message-type-aware, fail-closed; transactional/relational classes bypass marketing opt-outs but never `do_not_contact`/bounce/complaint). `sent`, `suppressed`, `failed`, and delivery outcomes are visible Phase 6 events, never Phase 14 statuses.
5. **No email on file → the letter drops into a print/letter queue** — a fulfillment pile, not a review step.
6. **First send to a brand-new party → a LONGER hold + an outbox flag — NOT a modal.**
7. **Amount OMITTED by default** in auto-sent advisor thank-yous (a tenant merge-field toggle can re-include it). Fidelity's own acknowledgment guidance does not mandate the amount; omission is the cheapest wrong-person blast-radius reducer; and no substantiation duty applies to a non-receipt.
8. **Imports NEVER auto-send** (Givebutter precedent). Cross-referenced in the Imports & Integration Seams section; poison-fixture-enforced.
9. **Ambiguity HOLDS** — two candidates clearing the match threshold, or a payer≠fund-pattern mismatch, forces an explicit pick and the letter holds. Match confidence is presented as **word tiers with provenance badges, never raw scores** (the QBO top-suggestion/consider-tier pattern).
10. **Every released auto-send request joins to a Phase 6 timeline event on the party + a tenant-wide "Sent automatically" outbox feed once dispatch occurs** (HubSpot pattern) — Phase 14 never asserts the send outcome, and staff can always answer "what did the system send on my behalf yesterday?"
11. **Re-attribute flow** (the Xero Unreconcile analog): relinking a gift to a different party, in the same dialog, offers the fund-name **rule update/delete** and — if a letter already went out — **"letter already sent to X → send correction?"** via the consent-gated correction-notice idiom (the shipped correction-notice pattern; see `packages/api/src/email/contribution-correction-template-validation.ts`, REAL).

#### D.5 Fund-name memory — suggest → confirm-once → rule chip (QBO/Xero bank-rules grounded) [D2]

- **First link:** a "Remember: 'Miller Family Giving Fund' → the Millers" **checkbox at save** (suggest mode — nothing is remembered without the human tick).
- **Repeat grants:** the combobox prefills with a **RULE-style provenance chip**; the staff save is itself the human confirmation, which is what justifies auto-send on the prefilled match.
- **A confirmed rule supersedes fuzzy suggestion**; deleting/updating the rule is offered inline in the re-attribute flow (guardrail 11).
- **The full auto-add tier is RESERVED** for future non-staff ingestion (the DAFpay/Chariot rail, D.11) — v1 never creates a rule without a staff confirmation.
- **Reversibility + provenance chips are what make confirm-once-then-auto safe** — the key transfer from QBO/Xero bank rules.
- Advisor-recall suggestions are keyed on **(sponsor, memo)** [D1 forward-carried scope], so "Fidelity + 'Miller Family Giving Fund'" recalls the Millers but the same memo text from a different sponsor does not.

#### D.6 The Attribution Inbox, the completeness metric, and late identification [D2]

Every "Not Provided" gift lands in a **finite, owned worklist** — the Attribution Inbox (the QBO For-Review/month-end pattern). The tenant dashboard shows an **attribution completeness %** (the LinkedIn completeness-bar effect, ~+50% completion in the cited research) — **no per-record nag emails, ever**. Late identification → staff link the party → the system offers **ONE consolidated thank-you covering all unthanked grants in the window** (never a burst of N back-dated letters). The Inbox is the same worklist idiom Sections G and H reuse (matching-gift aging, tributes awaiting setup) — one pattern, three consumers.

#### D.7 The sponsor registry & payer aliases — fail-closed matching [D1.9, D4.5]

- **`daf_sponsors` is a party extension**: `PK = party_id`, 1:1 with an org party, **no duplicated identity columns** — name, address, and restrictions live on the party spine (Phase 9 (Full CRM Depth & Relationship Graph)).
- Aliases live in the **shared `party_payer_aliases`** table (org-party-keyed, `payer_kind ∈ {daf_sponsor, workplace_giving_intermediary}`) — **ONE matcher and ONE one-click triage surface** shared with Section G's workplace-giving intermediaries [D4.5]. An unrecognized payer string is **never silently misfiled**: it fails closed to the triage surface, per the Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) ratified rule quoted in D.1.
- **Tenant-scoped FOREVER**: the well-known sponsor list (Fidelity Charitable, Schwab Charitable, NCF, Vanguard Charitable, …) ships as **per-tenant seed suggestions, never a shared cross-tenant registry** [D1.9] — a tenant's alias confirmations are their own data.
- Registry administration is gated by the `finance:manage_daf_sponsors` capability (minted in the Permissions, SoD & Audit section).

#### D.8 Sponsor receipt evaluation and default delivery suppression [D2]

Phase 7 alone evaluates whether the sponsor is the eligible legal donor and whether official receipt facts are required; a receipt does **not** exist merely because a DAF attribution exists. When Phase 7 creates an official facts version, Phase 18 pins it to the canonical artifact. Phase 6 then applies the sponsor's default **DELIVERY suppression**: sponsors commonly ask charities not to mail grant receipts. The gift record truthfully shows one of `not eligible`, `facts pending`, `artifact available — delivery suppressed`, or the independently authoritative Phase 6 delivery outcome. A tenant can change the prospective per-sponsor delivery preference. Delivery suppression never changes Phase 7 eligibility/facts or Phase 18 artifact truth.

#### D.9 Recurring DAF detection — informational chip only [D2]

_(Ratified within D2 default (a) — the fund-name-memory bundle: the cadence + fund-name "likely recurring" chip is informational only; no commitment object is minted, because the sponsor — not the platform — controls the schedule.)_

A cadence + fund heuristic (same fund name, same sponsor, ~monthly/quarterly spacing) surfaces an **informational "looks recurring" chip** on the gift and the party timeline. It creates **nothing** — no commitment object, no schedule, no dunning; recurring machinery is owned by Phase 13's commitment model and Phase 16 (Pledges & Recurring Commitments). The chip exists so development staff can _see_ faithful DAF givers without the system pretending a sponsor-initiated grant stream is a card-on-file subscription.

#### D.10 The QPQ seam invariant [D2]

`no_quid_pro_quo = true` (§4967 — a DAF grant may confer **no more than incidental benefit**; violations carry a 125% excise on the advisor) and `daf_pledge_no_sponsor_reference` (Notice 2017-73 — fundraisers must not reference the sponsor in pledge fulfillment; §4 of the Notice blocks bifurcated event tickets/memberships on DAF money) are Phase 13 header facts. **Phase 14's binding rule: every FUTURE benefit-bearing feature — events (Phase 37 (Event / Opportunity Workflows & Group Management)), memberships, premiums, auctions — MUST consult these flags before attaching any benefit or FMV to a DAF-funded gift.** Phase 14 itself attaches no benefits anywhere, so v1 compliance is inherited, not built — the invariant is recorded here so the seam is named and testable (a poison fixture asserts the flags survive the credit/acknowledgment pipeline untouched).

#### D.11 DAFpay / Chariot — reserved rail, same capture shape [D2]

API-originated DAF grants (DAFpay, Chariot) are a **reserved rail, not a v1 integration** (connectors are Phase 31 (Platform API, Webhooks & Connector Framework) territory). The binding v1 commitment is **shape-compatibility**: an API-originated grant lands in the **same capture shape** — sponsor hard-credit, advisor identity tier, attribution field, acknowledgment state machine, hold window — with only its provenance differing. The fund-name-memory **auto-add tier** (D.5) is reserved for exactly this rail: when grants arrive without a staff keystroke, the rule engine may graduate from confirm-once to auto-add under that rail's own review rules. Nothing about the credit spine, the sponsor registry, or the guardrails changes.

#### D.12 Multi-advisor and household-joint attribution [D2]

The attribution combobox targets **one party**, and the household is the preferred grain when spouses jointly advise a fund (the search rows surface the spouse for exactly this reason; consistent with Section B's household grain per D1.12). A sponsor letter naming two advisors who are one household → attribute the **household**: one credit row, one thank-you. Genuinely distinct co-advisors (e.g., siblings advising a parent's fund) → additional `daf_advisor` credit rows through the standard credit surface, deduped by the Section A identity key — but the **auto-sent letter follows the attribution party only**: one attribution decision, one letter, never N letters per grant.

#### D.13 Grant-letter data and the attachment seams [D2]

The DAF capture carries three structured columns from the sponsor's grant letter: **grant id, fund name, and purpose** (the memo/designation text). These feed fund-name memory (D.5), advisor recall keyed on (sponsor, memo), and the Imports & Integration Seams section's dedupe key. **File attachment of the physical grant letter is a seam, not a v1 build**: scanned-batch capture belongs to Phase 15 (Offline Gift & Batch Entry) and document storage to Phase 29 (File Manager & Document Management) — Phase 14 stores the three columns and nothing binary.

#### D.14 Stream scope notes [D2, D4.10, D5 close-out 4b]

- The **matched-employee thank-you** (Section G) reuses this pattern with the D2 guardrails **verbatim** — amount-omitted default, hold window, ack state, outbox feed (confirmed via D4.10).
- The **church-member acknowledgment stream does not exist** — superseded by the D5 supporter-roster ruling (Section H); no member thank-you letters, no tenant toggle.
- **Tribute notifications are explicitly excluded** from this ruling — more sensitive, separately ruled in Section F.

**Real-vs-forward evidence (as of authoring).** REAL today: the consent gate (`packages/api/src/email/consent.ts` — message-type-aware, fail-closed), the correction-notice idiom (`packages/api/src/email/contribution-correction-template-validation.ts`), the Email Studio send seam and system-bindings registry (see Section E), and the Phase 6 PRD's reservation of the `acknowledgment` kind + `communication_event_relations` (`docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md`, junction at its Data Model section; reserved kinds in its checklist). FORWARD: everything else — the ledger and DAF header shape (Phase 13 PRD), `contribution_credits`/`daf_sponsors`/`party_payer_aliases` (this PRD's Data Model section), the combobox, the acknowledgment request/readiness axis, and the Attribution Inbox. The repo has **zero DAF product code** — this is all net-new against the shipped substrate.

---

### E. Document classes & merge-field allowlists (D1.11 / D3.4 / D3.6) — closing the A10 compliance hole structurally

Phase 7 (Receipt & Statement Compliance Rules + Donor Identity/Credit Model) ruled the three-document wall (its A10, quoted verbatim from `docs/prds/sitestacker-parity/phase-07-receipt-statement-compliance-and-donor-credit.md`):

> **A10 — The three-document wall is structural.** `document_type ∈ {receipt, acknowledgment, notification}`. Tax receipt → legal donor only (deductibility + EIN allowed). Acknowledgment → soft-credited parties (**no** deductibility merge-fields available to the template). Notification → tribute notify party (**amount hidden**, never a tax document). DAF advisor = acknowledgment with $0 deductible + "this is not a tax receipt."

And its framing sentence: _"Acknowledgment and notification templates have **no access to deductibility or amount merge-fields** — a wrong-party tax statement is impossible by construction, not by staff memory."_

**The compliance hole [D1.11]:** the prototype Statement Studio variable governance is **permission-based, not document-class-based**. Its design doc (`docs/guides/features/statement-studio/variables.md`, REAL prototype evidence) says who may use a variable but not which document purpose may receive it. Under that prototype model, a staff member with giving-variable permission could bind a deductible-amount field into an acknowledgment, and nothing structural would stop the render. Phase 14 owns the class/purpose facts and Phase 18 closes the generation hole with purpose-scoped Approved Data Views before the first document ships.

#### E.1 Document-class allowlists on the variable registry [D1.11]

Every presentation path declares its governed **document/message purpose**. Phase 14 supplies the closed class rules; Phase 17 message contracts and Phase 18 Document Purpose Contracts each expose only their own typed allowlist/Approved Data View. A value is usable only when that purpose contract permits it. Class rules:

- **`receipt`** — the full Phase 7 receipt surface (deductibility, EIN, per-gift amounts) — unchanged; owned by Phase 7 and Phase 18 (Receipt & PDF Template System).
- **`acknowledgment`** — **no deductibility fields** of any kind: no deductible amount, no EIN-as-tax-anchor, no "tax-deductible" boilerplate variables. Gift _facts_ (date, fund via governed alias, optionally the amount — see the Section D guardrail-7 tenant toggle) are class-permitted; anything that could make the document read as a receipt is not.
- **`notification`** — **no per-gift amounts at all**, plus **controlled donor identity**: the donor renders per the per-donor `notify_donor_identity` (defaulted from the anonymity flag); anonymous/suppressed/restricted donors render as **"an anonymous friend"** — identically, so anonymity crowd-blends [D1.10, D3.8 — rendering rules owned by Section F]. Exactly **one** governed monetary field exists in this class — E.2.

The allowlist is code-reviewed configuration with a **lint** that asserts its shape (E.3), not a tenant-editable surface. Tenant-facing template editing arrives in Phase 17 (System Messages & Template Management) _on top of_ these allowlists — editing never widens a class.

#### E.2 The notification class single-field carve-out — the dated Phase 7 A10 amendment [D3.4]

Memorial families legitimately ask "how much has been given in Dad's memory?" — an aggregate, opt-in disclosure that a per-gift-amount ban would otherwise block. The ratified resolution, quoted from the decision log (this amendment rides the D1.14 cross-PRD congruence commit as a **dated, append-only amendment to Phase 7 A10**):

> the **notification class gains exactly ONE governed field `tribute_aggregate_total`**, renderable only when the notify row has `include_total = true`; **per-gift amounts stay structurally absent**; allowlist-lint asserts the single field.

Binding consequences here (mechanics — the monotonic floor, per-letter freezing, and the forward-only toggle — are owned by Section F, D3.4):

- `tribute_aggregate_total` is the **only** monetary variable the notification class can ever hold; the lint fails CI if the class allowlist contains a second monetary field or if any per-gift amount field appears.
- The field is **doubly gated**: class allowlist (structural) AND the per-notify-party `include_total = true` opt-in (per-family consent) — absent either, the render receives no total.
- The amendment is **dated and append-only** on the Phase 7 PRD — A10's original text is never rewritten, per program convention.

#### E.3 Purpose-wall refusal, never silent field-drop — enforced at both owning seams [D3.6]

A template or binding that references a field outside its class allowlist does **not** render with the field quietly omitted — silent field-drop _hides_ the compliance breach and ships a half-document. Instead:

- **Publish/bind time:** Phase 17 or Phase 18 validation refuses the binding against the exact purpose contract and source-field classification.
- **Preparation/render time:** the owning service **REFUSES** — the message/document remains blocked with one owner and safe action. Defense in depth catches classification/version drift, imports, or an adapter that skipped authoring checks.
- **CI: one refusal test per owning public seam** — Phase 17 message preparation and Phase 18 Generated Document service — asserting that an amount field in a notification and a deductibility field in an acknowledgment each fail atomically rather than disappear or render partially. The contracts and refusal tests ship before the first presentation.

#### E.4 The receipt wall — primary enforcement plus the schema tripwire [D1.11]

Two layers, deliberately redundant:

- **PRIMARY wall: the receipt-facts path structurally takes no `contribution_credits` input.** The Phase 7 source Facts Package type has no recognition-credit parameter; a lint and contract test prove that adding any number of soft-credit rows cannot change the receipt Facts Package digest. Phase 18 sees only that approved package, so soft credit cannot influence the generated artifact by construction.
- **TRIPWIRE: the `is_receiptable` column + DB CHECK stays** on `contribution_credits` (`is_receiptable = FALSE`, the Phase 7 A8 invariant), even though the primary wall makes it unreachable — a tripwire against a future refactor that re-plumbs the mint path. A **schema lint asserts the CHECK exists** (so a migration dropping it fails CI, not an audit three years later).

#### E.5 The typed render-input struct rule — letters never touch ledger merge fields [D3.6]

Acknowledgment- and notification-class documents render from a **TYPED render-input struct** assembled by their composer — names, addresses, gift count, the optional frozen `tribute_aggregate_total` — **never from live ledger merge-field resolution**. The v1 tribute letters (two fixed house templates: memorial condolence / honor celebratory — Section F) consume exactly `{names, addresses, count, optional frozen total}`. Consequences:

- The struct **is** the allowlist, enforced by the type system: a field the struct doesn't carry cannot render, whatever a template says.
- Composition freezes the source-owned facts package. Phase 18 stores and reuses the exact validated PDF bytes; history is never rerendered to claim byte identity. Phase 17 separately freezes prepared message evidence under its own contract.
- Receipts and statements keep their Phase 7/Phase 19 (Year-End Statement Operations) resolver machinery — this rule governs the two non-receipt classes Phase 14 ships.

#### E.6 Copy standard & accessibility acceptance criteria [D3.6]

- **Copy = the GOV.UK/DWP bereavement research standard:** say **"died"/"death" — never "passed away"**; plain, fact-first, **≤1 page**; celebratory framing is **honor-only** (never on memorial letters). House templates ship conforming; Phase 17 (System Messages & Template Management) editing inherits the standard as guidance.
- **Accessibility acceptance criteria (release-gating, not aspirational):** email renders meet **WCAG 2.2 AA**; print/PDF output is **tagged PDF**, **≥12pt**, single-column. These bind every document this PRD ships (tribute letters, advisor thank-yous, matched-employee thank-yous) and are restated as fixtures in the Testing & Poison Fixtures section.

#### E.7 Zero new template tables — the registry ruling [D3.6]

**No new template storage ships in Phase 14.** Ratified routing:

- **Email:** the **shipped Email Studio system-bindings registry** — REAL: `email_template_system_bindings` in `packages/api/src/email/template-store.ts` (the `EMAIL_TEMPLATE_SYSTEM_BINDINGS_TABLE` constant; `is_system` flag on templates). Phase 14 registers system bindings **`tribute.digest`** and **`tribute.honor_immediate`**; the Section D advisor thank-you and Section G matched-employee thank-you register on the same registry following the same key convention.
- **Print/PDF:** Phase 18's one clean Generated Document service and structured Document Purpose Contract. Current `packages/api/src/pdf-templates/*` and `packages/config/pdf-studio.ts` files are prototype anchors/removal targets, not the production foundation or a provider selection.
- **Phase 17 (System Messages & Template Management)** owns tenant message editing and delivery contracts. **Phase 18 (Receipt & PDF Template System)** owns tenant document authoring and exact artifacts. Phase 14 adds no template/artifact tables and therefore creates no migration burden.

**Real-vs-forward evidence (as of authoring).** REAL: `docs/guides/features/statement-studio/variables.md` (permission/sensitivity governance — the documented gap this section closes); `packages/api/src/email/template-store.ts` (system-bindings registry); `packages/api/src/pdf-templates/*` + `packages/config/pdf-studio.ts` (PDF render foundation); `packages/api/src/email/consent.ts` (consent gate). FORWARD: the document-class allowlist itself, the refusal tests, the typed structs, the `tribute_aggregate_total` field, and the Phase 7 A10 dated amendment (rides the D1.14 cross-PRD amendment package — OpenSpec & Docs Updates section). No claim here that document-class enforcement exists today: it does not, which is precisely the D1.11 finding.

### F. Tribute & memorial operations (D3) — setup-gated automated digests, the coverage ledger, and the second letter stream

**Founder ruling (RATIFIED 2026-07-10 — "ratify - take those points into consideration"):** tribute and memorial notification is a **setup-gated automated digest stream**. The one deliberate human moment is **tribute setup** — who gets notified, on what channel, with what preferences — and after that gate the platform composes and sends consolidated notification letters on an age-anchored cadence with no per-letter staff review. This is Option B of the D3 grill, hardened by a ruthless adversarial pass (workflow `wf_d2a57022-c30`; briefs in the session's `p14adv3/` record) into **fourteen binding amendments (D3.1–D3.14)**, all carried below. It is the second of the three-document wall's letter streams: Phase 7 (Receipt & Statement Compliance Rules + Donor Identity/Credit Model) A10 defines the **notification** class — tribute notify party, **amount hidden**, never a tax document — and Phase 14 makes it operational.

The research grounding (external agent brief, 2026-07-10): notification letters are **condolence-framed** and carry donor **names and addresses** (so the family can thank them), the fund, and a "donors have already been receipted" line; **per-gift amounts are never shown** (Little Green Light, Hospice NW, and UMaine practice all document this); an **aggregate total is a per-family opt-in** (UPenn Policy 2230; Blackbaud frames it as an optional capability; Nonprofit Issues calls it legal-but-a-PR-question). Cadence practice follows the ADRP decay ladder — weekly in the first month, monthly out to a year, annual after — with practitioners reporting weekly during the burst and "monthly is too long" early on; funeral homes hand the family a donor record; the medium is **print-first** (The Nature Conservancy mails at 2–3 weeks; notify parties skew older; the list is a keepsake). **No vendor ships notify-frequency or "don't notify" preference fields** — that is the differentiator opening D3.7 takes. Anonymous donors render unnamed ("an anonymous friend") while internal recording continues. Honor is not memorial: the honoree gets the letter **directly**, per-gift, immediate, celebratory in tone — and still never with amounts.

**Novelty posture (narrowed per benchmark):** DonorDock already auto-notifies per-gift straight from donor capture with zero gate — so auto-sending itself is not novel, and our setup gate makes this design **strictly safer** than the shipped market. What is genuinely first-in-market is the **digest cadence plus the per-notify-party preference model**.

Everything below binds to the credit spine in Implementation Decision A: the `contribution_tributes` link is **authoritative**; tribute credit rows are optional-per-tenant, annotation-class, generator-emitted, never manual; and **"acknowledgment/letter routing reads the TRIBUTE record (deceased-check), never credit rows"** [D1.12]. Document-class merge-field governance (the allowlist machinery this stream renders under) is owned by Implementation Decision E; the tribute-specific carve-out it must honor is D3.4 below.

---

#### F.1 — The model: reusable tributes, the authoritative gift link, notify parties, and the coverage ledger (D3.1, D1.12, D3.14)

Four objects, final names per D3.14 (plural snake_case; TEXT+CHECK, never native enums; composite `(tenant_id, …)` FKs throughout — see the Data Model section for full DDL):

- **`tributes`** — the reusable tribute record, RE NXT precedent: one tribute ("In memory of Robert Smith") receives many gifts over years. `tribute_type ∈ {honor, memorial}` (TEXT+CHECK) is the single source of honor-vs-memorial truth — there is **no role split** on the credit table [D1.13]. The honoree is a **party reference OR a name-only text field** (party optional — no junk parties minted for "in memory of Grandma"; a tribute credit row exists only when a real party does) [D1.12]. `tribute_type` is **immutable after the first letter**; an honor tribute whose honoree dies is closed and re-created through a **guided successor flow** (F.12). Stream columns (`state`, `next_due_at`, `last_letter_id`) live here (F.13).
- **`contribution_tributes`** — the authoritative per-gift link (gift ⇄ tribute), keyed to the Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) `contribution_headers` row. It carries the two **per-gift overrides**: `notify_party_override_id` ("notify my aunt for THIS gift" — Virtuous precedent) and the donor **display override** (per-gift display-name/anonymity override) [D3.8]. Composition input is **`contribution_tributes ⋈ contribution_headers` ONLY, never credit rows** — a tenant that has turned tribute credit rows off must never get empty letters [D3.11].
- **`tribute_notify_parties`** — who is watching this tribute. Renamed from Phase 7's `tribute_notifications` (see F.14 — the old name is RETIRED as ambiguous with sent letters). Each row carries: **source provenance** (`source ∈ {family_request, obituary, funeral_home, staff}` + `added_by`) [D3.9]; **channel** (email / mail); **frequency `∈ {stream_default, immediate, monthly, once, never}` + `paused_until` date** [D3.7]; **`include_total`** (the per-family aggregate-total opt-in, D3.4); and **`mail_status`** (returned mail pauses the row into a worklist, F.12). Partial unique: `UNIQUE (tenant_id, tribute_id, party_id) WHERE active` [D3.11].
- **`tribute_notification_items`** — the **coverage ledger** (new; no Phase 7 ancestor). Columns: `tenant_id, letter_id, notify_party_id, tribute_id, header_id`, plus two frozen render snapshots: **`rendered_donor_as`** (exactly what the letter called this donor) and **`letter_total_minor`** (the aggregate total as printed, when printed). The coverage grain is **`UNIQUE (tenant_id, notify_party_id, header_id)`**.

**Adjudication — why an explicit coverage table (5:1 among reviewers) instead of deriving coverage from Phase 6 (Shared Communication Event Model) relations:** backdated gifts land inside already-covered periods; the print channel has **no delivery event until physical fulfillment**, so "what content has been prepared" and "what has been sent" diverge by days; and the anti-join ("gifts not yet in any letter") is unindexable against generic communication relations. Phase 14 therefore atomically owns the purpose row and coverage items. A transactional outbox subsequently requests Phase 17 content, Phase 18 artifact generation when needed, and Phase 6 dispatch. The Phase 6 communication event is independently authoritative delivery evidence and links back through the stable purpose request key; it is not the Phase 14 letter row and need not exist in the same transaction [D3.1].

**Adjudication — why the grain is `(notify_party, header)` and NOT `×tribute`:** a "Mom and Dad" watcher who follows two tributes that both received the same gift is **told once**; and a tribute merge is **coverage-safe by construction** — no item rows need rewriting because coverage never keyed on the tribute. `tribute_id` stays on the item as a framing column (which tribute's letter carried the mention), not as part of the identity.

Cancelled letters **reopen their items in-transaction** [D3.1] — cancellation is never a silent coverage leak; the reopened gifts ride the next composition.

#### F.2 — Cadence: a pure schedule function, age-anchored pace, and no automatic stop (D3.3 + cadence adjudication)

**The ruling:** cadence is a **pure schedule function** — given the tribute's age, preference rows, and coverage state, it deterministically answers "when is the next letter due?" — **memoized as a stored `next_due_at`** on the tribute, advanced at letter mint. This reconciles the derive-camp's correctness argument (a pure function can be unit-tested exhaustively and never drifts from spec) with the scan-cost, import-watermark, and pause requirements that demand a stored column.

- **Age-anchored pace:** during tribute **weeks 0–4, letters compose weekly**; after that, a letter composes only when **≥28 days have passed since the last letter** and uncovered gifts exist. The pace anchors on the **tribute's age**, not on gift arrival — so a 1-gift-per-week trickle never means 52 condolence letters a year.
- **"NO automatic stop ever — an uncovered gift always eventually composes."** (Verbatim invariant.) There is no dormancy rung, no auto-close, no "tribute expired" state: a gift arriving three years after the death simply rides the ≥28-day pace, which at that arrival rate _is_ annual behavior — without any machinery to build, tune, or explain [founder don't-over-engineer posture].
- **Burst re-promotion is a staff suggestion, never automatic:** ≥5 gifts in 7 days on a quiet tribute surfaces a "gifts are arriving faster — compose now?" suggestion in the worklist; the scheduler itself never accelerates.
- **Compose-now:** a per-tribute **"compose consolidated letter NOW"** staff action exists (the funeral-home donor-record need — the family wants the list _at_ the service). It runs the same composer and **advances coverage**, so the scheduler structurally cannot double-send what the manual letter already carried [D3.3].
- **Stored states are human-meaning only:** `paused / closed / attention` are stored; `setup_incomplete` is **derived** (a tribute with no active notify rows is visibly awaiting setup, F.12), never a stored state that can rot.

#### F.3 — Exactly-once composition topology (D3.2)

The digest engine follows the transactional-outbox idiom the money path already established (the donation saga/outbox precedent is REAL in the repo per the Phase 13 PRD's evidence record; the tribute engine reuses the idiom, not the code):

1. **Cron scan** over a **partial index on `next_due_at`** (only tributes with a due date) at a **fixed tenant-local sweep time** [D3.9] finds due streams.
2. The scan emits **one Inngest event per `(tenant, tribute, notify_party, period_key)`** — per-stream granularity, so one poisoned stream never wedges a tribute, and one tenant's failure never blocks another's (**per-tenant fan-out**).
3. Each event's handler runs **one transaction** that mints the letter row — **`UNIQUE (tenant_id, tribute_id, notify_party_id, period_key)`** is the exactly-once anchor; a crash-retry lands on the conflict and becomes a no-op — **plus its `tribute_notification_items` rows in the same transaction** [D3.1]. At-least-once delivery composes to exactly-one-letter.
4. **Composition is cutoff-frozen:** the gift set is fixed at the period cutoff; a gift landing mid-compose waits for the next period — never a torn letter.
5. **Tenant `tribute_stream_paused` and the global kill switch are checked at compose AND again at the send/print seam** — a letter composed before a pause cannot leak out after it.
6. **Presentation reads the frozen item set only.** Phase 17 message preparation and Phase 18 generation consume the same immutable typed item facts and never live-query them. Preview uses synthetic or explicitly frozen preview data and is not archival proof. Once Phase 18 promotes an artifact, every open/print/retry returns those exact stored bytes rather than rerendering them.

#### F.4 — The aggregate total vs the Phase 7 A10 wall (D3.4 — BLOCKER resolved)

Phase 7 A10 makes the notification class amount-free by construction. Families, though, legitimately opt into a running memorial total ("N gifts totaling $X" — UPenn-style opt-in). D3.4 resolves the collision with a **dated Phase 7 A10 amendment** (riding the D1.14 cross-PRD amendment package):

> the **notification class gains exactly ONE governed field `tribute_aggregate_total`, renderable only when the notify row has `include_total = true`; per-gift amounts stay structurally absent; allowlist-lint asserts the single field.**

Mechanics (all binding):

- **Monotonic floor:** the printed total = `MAX(last printed total, live recognition fold)` — the fold being the one canonical D1.4 recognition read model (Implementation Decision A), keyed on the Phase 13 `effective_seq` cursor. If a refund drags the fold **below** the floor, the total line is **OMITTED from the letter and a staff task is routed** — **"a family never sees the memorial shrink."** (Verbatim invariant.)
- **Frozen per letter:** each letter states "as of this letter, N gifts totaling $X" and snapshots that figure into `letter_total_minor` on its items — the artifact and the ledger agree forever.
- **The `include_total` toggle is forward-only:** flipping it changes future letters only; no reprint, no retraction.

The allowlist enforcement machinery (lint, render-refusal, document-class registry) is Implementation Decision E's lane; D3.4 defines the single tribute carve-out it must encode.

#### F.5 — The mail channel (D3.5, first half) — a dated Phase 6 amendment

Tribute letters are **print-first** in the real world, and Phase 6 (Shared Communication Event Model) reserved a `channel` dimension for exactly this (REAL doc anchor: `docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md`, developer story 29 — "reserved `channel`, provider-adapter … dimensions"). D3.5 activates it via a **dated P6 PRD amendment** (rides D1.14):

- **Channel `mail`** joins the model, with statuses **`queued → printed → mailed / returned`**. Transitions are **manual staff acts** (there is no postal webhook) feeding the same **P6 monotonic status guard** that governs email (a late "printed" can never regress a "returned").
- **Channel-aware consent at print ENQUEUE belongs to Phase 6:** Phase 6 evaluates message-type **notification** for the mail channel — **`do_not_contact` + deceased + address-present, fail-closed; marketing opt-outs do not apply** (a notification is not marketing) — and freezes the consent snapshot onto its communication event exactly like email. The shipped consent gate (`packages/api/src/email/consent.ts` — REAL: message-type-aware, fail-closed) is the pattern Phase 6 extends. Phase 14 supplies the exact purpose, audience, readiness, and coverage request; it neither implements nor owns the consent verdict.
- A Phase 14 mail request with no postal address remains **`held` for recipient readiness + routed task, never a silent skip**. At release, Phase 6 re-proves address/consent and owns any suppression outcome — silence is how a family concludes nobody gave.

#### F.6 — Print custody is a governed export (D3.5, second half)

A printable batch of tribute letters is a file full of donor names and home addresses. It is treated as a **Phase 3 (Minimum Permission & Role-Scoped Projection Foundation) governed export**, not a download button:

- **Minted capability `finance:fulfill_tribute_letters`** gates the print queue (registered in the Permissions & SoD section's capability table).
- Batches are opened only through Phase 18's authenticated Asym artifact route. Every request re-proves current tenant, capability, custody scope, lineage, and artifact health before streaming exact bytes; no provider, Supabase signed-object, or bearer URL grants access. Every authorized or denied request writes identifiers-only access evidence (who, when, which batch—never letter contents).
- Print artifacts carry a **retention class with auto-purge after fulfillment** — the fulfillment copy is not an archive (the archival artifact is F.13's frozen render).
- **Cancelling a letter reopens its items in-transaction** (F.1) — custody cancellation and coverage are one atomic fact.

#### F.7 — Templates and letter copy (D3.6) — zero new template tables

**The debt trap resolved:** Phase 14 ships **ZERO new template tables**.

- **Email** letters submit typed Phase 14 meaning/facts to the Phase 17 message contract and Delivery Plan. The current `email_template_system_bindings` reader in `packages/api/src/email/template-store.ts` is REAL prototype/cutover evidence, not the target binding authority.
- **Print** letters submit `tribute.notification@1` facts through Phase 18's one Generated Document service. `vendor/react-pdf-packages/asym-pdf-studio-adapter/` and `packages/api/src/admin/contribution-operations/receipt-pdf.ts` are REAL non-production prototype/removal evidence under Phase 18 D17, not engines Phase 14 may call.
- **Two fixed house templates in v1** — _memorial condolence_ and _honor celebratory_ — consuming a **TYPED render struct** (names, addresses, gift count, optional frozen total). **Letters never touch ledger merge fields**: the struct is the only data path into a template, so a template cannot even ask for an amount.
- The **D1.11 notification wall is enforced with refusal at both owning public seams**: Phase 17 message preparation and Phase 18 generated-document admission. A presentation asking for a non-approved fact fails atomically before any send/artifact. This ships before the first letter.
- Phase 17 owns editable message content; Phase 18 owns editable generated-document definitions. They share the Phase 14 purpose/facts meaning without sharing a template table or runtime.
- **Copy standard** (GOV.UK/DWP bereavement research): **"died/death," never "passed away"**; plain, fact-first, ≤1 page; celebratory framing is honor-only. Accessibility: **WCAG 2.2 AA email; tagged PDF, ≥12pt, single-column print** (notify parties skew older).

#### F.8 — Notify-party preferences: suppression-grade `never` (D3.7)

The frequency vocabulary `{stream_default, immediate, monthly, once, never}` + `paused_until` (F.1) carries these semantics:

- **A pause is not a never:** `paused_until` is a date; the stream resumes by itself, and the accumulated uncovered gifts ride the next composition.
- **`once`** = one consolidated letter, then the row **auto-flips to `never`** — the "just tell me what came in from the funeral" case.
- **`never` is a SUPPRESSION-GRADE fact,** not a dropdown value: it stores **`reason` + `set_by` + `set_at`**; **unsetting it requires the tribute-manage capability and writes audit**; a **provenance chip** shows at setup and compose ("set to never by J. Park, 2026-05-02: 'family requested'"); and it is **checked by the consent gate at send** — belt and suspenders, so even a composed letter cannot reach a `never` row.
- **Removal is a tombstone** + stream-scoped suppression, never a hard delete; **re-adding the party requires acknowledging the prior removal reason** in the UI.
- **Staff adjudicate nothing in family feuds:** when relatives disagree about who should be notified, the platform records **who asked**, requires a reason, and audits the change — it takes no position and stores no editorial.

#### F.9 — Safety rendering (D3.8 + the restricted-donor adjudication)

- **Restricted-tier donor in a letter body = rendered EXACTLY as an anonymous donor** — "an anonymous friend," **counted** in the gift count. **Crowd-blending beats count-omission arithmetic**: omitting the row instead would let a family diff two letters and infer a hidden donor's existence. (Restricted-tier **honoree or notify party** is the opposite posture: full D1.10 **invisibility** — the tribute/notify row is omitted from egress and from staff below clearance entirely; see Implementation Decision A.)
- **Deceased checks cover the honoree AND every notify party, at compose AND at send.** A notify party dying mid-stream is the catastrophic letter — the double-check window exists because days can pass between compose and mail fulfillment.
- **Minors' addresses are always withheld** from letter bodies and appendices.
- **`share_address_in_tribute_letters`** is a per-donor flag, **default TRUE**, and **distinct from anonymity**: anonymous ⇒ neither name nor address; share-address=false ⇒ name yes, address no. The default-TRUE basis is transparency at the point of giving — the tribute gift form's fine print states that name and address are shared with the family (the research-documented norm: the address is _why_ the family gets the list).
- **Per-gift overrides** live on `contribution_tributes` (F.1): `notify_party_override_id` and the donor display override.
- **Anonymity flips after print are forward-only.** The `rendered_donor_as` snapshot on the item is the **immutable truth of what was said**; a donor going anonymous after a letter mailed gets **NO automatic correction letter — a correction re-broadcasts the name**. A staff banner on the tribute page records the flip instead. (This is the one deliberate carve-out from D2 guardrail 11's "offer a correction" idiom — see F.10.)

#### F.10 — Stream blast-radius bounds (D3.9)

Because letters auto-send, every bound that made D2's entry-gated auto-send safe is inherited:

- **Provenance in the letter:** the FIRST letter of a stream carries a provenance + how-to-stop line ("You're receiving this because Anne Smith asked us to keep the family informed — reply or call to change this"); **every** letter keeps the stop footer.
- **Fail-closed on any signal of wrongness:** an email bounce, returned physical mail, or a "who is this?" challenge flips the stream to **`attention`/paused, fail-closed, with a routed task** — the stream never keeps mailing into the void.
- **D2 guardrails (1), (3), (4), (6), (8), (10), (11) are reused VERBATIM** (their canonical statement lives in Implementation Decision D), instantiated for this stream as: **(1)** hold-then-send window on every letter (tenant-config, cancel from toast + tribute page); **(3)** per-stream letter state — **`{active, held, attention, ended}`** — with a work view, never fire-and-forget; **(4)** the P6 consent gate + bounce/complaint suppression, with suppressed/failed as **visible events, never silence**; **(6)** the first letter of any stream gets the **longer hold + outbox flag** (never a modal); **(8)** **imports never auto-send** (F.11); **(10)** every auto-sent letter = a timeline event on the notify party + the tenant-wide **"Sent automatically" outbox feed**; **(11)** the re-link flow (gift moved to a different tribute) offers "a letter already went to X — send a correction?" via the consent-gated correction-notice idiom — **except** anonymity flips, where F.9's no-correction rule overrides.
- **Passive preview:** the tribute page always shows the next composition plainly — "next letter composes Friday — 4 gifts, to Margaret (mail) + Tom (email)" — so automation is never a surprise.
- **Fixed tenant-local sweep time** — staff know when the machine runs.

The D3.9 per-stream letter state {active, held, attention, ended} is DERIVED per (tribute, notify_party) — ended = row tombstoned or frequency never; held = latest letter in held; attention = mail_status returned or bounce/challenge; else active. It is never a stored column; see the Data Model section's tribute_letters note.

#### F.11 — Import posture (D3.10)

**"Imported tributes arrive stream STOPPED; activation = explicit staff act."** (Verbatim.) A migrated book of memorials must never start mailing families on import day.

- A **`notified_through` watermark** and/or a **bulk coverage backfill** (items written with `source = 'import'`) mark historical gifts as already-communicated, so activation composes only genuinely new gifts.
- **`external_ref` + partial `UNIQUE (tenant_id, external_ref)` ship on `tributes`, `contribution_tributes`, and `tribute_notify_parties` in the FIRST migration** — idempotent re-import before any importer exists (the D1.1 discipline, for Phase 30 (Imports & Migration Tools)).
- **Poison fixture (binding):** import a tribute book → **zero sends — even after the tenant enables streams** — until a staff member explicitly activates each stream (or bulk-activates with the watermark set).
- Public tribute capture from the giving flow (when Phase 5 (Public Website Runtime Contract) plumbs it) is a reserved seam: donor-named notify parties land **quarantined behind staff review before any letter** — Phase 4 (Identity & Account-Claiming Foundation) A5 enumeration-safety inherited [D1 forward-carried scope].

#### F.12 — Setup & entry UX (D3.12)

- **Inline tribute create = 2 fields** — type + honoree name — and it **NEVER gates gift posting**. Money first; ceremony later.
- Incomplete tributes land in a **"Tributes awaiting setup" worklist** (the Attribution-Inbox idiom from Implementation Decision D) with a visible **"no one will be notified yet"** chip — the consequence is honest, the friction is a worklist, not a block.
- **Honor tribute + a real honoree party ⇒ a notify row is auto-created pre-checked** (frequency `immediate`; channel email if an address is known). Honor **print** batches weekly — "immediate mail" is a fiction the design refuses to pretend at.
- **Name-only honoree ⇒ stream off, no junk party** [D1.12]. When staff later resolve the honoree/family to real parties, the stream starts with a **catch-up consolidated letter** covering everything uncovered.
- **Memo-line memory** ("Smith memorial" on a check) matches against the tenant's **ACTIVE TRIBUTES only — never fuzzy person matching, never auto-create** — using D2's evidence-chip and ambiguity-hold controls **verbatim** (two plausible tributes ⇒ forced explicit pick). RE NXT's "Automatic Tribute Matching" validates the pattern.
- **Occasion** is a curated picklist (memorial, birthday, anniversary, graduation, …) plus an **internal-only** free-text note; **family-facing custom text is a distinct `family_message` field** set at the setup gate — internal shorthand can never leak into a condolence letter.
- **The tribute record page is THE ops surface:** a **dual-pane donor list** — internal view vs **as-the-family-sees-it** — so a staffer answering the phone reads from the family pane and structurally cannot leak an anonymous donor; stream states; the passive next-letter preview (F.10); compose-now (F.2); stop/resume.
- **Big-memorial rule:** above **~75 names (tenant-config)** the letter body becomes count + framing (+ opted-in total), and the **full name/address registry moves to an appendix in the same print bundle** — the keepsake list survives, the letter stays readable.
- **`mail_status` on notify rows:** a `returned` mark pauses the row and routes it to a worklist (F.10's fail-closed posture, at row grain).
- **Type flip honor→memorial** (the honoree died) = **close + guided successor**: the flow creates the memorial tribute, **carries notify parties across with re-confirmation** (each must be re-affirmed — grief changes who wants mail), and **does NOT carry coverage** (the memorial stream starts fresh). `tribute_type` is **immutable after the first letter**; a deceased-marked honoree **auto-pauses** an honor stream and routes a conversion task — the platform never mails a celebratory letter to a dead man's address.

#### F.13 — Observability & refund semantics (D3.13)

- **Stream columns** on `tributes` — `state`, `next_due_at`, `last_letter_id` — plus a **pure preview function** that runs the same composer read-only (what the passive preview and the compose-now confirmation both render; one composer, zero drift).
- **Data-health signals** (registered in the Phase 8 (CRM Operating Foundation) catalog — see the Observability & Data-Health section): **`tribute-notification-drift`** — uncovered gifts beyond pace + grace, and attention-aged streams — and **`stale-print-queue`** — letters stuck in `queued`/`printed` beyond threshold.
- **A frozen rendered artifact per letter** is retained under the P6 operational-retention class — what the family was actually sent is forever reproducible from storage, never from a re-render.
- **Refund after listing:** the item **stands as a historical fact** — no retraction letter, no item deletion; only the D3.4 total floor reacts (omit + task if the fold drops below the floor).
- **Refund before first listing:** the composer's **compose-time effective-state filter** drops the reversed gift, and a **`skipped_reversed` item** records why it will never appear — the anti-join stays clean without pretending the gift never existed.

#### F.14 — Naming, cross-PRD amendments, build order & the D3 fixture set (D3.14)

**Final names:** `tributes` / `contribution_tributes` / **`tribute_notify_parties`** / `tribute_notification_items` (new). Phase 7's `tribute_notifications` name is **RETIRED — ambiguous with sent letters** — and its notify-once flag is **generalized into frequency `once`** (REAL doc anchor: the old trio `tributes / donation_tributes / tribute_notifications` appears in `docs/prds/sitestacker-parity/phase-07-receipt-statement-compliance-and-donor-credit.md` under "New tables — credit, tribute, matching, DAF"; the rename rides the D1.14 dated amendment package, as does the P7 A10 single-field carve-out of F.4). **Sent letters ARE `communication_events`** — the items table is coverage, the event is the send (FORWARD: Phase 6 is groomed-not-built; its PRD gains the mail channel via the D3.5 amendment). Related-type literals in P6 follow the D1.14 renames (`donation_tribute` → `contribution_tribute` — reserved-not-built, free now).

**Build order (binding gate sequence; folds into the phase Build Order section):**

1. **Schema + census rows + external refs + the notification allowlist** — all constraints, the P3 census rows (fail-closed), the F.11 import identities, and the render-refusal allowlist **ship before any letter can render** (the D3.6 gate).
2. **Setup UI + MANUAL single letters through both owning seams** — the tribute page, the 2-field stub, and staff-composed one-off letters through the Phase 17 message contract and Phase 18 Generated Document service (proves both purpose walls with a human in the loop, without a Phase 14 renderer).
3. **Honor stream** — per-gift immediate, the simpler cadence.
4. **Memorial digest engine LAST, behind a per-tenant enable, default OFF.**

**The D3 poison-fixture set (9+, consolidated with the phase-wide inventory in the Testing & Poison Fixtures section):** forbidden amount/deductibility facts refuse at the Phase 17 and Phase 18 public seams; `never` = zero sends forever (including composed-then-flipped); deceased-recipient blocked at compose and at send; restricted-party invisibility end-to-end (and restricted-donor crowd-blend rendering); import → zero sends even after tenant enable; crash-retry creates exactly one covered letter occurrence; two tributes + one watcher + one gift ⇒ told once (the `(notify_party, header)` grain); cancel reopens items; fold-below-floor ⇒ total omitted + task.

**Real-vs-forward evidence (as of authoring).** REAL today: `email_template_system_bindings`, the PDF Studio/Unlayer/native prototype paths, the message consent gate, and the contribution-operation audit spine. Those presentation paths prove current seams only; Phase 17 and Phase 18 replace their authority and Phase 18 D17 deletes the document prototypes. FORWARD (groomed-not-built, named owner): Phase 13 contribution headers/lines and `effective_seq`; Phase 6 communication spine; Phase 3 projection/export governance; Phase 8 health; Phase 17 message authoring/delivery; Phase 18 generated-document authoring/artifacts/access; and Phase 30 imports. Phase 14 builds the tribute records, coverage, cadence, source facts, and eligibility. House presentation definitions belong to Phase 17/18, not Phase 14.

---

### G. Matching-gift operations (D4) — rung 2, expectancy lifecycle, settlement junction, payer-of-record

**Core ruling (D4): RUNG 2 — full org-owned machinery + a vendor-agnostic ingest socket; NO vendor contract this phase.** Research framed matching-gift tooling as a four-rung ladder: **defer / seam-only / embed vendor search / full vendor sync**. Phase 14 ships rung 2: the expectancy lifecycle, two-gift bookkeeping, employee recognition, aging, and program notes are owned by us, plus a ratified _event-shape_ socket so a future vendor feed plugs in without schema churn. Rungs 3/4 are reserved to Phase 31 (Platform API, Webhooks & Connector Framework). Market backdrop: Double the Donation acquired HEPdata in March 2025 (an effective employer-database monopoly — **seam, don't couple**), and DTD itself treats the CRM as the system of record — exactly the role this section builds. [D4]

> **Binding interpretive rider — verbatim.** Founder ratification: **"Ratify D4 as mentioned but don't over engineer. Continue."** This rider is a **binding posture for the whole section**: v1 = the _leanest compliant shape_ of every amendment, and the adversarial reviewers' cuts **stand** — six states not eight, **no ratio column**, **no archive table until a non-staff producer exists**, **an age-bucketed worklist instead of per-row tasks**, and **no proposal/approval queues**. Where an implementer faces a shape choice here, the smaller shape wins. [D4]

Underneath everything is Phase 7 (Receipt & Statement Compliance Rules + Donor Identity/Credit Model) A11, amended only where stated (G.5): a matched gift is **TWO donations, never merged** — the employee's origin gift and the employer's (or intermediary's) legally separate gift, each with its own hard-credit legal donor; the employee is recognized on the employer's gift via soft credit. The benchmark confirmed the two-gift model is the universal norm (CiviCRM, Salesforce, Blackbaud RE NXT, Virtuous). One guard carried from Section A, verbatim: **"Matching expectancy stages generate ZERO credit rows — only the received employer contribution soft-credits the employee"** [D1.12] — the RE NXT MG-pledge pattern is easily misread into recognition inflation at pledge time; we do not.

> **Real-vs-forward (as of authoring).** REAL: `contribution_operation_audit_events` exists today (`supabase/migrations/20260526132000_contribution_operations_core.sql:76`) — G.11 extends it, no second audit spine. REAL: the durable saga/outbox idiom exists at `packages/api/src/donate/saga.ts` (`donation_saga_outbox`) — reserved here for the _future_ auto-spawn path only (G.4). REAL (gap): `packages/api/src/stripe/webhooks.ts` handles no `charge.dispute.*` events — one more reason G.10 binds Phase 14 to Phase 13 domain events, never raw Stripe webhooks. REAL (absence): **zero** matching-gift / soft-credit / gift-credit product code exists in `packages/` — this section is net-new. FORWARD: the header/lines ledger, per-contribution advisory lock, effective-lines fold, five-axis lifecycle, and correction domain events are Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) PRD §§E–G — groomed, not built. FORWARD: the credit spine (`contribution_credits`, roles, amount classes, the D1.4 fold, D1.7 async generation) is Sections A/B of this PRD.

#### G.1 — `matching_gift_expectancies`: the tracker, renamed on purpose [D4.14, D4.7, D4.9]

**Rename ruling: Phase 7's `matching_gifts` → `matching_gift_expectancies`** (rides the D1.14 amendment package). Rows are **expectancies, never gifts** — a recorded _hope_ that a program pays, carrying zero money truth. The old name itself caused the phantom-money framing the adversarial pass kept catching (expectancy amounts drifting into revenue surfaces). The name is the first guard; the CI non-money gate (G.12) is the second.

Table shape (plural snake_case, TEXT + CHECK, integer minor units, composite-tenant FKs per house rules):

- `tenant_id` + `id`, with **composite `(tenant_id, …)` FKs on every party/header reference** [D1.9]: generators and locked functions run as `service_role`, so RLS will not save a bad join — the FK shape must.
- `employee_party_id` — the person whose gift triggers the match.
- `employer_party_id` — the org whose _program_ is expected to pay. After G.5 this is **program attribution, not payer identity**.
- `origin_header_id` — **NULLABLE** FK to `contribution_headers`. [D4.9] Pre-platform and DAF-paid origin gifts are real; entry **strongly encourages** linkage (defaults to the gift being entered) but never blocks. A null-origin expectancy works end-to-end (fixture).
- `expected_amount_minor` — **nullable**, with an **explicit `currency` column**. [D4.7] The expectancy predates its settling header, so Section A's "credit currency = header currency by construction, no column" rule is **documented as deliberately non-applied** (the D1.3 non-application). There is **NO `match_ratio` column** — the cut stands verbatim: a ratio column is a _"pretend-database"_ (caps, minimums, proration, per-cause exclusions defeat it); **ratio = program-notes prose**. `expected_amount_minor` is **advisory-only**: it never blocks `received`, never enters any money surface, and is registered in the D1.4 CI non-money gate. Variance = a **derived display at close** — no sub-machinery.
- `external_ref` + `external_source` — **one** identity pair with a partial UNIQUE over the pair (the D1.1 idiom) for import/socket identity. [D4.9] The strawman's `vendor_ref` is **DELETED**; raw vendor ids live in archived socket payloads (G.13); Phase 31 (Platform API, Webhooks & Connector Framework) vendor linkage arrives as generalized `crm_record_links` — **zero Phase 14 schema change** reserved for it.
- `expires_at` — **staff-set**, seeded at create from `match_claim_deadline` (G.8). [D4.8]
- `state`, `closed_reason`, `merged_into_id` — the G.2 machine.
- Program notes — free prose. Everything not `match_claim_deadline` **stays in notes**; **auto-behavior may read ONLY `expires_at`, never notes**. [D4.8]

**Dupe guards** [D4.9] — all in the S1 migration, before any UI:

- Partial **`UNIQUE (tenant_id, origin_header_id, employer_party_id) WHERE open`** — one origin gift never carries two live expectancies against the same employer.
- **Advisory warn-at-create** (same employee + employer with an open expectancy) — a soft warning, never a hard block: quarterly programs legitimately overlap.
- The socket **NEVER silently auto-creates when a candidate exists** — candidates route to triage/worklists (G.6/G.7).
- Duplicate resolution = **supersede-merge**: the loser moves to `superseded` with `merged_into_id`; settlements re-point to the survivor; nothing is deleted.

#### G.2 — The six-state machine [D4.3]

**State set (6, cut from 8):** `identified | submitted | received | reversed | closed | superseded` — TEXT + CHECK, never a native enum.

- `identified` — expectancy recorded; nothing filed yet.
- `submitted` — the claim was filed with the employer program.
- `received` — money landed: ≥1 settlement row links a real ledger line (G.3). Derived-by-write, never hand-set (trigger rule below).
- `reversed` — settled money fully unwound. **Legal ONLY when the expectancy's settled fold = 0** (the D1.6 amendment): a _partial_ refund surfaces **variance + a routed task, never a status flip**. Canonical case: a $200 refund against a 5-employee batch check defaults to the **per-line correction UI**, with whole-batch **proration behind an explicit confirm** — never silent.
- `closed` — with **`closed_reason` CHECK IN (`denied`, `expired`, `written_off`)**: a human gave up, reason recorded.
- `superseded` — with `merged_into_id`. **The ONLY never-reopenable terminal**, existing solely for dupe merges.

**Transition rules:**

1. **Money always wins.** Linking a settlement to a `closed` or `reversed` expectancy **re-enters `received`** (audited via G.11). A check arriving eight months after write-off is the _normal_ happy ending, not an exception.
2. **`received`/`reversed` are UNREACHABLE via plain UPDATE.** A `BEFORE UPDATE` trigger **RAISEs** on direct writes — **only the settlement-writing locked function and the Phase 13 domain-event consumer set them.** This kills phantom-received bricking outright: no staff edit, import script, or console poke can mark "money arrived" without a settlement row behind it. (`service_role` bypasses RLS — the trigger is the floor, the Phase 13 lesson.)
3. **NO automatic transitions in v1.** Nothing auto-expires, auto-closes, or auto-submits; `expires_at` drives _display_ (G.8), never state.
4. `employer_verified` is **CUT** — a vendor-side fact with no feed at rung 2; when a feed exists, verification arrives as **socket metadata, never a state**.

#### G.3 — `matching_gift_settlements`: the junction that replaced the spawn column [D4.1]

**Ruling: a settlement junction replaces the strawman's 1:1 `spawned_header_id UNIQUE` column**, which dies on the **first real batch check** (one employer check covering N employees) and on quarterly installments (one expectancy paid across two checks) — the _ordinary_ shapes of program money.

- `matching_gift_settlements` (`tenant_id`, `id`, `expectancy_id`, `header_id`, `line_id`) — **composite tenant FKs in both directions** (to expectancies, and to the Phase 13 lines table via its `UNIQUE (tenant_id, header_id, id)` key — a Phase 13 PRD amendment riding D1.14) [D1.9].
- **`UNIQUE (tenant_id, line_id)`** — verbatim: **"a line settles ≤1 expectancy."** A same-line double-link collapses to one settlement (fixture).
- **NO amount column** — verbatim: **"the line IS the amount."** A settlement is a link, not a money row; copying the amount would mint a second money truth that drifts at the first correction.
- **Deliberately NO `(expectancy_id, header_id)` unique** — **one expectancy MAY be settled by 2+ lines of one header** when the match mirrors a split origin gift (employee gave $100 split $60/$40 across two designations; the check carries two mirrored lines settling one expectancy).

**Fulfilled total = a derivation over effective line amounts** — the D1.4 idiom verbatim: fold the settlements' lines through the Phase 13 effective-amounts fold (keyed on the `effective_seq` cursor). A refund on the settling header shrinks the fulfilled total automatically — **refund-proof by construction, never a cached counter**. No `fulfilled_amount_minor` column exists anywhere.

**`matched_employee` credits are line-scoped, generated FROM settlements** via the Section A/B generator (D1.7 async fan-out). Per D1.12 (intro), **no credit exists at any stage before `received`**.

#### G.4 — Received topology: an ordinary ledger entry, not a saga [D4.2, D1.8]

**Ruling (dated D1.8 restatement): staff-entered "match received" is an ORDINARY Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) entry transaction.** One transaction, under the **new header's per-contribution advisory lock** (the same discipline as the Phase 13 axis RPC), writes header + lines (payer as legal donor per G.5) + settlement rows + expectancy transitions. Touched expectancies are locked **`FOR UPDATE ORDER BY id`** (deterministic order — no deadlock between two clerks entering overlapping batches) with **`lock_timeout` set** so a stuck entry fails fast.

- The **spawn-saga wording survives ONLY for the future auto-spawn path** (a socket event creating the employer contribution with no human at the keyboard), reusing the shipped saga/outbox idiom (REAL: `packages/api/src/donate/saga.ts`), **re-keyed `tenant + ingest_event_id`**. NOT built in Phase 14 — the staff path needs no saga because the human retries their own form.
- **Credit minting is ALWAYS async** via the D1.7 outbox/Inngest fan-out — **uniform path, no small-N special case**. Even a single-employee match mints asynchronously: the money path never fails on recognition; recognition is eventually consistent; one path = one set of idempotency/crash-resume tests.
- The `received` transition is written by the settlement-writing `SECURITY DEFINER` locked function — the only writer the G.2 trigger admits (besides the domain-event consumer).

#### G.5 — Payer-of-record: the dated Phase 7 A11 amendment [D4.4]

**Ruling: the spawned/linked contribution's legal donor = the PAYER OF RECORD (defaulting to the employer).** A dated amendment to Phase 7 (Receipt & Statement Compliance Rules + Donor Identity/Credit Model) A11 (rides D1.14), correcting a real-world falsification of a Section B absolutism: genuine match checks arrive **FROM intermediaries** — the GE Foundation pays GE's matches; Benevity administers many employers' programs and disburses on their behalf. Recording the employer as legal donor when Benevity's check cleared the bank would be a factually wrong hard credit — and hard credit is receipt-owning legal truth (Phase 7 A8).

- Header's frozen legal donor = **whoever actually paid** (employer, or the intermediary org party).
- The expectancy **keeps `employer_party_id` as program attribution** — "how much did GE's program generate" reports correctly regardless of who cut the check.
- **An intermediary-paid line CAN settle an expectancy** — the junction does not require `header.donor = expectancy.employer_party_id`.
- **The role distinction is per-LINE nature, not per-check** [D4.4]: on one Benevity disbursement, match lines settle expectancies and generate `matched_employee` credits, while payroll-giving lines (no expectancy) generate `workplace_giving_donor` credits (Section B: payer is hard-credit, employee recognized). **Benevity disbursements MIX both kinds of line in one check** — the documented normal, and why classification cannot live at header grain.

#### G.6 — ONE payer-intelligence registry: `party_payer_aliases` [D4.5]

**Ruling: Section D's DAF sponsor-alias child generalizes into ONE shared registry — `party_payer_aliases`** — org-party-keyed, **`payer_kind ∈ {daf_sponsor, workplace_giving_intermediary}`** (TEXT + CHECK). One table, **ONE matcher, ONE one-click triage surface** — the Section D (D2) alias-triage idiom **verbatim**, never a parallel matching stack. (Section D owns the base mechanics; this section adds the second `payer_kind` and the match-path hints.)

- **Per-tenant seeds** (suggestions only — D1.9's tenant-scoped-forever ruling; never a shared global registry): **Benevity, AOGF, YourCause / Blackbaud Giving Fund, America's Charities, Bright Funds, FrontStream / CyberGrants, Fidelity Workplace**.
- **Bidirectional blocking hints, never silent** [D4.5]: an intermediary hit **on the match path** raises a blocking hint with a required **reason-to-override** — in **both directions**. Entering a Benevity check as a plain donation warns "this payer is a workplace-giving intermediary — expecting match/payroll lines?"; pushing a `daf_sponsor`-aliased org through match-received warns the other way (a DAF grant is not a match — Section D's lane). Staff override with a reason; the system never silently misfiles.

#### G.7 — Entry UX: one checkbox in, suggestion-driven out [D4.6]

**Expectancy create = ONE checkbox on gift entry.** "Employer match expected" → an employer combobox **prefilled from the Phase 9 (Full CRM Depth & Relationship Graph) employment relationship edge, with an evidence chip** (the Section D provenance-chip idiom). **Zero other required fields** — no amount, no ratio, no deadline at create. The rider applied to capture: recording an expectancy costs one keystroke past the checkbox.

**Received entry = a Find-Matched-Gifts-style suggestion surface** (the RE NXT pattern): money from an employer/intermediary payer surfaces the **open expectancies for that employer, aggregated per employee** — the NPSP #5796 lesson (Salesforce's duplicate-soft-credit bug class) as UI shape: staff pick from existing expectancies instead of free-keying links, so idempotent match-linking is the default gesture.

- **Inline retro-create-directly-in-received** (same transaction): the check names an employee with no recorded expectancy → staff create it inline, born settled. This is the ratified low-friction default; the system **never spawns an employer contribution without an expectancy** — the expectancy is the recognition anchor, and the inline create keeps the invariant at the cost of one row of typing.
- **Unlinked-match-lines worklist**: match-looking lines on a payer whose org party is flagged `is_matching_gift_company` (employer-program metadata lives on the org record — the Salesforce precedent) but settling nothing → an **"unlinked match lines" worklist** (finite, owned — the Section D Attribution-Inbox idiom), not per-line tasks, not silence.
- **Phase 14 OWNS a minimal single-header multi-line employer-check entry surface.** REAL (absence): the repo has no manual multi-line gift-entry surface at all; the G.4 batch flow is unusable without one, so Phase 14 ships the _minimal_ version — one header, N lines, per-line employee/expectancy linkage. **Phase 15 (Offline Gift & Batch Entry) owns the fast keyboard-first grid**, and this PRD names the contract now: the grid exposes a **per-row match-capture cell** honoring this section's semantics (suggestion, retro-create, settlement write-through). REAL anchor: `docs/prds/sitestacker-parity/roadmap.md` (Phase 15 section, ~line 888) already specifies "per-row DAF/soft-credit/tribute/matching capture (14)".
- **Phase 20 (Accounting Exports & Reconciliation): expectancies are invisible to exports.** They are not money.

The suggestion surface also lists received expectancies whose settled fold is below expected_amount_minor (quarterly-installment continuation, D4.1); the dupe-guard partial UNIQUE stays scoped to identified|submitted only.

#### G.8 — Aging: a worklist, not a task storm [D4.8]

**Ruling: NO per-expectancy tasks.** Per-row 90-day reminders die on quarterly-check reality — most programs disburse quarterly or annually, so tasks fire on healthy expectancies and train staff to dismiss the queue. Instead:

- **ONE age-bucketed worklist** (the Attribution-Inbox idiom verbatim), **aging highlight default 180 days, tenant-configurable**.
- **Named owner: development staff** — match follow-up is a fundraising job; an accountable audience is what makes a worklist work without nagging.
- **`expires_at` is staff-set**, seeded from **`match_claim_deadline` — the single structured field on the employer org record** (programs cap claims at year-end or gift-date + N months). Everything else stays prose in notes; repeated from G.1: **auto-behavior may read ONLY `expires_at`, never notes**. Past-`expires_at` rows sort to the top for a human `closed(expired)` decision — no auto-close (G.2 rule 3).

#### G.9 — Privacy: employment is a stored fact about a person [D4.10]

**An expectancy is a stored employment fact** — "this person works for this employer," persisted at gift grain.

- **Census sensitivity**: the Phase 3 record-type census rows for both tables classify employer-linkage fields **sensitive**, fail-closed per D1.10 — an undeclared surface gets nothing.
- **Restricted-tier employee ⇒ the expectancy is INVISIBLE below clearance** — D1.10 invisibility, not aliasing (an aliased row still confirms the employment relationship). Includes **aging-worklist suppression**: no count or "N hidden" residue may leak a restricted person's existence to under-cleared staff.
- **Employer-facing surfaces and receipts NEVER itemize employee identities.** The payer's receipt and any employer-facing surface show _their_ legal gift — never a roster of which employees triggered which lines. **Invariant + poison fixture written in S1, before any org-facing surface exists.**
- **Employee thank-you = the Section D (D2) guardrail set, verbatim** (hold-then-send, acknowledgment-as-state, consent gate), plus this stream's specifics: **amount omitted by default** (tenant merge-field toggle), **designation via `toPublicProjection` alias only** (Phase 10 (Sensitive-Data Classification & Restricted-Ministry Safety Foundation) firewall), and **origin-gift anonymity inherited onto the `matched_employee` credit** — an anonymous origin donor's match recognition stays anonymous everywhere.
- **NO donor-portal or missionary-workspace matching surfaces in v1.** The employee-donor's moment ("Emily's moment") is the received thank-you, full stop. Phase 25 (Donor Dashboard Depth) and Phase 27 (Donor Development & Portfolio Management) revisit exposure **through the named read model** (G.12), never the tables.

#### G.10 — Reversal chain: Phase 13 domain events ONLY [D4.11]

**Verbatim binding: "P14 consumes P13 domain events ONLY."** When money that settled an expectancy unwinds — refund, NSF, ACH return, chargeback — Phase 14 learns it from Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) correction/reversal **domain events on the employer header**, never raw Stripe webhooks. The consumer re-derives the settled fold (G.3): fold = 0 → `received → reversed` (the only writer besides the locked function); fold > 0 → variance + routed task (G.2).

- **Acceptance criterion (non-negotiable): the domain-event stream includes MANUAL check-bounce corrections, not just Stripe events.** Employer match checks are disproportionately _paper_; a staff-entered NSF correction must emit the same event a Stripe refund does, or the reversal chain silently excludes the dominant tender. (An explicit demand on Phase 13's correction service, riding D1.14; REAL context: `packages/api/src/stripe/webhooks.ts` has no `charge.dispute.*` handling today, so webhook-coupling would be doubly wrong.)
- **Origin-gift reversal → "origin reversed" flag + routed task, NEVER auto-cancel.** If the _employee's origin gift_ reverses after the claim, a human decides whether the employer claim dies with it (programs differ on clawback). Mechanically: **extend the D1.6 correction-event subscription to `origin_header_id`**.

#### G.11 — Audit: one spine, polymorphic subject [D4.12]

Pre-`received` transitions (`identified → submitted`, `closed`, merges, G.6 hint overrides) need an audit home — but **not a second audit spine** (D1.5 preserved). Ruling: **extend `contribution_operation_audit_events`** (REAL: `supabase/migrations/20260526132000_contribution_operations_core.sql:76`) **with a nullable polymorphic subject** — `subject_type` / `subject_id`, composite tenant FK — so expectancy events ride the shipped spine. Post-`received` events ride it naturally, occurring inside ledger transactions.

#### G.12 — Read model + data-health signals [D4.13]

**`getMatchingActivity` is the SOLE consumer interface** for matching data — pipeline facts (per-expectancy state, settlements, variance) and funnel aggregates (identified → submitted → received conversion, aging distribution). Consumers: Contribution Detail, the Phase 9 (Full CRM Depth & Relationship Graph) Giving tab, and the named seam for Phase 25 (Donor Dashboard Depth), Phase 27 (Donor Development & Portfolio Management), and Phase 33 (Reporting & BI / Report Studio). Two structural exclusions:

- **Excluded from BOTH money vocabularies** — expectancy amounts appear in neither **Legal giving** nor **Recognition giving** (Section C), and `getMatchingActivity` is registered in the D1.4 CI non-money gate. **Expectancies never ride `getPartyCreditActivity`** — pipeline hope and recognized giving are different read models by construction.
- **Per-party recognition rollups = MAX-per-(party, header) across roles** — a person who is both `matched_employee` and the employer's `org_contact` on one header is never double-counted (fixture).

**Three data-health signals** ship into the Phase 8 (CRM Operating Foundation) data-health catalog socket:

1. **`matching-expectancy-aging-stall`** — _data-derived_ from the rows themselves (oldest untouched open expectancy beyond threshold), so **a dead aging job self-reports**: if the pipeline breaks, the signal fires precisely because nothing moves.
2. **`matching-ingest-quarantine-age`** — oldest unresolved socket quarantine item (G.13); an unworked quarantine is an integration silently down.
3. **`matching-fulfillment-drift`** — settled folds disagreeing with expectancy state (e.g., fold > 0 on a non-`received` row) — the invariant-violation detector.

#### G.13 — The ingest socket: an event-shape contract, ratified now, built thin [D4.14]

Rung 2 ships **the contract, not the connector** — ratified now so Phase 31 (Platform API, Webhooks & Connector Framework), a CSV importer, or a staff bulk tool can produce into it without renegotiation:

- **Versioned, typed payload** — explicit `schema_version`, typed fields, no pass-through blobs into domain tables.
- **Tenant comes from the per-tenant registration, NEVER from the payload** — verbatim invariant. A payload claiming a different tenant is discarded as malformed. (Generators run as `service_role`; payload-trusted tenancy would be a cross-tenant write primitive.)
- **`quarantine` ≠ `dead_letter`** — two lanes: **quarantine = a human decision is needed** (ambiguous employee match, dupe candidate per G.1 — feeds the G.12 age signal); **dead_letter = the machine crashed** (malformed payload, processing exception — an engineering pager, not a staff worklist). Conflating them buries operator work under engineering noise and vice versa.
- **NO synchronous match/no-match echo** — the socket never answers a producer's "does this person/expectancy exist?" in-band: that is an enumeration oracle over donor data (Phase 4 (Identity & Account-Claiming Foundation) A5, inherited).
- **The raw-payload archive table is DEFERRED until the first non-staff producer exists** — the cut stands. Staff entry needs no payload archive; the first vendor feed ships it, and G.1's `external_ref`/`external_source` pair is already reserved to join against it.

#### G.14 — Donor-facing copy + explicit non-goals [D4.14]

**Religious-exclusion honesty is a copy requirement.** Employer programs frequently exclude religious organizations — documented in GE Foundation program guidelines and Double the Donation's own faith-based guidance — and our tenants are missions organizations. Donor-facing matching copy ships the ratified sentence: **"Many programs exclude gifts to religious organizations — a match is never guaranteed."** There is **NO "double your donation" default banner** — the vendor ecosystem's growth-marketing default would over-promise to exactly this donor base; tenants opt _into_ matching promotion.

**Non-goals (one line each, per the ratified scope):**

- **Volunteer grants ("Dollars for Doers") are OUT** — triggered by volunteer hours, not gifts; no expectancy semantics apply; reserved to Phase 31 (Platform API, Webhooks & Connector Framework).
- **Payroll-deduction giving is OUT as a program surface** — recurring workplace deductions are not matches; the money already flows through the **`workplace_giving_donor` lane** (Section B / G.5); program tooling reserved to Phase 31 (Platform API, Webhooks & Connector Framework).

#### G.15 — Build order: S1–S4, kill switch named [D4.14]

Four slices, strictly ordered, each shippable and safe alone:

- **S1 — Schema + census + constraints + locked function.** Both tables, all G.1/G.3 constraints (**every constraint in the FIRST migration**, D1.1 discipline), the G.2 trigger, Phase 3 census rows (fail-closed), composite-tenant-FK negative tests, the settlement-writing `SECURITY DEFINER` locked function, and the employer-never-itemizes invariant fixture. No UI.
- **S2 — Tracker CRUD + worklist.** Expectancy create (G.7 checkbox), transitions except `received`/`reversed`, the aging worklist (G.8), warn-at-create, supersede-merge. Mints zero credits, zero money.
- **S3 — Received flow + credits + acknowledgment.** The G.4 entry transaction, the minimal multi-line employer-check surface, settlement writes, async `matched_employee` credit generation, the D2-guardrail employee thank-you, the G.10 event consumer. **The ONLY credit-minting slice — kill switch = disable the credit generator**: with it off, money entry, settlements, and state transitions all keep working; only recognition rows pause (eventually consistent by design, D1.7). No other slice needs a switch because no other slice mints anything.
- **S4 — Socket + payer hints.** The G.13 endpoint (quarantine/dead-letter lanes, no archive table), the G.6 `party_payer_aliases` generalization + seeds + bidirectional hints, the remaining two data-health signals.

The ~10 D4 poison fixtures (expectancy-never-in-any-fold; received double-fire = one settlement set; batch 1-header/3-lines/3-expectancies = exactly 3 bounded credits; reversal → fold-zero without row deletion; Benevity-through-match-path blocked absent reason-to-override; import = zero sends and zero credits; cross-tenant service-role join rejected; same-line double-link = one settlement; null-origin end-to-end; variance never blocks received) are enumerated with the consolidated program set in **Testing & Poison Fixtures**.

---

_(This block covers D4 in full. The credit rows it generates live on the Section A spine with Section B roles; the alias registry it generalizes is Section D's; the acknowledgment stream it reuses is Section D's D2 guardrail set; `finance:manage_matching_gifts` and SoD pairs are consolidated in Permissions & Separation of Duties; table rows join Data Model & Ownership Matrix.)_

### H. Church remittances & the missionary supporter roster (D5) — attribution truth in the CRM, cleanly projected to the missionary dashboard

**Founder ruling (RATIFIED 2026-07-10, consolidated close-out):** there are **NO member thank-you letters at all** — the founder dropped even the tenant toggle ("I don't think there's a need"), superseding the church-member acknowledgment stream that D2 had provisionally reserved (see Implementation Decision D.14 and section J). THE requirement instead: when the church provides the member breakdown, it is **(1) recorded in the CRM as the attribution truth, and (2) cleanly passed to the missionary dashboard** — members appear in the missionary's donor/supporter list with their giving info, **"perfectly aligned and tied closely to the records"**, very visible on BOTH the missionary dashboard AND Mission Control. The founder demanded deep research and edge-case hunting on the best mechanism before ratification ("this is a very crucial phase"); the hardening pass ran as workflow `wf_7e3f6fa5-88d` (briefs in the session's `p14d5/` record), and everything below carries its output.

**The moat context (market finding, D5 design pass):** member-level via-church visibility is a **GENUINE MOAT** — the entire missionary-tool ecosystem (TntConnect / MPDX / DonorElf / Karani, fed by DonorHub) is **structurally locked to donor-of-record grain**. TntConnect's OFFICIAL documented recourse for member attribution is **entering NEGATIVE GIFTS to fake it** (documented at tntware.com, `gifts_dealingwith.aspx` — the benchmark's own help page teaches users to enter a negative gift against the church and a positive gift against the member to force the roster to look right). DonorHub, the data spine feeding those tools, delivers gifts at donor-of-record grain, so no downstream tool can do better than the hack. Because our CRM and missionary dashboard share **one database**, the differentiator costs **one read model, not a pipeline format war** — the roster below is that read model.

Everything in this section binds to the credit spine (Implementation Decision A), the `church_member` allocation class (Implementation Decision B), and the two-vocabulary rule (Implementation Decision C). Nothing here creates a second attribution store, a roster table, or a sync job.

#### H.1 Attribution capture — the tender carries payer metadata only; `contribution_credits` is the SOLE stored truth [D5, D1.14]

Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) ratified the `church_remittance` tender with per-line soft-credit attributions `[{party_id, soft_credit_amount}]` described as "a reporting overlay on the lines" (REAL anchor: `docs/prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md`, tender metadata table — the `church_remittance` row — and the D8 tender block restating the overlay). The D1 adversarial pass surfaced the collision with P13 D3.13 ("soft credits live in a separate table keyed to the header — never a line, never in the sum") and resolved it; the resolution rides the D1.14 cross-PRD amendment package as a dated P13 amendment, binding here:

> **The `church_remittance` tender attributions become capture-INPUT only — `contribution_credits` is the SOLE stored truth.** [D1.14]

Concretely:

- **The tender row keeps payer and delivery-input metadata only:** the remitting-church party id (the payer, and per Phase 7 (Receipt & Statement Compliance Rules + Donor Identity/Credit Model) A8 the **hard-credit legal donor** — the receipt goes to the church), `check_number`, distinct optional `postmark_date`, staff-attested `mailing_date`, `received_date`, and the provisional-until-cleared payment posture. The exact issuer's Phase 7 jurisdiction contract selects the permitted delivery basis and blocks when required evidence is missing; church remittances never imply a global postmark rule. The attribution array is an **input contract to the credit generator** — it is consumed at entry and never stored on the tender or the line. There is no second place where member attribution can live, so the CRM and the roster can never disagree with each other by construction.
- **Member attribution = `church_member` credit rows,** allocation class per Implementation Decision B.2: `amount_minor` **required and bounded — member rows under one remittance line sum ≤ that line's effective amount**, enforced by the generator AND a deferred constraint trigger (a generator bug must not be able to over-allocate a line). Line-scoped (`line_id` set) — the remittance attribution editor is one of the three named flows permitted to set `line_id` [D1.2].
- **Under-attribution is legal.** A church that remits $2,000 and breaks down $1,700 of it produces member rows summing to $1,700; the $300 remainder is simply unattributed — a legitimate, visible state (the FINANCE view shows the attributed/unattributed split; H.5 governs who else may see that arithmetic). Nothing forces a fake "unknown member" row, and nothing blocks posting.
- **Generation is async fan-out** per D1.7: the remittance posts on the money path synchronously; member credits mint through the outbox/Inngest fan-out with a `credit_generation_runs` record and full-target-set idempotent upsert (the 200-member die-at-117 case resumes without duplicates). The permanent posture is: **money never fails on recognition; recognition is eventually consistent; a Phase 19 informational run freezes the exact reviewed recognition cursor.** [D1.7; Phase 19 D15]

#### H.2 Entry guards — copy-last-remittance, CSV staged preview, one confirm, per-row ambiguity holds [D5]

The design load case is the real one: a church remitting for **~20 members every month**. Keying 20 member rows by hand monthly is the failure mode that kills adoption, so entry ships two accelerators and one safety posture:

- **The D2 picker, verbatim.** Each member cell is the Implementation Decision D.2 combobox — search-as-you-type with quiet candidate rows, inline create-new with dupe alert, evidence chips on auto-matches, ambiguity holds when two candidates clear threshold. No new picker is built; the DAF attribution control and the remittance member control are the same component.
- **Copy-last-remittance.** Month 2+ prefills the entire member breakdown from the church's previous remittance — **confirm-not-retype**: the staff member adjusts the two lines that changed and confirms, instead of re-keying twenty. (This is the remittance sibling of D2's fund-name memory: the prior confirmed breakdown is the provenance-backed suggestion.)
- **CSV paste → staged preview → ONE confirm.** Churches send spreadsheets. Pasting one produces a **staged preview classifying every row as matched / create-new / ambiguous**: matched rows show the matched party with an evidence chip; create-new rows are flagged with any dupe suspicion; ambiguous rows hold. Bulk creation happens behind **one explicit confirm** covering the whole batch — with **per-row ambiguity holds, so one bad name never blocks the batch** (the nineteen clean rows post; the ambiguous one lands in a hold state for individual resolution).
- **Member parties are CREATED, not held** [D5 — founder's visibility ruling wins]. A name-only member row ("J. Smith, $50") creates a real party rather than parking the attribution: the founder's requirement is that members are _visible on the roster now_, and Phase 4 (Identity & Account-Claiming Foundation)'s claim flow can bind a login to that party later. Every remittance-created party is **provenance-stamped** (source = remittance, creating remittance/header reference, created_by) and **enters the Phase 9 (Full CRM Depth & Relationship Graph) dupe-review stream eagerly** — creation is never silent, and the dupe queue sees remittance-minted parties the day they appear, not at some future cleanup.
- **The fast grid is a Phase 15 seam, not a Phase 14 build.** Phase 14 ships the remittance attribution editor as a correct, guarded single-remittance surface; the high-throughput batch grid belongs to Phase 15 (Offline Gift & Batch Entry), which consumes the same named contract (the attribution array as capture-input + the D2 picker cell). This mirrors D4.6's per-row match-capture cell posture: Phase 14 defines the cell contract, Phase 15 owns the grid.

#### H.3 `getSupporterRoster` — the full specification [D5]

**`getSupporterRoster(missionary_scope, lens)`** is a **named read model** — the **designation-centric dual of `getPartyCreditActivity`** (Implementation Decision C.2 answers "what has this party given?"; the roster answers "who supports this missionary?"). It is named in C.4; this is its owning specification.

**Substrate — SAME substrate, ZERO copies.** The roster is a query shape, not a table: **hard-credit effective lines (the P13 fold) UNION `contribution_credits ⋈ lines ⋈ headers` through the ONE D1.4 recognition fold, keyed on the P13 `effective_seq` cursor** — cursor-invalidated like every P13 read model. **No roster table, no counters, no nightly rebuild.** (FORWARD: the `effective_seq` cursor and fold are the Phase 13 PRD's cached-effective-read-model contract, §E rule 8 — groomed, not built.) A correction that changes the fold advances the cursor, and the roster is correct on the next read; there is no pipeline to drift.

**Grain — ONE row per `(tenant, missionary_scope, party)`.** Mrs. Jones who gives directly AND through her church is **one row**, with the mechanism detail carried in `paths[]`. The path shape, verbatim from the ratified design:

> `paths[]` inside **{path_kind: direct|church_member|daf_advisor|matched_employee|workplace_giving|household; via_party; legal_minor (direct only); recognized_minor (D1.4 fold, 0 on reversal); first/last/count}`**

- `path_kind` names the mechanism; `via_party` names the intermediary (the church, the DAF sponsor, the employer, the workplace-giving intermediary, the household) and renders as the **via-chip** ("via First Baptist Church").
- `legal_minor` is populated **on the direct path only** — the only path where this party is the hard-credit legal donor.
- `recognized_minor` is the D1.4 recognition fold value, **0 when the underlying scope is reversed/voided** — a refunded remittance line zeroes its member paths without deleting any credit row.
- **Double-count is structurally impossible:** paths reference different headers; allocation rows are bounded ≤ their line (B.2); the household path rides the MAX-per-(party, header) rollup (C.5). No path can count the same money twice.

**Vocabulary discipline** [D1.4, C.1]: roster **AGGREGATE tiles speak Legal vocabulary only** (the designation's real money = the P13 hard-credit fold); **per-row display speaks Recognition with via-chips**. Both reads are **registered in the CI non-money gate** — a raw-table roster sum fails CI. This is the worked example of the two-vocabulary rule: the top-of-page total and the sum of the rows are _allowed to differ_, because one is money and one is recognition, and the UI labels them as such rather than forcing a false reconciliation.

**The "perfectly aligned" acceptance fixture (BLOCKER-class):** **every roster row's path sums ≡ `getPartyCreditActivity` filtered to scope, both lenses.** The founder's "perfectly aligned and tied closely to the records" is not a vibe — it is this fixture: the party-centric view and the designation-centric view are duals over one substrate, and the test suite proves they can never diverge.

#### H.4 Churn policy — `supports_policy_v2`, minted for the roster only [D5]

Phase 9 pinned **`supports_policy_v1` = "a settled (adjustment-folded) gift in the trailing 365 days OR an active pledge/recurring commitment"** as the named, versioned derived-edge policy (REAL anchor: `docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md`, B3). That policy is hard-credit-grained — a church member has no settled gift of record and would never qualify. Phase 14 therefore mints:

- **`supports_policy_v2` = "recognized fold > 0 on any effective line in scope trailing 365d OR typed Phase 16 active commitment"** — evaluated over the recognition fold, so via-church members, DAF advisors, and matched employees qualify as supporters without recognition itself manufacturing a commitment.
- **Scope: the ROSTER only.** **Phase 9's v1 EDGE stays untouched this phase** — the derived `supports` edge in the relationship graph continues to run `supports_policy_v1`; revisiting whether the edge itself should upgrade to v2 is **deferred to Phase 28 (Missionary Workspace Depth & Support-Raising CRM)**. Minting v2 for one consumer, versioned, is the lean shape; silently changing the meaning of an already-groomed edge is not.
- **Lapsed band: 365–730 days, display-only.** A supporter whose last recognized activity falls in the trailing 365–730d window renders in a "lapsed" band (a visual state on the roster, never a stored status, never a trigger for any automation). **Drop after 730d** — the row leaves the roster entirely.
- **Refund-to-zero exits active at the next cursor advance** — no special machinery; the fold going to 0 simply stops satisfying the predicate. **A church skipping a month is irrelevant until the 365d cliff** — the policy is deliberately coarse so ordinary remittance jitter produces zero roster churn.

#### H.5 The missionary projection — v1 field set, view-only, safety floor [D5]

What the missionary sees is a **projection of the roster read model through `resolveProjection`** (FORWARD: Phase 3 (Minimum Permission & Role-Scoped Projection Foundation) chokepoint), floored, fail-closed, with census rows for every new record type [D1.9, D1.10]. The v1 contract, verbatim from the ratified design:

> **Missionary sees (v1): display name, city/state, per-path recognized amounts + dates + fund (alias-governed), via-chip, support/recency label, and commitment status only when backed by a typed Phase 16 recurring or fixed-pledge subject. NEVER: home address / email / phone / notes / household internals / provenance internals / staff notes.**

Binding details:

- **The NEVER list is a floor, not a default.** No tenant configuration, role grant, or future phase may add those fields to this projection without a new ratified decision; fund names pass through the Phase 10 (Sensitive-Data Classification & Restricted-Ministry Safety Foundation) alias governance (alias/fund-code, never a restricted worker's legal name).
- **Recognition never creates commitment truth.** A standing rule or recognition history may drive only the roster's support/recency label. It never infers a Phase 16 recurring/fixed commitment, fulfillment, or Commitment Party authority. The commitment-status field remains absent unless the row joins to a typed Phase 16 subject through that capability's authoritative projection. _(Amended 2026-07-13, Phase 16 A13/D11/D14.)_
- **Org-sourced rows are VIEW-ONLY with provenance chips** (MPDX precedent: **flag-not-edit**). A missionary who spots a wrong attribution gets a **flag affordance** — "this looks wrong" routes a task to tenant staff with the row's provenance attached — and never an edit surface. The church's breakdown is the tenant's record; the missionary is a reader of it.
- **Anonymous members → ONE aggregated sub-row per church path:** "Anonymous church members (N)" with a combined recognized amount — the D3.8 crowd-blend idiom (counting beats omission arithmetic; omitting anonymous members would let a missionary infer them by subtracting the named rows from the church total).
- **`do_not_contact` members are visible, contact affordance suppressed, no reason shown.** Visibility is the founder's requirement; contactability is section J's; the reason a person is do-not-contact is staff-private.
- **Restricted-tier members: the row is OMITTED — and the missionary view renders ZERO split arithmetic.** This is the subtle leak the adversarial pass caught: if the missionary view showed "attributed $1,700 of $2,000," omitting a restricted member's row would make the members visibly not sum, and the gap _is_ the leak. So the **attributed/unattributed reconciliation is FINANCE-view-under-clearance only**, and **all visible counts are computed post-projection** — the "(N)" in the anonymous sub-row, the supporter count tile, every count the missionary sees is computed from the rows that survived projection, never from the pre-projection truth. An omitted row leaves no arithmetic shadow.
- **Minors fold to household/guardian at entry, never a row.** A remittance line item for a child attributes to the household/guardian party at capture; the roster never carries a minor as a supporter row.

#### H.6 Two projections, one model [D5]

The **staff FINANCE projection** of the same read model is a **designation-pivot sibling page of the Phase 9 Giving tab** (FORWARD: Phase 9 PRD, Giving tab T12 / epic #604): full parties, the attributed/unattributed split math, provenance chips on every generated row (which remittance, which rule, which generation run), both vocabularies labeled. Same `getSupporterRoster` call, FINANCE lens and clearance — **two projections, one model**, which is exactly why Mission Control and the missionary dashboard can never tell different stories: there is no second computation to diverge. (Ranking semantics on either surface: formally deferred — see close-out item 5 carried in Implementation Decision C.2; Phase 14 ships zero ranking.)

#### H.7 Effective-dated designation assignment — a Phase 14-owned requirement [D5]

The roster's `missionary_scope` resolves "which designations are this missionary's" — and that resolution **must be effective-dated and resolved at read**: a departed missionary loses the roster at un-assignment; a successor inherits it; a read as-of a date sees the assignment as of that date. **Phase 14 owns this requirement as part of roster scope resolution** — if the Phase 13 designation model's missionary-assignment linkage is not yet effective-dated when Phase 14 builds, Phase 14 adds the effective dating (a validity window on the assignment, not a new table). Without it, the roster either shows a departed worker their successor's supporters or orphans the designation's history; with it, scope resolution is one indexed window join.

#### H.8 The seven never-leak fixtures (BLOCKER-class) [D5]

The missionary projection ships with a **never-leak fixture list — seven items, BLOCKER-class** (consolidated into the Testing & Poison Fixtures section with the D1/D3/D4 tiers; failing any one blocks merge):

1. **No other missionaries' supporters** — scope enumeration guard: a crafted `missionary_scope` outside the caller's assignment returns empty, never errors distinguishably (Phase 4 A5 enumeration discipline).
2. **No church-wide totals** — the missionary sees the church's giving _to their scope only_, never the church's total remittance across designations.
3. **No member giving to other designations** — a member's paths are scope-filtered; their support of a different missionary is invisible.
4. **No residual arithmetic** — no attributed/unattributed split, no remainder, no figure from which an omitted row can be inferred (H.5).
5. **No PII beyond the v1 set** — the projection emits exactly the H.5 field set; a new column added to the substrate does not leak (fail-closed census).
6. **No restricted existence via counts** — post-projection counting verified: restricted rows change no visible count anywhere.
7. **No anonymous unmasking via cross-referencing** — the anonymous sub-row's aggregate never lets a missionary diff two periods (or the roster vs. a statement) to isolate one anonymous member's identity or amount; fixtures include the two-period diff attack.

#### H.9 Freshness posture [D1.7, D5]

Member credits mint **asynchronously** (H.1); the roster reads the fold, so a just-posted remittance may briefly show the church path without its member paths. Posture: **an "attributions processing" chip renders in Mission Control ONLY** (staff, who understand in-flight work) — the **missionary dashboard never shows partial-state chrome**; it simply shows what the fold holds, eventually consistent, ordinarily within seconds. No spinner theater, no "syncing" banner on the missionary side — the founder's "cleanly passed" means the missionary surface is always a coherent statement of current truth, never a progress bar.

#### H.10 Edge dispatch [D5]

All ratified, all lean:

- **Corrections self-heal silently through the fold** — a re-designated or refunded remittance line re-derives its member credits per D1.6 (generated credits supersede-and-diff), the cursor advances, the roster updates. **No missionary notification** — the roster is a view of truth, not an event stream; a missionary watching their list sees it correct itself the way a bank balance does.
- **Member changes churches = a second path appears; nothing migrates.** The old church path's history stands (those gifts really did come via that church); new remittances mint paths via the new church. One row, two via-chips.
- **Two churches attributing the same member = legal, distinct headers.** A snowbird credited by both their summer and winter congregations is two allocation credits under two different remittance headers — no conflict, no dedupe (the A.1 identity key includes `header_id`).
- **Multi-currency = per-currency subtotals, never a scalar** — the roster inherits the C.2 read-edge discipline; a party with USD and CAD paths shows two subtotals, and no surface ever adds them.
- **Imports fire nothing** — imported remittance history mints credits with `source_kind = 'import'` and **zero side effects** (no acknowledgments — which don't exist for members anyway — no tasks, no dupe-review storms beyond the standard eager stream), and the 365d predicate of `supports_policy_v2` keeps ancient imported rows out of the active roster automatically.

#### H.11 Benchmark lessons folded [D5]

Four postures imported from the design pass's market study, binding on the build:

1. **Never force church-XOR-member** — the TntConnect failure mode is making the operator choose whether the church _or_ the member "gave"; our model holds both simultaneously (church = legal/hard credit; members = bounded allocation recognition) so the question never arises.
2. **The roster unit aligns to household grain** per D1.12 — spouses attribute at the grain the tenant's records hold them in; the roster's household path (section I) handles the rest.
3. **Org-sourced rows are view-only** (MPDX flag-not-edit — H.5).
4. **Attribution informs repeat-support recognition, not the commitment loop** — a member with a standing rule (section K) receives a clear repeat-support/recency label on the roster. The rule never creates or fulfills a recurring/fixed commitment and never grants Commitment Party authority. Commitment status and commitment-side support-raising math appear only when a typed Phase 16 subject independently exists. _(Amended 2026-07-13, Phase 16 A13/D11/D14.)_

---

### I. Household recognition — derived at read, labeled, never merged [D1.12, D5 close-out 3]

Plain-language: when one spouse gives, another currently authorized household member may _see_ the gift as household recognition — but the platform never fabricates a second gift, never splits the legal record, never merges legal-donor Statement Subjects, and never lets derived recognition masquerade as personal deductible giving. Phase 7 fixes the compliance spine; Phase 14 fixes _how recognition is computed_; Phase 19 may present it only in the separate non-tax Support overview.

**The ruling [D1.12], verbatim:** **"Household/spousal recognition is DERIVED at read from P9 time-bounded household membership"** — **no per-gift row materialization**. The adversarial pass killed the materialized alternative twice over: per-gift household rows were the single biggest row-count driver in the credit table (a 2× multiplier on every gift by a partnered donor), and they froze household composition at gift time in exactly the wrong way — a divorce, a late-recorded marriage, or a backdated membership correction would strand thousands of stale rows (the "divorce/backdating class"). Deriving at read kills both: row count stays proportional to _explicit_ facts, and household changes are reflected by the next read with zero backfill.

Mechanics (lean by construction — **no new machinery**):

- **The derivation:** for a header whose legal donor is a member of a household (Phase 9 time-bounded membership, evaluated **against the gift date** — membership windows, not current state), the other members carry derived household recognition for the gift, surfaced through `getPartyCreditActivity` (recognition lens) and the roster's `household` path. The rollup obeys **MAX-per-(party, header)** (Implementation Decision C.5) — a spouse who is also, say, the solicitor is recognized once.
- **Explicit rows are the exception path ONLY:** the `household` credit role (Implementation Decision B.1) exists solely for **per-gift exception/suppression rows** — "recognize the household for this gift even though the derivation wouldn't" or "do NOT derive household recognition for this gift" — and those explicit rows **override the derivation** wherever both would apply. They are manual, rare, and carry the standard A.1 identity and A.4 freeze semantics. A standing rule can never mint them (section K.6).
- **Time-boundedness is the correctness core:** a person joining a household in 2027 derives nothing from the household's 2025 gifts; a divorce recorded with a membership end-date stops derivation from that date without touching one historical row. There is nothing to migrate, reverse, or repair — the derivation reads the windows.

**The controlling display rule (amended by Phase 19 D3/D15):** either spouse's authorized view may show household-derived recognition labeled **Household support**, never merged into personal legal giving. Official documents remain separate per source-owned Statement Subject. The optional `giving.summary.informational@1` overview is one independently governed **Support overview — Not a tax document**; explicit exception/suppression rows override, and no new recognition engine is created.

Binding consequences:

- **Labeled, always.** On recognition surfaces — Giving tab, roster row, donor portal (per section J), and the optional Support overview — household-derived recognition renders under an explicit household label/chip. It is never summed into, displayed beside-as-equivalent, included on an official statement, or exportable as the viewing party's personal legal giving. This is the two-vocabulary rule (C.1) applied at household grain: legal giving belongs to the legal donor alone; recognition says "your household gave."
- **Purpose-separated documents.** Each official document remains with the exact Phase 7 Statement Subject. If the tenant enables the feature and meaningful authorized recognition exists, Phase 19 may create one separate Support overview for the Recognition Subject. It is never an official statement, never a receipt, and never contributes to a deductible or cash total.
- **No new machinery** — no household-credit generator, no membership-change backfill job, no reconciliation task queue. The derivation + the exception rows + the existing source projection/Support-overview composer cover the permitted recognition surface. (Founder posture: don't over-engineer; the reviewers' cuts stand.)

---

### J. Donor-facing recognition visibility v1 — visible-not-contactable, and what the donor's own portal never shows [D5 close-out 1 + 2]

Plain-language: sections A–I define who is _recognized_; this section defines who _sees_ recognition and what seeing it enables. The v1 posture is deliberately narrow, fail-closed, and defers every expansion to the phase that owns the surface.

**J.1 The church member on the missionary's roster: visible, NOT contactable [close-out 1].** The ratified v1 rule:

- **No contact details** on the missionary view (already structural in the H.5 NEVER list — no address/email/phone).
- **No contact affordance** — no "message," "email," or "add to list" action exists on an org-sourced roster row. The suppressed affordance is not a disabled button explained by a tooltip; it is absent.
- **ZERO auto-enrollment** — appearing on a remittance breakdown enrolls the member in **no** Phase 6 (Shared Communication Event Model) stream, no newsletter, no prayer letter, nothing. A remittance is the church's data about its members, not a consent event.
- **A member becomes contactable ONLY by acting directly:** making a direct gift, signing up on the portal (Phase 4 claim flow binding their identity), or an explicit recorded opt-in **with consent provenance** (who recorded it, when, on what basis — the P6 consent spine).
- **The platform-mediated thank-you affordance** ("let the missionary send a thank-you through the platform without exposing contact details") is a real product idea and is **formally a Phase 28 (Missionary Workspace Depth & Support-Raising CRM) question** — Phase 14 ships the seam-free version: nothing.

Rationale (fail-closed): this posture exists to make the nightmare scenario — _"missionary emails 200 church members who never heard of us"_ — structurally impossible, not merely discouraged. The members' relationship is with their church; the church's relationship is with the tenant; v1 respects both hops.

**J.2 The member's own portal and statement: `church_member` credits NEVER appear [close-out 2].** A member who _also_ has their own donor portal login (from a direct gift or a claimed account) **never sees their via-church attribution on their own portal or statement**. Three stacked reasons, each sufficient: (1) **the church was receipted** — the member has no receipt, no deduction, and no legal gift of record here; (2) **deduction confusion is the concrete harm** — a portal line reading "$600 via First Baptist" invites the member to hand their accountant a number that is not theirs to deduct (their substantiation, if any, comes from their church); (3) **D5 killed member correspondence** — a platform that never writes to members about via-church giving should not display it to them either; showing it invites exactly the "where's my receipt?" support burden the founder declined to create. `church_member` credits are **staff/missionary-side ONLY**.

**J.3 What DOES render donor-side in v1:** when the tenant turns on Phase 19's single **Create support overviews** setting, only source-authorized household support and sufficiently disclosed, unambiguous DAF recommendations may render in `giving.summary.informational@1`. The overview remains separate from every official document and persistently says **Not a tax document**. The advisor sees **Grant recommended through** (or equivalent contract-owned wording), never a deductible-gift claim; household recognition follows section I's source visibility and gift-date rules. Phase 19 freezes the exact Phase 14 recognition cursor and visibility result into its independently purposed item; it does not place credit-keyed lines into an official statement.

**J.4 Everything else defers to Phase 25 (Donor Dashboard Depth).** Portal recognition displays beyond J.3 — recognition timelines, via-chips on the donor's own dashboard, matched-gift progress ("your employer's match arrived"), tribute walls — are **Phase 25's lane**, consuming `getPartyCreditActivity` / `getMatchingActivity` (Implementation Decisions C.2/C.3) when it gets there. Phase 14 ships the read models and the v1 statement rendering; it builds no new donor-portal surface. (D4.10 already pinned the matching side of this: no donor-portal or missionary-workspace matching surfaces in v1.)

---

### K. Standing affiliated-party rules — capped shape, auto-apply with provenance, governed retroactivity [D1.13, D5 close-out 4a]

Plain-language: "whenever the Smith Family Foundation gives, recognize Bob Smith" is a standing fact a tenant states once — not a per-gift chore and not a rules engine. Phase 14 ships the smallest object that makes that sentence true at posting time, with provenance a reviewer can trust and a governed path for the one dangerous variant (rewriting the past).

**K.1 The v1 shape — CAPPED, verbatim [D1.13].** The standing-rule object is:

> **`{giver_party → credited_party, credit_role, full-or-NULL amount, effective_from/effective_to}`** — **no percent formulas, no designation filters.**

Registry integration, storage class, and the constraint posture live in Implementation Decision B.4 (the rules partial index is in C.7); this section owns workflow and UX. The cap is a ratified refusal, not a v1 shortcut left casually open: percent formulas, designation filters, per-fund conditions, and priority ordering are each a rules-engine seed, and the reviewers' cuts stand under the founder's don't-over-engineer rider. A tenant whose need genuinely exceeds the capped shape is a future-phase signal, not a config request.

**K.2 Auto-apply with provenance chips — NO proposal queue [D5 close-out 4a, founder-confirmed].** When a gift posts from a `giver_party` with an active rule (gift date inside the `effective_from/effective_to` window), the credit **mints automatically** through the D1.7 async fan-out — no staff proposal, no approval step, no queue. What makes auto-apply safe is **provenance, not process**: every rule-generated credit carries `source_kind = 'rule'`, `source_ref = the rule id`, and `generation_run_id` [D1.1], rendering everywhere as a **provenance chip** ("applied by standing rule: Smith Foundation → Bob Smith, created by Jane 2026-03-02") — hover reveals the rule, its author, and its window. The D1.1 identity key makes the classic failure impossible by construction: a manual credit and a rule-generated credit for the same `(header, line, party, role)` cannot coexist (the NPSP #5796 duplicate-credit class). This is the D2 reversibility principle transplanted: visible provenance + easy correction beats gatekeeping ceremony. Rule AUTHORING rides the finance:manage_credit_rules / finance:approve_credit_rules SoD pair (see Permissions) — a new or widened rule takes effect only through that approval; rule APPLICATION to posting gifts is what has no proposal queue.

**K.3 Prospective-only at posting [D1.13].** A rule applies to gifts posted **while it is active** — from `effective_from` (or creation) forward, until `effective_to` (or end). Creating a rule **never** touches existing headers; ending a rule never revokes credits it already minted (they are historical facts per A.4 — revocation is the explicit `finance:revoke_credit` path). The posting-time check is an index probe on the B.4/C.7 rules partial index — zero measurable cost on the entry path.

**K.4 Retroactive application = an explicit, governed backfill [D1.13].** "Also apply this to last year's gifts" is a legitimate ask and a separate, deliberate act:

- Behind the **`finance:apply_retroactive_credits` / `finance:approve_retroactive_credits` SoD pair** (minted in the Permissions & SoD section; Phase 12 (Full Role & Permission Configuration)'s PDP enforces, per-tenant policy posture consistent with the P13 §F governance philosophy).
- Runs as a **`credit_generation_runs` backfill** [D1.7]: full target set enumerated up front, idempotent upsert, resumable, previewed as "N headers will gain credits" before approval.
- **REFUSES externally referenced headers**, verbatim from the ruling: a header whose target credits are frozen by Phase 19 Support-overview inclusion or by a sent document linked via `communication_event_relations` (A.4) is skipped and reported, never silently restated — a backfill that touched issued artifacts would be a silent restatement of documents or support overviews the tenant already sent. The refusal is a listed outcome ("skipped: externally-referenced"), so finance can see exactly what the backfill declined to do and decide whether a supersede workflow (P7's lane) is warranted per case.

**K.5 Rule lifecycle — auto-suspend, and the review surface [D5].** _(Ratified as part of the Call-1 framing the founder confirmed at close-out; lean implementation = suspend-for-confirmation. Reconciliation with Section A.4's merge re-point rule: affiliated_party_credit_rules is the ONE lifecycle table where a party merge suspends the rule for staff confirmation instead of silently re-pointing — a standing generator must not silently change whom it credits.)_ Rules must never keep firing against a stale world:

- **Auto-suspend on merge-loss, death, or inactivation:** when either endpoint party is merged away (the surviving party is re-pointed per D1.5; the rule suspends for explicit confirmation rather than silently transferring intent), marked deceased, or inactivated, the rule **suspends automatically** — it stops matching at posting time immediately, and nothing is deleted.
- **Suspended rules land on a "rules needing review" surface** — the Attribution-Inbox worklist idiom (Implementation Decision D.6), not per-row tasks [D4.8 posture]: a finite, owned list where staff re-point the rule to the surviving/successor party, end it, or reactivate it. Every transition is audited on `contribution_operation_audit_events` via the D4.12 polymorphic subject.
- No other automation exists: no rule expiry sweeps, no usage analytics, no "rule hasn't fired in 90 days" nags (R-LEAN).

**K.6 Household is NOT rule-generated [D1.12 + section I].** A standing rule may never mint `household`-role credits: household recognition is **derived at read** (section I), and the rule creation UI does not offer the household role; the generator rejects it (CHECK-backed). The two mechanisms are deliberately disjoint — rules exist for affiliations the graph does _not_ already encode (foundation → principal, org → contact); household membership is already a P9 graph fact, and deriving beats duplicating it. The `tribute` role is equally out of a rule's reach (generator-emitted from `contribution_tributes` only, per D1.12) — the rule generator can mint **recognition-class roles only** (B.1's table: `foundation_affiliate`, `solicitor`, `org_contact`, and peers), never allocation (`church_member` comes only from remittance capture) and never annotation.

---

_(This block covers the church-remittance/roster plane, household derivation, donor-facing visibility, and standing rules: D5 with its five close-out items, D1.12's household ruling, and D1.13's standing-rule cap. The credit spine and role registry these bind to are Implementation Decisions A/B; the read-model vocabulary is C; the DAF entry idioms reused here are D; matching-gift machinery is G. Data-model DDL, the ownership matrix, capability minting, fixtures, and build order for every object named here are consolidated in their owning sections.)_

## Data Model & Ownership-Matrix Extension + Postgres-Enforced Invariants

Phase 14 (Donor Credit Operations) adds the **credit substrate and its lifecycle objects** on top of the Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) ledger: one `contribution_credits` table, the lifecycle tables that generate credit rows (`tributes`/`contribution_tributes`/`tribute_notify_parties`, `matching_gift_expectancies`/`matching_gift_settlements`, `affiliated_party_credit_rules`, `daf_sponsors`/`party_payer_aliases`), the tribute stream's letter/coverage objects, and a small set of extension columns on Phase 13 tables. Per the D1.14 cross-PRD amendment package, **Phase 14 takes build ownership of all six credit/tribute/matching/DAF objects Phase 7 (Receipt & Statement Compliance Rules + Donor Identity/Credit Model) nominally scoped to its T4–T6** — re-keyed to `contribution_headers` and renamed (`gift_credits` → `contribution_credits`, `donation_tributes` → `contribution_tributes`, `tribute_notifications` → `tribute_notify_parties`; the P7 originals are in `docs/prds/sitestacker-parity/phase-07-receipt-statement-compliance-and-donor-credit.md` under "New tables — credit, tribute, matching, DAF").

House rules bind everywhere below (P13 §Data Model conventions, restated once): plural snake_case names; `tenant_id UUID NOT NULL` with **no default**; parent `UNIQUE (id, tenant_id)`; children reference parents by **composite same-tenant FK** `(tenant_id, parent_id)`; **FORCE ROW LEVEL SECURITY** on every table; closed sets are **TEXT + CHECK, never native Postgres enums**; money is **integer minor units** (`_minor BIGINT`); every new table registers a **fail-closed Phase 3 (Minimum Permission & Role-Scoped Projection Foundation) census row** [D1.10]. Two Phase-14-specific rules ride on top: **credits are not money rows** — `contribution_credits` carries **no currency column** (currency = header currency by construction, a deliberate documented non-application of P13 §E rule 9 [D1.3]) — and, per R-FRESH (no users, correct-from-start), **every identity/uniqueness/exclusivity constraint in this section ships in the FIRST migration, before any generator merges** [D1.1].

> **Evidence framing (real-vs-forward, as of authoring).** REAL today: the audit spine this phase extends (`contribution_operation_audit_events`, created in `supabase/migrations/20260526132000_contribution_operations_core.sql`, which already carries a tenant-refs guard trigger); the fail-closed consent gate (`packages/api/src/email/consent.ts`); the Email Studio system-bindings registry (`packages/api/src/email/template-store.ts`); the Phase 7 and Phase 6 PRD texts the D1.14 package amends. FORWARD (groomed-not-built, named owner): `contribution_headers`/`contribution_designation_lines`/`contribution_postings`, the five-axis lifecycle, and the `effective_seq` cursor (Phase 13 PRD, epic #690); `communication_events` + `communication_event_relations`, the reserved `acknowledgment`/`notification` kinds, and the new `mail` channel (Phase 6 (Shared Communication Event Model) PRD, epic #550, amended per D3.5); Phase 19 Statement Subject run items and subordinate source inclusion facts; the party spine and merge re-point list (Phase 9 (Full CRM Depth & Relationship Graph) PRD, epic #604). The repo has **zero** credit/tribute/matching/DAF product code — every table below is net-new.

### `contribution_credits` — the spine [D1]

One row = one party recognized on one contribution (header-scoped by default, line-scoped by exception). Semantic identity: **(tenant, header, optional line, party, role)**; the amount's meaning is fixed by the role's amount class (Implementation Decision B). Spec rows read `column — type — constraint — [provenance]`.

```
contribution_credits
- id — uuid PK — default gen_random_uuid(); UNIQUE (id, tenant_id) — [D1]
- tenant_id — uuid NOT NULL — no default; FORCE RLS — [D1.9]
- header_id — uuid NOT NULL — composite FK (tenant_id, header_id) → contribution_headers — [D1]
- line_id — uuid NULL — composite FK (tenant_id, header_id, line_id) → contribution_designation_lines
  (requires the P13 amendment UNIQUE (tenant_id, header_id, id) on the lines table); set ONLY by named
  flows (remittance attribution editor, P30 import, credit-review re-attach, settlement generator) —
  never a general UI field — [D1.2, D1.9]
- party_id — uuid NOT NULL — composite FK (tenant_id, party_id) → party spine; the party-merge
  re-point is the ONLY sanctioned in-place write — [D1.5]
- credit_role — text NOT NULL — CHECK ∈ registry set (next block); TEXT+CHECK, never enum — [D1.13]
- amount_minor — bigint NULL — class-shaped CHECK: allocation ⇒ NOT NULL (bounded ≤ line, deferred
  trigger); recognition ⇒ NULL = full scope, set value ≤ scope; annotation ⇒ always NULL.
  NO currency column: currency = header currency by construction — [D1.3]
- is_receiptable — boolean NOT NULL DEFAULT FALSE — CHECK (is_receiptable = FALSE): the P7 A8
  tripwire; a schema lint asserts the CHECK exists — [D1.11]
- source_kind — text NOT NULL — CHECK ∈ {manual, rule, daf, match, tribute, remittance, import};
  provenance is ON the row but OUT of the identity key — [D1.1]
- source_ref — uuid NULL — the generating lifecycle row (rule/tribute/settlement/…) — [D1.1]
- generation_run_id — uuid NULL — composite FK → credit_generation_runs — [D1.1, D1.7]
- external_ref — text NULL + external_source text NULL — partial UNIQUE (tenant_id, external_ref):
  P30 import idempotency, ships in the FIRST migration — [D1.1]
- active — boolean NOT NULL DEFAULT TRUE — the supersede predicate scoping the identity key and
  every index — [D1.5]
- supersedes_id — uuid NULL — composite FK → self (the supersede chain) — [D1.5]
- frozen_at — timestamptz NULL — stamped in the same txn by the FIRST external reference (a
  Phase 19 Support-overview facts package or a sent doc via communication_event_relations); BEFORE UPDATE OR DELETE
  trigger RAISEs when frozen_at IS NOT NULL (sole exception: the party-merge re-point) — [D1.5]
- created_by / created_at — uuid / timestamptz — audit rides contribution_operation_audit_events;
  no new audit spine — [D1.5]

IDENTITY KEY (verbatim, first migration): partial
  UNIQUE NULLS NOT DISTINCT (tenant_id, header_id, line_id, party_id, credit_role) WHERE active
NULLS NOT DISTINCT is load-bearing: header-scoped rows carry line_id IS NULL, and without it the
dedupe guarantee silently vanishes for the default grain. Generators CONVERGE on this key: a manual
and a rule-generated credit for the same (party, role, scope) are the same row — the NPSP #5796
duplicate-credit class is impossible by construction. — [D1.1]
```

### Credit role registry — TEXT + CHECK values, amount class per role [D1.3, D1.13]

The registry is a **code-owned constant mirrored into the `credit_role` CHECK and the class-shape CHECK** — not a tenant-editable table, because a role changes arithmetic and document routing (tenant-custom recognition _labels_ are Phase 11 (Custom Fields & Custom Collections) custom fields, never roles).

```
credit_role registry (v1, fixed) — role — amount class — notes
- daf_advisor — recognition — minted synchronously at entry from the D2 attribution field — [D2]
- household — recognition — explicit per-gift exception/suppression rows ONLY; ordinary household
  recognition is DERIVED at read from P9 time-bounded membership, never materialized — [D1.12]
- church_member — ALLOCATION — line-scoped, minted by the remittance generator; member rows sum
  ≤ their line — [D5, D1.3]
- matched_employee — recognition — generated FROM settlements only; expectancy stages mint ZERO
  credit rows — [D1.12, D4.1]
- workplace_giving_donor — recognition — Benevity/YourCause: the intermediary payer is hard-credit,
  the employee is recognized; NOT matched_employee — [D1.13]
- foundation_affiliate — recognition — family foundation ≠ DAF sponsor — [D1.13]
- solicitor — recognition — [D1.13]
- org_contact — recognition — [D1.13]
- tribute — ANNOTATION — always-NULL amount, never in any sum; generator-emitted from
  contribution_tributes, optional-per-tenant, never manual — [D1.12]
- peer_fundraiser — RESERVED, not implemented — Phase 36 (Peer-to-Peer & Advocacy Campaigns) — [D1.13]
```

Class arithmetic (allocation bounded, recognition cross-party sums deliberately unbounded, annotation never sums) is Implementation Decision B.2's lane [D1.3]. Honor-vs-memorial lives on `tributes.tribute_type` — single source, **no role split** [D1.13].

### `credit_generation_runs` — resumable fan-out [D1.7]

```
credit_generation_runs
- id / tenant_id — uuid — house pattern; FORCE RLS — [D1.9]
- generator_kind — text NOT NULL — CHECK ∈ {remittance, standing_rule, match_settlement, tribute,
  retroactive_backfill} (tribute appears only for the D3.10 bulk coverage/import backfill path —
  the sync single-row tribute capture never creates a run) — [D1.7, D1.13]
- source_ref — uuid NOT NULL — the triggering object (remittance header, rule, settlement batch,
  backfill request) — [D1.7]
- dedupe_key — text NOT NULL — UNIQUE (tenant_id, dedupe_key), derived from the triggering
  outbox/Inngest event; a crash-retry lands on the conflict — [D1.7]
- status — text NOT NULL — CHECK ∈ {pending, running, completed, failed} — [D1.7]
- target_count / written_count — integer — resumability bookkeeping: each run is a FULL-TARGET-SET
  idempotent upsert against the credit identity key (a 200-member remittance whose generator dies at
  member 117 resumes with zero duplicates) — [D1.7]
- started_at / completed_at / last_error — timestamptz / text — [D1.7]
```

Topology (sync capture vs async fan-out, "the money path NEVER fails on recognition," and Phase 19 informational runs freeze one exact reviewed recognition cursor) is Implementation Decision A.6's lane [D1.7; Phase 19 D15].

### `daf_sponsors` + `party_payer_aliases` — the payer intelligence registry [D1.9, D4.5]

```
daf_sponsors (party-extension: PK = party_id, 1:1 with an org party; NO duplicated identity
columns — name/address live on the party spine)
- party_id — uuid PK — composite FK (tenant_id, party_id) → parties (org kind,
  org_type = daf_sponsor per P7 A9) — [D1.9]
- tenant_id — uuid NOT NULL — tenant-scoped FOREVER: the well-known list (Fidelity, Schwab, NCF, …)
  ships as per-tenant SEED suggestions, never a shared/global registry — [D1.9]
- receipt_delivery_suppressed — boolean NOT NULL DEFAULT TRUE — prospective Phase 6 delivery preference
  for any sponsor receipt that Phase 7 independently finds eligible and Phase 18 renders; per-sponsor
  flip; never an eligibility or artifact-existence flag — [D2]
- created_by / created_at — uuid / timestamptz

party_payer_aliases (shared: ONE matcher, ONE one-click triage surface for DAF sponsors AND
workplace-giving intermediaries — D1.9's daf alias child, generalized)
- id / tenant_id — uuid — house pattern — [D4.5]
- party_id — uuid NOT NULL — composite FK → the org party — [D4.5]
- payer_kind — text NOT NULL — CHECK ∈ {daf_sponsor, workplace_giving_intermediary} — [D4.5]
- alias_normalized — text NOT NULL — UNIQUE (tenant_id, alias_normalized): the matcher probe; an
  unmatched payer string FAILS CLOSED to triage, never a silent misfile — [D4.5, D2]
- confirmed_by / confirmed_at — uuid / timestamptz — provenance for the evidence chip — [D2]
- active — boolean NOT NULL DEFAULT TRUE — [D4.5]
```

Per-tenant intermediary seeds: Benevity, AOGF, YourCause/Blackbaud Giving Fund, America's Charities, Bright Funds, FrontStream/CyberGrants, Fidelity Workplace. An intermediary hit **on the match path** = blocking hint + reason-to-override, both directions, never silent [D4.5].

### DAF capture columns — **P13 `contribution_headers` extensions** [D2]

Phase 13 already owns `is_daf_grant`, `no_quid_pro_quo`, and `daf_pledge_no_sponsor_reference` on the header (Phase 13 PRD §Data Model, DAF-shape bullet). Phase 14 **extends the header** — these are P13-table extension columns, not a new table:

```
contribution_headers — Phase 14 extension columns (all NULL unless is_daf_grant = TRUE)
- daf_advisor_identity_tier — text — CHECK ∈ {full, fund_name_only, anonymous}; REQUIRED when
  is_daf_grant — what the sponsor's paperwork actually disclosed — [D2]
- daf_grant_id / daf_fund_name / daf_purpose — text — the three structured grant-letter columns;
  feed fund-name memory, advisor recall keyed (sponsor, memo), and the import dedupe key. Columns
  only — no binary attachments (files = Phase 29 (File Manager & Document Management)) — [D2]
- daf_attribution_state — text — CHECK ∈ {identified, not_provided, anonymous}: the required-combobox
  outcome. identified ⇒ the daf_advisor credit row IS the attribution; not_provided ⇒ the gift rides
  the Attribution Inbox (a derived worklist — no queue table) — [D2]
- daf_attribution_reason — text NULL — the one-tap reason chip; required when
  daf_attribution_state = 'not_provided' — [D2]

daf_fund_memory_rules (fund-name memory: confirm-once rules; SUGGESTIONS are derived from prior
grants and never stored — only confirmed rules persist)
- id / tenant_id — uuid — house pattern — [D2]
- sponsor_party_id — uuid NOT NULL — composite FK → the sponsor org party — [D2]
- fund_name_normalized — text NOT NULL — partial UNIQUE (tenant_id, sponsor_party_id,
  fund_name_normalized) WHERE active: recall is keyed (sponsor, memo) — the same memo from another
  sponsor never matches — [D2, D1]
- attributed_party_id — uuid NOT NULL — composite FK → the household/donor party — [D2]
- confirmed_by / confirmed_at — uuid / timestamptz — the human confirmation that justifies
  auto-send; renders as the RULE provenance chip — [D2]
- active — boolean — rule update/delete offered inline in the re-attribute flow — [D2]
```

### Acknowledgment purpose/readiness columns — the D2 guardrail-3 axis

Phase 14 persists acknowledgment purpose, audience, readiness, and coverage — never a communication outcome [D2 guardrail 3]. Two placements, one vocabulary:

```
acknowledgment request state (TEXT + CHECK, shared vocabulary):
  {not_applicable, held, ready, released, canceled}

contribution_headers — extension columns (audience = the ONE attribution party per grant [D2/D.12])
- acknowledgment_request_state — text NOT NULL DEFAULT 'not_applicable' — CHECK ∈ set above — [D2 g3]
- acknowledgment_hold_until — timestamptz NULL — the hold-then-release window (~10 min default,
  tenant-config; longer for a first send to a brand-new party) — [D2 g1, g6]

matching_gift_settlements — per-settlement ack columns (a batch employer check = one header, N
lines, N employees ⇒ the employee thank-you tracks per settlement; D2 guardrails verbatim incl.
the amount-omitted default) — [D4.10]
- acknowledgment_request_state — text NOT NULL DEFAULT 'ready' — CHECK ∈ same vocabulary
- acknowledgment_hold_until — timestamptz NULL
```

`released` means that Phase 14 froze and handed off the exact owner request; it does not mean sent or delivered. The "Unacknowledged" work view joins these Phase 14 request/coverage facts to the exact Phase 6 communication event and outcome through its owner relation/version. No Phase 6 outcome is copied into Phase 14, and no queue table exists in this stream [D2]. _(Amended 2026-07-11, Phase 15 NF3: a `held` row arriving from a batch/import commit is distinguished by a `batch_gate_pending` **origin reason carried on the gift's existing entry-origin metadata — no new column** — so the per-batch Send-acknowledgments gate releases exactly those rows into the acknowledgment pipeline; imports stay `held`.)_

### Tribute objects [D3]

Final names per D3.14: Phase 7's `tribute_notifications` is **RETIRED** (ambiguous with sent letters); its notify-once flag is generalized into frequency `once`. `tribute_letters` is the Phase 14 purpose-and-coverage anchor, not delivery evidence. Its transactional outbox requests owner work idempotently; Phase 6 later records the independently authoritative communication event and relationship. The items table remains the coverage truth beside the purpose row.

```
tributes (reusable record on the HONOREE — one tribute, many gifts over years)
- id / tenant_id — uuid — house pattern; FORCE RLS; census row — [D3.11]
- tribute_type — text NOT NULL — CHECK ∈ {honor, memorial}: the SINGLE source of honor-vs-memorial
  truth (no credit-role split); IMMUTABLE after the first letter (BEFORE UPDATE trigger);
  honor→memorial = close + guided successor flow — [D1.13, D3.12]
- honoree_party_id — uuid NULL — composite FK → parties; honoree may be NAME-ONLY:
  CHECK (honoree_party_id IS NOT NULL OR honoree_name IS NOT NULL); no junk parties; the tribute
  credit row exists only when a real party does — [D1.12]
- honoree_name — text NULL — see CHECK above — [D1.12]
- occasion — text NULL — curated picklist value (+ an internal-only free-text note column) — [D3.12]
- family_message — text NULL — family-facing custom text is this DISTINCT field, set at the setup
  gate — internal shorthand can never leak into a condolence letter — [D3.12]
- state — text NOT NULL — CHECK ∈ {active, paused, closed, attention}: stored states are
  human-meaning only; setup_incomplete is DERIVED (no active notify rows), never stored. `active`
  is the stored default resting value; the ratified 'human-meaning states' triple
  (paused/closed/attention) plus this default; setup_incomplete stays derived. — [D3.2]
- next_due_at — timestamptz NULL — the pure schedule function's memoized output, advanced at letter
  mint; partial-indexed for the cron scan — [D3.2, D3.13]
- last_letter_id — uuid NULL — composite FK → tribute_letters — [D3.13]
- notified_through — date NULL — import watermark: historical gifts before it never compose — [D3.10]
- external_ref — text NULL — partial UNIQUE (tenant_id, external_ref), FIRST migration — [D3.10]

contribution_tributes (the AUTHORITATIVE per-gift link — composition input is
contribution_tributes ⋈ contribution_headers ONLY, never credit rows)
- id / tenant_id — uuid — house pattern — [D3.11]
- header_id — uuid NOT NULL — composite FK → contribution_headers — [D1.12]
- tribute_id — uuid NOT NULL — composite FK → tributes; UNIQUE (tenant_id, tribute_id, header_id):
  one link per gift per tribute — [D1.12]
- notify_party_override_id — uuid NULL — composite FK → parties: "notify my aunt for THIS gift"
  (Virtuous precedent) — [D3.8]
- donor_display_override — text NULL — per-gift donor display-name/anonymity override — [D3.8]
- external_ref — text NULL — partial UNIQUE (tenant_id, external_ref), FIRST migration — [D3.10]

tribute_notify_parties (who is watching; preferences + suppression facts)
- id / tenant_id — uuid — house pattern — [D3.11]
- tribute_id — uuid NOT NULL — composite FK → tributes — [D3.11]
- party_id — uuid NOT NULL — composite FK → parties; partial UNIQUE (tenant_id, tribute_id,
  party_id) WHERE active; joins the P9 merge re-point list (collision: strictest pref wins,
  include_total = false wins, coverage UNTOUCHED) — [D3.11]
- source — text NOT NULL — CHECK ∈ {family_request, obituary, funeral_home, staff}; plus
  added_by uuid — stream provenance, rendered in the first letter's how-to-stop line — [D3.9]
- channel — text NOT NULL — CHECK ∈ {email, mail} — [D3.5]
- frequency — text NOT NULL — CHECK ∈ {stream_default, immediate, monthly, once, never};
  once = one consolidated letter then auto-flip to never — [D3.7]
- paused_until — date NULL — a pause is not a never; the stream resumes by itself — [D3.7]
- include_total — boolean NOT NULL DEFAULT FALSE — the per-family aggregate-total opt-in gating the
  single tribute_aggregate_total field; forward-only — [D3.4]
- never_reason / never_set_by / never_set_at — text / uuid / timestamptz — CHECK:
  frequency = 'never' ⇒ all three NOT NULL. never is a SUPPRESSION-GRADE fact; unset requires the
  tribute-manage capability + audit; re-checked by the consent gate at send — [D3.7]
- mail_status — text NOT NULL DEFAULT 'ok' — CHECK ∈ {ok, returned}; returned ⇒ row pauses into a
  worklist — [D3.12]
- active / removed_at / removed_reason / removed_by — removal = TOMBSTONE + stream-scoped
  suppression; re-add requires acknowledging the prior removal reason — [D3.7]
- external_ref — text NULL — partial UNIQUE (tenant_id, external_ref), FIRST migration — [D3.10]

tribute_letters (the exactly-once purpose/coverage anchor: one prepared request per stream per period)
- id / tenant_id — uuid — house pattern — [D3.2]
- tribute_id — uuid NOT NULL — composite FK → tributes — [D3.2]
- notify_party_id — uuid NOT NULL — composite FK → tribute_notify_parties — [D3.2]
- period_key — text NOT NULL — UNIQUE (tenant_id, tribute_id, notify_party_id, period_key): THE
  exactly-once anchor; a crash-retry lands on the conflict and is a no-op — [D3.2]
- channel — text NOT NULL — CHECK ∈ {email, mail} — [D3.5]
- status — text NOT NULL — CHECK ∈ {prepared, held, released, canceled}; this is Phase 14
  purpose/coverage state only. Phase 6 owns sent/delivery state; Phase 18 owns artifact state — [D3.2, D3.5]
- hold_until — timestamptz NULL — D2 guardrail 1/6 reused verbatim — [D3.9]
- cutoff_at — timestamptz NOT NULL — composition is cutoff-frozen; a late gift rides the next
  period — [D3.2]
- purpose_request_key — text NOT NULL — UNIQUE (tenant_id, purpose_request_key); stable idempotency
  key carried by the transactional outbox and linked by Phase 6 relations after dispatch — [D3.1]
- generated_document_version_id — uuid NULL — typed composite same-tenant reference to the exact
  Phase 18 Generated Document Version after print/PDF fulfillment; Phase 18 owns bytes, retention,
  legal holds, currentness, and disposal; Phase 6 pins it on dispatch evidence — [D3.13]

NOTE: The D3.9 per-stream state {active, held, attention, ended} is a DERIVED presentation over
  letter status + stream facts (see Section F.10) — never a stored column.

tribute_notification_items (the COVERAGE LEDGER — written in the SAME txn as the letter row)
- id / tenant_id — uuid — house pattern; composite tenant FKs — the (tenant_id, header_id) FK shape
  catches a mis-joined cross-tenant header — [D3.11]
- letter_id — uuid NOT NULL — composite FK → tribute_letters — [D3.1]
- notify_party_id — uuid NOT NULL — composite FK → tribute_notify_parties — [D3.1]
- tribute_id — uuid NOT NULL — FRAMING column only (which tribute's letter carried the mention) —
  NOT part of the coverage identity — [D3.1]
- header_id — uuid NOT NULL — composite FK → contribution_headers — [D3.1]
- status — text NOT NULL — CHECK ∈ {covered, skipped_reversed, reopened}: a canceled letter REOPENS
  its items in-txn (status flip, never a delete); recomposition re-points letter_id and re-freezes;
  skipped_reversed records the compose-time effective-state filter drop (refund before first
  listing) — [D3.1, D3.13]
- rendered_donor_as — text NOT NULL — frozen snapshot: the immutable truth of what the letter called
  this donor (anonymity flips after print are forward-only; NO automatic correction letter) — [D3.1, D3.8]
- letter_total_minor — bigint NULL — the frozen printed aggregate total, when printed — [D3.1, D3.4]

COVERAGE GRAIN: UNIQUE (tenant_id, notify_party_id, header_id) — a "Mom and Dad" watcher following
two tributes that both received one gift is told ONCE; tribute-merge is coverage-safe by
construction because coverage never keyed on the tribute. — [D3.1]
```

Per-donor rendering flags ride the party/donor surface, not tribute tables: `share_address_in_tribute_letters` (default TRUE, distinct from anonymity) and `notify_donor_identity` (defaulted from the anonymity flag; controls the notification class's donor identity) [D1.10, D3.8].

### `matching_gift_expectancies` + `matching_gift_settlements` [D4]

Renamed from Phase 7's `matching_gifts` — **rows are expectancies, never gifts**; the old name itself caused the phantom-money framing [D4.14].

```
matching_gift_expectancies
- id / tenant_id — uuid — house pattern; FORCE RLS; census rows classify the employer fields
  SENSITIVE (a stored employment fact) — [D4.10]
- origin_header_id — uuid NULL — composite FK → contribution_headers; NULLABLE (pre-platform and
  DAF-paid origin gifts are real; entry strongly encourages linkage) — [D4.9]
- employer_party_id — uuid NOT NULL — composite FK → parties: PROGRAM ATTRIBUTION (the settling
  line's legal donor is the payer-of-record, which defaults to but need not be this employer) — [D4.4]
- employee_party_id — uuid NOT NULL — composite FK → parties: who gets recognized on receipt — [D4]
- state — text NOT NULL — CHECK ∈ {identified, submitted, received, reversed, closed, superseded}:
  6 states, cut from 8; NO auto transitions in v1; employer_verified CUT — [D4.3]
- closed_reason — text NULL — CHECK ∈ {denied, expired, written_off}; NOT NULL iff
  state = 'closed' — [D4.3]
- merged_into_id — uuid NULL — composite FK → self; NOT NULL iff state = 'superseded' — the only
  never-reopenable terminal (dupe merges); otherwise MONEY ALWAYS WINS: linking a settlement from
  closed/reversed re-enters received (audited) — [D4.3]
- expected_amount_minor — bigint NULL + expected_currency text NULL — explicit currency column
  because the expectancy PREDATES its header (documented D1.3 non-application); ADVISORY-ONLY:
  never blocks received, never on any money surface (registered in the D1.4 CI non-money gate).
  NO match_ratio column — ratio is program-notes prose — [D4.7]
- expires_at — date NULL — staff-set; seeded from the ONE structured employer field
  match_claim_deadline (a single column on the employer org-party surface — everything else stays
  notes); auto-behavior may read ONLY expires_at, never notes — [D4.8]
- program_notes — text NULL — prose (ratios, portal quirks, program rules) — [D4.7]
- origin_reversed — boolean NOT NULL DEFAULT FALSE — origin-gift reversal sets the flag + routes a
  task, never auto-cancels — [D4.11]
- external_ref / external_source — text NULL — ONE identity pair (vendor_ref DELETED; raw vendor ids
  live in archived payloads); partial UNIQUE (tenant_id, external_ref) — [D4.9]

DUPE GUARD: partial UNIQUE (tenant_id, origin_header_id, employer_party_id)
  WHERE state IN ('identified','submitted') AND origin_header_id IS NOT NULL
plus an advisory warn-at-create; the ingest socket NEVER silently auto-creates when a candidate
exists. The Find-Matched-Gifts suggestion surface ADDITIONALLY lists received expectancies whose
settled fold < expected_amount_minor (installment continuation); only the dupe-guard partial
UNIQUE is scoped to identified|submitted. — [D4.9]
STATE-WRITE WALL: received/reversed are UNREACHABLE via plain UPDATE — a BEFORE UPDATE trigger
RAISEs; only the settlement-writing locked function and the P13-event consumer set them (kills
phantom-received bricking). — [D4.2]

matching_gift_settlements (junction — replaces the 1:1 spawn column, which dies on the FIRST real
batch check: one employer check covering N employees, or one expectancy across two quarterly checks)
- id / tenant_id — uuid — house pattern; composite tenant FKs BOTH directions — [D4.1]
- expectancy_id — uuid NOT NULL — composite FK → matching_gift_expectancies — [D4.1]
- header_id — uuid NOT NULL — composite FK → contribution_headers — [D4.1]
- line_id — uuid NOT NULL — composite FK (tenant_id, header_id, line_id) → lines;
  UNIQUE (tenant_id, line_id): a line settles ≤ 1 expectancy. NO amount column — the line IS the
  amount. Deliberately NO (expectancy, header) unique: one expectancy MAY be settled by 2+ lines of
  one header when the match mirrors a split origin gift — [D4.1]
- acknowledgment_request_state / acknowledgment_hold_until — per-settlement ack columns (block above) — [D4.10]
- created_by / created_at — written ONLY by the locked settlement function inside the ordinary P13
  entry transaction (new header's advisory lock; expectancies FOR UPDATE ORDER BY id;
  lock_timeout set) — [D4.2]
```

Fulfilled total is a **derivation over effective line amounts** (the D1.4 idiom — refund-proof, never a cached counter); `matched_employee` credits stay **line-scoped, generated FROM settlements** [D4.1]. Lifecycle/workflow detail is Implementation Decision G's lane.

### `affiliated_party_credit_rules` — standing rules, v1 capped shape [D1.13]

```
affiliated_party_credit_rules
- id / tenant_id — uuid — house pattern — [D1.13]
- giver_party_id — uuid NOT NULL — composite FK → parties (the legal donor whose gifts trigger) — [D1.13]
- credited_party_id — uuid NOT NULL — composite FK → parties (who gets the credit row) — [D1.13]
- credit_role — text NOT NULL — CHECK ∈ registry set EXCLUDING tribute (never manual),
  matched_employee (settlement-generated only), household (derived at read per D1.12 — exception
  rows are manual-only), and church_member (allocation class — remittance capture only;
  un-mintable by rule) — [D1.12, D1.13]
- effective_from — date NOT NULL; effective_to — date NULL — the rule's window — [D1.13]
- active — boolean NOT NULL DEFAULT TRUE — [D1.13]
- created_by / created_at — provenance chip source: rules AUTO-APPLY with provenance chips,
  NO proposal queue (D5 close-out 4a, founder-confirmed) — [D5]

CAPPED SHAPE (structural): NO amount column, NO percent column, NO designation-filter column —
rule-minted credits carry amount_minor = NULL (full scope per the recognition class); percent
formulas and designation filters are UNREPRESENTABLE, not just forbidden. (the ratified
'full-or-NULL amount' slot collapses to no column: NULL = full-scope is the only representable
value under the recognition class) — [D1.13]
```

Application is **prospective-only at posting**; the governed retroactive backfill (SoD pair, refuses statement-referenced headers) is Implementation Decision B.4/K's lane [D1.13].

### Audit — polymorphic subject extension on the existing spine [D4.12]

No new audit table. `contribution_operation_audit_events` (REAL: `supabase/migrations/20260526132000_contribution_operations_core.sql`) gains a **nullable polymorphic subject**: `subject_type` TEXT + CHECK over the Phase 14 record types (`contribution_credit`, `matching_gift_expectancy`, `matching_gift_settlement`, `tribute`, `contribution_tribute`, `tribute_notify_party`, `tribute_letter`, `affiliated_party_credit_rule`, `daf_sponsor`, `party_payer_alias`, `credit_generation_run`) plus `subject_id uuid`, with the pair validated by that migration's **existing tenant-refs guard-trigger pattern** (the composite-tenant-FK posture, extended — the trigger already exists on this table). Pre-`received` expectancy transitions, credit supersedes, preference changes, and `never` unsets all get an audit home without a second spine [D1.5, D4.12].

### Ownership-Matrix extension (per Phase 1 (Source-of-Truth Ownership Matrix))

Phase 14 adds these record types to the Phase 1 matrix (REAL: `docs/prds/sitestacker-parity/phase-01-source-of-truth-ownership-matrix.md`). In every row **Asym Postgres is the system of record**; no external system ever owns credit, tribute, or matching truth — the matching vendors (DTD/HEPdata) themselves treat the CRM as system of record [D4].

| Record type                                                                       | System of record                                                                                                         | Write path                                                                                           | Conflict winner                                                                                                | Repair path                                                                                                         |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Contribution credits (recognition/attribution facts)                              | Asym Postgres (`contribution_credits`)                                                                                   | The ONE locked SECURITY DEFINER credit-mutation fn (`packages/api`) + generators via generation runs | Asym; recognition worth is derived at read, never stored                                                       | Supersede chain after freeze; party-merge re-point (sole in-place write); audit spine                               |
| Credit generation runs                                                            | Asym Postgres (`credit_generation_runs`)                                                                                 | Outbox/Inngest fan-out generators only                                                               | Asym                                                                                                           | Resumable idempotent re-run against the identity key; `credit-generation-drift` signal                              |
| DAF sponsor registry + payer aliases                                              | Asym Postgres (`daf_sponsors`, `party_payer_aliases`)                                                                    | Staff triage surface under `finance:manage_daf_sponsors`                                             | Asym; a payer string is evidence, never identity                                                               | One-click alias triage; retire/re-confirm; never silent misfile                                                     |
| DAF grant capture facts (identity tier, grant id/fund/purpose, attribution state) | Asym Postgres (P13 header extension columns)                                                                             | Gift entry inside the P13 entry transaction                                                          | Asym; sponsor paperwork = evidence                                                                             | Re-attribute flow (+ rule update/delete + consent-gated correction offer)                                           |
| Fund-name memory rules                                                            | Asym Postgres (`daf_fund_memory_rules`)                                                                                  | Confirm-once checkbox at save; re-attribute dialog                                                   | Asym                                                                                                           | Inline rule update/delete; provenance chips; reversibility is the safety basis                                      |
| Tributes + gift links                                                             | Asym Postgres (`tributes`, `contribution_tributes`)                                                                      | Tribute setup + inline 2-field create; memo-line memory suggests, never auto-creates                 | Asym                                                                                                           | Guided successor flow (type flip); P9 merge re-point list                                                           |
| Tribute notify parties (preferences + suppression)                                | Asym Postgres (`tribute_notify_parties`)                                                                                 | Setup gate + capability-gated preference edits                                                       | Asym; family requests are recorded, never adjudicated                                                          | Tombstone + re-add acknowledgment; suppression-grade `never` audit                                                  |
| Tribute purpose requests + coverage ledger                                        | Asym Postgres (`tribute_letters`, `tribute_notification_items`); Phase 18 owns artifacts; Phase 6 owns dispatch evidence | Atomic purpose/coverage transaction + outbox; staff compose-now                                      | Phase 14 frozen typed facts are what was requested; exact Phase 18 version + Phase 6 event prove what was sent | Cancel reopens items in-transaction before release; later correction is append-only; no automatic retraction letter |
| Matching gift expectancies                                                        | Asym Postgres (`matching_gift_expectancies`)                                                                             | Entry checkbox + tracker CRUD; locked fn / P13-event consumer for received/reversed                  | Asym; **money always wins** (a settlement re-enters `received`)                                                | 6-state machine + audit; dupe merge via `superseded`/`merged_into_id`                                               |
| Matching gift settlements                                                         | Asym Postgres (`matching_gift_settlements`)                                                                              | The locked settlement-writing fn inside the P13 entry txn                                            | Asym                                                                                                           | Fulfilled total re-derives from effective lines; `UNIQUE (tenant_id, line_id)` rejects double-links                 |
| Affiliated-party standing rules                                                   | Asym Postgres (`affiliated_party_credit_rules`)                                                                          | Staff CRUD under the manage/approve SoD pair                                                         | Asym                                                                                                           | Prospective-only; governed retroactive backfill refusing statement-referenced headers                               |
| Recognition / roster / matching read models                                       | Asym Postgres **derived** (no writer — folded at read on the P13 `effective_seq` cursor)                                 | None — `getPartyCreditActivity`, `getSupporterRoster`, `getMatchingActivity`                         | Asym derivation                                                                                                | Re-derive; cursor invalidation; P8 drift signals                                                                    |

**Provider rule reaffirmed (Phase 1):** there is no provider to link in this domain — matching-vendor ingest (Phase 31 (Platform API, Webhooks & Connector Framework)) arrives through the versioned event-shape socket with tenant identity from per-tenant registration, **never from payload**, and vendor ids live in archived payloads, never as identity [D4.14].

### Postgres-enforced invariants (the DB is the enforcement floor)

These are structural — enforced by constraint, trigger, or locked function, not application code alone. Each is a pgTAP target; the named poison fixtures are consolidated in the Testing & Poison Fixtures section.

1. **Credit identity key.** Partial `UNIQUE NULLS NOT DISTINCT (tenant_id, header_id, line_id, party_id, credit_role) WHERE active` — generators converge; manual + rule same-party dupes are impossible [D1.1]. _Fixture: manual + standing-rule `household` credit on one header = one row (the NPSP #5796 killer)._
2. **Scope exclusivity.** A `(party_id, credit_role)` is header-scoped XOR line-scoped per header — constraint trigger; forbid, don't interpret — so naive sums are correct by construction [D1.2]. _Fixture: mixed-scope insert for one party+role on one header RAISEs._
3. **Amount-class shape.** One CHECK ties `amount_minor` to the role's class: allocation ⇒ NOT NULL; annotation ⇒ NULL; recognition ⇒ NULL-or-set [D1.3]. _Fixture: a `tribute` row carrying an amount rejects._
4. **Allocation bound.** Member rows under one remittance line sum ≤ that line — generator-enforced AND a deferred constraint trigger (generator bugs cannot over-allocate) [D1.3]. _Fixture: 3-member over-allocation rejected at COMMIT._
5. **No currency column on credits.** Currency = header currency by construction; the absent column makes cross-currency credits unrepresentable (documented non-application of P13 rule 9) [D1.3]. _Enforcement: schema shape + the CI non-money gate._
6. **`is_receiptable = FALSE` tripwire.** Column + DB CHECK kept per P7 A8 even though the primary wall is the credit-blind Phase 7 facts path; a **schema lint asserts the CHECK exists** [D1.11]. _Fixture: a DAF advisor can never create receipt facts/artifacts or enter a deductible total._
7. **Freeze trigger.** `BEFORE UPDATE OR DELETE` RAISEs once `frozen_at` is set (first external reference: statement item or sent doc); supersede-only after; the party-merge re-point of `party_id` is the sole exception — a trigger, not RLS, because **service_role bypasses RLS** and the generators run as service*role [D1.5]. \_Fixture: a raw UPDATE of a statement-referenced credit as service_role RAISEs.*
8. **Import identity, first migration.** Partial `UNIQUE (tenant_id, external_ref)` on `contribution_credits`, `tributes`, `contribution_tributes`, `tribute_notify_parties`, and `matching_gift_expectancies` ships before any importer exists [D1.1, D3.10, D4.9]. _Fixture: double import is idempotent; import fires zero sends and zero credits._
9. **Composite tenant FKs + FORCE RLS on every table.** _"The generators run as service_role — RLS won't save a bad join"_ — the composite FK makes a cross-tenant reference **unresolvable**, not merely unreadable; per-generator cross-tenant negative tests at the Phase 4 tier [D1.9, D3.11]. _Fixture: a service-role mis-joined cross-tenant header on an item/credit fails the FK._
10. **The P13 lines UNIQUE amendment.** `contribution_designation_lines` gains `UNIQUE (tenant_id, header_id, id)` so line-scoped credits and settlements carry the full `(tenant_id, header_id, line_id)` FK — a credit can name only a line of its own header in its own tenant [D1.9, rides D1.14]. _Fixture: a credit naming another header's line cannot resolve._
11. **One locked mutation function, one lock.** All credit mutations go through one locked SECURITY DEFINER function taking the **SAME per-contribution advisory lock as the P13 axis RPC**; batch match entry is an ordinary P13 entry transaction with expectancies `FOR UPDATE ORDER BY id` + `lock_timeout` [D1.8, D4.2]. _Fixture: two concurrent clerks on overlapping expectancies — no deadlock, no double-settle._
12. **`daf_sponsors` is a party-extension.** PK = `party_id`, 1:1, no duplicated identity columns; tenant-scoped forever [D1.9]. _Fixture: a second sponsor row for one party rejects on the PK._
13. **Notify-row uniqueness.** Partial `UNIQUE (tenant_id, tribute_id, party_id) WHERE active`; P9 merge collision resolves strictest-pref-wins, `include_total = false` wins, coverage untouched [D3.11]. _Fixture: merging two watched parties leaves one active row with strictest prefs._
14. **Coverage grain.** `UNIQUE (tenant_id, notify_party_id, header_id)` on `tribute_notification_items`, written in the **same transaction** as the letter row; cancel reopens items in-txn (status flip, never delete) [D3.1]. _Fixture: two tributes + one watcher + one gift ⇒ told once._
15. **Letter exactly-once.** `UNIQUE (tenant_id, tribute_id, notify_party_id, period_key)` — at-least-once Inngest delivery composes to exactly one letter [D3.2]. _Fixture: crash-retry mints exactly one letter._
16. **Suppression-grade `never`.** CHECK: `frequency = 'never'` ⇒ reason + set*by + set_at NOT NULL; unset requires capability + audit; the consent gate re-checks at send [D3.7]. \_Fixture: `never` = zero sends forever, including composed-then-flipped.*
17. **`tribute_type` immutability.** BEFORE UPDATE trigger rejects a type change after the first letter; honor→memorial is close + guided successor (notify parties re-confirmed, coverage NOT carried) [D3.12]. _Fixture: post-letter type flip RAISEs._
18. **Expectancy state wall.** TEXT + CHECK over the 6 states; `closed_reason` CHECK; `received`/`reversed` unreachable via plain UPDATE (BEFORE UPDATE trigger RAISEs — only the settlement fn and the P13-event consumer set them); `reversed` only when the settled fold = 0 [D4.2, D4.3]. _Fixtures: phantom-received plain UPDATE rejected; received double-fire = one settlement set; reversal → fold-zero without row deletion._
19. **Settlement junction shape.** `UNIQUE (tenant_id, line_id)` (a line settles ≤1 expectancy); **no amount column** (the line IS the amount); composite tenant FKs both directions; no (expectancy, header) unique by design [D4.1]. _Fixtures: same-line double-link = one settlement; batch 1-header/3-lines/3-expectancies = 3 bounded credits._
20. **Expectancy dupe guard + nullable origin.** Partial `UNIQUE (tenant_id, origin_header_id, employer_party_id) WHERE open`; `origin_header_id` nullable; the socket never silently auto-creates when a candidate exists [D4.9]. _Fixtures: null-origin expectancy works end-to-end; duplicate create warns._
21. **Expectancies are never money.** No fold, ledger, or vocabulary may include `expected_amount_minor` — registered in the D1.4 CI non-money gate; the DB grants it to no money surface; variance never blocks `received` [D4.7]. _Fixture: an expectancy never appears in any fold._
22. **Standing-rule capped shape.** No amount/percent/designation-filter columns exist — the forbidden rule shapes are unrepresentable; the retroactive backfill refuses statement-referenced headers (frozen credits are supersede-only) [D1.13]. _Fixture: a backfill touching a statement-referenced header refuses._
23. **Audit subject tenancy.** The polymorphic `subject_type`/`subject_id` pair is validated by the audit table's tenant-refs guard trigger (extended), so an audit row can never point at another tenant's subject [D4.12]. _Fixture: a cross-tenant subject_id on an audit row rejects._

### Index plan (consolidated, v1)

All credit indexes are partial on the `active` predicate that scopes the identity key. Per R-LEAN, nothing beyond this list ships in v1 — Phase 33 (Reporting & BI / Report Studio) owns analytic shapes later.

- **`contribution_credits`:** `(tenant_id, party_id, credit_role) WHERE active` (getPartyCreditActivity, Giving tab, roster paths); `(tenant_id, header_id) WHERE active` (Contribution Detail, statement composition — also the identity key's leading columns); `(tenant_id, line_id) WHERE line_id IS NOT NULL AND active` (the D1.6 correction-cascade stamp resolves line-scoped credits without scanning header-scoped rows).
- **`affiliated_party_credit_rules`:** `(tenant_id, giver_party_id) WHERE active` over the effective window — posting-time rule matching is an index probe on every gift entry, never a scan.
- **`tributes`:** partial index on `next_due_at WHERE next_due_at IS NOT NULL` — the cron scan touches only due streams [D3.2].
- **`tribute_notification_items`:** the coverage UNIQUE doubles as the anti-join probe ("gifts not yet in any letter"); plus `(tenant_id, letter_id)` for frozen-set renders.
- **`matching_gift_expectancies`:** partial `(tenant_id, employer_party_id) WHERE state IN ('identified','submitted')` — the received-entry suggestion list (open expectancies per employer, aggregated per employee) and the age-bucketed worklist share it.
- **`matching_gift_settlements`:** `(tenant_id, expectancy_id)` — the fulfilled-total derivation.
- **`party_payer_aliases` / `daf_fund_memory_rules`:** their UNIQUEs double as the matcher/recall probes.
- **Ack work view:** partial index on `contribution_headers (tenant_id, acknowledgment_request_state) WHERE acknowledgment_request_state IN ('held','ready','released')`; the "Unacknowledged" view additionally joins the exact Phase 6 owner relation/version and communication outcome. It is a query, not a table, and Phase 14 has no `failed` communication status.

### CONTEXT.md glossary additions

The D1.14/D3.14/D4.14 congruence commit adds these terms to the root `CONTEXT.md` glossary (one-line definitions; this PRD is the authority behind each):

- **hard credit** — the single legal donor's receiptable claim on a gift (P7 A8); the only input to the Legal vocabulary.
- **soft credit** — a recognition-only, structurally non-receiptable (`is_receiptable = FALSE`) `contribution_credits` row; never mints a receipt, never enters a money total.
- **credit role** — the TEXT+CHECK why-this-party-is-recognized label on a credit row; fixed v1 registry, each role in exactly one amount class.
- **recognition amount** — a credit's derived current worth: `LEAST(amount_minor, scope_effective_minor)`, 0 when the scope is reversed/voided.
- **the recognition fold** — the ONE canonical read model deriving recognition amounts, keyed on the P13 `effective_seq` cursor; the sole aggregator every credit surface consumes.
- **credit generation run** — the resumable, idempotent fan-out job record behind generator-minted credits (full-target-set upsert against the identity key).
- **DAF sponsor** — the fund-owning charity (per-tenant org party, `org_type = daf_sponsor`); the hard-credit legal donor of a grant.
- **DAF advisor** — the recommending human behind a grant; recognition-only, thanked with a $0 non-receipt acknowledgment.
- **advisor identity tier** — the per-grant record of what the sponsor's paperwork disclosed: `full | fund_name_only | anonymous`.
- **fund-name memory** — confirm-once rules mapping (sponsor, fund name) → an attributed household, with provenance chips and inline reversibility.
- **tribute / honoree / notify party** — the reusable honor-or-memorial record; the person it honors (party-linked or name-only); a person watching the tribute with channel/frequency/total preferences.
- **coverage ledger** — `tribute_notification_items`: the (notify party, header) truth of who has been told about which gift, written in the letter's transaction.
- **decay cadence** — the age-anchored letter pace (weekly in tribute weeks 0–4, then ≥28-day gaps); no automatic stop ever — an uncovered gift always eventually composes.
- **matching expectancy** — the anticipated-but-not-money record of an employer match; advisory amounts only, never in any fold.
- **settlement link** — the `matching_gift_settlements` junction row binding one received employer line to one expectancy; the line IS the amount.
- **payer-of-record** — the legal donor of a match/workplace check: whoever actually paid (defaults to the employer; intermediaries like GE Foundation/Benevity are real payers).
- **payer intelligence registry** — `party_payer_aliases`: org-keyed payer alias strings with `payer_kind`, feeding one matcher and one triage surface; unmatched strings fail closed.
- **supporter roster** — `getSupporterRoster`: the designation-centric read model showing one row per supporting party with direct and via-paths, both lenses, zero copies.
- **support path** — one element of a roster row's `paths[]`: `{path_kind, via_party, legal/recognized amounts, dates}`.
- **supports policy v2** — the roster-only churn predicate: recognized fold > 0 on any effective line in scope in the trailing 365 days OR a typed Phase 16 active commitment; recognition alone never infers commitment status.
- **attribution inbox** — the finite, owned worklist of Not-Provided DAF gifts (the same worklist idiom reused for matching-gift aging and tributes awaiting setup).

## Permissions, Separation of Duties & Audit

Per Phase 12 (Full Role & Permission Configuration), **capabilities are the only enforcement unit**: every credit/tribute/matching read or write verifies the HMAC-signed, tenant-branded `EffectiveAccess` (subtract-only floor always wins; a capability is a branded key of `CAPABILITY_REGISTRY`, never a bare string). **Phase 14 MINTS its capabilities and DECLARES its SoD pairs; Phase 12 enforces them.** Naming follows the Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) convention `finance:<verb>_<noun>`.

**Minting pattern (the Phase 12 mechanics, followed exactly)** [D1 forward-carried / D22]:

1. Add each capability to `CAPABILITY_REGISTRY` (FORWARD — Phase 12 §A, epic #665; the registry is a branded/nominal type, so a typo fails `tsc`).
2. Regenerate the derived grant seeds — `permission_capabilities` / `role_capability_grants` are a **generated, CI-verified, boot-asserted artifact** of the code registry; the `permissions:verify` **golden-snapshot gate** fails the build on any registry↔seed diff, and `assertRegistryMatchesSeed()` refuses to serve on mismatch (FORWARD — Phase 12 §A). The golden snapshot is updated in the same PR that mints the capability, never a follow-up.
3. Every new Phase 14 record type (`contribution_credits`, `credit_generation_runs`, `affiliated_party_credit_rules`, `daf_sponsors`, `party_payer_aliases`, `daf_fund_memory_rules`, `tributes`, `contribution_tributes`, `tribute_notify_parties`, `tribute_letters`, `tribute_notification_items`, `matching_gift_expectancies`, `matching_gift_settlements`) ships **Phase 3 (Minimum Permission & Role-Scoped Projection Foundation) census rows, fail-closed** — an unclassified field never egresses [D1.10, D3.11]. (FORWARD — Phase 3 epic, issues #489/#493.)

### Capability registry (consolidated)

| Capability                                                                            | What it gates                                                                                                                                                                                                                                                                                                                                                                                                                  | Who typically holds                                     | SoD / governance notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `finance:record_credit`                                                               | Creating a manual `contribution_credits` row, and editing one **before** its first external reference (statement run item or sent document) — always through the one locked SECURITY DEFINER credit function under the Phase 13 per-contribution advisory lock [D1.5, D1.8]. `line_id` is never a general UI field; it is set only by the named flows (remittance attribution editor, import, credit-review re-attach) [D1.2]. | Finance staff (gift entry).                             | No SoD. Audited; post-freeze edits are impossible by trigger (supersede-only).                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `finance:revoke_credit`                                                               | Superseding/ending an active credit row (`supersedes_id` chain); the only path once a row is frozen by first external reference [D1.5].                                                                                                                                                                                                                                                                                        | Finance staff.                                          | No SoD. **Reason required, non-suppressible**; writes the audit row before the mutation commits.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `finance:manage_credit_rules`                                                         | Authoring/editing/ending standing rules in the capped v1 shape `{giver → credited, role, full/NULL amount, effective_from/to}` — no percent formulas, no designation filters [D1.13]. Rules **auto-apply prospectively with provenance chips — no proposal queue** [D5 close-out 4a].                                                                                                                                          | Finance/admin.                                          | **SoD pair with `finance:approve_credit_rules`.** A new or widened rule takes effect only through an approval object with a **server-enforced requester ≠ approver** check (the Phase 13 `contribution_correction_request` idiom); Phase 12's dynamic-SoD scan additionally flags any principal whose _resolved_ set holds both halves. Phase 12's quorum-aware routing answers the sole-finance-admin case (routes to a platform/delegated reviewer when the pool is 1) — Phase 14 builds no bespoke fallback.      |
| `finance:approve_credit_rules`                                                        | Approving a proposed standing rule (checker half).                                                                                                                                                                                                                                                                                                                                                                             | A second finance/admin principal.                       | See above; approval is audited with the rule's before/after shape.                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `finance:apply_retroactive_credits`                                                   | Running the **explicit governed backfill** that applies a standing rule to historical headers. The backfill **refuses statement-referenced headers** structurally — a header already frozen into a statement run is skipped and surfaced, never rewritten [D1.13]. Runs as a D1.7 `credit_generation_runs` fan-out (idempotent, resumable).                                                                                    | Finance/admin (rare).                                   | **SoD pair with `finance:approve_retroactive_credits`** — requester ≠ approver server-enforced on the backfill object. Highest-blast-radius credit verb: it rewrites recognition history in bulk.                                                                                                                                                                                                                                                                                                                    |
| `finance:approve_retroactive_credits`                                                 | Approving a proposed retroactive backfill (checker half).                                                                                                                                                                                                                                                                                                                                                                      | A second finance/admin principal.                       | See above.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `finance:manage_daf_sponsors`                                                         | The `daf_sponsors` party-extension registry (PK = party_id, 1:1) and its alias rows — i.e., `party_payer_aliases` rows with `payer_kind = 'daf_sponsor'` — plus the one-click alias-triage surface for that kind (never silent misfile) [D1.9, D4.5]. Fund-name-memory rule confirmation ("Remember: 'Miller Family Giving Fund' → Millers") rides ordinary gift entry, not this cap [D2].                                     | Finance staff / donor care.                             | No SoD. Alias creates/edits/deletes audited; the registry is **tenant-scoped forever** (global sponsor lists ship only as per-tenant seed suggestions) [D1.9].                                                                                                                                                                                                                                                                                                                                                       |
| `finance:manage_matching_gifts`                                                       | Expectancy lifecycle CRUD: create (the one-checkbox entry flow), `identified ↔ submitted`, `closed` with `closed_reason`, `superseded` merges, `expires_at`, program notes, the employer `match_claim_deadline` field, and `party_payer_aliases` rows with `payer_kind = 'workplace_giving_intermediary'` [D4.3, D4.5, D4.6, D4.8].                                                                                            | Development staff (the named worklist owner) + finance. | **Recording `received` additionally requires the Phase 13 contribution-posting capability (`finance:record_contribution`) — the locked RPC demands BOTH.** Money enters only as an ordinary Phase 13 entry transaction (header + lines + settlements sync under the new header's advisory lock); the expectancy cap alone can never post money, and the posting cap alone can never settle an expectancy [D4.2, D1.8]. `received`/`reversed` are unreachable via plain UPDATE (BEFORE UPDATE trigger RAISEs) [D4.2]. |
| `finance:fulfill_tribute_letters`                                                     | Print custody of composed tribute letters — a **governed export** per Phase 3: Phase 18 authenticated exact-artifact access, identifiers-only request evidence, a retention class with verified post-fulfillment disposal, and the manual `queued → printed → mailed / returned` status transitions [D3.5]. No raw/provider/signed-object URL is authority.                                                                    | Finance/admin or the staffer who runs the print queue.  | No SoD. Every request is re-authorized and audited; a no-address mail party is a HOLD + task, never a silent skip [D3.5].                                                                                                                                                                                                                                                                                                                                                                                            |
| _(surface registration, not a capability)_ `getSupporterRoster` missionary projection | The missionary-facing roster view registers as a **Phase 3 `resolveProjection` surface** with its own fail-closed census rows; missionaries reach roster data only through it (resolveProjection-floored; restricted rows omitted with zero split arithmetic) [D5]. The staff FINANCE view of the same read model rides the Phase 13 `finance:view_contributions` capability.                                                  | Missionary role (own scope only).                       | Not a new capability mint — a projection-surface registration. The seven-item never-leak fixture list (§ Testing) is the acceptance gate.                                                                                                                                                                                                                                                                                                                                                                            |

### Safety & visibility floor [D1.10]

Restricted-tier credited, honoree, notify, or employee parties ⇒ the credit/tribute/expectancy row is OMITTED from all external egress and from staff below clearance — invisibility, not aliasing. Missionary-workspace credit surfaces inherit FINANCE visibility through resolveProjection (fail-closed census rows). contribution_credits and all tribute and matching tables join the platform search/AI exclusion list — recognition data never surfaces through discovery, search, or AI indexes. The reserved Phase 6 (Shared Communication Event Model) fourth visibility value credited_party_visible is honored per credit on every egress.

### Founder governance posture — role + reason + active audit; SoD only where declared

Phase 14 inherits the Phase 13 D5 posture verbatim: credit operations are gated by **capability + a mandatory non-suppressible reason + an immutable audit trail**, not by default second-approver ceremony. The two places the grill _did_ ratify hard maker/checker pairs are the standing-rule pair and the retroactive-backfill pair above — those are the only preventive SoD controls Phase 14 declares [D1.13].

- **Expectancy write-off is deliberately NOT an SoD pair.** Closing an expectancy with `closed_reason = 'written_off'` requires the capability + a required reason, audited — per the founder's don't-over-engineer rider [D4, D4.3]. Write-offs never touch money: an expectancy is never in any fold, so a write-off changes pipeline expectation only [D4.7, D4.13].
- **Maker-checker `classifyChange` on any policy widening.** Any widening of a document-class merge-field allowlist (§E — e.g., adding a renderable field to the notification class beyond the single governed `tribute_aggregate_total`), of notification donor-identity policy, or of a `credited_party_visible` exposure routes through the Phase 3 `classifyChange` widen classifier and its maker-checker change-control (`narrow | neutral | widen`, **fail-closed to `widen` on any ambiguity**; widen ⇒ pending row + a distinct human approver). (FORWARD — Phase 3 PRD, Module 5 `field_policy_change_requests` + `classifyChange`, `docs/prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md`.) Phase 14 adds no second change-control spine [D1.11, D3.4].

### Audit — one spine, extended, never forked

- **The audit home is `contribution_operation_audit_events`.** REAL: the table exists today at `supabase/migrations/20260526132000_contribution_operations_core.sql:76` (actor / operation / reason / policy + before/after snapshots / provider_outcome / correlation_id). Its `donation_id` FK re-points to `contribution_headers` in the Phase 13 D2 atomic cutover (FORWARD — Phase 13 Build Order item 4).
- **Phase 14 extends it with the D4.12 polymorphic subject:** a nullable `(subject_type, subject_id)` pair with a composite tenant FK, so pre-received expectancy transitions, credit supersedes, standing-rule changes, tribute-stream acts (pause/never/removal), and alias-registry mutations get an audit home **without a second audit spine** [D1.5, D4.12]. Rows referencing a header keep using the existing header FK; subject columns cover everything that is not yet (or never) a contribution.
- **Reason capture rules (consolidated):** (1) revoking/superseding a credit, closing an expectancy, and any override of a payer-alias blocking hint require a reason — the hint override records reason-to-override in both directions, never silent [D1.5, D4.3, D4.5]; (2) `never` on a tribute notify row is a **suppression-grade fact** — reason + set_by + set_at, unset requires the tribute-manage capability + audit, provenance chip shown at setup/compose [D3.7]; (3) notify-party removal = tombstone + stream-scoped suppression, re-add requires acknowledging the prior removal reason; staff adjudicate nothing in family feuds — record who asked, reason required, audited [D3.7]; (4) "Not Provided" DAF attribution takes a one-tap reason chip at entry [D2]; (5) merge re-point of `party_id` — the only sanctioned in-place credit write — is audited through the Phase 9 (Full CRM Depth & Relationship Graph) merge machinery, not a Phase 14 path [D1.5].

---

## Observability & Data-Health

Everything here is **derived from the ledger's and lifecycle tables' own truth — no observability surface introduces a second writable counter** (the Phase 13 posture, unchanged). All signals are data-derived, tenant-scoped, and redaction-by-construction per Phase 8 (CRM Operating Foundation) A5: signal payloads carry verdicts, counts, ages, and signal names — structurally never donor names, amounts, or deductibility.

### Registration into the Phase 8 catalog socket

Phase 14's signals register into the **Phase 8 (CRM Operating Foundation) CRM data-health catalog** following its A2 reader convention — the `dataHealth` module is "the enumerated signal set + each signal's reader; build-now readers wired, [reserved] readers reserved (return 'not-yet-available' until their source ships)" (FORWARD — Phase 8 PRD §A2 + §B `dataHealth`, ticket T9/#596). Each Phase 14 signal ships as a catalog entry + reader in the build-order slice that creates its source table, returning `not-yet-available` until that slice lands. Escalation, dedupe-per-`(tenant, source, key)`, aging, and the Sentry-vs-email alert split are Phase 8's — Phase 14 builds **no** second escalation or alerting path.

### Named signals (consolidated)

| Signal                            | Definition (data-derived)                                                                                                                                                                                                                                                                                                                                                           | Source decision            | Lights up with                                                          |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------- |
| `credit-generation-drift`         | Divergence between a generator's declared full target set and the active credit rows it should have produced — a `credit_generation_runs` fan-out that died mid-run (the 200-member die-at-117 case) or a target set whose idempotent upsert never converged, beyond a grace window. Detected by re-deriving the target set and diffing, never by trusting a run's own status flag. | [D1 forward-carried, D1.7] | The D1.7 async fan-out (remittance members, standing rules).            |
| `tribute-notification-drift`      | Uncovered tribute gifts beyond the stream's pace + grace (a gift with no `tribute_notification_items` coverage after `next_due_at` should have fired), plus streams sitting in `attention` beyond an age threshold.                                                                                                                                                                 | [D3.13]                    | The memorial digest engine (last build-order slice, per-tenant enable). |
| `stale-print-queue`               | Tribute letters stuck in `queued` (never `printed`) beyond a threshold — the fulfillment pile nobody is emptying.                                                                                                                                                                                                                                                                   | [D3.13, D3.5]              | The mail channel + print custody export.                                |
| `matching-expectancy-aging-stall` | The aging worklist is not advancing: oldest open expectancy age keeps growing with zero state transitions or worklist activity in the window. **Data-derived — a dead aging job self-reports**, because the signal reads the expectancy table, not the job's heartbeat.                                                                                                             | [D4.13, D4.8]              | Expectancy tracker CRUD + worklist (S2).                                |
| `matching-ingest-quarantine-age`  | Oldest un-adjudicated quarantined vendor-ingest event (quarantine = human-needed, distinct from dead-letter = crash).                                                                                                                                                                                                                                                               | [D4.13, D4.14]             | The ingest socket (S4).                                                 |
| `matching-fulfillment-drift`      | Divergence between settlement-derived fulfilled totals (the D1.4-idiom fold over effective line amounts) and the generated line-scoped `matched_employee` credit rows — the D1.7 async credit fan-out failing to converge on received settlements.                                                                                                                                  | [D4.13, D4.1]              | The received flow + credit generator (S3).                              |

### The outbox feed, timeline events & provenance chips

- **Every released auto-send request joins to a Phase 6 timeline event on the party + a row in the tenant-level "Sent automatically" outbox feed once dispatch occurs** — the D2 guardrail (10), reused by the tribute stream [D2, D3.9]. Phase 14's acknowledgment request state remains `{not_applicable, held, ready, released, canceled}`; the "Unacknowledged" work view derives communication progress from the joined Phase 6 outcome rather than copying `sent`, `suppressed`, or `failed` into Phase 14 [D2 guardrails 3–4]. Per-stream tribute purpose/readiness states (`{active, held, attention, ended}`) remain Phase 14 facts [D3.9].
- **Provenance chips are the trust mechanism that makes confirm-once-then-auto safe** [D2]: every auto-matched attribution, remembered fund-name rule, payer-alias hit, auto-applied standing rule, and org-sourced roster row renders an evidence chip ("matched from 3 prior grants" — hover: the rule, who confirmed it, when) [D2, D4.5, D5, close-out 4a]. Ambiguity never renders raw scores — **word tiers + provenance badges** only, and ambiguity HOLDS the action for an explicit human pick [D2 guardrail 9].
- **Worklists, not nag streams:** the Attribution Inbox (Not-Provided DAF gifts), "Tributes awaiting setup", "unlinked match lines", and the age-bucketed expectancy worklist are finite owned queues in the same idiom; the tenant dashboard shows attribution completeness %, with no per-record nag emails [D2, D3.12, D4.6, D4.8].

### The Phase 33 seam

`getMatchingActivity` is the **sole consumer interface** for matching pipeline facts **and carries the funnel aggregates inside itself** (identified → submitted → received counts/amounts/aging) — that read model _is_ the Phase 33 (Reporting & BI / Report Studio) seam: Phase 33 consumes the same named read models (`getPartyCreditActivity`, `getMatchingActivity`, `getSupporterRoster`) rather than re-deriving, so staff reports and dashboards can never diverge from the operational surfaces [D4.13, D5 close-out 5]. Expectancy aggregates are **excluded from both money vocabularies** (Legal and Recognition) and are registered in the D1.4 CI non-money gate — pipeline expectation is never a money figure on any report [D4.7, D4.13].

---

## Imports & Integration Seams

### Phase 30 (Imports & Migration Tools) — target shapes ready on day one

Phase 14 ships the import identity substrate **in the first migration**, so Phase 30 needs zero schema change here [D1.1, D3.10, D4.9]:

- **`external_ref` (+ `external_source` where ratified) with a partial `UNIQUE (tenant_id, external_ref)`** on: `contribution_credits` [D1.1]; `tributes`, `contribution_tributes`, `tribute_notify_parties` [D3.10]; and `matching_gift_expectancies` as the **one `external_ref` + `external_source` identity pair — `vendor_ref` is DELETED; raw vendor ids live in archived payloads** [D4.9, verbatim]. Re-import updates instead of duplicating (the Phase 30 stable-external-ID rule).
- **Historic received-pairs:** an imported historic matching gift arrives as an already-settled pair — an expectancy in `received` plus `matching_gift_settlements` rows referencing the imported employer header/lines — with credit rows imported as rows, not regenerated. Provenance is `source_kind = 'import'` on credits and `source = 'import'` on coverage backfill [D1.1, D3.10, D4.14].
- **Imports fire NOTHING.** Imported tributes **arrive stream STOPPED; activation = an explicit staff act** [D3.10]. No thank-you, notification, or acknowledgment sends (D2 guardrail 8: "Imports NEVER auto-send"); no credit generation beyond the imported rows themselves; no expectancy acknowledgments. The **`notified_through` watermark** plus bulk coverage backfill (`source='import'`) lets a migrated tribute resume its digest cadence without re-telling the family anything they were already told [D3.10].
- **Poison fixtures** (consolidated in § Testing): _import → zero sends, even after the tenant later enables streams_ [D3.10]; _import = zero sends/credits_ on the matching path [D4.14].
- Historic-giving imports never mint receipts (the Phase 30 roadmap guardrail, `docs/prds/sitestacker-parity/roadmap.md` Phase 30 §Boundaries) — and by the same token never mint acknowledgments or notifications here.

### The vendor ingest socket — contract ratified now, producer later [D4.14]

The matching-gift ingest socket is an **event-shape contract, not an integration**: a **versioned, typed payload**; **tenant identity comes from per-tenant registration, NEVER from the payload**; **quarantine (human-needed) ≠ dead_letter (crash)** — two distinct lanes with distinct owners; **NO synchronous match/no-match echo** — a producer can never enumerate donors by probing, per Phase 4 (Identity & Account-Claiming Foundation) A5 enumeration safety (REAL: phase-04 PRD §A5 six safety rules); the **archive table ships with the first non-staff producer, not before**. The socket **never silently auto-creates an expectancy when an open candidate exists** — it routes to the suggestion/triage surface [D4.9]. The future auto-spawn path is re-keyed `tenant + ingest_event_id` through the existing saga idiom (REAL prior art: `packages/api/src/donate/saga.ts`, `packages/api/src/workflows/functions/donation-saga-recovery.ts`, dispatch ledger `supabase/migrations/20260611134500_workflow_dispatch_ledger.sql`) [D4.2].

### Phase 31 (Platform API, Webhooks & Connector Framework) — reservations

- **Vendor linkage = generalized `crm_record_links`, zero Phase 14 schema change** [D4.9]. REAL: the table exists today at `supabase/migrations/20260508000413_crm_identity_mapping.sql:73`, currently provider-locked (`CHECK (crm_provider = 'twenty')` — Twenty is retired per ADR-0001); Phase 31 generalizes it into the per-tenant connector registry ("provider links (generalizing `crm_record_links`)", roadmap Phase 31 §What it covers). Phase 14 stores no vendor ids outside `external_ref`/`external_source` + archived payloads.
- **Double the Donation posture: rung 2 of the 4-rung ladder** (defer / **seam-only** / embed search / full sync). Phase 14 is seam-only — full org-owned machinery + the ingest socket, **no DTD contract this phase; rungs 3/4 = the Phase 31 connector framework** [D4]. DTD acquired HEPdata 2025-03 (effective monopoly ⇒ seam-don't-couple), and DTD's own posture treats the CRM as system of record — rung 2 matches it.
- **Consent/PII seam note:** any rung-3/4 integration (embedded employer search, vendor sync) exports donor PII — emails, employer inferences — to a third party. That egress must ride the Phase 3 governed-export door and the Phase 6 (Shared Communication Event Model) consent posture when it lands in Phase 31; Phase 14 reserves the seam and sends nothing outbound.

### Phase 15 (Offline Gift & Batch Entry) — named contracts

- **The remittance attribution sub-grid contract (VIABILITY-critical).** Phase 14 ships the v1 remittance keying surface — the D2 picker verbatim + **copy-last-remittance prefill** (month 2+ = confirm-not-retype) + **CSV paste** with staged preview (matched / create-new / ambiguous classes; bulk-create behind ONE explicit confirm with dupe flags; per-row ambiguity holds so one bad name never blocks the batch) [D5, D1 forward-carried]. Phase 15's batch grid must implement this **same named contract** as a sub-grid per remittance line — attributions remain capture-INPUT that generates `contribution_credits`; the grid never writes credit rows directly [D1.14].
- **The per-row match-capture cell contract.** Phase 15's grid owes a per-row DAF / soft-credit / tribute / matching capture cell (REAL expectation: `docs/prds/sitestacker-parity/roadmap.md:885-889`); Phase 14 defines the cell's behavior now — the one-checkbox expectancy create with employer prefilled from the Phase 9 employment relationship + evidence chip, zero other required fields [D4.6]. Phase 14 itself **owns the minimal single-header multi-line employer-check entry surface** (the repo has none); Phase 15 owns the fast grid [D4.6].
- **Batch imports never auto-send** — the D2 guardrail (8) binds Phase 15's commit step exactly as it binds Phase 30 imports: committing a batch advances axes and generates credits through the normal generators, but acknowledgment sends require the entry-gated flow's identity confidence, and batch/import-origin rows land in `held` (origin reason `batch_gate_pending`); the explicit per-batch **Send-acknowledgments gate** (Phase 15 NF3) is the human edge that releases them into the existing acknowledgment pipeline; imports stay `held` (nothing auto-sends) [D2, D3.9]. _(Amended 2026-07-11, Phase 15 NF3: a batch commit no longer merely "suppresses auto-send" — batch/import-origin rows land `held` with origin reason `batch_gate_pending`, and the per-batch Send-acknowledgments gate is the human edge that releases them into the acknowledgment pipeline; imports never pass the gate, so nothing auto-sends.)_

### Phase 20 (Accounting Exports & Reconciliation) — exclusions

- **Expectancies are invisible to exports** [D4.6, verbatim: "P20: expectancies invisible to exports"]. An expectancy is a pipeline fact, never money: it appears in no accounting export, no reconciliation total, no GL surface. Only the received employer contribution — an ordinary Phase 13 header — rides Phase 20.
- **Credits are non-money.** `contribution_credits` rows carry no currency column by construction (header currency by invariant — the deliberate non-application of Phase 13 rule 9) and are registered in the D1.4 CI grep gate as non-money sums [D1.3, D1.4]. They never reach an accounting export, a deposit tie-out, or a Legal-vocabulary total; recognition is a reporting overlay, full stop. `matching_gift_settlements` are links, not money — **the line IS the amount** [D4.1], and that line exports through Phase 20 as ordinary ledger truth with no settlement-side figure to reconcile.

---

_Section source: the ratified Phase 14 grill decision log (D1.1–D1.14, D2, D3.1–D3.14, D4.1–D4.14, D5 + close-out items 1–5), consumed without re-litigation. Predecessor bindings: Phase 3 census/projection + governed export; Phase 4 A5; Phase 6 send seam + consent; Phase 8 A2/A5 catalog + escalation; Phase 12 capability spine; Phase 13 audit spine, locks, and money vocabulary._

## Testing Strategy & the Permanent Poison-Fixture Tier

Good tests here assert **external, letter- and recognition-observable behavior** — "an import produces zero sends and zero credits," "a duplicate generator run converges to one active credit row," "a memorial total never shrinks" — not internal shape. Nothing in this phase moves money, but nearly everything in it can **mis-mail a grieving family, mis-credit a donor's recognition, or leak a restricted party**, so the safety tier is **permanent**: a failure fails the build, forever, exactly like Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart)'s money tier. The deepest coverage goes to the pure derivations — the D1.4 recognition fold, the D3.3 cadence function, the D4 settled-fold, the D5 roster path assembly — which are exhaustively table-driven.

**What makes a good test here (house discipline, inherited from Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) §Testing Decisions):**

- **Behavior over implementation.** Assert the observable contract at the boundary — the letter that did not send, the credit row that survived a correction, the roster row whose path sums reconcile — never the private column layout or how many rows a fold walked.
- **pgTAP for DB invariants.** The D1.1 identity key, the D1.2 scope-exclusivity constraint trigger, the D1.3 allocation bound, the D1.5 frozen-after-reference `BEFORE UPDATE/DELETE` RAISE, the D4.1 `UNIQUE(tenant_id, line_id)` settlement rule, the D4.3 `received`/`reversed`-unreachable-via-plain-UPDATE trigger, and every composite `(tenant_id, …)` FK are **enforced in Postgres**, so they are proven in Postgres — not mocked in TypeScript. The triggers RAISE because RLS cannot stop `service_role` (the P13 lesson [D1.5]).
- **Drive generator tests through real code + local DI — never `vi.mock` of package internals.** Per the repo Bun-realpath trap, a `vi.mock` of `packages/*` internals by relative path silently no-ops in the full CI suite; exercise the **real** generators/composers/folds and inject boundary dependencies (a fake clock, a fake outbox drainer, a fake send seam) via DI the code actually calls.
- **Prior art (REAL — verified in-repo as of authoring, under `tests/unit/packages/api/`):**
  - `tests/unit/packages/api/admin/contribution-effective-values.test.ts` — table-driven tests of the pure `deriveEffectiveContribution` fold over append-only adjustments; the direct precedent for the D1.4 recognition-fold and D4 settled-fold test shape.
  - `tests/unit/packages/api/admin/contribution-operations-permissions.test.ts` — capability-array behavior across a fixed set of money action types; the precedent for the Phase 14 capability/SoD tests (§Permissions).
  - `tests/unit/packages/api/admin/support-hub/tenant-isolation.test.ts` — tenant-isolation negative behavior driven through a real adapter; the shape of the per-generator cross-tenant tier below.

  These are patterns to extend, not brittle files to depend on.

### The consolidated permanent poison-fixture tier

One deduplicated tier merging the D1 substrate fixtures, D3.14's nine, D4.14's ten, and D5's seven never-leak items. Each fixture is **committed as a failing input proving the gate bites**; each is red-on-regression forever. (The consolidation lands at 35 — the ratified lists carry fully; only true cross-list duplicates were merged: the import fixture [D3.10 = D4.14] and the restricted-invisibility fixture [D1.10 = D3.14 = D4.10].)

**Family 1 — credit substrate [D1]:**

1. **Duplicate-credit impossibility:** a manual credit and a rule-generated credit for the same (party, role, scope) converge to one active row via `UNIQUE NULLS NOT DISTINCT (tenant_id, header_id, line_id, party_id, credit_role) WHERE active` — the NPSP #5796 killer [D1.1].
2. **Scope and bound constraints:** a (party, credit_role) that is both header-scoped and line-scoped on one header is rejected by the constraint trigger [D1.2], and remittance member allocation rows summing past their line reject (generator + deferred trigger) [D1.3].
3. **Fold-to-zero on reversal, no row mutation:** a reversed/voided scope folds `recognized_minor = LEAST(amount_minor, scope_effective_minor)` to 0 with the credit rows untouched [D1.4/D1.5], and a matching reversal drives the settled fold to zero **without deleting any settlement row** [D4.14].
4. **Frozen-after-reference:** any `UPDATE`/`DELETE` on a credit included in a Phase 19 Support-overview facts package or a sent document RAISEs — including raw SQL as `service_role`; supersede (`supersedes_id`) is the only path [D1.5].
5. **Manual-credit survival:** a P13 correction never auto-deletes a manual credit — it stamps the row and routes a review task ("re-attach recognition to the +Y line?") [D1.6].
6. **Retroactive-backfill refusal:** a governed retroactive standing-rule backfill refuses statement-referenced headers [D1.13].
7. **Fan-out crash-resume:** a 200-member remittance generation dying at member 117 resumes to the full target set with zero duplicates (`credit_generation_runs` + idempotent upsert) [D1.7].

**Family 2 — documents & walls [D1.11, D3]:**

8. **Receipt-mint-no-credit-input:** the receipt-mint path structurally takes no `contribution_credits` input; a credit row can never mint a receipt or enter a deductible total [D1.11, P7 A8] — "the PRIMARY wall = receipt-mint path structurally takes no contribution_credits input" (verbatim).
9. **Purpose-wall refusal at both owning seams:** a deductibility fact in an acknowledgment message, or a per-gift amount in a tribute notification document, fails atomically at the Phase 17 and Phase 18 public seams [D1.11, D3.6, D3.14].
10. **Aggregate-total single field + monotonic floor:** only `tribute_aggregate_total` is renderable, only when the notify row has `include_total = true`; when the live fold drops below the last printed total the total line is **omitted** and a staff task routes — "a family never sees the memorial shrink" (verbatim) [D3.4].
11. **Anonymous crowd-blend:** a restricted-tier donor in a letter renders EXACTLY as an anonymous donor ("an anonymous friend", counted) — indistinguishable by construction [D3 adjudication, D3.8].
12. **Deceased statement recipient:** statement composition holds a deceased-flagged recipient's statement with a routed task, never auto-mails [D1.10].

**Family 3 — tribute stream [D3]:**

13. **`never` = zero sends forever** — a suppression-grade fact that survives every cadence, catch-up, and compose-now path [D3.7, D3.14].
14. **Deceased-recipient block:** deceased checks cover honoree AND notify parties at compose AND at send [D3.8, D3.14].
15. **Crash-retry = exactly one letter:** a retried composition mints one letter per `UNIQUE(tenant, tribute, party, period_key)` and one item set [D3.2, D3.14].
16. **Two tributes, one watcher = told once:** the (notify_party, header) coverage grain means a "Mom and Dad" watcher on two tributes is never double-told about one gift [D3.1, D3.14].
17. **Pause/kill enforced at both seams:** tenant `tribute_stream_paused` and the global kill are checked at compose AND at the send/print seam — zero letters escape a paused tenant [D3.2].
18. **Cancel-reopens-items:** canceling a composed letter reopens its coverage items in the same transaction; the reopened gifts ride the next composition [D3.1].

**Family 4 — matching [D4]:**

19. **Expectancy never in any fold:** an expectancy at any stage appears in NO money surface — neither Legal nor Recognition vocabulary [D4.7, D4.13, D4.14].
20. **Settlement idempotency:** a double-fired `received` produces exactly one settlement set [D4.14], and a same-line double-link produces exactly one settlement (`UNIQUE(tenant_id, line_id)`) [D4.1, D4.14].
21. **Batch bounding:** one employer header / 3 lines / 3 expectancies yields exactly 3 bounded line-scoped `matched_employee` credits [D4.14].
22. **Intermediary block:** a Benevity-registered payer pushed through the match path hits the blocking hint with reason-to-override — never a silent pass, either direction [D4.5, D4.14].
23. **Advisory never gates money:** a null-`origin_header_id` expectancy works end-to-end [D4.9], and expected-amount variance never blocks `received` [D4.7, D4.14].
24. **Employer privacy:** "employer-facing surfaces/receipts NEVER itemize employee identities" (verbatim) — invariant + fixture written before any org surface exists [D4.10].
25. **Rollup dedupe:** per-party recognition rollups take MAX-per-(party, header) across roles — an employee who is also `org_contact` never double-counts [D4.13].

**Family 5 — roster + privacy [D5, D1.10] (the seven never-leak items, BLOCKER-class, plus the consolidated invisibility fixture):**

26. The missionary view never exposes **other missionaries' supporters** (enumeration guard).
27. The missionary view never exposes **church-wide totals**.
28. The missionary view never exposes a **member's giving to other designations**.
29. The missionary view renders **zero residual split arithmetic** (attributed/unattributed reconciliation is FINANCE-under-clearance only).
30. The missionary view carries **no PII beyond the v1 field set** (display name, city/state, per-path recognized amounts + dates + fund alias, via-chip, support/recency label, and commitment status only for a typed Phase 16 subject).
31. **No restricted existence via counts:** visible counts are computed post-projection, so a restricted member's absence is arithmetically undetectable.
32. **No anonymous unmasking via cross-referencing:** anonymous members fold into one aggregated "Anonymous church members (N)" sub-row per church path.
33. **Restricted-tier invisibility end-to-end:** a restricted credited/honoree/notify/employee party means the credit/tribute/expectancy row is OMITTED from all external egress and from staff below clearance — **invisibility, not aliasing** (an aliased credit still confirms a relationship) [D1.10, D3.14, D4.10].

**Family 6 — tenant & ingest:**

34. **Cross-tenant service-role rejection:** a forged cross-tenant join written as `service_role` fails on the composite `(tenant_id, …)` FK, not merely RLS [D1.9, D4.14] (representative fixture; the full per-generator tier is below).
35. **Imports fire nothing:** an import produces zero sends AND zero credits across every generator — tribute (even after the tenant later enables streams), matching, remittance, and DAF [D3.10, D4.14, D2 guardrail 8].

### Golden-snapshot + census-row requirements

- **Census rows fail closed.** All 13 new record types (§Data Model) ship Phase 3 (Minimum Permission & Role-Scoped Projection Foundation) census rows **in the same migration** as their tables (FORWARD — the P3 field census is groomed, not built); a test asserts every new table has census coverage, and a missing row makes reads fail, not fall open [D1.10, D3.11].
- **Data-boundary golden snapshot.** The `verify:data-boundary` CI gate (REAL — `package.json` line 100 → `scripts/verify/data-boundary-check.mjs`) extends to every new egress door this phase opens (advisor acks, tribute letters, roster surfaces, employer surfaces).
- **Presentation proof.** Phase 17 email fixtures and Phase 18 exact-PDF fixtures consume only the typed source facts [D3.6]. Semantic/golden comparisons make drift visible, while only a promoted Phase 18 artifact's stored bytes are archival truth.
- **Roster alignment acceptance fixture.** "every roster row's path sums ≡ getPartyCreditActivity filtered to scope, both lenses" (verbatim) — the D5 "perfectly aligned" ruling is an executable test, not a slogan.

### Cross-tenant negative tier, per generator (Phase 4 (Identity & Account-Claiming Foundation) pattern)

Every code path that writes or composes on behalf of `service_role` gets its own cross-tenant negative test [D1.9, D3.11]: the manual credit RPC · the remittance fan-out generator · the standing-rule generator · the DAF advisor capture · the tribute link generator · the matching settlement→credit generator · each tribute letter composer (immediate + digest; the `tribute_notification_items`→headers FK shape catches a mis-joined cross-tenant header by construction) · `getSupporterRoster` · the ingest socket (tenant comes from per-tenant registration, NEVER from payload [D4.14]). Each test forges a plausible cross-tenant reference and asserts the composite FK rejects it.

### CI lint list (structural gates, red-on-regression)

1. **Non-money grep gate additions:** credit sums and `recognized_minor` folds are classified **non-money** [D1.4]; `expected_amount_minor` + variance registered as advisory-never-money [D4.7]; roster recognition displays and `getMatchingActivity` outputs registered as excluded from both money vocabularies [D4.13, D5]. The Phase 13 gate learns these names; a new SUM over them outside the sanctioned folds fails the grep.
2. **Sole-aggregator lint:** the D1.4 canonical recognition read model is the ONLY code path that folds credit amounts — "SAME substrate, ZERO copies" (verbatim, D5); an ad-hoc aggregate over `contribution_credits` anywhere else fails lint.
3. **Receipt-facts-no-credit-input lint:** the Phase 7 official-facts path imports/receives no `contribution_credits` symbol or input, and the Phase 18 receipt-artifact path accepts only the exact Phase 7 facts version (lint + cross-owner contract test—the primary A10 wall) [D1.11].
4. **Allowlist single-field assertion:** the notification document-class allowlist contains exactly ONE governed field, `tribute_aggregate_total` — asserted by lint so a second field is a build failure, not a review comment [D3.4].
5. **Schema lint on `is_receiptable`:** asserts the `is_receiptable = FALSE` CHECK exists on `contribution_credits` (the tripwire behind the primary wall) [D1.11].

---

## Build Order

_What the PRD tells the agent to build, and in what order. Nothing in a later slice ships until the earlier slice's CI gates are green. The governing property: **partial delivery never mis-mails and never mis-credits** — every slice below is safe to stop after. Fresh-build posture: no migration ceremony, correct-from-start schema._

**SHIP-FIRST — the substrate; a wrong choice here is unrecoverable:**

1. **S1 — Schema + census + constraints + locked functions + the purpose wall.** All Phase 14 tables (`contribution_credits`, `tributes`, `contribution_tributes`, `tribute_notify_parties`, `tribute_notification_items`, `matching_gift_expectancies`, `matching_gift_settlements`, `daf_sponsors` + `party_payer_aliases`, standing rules, `credit_generation_runs`) with **ALL identity/scope/bound constraints in the FIRST migration, before any generator merges** [D1.1] — the D1.1 identity key + `external_ref` partial UNIQUEs, D1.2 exclusivity trigger, D1.3 bounds, D1.5 freeze trigger, D4.1 settlement uniqueness, D4.3 state-guard trigger, composite tenant FKs + FORCE RLS everywhere [D1.9], census rows fail-closed [D1.10]. The one locked SECURITY DEFINER credit-mutation function on the P13 per-contribution advisory lock [D1.8]; the `contribution_operation_audit_events` polymorphic-subject extension [D4.12]. Phase 14 ships the typed notification/acknowledgment fact wall and refusal contract before the first letter; Phase 17 and Phase 18 enforce it at their own public seams. Implement the P13 amendments this slice depends on (lines `UNIQUE(tenant_id, header_id, id)`; the correction service's `credit_recheck` outbox event; remittance tender attributions demoted to capture-input-only) [D1.14]. _Blocked by:_ Phase 13 ledger and Phase 3 census machinery; presentation additionally consumes Phases 17/18. _Kill/rollback:_ inert — nothing composes, sends, or credits yet.

**BUILD-V1 — dependency-ordered vertical slices:**

2. **S2 — Role registry + manual credit path.** The D1.13 fixed role set (TEXT+CHECK) with amount classes on the registry [D1.3]; manual record/revoke through the locked function behind `finance:record_credit` / `finance:revoke_credit`; `getPartyCreditActivity` v1 feeding the Phase 9 (Full CRM Depth & Relationship Graph) Giving tab reserved columns; supersede-based revocation. _Blocked by:_ S1; Phase 12 (Full Role & Permission Configuration) capability registry. _Kill/rollback:_ capability-gated; manual rows are editable-with-audit until first external reference, then supersede-only — no automation exists to misfire.
3. **S3 — DAF operations + the advisor stream [D2].** `daf_sponsors` + the shared `party_payer_aliases` matcher + one-click triage [D4.5]; the required 4-state attribution combobox + fund-name memory with provenance chips; the Attribution Inbox; the entry-gated auto-send advisor thank-you with the FULL guardrail set (hold-then-send window, ack states, disclosure line, outbox feed, ambiguity holds, amount-omitted default, re-attribute flow); sponsor receipt minted per Phase 7 (Receipt & Statement Compliance Rules + Donor Identity/Credit Model) with delivery suppressed by default. _Blocked by:_ S2; Phase 6 (Shared Communication Event Model) send seam + consent gate. _Kill/rollback:_ the hold window cancels in-flight letters; tenant stream config disables sends while attribution capture keeps working; **imports never auto-send** [D2 guardrail 8].
4. **S4 — Tribute setup + manual single letters.** The 2-field inline tribute create that never gates gift posting; the "Tributes awaiting setup" worklist; the tribute record ops page (dual-pane donor list, states, previews); manual message/document actions through the Phase 17 and Phase 18 public seams (compose-now advances coverage) [D3.12, D3.3]. _Blocked by:_ S1 plus Phase 17 message and Phase 18 document contracts. _Kill/rollback:_ manual-only — a human triggers every letter; no scheduler exists yet.
5. **S5 — Tribute streams: honor first, memorial engine LAST.** Honor immediate stream (auto-created pre-checked notify row, weekly print batching); notify preferences {stream*default, immediate, monthly, once, never} + paused_until [D3.7]; then the memorial digest engine — coverage ledger, `next_due_at` cadence, cutoff-frozen composition, per-tenant fan-out — **shipped last, behind per-tenant enable, default OFF** [D3.14]; the P6 `mail` channel + print-custody governed export [D3.5]; import posture: streams arrive STOPPED [D3.10]. \_Blocked by:* S4. _Kill/rollback:_ `tribute_stream_paused` + global kill checked at compose AND send/print [D3.2]; disabling the engine reverts the tenant to S4 manual letters with zero coverage corruption (coverage is a ledger, not a cursor).
6. **S6 — Matching tracker.** Expectancy CRUD via the one-checkbox entry affordance + employer combobox with evidence chip; the 6-state lifecycle with `received`/`reversed` unreachable via plain UPDATE; the age-bucketed worklist (180d default) + `match_claim_deadline`; the "unlinked match lines" worklist; the minimal single-header multi-line employer-check entry surface [D4.3, D4.6, D4.8]. _Blocked by:_ S1 (+S2 for `finance:manage_matching_gifts`). _Kill/rollback:_ **expectancy stages generate ZERO credit rows** [D1.12] — stopping here cannot mis-credit anything; the tracker is pure pipeline bookkeeping.
7. **S7 — Matching received flow.** The settlement junction written in the ORDINARY P13 entry transaction under the new header's advisory lock (`FOR UPDATE ORDER BY id`, lock*timeout) [D4.2]; payer-of-record legal donor [D4.4]; `matched_employee` credits minted async via the D1.7 fan-out — **the only matching credit-minting slice; kill switch = disable the generator** [D4.14]; the employee thank-you on D2 guardrails verbatim [D4.10]; reversal via P13 domain events only, including manual check-bounce corrections [D4.11]. \_Blocked by:* S6; S1's locked function. _Kill/rollback:_ generator disable leaves settlements as valid facts; credits re-derive idempotently on re-enable (full-target-set upsert).
8. **S8 — Roster read model + surfaces [D5].** The remittance attribution capture guards (D2 picker verbatim, copy-last-remittance, CSV paste with staged preview) + the remittance fan-out generator; `getSupporterRoster` on the same substrate with zero copies; the staff FINANCE designation-pivot surface and the missionary projection-floored surface; effective-dated designation-assignment resolution at read; `supports_policy_v2` for the roster only; the never-leak fixture family wired into CI. _Blocked by:_ S2 (credit substrate live); Phase 3 (Minimum Permission & Role-Scoped Projection Foundation) projection floor. _Kill/rollback:_ pure derivation — no roster table, no counters, no nightly rebuild; disabling the surface loses nothing; the fan-out is resumable and idempotent [D1.7].
9. **S9 — Standing-rules engine.** The capped v1 rule shape {giver→credited, role, full/NULL amount, effective*from/to}; auto-apply at posting with provenance chips, no proposal queue [D5 close-out 4a]; prospective-only; retroactive = explicit governed backfill behind the `finance:apply_retroactive_credits` / approve SoD pair, refusing statement-referenced headers [D1.13]. \_Blocked by:* S2; Phase 12 (Full Role & Permission Configuration) SoD enforcement seam. _Kill/rollback:_ disabling rules stops future generation only; existing generated rows supersede-and-diff on rule change; the money path never fails on recognition [D1.7].
10. **S10 — Ingest socket + payer hints.** The versioned event-shape contract (tenant from per-tenant registration NEVER from payload; quarantine ≠ dead*letter; NO synchronous match/no-match echo per Phase 4 (Identity & Account-Claiming Foundation) A5; the socket never silently auto-creates when a candidate exists) [D4.9, D4.14]; `payer_kind` generalization + intermediary blocking hints on the match path, both directions [D4.5]. \_Blocked by:* S3 (alias registry), S7 (match path). _Kill/rollback:_ quarantine-by-default — an ingest failure parks human-visible work; nothing auto-spawns (the auto-spawn saga path is reserved, keyed `tenant+ingest_event_id`, for the first non-staff producer).

---

## Out of Scope

Reserved as seams (plumbed, not built), owned by a named later phase, or deliberately killed:

- **Vendor matching-gift connectors (Double the Donation / HEPdata), rungs 3–4** — Phase 31 (Platform API, Webhooks & Connector Framework) owns embedded employer search and full sync; Phase 14 ships rung 2 (the vendor-agnostic ingest socket + event-shape contract only) [D4]. Vendor record linkage arrives as generalized `crm_record_links` with **zero Phase 14 schema change** [D4.9]. The socket's archive table ships with the first non-staff producer, not before [D4 rider].
- **Volunteer grants (Dollars for Doers)** — out; reserved to Phase 31 (Platform API, Webhooks & Connector Framework) [D4.14].
- **Payroll-deduction giving** — out; the `workplace_giving_donor` lane covers the recognition shape today; the product surface is reserved to Phase 31 (Platform API, Webhooks & Connector Framework) [D4.14].
- **Donor-development ranking semantics** — formally deferred to Phase 27 (Donor Development & Portfolio Management); Phase 14 ships zero ranking semantics; Phase 27 consumes `getPartyCreditActivity` + `getMatchingActivity` + `getSupporterRoster`, so staff and missionary ranking can never diverge [D5 close-out 5].
- **Donor-portal recognition depth** — Phase 25 (Donor Dashboard Depth); Phase 19 may expose only the optional, separately purposed **Support overview — Not a tax document** for the Phase 19 D15 launch allow-list. No recognition is inserted into an official statement, and no missionary-workspace matching surface ships in v1 [D4.10].
- **Member thank-you letters** — **killed, not deferred** [D5 founder ruling]: no member correspondence of any kind, no tenant toggle; the church-member acknowledgment stream named in D2's scope note is SUPERSEDED by D5 [D5 close-out 4b]. Platform-mediated member thank-you affordances are a Phase 28 (Missionary Workspace Depth & Support-Raising CRM) question [D5 close-out 1].
- **`supports` edge revision** — Phase 9 (Full CRM Depth & Relationship Graph)'s v1 edge stays untouched; `supports_policy_v2` is roster-only; reconciliation revisits at Phase 28 (Missionary Workspace Depth & Support-Raising CRM) [D5].
- **Public tribute capture** — arrives when Phase 5 (Public Website Runtime Contract) plumbs it; the binding rule ships now: publicly-captured named parties quarantine behind staff review before any letter (Phase 4 (Identity & Account-Claiming Foundation) A5) [D1 forward-carry].
- **Tenant-editable tribute templates or a Phase 14 renderer** — Phase 17 owns
  governed content/template editing within the Phase 14 fact contract, and
  Phase 18 owns the one canonical print/PDF artifact. Phase 14 defines two
  bounded house content profiles but ships no template runtime [D3.6].
- **Fast batch-entry grid** — Phase 15 (Offline Gift & Batch Entry) owns the grid; Phase 14 names its contracts (the per-row match-capture cell; the remittance batch-grid contract) and ships only the minimal employer-check entry surface [D4.6, D1 forward-carry].
- **Import product** — Phase 30 (Imports & Migration Tools) ships the importer; Phase 14 ships the `external_ref` identity seams in the first migration and the import postures (streams stopped; zero sends; zero credits) [D1.1, D3.10, D4.14].
- **Peer-to-peer fundraiser recognition** — the `peer_fundraiser` role is reserved for Phase 36 (Peer-to-Peer & Advocacy Campaigns) [D1.13].
- **DAFpay / non-staff DAF ingestion** — the full auto-add rule tier is reserved for future non-staff rails [D2].
- **Tenant-custom recognition labels** — Phase 11 (Custom Fields & Custom Collections) custom fields, never new roles [D1.13].
- **Expectancies in exports** — Phase 20 (Accounting Exports & Reconciliation): expectancies are invisible to exports [D4.6].

---

## Counsel-Review Gate

Phase 14 inherits the Phase 7 (Receipt & Statement Compliance Rules + Donor Identity/Credit Model) posture verbatim: "**Production gate:** requires review by qualified finance/tax counsel before production use (this document is not legal or tax advice)." Every document class and recognition rule in this phase encodes best-effort readings of primary sources (IRS Pub 1771, Notice 2017-73, §4967); counsel validates the outcomes, and the jurisdiction axis is the seam for counsel input. The Phase-14-specific checklist:

1. **DAF quid-pro-quo blocking** — the ledger's `no_quid_pro_quo = true` posture on DAF grants (§4967) and the structural block on bifurcated benefits, carried from Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart), extended here to every DAF operational surface.
2. **Notice 2017-73 no-pledge-reference** — no Phase 14 document, advisor letter, or expectancy surface ever references a pledge in connection with a DAF grant (`daf_pledge_no_sponsor_reference`).
3. **Advisor-acknowledgment wording** — the auto-sent advisor thank-you is a non-receipt: $0/non-deductible framing, no deductibility merge fields (structurally impossible per D1.11), amount omitted by default [D2 guardrail 7]; counsel signs the house wording.
4. **Tribute aggregate-total opt-in + amount suppression** — per-gift amounts structurally absent from notification-class documents; the single `tribute_aggregate_total` field renders only under per-family `include_total = true` [D3.4]; counsel confirms the opt-in aggregate posture.
5. **"No member tax documents ever"** — church-member soft credits never mint, imply, or appear on any tax document for the member; the church is the receipted legal donor [D5, P7 A8]; counsel confirms the member-facing silence is the compliant shape.
6. **Employer receipt standard CWA** — the matching employer's contribution receives the standard contemporaneous written acknowledgment on its own legal gift (payer-of-record donor per D4.4), never itemizing employee identities [D4.10].
7. **Religious-exclusion donor copy** — the shipped copy ("Many programs exclude gifts to religious organizations — a match is never guaranteed"; no "double your donation" default banner) [D4.14]; counsel reviews the claim posture.
8. **CRA / jurisdiction seam** — Canadian split-receipting and other non-US regimes remain a named jurisdiction seam (per the Phase 7 (Receipt & Statement Compliance Rules + Donor Identity/Credit Model) axis); no Phase 14 surface hardcodes a US-only assumption into the document classes.

A compiled counsel-review checklist ships as an evidence artifact alongside the Phase 7 checklist; parity is measured by the compliant outcome.

---

## OpenSpec & Docs Updates

The full cross-PRD amendment package [D1.14, D3.14, D4.14] — **all amendments dated and append-only, landed as ONE congruence commit**:

- **`docs/prds/sitestacker-parity/phase-07-receipt-statement-compliance-and-donor-credit.md`** — (a) renames: `gift_credits` → `contribution_credits`; `donation_tributes` → `contribution_tributes`; **`tribute_notifications` RETIRED** → `tribute_notify_parties` (the old name was ambiguous with sent letters; notify-once generalized into frequency `once`) [D3.14]; `matching_gifts` → `matching_gift_expectancies` (+ new `matching_gift_settlements`) [D4.14]; (b) keying: all credit objects key to `contribution_headers`, not `donations`; (c) annual statement run membership follows Phase 19's Statement Subject run-item grain, with Phase 14 recognition rows only as subordinate informational Support-overview inclusion facts; (d) the **A10 single-field carve-out**: notification class gains exactly one governed field, `tribute_aggregate_total`, gated on `include_total` [D3.4]; (e) the **A11 payer-of-record amendment**: the spawned/linked contribution's legal donor = payer-of-record (defaults to employer); an intermediary-paid line CAN settle an expectancy; the matched_employee/workplace_giving_donor distinction is per-LINE [D4.4]; (f) the A11 §D/enum-list and D1.8-topology restatements [D4.2, D4.14]; (g) **T5/#571 + T6/#572 rescoped to receipt/statement CONSUMPTION** — Phase 14 takes build ownership of all six credit objects.
- **`docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md`** — (a) reserved channel `mail` with statuses `queued → printed → mailed / returned` (manual staff transitions feeding the A7 monotonic guard) + channel-aware consent evaluation at print ENQUEUE with the snapshot frozen on the event [D3.5]; (b) `communication_event_relations.related_type` literal renames (reserved-not-built, free now): `gift_credit` → `contribution_credit`, `donation_tribute` → `contribution_tribute`, `matching_gift` → `matching_gift_expectancy` [D1.14, D4.14].
- **`docs/prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md`** — (a) church_remittance tender attributions become **capture-INPUT only**; `contribution_credits` is the SOLE stored truth (resolves the D3.13-vs-story-105 header/line tension); (b) lines gain `UNIQUE(tenant_id, header_id, id)`; (c) the correction service emits the `credit_recheck` outbox event [D1.6, D1.14].
- **`docs/prds/sitestacker-parity/roadmap.md` §14** — (a) the credit-timing fix at lines 844–847 (REAL — verified at those lines as of authoring): "automatic soft credit to the employee on both expectancy and payment" is corrected to expectancy-stages-mint-ZERO-credits / only the received employer contribution soft-credits the employee [D1.12]; (b) the stale open-questions paragraph (lines 857–861) is annotated answered: DTD/HEPdata → rung 2 [D4]; church vs member documents → D5 (no member letters; roster instead); standing-rule shape → capped per-party v1 [D1.13]; Phase 27 ranking → formally deferred [D5 close-out 5]; (c) flip Phase 14's status to PRD-authored (with the matching `phase-map.md` row).
- **Root `CONTEXT.md` glossary** — the ~16+ Phase 14 terms (hard vs soft credit operations, credit role, amount class, recognition fold, Legal vs Recognition vocabulary, expectancy, settlement, payer-of-record, notify party, coverage item, tribute stream, attribution inbox, standing rule, supporter roster path, payer alias, crowd-blend).
- **`docs/prds/sitestacker-parity/parity-matrix.md`** — the Area 7 note: soft-credit/DAF/tribute/matching operations ownership moves to Phase 14 (Phase 7 retains document compliance; Phase 13 retains capture shape).
- **`docs/prds/sitestacker-parity/README.md`** — add Phase 14 to the phase index / status table.
- **The parked P11/P12 epic-ref nit** — epic references missing from the phase-map/roadmap rows and the Phase 11 (Custom Fields & Custom Collections) / Phase 12 (Full Role & Permission Configuration) PRD headers, folded into this same congruence commit.
- **OpenSpec change + ADRs** — author the OpenSpec change for the donor-credit-operations capability; ADRs (next number 0002, per the repo survey) for the hard-to-reverse decisions: the single-table credit spine with optional line scope [D1], payer-of-record legal donor [D4.4], entry-gated auto-send [D2], setup-gated automated digests [D3], and rung-2 matching [D4].

---

## Further Notes

- **Research provenance — the fleets.** The grill-prep research fleet `wf_4b707877-a88` (6 repo readers + 5 external researchers: CiviCRM, IRS Pub 1771/Notice 2017-73, Salesforce NPSP/Nonprofit Cloud, Blackbaud RE NXT/Virtuous, Double the Donation/HEPdata; full briefs in `tasks/wzbh93qej.output`), then five per-decision fleets: **D1** 17-category adversarial pass `wf_8173b0a3-b3b` (briefs `scratchpad/p14adv/`), **D2** UX fleet `wf_12c9023f-c40`, **D3** adversarial pass `wf_d2a57022-c30` (briefs `scratchpad/p14adv3/`; D3 research agent `a949dcd6bedc715e6` survived a mid-flight API drop + resume), **D4** 17-category pass `wf_ac3d918a-9f6` (briefs `scratchpad/p14adv4/`), **D5** design pass `wf_7e3f6fa5-88d` (briefs `scratchpad/p14d5/`). The ratified decision log is `scratchpad/phase14-grill-decisions.md` (session artifact — provenance record, not a repo file).
- **The don't-over-engineer rider is BINDING.** The founder's D4 ratification ("Ratify D4 as mentioned but don't over engineer") is an interpretive posture for the whole PRD: **v1 ships the leanest compliant shape of every amendment; the reviewers' cuts stand** — 6 lifecycle states (not 8), no `match_ratio` column, no ingest archive table until a non-staff producer exists, age-bucketed worklists instead of per-row tasks, no proposal queues anywhere [D4, D5 close-out 4a]. When an implementer faces a build-out-vs-defer call inside a ratified decision, the leanest compliant reading wins.
- **Fresh-build posture.** The product has no users; there is no migration ceremony, and Phase 14's schema is correct-from-start (all constraints in the first migration [D1.1]). The import seams (`external_ref`, stopped streams, zero-send/zero-credit postures) exist because **incoming tenants** carry history, not because Asym does.
- **Pipeline note.** The session's launch prompt named `/to-prd` → `/to-issues`; the handoff standardized on `/to-spec` → `/to-tickets`. Either produces the same artifacts (this PRD + the epic/children set below); program conventions bind regardless.

---

## Tracking Skeleton

_Vertical-slice tickets mapped to the Build Order, one line each. **Published 2026-07-10**: epic #719 + children #720–#741 (T1 → #720 through T22 → #741, in skeleton order); every child remains `status:blocked` on the predecessor spine (Phase 3, 7, 9, 10, 12, 13 builds) per program convention — no `ready-for-agent` labels at mint time._

**Epic:** Phase 14 — Donor Credit Operations (`donor-credit-ops`): soft credits, DAF operations, tribute/memorial streams, matching gifts, standing rules, church remittance recognition, and the supporter roster — on the Phase 13 ledger, behind the Phase 7 document walls.

1. **T1 (S1)** — Schema migration: all Phase 14 tables + every identity/scope/bound constraint + composite tenant FKs + FORCE RLS + census rows, in one first migration. _(substrate)_
2. **T2 (S1)** — The locked SECURITY DEFINER credit-mutation function on the P13 advisory lock + the freeze/supersede triggers + the audit polymorphic-subject extension. _(substrate)_
3. **T3 (S1)** — Phase 14 purpose-class facts/typed DTO/refusal contract + the five CI lints; Phase 17 and Phase 18 own enforcement at their message/document seams. No Phase 14 renderer work. _(substrate; gates every letter)_
4. **T4 (S1)** — The D1.4 recognition fold read model on the `effective_seq` cursor + the Legal-vs-Recognition vocabulary split. _(substrate)_
5. **T5 (S1)** — P13 amendments in code: lines `UNIQUE(tenant_id, header_id, id)`, `credit_recheck` outbox emission, remittance attributions capture-input-only. _(substrate)_
6. **T6 (S2)** — Role registry (fixed TEXT+CHECK set + amount classes) + manual credit record/revoke behind the new capabilities. _(manual path)_
7. **T7 (S2)** — `getPartyCreditActivity` + the Phase 9 Giving-tab reserved columns (soft-credit rows, receipt/ack status). _(manual path)_
8. **T8 (S3)** — `daf_sponsors` party-extension + `party_payer_aliases` + the one matcher + one-click triage + per-tenant seeds. _(DAF)_
9. **T9 (S3)** — The 4-state required attribution combobox + fund-name memory with provenance chips + the Attribution Inbox + completeness tile. _(DAF)_
10. **T10 (S3)** — The advisor thank-you auto-send with the full D2 guardrail set (hold window, ack states, disclosure, outbox feed, ambiguity holds, re-attribute flow). _(DAF)_
11. **T11 (S4)** — Tribute setup gate (2-field inline create, awaiting-setup worklist, tribute ops page) + manual single letters through the Phase 17 message and Phase 18 document seams. _(tribute)_
12. **T12 (S5)** — Honor immediate stream + notify-party preference model (`stream_default/immediate/monthly/once/never` + paused*until, suppression-grade `never`). *(tribute)\_
13. **T13 (S5)** — Memorial digest engine: coverage ledger, `next_due_at` cadence, cutoff-frozen compose, per-tenant fan-out — shipped last, per-tenant enable default OFF. _(tribute)_
14. **T14 (S5)** — P6 `mail` event meaning + print custody as a governed export (`finance:fulfill_tribute_letters`, Phase 18 authenticated exact-artifact access, retention + verified disposal); no raw/provider/signed-object URL. _(tribute)_
15. **T15 (S6)** — Expectancy tracker: one-checkbox create, 6-state lifecycle with guarded transitions, aging worklist, unlinked-match-lines worklist, minimal employer-check entry surface. _(matching)_
16. **T16 (S7)** — Settlement junction + received flow in the P13 entry transaction + async `matched_employee` credit generator (the kill-switchable slice) + employee thank-you. _(matching)_
17. **T17 (S8)** — Remittance attribution capture (D2 picker, copy-last-remittance, CSV paste staged preview) + the resumable fan-out generator. _(roster)_
18. **T18 (S8)** — `getSupporterRoster` + the staff FINANCE designation-pivot surface + the missionary projection-floored surface + effective-dated designation-assignment resolution. _(roster)_
19. **T19 (S9)** — Standing-rules engine: capped v1 shape, auto-apply with provenance chips, prospective-only, governed retroactive backfill behind the SoD pair. _(rules)_
20. **T20 (S10)** — Ingest socket (versioned event-shape contract, quarantine/dead-letter split, no sync echo) + intermediary payer hints on the match path. _(socket)_
21. **T21 (cross)** — The consolidated poison-fixture tier (35 fixtures) + per-generator cross-tenant tier + golden snapshots wired red-on-regression into CI. _(safety; lands incrementally with S1–S10, tracked as one gate)_
22. **T22 (docs)** — The one congruence commit: the full cross-PRD amendment package (§OpenSpec & Docs Updates) + OpenSpec change + ADRs. _(docs are part of "done")_

## Dated Phase 17 recognition-message amendment (2026-07-19)

**Old statement.** Phase 14 ships fixed DAF/tribute/matching recognition
templates and expects Phase 17 to add tenant editing on the same registry.

**New winner.** Phase 17 supplies the code-governed System message contract,
complete immutable publication, typed fact nodes, Layout Role/Brand Kit,
locale/fallback resolution, publication review, Sender Profile/reply posture,
Delivery Plan, and Phase 6 intent handoff for those messages. Existing fixed
templates and `email_template_system_bindings` are migration adapters into that
governed model, not a second catalog or lifecycle authority.

The adapter is one-way and versioned: each legacy `{family, variant,
binding_version}` maps deterministically to exactly one Phase 17 stable contract
and publication, or to `history_only_alias` when it has no current send
authority. Legacy rows become read-only migration/history evidence; Phase 17's
generated registry is the sole runtime resolver, and new legacy writes are
rejected after shadow cutover. Removal requires complete caller and historical-
reference mapping, old-writer fencing, generated-registry parity and one-writer
proof, rollback evidence, and closure of the bounded rollback window. No reverse
sync or fallback to a legacy row is permitted.

**Compatibility boundary.** Phase 14 remains the owner of DAF sponsor/advisor,
tribute honoree/notify party, matching-gift participant, Recognition Subject,
recognition visibility/privacy, amount suppression, and the source-authorized
recipient/fact projection for recognition acknowledgments and notifications.
Phase 7 alone resolves and freezes the legal donor, Statement Subject, and
receipt/official-statement eligibility. Phase 17 never derives or changes
those recipients or facts and cannot expose deductibility fields in
acknowledgments or per-gift amounts in tribute notifications. Phase 7 retains
the three-document wall; Phase 6 retains delivery/history.

## Dated Phase 21 D8 supporter-feed amendment (2026-07-30)

`getSupporterRoster` remains the sole Phase 14 supporter identity and
recognition read model. Phase 21's Missionary Support Activity Projection
already composes its permitted roster fields, so Phase 31 consumes that
Phase 21 projection exactly once and MUST NOT independently join
`contribution_credits`, the recognition fold, remittance attribution, or
`getSupporterRoster` into a competing feed interpretation. Phase 14 source
versions and safe provenance may travel through the projection without
becoming another read path or copied source of truth.

Recognition and contactability remain separate permissions. A party may be
visible for source-authorized recognition while email, phone, mail,
solicitation, export, or another external-CRM use remains forbidden. Phase 28
may later contribute only a separately ratified relationship/contactability
resource family; it cannot reinterpret Phase 14 identity, direct/via paths,
legal-versus-recognition meaning, anonymity, or commitment status.

The feed preserves the existing missionary field floor: visible-not-contactable
stays non-contactable, anonymous presentations gain no stable hidden Party
identity, restricted rows are omitted without arithmetic or count shadows, and
internal Party/credit/provenance identifiers never leave Asym. Corrections,
merges, supersessions, and recognition changes remain source-versioned Phase
14 facts and reach the feed as append-only projected changes rather than
external edits or destructive merges.

## Dated Phase 21 D19 Support Assignment roster-access amendment (2026-08-01)

Any Phase 21 missionary-safe supporter/activity projection resolves one exact
Support Assignment and its current Phase 12-authorized principal, purpose,
field floor, source versions, and Legal Entity scope before Phase 14 supplies
recognition-safe roster facts. A Support Assignment Participant Membership,
missionary role, spouse/household/team/leader relationship, public-page
association, or prior feed/notification grant provides zero supporter-identity
or contactability authority.

The same Party may participate in several Support Assignments, but each roster,
count, amount, cache, export, feed subject, and notification remains separately
scoped and filtered before enumeration or arithmetic. Anonymous and restricted
facts retain their existing no-shadow behavior. D19 access changes never alter
Phase 14 credit, recognition, merge, anonymity, or contactability truth.
