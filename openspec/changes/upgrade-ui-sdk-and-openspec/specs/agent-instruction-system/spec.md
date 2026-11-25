## MODIFIED Requirements

### Requirement: OpenSpec Workflows Are The Seven Selected Skills

Core SHALL support the `openspec` router and the seven selected workflow skills
(Explore, Propose, Update, Apply, Verify, Sync, and Archive) canonically under
`docs/ai/skills/`. The router and its references SHALL use `bun run openspec --`
and uphold Core's local-only, existing-change, and merge-before-archive rules.
Core MUST NOT enable or promote New, Continue, Fast-forward, Bulk archive,
Onboard, Stores, or custom OpenSpec schemas.

#### Scenario: An agent starts non-trivial OpenSpec work

- WHEN requirements are unclear
- THEN it uses Explore
- AND when intent is clear it uses Propose with an explicit change ID

#### Scenario: An agent receives a general OpenSpec request without a named workflow

- WHEN a user asks where OpenSpec work stands, asks how OpenSpec works in Core,
  or requests OpenSpec work without naming a specific workflow skill
- THEN the `openspec` router skill handles discovery, read-only status, or
  routing to one of Core's seven selected workflow skills
- AND it uses `bun run openspec --` against the local checkout
- AND it resumes existing changes without recreating them
- AND it does not recommend `openspec init`, `openspec update`, or `openspec config profile`

#### Scenario: A rejected workflow is requested

- WHEN an agent is tempted to use Stores, a custom schema, or generated native
  OpenSpec Cursor/Claude commands
- THEN it does not add them
- AND it keeps Core numbered commands as the wrappers around the seven skills
- AND when a user asks for an uncurated OpenSpec workflow skill, the router
  reports that Core does not enable it and does not recommend installing it
  with `openspec config profile` or `openspec update`
