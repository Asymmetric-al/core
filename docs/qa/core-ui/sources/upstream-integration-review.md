# Upstream integration and evidence epoch

Core's integration branch advanced from the original `f49fc2e0` baseline to
`180dde9e4` while this UI work was underway. Root rebased the three source
commits onto that base; the application source epoch is now `0cc25be9c`.
Next 16.4 is inherited from newer develop. This UI task did not select a new
framework or primitive version.

[Exact source identities](./upstream-integration-review.json) preserve the
original baseline hashes and separately record the seven composed admin
overlaps. [Independent preservation review](./cross-review-rebase-preservation.md)
confirms upstream selection/query/cache, draft/version reset, clock/SSR and
debounce behavior remains alongside the UI changes. Contributions and Email
pages plus seven upstream regression files retain exact upstream bytes.
The mobile table and commercial Pro modules retain their captured source bytes.
[Guard review](./pr-rebase-guard-review.json) is attributed separately.

All before/current screenshots and browser interactions retain their actual
Next 16.3.8 pre-integration scope, with the final UI captures at `5319246eb`.
Current source hashes, independent diff review and later CI do not retroactively
validate those pixels against Next 16.4. Root's final verification record owns
post-integration checks and any additional runtime qualification.
