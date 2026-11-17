## ADDED Requirements

### Requirement: Dashboard page shortcuts have one shared owner

Page-level keyboard shortcuts in the three dashboards SHALL be registered
through one shared `@asym/ui` shortcut owner backed by UI SDK. A shortcut
SHALL leave its key alone while the user types in a field or while an overlay
it does not own holds focus, unless it declares otherwise. Key hints and
`aria-keyshortcuts` SHALL come from the registered keys. Each shortcut SHALL
carry a description, and each dashboard shell SHALL list the shortcuts that
work where focus is.

#### Scenario: A page shortcut is pressed behind a modal dialog

- **WHEN** a modal dialog is open and the user presses a page shortcut such as
  the sidebar toggle
- **THEN** the page shortcut does not run
- **AND** the dialog keeps focus and its own keys

#### Scenario: The user is typing

- **WHEN** focus is in an editable field and the user presses a shortcut that
  has not declared that it runs in fields
- **THEN** the key keeps its native effect, such as undo in the field
- **AND** the shortcut does not run

#### Scenario: A shortcut must always own its key

- **WHEN** a studio declares that Save runs in fields and in dialogs
- **THEN** the save key never reaches the browser's own save action
- **AND** the studio saves only when its own conditions allow it

#### Scenario: A region shortcut and a page shortcut share a key

- **WHEN** focus is inside a region that registers the same key as a page
  shortcut
- **THEN** only the region's shortcut runs

#### Scenario: A user asks which shortcuts work here

- **WHEN** the user presses Shift+? outside a text field
- **THEN** a dialog lists each described shortcut that would run where focus
  was, with its keys as this platform writes them and their spoken names
- **AND** a region's shortcuts appear only when focus was inside that region
- **AND** closing the dialog returns focus to where it was

#### Scenario: A user asks from inside a dialog or sheet

- **WHEN** the user presses Shift+? outside a text field while a dialog,
  sheet or popover holds focus
- **THEN** the help opens over it and lists the described shortcuts that
  would run there, not the page shortcuts the open overlay pauses
- **AND** Escape closes only the help and returns focus inside the overlay
- **AND** while a menu or list holds focus, Shift+? stays with it for its own
  typing

#### Scenario: A key hint renders on the server

- **WHEN** a control shows its shortcut hint in server-rendered markup
- **THEN** hydration reuses that markup without a mismatch
- **AND** after mount the hint and `aria-keyshortcuts` name the platform's
  modifier key

### Requirement: Single-list reordering uses the shared sortable list

Core SHALL provide one shared sortable list backed by UI SDK reordering. Each
row SHALL have a named handle button that reorders by pointer and by keyboard:
pick up, move by one place or to either end, drop, and cancel. The list SHALL
announce pick-up, each move and the result, keep focus on the moved row's
handle, and report every order change through one change callback that states
its reason and source and can be cancelled. The Support macro action editor
SHALL reorder its actions with it.

#### Scenario: A user reorders with the keyboard

- **WHEN** a user focuses a row's handle, picks the row up, moves it and drops
  it
- **THEN** the list order changes once and the change callback receives the
  new order
- **AND** a screen reader hears the pick-up, the new position and the drop
- **AND** focus stays on the moved row's handle

#### Scenario: A user cancels a move

- **WHEN** a user picks a row up, moves it and presses Escape
- **THEN** the original order is restored and no change is reported

#### Scenario: Macro actions are reordered

- **WHEN** a Support administrator reorders macro actions by the handle or by
  the move buttons
- **THEN** both paths produce the same order through the same owner
- **AND** the saved macro keeps its existing shape and validation

### Requirement: The UI SDK agent bridge has one deny-by-default owner

The UI SDK agent bridge SHALL have one shared owner in `@asym/ui` that exposes
only UI SDK-backed controls and never mirrors Base UI or native controls. It
SHALL refuse every agent action the mounting dashboard has not allowlisted,
and SHALL apply that policy to browser agent tools too. Only a dashboard with
a UI SDK-backed control SHALL mount it, and people who use no agent SHALL NOT
download it.

