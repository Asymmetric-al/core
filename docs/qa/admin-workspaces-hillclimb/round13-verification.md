### Candidate under verification

- Working tree: `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`,
  branch `t3/admin-ux-round12`. All seven area builders and the three
  follow-up implementation delegates have returned.
- Frozen comparison baseline: round 12 in the parent `t3-5a24111d` tree.
  Its product source remains unchanged. The four corrected historical
  CRM/Contributions review tasks were cancelled and returned no scores.
- Round 13 checkpoint artifacts are produced by `freeze-checkpoint.mjs`.
  Product source, fixtures, captures, unit results and reviewer scores are
  distinct evidence; none implies the others were verified.
- The candidate runs on port **3031**. Port 3030 is occupied and is not
  used as evidence of this candidate. Runtime authentication uses the
  existing explicit admin test-surface setting and example Supabase
  datasource. The privileged Supabase key is unset. Payload uses the
  existing scratch Postgres CMS schema on localhost:54322, with schema
  push disabled; no bootstrap, migration or reset was performed.

### Implemented changes

Home cards, task promises, unavailable figures, Staff directory access and
advice, Reports URL state and layout, CRM summaries/dialogs/toolbar,
Contributions dialogs/cards/filter disclosure, Care content/dates/phone
identity, Tools notices/read-only moderation, Support workflows/settings
and Web Studio layouts/account/preview publication have been revised.
Detailed ownership and commands are in `review/round13/`.

Financial corrections are included in Home monthly totals and its giving
trend using the canonical effective-value contract. Recorded refunds stay
independent of corrected gift amounts in Contributions totals. Copied
giving summaries retain capped/unknown-completeness warnings, including
an incomplete response without a numeric donation bound.

Web Studio's published action resolves the persisted published address,
including when the editable draft changes its slug. Account renders
Payload's real form and preferences inside Studio chrome. Its layout
avoids nested main landmarks while ordinary Studio pages keep their main.

### Recorded verification

- Each area builder reports its focused tests, source lint, formatting and
  applicable typechecks passing; see `review/round13/builders/` and the
  original Shell/CRM/Studio handoffs.
- Lead refund fix: 2 suites / 22 tests passed, source lint and admin tsc.
- Lead follow-up behavior fixes: 6 suites / 100 tests passed. Reports'
  33-test suite passed again with the nullable-limit case. Support setup's
  3 tests and Account's 4 tests passed. Scoped source lint and formatting
  passed, and the combined admin typecheck passed after the Account fix.
- Financial dashboard worker: 9 suites / 116 tests; final focused 2 suites
  / 34 tests; API/admin tsc and scoped lint/format passed.
- Shared card worker: 12 suites / 147 tests, UI/admin tsc, scoped lint and
  formatting passed. Defaults remain unchanged; Contributions opts in.
- Published-address worker: 6 suites / 85 tests, source lint/format and
  admin tsc passed. The lead documented the new test's app-boundary imports
  with scoped annotations; its test-file lint now passes too.
- Independent integration validator: 33 files / 469 tests passed across
  eight bounded sequential batches. These overlap the tests above and
  were executed over a concurrent source window, not a frozen final tree.
- Mandatory candidate fixture preflight: type proof and 1,645 checks pass;
  verified bundle SHA-256 is
  `afed848ea1dc100a2818ff77f3530987d5f8784fa324bfb3d72acda7443ad48b`.
  Each new capture/check run performs its own mandatory gate and stores
  its own proof. Earlier proofs do not certify later source revisions.

### Initial live Account evidence

`candidate-13-preflight/` contains Account captures at 1440, 1024, 640 and 390. Desktop and phone checks: axe 0, no page overflow, no route-error
headings. The real Account route renders email/sign-in/organization/role
fields plus language and contrast preferences without an error boundary.
Live DOM inspection after hydration found one visible Account h1 and one
visible main with no main ancestor. The capture's raw h1 inventory also
includes Payload's CSS-hidden document heading; it does not mean two
visible page titles. Some contrast checks remain automated-incomplete.

### Remaining acceptance

- Complete the full state capture/check inventory and inspect all four
  widths, keyboard/focus, zoom, loaded/error states and long content.
- Verify receipt initial scroll/focus and eligible fund-correction form.
- Verify actual Reports reload/back/forward and nondefault grouping/period.
- Obtain loaded giving-trend browser evidence. The current placeholder
  Supabase setup shows an unavailable server-loaded read; unit tests do
  not establish its rendered loaded state or live tenant integration.
- Verify published page to newer draft/changed slug and successor
  publication using the installed form and local scratch data.
- Requalify React Doctor against current source and exact evidence, without
  waiving real findings or treating a stale ledger as acceptance.
- Obtain independent reviews of the completed new candidate. No final
  score, 9.5 acceptance, WCAG-conformance or deployment approval is claimed.
