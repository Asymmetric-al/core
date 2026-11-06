# ADR-IM-016: Custom fields and options are created by a person from mapping

**Status:** Accepted 2026-11-03. Ratified by the founder in the Phase 30 grill (Q16), after a full ruthless review.

- **Record:** `docs/features/imports-migration/grill/decision-log.md` §1 Q16.
- **Evidence:** `grill/q16-custom-fields/` (research r1–r4 and `q16-adversarial-review.md`, which holds edge cases F1–F29, invariants G1–G8 and AC1–AC15).
- **Amends:**
  - ADR-IM-003: the custom fields and collections family.
  - ADR-IM-011: value maps use option IDs.
  - ADR-IM-015: refused columns are stripped.

## Context

Ministries' custom fields hold years of working knowledge.

**Owner text and Phase 11's current design:**

- Owner text: "Phase 30 never defines a target domain's schema" (`owner-constraints.md:389-392`).
- Phase 11 owns definitions, but has no draft state or batch command, and none of its code exists yet.
- It applies defaults when a record is created (#655), which would fabricate history for imports.
- It lets "open" option lists create options from unknown import values (#654), against Q11.
- It anchors options on a stable `value_key` with editable labels (`phase-11:189`).
- Its second approver applies only to exposing contact data externally (#649).
- On develop, the Phase 3 field-policy reader can't hold tenant custom-field rows.

**Vendor practice:**

- Some vendors require fields to exist first (Salesforce, Bloomerang, Virtuous, Little Green Light, Givebutter, Rock).
- Others create them during mapping (HubSpot, Mailchimp, and Planning Center, which now finalizes at import completion but creates options automatically).
- Option lists are restricted in HubSpot and Salesforce.
- HubSpot's sensitive-data feature excludes SSNs and card numbers.

## Decision

1. **A person decides every unmatched column:** map it to a built-in field, map it to an existing field, create a field, or leave it out. Fill rate, samples and distinct-value counts are shown. Empty columns can be left out in one step, and there is no automatic cutoff.
2. **Create field (inline or in a review table):**
   - the name is prefilled;
   - the type is chosen with fit rates shown; text is the safe default, and phones, ZIP codes and IDs stay text;
   - the tier is Staff or Restricted (long text defaults to Restricted);
   - visibility is only "Our team only" or Restricted, and is widened later in Phase 11 settings;
   - sealed content is never a field.
3. **Field drafts** live in the Switch plan, keyed by draft ID.
   - A practice run creates them only in its Practice copy.
   - The real commit creates them all or none through Phase 11's batch command, after limit and name checks.
4. **Options are added deliberately**, after grouping variants.
   - History-only values become archived options.
   - Value maps store option IDs.
   - Nothing is automatic, even on "open" fields.
   - Above 200 distinct values, the screen recommends text.
5. **Steering.** Core facts and calculated values are steered to the owner's built-ins; a lookalike field needs a reason. Gift money facts are never custom fields.
6. **One column, one target.** No merging or splitting. Household values never go to members.
7. **Blanks and partial dates.** Blank tokens are declared per column, and partial dates are never padded.
8. **No defaults** on imported records or on Switch-created fields.
9. **Identifier refusal.**
   - A column whose header names an SSN or SIN, card number, card security code, bank account or passport is refused, with no override.
   - Card-like or SSN-like values block the column for review, and a false match can be overridden with a logged reason.
   - Refused columns are stripped from the held copy within 14 days.
10. **Collections.** Repeating records import into Phase 11 collections the ministry created first. Collections are not created from mapping in v1.
11. **Scope.** This applies to Switches only. Everyday imports use existing fields only.
12. **Created-by-Switch list.** It offers one-step retirement for fields with no values. Type changes follow Phase 11's rules.

## Considered options

- **Create first in settings (A).** Rejected: the person chooses types blind.
- **Create automatically (C).** Rejected: breaks owner text and Q11, and causes sprawl.
- **Legacy-data catch-all.** Rejected: a shadow schema no tier can protect.
- **Collections from mapping.** Rejected: a larger model change.
- **Fill-rate cutoff.** Rejected: thresholds are arbitrary.
- **Split or merge in mapping.** Rejected: a reviewed file change already does it.
- **Label-based maps.** Rejected: they break on rename.
- **Warn-only for identifiers.** Rejected: PCI and privacy exposure.

## Consequences

- **Owner requirements:**
  - O75: Phase 11 batch create.
  - O76: Phase 11 import rules (no defaults, no automatic options, archived options allowed, staff-only visibility, settle D58).
  - O77: Phase 3 tenant policy rows.
  - O78: no field-change automations on imports.
  - O79: Phase 29 strips refused columns.
- **Discrepancies:** D57–D61.
- **Monitors:** M-Q16-1 to M-Q16-5 (fields per Switch, sparse created fields, identifier overrides, defaults on imports, automatic options).
