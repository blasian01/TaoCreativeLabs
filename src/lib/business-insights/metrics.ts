import { APPS } from './types';
import type { App, CatalogEntry, Observation, Result, Window } from './types';

function fraction(n: bigint, d: bigint, ids: string[], reason: string): Result {
  if (d <= BigInt(0)) return result(null, 'unavailable', 'Invalid exact denominator.', ids);
  let a = n < BigInt(0) ? -n : n, b = d;
  while (b) { const r = a % b; a = b; b = r; }
  const gcd = a || BigInt(1); n /= gcd; d /= gcd;
  const value = Number(n) / Number(d);
  return Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER ? { ...result(value, 'measured', reason, ids), exact: { numerator: n.toString(), denominator: d.toString() } }
    : result(null, 'unavailable', 'Normalization overflow.', ids);
}

export function windowKey(window: Window): string {
  if (window.kind === 'unknown') return `unknown:${window.reason}`;
  const canonical = (value: string) => new Date(value).toISOString();
  return window.kind === 'snapshot' ? `snapshot:${canonical(window.at)}` : `period:${canonical(window.start)}/${canonical(window.end)}`;
}
function sameScope(a: Observation, b: Observation): boolean {
  return (Object.keys(a.scope) as (keyof typeof a.scope)[]).every(key => a.scope[key] === b.scope[key]);
}
function result(value: number | null, status: Result['status'], reason: string, ids: string[]): Result {
  return { value, status, reason, evidenceIds: ids };
}

/** Numerator must be a subset of the SAME population/window, established by ingestion. */
export function rate(
  numerator: Observation, denominator: Observation,
  kind: 'trial_conversion' | 'customer_churn' | 'revenue_churn' | 'retention',
): Result {
  const pairs = {
    trial_conversion: ['converted_trial_cohort', 'trial_cohort'],
    customer_churn: ['lost_opening_paying_customers', 'opening_paying_customers'],
    revenue_churn: ['lost_opening_mrr', 'opening_mrr'],
    retention: ['cohort_retained', 'cohort_size'],
  } as const;
  const ids = [numerator.id, denominator.id];
  if (numerator.metric !== pairs[kind][0] || denominator.metric !== pairs[kind][1] ||
      !sameScope(numerator, denominator) || windowKey(numerator.window) !== windowKey(denominator.window) ||
      numerator.window.kind !== 'period' || numerator.unit !== denominator.unit || numerator.entity !== denominator.entity ||
      numerator.evidence.source !== denominator.evidence.source ||
      numerator.evidence.timezone !== denominator.evidence.timezone ||
      numerator.currency !== denominator.currency || numerator.currencyExponent !== denominator.currencyExponent ||
      ((kind === 'retention' || kind === 'trial_conversion') && !denominator.scope.cohort)) {
    return result(null, 'incomparable', 'Requires matching definitions, population, cohort, currency and period.', ids);
  }
  if ([numerator, denominator].some(o => o.evidence.coverage === 'suppressed')) return result(null, 'suppressed', 'Source suppression policy withholds a required cell.', ids);
  if ([numerator, denominator].some(o => o.evidence.coverage === 'pending_maturity' || o.evidence.maturity === 'pending')) {
    return result(null, 'pending_maturity', 'Cohort follow-up is incomplete; not a failed conversion.', ids);
  }
  if ([numerator, denominator].some(o => o.evidence.coverage !== 'measured' || o.value === null)) {
    return result(null, 'unavailable', 'Complete measured numerator and denominator are required.', ids);
  }
  if ([numerator, denominator].some(o => o.evidence.precision !== 'exact' || o.evidence.environment !== 'production' || o.evidence.maturity !== 'complete')) {
    return result(null, 'unavailable', 'Exact production inputs and complete cohort maturity are required.', ids);
  }
  const n = numerator.value!;
  const d = denominator.value!;
  if (!Number.isFinite(n) || !Number.isFinite(d) || n < 0 || d < 0 || n > d) {
    return result(null, 'incomparable', 'Numerator must be a nonnegative subset of the denominator.', ids);
  }
  if (d === 0) return result(null, 'undefined', 'Zero denominator; no rate is defined.', ids);
  return result(n / d, 'measured', 'Fraction of the evidenced starting population/cohort; not a cancellation forecast.', ids);
}

export interface RecurringGroup {
  catalog: CatalogEntry;
  /** Sum of actual contracted recurring consideration after discounts, excluding tax/fees; NOT list price. */
  contractedAmountMinor: number | null;
  basis: 'contracted_recurring' | 'list_price' | 'unknown';
  state: 'paid_active' | 'paid_cancel_scheduled' | 'trial' | 'expired' | 'unpaid' | 'grace_after_paid_through' | 'refunded' | 'revoked';
  precision: 'exact' | 'rounded' | 'unknown';
  coverage: 'measured' | 'partial' | 'missing';
  evidenceIds: string[];
}

