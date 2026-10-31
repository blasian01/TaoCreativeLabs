import { APPS, METRICS } from './types';
import type { Snapshot } from './types';

type RecordValue = Record<string, unknown>;
function fail(path: string): never { throw new Error(`Invalid aggregate snapshot: ${path}`); }
function record(value: unknown, keys: string[], path: string): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(path);
  const row = value as RecordValue;
  if (Object.keys(row).some(key => !keys.includes(key)) || keys.some(key => !(key in row))) fail(`${path}.fields`);
  return row;
}
function text(value: unknown, path: string, max = 500): asserts value is string {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\u0000-\u001f\u007f]/.test(value)) fail(path);
}
function oneOf(value: unknown, values: readonly unknown[], path: string) { if (!values.includes(value)) fail(path); }
function date(value: unknown, path: string): number {
  if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,6})?Z$/.test(value)) fail(path);
  const ms = Date.parse(value as string);
  if (!Number.isFinite(ms) || new Date(ms).toISOString().slice(0, 19) !== (value as string).slice(0, 19)) fail(path);
  return ms;
}
function amount(value: unknown, path: string) { if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER) fail(path); }
function evidence(value: unknown, path: string, generatedAt: number) {
  const r = record(value, ['source', 'reference', 'observedAt', 'extractedAt', 'definition', 'coverage', 'note', 'environment', 'authority',
    'precision', 'maturity', 'timezone', 'dataCompleteThrough'], path);
  for (const key of ['source', 'reference', 'definition']) text(r[key], `${path}.${key}`);
  if (typeof r.note !== 'string' || r.note.length > 1000 || /[\u0000-\u001f\u007f]/.test(r.note)) fail(`${path}.note`);
  if (r.observedAt !== null && date(r.observedAt, `${path}.observedAt`) > generatedAt) fail(`${path}.futureObservation`);
  const extracted = date(r.extractedAt, `${path}.extractedAt`);
  if (extracted > generatedAt || (r.observedAt !== null && date(r.observedAt, path) > extracted)) fail(`${path}.extractionTime`);
  oneOf(r.coverage, ['measured', 'partial', 'missing', 'blocked', 'unavailable', 'suppressed', 'pending_maturity', 'not_applicable'], `${path}.coverage`);
  oneOf(r.environment, ['production', 'sandbox', 'unknown'], `${path}.environment`);
  oneOf(r.authority, ['direct_aggregate', 'provider_native', 'owner_source', 'historical_report', 'synthetic_fixture'], `${path}.authority`);
  oneOf(r.precision, ['exact', 'rounded', 'unknown'], `${path}.precision`);
  oneOf(r.maturity, ['complete', 'pending', 'unknown', 'not_applicable'], `${path}.maturity`);
  if (r.observedAt === null && (r.coverage === 'measured' || !String(r.note).trim())) fail(`${path}.unknownObservationTime`);
  text(r.timezone, `${path}.timezone`, 100);
  try { new Intl.DateTimeFormat('en-US', { timeZone: r.timezone as string }); } catch { fail(`${path}.timezone`); }
  if (r.dataCompleteThrough !== null && date(r.dataCompleteThrough, `${path}.watermark`) > (r.observedAt === null ? extracted : date(r.observedAt, `${path}.observedAt`))) fail(`${path}.futureWatermark`);
  return r;
}
function money(currency: unknown, exponent: unknown, path: string, required: boolean) {
  if (currency === null && exponent === null && !required) return;
  if (typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency) ||
      typeof exponent !== 'number' || !Number.isInteger(exponent) || exponent < 0 || exponent > 4) fail(`${path}.currency`);
}
const MONEY_METRICS = new Set(['opening_mrr', 'lost_opening_mrr', 'mrr', 'arr', 'recurring_revenue', 'one_time_revenue', 'refunds', 'source_rc_mrr', 'at_risk_entitled_mrr']);
const FLOW_METRICS = new Set(['active_users', 'first_time_downloads', 'redownloads', 'trial_cohort', 'converted_trial_cohort',
  'opening_paying_customers', 'lost_opening_paying_customers', 'opening_mrr', 'lost_opening_mrr', 'cohort_size', 'cohort_retained',
  'recurring_revenue', 'one_time_revenue', 'refunds', 'source_rc_active_customers_28d', 'active_installations',
  'play_new_user_acquisitions', 'play_returning_user_acquisitions', 'play_device_acquisitions']);

