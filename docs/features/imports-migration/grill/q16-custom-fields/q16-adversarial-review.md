# Q16 adversarial review: custom fields and option lists in a Switch

Founder answer (2026-11-03): **"B, but think of edge cases. also research modern best pratices and apply where it makes sense."** The founder also asked for a full ruthless review. Decision as asked: `q16-decision-as-asked.md`.

## Evidence

**Research files:**

- `research/q16-r1-repo-custom-fields.md`: Phase 11 lifecycle, open options, defaults, visibility, SiteStacker definitions, shadow fields.
- `research/q16-r2-external-custom-fields.md`: vendor create-first versus create-during-import, option lists, fill rates, catch-alls.
- `research/q16-r3-repo-verification.md`: Phase 11 issues #645–#664, collections, Practice copies, field policy.
- `research/q16-r4-external-edge-cases.md`: a 26-row edge-case table, governance, sensitive identifiers, UX and sprawl.

**Re-verified directly on 2026-11-03:**

- **Owner text.** "Phase 30 never defines a target domain's schema or bypasses its invariants" (`owner-constraints.md:389-392`).
- **Phase 11 option identity** (`phase-11:189`). Options carry an immutable `id`, a stable `value_key` ("the import/export/API anchor") and an editable `label`. Their lifecycle runs active → archived (not selectable for new values; existing values still resolve).
- **Q3 template families** include "custom fields and collections" (`decision-log.md:101`).
- **Q5.** "No forced second person: one person may hold every capability" (`:191`).
- **#649.** The second-approver ceremony applies only to `contact` → external exposure and public projection inclusion (`#649:34`, `:70`, `:242`). It does not apply to staff-only fields.
- **#655.** Defaults "materialize on create" and are "never retroactive". It warns that a default resolved on read "fabricates history".

Research, not legal advice.

**Disposition: accept with required amendments.** B is the right model: a person creates missing fields and options from the mapping screen, confirmed, through Phase 11's own command. It matches the creating-while-mapping vendors' UX without their automatic option growth. It also follows the Q13 pattern and respects "Phase 30 never defines schema", because the owner's command does the creating at a person's request. Nine parts need fixing:

1. Phase 11 has no draft state or batch command, so drafts live in the Phase 30 plan and Phase 11 needs an idempotent all-or-none batch create.
2. "Custom entities not in v1" narrowed Q3. Collections stay importable into collections the ministry created first.
3. Visibility is missing from B. The batch offers only "Our team only" or stricter, so no second approver is ever triggered.
4. "No defaults" needs a Phase 11 exception for imports, and fields created by a Switch get no default.
5. Imports must be able to set archived options for history, and options created from mapping may start archived.
6. Sensitive identifiers (SSN or SIN, card, bank, passport numbers) need a refusal rule.
7. Calculated values (lifetime giving, age) are steered away like core facts.
8. One source column maps to one target, with no merging and no splitting.
9. Blank tokens are declared per column, not only for SiteStacker yes/no.

The corrected text is in §3.

---

## 1. Category review

### 1.1 Problem validity, necessity and alternatives: material concern, yes (narrows the answer)

**The problem is real.** Ministries' custom fields hold years of working knowledge, and Q1 makes Asym the only writer after the boundary. Without a path for them, a Switch either loses that knowledge or forces the "do it blind in settings" chore of A.

**Correct level.** Phase 30 hosts the moment of decision because the data and samples are there. Phase 11 owns the definition and its rules (C1, owner text).

**Strongest alternative: A** (create first in settings). A has the cleanest ownership, but the person defines types blind, without samples or fit rates, and that is how wrong types (ZIP codes as numbers) arise. B with Phase 11's command keeps ownership and gives better data.

**Rejected again:** C (automatic). It breaks owner text and Q11.

**Too vague in B:**

- "Drafts" did not say where drafts live.
- Visibility was not mentioned.
- "Custom entities" overlaps with Q3's collections.
- The refusal of sensitive identifiers was missing.

**Unnecessarily frozen:** nothing. UI wording is guidance; the rules are the requirement.

### 1.2 Brittleness: material concern, yes

