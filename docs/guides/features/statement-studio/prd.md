# Statement Studio PRD

Statement Studio is the full rebuild of PDF Studio into a usable staff-facing
product inside Mission Control. It must become the platform's own custom PDF
and statement product surface, not Unlayer, not an email editor pretending to
make PDFs, and not a thin wrapper around disconnected exports.

The product must use pdfx and React PDF as deeply as makes sense while keeping
the saved template format Asym-owned, tenant-safe, versioned, auditable, and
usable by non-technical tenant admins.

**Render-stack note:** Statement Studio's target production path is pdfx + React PDF.
Reconcile with the in-flight native PDF Studio + DocRaptor stack documented in
`docs/guides/features/pdf-studio.md` during Phase 0 (#312) before cutover.

## Triggers

Use this PRD when creating issues, planning implementation, reviewing scope, or
checking completeness for Statement Studio work.

Use it for:

- Statement Studio product shell, navigation, and UX.
- Template editor, starter library, template versions, publishing, rollback,
  and assignment flows.
- Variable registry, source maps, custom variables, and preview/render data
  contracts.
- Supabase schema, RLS, grants, Storage, retention, artifact, and audit work.
- Donor receipts, donor giving statements, missionary giving statements,
  finance PDFs, report packets, event badges, event receipts, care packets,
  mobilization packets, legal documents, task PDFs, and related platform PDFs.
- Legacy PDF Studio and Unlayer removal decisions.

## Workflow Steps

1. Start every implementation pass with Phase 0 audit work before creating
   schema, routes, UI, render code, or removing legacy PDF Studio behavior.
2. Use OpenSpec product and boundary truth first: Mission Control owns staff
   operational depth, donor and missionary dashboards expose role-scoped
   slices, and tenant safety is non-negotiable.
3. Load the repo Supabase skill before any database, Auth, Storage, Realtime,
   Edge Function, RLS, migration, or Supabase CLI work.
4. Load the Supabase Postgres best-practices skill before schema, RLS, index,
   query, policy, or migration design.
5. Use the Supabase CLI for database/Supabase work: migration creation and
   review, local reset/diff, linked dry runs where appropriate, SQL linting,
   database advisors, and any supported RLS/policy validation.
6. Confirm current official Supabase docs and changelog guidance before
   implementing database or Storage behavior.
7. Load frontend rules before UI work, use shared `@asym/ui` primitives, and
   keep all visual styling on the repo's shared Maia/Zinc design tokens.
8. Read installed Next.js docs before any Next.js work, per repo instruction.
9. Build in thin vertical slices that prove template versioning, variables,
   assignments, rendering, Storage artifacts, downloads, and cross-surface
   access together.
10. Keep final implementation issue-ready: each issue should name the affected
    module, owner boundary, acceptance criteria, tests, and tenant-safety checks.

## Problem Statement

The current PDF Studio direction is not enough for the platform's actual needs.
It is still tied to legacy PDF/email-editor assumptions, legacy Unlayer
concepts, and document categories that are too shallow for a Christian missions
nonprofit operating system. Donor receipts, annual statements, missionary
giving statements, reports, event badges, care packets, legal packets, and
bookkeeper-readable exports all need consistent tenant-safe PDF behavior, but
the platform does not yet have a real product surface for designing, assigning,
rendering, storing, and governing those documents.

Staff need a clean Mission Control product where they can create and manage PDF
templates without coding. Tenants need defaults for standard document jobs, the
ability to swap defaults safely, and enough starter templates to see what is
possible out of the box. Donors and missionaries need simple role-scoped access
to the documents that belong to them, without seeing staff complexity or
cross-tenant artifacts. Bookkeepers, CFOs, leadership, mobilization teams,
event teams, support/member-care staff, and legal/compliance users need PDF
outputs that match their real workflows.

The system also needs a robust variable model. Names, amounts, funds, projects,
missionaries, donor rosters, project images, missionary portraits, allocations,
pledges, event sessions, badges, legal signatures, care redactions, and
dashboard-specific fields cannot be treated as simple flat merge tags. Each
variable needs an owner, source map, scope, permission model, data type,
fallback, sample value, readiness status, and production resolver contract.

The rebuild must solve this as one platform product. It must be tenant-safe and
tenant-aware across Mission Control, Donor Dashboard, Missionary Dashboard, and
all other app surfaces where PDFs are created, assigned, downloaded, emailed,
or retained. It must follow current Supabase best practices and current repo UI
standards. It must also remove product confusion: Statement Studio is the new
product; Unlayer is legacy only and can be removed if Phase 0 confirms the
path.

## Solution

Build Statement Studio as a first-class Mission Control product for PDF and
statement templates. It should provide:

- A clean staff-facing app shell with Templates, Assignments, Variables,
  Generated PDFs, and Settings.
- A broad white-label starter library inside Templates, with production-ready
  jobs and template-ready demo jobs clearly labeled.
- A PDF-native editor built on an Asym-owned constrained JSON template schema,
  compiled to pdfx and React PDF at render time.
- Immutable template versions with draft, preview, publish, set-as-default, and
  rollback workflows.
- Tenant-scoped assignment records that map a document job and optional scope
  to a published template version.
- A document job catalog that includes platform-standard jobs and tenant-created
  custom assignments constrained to approved surfaces and context contracts.
- A first-class variable registry with source maps, custom tenant variables,
  custom fields, friendly labels, sample data, validation, and usage impact.
- Server-side production rendering from tenant-scoped DTOs owned by the domain
  that owns the facts.
- Private Supabase Storage for generated PDFs, with Postgres artifact metadata,
  tenant-aware download boundaries, audit events, retention settings, and purge
  controls.
- Cross-app integration so Mission Control can author/manage/render, while
  Donor Dashboard and Missionary Dashboard only consume authorized artifacts
  through role-scoped portal boundaries.

The first production vertical slice should prove the full architecture with
`donor.statement.annual_giving`, unless Phase 0 discovers a stronger first
slice. The next production slices should be `donor.receipt.single` and
`missionary.statement.monthly_giving`. After those, expand into table/repeater
heavy documents such as missionary donor lists, finance reports, event rosters,
event badges, and schedules.

## User Stories

1. As a tenant admin, I can open Statement Studio inside Mission Control and
   immediately understand that this is where PDF templates, statement defaults,
   variables, generated files, and document settings live.
2. As a tenant admin, I can browse a large Starter Library inside Templates,
   search by document family, and clone a white-label starter into my tenant.
3. As a tenant admin, I can create a simple letterhead template with my tenant
   logo, colors, address, and footer without touching code.
4. As a tenant admin, I can create or edit a donor annual giving statement,
   preview it with safe sample data, preview it with authorized real donor data,
   publish it, and set it as the default for future annual statements.
5. As a tenant admin, I can publish a new version without changing the current
   default until I explicitly assign it.
6. As a tenant admin, I can choose "publish and use for..." when I want a guided
   workflow that publishes and assigns in one clear step.
7. As a tenant admin, I can roll back a default assignment to a previous
   published version with one saved action, and the product clearly states that
   only future renders are affected.
8. As a tenant admin, I can see which template version is currently used for
   each standard job, which jobs are unassigned, and which jobs require setup.
9. As a tenant admin, I can assign a default template tenant-wide or for a
   specific scope such as a fund, event, campaign, project, missionary, region,
   report type, or legal packet type when that scope is approved for the job.
10. As a tenant admin, I can create a custom document purpose for an approved
    surface and map it to an approved context contract without writing SQL,
    JSON paths, JavaScript, or resolver code.
11. As a tenant admin, I can decide which roles can view templates, edit drafts,
    publish versions, assign defaults, render production PDFs, manage variables,
    view generated artifacts, purge files, and manage sensitive document types.
12. As a platform admin, I can provide safety floors so tenant capabilities are
    flexible but cannot expose cross-tenant data, service-role actions, donor
    data to the wrong donor, missionary data to the wrong missionary, or
    care/legal/private packets to unauthorized roles.
13. As a finance admin, I can configure donor receipt and annual giving
    statement templates that include tax language, gift totals, gift line items,
    designations, corrected/voided receipt status, and tenant branding.
14. As a finance admin, I can render a donor receipt PDF after a gift is settled
    and store the generated artifact with the exact template version used.
15. As a finance admin, I can stage or resend a gift receipt using the tenant's
    assigned receipt template and see audit history for the action.
16. As a CFO or finance leader, I can produce readable PDF versions of donor,
    fund, missionary, reconciliation, restricted-fund, GL, payout, refund, and
    deposit reports even when CSV remains the operational export format.
17. As a bookkeeper, I can download a donation batch detail PDF, deposit batch
    cover sheet, refund/dispute log, failed pledge attempts summary, payout
    reconciliation, and restricted-fund rollforward for review or audit packets.
18. As a leadership user, I can generate executive KPI packets, board packets,
    ministry impact reports, fundraising forecasts, campaign performance
    summaries, donor retention/lapse reports, and field/region health PDFs.
19. As a report builder user, I can export a Report Studio report to a tenant
    default PDF template that preserves the report's title, filters, sections,
    charts, tables, totals, and generated-at metadata.
20. As a donor, I can download my own receipts, annual statements, pledge
    summaries, and other authorized donor documents from the Donor Dashboard
    without seeing staff controls or documents belonging to another donor.
21. As a donor, I can trust that receipts and statements reflect settled gifts,
    refunds, corrected records, and designation truth honestly.
22. As a missionary, I can download my monthly giving statement, annual support
    summary, support snapshot, donor roster, task list, and other authorized
    missionary documents without seeing tenant-wide finance/admin controls.
23. As a missionary, I can receive a donor list PDF that respects tenant privacy
    rules, anonymous donor flags, contact-preference restrictions, and field
    redactions.
24. As a missionary, I can generate a thank-you call sheet, pledge pipeline,
    support gap report, ministry update packet, or prayer letter using approved
    missionary variables and tenant defaults.
25. As an event manager, I can assign templates for attendee badges, speaker
    badges, volunteer badges, tickets, registration receipts, check-in rosters,
    attendance rosters, session schedules, rooming lists, meal/dietary lists,
    waiver packets, and event financial summaries.
26. As an event check-in worker, I can print or download badges and rosters for
    a specific event without accessing unrelated tenant documents.
27. As a mobilization staff member, I can generate candidate packets,
    applications, interview packets, reference requests, vetting checklists,
    onboarding packets, training checklists, deployment checklists, support
    raising plans, and commissioning certificates.
28. As a mission operations user, I can generate missionary rosters, field
    rosters, church partner rosters, fund reports, project budgets,
    visa/travel/insurance packets, home assignment packets, emergency contact
    packets, and field reports.
29. As a legal/compliance user, I can assign and render safeguarding policies,
    gift acceptance policies, conflict-of-interest forms, waivers, consent
    forms, privacy/terms/cookie policies, audit certificates, board
    resolutions, volunteer agreements, background-check consent forms, and
    minor travel consent forms.
30. As a signing workflow user, I can generate a signature audit certificate or
    completed packet export that includes signature metadata, timestamps,
    packet version, signer identity, and audit evidence.
31. As a support lead, I can generate first-response reports, resolution
    reports, inbox reports, label reports, agent reports, SLA summaries, and
    donor-care summary PDFs.
32. As a member-care staff member, I can generate care person profiles, care
    plans, activity logs, private packets, crisis response packets, debrief
    summaries, and pastoral-care summaries with strict access and redaction.
33. As a CMS/content user, I can use approved project and missionary page
    content, images, public page copy, and CMS media as variables without
    making CMS the operational source of truth.
34. As a template author, I can insert variables through grouped, searchable,
    friendly pickers with labels, descriptions, sample values, type, sensitivity
    badges, readiness, fallback controls, and "used by" indicators.
35. As a template author, I can use text, numbers, dates, money, addresses,
    images, QR codes, barcodes, links, conditionals, sections, tables,
    repeaters, totals, subtotals, and page-break controls.
36. As a template author, I can see validation before preview, publish, assign,
    and production render so missing variables, unsafe variables, incompatible
    scope, deprecated keys, or inaccessible data are caught early.
37. As a tenant admin, I can customize variable labels, grouping, formatting,
    fallbacks, sample values, tenant static text, branded assets, and approved
    custom fields.
38. As a tenant admin, I can create safe no-code derived variables such as
    formatted dates, formatted currency, concatenated names, conditional
    fallbacks, sums, counts, and approved filters.
39. As a tenant admin, I cannot create raw SQL, arbitrary joins, arbitrary
    JavaScript, unsafe resolver access, or cross-tenant variable references.
40. As an auditor, I can see which template version produced a document, who
    rendered it, when it was rendered, what job and scope it belonged to, where
    the file was stored, what checksum/hash was recorded, and what retention
    policy applies.
41. As a tenant admin, I can manually purge eligible generated files, provide an
    audit reason, and keep metadata tombstones after file deletion.
42. As a tenant admin, I can configure storage-pressure cleanup that deletes
    eligible files oldest-first once a tenant-defined storage threshold is
    reached.
43. As a tenant admin, I can protect legal, tax, finance, care/private, and
    sensitive documents from purge unless the tenant has explicitly configured
    an allowed policy.
44. As an implementation agent, I can create issues directly from this PRD
    because modules, phases, boundaries, starter jobs, variable sources,
    testing requirements, and acceptance criteria are explicit.

## Implementation Decisions

### Product Identity

- The user-facing product name is Statement Studio.
- Existing PDF Studio route names or `pdf_*` internals can migrate
  pragmatically, but user-facing UI must not present PDF Studio and Statement
  Studio as separate products.
- Unlayer is not part of the new product architecture. It is legacy-only and
  may be removed entirely once Phase 0 confirms the removal/migration path.
- The rebuild is a product replacement, not a compatibility layer around old
  Unlayer document editing.

### Platform Boundary

- Statement Studio owns template authoring, template versions, publishing,
  defaults, assignments, variable catalog behavior, render orchestration,
  generated artifact metadata, retention, purge, rollback, and audit UX.
- Domain surfaces own source facts and context resolvers.
- Giving owns donations, receipts, statements, refunds, pledges, recurring
  gifts, designations, allocations, and reconciliation truth.
- Donor Dashboard owns donor-facing access boundaries and should only expose
  authorized donor document outcomes.
- Missionary Dashboard owns missionary-facing access boundaries and should only
  expose authorized missionary document outcomes.
- Events owns event facts such as attendees, tickets, sessions, speakers,
  meals, rooming, registration, badges, and logistics.
- Care/support owns care and support facts, including private notes and
  redaction rules.
- CMS owns public presentation content, page copy, and media; CRM/operational
  records remain authoritative for operational truth.
- Legal/signing owns signed packets, policy versions, signatures, audit
  evidence, and signer facts.

### Product IA And UX

Statement Studio must feel like a polished operational product, not a coding
tool. The top-level IA is:

- Templates: tenant templates, drafts, published versions, and Starter Library.
- Assignments: standard and custom defaults by document purpose and scope.
- Variables: built-in variables, tenant overrides, custom variables, source-map
  visibility, validation, and usage impact.
- Generated PDFs: artifacts, downloads, retention, purge, and audit.
- Settings: capabilities, branding defaults, retention, storage thresholds,
  sensitive document policies, and tenant-level defaults.

UX requirements:

- Use shared `@asym/ui` primitives and shared Maia/Zinc design tokens only.
- Use shadcn/Base UI patterns already established in the repo.
- Do not hardcode one-off colors, theme primitives, or arbitrary visual systems.
- Use lucide icons for actions where a familiar icon exists.
- Keep the editor PDF-native and document-oriented.
- Keep normal admin flows plain-language: no SQL, JSON paths, resolver names,
  raw schemas, raw query builders, or code-like mapping UI.
- Hide complexity until a decision is required.
- Show readiness badges, sensitivity badges, validation status, "currently used
  for" indicators, and plain-language impact previews.
- Make "Set as default", "Preview with real data", "Rollback", "Purge", and
  "Publish" explicit about what changes.
- State assignment impact in human language such as "future donor receipts for
  this tenant" or "badges for this event."
- Keep donor and missionary dashboard experiences simple; they should download
  and view authorized PDFs, not manage templates or assignments.

### Template Format And Renderer

- Use a new canonical Statement Studio engine for Asym-owned PDF templates.
- Persist templates as a constrained Asym JSON block/tree schema, not JSX, raw
  pdfx registry JSON, HTML, direct React props, or Unlayer design JSON.
- Compile the validated template schema to pdfx and React PDF at render time.
- Store immutable published versions with content hashes and schema versions.
- Store drafts separately from published versions.
- Allow clone, edit, preview, publish, assign, replace, and rollback workflows.
- Production defaults must point to immutable published versions, never mutable
  drafts.
- Historical artifacts must never be rewritten when defaults change.
- Store exact template version metadata on every production render artifact.
- Support page settings, margins, reusable branded headers/footers, letterhead,
  tables, repeaters, totals, page breaks, images, QR/barcodes, appendices,
  packets, and generated audit pages.
- Support safe image handling for tenant logos, project images, missionary
  portraits, event speaker photos, signatures, and CMS media through approved
  asset boundaries.
- Do not make client-provided preview data authoritative for production.

### Supabase And Database Posture

All database and Supabase work must use the repo Supabase skill, Supabase
Postgres best-practices skill when applicable, and the Supabase CLI. This is a
hard implementation requirement for all issues that touch migrations, RLS,
grants, Storage, artifact records, Edge Functions, Realtime, Auth, or database
queries.

Supabase requirements:

- Create additive, migration-safe schema changes.
- Make Data API exposure and grants explicit.
- Enable RLS on every tenant-owned table exposed through a client-accessible
  schema.
- Use policies targeted to the authenticated role where user access exists.
- Use real tenant/membership/role predicates, not `auth.role()` authorization.
- Use both `USING` and `WITH CHECK` for mutation policies.
- Index tenant, scope, foreign-key, and RLS policy columns.
- Avoid policy patterns that cause expensive per-row auth work where a safer
  indexed predicate or stable helper can be used.
- Use security-invoker views for any RLS-dependent views.
- Keep service-role access server-only.
- Do not authorize from user-controlled metadata.
- Prefer server/BFF boundaries for production rendering, sensitive reads,
  private artifacts, and cross-surface document access.
- Keep generated PDFs in private Supabase Storage buckets.
- Use RLS policies on Storage objects and/or server-checked signed URL or
  streaming boundaries.
- Use tenant-aware object paths and metadata.
- Delete/purge files through Supabase Storage APIs, not SQL-only metadata
  deletes.
- Keep Postgres artifact rows as the source of truth even when files expire or
  are purged.
- Validate migrations with Supabase CLI local reset/diff/lint/advisors and
  repo-specific verification before merge.

Current official Supabase posture checked on 2026-06-12:

- RLS must be enabled on exposed tables and grants remain separate from RLS.
- Storage access is controlled through RLS policies on Storage objects, and
  buckets should not allow access without explicit policy.
- Newer Supabase projects no longer rely on automatic public table exposure in
  the same way older projects did, so migrations must deliberately set exposure
  and grants instead of assuming defaults.
- Supabase CLI is the supported local development, migration, and CI/CD tool
  for Supabase projects.

### Core Data Model

Phase 0 should choose exact names, but the model must cover these concepts:

- System document job catalog.
- System starter template library and starter versions.
- Tenant document job settings.
- Tenant template records.
- Immutable tenant template versions.
- Tenant default template assignments.
- Tenant custom assignment definitions.
- Variable catalog and tenant variable overrides.
- Variable source-map records.
- Generated render records.
- Generated artifact records.
- Artifact events and audit history.
- Batch render records and batch jobs.
- Retention policy and purge configuration.
- Tenant storage threshold configuration.
- Capability settings for Statement Studio actions.

Default assignment resolution order:

1. Authorized one-off render override.
2. Exact scoped default.
3. Parent scoped default.
4. Tenant-wide default for the standard job key.
5. System starter template only for preview/setup unless the tenant explicitly
   activates it for production.

Constraints:

- A tenant can have only one active default for the same job key plus scope
  kind plus scope id.
- A published version can be assigned; a draft cannot be assigned for
  production.
- Default changes affect future renders only.
- Scheduled future defaults are allowed, but complex branching should wait for
  proven workflow demand.
- Assignment changes must be audited with actor, timestamp, affected job/scope,
  old version, new version, and optional note.

### Capability Model

Capabilities must be tenant-configurable in Settings while preserving platform
safety floors.

Capability groups:

- View templates.
- Create and edit drafts.
- Publish versions.
- Assign defaults.
- Manage custom assignments.
- Manage variables and custom fields.
- Preview with sample data.
- Preview with real data.
- Render production PDFs.
- Batch render/export.
- View generated artifacts.
- Download generated artifacts.
- Manage retention and purge.
- Manage tenant storage thresholds.
- View sensitive/private document classes.
- Manage legal/tax/care protected classes.

Safety floors:

- Donors can access only their own donor artifacts.
- Missionaries can access only authorized missionary artifacts.
- Care/private/legal documents require elevated permission.
- Service-role actions and server-only render operations are never converted
  into tenant UI capabilities.
- UI hiding is not a security boundary; server authorization and RLS/Storage
  policy must enforce scope.

### Variable Registry And Source Maps

Variables are a first-class product surface and must not remain simple flat
merge tags.

Each built-in variable needs:

- Stable key.
- Friendly label.
- Family.
- Value type.
- Repeater/table compatibility.
- Owning domain.
- Source map.
- Approved resolver/context contract.
- Required job scope.
- Permission and sensitivity rules.
- Fallback behavior.
- Sample value.
- Readiness state.
- Used-by jobs and templates.
- Version and compatibility notes.
- Deprecation/replacement metadata where applicable.

Variable source families:

- Tenant/branding: tenant settings, brand kit, logo, colors, address, tax id,
  signatures, letterhead, footer, public URLs.
- Donor/CRM: donor profile, household, organization/church, business donor,
  address, email, phone, contact preferences, portal identity, privacy flags,
  duplicate/merged status, external IDs.
- Giving: donations, settled status, payment method label, allocations,
  designations, funds, projects, recurring gifts, pledges, pledge attempts,
  refunds, disputes, in-kind gifts, soft credits, matching gifts, staged gifts,
  tax receipt metadata, corrected/voided status.
- Funds/projects: fund name, restrictions, project name, project budget, goal,
  progress, region, field, CMS project page copy, project hero image, related
  missionaries, public page URL.
- Missionary: missionary profile, display name, support goal, current support,
  monthly gifts, donor relationships, donor roster, active/lapsed donors,
  contact permission, task list, ministry updates, prayer requests, public
  profile image, field redactions.
- Finance/bookkeeping: deposit batches, batch details, payout reconciliation,
  GL codes, restricted fund rollforward, fund allocation summaries, refund and
  dispute logs, failed pledge attempts, close packets, audit schedules.
- Reports/leadership: report filters, generated range, KPI summaries, trend
  values, charts/tables, board sections, impact summaries, retention/lapse
  metrics, campaign performance, field/region health.
- Events: event identity, registration, attendee, speaker, volunteer, ticket,
  badge, check-in status, sessions, rooms, meals, dietary needs, accessibility,
  waivers, registration custom fields, event schedule, event images.
- Mobilize/tasks: candidate profile, application fields, stage, readiness,
  interviews, references, vetting checks, onboarding tasks, training progress,
  deployment checklist, task owner, due date, priority, completion state.
- Mission operations: missionary roster, field roster, church partner roster,
  visa/travel/insurance details, home assignment, emergency contacts, project
  budgets, team directories.
- Support/member care: personnel profile, care status, goals, requirements,
  activity logs, care plans, private notes, redaction status, crisis/debrief
  summaries, support inbox/report metrics, SLA context.
- Legal/signing/compliance: packet templates, signer identity, signature
  metadata, consent status, waiver status, policy version, audit certificate,
  board resolution, background-check consent, safeguarding acknowledgements.
- CMS/public content: missionary pages, project pages, page sections, public
  images, summaries, approved public copy, public URLs, content publish status.
- System/audit: generated by, generated at, render id, template version,
  checksum/hash, artifact id, retention class, purge status, tenant id, job key,
  scope, batch id, audit reason.

Tenant-custom variable support:

- Static tenant text.
- Branded assets.
- Aliases to approved fields.
- Registered custom fields on approved entities.
- Safe no-code derived variables: concatenate, format date, format currency,
  conditional fallback, sum, count, approved filters, simple boolean display.

Do not support:

- Raw SQL authoring.
- Arbitrary JavaScript.
- Arbitrary JSON path access.
- Arbitrary joins.
- Cross-tenant references.
- Resolver internals in normal admin UI.
- Production renders from client-supplied data.

Edge cases the variable system must handle:

- Household rollups and organization/church donors.
- Anonymous donors and restricted contact details.
- Minors and guardian consent.
- Soft credits and matching gifts.
- Split gifts and multi-fund allocations.
- Corrected, voided, refunded, disputed, failed, and pending gifts.
- In-kind/non-cash gifts and goods/services disclosures.
- Fiscal-year and calendar-year differences.
- Multi-currency and timezone formatting.
- Imported legacy IDs.
- Deleted/archived source records.
- Missing images and expired signed URLs.
- Project/fund media relationships.
- Missionary field redactions and private locations.
- Large repeaters/tables and page-break behavior.
- Deprecated or renamed variables.
- Tenant custom fields with missing values.
- Conflicting source ownership.

### Starter Template And Job Catalog

Starter templates must be white-label, tenant-brand-token driven, accessible,
printable, cloneable, updateable, searchable, and immediately useful with safe
sample data. They should demonstrate the product's flexibility without
pretending every job is production-wired on day one.

Readiness states:

- `production_ready`: real tenant-safe resolver and route exist.
- `template_ready`: starter template and safe sample preview exist, but
  production resolver/route is not wired yet.
- `requires_setup`: tenant must configure a module, scope, or fields before
  production rendering is possible.

Greenfield starters:

- `letterhead.simple`
- `memo.simple`
- `report.simple`
- `certificate.simple`
- `statement.simple`
- `packet.cover_sheet`
- `blank.branded`
- `form.standard`
- `form.intake`
- `form.consent`
- `notice.standard`
- `agenda.standard`
- `minutes.standard`
- `invoice_style.statement`

Donor:

- `donor.receipt.single`
- `donor.receipt.corrected`
- `donor.receipt.voided_notice`
- `donor.receipt.in_kind`
- `donor.receipt.non_cash_acknowledgement`
- `donor.statement.annual_giving`
- `donor.statement.custom_period`
- `donor.statement.mid_year`
- `donor.pledge.summary`
- `donor.pledge.reminder`
- `donor.recurring_gift.summary`
- `donor.tax_packet.annual`
- `donor.giving_history.detail`

Missionary:

- `missionary.statement.monthly_giving`
- `missionary.statement.annual_support`
- `missionary.support_snapshot`
- `missionary.support_gap_report`
- `missionary.donor_list`
- `missionary.donor_roster`
- `missionary.full_donor_contact_list`
- `missionary.active_lapsed_donors`
- `missionary.pledge_pipeline`
- `missionary.thank_you_call_sheet`
- `missionary.ministry_update_packet`
- `missionary.prayer_letter`
- `missionary.task_list`
- `missionary.support_raising_plan`
- `missionary.church_partner_list`

Finance/Admin:

- `finance.report.donors`
- `finance.report.funds`
- `finance.report.missionaries`
- `finance.report.reconciliation`
- `finance.report.pledge_aging`
- `finance.report.donor_retention`
- `finance.report.campaign_performance`
- `finance.report.audit_packet`
- `finance.receipt.staged_gift`
- `finance.statement.fund_activity`
- `finance.statement.project_activity`

Bookkeeping:

- `bookkeeping.deposit_batch_cover_sheet`
- `bookkeeping.donation_batch_detail`
- `bookkeeping.payout_reconciliation`
- `bookkeeping.refund_dispute_log`
- `bookkeeping.failed_pledge_attempts`
- `bookkeeping.gl_summary`
- `bookkeeping.fund_allocation_report`
- `bookkeeping.restricted_fund_rollforward`
- `bookkeeping.receipt_batch_manifest`
- `bookkeeping.batch_exception_report`
- `bookkeeping.month_end_close_packet`
- `bookkeeping.audit_support_schedule`

Reports:

- `reports.executive_summary`
- `reports.board_packet`
- `reports.annual_report`
- `reports.custom_export`
- `reports.scheduled_packet`
- `reports.dashboard_snapshot`
- `reports.chart_table_packet`
- `reports.ministry_outcomes`

Leadership/BI:

- `leadership.executive_kpi_packet`
- `leadership.board_packet`
- `leadership.ministry_impact_report`
- `leadership.fundraising_forecast`
- `leadership.campaign_performance`
- `leadership.donor_retention_lapse_report`
- `leadership.field_region_health_report`
- `leadership.restricted_fund_health`
- `leadership.pipeline_forecast`
- `leadership.strategic_initiatives_status`

Support/Member Care:

- `support.report.first_response`
- `support.report.resolution`
- `support.report.inbox_overview`
- `support.report.agent_activity`
- `support.report.label_mix`
- `support.report.sla_summary`
- `care.person.profile`
- `care.plan`
- `care.activity_log`
- `care.private_packet`
- `care.crisis_response_packet`
- `care.debrief_summary`
- `care.pastoral_care_summary`

Events:

- `events.badge.attendee`
- `events.badge.speaker`
- `events.badge.volunteer`
- `events.registration_receipt`
- `events.ticket`
- `events.attendance_roster`
- `events.check_in_roster`
- `events.session_schedule`
- `events.rooming_list`
- `events.meal_dietary_list`
- `events.volunteer_assignment`
- `events.speaker_itinerary`
- `events.waiver_packet`
- `events.financial_summary`
- `events.certificate.attendance`

Mobilize:

- `mobilize.candidate_packet`
- `mobilize.application`
- `mobilize.interview_packet`
- `mobilize.reference_request`
- `mobilize.vetting_checklist`
- `mobilize.onboarding_packet`
- `mobilize.training_checklist`
- `mobilize.deployment_checklist`
- `mobilize.commissioning_certificate`
- `mobilize.support_raising_plan`
- `mobilize.visa_document_checklist`

Mission Ops:

- `mission_ops.missionary_roster`
- `mission_ops.field_roster`
- `mission_ops.church_partner_roster`
- `mission_ops.fund_report`
- `mission_ops.project_budget`
- `mission_ops.visa_travel_insurance_packet`
- `mission_ops.home_assignment_packet`
- `mission_ops.field_report`
- `mission_ops.emergency_contact_packet`
- `mission_ops.team_directory`
- `mission_ops.equipment_inventory`

Legal/Compliance:

- `legal_compliance.safeguarding_policy`
- `legal_compliance.gift_acceptance_policy`
- `legal_compliance.conflict_of_interest_form`
- `legal_compliance.waiver_release`
- `legal_compliance.consent_form`
- `legal_compliance.privacy_policy`
- `legal_compliance.terms_policy`
- `legal_compliance.cookie_policy`
- `legal_compliance.audit_certificate`
- `legal_compliance.board_resolution`
- `legal_compliance.data_processing_addendum`
- `legal_compliance.volunteer_agreement`
- `legal_compliance.background_check_consent`
- `legal_compliance.minor_travel_consent`

Tasks/Workflow:

- `tasks.assigned_list`
- `tasks.project_plan`
- `tasks.compliance_checklist`
- `tasks.board_follow_up`
- `tasks.completion_certificate`
- `tasks.owner_summary`

Sign:

- `sign.audit_certificate`
- `sign.packet_export`
- `sign.completed_document_packet`
- `sign.signature_summary`

CMS/Public Context:

- `cms.project_profile_sheet`
- `cms.missionary_profile_sheet`
- `cms.page_review_packet`
- `cms.public_content_snapshot`
- `cms.media_release_packet`

### Rendering, Artifacts, Retention, And Purge

Render rules:

- Resolve the assignment/default first.
- Resolve production data server-side through the owning domain resolver.
- Validate template and variables before render.
- Render through the approved Statement Studio renderer.
- Store generated PDF in private Supabase Storage.
- Store artifact metadata in Postgres.
- Expose download through server-checked access or short-lived signed URL.
- Apply retention and purge policy.
- Keep audit/tombstone metadata after purge.

Artifact metadata must include:

- Tenant.
- Job key.
- Scope kind and scope id.
- Recipient/reference entity.
- Template id and immutable template version.
- Render mode and render id.
- Renderer metadata.
- Generated-at timestamp.
- Generated-by actor or system job.
- Storage bucket/path.
- File size.
- Checksum/hash.
- Retention class.
- Retention status.
- Purge status and purge reason.
- Batch id when applicable.
- Audit event references.

Retention defaults:

- Tax receipts, annual statements, audit certificates, and signed/legal
  documents default to long retention.
- Finance and bookkeeping documents default to audit-friendly retention.
- Care/private packets require strict access, explicit retention settings, and
  audit reasons.
- Event badges, tickets, rosters, exports, and temporary packets can use shorter
  configurable retention.
- Draft previews should be short-lived.

Purge behavior:

- Tenants can configure retention windows by document class.
- Tenants can configure protected categories.
- Tenants can manually purge eligible files with reason capture.
- Tenants can configure storage thresholds.
- Automatic cleanup deletes eligible files oldest-first.
- Protected legal/tax/sensitive classes require explicit tenant policy before
  deletion.
- Purge removes files but leaves audit metadata.

### Cross-App Integration

Mission Control/admin:

- Owns the full Statement Studio staff product.
- Manages templates, variables, assignments, generated artifacts, retention,
  purge, audit, and settings.
- Hosts production render actions for staff-owned flows.
- Can expose document-specific actions from domain pages when the user has the
  right capability.

Donor Dashboard:

- Downloads authorized donor receipts, annual giving statements, pledge
  summaries, tax packets, and donor-facing documents.
- Does not manage template authoring, assignment, or staff defaults.
- Uses donor portal boundaries for artifact access.

Missionary Dashboard:

- Downloads authorized missionary support statements, donor lists, support gap
  reports, task lists, call sheets, ministry update packets, and prayer letters.
- Does not expose tenant-wide finance/admin controls.
- Applies privacy, contact preference, donor anonymity, and field redaction
  rules.

Reports:

- Uses Statement Studio for PDF output of executive summaries, board packets,
  annual reports, custom exports, dashboard snapshots, and scheduled report
  packets.
- Report data remains owned by the report domain.

Finance/bookkeeping:

- Uses Statement Studio for readable PDF versions of finance exports and audit
  packets while CSV can remain operational source export.
- Money truth remains owned by finance/giving systems.

Contributions/receipts:

- Uses assigned receipt/statement templates for settled gift receipts,
  corrected receipts, staged gift receipts, annual statements, and pledge
  summaries.

Events/conferences:

- Uses assigned templates for badges, tickets, registration receipts, rosters,
  schedules, rooming lists, meals, waivers, certificates, and event packets.

Mobilize/tasks:

- Uses assigned templates for candidate packets, applications, vetting,
  onboarding, training, deployment, task lists, and completion certificates.

Member care/support:

- Uses assigned templates for support reports, care person profiles, care plans,
  care activity logs, and private packets with strict access and redaction.

Legal/signing:

- Uses assigned templates for policies, forms, waivers, consents, audit
  certificates, signed packet exports, and legal/compliance packets.

CMS/project/missionary pages:

- Provides approved public content and media variables to Statement Studio.
- Does not replace operational truth for funds, missionaries, donor
  relationships, or permissions.

### Phase Plan

Phase 0: Audit and implementation brief

- Inventory current PDF Studio, Unlayer, native builder, donor receipt,
  statement, report, event, missionary, care, task, legal, CMS, migration,
  Storage, and test behavior.
- Classify what to reuse, replace, remove, or temporarily tolerate.
- Produce a concise implementation map for future agents.
- Confirm current Supabase and Next.js docs before coding.
- Confirm first production vertical slice.

Phase 1: Foundation

- Add/adjust Statement Studio schema.
- Add RLS, explicit grants, indexes, constraints, and Storage policy posture.
- Add document job catalog and starter template library metadata.
- Add template/version model.
- Add artifact/render/batch/audit/retention tables.
- Add tenant settings and capabilities.
- Seed initial job catalog and starter library metadata.

Phase 2: Editor MVP

- Build clean Mission Control product shell.
- Build Templates section with Starter Library.
- Build constrained JSON template editor for core blocks.
- Add sample preview.
- Add authorized real-data preview for first slice.
- Add validation/readiness UI.
- Add publish immutable version workflow.

Phase 3: Assignments

- Build Assignments section.
- Add standard job assignment flows.
- Add custom assignment flows.
- Add default resolution logic.
- Add rollback and assignment audit.

Phase 4: First production jobs

- Wire `donor.statement.annual_giving`.
- Wire `donor.receipt.single`.
- Wire `missionary.statement.monthly_giving`.
- Ensure Donor Dashboard and Missionary Dashboard consume artifacts through
  role-scoped boundaries.

Phase 5: Tables, repeaters, and operational reports

- Add robust table/repeater rendering.
- Wire missionary donor lists and support reports.
- Wire finance/bookkeeping readable PDFs.
- Wire event rosters, badges, schedules, and receipts.
- Wire support/care report packets with redaction.

Phase 6: Starter library expansion

- Add the broad starter catalog with safe fixtures.
- Add multiple design styles by document family.
- Keep all templates white-label and tenant-brand driven.
- Label readiness accurately.

Phase 7: Batch rendering, retention, purge, governance

- Add batch render orchestration.
- Add Generated PDFs management.
- Add retention automation and manual purge.
- Add storage threshold cleanup.
- Add deeper audit, rollback history, and governance views.

Phase 8: Legacy removal and cleanup

- Remove or migrate legacy Unlayer PDF Studio code, config, docs, tests, env
  references, and user-facing naming.
- Rewrite useful tests around Statement Studio behavior.
- Remove product confusion between old PDF Studio and Statement Studio.

### Issue Creation Guidance

Create issues from this PRD as epics and thin vertical slices:

- Phase 0 audit issue.
- Product shell and IA issue.
- Supabase foundation schema/RLS/Storage issue.
- Template schema and validation issue.
- Renderer and pdfx/React PDF integration issue.
- Starter Library issue.
- Variables registry/source maps issue.
- Tenant custom variables issue.
- Assignments/default resolver issue.
- Capabilities/settings issue.
- Generated artifacts/downloads issue.
- Retention/purge/storage threshold issue.
- First production annual giving statement issue.
- Donor receipt issue.
- Missionary monthly statement issue.
- Table/repeater rendering issue.
- Finance/bookkeeping PDF issue group.
- Event badge/receipt/roster issue group.
- Support/member-care private packet issue group.
- Mobilize/task/legal packet issue group.
- Cross-dashboard artifact access issue.
- Testing/fixtures/regression issue.
- Legacy removal issue.

Each issue should include:

- User-facing outcome.
- Owning module/surface.
- Tenant-safety and role-safety requirements.
- Supabase/RLS/Storage requirements if data is touched.
- Variable/source-map changes.
- UI/token requirements if UI is touched.
- Acceptance criteria.
- Verification commands or manual checks.

## Testing Decisions

Testing should be risk-based and focused on externally observable behavior. The
product should not build a heavyweight test framework before the first slices
prove the shape, but it must catch tenant leaks, broken renders, bad
assignments, and incorrect document facts.

Required test areas:

- Template schema validation.
- Variable contract validation.
- Source resolver tenant safety.
- Assignment resolver behavior.
- Publishing/version immutability.
- Rollback behavior.
- Production render metadata.
- Artifact download authorization.
- Donor Dashboard donor-owned artifact access.
- Missionary Dashboard missionary-authorized artifact access.
- Private Storage access boundaries.
- Retention and purge eligibility.
- Manual purge audit.
- Storage-threshold cleanup ordering.
- Batch render partial failure behavior.
- Legacy Unlayer removal regressions.

High-risk document fixtures:

- Donor receipt.
- Corrected donor receipt.
- Annual giving statement.
- Missionary monthly giving statement.
- Missionary donor list with privacy restrictions.
- Finance reconciliation report.
- Deposit batch cover sheet.
- Event badge.
- Event roster.
- Event registration receipt.
- Legal audit certificate.
- Care private packet.

Fixture edge cases:

- Empty gift history.
- Large gift history.
- Split gifts.
- Multi-fund allocations.
- Refunds and disputes.
- Corrected or voided receipts.
- Anonymous/private donors.
- Household and organization giving.
- In-kind/non-cash gifts.
- Multi-currency.
- Fiscal-year versus calendar-year output.
- Missing project or missionary images.
- Expired signed media URLs.
- Redacted field location.
- Minors and guardian consent.
- Cancelled/no-show event attendees.
- Meal, dietary, and accessibility needs.
- Large rosters and page breaks.
- Long names, addresses, titles, and custom field values.

Verification types:

- Unit tests for pure schema, resolver, assignment, variable, retention, and
  permission logic.
- Route tests for donor/missionary/admin artifact access.
- Database migration checks using Supabase CLI.
- RLS/policy checks with realistic tenant/user roles.
- Render smoke tests for blank output, missing assets, overflow, page breaks,
  table headers, totals, and required legal text.
- Playwright/UI tests for key staff workflows once UI exists.
- Accessibility checks for core Statement Studio flows.

Definition of done:

- No tenant leak is possible through templates, variables, renders, artifacts,
  downloads, Storage, audit, or generated files.
- Donor and missionary dashboards expose only role-appropriate document access.
- Staff UI uses shared repo design tokens and feels clean, modern, and easy.
- Production renders use server-built tenant-scoped DTOs.
- Generated artifacts store exact template version and audit metadata.
- Default assignment and rollback behavior is clear and tested.
- Supabase work was performed with the Supabase skill, Supabase Postgres skill
  where applicable, and Supabase CLI verification.

## Out of Scope

- Continuing to build the new product on Unlayer.
- Treating Email Studio as the PDF editor.
- Storing JSX as persisted template source.
- Letting tenant admins write raw SQL, JavaScript, arbitrary JSON paths, or
  custom resolver code for production variables.
- Letting production renders trust client-provided data contexts.
- Public generated-PDF buckets.
- Direct cross-dashboard reads of generated artifact tables.
- Moving giving, donor, missionary, event, care, legal, CMS, or finance source
  truth into Statement Studio.
- Making every starter template production-ready in the first implementation
  slice.
- Forcing an overly rigid publishing/release gate that ignores tenant-chosen
  settings.
- Exposing staff assignment, variable, or retention complexity in Donor
  Dashboard or Missionary Dashboard.

## Further Notes

### Open Questions For Phase 0

- What exact table names should be retained, renamed, or introduced to balance
  migration cost with product clarity?
- Which current PDF templates, if any, should be migrated rather than removed?
- Which first-slice route should become canonical for donor annual statement
  generation and artifact download?
- How much of the existing native builder schema can be reused safely?
- Should batch rendering use the platform's existing job mechanism or add a new
  dedicated execution path?
- Which document classes need legal retention defaults by jurisdiction or
  tenant policy?
- Which starter templates should be production-ready at launch versus
  template-ready with sample fixtures?
- Which custom-field sources are stable enough for tenant-created variables in
  the first release?

### Non-Negotiables

- Tenant safety and role correctness over convenience.
- Money and receipt truth over visual polish.
- Mission Control as the home for staff operational depth.
- Donor clarity and missionary focus in downstream dashboards.
- Supabase best practices for database, RLS, grants, Storage, and migrations.
- Clean shadcn/Maia token-driven UI.
- No new Unlayer dependency for Statement Studio.

## Checklist

- [ ] Phase 0 audit completed before implementation.
- [ ] Statement Studio product shell is clean, token-driven, and non-technical.
- [ ] Supabase skill is used for all database/Supabase work.
- [ ] Supabase CLI is used for migration and database verification.
- [ ] RLS, grants, Storage, indexes, and tenant boundaries are explicit.
- [ ] Template schema is Asym-owned and compiled to pdfx/React PDF.
- [ ] Variables have source maps, readiness, sensitivity, and validation.
- [ ] Starter library is broad, white-label, and tenant-brandable.
- [ ] Assignments support standard jobs and tenant custom assignments.
- [ ] Defaults point to immutable published versions.
- [ ] Rollback changes future renders only.
- [ ] Artifacts are private, tenant-aware, auditable, and purgeable.
- [ ] Donor Dashboard and Missionary Dashboard use role-scoped artifact access.
- [ ] Legacy Unlayer/PDF Studio confusion is removed.
- [ ] Tests cover tenant safety, render smoke, variables, assignments,
      artifacts, retention, and high-risk documents.
