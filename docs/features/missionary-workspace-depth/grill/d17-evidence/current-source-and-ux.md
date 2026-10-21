# D17 — Current source and complete contact-intake UX evidence

Research only, 16 October 2026. This note supports the founder's selected
organization-permitted missionary self-service contact intake. It does not
implement intake, grant an actor permission, select a parser/vendor, or authorize
general CRM migration. Source observations are static; proposed behavior below
is a qualification requirement, not a claim that it currently works.

## Scope and evidence limits

Inspected the missionary Partners header and Add Partner form; missionary-portal
mutation wrapper and donor mutation; shared image upload, mounted donor image
route and admin Email Studio upload; CRM/guest duplicate helpers; shared grid,
responsive table, forms and CSV serialization; relevant manifests/lock entries;
selected grants/storage migrations and existing unit-test sources. Searches
covered `apps`, `packages`, `supabase/migrations`, and `tests/unit` for contact
import, CSV/XLSX parsing, import run/batch/staging/job/mapping and upload terms.
Named dependency search covered root/workspace manifests and `bun.lock`.

No contact-file importer, durable import-run/staging route, or parser integration
was located in that bounded scan. This is not a whole-platform absence proof:
vendor/CMS importer internals, unmounted operational scripts, hosted deployment,
actual grants, Storage settings, worker activation and runtime traffic were not
audited. No database, upload, send, provider or application mutation was run.
Existing test sources were inspected, not executed. Earlier D1/D5 evidence
remains context for restricted preparation and contact-edit authority; it does
not establish a deployed exploit or a new import capability.

Instructions applied: root, missionary, API, UI and Supabase AGENTS; the local
Supabase skill previously loaded in this research session. This is documentation
work, not a UI implementation or dependency installation.

## Actual source versus reusable pieces

