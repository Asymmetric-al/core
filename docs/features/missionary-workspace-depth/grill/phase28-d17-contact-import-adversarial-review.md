# D17 — missionary self-service contact import

Research and decision review, October 16, 2026 UTC. Repository baseline:
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`.

The founder selected **A — Missionary self-service import** and requested deep
source-tool research, clean useful data, exceptional simple UX and a complete
adversarial review. **Disposition: Accept with required amendments.** The founder explicitly ratified
the corrected decision and required amendments on October 16, 2026 UTC, including
C01–C24, the initial qualification/custody profile and P01–P28 as future acceptance
obligations. This is a completed research review, not implementation,
an activated import service, a formal owner amendment or a production safety claim.

## Exact corrected decision to record

> When the organization permits it, Maya may upload a supported contact file,
> review its mapping, proposed additions and problems, and deliberately import
> eligible contact details into her permitted workspace. New assertions retain
> their restricted start. The initial profile supports reviewed CSV and data-only
> XLSX intake through the shared import, file-custody, identity and permission
> owners. The initial contact-field profile adds eligible preparation or safely
> reuses authorized records with qualified source lineage; it does not automatically
> merge people or bulk-update existing private or shared contact facts. A successful
> import means the stated source changes were accepted, not
> that the source data, identity, contactability or consent was independently
> verified. The review and result explain what happened, what needs attention,
> and how to resume interrupted work without repeating accepted effects. Import
> alone shares nothing with ordinary staff, grants no access, enrolls nobody,
> sends nothing and creates no financial or historical relationship facts.

Use one shared intake contract and a compact **Choose file → Review → Import and
results** journey. Do not create a missionary migration platform, a new CRM,
an approval queue for ordinary imports, a provider connector for every source,
or a general spreadsheet editor. The permanent fix is source-qualified intake,
not relying on subsequent staff cleanup.

## Evidence and what is actually known

Six parallel investigations covered source products, file formats, ownership,
identity/consent, mounted code/UX and database mechanics. Each distinguishes
documented intent, inspected source and actual experiments:

- [Owner boundaries](d17-evidence/owner-boundaries.md): P30/P29/P4/P9/P12,
  ADR-0001 and ADR-0209–0212, restricted start, custody and explicit conflicts.
- [Source products](d17-evidence/source-products.md): current and historical
  public primary documentation, exact export claims and public sample inspection.
- [File safety](d17-evidence/file-format-safety.md): Excel/CSV/XLSX semantics,
  hostile-file boundaries and bounded local format experiments.
- [Identity and consent](d17-evidence/identity-consent-integrity.md): source
  assertions, canonical identity, reimport, negative preferences and safe correction.
- [Current source and UX](d17-evidence/current-source-and-ux.md): mounted entry,
  parser/storage gaps, reusable components and the user journey.
- [Database lifecycle](d17-evidence/database-lifecycle.md): current primary
  Supabase/PostgreSQL evidence and isolated database experiments.

**Repository facts:** [P30](../../../prds/sitestacker-parity/roadmap.md:4315)
currently describes staff upload/review. Its preview binds exact bytes, mapping,
scope and target revisions; target owners accept writes. The bounded missionary
actor and restricted-preparation target require explicit owner amendments.
[P4](../../../prds/sitestacker-parity/phase-04-identity-account-claiming-foundation.md:185)
prohibits automatic merge. The older
[P30 retained shorthand](../../../prds/program-roadmap/owner-constraints.md:330)
“auto-merge high band only” conflicts with that rule; the
[current roadmap](../../../prds/sitestacker-parity/roadmap.md:4333) already makes
automation conditional on identity-owner permission. D17 grants none. Resolve
the shorthand during formalization; do not silently follow it in implementation.

**Current source facts:** the inspected missionary Partners path offers Add
Partner, not this qualified importer. AddPartnerDialog writes `donors` from the
browser, requires email/location and supplies Monthly/Active/score defaults.
That is unsuitable as the import command. Existing public image-upload helpers,
local editable grids, tab-split paste and export utilities do not establish
private P29 custody or reliable parsing. These are static repository findings,
not proof of a deployed vulnerability or a complete hosted inventory.

**External facts:** public documentation and sample files establish real export,
mapping and cleanup jobs. They do not prove current authenticated vendor behavior,
all export versions, a complete migration, or Asym's compatibility.

**Product judgments:** the bounded intake profile, seven-day working window,
limits and UX below originated as recommended initial choices and are now
ratified for D17. They are not measured capacity, universal ministry needs or
inherited retention law.
There were no missionary interviews, real donor uploads or usability sessions.

**Unresolved implementation evidence:** actual P9 restricted-source commands,
P12 capabilities, P29 custody inventory, supported parser/version, P6 adverse-
preference adapter and hosted role/storage behavior must be qualified together.
They are explicit release gates, not reasons to reopen the self-service choice.

## Source compatibility without a universal-migration promise

The [source register](d17-evidence/source-products.md) holds primary URLs,
dates, sample details and limitations. Source selection suggests a mapping; it
never certifies a schema, an external account, identity or permissions.

| Source                       | Evidence-backed intake path                                          | Important boundary                                                                                                                                                                     |
| ---------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Personal Excel/Google Sheets | CSV or supported XLSX, actual headers and values reviewed            | Formatting, formulas, locale and human conventions differ; never guess lost digits or dates.                                                                                           |
| MPDX                         | Documented Advanced CSV and Advanced Excel XLSX export               | Contacts can represent multiple people; spouse fields are not permission to construct a household graph. XLSX can preserve multiline/address presentation better.                      |
| TntConnect/TntMPD            | Documented field-selectable contact export/import; public CSV sample | Legacy terminology and version uncertainty; multiple people, address groups and private notes require explicit inclusion rules. Native database/backup files are outside this profile. |
| Google Contacts              | Documented Google CSV export and public template                     | Public template/help use differing email header spellings; numbered values need deterministic mapping, not exact-header faith.                                                         |
| Outlook                      | Documented CSV export, with product/version distinctions             | Localized headers and encoding need preview; do not assume every Outlook product exports the same schema.                                                                              |
| Planning Center              | Documented People CSV exports include Person ID                      | Its import Household ID can be batch-only, distinct from persistent Person ID/remote_id. No blind promotion of a column called ID into person authority.                               |
| Mailchimp                    | Documented audience CSV/sample                                       | Audience membership/status is neither identity nor new consent. An unsubscribe must not disappear or become an all-channel prohibition by inference.                                   |
| Bloomerang                   | Suitable flat constituent/contact report export                      | Full database export is a ZIP of related files, not a supported single contact sheet or a safe automatic merge.                                                                        |
| DonorElf, Sola, Epistle      | Accept a supported CSV/XLSX if the user's actual export qualifies    | Current exact schemas were not verified; older Epistle CSV training and an unavailable old DonorElf article do not justify a “fully supported migration” badge.                        |

The best alternative is staff-assisted P30 intake. It is useful for unsupported
sources and complex migrations, but imposing it on every ordinary list adds
handoffs without improving deterministic validation. Manual entry remains useful
for a few contacts. Neither alternative justifies another importer or default
staff access to Maya's file. This assessment is product judgment, not a measured
time-saving claim.

## The small, complete user journey

1. **Enter from the contact list.** Show Import contacts only with current
   authority and qualified availability. A direct unavailable route explains the
   actual reason; never show a working-looking button backed by no command.
   Organization settings use the existing permission system. Import permission
   does not confer contact correction, file administration or staff access.
2. **Choose file.** Show CSV/XLSX, the applicable limit and a simple template.
   Optional source-tool help explains how to export. State: “New contact details
   start in your restricted workspace. Importing won't share them or send messages.”
   Avoid promising absolute privacy from separately authorized custody functions.
   Upload uses a native picker as well as drag-and-drop; progress survives refresh.
3. **Review what Asym understood.** Suggest mappings deterministically and show
   real sample values. Ask for sheet, header row, delimiter or encoding only when
   needed. Display included/excluded row and column counts. Hidden rows/sheets
   are excluded by default, with an explicit choice to include eligible content;
   nothing silently vanishes because it was hidden in Excel. Preserve that choice
   in the reviewed plan. Changes invalidate the old preview.
4. **Fix meaningful problems.** Show Ready, Needs attention and Skipped with
   plain reasons, source row references and a filter. Use a short row form on
   mobile, not a mandatory hundred-column grid. Missing email is acceptable;
   no fake address, name, country or status is inserted. Source type/name ambiguity,
   digit loss and possible duplicates are not green “Verified” badges. A bulk fix
   previews its effect. Supported scalar formula caches receive a visible batch
   warning and affected-row filter; no formula runs.
5. **Review the effect once.** “Import 82 ready rows; leave 6 for review.” The
   number is illustrative, not a default. State additions and safe reuse separately. Show no canonical overwrites, no implicit sharing
   or outreach, and the actual file-expiry date/time. Do not require one dialog per
   clean row or a separate staff approval. User confirmation explicitly selects
   the ready subset if some rows remain blocked.
6. **Show durable results.** “Imported 80; 2 need review because records changed.”
   Never show success solely because an upload or background job started. Closing
   the tab does not cancel accepted work. Reopen the same run to see accurate
   progress and actions. A lost response recovers receipts before offering retry.
   Cancel says “Stop remaining rows”; it does not promise to delete accepted contacts.

When an authorized existing contact is reused, show its currently authorized
identity and preserve its canonical details. A conflicting proposed shared detail
links to the normal eligible D5 correction action; it is not silently discarded
under an “all imported” message. Changed previously imported assertions keep the existing target unchanged, show
an authorized discrepancy and use the normal D1/D5 source correction action
separately from bulk import. Possible duplicates can be
skipped, safely reused where permitted, or deliberately retained as separate
unresolved preparation; this is not a merge screen or a hidden-match oracle.

Use stable labels, visible focus, inline errors linked to fields, an error summary,
screen-reader progress/status announcements and adequate touch targets. At 320 CSS
pixels and 200% zoom the full job remains operable without needing a wide mapping
table. Preserve Unicode names and user-provided order; do not require Western
first/last-name splitting, US states or inferred phone country. Show deadlines in
the viewer's timezone with the zone available; stored instants remain unambiguous.
No analytics event, toast or error logger contains raw contact values. The
[UX evidence](d17-evidence/current-source-and-ux.md) records supporting guidance;
“beautiful” still needs implemented visual and real-user evaluation.

## Exact required amendment clauses

These clauses define observable obligations. They do not prescribe table names,
library choices or every screen. C01–C24 and the initial profile below are the
ratified package for subsequent formal owner reconciliation; ratification does
not establish implementation or release qualification.

**C01 — Bounded self-service authority.** P30 SHALL admit a currently authorized
missionary reviewer/committer for the exact P28 contact-intake target through P12.
Upload, file/staging read, preview and source acceptance SHALL each be admitted
under current context; no staff-role substitution, caller-supplied grant, new
parallel permission flag or routine second reviewer is required. Permission
administration SHALL NOT confer access to the file or restricted preparation.

**C02 — One target and restricted start.** Newly supplied contact assertions SHALL
enter the qualified restricted-preparation source. Import SHALL NOT force Party,
donor, household, support relationship or shared-CRM creation to satisfy a schema.
Independently authorized canonical facts retain their own ownership and audience.
The private target SHALL support useful successful intake, not merely deny writes.

**C03 — Finite field profile.** The initial profile SHALL accept source-qualified
display/name assertions, email and phone values, and structured or faithfully
preserved mailing-address assertions from the current field catalog. A row needs
at least a usable submitted name/label, email or phone assertion; an ambiguous
couple/family label may remain unsplit and unresolved where the preparation owner
permits, without forcing a canonical Party kind; email and location are not
universally required. Source record IDs and type/context labels are provenance,
not new Party facts. Multiple values require explicit mappings. Unsupported
notes, care data, relationship/history, gifts, commitments, goals, credentials,
custom schema and automation fields SHALL NOT be silently imported or invented.
Show excluded fields. Known contact-restriction evidence follows C08.

**C04 — Honest normalization.** Preserve original meaningful Unicode text and
source provenance within its lifecycle. Apply only source-owner validation and
reviewed transformations; do not split couples/names, infer country, repair lost
digits, strip meaningful phone prefixes or label imported data verified. Blank,
missing and a deliberately supplied value SHALL remain distinguishable. Initial bulk updating or clearing of existing private or shared contact fields
is outside this profile.

**C05 — Matching is not merging.** D17 SHALL perform no automatic identity merge.
Matching rules and allowed actions SHALL use P4/P9 consistently across entry,
API and import. Email, phone, name, score and shared address are evidence, not
unique person keys. Reuse of an existing identity requires actual source admission;
an importer cannot acquire merge rights or silently choose a winning canonical row.

**C06 — No hidden-match disclosure.** An inaccessible existing record SHALL NOT
change exposed candidate counts, details, errors, downloads or availability of
ordinary private assertion intake. Minimum candidate/result authority SHALL be established before existence-dependent
branching, including accepted-versus-reused/unchanged outcomes and target references;
test side channels as well as field redaction.
Cross-Tenant matching is prohibited. Same-Tenant membership alone is insufficient.

**C07 — Qualified source identity and repeat work.** Durable external identifiers
SHALL be scoped to Tenant, exact target/workspace, source instance, entity kind
and established source binding. A declared tool name, arbitrary CSV ID, file hash
or row number SHALL NOT authorize identity linkage or overwrite. Retrying an
accepted operation returns its receipt. Reuploading the same bytes in the same
scope/profile SHALL identify prior work and review remaining effects. Reordered
or changed files without stable IDs require authorized candidate review; no
perfect automatic deduplication is promised. Changed bound assertions SHALL preserve existing target fields, show an authorized
discrepancy and route to the ordinary source correction action outside this intake
profile. Expected revisions still protect acceptance and reuse checks. “Previously imported” reports
historical effect, not equality with today's record.

**C08 — Existing contactability authority.** Import SHALL create no opt-in,
verification, subscription, permission to contact or global suppression write.
Existing restrictions remain authoritative. Known negative/ambiguous source
contactability evidence SHALL be visibly handled, not silently excluded. An
affected row is accepted only when the qualified contact/P6 owner atomically
accepts the exact scoped restriction/evidence and returns durable authority
consumed by the actual recipient and D15 gates; otherwise that row remains blocked.
The receipt binds exact Tenant, preparation/recipient authority, contact revision,
source occurrence, channel/list-purpose and provenance. Each recipient gate
enforces it only for owner-defined applicable uses; an independently permitted
unrelated communication is not prohibited by a newsletter-specific restriction.
An unsubscribe for newsletter X SHALL NOT become an all-channel prohibition by
guesswork. New adverse evidence on a reused or otherwise unchanged row requires the same
current disposition; an old import receipt cannot bypass it. An affirmative
“subscribed/active/donor” value grants nothing.

**C09 — Outward effects remain dark.** Import SHALL NOT send messages, notices to
contacts, invitations, receipts or newsletter confirmations; grant accounts;
publish profiles; create gifts, commitments, past exchanges or cultivation; or
replay historical automations. Any required technical indexing/audit remains
source-qualified. Subsequent contact sharing or sending is a separate deliberate
currently authorized action with its own eligibility checks.

**C10 — Immutable reviewed plan.** Preview SHALL change no contact facts and bind
immutable source bytes, selected sheet/header/rows, parser/catalog/mapping version,
purpose/target, proposed effects and relevant source revisions. Changing any of
these requires a new review. Commit accepts exactly the displayed eligible set;
unknown/blocked rows cannot silently join it. Displayed samples do not substitute
for validating all candidate rows. Columns SHALL retain ordinal identity even
when headers repeat or are blank; each nonempty column is mapped, explicitly
excluded or unresolved. Conflicting singular mappings, ragged rows/extra cells
and merged contact data require correction or explicit exclusion, never
last-column-wins, silent truncation or inferred fill-down.

**C11 — Current atomic acceptance.** Each source row or necessary owner-defined
dependency group SHALL atomically enforce current tenant/actor/purpose/field
authority, target revision, cancellation/expiry and worker fencing, and persist
the source effect, provenance, restriction receipt where required, run outcome
and required audit. Caller input SHALL NOT assign Tenant, actor, owner, author,
approval, role or trusted attribution. Version conflicts require review rather
than last-write-wins. Authorization is rechecked at the acceptance boundary,
including background work; stale JWT/custom claims are not current grants.

**C12 — Bounded inert file parsing.** Admit only the qualified CSV/data-only XLSX
profile. Do not execute formulas, macros, embedded objects or external links;
fetch referenced resources; accept encrypted/legacy/macro formats by renaming;
or trust MIME, extension, worksheet dimensions or ZIP declarations alone. Enforce
actual byte/cell/member/row and execution bounds before and during processing.
Saved scalar formula results may be reviewed as flagged source assertions, never
as proof or automatic durable-ID authority. Missing/error caches block affected
mapped cells. No source content enters external AI or an unqualified processor.

**C13 — Storage and derivatives.** P29 SHALL keep originals, filenames, staging,
previews, errors and recovery material in private purpose-bound custody with
integrity/finalization and required scan/quarantine controls. Neither public image
upload paths nor a staff File Manager grant qualify. Current source audience and
stricter classifications apply to every derivative. A retained blob grants no
reading or export right; raw data SHALL NOT enter generic logs or analytics.

**C14 — Database invariants.** Every tenant-owned relation and reference SHALL
enforce compatible Tenant/target scope with non-null trusted keys, tenant-aware
foreign keys, scoped uniqueness and explicit deletion rules. Preserve source
receipts/provenance across safe cancellation and source corrections. Do not make
email globally or tenant-wide unique as a person identity shortcut. Constrain
valid state/version combinations and index actual tenant/target/source/queue
access paths. Import creates no money facts; no floating-point money conversion
or new financial type is justified by this profile.

**C15 — RLS and privileged boundary.** Inspect actual grants, SELECT/INSERT/UPDATE/
DELETE policies, both old-row USING and new-row WITH CHECK behavior, functions,
RPCs, views, storage, background jobs and service-role paths. A permitted update
SHALL NOT move a row to another Tenant/target/owner or forge accepted status.
Expose no direct generic table writer that bypasses the source command. Privileged
code SHALL enforce the same semantic authorization; private schemas, minimal
grants and hardened function search paths are required where applicable. The
exact design must be proven with real roles, not inferred from RLS being enabled.

**C16 — Durable recovery and fencing.** Source effects SHALL have durable operation
receipts; worker leases/cursors are not the authority for whether a row happened.
Duplicate delivery, lost responses and reclaimed workers SHALL not repeat effects
or skip unprocessed rows. Old lease generations cannot commit after fencing.
Pause/resume rechecks authority and retained input eligibility. No whole-file
transaction or cross-provider exactly-once guarantee is implied.

**C17 — Cancellation, correction and archive.** Cancel stops future acceptance at
the same ordered boundary as acceptance and reports any already accepted rows.
Deleting a run/file SHALL NOT delete contacts. Batch undo, where source-qualified,
must refuse later edits, merges, sharing or independent/immutable coverage and
use the source correction path instead. Reimport SHALL NOT reactivate archived
preparation, removed access, old consent or completed work. Apply current
erasure/restriction/tombstone dispositions before accepting old source data; an
old file cannot resurrect erased source content. D4 Return stays deliberate.

**C18 — Accurate results.** Every selected candidate row SHALL have exactly one
current outcome: pending, accepted, previously-imported, skipped, needs-review,
failed, or not-processed. These counts SHALL sum to the selected candidate total; excluded
rows/columns are reported separately. Not-processed carries a cause such as
cancelled, expired or authorization-stopped. Accepted details distinguish newly
created preparation and reused authorized reference; row counts SHALL NOT be
labeled unique people. Previously imported describes
historical acceptance, not unchanged current contact values. Changed outcomes
retain durable history. Recovery SHALL not report all-failed after partial success.

**C19 — Clear accessible journey.** The journey SHALL offer explicit mapping and
effect review, inline correction and subset selection without a per-row approval
ritual. Permission states, source limitations, count labels, expiry and success
copy SHALL be truthful. Preserve recoverable work through weak connections and
browser closure without putting contact files in persistent browser storage by
default. Keyboard, screen reader, mobile, zoom, international text/address and
timezone cases SHALL be included in acceptance evidence.

**C20 — Governed correction artifacts.** Downloaded source/error material is egress
and SHALL use current exportable-field/row policy, private custody and the same
expiry. Prefer a qualified XLSX correction artifact with explicit text cells and
no formulas/active links for untrusted values. If CSV output is offered, ADR-0212's
single shared csvSafeCell, quoting/CRLF/BOM contract remains mandatory; no parallel
encoder or destructive input escaping. CSV escaping SHALL NOT be represented as
guaranteed safe after spreadsheet save/reopen or as lossless source authority.

**C21 — Finite custody and truthful disposal.** The ratified initial working
window is seven days from server-recorded finalized upload. Reads, edits, retries
and jobs do not extend it. At expiry deny raw/staged/artifact access and new row
acceptance; reconcile already accepted effects from minimized receipts. Purge
eligible primary raw/derived content within 24 hours after expiry or deliberate
discard, and all unfinished uploads within 24 hours of initiation. Deliberate
discard immediately denies further content access and acceptance; cancellation
alone need not discard the retained input. Qualified holds postpone physical
disposal, not ordinary access expiry; purge within 24 hours after the last blocking
hold/reference is lawfully released. Report pending/failed disposition truthfully.
Accepted facts and necessary minimal provenance follow their source retention
policy. Backup copies
follow their documented bounded custody schedule; restoration SHALL not renew
deadlines, resurrect erased payload access, grants or cancelled work. Primary
purge is not a claim that every backup copy was erased.

**C22 — One implementation and fair bounded work.** P28 SHALL reuse P30 intake,
P29 custody, source field catalog and the existing qualified job substrate. Do
not copy the parser, dedupe engine, consent store or permission resolver. No new
vendor/package is selected by D17. Qualify the numerical profile below against
actual worker memory/CPU/deadline and tenant fairness; never load all canonical
contacts into the browser or authorize by client-side filtering. Paginate previews
and results, and avoid per-row governance/catalog recomputation where safely batched.

**C23 — Activation and recovery.** Activate only after exact owners and every
reached writer/reader/export are qualified. Roll out additively with versioned
plans/adapters, inactive-by-default deployment capability and bounded tenant
activation through current P12; missing authority denies. Old workers/clients
cannot accept unknown plan versions. A kill switch stops new acceptance without
concealing durable results or deleting accepted contacts. Roll-forward and
backup restore SHALL reconcile effect receipts and current access before protected
read/egress or resumed acceptance. Do not roll back by dropping imported history.

**C24 — Traceable proof.** Record this answer, C01–C24, source conflicts and P01–P28
consistently in session/glossary now, then exact owner/ADR/OpenSpec/design/tasks
at the authorized formalization transition and tickets at the authorized issues
transition. Each implementation/release claim SHALL link actual passing evidence.
Research/probe success does not mean source APIs, hosted Supabase, UI, real files,
vendor compatibility, restore or production load are qualified.

## Initial file and custody profile

These are explicit ratified **qualification limits**, not demonstrated capacity
or universal P29 limits. Keep them centrally configured per qualified profile,
visible before upload and enforced server-side. The source owner may tighten its
field limits. A larger migration belongs in qualified P30 staff tooling, not a
silent bypass or a manual instruction to split a related graph unsafely.

| Dimension                                 | Ratified initial profile                                                        | Required boundary                                                                                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Uploaded file                             | At most 10 MiB (10 × 1,048,576 bytes)                                           | Actual bytes, not Content-Length or extension alone.                                                                                             |
| Selected-range processing rows            | At most 10,000 nonblank data rows before hidden/error/skip exclusions           | Header excluded. This resource count differs from C18’s selected business-outcome total.                                                         |
| Parsed field/cell slots                   | At most 500,000 across the entire file/workbook, including explicit empty slots | Hidden, unselected and excluded content counts. Absent sparse coordinates neither count nor allocate; claimed used-range cannot force expansion. |
| Expanded XLSX package                     | At most 128 MiB actual decompressed bytes                                       | Bound the whole archive, not only chosen-sheet XML; reject traversal and unsafe entities/references.                                             |
| ZIP members                               | At most 4,096                                                                   | Count actual members, including duplicates/unexpected parts; reject ambiguous package parts.                                                     |
| Cell text                                 | At most 32 KiB decoded UTF-8                                                    | A stricter source field limit wins; no silent truncation.                                                                                        |
| Worksheets                                | One explicitly selected worksheet per intake                                    | Show available/hidden sheets; selecting another generates a new preview. No joining sheets by guessed ID.                                        |
| Source columns                            | At most 16,384 per CSV record; XLSX format maximum XFD/16,384                   | No arbitrary 100-column cutoff. Slot/byte limits govern wide exports; map only eligible fields.                                                  |
| Working window                            | Seven days from finalized upload                                                | Immutable server timestamp; no sliding renewal from reads or worker retries.                                                                     |
| Primary purge / unfinished upload cleanup | Within 24 hours as specified in C21                                             | Access expiry is immediate at the gate; physical deletion and backup disposition are separately reported.                                        |

The delimited profile admits `.csv`, `.tsv` and `.txt` through the same qualified
parser; extension alone never identifies its dialect. The primary label remains
CSV or Excel, with supported text formats explained beside the picker.

CSV must handle quoted separators/newlines, BOM and explicit supported encoding/
delimiter profiles; uncertain decoding is reviewable, not replacement characters
silently accepted. Support UTF-8 (with/without BOM), BOM-identified UTF-16 and an
explicit Windows-1252 recovery choice for legacy exports; unsupported encodings
give a useful resave instruction. Comma, semicolon and tab detection is a suggestion
confirmed by parsed preview. Decimal/date/contact semantics are never inferred
from the machine locale. Numeric identifier/phone/postcode cells show a risk
warning where representation may already have lost precision/zeros. No algorithm
can recover an original digit that Excel already discarded.

The numbers require N−1/N/N+1, actual archive/cell accounting, cancellation,
memory/CPU and worst-distribution qualification before activation. Do not claim
10,000-row scale merely because a small model or header sample passed. No file
expiry begins until custody finalization; failed/abandoned uploads are independently
bounded. A run too near expiry to finish its qualified bounded work must explain
the deadline and stop remaining acceptance at expiry. Offer a governed new upload/run with
prior effect receipts/source lineage and new review, never renewal of the old
deadline or repetition of accepted effects.

## Lifecycle and authoritative facts

These are required meanings and transitions, not mandated database enum names.
Authority loss changes what can be read or done; it is never disguised as an
empty successful import. A run can outlive its raw-file window as a minimized
receipt, without retaining permission to read the original payload.

| Fact/state                              | Valid next action                                                                                                    | Forbidden implication                                                                           |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Upload pending / quarantined / rejected | Finish qualified custody; correct/reupload a supported file; or discard                                              | No parsing/acceptance while unsafe or incomplete; no contact exists just because bytes arrived. |
| Review draft                            | Change mapping/selected range or fix assertions; validate into a new immutable ready plan                            | Editing a plan never mutates an already approved plan or existing contact.                      |
| Ready plan                              | Deliberately accept the exact eligible selection under current authority; return to review                           | Stale/unknown authority, changed input or unreviewed rows cannot start acceptance.              |
| Running                                 | Persist row outcomes; retry the same unresolved effect; request stop                                                 | Browser closure is not cancellation; a transport timeout is not evidence of failure.            |
| Paused / needs review                   | Authorized recovery of unresolved work, or a newly reviewed remaining plan                                           | No stale worker, old grant, expired bytes or previously accepted row is replayed.               |
| Completed / completed with issues       | Read permitted receipts; correct source facts through their ordinary owner; start separately reviewed remaining work | No automatic retry of all rows or silent mutation of a completed plan.                          |
| Cancelled / expired / discarded         | Retain permitted minimal receipts; fresh authorized intake for remaining data, with prior effect reconciliation      | Terminal work does not resume by renewing a deadline, restoring a backup or recreating a job.   |

P30 owns plans, source namespaces, runs and row receipts. P29 owns protected bytes
and actual disposition. P9/P4 own accepted preparation/contact/identity facts;
P12 owns current authority and the contact/P6 owner owns applicable restriction
evidence. A preview, progress cache, mapping preset or imported timestamp cannot
become any of those authorities. Source acceptance and the required receipt/audit
are atomic; optional indexing can catch up idempotently from that durable effect.
No importer-created outward event is authorized by eventual-consistency needs.

Preserve one outcome per selected row and immutable effect history even after
correction. Reuse may create a new admitted reference/lineage without creating a
new person. Source-key uniqueness prevents duplicate effects within the exact
qualified namespace; it does not assert uniqueness of human beings. Required
history cannot cascade-delete with a disposable run or user departure. A source
occurrence date remains qualified provenance, never permission to backdate new
consent, a gift, interaction, sharing or account access.

## Adversarial findings

Severity describes consequence; likelihood describes the unamended implementation
path, not a measured incident rate. Every concern below identifies the failure,
importance, evidence, effect on A, permanent prevention and exact clauses. Overlap
is intentional: the category matrix makes every requested category explicit.

### F01 — Self-service becomes a permission or privacy bypass

**Failure/impact:** A staff importer or ordinary Party insertion publishes private
prospects, grants staff powers or denies all useful missionary intake. **Severity:
Critical for disclosure; High for blocked function. Likelihood: Likely if reused
unchanged. Evidence:** P30's staff wording, D1, P12 and current browser donor writer
([owners](d17-evidence/owner-boundaries.md), [source](d17-evidence/current-source-and-ux.md)).
**Effect:** A needs a bounded actor and restricted target, not rejection. **Fix and
exact changes:** C01–C02, C13–C15, C23. Qualify the full successful path and all
derivatives; do not treat hidden UI controls as authorization.

### F02 — A polished import invents people or silently loses information

**Failure/impact:** Couple rows are split incorrectly, shared email merges different
people, non-Western names break, numeric phone/ID/postcode loss looks valid, hidden
rows disappear, or unused columns appear imported. Staff then act on bad data.
**Severity: High. Likelihood: Likely with generic inference. Evidence:** inspected
MPDX/Tnt/Google/Mailchimp schemas and Excel/file semantics
([products](d17-evidence/source-products.md), [formats](d17-evidence/file-format-safety.md)).
**Effect:** Narrows the initial field/mapping promise, preserves useful CSV/XLSX.
**Fix and exact changes:** C03–C05, C10, C12, C18–C19; retained raw assertions are
not verified identity. Block ambiguity that changes business meaning; warn about
representation loss without pretending it can be repaired.

### F03 — Clean-looking dedupe exposes hidden records or merges the wrong person

**Failure/impact:** Cross-tenant or hidden matches leak identities; same-email
upsert overwrites a couple/church/contact; P30's old auto-merge shorthand defeats
P4. **Severity: Critical for unauthorized disclosure; High for corruption.
Likelihood: Plausible, likely with naive email upsert. Evidence:** actual P4/P30
conflict, person/household exports, source matcher differences and scoped identity
rules ([identity](d17-evidence/identity-consent-integrity.md)). **Effect:** No
automatic merge or shared bulk overwrite in A. **Fix and exact changes:** C05–C07,
C14–C15. Resolve the contradictory retained wording, scope candidate retrieval
before disclosure and use source commands rather than a global unique email key.

### F04 — Imported status bypasses consent or silently drops a prohibition

**Failure/impact:** “Subscribed” creates newsletter recipients; “donor” manufactures
financial standing; an ignored unsubscribe enables later personal outreach; a
list-specific stop becomes global DNC. **Severity: High. Likelihood: Plausible;
status columns are common. Evidence:** Mailchimp/MPDX documentation and current
P3/P6/P9/P15 source separation ([identity](d17-evidence/identity-consent-integrity.md)).
**Effect:** Narrows intake semantics, not the self-service actor. **Fix and exact
changes:** C03, C08–C09, C11. The qualified existing contactability owner must
accept and enforce adverse evidence before the affected row succeeds; otherwise
block that row. No parallel “needs consent” flag that later senders ignore.

### F05 — A retry, reordering or worker race duplicates accepted work

**Failure/impact:** A timeout is retried as a new import, row numbers change identity,
a stale worker commits after cancellation, or changed mappings repeat side effects.
Counts can look complete while rows were skipped. **Severity: High. Likelihood:
Likely under routine retries if transport alone is deduplicated. Evidence:** P30
receipt/recovery requirements, source-ID distinctions and database experiment
([database](d17-evidence/database-lifecycle.md)). **Effect:** A must include honest
resumption and bounded reimport, not a promise of arbitrary-file perfect dedupe.
**Fix and exact changes:** C07, C10–C11, C16–C18. Stable source receipts, immutable
plans, current acceptance and lease fencing; no global content-hash identity.

### F06 — A valid old preview commits invalid new authority or data

**Failure/impact:** Staff revoke permission or correct a contact after preview;
the job overwrites the correction or proceeds under cached authority. Actor/tenant
input fields can move a permitted row to a forbidden state. **Severity: Critical
for scope bypass; High for lost updates. Likelihood: Plausible and predictable
under concurrency. Evidence:** P12/P30 current-context contract and SQL semantics
([database](d17-evidence/database-lifecycle.md)). **Effect:** Adds server-side
acceptance obligations; no extra founder-facing approval. **Fix and exact changes:**
C10–C11, C14–C16, C23. Atomic ordering with permission/target changes, correct
USING/WITH CHECK and hardened privileged paths; re-review remaining changed work.

### F07 — The file path becomes a parser attack or alternate data leak

**Failure/impact:** ZIP/XML expansion exhausts workers, formulas/links execute,
malicious filenames escape storage paths, or public buckets/error downloads/logs
expose contacts and unmapped sensitive notes. **Severity: Critical for sensitive
disclosure; High for resource exhaustion. Likelihood: Plausible; current public
image helpers are inappropriate to reuse. Evidence:** current code, OWASP and file
format sources ([formats](d17-evidence/file-format-safety.md)). **Effect:** Requires
a private bounded parser/custody path, not new vendor complexity. **Fix and exact
changes:** C12–C15, C20–C22. Bound actual resources; inert parsing; current egress
projection; minimize content and do not claim CSV escaping survives every editor.

### F08 — Universal Undo deletes real work; indefinite staging becomes a data store

**Failure/impact:** Delete-by-batch erases a subsequently shared/edited contact;
archive is silently undone on reimport; files remain indefinitely; backup restore
revives cancelled jobs or expired access. **Severity: High. Likelihood: Plausible
without explicit lifecycle. Evidence:** P30's merge/undo warning, D3/D4/P29 and
finite-custody analysis ([owners](d17-evidence/owner-boundaries.md)). **Effect:**
Changes Cancel/Undo/retention wording, preserves A. **Fix and exact changes:**
C17, C21, C23. Source-owned correction, fixed working window, minimized durable
receipts, bounded primary disposal and restore gates; no new exceptional reader.

### F09 — “Easy import” hides uncertainty and creates more work

**Failure/impact:** Upload success is called imported/verified, a wide grid is
unusable on a phone, every row requires confirmation, permissions leave false
buttons, or a lost response invites duplicate upload. **Severity: Moderate;
High if misleading copy triggers unsafe action. Likelihood: Likely without an
end-to-end design. Evidence:** current local-grid limitations, comparator preview
journeys and accessibility guidance ([UX](d17-evidence/current-source-and-ux.md)).
**Effect:** Changes presentation and acceptance proof. **Fix and exact changes:**
C18–C19 plus the six-step journey; progressive disclosure, useful row forms,
preserved context, exact outcomes and no fake accuracy promise.

### F10 — A universal migration product swallows the actual contact-list job

**Failure/impact:** Per-vendor connectors, arbitrary custom schemas, full notes/
giving/history import, a generic approval system or duplicate parsers delay the
useful feature and create conflicting authorities. **Severity: Moderate; High
where owner bypass follows. Likelihood: Likely if “all tools” is read literally.
Evidence:** heterogeneous exports and P30/P31/source boundaries. **Effect:** Narrows
initial compatibility, not A. **Fix and exact changes:** C03, C09, C22. One CSV/XLSX
profile and source hints; staff-qualified migration handles genuinely broader data.
No new dependency is selected from old plans or the historical DOCX.

### F11 — A valid small import cannot survive real workloads

**Failure/impact:** Whole-file browser parsing, per-row PDP/catalog queries,
unbounded candidate scans or a large tenant monopolize workers. Progress becomes
misleading and jobs expire. **Severity: High for service degradation. Likelihood:
Plausible; actual workload performance is unmeasured. Evidence:** format expansion
mechanics and P12/P30 bounded work obligations. **Effect:** Adds explicit profile
and qualification, no speculative distributed architecture. **Fix and exact
changes:** C12, C14, C16, C18, C21–C22. Bounded pagination, indexed scoped queries,
fair scheduling using existing jobs, memory/deadline tests at every proposed limit.

### F12 — Imported assertions become a second master or unverifiable history

**Failure/impact:** A CSV timestamp overwrites canonical truth, source labels stand
in for real identity, a source namespace collides, or generic logs are the only
record of accepted changes. Corrections cannot be explained. **Severity: High.
Likelihood: Plausible without exact ownership. Evidence:** P4/P9/P30 and source
ID differences ([identity](d17-evidence/identity-consent-integrity.md)). **Effect:**
Clarifies the authority model. **Fix and exact changes:** C02–C04, C07, C11,
C14, C18, C21. One authoritative target fact, source-qualified assertion/revision,
minimal durable lineage and audit; business history is not a logging system.

### F13 — Provider/version changes and partial rollout bypass the new contract

**Failure/impact:** A renamed header maps wrongly; an old worker accepts a new plan;
legacy browser insertion bypasses safeguards; rollback deletes accepted data;
unqualified external parsing leaks PII. **Severity: High. Likelihood: Plausible
in mixed-version deployments. Evidence:** actual sample/header drift, current
writer and owner/runtime gaps. **Effect:** Adds version and rollout obligations.
**Fix and exact changes:** C10, C12, C22–C24. Versioned profiles, representative
fixtures, positive/negative actual-role proof, controlled activation, roll-forward
and no automatic dependency or processor adoption.

### F14 — The review is mistaken for a finished implementation

**Failure/impact:** Source claims, small experiments or selected A become a claim
that actual RLS, production files, user comprehension or complete parity passed;
formal owners/tickets contradict the answer. **Severity: High for false release
confidence. Likelihood: Plausible in a long multi-document program. Evidence:**
document authority, current missing pipeline and explicit experiment limits.
**Effect:** Changes traceability/proof, not A. **Fix and exact changes:** C24 and
P01–P28. Preserve ratification truth, evidence types and source conflicts; only
actual deployment evidence can close release gates.

## All requested categories, independently evaluated

“Material concern” refers to the unamended decision and reached implementation
paths. Concern references above supply all eight requested dimensions; clause
references provide exact additions. No category is omitted or accepted by silence.

| #   | Category                                                  | Material concern and checked result                                                                                                                                                                                | Required change                     |
| --- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| 1   | Problem validity, necessity, alternatives                 | **Yes — scope ambiguity.** Real export/list job is documented; no quantitative ministry demand proven. Staff-assisted/manual alternatives considered; universal migration unnecessary. F09/F10.                    | C01–C03, C19, C22                   |
| 2   | Brittleness                                               | **Yes.** Header, row kind, locale, stale formula cache and source-ID assumptions break on real exports. F02/F05/F13.                                                                                               | C03–C07, C10, C12                   |
| 3   | Technical debt                                            | **Yes.** Copying browser inserts, grids, dedupe or vendor adapters creates competing authority. F01/F10/F13.                                                                                                       | C01–C02, C14–C15, C22–C24           |
| 4   | Edge cases                                                | **Yes.** Shared emails, households, missing email, numeric loss, hidden rows, archived records and partial success checked. F02–F06/F08.                                                                           | C03–C08, C12, C17–C19               |
| 5   | Footguns                                                  | **Yes.** Auto-merge, implicit status effects, formula downloads and false Undo can harm data/users. F03/F04/F07/F08.                                                                                               | C05, C08–C09, C17, C20              |
| 6   | Tenant safety                                             | **Yes.** Files, source IDs, candidates, cache/results and jobs can mix tenant/workspace/hats. F01/F03/F06/F07.                                                                                                     | C01–C02, C06–C07, C11, C13–C15      |
| 7   | Database, RLS, authorization                              | **Yes.** Mutation state changes, privileged bypass, grants/relationships and stale authority need actual proof. Money fields are excluded, not loosely converted. F01/F06/F12.                                     | C11, C14–C16, C23                   |
| 8   | Overengineering                                           | **Yes.** Universal migration, per-vendor live connections and custom workflow engines exceed this job. F10.                                                                                                        | C03, C09, C22                       |
| 9   | UX/UI and friction                                        | **Yes.** False confidence, mobile grids, invisible exclusions and repetitive confirmations defeat simple self-service. F02/F09.                                                                                    | C18–C19; six-step journey           |
| 10  | Source of truth, ownership, invariants                    | **Yes.** Source assertions, Party truth, consent and receipt authority can be conflated. F01/F04/F12.                                                                                                              | C02–C04, C07–C11, C14               |
| 11  | Hidden coupling                                           | **Yes.** Import can accidentally depend on Party creation, staff visibility, sending, schema changes or every P30 target. F01/F04/F10.                                                                             | C02–C03, C08–C09, C22               |
| 12  | Failure modes                                             | **Yes.** Accepted write/lost response, parser failure, expired input, permission change and partial cleanup need distinct outcomes. F05–F09.                                                                       | C11–C13, C16–C18, C21               |
| 13  | Lifecycle, temporal correctness, concurrency, idempotency | **Yes.** Preview drift, worker/cancel/revoke races, source reordering and restore are material. F05/F06/F08.                                                                                                       | C07, C10–C11, C16–C18, C21, C23     |
| 14  | Data integrity                                            | **Yes.** Duplicate identity, bad normalization, unstated overwrites and missing preference evidence are realistic. F02–F06/F12.                                                                                    | C03–C08, C10–C11, C14               |
| 15  | Security/privacy                                          | **Yes.** Unmapped private data, public storage, exported formulas, logs and retained backups extend exposure. F01/F03/F07/F08.                                                                                     | C06, C12–C15, C20–C21               |
| 16  | Scalability/performance                                   | **Yes.** Archive expansion, candidate scans and whole-file UI need bounds; no measured capacity claimed. F11.                                                                                                      | C12, C14, C16, C22; initial profile |
| 17  | Operational burden                                        | **Yes.** Duplicate cleanup, generic DB repair and lost run state make staff the recovery engine. F05/F08/F09/F12.                                                                                                  | C07, C16–C19, C21–C23               |
| 18  | Observability/auditability                                | **Yes.** Logs alone cannot prove accepted effects; raw logging also leaks. F05/F07/F12/F14.                                                                                                                        | C11, C13, C18, C21, C24             |
| 19  | Dependencies/integrations                                 | **Yes.** Export drift, stale vendor docs and unqualified processors; no new live API/webhook dependency is necessary. F10/F13.                                                                                     | C10, C12, C22–C24                   |
| 20  | Migration/rollout/upgrades                                | **Yes.** Old writer/worker paths, mixed versions and unsafe rollback can bypass or erase results. F08/F13.                                                                                                         | C15–C17, C21, C23                   |
| 21  | Testability/traceability/proof                            | **Yes.** No qualified deployed pipeline or real-user evidence; ambiguity must become falsifiable outcomes. F14.                                                                                                    | C24; P01–P28                        |
| 22  | Other development hazards                                 | **Yes.** Staff support access, irreversible file repair assumptions and premature “fully supported” badges remain hazards after narrow code checks. F01/F02/F13/F14. No additional money/payment dependency found. | C01, C04, C13, C22–C24              |

## Required acceptance evidence

These are future implementation/release obligations, not a list of tests already
passed. Each ID must trace to actual source commands and observable outcomes.

| ID  | Falsifiable outcome                                                                                                                                                                                                                                                                                               |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P01 | A permitted missionary completes a clean list import without staff approval/sharing; accepted contact assertions are useful in the restricted workspace.                                                                                                                                                          |
| P02 | Other tenant, other missionary, staff/admin without source read, coach-only, public and wrong active context cannot read or mutate bytes, metadata, staging, plans, jobs, results or artifacts.                                                                                                                   |
| P03 | Missing/revoked permission is enforced at upload/read/preview/acceptance; permission administration alone exposes no file; actual role/grant/RLS paths agree.                                                                                                                                                     |
| P04 | Absent, hidden-existing and authorized-existing identity scenarios reveal no hidden-match distinction; authorized private intake still succeeds. Include counts/errors/timing-sensitive query paths.                                                                                                              |
| P05 | Shared family/church email, duplicate names, multiple phones, person/household/org rows and multiple same-email canonical records never auto-merge or choose a hidden winner.                                                                                                                                     |
| P06 | Source IDs collide across tenant/source instance/kind/workspace without crossing scope; arbitrary supplied IDs cannot bind a canonical identity.                                                                                                                                                                  |
| P07 | Same operation retry/lost response and same-file reupload recover accepted receipts; changed/reordered no-ID files receive conservative review, not false stable identity.                                                                                                                                        |
| P08 | Changed bound assertions preserve existing private/shared fields and show authorized discrepancies; ordinary source correction is separate; acceptance/reuse detects changed revisions and archived preparation remains archived.                                                                                 |
| P09 | Actual exports/fixtures cover MPDX, Tnt, Google, Outlook, Planning Center, Mailchimp and flat constituent reports; unsupported/unverified vendor formats are labeled honestly.                                                                                                                                    |
| P10 | Unicode/mononyms/couples, international addresses/phones, blank vs absent values, leading zeros and >15-digit IDs retain meaning or show actionable uncertainty; no invented repair.                                                                                                                              |
| P11 | CSV BOM/encoding/separator/quoted-newline and XLSX sheet/header/hidden rows/formula-cache cases produce exact previews; repeated/blank headers, singular mapping collisions, ragged/extra cells and merged data never overwrite or truncate silently.                                                             |
| P12 | Missing/error formula cache, malicious formulas, external references, embedded objects, encrypted/macro/renamed files, ZIP traversal/duplicate parts and XML expansion never execute/fetch or escape bounds.                                                                                                      |
| P13 | Every numerical limit is exercised at N−1/N/N+1, including hidden/unselected package content; measured peak memory/CPU/deadline fits the qualified worker envelope.                                                                                                                                               |
| P14 | Mapping/file/parser/catalog/selection/target changes invalidate old approval; all rows, not just samples, are validated; selected subset exactly matches accepted plan.                                                                                                                                           |
| P15 | Real current-authority revocation and target-edit races serialize correctly with acceptance; no stale USING/WITH CHECK path moves tenant/owner/state.                                                                                                                                                             |
| P16 | Duplicate delivery, worker crash, lease reclaim and stale worker fencing preserve one durable effect and complete per-row accounting.                                                                                                                                                                             |
| P17 | Cancel/expiry versus acceptance has one durable ordered result; accepted work remains visible to authorized readers, remaining work stops, browser closure alone does not cancel.                                                                                                                                 |
| P18 | Mid-run failures report partial success accurately; counts sum exactly; no cursor skips unprocessed lower rows; recovery changes neither historical receipts nor identity.                                                                                                                                        |
| P19 | Known negative/ambiguous contactability evidence on new/reused/otherwise unchanged rows cannot be dropped, broadened globally or bypass applicable D15 gates; current owner receipt/gate integration succeeds atomically or affected row is blocked. An unrelated independently permitted purpose remains usable. |
| P20 | No account, access, message, newsletter, gift, commitment, task, history, public release or workflow outreach is emitted by import; actual event consumers are included.                                                                                                                                          |
| P21 | Real grants/functions/views/service-role/storage/signed-link paths enforce audience and immutable scope, including direct API attempts and generic legacy writers.                                                                                                                                                |
| P22 | Error downloads honor exportability/current access and XLSX text typing; any CSV uses the one shared safe-cell implementation. Spreadsheet reopen limitations are documented and tested.                                                                                                                          |
| P23 | Seven-day expiry, early discard, unfinished upload cleanup, purge failures/holds and backup restore preserve accurate disposition and prevent renewed access/work; accepted facts survive raw expiry.                                                                                                             |
| P24 | Source-qualified reversal refuses later edits/shares/merges/independent history; correction needs no direct DB repair; current erasure/tombstone/restriction disposition prevents old-file resurrection; no universal Undo promise.                                                                               |
| P25 | Keyboard/screen-reader/mobile/320px/200%-zoom/low-bandwidth journeys complete; permission/error/partial/expired states are comprehensible and accessible.                                                                                                                                                         |
| P26 | Representative missionaries complete clean and problem-file jobs without staff intervention; no participant mistakes import for sharing, verified accuracy or newsletter enrollment. Record participants, tasks, failures and fixes; do not substitute screenshots for this evidence.                             |
| P27 | Production-shaped tenants/distributions, indexed scoped plans and fair job scheduling stay within measured worker/query budgets; one large run cannot starve other tenants.                                                                                                                                       |
| P28 | Mixed-version deployment, activation, kill switch, roll-forward and restore reconcile durable receipts/current read+egress authority; all owner/spec/design/task/test/release links agree.                                                                                                                        |

## Ordered synthesis and disposition

**Accept with required amendments.** Self-service is the right product direction
for ordinary existing contact lists. Accuracy comes from honest source assertions,
explicit mapping and owner validation, not aggressive automatic cleanup. The
strongest practical alternative remains available for genuinely complex files.

1. **Before recording the amended answer:** resolve the P30 actor/target mismatch,
   reject the conflicting auto-merge shorthand, fix the scope to eligible contact
   assertions, and distinguish source acceptance from verified identity/consent.
   This review supplied that corrected wording. The founder has now explicitly
   ratified A, C01–C24, the initial profile and the future proof obligations.
2. **At `/to-prd`:** reconcile P28/P30/P29/P9/P4/P12 and the exact P3/P6 adverse-
   evidence path; preserve ADR-0001/0209–0212 and D1/D2/D4/D5 boundaries. Put
   C01–C24, compatibility/field profile, fixed-window disposition, lifecycle and
   P01–P28 into the appropriate owner/OpenSpec/design/task artifacts. Do not create
   a blanket new ADR, schema or a second consent/permission engine.
3. **Before implementation activation:** qualify the source commands and real
   audience/grant/storage matrix first; then parser/custody/mapping and receipt-
   based acceptance; then the compact UI and recovery. Replace/bound any reached
   legacy writer. Prove positive useful intake as well as denial, real races,
   adverse-preference gates, export/disposal, mixed versions and measured limits.
4. **Before broader rollout:** test real representative source files with consent
   and redaction, real missionary comprehension and production-shaped workloads.
   Fix failures before adding source-specific convenience presets. Publish only
   compatibility actually tested. `/to-issues` separately authorizes ticket work.
5. **Monitor only residual operational variation:** use the following named
   signals after required safety proof. Monitoring never substitutes for RLS,
   source integrity, consent, parser limits or a functioning recovery path.

| Signal                                                            | Threshold                                                               | Accountable owner                 | Required response                                                                                                    |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Unauthorized read/effect or hidden-match disclosure               | Any confirmed event                                                     | Security owner + P12/P29/P9 owner | Stop affected profile/egress, preserve minimal evidence, contain and repair; no waiting for a trend.                 |
| Receipt/effect duplication or count reconciliation mismatch       | Any confirmed mismatch                                                  | P30/source owner                  | Fence affected run/profile, reconcile receipts, correct via source commands before resume.                           |
| Consent restriction missing from actual recipient gate            | Any accepted affected row without matching enforced owner receipt       | P6/contact owner                  | Block affected outreach/intake path, reconcile restrictions; never silently add global DNC.                          |
| Expired raw/staging artifact still readable or primary purge late | Any read after cutoff; any eligible purge beyond 24 hours               | P29 operations owner              | Deny access immediately, inspect references/holds/provider result, retry bounded disposal and record actual outcome. |
| Resource limit or qualified worker/query budget exceeded          | Any enforced limit escape or measured envelope breach                   | P30 runtime owner                 | Quarantine/fence the job, reduce activation/capacity as necessary and requalify; preserve accepted receipts.         |
| A source preset mis-maps a field or new export shape              | Any confirmed semantic mismatch                                         | P30 profile owner                 | Disable that preset, keep manual reviewed mapping where safe, add representative fixture and fix before re-enable.   |
| User thinks import shared/subscribed/verified contacts            | Any observed occurrence in qualification or supported production report | P28 product/UX owner              | Correct copy/flow and repeat the affected task test before treating the journey as qualified.                        |

## Verification status and limits

**Actual isolated PostgreSQL 17.11: 30/30 expected outcomes**, including eight
controlled concurrent-session lock waits and one deliberately unsafe source-key
counterexample. The experiment tested immutable plans, stable-ID repeat/reorder,
atomic source/provenance/results, stale workers, partial success and both orders
of permission, target-edit and cancellation races. A lease expiring during a
target-lock wait rolled back without advancing the outcome. Seven observed
nonsuperuser/non-BYPASSRLS roles and cleanup of the container/volume are recorded.
These are synthetic trusted-source mechanics, not actual Auth/P12/P29/P30 or
consent integration. No-ID matching, same-byte run reuse, complete protected
result egress, real scheduler/crash/failover and production suppression remain
unproved. [Exact experiment and limitations](d17-evidence/postgres-probe/README.md).

**Synthetic format experiments: 34/34 expected observations**, preserving the
initial 31 outcomes and adding three explicit-empty-slot cases. One 507,904-byte
CSV has zero populated values but 507,904 parsed slots: bounding only populated
cells would miss the resource load. Another valid delimited row has 16,385 fields;
explicit empty XML cells differ from absent sparse coordinates. These falsify
naive shortcuts; they do not test an installed production parser, spreadsheet
application execution, resource enforcement or maximum capacity.
[Results](d17-evidence/format-probe/results.json) and
[probe source](d17-evidence/format-probe/probe.py) are retained.

Three independent cross-reviews removed the unnecessary private bulk-update arm,
required adverse-evidence checks on reused rows, tightened hidden-match branching
and erased-content handling, clarified holds/discard/expiry, and counted explicit
empty cells. The final synthesis deliberately resolves the narrower research
recommendations: saved scalar formula caches are flagged assertions; ambiguous
labels may stay unresolved; initial contact-field intake remains add/reuse only.

The [artifact verification](d17-evidence/review-verification.json) checks exact
clause/proof/category coverage, local references, founder-brief integrity,
selected-versus-ratified status and retained probe/source hashes. Five public
source samples were inspected, all templates/examples rather than authenticated
exports. Thirteen cached primary technical source bodies were verified. No user
interview, real missionary file, actual UI or hosted database was tested.

Primary documentation, public samples and disposable mechanics experiments are
evidence for this decision, not proof of Core's future implementation.
No formal ADR/owner/OpenSpec, dependency, application, live
Supabase/provider, ticket, actual contact import or external communication was
changed. The founder brief remains immutable. No Q18 was asked in the original review; the subsequent continuation prepares
its independent question separately.

## Subsequent explicit ratification

On October 16, 2026 UTC the founder instructed: “Ratify this decision and
amendment. Then continue with this phase 28 grill-with-docs session.”

This ratifies the exact corrected D17 decision, C01–C24, the reviewed add/reuse-only
contact-field profile, CSV/XLSX interpretation and safety boundaries, explicit
numerical limits, seven-day working window and bounded disposal policy, and
P01–P28 as future acceptance obligations. The meaning of import remains source
acceptance rather than verified identity, contact permission, sharing or support.
The ordinary source correction path remains separate from bulk intake.

The 30/30 PostgreSQL outcomes, eight controlled races and 34/34 synthetic format
observations retain their original limits. Source/probe artifacts and the founder
brief remain unchanged. This ratifies intended behavior, not formal owner edits,
implementation, hosted Supabase, source compatibility, user testing or release
qualification. The session continues one independent product decision at a time.
