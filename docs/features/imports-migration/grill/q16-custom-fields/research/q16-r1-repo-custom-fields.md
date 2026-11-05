# Q16 r1: Custom fields and option lists in a Switch (repo research)

Scope: F10. Base `develop` `629cb71dc`, read 2026-11-03. `gh` worked; #645–#664 are all OPEN. This file extends `research/r02` §4 and does not repeat its rule table. **P11** = `docs/prds/sitestacker-parity/phase-11-custom-fields-custom-collections.md`; **DL** = `grill/decision-log.md`; **OC** = `docs/prds/program-roadmap/owner-constraints.md`; **RM** = `docs/prds/sitestacker-parity/roadmap.md`.

## 1. Phase 11 owner rules

- **Posture.** Designed for a fresh build: "there is no legacy custom-field data to migrate" (P11:10).
- **Types.** 16 types (P11:147). File, formula, rollup, rich text and record-reference fields are not built (:149, :256). Select fields store an option id.
- **Targets.** People, organizations, households and funds. Gifts and pledges cannot carry custom fields in v1; campaigns are disabled (:135, :259).
- **Collections.** Party only, with `item_external_id`. "A 'bag of fields' is a COLLECTION; an openable/ownable/two-sided record is a RELATIONSHIP". Record-reference fields are rejected (:137).
- **Lifecycle.** **No draft or proposed state**: ACTIVE → ARCHIVED → PENDING_PURGE (30 days) → TOMBSTONE (:199).
  - Deleting a field with data needs type-to-confirm (:90).
  - An "active/scheduled import" hard-stops archive or delete (:199).
