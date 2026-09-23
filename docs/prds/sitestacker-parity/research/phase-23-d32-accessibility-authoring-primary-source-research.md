# Phase 23 D32 Accessibility Authoring Primary-Source Research

**Status:** Complete supporting research for the founder-ratified exact Phase
23 D32 C-prime-R decision. This document is evidence that explains the decision
without independently expanding the ratified authority or authorizing
implementation.

**Date:** 2026-08-24

**Ratified:** 2026-08-24

## Research question

What is the smallest modern accessibility-authoring contract that makes Web
Studio easy and delightful for nonprofit ministry staff, preserves a Tenant's
creative and editorial authority, and still holds Asym accountable for the
interfaces and public output that Asym itself generates?

## Executive conclusion

The original universal-gate interpretation of C-prime is too broad. The durable
boundary is:

> **Asym makes accessible behavior the easy and default path, gives authors
> contextual information and repair help, and enforces only the mechanics and
> structured inputs needed for Asym-owned components to produce operable output.
> Tenants retain the final judgment over their message, prose, imagery,
> branding, and other editorial choices.**

This is not a retreat from the WCAG 2.2 AA platform floor already ratified in
D9. It makes the responsibility line precise:

- **Asym-owned mechanics:** Web Studio keyboard and screen-reader operation,
  semantic component output, focus, DOM order, generated identifiers,
  responsive behavior, reduced motion, safe token pairings, compiler behavior,
  and certified Presentation Package code.
- **Tenant-owned meaning:** the site's voice and message, whether an image is
  informative or decorative, the wording of an alternative, the quality of a
  caption, the exact link wording, reading level, and contextual design intent.
- **Shared authoring seam:** Asym presents accessible choices prominently,
  explains likely visitor impact in plain language, locates the affected
  content, and offers a repair without grading or shaming the author.

## Primary standards findings

### W3C ATAG defines the correct responsibility split

