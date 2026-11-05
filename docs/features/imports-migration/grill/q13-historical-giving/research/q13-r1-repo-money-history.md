# Q13-R1 — Repo evidence: how giving history comes across in a Switch

Read-only research for the founder question "How does giving history come across in a Switch?" (F13 remainder). Baseline: develop `629cb71dc`, 2026-11-03. This file extends `grill/research/r03-money-history-openings.md` and `q01-switch-model/research/q01-r4-asym-money-contracts.md` and does not repeat them. Nothing here is ratified intent.

Path keys: **P2/P7/P13/P14/P15/P16/P18/P20/P21** = `docs/prds/sitestacker-parity/phase-NN-*.md`; **P16C** = `phase-16-cross-prd-congruence-2026-07-13.md`; **P24DL** = `phase-24-multi-site-management-decision-log.md`; **P25F** = `phase-25-donor-dashboard-depth/contracts/financial.md`; **P28F** = `phase-28-missionary-workspace-depth/finance-stewardship.md`; **CO** = `openspec/contracts/contribution-operations.md`; **FAO** = `openspec/contracts/field-account-operations.md`; **OC** = `docs/prds/program-roadmap/owner-constraints.md`; **R1** = `q01-r1-sitestacker-inventory.md`.

## 1. Writer for historical offline gifts

**Owner text.**

- Phase 13 D.6 is tender-neutral: "Imported and adopted gifts … pre-advanced—there is no special `imported` status enum"; PAYMENT "already-succeeded"; POSTING "eligible immediately, stamped with a pre-Asym provenance boundary" (P13:1023-1039).
- Phase 13 already treats adoption as its own path, separate from offline entry: posting's "first step is tender-specific (processor-confirmed online success, **adopted gifts**, or recorded CB-B offline tenders → eligible to post)" (P13:1802). PAYMENT moves only on a signed provider event "or the qualified Phase 13/15 offline source command" (P13:1797).
- Phase 15 makes itself the only writer: "nothing writes offline money except the batch commit path" (P15:72). It adds a guard test that "**no API path other than the batch commit service writes offline money**" (P15:836). The contract limits this to "staff-entered offline money" (CO:418-433), and P16C:236 repeats "Offline money posts only through the Phase 15 front door".
- Phase 15 also hands formal import to Phase 30 (P15:144) and says "import-origin purposes remain held and never pass this batch gate" (P15:1884). Phase 15 therefore expects import-origin rows but does not say who writes them.
- Q12 cl.7 routes everyday Gift files to Phase 15 as ordinary current gifts and keeps Switch history separate. Q4 cl.7 says no money import commits "until the Phase 13/7 owner commands that write the fact exist."

**Conflict (r03 D-3, still open, now sharper).** As worded, P15:836 would fail on a D.6 command that writes historical check or cash rows. Batches are not a workable home either: an `unknown_offline` row must carry "batch/deposit evidence" (CO:383), which old exports usually lack.

**New hazard.** Phase 7 requires an auditable staff attestation for every true prior-year date ("`gift_date` year < entry year", P7:248). It also requires a dating fact, resolved under the issuer's jurisdiction rules (postmark, settlement and so on), in the same transaction as every contribution (P7:246, :321). No import exception exists. Read literally, ten years of history would need one attestation per gift.

**Implication.** The owners are Phase 13 and Phase 15, with Phase 7. _Requested:_ one Phase 13 D.6 adoption command covering every tender. Phase 15 would scope its guard to live staff entry and allow-list that command by name. Phase 7 would define a dating basis for adopted gifts ("source-recorded date") with no per-gift attestation.

## 2. Designations and funds for history

**Owner text.**

- Each line targets exactly one fund or missionary. "Unspecified → tenant General Fund resolved **at write**" (P13:1745-1746), and "No final unassigned designation" (P13:1935).
- Each line freezes an Accepted Source Purpose Authority Snapshot. "Missing or ambiguous accepted-purpose authority blocks the affected line" (P13:1756-1762). Typed `not_captured` plus a source evidence reference is allowed.
- Funds and missionaries are "lifecycle-only (`retired_at` / `merged_into` / `is_active`), never hard-deleted; posted-line FKs `ON DELETE RESTRICT` … Fund merge … never repoints a historical FK" (P13:1900). History can therefore keep pointing at a retired target.
- The inactive-designation rules cover only checkout: re-validate `is_active`, then drop or flag the line, "never a silent redesignation" (P13:1545, :1569).
- P13:1658-1661 quarantines "inactive" legacy `fundId` rows. It sits under the Phase 22 Page-subject amendment (:1640), not gift import, so it should not be read as an import rule.
- "A current Site default, fund rename or disabled public giving page never reassigns historic financial facts" (P25F:25). Binding succession never propagates "history … or Giving destination" (P21:536).
- Q11 cl.3 leaves creating funds during mapping to F10 and the money owners.

