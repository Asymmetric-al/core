# Integrate UI SDK across the dashboards

## Why

`adopt-ui-sdk-behavior-library` installed UI SDK in `packages/ui` and proved
one wrapper, `Rating`, which no screen uses. Its non-goals excluded production
screens, the agent bridge and WebMCP, so the three dashboards still hand-roll
the behaviors the SDK was admitted for: nine separate keyboard-shortcut
listeners with different rules for text fields and open dialogs, a reorder
control with no drag, keyboard pick-up or announcement, and no check that
Core's retained Base UI wrappers match the patterns they claim. One of those
listeners toggled the sidebar behind an open modal dialog.

## What Changes

- Add one shared shortcut owner backed by UI SDK and move every dashboard
  page shortcut onto it: the command palette, the sidebar toggle, the Support
  inbox and composer, Email Studio, PDF Studio and the Locations map.
- Add one shared sortable list backed by UI SDK reordering, and use it in the
  Support macro action editor and Web Studio's column order.
- Add one shared owner for the UI SDK agent bridge, with a deny-by-default
  allowlist, and mount it in Mission Control, the only dashboard with a UI
  SDK-backed control.
- Check Core's retained Base UI wrappers with UI SDK's pattern checker in
  unit tests and in a real browser, and record each deviation with its reason.
- Fix the keyboard, focus and naming defects those checks and the dashboard
  sweep expose, on their existing Base UI owners.
- Name the new shared owners in the shared UI instructions and the `ui-sdk`
  skill overlay.

Non-goals: replacing a Base UI component with a UI SDK equivalent, mirroring
Base UI or native controls into the agent bridge, mounting the bridge in a
dashboard that has no UI SDK-backed control, loading the SDK's optional
stylesheet, changing the SDK version, visual redesign, and new product
features. `adopt-ui-sdk-behavior-library` is not edited.

## Capabilities

- `shared-ui-primitives`: one owner each for dashboard shortcuts, list
  reordering and the agent bridge; pattern checks on retained wrappers; honest
  keyboard semantics for shared selection bars, tables and filters.
- `agent-instruction-system`: agent guidance names the shared UI SDK owners.

## Impact

The change adds three shared primitives and their tests to `packages/ui`,
moves existing shortcut handlers in the three dashboards onto the shared
owner, changes keyboard, focus and accessible-name behavior of shared
selection bars, data tables, filters and several dashboard controls, and
mounts the agent bridge in the Mission Control shell. No dependency, schema,
API, authorization or tenant boundary changes. The agent bridge can run only
allowlisted actions on UI SDK-backed controls, through the same change
callbacks a person's input reaches, so validation and save rules still apply.

Rollback reverts the change as one unit. The shared primitives have no
persisted state, and the previous handlers return with the revert.
