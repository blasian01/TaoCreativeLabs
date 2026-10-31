const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { createRequire } = require('node:module');
const load = createRequire(path.join(process.env.BUSINESS_INSIGHTS_DEPS, 'package.json'));
const React = load('react');
const { renderToStaticMarkup } = load('react-dom/server');
const domain = require(path.join(process.env.BUSINESS_INSIGHTS_BUILD, 'lib/business-insights/index.js'));
const { BusinessInsightsView } = require(path.join(process.env.BUSINESS_INSIGHTS_BUILD, 'components/admin/business-insights/BusinessInsightsView.js'));
const { parseSnapshot, rate, monthlyRecurring, annualRecurring, portfolioSum, trend, netReceipts, buildView, exportRows, coverageActions, deriveRates, buildBusinessInsights } = domain;
// ALL examples in this file are synthetic and never imported by production.
const period = { kind: 'period', start: '2026-09-01T00:00:00Z', end: '2026-10-01T00:00:00Z' };
const evidence = { source: 'synthetic-contract', reference: 'test-fixture', observedAt: '2026-10-02T00:00:00Z', extractedAt: '2026-10-02T01:00:00Z', definition: 'synthetic-v1', coverage: 'measured', note: '',
  environment: 'production', authority: 'synthetic_fixture', precision: 'exact', maturity: 'complete', timezone: 'UTC', dataCompleteThrough: period.end };
const scope = { app: 'aura', platform: 'ios', territory: 'all', channel: 'store', population: 'same-starting-paid-cohort', cohort: '2026-09' };
function fact(metric = 'active_users', value = 10, overrides = {}) {
  const money = ['mrr', 'arr', 'opening_mrr', 'lost_opening_mrr', 'recurring_revenue', 'one_time_revenue', 'refunds', 'source_rc_mrr', 'at_risk_entitled_mrr'].includes(metric);
  const entity = { first_time_downloads: 'download', redownloads: 'download', paid_subscribers: 'subscription_chain', active_trials: 'subscription_chain',
    trial_cohort: 'subscription_chain', converted_trial_cohort: 'subscription_chain', paying_customers: 'customer', opening_paying_customers: 'customer', lost_opening_paying_customers: 'customer',
    source_auth_accounts_current: 'source_account', source_contact_confirmed_accounts: 'source_account', source_rc_active_customers_28d: 'provider_customer', paid_seats: 'seat',
    active_installations: 'installation', play_device_acquisitions: 'device' }[metric] || 'account';
  return { id: metric, metric, value, unit: money ? 'minor' : 'count', entity: money ? null : entity, currency: money ? 'USD' : null, currencyExponent: money ? 2 : null,
    scope: { ...scope }, window: { ...period }, evidence: { ...evidence }, ...overrides };
}
function snapshot(observations = [], catalog = []) { return { schemaVersion: 2, generatedAt: '2026-10-03T00:00:00Z', observations, catalog }; }
function plan(overrides = {}) { return { id: 'synthetic-plan', app: 'aura', platform: 'ios', channel: 'store', provider: 'synthetic-provider', territory: 'all', productId: 'test-annual',
  name: 'Test annual', lifecycle: 'legacy', kind: 'subscription', billing: 'recurring', interval: 'year', intervalCount: 1,
  currency: 'USD', currencyExponent: 2, listPriceMinor: 12000, evidence: { ...evidence }, accountScope: 'synthetic-account-scope', environment: 'production',
  priceId: null, offerId: null, effectiveFrom: null, effectiveUntil: null, quantityUnit: 'subscription', taxTreatment: 'exclusive', ...overrides }; }
function group(overrides = {}) { return { catalog: plan(), contractedAmountMinor: 9600, basis: 'contracted_recurring', precision: 'exact', state: 'paid_active', coverage: 'measured', evidenceIds: ['contract-group'], ...overrides }; }

