# Phase 27 Q10 — organization stage customization

2026-10-10. D9 A selected and accepted without material amendment;
**Q10 B selected; amended D10 ratified.** Research and interview only; no formal specification,
implementation ticket, code, database configuration or activation.

## Why this question now?

[D9](phase27-d9-recorded-stage-review.md) lets staff retain the last recorded
stage when reopening and update it when ready. We can now address a larger
unresolved boundary: how much organizations may adapt the approved stage lists.

Organization-approved presets on one shared enrollment model are already required.
Staff development, church partnership and missionary support raising have their
own appropriate preset uses. This is not a choice between one universal list
for everyone and private personal pipelines. The [roadmap](../../../prds/sitestacker-parity/roadmap.md:4133)
expressly leaves customization depth open; the original request asks us to resolve
names, order, requirements and transitions while avoiding an arbitrary workflow
language. Those are separable decisions.

## Original single founder question — answered B

Asym will provide starting stage sets for staff development, church partnerships
and missionary support raising. Organizations may use different language for
describing that work.

**Should organizations be able to change the steps themselves, or just their wording?**

**A — Adapt names and guidance; keep the supplied steps (original recommendation).** An
organization can use familiar wording while preserving the stages' underlying
meanings and structure.

**B — Also change the stage list.** Authorized organization configuration can add,
retire or reorder stages to fit a different development process, preserving old
records and their meanings.

Both use organization-approved presets and shared records. Neither creates
personal pipelines, automatic outreach, new permissions or customizable business
rules. Requirements for changing stages and any allowed automation are separate
questions.

**Original recommendation, superseded by the selection and review below:** A is the smaller, more consistent scope for Phase 27 where
we have not verified a ministry need for extra relationship-progress stages.
The existing preset differences, asks and shared tasks already represent much
variation. B is a credible alternative when organizations need to distinguish
genuinely different parts of relationship development. It is feasible bounded
configuration, not inherently a workflow engine; its additional history,
retirement, configuration and reporting obligations should be justified by that
need. A is not a promise to build B later or a temporary workaround.

## Source checks and limits

Repository sources rechecked on 2026-10-10:

- [P27 roadmap](../../../prds/sitestacker-parity/roadmap.md:4087): one enrollment
  primitive, approved presets and stage history; customization is explicitly
  open at the phase's Open decisions section.
- [Retained P27 obligations](../../../prds/program-roadmap/owner-constraints.md:17)
  preserve staff and missionary presets; church partnership is first-class at
  line 40. They do not settle tenant-editable stage structure.
- [Original request](</workspace/attachments/9b86445f-5040-4a77-b0d1-d8508fc53404/Pasted text.txt:107>)
  requires stable identifiers and historical meanings when presets change and
  distinguishes stage configuration from a workflow language.
- [D3](phase27-d3-adversarial-review.md), [D7](phase27-d7-adversarial-review.md)
  and [D9](phase27-d9-recorded-stage-review.md) preserve separate participation,
  ask, lifecycle, consent and historical stage meanings. Customization cannot
  redefine those ownership boundaries.

Fresh primary-document retrieval, 2026-10-10:

| Source                                                                                                                                                                            | Documented fact                                                                                                                               | Limit for this decision                                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Blackbaud Configure Opportunity Statuses](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-opportunity-status-configure.html), RE NXT web view, undated | Organization settings map every opportunity status to a lifecycle stage and counting category; open statuses can have an overdue duration.    | Shows governed status configuration and reporting obligations. This page does not establish every add/delete capability, and opportunities are specific solicitations. Do not copy its lifecycle/count categories, clocks or two-level mapping model into Core. |
| [Virtuous What is the Gift Ask Pipeline?](https://support.virtuous.org/hc/en-us/articles/360051317631-What-is-the-Gift-Ask-Pipeline), CRM+, edited 2025-07-02                     | Administrators can customize organization Gift Ask Status values to reflect their major-gifts process. Each column corresponds to one status. | Demonstrates bounded customization is feasible. It does not prove custom relationship stages are necessary for missions agencies, nor approve its probability/financial-outcome rules for Core journeys.                                                        |

These pages were retrieved and read, not exercised in vendor applications.
Neither is evidence of actual Asym tenant needs or measured improvement. Two
independent reviewers agreed customization is the next meaningful open topic;
they differed on preferring fixed structure versus bounded stage-list changes.
The recommendation is product judgment, not a source-established universal best
practice. No live implementation or database qualification is claimed.

## Boundaries for either answer

- This chooses customization degree only. It does not finalize labels, required
  steps, transition gates, ordering semantics, new preset creation, automated
  actions, scoring or permissions. Configuration remains organization-approved
  through its appropriate existing authority; no new generic administrator power
  or personal pipeline is inferred.
- Names and guidance cannot silently change a stage's underlying business meaning.
  Historical records must not change meaning when a label changes. Preserve
  stable identity and truthful history under either option; exact evolution and
  migration mechanics follow the selected scope.
- Under B, retiring a stage is different from deleting history. An existing
  enrollment must not be silently advanced, closed or assigned a replacement
  stage because configuration changed. Moving a display position alone cannot
  assert relationship progress or trigger a message.
- Under A, guidance is explanatory, not a hidden language for mandatory fields,
  transitions or automation. Do not introduce an arbitrary configuration engine
  to support editing text.
- A meeting or one ask's response is not automatically a separate relationship
  stage. Use existing ask/task facts when they represent the need accurately;
  do not make their meanings competing stage authorities.
- [Retained P28 requirements](../../../prds/program-roadmap/owner-constraints.md:55)
  include legacy MPD labels mixing progress, participation and terminal/suppression
  concepts. They are requirements to reconcile with accepted source ownership,
  not an already ratified final mutually exclusive stage list. Neither option
  adopts those names verbatim, forces prayer partnership toward financial support,
  derives donor rejection from staff closure, or makes Never Ask/consent editable
  through stage configuration. Exact owner reconciliation belongs to preset
  meaning before implementation.
- No configuration may create contact consent, alter giving/commitments, bypass
  P12, expose private history or restart work. Mandatory current accountability
  stays independent of whatever stage list is selected.

## Founder answer and completed review

The founder selected **B — Also change the stage list**, explicitly requiring
flexibility for the missions organization using Asym and careful edge-case review.
The [full D10 review](phase27-d10-adversarial-review.md) evaluates all 22 requested
categories, the seven-part adversarial check, five fresh evidence appendices and
15 isolated PostgreSQL mechanics checks. It supersedes the original A recommendation.

**Disposition: Accept with required amendments.** Preserve stable identity and
earlier meaning; retirement prevents new selection without hiding/forcing movement
of existing work or blocking D9 reopening; explicit same-meaning restoration is
a new configuration change. Reorder is presentation only. Keep an available choice
and explicit treatment of any configured default. Apply atomically against the
current revision; adopt template updates deliberately. Existing source ownership
and P12 boundaries remain binding, without a new workflow or permission engine.

The founder explicitly confirmed, “Yes, ratify this amended D10.” The exact
amended decision and safeguards in the full review are ratified on 2026-10-10.
The interview continues with [Q11](phase27-q11-stage-entry-requirements.md), which
asks whether organization stage guidance remains advisory or may include bounded
required information. No live application, Supabase, migration, accessibility or
performance qualification is claimed.
