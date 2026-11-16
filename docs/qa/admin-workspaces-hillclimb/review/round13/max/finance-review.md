# Round 13 focused finance review: CRM and Contributions

Reviewed the live `t3-5a24111d-r12` application and tests; last finding-specific source recheck: **2026-11-11 08:29:37 UTC**. Builders were editing concurrently. This is an independent source and unit-test check, not a visual score, final council verdict, or verification of a completed wave.

Only this report was authored. Application code and tests were read-only. The parent `t3-5a24111d` tree was read-only. No subagents, Git mutations, dev servers, localhost requests, turbo, environment-file access, or production-data operations were used. Test result caching was disabled.

## Important current finding

### P2 — Refund totals are capped by the corrected gift amount, understating money refunded

**Verified, still present at final recheck. Contributions owner. Pre-existing in frozen round 12; not introduced by the round 13 edits inspected.**

- [hub-model.ts:165](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/hub-model.ts:165>) reads the effective gift amount; line 168 adds `Math.min(refundedCents, cents)` to the refund total. An amount correction can make that effective amount smaller than a real provider refund.
- The current service explicitly preserves this distinction: [service.ts:488](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/contributions/service.ts:488) applies effective values, while line 521 retains the original charge as the refund basis. [contributions-refund-basis.test.ts:80](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/packages/api/admin/contributions-refund-basis.test.ts:80) already covers an original 10,000-cent gift corrected to 7,500 cents with 8,000 cents refunded.
- A fresh in-memory probe through **the actual list service and hub summarizer** returned `amountCents: 7500`, `refundedAmountCents: 8000`, `refundState: "partial_refund"`, then a summary refund total of **7,500**, rather than **8,000**. This does not use the superseded hillclimb fixtures.
- Staff see the incorrect amount in the Received tile's “net of … refunds” detail at [main-body.tsx:768](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/main-body.tsx:768>). The amount understates actual refunds by $5.00 in this example. This is a reporting defect; the probe does not demonstrate incorrect provider execution.

**Minimal fix:** replace line 168 with `addCents(refunded, currencyCode, refundedCents);`. The preceding `Math.max(0, ...)` already handles negative inputs. Keep actual refunds independent of corrected gift amounts; do not alter the provider refund basis or effective gift amount to hide the discrepancy.

**Missing regression:** extend [contributions-hub-model.test.ts:129](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/contributions-hub-model.test.ts:129), or pass the existing API refund-basis case through the summarizer, asserting **8,000 cents refunded** for the 7,500-effective/8,000-refunded case. Existing summary coverage uses refunds no larger than effective amounts, so all current tests can pass while this defect remains. This is the coverage gap associated with this finding, not a second finding.

Final recheck SHA-256 of `hub-model.ts`: `822883a9fdf1a20fceba35e1adffc698f9f0685eb20509c86c35af941a5e568b`; its contents still matched frozen round 12. The service and both cited test files also matched frozen round 12. The Received tile copy had changed during this review, but continued to display the same incorrect summary value.

## Focused checks without another important finding

