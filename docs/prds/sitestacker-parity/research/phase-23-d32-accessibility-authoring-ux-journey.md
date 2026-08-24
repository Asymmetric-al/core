# Phase 23 D32 Quiet Accessibility Assistance UX Journey

**Status:** Complete supporting UX contract for the founder-ratified exact Phase
23 D32 C-prime-R decision. It explains the decision without independently
expanding the ratified authority or authorizing implementation.

**Date:** 2026-08-24

**Ratified:** 2026-08-24

## UX verdict

Accessibility assistance should feel like good authoring design, not an audit,
inspection, or compliance ceremony. Most accessibility work should disappear
into safe components and sensible defaults. When staff judgment is needed, the
product should ask one plain question at the point of use, explain why only on
request, and let the Tenant keep its choice without shame or extra approval.

The staff-facing label is **Accessibility help**:

> Small checks that help more people use this page.

The domain contract remains **Accessibility Assistance**. `Accessibility help`
is UI copy, not a second technical authority or a claim that every visitor need
can be proven automatically. It also avoids colliding with D24's established
public-versus-authenticated access vocabulary.

## Responsibility model staff can understand

| Situation                                                                                      | UI behavior                                                                         | Owner                      |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------- |
| Asym can guarantee correct mechanics                                                           | Build it correctly and show no issue                                                | Asym                       |
| A custom package has a keyboard, focus, responsive, semantic, motion, or generated-code defect | Explain that the design needs an Asym update; never ask staff to repair code        | Asym or package maintainer |
| A structured component lacks information needed to render an operable result                   | Save and Preview remain available; identify the one detail to finish before release | Active editor              |
| Quality requires human context                                                                 | Show a quiet suggestion that never disables Publish                                 | Tenant                     |
| Tenant intentionally retains its wording or presentation                                       | `Keep as written`; collapse the unchanged suggestion                                | Tenant                     |
| A verified platform regression appears after release                                           | Route through D31 to the cause owner                                                | Asym or source owner       |

## Information architecture

### No separate compliance product

D32 adds no dashboard, navigation badge, site grade, workflow queue, reviewer
role, approval state, or recurring notification stream.

One ordinary **Accessibility help** action sits with the existing Page actions. It
opens an in-flow, single-column section under the document-state area. It must
not live only in the current desktop-only Inspector.

The section has at most four groups:

1. **Details to finish** — incomplete structured information already required
   by a source contract.
2. **Suggestions** — non-blocking human-judgment guidance.
3. **Technical issue** — Asym or the package owner must act.
4. **Previously reviewed** — collapsed unchanged suggestions.

`What was checked` is a collapsed disclosure for interested staff and support.
Passed checks remain hidden. There is no celebratory gauge or green conformance
claim when the list is empty.

### Visual language

- Use Core's existing card, field description, list, disclosure, button, and
  focus patterns.
- Use ordinary neutral surfaces for suggestions. Do not turn every suggestion
  red or yellow.
- Reserve field-error treatment for missing structured information that already
  prevents the component from being complete.
- Use text and icon together; color never carries status alone.
- Do not animate counts, pulse badges, or auto-open the panel.

## Complete staff journey

### 1. First entry and onboarding

The editor opens normally. There is no accessibility wizard, coach-mark tour,
legal disclosure, checklist modal, or choice to enable an accessible mode.

Approved components already provide semantic structure, keyboard behavior,
visible focus, responsive output, reduced motion, and non-drag alternatives.
The safest path is therefore also the shortest path.

If staff intentionally open **Accessibility help** with no findings, the response
is bounded:

> No suggestions for this page right now.
>
> Automated checks cannot review every visitor experience.

This is truthful without creating anxiety or a false certificate.

### 2. Ordinary text and composition

- Heading components offer purpose-named choices instead of making occasional
  staff manage raw heading levels.
- CTA and button components include their ordinary visible label field.
- Every draggable Page section also exposes visible **Move up** and **Move
  down** actions and keyboard operation.
- Platform motion automatically honors reduced-motion preferences.

Cheap local checks run after insertion, blur, save, or a short idle boundary.
They do not run a full Site scan or announce status on every keystroke.

### 3. Image placement

At the exact Page and locale placement, ask:

> **How does this image help the page?**

- **It adds meaning** — reveal `Describe what visitors need to understand`.
- **It is decorative** — store the explicit decorative disposition.
- Any already-ratified D27 complex-image or image-of-text branch remains
  available only when that semantic use requires it.

A short `Why this helps` disclosure is collapsed. The system does not judge
whether the chosen classification or prose is good enough.

If AI assistance is later qualified, display:

> **Suggested description**
>
> Children carrying school supplies outside the Mae Sot learning center.
>
> **Use suggestion** · **Edit**

