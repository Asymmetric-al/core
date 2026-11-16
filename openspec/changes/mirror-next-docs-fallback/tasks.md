## 1. Mirror script

- [x] 1.1 Add fixture tests for check mode, write mode, line endings and a
      missing install.
- [x] 1.2 Add `scripts/sync-next-docs.mjs`.

## 2. Fallback and procedure

- [x] 2.1 Add the repository check that fails on the stale fallback.
- [x] 2.2 Refresh `.next-docs/` from the installed `next@16.4.2` package.
- [x] 2.3 Replace the floating-tag procedure in the protection map and the
      agent playbook.

## 3. Verify

- [x] 3.1 Unit and structural checks pass on Linux.
- [ ] 3.2 The pre-push `bun run ci:preflight` and pull-request CI pass.
