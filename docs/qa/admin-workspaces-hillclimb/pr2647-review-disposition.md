# PR 2647 review disposition

Date: November 12, 2026. Combined admin and donor/missionary candidate. The current instruction authorizes protected integration into `develop`, not hosted migration activation or a production release.

## Inline review comments

All 31 review threads and their replies were read, including six late material findings. The initial 25-thread inventory and its counts below are historical; the late dispositions are appended here. Resolved status is not inferred from an outdated diff. Postal containment is verified structurally rather than attributed to unrelated test suites.

### 1. History month/year

- Thread: `PRRT_kwDOQ4BXFs62E3J8`; comment IDs: 4535350371, 4547865676.
- Disposition: Fix retained.
- Source: `apps/donor/app/(dashboard)/donor-dashboard/history/page-content.tsx:141`.
- Evidence: tests/unit/apps/donor/history-date-only-gifts.test.ts.
- Rationale: Local-calendar grouping/sorting, including January 1 and first-of-month west of UTC.
- Observed GitHub state before current publication: resolved.

### 2. Preference click order

- Thread: `PRRT_kwDOQ4BXFs62E3KB`; comment IDs: 4535350384, 4547870615.
- Disposition: Fix retained.
- Source: `apps/donor/app/(dashboard)/donor-dashboard/settings/page-client.tsx:417`.
- Evidence: tests/unit/apps/donor/settings-email-privacy-race.test.tsx.
- Rationale: Per-key promise queues and generation checks prevent stale completion from clearing the latest value.
- Observed GitHub state before current publication: resolved.

### 3. Weekly spread copy

- Thread: `PRRT_kwDOQ4BXFs62E3KH`; comment IDs: 4535350400, 4547871176.
- Disposition: Fix retained.
- Source: `apps/donor/app/(dashboard)/donor-dashboard/pledges/page-client.tsx:205`.
- Evidence: tests/unit/apps/donor/recurring-gifts-page.test.tsx.
- Rationale: The spread explanation requires a period longer than one month.
- Observed GitHub state before current publication: resolved.

### 4. Anonymous metrics identifiers

- Thread: `PRRT_kwDOQ4BXFs62E5nJ`; comment IDs: 4535367081, 4547871729.
- Disposition: Fix retained.
- Source: `packages/api/src/missionaries/metrics.ts:96`.
- Evidence: tests/unit/packages/api/missionary-metrics-redaction.test.ts.
- Rationale: Preference projection fails closed before serialization.
- Observed GitHub state before current publication: resolved.

### 5. Exact money labels

- Thread: `PRRT_kwDOQ4BXFs62E57f`; comment IDs: 4535369201, 4547872227.
- Disposition: Fix retained.
- Source: `packages/missionary/components/money-units.ts:61`.
- Evidence: tests/unit/apps/donor/wallet-page.test.tsx.
- Rationale: Canonical currency exponent formatting; invalid/unknown values unavailable.
- Observed GitHub state before current publication: resolved.

### 6. Seed date clock

- Thread: `PRRT_kwDOQ4BXFs62E57h`; comment IDs: 4535369205, 4547872739.
- Disposition: Fix retained.
- Source: `supabase/seed.sql`.
- Evidence: Structural seed verification.
- Rationale: Fixed 2026-11-11 anchor replaces current_date; no hosted reseed claim.
- Observed GitHub state before current publication: resolved.

### 7. QA provenance

- Thread: `PRRT_kwDOQ4BXFs62E57j`; comment IDs: 4535369208, 4547873276, 4550603118.
- Disposition: Documentation fix published; reply 4550603118 confirms the published import anchor.
- Source: `docs/qa/donor-missionary-hillclimb/README.md:7`.
- Evidence: git cat-file / git show on import 8ec86d8fa8db1ea7de3cf277ae36d965d37976e8.
- Rationale: Portable published import is distinguished from the historical E13 tree and later acceptance.
- Observed GitHub state before current publication: resolved.

### 8. History and overview date-only totals

