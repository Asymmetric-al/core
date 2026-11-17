## Approach

Base UI stays the primitive base. UI SDK carries three behaviors no shared
component provided, each through one `"use client"` wrapper at
`packages/ui/components/primitives/<name>.tsx`, published by the existing
narrow export. Applications import the wrappers and never `@ui-sdk/*`.

### Shortcuts (`primitives/shortcut.tsx`)

UI SDK's shortcut manager listens once on `document`, resolves `mod` per
platform, ignores key repeat and composition, and yields to a handler that
already cancelled the key. It pauses only for its own popups and runs
modifier keys inside text fields, so the wrapper adds two guards Core's old
handlers had: it leaves the key alone while an editable element has focus,
and while a Base UI dialog, menu or listbox that the shortcut does not own
holds focus. A shortcut opts out per guard (`allowInInput`,
`allowInOverlay`), limits itself to a region (`within`), or names the overlay
it opens (`overlay`). The guards run in the manager's `when` check, before it
cancels the key, so a key the shortcut declines keeps its native effect.
`useShortcutHint` renders the same text on the server and the first client
render and switches to the platform's keys after mount.

Every shortcut carries a `description`. Shift+? (`primitives/shortcut-help.tsx`,
mounted once in each app shell) lists the described shortcuts the manager
would run where focus was when it was pressed, so a region's keys appear only
from inside that region. The list is read before the dialog opens, because
the overlay guard pauses page shortcuts once it holds focus. The help itself
also runs over an open dialog, sheet or popover (the Eve sheet, the phone
conversation sheet, a studio dialog), listing what works there, and Escape
closes it back into that overlay; a menu or listbox keeps Shift+? for its own
typeahead. The first mounted host owns the key, so a page that mounts its own
host inside a shell still shows one list. A structural
test fails when a product shortcut has no description. Each shell's account
menu also has a Keyboard shortcuts item that opens the same dialog once the
menu has returned focus to its trigger, and the public /where-we-work map,
the one public page that registers a shortcut, mounts its own help.

Adopters: the shared command palette (donor portal, missionary workspace),
Mission Control's navigation search, the shared sidebar toggle, the Support
inbox keymap and composer, Email Studio, PDF Studio and the Locations map.
Their own `window` listeners and the platform-sniffing hint hook are removed.
Element-level handlers stay where they are: cmdk, TipTap, the data grid row
keys and Base UI's own popups each own keys on their element. An element
handler that claims a key first wins, so TipTap's StarterKit, which binds
Mod-Enter to a hard break, kept Ctrl/Cmd+Enter from ever reaching the Support
composer's send. A Support-only editor extension lets that one key through
without cancelling it; Shift+Enter still breaks the line.

### Reordering (`primitives/sortable-list.tsx`)

