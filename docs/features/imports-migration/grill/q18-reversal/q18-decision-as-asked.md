# Q18: Reversing an import (decision as asked and chosen)

Founder answer (2026-11-03): **"B. Think of edge cases and way to handle it without creating needless complexity or over-engineering. Also research modern best pratices and apply how necessary."** The founder also required a full, ruthless adversarial review across all 22 categories.

## Options as asked

- **A. "Undo import" wherever possible.**
- **B. One honest "Prepare reversal" page for every import (chosen).**
- **C. No reversal page in v1.**

## Option B as proposed

1. **Entry point.** Every committed import and Switch run has "Prepare reversal". Nothing changes until someone confirms.
2. **Review page.** It sorts everything the import did into three groups:
   - **Can be reversed now:** Asym does it.
   - **Needs its owner's correction**, with a link straight to that tool:
     - gifts: the gift-entry owner's batch reversal, or void and re-add;
     - notes and files: the owner's correction run;
     - custom fields: archive in settings;
     - recurring gifts: the recurring-gift owner's tools.
   - **Stays as it is**, with the reason: edited since, merged, receipt issued, a restriction, or older than 30 days.
3. **Final button and results.** The final button names the result, for example "Restore 1,204 fields and archive 37 people". A downloadable results list shows what was skipped and why.
4. **What Asym reverses itself in v1:**
   - **People imports:** everyday imports and a Switch's people, within 30 days.
   - **Website drafts:** through Phase 23's plan.
   - **Gift files:** handed to the gift-entry owner's batch reversal from the same page.
   - **Everything else:** listed, but never rewound by Phase 30.

   After go-live, most of a Switch's results would fall under "Needs its owner's correction", because gift history now hangs off those people.

5. **Filling Q12's gaps:**
   - contact details, tags, list memberships and household links the import added come off only if untouched since;
   - restrictions always stay;
   - people merged since are left alone and reported.
6. **Words.** "Prepare reversal" and "reverse" throughout Data Tools, never "Undo import", "rollback" or "revert". Q15's "Everyday import undo" is renamed to match.

## Facts presented with the question

- **Settled before Q18:**
  - **Before go-live (Q1):** a Switch can be stopped. Its records stay hidden and nothing goes live.
  - **People imports (Q12 and Q15):** reversible one import at a time for 30 days, restore-if-unchanged; created people are archived only if untouched, and money is never touched.
  - **Owner correction paths:**
    - gift history: void and re-add (Q13);
    - notes and files: owner correction run (Q14);
    - empty created fields: one-step retirement (Q16).
- **Six owners reject a generic "Undo import":**
  - Phase 23, which ratified "Prepare reversal, never Undo import" (ADR-0173);
  - Phase 20 (D16);
  - Phase 16;
  - Phase 28 (D17);
  - Phase 29 (unmerged);
  - the grill glossary.
- **Ratified Phase 30 text uses both words:** "Import reversal" and "Everyday import undo".
- **True batch reversal exists only for People imports and website drafts** (Phase 23, #1409). Phase 15 can reverse a posted gift batch with offsetting entries.
- **Vendors:** "Undo import" is the common label, but the behaviour behind it varies. HubSpot's "Restore CRM changes" is the closest precedent. No donor CRM reverses a whole migration after go-live.
- **UX practice:** for many-record changes, use a review page with counts and a final button that names the result. An undo inside a disappearing toast fails accessibility.
- **Q12 gaps:** contact details, tags, lists, household links, restrictions, merged people.
- **Code:** no reversal code exists today.

## Ratified context

- **Q1:** clause 10 (abort before go-live; batch reversal follows `owner-constraints.md:378-385` and `roadmap.md:4371`).
- **Q5:** capabilities.
- **Q6:** Practice copy.
- **Q10:** households.
- **Q12:** clause 8.
- **Q13:** clause 12.
- **Q14:** clause 12.
- **Q15:** clauses 5, 8 and 11; O73.
- **Q16:** clause 12.
- **Q17:** owner continuity records.
- **Constraints and items:** C2, C5, C23, D3, D18, O51, O52.
- **Binding:**
  - ADR-0173 (CMS private drafts; "Prepare reversal");
  - ADR-0216 (no automatic merge; governed Undo);
  - Phase 13, 15, 16 and 20 append-only money rules.

## Research

- `research/q18-r1-repo-reversal.md`
- `research/q18-r2-external-reversal.md`
- `research/q18-r3-repo-verification.md` (added for the full review)
- `research/q18-r4-external-edge-cases.md` (added for the full review)