- Thread: `PRRT_kwDOQ4BXFs62E7n9`; comment IDs: 4535380447, 4547873604.
- Disposition: Fix retained.
- Source: `apps/donor/features/donor/components/overview/overview-model.ts:160`.
- Evidence: tests/unit/apps/donor/history-date-only-gifts.test.ts.
- Rationale: Shared local-calendar repair covers overview YTD as well as History.
- Observed GitHub state before current publication: resolved.

### 9. Comparison-history ownership

- Thread: `PRRT_kwDOQ4BXFs62E8GI`; comment IDs: 4535383555, 4547874083.
- Disposition: Fix retained.
- Source: `packages/lib/hooks/use-donation-metrics.ts:56`.
- Evidence: tests/unit/packages/lib/use-donation-metrics.test.tsx.
- Rationale: Hook owns the 25-month default; 13-month chart remains a slice; explicit partial comparisons stay unavailable.
- Observed GitHub state before current publication: resolved.

### 10. Wallet currency exponent

- Thread: `PRRT_kwDOQ4BXFs62E8GO`; comment IDs: 4535383564, 4547874545.
- Disposition: Fix retained.
- Source: `apps/donor/app/(dashboard)/donor-dashboard/wallet/page-client.tsx:56`.
- Evidence: tests/unit/apps/donor/wallet-page.test.tsx.
- Rationale: formatMoney receives currency; JPY/KWD and safe-integer boundaries covered.
- Observed GitHub state before current publication: resolved.

### 11. Qualified postal owner

- Thread: `PRRT_kwDOQ4BXFs62FBgW`; comment IDs: 4535419654, 4547875044.
- Disposition: Safe containment retained.
- Source: `packages/api/src/donor-portal/settings-patch.ts:3`.
- Evidence: verify-review-containment.ts: PASS (supported profile fields accepted, postal command rejected, no address emitted).
- Rationale: No mailing editor or raw address write; strict schema rejects unsupported postal commands.
- Observed GitHub state before current publication: resolved.

### 12. Duplicate date-only finding

- Thread: `PRRT_kwDOQ4BXFs62FBgm`; comment IDs: 4535419676, 4547875519.
- Disposition: Fix retained.
- Source: `apps/donor/app/(dashboard)/donor-dashboard/history/page-content.tsx:468`.
- Evidence: tests/unit/apps/donor/history-date-only-gifts.test.ts.
- Rationale: Same calendar-date repair, not closure merely because the diff became outdated.
- Observed GitHub state before current publication: resolved.

### 13. Partial legacy address coupling

- Thread: `PRRT_kwDOQ4BXFs62FBgs`; comment IDs: 4535419685, 4547876021.
- Disposition: Safe containment retained.
- Source: `packages/api/src/donor-portal/settings-patch.ts:95`.
- Evidence: verify-review-containment.ts: PASS (supported profile fields accepted, postal command rejected, no address emitted).
- Rationale: Profile patches no longer resubmit address data.
- Observed GitHub state before current publication: resolved.

### 14. International postal shapes

- Thread: `PRRT_kwDOQ4BXFs62FBg1`; comment IDs: 4535419696, 4547876478.
- Disposition: Safe containment retained.
- Source: `packages/api/src/donor-portal/settings-patch.ts:19`.
- Evidence: verify-review-containment.ts: PASS (supported profile fields accepted, postal command rejected, no address emitted).
- Rationale: Unsupported all-countries address editor/validator removed rather than claiming a qualified workflow.
- Observed GitHub state before current publication: resolved.

### 15. Pledge truncation

- Thread: `PRRT_kwDOQ4BXFs62FBg7`; comment IDs: 4535419703, 4547877014.
- Disposition: Fix retained.
- Source: `packages/api/src/missionary-portal/service.ts:263`.
- Evidence: tests/unit/packages/api/missionary-portal/snapshot-pledge-scope.test.ts.
- Rationale: Primary-key paging continues until a short page; tenant/missionary/status scope retained.
- Observed GitHub state before current publication: resolved.

### 16. Weekly/biweekly commitments

