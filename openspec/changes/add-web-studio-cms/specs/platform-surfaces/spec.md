# Platform Surfaces Delta

## ADDED Requirements

### Requirement: Web Studio Presents One Page-First Authoring Journey

Web Studio SHALL present ordinary Site authoring through one Page-first
experience using the established staff shell, Base UI controls, semantic status
language and responsive patterns. Tenant, environment, Site and exact locale
SHALL remain visible. The Pages workspace SHALL provide searchable hierarchy
and list views, New Page, New Article, one Page editor, semantic section
outline, current web address, derived Navigation summary, Preview and the D1
publication action. Staff SHALL NOT operate a second placement document,
mutable Site Plan, provider draft/version, raw block tree or release manifest.

The ordinary sequence SHALL be Edit, Preview, Publish. One persistent status
region next to Preview and the release action SHALL distinguish Unsaved changes,
Saving, Saved just now, Scheduled, Published with unpublished changes, Updating
public site, Live and one cause-owned exception. Saved SHALL mean exact server
acknowledgement; Published, serving and downstream convergence SHALL remain
separate. Routine success SHALL be quiet and no critical result SHALL exist only
in a toast, color, animation, hover state or provider term.

#### Scenario: An occasional staff member edits and publishes a Page

- **GIVEN** the actor has exact Page edit and release capabilities in one
  visibly selected Site and locale
- **WHEN** they edit, wait for server acknowledgement, Preview and Publish
- **THEN** one coherent workflow shows only the controls and consequences needed
  for that Page
- **AND** every status describes an acknowledged product fact rather than a
  provider operation

#### Scenario: Save or release has an unknown outcome

- **GIVEN** a network failure loses acknowledgement for one exact command
- **WHEN** the status region updates
- **THEN** it states that the outcome is unknown and preserves local context
- **AND** resolves the existing receipt before permitting a different successor
  command

### Requirement: Structure Composition And Reuse Expose Consequences Without Noise

Parent selection SHALL be searchable. Move, reorder and section arrangement MAY
offer drag, but SHALL provide first-class Move up, Move down, Move to and named-
position controls. A Page move or rename SHALL show Currently live and After
publish only when different. Small effects SHALL receive concise review; a
large descendant closure SHALL provide searchable resumable impact and one
closure-level confirmation.

The section chooser SHALL use plain-language names, representative previews and
one-sentence purpose descriptions and show only family-qualified sections. Each
placement SHALL be visibly Local or Shared. Reuse SHALL expose exactly the
relevant explicit actions Save this section for reuse, Reuse existing, Change
every use, Make a local copy and View uses. The surface SHALL not expose generic
layout rows/columns, arbitrary style fields, provider block types or hidden
shared mutation.

#### Scenario: Staff move a Page with many descendants

- **GIVEN** a valid move has a high-fan-out exact path consequence set
- **WHEN** staff review the change
- **THEN** they can search, resume and compare the old/new mappings and confirm
  the closure once
- **AND** the interface does not require drag or descendant-by-descendant action

#### Scenario: Staff edit a shared section

- **GIVEN** the selected placement is Shared
- **WHEN** the editor intends to change its content
- **THEN** the interface makes Change every use and Make a local copy distinct
  before mutation
- **AND** no ordinary local-edit control silently updates other Pages

### Requirement: Navigation And Dynamic Discovery Remain Plain-Language And Link-Native

The Navigation workspace SHALL show exactly Primary Navigation and Footer
Navigation as ordered semantic outlines. Add item SHALL offer a managed Page or
registered Site destination, an HTTPS external website, or a non-navigating
Group. Links and Groups SHALL be visually and semantically distinct and every
reorder SHALL have a non-drag path. Page-aware Navigation assistance SHALL open
the same Navigation draft and SHALL not create duplicate Page fields.

Content-list authoring SHALL ask what to show, how to choose items and how
visitors load more, never for a provider query. Curation choices SHALL be
Updates automatically, Featured first or Choose every item, with a plain-
language explanation of future changes and only relevant controls. Windowing
SHALL be Show one set, Page links, button-led Load more or bounded Auto-load.
Public lists SHALL preserve ordinary anchors, canonical one-lane URLs, focus,
history, announcements, no-JavaScript behavior and independent ephemeral state
for other lists.

#### Scenario: Staff add a Page to Primary Navigation

- **GIVEN** the actor can edit one expected Navigation draft
- **WHEN** they select a managed Page from the Navigation workspace or Page
  summary
