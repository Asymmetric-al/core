## 1. Reproduce current defects

- [x] 1.1 Inspect exact-head review threads and current caller paths.
- [x] 1.2 Reproduce deferred payment divergence, repeated confirmation, stale feed results, and gift-date rollover.
- [x] 1.3 Add meaningful failing regressions at helper, hook, and actual-component seams.

## 2. Repair the contracts

- [x] 2.1 Carry attempt identity in checkout state and keep transitions pure.
- [x] 2.2 Synchronize completion refs after commit and lock repeated confirmation before render.
- [x] 2.3 Separate mounted Stripe-key layout synchronization from checkout state.
- [x] 2.4 Sequence published-feed results and invalidate them on unmount.
- [x] 2.5 Preserve gift calendar dates through the shared formatter.

## 3. Verify and integrate

- [x] 3.1 Demonstrate red-to-green coverage for each reproduced defect.
- [x] 3.2 Run combined focused tests, affected lint/typechecks, formatting, and strict OpenSpec validation.
- [ ] 3.3 Complete independent review, required full preflight, and applicable browser/CI gates on the final candidate.
- [ ] 3.4 Publish, reconcile review threads, and integrate against the current develop branch.

These repairs are prepared against develop `6796c078a87cdf2ae70a9c6ca2e89811a8729193`.
Full preflight and publication remain with the integration coordinator; prior
green heads and retired attribution checks are not acceptance evidence.
