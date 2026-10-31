export const APPS = ['aura', 'reelchef', 'agentic-media', 'notare', 'glyph'] as const;
export type App = typeof APPS[number];
export const METRICS = [
  'registered_users', 'active_users', 'first_time_downloads', 'redownloads',
  'paying_customers', 'paid_subscribers', 'active_trials', 'trial_cohort',
  'converted_trial_cohort', 'opening_paying_customers', 'lost_opening_paying_customers',
  'opening_mrr', 'lost_opening_mrr', 'cohort_size', 'cohort_retained',
  'mrr', 'arr', 'recurring_revenue', 'one_time_revenue', 'refunds',
  'source_auth_accounts_current', 'source_contact_confirmed_accounts', 'source_rc_active_customers_28d', 'source_rc_mrr',
  'play_new_user_acquisitions', 'play_returning_user_acquisitions', 'play_device_acquisitions',
  'at_risk_entitled_mrr', 'paid_seats', 'active_installations',
] as const;
export type Metric = typeof METRICS[number];
export type Coverage = 'measured' | 'partial' | 'missing' | 'blocked' | 'unavailable' | 'suppressed' | 'pending_maturity' | 'not_applicable';
export type Window = { kind: 'snapshot'; at: string } | { kind: 'period'; start: string; end: string } | { kind: 'unknown'; reason: string };
export interface Evidence {
  source: string;
  reference: string;
  observedAt: string | null;
  extractedAt: string;
  definition: string;
  coverage: Coverage;
  note: string;
  environment: 'production' | 'sandbox' | 'unknown';
  authority: 'direct_aggregate' | 'provider_native' | 'owner_source' | 'historical_report' | 'synthetic_fixture';
  precision: 'exact' | 'rounded' | 'unknown';
  maturity: 'complete' | 'pending' | 'unknown' | 'not_applicable';
  timezone: string;
  dataCompleteThrough: string | null;
}
export interface Scope {
  app: App | 'portfolio';
  platform: 'ios' | 'android' | 'web' | 'desktop' | 'all' | 'unknown';
  territory: string;
  channel: string;
  /** Aggregate population definition; never a customer identifier. */
  population: string;
  cohort: string | null;
}
export interface Observation {
  id: string;
  metric: Metric;
  value: number | null;
  unit: 'count' | 'minor';
  entity: 'account' | 'installation' | 'download' | 'subscription_chain' | 'customer' | 'seat' | 'provider_customer' | 'source_account' | 'device' | null;
  currency: string | null;
  currencyExponent: number | null;
  scope: Scope;
  window: Window;
  evidence: Evidence;
}
export interface CatalogEntry {
  id: string;
  app: App;
  platform: Scope['platform'];
  channel: string;
  provider: string;
  territory: string;
  productId: string | null;
  accountScope: string;
  environment: Evidence['environment'];
  priceId: string | null;
  offerId: string | null;
  effectiveFrom: string | null;
  effectiveUntil: string | null;
  quantityUnit: 'subscription' | 'seat' | 'credits' | 'license' | 'unknown';
  taxTreatment: 'exclusive' | 'inclusive' | 'unknown';
  name: string;
  lifecycle: 'current' | 'legacy' | 'unknown';
  kind: 'subscription' | 'lifetime' | 'credit_pack' | 'addon' | 'one_time' | 'free';
  billing: 'recurring' | 'one_time' | 'free' | 'unknown';
  interval: 'day' | 'week' | 'month' | 'year' | null;
  intervalCount: number | null;
  currency: string | null;
  currencyExponent: number | null;
  listPriceMinor: number | null;
  evidence: Evidence;
}
export interface Snapshot {
  schemaVersion: 2;
  generatedAt: string;
  observations: Observation[];
  catalog: CatalogEntry[];
}
export interface Result {
  value: number | null;
  status: 'measured' | 'undefined' | 'unavailable' | 'incomparable' | 'pending_maturity' | 'suppressed';
  reason: string;
  evidenceIds: string[];
  /** Exact normalized minor-unit fraction for monetary calculations; round only for presentation. */
  exact?: { numerator: string; denominator: string };
}
export interface Filters {
  apps?: Scope['app'][];
  platforms?: Scope['platform'][];
  territory?: string;
  channel?: string;
  currency?: string;
  /** Exact period/snapshot selection; no prorating or summing snapshots. */
  window?: Window;
}
export interface ViewRow {
  observation: Observation;
  stale: boolean | null;
}
export interface DerivedMetric {
  label: string;
  scope: Scope;
  window: Window;
  result: Result;
}