- **THEN** the same draft gains one stable-reference Link with seeded menu copy
- **AND** hierarchy, path and customized labels remain separate

#### Scenario: A visitor uses Load more without JavaScript

- **GIVEN** a released list has a canonical next-window anchor
- **WHEN** the visitor activates the button-led control with JavaScript absent
- **THEN** ordinary navigation loads the same server-rendered later window
- **AND** focus target, end state and public link semantics remain usable

### Requirement: Content Library Media And Health Stay Calm And Purpose-Bounded

The Content Library SHALL be a calm content inventory rather than project-
management or workflow software. It SHALL open on All content and offer Unfiled,
optional authority-free folders, Topics, personal and shared Saved Library
Views, Trash and one quiet Needs attention entry. Folder, Topic and view actions
SHALL state that they do not change website address, permission or publication
when that consequence could be misunderstood.

Content Health SHALL expose link-native Needs your action, Being handled
automatically, Needs platform attention and Recently resolved views, plus the
coverage notice Health check incomplete. Contextual and central presentations
SHALL resolve the same stable issue, name owner and visitor impact, and offer at
most one valid authorized next action. Healthy content SHALL remain quiet and
the surface SHALL not expose queue/provider consoles, generic Retry/Replay/
Force, scores or a second task system.

Media SHALL provide All media, Needs attention, Recently used and Trash, grid
and list views, restrained search/filters, optional five-level Media-only folder
rail, persistent per-file upload tray and a detail inspector ordered Preview and
status, Details, Rights & safety, Can be used on, Used in, Versions, Activity,
Technical details. Choose media SHALL default to Ready for this Page and Site,
then show actual slot Preview, accessibility treatment, crop and focus return.
Upload, Ready, Allowed, Used, Live and Retained SHALL never be conflated.

#### Scenario: Staff open a healthy Content Library

- **GIVEN** every visible item is currently healthy and no actionable exception
  exists
- **WHEN** staff browse or organize the Library
- **THEN** the surface remains an uncluttered inventory with no warning
  dashboard or repeated certification prompts
- **AND** organization actions cannot alter public or permission truth

#### Scenario: One issue requires an owner action

- **GIVEN** one current source-owned cause affects a Page, list, form or Media
  use
- **WHEN** staff open its contextual status or the matching health view
- **THEN** both show the same scope, impact, owner, progress and best action
- **AND** a user without repair authority receives intentional status rather
  than a revealing disabled control

#### Scenario: Staff choose Media for a Page placement

- **GIVEN** the Page and Site require one still-image placement
- **WHEN** the editor opens Choose media
- **THEN** qualified ready candidates appear first and the actual slot Preview
  gathers the required accessibility and crop semantics
- **AND** selecting an asset does not mislabel it Live before D1 release

### Requirement: Locale Preview Forms And Portability Use Guided Explicit Journeys

Single-locale Sites SHALL not show unnecessary localization machinery.
Multilingual Sites SHALL show exact-locale status and explicit Start blank or
Copy from actions. Missing translation SHALL be presented as missing, and
Source changed SHALL compare without overwriting target work.

Preview SHALL support acknowledged Page feedback, exact pinned Preview and
deliberate Prepare site preview. Persistent whole-Site Preview chrome SHALL name
Site, locale, prepared time, included change count and **Site preview · Not
public**. Candidate links SHALL remain inside the candidate; stale, expired,
revoked and blocked states SHALL never fall through to Live.

The public-form builder SHALL use the short sequence Purpose, Questions,
Delivery, Confirmation, Review & publish. Delivery SHALL explain Where the work
goes, Who should be notified and What the visitor receives as a numbered
outcome summary. Unavailable owner outcomes SHALL state the setup dependency
rather than create placeholders. The staff builder SHALL reuse the version-
pinned shared `useAsymForm` interaction adapter. The visitor form SHALL remain
native semantic HTML with a no-JavaScript path and exact server validation.

Imports SHALL use one saved full-page **Source → Destination → Match content →
Check and resolve → Review plan** journey. **Check the import** SHALL be visibly
no-write. Commit SHALL be a separate fresh privileged command outside that
preparation journey and state that results are private drafts and nothing is
published. Export and import status SHALL distinguish prepared, downloaded,
expired, applied, partial, stale, reversed and outcome unknown.

#### Scenario: Staff begin a translation

- **GIVEN** one multilingual Site has no target-locale lineage
- **WHEN** an authorized editor chooses Start blank or Copy from one exact
  source revision
- **THEN** the target editor opens an independent private lineage with truthful
  provenance and locale status
