# Q11 — Mapping assistance and the data boundary: adversarial check of Option A

Founder answer (2026-11-02): **"yes"** (Option A as recommended). Decision as asked: `q11-decision-as-asked.md`. Evidence: `research/q11-r1-repo-ai-boundary.md` and `research/q11-r2-external-ai-mapping.md`.

**Disposition: accept with required amendments.** Option A matches the owner text almost word for word. `owner-constraints.md:356-363` asks for "deterministic mapping suggestions with tenant-confirmed remembered mappings, template generation from the live field catalog". ADR-0173 item 15 requires "Suggested — review required" labels. #2347 B2 says no plan is produced while a non-empty column is unresolved. It also matches the industry's deterministic layer order (exact match, then history, then aliases, then fuzzy) and its mapping UX.

The check found five gaps. Two would have leaked data and three were unclear scope.

## 1. Adversarial check

### What could go wrong

1. **Cross-ministry leakage through "learning".** Many importers learn from every customer's choices (Flatfile; OneSchema history). A header list or remembered mappings built from other ministries' files would carry their confidential labels into suggestions. Q2 says headers can name workers, places or programmes.
   - **Fix:** a remembered mapping belongs to one tenant and one source. The header list is written by Asym from vendor documentation and fake-record exports, never learned from ministries' files.
2. **Previews and value tables bypass Q5's visibility floor.** Q5 clause 4 gives helpers and Asym help access only "headers, counts and validation summaries" until a cleared member narrows the file. A preview of sample rows, or a value table listing fund names, shown to them would break that.
   - **Fix:** previews and value lists follow Q5.
   - **Correction to what was asked:** an Asym specialist can map _columns_ from headers and counts, but _values_ are mapped by the ministry, or after narrowing. The earlier "Asym help access can do the mapping" was only half true.
3. **A remembered mapping is silently wrong after an export changes.** A reused mapping is only safe when the headers are identical. Little Green Light warns that "even one column header name" breaks saved templates.
   - **Fix:** a mapping is reused only on an exact header match, is still shown for one-click confirmation, and each plan records its mapping version.
4. **A misread header row.** Exports with title rows or two header rows shift every column.
   - **Fix:** the person confirms the header row before matching.
5. **Unclear "nothing leaves" scope.**
   - **Parsing libraries are allowed.** "No importer vendor" must not be read as banning ordinary open-source parsing libraries that run inside Asym; choosing one stays an engineering decision.
   - **Q2's internal AI ban covers more than files.** Q2 clause 4 must also cover error output and screenshots, since a specialist pasting a failing row into a chatbot is the realistic leak.
   - **Fix:** both are stated explicitly.
6. **Value mapping needs somewhere to map to.** Mapping a source fund or gift type that has no Asym option needs a new option or fund, which belongs to the Phase 11 custom-field and money owners.
   - **Fix:** in v1, values map only to existing options or are left out. Creating options during mapping stays open (F10 and money owners).

### Hidden assumptions

- **"Nothing leaves Asym" assumes logs and support tools stay clean.** Phase 10 already bars raw content from ordinary logs, traces and support views (`phase-10:332-335`). Option A relies on that, and adds a monitor.
- **"AI would have helped."** For the paths Asym actually has, it would not much. Templates and presets need no matching. Headers-only AI scores about F1 0.55 on cross-vocabulary matching and cannot see values, which is where ministries struggle. The real gap is the long tail of hand-made spreadsheets, which the revisit trigger measures.

### Whole product

- **Q9 and Q10 reuse this step.**
  - **Q9:** "confirm what each restriction field means" is a value mapping (source codes to restriction types).
  - **Q10:** Person 1 and Person 2, Household ID and relationship columns are column mappings.
  - **Q6:** Practice copies reuse the current mapping version.
- **Q3 monitor:** "any template-path switch needing developer help" stays the backstop.

### End-user experience

- **The mapping screen** lists every source column with its status: Matched, Remembered, Suggested — review required, Unmatched or Left out. Next to each column it shows the Asym field and, for permitted viewers, a sample value.
- **Shortcuts and controls:**
  - Accept every remembered and exact match in one click.
  - Filter to unmatched columns.
  - Search the field list.
  - Bulk-leave-out with a reason.
- **The value table** shows each source value with its count, followed by the Asym option it maps to.
- **Before the plan:** the header row is confirmed first, and a short preview of transformed rows comes last.

### Modern best practice

| Practice                                                                                                                        | Fit                                                                |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Exact, history, alias, then fuzzy matching, with mandatory review (HubSpot, Salesforce, Bloomerang, LGL, Givebutter, Mailchimp) | **Matches**                                                        |
| Unmapped columns surfaced, never silently dropped                                                                               | **Matches**; stricter than Flatfile and the Salesforce wizard      |
| Saved mappings per source                                                                                                       | **Matches**; tenant-scoped (stricter than cross-customer learning) |
| Value-mapping tables with a "do not import" choice                                                                              | **Matches**                                                        |
| Preview before applying                                                                                                         | **Matches**                                                        |
| AI suggestions                                                                                                                  | **Deferred** by design; revisit on evidence                        |

### Repo fit

- **Supports:**
  - `owner-constraints.md:356-363`.
  - `roadmap.md:4347`: "Optional AI is not a prerequisite".
  - ADR-0173 item 15.
  - C15 and C17.
  - D17 C12, unchanged.
  - #2347 B2.
- **Closes:**
  - The build-versus-adopt and mapping-data-handling items at `roadmap.md:4409`, for Phase 30 staff imports.
  - Q2 clause 4's deferral.
  - O9 is not needed for v1.
