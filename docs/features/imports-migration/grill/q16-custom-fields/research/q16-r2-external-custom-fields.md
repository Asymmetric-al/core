# Q16-R2 — External evidence: custom fields and option lists in a Switch

_Web research, accessed 2026-11-03. **V** = vendor doc fetched, quote checked · **S** = secondary (third-party, community, or snippet only) · **U** = unverified/inference/not found._

**Gaps:** support.virtuous.org and HubSpot Ideas returned 403. No public import docs found for Breeze, Kindful or Rock Slingshot attributes.

## 1. How CRMs handle custom fields in imports

| Product                  | Create field while mapping?                                                                                                                                            | Values not in the option list                                                                                                                                                                                         | Evidence                                                                                                                                                                                                                                                                         |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Salesforce Import Wizard | **No.** Prepare first: "create new custom fields, add new values to picklists". "Unmapped fields are not imported"                                                     | Restricted picklist: the wizard "uses the picklist's default value or may fail". Unrestricted picklists accept the file value                                                                                         | V: https://trailhead.salesforce.com/content/learn/modules/lex_implementation_data_management/lex_implementation_data_import                                                                                                                                                      |
| HubSpot                  | **Yes.** "click Create new property, then set up your property in the right panel" (not activities)                                                                    | Must match an option's label or internal value. A mismatch is invalid: the record still imports with the field blank. Multi-checkbox options "must be created prior to the import"                                    | V: https://knowledge.hubspot.com/import-and-export/import-records-for-a-single-object; https://knowledge.hubspot.com/import-and-export/set-up-your-import-file; https://knowledge.hubspot.com/records/property-value-is-underlined-red                                           |
| Planning Center People   | **Yes.** "Create new field" with a type and tab; all types except File and Section Header. "Fields aren't actually created until you finalize the import" (2026-07-13) | **New options are created automatically by default** ("Create new options detected from CSV fields", 2026-06-15), with a toggle to turn it off. Undo within 48 h does **not** delete the fields or options it created | V: https://www.planningcenter.com/changelog/people/create-custom-fields-during-imports-visual-refresh-and-more; https://planningcenter.com/changelog/people/auto-create-field-options-during-imports; https://help.planningcenter.com/en/138558-import-a-csv-file-in-people.html |
| Mailchimp                | **Yes.** Click a column header "to create a new field". "Any unmatched columns won't be imported"                                                                      | —                                                                                                                                                                                                                     | S: https://mailchimp.com/help/import-contacts-mailchimp/. Limit: "maximum of 30 data fields" (80 on Premium); type "can't be changed" (V: https://mailchimp.com/help/manage-audience-signup-form-fields/)                                                                        |
| Zoho CRM migration       | **Yes.** It "identifies fields that are not mapped" and offers to create them, rename them, or "choose not to create a particular field"                               | —                                                                                                                                                                                                                     | V: https://help.zoho.com/portal/en-gb/community/topic/create-and-map-fields-easily-during-data-migration                                                                                                                                                                         |
| Bloomerang               | No evidence of creating fields during import                                                                                                                           | Custom-field values "must match already-existing values". Pick-multiple values are separated by a pipe. A field's type cannot be changed later                                                                        | S: Bloomerang Academy deck; V: https://help.bloomerang.com/en/articles/12632800-imports-set-up-import-files; https://help.bloomerang.com/en/articles/12632415-how-do-i-change-the-type-of-a-custom-field                                                                         |
| Virtuous                 | Collections must be set to "Show on Import"                                                                                                                            | Dropdown values "must match one of the configured options exactly (case-sensitive)". Advice: "full internal audit of your custom data before your migration starts"                                                   | V: https://docs.virtuous.org/crm/concepts/custom-fields; S: support.virtuous.org 4424186878861                                                                                                                                                                                   |
| Raiser's Edge NXT        | Attributes are set up under Configuration. No official order of setup before conversion found                                                                          | Eight types, including Code Table Entry and Fuzzy Date                                                                                                                                                                | S: https://support.ipaas.com/en/articles/15089593-ipaas-com-to-raiser-s-edge-nxt-constituent-mapping-documentation                                                                                                                                                               |
| DonorPerfect             | Its online import writes only to user-defined fields that already exist; one-time migrations go through its conversion service                                         | —                                                                                                                                                                                                                     | S: https://uploads.donorperfect.com/pdf/factsheets/online-import-module.pdf                                                                                                                                                                                                      |
| Little Green Light       | Maps to "any other custom category you've created"; "Do not import" skips a column; record preview                                                                     | The person names the separator for multiple values                                                                                                                                                                    | V: https://help.littlegreenlight.com/article/294-mapping-constituent-category-fields; https://help.littlegreenlight.com/article/50-what-kind-of-information-can-i-import-into-lgl                                                                                                |
| Neon CRM                 | A course lesson: "Create an Account Custom Field Before Importing Your Data (Optional)"                                                                                | —                                                                                                                                                                                                                     | S: https://academy.neonone.com/importing-your-account-data-v2                                                                                                                                                                                                                    |
| Rock RMS                 | "add new fields by configuring Rock before doing the Import"                                                                                                           | Defined-value lists                                                                                                                                                                                                   | S: https://www.rockrms.com/ask/developing/1935                                                                                                                                                                                                                                   |
| Givebutter               | Its template "will include any contact custom fields you created prior to download"                                                                                    | —                                                                                                                                                                                                                     | S: https://help.givebutter.com/en/articles/5497872-how-to-import-contacts                                                                                                                                                                                                        |

