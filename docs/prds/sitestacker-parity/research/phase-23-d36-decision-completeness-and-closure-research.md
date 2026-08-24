# Phase 23 D36 — Decision Completeness and Closure Research

**Status:** Complete research supporting founder-ratified Phase 23 D36.  
**Date:** 2026-08-24  
**Scope:** Formal completeness, downstream ownership seams, source-of-truth
closure, scenario and failure coverage, testing/evidence carry-forward, and the
boundary between grooming and specification.

## Executive conclusion

Phase 23 has completed founder-level product grooming. D1–D35 cover
every substantive decision area in the source prompt, including the complete
CMS model, staff and public journeys, provider boundary, current implementation
replacement, and named downstream seams. The remaining choice is therefore
whether to **close and freeze the decision set**, not what additional CMS
feature to add.

The founder ratified **A-prime-R — formal Phase 23 decision closure with frozen
D1–D35 authority, owner-bounded downstream seams, and evidence-gated handoff**.
It carries the source prompt's testing and evidence requirements into the
specification, translated through the ratified decisions. The founder separately
invoked `$to-spec` in the ratification message, so specification synthesis and
issue publication may now proceed without authorizing runtime implementation.

## Evidence method and source quality

This audit compared:

- the original Phase 23 prompt's required downstream seams, decision areas,
  testing strategy, evidence package, and closure pass;
- all 35 numbered decisions in the active decision log;
- the accepted ADRs created for cross-cutting Phase 23 decisions;
- the phase map's surface-ownership and shared-contract guardrails; and
- the current checked-out repository rather than an older indexed snapshot.

A repo-scoped indexed search was also attempted. It returned obsolete `src/*`
paths and outdated decision descriptions, so it was not treated as current
evidence. Direct reads of this worktree and the supplied source prompt are the
authority for this closure audit.

## Decision-area completeness

| Source-prompt area                                        | Ratified authority    | Closure result |
| --------------------------------------------------------- | --------------------- | -------------- |
| Core Page/content/Site Plan model                         | D1, D6, D8, D10, D23  | Ratified       |
| Hierarchy, paths, breadcrumbs, moves, redirects           | D2–D3                 | Ratified       |
| Navigation model, purposes, item grammar, publication     | D4–D5                 | Ratified       |
| Blocks, reusable content, templates, custom presentation  | D7–D10                | Ratified       |
| Rich text and typed embeds                                | D11                   | Ratified       |
| Drafts, versions, autosave, conflict recovery             | D12                   | Ratified       |
| Coordinated releases, preview, schedules, recovery        | D1, D4, D10, D13, D25 | Ratified       |
| Dynamic sources, curation, and public list discovery      | D14–D16               | Ratified       |
| Public site search and removal convergence                | D17                   | Ratified       |
| Folders, Topics, Saved Views, Trash                       | D18–D21               | Ratified       |
| Localization and exact locale lineages                    | D22                   | Ratified       |
| Multisite ordinary-content scope and copy semantics       | D23                   | Ratified       |
| Public versus authenticated audiences and caching         | D24                   | Ratified       |
| Whole-Site candidate Preview                              | D25                   | Ratified       |
| Forms, submissions, destinations, email, and handoffs     | D26                   | Ratified       |
| Public DAM/media catalog and byte custody                 | D27                   | Ratified       |
| SEO, search metadata, social sharing, sitemaps, robots    | D28                   | Ratified       |
| Staff exports and staged content imports                  | D29                   | Ratified       |
| Staff identity, authorization, raw Payload, diagnostics   | D30                   | Ratified       |
| Content Health, visibility, ownership, and recovery       | D31                   | Ratified       |
| Accessibility assistance and release invariants           | D32                   | Ratified       |
| Runtime capacity, performance, cost, and Vercel admission | D33                   | Ratified       |
| Payload v4 target, qualification, upgrade posture         | D34                   | Ratified       |
| Current implementation census, replacement, and cutover   | D35                   | Ratified       |

