# Owner post evidence and secured image previews

The existing `/admin` Post library remains the owner view. Each publication retains exact caption, app/platform/ET date/slot, status, actual permalink, publication timestamp (or unknown), source and source observation time. Each card now includes matching post observations with metric, value including measured zero or Unknown, unit, observation/retrieval times, reporting window and source/collector. Matching requires the same app, platform and canonical permalink; account totals never become post metrics. All supplied matching observations remain separate; no sum/ranking or synthetic mature 24h/72h data. Likes, saves and reposts retain those metric names instead of being relabeled reactions. Existing source history truncation notice remains applicable.

## Publisher → Jarvis → MrBotMan handoff

Canonical `organic_social_publications` / `social_publication_records` and `marketing_metric_observations` remain authoritative. Do not create another publication-status table. For each actual verified-live post provide:

- Canonical source record ID, app slug (`reelchef`, `aura`, `agentic-media`, `glyph`, `notare`), platform (`instagram`, `tiktok`, `facebook`, `linkedin`, `x`), ET day and stable slot `manual-image-test-1858`.
- Exact final platform caption in UTF-8 (including newlines), concept/title, actual verified permalink and mapped author/account evidence. Record the actual publication timestamp if known; never use sync time for it.
- Final actual published image file(s), MIME and alt text, provenance/reference tying them to this exact post. A single preview image is supported per publication in this initial implementation. A photo sequence needs a contact sheet or selected representative preview explicitly identified; this does not certify that every frame is shown. Supply a dashboard preview PNG/JPEG/WebP no larger than 240,000 bytes. Do not supply credentials, internal paths in API data, SVG/HTML or arbitrary remote image URLs. The private handoff may locate the file for the authorized adapter; that path is not published.
- Each available metric separately: exact metric name/value/unit; post permalink; original collection time/source/collector; reporting period start+end together or both unknown; retrieval time if separately known. No measurement means no fabricated row; the UI says unknown/no measurements. Measured 0 remains 0. Do not invent mature 24h/72h windows.

X remains held until Jarvis resolves the earlier pause. Prepared/submitted/verified-live/dashboard-readback are distinct. This integration does not authorize social publication.

## Existing private ingestion (no new writer grant)

MrBotMan executes the existing reviewed `scripts/admin/ingest.ts` in their owner context against `POST https://www.taocreativelabs.com/api/admin/ingest`, with the existing privately bound writer credential. Readers/Story/publishers do not receive it. No secret copying, token argument or change to read:marketing scopes. If private binding cannot run there, report that constraint; do not extract another agent's private store.

SchemaVersion 1 envelope is unchanged except optional `mediaAssets` (maximum one per bounded batch). Keep the complete serialized batch ≤512 KiB. Existing adapters that omit `mediaAssets` retain parsed shape/digest. Stage the media-only batch first, then publication/observation batch; both have stable distinct batch IDs. Same-body retries are no-ops; different body at same batch ID conflicts. No publication is marked dashboard-visible until final owner readback.

Asset payload:
```json
{"ref":"archive:media:<64 lowercase SHA256 hex of decoded bytes>","contentType":"image/png","base64":"<canonical base64 of actual preview>","alt":"Accurate preview description"}
```
Set publication `mediaRef` to the same ref; `format` image/carousel as actually published and distribution organic only with source support. Image magic bytes, MIME and SHA256 must agree; encoded size ≤320,000 characters. No remote URL is fetched, no local path resolution. Existing `tao_admin_items` stores immutable `marketing_media` bytes by digest ref; no DDL or parallel status store. A changed image requires a new digest/ref. Snapshot/API/export projections never load those bytes. Protected `GET /api/admin/media?ref=...` serves only to the existing authenticated GitHub owner with private/no-store/nosniff/noindex headers; anonymous, outsiders and machine read tokens have no owner grant. No public static assets or image optimizer caching. Missing preview is explicit; publication link remains accessible. Current single-preview limit must be disclosed for carousels.

## Acceptance with real records

1. Validate source rows and caption/image provenance; derive exact asset digest, validate envelope offline. Never substitute synthetic operational records.
2. After exact-candidate QA/release, MrBotMan performs the existing owner-context ingestion. Preserve stable IDs and source times. Read acknowledgments before retry; conflicts require diagnosis.
3. Verify legitimate owner Post library on live domain: exact app/platform/date/slot/caption/permalink/status; preview loads expected pixels; refresh/reopen preserves same identity. Reconcile canonical source record to managed replica.
4. Compare every available metric to source, value/unit/time/window; verify new/unsupported metrics remain unknown and zeros stay measured zeros. Anonymous/media and read-role ownerAPI denial, public SEO/private route checks remain required. No live-analytics claim from ingestion alone.

This source change is prepared locally. Production readback and real campaign import remain pending actual publisher records, accepted deployment and owner-context execution.

`tsx scripts/admin/prepare-media.ts INPUT_IMAGE 'Accurate alt text' PRIVATE_OUTPUT_JSON` prepares one validated media-only transport without editing the image or reading credentials. It refuses oversized/unsupported images and refuses overwriting an existing output. Reuse the exact output for ingestion retries; do not regenerate its transport timestamp under the same batch ID. Its envelope observedAt is adapter preparation time, never social publication/collection time. Publication/metric batches continue through the existing source adapter or explicit validated handoff.
