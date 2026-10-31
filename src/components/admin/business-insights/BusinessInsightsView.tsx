import React from 'react';
import type { CatalogEntry, DerivedMetric, ViewRow } from '../../../lib/business-insights/types';
import { windowKey } from '../../../lib/business-insights/metrics';

function money(value: number, currency: string, exponent: number): string {
  return `${currency} ${(value / 10 ** exponent).toLocaleString('en-US', { minimumFractionDigits: exponent, maximumFractionDigits: Math.max(exponent, 6) })}`;
}

/** Presentational only. Render ONLY behind Bridge's authenticated owner boundary; never embed seed data. */
export function BusinessInsightsView({ rows, catalog, generatedAt, derived = [] }: {
  rows: ViewRow[]; catalog: CatalogEntry[]; generatedAt: string; derived?: DerivedMetric[];
}) {
  return <section aria-labelledby="business-insights-heading" className="space-y-6">
    <header>
      <h2 id="business-insights-heading" className="text-2xl font-semibold">Business insights</h2>
      <p>Evidence snapshot generated <time dateTime={generatedAt}>{generatedAt}</time>. Unknown values are not zero.</p>
    </header>
    <p>Filters select exact app, platform, territory, channel, currency and window. Downloads are not users.
      Portfolio unique-user totals require a verified deduplicated population; currencies remain separate.</p>
    {!rows.length ? <p role="status">No evidence matches these filters. This does not establish zero activity.</p> :
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Business metric evidence table">
        <table className="w-full text-left text-sm">
          <caption className="text-left">Measured values and coverage. Money remains grouped by currency; exports retain source units.</caption>
          <thead><tr>{['App / platform', 'Metric / population', 'Value', 'Window / territory', 'Coverage / freshness', 'Source / definition'].map(h =>
            <th key={h} scope="col" className="p-3">{h}</th>)}</tr></thead>
          <tbody>{rows.map(({ observation: o, stale }) => <tr key={o.id}>
            <td className="p-3">{o.scope.app} / {o.scope.platform}<br />{o.scope.channel}</td>
            <th scope="row" className="p-3 font-normal">{o.metric}<br />{o.scope.population}{o.scope.cohort && ` / ${o.scope.cohort}`}</th>
            <td className="p-3">{o.value === null ? 'Unknown' : o.unit === 'minor' ? money(o.value, o.currency!, o.currencyExponent!)
              : o.value.toLocaleString('en-US')}{o.unit === 'count' ? ` ${o.entity}` : ''}</td>
            <td className="p-3">{windowKey(o.window)}<br />{o.scope.territory}</td>
            <td className="p-3">{o.evidence.coverage} / {stale === null ? 'Freshness unknown' : stale ? 'Stale' : 'Within freshness policy'}<br />
              {o.evidence.observedAt === null ? 'Original observation time unknown' : <time dateTime={o.evidence.observedAt}>{o.evidence.observedAt}</time>}<br />
              {o.evidence.environment}; {o.evidence.precision}; {o.evidence.maturity}; {o.evidence.timezone}</td>
            <td className="p-3">{o.evidence.source}: {o.evidence.reference}<br />{o.evidence.definition}<br />{o.evidence.note}</td>
          </tr>)}</tbody>
        </table>
      </div>}
    {derived.length > 0 && <section aria-label="Cohort rates"><h3 className="text-xl font-semibold">Cohort rates</h3>
      <ul>{derived.map((d, i) => <li key={i}>{d.scope.app} / {d.scope.platform}: {d.label} —{' '}
        {d.result.value === null ? d.result.status : `${(d.result.value * 100).toFixed(2)}%`}. {d.result.reason}{' '}
        {windowKey(d.window)}; population {d.scope.population}; cohort {d.scope.cohort ?? 'not supplied'}; evidence {d.result.evidenceIds.join(', ')}.
      </li>)}</ul></section>}
    <h3 className="text-xl font-semibold">Observed plan catalog</h3>
    <p>List prices describe offers, not realized revenue. Legacy entries remain visible; missing catalog evidence is incomplete coverage.</p>
    {!catalog.length ? <p>No verified catalog supplied.</p> : <ul className="space-y-3">{catalog.map(p => <li key={p.id}>
      <strong>{p.app}: {p.name}</strong> — {p.lifecycle}, {p.kind}, {p.billing}, {p.provider} / {p.platform} / {p.channel} / {p.territory}, SKU {p.productId ?? 'identity unverified'}.{' '}
      {p.listPriceMinor === null ? 'Price unknown' : money(p.listPriceMinor, p.currency!, p.currencyExponent!)}
      {p.interval && ` / ${p.intervalCount} ${p.interval}`}; quantity {p.quantityUnit}; price {p.priceId ?? 'unknown'}; offer {p.offerId ?? 'none supplied'}; environment {p.environment}. Source: {p.evidence.source}, {p.evidence.reference};{' '}
      {p.evidence.coverage}, observed {p.evidence.observedAt ?? 'unknown'}. {p.evidence.note}
    </li>)}</ul>}
  </section>;
}
