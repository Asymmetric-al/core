# Phase 23 D35 — Current Implementation Replacement Decision Brief

**Status:** Founder-ratified as the exact 36-clause Phase 23 D35 C-prime-R on
2026-08-24.  
**Date:** 2026-08-24  
**Decision owner:** Founder  
**Selected direction:** C-prime — census-gated clean target with selective
retained-state transformation and one-authority cutover.  
**Research:**
[current implementation census and replacement research](./phase-23-d35-current-implementation-census-and-cutover-research.md).  
**Adversarial review:**
[D35 adversarial review](./phase-23-d35-current-implementation-replacement-adversarial-review.md).

## Decision boundary

D34 selects and qualifies the exact Payload v4 engine cohort. D35 decides how
the present Payload/Web Studio prototype is replaced by the ratified D1–D34
product model.

The founder supplied one decisive fact: Core is not in production. D35 is
therefore a **pre-production repository and model replacement**, not a live
customer migration. The permanent architecture must be production-worthy;
the one-time replacement procedure must remain proportionate to the actual
risk.

This changes the earlier recommendation materially. D35 keeps a read-only
census and preserves only deliberately retained non-production state. It does
not build dual writes, change-data capture, traffic shadowing, active-editor
draining, maintenance screens, a migration control plane, or permanent legacy
compatibility for a live system that does not exist.

## Exact ratified formulation