**Code.** `funds.is_active` exists (`supabase/migrations/20250101000000_init_schema.sql:111`). `missionaries` has no lifecycle column, only `health_status` (`:44-59`; `20260414180338_member_care_foundation.sql:6`). There is no designations table.

**SiteStacker.** A designation can be changed after the gift (R1:225). Campaigns have `is_disabled` (R1:226). A Transaction Fee Campaign (R1:244) and an Unknown Giving catch-all (R1:249) also exist.

**Gaps.**

- No owner rule says whether an import may write a line to a retired or inactive target.
- No owner rule says whether Phase 30 may create a retired designation for a departed missionary.
- No owner rule names the purpose-authority evidence that a legacy fund qualifies as.
- The General Fund fallback would silently absorb unmapped legacy funds. That contradicts Q11 cl.3: "a row missing a required value is blocked."

**Implication.** The owner is Phase 13. _Requested:_

- adopted lines may target retired designations, which stay history-only and never selectable;
- a typed "historical-only designation" can be created from reviewed mapping;
- the General Fund fallback is disabled for adoption;
- `not_captured` plus the source fund code qualifies as purpose evidence;
- Transaction Fee Campaign lines map to `is_fee_cover`.

## 3. Ledger, payable, payout and settlement effects

**Owner text.**

