# Platform Surfaces Delta

## ADDED Requirements

### Requirement: Web Studio Presents One Page-First Authoring Journey

Web Studio SHALL present ordinary Site authoring through one Page-first experience using the established staff shell, Base UI controls, semantic status language and responsive patterns.

Every clause in `openspec/contracts/platform-surfaces.md#contract-682c93855960905340a0` MUST apply without exception.

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

Parent selection SHALL be searchable.

Every clause in `openspec/contracts/platform-surfaces.md#contract-a63e4168f965f887ab5e` MUST apply without exception.

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

The Navigation workspace SHALL show exactly Primary Navigation and Footer Navigation as ordered semantic outlines.

Every clause in `openspec/contracts/platform-surfaces.md#contract-3f1e7f6c75254139dc09` MUST apply without exception.

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

The Content Library SHALL be a calm content inventory rather than project- management or workflow software.

Every clause in `openspec/contracts/platform-surfaces.md#contract-d30ce9d2f89669a80ce3` MUST apply without exception.

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

Every clause in `openspec/contracts/platform-surfaces.md#contract-bccf369572cfa985de13` MUST apply without exception.

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

The public Site SHALL render only the active exact Tenant × environment × Site × locale × `public` generation through `PublishedContentReader`.

Every clause in `openspec/contracts/platform-surfaces.md#contract-aa636438a1e8f6b0cb8a` MUST apply without exception.

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

Every critical Web Studio and public CMS journey SHALL support keyboard, screen reader and touch; 320 CSS-pixel reflow; 200-400 percent zoom; forced colors; reduced motion; long localized copy; CJK, RTL and bidirectional text; weak networks; suspended tabs; and expired sessions.

Every clause in `openspec/contracts/platform-surfaces.md#contract-c83cc86a59f65eefc7d7` MUST apply without exception.

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