There is no missing decision-area number, and no source-prompt workstream from
sections 17–46 remains without a ratified owner.

## Downstream seam closure

The source prompt requires Phase 23 to preserve later-phase seams without
building those later products. D1–D35 already establish the necessary
boundaries:

| Later owner                              | Phase 23 boundary already established                                                                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase 22 specialized ministry pages      | D1, D8, D22, and D23 preserve source-owned specialized records and exact public projections without converting them into ordinary CMS truth.                                   |
| Phase 24 Site/language/currency settings | D1, D2, D4, D22, D23, and D28 are Site- and locale-ready while Phase 24 retains complete settings and resolver UX.                                                             |
| Phase 25 Donor Portal                    | D24 forbids donor-private content in the public CMS and keeps authenticated surfaces app-owned.                                                                                |
| Phase 26 Support Hub                     | D26 permits only a qualified domain-owned submission destination and never creates a second inbox.                                                                             |
| Phase 27 Donor Development               | D1 and D28 may expose stable public references; appeal, cultivation, and Source Code truth remain outside CMS ownership.                                                       |
| Phase 28 Missionary Workspace            | D22/D23 preserve exact owner and copy semantics; general Web Studio is not a missionary admin console.                                                                         |
| Phase 29 file management                 | D27 owns public media semantics while reserving immutable byte/rendition custody for the Phase 29-compatible file boundary.                                                    |
| Phase 30 general imports                 | D29 owns content-specific portability while general staging and migration remain Phase 30 responsibilities.                                                                    |
| Phase 31 connectors and public APIs      | D14, D26, and D30 allow only certified purpose-specific adapters and typed Asym commands; raw Payload REST, GraphQL, Local API, and database access are not product contracts. |
| Phase 33 reporting and BI                | D1, D17, D26, and D31 provide governed projections and receipts without making reports a content or publication authority.                                                     |
| Phase 34 workflow engine                 | D12, D13, D26, and D31 ship fixed safe lifecycles and cause-owned recovery without a configurable workflow engine.                                                             |
| Phase 36 peer-to-peer campaigns          | D1, D9, D14, and D24 may later supply rendering and public-safe projections; fundraiser identity, lifecycle, and moderation remain Phase 36 truth.                             |
| Phase 37 events and opportunities        | D14 and D26 accept only future certified source and submission adapters; record/application workflow truth stays with Phase 37.                                                |
| Phase 38 restricted operations           | Phase 10 plus D1, D14, D17, D24, and D26 keep restricted content out of generic Pages, blocks, search, forms, and caches; D30 prevents provider bypass.                        |
| Phase 39 field-first UX                  | D12 and D33 require responsive, recoverable online editing; Phase 23 does not promise offline publication or destructive offline commands.                                     |
| Phase 40 stewardship and AI              | D30 and D32 keep suggestions permissioned and human-committed through typed commands; no provider MCP or AI process writes or publishes directly.                              |

This is an ownership closure, not a generalized integration architecture. A
later owner may activate a narrow, versioned contract only when its real
consumer, security bounds, failure behavior, and conformance tests exist.
Phase 23 does not prebuild a connector catalog, event bus, workflow DSL,
reporting platform, AI writer, placeholder tables, or a second integrations
dashboard.

For staff, healthy machinery stays quiet. An uncertified or unauthorized
capability is existence-safe and absent. A certified capability appears in the
task that uses it, in plain product language, only for an authorized user and
only when the owning product can support or configure it in that exact scope;
when it is not ready, Web Studio may offer a clear owner-native next action.
Setup, credentials, mappings, lifecycle controls, and raw diagnostics stay with
their owning product or Phase 31; D31 shows only actionable content impact and
D30 retains privileged engine detail. This is a closure interpretation of the
existing owner boundaries, not a new Phase 23 feature.

## Formal closure-pass results

### Decision completeness

- D1–D35 are founder-ratified.
- No decision is unresolved, silently deferred, or blocked by an unstated
  predecessor amendment.
