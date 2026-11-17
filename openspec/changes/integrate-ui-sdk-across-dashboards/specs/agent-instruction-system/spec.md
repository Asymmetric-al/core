## ADDED Requirements

### Requirement: Agent guidance names the shared UI SDK owners

The shared UI instructions and the `ui-sdk` skill's Core overlay SHALL name
the shared owners that carry UI SDK behavior in the dashboards: the shortcut
owner, the sortable list, the agent bridge and the pattern checker used in
tests. They SHALL route an agent to those owners before it writes a key
listener, a reorder control, a bridge or a pattern check of its own.

#### Scenario: An agent adds a keyboard shortcut

- **WHEN** dashboard work needs a page or region keyboard shortcut
- **THEN** the guidance routes the agent to the shared shortcut owner
- **AND** the agent adds no `keydown` listener on `window` or `document`

#### Scenario: An agent makes a control operable by an agent

- **WHEN** work asks that an agent can operate a control
- **THEN** the guidance says that Base UI and native controls are operated
  through their accessible names, roles and states
- **AND** that only a UI SDK-backed control joins the bridge, through the
  dashboard's allowlist
- **AND** the agent creates no second bridge and no hidden mirror control

#### Scenario: An agent changes a retained shared wrapper

- **WHEN** work changes the roles, names or keys of a shared interactive
  wrapper
- **THEN** the guidance routes the agent to the pattern checks that cover it