- Phase 21 says: "Exact Phase 13 money-designation postings … become provisional Missionary Support Activity" (P21:73-74). It says this with no import exception.
- Phase 21's only historical gate is the D17 opening. Every pre-cutover fact gets one disposition (`exact_history`/`opening_residual`/`reference_only`/…) (FAO:141-150), and "late predecessor facts MUST use an append-only Opening Position Correction" (FAO:166-169).
- Phase 30 "MUST NOT reconcile, authorize, or activate a cohort" (FAO:171-177).
- "No compatibility layer may translate … donation sums … into Field Account truth" (P21:311-313).
- Phase 20 §21: "Prior records remain attributed to the prior connector … Optional historical backfill is off by default" (P20:1033-1064; US20-48/49 at :330-335). D.6 ACCOUNTING carries pre-Asym provenance only (P13:1035-1038).
- Settlement: D.6 makes "no Stripe reconciliation attempted" (P13:1029). Settlement evidence covers only the bound account (q01-r4 A6).
- Phase 29 (unmerged PR #2430, via r03): "an imported CSV cannot certify financial coverage or replay historical effects."

**Gap.** No owner sentence says that adopted (D.6) or Recorded-outside-Asym postings create **no** Support Activity, Gross Support Allocation, assessment, payable, Accounting Posting Intent, fee attribution or settlement obligation. If history commits after Field Accounts activate, P21:73 admits those postings while the opening residual already counts them. That is a double credit (extends q01-r4 G6). Fee and assessment treatment of imported gifts is unverified; no text was found.

**Implication.** The owners are Phases 21, 20 and 13. _Requested:_

- Phase 21: D.6-adopted postings are predecessor facts, dispositioned only through a D17 manifest, never provisional Support Activity or assessment input.
- Phase 20: they are previous-owner or excluded in the Cutover Coverage Manifest, never posting or fee work.
- Phase 13: D.6 creates no settlement or payout linkage.

## 4. Currencies Asym cannot transact

**Code.**

- `currency_metadata` holds 165 ISO codes, with the comment "ISO monetary units do not authorize transactions" (`20261003051630_currency_foundation.sql:5-12`, `:188`). `donations.currency` references it (`:219`).
- `resolveTenantSettlementCurrency` returns `"USD"` only: "public.tenants has no settlement-currency field" (`packages/api/src/money/settlement.ts:6-24`).
- `assertTransactable` requires currency to equal settlement currency (`packages/api/src/money/index.ts:85-96`).

**Owner text.**

- "Transaction allowlist ≠ metadata … exactly the tenant's settlement currency" (P2:404-406). Phase 24 alone widens presentment (P2:253-262).
- "Comprehensive metadata is not comprehensive transactability … financial roots freeze their owner-resolved facts" (`docs/adr/0208-currency-aware-minor-units.md:45-50`).
- Every header has one currency, and totals are grouped by currency (P13:819). Progress is "never a summed cross-FX scalar" (P13:1251). The donor view uses "No cross-currency/year scalar, FX conversion" (P25F:131). "Unlike currencies are never summed" (OC:435-436). QBO/Xero owns FX (P20:366-367).
- "Every Legal Entity has an explicit default currency version. Additional source-family currency accounts require prospective proof" (P21:406-407).

**SiteStacker.** Offline batches select a currency. Marketing claims 135–150+ currencies, while Historic Giving shows "USD or CAD" (R1:141).

**Gap.** No owner text says whether adoption must pass the transaction allowlist. Native-currency storage is clearly required; conversion and FX for reporting are clearly forbidden. A non-USD history today would fail any path that calls `assertTransactable`. _Unverified:_ whether real SiteStacker ministries hold non-USD/CAD gifts.

**Implication.** The owners are Phase 13 with Phases 2, 20 and 21. _Requested:_ adoption needs only a valid ISO code and exponent check, never transactability. Phase 21 should state the Field Account treatment of history in a non-default currency (for example `reference_only`).

## 5. Legal Entity for single-entity sources and offline gifts

**Owner text.**

- Phase 7 "seeds exactly one default for the ordinary tenant. Every … contribution … freezes an explicit `legal_entity_id`. Single-entity users see no selector" (P7:14-21). Persistence "never falls back to a mutable tenant default" (P2:243-250).
- `legal_issuer_id` is "server-resolved from the verified legal-issuer authority, never caller input" (P13:1738).
- No Legal Entity may be "inferred from Site, provider, or a default entity" (OC:373-377). The glossary says to avoid "the Tenant default as historical … ownership" (`CONTEXT.md:6780-6791`).
- The issuer alone selects the US or Canadian pack; currency cannot (P18:351).
- Q1 cl.1 maps merchant accounts to a Legal Entity by reviewer-accepted assertion. The census has a "Legal Entity and currency assertion per Site (written, ministry-signed)" (R1:360).

**Gap.** Offline batches have no merchant account. No owner text names the evidence class the server may resolve from, either for them or for a ministry with one entity.

A related gap: every ledger row has `site_id` NOT NULL (P13:196), while "historic records … never fall back to the Default Site" (P24DL:404-405). This extends D14.

**Implication.** The owners are Phases 7 and 13 (O4), with Phase 2 for Site. _Requested:_ a "reviewed Legal Entity assertion" recorded on the Switch for each merchant account and each offline source (Site × currency × batch type). Where the tenant has exactly one Legal Entity, a single signed assertion covering every source row would be enough. The server resolves `legal_issuer_id` from that assertion, and the owners rule how `site_id` resolves for adopted gifts.

## 6. Other gift families

| Family                        | Owner text                                                                                                                                                                  | Covered by O21?             |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Soft credits                  | `contribution_credits.external_ref`, `source_kind=import`, recognition-only (P14:330, :1862-1864)                                                                           | Yes                         |
| Tributes                      | "arrive stream STOPPED"; zero sends (P14:1866-1868); O34                                                                                                                    | Yes                         |
| Matching gifts                | Received pair through the settlement function (P14:1865, :891); identity Tenant+`external_source`+`external_ref` (P25F:159)                                                 | **No**                      |
| Split and fee-cover           | N lines per header; `is_fee_cover` (P13:1739-1748)                                                                                                                          | Implicit ("giving history") |
| Pledges                       | Phase 16 classifier proved/hint/unknown, "never backfill … cash" (P16:2581); everyday pledge uploads not in v1 (Q12 cl.9)                                                   | "Recurring evidence" only   |
| Noncash                       | Describe-never-value "across … import" (P15:926, :2312); ineligible for Phase 21 allocation (P13:217)                                                                       | **No**                      |
| Refunds and chargebacks       | Append-only postings with `reverses_posting_id` (P13:1767); SiteStacker linkage undocumented and refunded rows may be deleted (R1:236, K8)                                  | Yes ("reversals")           |
| Anonymous                     | `known` vs `unknown_offline` (CO:368-384); "only intentional `unknown_offline` may be null" (P13:225); "Anonymous (donor requested) — a deliberate recorded fact" (P14:520) | **No**                      |
| DAF and non-deductible splits | Sponsor is the legal donor (P7 A8/A10, via r03); SiteStacker per-line Non-Deductible flag (R1:245)                                                                          | **No**                      |

**Finding.** C6's "anonymous = null legal donor" conflates two things. SiteStacker's "Anonymous" checkbox (R1:46, :54) marks a **known** donor who asked for anonymity; that is a visibility preference (CO:375-376). A null donor is reserved for an `unknown_offline` donor, an offline-only mode. No status exists for an imported online gift whose donor is unknown.

## 7. Missionary-facing history

**Owner text.**

- Recorded-outside-Asym gifts "still count in every total and as earlier giving" (Q7 cl.1). Previous-system shares carry the label "{previous system} · gifts shown up to {date}" (Q7 cl.3).
- An "incomplete import … produces no verified first-support conclusion" (P28F:286-287). "Historical imports establish baseline without catch-up tasks" (P28F:301, :310-311). An import marker is never a special-gift flag (P28F:352).
- Never label a person "lapsed"; the 365–730-day historical band uses neutral wording (P28F:49-53; P14:1097).
- Conclusions need "complete, coherent owner-qualified coverage" (P28F:96-103), and partial history "displays its true limitation" (`phase-28-…/proof.md:192-193`).

**Code.** The missionary portal still reads `current_funding` (`packages/api/src/missionary-portal/model.ts:33`).

**Gap.** No owner text says whether missionaries see imported **gift-level** history (amounts and dates per supporter), or whether it enters dashboard support totals and goals. Q7's "every total" implies yes, but P28 and P21 do not say so. The coverage-start fact (Q3 cl.6) has no consumer contract yet (O2, O3).

**Implication.** The owners are Phase 28 with Phases 13 and 14. _Requested:_ imported history is visible to missionaries under Phase 10 safety, labelled, and counted in received history but not in Field Account balances (§3). First-gift and lapse logic reads the O3 coverage record.

## 8. Implementation evidence

- `donations` (`init_schema.sql:175-192`; `20260214090000_foundation_1_schema.sql:289-301`) has a single donor, missionary or fund; `currency` defaults to `usd`; free-text `source`; and `gift_date` defaults to today (`:333-334`). It has no Legal Entity, entry method, external or source ID, or import provenance. Its indexes cover dates only, with no uniqueness on provider or external refs (`:603-631`).
- No migration contains `entry_method`, `legal_entity`, `external_ref` or `external_source` (grep).
- The admin model derives `entryMethod: "api" | "manual" | "import"` from `donations.source` (`packages/api/src/admin/contributions/model.ts:83`, `:363`; D7).
- No Phase 13/14/15/16 target table and no gift import code exist (r03 V1; decision-log §8). Q4 cl.7 forbids any Phase 30 write to `donations`.

## Discrepancies

1. P15:72/:836 make Phase 15 the sole offline writer, while D.6 adopts all tenders (r03 D-3, unresolved).
2. P7:248 requires a per-gift prior-year attestation, which bulk adoption cannot meet. **New.**
3. C6 "anonymous = null legal donor" vs P13:225, CO:368-384 and P14:520. **New.**
4. P13:1745 General Fund fallback "at write" vs Q11 cl.3 blocking rows with missing required values. **New.**
5. P13:196 `site_id` NOT NULL vs P24DL:404-405 (extends D14).
6. P21:73 admits every Phase 13 designation posting; D.6 history has no exclusion (extends q01-r4 G6).
7. CO:383 requires deposit evidence for `unknown_offline`; historical rows often lack it.
8. P13:1658-1661 "inactive … quarantined" is a Page-subject rule and is easy to misread as an import rule.

## Founder-decision candidates

1. **Old checks and cash.** Should they come across in the same history import as old card gifts, or go through the batch-entry screen? Both cases have to be confirmed with the owners.
2. **Gifts to funds or missionaries that are gone.** Keep them attached to an archived, non-givable fund or missionary record; put them in one "previous-system fund"; or leave them out with a visible exclusion?
3. **Gifts with no fund.** Block them until someone maps them, or put them in the General Fund?
4. **Gifts in a currency the ministry cannot take today.** Bring them across in their own currency as history, or exclude them?
5. **One-entity ministries.** Is one signed statement ("all our old gifts belong to {entity}") enough?
6. **Missionary visibility.** Should missionaries see imported gifts in supporter history and totals from day one, with the previous-system label?
7. **Extra gift details in v1.** Which come across: matching gifts, noncash descriptions, DAF sponsor and advisor, donor-requested anonymity, non-deductible portions? Anything left out is marked "history not yet covered".
8. **Field Account timing.** Do missionary balances start at the Switch or later? This sets whether the history import must be kept out of balances (§3).
