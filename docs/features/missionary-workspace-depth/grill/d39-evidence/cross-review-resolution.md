# D39 — research, challenge and resolution

Reviewed October 18, 2026. This records how the original-referral-date decision
was tested and amended. It does not claim runtime or user-study proof.

## Evidence actually obtained

- Root verified all eleven current-artifact hashes in D38's ratification report
  before changing the Q39/session/glossary records. No D38 verifier was executed.
- [Prior manifest](prior-evidence-sha256.json) preserves all fourteen D38
  evidence files and the original unanswered Q39 snapshot.
- Independent [governance](governance.md), [temporal/authorization](temporal-and-authorization.md)
  and [UX](ux-and-primary-research.md) reviewers inspected the relevant canonical
  repository contracts and bounded current source. Their notes state search
  scope, exact evidence and limitations.
- Root independently opened current official GOV.UK Dates, MPDX referral,
  TntConnect phase, HubSpot activity-properties, NN/g date-input and PostgreSQL 17
  date/time documentation. The UX note records additional fresh CoachAccountable,
  GOV.UK and W3C sources; the technical note records PostgreSQL/Supabase sources.
  Search results were followed by actual page reads for adopted findings.
- Root checked the exact D34 C07, D35 C12 and D36 timing/correction wording when
  independent review identified an overbroad correction restriction.
- Root ran only the newly written [calendar examples](calendar-examples.py).
  [Results](calendar-examples.json) record eight expected boundaries and 23/25-hour
  New York calendar-day contrasts with Python/tzdata provenance. This small
  illustrative search is not a production resolver or Core integration test.
- No prior model/probe/verifier was run, no product code or schema was changed,
  and no actual source-service/database/UI deployment was qualified.

## Genuine product clarification

The founder's original A selects the original referral event, not its recording
time. It did not establish how a date without an exact time should produce an
elapsed-time endpoint. All three reviewers independently identified this seam.
The inherited D38 rule specified 24-hour days for both kinds; forcing a remembered
clock time would reduce data quality and usability.

One focused question presented calendar-date New windows versus retained elapsed
days with an explicit date-only policy anchor. The founder selected:

> Use calendar-date deadlines for new referrals, clearly showing the last day
> to follow up (recommended).

The parent review explicitly changes **New only**. Continued keeps its existing
elapsed-time contract. The selected answer is not automatically ratification of
all subsequently proposed exact amendments.

## Material challenges reconciled

| Challenge                                                                                                     | Evidence/reasoning                                                                             | Resolution in the parent review                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ordinary date-only data has no exact event instant.                                                           | PostgreSQL date semantics; GOV.UK date guidance; D38 elapsed rule.                             | Founder-selected calendar amendment; original date is day one, N dates inclusive, frozen organization deadline zone. Preserve original precision instead of asserting midnight.                                                                                                        |
| Exact timestamps and reported calendar dates can differ near the date line.                                   | A date-only fact cannot be converted between zones without a time.                             | Preserve qualified reported D directly; derive D from exact instants in policy zone; explain the interpretation. No location inference, session/browser fallback or fabricated original time.                                                                                          |
| First late entry has no historical policy evidence.                                                           | D38 expressly left this branch open; current policy is not historical fact.                    | Apply current New terms at actual first qualified acceptance to the original date; label application truthfully. Existing accepted windows override this first-window rule.                                                                                                            |
| Late expired recording could fabricate prior Active access and history rights.                                | D34 requires source-proved recipient belonging plus current disclosure authority.              | No retroactive acceptance/access. Independent qualified recipient evidence governs narrow history; creation alone grants nothing.                                                                                                                                                      |
| Initial draft overrestricted genuine mistaken-expiry repair.                                                  | D34 C07/D35 C12 expressly preserve separate authorized source correction.                      | Replaced a blanket no-extension rule with exact capability/evidence/revision-checked correction using original accepted policy/basis. Repair can correct an erroneous deadline either way without a fresh period or false continuation. Legitimately elapsed work still uses Continue. |
| Original accepted E and a corrected effective cutoff could disagree in UI, jobs and continuation eligibility. | Reviewers independently supplied examples of earlier corrections leaving an old displayed end. | C07 requires one current qualified effective result, preserved immutable prior acceptance and actual correction time; all current display/actions/jobs use the result. No backdated rewrite of actual access.                                                                          |
| Correction could reactivate an already consumed predecessor.                                                  | D35 lineage and single-successor invariants.                                                   | Later accepted successor terms remain current and unchanged; predecessor correction cannot reactivate/reschedule it. Lineage-invalidating contradictions require qualified owner reconciliation, not generic override.                                                                 |
| Immutable E can render inside a nominal final day after a timezone-rule update.                               | Stored instant and current civil rendering may diverge.                                        | C04/P06 require actual stored-endpoint date/time/offset/zone display whenever “through [nominal day]” would mislead, not only for skipped dates. No endpoint recomputation.                                                                                                            |
| Guessed ADR filenames break traceability.                                                                     | Filesystem check found the actual ADR-0210/0211 names.                                         | Corrected links to code-authoritative capability foundation and distinct-human projection-widening approval.                                                                                                                                                                           |
| A vendor's convenient import fallback contradicts original-event semantics.                                   | HubSpot explicitly defaults absent Activity date to creation time.                             | Reject the fallback; preserve provenance/unknown state and qualify source mapping. A leading product's behavior is not imported as authority.                                                                                                                                          |

These resolutions are incorporated in the parent decision, exact clauses,
journey, concern register and proof criteria. Earlier reviewer reasoning is
evidence, not a second current contract when the root synthesis states a more
precise resolution.

After amendment, governance and temporal reviewers reread the affected exact
decision, C04/C07/C10, journey, F05 and P06/P13/P14. Both confirmed their material
findings resolved, with no remaining material flaw in that targeted reread.
This is independent document review, not an additional runtime test.

## Evidence limits and result

The document review is complete for Q39 and its selected calendar clarification.
The source-owner/API/RLS, migration, capacity and actual UI/user-comprehension
proof remains a concrete activation requirement, not a claim of work performed.
There is no implemented initial-window producer certified by this review.

No ministry interviews, authenticated competitor walkthroughs or fundraising
efficacy data were gathered. The founder's direct choices are product feedback;
official guidance/vendor facts and independent engineering challenge are not
substitutes for an actual user study. Numeric calendar examples are illustrative,
not organizational default recommendations or measured service budgets.

The new structural verifier checks the selected/pending statuses, all 22
categories, exact C01–C17/P01–P26 identifiers, references and frozen evidence.
Its passing result proves documentation integrity only.