| Observed source                                                                                                                                                                                                                                                                 | What exists                                                                                                                                                                                 | D17 consequence                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Partners header](/workspace/core/apps/missionary/app/donors/donors-page-header.tsx:17)                                                                                                                                                                                         | Mounted header offers Add Partner; Export is disabled with “not available yet”; Add Partner receives `profile.id`.                                                                          | A new import entry cannot be described as an existing enabled flow. Keep manual entry alongside intake.                                                                                                                              |
| [Add Partner submit](/workspace/core/packages/missionary/components/add-partner-dialog.tsx:58)                                                                                                                                                                                  | Creates a browser Supabase client and calls `donors.insert`; success toast follows no returned error; close resets local form at line 93.                                                   | Do not loop this form to make a bulk importer. It has no reviewed run, stable row receipt, private preparation target, duplicate decisions or resumable acceptance.                                                                  |
| [Add Partner model](/workspace/core/packages/missionary/components/add-partner-form-model.ts:12)                                                                                                                                                                                | Name must have two characters; email and location are required. Defaults include Individual and Monthly; payload stamps Active, zero giving totals and score 70 at line 41.                 | These are existing legacy assumptions, not approved imported facts. Missing email/location must not require fabricated data; import cannot infer donor/commitment status, giving, score or monthly support.                          |
| [Missionary operation wrapper](/workspace/core/packages/api/src/missionary-portal/route-helpers.ts:24) and [admin client](/workspace/core/packages/database/supabase/admin.ts:22)                                                                                               | Wrapper requires missionary role and supplies a client built with the service-role key.                                                                                                     | Useful server boundary pattern, insufficient import policy by itself. Worker commands need current actor/tenant/subject/target/field authority; service role does not supply those checks.                                           |
| [Current donor edit](/workspace/core/packages/api/src/missionary-portal/donor.ts:174)                                                                                                                                                                                           | Server update constrains donor id, tenant, `missionary_id` and explicit nonanonymous giving preference, and requires one returned row.                                                      | Existing donor correction is a distinct operation. Intake must not turn preview “fixes” into edits of canonical donors, bypass D5, or reassign donor ownership.                                                                      |
| [Role foundation](/workspace/core/packages/auth/permissions.ts:40)                                                                                                                                                                                                              | All staff subroles share broad baseline capabilities; admin accepts staff/legacy profile roles at line 66; missionary has profile-role compatibility at line 84.                            | A role check is not proof of the selected organization-permitted missionary import entitlement. P12 must qualify the bounded reviewer/committer capability.                                                                          |
| [February demo migration](/workspace/core/supabase/migrations/20260216153000_demo_readonly_rls.sql:14) and [June grants](/workspace/core/supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:160)                                                         | February includes donors, drops policies, revokes anon/authenticated table grants and restores SELECT. June adds donor SELECT policy/grant.                                                 | Visible browser insert code is not proof it can write under the migration chain. This note did not fully reconstruct every grant or inspect deployment; do not claim an active unrestricted writer or enable INSERT as a shortcut.   |
| [Image upload helper](/workspace/core/packages/ui/components/primitives/image-upload.tsx:202)                                                                                                                                                                                   | Posts a WebP blob to `/api/upload/image`; alternative direct browser Storage upload uses upsert and `getPublicUrl` at line 230.                                                             | This is an image path, not private contact-file storage. Do not reuse its public URL or browser-chosen bucket/path contract for raw files, previews or error reports.                                                                |
| [Mounted donor image route](/workspace/core/apps/donor/app/api/upload/image/route.ts:3)                                                                                                                                                                                         | Minimal bearer-string check; returns 401 for missing/known invalid token, otherwise 501 “Not implemented.”                                                                                  | Not authenticated file intake. Do not mistake an endpoint/E2E existence fixture for operational upload or reuse its token check.                                                                                                     |
| [Admin email upload route](/workspace/core/apps/admin/app/api/email/assets/upload/route.ts:1), [implementation](/workspace/core/packages/api/src/email/assets.ts:173), [bucket migration](/workspace/core/supabase/migrations/20260511024000_email_assets_storage_bucket.sql:1) | Mounted admin image upload authenticates, accepts four image MIME types up to 5 MiB, chooses Cloudinary or service-role Storage, returns a public asset URL. Bucket is deliberately public. | This can inform pending/error handling; it cannot supply confidentiality for contact lists. MIME/extension checks here are image-specific and are not a qualified spreadsheet parser/scanner.                                        |
| [Shared form hook](/workspace/core/packages/ui/components/primitives/tanstack-form.tsx:3)                                                                                                                                                                                       | Base UI field wrappers with labels, descriptions, errors and TanStack Form.                                                                                                                 | Reuse for mapping and a focused row-correction form; validate again at the source boundary.                                                                                                                                          |
| [Responsive table props](/workspace/core/packages/ui/components/shadcn/data-table/data-table-responsive-types.ts:41), [mobile view](/workspace/core/packages/ui/components/shadcn/data-table/data-table-responsive-inner.tsx:140)                                               | Supports explicit total/page counts, `getRowId`, controlled pagination, row actions and mobile cards.                                                                                       | Stronger default candidate for bounded review/results than a full spreadsheet editor. Pass stable staging-row IDs, source totals and authorized page data. Stock “No results” copy is not a parse-failure or no-eligible-rows state. |
| [DataGrid model](/workspace/core/packages/ui/components/shadcn/data-grid/types.ts:34), [processing](/workspace/core/packages/ui/components/shadcn/data-grid/data-grid.tsx:678)                                                                                                  | Index-based cell/selection state, local supplied data, all supplied rows rather than table pagination; virtualization reduces rendered rows.                                                | It is not a server-paged importer and does not bound transferred/private data. Do not identify source rows by changing screen indices or load the whole file just because rows are virtualized.                                      |
| [DataGrid editing](/workspace/core/packages/ui/components/shadcn/data-grid/data-grid.tsx:586), [history](/workspace/core/packages/ui/components/shadcn/data-grid/data-grid.tsx:810)                                                                                             | Local array edits call an optional callback. Undo/Redo restores React arrays and does not itself issue inverse source commands.                                                             | Never label this “Undo import” or treat it as durable correction history. Prefer explicit Save correction with revision checking; clear unsaved-state communication.                                                                 |
| [Grid clipboard](/workspace/core/packages/ui/components/shadcn/data-grid/data-grid.tsx:310)                                                                                                                                                                                     | Copy writes raw tab/newline text. Paste splits lines/tabs and coerces numeric input with `parseFloat(value)                                                                                 |                                                                                                                                                                                                                                      | 0`; checkbox input recognizes “true.” | Neither CSV parser nor lossless international contact editor. Disable unnecessary copy/paste initially; any enabled copy/export must have authorized contents and safe spreadsheet serialization. |
| [CSV helper](/workspace/core/packages/lib/csv.ts:67), [table export](/workspace/core/packages/ui/components/shadcn/data-table/utils/export.ts:57)                                                                                                                               | Canonical serializer quotes and neutralizes formula-leading cells. Table exporter serializes the loaded selected/filtered model; browser download adds UTF-8 BOM.                           | Useful for a qualified error-file producer. It does not parse imports, prove export entitlement or fetch all server pages. Do not call a loaded-page export “all problems.”                                                          |

