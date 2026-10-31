# Business Insights aggregate module — contract v1

**Historical v1 design; superseded before integration.** Use [CONTRACT-V2.md](CONTRACT-V2.md) and current TypeScript types for the normative schema/API. v2 requires environment/entity/precision/maturity/provenance and richer offer identity; v1 payloads are rejected. The boundary/integration/test strategy below remains background, not permission to drop v2 fields.

Owner: Forge. Website/auth/storage/ingestion/export-endpoint owner: Bridge. Definitions/source reconciliation: Signal. This module is provider-independent domain code and a pure React evidence view, not an analytics backend or provisioned dashboard. It contains no operational seed data, SDK, HTTP requests, credentials, customer identifiers or auth implementation.

## Integration boundary

Only new `src/lib/business-insights/**`, `src/components/admin/business-insights/**`, `tests/business-insights/**` and `docs/business-insights/**` belong to this patch. No admin routes, API routes, shared config, package/lockfile, shared auth, shell or contact form edits. Do not mount a public route to preview private data. All adapters, ingestion, durable history, validated session/owner loading, server filters and export authorization belong to Bridge.

After real provisioning, Bridge's protected server loader should:

1. Verify session and immutable GitHub owner authorization through the agreed Auth0 boundary. Never pass unverified input to a page or export.
2. Reconcile authoritative aggregate sources. Return one authority per metric+scope+window+currency; RevenueCat and underlying store figures are alternatives, not additive. Stripe mirrors and web/mobile account overlaps require reconciliation before choosing one authoritative population. Omit private raw payloads, identities, tokens and local paths.
3. Call `parseSnapshot(unknown)` or `buildView(unknown, filters, nowUTC, staleAfterHours)`. Strict bounded schema v1 rejects unknown fields/invalid dates/nonfinite or negative counters, duplicate authorities, impossible windows, fractional counts and contradictory unknown/value states. Adapter HTTP body size/rate limits remain separate Bridge responsibilities.
4. Render `BusinessInsightsView` with validated selected rows and permitted catalog entries behind owner authorization. Optionally call `deriveRates(rows)` for exact matched cohorts. Apply catalog filters separately (app/channel/territory/currency). The pure component has no network or access control; it is not safe to use outside Bridge's private boundary.
5. Bridge supplies the actual controlled filter UI (apps/platforms/territory/channel/currency/exact window) in its admin shell. `buildView` provides tested semantics. Empty filter arrays select nothing; omitted arrays select all available evidence. Exact window filters never prorate or sum repeated snapshots. Currency filters intentionally omit unitless counts.
6. Export only server-authorized rows using `exportRows`. It quotes CSV and escapes formula initiators, preserves unknown as blank with explicit coverage, and includes all source/window/population/currency metadata. Also export any calculated `Result` plus evidence IDs and reason if offering derived exports; never export a bare rate. Set private/no-store on every response; never ship private snapshots in public static assets or bundles.

No adapter is implemented or simulated here. An empty catalog or unmatched filter is not evidence of zero business activity. Provisioning terms/auth/storage blockers stay with Bridge.

## Data model

`Snapshot {schemaVersion:1, generatedAt, observations, catalog}` is JSON-serializable. Only UTC RFC3339 timestamps with seconds and optional milliseconds accepted. A period is `[start,end)`; snapshot is `at`. Period/snapshot dates must precede generatedAt, and a complete measured period/snapshot must already have happened when observedAt was recorded. Timestamps represent source data, not page-load freshness. `observedAt` drives the explicit freshness threshold.

Each observation has:

- Stable aggregate `id`, enumerated metric, finite nonnegative value or explicit null, unit (`count` or `minor`). No customer/event records.
- Full scope: app (`aura`, `reelchef`, `agenticmedia`, `notare`, `glyph`, or explicitly sourced `portfolio`), platform (`ios`, `android`, `web`, `desktop`, `all`), territory, channel, aggregate population definition, cohort or null. `all` is a source-declared aggregate, never inferred by the module. Canonical aliases must be normalized centrally by Bridge; Fortaify is not an extra sixth SaaS on top of Glyph.
- ISO currency code plus explicit minor-unit exponent for money; null for count. No implicit USD/2-decimal assumption, FX conversion or cross-currency total.
- Evidence: source, stable sanitized reference/revision, observedAt, versioned metric definition, coverage (`measured`, `partial`, `missing`, `blocked`, `unavailable`), note. A measured zero is valid. Missing/blocked/unavailable require null; measured requires a number. Partial is visible but cannot produce a complete total/rate.

The JSON parser rejects duplicate logical authority even if IDs/providers differ; it does not magically know two differently named populations overlap. Adapter selection/deduplication is mandatory. Pure calculation APIs consume validated typed inputs; parse untrusted input first.

