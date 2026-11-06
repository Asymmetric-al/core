# Q16 r3: Repo verification of Option B (custom fields in a Switch)

Base `develop` `629cb71dc`, read 2026-11-03. Extends `q16-r1` (abbreviations reused: **P11**, **DL**, **OC**). Issues #645–#664 were read with `gh issue view --json`; `#N:L` uses r1's line convention (body text line). Verdicts: **confirms**, **corrects** or **new** relative to r1.

## 1. Phase 11 definition rules

- **Lifecycle (confirms).** States are `ACTIVE|ARCHIVED|PENDING_PURGE|TOMBSTONE` (#661:34-42). There is no draft or proposed state, so Option B's drafts can only live in the Phase 30 plan.
- **Who creates (corrects: contradiction, not just a gap).**
  - No capability for _creating_ a definition is named. Only classification has one, `crm.customfields.classify`, "not in `BASE_STAFF_CAPABILITIES`" (#646:31).
  - A non-default policy at birth, "lowering the tier", or a `storage_type` change is a widening. Widening needs "**Maker-checker** (maker ≠ checker)", with "No 'born-wide' backdoor" (#649:80-83, P11:169).
  - This collides with Q5's "No forced second person" (DL:191).
- **Command shape (new).** `value_key` is "derived server-side, never accepted from the client" (#652:132) as "slug of label + collision-disambiguation" (#652:40). It is unique per tenant and target, including archived fields (#647:73). No idempotency key or batch form is specified.
- **Limits (confirms, adds).** There are no reserved names, and no lint warns that a custom field looks like a built-in field (verified absence across #645–#664). Option labels are capped at "≤255 single / ≤40 multi-select" and `value_key` at about 80 (P11:189).
- **Options (new).**
  - An archived option is "no longer selectable for _new_ values" (#654:32).
  - Whether an import may write a historical value to an archived option is unstated.
  - Options cannot be created directly in the archived state.
- **Open mode (confirms).** "An unknown import value **auto-creates an ACTIVE-but-flagged-for-review option**" (#654:44).
- **Defaults and required fields (corrects r1).**
  - A default is written "if the field is present-and-blank on that surface" (#655:49). "Present" could mean present in the payload or present on the surface; the text does not say which.
  - If it means present on the surface, every Party created through the import path gets defaults (for example `today`) on fields it never mapped.
  - A universal-required field "hard-rejects on CREATE (or forces an explicit import-time override)" (#655:59). An existing tenant field could therefore block Switch creates.
- **Yes/no fields (new).** "Checkbox default is tri-state (an explicit `false` default is a real value distinct from absent)" (#655:55). Q16's "No → no or unknown" choice is natively expressible as `false` or an absent key.
- **Type set and type changes (confirms).** P11 supports 16 types (P11:147), including currency, and has no person-reference type. A type change is a widening and needs maker-checker (P11:169).
- **Value history (new).** A value change is audited as a "**monotonic version counter** … **zero plaintext**" (#662:35), with no before/after values. Provenance `import` is stored alongside the value (#655:68), and the write path emits `changeSource: "import"` (#660:159).
- **Search (confirms).** JSONB, one GIN index, about 20–25 promoted fields per record kind (P11:131, :195).
- **Retirement (new).**
  - An archived field is "hidden from all pickers/columns/**import-targets**" (#661:41).
  - "Active/scheduled import" is a hard stop for archive and delete (#661:54).
  - `import_mapping` is an artifact type in the dependency map (#661:98).
- **Is a new field importable by default? (corrects r1: contradictory, not unstated).**
  - The import write door is one of the 26 doors (#649:41).
  - "Mission-Control-only across all 26 doors for every tier" (#649:214) applies to every default-born field.
  - But #660:44 says `importable` is "type-derived … with a subtract-only override from the sensitivity category".
  - Gate 2 lists the surfaces a minimum field is absent from, and import is not among them (#664:34).
  - The outcome for care- and security-tier fields is unknown.

## 2. Import Template Descriptor (#660) and field catalog (#650)

- **What it is.** "A pure projection of `getFieldCatalog`: `columnHeader` from `value_key` … restricted-for-import ⇒ the field is ABSENT" (#660:25). It is built per viewer: `buildImportTemplate(viewer, recordType)` (#660:119).
- **New fields appear automatically.** Every downstream artifact is "**generated** from `getFieldCatalog`, never hand-maintained" (P11:179). A newly created importable field therefore enters templates automatically.
- **Versioning.** Changes are tracked by `type_version`, and saved artifacts fail closed when it changes (P11:183). The catalog is "invalidated on field/policy change" (P11:173).
- **Implication for B.** Drafts cannot appear in the descriptor. Staged values must be keyed by draft id and re-pointed to `field_key` after creation.

## 3. #663 conflict (confirms D1, sharpens it)

- **#663 says fields.**
  - "Calls `assertQuota` per auto-created **option/field**" (#663:63, :249).
  - "Import auto-create of an option/field beyond the ceiling is a per-row rejection … **the rest of the import proceeds**" (#663:265).
- **#663 contradicts itself.** Its own test (#663:292) and its source, E2/D7 (P11:189), cover options only.
- **Second conflict.** Per-row partial success after a Switch plan is accepted is wrong. Quotas, counting drafts, must be checked when the plan is made.

## 4. Currency fields and facts other owners hold (confirms; no general rule)

- **Currency is allowed.** It is one of the 16 types (P11:147).
- **Owner bars are narrow.**
  - "Money-transaction records carry **no custom fields**" (`phase-13…:245`).
  - "Accounting and money records must not gain arbitrary EAV fields" (`phase-20-cross-phase-congruency-audit.md:1047`).
  - "Custom fields cannot own message facts" (`phase-17-cross-prd-congruence-2026-07-19.md:139`).
  - "asks are NEVER edges or custom fields" (`phase-09…:502`).
- **Core facts (new).** "deceased/inactive are the lifecycle-status model" and "Imported/legacy provenance is a Phase 30 concern carried by `crm_record_links`, never a party_kind or status" (`phase-09…:847-848`). Spouse comes "from edges" (:435).
- **No general rule exists.** No text bars a Party-level "Monthly pledge" currency field, so B's core-fact routing is a Phase 30 rule only.
- **Gift-level columns (new).** Gifts and pledges are not targets (P11:259), so a source custom column on a transaction has no Phase 11 home.

## 5. Custom collections

- **What they are.** Collections exist for the Party only. Each item has an `item_external_id`, described as "stable external key for import upsert (Phase 30 contract)" (#657:57). Templates are "flat-with-parent-key" (#660:25). Record-reference fields are rejected (P11:137).
- **SiteStacker fit.** A "Multi" entity fits a collection; a Linked Entity fits a relationship.
- **Conflict (new).** Q3 ratified "custom fields **and collections**" as a template family (DL:101). B's "custom entities not in v1" narrows a ratified clause unless it means only "no new collection definitions from mapping".

## 6. Practice copies (Q6)

- **What Q6 says.** A copy holds "the tenant's allowlisted configuration … keeping production IDs" (DL:259), is "never promoted" (DL:262), is committed "through the same owner import commands" (DL:247), and go/no-go needs the "current mapping version" (DL:250).
- **Consequence.**
  - Definitions created in a copy die with it; the real run recreates them, and the server-derived `value_key` can differ if production gained a same-label field meanwhile (#652:40).
  - Drafts must be plan data, part of the mapping version, and referenced by draft id, including in remembered mappings (Q11).
- **Practice-run checks.** Validating values against drafts without writing them needs a dry-run against a proposed definition. The current validator loads an existing catalog row (#650). This extends O28 (DL:981) beyond the kit.

## 7. Everyday imports (Q12)

- **Confirmed.** People imports carry "existing custom fields only (creating new fields stays with F10)" (DL:568; `q12-adversarial-review.md:42-43`). B as worded is Switch-only, so Q12 stands.
- **Side effect.** Q11 maps values only to existing options and rejects unknown ones (DL:534-535), so Phase 11's open mode never fires from any Phase 30 import, only from the API.

## 8. Missionary and donor visibility and Phase 3 field policy

- **Phase 25 and Phase 28 (confirms r1).** Neither PRD projects custom fields (grep). A default-born field is absent from both apps (#652:74-77).
- **Phase 3 cannot hold custom-field policies today (new; code).**
  - The reader loads only `tenant_id IS NULL` rows (`packages/api/src/field-policies/reader.ts:76`, :85), and its keys must match `/^[a-z_][a-z0-9_]*$/` (:50), which rejects UUID keys.
  - The column is "Whole column only" (`20261005050728_field_policy_foundation.sql:20`), writes are super-admin only (:37-41), and there is no `import` surface (`taxonomy.ts:12-18`).
  - So a third Phase 3 amendment is needed beyond P11 H3's two.
- **Default mismatch (new).** Phase 3's static defaults give `financial` read-only donor and missionary visibility (`taxonomy.ts:109-113`) and `contact` donor and missionary `manage` (:96-100). P11 C3 hard-blocks financial→external (P11:161). The tier chosen in B's batch must drive only Phase 11's `defaultAxesFor`.

## 9. Current code

- **No custom-field code (confirms).** `git grep` finds no custom-field identifiers outside docs.
- **Prototype lookalikes (new).** The prototype `donors` table has `spouse`, `anniversary`, `birthday`, `has_active_pledge` and `tags` (`20250101000000_init_schema.sql:83-95`). B's "built-in fields" must mean the unbuilt Phase 9 Party, edge and lifecycle homes, not these columns.
- **No reusable option store.** The only label table is `support_labels` (Support Hub).

## Conflicts with Option B as worded

1. **"Through Phase 11's own command, confirmed in a batch".** No batch command exists. Create has no idempotency, `value_key` is server-derived, and a quota breach rejects per row. A batch means N independent atomic births, so B needs an owner batch or idempotent create.
2. **One person versus maker-checker.** Any tier below `internal`, any extra visibility, or a later type fix is a widening needing a second person (#649:80-83). That conflicts with Q5 (DL:191). The batch can offer only "Our team only" or stricter.
3. **The visibility question is missing from B's wording.** Sensitivity is "required/non-nullable" at birth (P11:167). Q14's care rule (DL:738-741) has no Phase 11 equivalent of Sealed.
4. **"Never receive a default".** C15 says "defaults apply only at create" (DL:876), and #655:49 seeds on create. B needs a Phase 11 amendment, plus the universal-required carve-out.
5. **"Never automatically, even on open fields".** This makes Phase 11's import-time open mode inert for imports. Phase 11 text must acknowledge it.
6. **"Custom entities not in v1" versus Q3 clause 3 (DL:101).** Either amend Q3 or limit B to "no new collection definitions".
7. **"Become real at commit" versus Q1 clause 10's invisibility (DL:52).** Definitions are visible configuration, persist after an abort, consume quota, and cannot be archived while an "active/scheduled import" references them (#661:54).
8. **Importability of the created fields is unresolved.** If care or security tiers are non-importable, a field created for a column may refuse its values (#649:214 versus #660:44).
9. **Historical options.** Values pointing at options the ministry retired have no import path to archived options (#654:32).
10. **Gift-level custom columns** cannot become fields (P13:245, P11:259). B must route them to Q13 or a Visible exclusion.

## Owner requirement candidates (requests; not numbered)

- **Phase 11 R1. Batch definition create.** Proposed definitions with options, each born atomically and idempotent per (Switch run, draft id). Quota and duplicate-name preflight count the drafts. It returns the draft → `field_key`/`value_key` mapping per item.
- **Phase 11 R2. Validate-only path.** Validate a proposed definition plus sample values without writing, for practice runs (extends O28).
- **Phase 11 R3. Importable defaults.** State the importable default per tier. Confirm a Switch may write into fields born at `internal`, `financial`, `care` or `security` without a widening.
- **Phase 11 R4. Capabilities.** Name the capabilities for creating a definition and for adding an option. Confirm the default tier needs no `classify:manage`.
- **Phase 11 R5. Defaults and required fields on import.** No default is materialized for import-provenance creates, including Party creation. Define "present-and-blank". Universal-required only warns on Switch adoption.
- **Phase 11 R6. Open mode.** It applies only when a caller passes unknown values. Phase 30 imports never do.
- **Phase 11 R7. Archived options.** Import writes may reference archived options, and an option may be created directly as archived (mirrors Q13 retired designations).
- **Phase 11 R8. Provenance in audit.**
  - `definition.created` and `option.added` carry Switch and run provenance, which feeds B's post-Switch list.
  - Imported values display "Imported from {system}".
- **Phase 34 R9. No workflow triggers from imports.** A `field-changed` event with `changeSource:"import"` never triggers workflows (C5 DL:866; DL:597).
- **Phase 3 R10. Third amendment.** Tenant-scoped rows with UUID keys, an `import` surface and a governed non-super-admin writer; reconcile the `financial`/`contact` defaults with P11 C3.
- **Phase 11 R11. Fix #663.** Replace "option/field" with "option", and say whether a Switch plan or remembered mapping counts as a "scheduled import" hard stop.
- **Phase 30 obligation.** Register plans and remembered mappings as `import_mapping` references; preflight quotas at plan time.