- Thread: `PRRT_kwDOQ4BXFs62FBhB`; comment IDs: 4535419710, 4547877607.
- Disposition: Fix retained.
- Source: `packages/api/src/missionary-portal/model.ts:364`.
- Evidence: tests/unit/packages/api/missionary-portal/model.test.ts.
- Rationale: 52/26 annual periods; sum annual minor units before monthly rounding.
- Observed GitHub state before current publication: resolved.

### 17. SPA draft loss

- Thread: `PRRT_kwDOQ4BXFs62FBhF`; comment IDs: 4535419717, 4547878110.
- Disposition: Fix retained with limits.
- Source: `packages/ui/hooks/retained-draft.tsx:254`.
- Evidence: tests/unit/packages/ui/retained-draft.test.tsx.
- Rationale: Owner/session-scoped retention and eviction above routes. No claim of new popstate interception or identical leave/stay prompts.
- Observed GitHub state before current publication: resolved.

### 18. Duplicate anonymous IDs

- Thread: `PRRT_kwDOQ4BXFs62FBhJ`; comment IDs: 4535419723, 4547878619.
- Disposition: Fix retained.
- Source: `packages/api/src/missionaries/metrics.ts:354`.
- Evidence: tests/unit/packages/api/missionary-metrics-redaction.test.ts.
- Rationale: Same fail-closed recipient projection.
- Observed GitHub state before current publication: resolved.

### 19. Later-page feed failures

- Thread: `PRRT_kwDOQ4BXFs62FBhM`; comment IDs: 4535419731, 4547879144.
- Disposition: Fix retained.
- Source: `apps/donor/app/(dashboard)/donor-dashboard/feed/page-client.tsx:418`.
- Evidence: tests/unit/packages/database/donor-feed-post-pages.test.tsx.
- Rationale: Transient failures retain loaded posts and retry; access denial hides them.
- Observed GitHub state before current publication: resolved.

### 20. Rich-text hero preview

- Thread: `PRRT_kwDOQ4BXFs62FBhR`; comment IDs: 4535419737, 4547879617.
- Disposition: Fix retained.
- Source: `apps/donor/features/donor/components/featured-update-hero.tsx:91`.
- Evidence: tests/unit/apps/donor/featured-update-hero.test.tsx.
- Rationale: postPlainText/postTitle project composer documents rather than showing JSON.
- Observed GitHub state before current publication: resolved.

### 21. Unconfirmed recurring associations

- Thread: `PRRT_kwDOQ4BXFs62FBhV`; comment IDs: 4535419744, 4547880049.
- Disposition: Copy fix retained.
- Source: `apps/donor/app/(dashboard)/donor-dashboard/wallet/page-client.tsx:127`.
- Evidence: tests/unit/packages/api/donor-portal/wallet.test.ts.
- Rationale: Recorded recurring gifts / Recurring use not confirmed; no live provider reconciliation claim.
- Observed GitHub state before current publication: resolved.

### 22. Gift-date analytics

- Thread: `PRRT_kwDOQ4BXFs62FBhX`; comment IDs: 4535419749, 4547880585.
- Disposition: Fix retained with query-window limit.
- Source: `packages/lib/hooks/use-donation-metrics.ts:90`.
- Evidence: tests/unit/packages/lib/use-donation-metrics.test.tsx.
- Rationale: Series prefer gift_date; created_at fallback remains. Transport query still bounded by created_at.
- Observed GitHub state before current publication: resolved.

### 23. Autosave versus publication

- Thread: `PRRT_kwDOQ4BXFs62FBhn`; comment IDs: 4535419777, 4547881121, 4550798678.
- Disposition: Source fix retained; source conversation eligible for resolution after publication. Hosted rollout remains unverified.
- Source: `apps/missionary/app/feed/post-write-queue.ts:15`.
- Evidence: tests/unit/apps/missionary/app/feed/use-worker-feed-page-view.test.tsx; tests/unit/packages/api/posts/update-post.test.ts.
- Rationale: Per-post queue and expected_updated_at; server requires draft/revision atomically. Isolated transactional SQL verification and ordering/conflict regressions qualify the source repair. The later request explicitly authorizes integration into nondeploying develop; resolving this source finding does not certify hosted activation. The earlier decision to keep the source conversation open solely for rollout confirmation is superseded, not presented as completed deployment.
- Observed GitHub state before current publication: open.

