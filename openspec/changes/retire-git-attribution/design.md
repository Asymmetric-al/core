## Decision

GitHub controls repository access. Core does not infer authority from commit
metadata. The format job runs formatting and repository contracts. Eve checks
signed webhook senders before dispatch and rechecks permission before tools.

Human senders need an active Asymmetric-al membership response and a Core
Write+ permission response. App commands need signed event App identity and an
explicit approved App ID. CI check-suite triggers require the GitHub Actions
App identity. API errors fail the command closed without affecting software CI.

The local pre-push hook retains the production push guard. A production PR
source check ensures its head is already reachable from `develop`.

The GitHub collaborators-only interaction limit is temporary. A repository
administrator renews it before expiration until a narrowly scoped independent
administration App credential is approved. The Eve coding credential never
receives that permission.