The [ATAG overview](https://www.w3.org/WAI/standards-guidelines/atag/) applies
directly to CMSs and website builders. Part A covers the accessibility of the
authoring tool itself; Part B covers helping authors produce accessible content.

[ATAG 2.0](https://www.w3.org/WAI/AU/ATAG20/) is unusually clear about the
boundary that matters for D32:

- the tool is responsible for accessible content that it automatically
  generates after authoring;
- the tool is not responsible for accessibility changes caused by an author's
  own content choices;
- accessibility help should be integrated into the same look and feel as the
  normal authoring experience, reducing confusion;
- where a tool permits a potentially inaccessible choice, it should provide a
  check, help the author decide, identify the affected content, and offer repair
  assistance;
- accessible choices should be at least as prominent as inaccessible choices;
- support features should be active by default and reasonably prominent; and
- generated text alternatives must never silently use filenames or generic
  strings, and authors must be able to accept, modify, or reject a proposed
  repair.

ATAG defines a prompt broadly: it may be a quiet underline or local request, not
an interrupting modal. It does not require every finding to block publication.

### Automated results cannot establish conformance

W3C's [guidance for selecting evaluation
tools](https://www.w3.org/WAI/test-evaluate/tools/selecting/) states that tools
cannot test every accessibility aspect, human judgment is required, inaccurate
results are possible, and tools assist rather than determine accessibility.

Therefore D32 must prohibit:

- an accessibility score, percentage, grade, or green compliance gauge;
- a claim that no detected findings means an accessible or compliant site;
- an automated release blocker for subjective quality; and
- AI or a scanner silently certifying author intent.

### WCAG remains the output target, not staff-facing jargon

[WCAG 2.2](https://www.w3.org/TR/WCAG22/) remains the platform target. Its
criteria guide component, compiler, package, test, and suggestion design, but
ordinary staff copy should describe the visitor consequence and next action
instead of showing criterion numbers.

The Web Studio itself must preserve keyboard access, visible focus, non-drag
alternatives, clear errors, semantic relationships, status announcements,
touch, zoom/reflow, and reduced motion. These are product requirements, not
editorial suggestions.

## Payload 4 fit and limits

Payload's current [Fields
documentation](https://payloadcms.com/docs/fields/overview) provides required
fields, lightweight client/server validation, custom descriptions, conditional
UI, and replaceable field components. It warns that validation runs on every
change in the Admin Panel and expensive validation should be deferred to a
submission event.

Payload's [React Hooks](https://payloadcms.com/docs/admin/react-hooks) expose
field and document-form state for contextual UI. These are suitable for local
assistance and returning focus to an affected field.

They are not a complete Site-candidate authority. Current Core wraps Payload's
native document form at
`apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView.tsx`.
D32 should add contextual presentation around that native form rather than
create parallel form state, a second editor, or a TanStack Form migration.

The repository pins an internal Payload 4 build. Public documentation is
design evidence; exact hooks, error paths, localization, focus behavior, and
upgrade behavior require adapter tests against the pinned build before
implementation ships.

## Comparable CMS evidence

### Webflow

The [Webflow Audit
panel](https://help.webflow.com/hc/en-us/articles/33961313088531-Intro-to-the-Audit-panel)
demonstrates useful patterns:

- a small set of high-impact checks rather than a sprawling policy engine;
- direct targeting of the affected element;
- an informative-versus-decorative image choice;
- contextual repair guidance; and
- the ability to ignore a finding.

It also demonstrates two hazards D32 must avoid. Its audit misses some
CMS-bound and component content, and permanent ignore can conceal a later
change. Asym therefore needs an exact-candidate server check and an affected-
content fingerprint rather than a universal `Ignore forever` switch.

### Sanity

[Sanity validation](https://www.sanity.io/docs/studio/validation) separates
blocking errors from non-blocking warnings and notes that field-level messages
better explain where and why a value needs attention. Sanity also documents
that Studio validation is client-only and API mutations bypass it.

D32 should keep the useful error-versus-suggestion distinction, but D1 must
derive the exact candidate result server-side rather than trusting UI state.

### WordPress

The current [WordPress Image block
documentation](https://wordpress.org/documentation/article/image-block/)
places alternative-text editing next to the image and expressly allows an
empty alternative when the image is decorative. It also provides visible Move
controls in addition to drag.

D32 should likewise ask about image purpose at the placement, expose an
ordinary description field only when useful, and make every composition action
available without drag.

## Current Core findings

1. `NativeCollectionEditView.tsx` keeps Payload's `DefaultEditView` as the
   document form authority and places Preview, Save, Publish, and workspace
   framing around it. This is the correct integration seam.
2. The existing document-state strip is already dense. A permanent fifth
   accessibility card would add noise.
3. The current Inspector is desktop-only. Essential author guidance cannot
   live there.
4. `StudioNavRail` is hidden below the `md` breakpoint and no equivalent Web
   Studio mobile navigation was found. A complete narrow-screen navigation
   path is a D32 activation requirement.
5. `StudioTopBar` is sticky. Focus-not-obscured behavior needs explicit high-
   zoom and narrow-screen proof.
6. The CMS shell test checks visibility and headings, not keyboard order,
   focus, reflow, screen-reader feedback, or suggestion repair.
7. The general axe suite does not currently cover Web Studio. Axe would still
   be insufficient without the repository's required manual pass.
8. The admin media preview may fall back to a document heading for its preview
   image alternative. That convenience cannot be treated as proof of a public
   placement's contextual alternative.

## Architectural conclusion

D32 needs one small, code-owned diagnostic vocabulary shared by:

- contextual Payload field and block UI;
- a quiet Page-level summary;
- D1 exact-candidate validation; and
- package/compiler qualification evidence.

It does not need a generic rules engine, tenant policy DSL, third-party scanner,
new workflow database, approval queue, central compliance dashboard, or
provider dependency.

The vocabulary must distinguish:

1. **Technical issue** — Asym or the package owner must repair generated code or
   behavior; staff are not blamed.
2. **Details to finish** — a structured component lacks the minimum explicit
   input needed to emit an operable result under an already-ratified domain
   contract.
3. **Suggestion** — quality or context requires human judgment; the Tenant may
   change it or keep it as written, and publication remains available.

## Evidence-led recommendation

Adopt an amended C-prime-R with:

- accessible-by-construction Web Studio, standard components, and certified
  packages;
- contextual author choices with plain language and no WCAG jargon;
- non-blocking editorial suggestions and revision-scoped `Keep as written`;
- no score, grade, compliance claim, warning wall, notification stream, or
  mandatory accessibility approval;
- draft, autosave, recovery, and Preview always available;
- only existing structured-input and platform-integrity gates on the exact D1
  successor candidate;
- current public generation preserved on candidate failure;
- suggestion failures never routed into D31; only verified platform
  regressions use D31 recovery; and
- exact-Payload, browser, accessibility, locale, scale, and representative
  nonprofit-staff proof before activation.
