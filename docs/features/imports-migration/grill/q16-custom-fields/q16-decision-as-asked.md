# Q16 — Custom fields and option lists in a Switch: decision as asked and chosen

Founder answer (2026-11-03): **"B, but think of edge cases. also research modern best pratices and apply where it makes sense."** The founder also required a full, ruthless adversarial review across all 22 categories.

## Options as asked

- **A. Create first, then map.** The ministry creates every new field and option in custom-field settings before mapping. Mapping offers only existing fields and options, and unmatched columns are left out visibly.
- **B. A person creates them from the mapping screen, confirmed in a batch (chosen).**
- **C. Create automatically.** Every unmatched column becomes a field and every unknown value becomes an option.

## Option B as proposed

1. **Create field.** For each unmatched column the mapping screen offers "Create field":
   - **Name:** prefilled.
   - **Type:** chosen after seeing sample values and how many fit. Phone numbers, ZIP codes and IDs stay text.
   - **Protection tier:** set per Q14.
   - **Visibility:** staff-only by default.
2. **Drafts until commit.** New fields stay drafts until the run commits; drafts from a discarded practice run are thrown away. Fields are created through Phase 11's own command, following Q13's retired-designation pattern.
3. **New options.** For code columns, a person adds each new option deliberately, or confirms "add these N values". Nothing is created automatically, even on "open" fields.
4. **Core facts first.** A column that looks like an Asym built-in (spouse, deceased, do-not-mail, pledge) points to the built-in field. Creating a lookalike needs explicit confirmation.
5. **Empty and sparse columns.** Empty columns can be left out in one confirmed step. Each column shows how full it is; there is no automatic cutoff.
6. **No defaults on imported records.** Imported records never get a field's default value.
7. **SiteStacker yes/no fields.** The ministry chooses whether "No" means no or unknown.
8. **Custom entities.** Repeating linked records are not in v1; they are a visible "not yet covered" exclusion.
9. **After the Switch.** A list shows every field and option the Switch created.

## Facts presented with the question

- **Owner rule:** "Phase 30 never defines a target domain's schema" (`owner-constraints.md:389-392`).
- **Phase 11 has no code yet**, and no batch or draft path; issues #645–#664 are all open.
- **Phase 11 conflicts:**
  - "open" option fields auto-create options (#654), which conflicts with Q11;
  - defaults are applied when a record is created (#655);
  - no rule stops shadow fields.
- **SiteStacker** exports definitions but documents no export of values; blank yes/no fields come out as "No".
- **Vendors are split:**
  - the field must exist first in Salesforce, Bloomerang, Virtuous, Little Green Light, Givebutter and Rock;
  - it can be created while mapping in HubSpot, Mailchimp and Planning Center.

## Ratified context

- **Q1:** Asym is the sole writer after the boundary; custom data family.
- **Q2:** header capture includes entity definitions.
- **Q3:** templates and presets.
- **Q5:** capabilities.
- **Q6:** practice runs and copies.
- **Q11:** rule-based matching; Value-mapping tables map to existing options only; Remembered mappings.
- **Q12:** everyday imports carry existing custom fields only.
- **Q13:** retired designations created by a person, singly or in a confirmed batch, through the owner command.
- **Q14:** record tiers; free-text custom fields follow tiers.
- **Q15:** retention, plus Verify your copy.
- **Constraints:** C1 and C15 (absent key means unchanged; defaults apply at create only; unknown options rejected).

## Research

- `research/q16-r1-repo-custom-fields.md`
- `research/q16-r2-external-custom-fields.md`
- `research/q16-r3-repo-verification.md`
- `research/q16-r4-external-edge-cases.md`

Research files r3 and r4 were added for the full review.