Nothing is inserted or accepted silently. The original filename is never used
as an alternative. A catalog-level description may be suggested, but the exact
placement and locale remain authoritative.

### 4. Link or action

The ordinary component asks:

- visible label;
- destination or typed action; and
- any already-ratified link behavior.

A completely nameless or destinationless action is unfinished ordinary
component data, not an accessibility opinion. A vague but non-empty label is a
suggestion:

> **Check this link text**
>
> “Learn more” may be unclear outside this section.
>
> **Edit text** · **Keep as written**

The editor may keep any meaningful label without explanation or attestation.

### 5. Video and other structured content

D11's captions-or-equivalent disposition remains part of the typed Video
component. Staff see plain choices rather than a late `WCAG failure`:

- **Includes speech or important sound**;
- **No speech or important sound**; or
- **I'll finish this later**.

The last choice preserves Save and Preview while making the incomplete
structured decision visible before the successor can release.

Questionable heading order, link quality, content-level contrast over imagery,
plain language, or alternative-text quality remain suggestions whenever a
reliable machine determination is impossible. Tables remain outside D11 v1 and
are not introduced by D32; any later table-capable semantic component requires
its own ratified source contract before assistance applies.

### 6. Contextual suggestion behavior

Each suggestion:

- begins with the likely visitor consequence;
- names one next action;
- offers optional plain-language decision help;
- belongs to the exact source field, block, reusable item, placement, locale,
  or package;
- never appears simultaneously as duplicate inline and summary prose; and
- never contains raw WCAG, ARIA, DOM, Payload, Lexical, or scanner language in
  its ordinary view.

No toast appears. No modal interrupts typing. Background checks do not steal
focus or announce each refresh.

### 7. Opening Accessibility help

The Page action remains reachable in one action from the normal workspace. A
small neutral count may appear only when findings exist; it is not a global
navigation badge or urgency signal.

Each item has **Go to field**. Activating it:

1. preserves undo and current revision state;
2. closes or collapses the summary when needed;
3. scrolls the target clear of sticky chrome;
4. focuses the actual field or block;
5. provides a programmatic description; and
6. lets the user return to the summary without reconstructing context.

### 8. Preview

Preview is always available and renders the exact candidate, locale, reusable
content, dynamic inputs, and Presentation Package.

The normal preview remains realistic and is not covered by warning overlays. An
issue-specific **View in preview** action may open one preview-only annotation
for the affected component. The same relationship must be available through
named headings and links for keyboard and screen-reader users.

Optional inspection aids may help staff review focus order, text resizing,
reduced motion, and responsive layouts. They are never presented as a
simulation of every disability or assistive technology.

### 9. Publish

Accessibility review is folded into the existing D1 candidate review. It does
not add another wizard step.

#### No findings

Publish behaves exactly as ordinary publication.

#### Suggestions only

Publish behaves exactly as ordinary publication. Suggestions remain available
from **Accessibility help** in the Page workspace, but they add no release-review
row, `Publish anyway`, legal warning, typed justification, attestation, or
confirmation dialog.

#### Details to finish

One persistent error summary receives focus:

> **2 details need attention before this version can be published**
>
> Your draft is saved, and the current live site has not changed.

Each item links to the exact repair. These are only source-contract completion
requirements already necessary for operable output; D32 does not invent a new
subjective gate.

#### Technical issue

> **This design component needs an update from Asym**
>
> Your content is saved. The current published design is still active.

Staff are never asked to repair ARIA, DOM order, CSS, React, focus, package
code, compiler output, or infrastructure.

### 10. Keep as written

For a human-judgment suggestion, **Keep as written**:

- requires no reason or approval;
- applies to the exact rule-declared semantic inputs, locale, and check-meaning
  version, adding package or compiler identity only when that rule depends on
  it;
- moves the item under collapsed `Previously reviewed`;
- is shared as part of the exact content revision, not a personal hidden
  preference;
- is invalidated only when the affected content or rule meaning changes; and
- is not a waiver, compliance proof, legal record, or assertion that the
  content is accessible.

There is no `Dismiss all`, `Ignore forever`, tenant-wide rule disablement, or
bulk approval.

### 11. Collaboration and stale editors

D12's active-editor contract remains authoritative. View-only staff may inspect
suggestions but cannot change content or `Keep as written` state. A stale editor
cannot overwrite a newer revision or activate a candidate checked against old
inputs.

Unrelated edits do not resurrect suggestions. Only the affected fingerprint or
rule version invalidates continuity.

### 12. Locales

Every finding and review continuity is scoped to the active D22 locale lineage.
A source-language decision never silently completes or reviews a translation.

Copied or suggested text says:

> Copied from English · Review for Spanish (Mexico)

