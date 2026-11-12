# PR 2647 final focused repairs

Date: November 12, 2026. Destination: `develop`, not production.

## Currency precision

The final independent standards review reproduced an admin financial-display
defect: Home and the Home/Reports giving chart divided every currency by 100.
Four new JPY/KWD cases failed against the published implementation: 10,000 JPY
minor units displayed as 100 yen, while 1,230 KWD displayed as 12.300 dinars.

Both consumers now use the canonical `@asym/api/money` formatter. Chart values
use its currency exponent, independently of compact axis presentation. The
regressions check exact rendered labels for both consumers and numeric values
passed to the chart. The two affected suites pass all 64 tests.

## Hosted-smoke integration

The admin profile shortcut is named `Staff directory` by the existing navigation
contract. The hosted smoke locator now uses that name without changing its
destination, error assertions, or other navigation checks. The existing smoke
harness executes the actual spec and rejects an incorrect destination.

The remote branch independently acquired `23f2bd454294925575fffe72229c9fa80532997e`,
which removes reads/writes of the nonexistent task-generation column. Inspection
finds no production generator; the compatibility response flag remains false.
Its schema/snapshot regression passes. The unpublished alternative additive
migration at `c79c714eee2c3c78ad3ecd234b94439bcd23a90b` is preserved locally but
is not included: adding an unused column after removing its consumers would be
unnecessary. Only its disjoint smoke repair is retained.

## Source integration versus deployment

The autosave source fix serializes writes per post across composer mounts and
includes atomic draft/revision SQL preconditions, conflict responses, and
regressions. The migration and transactional SQL proof are part of this PR.
Merging source into `develop` neither deploys the apps nor activates a hosted
database migration. Cross-session hosted protection remains a release
prerequisite; it is not claimed by the source-review disposition.

Strict React Doctor remains unqualified, as documented in the earlier integration
record. It is not a required GitHub context or a stage of `ci:preflight`; no
ledger was blanket-rehashed, gate weakened, or diagnostic relabelled as a pass.
Optional diagnostic counts alone do not establish an additional product defect.
Final required checks and hosted-preview results are recorded against the
published revision in the PR, separately from historical evidence.
