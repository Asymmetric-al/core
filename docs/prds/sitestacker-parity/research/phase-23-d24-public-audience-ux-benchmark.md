# Phase 23 D24 public-audience UX benchmark

**Status:** Supporting UX evidence for founder-ratified Phase 23 D24 A-prime-R;
not an independent authority expansion.

**Date:** 2026-08-23

## Scope and conclusion

This benchmark pressure-tests the staff and visitor experience for **one exact
public audience with app-owned authenticated surfaces**. It does not decide the
underlying security, cache, release, or authorization architecture; the
[D24 decision brief](./phase-23-d24-public-audience-visibility-and-cache-policy-decision-brief.md)
owns that complete decision.

The UX conclusion is deliberately small:

- Web Studio should not expose an audience selector, conditional-content
  builder, role picker, disabled personalization control, or visitor simulator.
- Staff should see one plain-language fact wherever public consequence matters:
  **Public website — anyone can view after release.**
- Private draft preview must be unmistakably different from the observed live
  Page.
- Donor, missionary, and staff account entry points remain stable, app-owned
  navigation actions. They do not change the CMS-authored Page by cookie,
  session, role, source, campaign, or geography.
- Publishing deserves one concise consequence confirmation because it can make
  ministry content broadly accessible, indexable, and shareable. Routine saves
  and autosaves do not.
- Success, delay, and failure language must distinguish private save, D1 release
  authority, and downstream public convergence instead of collapsing them into
  one optimistic `Published` toast.

This is excellent UX because the interface tells the truth with fewer controls,
not because it exposes the architecture.

## Evidence method

The review used this authority order:

1. ratified Phase 23 decisions and current Core interface rules;
2. current Core Web Studio source as evidence of established vocabulary and
   component seams, not as the final D1 implementation;
3. current first-party specifications and design-system guidance from W3C,
   Payload, GOV.UK, and USWDS; and
4. ministry scenarios involving communications staff, donors, missionaries,
   occasional editors, multilingual Sites, and low-confidence users.

No runtime UI was changed and no claim of accessibility conformance is made by
this document.

## Current Core seams to preserve

### One quiet document workspace already exists

[`NativeCollectionEditView.tsx`](../../../../apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView.tsx)
already provides the useful shell D24 should extend rather than replace:

- one heading followed by compact status badges;
- Preview, Save draft, Publish, and Unpublish in one action area;
- one document-state strip;
- a private authenticated preview distinct from an **Open published page**
  action; and
- a responsive main editor with a secondary inspector.

[`editor-state.ts`](../../../../apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/editor-state.ts)
already distinguishes **Draft saved**, **Private draft**, **Published copy**,
and an authenticated preview. That separation is directionally correct. D24
should improve the user-facing wording and D1 truth rather than add a parallel
status system.

The current action row wraps, and the inspector disappears below the large
breakpoint. Therefore the public-audience fact cannot exist only in the desktop
inspector. It belongs in the always-available release summary and in the
confirmation shown when staff intentionally publish.

### Core already has stable product and route context

[`studio-top-bar.tsx`](../../../../apps/admin/src/cms-ui/web-studio/shell/studio-top-bar.tsx)
uses consistent Mission Control, Web Studio, collection, and document
breadcrumbs. [`config.ts`](../../../../apps/admin/src/cms-ui/web-studio/collections/config.ts)
provides plain collection names such as Pages, Missionary Pages, Project Pages,
and Ministry Updates. D24 should preserve that ordinary language; `audience`,
`segment`, `cache variant`, and `anonymous principal` are implementation terms,
not navigation labels.

### Existing ratified boundaries already simplify the interface

- [D5](../../../adr/0149-bounded-public-navigation-purpose-and-item-grammar.md)
  keeps search, account chrome, breadcrumbs, language switching, and other
  source-owned capabilities outside tenant-authored Public Navigation.