Catalog entries are flexible evidenced offers, not hardcoded tier names: app/channel/provider/territory/productId/name; lifecycle current/legacy/unknown; kind subscription/lifetime/credit_pack/addon/one_time/free; billing recurring/one_time/free/unknown; interval day/week/month/year and positive count only for recurring billing; currency/exponent/listPriceMinor or unknown. Recurring addons supported; lifetime/credit packs/free cannot recur. One observed product per app/channel/provider/territory/currency per snapshot. Historical price revisions belong in separate snapshots; retain original provider SKU IDs and source observation dates. Never replace legacy offers with a simplified current pricing page. Listing price is never an MRR input.

## Metric definitions and arithmetic

| Measure | Required semantic evidence / calculation |
|---|---|
| Registered users | Sourced account count and population/snapshot; not RevenueCat customers or download totals unless explicitly the same proven population. |
| Active users | Distinct qualifying users in an explicit complete period with versioned activity definition. MAU/WAU/DAU are not interchangeable. |
| First-time downloads / redownloads | Separate platform store aggregates with source timezone-normalized date window and territory; counts are not unique users or registrations. |
| Paying customers / paid subscribers / active trials | Distinct sourced populations and point-in-time state; subscriber/customer/seat counts are not interchangeable. Exclude test/sandbox per adapter contract. |
| Trial conversion | Converted members / eligible matured trial cohort with identical cohort/population/period/source. Current trials vs current paid snapshot is invalid. |
| Customer churn | Actual lost **opening** paying customers / opening paying customers in the same period/source. New customers are excluded from the numerator. Scheduled cancellation is not churn. |
| Gross recurring-revenue churn | Lost **opening** MRR / opening MRR, currency-specific and same period/source. Refund cash is not lost MRR. Net revenue churn including expansion is not implemented. |
| Retention | Retained members / original cohort size for evidenced cohort and elapsed-window definition. Cohort censoring/maturity is upstream; without it report unknown. |
| MRR | Aggregate actual contracted recurring consideration after discounts, excluding tax/fees, divided by billing months. Annual /12; quarterly /3. `paid_cancel_scheduled` remains paid-active until actual loss. Trials, expired/unpaid, lifetime, packs and other one-time consideration contribute no recurring revenue when exclusion evidence is complete. Unknown coverage is null. |
| Day/week recurring MRR | Requires explicit evidenced annual day-count convention (365–366); no default claim. Months = billing days ×12/daysPerYear. Weekly multiplies interval count by7. Preserve fractional minor precision until display/export policy. |
| ARR | MRR×12, currency-specific normalized run rate; not realized accounting revenue or forecast. |
| Receipts / refunds | Source-aligned cash consideration separated recurring/one-time/refunds. `netReceipts` = recurring + one-time − refunds; may be negative. Do not subtract refunds blindly from MRR. |
| Portfolio total | `portfolioSum` requires complete explicit disjoint-source/deduplicated-population proof covering exactly the row IDs, compatible scope/windows/metric/currency/exponent, no partial data or already aggregated portfolio rows. No default cross-app unique-user sum or RC/store/mobile/web addition. Proof is an upstream reviewed evidence reference, not an arbitrary UI checkbox. |
| Trends / learning | `trend` requires adjacent equal-duration periods with identical source/definition/scope/currency. Zero baseline is undefined. Descriptive only; no causal or ranking assertion. `coverageActions` proposes evidence collection only for explicit coverage gaps, with source IDs. No fabricated learning/outcomes. |

`rate` returns a fraction, status, reason and source IDs; zero denominator is **undefined**, never0 orInfinity. Mismatches are incomparable; incomplete evidence unavailable. Rates require matching source as well as scope; establish a reconciled aggregate source upstream rather than mixing providers. Overflow returns unavailable.

## Validation and limits

Run from the isolated checkout:

```sh
node tests/business-insights/run.cjs /absolute/path/to/TaoCreativeLabs/node_modules
```

Uses the repo's existing TypeScript/React packages, compiles only owned domain+component in a new disposable directory with strict TS, and runs Node's test runner plus actual React SSR. No package/config modifications or new runtime dependencies. Synthetic fixtures exist only in tests and are never imported into production. Tests exercise invalid inputs, impossible authority/window combinations, unknown-vs-zero, cohort denominators, annual discounts/day policy, scheduled cancellations/nonrecurring exclusions, currency separation, filters/freshness, CSV injection and escaped accessible table markup. UI browser responsiveness/light-dark rendering, hosted auth/storage/export integration, real connector coverage and independent QA remain unverified. No app-level build or deployed acceptance claimed from this bounded module test.
