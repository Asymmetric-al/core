# Phase 23 D25 whole-Site candidate Preview UX benchmark

**Status:** Supporting evidence for founder-ratified Phase 23 D25 C-prime-R.
This document does not independently expand D25, authorize implementation, or
create a second publication authority.

**Date:** 2026-08-23

## Executive conclusion

A whole-Site Preview is justified for coordinated nonprofit-ministry changes,
but only if staff experience it as **one private, prepared Site preview**, not as
a mutable staging website, another editing branch, or a second live Site.

C-prime must add that deliberate Site-wide cadence without replacing the
acknowledged Page-local Preview and pinned exact-review cadence already included
by B-prime. Rebuilding an entire Site after every routine Page save would make
the common task slower, costlier, and harder to understand.

The durable UX is:

1. **Prepare site preview** is one deliberate Site-wide action. It first obtains
   the current D12 server acknowledgement, then asks D1 to prepare one immutable,
   all-or-none Preview Candidate for one exact Tenant, environment, Site, locale,
   Site Plan, source-revision closure, presentation package, compiler, and
   safety posture.
2. The candidate opens at the Page the staff member was editing, but internal
   navigation stays inside that same candidate. Later saves never alter it.
3. Persistent, quiet chrome says **Private preview · not live**, names the Site
   and locale, and says when the candidate was prepared. Technical receipts are
   available in **Preview details**, not spread across the primary toolbar.
4. If newer saved changes exist, staff see **Newer saved changes available** and
   deliberately choose **Prepare updated preview**. That creates a successor;
   it never mutates or silently replaces the candidate being reviewed.
5. A candidate becomes **Ready** only when its required Site closure is ready.
   A failed build never exposes a partial Site, falls through to live content,
   or silently substitutes an older candidate.
6. The last still-authorized Ready candidate remains explicitly available when
   an update fails. It is labelled with its preparation time and must be chosen
   intentionally.
7. Internal links work. Giving, forms, authentication, downloads,
   notifications, analytics, third-party embeds, external navigation, and other
   consequential effects are representative but inert.
8. Whole-Site Preview is available only to a principal authorized for the
   complete exact candidate closure. Page-scoped contributors keep Page-scoped
   Preview; D25 never expands their access so the navigation appears complete.
9. Full-screen Preview is the primary narrow-screen, high-zoom, keyboard, and
   screen-reader path. A wide-screen embedded presentation and a user-initiated
   new tab may present the same candidate, but neither creates different truth.
10. Preview never contains **Publish** or **Release**. Staff return to the D1
    release checklist, where current authority and current adverse conditions
    are checked again.

This is a restrained form of C-prime. It provides the journey-testing value of
modern release and staging previews without importing arbitrary environment
branches, public share links, per-keystroke form transport, visual overlays,
comments, presence, or direct preview-to-production promotion.

## Research method and authority

This benchmark compared:

- the Phase 23 D1, D9, D12, D13, D22, D23, and D24 contracts;
- Core's current Web Studio action framing, save-state language, shared Base UI
  and accessibility rules;
- current first-party Payload, Sanity, Contentful, Storyblok, Webflow, Vercel,
  WordPress, and W3C documentation; and
- realistic workflows for small nonprofit missions ministries where a staff
  member may edit only occasionally, may serve more than one Site or locale,
  and must never confuse a private preview with the live giving experience.

Comparable products are evidence for interaction patterns, not authority for
Asym's security or publication model. Their sharing, perspective, staging,
release, and promotion semantics are not copied automatically.

No runtime UI, schema, migration, test, issue, decision log, ADR, or Git state
was changed for this research.

## What current products prove

### Payload: useful Page-preview mechanics, not a whole-Site candidate model

