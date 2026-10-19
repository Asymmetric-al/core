# D11 evidence — guidance with staff judgment

**2026-10-10 UTC.** A is selected. This appendix recommends a clear, polished
interaction without organization-configured blocking information requirements.
It is research, not a ratified amendment, formal specification or implemented UI.

## Recommended interaction and strongest alternative

Use one compact **Change stage** editor in the partnership's context. Show the
supporter/ministry, current recorded stage and proposed stage. Display the selected
stage's short meaning beside the control; make longer examples available without
hiding essential distinctions. Use ordinary ministry language and one clear
**Save stage** action with Cancel. Do not require a separate confirmation,
acknowledgment, justification, new interaction record or manager approval.

This explicit-save interaction is a product recommendation, not a universal WCAG
requirement. A future qualified quick action may differ; D11 does not require
building a board, drag gesture, modal, new notes field or wizard. Optional context,
where supported, stays optional. Existing source-owned authorization, eligibility,
history and next-action rules still apply. A valid existing next action should
not become a request to invent another merely because the stage changed.

“Beautiful” should mean calm hierarchy, readable stage meanings, balanced Maia
spacing, clear selection/focus and polished responsive states. Avoid decorative
funnels, implied progress percentages, celebration effects and control clutter.
These are design judgments to validate, not measured preferences of missions staff.

The strongest B is a small, supported information requirement at selected stages
where an organization needs consistent handoff evidence. HubSpot demonstrates that
capability independently of list customization. It still needs legitimate unknown
values, source ownership, inaccessible-field handling and enforcement across
admitted paths. A avoids that configuration and blocking burden. Neither policy
proves that a conversation happened; a compulsory note can contain filler. That
risk is inference, not an observed Asym study. Preserve A unless later evidence
supports a separately reviewed change; do not reintroduce B as mandatory “guidance.”

## Current Core evidence

Inspected 2026-10-10, read-only:

- [Q11](../phase27-q11-stage-entry-requirements.md) separates optional organizational
  requirements from existing source safeguards. [D9](../phase27-d9-recorded-stage-review.md)
  and ratified [D10](../phase27-d10-adversarial-review.md) protect unchanged recorded
  stages, retirement, stable meanings and shared configuration.
- [UI contract](../../../../../packages/ui/AGENTS.md:12) and
  [components.json](../../../../../packages/ui/components.json:3) require exact
  `base-maia`, Base UI, semantic tokens and shared primitives. Existing Select,
  Field and Dialog support composition; no second design system is needed.
- [Select](../../../../../packages/ui/components/shadcn/select.tsx:25) supplies
  focus/invalid/disabled styling and a scrolling popup. Its compact trigger and
  clamped value do not prove long-label or touch usability in the eventual flow.
  [FieldDescription](../../../../../packages/ui/components/shadcn/field.tsx:144)
  renders a paragraph; consumers must establish its accessible relationship.
- [Dialog](../../../../../packages/ui/components/shadcn/dialog.tsx:44) offers an
  optional scrollable layout and labeled close control. Its existence does not
  prove composed focus restoration or soft-keyboard usability.
  [Touch tokens](../../../../../packages/ui/styles/globals.css:144) and
  [accessibility review](../../../../ai/skills/accessibility-review/SKILL.md:22)
  require actual target, keyboard, feedback, zoom and focus verification.

No browser composition, visual audit, component CLI change or new product code
was executed. Source availability is not an accessibility certification.

## Fresh primary sources

All were retrieved/read **2026-10-10**. Undated SaaS help does not identify a
pinned installed release. Summaries describe documented behavior, not vendor trials.