export function monthlyRecurring(group: RecurringGroup, dayPolicy?: { daysPerYear: number; evidence: string } | { weeksPerYear: 52; evidence: string }): Result {
  const ids = group.evidenceIds;
  // Known non-recurring or inactive consideration contributes no MRR. Unknown evidence never becomes zero.
  if (group.coverage !== 'measured' || group.catalog.evidence.coverage !== 'measured') {
    return result(null, 'unavailable', 'Incomplete recurring group/catalog evidence.', ids);
  }
  if (group.catalog.billing === 'unknown') return result(null, 'unavailable', 'Billing kind unknown.', ids);
  if (group.catalog.billing !== 'recurring' || ['trial', 'expired', 'unpaid', 'grace_after_paid_through', 'refunded', 'revoked'].includes(group.state)) {
    return fraction(BigInt(0), BigInt(1), ids, 'Excluded from conservative MRR: non-recurring, trial, expired, unpaid, post-paid-through grace or revoked/refunded.');
  }
  if (group.basis !== 'contracted_recurring' || group.contractedAmountMinor === null ||
      group.precision !== 'exact' || group.catalog.environment !== 'production' ||
      group.catalog.productId === null ||
      !Number.isSafeInteger(group.contractedAmountMinor) || group.contractedAmountMinor < 0) {
    return result(null, 'unavailable', 'Actual contracted recurring amount required; list price is not realized revenue.', ids);
  }
  const { interval, intervalCount, currency, currencyExponent } = group.catalog;
  if (!currency || currencyExponent === null || !intervalCount || !Number.isSafeInteger(intervalCount) || intervalCount < 1) {
    return result(null, 'unavailable', 'Missing billing interval or currency.', ids);
  }
  const amount = BigInt(group.contractedAmountMinor), count = BigInt(intervalCount);
  const reason = 'Exact monthly normalized contracted revenue, not receipts; scheduled cancellation remains active.';
  if (interval === 'month') return fraction(amount, count, ids, reason);
  if (interval === 'year') return fraction(amount, count * BigInt(12), ids, reason);
  if (interval === 'week' && dayPolicy && 'weeksPerYear' in dayPolicy && dayPolicy.weeksPerYear === 52 && dayPolicy.evidence.trim()) {
    return fraction(amount * BigInt(52), count * BigInt(12), ids, `${reason} Explicit 52-week conventional policy.`);
  }
  if ((interval === 'day' || interval === 'week') && dayPolicy && 'daysPerYear' in dayPolicy &&
      Number.isFinite(dayPolicy.daysPerYear) && dayPolicy.daysPerYear >= 365 && dayPolicy.daysPerYear <= 366 && dayPolicy.evidence.trim()) {
    const [whole, decimals = ''] = String(dayPolicy.daysPerYear).split('.');
    const days = BigInt(whole + decimals), scale = BigInt(10) ** BigInt(decimals.length);
    return fraction(amount * days, count * BigInt(interval === 'week' ? 7 : 1) * BigInt(12) * scale, ids, reason);
  }
  return result(null, 'unavailable', 'Day/week normalization requires an evidenced convention.', ids);
}

export function annualRecurring(mrr: Result): Result {
  if (mrr.value === null) return { ...mrr };
  if (mrr.status !== 'measured' || !mrr.exact) return result(null, 'unavailable', 'Exact qualified MRR fraction required; a rounded/native card cannot certify ARR.', mrr.evidenceIds);
  return fraction(BigInt(mrr.exact.numerator) * BigInt(12), BigInt(mrr.exact.denominator), mrr.evidenceIds, 'Exact ARR = unrounded MRR × 12; not a revenue forecast.');
}

