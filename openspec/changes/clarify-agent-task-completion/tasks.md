## 1. Instruction contract

- [x] 1.1 Record authorized completion and stopping boundaries in the spec delta.
- [x] 1.2 Align root `AGENTS.md` with the requirement while preserving Core invariants.

## 2. Verification

- [x] 2.1 Strict-validate this change and run focused instruction-routing tests.
- [x] 2.2 Verify formatting, skill-mirror equality, and documentation-only scope.
- [x] 2.3 Compare all three scenarios with the authored instructions and verify
      the proposal's rollback and scope boundaries.

Use deterministic structural verification under the documentation-only TDD
exception. No runtime, migration, or deployment proof is needed. Normal
pre-push and PR gates still apply; delivery and approval status are tracked in
PR #1655. Leave this change active until merged.
