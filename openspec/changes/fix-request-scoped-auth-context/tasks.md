# Auth context correction tasks

## 1. Regression and correction

- [x] 1.1 Reproduce the administrative-profile dependency with failing request-context tests.
- [x] 1.2 Use the validated request client and caller-only membership RPC; preserve subroles and fail closed.
- [x] 1.3 Verify cookie, bearer, tenant, error and existing demo-session regressions.

## 2. Acceptance evidence

- [x] 2.1 Run focused auth lint/type checks, full unit tests and applicable repository preflight.
- [x] 2.2 Verify the separately identified candidate with actual isolated Auth/CMS and browser evidence.
- [x] 2.3 Record scope/identity-and-access review and retain rollback and failed baseline evidence.
- [x] 2.4 Validate OpenSpec and submit the isolated candidate in PR #1560.
- [ ] 2.5 Obtain required human review and merge; leave the change active until accepted.