| Fragile assumption                                          | What breaks                                              | Fix                                                                                                                                                         |
| ----------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 11 has drafts                                         | It has none (#661)                                       | Drafts live in the Phase 30 plan, keyed by draft ID. Phase 11 creates them at commit.                                                                       |
| Machine keys match between the Practice copy and production | Server-generated keys differ (r3)                        | Drafts are keyed by draft ID. Remembered mappings (Q11) bind to the draft ID until the field exists, then to the definition ID.                             |
| Values map by label                                         | Label renames break re-runs                              | Value maps store the option ID or `value_key`, never the label (`phase-11:189`)                                                                             |
| Blank looks blank                                           | "N/A", "?", "-", and SiteStacker's "No" for unset yes/no | Blank tokens are declared per column, with suggested tokens shown                                                                                           |
| One header means one thing across exports                   | Labels renamed between the practice and final export     | A changed header blocks the plan (Q11) until it is re-confirmed                                                                                             |
| Values fit the chosen type                                  | Mixed types ("N/A", dates, text)                         | A fit rate and the non-fitting samples are shown before creation. Non-fitting values become Waiting rows, never silently dropped (Airtable drops them, r4). |

### 1.3 Technical debt: material concern, yes

- **A Phase 30 field store or "legacy data" blob.** Refused: it is a shadow schema that no tier can protect.
- **Duplicated validation.** Phase 30 uses Phase 11's no-write check mode (O28 pattern), never its own type rules.
- **Labels as identity in mappings.** Debt; replaced by IDs and `value_key`.
- **Conflicting Phase 11 issue text** (#663 says "option/field"; #649 and #660 disagree on whether a new field accepts imports by default). Recorded as discrepancies for the owner to settle before build.

### 1.4 Edge cases: material concern, yes

| #   | Case                                                                            | Handling                                                                                                                                                                                                                                                                                              |
| --- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | Two source columns are the same field ("Church", "Home Church")                 | One column maps to one target. The second column is mapped to its own field, or left out. Merging is a reviewed transformation in the file (Q3).                                                                                                                                                      |
| F2  | One column should become two fields ("City, State")                             | No splitting in mapping. Split in the file (Q3), or keep it as one text field.                                                                                                                                                                                                                        |
| F3  | Mixed types in one column                                                       | The fit rate and non-fitting samples are shown. Choose text, or keep the type and let non-fitting rows wait.                                                                                                                                                                                          |
| F4  | Multi-select delimiters inside values ("Smith, John")                           | The delimiter is chosen per column, previewed, and checked against the existing options. Ambiguous values wait.                                                                                                                                                                                       |
| F5  | Case, space and punctuation variants ("Yes", "yes", "Y", "TRUE")                | Grouped in the value-mapping table (Q11) for one decision per group. Never merged silently.                                                                                                                                                                                                           |
| F6  | Thousands of distinct values in a would-be dropdown                             | Above 200 distinct values, the screen recommends text (the person decides). The bulk "add these N values" works only after the grouped list is reviewed.                                                                                                                                              |
| F7  | Dependent or hierarchical dropdowns                                             | Not modelled in v1. Each level maps to its own field, or the column is left out.                                                                                                                                                                                                                      |
| F8  | Numeric codes whose meaning is in a lookup table                                | Mapped through the value-mapping table to labelled options. Codes are never stored raw as options without labels.                                                                                                                                                                                     |
| F9  | Partial dates ("1998", "May 2003") or mixed formats                             | Never padded to 1 January. They go to a text field, or wait under a date field (Library of Congress practice, r4).                                                                                                                                                                                    |
| F10 | Three-state booleans; SiteStacker "No" for unset                                | Blank tokens are declared per column. A "No" that may mean unset is treated as blank when the ministry says so.                                                                                                                                                                                       |
| F11 | Household-level versus person-level fields                                      | Mapped explicitly to household or person. Never copied to members (Q10).                                                                                                                                                                                                                              |
| F12 | Sensitive identifiers (SSN or SIN, card, CVV, bank account, passport)           | Headers naming them are refused, with no override. Values that look like card numbers (Luhn-valid, 13–19 digits) or SSNs block the column for review. A person may override with a logged reason when the pattern is a false match, such as donor IDs. This is validation, not tiering (Q14 is kept). |
| F13 | Calculated source fields (lifetime giving, age, last gift date)                 | Steered away: "Asym calculates this from history." Creating one needs explicit confirmation and a reason.                                                                                                                                                                                             |
| F14 | URL or file-path fields                                                         | URL type. File paths are text. Files themselves follow Q14.                                                                                                                                                                                                                                           |
| F15 | Fields that reference other people ("Referred by")                              | Not a custom field in v1. Relationships follow Q10/Phase 9. Otherwise text, with a note.                                                                                                                                                                                                              |
| F16 | Duplicate names after normalisation; reserved names                             | The name is checked against existing fields, reserved names and the other drafts. A clash blocks with "map to existing or rename".                                                                                                                                                                    |
| F17 | Very long or non-English labels                                                 | Kept as labels. The key is generated by Phase 11. Label length follows Phase 11's limit, with a truncation preview.                                                                                                                                                                                   |
| F18 | A field created in a practice run and deleted or renamed before the real run    | Drafts carry by draft ID. A deleted draft is gone from the plan. A rename updates the draft.                                                                                                                                                                                                          |
| F19 | Two staff create the same field concurrently                                    | Batch create is idempotent per draft ID and name-unique per record kind. The second attempt fails cleanly and offers to map to the field.                                                                                                                                                             |
| F20 | The field limit is reached mid-batch                                            | Capacity is checked before commit, and the batch is all-or-none. The plan shows "N of M fields remaining".                                                                                                                                                                                            |
| F21 | An option is renamed after import                                               | Values hold the option ID, so the label changes everywhere (`phase-11:189`)                                                                                                                                                                                                                           |
| F22 | Historical values for options no longer used                                    | Imports may set archived options on imported records. A person can add an option as archived from mapping (the Q13 pattern). Archived options are never selectable for new entry.                                                                                                                     |
| F23 | A column holds care or health text                                              | Not a custom field. Care goes to Phase 38 or is left behind (Q14). Other free text defaults to Restricted.                                                                                                                                                                                            |
| F24 | A column is a core fact (spouse, deceased, do-not-mail, pledge, preferred name) | Steered to the owner's built-in field. A lookalike needs explicit confirmation and a reason. Money facts never become custom fields on gifts (P13:245).                                                                                                                                               |
| F25 | Formula-like values (cells starting with "=")                                   | Stored as text. Spreadsheet downloads are text-typed (Q15).                                                                                                                                                                                                                                           |
| F26 | The Switch is aborted after fields were created                                 | Definitions persist as tenant settings. The post-Switch list marks them "created by an aborted Switch, unused" with a one-step retire. A later attempt reuses them.                                                                                                                                   |
| F27 | Repeating linked records (SiteStacker "Multiple Items", linked entities)        | Imported into a Phase 11 collection the ministry created first in settings (Q3 family). Collections are not created from the mapping screen in v1. With no collection, it is a visible exclusion.                                                                                                     |
| F28 | Gift-level custom columns                                                       | No Phase 11 home on gifts (P13:245). Left out visibly, or mapped to Phase 13 fields where they exist (Q13).                                                                                                                                                                                           |
| F29 | Everyday imports meet a new column                                              | Unchanged: existing fields only (Q12). Creating fields from mapping is Switch-only.                                                                                                                                                                                                                   |

### 1.5 Footguns: material concern, yes

| Footgun                                                         | Harm                           | Prevention                                                                                                        |
| --------------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| A bulk-created dropdown with near-duplicate options             | Option sprawl, broken reports  | Grouping review before bulk add (F5–F6)                                                                           |
| Creating a field that shadows a core fact                       | Two sources of truth           | Steering, plus confirmation with a reason (F24)                                                                   |
| A default fills imported records                                | Fabricated history (#655)      | Imports never apply defaults, and Switch-created fields have none                                                 |
| Exposing a new field to missionaries or donors during the batch | Privacy exposure               | The batch offers only "Our team only" or Restricted. Widening happens later in Phase 11's screen under its rules. |
| Importing SSNs or card numbers                                  | Breach and PCI exposure        | Refusal rule (F12)                                                                                                |
| Mass-retiring fields after an abort                             | Losing fields in use elsewhere | Retire is offered only for fields with zero values                                                                |

### 1.6 Tenant safety: material concern, no (requirement restated)

Checked:

- Definitions, options, drafts and Remembered mappings are per tenant (Q11).
- Field names are unique per tenant and record kind.
- The Common-header list is Asym-authored and never learned from ministries (Q11).
- No cross-tenant field catalog exists.

Requirement: Phase 11's tenant-scoped definitions and Phase 3's tenant-scoped custom-field policy rows (O77). Today the reader loads only rows with no tenant (`reader.ts:76`).

### 1.7 Database, RLS and authorization safety: material concern, yes

| Concern                   | Requirement                                                                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Creation                  | Only Phase 11's command, invoked by a person with Phase 11's field-creation capability. Actor and tenant come from server context. Idempotent on (tenant, draft ID). All-or-none per Switch commit. |
| Visibility at creation    | Restricted to "Our team only" (Staff) or Restricted. Missionary, donor, export and public surfaces stay off until Phase 11's normal screen widens them.                                             |
| Defaults                  | An import-origin create never materialises defaults. Switch-created fields have no default value.                                                                                                   |
| Options                   | Values reference the option ID. Archived options are allowed only for import-origin writes. Open mode never applies to imports.                                                                     |
| Field policy              | Tenant-scoped rows for custom fields (Phase 3), so the projection resolver governs them (O67, O77)                                                                                                  |
| Type changes              | After commit, only through Phase 11's rules. Its type-fix ceremony stays Phase 11's.                                                                                                                |
| Forbidden-state transform | No update can widen a Switch-created field's visibility without Phase 11's capability, and no update can attach values to another tenant's definition                                               |

### 1.8 Overengineering: material concern, yes (resolved)

**Refused:**

- a legacy-data blob;
- creating collections from the mapping screen;
- dependent dropdowns;
- column splitting or merging;
- an automatic fill-rate cutoff;
- AI or fuzzy option matching;
- type inference without confirmation;
- per-field approval workflows.

**Kept:**

- one batch-create command;
- the draft list in the plan;
- one refusal rule;
- grouping in the existing value-mapping table.

### 1.9 UX/UI and user friction: material concern, yes

**Unmatched-columns panel** (after Q11 matching):

- Each column shows its header, fill rate ("312 of 4,210 filled"), five sample values and distinct-value count, plus a suggested action:
  - Map to built-in;
  - Map to existing field;
  - Create field;
  - Leave out.
- "Leave out all empty columns" works in one step.
- Steering banners appear for core facts and calculated values.

**Create field (inline sheet, or a review table for many at once):**

- **Name:** prefilled from the header and editable.
- **Type:** text is the safe default. Phone numbers, ZIP codes and IDs are locked to text. Each type option shows its fit rate.
- **Tier:** Staff, or Restricted (long text defaults to Restricted).
- **Optional help text.**
- **Section:** an optional Phase 11 layout group.

**Options:** the grouped value list (Q11). "Add N values" appears after review, and "Add as archived" covers historical-only values.

**Before commit, a summary:** "This Switch will create 23 fields and 147 options (14 archived). You have 77 fields left."

**After the Switch:** the post-Switch list of created fields and options, with fill rates, links to settings, and "Retire unused" for fields with no values.

**Language:**

- Plain, ministry-facing words ("field", "choice", "leave out").
- Never "schema", "property" or "picklist" in ministry-facing text.

**Accessibility:** the review table is keyboard-operable, fit rates are given as text, and errors are linked to their rows.

**Mobile:** desktop-first, which is acceptable for a one-off Switch.

### 1.10 Source of truth, ownership and domain invariants: material concern, yes

**Ownership:**

| What                                                               | Owner                                 |
| ------------------------------------------------------------------ | ------------------------------------- |
| Field and option definitions                                       | Phase 11                              |
| Visibility and policy                                              | Phase 11 with Phase 3                 |
| Drafts, mapping, fill-rate evidence and the created-by-Switch list | Phase 30                              |
| Core facts                                                         | Their owners (Phases 4, 9, 13, 16, 3) |

**Invariants:**

1. **G1:** No field or option exists unless a person confirmed it, either in the Switch plan or in Phase 11 settings.
2. **G2:** Every imported custom value references a definition and, for choices, an option ID. Values are never stored as free labels.
3. **G3:** No imported record carries a default value it did not have in the source.
4. **G4:** Switch-created fields start as "Our team only" or Restricted.
5. **G5:** One source column maps to at most one target.
6. **G6:** The draft set commits all or none.
7. **G7:** Refused identifier columns are never stored in any target.
8. **G8:** Sealed content never becomes a custom field.

G2, G5 and G6 are enforced by the owner command and plan. G3 and G4 are enforced by Phase 11 rules. G7 is enforced by the plan and the Q15 rewrite.

### 1.11 Hidden coupling: material concern, yes

- **Phase 11 needs several changes:** batch create, an import default exception, archived options for imports, open mode off for imports, and a settled import-acceptance default.
- **Phase 3** needs tenant-scoped custom-field policy rows.
- **Phase 34 field-change triggers must not fire on import** (extends O1 and O33).
- **Q11** value maps move to IDs.
- **Q15 rewrite.** It is reused to strip refused columns from held files.

### 1.12 Failure modes: material concern, yes

| Failure                                                           | Required behaviour                                                                               |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Batch create fails part-way                                       | All-or-none: no definition exists, and the plan reports which draft failed and why               |
| Definitions are created, then the value commit fails              | Definitions remain, with no values. The resumed commit reuses them through draft-ID idempotency. |
| The limit is exceeded at commit, because of a concurrent creation | Re-check at commit. The plan blocks with remaining capacity and nothing is created.              |
| A name clash at commit                                            | The plan blocks with "map to existing or rename"                                                 |

### 1.13 Lifecycle, temporal correctness, concurrency and idempotency: material concern, yes

**Draft lifecycle:**

- Proposed (in the plan), then confirmed by the person.
- At practice commit, it is created in the Practice copy only.
- At the real commit, it is created in production.
- A draft can be discarded at any time before the real commit.

**Definition lifecycle:** follows Phase 11 (active, then retired).

**Idempotency:** (tenant, draft ID) for definitions; (definition, `value_key`) for options.

**Concurrency:**

- The heavy-job lock (Q15) covers commits.
- Settings edits during a Switch are re-checked at commit.

**Timing:** Phase 11's "never retroactive" holds. Fields created now don't change records created before them, except the imported values themselves.

### 1.14 Data integrity risks: material concern, yes

| Risk                               | Prevention            |
| ---------------------------------- | --------------------- |
| Silent drops of non-fitting values | Waiting rows          |
| Option sprawl                      | Grouping review       |
| Fabricated defaults                | G3                    |
| Shadow fields                      | Steering and a reason |
| Label drift                        | IDs                   |
| Merged or split columns            | G5                    |
| Wrong blanks                       | Declared tokens       |

### 1.15 Security and privacy risks: material concern, yes

- **Sensitive identifiers.** Refused (F12): HubSpot's sensitive-data feature excludes SSNs and full card numbers, PCI forbids keeping card security codes, the IRS doesn't need an SSN on acknowledgments, and the Canadian privacy commissioner warns against collecting SINs (r4).
- **Refused columns in held files.** Stripped by the Q15 rewrite within 14 days of sign-off, with the original digest kept.
- **Visibility.** Defaults are staff-only. Restricted applies to long text. Sealed is never a custom field.
- **Logs.** No values in logs.
- **Overrides.** Pattern overrides are audited.

### 1.16 Scalability and performance: material concern, no (requirement)

Checked:

- Distinct-value counts and fit rates are computed during staging, which is a streaming pass already done for Q11.
- Batch creation is bounded by Phase 11 limits.
- Custom values follow Phase 11 storage (JSONB per its design).

Requirement: the fit-rate and distinct-value pass adds no second full read of the file.

### 1.17 Operational burden: material concern, yes (contained)

**For the ministry:**

- one decision per unmatched column;
- bulk actions for empty columns and options;
- Remembered mappings carry decisions into later runs.

**For Asym:** none. There is no manual field creation by Asym staff, and Q5 help access can advise but never create.

### 1.18 Observability and auditability gaps: material concern, yes

**Business evidence:**

- the post-Switch created list, with draft-to-definition links;
- per-column decisions and fit rates in run evidence, as counts with no values;
- override reasons for pattern blocks;
- steering confirmations with reasons.

**Security audit:**

- field creations attributed to the person;
- pattern overrides.

### 1.19 Dependency and integration risks: material concern, yes

- **Phase 11 is unbuilt.** Custom data waits for Phase 11, as a Q1 clause 1(b) family. It is importable later from the held export or the ministry's digest-matched copy (Q15).
- **The SiteStacker definition export format is undocumented.** It is not relied on: definitions are proposed from the values export's headers and samples. A definitions export, when present, only pre-fills names and types.

### 1.20 Migration, rollout and upgrade risks: material concern, yes

- **Activation.** Activated per tenant when Phase 11's batch command and policy rows exist.
- **Defaults.** Later Phase 11 changes to defaults must keep import-origin records default-free (a test).
- **Rollback.** Retiring unused Switch-created fields is supported. Fields with values are retired only through Phase 11's normal rules.

### 1.21 Testability, traceability and proof: material concern, yes

**Positive tests:**

- Drafts create all-or-none at commit.
- Practice creates only in the Practice copy.
- Remembered mappings carry drafts by draft ID.

**Negative tests:**

- No automatic field or option creation, including on open fields.
- No defaults are applied to imported records.
- Refused headers can't be mapped.
- Duplicate names are blocked.

**Boundary tests:**

- the 200-distinct-value threshold;
- the field limit plus one;
- a partial date;
- three-state booleans.

**Authorization tests:**

- The batch can't widen visibility.
- A person without the Phase 11 capability can't create fields.

**Concurrency tests:**

- two creations of the same field;
- a settings edit during a Switch.

**Accessibility:** the review table.

**Traceability:** new terms Field draft, Created-by-Switch list and Identifier refusal. Q11's value maps now use option IDs.

### 1.22 Other development hazards: material concern, yes

- **Conflicting Phase 11 issue text** (#663, #649 versus #660, #654, #655). Recorded as D57–D61 for the owner to settle before build, or engineers will implement whichever issue they read first.
- **Expectation.** "Create field" may be read as "Asym makes my old system's layout". Asym recreates fields and choices, not old screens. Layout grouping is optional.

---

## 2. Disposition

**Accept with required amendments.** The nine fixes are listed under Evidence above.

## 3. Corrected decision (to record)

**Q16 — Custom fields and option lists in a Switch. Option B, amended.** (★ = changed from what was asked.)

1. **A person decides every unmatched column**, with its fill rate, sample values and distinct-value count shown:
   - map it to a built-in field;
   - map it to an existing field;
   - create a field;
   - leave it out.

   Empty columns can be left out in one confirmed step. There is no automatic cutoff.

2. **Create field from the mapping screen**, singly or in a confirmed review table.
   - **Name:** prefilled and editable.
   - **Type:** chosen after seeing how many values fit. Text is the safe default, and phone numbers, ZIP codes and IDs stay text.
   - ★ **Tier:** Staff, or Restricted. Long text defaults to Restricted.
   - **Optional:** help text and a section.
   - ★ **Visibility:** the batch offers only "Our team only" or Restricted. Missionary, donor, export and public visibility are widened later in Phase 11's own settings under its rules.
   - **Sealed content** (care or personnel) is never a custom field (Q14).
3. ★ **Drafts live in the Switch plan.**
   - **Identity:** each draft is keyed by its own ID, so it carries across practice runs and Remembered mappings.
   - **Practice copies:** a practice run creates them only in its Practice copy.
   - **The real commit:** creates them through Phase 11's own batch command, all or none. It first checks field limits and re-checks names and targets. Nothing is created if any draft fails.
4. **New options are added deliberately.**
   - **Grouping first:** the value-mapping table (Q11) groups case, space and punctuation variants for one decision each.
   - **Bulk add:** "Add these N values" appears only after the grouped list is reviewed.
   - ★ **Historical values:** a value used only in history can be added as an archived option. Imports may set archived options on imported records; they are never selectable for new entry.
   - **Nothing automatic:** nothing is ever created automatically, even on "open" fields.
   - ★ **Stable identity:** value maps store the option's stable ID, never its label.
   - **Free text masquerading as a list:** above 200 distinct values, the screen recommends text.
5. **Core facts and calculated values first.**
   - **Steering:** columns that look like Asym built-ins (spouse, deceased, do-not-mail, pledge, preferred name) are steered to the owner's field. ★ So are calculated values such as lifetime giving, age or last gift date ("Asym calculates this from history").
   - **Lookalike fields:** creating one needs explicit confirmation and a reason.
   - **Gift-level money facts** never become custom fields.
6. ★ **One column, one target.** No merging two columns into one field and no splitting one column. Those are reviewed changes to the file (Q3). Household-level values map to the household and are never copied to members (Q10).
7. ★ **Blanks are declared per column**, with suggested tokens such as "N/A", "?" and "-", and SiteStacker's "No" for unset yes/no fields. Partial dates are never padded to a full date. They go to a text field or wait.
8. **No defaults.** Imported records never receive a field's default value, and ★ fields created by a Switch have no default.
9. ★ **Sensitive identifiers are refused.**
   - **Header refusal:** columns whose header names an SSN or SIN, card number, card security code, bank account or passport number can't be mapped anywhere, with no override.
   - **Value warning:** columns whose values look like card numbers or SSNs are blocked for review. A logged reason can override a false match.
   - **Held copies:** refused columns are stripped from Asym's held copy within 14 days of sign-off (Q15 rewrite; original digest kept).
10. ★ **Collections.** Repeating linked records (such as SiteStacker "Multiple Items" or linked entities) import into a Phase 11 collection the ministry created first in settings (Q3). Collections are not created from the mapping screen in v1. With no matching collection, they are a visible "not yet covered" exclusion.
11. **Scope.** Creating fields from mapping is for Switches only. Everyday imports keep using existing fields (Q12).
12. **After the Switch.**
    - **The list:** a list shows every field and option the Switch created, with fill rates and links to settings.
    - ★ **Retiring:** fields with no values (for example after an aborted Switch) can be retired in one step.
    - **Type changes** follow Phase 11's rules.

**Acceptance criteria**

- **AC1:** No field or option is created without a person's confirmation. Open fields never gain options from an import.
- **AC2:** Draft fields are created all or none at commit, through Phase 11's command. A failure creates none and names the failing draft.
- **AC3:** A practice run creates drafts only in its Practice copy. The real run creates them in production, and re-runs never duplicate them (draft-ID idempotency).
- **AC4:** Switch-created fields are "Our team only" or Restricted. No missionary, donor, export or public visibility is set by the batch.
- **AC5:** Imported records carry no default values, and Switch-created fields have no default.
- **AC6:** Imported choice values store option IDs. Renaming an option label changes the display everywhere and breaks no re-run.
- **AC7:** Archived options can be set by imports and can't be selected in normal entry.
- **AC8:** Refused-identifier headers can't be mapped. Card or SSN-like values block the column until reviewed, and overrides are logged.
- **AC9:** Refused columns are absent from Asym's held copy within 14 days of sign-off.
- **AC10:** A column maps to at most one target. A second mapping to the same target from another column is refused.
- **AC11:** Non-fitting values become Waiting rows and are never silently dropped. Partial dates are never padded.
- **AC12:** Declared blank tokens are imported as blank.
- **AC13:** Exceeding Phase 11's field limit blocks the plan before commit, with the remaining capacity shown.
- **AC14:** The post-Switch list shows every created field and option. Retiring is offered only for fields with no values.
- **AC15:** Field-change automations don't fire on imported values.

## 4. Ruthless synthesis

### Before recording

- **Amend B as §3**, including the Q3 collections clarification.
- **Q11 change:** value maps use option IDs.
- **Record D57–D61.**

### Spec and design

- **Behaviour:** the unmatched-columns panel, the create-field sheet and review table, and the draft model in the plan.
- **Rules:** the steering list, refusal rule and blank tokens.
- **Commit and wrap-up:** all-or-none commit, then the post-Switch list.
- **Proof:** invariants G1–G8, AC1–AC15 and edge cases F1–F29.

### Owner requirements (in order)

1. **O75 (Phase 11):** an idempotent batch-create command for fields and options, keyed by draft ID. All-or-none, with a limit pre-check and a no-write check mode. Invoked by a person from Phase 30's mapping step, in production or a Practice copy.
2. **O76 (Phase 11):**
   - import-origin creates never apply defaults, and Switch-created fields have none;
   - open-option mode never applies to imports;
   - imports may set archived options on imported records;
   - settle whether new fields accept imports by default (D58);
   - visibility from the batch is limited to Staff or Restricted.
3. **O77 (Phase 3):** tenant-scoped field-policy rows for custom fields, so the projection resolver governs them (extends O67).
4. **O78 (Phase 34 with Phase 11):** field-value-change triggers never fire on import-origin writes (extends O1 and O33).
5. **O79 (Phase 29, extends O70):** strip refused identifier columns from held Switch files within 14 days of sign-off, using the Q15 successor rewrite.

### Implementation safeguards

- draft-ID idempotency;
- an all-or-none transaction;
- the fit-rate pass during staging;
- the refusal check before mapping;
- ID-based value maps;
- no values in logs.

### Monitors

| ID      | Signal                                                | Threshold               | Owner                  | Response                                             |
| ------- | ----------------------------------------------------- | ----------------------- | ---------------------- | ---------------------------------------------------- |
| M-Q16-1 | Fields created per Switch                             | > 50                    | Phase 30               | Review with the ministry for sprawl; adjust guidance |
| M-Q16-2 | Switch-created fields with fill rate < 5% at sign-off | > 25% of created fields | Phase 30               | Improve sparse-column guidance                       |
| M-Q16-3 | Identifier-pattern overrides                          | Any                     | Phase 30 with security | Review each within 7 days                            |
| M-Q16-4 | Defaults found on import-origin records               | 0                       | Phase 11               | Incident; fix                                        |
| M-Q16-5 | Options auto-created by an import                     | 0                       | Phase 11               | Incident; fix                                        |

## 5. Owner requirements and discrepancies

**Owner requirements (proposed O75–O79):** as listed in §4.

**Discrepancies (proposed D57–D61):**

- **D57.** #663 (lines 63, 249, 265) says imports may auto-create an "option/field". `phase-11:189` and #663's own test (`:292`) cover options only. Owner text says Phase 30 never defines schema (`owner-constraints.md:389-392`). Q16: nothing is created automatically.
- **D58.** #649 (`:214`) and #660 (`:44`) disagree on whether a new field accepts imports by default.
- **D59.** #654's open option mode auto-creates options from unknown import values, against Q11 clause 3 and Q16 clause 4. Imports also can't target archived options (#654:32), against the historical needs in Q16 clause 4.
- **D60.** #655 materialises defaults on create, and C15 says "defaults apply only at create". An import create would fabricate values. Q16 clause 8 makes imports an exception.
- **D61 (current code).** The Phase 3 field-policy reader loads only rows with no tenant (`reader.ts:76`) and rejects UUID keys (`:50`), so tenant custom fields can't be governed.

## 6. Rejected alternatives

| Alternative                                            | Why rejected                                                                        |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| A. Create first in settings                            | Types are chosen blind, without samples or fit rates; it is tedious for many fields |
| C. Create automatically                                | Breaks owner text and Q11; known cause of field and option sprawl                   |
| A legacy-data catch-all for unmatched columns          | A shadow schema no tier can protect; unsearchable                                   |
| Creating collections from the mapping screen           | Larger model change; ministries create collections in settings first (Q3)           |
| Automatic fill-rate cutoff                             | Thresholds vary 5–70% with no evidence; the person decides                          |
| Splitting or merging columns in mapping                | Complexity; a reviewed file change already handles it (Q3)                          |
| Label-based value maps                                 | Break on rename                                                                     |
| Allowing SSN, card or bank columns with a warning only | PCI and privacy exposure; no ministry need                                          |
