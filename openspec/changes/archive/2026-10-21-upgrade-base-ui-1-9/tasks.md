## 1. Release compatibility

- [x] 1.1 Verify the published 1.9.0 release and package metadata; audit direct dependencies and release-sensitive `actionsRef`/highlight handlers.
- [x] 1.2 Pin all direct first-party consumers to exact 1.9.0; update and inspect the Bun lockfile for unrelated drift.

## 2. Shared filtering behavior

- [x] 2.1 Add failing tests for the shared filtering composition and real Email Studio merge-tag matching, insertion, keyboard, clear, close/reset, disabled, and empty behavior.
- [x] 2.2 Add shared FilterProvider, Input, List, Clear, and Empty dropdown-menu parts with Maia semantic styles and highlight-state support.
- [x] 2.3 Adopt the shared filtering composition in EmailStudioMergeTagMenu using controlled query and `filter={null}`; preserve key/label/category matching and `onInsert(key)`.
- [x] 2.4 Pass the focused tests and review public props, refs, state callbacks, accessible naming/grouping, and existing ordinary-menu compatibility.

## 3. Verification and evidence

- [x] 3.1 Run relevant existing Base UI regressions, affected UI/app typechecks and lint, formatting, frozen installation, and lock-drift verification.
- [x] 3.2 Verify the real merge-tag menu's keyboard, highlight, reset, empty, and focus-restoration behavior in the browser; prove disabled behavior through real primitive tests and run applicable existing Base UI browser checks.
- [x] 3.3 Run applicable repository preflight, strict OpenSpec validation, and active-delta verification; resolve failures caused by this change.
- [x] 3.4 Record release/API evidence, commands/results, remaining external verification limits, and rollback scope; review the final diff and leave the change active until merged.
