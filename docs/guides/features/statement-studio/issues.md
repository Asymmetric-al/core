# Statement Studio Issue Breakdown

This is the canonical issue map for implementing Statement Studio from the PRD.
GitHub issues **#310** (parent) and **#312–#364** (slices **SS-00** through
**SS-26**) were published on 2026-06-12. Use the GitHub issue numbers for
implementation work; keep `SS-##` draft IDs here for cross-reference with the
PRD and planning docs.

**HITL** (human-in-the-loop): slices that need product, legal, care, or legacy
removal decisions before an agent implements them alone.

**AFK** (away-from-keyboard): slices an agent can implement after reading the PRD
and dependencies, subject to normal review.

## Published GitHub Issues

Canonical GitHub issues were published on 2026-06-12. Temporary duplicates
created during publication were closed with comments that point back to the
canonical issue.

Parent issue:
[#310](https://github.com/Asymmetric-al/core/issues/310) - AL-310: PRD -
Statement Studio rebuild and implementation backlog

| Draft ID | GitHub Issue                                             | Type | Blocked By                               |
| -------- | -------------------------------------------------------- | ---- | ---------------------------------------- |
| SS-00    | [#312](https://github.com/Asymmetric-al/core/issues/312) | HITL | None                                     |
| SS-01    | [#314](https://github.com/Asymmetric-al/core/issues/314) | AFK  | #312                                     |
| SS-02    | [#316](https://github.com/Asymmetric-al/core/issues/316) | AFK  | #314                                     |
| SS-03    | [#318](https://github.com/Asymmetric-al/core/issues/318) | AFK  | #314                                     |
| SS-04    | [#320](https://github.com/Asymmetric-al/core/issues/320) | AFK  | #316, #318                               |
| SS-05    | [#322](https://github.com/Asymmetric-al/core/issues/322) | AFK  | #320                                     |
| SS-06    | [#324](https://github.com/Asymmetric-al/core/issues/324) | AFK  | #322                                     |
| SS-07    | [#326](https://github.com/Asymmetric-al/core/issues/326) | AFK  | #322                                     |
| SS-08    | [#328](https://github.com/Asymmetric-al/core/issues/328) | AFK  | #314, #322                               |
| SS-09    | [#330](https://github.com/Asymmetric-al/core/issues/330) | AFK  | #320, #328                               |
| SS-10    | [#332](https://github.com/Asymmetric-al/core/issues/332) | AFK  | #322                                     |
| SS-11    | [#334](https://github.com/Asymmetric-al/core/issues/334) | AFK  | #332                                     |
| SS-12    | [#336](https://github.com/Asymmetric-al/core/issues/336) | AFK  | #322, #328                               |
| SS-13    | [#338](https://github.com/Asymmetric-al/core/issues/338) | AFK  | #336                                     |
| SS-14    | [#340](https://github.com/Asymmetric-al/core/issues/340) | AFK  | #336                                     |
| SS-15    | [#342](https://github.com/Asymmetric-al/core/issues/342) | AFK  | #340                                     |
| SS-16    | [#344](https://github.com/Asymmetric-al/core/issues/344) | AFK  | #336                                     |
| SS-17    | [#346](https://github.com/Asymmetric-al/core/issues/346) | AFK  | #344                                     |
| SS-18    | [#348](https://github.com/Asymmetric-al/core/issues/348) | AFK  | #336                                     |
| SS-19    | [#350](https://github.com/Asymmetric-al/core/issues/350) | HITL | #326, #348                               |
| SS-20    | [#352](https://github.com/Asymmetric-al/core/issues/352) | AFK  | #336                                     |
| SS-21    | [#354](https://github.com/Asymmetric-al/core/issues/354) | HITL | #326, #352                               |
| SS-22    | [#356](https://github.com/Asymmetric-al/core/issues/356) | AFK  | #330, #336                               |
| SS-23    | [#358](https://github.com/Asymmetric-al/core/issues/358) | AFK  | #318, #336                               |
| SS-24    | [#360](https://github.com/Asymmetric-al/core/issues/360) | AFK  | #326, #336                               |
| SS-25    | [#362](https://github.com/Asymmetric-al/core/issues/362) | HITL | #322, #332, #338                         |
| SS-26    | [#364](https://github.com/Asymmetric-al/core/issues/364) | AFK  | #340, #342, #346, #350, #354, #360, #362 |

## Triggers

Use this document when creating GitHub issues, planning implementation slices,
or checking whether a Statement Studio implementation issue is complete enough
for an AFK agent.

Use it for:

- Statement Studio issue creation.
- Splitting the PRD into vertical slices.
- Checking issue dependencies.
- Checking which slices require human review.
- Keeping Supabase, tenant-safety, UX, variables, assignments, retention, and
  cross-app requirements attached to every implementation slice.

## Workflow Steps

1. Read the Statement Studio PRD first.
2. Read Phase 0 and supporting Statement Studio docs before implementation.
3. Use the issue overview to confirm slice granularity and dependencies.
4. Track work on the published GitHub issues in the table below; open new issues
   only when the PRD changes materially (use the `to-issues` skill).
5. When adding new slices, create blocker issues first so later issues can
   reference real tracker IDs.
6. Apply exactly one repo label from each issue-label category:
   complexity, status, and type.
7. For any database, RLS, Storage, Auth, migration, seed, or Supabase client
   work, load the repo Supabase skill and use the Supabase CLI.
8. For schema, RLS, indexes, query, or migration performance work, also load
   the Supabase Postgres best-practices skill.
9. For UI work, load frontend rules and use shared `@asym/ui` and Maia/Zinc
   design tokens.
10. For Next.js work, read the installed Next.js docs before coding.

## Research Basis

This breakdown is grounded in:

- Statement Studio PRD and supporting docs under the feature guide.
- Existing legacy PDF Studio UI and Unlayer path.
- Existing `pdf_templates` storage and native PDF migration.
- Existing donor receipt and annual statement routes.
- Existing donor portal ownership checks for receipts and statements.
- Existing missionary portal support, donors, and tasks data.
- Existing admin CRM report and contribution/staged gift flows.
- Existing events, mobilization, tasks, sign, care, and support surfaces.
- OpenSpec platform boundaries: Mission Control owns staff operational depth;
  donor and missionary dashboards expose role-scoped slices.
- Repo frontend rules requiring shared `@asym/ui` primitives and Maia/Zinc
  tokens.
- Repo backend and Supabase rules requiring tenant-safe data access, RLS,
  explicit grants, private Storage, and CLI-backed migrations.

## Proposed Issue Overview

**Note:** The table below is an **archival planning view** with `SS-##` draft
IDs and user-story columns for PRD cross-reference. **Implementation tracking
uses the Published GitHub Issues table above** (`#312`–`#364`). Do not treat
both tables as independent sources of truth—when they diverge, GitHub issue
numbers win.

| Draft ID | Title                                                                       | Type | Blocked By                                      | User Stories                             |
| -------- | --------------------------------------------------------------------------- | ---- | ----------------------------------------------- | ---------------------------------------- |
| SS-00    | Phase 0 Statement Studio audit and first-slice confirmation                 | HITL | None                                            | 44                                       |
| SS-01    | Show the annual giving starter in a tenant-safe Statement Studio shell      | AFK  | SS-00                                           | 1, 2, 8, 44                              |
| SS-02    | Clone the annual giving starter into a draft and validate template schema   | AFK  | SS-01                                           | 2, 4, 5, 34, 35, 36                      |
| SS-03    | Add annual statement variables with source maps and safe previews           | AFK  | SS-01                                           | 4, 33, 34, 36, 37, 39                    |
| SS-04    | Publish and assign the annual giving statement default                      | AFK  | SS-02, SS-03                                    | 4, 5, 6, 8, 9, 13                        |
| SS-05    | Render annual giving statement PDFs as private donor artifacts              | AFK  | SS-04                                           | 20, 21, 40                               |
| SS-06    | Add version history and rollback for annual statement defaults              | AFK  | SS-05                                           | 7, 40                                    |
| SS-07    | Add Generated PDFs retention and manual purge MVP                           | AFK  | SS-05                                           | 40, 41, 43                               |
| SS-08    | Add tenant capability settings for Statement Studio actions                 | AFK  | SS-01, SS-05                                    | 11, 12, 43                               |
| SS-09    | Add custom assignment flow using a greenfield letterhead template           | AFK  | SS-04, SS-08                                    | 3, 9, 10, 37                             |
| SS-10    | Render single donor receipt PDFs through Statement Studio                   | AFK  | SS-05                                           | 13, 14, 20, 21                           |
| SS-11    | Use receipt defaults for staged gift receipt resend                         | AFK  | SS-10                                           | 15, 16, 40                               |
| SS-12    | Prove table and repeater rendering with missionary donor lists              | AFK  | SS-05, SS-08                                    | 22, 23, 24, 35                           |
| SS-13    | Render missionary monthly giving statements in the Missionary Dashboard     | AFK  | SS-12                                           | 22, 24, 40                               |
| SS-14    | Generate admin finance report PDFs from existing report slices              | AFK  | SS-12                                           | 16, 18, 19                               |
| SS-15    | Generate bookkeeping deposit and reconciliation packets                     | AFK  | SS-14                                           | 16, 17, 40                               |
| SS-16    | Generate event attendee badges and registration receipts                    | AFK  | SS-12                                           | 25, 26, 35                               |
| SS-17    | Generate event rosters, schedules, meal, and rooming PDFs                   | AFK  | SS-16                                           | 25, 26, 35                               |
| SS-18    | Generate support report PDFs from support/member-care report data           | AFK  | SS-12                                           | 31, 40                                   |
| SS-19    | Generate member-care private packets with redaction and audit review        | HITL | SS-07, SS-18                                    | 32, 40, 43                               |
| SS-20    | Generate mobilization candidate packets and task lists                      | AFK  | SS-12                                           | 27, 28, 35                               |
| SS-21    | Generate legal/sign audit certificates and completed packet exports         | HITL | SS-07, SS-20                                    | 29, 30, 40, 43                           |
| SS-22    | Expand the Starter Library with readiness states and safe sample data       | AFK  | SS-09, SS-12                                    | 2, 3, 16, 17, 18, 25, 27, 28, 29, 31, 32 |
| SS-23    | Expand Variables for tenant custom fields and document families             | AFK  | SS-03, SS-12                                    | 33, 34, 35, 36, 37, 38, 39               |
| SS-24    | Add batch rendering and storage-threshold cleanup                           | AFK  | SS-07, SS-12                                    | 16, 17, 18, 25, 40, 42                   |
| SS-25    | Remove legacy PDF Studio and Unlayer confusion after production slices land | HITL | SS-05, SS-10, SS-13                             | 1, 44                                    |
| SS-26    | Complete cross-app integration verification and regression fixtures         | AFK  | SS-14, SS-15, SS-17, SS-19, SS-21, SS-24, SS-25 | 20, 22, 25, 26, 31, 32, 40, 44           |

## Approval Questions

Resolved for the 2026-06-12 publication (#310, #312–#364). Revisit only if the
PRD scope changes:

- Does this granularity feel right, or should some family slices be split more?
- Are the blockers correct, especially for generated artifacts, retention, and
  cross-dashboard downloads?
- Should `SS-19`, `SS-21`, and `SS-25` stay HITL because they involve sensitive
  care/legal/legacy-removal decisions?
- Should any high-risk family, such as finance/bookkeeping or events, be split
  into more production-ready issues before implementation starts?

## Issue Drafts

Archival copy of the original slice specs. **GitHub issues #312–#364 are the
source of truth** for titles, labels, and acceptance criteria; update trackers
there first, then sync this section only when the PRD breakdown changes.

### SS-00: Phase 0 Statement Studio audit and first-slice confirmation

Type: HITL

Suggested labels: `complexity:medium`, `status:ready`, `type:docs`

User stories covered: 44

#### What to build

Produce the required Phase 0 audit brief for Statement Studio. The brief must
inventory the current PDF Studio, Unlayer, native builder, donor receipt,
annual statement, report, event, missionary, care, task, legal, CMS, migration,
Storage, and test behavior. It must classify what to reuse, replace, retire, or
delete, and it must confirm whether `donor.statement.annual_giving` is still
the best first production slice.

#### Acceptance criteria

- [ ] The audit identifies current legacy PDF Studio and Unlayer dependencies.
- [ ] The audit identifies current donor receipt and annual statement behavior.
- [ ] The audit identifies existing data owner boundaries for donor,
      missionary, events, finance, reports, care, legal, tasks, and CMS.
- [ ] The audit identifies current Supabase/RLS/Storage posture and risks.
- [ ] The audit recommends what to reuse, replace, retire, or delete.
- [ ] The audit confirms the first production slice or documents a better
      first slice with evidence.
- [ ] The audit remains concise enough for implementation agents to act on.

#### Blocked by

None - can start immediately.

### SS-01: Show the annual giving starter in a tenant-safe Statement Studio shell

Type: AFK

Suggested labels: `complexity:hard`, `status:blocked`, `type:feature`

User stories covered: 1, 2, 8, 44

#### What to build

Create the first usable Statement Studio shell in Mission Control and wire it to
a tenant-safe starter catalog containing `donor.statement.annual_giving`. The
slice should include enough schema, RLS, grants, seed data, and UI to show the
Starter Library inside Templates with readiness, owner surface, job key, and
tenant-safe empty states.

#### Acceptance criteria

- [ ] Mission Control exposes Statement Studio as the staff-facing product name.
- [ ] The Templates section includes a Starter Library.
- [ ] The annual giving statement starter is visible with readiness and owner
      metadata.
- [ ] Tenant-owned rows and system starter rows are separated safely.
- [ ] Database work uses the Supabase skill, Supabase Postgres skill where
      applicable, and Supabase CLI verification.
- [ ] UI uses shared `@asym/ui` primitives and Maia/Zinc tokens.
- [ ] A focused test or smoke check proves tenant A cannot see tenant B tenant
      templates.

#### Blocked by

- SS-00

### SS-02: Clone the annual giving starter into a draft and validate template schema

Type: AFK

Suggested labels: `complexity:hard`, `status:blocked`, `type:feature`

User stories covered: 2, 4, 5, 34, 35, 36

#### What to build

Let a tenant admin clone the annual giving starter into a tenant draft backed by
the Asym-owned template schema. The draft must be editable through a minimal
PDF-native editor surface, validate before save, and remain distinct from
published versions.

#### Acceptance criteria

- [ ] A tenant admin can clone the annual giving starter into a tenant draft.
- [ ] Draft source uses the Asym-owned constrained JSON schema, not JSX,
      Unlayer design JSON, raw pdfx registry JSON, HTML, or direct React props.
- [ ] The editor supports enough blocks to represent the annual statement
      starter.
- [ ] Validation catches malformed blocks, unsupported fields, unsafe assets,
      and missing required document settings.
- [ ] Drafts are not assignable as production defaults.
- [ ] Unit tests cover schema validation and draft lifecycle behavior.

#### Blocked by

- SS-01

### SS-03: Add annual statement variables with source maps and safe previews

Type: AFK

Suggested labels: `complexity:hard`, `status:blocked`, `type:feature`

User stories covered: 4, 33, 34, 36, 37, 39

#### What to build

Add the first Variables section and variable registry for the annual giving
statement. Variables must have source maps, friendly labels, sample values,
sensitivity/readiness metadata, validation behavior, and safe sample preview.
Production data must still be resolved server-side later; client preview data
must not become authoritative.

#### Acceptance criteria

- [ ] Annual statement variables are grouped and searchable in a Variables
      section.
- [ ] Each built-in variable has a source map with owner, resolver contract,
      scope, sensitivity, fallback, sample value, and readiness state.
- [ ] The template editor can insert approved annual statement variables.
- [ ] Safe sample preview works without real tenant donor data.
- [ ] Real-data preview entry points are permission-gated even if production
      rendering lands in a later slice.
- [ ] Normal admins do not see SQL, JSON paths, resolver internals, or raw
      table names in the UI.

#### Blocked by

- SS-01

### SS-04: Publish and assign the annual giving statement default

Type: AFK

Suggested labels: `complexity:hard`, `status:blocked`, `type:feature`

User stories covered: 4, 5, 6, 8, 9, 13

#### What to build

Add immutable publishing and tenant default assignment for
`donor.statement.annual_giving`. A tenant admin must be able to publish a draft
as a version, assign that published version as the default, and see the plain
language impact of the assignment before saving.

#### Acceptance criteria

- [ ] Publishing creates an immutable version with content hash and metadata.
- [ ] Only published versions can be assigned for production use.
- [ ] Assignment resolution supports the tenant-wide annual statement default.
- [ ] The Assignments UI shows the current annual statement default and unassigned
      state clearly.
- [ ] The publish-and-use flow is explicit about future annual statements only.
- [ ] Assignment changes are audited with actor, timestamp, old version, new
      version, job key, scope, and optional note.
- [ ] Database constraints prevent multiple active defaults for the same tenant,
      job, and scope.

#### Blocked by

- SS-02
- SS-03

### SS-05: Render annual giving statement PDFs as private donor artifacts

Type: AFK

Suggested labels: `complexity:hard`, `status:blocked`, `type:feature`

User stories covered: 20, 21, 40

#### What to build

Render `donor.statement.annual_giving` through Statement Studio using
server-built tenant-scoped donor data, store the generated PDF in private
Storage, create artifact metadata, and expose the download through the Donor
Dashboard boundary only to the owning donor.

#### Acceptance criteria

- [ ] Production render resolves data on the server from the owning donor/giving
      context.
- [ ] The generated PDF uses the assigned published template version.
- [ ] Artifact metadata records tenant, job key, donor reference, template
      version, render timestamp, file size, hash, and retention class.
- [ ] The file is stored in private Supabase Storage.
- [ ] Donor Dashboard download succeeds for the owning donor.
- [ ] Donor Dashboard download fails for another donor and another tenant.
- [ ] Historical artifacts are not rewritten when the default assignment changes.
- [ ] Render and access tests cover tenant and donor isolation.

#### Blocked by

- SS-04

### SS-06: Add version history and rollback for annual statement defaults

Type: AFK

Suggested labels: `complexity:medium`, `status:blocked`, `type:feature`

User stories covered: 7, 40

#### What to build

Add version history and rollback for annual statement defaults. A tenant admin
must be able to inspect published versions, see assignment history, and restore
a previous version for future renders without changing historical artifacts.

#### Acceptance criteria

- [ ] Published versions show version number, status, actor, timestamp, and
      current/default usage.
- [ ] Assignment history shows old version, new version, actor, timestamp, and
      note.
- [ ] Rollback is a saved action that assigns a previous published version.
- [ ] Rollback affects future renders only.
- [ ] Existing generated artifacts remain linked to their original version.
- [ ] Tests cover rollback and artifact immutability.

#### Blocked by

- SS-05

### SS-07: Add Generated PDFs retention and manual purge MVP

Type: AFK

Suggested labels: `complexity:hard`, `status:blocked`, `type:feature`

User stories covered: 40, 41, 43

#### What to build

Add the Generated PDFs section with artifact search, retention state, manual
purge for eligible files, and audit tombstones. The MVP must keep private
Storage files and Postgres metadata consistent.

#### Acceptance criteria

- [ ] Staff with permission can browse generated PDFs by job, class, recipient,
      status, date, and retention state.
- [ ] Manual purge is available only for eligible files.
- [ ] Protected legal, tax, finance, care/private, and sensitive classes require
      explicit policy before purge.
- [ ] Purge deletes the Storage object through the Storage API.
- [ ] Purge leaves metadata and audit tombstones.
- [ ] Purge records actor, timestamp, reason, file identity, and retention class.
- [ ] Tests cover purge eligibility, authorization, file deletion, and tombstone
      retention.

#### Blocked by

- SS-05

### SS-08: Add tenant capability settings for Statement Studio actions

Type: AFK

Suggested labels: `complexity:hard`, `status:blocked`, `type:feature`

User stories covered: 11, 12, 43

#### What to build

Add tenant-configurable capability settings for Statement Studio actions while
preserving platform safety floors. Capabilities must control template viewing,
draft editing, publishing, assignment, real-data preview, production rendering,
artifact access, purge, retention, variables, and sensitive document classes.

#### Acceptance criteria

- [ ] Settings expose capability groups in plain language.
- [ ] Tenant admins can configure who can perform each allowed action.
- [ ] Platform safety floors cannot be disabled.
- [ ] Donor and missionary surface access remains subject-scoped regardless of
      tenant settings.
- [ ] Service-role/server-only operations are never exposed as client
      capabilities.
- [ ] UI hidden states are backed by server authorization checks.
- [ ] Tests cover denied publish, denied assignment, denied real-data preview,
      denied purge, and denied sensitive artifact access.

#### Blocked by

- SS-01
- SS-05

### SS-09: Add custom assignment flow using a greenfield letterhead template

Type: AFK

Suggested labels: `complexity:medium`, `status:blocked`, `type:feature`

User stories covered: 3, 9, 10, 37

#### What to build

Let a tenant admin clone a greenfield `letterhead.simple` starter, publish it,
and map it to a tenant-created custom document assignment constrained to an
approved surface and context contract. The flow must stay no-code and
plain-language.

#### Acceptance criteria

- [ ] The Starter Library includes `letterhead.simple`.
- [ ] A tenant admin can clone, edit, preview, publish, and assign the letterhead
      template.
- [ ] A tenant admin can create a custom document purpose with approved surface,
      scope type, labels, visibility, and capabilities.
- [ ] The UI does not expose raw resolver names, SQL, JSON paths, or schema-like
      setup to normal admins.
- [ ] Custom assignments are constrained to approved surfaces and tenant scopes.
- [ ] Assignment validation catches invalid scope, missing published version, and
      unavailable variables.

#### Blocked by

- SS-04
- SS-08

### SS-10: Render single donor receipt PDFs through Statement Studio

Type: AFK

Suggested labels: `complexity:hard`, `status:blocked`, `type:feature`

User stories covered: 13, 14, 20, 21

#### What to build

Wire `donor.receipt.single` through the same Statement Studio assignment,
render, artifact, and Donor Dashboard access path proven by annual statements.
The receipt must use settled gift truth and preserve donor trust around
designation, refunds/corrections, and receipt metadata.

#### Acceptance criteria

- [ ] `donor.receipt.single` has a starter template, variables, and assignment
      eligibility.
- [ ] Receipt render uses server-built settled gift data from the giving owner.
- [ ] Receipt artifact records exact published template version and gift
      reference.
- [ ] Donor Dashboard receipt download uses artifact access and donor ownership.
- [ ] Receipt output includes required receipt fields, gift amount, date,
      designation, tenant identity, and receipt identifier.
- [ ] Tests cover owning donor access, non-owning donor denial, corrected/voided
      metadata where available, and missing receipt eligibility.

#### Blocked by

- SS-05

### SS-11: Use receipt defaults for staged gift receipt resend

Type: AFK

Suggested labels: `complexity:medium`, `status:blocked`, `type:feature`

User stories covered: 15, 16, 40

#### What to build

Connect staged gift receipt resend to the tenant's assigned
`donor.receipt.single` or `finance.receipt.staged_gift` template, preserving
admin audit history and avoiding duplicate or unaudited receipt outputs.

#### Acceptance criteria

- [ ] Admin staged gift receipt resend uses a Statement Studio template default.
- [ ] The correct receipt job is selected for staged gift context.
- [ ] Rendered artifacts are linked to staged gift and receipt send audit.
- [ ] The admin action reports success/failure clearly.
- [ ] Retry/replay behavior avoids duplicate unaudited artifacts.
- [ ] Tests cover approved staged gift, failed staged gift, retry, and access
      control.

#### Blocked by

- SS-10

### SS-12: Prove table and repeater rendering with missionary donor lists

Type: AFK

Suggested labels: `complexity:hard`, `status:blocked`, `type:feature`

User stories covered: 22, 23, 24, 35

#### What to build

Add table/repeater rendering by shipping `missionary.donor_list` end to end.
The document must render a missionary-authorized donor list with privacy,
anonymous donor, contact preference, and field-redaction rules enforced by the
server resolver.

#### Acceptance criteria

- [ ] Template schema supports repeaters/tables with headers, row data, empty
      state, page breaks, and long value handling.
- [ ] `missionary.donor_list` has starter template, variables, and assignment
      eligibility.
- [ ] Production render uses a server-side missionary-scoped resolver.
- [ ] Missionary Dashboard download is authorized only for the assigned
      missionary.
- [ ] Privacy and redaction rules are enforced before render.
- [ ] Tests cover active/lapsed donors, anonymous donors, missing contact data,
      large donor lists, page breaks, and unauthorized access.

#### Blocked by

- SS-05
- SS-08

### SS-13: Render missionary monthly giving statements in the Missionary Dashboard

Type: AFK

Suggested labels: `complexity:hard`, `status:blocked`, `type:feature`

User stories covered: 22, 24, 40

#### What to build

Wire `missionary.statement.monthly_giving` through Statement Studio with
missionary-scoped support and giving data. The Missionary Dashboard must expose
only authorized statement downloads and keep tenant-wide finance controls in
Mission Control.

#### Acceptance criteria

- [ ] Monthly giving statement has starter template, variables, and assignment
      eligibility.
- [ ] Statement render uses server-built missionary support/giving data.
- [ ] Missionary Dashboard shows or downloads the missionary's authorized
      statement artifact.
- [ ] The document includes support totals, gift activity, period, tenant
      branding, and generated metadata.
- [ ] Tests cover authorized missionary access, wrong missionary denial, empty
      month, large month, and redacted/private donor data.

#### Blocked by

- SS-12

### SS-14: Generate admin finance report PDFs from existing report slices

Type: AFK

Suggested labels: `complexity:hard`, `status:blocked`, `type:feature`

User stories covered: 16, 18, 19

#### What to build

Add Statement Studio PDF output for existing admin report slices, starting with
donors, funds, missionaries, and reconciliation-ready report data. The PDF path
must preserve filters, generated timestamp, totals, table data, and audit
metadata while leaving CSV export intact.

#### Acceptance criteria

- [ ] At least one admin report slice can render to PDF through Statement
      Studio.
- [ ] Report PDF uses tenant-scoped report data from the owning report domain.
- [ ] Generated PDF preserves filters, range, section title, table rows, totals,
      and generated-at metadata.
- [ ] CSV export continues to work.
- [ ] Report artifacts are tenant-scoped and audit logged.
- [ ] Tests cover tenant isolation, empty report, large report, and export audit.

#### Blocked by

- SS-12

### SS-15: Generate bookkeeping deposit and reconciliation packets

Type: AFK

Suggested labels: `complexity:hard`, `status:blocked`, `type:feature`

User stories covered: 16, 17, 40

#### What to build

Add readable bookkeeping PDFs for deposit batch cover sheets, donation batch
detail, payout reconciliation, refund/dispute logs, failed pledge attempts, GL
summary, fund allocation report, restricted-fund rollforward, and receipt batch
manifest where underlying data is available. CSV remains the operational export
where appropriate.

#### Acceptance criteria

- [ ] At least deposit batch cover sheet and one reconciliation packet render
      through Statement Studio.
- [ ] Bookkeeping artifacts use private Storage and finance/audit retention.
- [ ] Templates support signer/reviewer metadata and generated timestamp.
- [ ] The UI clearly distinguishes readable PDFs from operational CSV exports.
- [ ] Tests cover empty batch, multi-fund allocations, refunds/disputes, and
      access denial for non-finance roles.

#### Blocked by

- SS-14

### SS-16: Generate event attendee badges and registration receipts

Type: AFK

Suggested labels: `complexity:hard`, `status:blocked`, `type:feature`

User stories covered: 25, 26, 35

#### What to build

Add `events.badge.attendee` and `events.registration_receipt` as end-to-end
Statement Studio jobs. Event staff must be able to assign templates for an
event, preview with sample or authorized event data, render badges/receipts,
and access artifacts for that event only.

#### Acceptance criteria

- [ ] Event badge and registration receipt starters exist with readiness and
      variables.
- [ ] Event-scoped default assignment works.
- [ ] Event render uses server-side event/attendee/registration data.
- [ ] Badge output handles attendee name, ticket type, event, QR/barcode or
      check-in code where available, and tenant branding.
- [ ] Receipt output handles registration/payment/status fields where available.
- [ ] Tests cover attendee, speaker/volunteer readiness, cancelled/no-show
      attendee, missing fields, and wrong-event access denial.

#### Blocked by

- SS-12

### SS-17: Generate event rosters, schedules, meal, and rooming PDFs

Type: AFK

Suggested labels: `complexity:medium`, `status:blocked`, `type:feature`

User stories covered: 25, 26, 35

#### What to build

Expand event PDFs beyond badges into attendee/check-in rosters, session
schedules, rooming lists, meal/dietary lists, volunteer assignments, speaker
itineraries, waiver packets, and attendance certificates where source data is
available or starter-only where source data is not production ready.

#### Acceptance criteria

- [ ] Event roster and session schedule render through Statement Studio.
- [ ] Meal/dietary and rooming templates exist with accurate readiness states.
- [ ] Large rosters paginate correctly.
- [ ] Sensitive dietary/accessibility details are permission-gated.
- [ ] Event artifacts are scoped to the event and tenant.
- [ ] Tests cover large roster, empty event, dietary fields, rooming fields, and
      wrong-event access denial.

#### Blocked by

- SS-16

### SS-18: Generate support report PDFs from support/member-care report data

Type: AFK

Suggested labels: `complexity:medium`, `status:blocked`, `type:feature`

User stories covered: 31, 40

#### What to build

Add Statement Studio PDF output for support report slices such as first
response, resolution, inbox overview, agent activity, label mix, and SLA
summary. These PDFs must preserve report filters, charts/tables where
available, and support-team permissions.

#### Acceptance criteria

- [ ] At least first response and resolution report PDFs render through
      Statement Studio.
- [ ] Report filters and generated timestamp appear in the PDF.
- [ ] Report data remains owned by the support/reporting domain.
- [ ] Artifacts are tenant-scoped and permission-gated.
- [ ] Tests cover empty report, date range, agent/team scope, and unauthorized
      access.

#### Blocked by

- SS-12

### SS-19: Generate member-care private packets with redaction and audit review

Type: HITL

Suggested labels: `complexity:hard`, `status:blocked`, `type:feature`

User stories covered: 32, 40, 43

#### What to build

Add care person profiles, care plans, activity logs, private packets, crisis
response packets, debrief summaries, and pastoral-care summaries behind strict
care permissions. This slice requires human review of redaction, sensitivity,
retention, and audit posture before production enablement.

#### Acceptance criteria

- [ ] Care/private packet templates exist with sensitivity and readiness states.
- [ ] Production render uses care-owned resolvers that apply redaction before
      rendering.
- [ ] Private notes and sensitive fields require elevated permission.
- [ ] Retention policy defaults are explicit and tenant configurable within
      platform safety floors.
- [ ] Artifact access is audited with actor, timestamp, document class, and
      reason where required.
- [ ] Human review signs off on redaction, access, and retention behavior before
      production enablement.
- [ ] Tests cover private note exclusion, elevated access, denied access, and
      audit events.

#### Blocked by

- SS-07
- SS-18

### SS-20: Generate mobilization candidate packets and task lists

Type: AFK

Suggested labels: `complexity:medium`, `status:blocked`, `type:feature`

User stories covered: 27, 28, 35

#### What to build

Add Statement Studio outputs for mobilization candidate packets, applications,
interview packets, reference requests, vetting checklists, onboarding packets,
training checklists, deployment checklists, support raising plans, and assigned
task lists. Start with a candidate packet and assigned task list end to end.

#### Acceptance criteria

- [ ] Candidate packet and assigned task list starters exist with variables and
      readiness states.
- [ ] Candidate-scoped assignment and preview work for approved scopes.
- [ ] Production render uses server-side mobilization/task data where available.
- [ ] Packet output includes stage, readiness, tasks/checklists, and generated
      metadata.
- [ ] Tests cover applied, vetting, training, ready, empty checklist, large task
      list, and wrong-scope access denial.

#### Blocked by

- SS-12

### SS-21: Generate legal/sign audit certificates and completed packet exports

Type: HITL

Suggested labels: `complexity:hard`, `status:blocked`, `type:feature`

User stories covered: 29, 30, 40, 43

#### What to build

Add legal/compliance and signing outputs for audit certificates, completed
document packet exports, waiver/consent forms, policy packets, conflict of
interest forms, volunteer agreements, safeguarding acknowledgements, and
signature summaries. This slice requires human review for legal copy,
retention, and audit evidence.

#### Acceptance criteria

- [ ] Audit certificate and completed packet export render through Statement
      Studio.
- [ ] Signature metadata, signer identity, timestamps, packet version, and audit
      evidence are included where available.
- [ ] Legal/tax/sensitive retention defaults are explicit and protected.
- [ ] Downloads are permission-gated and audited.
- [ ] Human review signs off on legal copy, audit metadata, and retention class.
- [ ] Tests cover signed packet, unsigned/incomplete packet, wrong user access,
      and audit metadata.

#### Blocked by

- SS-07
- SS-20

### SS-22: Expand the Starter Library with readiness states and safe sample data

Type: AFK

Suggested labels: `complexity:medium`, `status:blocked`, `type:feature`

User stories covered: 2, 3, 16, 17, 18, 25, 27, 28, 29, 31, 32

#### What to build

Expand the Starter Library so tenants can see the breadth of Statement Studio
out of the box. Add white-label, tenant-brand-token driven starters across
greenfield, donor, missionary, finance, bookkeeping, reports, leadership,
support/care, events, mobilization, mission operations, legal/compliance,
tasks, sign, and CMS/public context families with accurate readiness states.

#### Acceptance criteria

- [ ] Starter templates cover all major families listed in the PRD at an
      appropriate initial depth.
- [ ] Each starter has job key, display name, owner surface, scope shape,
      confidentiality, default eligibility, readiness, and sample data.
- [ ] Starters are white-label and tenant-brand-token driven.
- [ ] The Starter Library is searchable and filterable by family, readiness,
      surface, sensitivity, and output type.
- [ ] Template-ready starters are not presented as production ready.
- [ ] Safe sample fixtures cover normal, empty, large, and important edge cases.

#### Blocked by

- SS-09
- SS-12

### SS-23: Expand Variables for tenant custom fields and document families

Type: AFK

Suggested labels: `complexity:hard`, `status:blocked`, `type:feature`

User stories covered: 33, 34, 35, 36, 37, 38, 39

#### What to build

Expand Variables beyond the annual statement into a governed registry for all
major document families. Add tenant labels, grouping, fallbacks, sample values,
approved custom fields, safe no-code derived variables, usage impact, lifecycle
states, and compatibility aliases without exposing code-like internals.

#### Acceptance criteria

- [ ] Variables exist for donor, giving, fund/project, missionary, finance,
      events, care/support, legal/signing, reports/leadership, CMS, and
      system/audit families.
- [ ] Tenant admins can customize labels, grouping, formatting, fallbacks, and
      sample values.
- [ ] Tenant admins can register approved custom-field variables for allowed
      entities.
- [ ] Safe derived variables support approved transforms only.
- [ ] Deleting or changing variables with active template usage is blocked or
      versioned safely.
- [ ] Validation catches unavailable, deprecated, incompatible, unsafe, or
      missing variables in plain language.
- [ ] Tests cover source-map validation, custom field permissions, derived
      variable output, aliases, and tenant isolation.

#### Blocked by

- SS-03
- SS-12

### SS-24: Add batch rendering and storage-threshold cleanup

Type: AFK

Suggested labels: `complexity:hard`, `status:blocked`, `type:feature`

User stories covered: 16, 17, 18, 25, 40, 42

#### What to build

Add batch rendering for eligible document jobs and tenant-configurable storage
threshold cleanup. Batch rendering must support queued, running, completed,
partial, failed, and canceled states, with per-item artifacts and audit events.
Storage cleanup must delete eligible files oldest-first while preserving
metadata tombstones.

#### Acceptance criteria

- [ ] Staff can start a batch render for at least one supported family.
- [ ] Batch status and per-item result status are visible.
- [ ] Partial failure preserves successful artifacts and error metadata.
- [ ] Storage threshold settings are tenant configurable.
- [ ] Automatic cleanup deletes only eligible files oldest-first.
- [ ] Protected classes require explicit policy before deletion.
- [ ] Tests cover partial failure, retry/cancel where supported, oldest-first
      cleanup, protected classes, and audit tombstones.

#### Blocked by

- SS-07
- SS-12

### SS-25: Remove legacy PDF Studio and Unlayer confusion after production slices land

Type: HITL

Suggested labels: `complexity:medium`, `status:blocked`, `type:refactor`

User stories covered: 1, 44

#### What to build

Remove or migrate legacy PDF Studio and Unlayer-specific product paths after
the core Statement Studio production paths are live. The product must no longer
present both PDF Studio and Statement Studio as competing concepts, and no new
Statement Studio behavior may depend on Unlayer.

#### Acceptance criteria

- [ ] User-facing nav, docs, and UI converge on Statement Studio naming.
- [ ] Legacy Unlayer PDF editor paths are removed, disabled, or isolated behind
      a clearly documented migration-only boundary.
- [ ] Old docs and env assumptions no longer imply Unlayer is required for
      Statement Studio.
- [ ] Useful tests are rewritten around Statement Studio behavior.
- [ ] Existing tenant data is either migrated, ignored, archived, or removed
      according to the Phase 0 decision.
- [ ] Human review signs off that legacy removal will not break active
      production Statement Studio flows.

#### Blocked by

- SS-05
- SS-10
- SS-13

### SS-26: Complete cross-app integration verification and regression fixtures

Type: AFK

Suggested labels: `complexity:hard`, `status:blocked`, `type:chore`

User stories covered: 20, 22, 25, 26, 31, 32, 40, 44

#### What to build

Complete the Statement Studio integration map and regression fixtures across
Mission Control, Donor Dashboard, Missionary Dashboard, Reports, Finance,
Contributions, Events, Mobilize, Member Care, Legal/signing, and CMS/public
context. This is the product-completeness pass that prevents Statement Studio
from being "done" only in one surface.

#### Acceptance criteria

- [ ] Every PDF-producing or PDF-consuming surface has documented jobs,
      defaults, variable contract, resolver owner, artifact access, retention
      class, readiness, UX entry point, and tests/fixtures.
- [ ] Donor Dashboard downloads are donor-owned and route through donor portal
      boundaries.
- [ ] Missionary Dashboard downloads are missionary-authorized and route through
      missionary boundaries.
- [ ] Mission Control staff workflows are capability-gated.
- [ ] High-risk fixtures cover receipts, statements, missionary donor lists,
      finance reports, event badges/rosters, legal audit certificates, and care
      private packets.
- [ ] Verification includes schema/type checks, render smoke checks, route
      access checks, tenant isolation checks, and UI smoke checks where UI
      exists.
- [ ] The implementation docs are updated with final behavior and known gaps.

#### Blocked by

- SS-14
- SS-15
- SS-17
- SS-19
- SS-21
- SS-24
- SS-25

## Checklist

- [ ] Issues are vertical slices, not only layer-by-layer tasks.
- [ ] Each issue has a demoable or independently verifiable outcome.
- [ ] Each issue lists user stories covered.
- [ ] Each issue has HITL or AFK type.
- [ ] Each issue lists blockers.
- [ ] Each issue has suggested repo labels.
- [ ] Supabase work explicitly requires Supabase skill and Supabase CLI.
- [ ] UI work explicitly requires shared `@asym/ui` and Maia/Zinc tokens.
- [ ] Donor and missionary dashboard work stays role-scoped.
- [ ] Sensitive care/legal work remains HITL.
- [ ] Legacy removal remains blocked until production slices land.
