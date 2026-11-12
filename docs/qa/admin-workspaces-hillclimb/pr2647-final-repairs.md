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

## Late material findings

Six new inline findings on `23f2bd454` were assessed together, without reopening
general review or optional cleanup. All six were confirmed:

- Dashboard candidates no longer exclude raw pending/failed payments before
  applied corrections are folded. Settled amounts, currency membership and
  record counts now share the same effective-status predicate. The old tests
  retaining failed records in a count labelled settled were corrected.
- Dashboard date selection and month buckets use canonical `gift_date`, with
  `created_at` only for legacy missing dates. Imported records can therefore
  fall into their true gift month, independent of insertion time. Tenant and
  complete paging guards remain. The focused suite passes 48 tests.
- Donor recurring rows use their own known currency and canonical minor units.
  Mixed/unknown active currencies do not produce a fabricated combined total.
  Biweekly giving uses 26 annual periods; integer math rounds once at the final
  monthly minor unit. The affected page suite passes 17 tests.
- Support ownership matches `support_agents.user_id` first. Only genuinely
  unlinked legacy rows may use email fallback; text IDs and stale email on a
  row linked to someone else cannot confer ownership. Two focused suites pass
  31 tests; the helper also passed the 82-test related support selection.
- The new Web Studio revert action is withheld. Its browser GET followed by an
  unconditional full-document PATCH could replay stale published content over
  a same-user publication or autosave. Payload locks do not fence same-user
  sessions. The unsafe network path is removed, and the action honestly shows
  unavailable when applicable. Seven tests prove it cannot dispatch a write
  and preserve document/permission visibility guards. This is not a claim
  that atomic CMS revert or the broader D12 editor-lease contract is delivered.

The combined five-suite selection passes 103 tests. Regressions were observed
failing before the corresponding repairs; no required gate or assertion was
disabled to preserve a success claim. Historical revert-success evidence is
superseded by the explicit withheld-action decision.

## Concurrent branch integration

The remote branch subsequently published `a17adb1bc` and `09066d388`. Their
wallet/chart currency fixtures and current About-footer assertions are preserved.
The overlapping recurring-gift fix is reconciled with both sets of regressions:
integer BigInt annual math, invalid-schedule guards and honest unavailable
feedback remain, with the remote currency/biweekly cases retained. All 20 page
tests pass after this conflict resolution. No force push discards either line
of work; final CI must validate the combined revision.

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