- [D12](../../../adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
  owns recoverable working drafts and active-editor behavior.
- [D13](../../../adr/0157-exact-revision-scheduled-publication-appointments-through-d1.md)
  owns whole-Page publish and unpublish windows, later-edit exclusion, and
  scheduled-publication exceptions.
- [D22](../../../adr/0166-bounded-localized-editorial-profile-over-exact-locale-lineages.md)
  gives every locale an exact lineage and forbids silent field fallback.

D24 needs no second visibility language, schedule UI, draft status, locale
switcher, or account-navigation editor.

## Primary-source UX findings

### Publish, draft, preview, and live are different user concepts

Payload documents distinct **Draft**, **Published**, and **Changed** states and
separate Save draft and Publish actions. Its Preview feature gives editors a
direct front-end view, while Live Preview can reflect edits without saving or
publishing. Those provider features support the interaction, but their native
status is not D1 public authority. The interface therefore needs explicit
product language for what is private, what is previewed, and what visitors can
actually receive.

Sources:

- [Payload Drafts](https://payloadcms.com/docs/versions/drafts)
- [Payload Preview](https://payloadcms.com/docs/admin/preview)
- [Payload Live Preview](https://payloadcms.com/docs/live-preview)

### Confirmation should state consequence and next state

GOV.UK's confirmation guidance says confirmation should reassure users that a
transaction completed and explain what happens next. Its notification-banner
guidance reserves transient success feedback for outcomes inside an ongoing
journey. USWDS says modal dialogs intentionally interrupt work and should be
used sparingly, with clear headings and action-specific button labels.

Applied to Web Studio:

- public release is consequential enough for one compact pre-action
  confirmation;
- successful release should return staff to the document and leave a durable
  publication state plus a direct live-page action;
- a toast alone is not proof or a recoverable record; and
- no generic **Yes / No** or **Continue** buttons should obscure the result.

Sources:

- [GOV.UK confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages/)
- [GOV.UK notification banner](https://design-system.service.gov.uk/components/notification-banner/)
- [USWDS modal](https://designsystem.digital.gov/components/modal/)

### Labels must be visible, descriptive, and consistent

WCAG 2.2 requires visible labels or instructions where input is expected and
requires headings and labels to describe their purpose. Repeated functions
must be identified consistently. Consequently:

- **Publish page**, **Preview draft**, and **View live page** should keep those
  names across ordinary Page families;
- a tooltip or icon-only lock is not a sufficient explanation of public
  visibility;
- **Public website** should be visible text, not merely an accessible name; and
- **Preview** must never sometimes mean the private draft and sometimes mean the
  currently live Page.

Sources:

- [WCAG 2.2 labels or instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions)
- [WCAG 2.2 headings and labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels)
- [WCAG 2.2 consistent identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification)

### Public account actions should be stable and task-named

USWDS recommends short, clear navigation labels and describes account actions
such as sign in as secondary header links. Its sign-in template recommends a
clear, uncluttered flow, task-specific field labels, account recovery, and
consistent use of **sign in** as a verb. This supports stable app-owned links in
the public shell rather than a CMS audience control.

For a ministry with more than one account product, **Donor portal** and
**Missionary portal** are clearer than an ambiguous **Sign in**. Each link may
let the destination app decide whether to authenticate or open the account.
The public Page itself remains unchanged.

Sources:

- [USWDS Header](https://designsystem.digital.gov/components/header/)
- [USWDS Sign-in template](https://designsystem.digital.gov/templates/authentication-pages/sign-in/)

### Status and error feedback cannot depend on color, focus theft, or toast

WCAG 2.2 requires programmatically determinable status messages that assistive
technology can announce without moving focus. Detected input errors must be
identified in text, and known corrections should be suggested. Routine
autosave and convergence updates therefore use a polite status region without
moving focus; blocking validation and authorization failures use a persistent
error summary linked to exact repair locations.

Sources:

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) — Success Criterion 4.1.3 Status
  Messages
- [WCAG 2.2 error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification)
- [WCAG 2.2 error suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html)

### Reflow, focus, targets, and writing direction are release requirements

WCAG 2.2 requires visible keyboard focus and content reflow at 320 CSS pixels
for horizontal writing. Its AA minimum pointer-target criterion is 24 by 24 CSS
pixels; Core's established 44-pixel touch convention is the stronger product
target. W3C internationalization guidance requires `lang` and `dir` to be
declared independently and recommends `dir="auto"` or bidirectional isolation
for inserted text whose direction is not known.

The editor and public shell must therefore be proved with long labels, 400%
zoom, RTL, bidirectional names and paths, and CJK line breaking—not merely
translated English screenshots.

Sources:

- [WCAG 2.2 reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow)
- [WCAG 2.2 focus visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible)
- [WCAG 2.2 target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [W3C structural markup and right-to-left text](https://www.w3.org/International/questions/qa-html-dir)

### Automated checks are necessary but not sufficient

GOV.UK recommends regular automated and manual accessibility testing plus
testing with disabled users and their own assistive technology. Its moderated
usability guidance tests whether likely users understand and complete real
tasks, not whether they prefer a mockup in isolation.

Sources:

- [GOV.UK testing for accessibility](https://www.gov.uk/service-manual/helping-people-to-use-your-service/testing-for-accessibility)
- [GOV.UK moderated usability testing](https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing)
- [GOV.UK research with disabled people](https://www.gov.uk/service-manual/user-research/running-research-sessions-with-people-with-disabilities)

## Recommended staff experience

### 1. Information architecture

Use the existing Web Studio hierarchy and add no Audience destination or
settings page.

| Surface                        | Show                                                                                        | Do not show                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Page list                      | Page title, Site, locale, path, and meaningful Draft/Scheduled/Live/Needs attention state   | A repetitive Public badge on every row, audience filters, role chips, or cache state |
| Document header                | Title, stable path context, saved-draft state, and primary Preview/Save/Publish actions     | A mutable Audience field or disabled future-personalization control                  |
| Page details / release summary | **Visibility: Public website** and **Anyone can view this page after it is released.**      | `audience=public`, `anonymous`, authorization, CDN, or projection vocabulary         |
| Preview                        | Persistent **Preview — not public** context plus the exact Site, locale, path, and revision | Donor/missionary role simulation or a claim that preview is live                     |
| Live action                    | **View live page** only when an observed live representation exists                         | Using **Preview** for the public Page                                                |
| Help                           | One contextual sentence directing private account content to its owning product             | A feature comparison, architectural essay, or dead-end “coming soon” control         |

The audience fact is an informational definition-list row or quiet summary,
not a form field. It appears where the user needs it: Page details, preview
chrome, and release confirmation. It need not consume persistent space in every
list row because all Phase 23 Web Studio ordinary content shares the same
public boundary.

### 2. Exact staff-facing language

Use these terms consistently:

| Intent               | Preferred copy                                                                        | Copy to avoid                                   |
| -------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Audience fact        | **Public website**                                                                    | Audience, anonymous users, segment              |
| Consequence          | **Anyone can view this page after it is released.**                                   | Everyone has access, unrestricted, public cache |
| Private work         | **Draft — only currently authorized collaborators can view it in its owning editor.** | Hidden, unpublished but maybe visible           |
| Draft preview action | **Preview draft**                                                                     | Preview site, Preview as visitor, Impersonate   |
| Preview banner       | **Preview — not public. This is not the live page.**                                  | Authenticated preview, draft mode cookie        |
| Public action        | **View live page**                                                                    | Open preview, Production URL                    |
| Publish action       | **Publish page**                                                                      | Push, deploy, activate generation               |
| Schedule action      | **Schedule publication…**                                                             | Automate, delayed job                           |
| Private-content help | **Donor, missionary, and staff-only content belongs in its secure workspace.**        | Add a visibility condition                      |

“Anyone can view” is literal public reach, not a promise that every person can
find, index, or access the Page under every network condition. The consequence
must also name D2 reach: **Listed publicly** may appear in search and public
discovery; **Shared by link — public** can be viewed and reshared by anyone with
the URL while Asym omits it from public discovery and requests no indexing.
Neither wording promises external crawler convergence, secrecy, or erasure.

### 3. Publish-now confirmation

Publishing is the only ordinary D24 action that needs audience confirmation.
Use Core's established Base UI dialog rather than a custom ARIA implementation.
The dialog remains small enough to avoid scrolling and permits Escape or a
visible cancel action.

Suggested content:

> **Publish this page?**
>
> This will release the **English (United States)** page at
> **hope.example.org/impact** as **Listed publicly**. Anyone can view and share
> it, and it may appear in search results.
>
> Later draft changes will stay private until you publish again.

Actions:

- primary: **Publish page**;
- secondary: **Keep editing**.

The summary must use the exact Site name, locale, resolved public path, and
selected immutable revision. A scheduled release uses D13's schedule dialog
instead of a second D24 dialog. Do not add an attestation checkbox, type-to-
confirm challenge, audience dropdown, or generic **Yes / No** buttons.

For **Shared by link — public**, replace the reach sentence with: **Anyone with
the link can view and reshare it. It will not appear in this site's public
navigation, directory, sitemap, or search, and Asym will request no indexing.**
Do not describe that public URL as private, secret, or unshareable.

After a successful D1 release, close the dialog, return focus to the invoking
control or the durable publication state, and show:

- **Released** when D1 has selected the revision;
- **Updating public site** while downstream convergence is not yet proved; and
- **Live** plus **View live page** only when the public observation supports it.

This preserves D1's truthful separation between release authority and cache,
search, sitemap, social, and crawler convergence. The last meaningful result
stays visible after a toast disappears.

### 4. Preview contract

Preview is an editor tool, not a visitor-audience simulator.

- Every preview carries a visible **Preview — not public** banner and
  exposes that status to assistive technology.
- The banner names Site, locale, and path and says whether it includes unsaved
  local changes, the last server-acknowledged draft, or an exact saved revision.
- Preview uses the same compiled presentation seam intended for public output,
  but private authorization and preview freshness remain explicit.
- Desktop/mobile viewport controls, if offered by Payload, are viewing aids;
  they do not replace real-device reflow testing.
- There is no donor, missionary, staff, campaign, geography, or signed-in
  selector because the CMS-authored public representation has no such variants.
- Links to Donor Portal or Missionary Workspace may appear as stable public
  shell actions. Preview must not imply that opening or authenticating into
  those apps changes the Page being previewed.
- A preview error says what remains safe: **Preview could not load. Your draft
  is safe, and the live page was not changed.**

### 5. Account and sign-in chrome

The public Site shell, not CMS content, owns account entry points.

- Use stable task-specific labels such as **Donor portal** and **Missionary
  portal** when both products exist. Avoid one ambiguous **Sign in** action.
- Keep placement, label, accessible name, and destination stable across public
  Pages and locales. The owning app handles sign-in, account creation,
  recovery, session expiry, and post-authentication routing.
- Prefer the same public link whether or not the browser has an account cookie.
  The destination app can route an authenticated user to their account and an
  unauthenticated user to sign in. This prevents layout shift, shared-cache
  variation, and “why did the website change?” confusion.
- Never inject private names, giving history, balances, assignments, roles, or
  account status into public Page HTML, React payloads, metadata, preloads,
  search, sitemap, social cards, or analytics attributes.
- Do not let Web Studio authors rename account actions into deceptive or
  security-sensitive destinations. Tenant branding may style the shell under
  the ratified presentation contract; app ownership still controls semantics.
- On account-route failure, preserve the public Page and show the owning app's
  clear, recoverable error. Do not turn the public Page into an authentication
  error screen.

### 6. Mobile and accessibility behavior

The minimum proof is behavioral:

- semantic `header`, breadcrumb `nav`, `main`, complementary inspector, and
  correctly ordered headings;
- real buttons for Save, Publish, Schedule, and dialog actions; real links for
  Preview and View live page destinations;
- visible focus that is not obscured by sticky chrome and a DOM order matching
  the visual order;
- Base UI dialog focus containment, initial focus on the least surprising
  action, Escape and visible **Keep editing**, and focus restoration;
- no positive `tabIndex`, drag-only action, hover-only explanation, icon-only
  visibility fact, or color-only status;
- `role="status"` or an equivalent polite live region for autosave and normal
  convergence changes; assertive alert behavior only for material blocking
  failures;
- linked field errors, `aria-invalid`, stable `aria-describedby`, an error
  summary after attempted release, and a direct repair path;
- Core's 44-pixel touch targets, while also satisfying WCAG 2.2's 24-pixel AA
  minimum;
- responsive action wrapping with no horizontal page scroll or concealed
  primary action at 320 CSS pixels and 400% zoom;
- no essential content only in the desktop inspector; on small screens, Page
  details and release facts remain reachable in document order;
- no animation needed for audience state; existing reduced-motion behavior
  governs any dialog or status transition; and
- retry controls remain available without a timer or disappearing countdown.

### 7. RTL, CJK, and localization behavior

D24 inherits D22's exact-locale model and must not reintroduce fallback through
UI copy.

- Set the document `lang` to the exact active locale and `dir` independently
  from a code-owned locale capability.
- Use CSS logical properties so headers, action groups, breadcrumbs, dialogs,
  and status strips mirror without maintaining separate layouts.
- Render unknown-direction titles, organization names, and inserted labels with
  appropriate bidirectional isolation such as `bdi`/`dir="auto"`.
- Isolate URLs, IDs, timestamps, and immutable revision identifiers from
  surrounding RTL prose; display a human path label where possible rather than
  making staff parse a long technical URL.
- Allow CJK line breaking and font fallback. Do not depend on spaces, English
  capitalization, a fixed number of characters, or truncation to communicate
  Draft/Live/Needs attention.
- Test long translated action labels without shortening them to icon-only
  controls. Public-audience meaning is translated as ordinary product UI, while
  code-owned `public` remains internal.
- Preview and publish confirmation always name the exact locale; no control says
  “all languages,” and no missing locale silently previews another one.

## Failure-state contract

| Failure or uncertainty                   | Staff experience                                                                                                                             | Public consequence                                                                                              |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Draft save/autosave fails                | Persistent **Draft not saved** state, retained local work, retry, and exact field guidance where applicable                                  | Existing live Page is unchanged                                                                                 |
| Preview session expired                  | **Your preview session ended. Sign in again to reopen this private preview.** Preserve return target after safe authentication               | Existing live Page is unchanged                                                                                 |
| Preview renderer fails                   | **Preview could not load. Your draft is safe.** Retry and privacy-safe incident reference                                                    | Existing live Page is unchanged                                                                                 |
| Publish validation fails                 | Focusable error summary plus linked, plain-language repairs; dialog closes or becomes a repair summary without losing draft                  | Prior complete generation remains live                                                                          |
| Publish permission revoked               | **You no longer have permission to publish this page. Your draft is still saved.** No role internals or cross-scope hints                    | No new release                                                                                                  |
| Expected-head conflict                   | **The site changed while you were working. Your draft is safe. Review the updated release summary before publishing again.** No force button | Prior complete generation remains live                                                                          |
| D1 release accepted, convergence pending | **Released — updating the public site.** Show freshness and one bounded refresh; do not encourage repeated Publish clicks                    | Old or new complete representation may still be observed by layer until convergence; never a partial generation |
| Downstream convergence exceeds its bound | Cause-owned **Needs attention** state with safe support reference and retry/reconcile ownership                                              | Release authority remains explicit; do not falsely claim every edge/search layer is current                     |
| Safety/source owner suppresses content   | Explain the safe cause and owning repair action to authorized staff without exposing restricted detail                                       | Unsafe output fails closed under its owning decision                                                            |
| Public route is withdrawn or absent      | Staff sees exact route consequence before action                                                                                             | Tenant-branded not-found response; no private draft, account, or existence leakage                              |
| Account destination unavailable          | No CMS editing consequence                                                                                                                   | Public Page remains usable; the owning app presents a recoverable account error                                 |

No failure is toast-only. No error suggests republishing blindly, clearing a
cache manually, changing an audience, or bypassing authorization.

## UX-focused adversarial pressure test

| Concern                                   | Material? | What could go wrong                                                                                                    | Severity / likelihood      | Permanent UX prevention                                                                                                            |
| ----------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Hidden public consequence                 | Yes       | Staff may read **Publish** as an internal save and disclose unfinished or sensitive ministry content                   | Critical / Medium          | One exact public-visibility fact and consequence-confirmed Publish; Draft remains the low-friction default                         |
| Noisy over-explanation                    | Yes       | Repeating architecture and public badges everywhere obscures actual work and trains users to ignore warnings           | Medium / High              | Put the fact only in Page details, preview chrome, and release confirmation; use progressive disclosure for help                   |
| Preview/live ambiguity                    | Yes       | An authorized collaborator may approve a private preview but assume it is public, or share a preview URL               | High / High                | Distinct action names, persistent not-public preview banner, protected URL, and separate **View live page** action                 |
| Account/audience confusion                | Yes       | A signed-in donor could appear to receive a special CMS Page, or staff may author private data in public content       | Critical / Medium          | Stable app-owned portal links and unchanged CMS representation; contextual private-workspace guidance                              |
| Status optimism                           | Yes       | A success toast may claim Live while CDN/search/social layers lag or fail                                              | High / Medium              | Durable Released/Updating/Live states derived from separate facts, with cause-owned exception handling                             |
| Mobile concealment                        | Yes       | The desktop inspector may be the only place explaining visibility or failures                                          | High / High without design | Keep essential release facts in the main document order and prove 320px/400% reflow                                                |
| Assistive-technology exclusion            | Yes       | Autosave, publish results, validation, or modal context may be invisible or disruptive to keyboard/screen-reader users | High / Medium              | Native semantics, Base UI, polite status, linked errors, visible focus, focus restoration, and manual testing                      |
| Localization breakage                     | Yes       | Long CJK labels, RTL paths, or mixed-direction names may reorder or truncate consequential information                 | High / Medium              | Exact `lang`/`dir`, logical CSS, bidi isolation, content expansion, CJK/RTL test fixtures, and no icon-only fallback               |
| Error-induced duplicate action            | Yes       | An unclear pending state invites repeated Publish clicks                                                               | High / Medium              | Disable only while the command is in flight, preserve readable progress, and reconcile by idempotent receipt before offering retry |
| Overengineered personalization affordance | Yes       | A disabled selector or “coming soon” audience field becomes misleading debt and support burden                         | Medium / High              | Do not render or store speculative audience configuration; future audiences require a new complete product decision                |

## Usability and accessibility validation plan

### Representative participants

Use actual or likely users rather than internal experts alone:

- nonprofit communications staff who publish weekly;
- occasional ministry staff or missionary editors who publish infrequently;
- tenant administrators who configure Site and locale context;
- participants with lower digital confidence;
- keyboard-only, screen-reader, magnification, speech-input, and touch users,
  preferably on their own assistive setup; and
- staff working in at least one RTL locale and one CJK locale before those
  capabilities activate.

Include public donors and ministry partners when testing the visitor shell and
portal entry points. Do not ask donor participants to reason about CMS concepts.

### Task-based scenarios

1. Open a Page with a live version and a newer draft; identify what visitors
   currently see.
2. Preview the draft and explain whether the URL or content is public.
3. Publish an exact locale revision and explain who can view it and what later
   edits will do.
4. Observe a delayed-convergence state and decide whether to publish again,
   wait, or use the provided recovery action.
5. Recover from validation, session-expiry, permission-revocation, and
   expected-head conflict without losing work or exposing details.
6. Find the Donor Portal or Missionary Workspace from a public Page and return;
   verify that public Page content did not change after authentication.
7. Repeat the critical edit/preview/publish path on a narrow touch device, at
   400% zoom, with keyboard and screen reader, and with long RTL/CJK content.

### Observable success evidence

The design is not ready because participants say it looks clean. It is ready
when representative users, without coaching:

- correctly distinguish private draft, preview, released, updating, and live;
- correctly answer that anyone can view a released public Page;
- do not look for an audience selector to create donor- or missionary-only
  content;
- select the correct portal from stable public account chrome;
- complete Publish or recovery with the intended revision, Site, locale, and
  path;
- retain confidence and task position after errors;
- complete the path with keyboard, screen reader, touch, zoom, RTL, and CJK
  fixtures; and
- encounter no Critical or High accessibility defect and no private-data
  disclosure in DOM, payload, metadata, preview sharing, or account transitions.

Capture task completion, consequential errors, requests for help, audience-
meaning misunderstandings, preview-link sharing attempts, recovery success,
and time spent only as diagnostic evidence. Do not optimize a vanity score at
the expense of truthful comprehension.

### Engineering verification seam

A future authorized implementation should add focused unit and Playwright proof
for:

- one exact `public` audience across editor summary, compiler input, public
  projection, cache/search metadata, and preview fixtures;
- absence of audience selectors and login-conditioned public body changes;
- exact accessible names for Preview draft, Publish page, Keep editing, and
  View live page;
- keyboard order, visible/unobscured focus, dialog containment/restoration, and
  no hover-only behavior;
- polite save/convergence status, assertive blocking errors, linked field error
  recovery, and durable non-toast outcomes;
- 320 CSS-pixel reflow, 400% zoom, touch targets, forced colors, reduced motion,
  long text, exact `lang`/`dir`, bidi isolation, and RTL/CJK fixtures;
- session expiry, permission revocation, duplicate delivery, lost response,
  expected-head conflict, preview failure, and convergence delay; and
- negative proof that donor, missionary, and staff-private data never appears
  in public HTML, React payloads, preloads, metadata, sitemap, search, social
  cards, or analytics attributes.

Follow [Core frontend rules](../../../ai/rules/frontend.md),
[Core testing rules](../../../ai/rules/testing.md), and the
[accessibility-review skill](../../../ai/skills/accessibility-review/SKILL.md).
Automated axe checks complement but do not replace the manual and participant
tests above.

## Binding UX recommendation for the D24 synthesis

The selected A-prime boundary should be hardened with this exact UX posture:

> Web Studio exposes no tenant-editable audience control. In the Page details,
> private preview chrome, and every publish or schedule consequence summary, it
> presents the plain-language fact **Public website — anyone can view after
> release**. Draft and preview remain explicitly not public and limited to
> currently authorized collaborators, while **View live page** names the
> observed public destination. One concise publish confirmation identifies the
> exact Site, locale, path, revision, and D2 reach; explains whether the Page is
> listed or shared-by-link; and states that later drafts stay private.
> Successful action leaves durable Released, Updating public site, or Live
> state rather than a toast-only claim. Donor, missionary, and staff account
> actions remain stable, task-named, app-owned public-shell links whose
> destination applications own authentication and private content; account
> state never changes the CMS-authored public representation. Essential facts
> remain available on mobile and pass keyboard, screen-reader, touch, 400% zoom,
> 320-pixel reflow, forced-colors, reduced-motion, long-label, RTL,
> bidirectional, and CJK proof. Failure copy preserves the draft, names what did
> not change, provides one cause-owned recovery action, and never suggests a
> cache, audience, authorization, or force bypass.

That is a complete, low-noise product contract. It creates no personalization
framework, new editor destination, disabled future control, duplicate workflow,
or speculative schema.
