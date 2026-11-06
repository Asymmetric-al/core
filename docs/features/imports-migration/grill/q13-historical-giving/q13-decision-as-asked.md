# Q13 — Historical giving in a Switch: decision as asked and chosen

Founder answer (2026-11-03): **"Option A, but be must do an excellent job a data integrity and also not building in techincal debt or brittleness. Do think of edge cases and how to manage them well with over over engineering or creating needless complexity."** The founder also required a full, ruthless adversarial review across all 22 categories.

## Options as asked

- **A. All of it, gift by gift, as history only (chosen).**
- **B. Recent years in detail, older years as yearly totals.**
- **C. Card gifts only in v1.**

## Option A as proposed

1. **How much history:** every year the old system has, gift by gift. A ministry may choose a later start year; the choice is recorded and shown.
2. **Payment types:** card gifts, checks, cash and stock.
3. **Currency:** each gift keeps its original currency and is never converted.
4. **Funds:** each gift stays on its original fund or missionary.
   - A fund or missionary that no longer exists becomes a closed, history-only record that cannot take new gifts.
   - A gift with no fund is blocked until it is mapped. Asym never assigns it to the General Fund by itself.
5. **History never moves money:** no missionary balance, payout, fee, accounting entry or settlement.
6. **Missionaries** see their supporters' imported gifts, labelled with the previous system.
7. **Extra details come across where the old system has them:**
   - refunds;
   - soft credits and tributes;
   - matching gifts;
   - DAF sponsor;
   - non-deductible portions;
   - noncash descriptions (never valued);
   - donor-requested anonymity (the donor is kept, the request honoured).

   Anything Asym cannot take yet is a visible "history not yet covered" exclusion.

8. **Legal entity:** the ministry signs which legal entity owns the old gifts, once per payment account and per offline source. A single-entity ministry signs once.

## Owner requests that A depends on (as presented)

- **Phase 13:**
  - one history command for every payment type, with Phase 15's sole-writer rule scoped to live staff entry;
  - closed, history-only funds and missionaries;
  - no General Fund fallback for imports;
  - any valid currency for history.
- **Phase 7:** use the source-recorded date, with no staff attestation per gift.
- **Phases 21, 20 and 13:** history creates no balances, postings, fees or settlement.
- **Phases 7 and 13:** the legal entity is decided from the signed statement.
- **Phase 2:** a Site for history, never defaulted.
- **Discrepancy to record:** C6's "anonymous = null legal donor" wording.

## Ratified context

- **Q1:**
  - clause 1: the Minimum Switch Kit, and Legal Entity by reviewer-accepted assertion per merchant account;
  - clause 5: Exact repeat import;
  - clause 9: reconciliation by Legal Entity × currency × source basis;
  - clause 10: reversal.
- **Q3:** the template path and Coverage start.
- **Q4:** Recorded outside Asym; no Asym tax documents for history; O22–O25.
- **Q5:** capabilities.
- **Q6:** practice runs and copies.
- **Q7:** tail gifts are silent; the as-of label.
- **Q10:**
  - the source gift owner stays the legal donor;
  - Source Record Binding with role;
  - O47.
- **Q11:** Value-mapping tables; new options or funds left to F10 and the money owners.
- **Q12:** Gift files are current gifts through Phase 15.
- **Constraints:** C1, C6, C7, C19, C21 and C22.

## Research

- `research/q13-r1-repo-money-history.md`
- `research/q13-r2-external-history-migration.md`
- `research/q13-r3-owner-text-verification.md`
- `research/q13-r4-code-and-database.md`
- `research/q13-r5-external-edge-cases.md`

Research files r3–r5 were added for the full review.
