# Q12 — Everyday imports after go-live and write modes: decision as asked and chosen

Founder answer (2026-11-03): **"yes"** (Option B as recommended).

## Options as asked

- **A. Switch only.** No everyday staff imports in v1.
- **B. Careful everyday imports (chosen).** People imports add new people and fill empty fields. Gift files are handed to Phase 15 batches. A blank cell never changes anything.
- **C. Full bulk update.** Matched records are overwritten, and blank cells clear fields.

## Option B as proposed (nine parts)

1. **Two import types.** Each is chosen up front and has its own template: a People import (add and update) and a Gift file (sent to a draft Phase 15 batch). The Switch and the missionary self-import are unchanged.
2. **Fill empty fields by default.** Each column can be set to "Fill empty only" (the default), "Replace" (opt-in, with a count), or "Ignore". A blank never changes anything. Clearing a value is a separate, confirmed action.
3. **Add contact details, never replace them.**
   - New details become primary only if the import says so.
   - Old addresses are kept with an end date.
   - Tags and lists are only ever added.
   - An address change never spreads to other household members.
   - Address changes from change-of-address (NCOA) files always go to review.
4. **Newer work wins.** A field changed in Asym after the plan was made is a conflict. Staff, deceased, do-not-contact and restricted-tier people always go to review. The preview shows each current value next to its new value.
5. **Matching follows Q10's rules.** O47 must be live first.
6. **Imports grant nothing and send nothing.** A dated opt-in in the file is kept only as evidence.
7. **Gift files go to Phase 15.**
   - Each batch needs an expected count and total.
   - Payout keys refuse a payout that was already imported.
   - Each row says who issues the tax receipt.
   - Employer matches are recorded as separate gifts.
   - "Recorded outside Asym" is narrowed to switch history and Legacy Tail Backfills.
8. **Permissions and undo.**
   - Running an import needs an import permission. Gift files need the Phase 15 batch permission.
   - A people import can be reversed one import at a time. A field is restored only if it still holds the value the import wrote. People the import created are archived only if nobody has touched them since.
   - Posted money is never undone by reversing an import.
9. **Not in v1:** bulk deletes, changing gifts by import, pledge uploads, merges, consent from imports, and automatic NCOA service connections.

## Ratified context

- **Q1:** clause 2 (Asym is the only writer after the boundary) and clause 4 (match review).
- **Q4:** Recorded outside Asym.
- **Q5:** the capability model.
- **Q7:** O35 (charges Asym did not create wait for the Legacy Tail Backfill).
- **Q9:** restrictions are restrict-only; no consent from imports.
- **Q10:** matching rules, the one-email-one-holder rule, and O47.
- **Q11:** rule-based mapping.
- **C1:** money owners keep money rules.
- **C15:** an absent key means unchanged; defaults apply at create only; unknown options are rejected.
- **C18:** recurring feeds belong to their source domain.
- **Research:** `research/q12-r1-repo-write-modes.md` and `research/q12-r2-external-update-imports.md`.