/** Conservative portfolio sum: caller must supply audited cross-source disjointness/identity proof. */
export function portfolioSum(rows: Observation[], proof: { reference: string; ids: string[]; complete: boolean; apps?: App[] } | null): Result {
  const ids = rows.map(r => r.id);
  if (!rows.length || !proof?.complete || !proof.reference.trim() ||
      new Set(proof.ids).size !== ids.length || ids.some(id => !proof.ids.includes(id)) || new Set(ids).size !== ids.length) {
    return result(null, 'unavailable', 'Complete explicit disjoint-source/deduplicated-population proof required.', ids);
  }
  const expectedApps = proof.apps ?? [...APPS];
  if (!expectedApps.length || new Set(expectedApps).size !== expectedApps.length ||
      expectedApps.some(app => !APPS.includes(app) || !rows.some(r => r.scope.app === app)) ||
      rows.some(r => !expectedApps.includes(r.scope.app as App))) return result(null, 'unavailable', 'Expected portfolio app coverage incomplete; selected subsets must be explicit.', ids);
  const first = rows[0];
  if (rows.some(r => r.metric !== first.metric || r.unit !== first.unit || r.entity !== first.entity || r.currency !== first.currency ||
      r.currencyExponent !== first.currencyExponent || windowKey(r.window) !== windowKey(first.window) ||
      r.scope.platform !== first.scope.platform || r.scope.territory !== first.scope.territory ||
      r.scope.channel !== first.scope.channel || r.scope.cohort !== first.scope.cohort || r.scope.app === 'portfolio')) {
    return result(null, 'incomparable', 'Portfolio cannot mix currency, scope, windows or already aggregated portfolio rows.', ids);
  }
  if (rows.some(r => r.value === null || r.evidence.coverage !== 'measured' || r.evidence.environment !== 'production' || r.evidence.precision !== 'exact')) {
    return result(null, 'unavailable', 'Partial coverage is not a complete portfolio total.', ids);
  }
  if (rows.some(r => !Number.isSafeInteger(r.value))) return result(null, 'unavailable', 'Source aggregates must retain exact integer count/minor units.', ids);
  const sum = rows.reduce((total, r) => total + BigInt(r.value!), BigInt(0));
  return fraction(sum, BigInt(1), ids, `Aggregation proof: ${proof.reference}`);
}

export function trend(previous: Observation, current: Observation): Result {
  const ids = [previous.id, current.id];
  const a = previous.window, b = current.window;
  const compatible = a.kind === 'period' && b.kind === 'period' && Date.parse(a.end) === Date.parse(b.start) &&
    Date.parse(a.end) - Date.parse(a.start) === Date.parse(b.end) - Date.parse(b.start);
  if (!compatible || !sameScope(previous, current) || previous.metric !== current.metric ||
      previous.evidence.definition !== current.evidence.definition || previous.evidence.source !== current.evidence.source ||
      previous.unit !== current.unit || previous.entity !== current.entity || previous.evidence.timezone !== current.evidence.timezone ||
      previous.currency !== current.currency || previous.currencyExponent !== current.currencyExponent) {
    return result(null, 'incomparable', 'Trend needs adjacent equal-duration periods and matching source/definition/scope.', ids);
  }
  if ([previous, current].some(r => r.value === null || r.evidence.coverage !== 'measured' || r.evidence.precision !== 'exact' ||
      r.evidence.environment !== 'production' || (r.evidence.maturity !== 'complete' && r.evidence.maturity !== 'not_applicable'))) {
    return result(null, 'unavailable', 'Both periods must be measured completely.', ids);
  }
  if (previous.value === 0) return result(null, 'undefined', 'Zero baseline; percent change undefined.', ids);
  const value = (current.value! - previous.value!) / previous.value!;
  return Number.isFinite(value) ? result(value, 'measured', 'Descriptive change only; not causal attribution.', ids)
    : result(null, 'unavailable', 'Trend overflow.', ids);
}

/** Refunds are a separate cash-flow metric, never subtracted blindly from MRR. */
export function netReceipts(recurring: Observation, oneTime: Observation, refunds: Observation): Result {
  const rows = [recurring, oneTime, refunds];
  const ids = rows.map(o => o.id);
  if (recurring.metric !== 'recurring_revenue' || oneTime.metric !== 'one_time_revenue' || refunds.metric !== 'refunds' ||
      recurring.window.kind !== 'period' || rows.some(o => !sameScope(recurring, o) || o.unit !== 'minor' ||
        o.evidence.source !== recurring.evidence.source || o.evidence.timezone !== recurring.evidence.timezone ||
        o.currency !== recurring.currency || o.currencyExponent !== recurring.currencyExponent ||
        windowKey(o.window) !== windowKey(recurring.window))) {
    return result(null, 'incomparable', 'Cash receipts/refunds require matching period, population and currency.', ids);
  }
  if (rows.some(o => o.value === null || o.evidence.coverage !== 'measured')) return result(null, 'unavailable', 'Incomplete receipts/refunds evidence.', ids);
  if (rows.some(r => !Number.isSafeInteger(r.value) || r.evidence.precision !== 'exact' || r.evidence.environment !== 'production')) {
    return result(null, 'unavailable', 'Exact production source minor-unit receipts/refunds required.', ids);
  }
  const value = BigInt(recurring.value!) + BigInt(oneTime.value!) - BigInt(refunds.value!);
  return fraction(value, BigInt(1), ids, 'Net receipts = recurring + one-time receipts − refunds; can be negative. Not MRR or accounting revenue.');
}

export function coverageActions(rows: Observation[]): { action: string; evidenceIds: string[] }[] {
  return rows.filter(o => o.evidence.coverage !== 'measured').map(o => ({
    action: `Establish ${o.metric} coverage for ${o.scope.app}/${o.scope.platform} before drawing conclusions.`, evidenceIds: [o.id],
  }));
}