### Duplicate and international-data reuse hazards

[CRM scoring](/workspace/core/packages/api/src/crm/mapping/duplicates.ts:43)
rejects cross-tenant candidates, adds weighted email/phone/name/organization
signals and produces candidate recommendations. It is a pure scorer, not an
identity authority or permission check. Its
[normalizer](/workspace/core/packages/api/src/crm/mapping/normalize.ts:21)
strips non-digits, prepends `+1` to every ten-digit phone, and otherwise prepends
`+`; `splitFullName` at line 38 treats the first whitespace-separated token as
first name. These transformations must not silently rewrite international
source facts. Preserve entered spelling, display name, phone text, extension and
explicit country context; keep matching representations separate.

Two inspected guest-giving helpers have materially different same-email
ambiguity behavior. [Public-giving matcher](/workspace/core/packages/api/src/public-giving/donor-match.ts:110)
routes multiple exact-email candidates to review.
[Guest donor matcher](/workspace/core/packages/api/src/donate/guest/donor-matching.ts:187)
can attach to the uniquely oldest same-email donor and surface the others for
review. These describe gift attachment, not prospect intake. A call-site search
in `packages/api/src` found their definitions and the public-giving export, but
no calling import execution path. Do not claim either is the deployed universal
matcher, resolve their difference by arbitrary selection, or reuse email-only
attachment to confer contact access. Shared household email/phone, recycled
addresses and church contact details are not proof that two rows are one person.

The [CRM identity contract](/workspace/core/openspec/specs/crm-core/spec.md:46)
keeps source identities distinct and disallows weak-match automatic
merge/overwrite/linking. The [Q17 owner-frontier evidence](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-q17-contact-list-intake-research.md:43)
identifies the required bounded missionary actor extension and restricted
preparation target qualification. Existing source helpers do not replace those
owner decisions. A hidden matching record must not be disclosed through names,
IDs, household information, candidate counts, error details, downloads or a
special “already exists” response. Show only source data the reviewer supplied
and existing data they currently may read; opaque cases require a source-owned
safe disposition without new browsing rights or a forced duplicate.

### Version-aware reuse

[UI manifest](/workspace/core/packages/ui/package.json:68) declares Base UI
1.9.0, TanStack Form 1.33.5, Table 9.2.6, Virtual `^3.14.13`, Query
`^5.104.1`, Supabase JS 2.117.3, Next 16.4.0 and Sonner 2.0.8.
[Lockfile](/workspace/core/bun.lock:679) resolves Base UI 1.9.0;
[form/table/virtual entries](/workspace/core/bun.lock:1709) resolve 1.33.5,
9.2.6 and 3.14.13 respectively. Missionary
[Zod declaration](/workspace/core/packages/missionary/package.json:33) is
`^4.6.5`; the [root lock entry](/workspace/core/bun.lock:4147) resolves 4.6.5.
These are manifest/lock facts, not a verified installed production inventory.
Use shared adapters rather than remembered Table v8 or Radix APIs. Exact
[base-maia/Zinc configuration](/workspace/core/packages/ui/components.json:3)
remains controlling.