- **No new owner requirement.** Phase 11's field catalog (#650, #660) and O21 template descriptors are already required.

### Adjusted recommendation

Keep A, amended as in §2. ★ marks a change from the decision as asked.

## 2. Corrected decision text

**Q11 — Mapping assistance and the data boundary.** Option A, amended.

1. **Rule-based column matching.**
   - Templates match by exact key, and SiteStacker uses presets.
   - Other files are matched in this order:
     - remembered mappings for that source;
     - Asym's list of common header names;
     - fuzzy matches labelled "Suggested — review required".
   - A person confirms every match. ★ They first confirm which row holds the headers.
   - A non-empty column left unmatched blocks the plan until it is matched or explicitly left out. Leaving columns out can be done in bulk and is recorded as a Visible exclusion.
2. ★ **Matching never crosses ministries.**
   - **Remembered mappings:**
     - A remembered mapping belongs to one tenant and one source.
     - It is reused only when the headers match exactly, and is still shown for one-click confirmation.
     - Each plan records its mapping version.
   - **The header list:**
     - It is written by Asym from vendor documentation and fake-record exports.
     - It is never learned from ministries' files.
     - It is a suggestion list, never a preset or support claim (Q3).
3. **Value-mapping table.**
   - **What it covers:** code columns such as gift types, payment methods, funds, campaigns, statuses and Q9 restriction codes. Asym lists each distinct source value with its count.
   - **What the ministry does:** it maps each value to an existing Asym option or leaves it out. A left-out value leaves that cell blank, and a row missing a required value is blocked. Mappings are remembered.
   - **Unknown values** are rejected by default.
   - ★ **Not decided here:** creating new Asym options or funds during mapping (F10 and the money owners).
4. ★ **Previews follow Q5's visibility.**
   - **Who sees values:** transformed sample rows and source values are shown, inside Asym, only to people allowed to see them.
   - **Before narrowing:** until a cleared member narrows the file, helpers and Asym help access see only headers, counts and validation summaries. Asym help can therefore map columns, while values are mapped by the ministry or after narrowing.
   - **Fund names** are shown only to cleared members.
   - **Ambiguous dates** are flagged, never guessed.
5. **Nothing leaves Asym for mapping.**
   - **No AI and no outside importer.** Asym uses no AI and no hosted or embedded importer service, and builds its own importer in its own UI. This closes the build-versus-adopt item for Phase 30 staff imports.
   - ★ **Parsing libraries:** open-source file-parsing libraries that run inside Asym remain an engineering choice.
   - ★ **Asym staff's own AI tools** never process a ministry's real exports, headers, sample values, error output or screenshots. This answers Q2 clause 4. Screened NOW material with no personal data stays as Q2 allows.
   - **Missionary self-import** stays rule-based (D17 C12).
   - **O9** is not needed for v1.
6. **Measure, then revisit.**
   - **What each Switch records:**
     - the share of non-empty columns matched by key or preset, by remembered mapping, by the header list, by an accepted suggestion, by hand, or left out;
     - the time spent mapping.
   - **When the founder revisits Option B:** after the first three template-path Switches, or sooner if most of them need Asym help to map.

**Acceptance criteria**

- AC1. An Asym template file maps every column as Matched, with no suggestions.
- AC2. An unmatched non-empty column blocks the plan. A bulk leave-out is recorded as a Visible exclusion with its reason.
- AC3. A remembered mapping applies only when the headers match exactly, and is shown for confirmation. A renamed header is not auto-applied.
- AC4. No tenant's mappings or headers ever appear as another tenant's suggestions.
- AC5. The value table lists distinct values with counts. An unknown value is rejected. A left-out value leaves a blank cell, and a row missing a required value is blocked.
- AC6. Before narrowing, helpers and Asym help access see no cell values.
- AC7. Import processing makes no request to any AI or importer service.
- AC8. A date column with both day-month and month-day readings is flagged, not guessed.
- AC9. The plan records the mapping version, and a Practice copy reuses it.

## 3. Monitors

| ID      | Signal                                                                                                  | Threshold               | Owner                  | Response                    |
| ------- | ------------------------------------------------------------------------------------------------------- | ----------------------- | ---------------------- | --------------------------- |
| M-Q11-1 | Match-method mix per Switch                                                                             | Learning signal         | Phase 30               | Feeds the revisit           |
| M-Q11-2 | Time spent mapping per Switch                                                                           | Learning signal         | Phase 30               | Feeds the revisit           |
| M-Q11-3 | Template-path Switches needing Asym help or a developer to map                                          | Most of the first three | Founder                | Revisit Option B            |
| M-Q11-4 | Outbound requests from import processing to non-Asym hosts; raw import content in logs or support tools | 0                       | Phase 30 with Phase 10 | Incident; block the release |

## 4. Rejected alternatives

| Alternative                                          | Why rejected                                                                                                                                                                               |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| B. Optional AI from headers only in v1               | Needs the unbuilt D10 foundation, Phase 10/12/3 amendments and counsel on processor status. Modest accuracy (headers-only F1 about 0.55). No help with values. Headers can be confidential |
| C. AI with sample values, or an importer vendor's AI | Breaks C17 and the D10 rules. Vendors send data to third-party models with retention and cross-customer learning                                                                           |
| Learning header names or mappings across ministries  | Carries one ministry's confidential labels to another                                                                                                                                      |
| Hosted or embedded importer service                  | Second processor; conflicts with ADR-0173 item 4 and the UI invariant (`AGENTS.md:89`)                                                                                                     |