| ID  | Source, product/date                                                                                                                                                                                                                                                                                                                                                                               | Relevant fact and boundary                                                                                                                                                                                                                                                                                      |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | Salesforce Lightning/Agentforce Sales [Path and Kanban](https://trailhead.salesforce.com/content/learn/modules/leads_opportunities_lightning_experience/visualize-success-with-path-and-kanban), current undated Trailhead                                                                                                                                                                         | Path presents guidance by step; users can select a different stage and mark it current. Demonstrates contextual guidance plus deliberate action. Does not establish Nonprofit/NPSP equivalence, lack of validation rules, ministry suitability or measured usability. Do not copy automatic next-step language. |
| E2  | RE NXT web [Manage Opportunity Statuses](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-opportunity-statuses.html), undated                                                                                                                                                                                                                                             | Change status is available from record/list contexts; choose status, date/comment, then Save. Comment optionality is not established. Its blank-stage, date-edit and history-deletion behavior is not adopted.                                                                                                  |
| E3  | Virtuous CRM+ [Gift Ask Pipeline](https://support.virtuous.org/hc/en-us/articles/360051317631-What-is-the-Gift-Ask-Pipeline), updated **2025-07-02**                                                                                                                                                                                                                                               | Ask-specific drag board also exposes a card edit action. Neither its accessibility nor a relationship-stage policy is proven; probability, financial totals and Won/Lost semantics remain ask-specific.                                                                                                         |
| E4  | HubSpot CRM [Object pipelines](https://knowledge.hubspot.com/object-settings/set-up-and-customize-pipelines), updated **2026-09-08**, plan-dependent features                                                                                                                                                                                                                                      | Conditional properties can appear on manual creation/moves; marking a property required blocks the documented update until supplied. This supports a credible B, not universal API enforcement or adoption under A.                                                                                             |
| E5  | Contentful web [Configure a field](https://www.contentful.com/help/fields/configure-a-field/), undated                                                                                                                                                                                                                                                                                             | Help text under Appearance is distinct from Validation requirements. Useful CMS analogy for advice versus enforcement; no Core schema or workflow follows.                                                                                                                                                      |
| E6  | GOV.UK [Details](https://design-system.service.gov.uk/components/details/) and [Error summary](https://design-system.service.gov.uk/components/error-summary/), current undated guidance; error component history includes **June 2026**                                                                                                                                                           | Hide supplementary detail, not information most users need. Errors should connect to correctable inputs with consistent wording and deliberate focus. Do not copy GOV.UK styling or impose a page-sized summary on every compact edit.                                                                          |
| E7  | WCAG 2.2 [On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html), updated **2026-06-28**; [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), **2026-05-11**                                                                                                                                                                                        | Prevent unannounced context changes; expose material status feedback to assistive technology without needless interruption. These explanatory documents do not ban all autosave or require announcing every guidance change.                                                                                    |
| E8  | WCAG 2.2 [Dragging](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html), **2026-08-10**; [Targets](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), **2026-05-11**; [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), **2026-09-06**; [Focus](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), **2026-06-15** | Provide non-drag pointer operation, usable reflow and unobscured focus. WCAG target minimum is 24 CSS px with exceptions; Core's 44px touch guidance is stronger. Understanding pages explain the criteria; product conformance requires actual testing.                                                        |

## Graded concerns and exact corrective language

Severity is prospective impact; likelihood is qualitative design judgment,
not production frequency. All findings retain A and qualify implementation.

| ID / concern                             | Grade, evidence                                                                                                                   | Proposed exact obligation and proof                                                                                                                                                         |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| U1 Hidden B                              | High / plausible. Q11, E4/E5. Required notes, acknowledgment or “optional” fields enforced by schema reverse A.                   | “Ordinary stage changes SHALL succeed without tenant-configured additional information or guidance acknowledgment, while preserving existing source invariants.” P1.                        |
| U2 Unusable advice                       | Medium / plausible. E1/E5/E6. Hover-only help, long essays or detached documentation obscure distinctions.                        | “Show concise stage meaning in context; expose supplementary examples accessibly. Missing optional guidance SHALL NOT block a valid update.” P1/P2.                                         |
| U3 Accidental or misleading action       | High / plausible. D9/D10, E1/E7. Browsing options, next-step arrows or reorder can masquerade as assessment.                      | “Distinguish current recorded state, proposed selection and accepted result; browsing/canceling SHALL NOT mutate history. Do not imply a forced sequence.” P1/P3.                           |
| U4 Lost or duplicate changes             | High / plausible. Source acceptance requirements; E7 supports feedback, not transaction mechanics.                                | “Distinguish saving, saved, rejected, conflict and unconfirmed outcomes. A lost response SHALL NOT be presented as definite failure or success; recover the authorized outcome safely.” P3. |
| U5 Stale context                         | High / plausible. D10, source judgment. Another editor or retired choice can invalidate visible intent.                           | “Explain conflicts in plain language, retain safe unapplied intent and offer current information; never silently overwrite or choose a similar stage.” P3.                                  |
| U6 Inaccessible convenience              | High / plausible. E7/E8, shared-source limits. Drag-only, hidden focus or toast-only results exclude users.                       | “Every stage action SHALL support keyboard and tap/click, labeled guidance, visible focus and accessible material feedback; drag is optional.” P4.                                          |
| U7 Mobile/locale failure                 | Medium / plausible. E8; Select/Dialog inspection. Clipped translated labels and keyboard-covered controls defeat accurate choice. | “Preserve distinguishable full meanings, reflow and reachable actions across supported locales, zoom and mobile keyboards; never use labels as identities.” P4.                             |
| U8 Scope/privacy confusion               | High / plausible. Q11/D10; UX inference. Shared help can expose private details or invite contact beyond consent.                 | “Guidance SHALL describe stages, not contain supporter/care facts or grant permissions. Show only authorized context; safety/source errors SHALL not reveal hidden facts.” P5.              |
| U9 Visual success mistaken for usability | Medium / likely if review stops at screenshots. Core/E6–E8. Consistency alone does not prove comprehension.                       | “Use shared Maia hierarchy/tokens and validate complete tasks, including failure states, with representative staff and assistive input.” P2/P4.                                             |

## Meaningful acceptance proof, still required

**P1 — A is real.** With a legitimate current next action, complete an ordinary
stage change without notes, acknowledgment or another task. Preview and cancel;
history remains unchanged. Retain a retired stage on D9 reopening without forced
reassessment. Existing authorization and eligibility failures still reject.

**P2 — Staff understanding.** Observe representative missionary and development
staff, including new and experienced users, identify current versus proposed stage,
explain a stage distinction, find guidance and complete an accurate change without
coaching. Include prayer partnership and simultaneous special asks. Record observed
confusion, assistance and errors; revise content/interaction before retesting.
Do not invent success percentages or call a single attractive screen validated.

**P3 — Honest outcomes.** Exercise slow delivery, double activation, committed
response loss, another editor, retired destination and revoked access. Verify one
accepted effect, current permitted readback, actionable recovery and no false
rollback. Canceling a request cannot erase an accepted change. Optional guidance
display must not require a new remote provider or unnecessary request waterfall.

**P4 — Full accessible composition.** Test keyboard, screen reader, tap/click,
320-CSS-pixel reflow, zoom, long Unicode/RTL labels, soft keyboard, touch targets,
contrast and reduced motion. Verify focus after save/cancel/error, full label
distinguishability and useful announcements without excessive chatter. Automated
checks complement manual testing; neither source inspection nor axe alone proves
conformance. A board gesture, if provided, needs equivalent non-drag completion.

**P5 — Boundaries.** Shared guidance edits do not rewrite assessments or create
tasks, ask outcomes or communications. Restricted context stays restricted through
errors, history, drafts and refresh. Safe input recovery is not permission to
persist sensitive drafts indefinitely or promise offline activation.

No ministry pilot, vendor trial, measured benefit, accessibility pass or live
tenant operation was completed. This evidence supports the proposed UX contract;
it does not establish readiness to release it.
