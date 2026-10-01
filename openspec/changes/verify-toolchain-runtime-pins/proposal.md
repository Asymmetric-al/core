# Verify each Bun setup step and live app runtime

## Why

PR #1338's two remaining review findings reproduce on its current head. A
comment can hide a wrong Actions setup pin, and live Vercel runtime drift can
be reported ready despite the accepted Node 24 policy.

## What Changes

- Parse actual workflow YAML and check each setup step's own input and scoped
  environment, including before dependency installation.
- Require Node 24 and no configured Bun runtime in live project settings.
- Add positive and negative regression coverage at the exported verifier seam.

## Impact

- New capability: `toolchain-verification`.
- Affects two read-only verification scripts, their tests and CI documentation.
- Keeps the candidate's Bun 1.4.0 package-manager pin, Node runtime contract,
  dependency graph and deployment settings unchanged.
- Rollback restores the previous verifiers and their known false acceptances;
  it does not roll back a runtime or deployment.
