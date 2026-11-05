# ADR-IM-018: Import reversal is one prepared page; Asym reverses only people results, and owners correct the rest

**Status:** Accepted 2026-11-03. Ratified by the founder in the Phase 30 grill (Q18), after a full ruthless review.

- **Record:** `docs/features/imports-migration/grill/decision-log.md` §1 Q18.
- **Evidence:** `grill/q18-reversal/` (research r1–r4 and `q18-adversarial-review.md`, which holds edge cases E1–E38, invariants V1–V9 and AC1–AC22).
- **Amends:**
  - ADR-IM-001: clause 10's batch reversal after go-live is this decision, and Switch runs have no reversal before go-live.
  - ADR-IM-012: clause 8's reversal checks.
  - ADR-IM-015: "Everyday-import undo" becomes the import reversal window and "undo values" become reversal prior values; the Switch window runs from go-live; hold and erasure rules.
- **Preserves:**
  - ADR-0216: no automatic donor merge, and a governed Undo.
  - ADR-0173 clause 29: CMS "Prepare reversal", never "Undo import".
  - Phase 28 D17: the missionary self-import has no batch undo (#2084).
  - Phase 15 owns batch reverse and its compensating entries.
  - Q13: giving history is corrected by void and re-adopt.
  - Q14: owner correction runs.
  - Q16: the Created-by-Switch list.

## Context

Q12 ratified a reversal for People imports. Q15 gave it a 30-day window. Neither defined its wording, which imports get it, or what "touched" means.

**Owner rules already ratified:**

- **ADR-0173 clause 29:** CMS imports use "Prepare reversal", with seven groups. Phase 20 D16 also forbids "Undo import".
- **Phase 15 batch reverse:** applies to a whole posted batch only. It posts compensating entries, sends corrected or void receipts, and may need a second approver. One Gift file can become several batches.
- **D17 self-import (#2084):** "No batch undo", with a static test that fails if an undo route exists.
- **"Reversal" already means a payment reversal** across this decision log and the root and money owners' glossaries.

**Current code:**

- There is no person archive state: `donors.status` is free text.
- The CRM bulk Archive is a stub.
- Tags are a flat text list.
- There is no list-membership entity.
- Today's write suppression covers import writes only.

**Practice:**

- **Common pattern:** "Undo import" is the common label. HubSpot uses a preview followed by restore.
- **Confirmation:** NN/g reserves typed confirmation for rare, dangerous actions.
- **Accessibility:** WCAG requires error prevention, status messages and no time-limited undo toasts.
- **Long jobs:** Salesforce and Shopify cancels don't roll back what already ran.
- **Archiving:** Mailchimp warns that archiving is not a legal substitute for deletion.
- **Breaches:** GDPR Art. 33 sets a 72-hour breach notification.

## Decision

1. **Where it appears.**
   - **On:** "Prepare reversal" appears on committed People imports, Gift files, website content imports (Phase 23's plan) and Switch runs after go-live.
   - **Not on:** the missionary self-import, Practice copies or Switch runs before go-live.
   - **Pressing it changes nothing.** Only a ministry member with the reversal capability confirms.
2. **One page, three groups:** Can be reversed now, Needs its owner's correction (with a direct link) and Stays as it is (with a plain reason). Owners' finer groups, such as Phase 23's seven, show as reasons.
3. **Who does what:**
   - **People results:** Phase 9, with Phases 4 and 11.
   - **Website content:** Phase 23's plan.
   - **Gift files:** every resulting batch links to Phase 15, to discard a draft or reverse a posted batch. Phase 15's page states donor effects and any approval step first.
   - **Switch giving history:** void and re-adopt.
   - **Recurring gifts:** Phase 16.
   - **Notes, files and care:** owner correction run.
   - **Created custom fields:** the Created-by-Switch list.
   - **Retired designations:** stay, kept for history.
   - **Restrictions, opt-outs and suppression evidence:** never removed.
4. **People checks, applied again at the moment of change:**
   - **Values:** a value goes back only if nothing has written that field since the import, including a later import. A field that was empty before becomes empty again, and these are counted. Putting a value back restores which write it came from.
   - **Tags:** count as one field.
   - **Added contact details, list memberships and household links:** removed as "entered in error" only if unchanged and nothing was sent. An address the import ended is reopened. List removal is never an unsubscribe.
   - **Created people:** archived only if Untouched, as the glossary defines it.
   - **Values on created people:** never blanked one by one. A corrected file is imported instead.
5. **Confirming:**
   - The page is the confirmation: no typed phrase and no second person.
   - The final button names the result in non-money words.
   - A prepared page lasts 24 hours or until the window closes.
6. **Running:**
   - **In the background:** progress is announced and the person is notified when it finishes.
   - **Stop:** stops after the current batch, without rolling back.
   - **One at a time:** one People import or reversal per ministry.
   - **Once per import:** each import is reversed once, and a stopped one resumes.
   - **No redo:** re-import instead, and archived people return only through one grouped decision.
   - **Results:** generated on demand under the viewer's permissions, never stored.
7. **Window:** 30 days, from commit for everyday imports and from go-live for a Switch run.
   - **Display:** an absolute date and time in the ministry's time zone.
   - **Deadline:** a reversal confirmed in time finishes.
   - **Legal hold:** keeps prior values without extending the window.
   - **Erasure:** removes prior values, and the person is skipped.
8. **Effects stay dark.** A reversal fires no automations, triggers or messages. Only Phase 15's reversal of a posted batch reaches donors, under Phase 15's rules.
9. **Evidence:** every change is attributed. The reversal record keeps who, when, counts and outcome codes, with no row content.
10. **Wrong file:**
    - Reverse it, then the privacy role erases those people through the erasure path, which also reaches the held file and the prior values.
    - The records support the ministry's breach log.
    - If Asym staff caused it, Asym tells the ministry.
11. **Words:**
    - The action is "Prepare reversal", and the term is always "import reversal".
    - People buttons never say "reverse" or "undo".
    - Money verbs stay with the money owners.
    - "Undo import", "rollback", "revert" and "restore snapshot" are never used.
12. **No family without its correction path.** A record family is importable only when its clause 3 row works (C23).

## Considered options

| Option                                                   | Why rejected                                                                                                    |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| A. "Undo import" wherever possible                       | Contradicts ADR-0173 and Phase 20 D16 and promises a full inverse. The final button carries the plain language. |
| C. No reversal page in v1                                | Drops Q12's ratified People reversal and leaves staff hunting across screens.                                   |
| Restoring when the value still equals the imported value | Overwrites deliberate same-value edits. Use "not written since".                                                |
| Per-tag provenance                                       | Needless; tags as one field suffice.                                                                            |
| Typed confirmation or a second approver                  | Reserved for rare, dangerous actions. The reversal is recoverable, and Q5 and ADR-0173 reject the ritual.       |
| Forcing newest-first order                               | Blocks fixing an older bad import. The per-field check makes order safe.                                        |
| Whole-plan staleness checks                              | In a live CRM every plan is stale. Use per-item checks and a 24-hour expiry.                                    |
| Whole-tenant snapshot restore                            | Wipes colleagues' work.                                                                                         |
| Hard-deleting created people                             | Loses opt-outs and history. Archive instead, and use erasure for wrong files.                                   |
| Redo                                                     | Re-importing does it.                                                                                           |
| Reminder email before the window closes                  | Noise for the many good imports. The deadline is on the page.                                                   |
| A separate incident system for wrong files               | The erasure path and the records cover it.                                                                      |
| Phase 30 posting compensating money entries              | Phase 15 owns them.                                                                                             |
| Extending the window during a legal hold                 | A hold preserves evidence. It doesn't keep an action open.                                                      |
| A reversal action for every family in v1                 | Duplicates correction paths that six owners already define.                                                     |

## Consequences

**Owner requirements (in order of work):**

1. **O87 (Phase 9 with Phases 4 and 11):** the People reversal command.
2. **O88 (Phase 9):** what "archived" means for a person.
3. **O89 (Phases 34, 11, 6 and 14):** reversal writes are suppressed like import writes. This must land before any reversal runs.
4. **O92 (privacy owner with Phase 9):** erasure reaches prior values.
5. **O90 (Phase 15 with Phase 13):** the Gift-file batch handoff, and reconciling D71.
6. **O91 (Phase 23):** mapping its seven groups onto the three.

**Ships together:** prior-value capture ships in the same release as People imports, or early imports can't be reversed.

**Discrepancies:** D68–D73. D3 is resolved.

**Monitors** M-Q18-1 to M-Q18-7:

- share of imports reversed above 10% a quarter;
- median share of items left as they are above 50%;
- jobs stuck or failed for 1 hour;
- any effect fired by a reversal;
- prior values past their deletion date;
- any wrong-file erasure;
- any write to an erased, merged or touched person.