[Payload Live Preview](https://payloadcms.com/docs/live-preview) supports an
embedded front end, dynamic multi-tenant/localized URLs, named widths, a
responsive mode, and a separately resizable window. Its client mode sends form
state on document change. By contrast,
[Payload server-side Live Preview](https://payloadcms.com/docs/live-preview/server)
refreshes the route after a draft save, autosave, or publish.

That validates two narrow UX choices:

- responsive/full-window presentations should be available without pretending
  to emulate physical devices; and
- an acknowledged-save refresh is a supported modern pattern.

Payload does not supply an immutable release-wide Site closure, exact
cross-Page candidate identity, D1 activation boundary, complete-closure
authorization, or Asym's side-effect-dark rendering contract. D25 should use
Payload as an editor entry point and optional frame lifecycle adapter, not as
the candidate or publication authority. Raw per-keystroke form-state preview is
also inconsistent with D12's recoverable saved-revision truth.

### Sanity: make the selected future perspective continuously visible

Sanity's current
[Content Releases guide](https://www.sanity.io/docs/user-guides/content-releases)
lets an editor pin only one release at a time and makes that pinned release
visible throughout Studio. It describes a release version as disconnected from
later draft or published changes—a snapshot with its own future—and lets staff
preview the pinned release in Presentation. Its
[Presentation user guide](https://www.sanity.io/docs/user-guides/preview-and-page-building)
keeps the selected draft/release/published perspective in a global picker,
supports front-end navigation and a route field restricted to allowed origins,
offers named viewport changes, and separates edit-overlay mode from navigation
mode. Sanity's
[Perspectives documentation](https://www.sanity.io/docs/content-lake/presenting-and-previewing-content)
also shows why a whole experience needs a coherent query perspective across
interconnected documents rather than isolated latest-draft reads.

The strong pattern is persistent perspective identity. The weak fit for Asym is
arbitrary release layering and hiding: it gives expert users flexibility, but
would make an occasional ministry staff member answer which of several future
layers is present. D25 should expose exactly one immutable candidate at a time,
with no end-user perspective stack.

Sanity also documents that a shared draft preview can expose other draft
content in the same perspective. That is direct evidence against casual D25
share links. Whole-Site access must be deliberate complete-closure authority,
not a bearer URL or a Page permission stretched across navigation.

### Contentful: select one release, show what it contains, preserve Current

Contentful's
[Timeline release preview guide](https://www.contentful.com/help/timeline/preview-a-release/)
has staff select a scheduled, unscheduled, or ideation release, inspect its
included entries, and choose **Preview**. It provides an explicit **Current**
choice to return to live content and explains that earlier scheduled releases
may be layered into a later preview. Its
[Timeline best-practices guide](https://www.contentful.com/help/timeline/timeline-best-practices/)
recommends versioning Pages/sections while reusing stable components to avoid
content sprawl and simplify preview and rollback. Contentful's ordinary
[Live Preview documentation](https://www.contentful.com/developers/docs/tutorials/preview/live-preview/)
keeps side-by-side preview separate from SDK-dependent live updates and
inspector overlays.

The useful D25 patterns are:

- one clearly selected release/candidate;
- an inspectable inclusion summary before or during preview;
- explicit separation between candidate and Current/live; and
- reuse rather than copying an entire content database for every preview.

Asym should not copy Contentful's temporal layering into D25. D1 already owns
the exact Site Plan closure. Staff should see what that one candidate includes,
not calculate interactions among timelines.

### Storyblok: embedded and standalone are presentations of the same target

Storyblok's
[Visual Editor guide](https://www.storyblok.com/docs/manuals/visual-editor)
offers draft preview, named screen sizes, and a standalone preview. Its
[release-preview guide](https://www.storyblok.com/faq/view-release-preview-environment)
threads a release identifier through the preview request. However, Storyblok's
[Releases documentation](https://www.storyblok.com/apps/releases_only) warns
that release access remains broad unless it is explicitly restricted, and that
an unselected release access token can leave access public.

This supports one candidate across embedded, full-screen, and new-tab
presentations. It also demonstrates why D25 must be private and deny by default:
preview availability is not the same as candidate authorization.

### Webflow: whole-Site context is valuable, but staging is easy to mistake for release

Webflow's updated
[publishing workflow](https://help.webflow.com/hc/en-us/articles/46651740529811-Publishing-workflow)
uses visible Designer, Staging, and Production stages, summarizes tracked
changes and authors, and lets staff inspect the staged Site before publishing
to production. Its
[page-branch staging guide](https://help.webflow.com/hc/en-us/articles/46651751861139-Page-branching)
explicitly describes a staged branch URL as a full-Site snapshot so reviewers
can see how one Page's change affects the rest of the Site. Webflow's
[private-staging guide](https://help.webflow.com/hc/en-us/articles/46651762935443-Enable-private-staging-on-your-site)
requires Workspace authentication for staging Sites when enabled.

This is the clearest first-party evidence for the practical value of C-prime:
Navigation, shared styles, shared components, routes, and a changed Page need to
be reviewed together. It also exposes the principal footgun. A permanent
staging destination plus **Publish to production** makes staging behave like a
second serving head and release source.

Asym should retain the full-Site snapshot and authentication patterns, but not
the staging destination or direct promotion model. A Preview Candidate expires,
is immutable, and returns staff to D1 for a fresh release decision.

### Vercel: immutable artifact identity and readiness are useful; promotion is not the model

Vercel documents a unique URL for every successful
[deployment](https://vercel.com/docs/deployments/overview), explicit
[Deployment Protection](https://vercel.com/docs/deployment-protection), and a
workflow that finds a **READY** deployment, inspects its identity and logs,
tests it, then separately
[promotes it](https://vercel.com/docs/deployments/promote-preview-to-production).
It also documents that promoting a Preview deployment can rebuild with
production environment values.

The useful pattern is an immutable, named, inspectable candidate with explicit
Ready/failed state. The direct-promotion pattern is wrong for D25: a content
Preview Candidate neither owns the public alias nor proves current release
safety. D1 must revalidate and activate independently; reuse of qualified
content-addressed artifacts is an implementation optimization, not UX or
authority.

### WordPress: show the blast radius of global changes before committing

The current
[WordPress Site Editor guide](https://wordpress.org/documentation/article/site-editor/)
shows a save review listing changed Navigation, templates, template parts, and
other global elements, and warns that shared header/footer changes affect every
Page using them. This is a useful occasional-editor pattern: staff do not need a
dependency graph, but they do need a plain-language summary of Site-wide impact.

For D25, **Preview details** should summarize included changes by ordinary
family—Pages, Navigation, reusable sections, Site settings, locale, and
presentation package—without exposing database records or requiring staff to
curate the closure manually.

## Product vocabulary

Use technical precision internally and ordinary language in the staff UI.

| Domain term               | Staff-facing copy                         | Do not say by default                             |
| ------------------------- | ----------------------------------------- | ------------------------------------------------- |
| Preview Candidate         | **Site preview**                          | Branch, environment, deployment, staging database |
| Candidate lifecycle       | **Preparing / Ready / Failed / Expired**  | Building graph, materializing closure             |
| Candidate privacy         | **Private preview · not live**            | Authenticated (mechanism, not meaning)            |
| Candidate identity        | **Prepared from saved changes at [time]** | Mutable latest, head, SHA, generation in main UI  |
| New exact source receipt  | **Newer saved changes available**         | Out of sync, dirty candidate                      |
| Successor command         | **Prepare updated preview**               | Refresh, sync, redeploy                           |
| Public serving generation | **Live site**                             | Current preview                                   |
| Exact locale lineage      | **Spanish (Latin America)**               | Locale key alone, fallback locale                 |
| Closure summary           | **What's included**                       | Dependency graph, projection manifest             |
| Diagnostic identifiers    | **Preview details**                       | Always-visible tenant/version/package identifiers |

Reserve **live** for the public Site. A whole-Site candidate should not be
called **Live Preview**: the candidate is deliberately pinned, while a live
label implies that later edits flow into it.

## Two cadences, one Preview product

Use one compiler, public-safe view model, privacy contract, responsive-control
set, and status vocabulary, but keep two truthfully labelled tasks:

1. **Preview page** belongs in the Page editor. Its optional embedded and
   full-Page presentations advance only after a D12 acknowledgement. It is the
   fast routine cadence and does not prepare a whole-Site candidate.
2. **Prepare site preview** belongs in the Site Plan/release workspace and may
   be offered as a secondary action from Page Preview. It explicitly prepares
   the immutable all-or-none candidate for coordinated Page, Navigation,
   reusable-section, route, locale, and presentation-package review.

**Open exact preview** remains the pinned Page/review/schedule presentation from
B-prime. When the workflow is Site-wide, the pinned exact target may be a whole-
Site candidate; that does not eliminate Page-scoped review.

Do not use one generic, context-sensitive **Preview** button whose behavior
silently changes between a Page refresh and a whole-Site build. The two explicit
labels reduce guesswork, while shared implementation prevents a second renderer.
Routine acknowledged Page saves refresh only Page Preview. A whole-Site
candidate is prepared, deduplicated, or replaced by a successor only after an
explicit Site-wide request.

## Recommended staff journey

### 1. Start from familiar work

Maya is updating Hope Global Missions' Spanish year-end Page. She uses **Preview
page** for routine acknowledged-save feedback. When the coordinated change also
touches Navigation, a shared giving explanation, and the Spanish presentation
package, she chooses **Prepare site preview** from the Site Plan/release
workspace or the Page Preview's secondary actions. D25 adds no separate
environment manager.

The secondary public action remains **View live site** and is visually separated.
Staff choose between two plainly different tasks—fast Page feedback and
deliberate Site-wide review—not among provider terms such as **Preview draft**,
**Stage**, **Environment**, and **Deployment**.

If local work is unsaved, **Prepare site preview** uses the normal D12 save path:

- while a save is in flight: **Saving changes before preview…**;
- after acknowledgement: begin preparation against that exact receipt;
- on validation/conflict/outcome-unknown: do not prepare, preserve the editor,
  and show the cause-owned recovery next to the affected work.

The button does not invent a special preview save and does not create a version
per click.

### 2. Open a useful shell immediately

After acknowledgement, Web Studio opens a full-screen **Site preview** workspace
at the current Page route. It does not wait behind a modal or open an automatic
popup. The workspace shows an honest indeterminate state:

> **Preparing site preview**  
> Checking the saved Pages, Navigation, shared sections, media, locale, and
> presentation package. You can return to editing; this preview will stay
> pinned to the saved changes it started with.

Show actual stages only when the backend emits authoritative stages; never
animate a fake percentage. Completion is a polite status announcement and does
not steal focus. The browser Back action and **Back to editor** return to Maya's
same Site, Page, and locale.

If an already-Ready candidate has the same exact qualified input identity,
opening it immediately is safe deduplication, not a mutable cache hit.

### 3. Orient before browsing

Ready Preview uses one persistent top bar, followed by the candidate content:

- **Site preview**;
- **Private preview · not live** as text plus a quiet badge;
- `Hope Global Missions · hopeglobal.org · Spanish (Latin America)`;
- `Prepared from saved changes Aug 23, 2026 at 2:14 PM`;
- current candidate Page title and path;
- **Go to page**, **Responsive**, **Preview details**, **Open in new tab**, and
  **Back to editor**;
- a separate, secondary **View live site** link.

Do not place Publish, Schedule, Approve, or Release in this bar. If Maya entered
from a release checklist, **Back to release checklist** replaces the generic
return target.

**Preview details** discloses, on demand:

- Pages changed and total routes represented;
- Navigation/reusable-section/Site-setting changes;
- exact locale and an explicit statement that there is no field fallback;
- presentation package name/version in ordinary support language;
- preparation time, expiry time, creator, and opaque preview reference; and
- warnings or intentionally dynamic public-safe sources.

The summary describes impact; staff do not hand-select dependencies or debug a
graph.

### 4. Navigate the exact candidate

Ordinary Site Navigation and internal links stay within the same candidate,
Site, and locale. Browser Back/Forward preserves candidate identity. A compact
**Go to page** chooser searches only the candidate's authorized route index, so
staff can reach an unlinked draft Page without typing an arbitrary origin.

If a route is not in the candidate, show:

> **Page isn't in this preview**  
> This path was not part of the saved Site preview. Go back or choose another
> Page.

Never fall through to the live route. Never merge a newer draft into the
candidate to make the link work.

If locale switching is offered, selecting another locale prepares or opens a
separate exact candidate for that locale. It does not mutate the current
candidate or fill missing fields from another language. The persistent toolbar
must update before the other candidate content is shown.

### 5. Test layout without a device theatre

Default to **Responsive**, which uses the available preview width. Offer the
same small code-owned widths used by the broader Web Studio contract, with text
labels such as **Narrow · 375 px**, **Medium · 768 px**, and **Wide · 1280 px**.
They test CSS layout, not browser chrome, network, input method, pixel density,
safe areas, or assistive technology.

On small screens or at high zoom, the preview is full-screen and the toolbar
collapses into labelled controls. Do not preserve a two-column editor/frame at
the expense of 320-CSS-pixel reflow. **Open in new tab** is always initiated by
the user and its accessible description says it opens a new tab.

### 6. Keep action-bearing surfaces honest and dark

Candidate browsing supports only effects needed to evaluate presentation:

- internal routes and in-Page anchors work within the candidate;
- menus, accordions, carousels, tabs, and local validation may demonstrate
  their local interaction;
- giving and checkout controls explain **Giving is disabled in preview. No
  donation will be started.**;
- form submission explains **Submission is disabled in preview. No information
  was sent.**;
- external, `mailto:`, `tel:`, download, login, and account actions explain
  **This action is disabled in preview.**;
- third-party embeds render an approved inert placeholder; and
- analytics, pixels, prefetch, webhooks, notifications, search indexing, and
  social crawlers do not run.

The explanation appears on activation and is programmatically announced. Color,
disabled cursor styling, or a tooltip is not the only explanation. Candidate
code must not make the real request and then hide its result.

### 7. Handle newer saves without changing review truth

If any selected source advances after preparation, keep the candidate intact
and add one quiet banner below the persistent toolbar:

> **Newer saved changes available**  
> This preview still shows the version prepared at 2:14 PM.  
> **Prepare updated preview**

The action creates a successor and keeps the old candidate available until the
new one is Ready. No automatic refresh, moving `latest` pointer, or per-viewer
copy is allowed. If there are unsaved browser changes, say **Save your changes
to include them**; never imply they are already represented.

### 8. Recover without favorable substitution

If preparation fails:

> **Site preview couldn't be prepared**  
> Your saved changes are safe. Fix the listed Page or try again. Nothing was
> published.

Show the staff-owned cause and next action first. Put request references and
compiler/package details under **Technical details**. If a previous Ready,
unexpired, still-authorized candidate exists, offer:

> **Open previous preview · prepared 1:42 PM**

Choosing it is explicit. Do not automatically display it under the new
candidate's title, and do not substitute the live Site. A failed Page,
Navigation, required asset, route, locale, or presentation dependency keeps the
new candidate non-Ready; there is no partial-success candidate that appears
complete.

If one route fails only after a Ready candidate is opened, keep the candidate
identity visible and show **This Page couldn't be displayed in this preview**,
with **Go to page**, **Try again**, and a report reference. Other candidate
routes may remain available; the failed route never falls through to live.

### 9. Expire or revoke access safely

Ordinary candidates use one code-owned retention period, shown as **Available
until [date/time]**. A review, approval, or schedule workflow may retain its
exact candidate only through that workflow's existing ownership; tenants do not
configure arbitrary lifetimes in D25.

An expired candidate says:

> **This site preview has expired**  
> Prepare a new preview from the current saved changes.

An authorization or safety change clears candidate content on the next request
and says only:

> **Preview access changed**  
> Return to Web Studio to continue.

Neither case offers a public, previous, or cross-Site fallback. Already rendered
pixels cannot be recalled, so responses remain private/no-store and each
navigation/media/data continuation reauthorizes.

## State and copy contract

| State                         | Persistent staff copy                           | Primary action               | Accessibility behavior                                     |
| ----------------------------- | ----------------------------------------------- | ---------------------------- | ---------------------------------------------------------- |
| Current work not acknowledged | Saving changes before preview…                  | Wait / return to field error | Polite status; no focus move                               |
| Preparing                     | Preparing site preview                          | Back to editor               | `aria-busy`; polite stage updates; no fake percent         |
| Ready                         | Private preview · not live                      | Browse                       | Page title and main heading include Site/locale context    |
| Newer acknowledged input      | Newer saved changes available                   | Prepare updated preview      | Polite status once; banner remains discoverable            |
| Unsaved input after Ready     | Save your changes to include them               | Save                         | Links to editor state; never calls candidate current       |
| Failed                        | Site preview couldn't be prepared               | Fix issue / Try again        | Text error summary; focus moves only after explicit action |
| Previous candidate available  | Previous preview · prepared [time]              | Open previous preview        | Explicit selection; never silent                           |
| Candidate route missing       | Page isn't in this preview                      | Go to page / Back            | Candidate identity and navigation remain                   |
| Candidate route failed        | This Page couldn't be displayed in this preview | Try again / Go to page       | Error landmark/heading; no live fallback                   |
| Consequential control         | This action is disabled in preview              | Dismiss                      | Status/dialog is named, keyboard-operable, focus-restoring |
| Expired                       | This site preview has expired                   | Prepare new preview          | No stale content remains                                   |
| Access/safety revoked         | Preview access changed                          | Return to Web Studio         | Clear content; generic message prevents inference          |

Do not use toast-only state. Toasts may reinforce completion, but durable state
belongs beside the candidate it describes.

## Accessibility contract

Whole-Site Preview has two interacting documents when embedded and still needs
one coherent journey.

- Use native landmarks and headings for the Preview toolbar/status region and
  the candidate Site. Provide **Skip preview controls** and **Return to preview
  controls** paths without assigning `role="application"`.
- Keep DOM, reading, visual, and keyboard order coherent: toolbar controls,
  candidate context/status, then candidate content. W3C's
  [Focus Order guidance](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)
  specifically warns that unexpected focus movement breaks the user's mental
  model.
- When an iframe is used, give it a precise title such as `Hope Global Missions
site preview — Spanish (Latin America)`. W3C
  [H64](https://www.w3.org/WAI/WCAG22/Techniques/html/H64) distinguishes that
  frame label from the inner document title; both are required for orientation.
- Use visible text labels for viewport, return, candidate update, and Page
  selection controls. Icon-only controls and hover-only explanations are not
  acceptable.
- Announce preparation, newer-change, and action-disabled status without moving
  focus. WCAG 2.2
  [4.1.3](https://www.w3.org/TR/WCAG22/#status-messages) requires status
  messages to be programmatically determinable without receiving focus.
- Errors are persistent text, identify the affected Page/dependency when the
  viewer may know it, and give a cause-owned recovery. Generic toasts and color
  alone are insufficient.
- Preserve visible focus and Core touch-target tokens. WCAG 2.2
  [2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
  establishes a 24-by-24-CSS-pixel minimum or sufficient spacing; Core's shared
  controls should remain comfortably larger.
- At 400 percent zoom and a 320-CSS-pixel viewport, collapse the toolbar and use
  the full-screen presentation rather than forcing horizontal scrolling across
  editor and preview. This follows WCAG 2.2
  [Reflow](https://www.w3.org/TR/WCAG22/#reflow).
- On opening a dialog, move focus to its meaningful first control, contain focus
  while modal, close with Escape, and restore focus to the invoker. Background
  completion never opens a dialog or steals focus.
- Respect reduced motion in both Preview chrome and the certified D9 package.
  Preview must not override the visitor-facing accessibility posture to show
  animations.
- Exercise RTL, long translated labels, CJK wrapping, screen-reader route
  announcements, browser Back/Forward, forced colors, touch, slow networks, and
  session expiry. Automated axe checks supplement, not replace, these manual
  journeys.

The relevant Core rules already require shared `@asym/ui` Base UI primitives,
native semantics, Maia/Zinc tokens, visible focus, touch-target tokens,
programmatic status, 320-CSS-pixel reflow, reduced motion, role-based Playwright
locators, and manual keyboard/focus verification. D25 should extend those
patterns rather than create preview-only primitives.

## Concrete nonprofit-ministry scenario

Maya manages Hope Global Missions' English and Spanish Sites. For a year-end
campaign, she changes the Spanish home Page, adds a new missionary story,
updates Navigation, replaces a reusable giving explanation, and uses a newly
certified presentation package.

She first uses **Preview page** while editing the home Page. When the coordinated
changes are ready for journey review, she chooses **Prepare site preview**. Web
Studio saves the Page, then prepares one Spanish candidate using the exact D1
Site Plan. The Preview
opens on the home Page and says **Private preview · not live**, names the Site
and Spanish locale, and shows **Prepared from saved changes at 2:14 PM**. Under
**What's included**, Maya sees four Page changes, one Navigation change, one
shared-section change, and the package version—no dependency graph.

She navigates from Home to Missionaries to the new story, uses Browser Back,
checks Narrow and Wide layouts, and activates Give. Preview explains that no
donation will start. While she is reviewing, her teammate corrects a saved
Navigation label. Maya's current journey does not drift. A banner offers
**Prepare updated preview**.

The successor fails because the corrected Navigation points to a missing
Spanish Page. Maya sees the Page/path and **Fix Navigation**; her saved changes
are safe and nothing was published. She may explicitly reopen the 2:14 PM
candidate to finish comparing layout. After the missing Page is fixed, a new
candidate becomes Ready.

Maya returns to the release checklist. D1 rechecks current authority, current
safety, and the exact release request. The candidate does not contain a Publish
button and never became a public serving head.

## UX adversarial pressure test

| Concern                  | What could go wrong for staff                                                                 | Permanent UX prevention                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Mutable preview          | Two reviewers use the same URL but see different later saves.                                 | Immutable candidate; visible prepared time; successor-only update.                                       |
| Live/preview confusion   | Staff believe private changes are public or try to publish from Preview.                      | Persistent **Private preview · not live**; separate **View live site**; no Publish in Preview.           |
| Scope ambiguity          | A multi-Site editor reviews the wrong Site or locale.                                         | Site, domain, and locale persist in title, toolbar, Page chooser, and exact candidate identity.          |
| Incomplete Site          | Navigation enters live content or an unbuilt Page, making the journey look coherent when not. | All-or-none closure; candidate-only routing; explicit Page-not-in-preview state.                         |
| Unsaved-change ambiguity | Staff expect browser-only changes in a stable review.                                         | D12 acknowledgement before prepare; explicit **Save your changes to include them**.                      |
| New-change drift         | Auto-refresh moves the reviewer mid-journey.                                                  | Quiet newer-changes banner; explicit successor preparation; old candidate remains.                       |
| Build failure masking    | Failed update silently shows old or live Site.                                                | Failed target remains failed; previous candidate is separately named and explicitly opened.              |
| Permission mismatch      | A Page editor infers other Pages through whole-Site navigation.                               | Whole-Site UI only for complete-closure capability; Page-scoped Preview remains separate.                |
| Dangerous action         | A test donation, form, email, download, or webhook creates a real consequence.                | Side-effect-dark capability mode; local-only interactions; clear programmatic explanation on activation. |
| Toolbar overload         | Occasional staff cannot find the Page or understand status.                                   | One action, one persistent context line, one route chooser, one viewport selector, details on demand.    |
| Narrow/zoomed layout     | Split panes and fixed toolbars hide content or require two-axis scrolling.                    | Full-screen first; collapsible labelled controls; 320-CSS-pixel reflow tests.                            |
| Stale/expired tab        | An old tab looks Ready indefinitely.                                                          | Visible preparation/expiry time; reauthorization; expired state; no stale-content fallback.              |
| Popup/frame failure      | Preview is blank because cookies, framing, or popup policy changed.                           | Same candidate has top-level first-class path; user-initiated new tab; cause-specific frame fallback.    |
| Technical-error overload | Staff see compiler ids but not what to fix.                                                   | Staff-owned cause and next action first; diagnostics under Technical details.                            |
| Accessibility loss       | Keyboard or screen-reader users cannot leave the frame or discover asynchronous state.        | Logical focus path, titled frame, skip/return controls, status semantics, manual AT testing.             |

## What D25 should deliberately not build

- no mutable staging Site or permanent staging domain;
- no candidate database copied per Site or viewer;
- no arbitrary branches, environments, release stacks, or staff-composed
  dependency manifests;
- no bearer, password, QR, public, or anonymous preview links;
- no direct candidate-to-production promotion or public-domain aliasing;
- no automatic advance to newer saved changes;
- no per-keystroke whole-Site rebuild or raw Payload form-state transport;
- no click-to-edit overlays, visual source maps, comments, tasks, presence, or
  collaborative cursor system;
- no tenant-configurable candidate lifetimes, breakpoint catalogs, or state
  vocabulary;
- no physical-device, browser, bandwidth, or assistive-technology emulation;
- no duplicate generic admin renderer; and
- no action-capable giving, form, embed, tracking, notification, or third-party
  runtime.

These exclusions are not missing polish. They keep the product understandable
and prevent C-prime from turning into a second CMS, collaboration suite, and
deployment platform.

## Required usability and accessibility proof before shipping

Test the exact workflow, not isolated screenshots:

1. An occasional ministry staff member starts from a changed Page, prepares the
   Site preview, names what is live versus private, and returns to the editor
   without coaching.
2. A reviewer identifies Site, locale, preparation time, included change
   families, and whether newer saved changes exist.
3. The reviewer navigates internal links and Browser Back/Forward without ever
   leaving the candidate or crossing locale/Site.
4. The reviewer activates Give, form submit, external link, and download and
   correctly understands that no consequence occurred.
5. A successor fails; the reviewer distinguishes the failure from the previous
   Ready candidate and live Site, then follows the correct recovery.
6. The same tasks work keyboard-only and with a screen reader at default size,
   200 percent, and 400 percent zoom; focus never becomes trapped in an iframe.
7. At 320 CSS pixels, the toolbar and candidate reflow without loss of function
   or two-dimensional scrolling for ordinary content.
8. RTL, long translated labels, and missing locale content remain explicit and
   never fall back silently.
9. Permission revocation, candidate expiry, session expiry, frame refusal,
   slow preparation, offline transition, and route failure each show the
   correct bounded state and no favorable fallback.
10. Automated accessibility, cross-scope authorization, effect-darkness,
    candidate-route, and stale-successor tests pass; manual focus, reading order,
    announcement quality, and cognitive clarity are recorded separately.

Recommended research participants are small in number but representative:
occasional tenant staff, a frequent communications editor, a Site-wide reviewer,
a Page-scoped missionary/contributor, one keyboard-only user, and one
screen-reader user. Success means they can answer **Which Site and locale am I
seeing? Is this live? Which saved changes are included? What happens if I update
it?** without guessing.

## Hardened UX recommendation for C-prime-R

D25 should define one **immutable Whole-Site Preview Candidate** and one quiet
**Site preview** workspace. It starts at the active Page, carries the exact D1
candidate closure through every internal route, remains private and
side-effect-dark, and is continuously identified by Site, locale, prepared
time, and not-live status. New saves create an explicit successor. Failed,
expired, incomplete, or unauthorized candidates fail closed; a previous Ready
candidate is an explicit, labelled choice only. Preview contains no release
authority.

This Site-wide cadence supplements B-prime's **Preview page** and **Open exact
preview** cadences. It never runs on every routine Page save. All three
presentations share one renderer and safety contract, while only an explicit
**Prepare site preview** request incurs whole-Site candidate work.

That formulation preserves what the strongest current products get right:
whole-experience context, a selected release/perspective, visible inclusion
summary, immutable artifact identity, protected access, responsive/full-screen
presentations, and explicit recovery. It rejects the parts that would create
confusion or technical debt in Asym: mutable staging, broad sharing, arbitrary
perspective stacks, direct promotion, duplicated data, and visual-editing
instrumentation.

## Primary sources

All sources were accessed on 2026-08-23.

- Payload,
  [Live Preview](https://payloadcms.com/docs/live-preview) and
  [server-side Live Preview](https://payloadcms.com/docs/live-preview/server).
- Sanity,
  [Content Releases user guide](https://www.sanity.io/docs/user-guides/content-releases),
  [Preview and page building](https://www.sanity.io/docs/user-guides/preview-and-page-building)
  (updated 2026-08-10), and
  [Presenting and previewing content](https://www.sanity.io/docs/content-lake/presenting-and-previewing-content).
- Contentful,
  [Preview your Timeline releases](https://www.contentful.com/help/timeline/preview-a-release/),
  [Timeline best practices](https://www.contentful.com/help/timeline/timeline-best-practices/),
  and
  [Live Preview](https://www.contentful.com/developers/docs/tutorials/preview/live-preview/).
- Storyblok,
  [Visual Editor](https://www.storyblok.com/docs/manuals/visual-editor),
  [View a release in a preview environment](https://www.storyblok.com/faq/view-release-preview-environment),
  and [Releases](https://www.storyblok.com/apps/releases_only).
- Webflow,
  [Publishing workflow](https://help.webflow.com/hc/en-us/articles/46651740529811-Publishing-workflow)
  (updated 2026-06-02),
  [Page branching](https://help.webflow.com/hc/en-us/articles/46651751861139-Page-branching),
  and
  [Enable private staging](https://help.webflow.com/hc/en-us/articles/46651762935443-Enable-private-staging-on-your-site)
  (updated 2025-11-18).
- Vercel,
  [Deploying to Vercel](https://vercel.com/docs/deployments/overview),
  [Deployment Protection](https://vercel.com/docs/deployment-protection), and
  [Promoting a preview deployment to production](https://vercel.com/docs/deployments/promote-preview-to-production)
  (updated 2026-03-12).
- WordPress,
  [Site Editor](https://wordpress.org/documentation/article/site-editor/)
  (updated 2026-08-19).
- W3C WAI,
  [WCAG 2.2](https://www.w3.org/TR/WCAG22/),
  [Understanding Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html),
  [H64: iframe title](https://www.w3.org/WAI/WCAG22/Techniques/html/H64), and
  [Understanding Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
