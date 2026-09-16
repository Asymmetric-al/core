## 1. Authority and contract

- [x] 1.1 Reproduce the inherited merge rejection and verify live commit,
      signature, PR, ordered-parent, and branch-protection evidence; distinguish
      open PR #1428 from shipped policy.
- [x] 1.2 Record the limited hosted-merge contract, ordinary-identity boundary,
      missing-proof behavior, and rollback without adopting the wider proposal.

## 2. Implementation and regression proof

- [x] 2.1 Add failing focused tests for accepted hosted proof, wrong signature
      or immutable actor ID, mismatched SHA/raw identity/parents, absent or wrong
      merged PR, wrong destination/protection, forbidden identities, and local
      alias rejection.
- [x] 2.2 Implement the bounded canonical GitHub proof path; preserve ordinary
      checks, hooks, preflight order, identities, and history.
- [x] 2.3 Pass focused unit and CLI tests, including unavailable or malformed
      online proof and compact metadata collection for large commits.
- [x] 2.4 Align attribution and CI documentation with the implemented exception.

## 3. Acceptance

- [x] 3.1 Pass strict OpenSpec validation, applicable format/lint checks, and
      independent review of the proof boundary.
- [x] 3.2 Pass real `bun run verify:git-attribution` on the inherited merge
      without skip flags or identity changes.
- [x] 3.3 Pass complete `bun run ci:preflight`; update the design-system lint
      verification record and handoff only after the full command succeeds.
- [x] 3.4 Confirm the diff contains no Git identity/history, hooks, branch
      protection, credentials, database, deployment, or publication changes;
      leave both OpenSpec changes active and record rollback evidence.

## Verification evidence

On 2026-09-16, the focused attribution and preflight suites passed 71 tests
(57 hosted-merge tests, 11 existing attribution tests, and 3 preflight contract
tests). The hosted success test first reproduced the existing identity
rejection; collector tests also failed before proof retrieval was implemented.
Adversarial coverage includes every required provider being unavailable or
returning malformed JSON, wrong canonical origin, cross-wired aliases and
accounts, invalid signatures, mismatched ancestry/PR provenance, and preservation
of ordinary online/offline checks. A final failing regression demonstrated that
successful malformed provider JSON must remain an error for ordinary commits.
Additional failing cases exposed non-object metadata responses such as `null`,
`false`, and `0`; metadata endpoints now require non-null, non-array objects.
The collector propagates these errors while preserving warnings for unavailable
ordinary lookups. The focused suite and live attribution gate passed after the
final fix.

Independent review reproduced and resolved the GraphQL scalar mismatch
(`GitObjectID` is required); live verification also exposed and resolved the
installed CLI's incompatible `--slurp`/`--jq` combination by reading projected
paginated PR numbers as JSON lines. Re-review found no further substantive
proof-boundary or documentation mismatch. Focused formatting/lint and strict
OpenSpec validation passed.

The real `bun run verify:git-attribution` passed with no warning on unchanged
HEAD `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. No skip flag, local identity
change, history rewrite, hook change, or publication was used. The diff leaves
branch protection, secrets, product/database behavior, and deployment controls
unchanged. Rollback is limited to reverting this verifier exception, its tests,
and matching documentation together.

Final `bun run ci:preflight` passed with exit 0 in 188.58 seconds after the last
code fix. Its unit stage passed 4,034 tests across 565 files, with 4 tests and
2 files skipped, in 115.10 seconds. The terminal `PASS ci:preflight` marker and
closed result JSON confirm completion. An earlier interrupted run ended with
status -15 and is not acceptance evidence. The final documentation-only updates
received focused formatting, strict OpenSpec, and diff checks. Both changes
remain active; no commit, publication, or archive was performed during that local
acceptance phase. The subsequent user request authorizes PR publication through
[AL-1864](https://github.com/Asymmetric-al/core/issues/1864); the linked PR owns
published-head checks, reviews, and approval evidence.
