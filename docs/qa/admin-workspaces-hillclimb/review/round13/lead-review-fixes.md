# Lead follow-up fixes

These changes address findings from the completed focused round 13 reviews
and the historical round 12 GPT reviews. They do not establish visual scores.

## Fixed with regression coverage

- Copied giving summaries retain the capped-result or unknown-completeness
  warning. The complete report's existing summary text is unchanged.
- Private care notes use the existing safe plain-text conversion for legacy
  HTML; TipTap retains its viewer and literal angle-bracket text remains
  literal. Coverage includes entities, paragraph breaks and stripped script
  text without claiming a full renderer or sanitization audit.
- Staff directory advice identifies Web Studio editors as synced accounts
  for review. Access changes are directed to the platform administrator or
  Mission Control provider, preserving read-only identity ownership.
- Successful zero-activity Support report buckets remain exportable. Error
  and loading export guards remain covered by the existing tests.
- Inbox signature, SLA and business-hours pickers show the shared loading
  and retry states. Failed lists do not appear as valid empty choices, and
  retrying does not discard unrelated draft edits.
- Titled moderation posts retain separate author attribution.
- The admin-only Support setup destination uses a semantic Next Link with
  the shared button presentation, removing the native-button/anchor
  contract mismatch reported by the integration validator. Its existing
  permission, destination and dismissal tests pass without the warning.

All new regressions failed for the expected behavior before their fix.
The first moderation assertion mistakenly targeted the body of an untitled
post; it was corrected to create a titled post and independently failed on
the missing author before the implementation changed.

## Verification

- Six focused suites: 100 tests passed.
- Reports' full 33-test suite passed again after adding the nullable-limit
  case to the existing new regression; Support setup's three tests passed.
- Prettier: all six source and six test files formatted.
- Focused source lint: exit 0.
- Admin typecheck: exit 0 after correcting a nullable donation-limit case.
  That case first failed with the expected null dereference; a capped
  report without a numeric bound now carries a general incompleteness
  warning. Live browser verification remains outstanding; no browser result
  is implied by the component tests.

## Review reconciliation

- PDF duplicate-notice, toolbar Open template and Automations wording
  findings describe an earlier concurrent snapshot. The Tools builder's
  final report records those fixes and 15 suites / 118 tests passing;
  compare the final source and capture it before calling them verified live.
- Recent Care activity HTML and urgent mobile names were already fixed by
  the People builder. Private-note HTML was a separate remaining reader and
  is fixed above.
- Web Studio's newer-draft live link and real Account route verification
  remain outstanding; resolving a live address must use the published slug,
  rather than the newer draft's slug.
- Home giving still needs canonical correction handling in the read model.
  A dedicated Sol Max implementation task owns that work.
- Contributions' denser card layout needs a shared DataGridPanel option;
  builders correctly left shared ownership to integration.