No named Flatfile, OneSchema, CSVBox, Dromo, Papa Parse, SheetJS/xlsx, ExcelJS,
csv-parse, csvtojson, react-spreadsheet or react-csv-importer entry was found in
the searched manifests/lockfile. That does not establish that no transitive or
vendored parser exists. Parser selection, maintenance/security review and format
qualification remain implementation work; this note adds no dependency and
does not promise XLSX, ODS, macros, full MPDX/Tnt archives or every CSV dialect.

## Material D17 requirements inferred from this evidence

| Priority and conditional likelihood                          | Concrete hazard                                                                                                                          | Required candidate safeguard                                                                                                                                                                                                                                              |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| High; likely if single-entry writer is looped                | Ordinary donor records, invented Monthly/Active state or a generic Party target replaces restricted new prospect assertions.             | Commit only the qualified preparation/contact source operation, with explicit allowed fields and current target authority. Import never silently shares, enrolls, follows, sends, creates gifts/commitments or broadens D5 editing.                                       |
| High; likely if existing image upload is reused              | Raw file, filenames, columns, row fixes or error downloads become public assets.                                                         | Private staging and delivery with current actor/tenant/subject authority; nonpublic object namespace; bounded signed access if used; no public cache, analytics payload, logs, URL query values or browser-persisted raw rows. Define deletion/retention before launch.   |
| High; likely if pure matcher output is treated as admission  | Same-email or weak match overwrites another person, exposes a hidden contact, or gives workspace access.                                 | Owner-qualified identity/source linkage; source IDs retained; safe outcomes for ambiguous and hidden matches. No client choice can override a hidden-record boundary or promote a weak match.                                                                             |
| High; plausible on retry/network loss                        | Reconfirm/reload creates duplicates or a stale preview admits changed fields under revoked permission.                                   | Durable run and stable row receipts; reviewed file/sheet/header/mapping/correction revision bound to the finite accepted plan; current authority and source version rechecked at admission. Resume reconciles prior receipts before retrying.                             |
| High; likely for international lists with current normalizer | Phone/name coercion corrupts identity, or missing email/location forces invented values.                                                 | Treat phones/postal codes as text, preserve Unicode and display names, allow legitimate absent channels, require explicit context for uncertain transformations; no default US country or automatic household split/merge.                                                |
| Medium–high; likely if grid is treated as backend            | Local Undo claims rollback, index shifts correct the wrong row, all rows reach browser, or clipboard emits formulas.                     | Stable source-row IDs, bounded server review, explicit saved corrections, limited controls, source-owned state transitions and safe authorized export. Virtualization is rendering only.                                                                                  |
| High; plausible with adversarial/malformed files             | Formula/external-reference execution, resource exhaustion, unintended worksheets/columns, parsing ambiguity or unsafe HTML error output. | Non-executing parser, explicit format/dialect and byte/row/column/cell/time bounds; reject unsupported encrypted/archive/macro cases; literal text rendering; no external fetch or formula evaluation. Workbook support requires separate archive/resource qualification. |
| Medium–high; likely if asynchronous UX is optimistic         | Upload/queued/accepted is shown as contacts imported; cancel appears to erase accepted rows; skipped errors disappear.                   | Durable per-row outcomes and reconciled totals; visible partial completion; distinct discard-review versus stop-processing; accepted rows remain unless a separately qualified source operation reverses them.                                                            |

“Private” must not promise that no authorized organization/security operator can
ever access staging. State the selected restricted contact behavior accurately,
and apply the actual approved staging audience. Staff help must not require Maya
to email a raw list or grant unrestricted file visibility. A protected import
support reference can identify a run without copying contact contents.

## Primary UX references inspected

