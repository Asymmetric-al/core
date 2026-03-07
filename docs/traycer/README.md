# Traycer Workflow Notes

Traycer artifacts are useful in this repository, but they are **supporting material**, not the canonical spec store.

## Canonical rule

- **Canonical current-state truth** lives in `openspec/specs/*`
- **Canonical in-flight change work** lives in `openspec/changes/*`
- **Traycer artifacts** support planning, implementation, and verification

## What belongs here

Keep curated Traycer material in `docs/traycer/` only when it helps future contributors, for example:

- a useful planning brief
- a concise execution run log
- a verification note that explains why a decision was made

Do **not** treat raw Traycer output as a substitute for updating OpenSpec.

## Three-way sorting rule

### 1. Durable current truth

If a Traycer artifact reveals or clarifies behavior that should be authoritative going forward:

- summarize it in `openspec/specs/*`

### 2. Active implementation work

If a Traycer artifact describes a live change that is still in progress:

- convert it into `openspec/changes/<change-name>/`
- use `proposal.md`, `design.md`, `tasks.md`, and delta specs as appropriate

### 3. Supporting reference

If a Traycer artifact is still worth keeping, but should not drive behavior on its own:

- keep a curated copy in `docs/traycer/`

## Raw `.traycer/` directory

The raw `.traycer/` directory is not a canonical source of truth. It may contain transient local artifacts, exports, or machine-oriented output.

If something in raw Traycer output matters:

1. distill the durable outcome into OpenSpec
2. optionally preserve a cleaned reference note in `docs/traycer/`

## Suggested naming

Use concise, reviewable filenames such as:

- `2026-03-07-openspec-setup-plan.md`
- `2026-03-07-auth-refactor-verification.md`
- `2026-03-07-donor-checkout-runlog.md`

## Minimal checklist

- [ ] Durable truth moved into `openspec/specs/*` when applicable
- [ ] Active work moved into `openspec/changes/*` when applicable
- [ ] Only curated reference artifacts kept in `docs/traycer/`
- [ ] Raw Traycer output not treated as canonical
