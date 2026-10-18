import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

// Run through stdin from the repository root. Installed real React and jsdom
// execute the unchanged hook; only clock and fetch inputs are controlled.
const scenario = process.env.D10_PROBE_CASE;
assert.ok(scenario === 'utc' || scenario === 'positive-offset');
assert.equal(process.env.TZ, scenario === 'utc' ? 'UTC' : 'Pacific/Kiritimati');
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'https://fixture.invalid/',
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const RealDate = globalThis.Date;
const initialClock = '2026-10-16T12:00:00.000Z';
let clockIso = initialClock;
class ProbeDate extends RealDate {
  constructor(...args) { super(...(args.length ? args : [clockIso])); }
  static now() { return new RealDate(clockIso).valueOf(); }
}
globalThis.Date = ProbeDate;
dom.window.Date = ProbeDate;

const fixtures = scenario === 'utc' ? [
  { id: 'last-day', amount: 10000, donation_type: 'one_time', status: 'completed', created_at: '2026-09-30T12:00:00.000Z' },
  { id: 'imported-earlier-gift', amount: 20000, donation_type: 'one_time', status: 'completed', created_at: '2026-10-10T12:00:00.000Z', gift_date: '2026-03-10T12:00:00.000Z' },
] : [
  { id: 'current-month', amount: 10000, donation_type: 'one_time', status: 'completed', created_at: '2026-10-10T12:00:00.000Z' },
];
const fetchCalls = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
  fetchCalls.push({ url: String(url), hasAbortSignal: options?.signal instanceof AbortSignal });
  return { ok: true, json: async () => ({ donations: fixtures }) };
};

const { renderHook, waitFor, cleanup } = await import('@testing-library/react');
const { useDonationMetrics } = await import('./packages/lib/hooks/use-donation-metrics.ts');
const { selectGivingTrend } = await import('./apps/missionary/app/analytics/analytics-data.ts');
const checks = [];
function check(name, fn) { checks.push({ name, observation: fn() }); }

try {
  const hook = renderHook(({ subject }) => useDonationMetrics(subject), {
    initialProps: { subject: 'fixture-missionary' },
  });
  await waitFor(() => {
    assert.equal(hook.result.current.isLoading, false);
    assert.equal(hook.result.current.error, null);
  });
  assert.equal(fetchCalls.length, 1);

  if (scenario === 'utc') {
    check('Final-day noon receipt is in September breakdown but absent from Last Month total', () => {
      assert.equal(hook.result.current.lastMonth.total, 0);
      const september = hook.result.current.monthlyBreakdown.find(row => row.month === 'Sep');
      assert.equal(september.total, 10000);
      return { lastMonthTotal: 0, septemberBreakdownTotal: september.total, receiptCreatedAt: fixtures[0].created_at };
    });
    check('Earlier gift_date input does not move an October-created gift into March', () => {
      assert.equal(hook.result.current.thisMonth.total, 20000);
      const march = hook.result.current.monthlyBreakdown.find(row => row.month === 'Mar');
      assert.equal(march.total, 0);
      return { thisMonthTotal: 20000, marchBreakdownTotal: march.total, createdAt: fixtures[1].created_at, giftDate: fixtures[1].gift_date };
    });
    check('Actual six/twelve-month selectors change local window without a second request', () => {
      const six = selectGivingTrend(hook.result.current.monthlyBreakdown, 6);
      const twelve = selectGivingTrend(hook.result.current.monthlyBreakdown, 12);
      assert.equal(six.length, 6);
      assert.equal(twelve.length, 12);
      assert.equal(fetchCalls.length, 1);
      return { sixLabels: six.map(row => row.month), twelveLabels: twelve.map(row => row.month), requests: fetchCalls };
    });
    check('Same-subject rerender after calendar rollover keeps memoized October period', () => {
      const priorBreakdown = hook.result.current.monthlyBreakdown;
      clockIso = '2026-11-16T12:00:00.000Z';
      hook.rerender({ subject: 'fixture-missionary' });
      assert.equal(hook.result.current.thisMonth.total, 20000);
      assert.equal(hook.result.current.monthlyBreakdown, priorBreakdown);
      assert.equal(fetchCalls.length, 1);
      return { clockNow: clockIso, retainedThisMonthTotal: hook.result.current.thisMonth.total, retainedLastLabel: priorBreakdown.at(-1).month, requestCount: fetchCalls.length };
    });
    check('Clearing subject input retains previous data with loading false', () => {
      hook.rerender({ subject: '' });
      assert.equal(hook.result.current.isLoading, false);
      assert.equal(hook.result.current.error, null);
      assert.equal(hook.result.current.thisMonth.total, 20000);
      assert.equal(fetchCalls.length, 1);
      return { subject: '', retainedThisMonthTotal: hook.result.current.thisMonth.total, isLoading: false, error: null, requestCount: fetchCalls.length };
    });
  } else {
    check('UTC+14 local-month seed ends at September and omits an October receipt from breakdown', () => {
      assert.equal(hook.result.current.thisMonth.total, 10000);
      assert.equal(hook.result.current.monthlyBreakdown.at(-1).month, 'Sep');
      assert.ok(hook.result.current.monthlyBreakdown.every(row => row.total === 0));
      return { thisMonthTotal: 10000, lastBreakdownMonth: hook.result.current.monthlyBreakdown.at(-1).month, allBreakdownTotalsZero: true, labels: hook.result.current.monthlyBreakdown.map(row => row.month) };
    });
  }

  console.log(JSON.stringify({
    runtime: process.version,
    scenario,
    timezone: process.env.TZ,
    initialClock,
    finalClock: clockIso,
    fixtures,
    passed: checks.length,
    checks,
    scope: 'Actual unchanged useDonationMetrics React hook and selectGivingTrend helper; installed real React/testing-library/jsdom; controlled fetch response and clock inputs only',
    limits: [
      'No actual HTTP endpoint, Supabase, database, browser, JSX chart, authorization, revocation command, notification or provider executed',
      'Assertions capture current behavior, including defects; not desired D10 acceptance behavior',
      'gift_date is an extra fixture input ignored by the hook; the actual endpoint omits it entirely',
      'Empty subject proves hook state behavior, not that a production revocation invokes this input transition',
      'Clock rollover rerenders without a remount or changed donation payload; it does not model every application navigation path',
    ],
  }, null, 2));
} finally {
  cleanup();
  globalThis.fetch = realFetch;
  globalThis.Date = RealDate;
  dom.window.close();
}
