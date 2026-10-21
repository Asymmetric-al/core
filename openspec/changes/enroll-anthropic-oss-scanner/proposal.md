## Why

Core needs a reproducible, credential-free audit environment and a truthful
application to Anthropic OSS Scanner. A local build or submitted PR must remain
distinct from program acceptance and a confirmed scan. Tracks AL-2177.

## What Changes

- Keep the complete source and three application builds in an offline audit image.
- Provide explicit local PostgreSQL, authorization, unit, and demonstration commands.
- Publish the owner-designated recipient and private triage/maintenance runbook.
- Validate the final public maintained branch with the unmodified upstream tools.

## Capabilities

### New Capabilities

- `security-audit-enrollment`: Isolated scanner preparation, honest coverage and enrollment evidence.

### Modified Capabilities

None. Existing product authorization, financial, publication, and Eve governance
boundaries remain authoritative.

## Impact

Adds `.oss-scanner/` and maintenance documentation. No deployment, hosted migration,
production credentials, visibility/license change, or live provider effects.
Anthropic decides eligibility and scheduling. Human CLA acknowledgment stays human.

## Rollback

Pause through the upstream `disabled: true` field or withdraw the project directory;
remove Core's isolated helpers through a normal reviewed PR if no longer needed.
