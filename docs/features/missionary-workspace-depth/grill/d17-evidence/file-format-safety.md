# D17 evidence — contact-file interpretation, spreadsheet safety and fidelity

Research date: October 16, 2026 UTC. Research-only input to the D17 synthesis;
this note is not a ratified owner amendment, production parser, new dependency
selection or activated import capability. All examples and probe data are synthetic.

## Finding and bounded recommendation

**Accept self-service file intake with required amendments.** Offer one reviewed
CSV/XLSX path into P30. Recognized export layouts may suggest mapping, but they
cannot prove identity, consent, factual accuracy or permission. The simple journey
is choose a file → review its interpretation and proposed contacts → import →
reconcile results. Reveal delimiter, encoding, sheet and unusual-cell controls only
when relevant. Do not require everyone to reformat their existing sheet into one
template; provide the template as a convenient option.

The strongest simpler alternative is CSV-only intake. It reduces parser scope but
makes users perform spreadsheet conversion, risking leading-zero loss, unintended
date conversion, incorrect encoding and omission of other sheets. P30 already
names CSV/XLSX, so qualifying those two is the better permanent path. “Any file”
is not supportable: PDFs, photos/OCR, live Google/Outlook connections, vendor
database backups, vCard, legacy XLS, XLSB and macro-enabled XLSM need separate
qualification rather than being silently bundled into this decision.

## Governing repository facts and current-source limits

- [P30 retained obligations](../../../../prds/program-roadmap/owner-constraints.md:317)
  name CSV/XLSX, deterministic mapping assistance, tenant-confirmed remembered
  mappings, a live field catalog, preview, errors and owner-domain acceptance.
  [The roadmap](../../../../prds/sitestacker-parity/roadmap.md:4329) preserves these
  requirements. The D17 missionary audience is a bounded extension, not an excuse
  to replace that shared importer.
- [P29 private custody](../../../../prds/sitestacker-parity/roadmap.md:4251)
  distinguishes uploaded, clean, reviewed and accepted facts and owns file hygiene.
  Passing a scan cannot certify contact accuracy or business acceptance.
- A bounded search of root/workspace manifests and `bun.lock` for `xlsx`,
  `exceljs`, `papaparse`, `csv-parse`, `fast-csv`, SheetJS, Dromo and Flatfile did
  not locate a named installed importer/parser dependency. This does not prove no
  other parsing code exists. No package was installed or selected by this review.
- The [Q17 source check](../phase28-q17-contact-list-intake-research.md) is not
  evidence that a production missionary import workflow already exists.

## Verified external facts, checked October 16, 2026