UI SDK ships the reorder behavior but no list component, so the wrapper
defines a small primitive with `definePrimitive` and `createReorder`. Rows
contain other controls, so pointer and keyboard handlers live on a dedicated
handle button per row. Order is controlled or uncontrolled and changes
through one callback whose details carry the reason, the source and
`cancel()`. The Support macro action editor keeps its move buttons; they call
the same owner, so the handle and the buttons cannot disagree. The agent
bridge names each row by its `label` in snapshot, query and act alike: the
list's row slot is not called `item`, so the bridge reads the primitive's
`agent.items` instead of naming rows by their run-together visible text.
Web Studio's
column order (in each collection list's View menu) uses the same list.

Moving cards between lists is a different behavior. UI SDK ships it as
`createTransfer`, but every export is marked `@experimental` in the pinned
release. The missionary task board keeps dnd-kit, which already gives a named
handle, keyboard moves within and across columns, announcements that name the
task and column, focus after a drop and a server-confirmed save with rollback,
proven in Chromium. The Support board keeps native drag between lanes plus a
Move to menu on every card, its keyboard and screen-reader path. Either would
move to `createTransfer` only when it is stable and the move is worth a second
migration.

### Agent bridge (`primitives/agent-bridge.tsx`)

The installed bridge registers only components built on UI SDK. Base UI and
native controls are invisible to it, and Core does not mirror them: a mirror
would be a second owner for the same interaction. Agents operate those
controls through the accessibility tree, which is why the defect fixes below
matter for agents as much as for people.

The owner creates one bridge per document, loads the SDK's agent module only
on demand, refuses every action that the mounting dashboard has not
allowlisted, refuses a control marked `data-agent-confirm` unless a person
confirms, and registers WebMCP tools only where the browser exposes that
interface. Mission Control mounts one per document, each allowlisting only
the reorder action of its own named list: the shell (the `(app)` routes)
allows "Macro actions", Support's macro editor, and the Payload layout,
which serves Web Studio outside that shell, allows "Column order", the View
menu's viewer preference (`WEB_STUDIO_AGENT_PERMISSIONS`). A generic label
such as "Actions" is never granted, so a future list cannot become
agent-operable without review. The donor portal and the missionary
workspace have no UI SDK-backed control and mount nothing.

Security boundary: the bridge runs in the signed-in user's page with that
user's permissions and can only call component actions. A reorder changes
form state in the browser; saving still goes through the editor's existing
validation and server mutation, so authorization and tenant scope are
unchanged. No server route, credential or policy is added.

### Pattern checks (`@ui-sdk/core/testing`)

`checkPattern` judges a rendered widget against its WAI-ARIA pattern. Tests
live outside `packages/ui`, so `vitest.config.mts` aliases the testing entry
to the one installed copy. In jsdom it judges tabs, switch, accordion,
disclosure and toolbar. Widgets that submit through a hidden native input,
and anything that needs layout, run in the isolated Chromium suite, which
records each accepted deviation as the exact problem text with its reason and
adds direct keyboard checks where the checker cannot judge. The first run
exposed two real defects, fixed on their owners: the shared toolbar had no
Home and End, and the shared select did not name its listbox.

### Defects fixed on existing owners

The checks and a sweep of the three dashboards found keyboard, focus and
naming defects in retained controls. Each is fixed where it lives, with
existing shared components: bulk-action bars become real toolbars and recover
focus; data table rows get a roving tab stop, leave inner controls their keys
and take a consumer name; column filter options become real controls;
single-choice menus use radio items; hand-rolled pressed-button groups use
the shared toggle group; repeated row action names name their row.

The browser suites then held the shared owners to the same bar: a
single-choice toggle group starts its tab stop on the selected item, as Tabs
and Radio Group do, and follows a value set from outside the group (Base UI
reads the selected item only when the items first register); the shared key
hint meets text contrast in dark mode; icon triggers meet the 44px
coarse-pointer target; a sheet trigger is the button itself, so focus
returns to it.

## Compatibility

No dependency or version change. Shortcut keys are unchanged; hint text
follows the SDK's format. Accessible names of some row actions and tables
change, and tests that query the old names are updated with them. Public
donor routes consume shared pieces this change touches: the toggle group on
/faq, the command list, shortcut owner and key hint on /where-we-work, and the
public navbar on every layout. Their unit tests and the Base UI compliance
suite cover them.

Accepted risk: two capabilities this change relies on are marked experimental
in the pinned `0.1.0-beta.2`, as `createTransfer` is: the `agent` key that
names sortable rows for the bridge (`@ui-sdk/react/docs/agents.md`, "The
`agent` key is experimental") and `checkPattern` (`@ui-sdk/core/testing`,
`check-pattern.d.ts`). They are used here because no stable alternative does
the job: agents need the rows' names, and the pattern sweep is test-only. The
exact pin keeps them from changing underneath; an upgrade re-runs the agent
bridge, sortable list and pattern conformance tests before the bump.

## Verification

Unit tests cover each wrapper, including server render and hydration, and
each migrated shortcut on both platforms. The wrapper tests run with
`__UI_SDK_STRICT__` set, so an SDK development warning fails them. The isolated Chromium suite covers
the pattern sweep, the rating and pointer reordering. Real-application specs
exercise representative flows in all three dashboards at phone and desktop
widths with stubbed data, and a compliance-harness page mounts the real
Support composer to prove its send keys. Production builds of the three apps
serve temporary public probe pages that render the wrappers, so production
hydration is checked too. Repository checks are typecheck, lint, the unit
suite, the skill mirrors, OpenSpec validation and the hash-bound review
ledgers.

Known limit: Playwright's Chromium exposes no WebMCP interface, so WebMCP is
verified against a mocked interface only. That proves Core's wiring and
policy, not a browser agent using it. The signed-in dashboards cannot be
loaded from a local production build: production refuses the end-to-end sign-in
bypass and demo accounts by design, and the check does not weaken that.

Not adopted: a shared `announce` wrapper. Surfaces keep their own
`role="status"` regions and Sonner's polite region; the SDK announcer stays
inside the sortable list, where the SDK owns the drag state. The unused
`UnsavedChangesGuard` is left as it is: the editing dashboards keep unsaved
input in the retained-draft store across in-app navigation and warn on
unload.

## Rollback

Revert the change as one unit. Nothing is persisted, and no data, API or
configuration migrates.