#### Scenario: An agent runs an allowlisted action

- **WHEN** an agent asks an allowlisted action of a named UI SDK-backed
  control
- **THEN** the rendered control changes
- **AND** the control's change callback runs with the agent as the source

#### Scenario: An agent asks for an action that is not allowlisted

- **WHEN** an agent asks for an action the dashboard did not allowlist
- **THEN** the request is refused and the rendered control does not change

#### Scenario: A control needs a person

- **WHEN** an agent asks an action of a control marked as needing a person and
  no person confirms
- **THEN** the action does not run

#### Scenario: A control is marked hidden or secret

- **WHEN** a UI SDK-backed control sits inside a region marked hidden from
  agents, or is marked secret
- **THEN** the hidden control is absent from what the agent can read
- **AND** the secret control's value is redacted

#### Scenario: The application cancels an agent's change

- **WHEN** the control's change callback cancels a change whose source is an
  agent
- **THEN** the control keeps its value and the result shows no change

#### Scenario: The browser offers no agent tool interface

- **WHEN** a dashboard that mounts the bridge loads in a browser without that
  interface
- **THEN** no tools are registered and the bridge code is not loaded

#### Scenario: A dashboard has no UI SDK-backed control

- **WHEN** the donor portal or the missionary workspace renders
- **THEN** it mounts no agent bridge
- **AND** its controls remain operable through their accessible names, roles
  and states

### Requirement: Retained shared wrappers are checked against their patterns

Core SHALL check its retained shared interactive wrappers against the WAI-ARIA
pattern each one claims, using UI SDK's pattern checker, in unit tests where
the test environment can judge the pattern and in a real browser otherwise. A
deviation SHALL be recorded with the exact problems reported and the reason it
is accepted, and an unrecorded problem SHALL fail the check.

#### Scenario: A wrapper matches its pattern

- **WHEN** the checker runs against a shared tabs, menu, toolbar, listbox,
  switch, slider, accordion or disclosure wrapper
- **THEN** it reports no problem

#### Scenario: A wrapper deviates for a recorded reason

- **WHEN** the checker reports a problem that Core accepts, such as a modal
  dialog that omits `aria-modal` by Base UI's design
- **THEN** the check lists that exact problem with its reason
- **AND** direct keyboard checks cover what the checker cannot judge

#### Scenario: A wrapper regresses

- **WHEN** a wrapper gains a problem that is not recorded
- **THEN** the check fails

### Requirement: Shared selection, table and filter surfaces keep honest keyboard semantics

A shared surface that claims a composite role SHALL provide that role's
keyboard behavior. Bulk-action bars SHALL be toolbars with one tab stop, arrow
keys and Home and End, and SHALL return focus to a stable element when they
close while holding focus. Keyboard-navigable data table rows SHALL offer one
tab stop, SHALL leave keys from links, buttons and inputs inside a row to
those controls, and SHALL take a name from the consumer. Filter options SHALL
be real controls that expose their state.

#### Scenario: A bulk-action bar closes while it has focus

- **WHEN** a user clears the selection from the bar, or runs a bulk action
  that clears it
- **THEN** focus moves to a stable element of the same surface, not to the
  document body

#### Scenario: A user activates a link inside a table row

- **WHEN** focus is on a link or button inside a keyboard-navigable row and
  the user presses Enter or Space
- **THEN** that control's own action runs
- **AND** the row's action and row selection do not

#### Scenario: A user reaches table rows by keyboard

- **WHEN** a user tabs to a keyboard-navigable table
- **THEN** exactly one row is in the tab order and the arrow keys move between
  rows

#### Scenario: A one-of-many choice is offered in a menu or a button group

- **WHEN** a dashboard offers a single choice among options
- **THEN** the options expose single-choice semantics and one tab stop
- **AND** the user can return to the unfiltered or default option