| Primary source                                                                                                                        | Verified fact                                                                                                                                                              | Consequence for Asym                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [RFC 4180](https://www.rfc-editor.org/info/rfc4180/) (informational, 2005; updated by RFC 7111)                                       | Common CSV includes quoted separators, embedded line breaks and doubled quotes. Implementations vary.                                                                      | Use a real bounded parser; neither splitting on commas nor counting physical lines produces reliable records. Do not mistake the RFC's age or informational status for a complete modern security specification. |
| [Microsoft: text/CSV import and export](https://support.microsoft.com/en-us/excel/get-started/import-or-export-text-txt-or-csv-files) | Separators can vary; opening CSV applies local interpretation settings. Text export saves the current worksheet.                                                           | Preview the chosen separator and sheet. Do not require a US locale or claim a CSV contains all workbook sheets.                                                                                                  |
| [Microsoft: leading zeros and large numbers](https://support.microsoft.com/en-us/excel/keeping-leading-zeros-and-large-numbers)       | Excel can strip leading zeros, interpret dates/scientific notation and retain only 15 significant numeric digits. Formatting afterward cannot restore already-lost values. | Phone numbers, postal codes and external IDs are text. Preserve source/display evidence; flag suspect numeric cells, and never invent missing digits.                                                            |
| [Microsoft: UTF-8 CSV](https://support.microsoft.com/en-us/excel/opening-csv-utf-8-files-correctly-in-excel)                          | UTF-8 with BOM opens normally in Excel; other import paths are available for UTF-8 without BOM.                                                                            | Accept UTF-8 with or without the initial BOM; do not turn the BOM into part of a header.                                                                                                                         |
| [LibreOffice: Text Import](https://help.libreoffice.org/latest/en-US/text/shared/00/00000208.html)                                    | Character set, separator, column type, scientific/date interpretation and formula evaluation are independent options.                                                      | Never let the import worker perform spreadsheet-style type or formula evaluation merely because an export can be opened in Calc.                                                                                 |
| [Google: export spreadsheets](https://support.google.com/docs/answer/9330963?hl=en)                                                   | Google Sheets supports downloading files for other programs.                                                                                                               | An exported supported file satisfies this entry path without a Google OAuth integration. The public help page is not proof of Asym compatibility with every export variant.                                      |
| [Microsoft: formulas](https://learn.microsoft.com/en-us/office/open-xml/spreadsheet/working-with-formulas) (updated January 14, 2025) | SpreadsheetML has a formula separately from a cached value from its last calculation; formulas can reference other workbooks.                                              | A saved result is a supplied assertion, not proof that recalculation occurred. Never execute a formula or refresh an external source.                                                                            |
| [Microsoft: shared strings](https://learn.microsoft.com/en-us/office/open-xml/spreadsheet/working-with-the-shared-string-table)       | Cells may reference shared strings instead of containing plain text directly. Strings may include runs.                                                                    | Qualify shared/inline strings and preserve all text runs rather than importing their indexes or only their first run.                                                                                            |
| [Microsoft: supported Excel formats](https://support.microsoft.com/en-us/excel/file-formats-that-are-supported-in-excel)              | XLSX and macro-enabled XLSM are distinct formats; ordinary XLSX cannot store VBA or Excel 4.0 macros.                                                                      | Check package contents/type as well as the filename; a renamed macro-enabled file is not an acceptable XLSX.                                                                                                     |
| [OWASP: file upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)                                     | Claimed content types are not trustworthy, and compressed-size limits do not bound expanded content.                                                                       | Validate format/package and stream actual size/resource limits in private processing.                                                                                                                            |
| [OWASP: XML external entities](https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html)        | Untrusted entity processing can resolve external resources or expand malicious content.                                                                                    | Prohibit DTD/entity processing and network/resource resolution in workbook parsing.                                                                                                                              |
| [OWASP: CSV injection](https://community.owasp.org/attacks/CSV_Injection)                                                             | Spreadsheet applications may interpret formula-leading text; ordinary quotes/apostrophe mitigations may fail after Excel save/reopen.                                      | CSV quoting alone is not a spreadsheet safety guarantee. Prefer correction downloads with explicit XLSX text cells and no formulas/links; qualify supported spreadsheet applications.                            |
| [W3C: personal names](https://www.w3.org/International/questions/qa-personal-names)                                                   | Name order, family-name presence, case, punctuation and writing systems vary.                                                                                              | Preserve Unicode and the supplied name. Do not invent family names, split couples on “and”, title-case names or require ASCII.                                                                                   |

These are documented format/workflow facts, not measured missionary needs,
authenticated vendor export tests or end-user usability results. The current
official pages include older material where indicated. No third-party article
is treated as authority for a parser-security guarantee.

## Exact proposed interpretation requirements

**FMT-01 — Closed format profile.** “The contact intake SHALL accept only the
published, qualified CSV/XLSX profiles through the shared P30 importer and P29
private custody. File extension, claimed MIME type and scan success SHALL NOT
alone establish format validity or import acceptance. Unsupported, encrypted or
malformed files SHALL produce a specific recovery instruction before any contact
mutation.” Do not ask for spreadsheet passwords or run desktop Office converters
on the server. A password-protected workbook must be exported locally by its owner
to an unencrypted supported file.

**FMT-02 — CSV interpretation.** “The parser SHALL preserve quoted separators,
quoted line breaks, doubled quotes, empty cells and Unicode text. UTF-8 with or
without an initial BOM SHALL be supported. Comma, semicolon and tab SHALL be
qualified delimiter choices within the delimited-file profile. Detection SHALL
suggest an interpretation; ambiguous decoding/separation SHALL require preview
confirmation or correction, never silent replacement or row reconstruction.”
The governed delimited-file profile SHALL accept `.csv`, `.tsv` and `.txt`
suffixes through the same qualified parser, without trusting the suffix to select
the dialect. The primary UI may say **CSV or Excel**, with the supported text-file
details available at selection. This deliberate same-parser profile decision is
not a live connector, separate parser or permission expansion.

**FMT-03 — Legacy encodings.** “Unknown or invalid byte sequences SHALL NOT be
replaced by U+FFFD and admitted as if lossless. The initial qualification profile
SHOULD support BOM-marked UTF-16LE/BE and explicit Windows-1252 in addition to
UTF-8; the preview SHALL show the selected interpretation. Other encodings SHALL
receive a clear UTF-8/XLSX export instruction unless separately qualified.”
This is an interoperability recommendation, not evidence that every source vendor
needs these encodings. Do not guess a single-byte encoding merely because every
byte decodes under it, and do not impose a lengthy encoding selector on valid UTF-8.

**FMT-04 — Workbook selection.** “One import SHALL review one selected worksheet
and table/range with its header choice. The UI SHALL show the selected sheet and
counts of included/excluded rows. Hidden sheets and hidden/filtered-out rows SHALL
be excluded by default, surfaced with counts and deliberately includable before
review; they SHALL NOT be silently imported or silently lost. An excluded hidden
column containing values SHALL remain visible as an excluded column in the mapping
summary. Merged cells intersecting contact data SHALL require correction or explicit
exclusion, never fill-down inference.” Workbook formatting outside the selected
contact table does not by itself invalidate the file. “Include hidden rows” appears
only when such rows exist. The actual XML visibility state, not an unevaluated
filter expression, controls the default; unfamiliar filter state requires review.

**FMT-05 — Scalar values, formulas and external resources.** “XLSX shared strings,
inline strings and saved scalar cell values SHALL be interpreted without formula,
macro, script, hyperlink, external-relationship or data-connection execution.
Mapped formula cells with cached scalar results MAY be imported as flagged,
reviewed source assertions. The review SHALL disclose that these are saved results
and may be out of date, with a filter for affected cells. Missing caches and error
results SHALL block the affected mapped cells/rows until corrected or deliberately
excluded. Formula-derived values SHALL NOT become trusted durable source-identity
authority merely because a cached string exists.”

Recommended copy: **“Some values came from formulas and may be out of date. Check
the saved values before importing.”** One relevant warning and affected-row view
is preferable to repeated cell dialogs. Requiring all formula users to paste-values
first is a stronger, more burdensome alternative and does not prove that a later
CSV export is factually correct. Cached-value admission is an explicit product
judgment agreed for synthesis; it is not formula evaluation or claimed freshness.

**FMT-06 — Headers, width and unexplained data.** “Every source column SHALL have
an ordinal identity even when labels repeat or are blank. Auto-mapping SHALL be a
suggestion. Every nonempty column SHALL be visibly mapped, intentionally excluded
or unresolved. Multiple source columns targeting a singular field SHALL be resolved
explicitly rather than overwritten. Extra cells, duplicate headers, inconsistent
row width and conflicting values SHALL be reported, never silently truncated.”
Do not reject a wide vendor export solely because most columns are unnecessary;
bound resource consumption and paginate mapping rather than imposing a gratuitous
100-column ceiling. Do not auto-create custom fields or stash unknown data in notes.

**FMT-07 — International fidelity and accuracy claims.** “Names, phone numbers,
postal codes and external IDs SHALL preserve their supplied text and source
provenance. Formatting/normalization SHALL use the existing target owner's rules,
with the normalized candidate visible where meaning changes. No country SHALL be
inferred solely from tenant locale; no missing digits, family names or address parts
SHALL be fabricated. Syntax-valid, imported and verified SHALL remain distinct.”
Numeric cells in text-like identity/contact fields need a visible warning with
the source/display value when available. A custom number format can preserve a
displayed zero but cannot prove historical numeric precision; retain both evidence
and review outcome. No auto-transliteration, provider-specific email dot/plus
stripping, guessed family/household creation, or “email exists” network probing.
If a target cannot represent an address/name safely, make it an actionable mapping
issue rather than squeezing the value into a US-only schema. A blank optional field
does not authorize clearing an existing record.

**FMT-08 — Passive previews and safe corrections.** “Source values SHALL render
as escaped text in preview, errors, logs and downloadable reports; imported HTML,
links and formula-looking strings SHALL NOT execute. Valid leading-plus phone
numbers SHALL NOT be damaged to avoid a spreadsheet-export hazard. Downloadable
correction workbooks SHALL write untrusted values as explicit text cells, contain
no formula cells, macros or automatic hyperlinks, and preserve row identity.
CSV quoting alone SHALL NOT be claimed to neutralize formula injection.”
The correction file is restricted data, not a public download. A reviewed plain
text CSV export profile may be qualified separately; never claim safety after
arbitrary downstream editing or CSV resaving in every spreadsheet application.

**FMT-09 — Complete validation before acceptance.** “A sample preview SHALL be
labelled as a sample. All rows proposed for commit SHALL pass the same qualified
format/field validation. The accepted interpretation SHALL pin the original byte
identity, selected sheet/range, header, encoding, delimiter, parser/profile version,
mapping and deliberate exclusions. Changing any of those SHALL invalidate prior
acceptance and regenerate affected preview/results.” A deterministic interpretation
digest is provenance, not proof of user intent or authorization.

**FMT-10 — Resource and package safety.** “Processing SHALL enforce actual uploaded
and expanded bytes, member/cell/row budgets, CPU/memory/time ceilings and tenant-fair
concurrency independently of file metadata. XLSX relationships and archive member
names SHALL be normalized/validated, duplicate normalized package parts rejected,
and traversal, external resource resolution, DTD/entities, unsupported encryption,
macros and executable embedded content rejected. Sparse dimensions SHALL NOT
trigger allocation of a maximum rectangular worksheet. Resource failure SHALL
leave no accepted contacts and explain how to prepare a smaller supported file.”
This is a requirement to qualify a maintained parser and sandboxed custody worker,
not a recommendation to write an XLSX implementation from this research probe.

## Proposed quantitative qualification profile

The following is an initial **engineering judgment for qualification**, not measured
capacity, vendor limits, a universal ministry dataset size or ratified product
numbers. The final D17 synthesis may choose a different named profile; the permanent
contract is that one actual, published and enforced profile exists before activation.

| Dimension               | Proposed starting bound                                                                                                                         | Reason and proof needed                                                                                                                                                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Uploaded file           | 10 MiB = 10,485,760 bytes                                                                                                                       | A clear bounded self-service unit; qualify real source exports and low-bandwidth upload/resume.                                                                                                                                                                  |
| Candidate data rows     | 10,000 nonblank data rows in the selected range, excluding header, measured before hidden-row, mapping, error or deliberate skip exclusions     | Count rows that need correction or are hidden/excluded within that range; accepted-only counting must not evade work limits. This is not a claimed real-world list size.                                                                                         |
| Parsed field/cell slots | 500,000 across the whole workbook or delimited file, including explicit empty fields/cells, unselected sheets, hidden rows and excluded columns | Bound parser work independently of populated/accepted record counts. Count actual CSV fields and explicit XLSX cell elements; absent sparse coordinates do not count and SHALL NOT be allocated.                                                                 |
| Expanded XLSX package   | 128 MiB = 134,217,728 actual streamed bytes across all members, including unselected/hidden content                                             | Enforce before business acceptance and during expansion, not only against the selected sheet. Compressed input size and ZIP directory claims do not bound expansion. Do not rely solely on compression ratio: benign repetitive XML may compress extremely well. |
| Package members         | 4,096                                                                                                                                           | Bound small-part overhead as well as bytes. Validate required package graph independently.                                                                                                                                                                       |
| Cell text               | 32 KiB decoded UTF-8 per cell; stricter owner-field limits still apply                                                                          | A resource ceiling, not permission to fit 32 KiB into a short target field. Reject/repair, never truncate. Unicode byte counts differ from character counts.                                                                                                     |
| Sheet/range             | One deliberately selected worksheet/table per import                                                                                            | Prevent accidental union of worksheets containing different structures or audiences.                                                                                                                                                                             |
| Source column positions | XLSX positions up to XFD/16,384; delimited records at most 16,384 fields, subject to parsed-slot/byte budgets                                   | The XLSX position limit is a format fact; the matching CSV field ceiling is an explicit profile judgment, not an Asym throughput promise. Do not materialize absent columns or render every possible column at once.                                             |

Before activation, test every bound at N−1, N and N+1, oversized cells spanning
chunks, deliberately inaccurate ZIP metadata, extreme sparse dimensions, repetitive
compression, duplicate parts and malformed XML. Set worker CPU/memory/time and
per-tenant concurrency from those production-shaped measurements. This note does
not invent “fast” timing guarantees or freeze an unmeasured worker budget.

Above-limit files need a truthful actionable error before commit; splitting a list
must not bypass job/row/source identity safeguards or treat repeated headers as
contacts. Raising a profile limit requires measured qualification, not a staff
permission bypass or accepting only the beginning of an oversized file.

## Consolidated material concerns for the main review

| Concern                         | Failure and impact                                                                                                                                      | Severity / likelihood before safeguards                                                  | Evidence, effect on answer and permanent prevention                                                                                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FMT-F1 Interpretation loss      | Simple splitting, decoding replacement, duplicate-header dictionaries or silent unmapped columns corrupt names/contact methods while reporting success. | High / likely with diverse files                                                         | RFC/Microsoft/LibreOffice plus probe counterexamples. Narrows “supported file” to a qualified explicit interpretation; add FMT-02/03/06/09.                                                |
| FMT-F2 Spreadsheet conversion   | Excel has already rounded an ID, removed a phone/postal zero or changed date-like text; importer fabricates an apparently clean value.                  | High / plausible                                                                         | Microsoft precision guidance. Changes quality promise from “all data verified” to reviewed provenance and owner validation; FMT-07, never invented recovery.                               |
| FMT-F3 Formula/cache ambiguity  | Recalculation/external fetch creates executable behavior; stale cached email/name is mistaken for verified truth.                                       | High / plausible                                                                         | Microsoft formula model and synthetic inconsistent cache. Narrows admission to flagged saved assertions, no evaluation, cache blockers and no automatic identity authority; FMT-05.        |
| FMT-F4 Hidden content           | A hidden worksheet/row imports unexpectedly, or is silently discarded; a merged heading is propagated as contact data.                                  | High / plausible                                                                         | XLSX carries visibility and merge structure separately from values; probe. Requires explicit selection, counts and no inferred fill-down; FMT-04.                                          |
| FMT-F5 Injection/resource abuse | Formula-bearing error download executes in staff Excel; malicious XLSX exhausts parsing capacity or follows external paths.                             | Critical for execution/exfiltration, high for availability / plausible adversarial input | OWASP and ZIP/XML counterexamples. Does not invalidate self-service; requires private bounded processing and typed safe output before release; FMT-08/10.                                  |
| FMT-F6 Format overreach         | Universal converters/OAuth/new parser vendors expand complexity while still dropping unsupported fields.                                                | Medium / likely if “all ways” is read literally                                          | P30 is CSV/XLSX; existing exports bridge many tools. Narrows initial support to published qualified profiles without promising proprietary migration; FMT-01/06.                           |
| FMT-F7 False quality claims     | “Valid” is presented as person identity, email ownership, consent or factual accuracy; technically accepted data becomes trusted fact.                  | High / likely without precise language                                                   | Syntax cannot prove the named person exists, gave permission or owns an email. Require distinct parsed/validated/reviewed/imported/verified meanings; FMT-07/09 plus actual source owners. |

No separate financial-format concern is introduced in this contact-only scope:
money, historical gifts, commitments and derived support status must not enter this
format profile. Reject or visibly exclude those columns under the main owner
contract; do not parse them into financial authority because they look numeric.

## Falsification evidence and its limits

[probe.py](format-probe/probe.py) ran with Python 3.12.14 and no external dependency,
network, real contacts, spreadsheet execution or archive extraction. The final
[results.json](format-probe/results.json) records **34/34 passed counterexamples**.
The earlier [31-case result](format-probe/results-initial-31.json) is preserved.
Independent cross-review identified a gap in populated-only resource accounting;
three subsequent counterexamples show explicit empty CSV fields exceeding the
500,000-slot budget despite zero populated values, an empty CSV record exceeding
the 16,384-field profile, and explicit empty XLSX cells differing from absent sparse
coordinates. These establish the counting distinction, not production enforcement
or parser memory/CPU qualification.
The initial fixture assertion mistakenly counted three physical lines as four;
that expectation was corrected before the final successful run.

The probe demonstrates information loss from naive parsing, header dictionaries,
numeric conversion and replacement decoding; XLSX cached-result inconsistency;
hidden content, merged cells and sparse dimensions; CSV formula prefixes surviving
correct quoting; and compressed-size/duplicate-part/XML-entity pitfalls. Its
explicit text-cell check proves the synthetic XML has no formula element, not
that every spreadsheet application is safe in every downstream resave workflow.

It **does not** qualify a production parser, validate arbitrary Excel packages,
exercise Core/P30/P29/Supabase, establish performance at the proposed limits, or
test real vendor exports and accessibility. Those remain release-proof obligations
in the main D17 decision, not reasons to trust this research script as product code.

## Subsequent ratification

On October 16, 2026 UTC the founder explicitly ratified the corrected D17
decision and required amendments, including C01–C24, the initial profile and
P01–P28 as future proof obligations. The
[main D17 review](../phase28-d17-contact-import-adversarial-review.md) is the
reconciled decision. Earlier recommendation labels and conditional alternatives
in this evidence note describe pre-ratification research, not additional or
competing accepted choices. This changes intended-behavior status only; source
snapshots, executed experiments and all implementation/qualification limits
remain unchanged.
