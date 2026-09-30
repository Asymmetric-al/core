## ADDED Requirements

### Requirement: Missionary Partner Rosters Keep Loaded Records Reachable

The missionary Partners roster MUST keep all loaded, matching partner rows
reachable when its client pagination controls are hidden. Incremental server
loading MUST NOT feed an inaccessible default client page.

#### Scenario: More than ten partners are loaded

- GIVEN the Partners API has returned fifteen matching rows
- WHEN the roster hides pagination controls
- THEN partners after the first ten remain reachable through the shared table

### Requirement: Missionary Partner Profile Edits Require Visible Identity

Missionary profile and tag commands MUST reject writes to a relationship whose
identity is redacted under the row projection's recipient-visibility policy.
The server MUST enforce this alongside tenant and missionary ownership at the
write boundary and MUST NOT trust a caller-supplied visibility flag. A redacted
placeholder or empty tag draft MUST NOT replace hidden canonical donor data.

#### Scenario: An anonymous partner's empty tag draft is submitted

- GIVEN the partner row is anonymous to the missionary
- WHEN a profile or tag mutation is submitted
- THEN the server rejects it without changing the canonical donor fields

#### Scenario: A privacy preference changes while editing

- GIVEN a named partner's edit surface is open
- WHEN the refreshed row becomes anonymous
- THEN profile and tag editing is unavailable and cannot save the redacted row

#### Scenario: A named partner is edited within its authorized relationship

- GIVEN identity is explicitly visible and the donor belongs to the authenticated tenant and missionary
- WHEN a valid profile or tag mutation is submitted
- THEN the existing edit succeeds without broadening cross-tenant or cross-missionary access

### Requirement: Missionary Partner Detail Preserves Readable Metadata and Controls

The extracted Partners interface MUST display the selected partner type and a
meaningful fallback when location is missing. Icon-only actions MUST have
accessible names. Tag and activity choices MUST expose their current state
through the shared Base UI controls, preserving existing saved tags and the
selected activity kind. The interface MUST use Core semantic theme tokens.
Compact layouts MUST keep the partner identity, header actions, activity choices
and submit control reachable without clipping inside their containers.

#### Scenario: A selected partner has no location

- GIVEN a Church partner has an empty location
- WHEN the partner detail opens
- THEN its header displays Church and Unknown

#### Scenario: A named partner's tags are edited

- GIVEN the partner has an existing tag
- WHEN the missionary selects another labeled tag checkbox and saves
- THEN both the existing and selected tags are submitted

#### Scenario: The missionary chooses an activity kind

- GIVEN the activity composer has a selected kind
- WHEN the missionary chooses Call in the named activity group
- THEN Call is selected and the other activity choices are unselected

#### Scenario: Partner detail is used on a narrow screen

- GIVEN a selected partner and an activity draft at a 320px viewport
- WHEN the header and composer adapt to the available card width
- THEN the partner name remains readable and every action and activity choice is visible
- AND Post is reachable by pointer and keyboard without horizontal clipping