test('measured zero remains zero; missing and blocked cannot masquerade as zero', () => {
  assert.equal(parseSnapshot(snapshot([fact('active_users', 0)])).observations[0].value, 0);
  assert.equal(parseSnapshot(snapshot([fact('active_users', null, { evidence: { ...evidence, coverage: 'missing' } })])).observations[0].value, null);
  for (const coverage of ['missing', 'blocked', 'unavailable']) assert.throws(() => parseSnapshot(snapshot([fact('active_users', 0, { evidence: { ...evidence, coverage } })])));
  assert.throws(() => parseSnapshot(snapshot([fact('active_users', null)])));
});
test('strict aggregate parser rejects arbitrary customer fields, NaN, infinity, negative/fractional counts', () => {
  for (const value of [NaN, Infinity, -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => parseSnapshot(snapshot([fact('active_users', value)])));
  assert.throws(() => parseSnapshot({ ...snapshot(), customers: [] }));
  assert.throws(() => parseSnapshot(snapshot([{ ...fact(), email: 'synthetic@example.invalid' }])));
});
test('rejects invalid calendar dates, future observations, partial windows and inverted windows', () => {
  assert.throws(() => parseSnapshot({ ...snapshot(), generatedAt: '2026-02-30T00:00:00Z' }));
  assert.throws(() => parseSnapshot(snapshot([fact('active_users', 1, { evidence: { ...evidence, observedAt: '2027-01-01T00:00:00Z' } })])));
  for (const window of [{ kind: 'period', ...{ start: period.end, end: period.start } }, { kind: 'period', start: period.start }, { kind: 'snapshot', at: period.end }])
    assert.throws(() => parseSnapshot(snapshot([fact('active_users', 1, { window })])));
});
test('rejects duplicate/overlapping RevenueCat and store authority; copies validated input', () => {
  const a = fact(); const b = fact('active_users', 20, { id: 'store-copy', evidence: { ...evidence, source: 'second-source' } });
  assert.throws(() => parseSnapshot(snapshot([a, b])), /overlappingAuthority/);
  const input = snapshot([a]); const parsed = parseSnapshot(input); input.observations[0].value = 99; assert.equal(parsed.observations[0].value, 10);
});
test('currency buckets retain exponents; cannot attach currency to counts or omit it on money', () => {
  assert.throws(() => parseSnapshot(snapshot([fact('mrr', 100, { currency: null, currencyExponent: null })])));
  assert.throws(() => parseSnapshot(snapshot([fact('active_users', 1, { currency: 'USD', currencyExponent: 2 })])));
  assert.equal(parseSnapshot(snapshot([fact('mrr', 100, { currency: 'JPY', currencyExponent: 0 })])).observations[0].currencyExponent, 0);
});
test('churn/conversion/retention use exact starting cohort and real denominators', () => {
  const pairs = [['customer_churn', 'lost_opening_paying_customers', 'opening_paying_customers'], ['revenue_churn', 'lost_opening_mrr', 'opening_mrr'],
    ['trial_conversion', 'converted_trial_cohort', 'trial_cohort'], ['retention', 'cohort_retained', 'cohort_size']];
  for (const [kind, n, d] of pairs) {
    assert.equal(rate(fact(n, 2), fact(d, 10), kind).value, .2);
    assert.equal(rate(fact(n, 0), fact(d, 0), kind).status, 'undefined');
    assert.equal(rate(fact(n, 11), fact(d, 10), kind).status, 'incomparable');
    assert.equal(rate(fact(n, null, { evidence: { ...evidence, coverage: 'partial' } }), fact(d, 10), kind).status, 'unavailable');
    assert.equal(rate(fact(n, 2), fact(d, 10, { scope: { ...scope, population: 'different' } }), kind).status, 'incomparable');
    assert.equal(rate(fact(n, 2), fact(d, 10, { window: { ...period, end: '2026-10-02T00:00:00Z' } }), kind).status, 'incomparable');
  }
  assert.equal(rate(fact('active_trials', 2), fact('paying_customers', 10), 'trial_conversion').status, 'incomparable');
  assert.equal(rate(fact('cohort_retained', 2, { scope: { ...scope, cohort: null } }), fact('cohort_size', 10, { scope: { ...scope, cohort: null } }), 'retention').status, 'incomparable');
});
test('annual contracted amount normalizes at actual discount, not list price; ARR roundtrip; quarterly and recurring addon', () => {
  assert.equal(monthlyRecurring(group()).value, 800);
  assert.equal(annualRecurring(monthlyRecurring(group())).value, 9600);
  assert.equal(monthlyRecurring(group({ catalog: plan({ interval: 'month', intervalCount: 3 }), contractedAmountMinor: 900 })).value, 300);
  assert.equal(monthlyRecurring(group({ catalog: plan({ kind: 'addon' }) })).value, 800);
  assert.equal(monthlyRecurring(group({ basis: 'list_price' })).value, null);
  assert.equal(monthlyRecurring(group({ contractedAmountMinor: null })).value, null);
});
test('trials/lifetime/packs/expired/unpaid excluded; scheduled cancellation remains active', () => {
  for (const state of ['trial', 'expired', 'unpaid']) assert.equal(monthlyRecurring(group({ state })).value, 0);
  for (const kind of ['lifetime', 'credit_pack', 'one_time', 'free']) assert.equal(monthlyRecurring(group({ catalog: plan({ kind, billing: kind === 'free' ? 'free' : 'one_time', interval: null, intervalCount: null }) })).value, 0);
  assert.equal(monthlyRecurring(group({ state: 'paid_cancel_scheduled' })).value, 800);
  assert.equal(monthlyRecurring(group({ coverage: 'missing' })).value, null);
  assert.equal(monthlyRecurring(group({ catalog: plan({ billing: 'unknown' }) })).value, null);
});
test('day/week normalization requires explicit evidenced policy; fractional minor precision not rounded early', () => {
  const g = group({ catalog: plan({ interval: 'week', intervalCount: 2 }), contractedAmountMinor: 100 });
  assert.equal(monthlyRecurring(g).value, null);
  assert.ok(Math.abs(monthlyRecurring(g, { daysPerYear: 365, evidence: 'test-defined-convention' }).value - 100 * 365 / 14 / 12) < 1e-10);
  assert.equal(monthlyRecurring(g, { daysPerYear: 360, evidence: 'unsupported' }).value, null);
});
test('catalog retains real arbitrary SKU identity/lifecycle/currency without invented tiers', () => {
  assert.equal(parseSnapshot(snapshot([], [plan()])).catalog[0].lifecycle, 'legacy');
  assert.throws(() => parseSnapshot(snapshot([], [plan(), plan({ id: 'other' })])), /duplicateProduct/);
  assert.throws(() => parseSnapshot(snapshot([], [plan({ kind: 'lifetime' })])), /nonrecurringKind/);
});
test('portfolio sums require dedup/disjoint proof, complete coverage and same currencies/windows', () => {
  const rows = [fact('mrr', 100, { id: 'a' }), fact('mrr', 200, { id: 'b', scope: { ...scope, app: 'glyph' } })];
  const proof = { complete: true, reference: 'synthetic-reviewed-partition', ids: ['a', 'b'], apps: ['aura', 'glyph'] };
  assert.equal(portfolioSum(rows, null).value, null);
  assert.equal(portfolioSum(rows, proof).value, 300);
  assert.equal(portfolioSum([rows[0], { ...rows[1], currency: 'EUR' }], proof).status, 'incomparable');
  assert.equal(portfolioSum([rows[0], { ...rows[1], value: null, evidence: { ...evidence, coverage: 'missing' } }], proof).status, 'unavailable');
  assert.equal(portfolioSum(rows, { ...proof, ids: ['a', 'a'] }).value, null);
  assert.equal(portfolioSum([fact('registered_users', 4)], null).value, null);
});
test('cash refunds separate from MRR and can exceed period receipts', () => {
  assert.equal(netReceipts(fact('recurring_revenue', 100), fact('one_time_revenue', 200), fact('refunds', 400)).value, -100);
  assert.equal(netReceipts(fact('recurring_revenue', 100), fact('one_time_revenue', 200), fact('refunds', 4, { currency: 'EUR' })).status, 'incomparable');
});
test('trends reject mismatched duration/windows/source, zero baseline and snapshots', () => {
  const a = fact('active_users', 10, { window: { kind: 'period', start: '2026-09-01T00:00:00Z', end: '2026-09-08T00:00:00Z' } });
  const b = fact('active_users', 15, { id: 'next', window: { kind: 'period', start: '2026-09-08T00:00:00Z', end: '2026-09-15T00:00:00Z' } });
  assert.equal(trend(a, b).value, .5);
  assert.equal(trend({ ...a, value: 0 }, b).status, 'undefined');
  assert.equal(trend(a, { ...b, evidence: { ...evidence, source: 'other' } }).status, 'incomparable');
  assert.equal(trend(a, { ...b, window: { ...b.window, end: '2026-09-16T00:00:00Z' } }).status, 'incomparable');
});
test('filters do not prorate windows or equate downloads/users; freshness uses evidence clock', () => {
  const input = snapshot([fact(), fact('first_time_downloads', 5, { id: 'android', scope: { ...scope, platform: 'android', territory: 'US' } })]);
  assert.equal(buildView(input, { platforms: ['android'], territory: 'US' }, '2026-10-04T00:00:00Z').rows[0].observation.metric, 'first_time_downloads');
  assert.equal(buildView(input, { currency: 'USD' }, '2026-10-04T00:00:00Z').rows.length, 0);
  assert.equal(buildView(input, {}, '2026-10-04T01:00:00Z').rows[0].stale, true);
  assert.throws(() => buildView(input, {}, '2026-10-01T00:00:00Z'));
});
test('CSV preserves blank unknown, measured0, provenance, and blocks spreadsheet formulas', () => {
  const rows = buildView(snapshot([fact('active_users', 0, { evidence: { ...evidence, reference: '  =1+1', note: 'a,"b"' } }),
    fact('paying_customers', null, { evidence: { ...evidence, coverage: 'missing' } })]), {}, '2026-10-04T00:00:00Z').rows;
  const csv = exportRows(rows);
  assert.ok(csv.includes('"\'  =1+1"')); assert.ok(csv.includes('"a,""b"""'));
  assert.ok(csv.includes('"0","count"')); assert.ok(csv.includes('"","count"')); assert.ok(csv.includes('"missing"'));
});
test('coverage actions cite only gaps, never fabricated rankings/causal learning', () => {
  assert.equal(coverageActions([fact()]).length, 0);
  assert.deepEqual(coverageActions([fact('active_users', null, { evidence: { ...evidence, coverage: 'blocked' } })])[0].evidenceIds, ['active_users']);
});
test('presentation renders unknown/zero/source/window with escaped text and meaningful empty state', () => {
  const view = buildView(snapshot([fact('active_users', 0), fact('paying_customers', null, { evidence: { ...evidence, coverage: 'missing', note: '<script>bad()</script>' } })]), {}, '2026-10-04T00:00:00Z');
  const html = renderToStaticMarkup(React.createElement(BusinessInsightsView, { rows: view.rows, catalog: [plan()], generatedAt: view.snapshot.generatedAt }));
  assert.ok(html.includes('Unknown')); assert.ok(html.includes('0')); assert.ok(html.includes('synthetic-contract'));
  assert.ok(html.includes('2026-09-01')); assert.ok(html.includes('&lt;script&gt;')); assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('scope="col"')); assert.ok(html.includes('List prices'));
  const empty = renderToStaticMarkup(React.createElement(BusinessInsightsView, { rows: [], catalog: [], generatedAt: view.snapshot.generatedAt }));
  assert.ok(empty.includes('does not establish zero activity'));
});
test('measured periods cannot end after their actual observation time', () => {
  assert.throws(() => parseSnapshot(snapshot([fact('active_users', 10, { evidence: { ...evidence, observedAt: '2026-09-15T00:00:00Z', dataCompleteThrough: '2026-09-15T00:00:00Z' } })])), /incompletePeriod/);
});
test('derived cohort joins reject source mixing and leave missing numerator unavailable', () => {
  const rows = buildView(snapshot([fact('trial_cohort', 10), fact('converted_trial_cohort', 2)]), {}, '2026-10-04T00:00:00Z').rows;
  assert.equal(deriveRates(rows)[0].result.value, .2);
  rows[1].observation.evidence.source = 'other-provider';
  assert.equal(deriveRates(rows)[0].result.status, 'unavailable');
  assert.equal(rate(rows[1].observation, rows[0].observation, 'trial_conversion').status, 'incomparable');
});
test('equivalent RFC3339 milliseconds cannot bypass duplicate-authority or exact-window checks', () => {
  const a = fact(); const b = fact('active_users', 1, { id: 'same-instant', window: { ...period, start: '2026-09-01T00:00:00.000Z', end: '2026-10-01T00:00:00.000Z' } });
  assert.throws(() => parseSnapshot(snapshot([a, b])), /overlappingAuthority/);
  assert.equal(buildView(snapshot([a]), { window: b.window }, '2026-10-04T00:00:00Z').rows.length, 1);
});
test('presentation formats currency with explicit source exponent rather than assuming cents', () => {
  const view = buildView(snapshot([fact('mrr', 1234, { id: 'jpy', currency: 'JPY', currencyExponent: 0 }),
    fact('mrr', 1234, { id: 'usd' })]), {}, '2026-10-04T00:00:00Z');
  const html = renderToStaticMarkup(React.createElement(BusinessInsightsView, { rows: view.rows, catalog: [], generatedAt: view.snapshot.generatedAt }));
  assert.ok(html.includes('JPY 1,234')); assert.ok(html.includes('USD 12.34'));
});
test('Signal: observed raw source accounts do not certify normalized registrations/environment', () => {
  const raw = fact('source_auth_accounts_current', 10, { scope: { ...scope, platform: 'unknown' }, evidence: { ...evidence, environment: 'unknown' }, window: { kind: 'snapshot', at: period.end } });
  assert.equal(parseSnapshot(snapshot([raw])).observations[0].value, 10);
  assert.throws(() => parseSnapshot(snapshot([{ ...raw, metric: 'registered_users', entity: 'account' }])), /unqualifiedBusinessMetric/);
  const unknown = fact('registered_users', null, { evidence: { ...evidence, environment: 'unknown', coverage: 'missing', note: 'production/registration/test exclusions unverified' }, window: { kind: 'snapshot', at: period.end } });
  assert.equal(parseSnapshot(snapshot([raw, unknown])).observations[1].value, null);
});
test('Signal: pending cohort and suppressed numerator distinct from undefined zero denominator', () => {
  const d = fact('trial_cohort', 10), n = fact('converted_trial_cohort', null, { evidence: { ...evidence, coverage: 'pending_maturity', maturity: 'pending' } });
  assert.equal(rate(n, d, 'trial_conversion').status, 'pending_maturity');
  assert.equal(rate({ ...n, evidence: { ...n.evidence, coverage: 'suppressed', maturity: 'complete' } }, d, 'trial_conversion').status, 'suppressed');
  assert.equal(rate(fact('converted_trial_cohort', 0), fact('trial_cohort', 0), 'trial_conversion').status, 'undefined');
});
test('Signal: rounded historical provider MRR is observable but cannot certify exact ARR', () => {
  const raw = fact('source_rc_mrr', 300, { window: { kind: 'snapshot', at: period.end }, evidence: { ...evidence, precision: 'rounded', authority: 'historical_report' } });
  assert.equal(parseSnapshot(snapshot([raw])).observations[0].value, 300);
  assert.throws(() => parseSnapshot(snapshot([{ ...raw, metric: 'mrr' }])), /unqualifiedBusinessMetric/);
  assert.equal(monthlyRecurring(group({ precision: 'rounded' })).value, null);
  assert.equal(annualRecurring({ value: 3, status: 'measured', reason: 'Rounded native card', evidenceIds: ['native'] }).value, null);
});
test('Signal: chain/customer/seat units cannot be silently interchanged', () => {
  assert.throws(() => parseSnapshot(snapshot([fact('paid_subscribers', 2, { entity: 'customer' })])), /wrongEntity/);
  assert.equal(parseSnapshot(snapshot([fact('paid_subscribers', 2), fact('paying_customers', 1), fact('paid_seats', 5)])).observations.length, 3);
});
test('Signal: source microsecond provenance survives validation unchanged', () => {
  const r = fact('source_auth_accounts_current', 10, { evidence: { ...evidence, observedAt: '2026-10-02T00:00:00.016270Z' }, window: { kind: 'snapshot', at: period.end } });
  assert.equal(parseSnapshot(snapshot([r])).observations[0].evidence.observedAt, '2026-10-02T00:00:00.016270Z');
});
test('Signal: exact normalized fractional minor MRR preserved through annualization', () => {
  const r = monthlyRecurring(group({ catalog: plan({ interval: 'month', intervalCount: 3 }), contractedAmountMinor: 100 }));
  assert.deepEqual(r.exact, { numerator: '100', denominator: '3' });
  assert.deepEqual(annualRecurring(r).exact, { numerator: '400', denominator: '1' });
  const w = monthlyRecurring(group({ catalog: plan({ interval: 'week' }), contractedAmountMinor: 1200 }), { weeksPerYear: 52, evidence: 'tao-business-v1' });
  assert.equal(w.value, 5200); assert.equal(annualRecurring(w).value, 62400);
});
test('Signal: distinct provider price/base-plan/offer identity preserved for current and legacy offers', () => {
  const plans = [plan({ priceId: 'old-price', lifecycle: 'legacy' }), plan({ id: 'new', priceId: 'new-price', lifecycle: 'current' }),
    plan({ id: 'intro', priceId: 'new-price', offerId: 'eligible-intro' })];
  assert.equal(parseSnapshot(snapshot([], plans)).catalog.length, 3);
});
test('Signal: unknown historical observation is not refreshed to extraction/page load time', () => {
  const raw = fact('source_rc_mrr', 300, { window: { kind: 'snapshot', at: period.end }, evidence: { ...evidence, observedAt: null,
    coverage: 'partial', precision: 'rounded', authority: 'historical_report', note: 'original time unknown' } });
  const view = buildView(snapshot([raw]), {}, '2026-10-04T00:00:00Z');
  assert.equal(view.rows[0].stale, null);
  assert.ok(renderToStaticMarkup(React.createElement(BusinessInsightsView, { rows: view.rows, catalog: [], generatedAt: view.snapshot.generatedAt })).includes('Freshness unknown'));
});
test('Signal: paid-through cancellation counts, post-paid-through grace/refunded/revoked do not', () => {
  assert.equal(monthlyRecurring(group({ state: 'paid_cancel_scheduled' })).value, 800);
  for (const state of ['grace_after_paid_through', 'refunded', 'revoked']) assert.equal(monthlyRecurring(group({ state })).value, 0);
});
test('Signal: unknown offer identity remains unknown rather than an invented SKU', () => {
  assert.equal(parseSnapshot(snapshot([], [plan({ productId: null, lifecycle: 'unknown' })])).catalog[0].productId, null);
  assert.equal(monthlyRecurring(group({ catalog: plan({ productId: null, lifecycle: 'unknown' }) })).value, null);
});
test('Signal: completed period needs source watermark and exact source minor units', () => {
  assert.throws(() => parseSnapshot(snapshot([fact('active_users', 1, { evidence: { ...evidence, dataCompleteThrough: null } })])), /incompleteWatermark/);
  assert.throws(() => parseSnapshot(snapshot([fact('mrr', 1.5)])), /fractionalSourceMinor/);
});
test('Signal: unknown source period is explicit; extraction time cannot invent historic business window', () => {
  const raw = fact('source_rc_active_customers_28d', 4, { window: { kind: 'unknown', reason: 'Original extract/window endpoints not retained' },
    evidence: { ...evidence, coverage: 'partial', observedAt: null, note: 'dated historical provider report' } });
  assert.equal(parseSnapshot(snapshot([raw])).observations[0].window.kind, 'unknown');
  assert.throws(() => parseSnapshot(snapshot([{ ...raw, evidence: { ...evidence } }])), /measuredUnknownWindow/);
});
test('full portfolio scope cannot be certified from a two-app subset even with exact row IDs', () => {
  const rows = [fact('mrr', 100, { id: 'a' }), fact('mrr', 200, { id: 'b', scope: { ...scope, app: 'glyph' } })];
  assert.equal(portfolioSum(rows, { complete: true, reference: 'synthetic-proof', ids: ['a', 'b'] }).status, 'unavailable');
});
test('Bridge interface uses canonical agentic-media ID and returns directly renderable filtered model', () => {
  const input = snapshot([fact('active_users', 10, { scope: { ...scope, app: 'agentic-media', platform: 'web' } })], [plan(), plan({ id: 'agentic-plan', app: 'agentic-media' })]);
  const model = buildBusinessInsights(input, { apps: ['agentic-media'] }, '2026-10-04T00:00:00Z');
  assert.equal(model.rows.length, 1); assert.equal(model.catalog.length, 1); assert.equal(model.catalog[0].app, 'agentic-media');
  assert.equal(model.schemaVersion, 2);
  assert.ok(renderToStaticMarkup(React.createElement(BusinessInsightsView, model)).includes('agentic-media'));
  assert.throws(() => buildBusinessInsights({ ...input, observations: [{ ...input.observations[0], scope: { ...scope, app: 'agenticmedia' } }] }, {}, '2026-10-04T00:00:00Z'));
});
test('catalog platform filtering does not infer applicability from channel or leak other-platform offers', () => {
  const input = snapshot([], [plan(), plan({ id: 'android', productId: 'test-android', platform: 'android' }), plan({ id: 'unknown', productId: null, lifecycle: 'unknown', platform: 'unknown' })]);
  assert.deepEqual(buildBusinessInsights(input, { platforms: ['ios'] }, '2026-10-04T00:00:00Z').catalog.map(p => p.id), ['synthetic-plan']);
  assert.equal(buildBusinessInsights(input, { platforms: [] }, '2026-10-04T00:00:00Z').catalog.length, 0);
});