**Source side (SiteStacker).** Data is organised as Entity Groups, then Entities, then Fields. Field types include Datagroups (custom dropdowns that "must be configured in the Datagroups component" first) and Multiple Items. Entity definitions can be moved with "Export to Import". SiteStacker advises against Boolean fields because a blank defaults to No (V: https://training.sitestacker.com/support/solutions/articles/151000122179-basic-crm-fields-and-custom-crm-entities; S: https://help.sitestacker.com/en/article/adding-entity-groups-entities-and-fields-in-crm-wf2yxe/).

**Implication for Asym.** Three camps: field must exist first (Salesforce, Bloomerang, Virtuous, LGL, Givebutter, Rock); create while mapping (HubSpot, Mailchimp, Zoho, Planning Center); vendor-run conversion (DonorPerfect, Blackbaud). Planning Center, the closest ministry analogue, defers creation until finalise, which fits a Switch commit. Its automatic option creation breaks Asym's "reject unless mapped" rule; do not copy it.

## 2. Field sprawl and governance

- **Limits.** Salesforce 500 custom fields per object (Enterprise) / 800 (Unlimited) (S, older official cheat-sheet: https://resources.docs.salesforce.com/210/latest/en-us/sfdc/pdf/limits_limitations.pdf). HubSpot varies by subscription (V: https://knowledge.hubspot.com/data-management/track-crm-data-limits); "1,000 per object" is **U** (third-party only). Mailchimp 30.
- **Unused share.** "40% of custom fields are never populated" (S, Elements.cloud vendor claim); ~30% "weren't used by anyone" (S, r/revops anecdote via https://prospeo.io/s/crm-data-audit). Field Trip reports "Populated On (%)" (S: https://cloud4good.com/blog/using-field-trip-app-tp-clean-up-your-salesforce-instance/).
- **Thresholds.** **"Under 5% filled" was not found in any source (U).** Published triggers vary: under 10–20% archive candidates (S, governance blogs); under 60% (S: https://aaxonix.com/resources/crm-data-cleanup-before-migration/); under 70% (S, prospeo).
- **Migrate only what you use.** If hardly used, "it may not make sense to migrate data from those fields" (S: https://crmswitch.com/data-migration/8-crm-data-migration-best-practices/). "Document every custom field you create: field name, data type, module, and the business reason" (S, aaxonix).
- **Retiring.** Deprecate, hide, watch, then delete; never delete on the first pass (S: https://www.salesforceben.com/metadata-management-for-salesforce-admins-how-to-clean-up-fields-and-picklist-values/).
- **Duplicates and leftovers.** SiteStacker warns departmental entities can store the same fact twice, e.g. marital status (V). Undo leaves created fields behind in Planning Center (V) and Import2 (S: https://help.import2.com/en/articles/11535359-removing-fields-and-other-settings-created-by-import2).

**Implication.** Show fill rate, distinct-value count and samples per column so "leave out" is informed, not a fixed cutoff. Rehearsal-created fields must not persist.

## 3. Option lists (picklists)

- **Strict:** HubSpot, Virtuous, Bloomerang, Salesforce restricted picklists. HubSpot lets the person fix values in the wizard ("Edit errored values", "Don't import this value"; V: https://knowledge.hubspot.com/crm-setup/import-objects).
- **Lenient:** Salesforce unrestricted picklists accept any value; since Summer '23 inactive values are capped at 4,000 (V: https://milestone.tech/tips-and-tricks/limit-the-number-of-inactive-picklist-values/), and a secondary source blames faulty imports for "thousands, or even millions" of bad values (S). Planning Center auto-creates by default (V).
- **Migration tools.** MigrateMyCRM's "Update Target Options" lists missing source values for the person to add individually or in bulk; "Keep Original" stores an off-list value, discouraged for "critical system fields" (V: https://support.migratemycrm.com/how-to-update-the-values-of-dropdowns).
- **Practice.** "Picklist mismatches are the most common source of data loss during migration"; map each value explicitly, never blank silently (S, aaxonix). Build mapping tables by comparing lists (S: https://boomi.com/blog/salesforce-data-transformation-challenges/).

**Implication.** Each code column gets a distinct-value table with counts; per value the person maps to an existing option, explicitly adds it (bulk-selectable), or rejects. "Mr", "Mr." and "mr" can be grouped by deterministic normalisation (case, punctuation, whitespace) as a suggestion the person confirms.

## 4. Type inference and validation

- **Person confirms formats.** HubSpot: "confirm how the date values in your spreadsheet are formatted" and the country number format (V, import-objects); phones as "+[country code][number]"; multi-checkbox semicolon, no spaces (V, set-up-your-import-file).
- **Separators** differ: Planning Center pipe/semicolon/newline; Bloomerang pipe; LGL person chooses.
- **Types are sticky.** Bloomerang and Mailchimp cannot change a field's type after creation (V).
- **Pitfalls.** Excel "General" format strips leading zeros (S: https://tidbits.com/2023/03/16/dealing-with-leading-zeroes-in-spreadsheet-data/); the NPSP dry run misses lost ZIP zeros (V, cited in q06-r2); "03/04/2026 may mean March 4 or 3 April" (S: https://itime.day/articles/excel-csv-date-corruption); Mailchimp ZIP is "limited to five digits", unfit for Canadian postal codes (V: https://mailchimp.com/help/format-guidelines-for-your-import-file/); SiteStacker blank Boolean = No.

**Implication.** Asym proposes a type by deterministic rules over the whole column; the person confirms, seeing samples and parse-failure count. ZIP/postal/phone/ID-like columns default to text; ambiguous date order needs an explicit choice; the separator is explicit; blank stays distinct from "No".

## 5. "Legacy data" catch-all

- **Most tools drop unmapped columns:** Salesforce, HubSpot ("Don't import data in unmapped columns"), Planning Center ("Not Used"), Mailchimp (V); Flatfile by default (S: https://support.flatfile.com/en/articles/7873681-flatfile-s-data-importer).
- **Some keep them.** OneSchema passes them as an `$unmapped` JSON payload, "not validated" (S: https://docs.oneschema.co/docs/unmapped-columns). A practitioner pattern keeps a read-only "legacy"-prefixed field plus a Legacy ID (S, crmswitch).
- **Risks.** Legacy notes hide "email addresses, phone numbers or physical addresses" (S, Boomi). "Flag fields you intentionally excluded … so future teams … do not assume data was lost" (S: https://www.sikich.com/insight/salesforce-data-migration-best-practices/). Alternative: keep the old system read-only with a sunset date (S, aaxonix).

**Pros/cons.** Cheap preservation, but unreportable, unvalidated, a permanent junk drawer, and its unknown contents cannot be tiered by category, conflicting with Asym's tier rule.

**Implication.** Default: leave out, recording the exclusion and reason in the Switch record; retained source evidence covers recovery. Any legacy store must be per-column opt-in, with a category and tier (default most restrictive), read-only, outside search, export and Eve, with a review date.

## 6. Custom objects and collections

- **SiteStacker.** Multiple Items fields hold repeating entries. Once saved, the setting "cannot be changed at the CRM Entity level" (V: https://training.sitestacker.com/support/solutions/articles/151000118519-support-for-multi-crm-entities).
- **Virtuous.** Custom Collections are multi-instance sub-records, and new data "adds a new line". They are "more advanced and used by fewer nonprofits" (V, Virtuous docs).
- **HubSpot.** Custom objects need Enterprise. Its guidance asks first, "Can you use an existing CRM object and its properties … instead?" Custom objects "shouldn't replicate an existing CRM object" (Parent/Teacher example: use a Contact type property) and "shouldn't replace activities" (S: https://knowledge.hubspot.com/object-settings/create-custom-objects).
- **Practitioners.** Collapse a one-per-contact object into fields (S: https://www.ghlscaleup.com/blog/salesforce-to-gohighlevel-migration); bring a custom object only "if it's used" (S, Trailblazer).

**Implication.** No custom objects in a v1 Switch. Repeating entries: codes become multi-select, dated events become notes or interactions under existing categories, anything else is left out. One-per-person entities become ordinary fields.

## 7. Fields that are really core facts

- "Map to standard fields whenever possible. Create custom fields only when truly necessary" (S: https://www.fastslowmotion.com/field-mapping-data-hub/).
- SiteStacker basic fields include Title, Birthday, Marital Status, Wedding Anniversary and Household; everything else is a custom entity (V), so spouse, deceased or do-not-mail may arrive as "custom".
- No source covers deceased or do-not-mail specifically (U). As custom fields they are inert: suppression, receipting and household logic never see them.

**Implication.** Native targets first. A deterministic synonym list (deceased, do not mail, spouse, preferred name, pledge) warns when a new field's name matches and points to the native field.

## 8. UX patterns

- **Inline create:** HubSpot right panel; Planning Center type + tab, created at finalise; Mailchimp "Select or create new" with "Show unmatched columns only"; Zoho lists unmapped columns.
- **Bulk skip:** HubSpot "Don't import data in unmapped columns" (V).
- **Value fixing:** HubSpot "Edit errored values"; MigrateMyCRM bulk "Update Target Options" (V).
- **Preview:** Planning Center shows "new or updated profiles and households, any errors"; LGL record preview (V).
- **Not found (U):** fill rate at mapping time (Field Trip measures only afterwards); a review list of fields an import created.

## Common failure modes

1. Auto-created options fill with near-duplicates (Salesforce inactive-value problem).
2. Mismatched values blanked silently (HubSpot imports the record, field empty).
3. Wrong type, unchangeable later (Bloomerang, Mailchimp).
4. Undo leaves orphaned fields and options (Planning Center, Import2).
5. Core facts stored as inert custom fields.
6. Lost leading zeros; guessed day/month order.
7. SiteStacker blank Booleans arrive as a fabricated "No".
8. Untiered legacy blobs quietly become permanent.
9. Low-use fields migrated "just in case".

## Simplest robust defaults

1. Every column gets an explicit decision: native field, existing custom field, new field, or leave out. 0%-filled columns are pre-grouped for one confirmed bulk "leave out".
2. New field definitions are drafts in the Switch plan, created only at commit, discarded with a rehearsal.
3. Person confirms type from samples, fill rate and parse failures; identifier-like columns default to text.
4. Options come from a distinct-value table: mapped, explicitly added, or rejected. Nothing auto-created.
5. Category/tier chosen when a field is created.
6. Post-Switch review list of created fields with fill rates.
7. Native targets first, with the synonym warning.

## What not to build

- Automatic option creation, even as a default-on toggle.
- AI or fuzzy matching of columns or values; deterministic normalisation grouping is the limit.
- A catch-all blob of every unmapped column.
- Custom objects or collections in v1.
- Type changes after data exists (create a new field, retire the old).
- A fixed fill-rate cutoff that drops columns automatically.