<!-- prettier-ignore -->
> **C-prime-amended-and-hardened (C-prime-R) — census-gated clean target with
> selective retained-state transformation and one-authority cutover.**
>
> 1. Core is pre-production at this decision point. D35 is not a live-customer
>    migration; if any environment becomes production or receives real
>    customer reliance before replacement, destructive work stops and D35's
>    cutover posture must be revalidated rather than silently reusing this
>    simplified procedure.
> 2. “Cutover” means one intentional repository, schema, writer, reader, and
>    public-authority replacement before launch—not a public traffic migration
>    or Tenant-operated event.
> 3. The current Payload/Web Studio implementation is useful evidence and
>    prototype learning, but it is not target product authority and creates no
>    obligation to preserve obsolete names, shapes, IDs, routes, flags, or
>    provider defaults.
> 4. The only target is the ratified D1–D34 model running on the exact Payload
>    v4 cohort admitted under D34; D35 may not weaken any prior ownership,
>    release, locale, route, media, form, search, health, or authorization
>    contract to simplify conversion.
> 5. Before any destructive action, one read-only census covers current source
>    code, CMS migrations, generated artifacts, fixtures, public readers, and
>    provider-stored workspace preferences or recent-item references that encode
>    legacy IDs, plus each explicitly named local or shared non-production
>    database and object store in scope.
> 6. Every command identifies the exact project, environment, database, schema,
>    and storage target; dry-run is the default, and unknown, ambiguous, or
>    production-classified targets are refused.
> 7. Every discovered item receives one plain disposition: discard confirmed
>    fixture/demo state, transform explicitly retained state, regenerate
>    derived state, or unresolved. Unresolved state blocks destructive action
>    only for the environment it could affect; it does not create a permanent
>    quarantine subsystem.
> 8. Retention is explicit and opt-in. Age, apparent realism, a familiar name,
>    a non-empty table, or an existing identifier never silently makes
>    prototype state authoritative.
> 9. Real donor, applicant, missionary, staff, authentication, session, token,
>    secret, or other sensitive state may not be promoted into repository
>    fixtures or committed exports. Synthetic identities are used for the
>    permanent development baseline.
> 10. Supabase Auth and Asym authorization remain the only identity and
>     permission authority. Payload users, roles, sessions, and credentials are
>     never migrated as competing authority; required CMS users are regenerated
>     as bounded projections.
> 11. An environment—or a narrowly isolated CMS namespace—proven disposable is
>     rebuilt directly from the clean target migrations and deterministic
>     target fixtures. A database-wide fresh/reset command is allowed only when
>     the whole target database is proven disposable; otherwise D35 changes only
>     its owned namespace. Neither path receives compatibility code or
>     per-record receipts for regenerated fixtures.
> 12. If deliberately retained non-production content exists, it is exported
>     before reset to an encrypted, git-ignored, short-lived manifest with
>     source identity, intended disposition, counts, relationships, byte
>     checksums where applicable, and a reviewed target interpretation.
> 13. The target model is designed cleanly from D1–D34. Legacy physical IDs are
>     preserved only when a ratified semantic identity or external route
>     obligation actually requires them; otherwise an ephemeral deterministic
>     old-to-new map is sufficient.
> 14. Before launch, the isolated Payload `cms` schema receives one reviewed,
>     clean v4 baseline that can build from an empty database. Obsolete CMS
>     baseline history may be replaced because it is pre-production; unrelated
>     Supabase application schemas and migrations are not rewritten.
> 15. Payload versions, drafts, relationship depth, access behavior, document
>     locking, and other behavior- or schema-affecting defaults are configured
>     explicitly for each target collection or global rather than inherited
>     accidentally from a prerelease or future v4 default.
> 16. Payload development schema push is limited to a proven disposable local
>     sandbox and is never mixed with committed migration execution. Every
>     shared environment uses reviewed migrations with schema push disabled.
> 17. Exactly one serialized actor applies migrations or the one-time transform
>     to a shared environment; concurrent agents and deployments may verify but
>     may not race authority-changing operations.
> 18. Retained state crosses a narrow, versioned semantic DTO boundary. A
>     disposable source exporter may know legacy Payload tables, but the target
>     importer consumes domain meaning and may not depend on legacy physical
>     schema.
> 19. The retained-state transformer exists only when the census proves a real
>     need. It is deterministic, idempotent, restartable from a clean target,
>     bounded by measured volume, and deleted after all named environments are
>     rebuilt and verified.
> 20. Imports use supported Payload/application and storage APIs. Transactional
>     nested writes pass the Payload request context; elevated system behavior
>     is explicit; notification, email, revalidation, search, and other external
>     side effects are suppressed narrowly and rebuilt deliberately—not skipped
>     through a blanket bypass.
> 21. Every retained record resolves through the canonical semantic keys
>     required by its ratified owning contract: Tenant and environment where
>     applicable, and Site, BCP-47 locale, page-family, or source owner only
>     when the entity is actually scoped by them. D27 Tenant-wide Media remains
>     Tenant-owned and its Site-use qualification remains a relationship, not
>     invented Site ownership. Cross-Tenant, cross-environment, cross-Site, or
>     cross-locale relationships fail closed unless a ratified contract
>     explicitly permits them.
> 22. Duplicate or case-colliding paths, ambiguous navigation links, missing
>     relationships, unsupported block or Lexical nodes, orphaned versions,
>     incomplete locale lineages, and draft/public ambiguity produce named,
>     actionable failures; conversion never invents a winner or silently falls
>     back.
> 23. Missionary, project, ministry-update, contribution, form-submission, and
>     other source-owned facts remain owned by their established domains.
>     Retained CMS state becomes references or editorial presentation under the
>     ratified contracts, never copied operational authority.
> 24. Drafts, versions, schedules, locale lineages, routes, redirects, and
>     navigation are retained only when explicitly selected and representable
>     without weakening D1–D34. Anything that cannot be represented is resolved
>     before execution, not hidden in a compatibility field.
> 25. Fixture media is regenerated. Retained media requires both metadata and
>     verified bytes, transferred through supported provider APIs under D27;
>     database rows, backups, or storage metadata alone are not proof of
>     custody.
> 26. Search projections, renditions, Used-in references, Content Health,
>     caches, sitemaps, generated public artifacts, and D1 Public Site
>     Generations are rebuilt from target authority rather than copied as
>     retained truth.
> 27. Target fixtures contain data only, use deterministic Tenant/Site/locale/
>     source/route identities and relationships, distinguish minimal invariant
>     fixtures from optional demos, and have explicit reset-only or genuinely
>     idempotent rerun semantics.
> 28. Payload types, JSON Schema, import maps, migration manifests, and other
>     generated artifacts are regenerated from the admitted exact cohort and
>     target config; CI proves regeneration produces no uncommitted drift.
> 29. Replacement occurs offline against disposable or deliberately prepared
>     non-production environments. There are no application dual writes, two
>     editable CMS authorities, or public traffic shadow paths.
> 30. D35 builds no CDC, logical replication, final-delta reconciler,
>     per-Tenant CAS authority pointer, live-editor drain, maintenance
>     countdown, permanent migration dashboard, generic ETL registry, or
>     horizontally scalable migration worker without measured evidence and a
>     new production decision.
> 31. Preparatory target-only changes may land without acquiring runtime
>     authority. One final bounded integration sequence switches every Web
>     Studio writer, public reader, Preview path, compiler input, script, and
>     test to the target, then removes the current mutable public readers,
>     stock-Admin fallbacks, collection-specific native flags, literal-path
>     authority, and legacy content fallback before D35 closes. Provider recent-
>     item and workspace preferences are discarded or re-keyed only by an exact
>     surviving semantic identity—never a fuzzy match. UI flags never define
>     canonical authority.
> 32. Before target acceptance, failure recovery is export preservation where
>     needed, clean reset, deterministic rerun, and re-verification. A partially
>     rebuilt environment is never marked usable, and recovery never requires
>     resurrecting a second runtime authority.
> 33. Ordinary staff never see D35's internal repository-replacement concepts,
>     retain manifests, physical mapping tables, maintenance controls,
>     compatibility screens, or provider jargon; D29's separate governed staff
>     portability journey remains intact. Staff encounter only the polished
>     target Web Studio: purposeful empty states or correctly retained content,
>     template-led starts, clear draft/save/publish meaning, equivalent desktop
>     and mobile navigation, accessible feedback, and no mystery about what is
>     public.
> 34. Shared test environments quietly and persistently identify themselves as
>     resettable; operator output uses named stages, exact counts, actionable
>     exceptions, and accessible status announcements rather than noisy alerts,
>     fake percentages, or guessed completion times. Console output, machine
>     reports, and CI artifacts are access-bounded, short-lived, and redacted;
>     they never emit content bodies, personal data, secrets, credentials,
>     tokens, or signed URLs.
> 35. Acceptance proves empty-database boot, deterministic fixtures, any
>     selected transform, Tenant and permission isolation, draft exclusion,
>     route and locale correctness, relationship closure, media bytes and
>     checksums, generated-artifact cleanliness, D1 compilation, public output,
>     final Web Studio journeys, equivalent desktop/mobile task completion,
>     keyboard and focus behavior, screen-reader status, reflow, touch targets,
>     reduced motion, and D33 performance/recovery budgets.
> 36. D35 is complete only when a fresh clone plus empty database can produce
>     the complete target system and every legacy schema, collection, route,
>     reader, writer, flag, fallback, adapter, fixture contract, transform, and
>     runtime dependency has zero use and is removed. Git history and compact
>     evidence remain; legacy runtime architecture does not.