- [MPDX CSV intake](https://help.mpdx.org/article/384-import-csv-files-into-mpdx),
  updated 18 May 2023, accessed 16 October 2026: documented file selection,
  header/value mapping, preview, back navigation and asynchronous completion.
  Reuse the understandable sequence, not its large-file limit, irreversible
  checkbox, email-file support advice, status mapping or newsletter-value
  import. Those do not establish Asym consent, limits or target authority.
- [GOV.UK file upload](https://design-system.service.gov.uk/components/file-upload/),
  accessed 16 October 2026; page describes 2025 and February 2026 improvements:
  labelled file selection, drag/drop as an additional route, specific empty,
  type, size, protected-file and upload-failure messages, and avoiding needless
  re-upload within a journey. Adopt interaction lessons within Core's own UI;
  this is not permission to add GOV.UK components or copy its sample limits.
- [W3C WAI form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/),
  accessed 16 October 2026: errors should identify the affected field, explain a
  correction and link to the control; associate inline feedback, manage focus
  and use restrained live announcements. These support the review/fix journey;
  they do not certify existing Core components as accessible.

## Smallest complete journey — proposed, not implemented

Use one native Partners entry and a compact full-page flow, not a new app, report
builder or desktop-only spreadsheet. Three progress labels are sufficient:
**Upload → Review → Results**. Mapping and the final confirmation belong within
Review. No separate step is needed when a qualified mapping is unambiguous, but
its result remains visible and editable before confirmation.

### 1. Entry and upload

```text
Partners                                     Add contact   Import contacts

Import contacts
Bring an existing list into your workspace.
You'll review it before any contacts are added.

Organization: [current organization]    Workspace: [current subject]
Contact file     [Choose file]
[Only qualified formats and actual limits, in plain language]
Download example file

New prospects start restricted. Sharing is a separate action.
Continue
```

Organization/subject are trusted current context, not arbitrary uploaded
columns. Display the context without forcing a picker when there is only one
eligible workspace. A switch of organization does not silently move an upload.
Do not show a working import CTA without permission/qualification. On a direct
denied visit explain “Contact imports aren't available for this workspace” with
an existing way back; only name a staff-help route that actually exists.

Provide a file-picker button usable on phones and keyboards; optional drag/drop
is an enhancement. Display selected filename and size as text. Distinguish
uploading, uploaded/preparing and ready to review. Do not navigate to a fake
preview while bytes are still local. Retry a failed upload without making the
user remap a previously accepted file; a replacement file creates a new review
revision. Example files contain synthetic contact data and only supported fields.

### 2. Source/header selection and mapping

For CSV there is no sheet selector. If a qualified spreadsheet profile is later
offered, list actual sheets and select one explicitly; show its detected header
and sample rows, and state that other sheets are not included. Never quietly
import hidden worksheets. Headerless or ambiguous files need a clear header-row
choice/sample; wrong delimiter/encoding is a parsing problem, not hundreds of
individual bad-email errors.

```text
Review contacts                         File: contacts.csv   Change file

Match your columns
Your column       Example from your file         Import as
Contact           李明                            Display name
Mobile            07123 456789                     Phone
Town              Nairobi                         City
Legacy score      70                              Don't import

3 columns included · 1 left out       Review contacts
```

These are illustrative supported fields, not a ratified schema. Show source
column index as well as label when headers repeat. Every omitted nonempty column
is visible in the summary; prevent accidental double-mapping to one destination
unless that transformation is explicitly supported. Suggestions are provisional:
no meaning is inferred from color, hidden spreadsheet data, formulas, source
status labels or a column named “Subscribed.” Unknown fields stay out with an
explanation, not a generic mapping to notes. Changing sheet/header/mapping
recomputes the reviewed plan and invalidates its former confirmation.

### 3. Review, fix and duplicates

```text
Review 40 source rows
32 ready to add · 3 need correction · 2 need review · 3 left out

[Needs attention 5] [All rows 40]
Row  Contact         Outcome             Action
12   Ana García      Email needs fixing  Review row
28   Pat and Lee     Needs review        Review row

Save and leave        Continue to confirmation
```

Numbers are examples, not limits. Categories are mutually exclusive source-row
outcomes; totals must reconcile with excluded empty/header rows separately
explained. Do not mix count of people, households and source rows. A qualified
exact previously accepted source row can be “Already imported — no change,”
but only when that receipt and its destination are currently disclosable.

Review row shows original supplied values next to the proposed contact fields,
the exact issue and **Save correction** / **Leave out**. Saving changes staging,
not an existing contact or the user's original file. Use a focused form on
phones; closing an unsaved correction asks whether to keep editing or discard
that correction. Preserve source row identity through sorting, filtering and
pagination. Don't require editing a thousand-cell grid to fix one phone number.

Duplicate review may compare two rows of the submitted list. Existing contacts
are shown only under current read authority, with only actions the source owns.
The flow cannot grant merge, ownership, sharing or canonical-edit authority.
For unresolved cases show a neutral actionable hold, such as “This row needs
review before it can be added,” without exposing a hidden match. If the proper
resolver is staff, qualify that handoff and its audience; do not invent an inbox
or silently forward the file. Two different people with one household email
must remain representable. No global “merge all” or “overwrite all” shortcut.

### 4. Deliberate confirmation

```text
Add 32 contacts to [workspace]?
New prospects will start restricted.
5 rows still need attention. 3 rows were left out.
No existing contact details will be changed by this import.

Back to review                         Add 32 contacts
```

The no-existing-change sentence is valid only for the bounded additions profile
recommended here; omit/replace it if an explicitly approved source operation
can update existing records. Likewise counts must come from the current finite
plan. Partial acceptance must be deliberate: show what will be left out and let
the user return to fix it. If the qualified source requires all rows resolved,
state that rule instead of silently accepting only ready rows. No confirmation
checkbox needs to repeat the same button action; no “cannot be undone” waiver
substitutes for accurate outcomes and recovery.

### 5. Processing and results

```text
Adding contacts
18 of 32 reviewed rows completed. You can leave and return to this import.
View progress                           Stop remaining rows

Import finished
30 contacts added · 2 could not be added
5 rows still need review · 3 left out
View added contacts     Review remaining rows
```

Show “You can leave” only after the durable job/run exists. Never translate
request timeout into “nothing was added,” or accepted/queued into “imported.”
On reconnect reopen the same run, obtain source receipts and show confirmed,
pending or unresolved outcomes. Retry only qualified unresolved/failed rows,
not all contacts. Source conflicts after preview go back to focused review;
already accepted rows keep their receipts.

Before commit, **Discard review** ends preparation without contact writes;
state the actual retention consequence without promising immediate erasure of
all backups. After work starts, **Stop remaining rows** is a request whose
acknowledged boundary must be shown: completed rows stay; in-flight acceptance
is resolved from source receipts. Closing a tab is neither stop nor rollback.
Do not show Undo import unless the owning source has a qualified compensating
operation that respects subsequent edits, sharing and independently created
relationships. Grid Undo cannot provide that guarantee.

### 6. Resume, error recovery and lost permission

One small recent-import list under the same entry is enough: filename, started
time with timezone/context, run status and **Resume review** / **View results**.
No new reporting workbench. **Save and leave** requires durable private mapping
and corrections; communicate saved/unsaved/error state. Retention/expiry must be
decided and displayed before relying on resume; this note invents no duration.

Missing permission, removed assignment or organization change blocks further
admission and newly requested file/preview/result access. Clear stale private
client state under the existing revocation model. Explain “Your access changed.
No more contacts can be added from this review” only once the admission boundary
supports that statement. If already accepted outcomes cannot now be disclosed,
do not reveal their details as an error-recovery exception. Permission returning
does not auto-resume an old confirmation: reopen, revalidate and deliberately
continue. Never downgrade a failed request to direct browser inserts.

Optional error-file download is a separate qualified artifact with the same
current audience, safe CSV serialization and accurate scope. Preserve source
row IDs and distinguish protective export escaping from the actual contact
value; reopening an annotated spreadsheet must not store added quote prefixes
as names/phones. A file already downloaded cannot be recalled. In-product row
fixing is the primary recovery path so a phone user need not install a spreadsheet
application or re-upload every successful row.

## International, accessibility and performance acceptance outcomes

These are proposed proofs to run against the implementation, not tests passed.

1. A permitted missionary completes upload, mapping, correction, confirmation
   and results on phone and keyboard; drag/drop and desktop spreadsheet skills
   are unnecessary. Back navigation retains a previously accepted upload.
2. A mononym, one-character valid name, non-Latin name, organization/church and
   household-shaped source row are preserved without forced Western splitting,
   fictional names or automatic household conversion. Unsupported shape is
   explained before acceptance.
3. National-format and `+` phones, extensions, leading-zero postcodes and address
   lines survive preview, correction, accepted storage and error-file round-trip;
   no guessed country, numeric coercion or blank-to-zero conversion occurs.
4. Quoted separators/newlines, BOM, duplicate headers, malformed encoding,
   headerless data, empty files and over-limit cells produce accurate bounded
   parse/mapping results. Workbook sheets/formulas/archives are accepted only
   under their separately qualified profile; no external formula request runs.
5. Shared household email, two source rows with similar names, accessible
   existing contact and hidden match produce correct permitted outcomes without
   automatic merge/overwrite, hidden identity disclosure or new read rights.
6. Every mapped/ignored field is reviewable; source financial amounts, statuses,
   newsletter flags and historical outreach do not become consent, gifts,
   commitments, tasks, contact attempts or ordinary shared CRM facts by accident.
7. Sorting, filtering, pagination and row fixes preserve stable source IDs;
   screen-reader users hear row/outcome/field context and can reach inline errors
   from an error summary. Color alone never identifies a problem. Return focus
   to the relevant row/action after a fix, including when its filter changes.
8. A slow upload, large qualified file and interrupted network remain responsive
   with bounded transfer/rendering; progress announces meaningful milestones,
   not every row. The UI never needs the entire contact file in a long-lived
   client store to show one page. No undocumented offline/byte-resume promise.
9. Double-click, refresh, lost response and repeated accepted file/run resume
   reconcile receipts without duplicate admissions. Different mappings or source
   revisions cannot reuse an obsolete confirmation. A file hash alone does not
   establish that independently sourced people are identical.
10. Current permission and tenant/subject ownership are checked for file,
    staging, matching, save, commit, worker admission, status and download. A
    guessed run/object id, changed tenant field, stale tab and direct route call
    cannot broaden scope. Same-user permission loss is covered, not only logout.
11. Mixed successful/failed/pending/skipped outcomes reconcile exactly; stopping
    work or discarding preparation has the promised effect, while already
    accepted contacts are neither falsely erased nor blindly replayed.
12. Error downloads/copy contain only authorized contents, neutralize spreadsheet
    execution, preserve international text and advertise full versus loaded-page
    scope accurately. Raw file contents and hidden matching metadata do not
    enter telemetry, URLs, public Storage or a third-party mapping/AI service.

Existing [duplicate tests](/workspace/core/tests/unit/packages/api/crm-duplicates.test.ts:8)
exercise scoring and cross-tenant exclusion; [grid processing test](/workspace/core/tests/unit/packages/ui/data-grid-row-processing.test.tsx:16)
explicitly checks all supplied rows without pagination; [keyboard contract test](/workspace/core/tests/unit/packages/ui/data-grid-keyboard-contract.test.ts:12)
checks source wiring, not an assistive-technology journey; [CSV tests](/workspace/core/tests/unit/packages/lib/csv.test.ts:4)
cover serialization protections. None proves missionary import permission,
restricted preparation, durable acceptance, concurrency, private staging,
international parser fidelity or end-to-end recovery.

## Recommended minimum

Build one permitted contact-intake entry on the shared P30 process, restricted
to the specifically qualified contact/preparation target. Reuse Core forms and
a bounded responsive review table, with a small row editor and explicit durable
results. Qualify the file formats/parser/storage/limits and owner commands before
offering them. Avoid a full spreadsheet editor, source CRM selector, sync setup,
bulk canonical updates or broad historical migration in this decision.

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