### 24. Failed-gift recovery correlation

- Thread: `PRRT_kwDOQ4BXFs62FBhx`; comment IDs: 4535419789, 4547881497.
- Disposition: Fix retained.
- Source: `apps/donor/features/donor/components/overview/overview-model.ts:74`.
- Evidence: tests/unit/apps/donor/overview-model.test.ts.
- Rationale: Unrelated later gifts to a display name do not clear an individual failed gift.
- Observed GitHub state before current publication: resolved.

### 25. Privacy switch default

- Thread: `PRRT_kwDOQ4BXFs62FCg2`; comment IDs: 4535426427, 4547882082.
- Disposition: Fix retained.
- Source: `apps/donor/app/(dashboard)/donor-dashboard/settings/page-client.tsx:408`.
- Evidence: tests/unit/apps/donor/shadscan-settings-feedback.test.tsx.
- Rationale: Only explicit false defaultAnonymousToRecipient displays name visibility as on.
- Observed GitHub state before current publication: resolved.

### 26–31. Late material findings

- Effective payment state: `PRRT_kwDOQ4BXFs62r88i`, comment 4552364032. Candidate rows are folded through canonical applied corrections before settled amounts, counts and currency membership are decided.
- Canonical gift date: `PRRT_kwDOQ4BXFs62r88p`, comment 4552364042. Selection and buckets use gift_date with created_at fallback; imported records retain their actual gift month. The dashboard suite passes 48 tests.
- Recurring currencies: `PRRT_kwDOQ4BXFs62r88v`, comment 4552364054. Rows use canonical minor units and their own currency; mixed or unknown active totals are unavailable.
- Biweekly normalization: `PRRT_kwDOQ4BXFs62r885`, comment 4552364068. Twenty-six annual periods contribute to one final integer monthly rounding. The recurring page suite passes 17 tests.
- Support identity: `PRRT_kwDOQ4BXFs62r89B`, comment 4552364079. Canonical user_id wins; only unlinked legacy agents use email. The ownership and adapter suites pass 31 tests.
- Stale revert: `PRRT_kwDOQ4BXFs62r89G`, comment 4552364091. The unsafe GET/full-document PATCH action is withheld, not patched with an ineffective client-only precondition. Seven regressions prove no request can dispatch and preserve permission/document guards. Atomic CMS revert is not delivered.

All six are confirmed, repaired together in `607d89128`, and await published-commit replies before resolution. The five-suite combined regression selection passes 103 tests. Details and limitations are in [final repairs](./pr2647-final-repairs.md).

## Review-summary and issue channels

The refreshed review inventory contains 37 reviews and 11 issue comments. Database/security/critical/debt/architecture review summaries map their actionable findings to the inline threads above. Repeated Bugbot summaries do not create separate fixes. Claude/Codex quota failures are not approvals. CodeRabbit results on an older head are historical only. CI and Vercel comments report check/deployment state; they do not establish whole-app acceptance.

The metrics donor-preference tenant concern was assessed without a new waiver: donor IDs originate in tenant-filtered gifts and the preference relationship uses the tenant/donor composite foreign key. No additional cross-tenant bypass was established by the cited path. That assessment does not waive the explicit anonymous-recipient redaction tests.

## Open safety holds

- Provenance is closed after checking the published import anchor and replying with ancestry/object evidence.
- Autosave/publication: source queue and atomic draft/revision preconditions are present with regressions. Resolve the source conversation only with the explicit source-versus-rollout qualification above. Hosted activation of `20261111164500_post_autosave_preconditions.sql` remains a release prerequisite; no deployed cross-session protection is claimed.
- React Doctor: strict check is not green. Independent reconciliation confirms the stale first record is not the sole blocker: 66 supporting files are stale and even 63 same-context positional rebinds would leave 490 unmatched identities without that continuity. No blanket waiver or rehash is applied. All unqualified current warnings/errors require exact source/test adjudication.
- Hosted portal smoke: prior preview returned 500. A new deploy and fresh run/logs are required; older green build checks are insufficient.