## Ruthless synthesis

The selected direction is correct only in the hardened form above. The clean
target is not an additive second CMS. Selective transformation is not a generic
migration platform. The cutover is not a live operational ceremony. These are
three bounded implementation facts:

1. **Prove what exists.** Run one read-only, target-identified census. Default
   to regeneration; retain only explicitly valuable non-production content.
2. **Build the real target.** Implement D1–D34 cleanly on D34's admitted exact
   Payload v4 cohort, with an empty-database baseline, deterministic fixtures,
   exact Tenant/Site/locale ownership, and the final Web Studio UX.
3. **Transform only evidence-backed exceptions.** If a retain manifest is
   non-empty, use one temporary domain-shaped converter and verify records,
   relationships, paths, drafts, and bytes. If it is empty, no converter is
   built.
4. **Switch once and delete.** Move every writer, reader, compiler input,
   Preview route, fixture, and test to the target in one bounded integration
   sequence; remove every legacy path and the temporary converter.
5. **Prove launch readiness.** Bootstrap from a fresh clone and empty database,
   run the permanent security, Tenant-isolation, accessibility, public-route,
   media, generation, and performance gates, and retain only compact evidence.

The implementation must stop and reopen the cutover posture if Core becomes a
production system before this sequence executes. That is the only condition
that would justify reintroducing live continuity machinery.

## Deliberate exclusions

D35 does **not** authorize or require:

- a staff-facing migration center or maintenance workflow;
- preservation of prototype collection shapes or identifiers by default;
- dual writes, CDC, logical replication, live shadow traffic, or final-delta
  processing;
- a long-lived legacy schema, compatibility reader, or feature-flag matrix;
- a permanent migration dashboard, event bus, generic ETL framework, or job
  fleet; or
- destructive reset of any target whose exact identity and disposability have
  not been proven.

D29 remains the tenant-facing external-CMS import/export authority; D30 remains
the privileged diagnostics authority; and D31 remains the staff-facing Content
Health and typed-recovery authority. D35 creates no competing workspace for any
of them.

## User journey

### Developer or release operator

1. Run the D35 command in dry-run mode. The first screen names the exact local
   or shared test target and shows whether reset is permitted.
2. Review a short inventory grouped as **Regenerate**, **Retain**, and
   **Needs a decision**. Nothing is retained merely because it exists.
3. For a clean fixture-only target, approve one reset-and-rebuild action. For a
   target with deliberate content, approve the reviewed retain manifest first.
4. Resolve any exception in context. Errors name the Tenant, Site, locale,
   record, relationship, or object and explain the required correction; the
   command never silently skips it.
5. Execute the rebuild. Progress reports real stages—Export, Schema, Fixtures,
   Retained content, Derived projections, Verify—not decorative percentages.
6. Receive one final result with counts, checksums, test references, and either
   **Ready for testing** or a precise failed stage. A failed target remains
   clearly unusable and can be reset and rerun.

### Tenant staff after replacement

1. Staff enter the normal Mission Control Web Studio, not a migration surface
   or stock Payload Admin.
2. A fresh Tenant sees a purposeful template-led empty state. A deliberately
   retained Tenant sees its content in the same final information architecture,
   without migration badges or duplicate legacy screens.
3. Save, draft, Preview, schedule, and Publish use the ratified D1–D34 language
   and status model. Staff can always tell what is saved, what is public, and
   what action is available next.
4. A provider-era recent-item link or workspace preference survives only when
   it resolves to the exact same target semantic identity; otherwise it is
   reset rather than guessed or redirected to the wrong object.
5. Mobile, zoom/reflow, keyboard, and assistive-technology users retain the same
   context, logical order, status meaning, and available actions without routine
   progress stealing focus.
6. Shared test environments show one quiet, persistent, accessible
   “Test environment—content may be reset” treatment so staff are informed
   without being interrupted or alarmed.

### Donors, missionaries, and public visitors

There is no migration journey because there is no production audience to
migrate. They receive only the final, verified D1 public generations after the
target passes launch gates. Prototype and partially rebuilt content is never a
public fallback.

## Ratification record

The founder ratified the exact 36-clause **C-prime-R — census-gated clean target
with selective retained-state transformation and one-authority cutover**
formulation above as **Phase 23 D35** on 2026-08-24.
