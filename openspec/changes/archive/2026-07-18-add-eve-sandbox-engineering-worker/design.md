# Design: Eve sandbox engineering worker

## Status

Accepted for implementation by issue #429. Canonical decision: ADR-0030.

## Runtime placement

The sandbox is authored in the isolated Eve runtime package and uses Eve's
availability-aware backend selection. Each durable session gets its own
writable `/workspace`; the reusable template contains a sanitized public Core
checkout at `/workspace/repo`. No host filesystem path or environment value is
mounted into the sandbox.

## Network control

All concrete backends start with `deny-all`. The trusted runtime reads the
persisted governance snapshot and may set `allow-all` only when release is
enabled, policy is ready, emergency-off is clear, and the all-automation,
active-run, and sandbox-networking switches are clear. Missing state, read
failure, or audit failure keeps or restores deny-all. Shell execution repeats
the check so a later kill-switch mutation is enforced.

Template provisioning temporarily opens egress only inside the credential-free
sandbox to clone the public Core repository. It removes `.env*` files and
creates a local sanitization commit before the reusable template is captured.

## Filesystem policy

Read, glob, and grep use Eve's sandbox defaults. Core wraps bash and write-file
while retaining Eve's schemas and read-before-write behavior. Sensitive paths
or content are denied before execution. Protected paths map to the ADR-0018
categories and return `user-approval`, using Eve's durable pause/resume
protocol. Commands are scanned as a second enforcement point.

## Audit

The trusted runtime emits ADR-0020 records for network-policy changes,
commands, potential egress, and writes. Command text is represented by a stable
SHA-256 fingerprint plus bounded findings. An effect cannot begin if its start
record cannot be written.

## Boundaries

This change owns containment only. Governance state remains #418/#420, the
audit record remains #419, model routing remains #421, approval and budgets
remain #423, and runtime isolation remains #425. GitHub review, credentials,
pushes, and PR operations remain #430/#431.
