## Why

Root `AGENTS.md` now makes completion within authorized scope explicit, but
OpenSpec does not yet record that durable workflow. AL-1654 keeps both layers
aligned so later instruction changes preserve completion and stopping boundaries.

## What Changes

- Record the requested-outcome, verification, and authorization boundaries in
  the `agent-instruction-system` capability.
- Keep the small `AGENTS.md` clarifications for relevant context, skill loading,
  proportional checks, and completion.
- Preserve required gates and explicit planning or review boundaries.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-instruction-system`: complete authorized work to the requested boundary.

## Impact

Only root `AGENTS.md` and this supporting OpenSpec change are affected.
Product runtime, dependencies, data ownership, security controls, migrations,
and deployment behavior are out of scope. The existing progressive-disclosure
contract remains in `slim-codex-agent-router`; this delta adds completion only.

Validate with focused instruction tests, strict OpenSpec validation, and the
required repository gates. Rollback is reverting the instruction change and
its supporting spec delta together. Leave this change active until merged.
