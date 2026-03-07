# mission-control-permissions Specification

## Purpose

Define the current Mission Control role-to-tile access model and the team-management UI used to preview and edit module-level access in the admin app.

## Requirements

### Requirement: Mission Control tile access is role-mapped through shared helpers

The shared Mission Control permission helpers SHALL resolve tile access from the configured role-to-tile map.

#### Scenario: Administrator requests accessible tiles

- **WHEN** `getAccessibleTileIds("admin")` runs
- **THEN** it returns the full administrator tile set, including `web-studio`, `crm`, `contributions`, `email`, `pdf`, `sign`, `mobilize`, `reports`, `support`, `automations`, `care`, `events`, and `admin`

#### Scenario: Restricted role requests accessible tiles

- **WHEN** `canAccessTile("finance", "reports")` runs
- **THEN** it returns `true`
- **AND** `canAccessTile("finance", "care")` returns `false`

#### Scenario: Role labels are displayed for known roles

- **WHEN** Mission Control code resolves a label from `ROLE_LABELS`
- **THEN** each known role maps to its configured human-readable label such as `Finance`, `Member Care`, or `Administrator`

### Requirement: Team management exposes per-module permission levels in the admin UI

The admin teams UI SHALL expose module-level permissions with the levels `None`, `View`, `Manage`, and `Admin`.

#### Scenario: Permissions tab is opened for a team

- **WHEN** an admin opens the team management sheet from `/admin/teams`
- **THEN** the `Permissions` tab lists Mission Control tiles from the shared tile configuration
- **AND** each tile row includes a permission selector with `None`, `View`, `Manage`, and `Admin`

#### Scenario: Admin-level permission is visibly distinguished

- **WHEN** a team permission is currently `Admin`
- **THEN** the row shows the admin indicator icon (`ShieldCheck`)
- **AND** non-admin rows use the restricted-state indicator (`Lock`)

### Requirement: Team management groups editing into permissions, members, and settings views

The admin teams UI SHALL organize team management into distinct tabs for permissions, members, and settings.

#### Scenario: Team management sheet is opened

- **WHEN** an admin clicks `Manage` for a team row on `/admin/teams`
- **THEN** the sheet header identifies the selected team
- **AND** the tab list includes `Permissions`, `Members`, and `Settings`

#### Scenario: Members tab is opened

- **WHEN** the `Members` tab is active
- **THEN** the sheet lists members assigned to the selected team
- **AND** it exposes an `Add Member` action in the tab header

#### Scenario: Settings tab is opened

- **WHEN** the `Settings` tab is active
- **THEN** the sheet exposes editable team branding fields
- **AND** it includes a destructive delete action in a danger-zone section

### Requirement: Team listings preview configured permissions and membership counts

The teams table SHALL preview the current team state before a sheet is opened.

#### Scenario: Teams table is rendered

- **WHEN** `/admin/teams` renders the team management table
- **THEN** each row shows the team name, description, members count, and a preview of configured permissions

#### Scenario: Team has more than three configured permissions

- **WHEN** a team has more than three permission entries
- **THEN** the table shows the first permission badges
- **AND** it renders a `+N more` badge for the remaining entries
