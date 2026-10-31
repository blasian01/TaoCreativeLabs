import type { CatalogEntry, DerivedMetric, Filters, Snapshot, ViewRow } from './types';
import { parseSnapshot } from './validate';
import { coverageActions, rate, windowKey } from './metrics';

export interface BusinessInsightsModel {
  schemaVersion: 2;
  generatedAt: string;
  rows: ViewRow[];
  catalog: CatalogEntry[];
  derived: DerivedMetric[];
  collectionActions: { action: string; evidenceIds: string[] }[];
}

/** Protected Bridge loaders can pass this model directly to the pure component. No provider fetch or auth here. */
export function buildBusinessInsights(input: unknown, filters: Filters, now: string, staleAfterHours = 48): BusinessInsightsModel {
  const { snapshot, rows } = buildView(input, filters, now, staleAfterHours);
  const catalog = snapshot.catalog.filter(p =>
    (!filters.platforms || filters.platforms.includes(p.platform) || (p.platform === 'all' && filters.platforms.length > 0)) &&
    (!filters.apps || filters.apps.includes(p.app)) && (!filters.territory || filters.territory === p.territory) &&
    (!filters.channel || filters.channel === p.channel) && (!filters.currency || filters.currency === p.currency));
  return { schemaVersion: 2, generatedAt: snapshot.generatedAt, rows, catalog, derived: deriveRates(rows),
    collectionActions: coverageActions(rows.map(r => r.observation)) };
}

export function buildView(input: unknown, filters: Filters, now: string, staleAfterHours = 48): { snapshot: Snapshot; rows: ViewRow[] } {
  const snapshot = parseSnapshot(input);
  const clock = Date.parse(now);
  if (!Number.isFinite(clock) || clock < Date.parse(snapshot.generatedAt) || !Number.isFinite(staleAfterHours) || staleAfterHours <= 0) {
    throw new Error('Invalid freshness policy/clock');
  }
  const rows = snapshot.observations.filter(o =>
    (!filters.apps || filters.apps.includes(o.scope.app)) &&
    (!filters.platforms || filters.platforms.includes(o.scope.platform)) &&
    (!filters.territory || filters.territory === o.scope.territory) &&
    (!filters.channel || filters.channel === o.scope.channel) &&
    (!filters.currency || filters.currency === o.currency) &&
    (!filters.window || windowKey(filters.window) === windowKey(o.window)),
  ).map(observation => ({ observation, stale: observation.evidence.observedAt === null ? null : clock - Date.parse(observation.evidence.observedAt) > staleAfterHours * 3600000 }));
  return { snapshot, rows };
}

function cell(value: unknown): string {
  let text = value === null || value === undefined ? '' : String(value);
  // Leading whitespace/control + formula initiator is unsafe in Excel/Sheets, even in quoted CSV.
  if (/^[\s\u0000-\u001f]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
/** Pure serialization only. Bridge must authorize the export endpoint and set private/no-store. */
export function exportRows(rows: ViewRow[]): string {
  const columns = ['id', 'app', 'platform', 'territory', 'channel', 'population', 'cohort', 'metric', 'value', 'unit', 'entity', 'currency',
    'currency_exponent', 'window', 'coverage', 'source', 'reference', 'observed_at', 'definition', 'note', 'environment', 'authority',
    'precision', 'maturity', 'timezone', 'data_complete_through', 'extracted_at', 'stale'];
  return [columns, ...rows.map(({ observation: o, stale }) => [o.id, o.scope.app, o.scope.platform, o.scope.territory,
    o.scope.channel, o.scope.population, o.scope.cohort, o.metric, o.value, o.unit, o.entity, o.currency, o.currencyExponent,
    windowKey(o.window), o.evidence.coverage, o.evidence.source, o.evidence.reference, o.evidence.observedAt,
    o.evidence.definition, o.evidence.note, o.evidence.environment, o.evidence.authority, o.evidence.precision,
    o.evidence.maturity, o.evidence.timezone, o.evidence.dataCompleteThrough, o.evidence.extractedAt, stale])].map(row => row.map(cell).join(',')).join('\r\n');
}

/** No fuzzy joins: derive only exact evidenced cohorts. Unsupported rates stay explicitly unavailable. */
export function deriveRates(rows: ViewRow[]): DerivedMetric[] {
  const kinds = ['trial_conversion', 'customer_churn', 'revenue_churn', 'retention'] as const;
  const pairs = [['converted_trial_cohort', 'trial_cohort'], ['lost_opening_paying_customers', 'opening_paying_customers'],
    ['lost_opening_mrr', 'opening_mrr'], ['cohort_retained', 'cohort_size']] as const;
  return kinds.flatMap((kind, i) => rows.filter(r => r.observation.metric === pairs[i][1]).map(({ observation: denominator }) => {
    const numerator = rows.map(r => r.observation).find(o => o.metric === pairs[i][0] &&
      windowKey(o.window) === windowKey(denominator.window) && o.evidence.source === denominator.evidence.source &&
      (Object.keys(denominator.scope) as (keyof typeof denominator.scope)[]).every(k => o.scope[k] === denominator.scope[k]));
    return { label: kind, scope: denominator.scope, window: denominator.window,
      result: numerator ? rate(numerator, denominator, kind) : {
        value: null, status: 'unavailable' as const, reason: 'Matching evidenced numerator missing.', evidenceIds: [denominator.id],
      } };
  }));
}
