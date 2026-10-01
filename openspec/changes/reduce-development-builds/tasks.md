## 1. Policy and gates

- [x] 1.1 Record approved scope and issue AL-1921.
- [x] 1.2 Prove RED/GREEN for development compilation selection and disabled Git deployments.
- [x] 1.3 Wire conditional CI, fast local preflight, and full production preflight.
- [x] 1.4 Preserve required correctness gates and restrict instant-navigation builds to checkpoints.

## 2. Explicit preview delivery

- [x] 2.1 Build preview output on GitHub and deploy prebuilt output without logging secrets.
- [x] 2.2 Verify exact commit/project/environment targeting and transient output cleanup.

## 3. Verification and rollout

- [x] 3.1 Update matching documentation and contract tests.
- [x] 3.2 Run applicable repository checks and strict OpenSpec validation.
- [ ] 3.3 Create a PR and activate the policy after required checks pass.
- [ ] 3.4 Verify merged configuration and report any hosted QA limitations.

Validation: pinned Bun 1.4.0, UTC, canonical macOS temporary paths; full preflight passed, including all three app builds and 5,426 unit tests (four existing skips). Deployment discipline and Vercel build controls passed against live read-only settings. Preview helper sequence, target guards, and cleanup are covered by deterministic CLI-boundary tests; hosted preview QA is the remaining rollout checkpoint.
