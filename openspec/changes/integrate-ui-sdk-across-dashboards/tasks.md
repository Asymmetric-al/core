## 1. Shared foundations

- [x] 1.1 Alias `@ui-sdk/core/testing` for tests and add the real-browser
      pattern sweep over Core's retained Base UI wrappers, with each accepted
      deviation recorded as exact problem text and reason.
- [x] 1.2 Write failing tests, then add the shared shortcut owner with its
      editable-field, overlay, region and hydration behavior.
- [x] 1.3 Write failing tests, then add the shared sortable list with
      keyboard and pointer reordering, announcements and its agent action.
- [x] 1.4 Write failing tests, then add the shared agent bridge owner with
      its allowlist, confirmation, hidden and secret marks and mocked WebMCP
      registration.
- [x] 1.5 Run the UI SDK wrapper tests with `__UI_SDK_STRICT__` set.

## 2. Adopt across the dashboards

- [x] 2.1 Move the shared command palette, Mission Control's navigation
      search and the shared sidebar toggle onto the shortcut owner.
- [x] 2.2 Move the Support inbox keymap, hints and composer shortcut, the
      Locations map, Email Studio and PDF Studio onto the shortcut owner, and
      remove the platform-sniffing hint hook.
- [x] 2.3 Reorder Support macro actions with the sortable list.
- [x] 2.4 Mount the agent bridge in the Mission Control shell with the
      reorder action allowlisted.
- [x] 2.5 Write failing tests, then add the Shift+? shortcut help, mount it
      once in each app shell, and require a description on every shortcut.

## 3. Fix exposed defects on their owners

- [x] 3.1 Shared toolbar Home and End; shared select names its listbox.
- [x] 3.2 Bulk-action bars become toolbars with focus recovery.
- [x] 3.3 Data table rows: roving tab stop, inner controls keep their keys,
      consumer-supplied name; column filter options become real controls.
- [x] 3.4 Missionary workspace: single-choice menus, view and type toggles,
      tab list, carousel and row action names, profile preview toggle and
      cover photo label.
- [x] 3.5 Donor portal: update filter group, settings details form.
- [x] 3.6 Remaining defects from the dashboard coverage sweep.

## 4. Guidance

- [x] 4.1 Name the shared owners in `packages/ui/AGENTS.md` and the `ui-sdk`
      skill's Core overlay, sync the skill mirrors, and refresh the hash-bound
      review ledgers for the changed proof files.

## 5. Verify the change

- [x] 5.1 Run typecheck for the shared package and the three dashboards,
      lint, the unit suite, the isolated browser suite, `skills:verify` and
      OpenSpec validation.
- [x] 5.2 Exercise representative flows in the three running dashboards at
      phone and desktop widths, and record the coverage of every applicable
      dashboard area.
- [ ] 5.3 Record the council review rounds and their scores.