- **Absent commitments versus zero:** [relationships/page-client.tsx:168](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/crm/relationships/page-client.tsx:168>) now gives a missing `activeCommitments` summary its own unavailable state; a present empty summary remains a real $0.00. The focused workspace tests cover both outcomes. The current [relationship model:636](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/crm/relationships/model.ts:636) selects active pledges, separates currencies, normalizes frequency, and rounds once per currency. The old missing-summary stand-in is fixed in the source inspected.
- **Drawer ordering and availability:** [detail-drawer.tsx:753](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/crm/detail-drawer.tsx:753>) places Gift history before the chart, note composer, and timeline. The new DOM-order test passed. [gift-history-section.tsx:164](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/crm/gift-history-section.tsx:164>) retains the shared operation shell and `donor_crm_record` source attribution; the reorder does not remove receipt or correction entry points.
- **Permissions and blocked actions:** [gift-history.ts:88](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/crm/detail/gift-history.ts:88) uses shared server availability and the original charge for refunds. [inline-actions.ts:118](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/contribution-operations/inline-actions.ts:118) filters entries using viewer capabilities and tenant approval policy. The CRM detail route supplies resolved capabilities at [detail/index.ts:24](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/crm/detail/index.ts:24). [operation-shell.tsx:1280](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/operation-shell.tsx:1280>) fails closed without current detail or an available action. The selected permission, inline parity, receipt-delivery, and shell tests passed. No permission regression was established in these inspected paths; this is not live RLS qualification.
- **Amount correction and cents:** [catalog.ts:61](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/contribution-operations/catalog.ts:61) parses whole money strings into safe integer cents. The amount correction definition at line 86 describes an adjustment preserving original history, discloses receipt/report effects, and requires reason and confirmation. Catalog and shell tests passed. The approval card currently uses “Amount correction” at [correction-approval-panel.tsx:127](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/correction-approval-panel.tsx:127>); no important language defect was established.
- **Status-aware timeline:** [detail/service.ts:122](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/crm/detail/service.ts:122) distinguishes received, partly refunded, refunded, failed, and pending gifts. [detail-drawer.tsx:467](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/crm/detail-drawer.tsx:467>) adds a plus only for completed gift entries; pending, failed, refunded, and other activity amounts do not get one. API status-title, drawer status, and cents/currency timeline tests passed.

## Exact verification commands and results

All commands ran from `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`. Tests use isolated fakes; they do not establish live provider delivery, tenant integration, or browser behavior.

```powershell
bunx vitest run --config vitest.config.mts --no-cache --maxWorkers 1 tests/unit/apps/admin/app/crm-relationships-workspace.test.tsx tests/unit/apps/admin/app/crm-record-drawer.test.tsx tests/unit/apps/admin/app/crm-activity-timeline.test.tsx tests/unit/packages/api/admin-crm-detail-report.test.ts tests/unit/packages/api/crm-relationships.test.ts tests/unit/packages/api/admin/crm-gift-history-row.test.ts tests/unit/packages/api/admin/contribution-inline-actions.test.ts
```

Exit **0**; **7 files, 150 tests passed**; Vitest **5.0.5**; duration **115.45s**.

```powershell
bunx vitest run --config vitest.config.mts --no-cache --maxWorkers 1 tests/unit/apps/admin/app/contributions-hub-model.test.ts tests/unit/apps/admin/app/contribution-operation-shell.test.tsx tests/unit/apps/admin/app/contribution-detail-sheet.test.tsx tests/unit/packages/api/admin/contribution-operations-catalog.test.ts tests/unit/packages/api/admin/contribution-operations-permissions.test.ts tests/unit/packages/api/admin/contribution-receipt-delivery.test.ts tests/unit/packages/api/admin/contributions-refund-basis.test.ts
```

Exit **0**; **7 files, 190 tests passed**; duration **55.59s**. Combined: **14 files, 340 tests passed**. No full unit gate, typecheck, lint, build, browser, or external-service checks were run; no application or test changes were made to require them.

Pure summarizer probe, exit **0**, independently produced 7,500 refunded cents against an expected 8,000:

```powershell
$probe = @'
import { summarizeContributions } from "./apps/admin/app/(app)/contributions/hub-model.ts";
const row = {
  status: "completed",
  shared: { amountCents: 7500, refundedAmountCents: 8000, currencyCode: "USD", paymentStatus: "completed" }
};
const summary = summarizeContributions([row]);
console.log(JSON.stringify({ effectiveAmountCents: row.shared.amountCents, actualRefundedCents: row.shared.refundedAmountCents, summaryRefunded: summary.refunded, expectedRefunded: [{currencyCode: "USD", cents: 8000}] }));
'@
bun -e $probe
```

Service-to-summary probe, exit **0**:

```powershell
$probe = @'
import { parseAdminContributionsParams } from "./packages/api/src/admin/contributions/query.ts";
import { listAdminContributions } from "./packages/api/src/admin/contributions/service.ts";
import { summarizeContributions } from "./apps/admin/app/(app)/contributions/hub-model.ts";
const donation = {
  id: "donation-1", tenant_id: "tenant-1", donor_id: null, missionary_id: null, fund_id: null,
  amount: 10000, currency: "usd", status: "completed", donation_type: "one_time", payment_method: "card",
  is_recurring: false, recurring_interval: null, notes: null, stripe_payment_intent_id: "pi_probe",
  gift_date: "2026-04-08", campaign_id: null, pledge_id: null, processed_at: null, completed_at: null,
  failed_at: null, error_code: null, error_message: null, stripe_charge_id: "ch_probe", refunded_at: null,
  refund_amount: 8000, source: "online", created_at: "2026-04-08T10:00:00.000Z", updated_at: "2026-04-08T12:00:00.000Z"
};
const tables = {
  donations: [donation], staged_gifts: [], contribution_corrections: [{ donation_id: donation.id, status: "applied" }],
  contribution_correction_requests: [], contribution_adjustments: [{
    id: "adjustment-1", donation_id: donation.id, adjustment_type: "amount_correction", status: "applied",
    effective_values: { amountCents: 7500 }, reason: "Correct recorded amount", actor_profile_id: "profile-1",
    source_surface: "contributions_hub", created_at: "2026-04-09T10:00:00.000Z"
  }]
};
const database = { from(table) {
  if (!(table in tables)) throw new Error(`Unexpected table ${table}`);
  const result = { data: tables[table], error: null };
  const query = { select: () => query, eq: () => query, in: () => query, order: () => query,
    limit: () => Promise.resolve(result), then: (resolve) => Promise.resolve(result).then(resolve) };
  return query;
}};
const result = await listAdminContributions(database, "tenant-1", parseAdminContributionsParams(new URLSearchParams()));
const summary = summarizeContributions(result.rows);
console.log(JSON.stringify({ originalCents: donation.amount, api: result.rows.map(row => ({ amountCents: row.shared.amountCents, refundedAmountCents: row.shared.refundedAmountCents, refundState: row.shared.refundState })), summaryRefunded: summary.refunded, expectedRefundedCents: 8000 }));
'@
bun -e $probe
```

Observed output:

```json
{
  "originalCents": 10000,
  "api": [
    {
      "amountCents": 7500,
      "refundedAmountCents": 8000,
      "refundState": "partial_refund"
    }
  ],
  "summaryRefunded": [{ "currencyCode": "USD", "cents": 7500 }],
  "expectedRefundedCents": 8000
}
```

The probe outputs report the mismatch; exit 0 means the probes executed successfully, not that the money assertion passed.

## Basis and limits

Read applicable root/admin/API/database/shared-UI instructions, frontend/testing/backend rules, the data-access boundary, installed admin Next.js error-handling/data-security documentation and active Cache Components configuration. Read relevant CRM, contribution operations, platform principles/boundaries contracts and matching active deltas; planned activation was not inferred from publication.

Read the frozen [IMPLEMENT-BRIEF.md](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/review/round13/work/IMPLEMENT-BRIEF.md), [wave-a-crm-contributions.md](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/review/round13/work/wave-a-crm-contributions.md), [wave-b-pending.md](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/review/round13/work/wave-b-pending.md), and referenced [CRM](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/review/round12/claude-crm-superseded.md) and [Contributions](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/review/round12/claude-contributions-superseded.md) reviews. Their stale fixture and missing-capture complaints were not used to establish product defects.

Browser behavior, viewport-specific reachability/menu positioning, real receipt sends, provider execution, and live authorization were outside this task's permitted checks. The source supports the drawer order change; it does not prove the gift controls are visible without scrolling at every requested size. Tests describe the state executed, and concurrent builders may change it afterward. The final recheck was confined to files supporting the reported refund finding; no completion or stability claim is made for other builders' work.
