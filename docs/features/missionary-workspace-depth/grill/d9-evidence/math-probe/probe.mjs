import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

// Resolve only the actual model's extensionless sibling import for Node.
// No source implementation or export is copied, transformed or replaced.
const modelUrl = new URL('./packages/api/src/missionary-portal/model.ts', import.meta.url).href;
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL === modelUrl && specifier === './redaction') {
      return nextResolve('./redaction.ts', context);
    }
    return nextResolve(specifier, context);
  },
});
const { buildMissionaryPortalSnapshot } = await import(modelUrl);
const { buildMissionaryDashboardView } = await import('./packages/missionary/components/dashboard-view.ts');

const checks = [];
function check(name, fn) {
  const observation = fn();
  checks.push({ name, observation });
}
function gift(overrides = {}) {
  return {
    id: 'gift-a', donor_id: null, amount: 10000, currency: 'usd',
    status: 'completed', donation_type: 'one_time', is_recurring: false,
    gift_date: '2026-09-15T12:00:00.000Z', created_at: '2026-09-15T12:00:00.000Z',
    ...overrides,
  };
}
function snapshot({ missionary = {}, donations = [], donors = [], tasks = [] } = {}) {
  return buildMissionaryPortalSnapshot({
    profile: {
      id: 'profile-a', email: 'fixture@example.invalid', first_name: 'Fixture',
      last_name: 'Person', full_name: null, display_name: null, phone: null, avatar_url: null,
    },
    missionary: {
      id: 'missionary-a', tenant_id: 'tenant-a', profile_id: 'profile-a',
      bio: null, mission_field: null, funding_goal: null, current_funding: null,
      tagline: null, location: null, phone: null, timezone: 'UTC', region: null,
      cover_url: null, social_links: null, ...missionary,
    },
    donations, donors, tasks, posts: [],
  });
}

check('Aggregate adds USD and EUR minor units without a support currency', () => {
  const result = snapshot({ donations: [gift(), gift({ id: 'gift-b', amount: 20000, currency: 'eur' })] });
  assert.equal(result.support.raisedCents, 30000);
  assert.equal(Object.hasOwn(result.support, 'currency'), false);
  assert.deepEqual(result.recentGifts.map(row => row.currency), ['USD', 'EUR']);
  return { raisedCents: result.support.raisedCents, detailCurrencies: result.recentGifts.map(row => row.currency), aggregateHasCurrency: false };
});
check('Recurring monthly field adds receipts from separate months', () => {
  const result = snapshot({ donations: [
    gift({ donation_type: 'recurring', is_recurring: true, gift_date: '2026-01-15T12:00:00.000Z' }),
    gift({ id: 'gift-b', donation_type: 'recurring', is_recurring: true }),
  ] });
  assert.equal(result.support.recurringMonthlyCents, 20000);
  return { recurringMonthlyCents: result.support.recurringMonthlyCents, receiptMonths: ['2026-01', '2026-09'] };
});
check('Stored zero current funding overrides a settled receipt sum', () => {
  const result = snapshot({ missionary: { current_funding: 0 }, donations: [gift()] });
  assert.equal(result.support.raisedCents, 0);
  assert.equal(result.support.giftCount, 1);
  return { raisedCents: result.support.raisedCents, giftCount: result.support.giftCount, receiptAmountMinor: 10000 };
});
check('Over-goal numeric percentage is capped at 100 before presentation', () => {
  const result = snapshot({ missionary: { funding_goal: 10000, current_funding: 15000 } });
  const view = buildMissionaryDashboardView(result);
  assert.equal(result.support.percentFunded, 100);
  assert.equal(view.support.percentFunded, 100);
  assert.equal(view.support.remainingCents, 0);
  return { raisedCents: 15000, goalCents: 10000, percentFunded: view.support.percentFunded, remainingCents: view.support.remainingCents };
});
check('Missing goal/funding values become an unqualified numeric zero summary', () => {
  const result = snapshot();
  assert.equal(result.support.goalCents, 0);
  assert.equal(result.support.raisedCents, 0);
  assert.equal(result.support.giftCount, 0);
  assert.equal(Object.hasOwn(result.support, 'coverage'), false);
  assert.equal(Object.hasOwn(result.support, 'asOf'), false);
  return result.support;
});
check('Partial refund fact is unused while full-refunded status excludes the row', () => {
  const result = snapshot({ donations: [
    gift({ refund_amount: 4000 }),
    gift({ id: 'gift-b', status: 'refunded', refund_amount: 10000 }),
  ] });
  assert.equal(result.support.raisedCents, 10000);
  assert.equal(result.support.giftCount, 1);
  return { raisedCents: result.support.raisedCents, partialRefundMinor: 4000, fullyRefundedRowIncluded: false };
});
check('A gift whose donor is absent from loaded donor rows retains donorId', () => {
  const result = snapshot({ donations: [gift({ donor_id: 'donor-not-loaded' })], donors: [] });
  assert.equal(result.recentGifts[0].donorId, 'donor-not-loaded');
  return { donorId: result.recentGifts[0].donorId, loadedDonorCount: 0 };
});
check('Missing currency defaults to USD and JPY is divided by 100', () => {
  const result = snapshot({ donations: [gift({ currency: null }), gift({ id: 'gift-jpy', currency: 'jpy', amount: 10000 })] });
  assert.equal(result.recentGifts[0].currency, 'USD');
  assert.equal(result.recentGifts[1].currency, 'JPY');
  assert.equal(result.recentGifts[1].amount, 100);
  return { missingCurrencyBecomes: result.recentGifts[0].currency, jpyAmountMinor: 10000, jpyAmount: result.recentGifts[1].amount };
});
check('Portal recognizes succeeded and success as settled statuses', () => {
  const result = snapshot({ donations: [gift({ status: 'succeeded' }), gift({ id: 'gift-b', status: 'success' })] });
  assert.equal(result.support.giftCount, 2);
  assert.equal(result.support.raisedCents, 20000);
  return { giftCount: result.support.giftCount, raisedCents: result.support.raisedCents };
});

console.log(JSON.stringify({
  runtime: process.version,
  source: 'Actual repository model, redaction and dashboard presenter modules; native TypeScript stripping; one extensionless import resolved to its actual .ts file',
  passed: checks.length,
  checks,
  limits: [
    'Checks assert observed current behavior, including defects; they do not certify desired financial semantics',
    'No API, database, browser, React hook, JSX formatter, authorization, notification or provider pipeline executed',
    'The extra refund_amount fixture is intentionally ignored by the current model, matching the separate static finding that its query does not select refund facts',
    'Currency fixtures prove helper behavior, not that these values were observed in live production data',
  ],
}, null, 2));