/** Strict bounded DTO parser. No raw customer/event payloads or arbitrary extra fields accepted. */
export function parseSnapshot(input: unknown): Snapshot {
  const root = record(input, ['schemaVersion', 'generatedAt', 'observations', 'catalog'], 'root');
  if (root.schemaVersion !== 2) fail('schemaVersion');
  const generatedAt = date(root.generatedAt, 'generatedAt');
  if (!Array.isArray(root.observations) || root.observations.length > 5000 ||
      !Array.isArray(root.catalog) || root.catalog.length > 2000) fail('batchSize');
  const ids = new Set<string>();
  const logical = new Set<string>();
  root.observations.forEach((value, i) => {
    const p = `observations[${i}]`;
    const r = record(value, ['id', 'metric', 'value', 'unit', 'entity', 'currency', 'currencyExponent', 'scope', 'window', 'evidence'], p);
    text(r.id, `${p}.id`, 160);
    if (ids.has(r.id)) fail(`${p}.duplicateId`);
    ids.add(r.id);
    oneOf(r.metric, METRICS, `${p}.metric`);
    const monetary = MONEY_METRICS.has(r.metric as string);
    if (r.unit !== (monetary ? 'minor' : 'count')) fail(`${p}.unit`);
    money(r.currency, r.currencyExponent, p, monetary);
    if (!monetary && (r.currency !== null || r.currencyExponent !== null)) fail(`${p}.countCurrency`);
    const e = evidence(r.evidence, `${p}.evidence`, generatedAt);
    const native = String(r.metric).startsWith('source_') || String(r.metric).startsWith('play_') || ['first_time_downloads', 'redownloads'].includes(String(r.metric));
    if (!native && e.coverage === 'measured' && (e.environment !== 'production' || e.precision !== 'exact')) fail(`${p}.unqualifiedBusinessMetric`);
    if (monetary) { if (r.entity !== null) fail(`${p}.moneyEntity`); }
    else oneOf(r.entity, ['account', 'installation', 'download', 'subscription_chain', 'customer', 'seat', 'provider_customer', 'source_account', 'device'], `${p}.entity`);
    const expectedEntities: Record<string, string> = { registered_users: 'account', active_users: 'account', paying_customers: 'customer',
      paid_subscribers: 'subscription_chain', active_trials: 'subscription_chain', trial_cohort: 'subscription_chain', converted_trial_cohort: 'subscription_chain',
      opening_paying_customers: 'customer', lost_opening_paying_customers: 'customer', first_time_downloads: 'download', redownloads: 'download',
      paid_seats: 'seat', active_installations: 'installation', source_auth_accounts_current: 'source_account', source_contact_confirmed_accounts: 'source_account',
      source_rc_active_customers_28d: 'provider_customer', play_new_user_acquisitions: 'account', play_returning_user_acquisitions: 'account', play_device_acquisitions: 'device' };
    if (expectedEntities[String(r.metric)] && r.entity !== expectedEntities[String(r.metric)]) fail(`${p}.wrongEntity`);
    if (r.value === null) { if (e.coverage === 'measured') fail(`${p}.measuredNull`); }
    else {
      amount(r.value, `${p}.value`);
      if (!Number.isSafeInteger(r.value)) fail(`${p}.${monetary ? 'fractionalSourceMinor' : 'fractionalCount'}`);
      if (['missing', 'blocked', 'unavailable', 'suppressed', 'pending_maturity', 'not_applicable'].includes(e.coverage as string)) fail(`${p}.unknownValue`);
    }
    const s = record(r.scope, ['app', 'platform', 'territory', 'channel', 'population', 'cohort'], `${p}.scope`);
    oneOf(s.app, [...APPS, 'portfolio'], `${p}.app`);
    oneOf(s.platform, ['ios', 'android', 'web', 'desktop', 'all', 'unknown'], `${p}.platform`);
    for (const key of ['territory', 'channel', 'population']) text(s[key], `${p}.${key}`, 200);
    if (s.cohort !== null) text(s.cohort, `${p}.cohort`, 200);
    const rawWindow = r.window as RecordValue | null;
    const w = record(rawWindow, rawWindow?.kind === 'snapshot' ? ['kind', 'at'] : rawWindow?.kind === 'unknown' ? ['kind', 'reason'] : ['kind', 'start', 'end'], `${p}.window`);
    if (w.kind === 'snapshot') {
      if (FLOW_METRICS.has(r.metric as string)) fail(`${p}.requiresPeriod`);
      if (date(w.at, `${p}.at`) > generatedAt) fail(`${p}.futureSnapshot`);
      if (e.coverage === 'measured' && date(w.at, `${p}.at`) > date(e.observedAt, `${p}.observedAt`)) fail(`${p}.unobservedSnapshot`);
    } else if (w.kind === 'unknown') {
      text(w.reason, `${p}.unknownWindowReason`);
      if (e.coverage === 'measured') fail(`${p}.measuredUnknownWindow`);
    } else {
      if (w.kind !== 'period' || date(w.start, `${p}.start`) >= date(w.end, `${p}.end`) ||
          date(w.end, `${p}.end`) > generatedAt) fail(`${p}.period`);
      if (e.coverage === 'measured' && date(w.end, `${p}.end`) > date(e.observedAt, `${p}.observedAt`)) fail(`${p}.incompletePeriod`);
      if (e.coverage === 'measured' && (e.dataCompleteThrough === null || date(e.dataCompleteThrough, p) < date(w.end, p))) fail(`${p}.incompleteWatermark`);
    }
    // Source and definition intentionally omitted: two competing sources cannot silently both become authoritative.
    const key = JSON.stringify([r.metric, ...['app', 'platform', 'territory', 'channel', 'population', 'cohort'].map(k => s[k]),
      w.kind, w.at ? Date.parse(w.at as string) : null, w.start ? Date.parse(w.start as string) : null,
      w.end ? Date.parse(w.end as string) : null, w.reason ?? null, r.currency, r.currencyExponent]);
    if (logical.has(key)) fail(`${p}.overlappingAuthority`);
    logical.add(key);
  });
  const catalogIds = new Set<string>();
  const productKeys = new Set<string>();
  root.catalog.forEach((value, i) => {
    const p = `catalog[${i}]`;
    const r = record(value, ['id', 'app', 'platform', 'channel', 'provider', 'territory', 'productId', 'name', 'lifecycle', 'kind', 'billing', 'interval',
      'intervalCount', 'currency', 'currencyExponent', 'listPriceMinor', 'evidence', 'accountScope', 'environment', 'priceId', 'offerId',
      'effectiveFrom', 'effectiveUntil', 'quantityUnit', 'taxTreatment'], p);
    for (const key of ['id', 'channel', 'provider', 'territory', 'name']) text(r[key], `${p}.${key}`, 200);
    if (r.productId !== null) text(r.productId, `${p}.productId`, 200);
    else if (r.lifecycle !== 'unknown') fail(`${p}.unknownProductIdentity`);
    if (catalogIds.has(r.id as string)) fail(`${p}.duplicateId`);
    catalogIds.add(r.id as string);
    oneOf(r.app, APPS, `${p}.app`);
    oneOf(r.platform, ['ios', 'android', 'web', 'desktop', 'all', 'unknown'], `${p}.platform`);
    text(r.accountScope, `${p}.accountScope`, 200);
    oneOf(r.environment, ['production', 'sandbox', 'unknown'], `${p}.environment`);
    for (const key of ['priceId', 'offerId']) if (r[key] !== null) text(r[key], `${p}.${key}`, 200);
    for (const key of ['effectiveFrom', 'effectiveUntil']) if (r[key] !== null) date(r[key], `${p}.${key}`);
    if (r.effectiveFrom && r.effectiveUntil && date(r.effectiveFrom, p) >= date(r.effectiveUntil, p)) fail(`${p}.effectiveRange`);
    oneOf(r.quantityUnit, ['subscription', 'seat', 'credits', 'license', 'unknown'], `${p}.quantityUnit`);
    oneOf(r.taxTreatment, ['exclusive', 'inclusive', 'unknown'], `${p}.taxTreatment`);
    oneOf(r.lifecycle, ['current', 'legacy', 'unknown'], `${p}.lifecycle`);
    oneOf(r.kind, ['subscription', 'lifetime', 'credit_pack', 'addon', 'one_time', 'free'], `${p}.kind`);
    oneOf(r.billing, ['recurring', 'one_time', 'free', 'unknown'], `${p}.billing`);
    if (['lifetime', 'credit_pack', 'one_time', 'free'].includes(r.kind as string) && r.billing === 'recurring') fail(`${p}.nonrecurringKind`);
    money(r.currency, r.currencyExponent, p, r.listPriceMinor !== null);
    if (r.listPriceMinor !== null) { amount(r.listPriceMinor, `${p}.listPrice`); if (!Number.isSafeInteger(r.listPriceMinor)) fail(`${p}.fractionalMinor`); }
    if (r.billing === 'recurring') {
      oneOf(r.interval, ['day', 'week', 'month', 'year'], `${p}.interval`);
      if (typeof r.intervalCount !== 'number' || !Number.isSafeInteger(r.intervalCount) || r.intervalCount < 1) fail(`${p}.intervalCount`);
    } else if (r.interval !== null || r.intervalCount !== null) fail(`${p}.nonrecurringInterval`);
    evidence(r.evidence, `${p}.evidence`, generatedAt);
    const key = JSON.stringify([r.app, r.platform, r.channel, r.provider, r.territory, r.productId, r.currency, r.accountScope, r.environment,
      r.priceId, r.offerId, r.effectiveFrom, r.productId === null ? r.id : null]);
    if (productKeys.has(key)) fail(`${p}.duplicateProduct`);
    productKeys.add(key);
  });
  // New object graph prevents later caller mutations from changing this validated snapshot.
  return JSON.parse(JSON.stringify(input)) as Snapshot;
}