- **AND** the UI never implies silent fallback or completed translation

#### Scenario: Staff prepare a complete Site preview

- **GIVEN** the actor has Site-wide Preview authority and deliberate
  acknowledged inputs
- **WHEN** the candidate reaches Ready
- **THEN** persistent chrome identifies its exact private scope and included
  changes while all navigation remains candidate-local
- **AND** no form, giving, communication, analytics or other side effect runs

#### Scenario: Staff review a form route

- **GIVEN** one form has a valid Purpose Profile and Route Plan
- **WHEN** staff reach Review & publish
- **THEN** they see one plain-language Primary Outcome plus separate staff
  notification and visitor acknowledgement consequences
- **AND** they never manage a workflow graph, recipient expression or provider
  template identifier

#### Scenario: Staff check an import

- **GIVEN** a certified adapter has produced candidates
- **WHEN** staff complete Match content and choose Check the import
- **THEN** Review plan shows **Must fix before creating drafts**, **Needs review
  before release**, **Will not be imported** and **Information** totals without
  writing product data
- **AND** Commit remains a separate fresh privileged action that promises only
  private drafts

### Requirement: Public Site Presents Exact Accessible Ordinary CMS Output

The public Site SHALL render only the active exact Tenant × environment × Site ×
locale × `public` generation through `PublishedContentReader`. It MAY include
ordinary Pages and Articles, released hierarchy and breadcrumbs, curated
Navigation, semantic sections, qualified Presentation Package output, dynamic
lists, Site search, generated search/sharing metadata, purpose-bounded forms and
qualified public still-image Media. It SHALL not expose drafts, Preview data,
private identifiers, internal source types, permissions, operations, health,
diagnostics, provider details, form answers or protected media evidence.

At an otherwise identical public scope, anonymous, donor, missionary, staff,
expired-session and crawler requests SHALL receive auth-invariant CMS output.
Public functionality SHALL remain meaningful without JavaScript. Navigation,
lists, search, share and forms SHALL use native semantic behavior. Presentation
motion SHALL be decorative, interruptible, reduced-motion respectful and never
delay content, Navigation or Give entry points.

#### Scenario: A visitor opens an ordinary public Page

- **GIVEN** the exact route and locale are admitted in the active generation
- **WHEN** Phase 5 renders the Page
- **THEN** the visitor receives only the compiled public Page, Navigation,
  qualified media, metadata and admitted dynamic projections
- **AND** no private CMS, source-owner, health, Preview or provider data enters
  HTML, RSC, metadata or client payloads

#### Scenario: JavaScript or decorative presentation fails

- **GIVEN** a browser disables JavaScript or optional package motion fails
- **WHEN** the visitor navigates, browses a list, searches, shares or submits a
  supported form
- **THEN** server-rendered native links, controls and semantic forms remain
  usable
- **AND** essential content, Navigation and Give handoff remain available

### Requirement: Every Critical CMS Journey Meets The Platform Accessibility Floor

Every critical Web Studio and public CMS journey SHALL support keyboard, screen
reader and touch; 320 CSS-pixel reflow; 200-400 percent zoom; forced colors;
reduced motion; long localized copy; CJK, RTL and bidirectional text; weak
networks; suspended tabs; and expired sessions. Drag SHALL be optional. Every
move, reorder and crop SHALL have named controls and programmatic status.

Consequential dialogs and sheets SHALL preserve context, focus the least
destructive action, expose visible Cancel and Escape, restore focus and use calm
non-legalistic copy. Errors SHALL be linked to their field and summary where
applicable. Important results SHALL not rely solely on toast, color, animation,
position, pointer hover or inaccessible technical detail.

#### Scenario: A keyboard and screen-reader user completes a consequential task

- **GIVEN** the user does not use pointer drag and needs programmatic status
- **WHEN** they move a Page, reorder Navigation, configure a list, take over
  editing, Trash content, prepare Preview or commit an import
- **THEN** every step, consequence, confirmation, error and recovery is
  keyboard reachable, labelled and announced
- **AND** focus returns to a meaningful stable location after completion or
  cancellation

#### Scenario: Content reflows or uses reduced motion

- **GIVEN** the interface is at 320 CSS pixels or 400 percent zoom with reduced
  motion and long RTL/CJK localization
- **WHEN** staff or visitors complete a critical journey
- **THEN** information and actions remain present, ordered and operable without
  two-dimensional scrolling except for intrinsically tabular content
- **AND** motion never conveys the only status or blocks completion