The target-locale author can use, edit, or keep it. Counts are not combined
across languages in a way that obscures which locale needs attention.

### 13. Reusable and dynamic content

- A reusable source defect appears once at its real source with an authorized
  affected-Page count.
- Page-local image meaning, crop, caption, or action semantics stay at the
  placement.
- Opening a shared-source repair explains which Pages and locales may change.
- D1 checks the exact compiled candidate so a referencing Page cannot appear
  clear merely because its issue lives elsewhere.
- Dynamic-source and package-owned findings name their owner rather than
  creating a fake editable Page field.

### 14. Imports, APIs, and schedules

D29 keeps imported content private during staging. D32 may group common legacy
suggestions so onboarding is not flooded with thousands of duplicate rows.
Suggestions do not block migration or publication. Existing source-contract
requirements remain explicit and repairable before activation.

REST, GraphQL, Local API, scheduled execution, reusable content, and package
paths cannot assert a passing result from client form state. D1 derives the
same exact-candidate result.

### 15. Check unavailable or stale

The required deterministic checks are compiler-local and versioned. D32 does
not depend on a remote scanner or introduce a new recurring bill.

If optional assistance cannot finish:

> **Visitor checks are temporarily unavailable**
>
> Your draft is saved. You can Preview and Publish; suggestions may be
> incomplete.

An unavailable advisory check fails open and never claims success. Failure to
prove an already-ratified platform or source invariant fails only the exact
successor candidate closed, with the current generation preserved.

### 16. After publication

Accepted editorial suggestions do not become D31 incidents, Content Health
debt, compliance scores, emails, or assignments.

Only a verified platform regression, broken generated behavior, or newly
adverse source-owned fact enters D31. D31 routes to the actual cause owner and
does not reopen a Tenant's unchanged editorial choice.

## Anti-noise contract

1. No score, grade, percentage, conformance badge, or legal claim.
2. No onboarding wizard or mandatory site-wide checklist.
3. No panel that opens itself while staff write.
4. No per-keystroke toast, badge animation, or live-region announcement.
5. No publish modal when only suggestions remain.
6. No `Publish anyway` scare language.
7. No required explanation for `Keep as written`.
8. No global mute, dismissal, or rule-disable control.
9. No resurrection after unrelated changes.
10. No duplicate issue prose at the field and Page level.
11. No issue multiplication for one reusable root cause.
12. No cross-locale count that hides ownership.
13. No raw WCAG codes or implementation jargon in ordinary copy.
14. No silent AI insertion, translation approval, or bulk repair.
15. No notification for routine checking, suggestions, or unchanged findings.
16. No staff-facing issue when Asym can prevent the condition in components,
    schemas, tokens, compilers, or package certification.

## Accessibility of the assistance itself

- The same complete journey works with keyboard, screen reader, touch, switch,
  voice input, 320 CSS-pixel reflow, 400% zoom, forced colors, and reduced
  motion.
- The mobile Web Studio must have a named navigation replacement for the
  current desktop-only rail.
- Sticky chrome cannot obscure the focused finding or field.
- The summary is a semantic list with real headings and buttons.
- Focus moves only after an intentional action and returns predictably.
- Background checking uses quiet status semantics and never interrupts typing.
- Drag is never the only composition or reordering method.
- Color, icon, tooltip, hover, and desktop Inspector are never the only carriers
  of essential information.

## Usability proof before activation

Representative ministry staff, including disabled authors and low-confidence
occasional editors, must complete without coaching:

1. add an informative hero image and write or accept/edit its description;
2. mark a decorative image;
3. retain an intentional link phrase without believing publication is blocked;
4. find and repair one item from Accessibility help;
5. Preview and Publish with only suggestions remaining;
6. explain the difference between an unfinished component and an optional
   suggestion;
7. review a second locale without assuming the source-language result carries;
8. navigate from a reused-content finding to its real owner;
9. understand that a package defect belongs to Asym; and
10. complete the same journeys without pointer input and at narrow/high-zoom
    layouts.

Launch targets:

- at least 90% identify the owner and next action within 30 seconds;
- at least 90% complete the first repair without help;
- zero participants interpret a suggestion as a publication blocker;
- zero participants interpret an empty result as a conformance guarantee; and
- the median healthy Page produces no accessibility interruption.

## Product metrics without surveillance

Monitor only safe aggregates needed to improve the product:

- time from suggestion to source location;
- successful repair and `Keep as written` rates by rule family;
- repeated-reopen and false-positive reports;
- checker latency and unavailable rate;
- technical-issue ownership and time to recovery; and
- moderated task completion and comprehension.

Do not create Tenant rankings, staff performance reports, compliance
leaderboards, content logs, or risk scores.