- **Renaming and merging.**
  - Labels rename freely; `field_key` and `value_key` are frozen (:175-177; #652).
  - Options support rename-vs-new and merge (:189).
  - No field-level merge was found (unverified absence).
  - Changing a field's type needs maker-checker (:169). No value-conversion rule is given.
- **Who creates.** Story 1 says "org admin". Classifying needs `crm.customfields.classify`, which is "deliberately **absent** from `BASE_STAFF_CAPABILITIES`" (#646). #652 says an actor without it "cannot save a field at a tier requiring it". **Which tiers require it is not stated** (unverified).
- **Creation path.** One field at a time, through "one smart form" (:205). The default answer is "Our team only", which is `internal` (:161). **No bulk or batch definition command exists** in P11, #647, #649 or #652 (verified by grep).
- **Quotas.** About 200 fields per record kind, 50 collections, and 200 options per field (1,000 ceiling) (:195).
- **Policy at birth.** A field born without widenings is "Mission-Control-only across every door" (:161; #649:51). Import is "a classified write surface" (:159). Financial, care and security fields can never go external.
- **Import contract (#660).**
  - Template headers come from `value_key`.
  - "restricted-for-import ⇒ the field is ABSENT from the template".
  - Imports use the same write path as screens.
- **Options.** "Restricted by default; unknown option on import rejects." A field can opt in to "open", which "auto-creates an ACTIVE-but-flagged-for-review option" (:189; #654:44). Option lists are per field; shared lists are only reserved.
- **Required fields and defaults.**
  - A required rule scoped to one surface does not block import (#655:59).
  - Defaults materialize on create when the field is "present-and-blank" (#655:49). Tokens include `today`.
  - Imported values are tagged `source=import` (:191).

## 2. Creating definitions or options during an import

**No owner text lets an import create a field definition.**

- OC:389-392: adapters "activate only after the target phase and its typed import command exist; Phase 30 never defines a target domain's schema".
- RM:4377: "Phase 11 owns custom-data semantics".
- OC:430-431 and RM:4369 require a "field-catalog bootstrap from a SiteStacker entity export", but say nothing about who creates the fields or how.
- RM:4395: "quarantine unresolved records". RM:4409 leaves "unsupported legacy fields" open.
- Only #663 (:63, :249, :265) says "auto-created option/**field**" (see D1).

**Ratified Phase 30 decisions.**

- **Q1** (DL:43-44): custom data is outside the Minimum Switch Kit. It can wait as a visible exclusion, and Asym is its only writer after the boundary.
- **Q2** (DL:74, :76): the discovery declaration covers "record types and custom fields", and header capture includes "entity definitions". This is Q2, not Q3.
- **Q3** (DL:101): templates include a custom fields and collections family.
- **Q11**:
  - "A non-empty column left unmatched blocks the plan until it is matched or explicitly left out" (DL:522).
  - Values map to existing options only. Creating options stays with F10 (DL:534-536).
- **Q12** (DL:568): everyday imports carry "existing custom fields only".
- **Q13** (DL:509): designations are created by a person "from the mapping step, singly or in a confirmed batch, through the owner's command … nothing is created automatically". F10 could reuse this pattern.
- **Q5** (DL:192): "no Asym identity can make or hold any decision". C16 says an import role never widens authority.

**Phase 28.** Normative text says "every nonempty column is mapped, explicitly excluded or unresolved" (`phase-28-…/relationships.md:381`). D17 research adds that "arbitrary custom columns do not create schema automatically" (`d17-evidence/source-products.md:119`).

## 3. Code at `629cb71dc`

- **No custom-field code.** The custom-field schema names (`extensible_targets`, `party_extensions`, `field_definitions`, `extension_values`, `custom_field`) appear nowhere outside docs and vendored Payload. There are no tables, APIs, RLS or option storage.
- **`field_policies` (Phase 3) exists.**
  - Six categories (`20261005050728_field_policy_foundation.sql:7-17`).
  - Surfaces are `mission_control, donor, missionary, public, export`, with **no `import` surface** (`field-policies/taxonomy.ts`).
  - Only super-admins can write (:36-41), and tenant overrides are dormant (:19).
- **Existing classifications.**
  - `donors.notes` is `care` (:490).
  - `donors.tags` is `security` (:440).
  - `donors.giving_preferences` is `security` (:410).
  - Both `tags` and `giving_preferences` are legacy catch-all columns (`20250101000000_init_schema.sql:77`, `:83`).
- **Capabilities.** Only four exist (`packages/auth/permissions.ts:10-14`). There is no classify or import capability.
- **No import code.** No CSV/XLSX parser dependency, no import routes, and no Phase 28 self-import code.

## 4. SiteStacker custom data

- **Structure.** Entity Groups → Entities → Fields. Field types are text, text area, date, checkbox and number.
  - The "Multi" setting "cannot be changed" once saved.
  - Linked CRM Entities share an entity group across records.
  - Data Groups are typed lookup lists with external IDs (r07:111, :132; q01-r1:187-188).
  - Link Set fields are known only from a snippet (unverified).
- **Export.** Definitions export through "Export to Import", whose format is undocumented. **Values have no documented export** (r07:112, :367).
- **Import order.** Entities must exist before their template appears (r07:95, :101).
- **Forms.** Motion form tasks save fields to CRM (q01-r1:271), so entity fields may hold application data.
- **Restriction flags.** Do-not-contact, do-not-mail and deceased "may exist as Record Types or entities" (q01-r1:265).
- **Basic fields without a known Asym home:** shirt size, marital status, anniversary (q01-r1:181).
- **Likely mapping (inferred).**
  - An entity field becomes a custom field.
  - A "Multi" entity becomes a collection or a multi-select (ambiguous).
  - A Data Group is copied per field.
  - A Linked Entity becomes a relationship or is excluded.

## 5. Facts that belong to another owner

| Source field                 | Owner home                     | Owner text                                                                                                                        |
| ---------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| "Do not mail", deceased      | Q9 restriction import; Phase 9 | DL:376 "The Switch lead confirms what each source field means"                                                                    |
| Opt-in flag                  | Q9 adoption only               | C10 (DL:871); "Custom fields cannot own message facts" (`phase-17-cross-prd-congruence-2026-07-19.md:139`)                        |
| "Spouse name"                | Q10 Person 2 columns           | DL:456, :468; record references rejected (P11:137)                                                                                |
| "Monthly pledge", gift data  | Phase 16; Phase 13             | Money transactions get "no custom fields" (`phase-13…:245`); "no arbitrary EAV" (`phase-20-cross-phase-congruency-audit.md:1047`) |
| Asks                         | Phase 27                       | "asks are NEVER edges or custom fields" (`phase-09…:502`)                                                                         |
| Care text; application facts | Phase 38 sealed; Phase 41      | DL:732, :733                                                                                                                      |
| Recognition labels           | Phase 11 custom fields         | "never new roles" (`phase-14…:410`)                                                                                               |

**Gap: there is no general "no shadow fields" rule.** Nothing forbids a Party-level currency field called "Monthly pledge" (P11:147).

## 6. Visibility and free text

- **Phase 11.** The donor portal and missionary workspace are separate read surfaces, closed by default. Opening one needs maker-checker and a blast-radius preview (:159, :169). A restricted worker's fields are withheld automatically (story 30).
- **Phase 25 and Phase 28 PRDs never mention custom fields** (grep), so donors and missionaries see none in v1 (inferred). The Phase 28 founder brief says "do not make unlimited private properties a parallel schema" (`phase28-founder-brief.md:133`).
- **Free text.**
  - Phase 3 classifies `donors.notes` as `care`.
  - Q14 E35 routes "free-text custom fields holding note-like content" to F10 "with the same tier rule" (`q14-adversarial-review.md:128`).
  - q14-r1:167 says imported free text "defaults to `care`".
  - Q14: "Unknown categories start as Restricted"; the care question offers only Sealed or Leave behind; there is "no keyword scanning" (DL:738-741).
- **Vocabulary mismatch.** Q14's tiers (Staff, Restricted, Sealed) do not map onto Phase 11's six categories. **A Phase 11 field cannot be Sealed.**

## Discrepancies

1. #663 auto-creates "option/field", but P11:189 allows only options.
2. P11:10 says there is "no legacy custom-field data", but OC:430-431 requires a bootstrap.
3. Phase 11 "open" fields auto-create options (P11:189), but Q11 maps only to existing options (DL:534-536).
4. Defaults fill "present-and-blank" cells on create (#655:49), but Q12 says "A blank cell never changes anything" (DL:577). Switch creates are not addressed.
5. The glossary calls the value key "an option's stable machine handle" (`CONTEXT.md:2810`), but fields also carry one (#647:66; #660).
6. Phase 11 treats import as a door, but `field_policies` has no `import` surface. **Whether a default-tier field is importable is unstated** (#649:51; unverified).
7. Phase 14:410 puts labels on credits, but Phase 13:245 bars custom fields on money-transaction records.

## Hazards

- **Automatic creation** would mint fields at `internal` tier without anyone considering them. Health or security free text would then become staff-visible.
- **Shadow facts.** Consent, deceased, spouse or pledge facts stored as custom fields bypass Q9, Q10 and Phase 16.
- **Fabricated defaults.** A `today` default would stamp the import date onto historical records.
- **Fields not importable by default.** If the import door is closed by default, each new field needs a widening before it can import.
- **Manual workload.** Fields are created one at a time, Asym cannot create them, and there is no batch command.
- **Copied lists.** Copying Data Groups per field means later renames diverge.
- **Unknown shapes.** How Multi, Linked Entity and Link Set values are serialized is unknown.
- **Retention.** If Phase 11 ships late, custom data waits in a retained manifest that Asym deletes at the Q15 deadline (DL:21).

## Founder-decision candidates

1. **A field Asym lacks.**
   - (A) The ministry creates it in Settings → Data Model first.
   - (B) A permitted person creates fields from the mapping step, singly or in a confirmed batch, answering "Who should be able to see this?" for each. Nothing is automatic (mirrors Q13).
   - (C) Fields are created automatically. This conflicts with OC:389-392.
2. **SiteStacker bootstrap.** Should the kit pre-fill a proposed field list from "Export to Import" for the ministry to confirm? This needs a Phase 11 batch-create owner requirement.
3. **Unknown options.** Should a person be able to add an option from the value-mapping table? Should "open" fields be barred from auto-adding during a Switch?
4. **Core facts.** Should each column get a declaration (restriction, consent, household, money, care, or plain custom data), so core facts route to their owners without scanning?
5. **Free-text tier.** Does every long-text field get Q14's care question, with "Sealed" meaning leave behind or Phase 38?
6. **Defaults.** Should records created by an import skip field defaults?
7. **Timing.** What happens to custom data if Phase 11 isn't ready before retention runs out?
8. **Linked Entities and Link Sets.** Relationships, collections, or leave behind?