- D34 is an implementation-time qualified-review gate for the exact Payload v4
  cohort. D35's named-target hosted row/object census and disposition are also
  implementation-time qualified-review gates, and D35 stops if the
  pre-production premise changes.
- Features expressly assigned to later phases remain deferred to those owners,
  not missing from Phase 23.

### Current implementation classification

D35 classifies every material **repository and current-source pattern** as
evidence rather than a second architecture, and defines its clean target,
optional temporary retained-state transform, one-authority replacement, and
legacy-retirement rules. Hosted row/object state is deliberately not presumed
known: each named target still requires D35's implementation-time read-only
census and explicit disposition before destructive action.

### Payload-version closure

D34 closes the **decision contract** for the major-line target, future live
version discovery, one exact cohort pin, qualification matrix, stable-v4
preference, upgrade policy, plugin posture, fallback, and enterprise-feature
independence. Grooming has not selected or qualified a Payload v4 cohort. D35
may later apply only the implementation-time cohort that D34 actually admits.

### Source-of-truth closure

D1–D35 name the authorities for Pages, content, placement, hierarchy,
Navigation, redirects, schedules, dynamic sources/lists, search, forms, media,
authorization, audit evidence, health, runtime serving, and current-state
replacement. Payload is an engine behind Asym contracts, never the staff
identity, permission, public API, or public serving authority.

### Scenario closure

The ratified decisions define the complete journeys for ordinary Pages,
landing Pages, Articles, Reusable Sections, specialized Phase 22 pages, several
Sites and locales, Page moves, slug changes, Navigation changes, redirects,
scheduled publish/unpublish, dynamic lists, search, forms, Trash/restore,
Preview, public media, and emergency adverse action.

### Failure and security closure

Every state-changing family has an exact owner, typed command, scope and
capability reproof, expected revision or sealed input, idempotency/retry rule,
safe partial-failure posture, cause-owned recovery, and audit/receipt boundary.
Tenant, Site, locale, environment, public/authenticated, draft, preview, search,
cache, form, media, job, and provider-bypass risks are explicitly addressed.

## Testing and evidence carry-forward

Source-prompt sections 66–67 are preserved in the repo as the
[closure testing, evidence, and issue-readiness checklist](./phase-23-closure-testing-evidence-and-issue-readiness-checklist.md).
They remain mandatory acceptance input for the future specification. They are
not new founder decisions, and their illustrative wording must be translated
through the ratified contract:

- “upgrade from current Asym schema,” “migration dry run,” and “rerunnable
  migration” mean D35's clean-target reproducibility plus any census-selected
  temporary retained-state transformation, when required—not an in-place
  production migration or a permanent ETL framework;
- localization “fallback” tests must prove D22's explicit no-silent-field-
  fallback behavior and exact locale-lineage outcomes;
- release “approval” tests mean the ratified capability/review evidence and D1
  activation rules, not a new configurable approval engine;
- workflow, Support Hub, event/opportunity, reporting, connector, and AI cases
  test only a certified owner contract when that owning phase exists; absent
  future owners remain unavailable rather than mocked as working;
- provider qualification is run against the implementation-time D34 cohort,
  not today's prerelease by assumption; and
- Built, Live, and Confirmed remain separate evidence states. Documentation or
  a passing unit test alone cannot claim a live product capability.

The eventual specification must preserve the full negative-test matrices,
accessibility journeys, capacity gates, recovery drills, content-editor
usability evidence, operations walkthroughs, known limitations, and deferred
owner boundaries. Ticket authors may slice those requirements but may not
weaken or silently omit them.

## Ratification outcome

The founder selected formal closure. D1–D35 are frozen as the complete founder
product contract, Phase 23 grooming is closed, and later contradictions require
an explicit numbered founder amendment. The founder's separate `$to-spec`
invocation starts the evidence-gated specification workflow; it does not permit
runtime implementation, schema or dependency changes, hosted-data access, or
deployment.
