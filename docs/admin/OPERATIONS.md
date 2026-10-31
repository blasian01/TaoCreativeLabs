# Private marketing workspace operations

This is an isolated local implementation, not a shipped dashboard. Public marketing routes are preserved; /admin and /admin/business render dynamically. No private analytics seed is checked into public source.

## Provisioned development resources
Auth0 Free resource ir_M1q0x5CWx4aeFpnh and Neon Free store_PUHsw2q6a2MjonGB are connected to Tao's development/preview setup. No paid tier or production deployment is approved. Owner immutable GitHub ID67053548 is fixed server-side and requires a trusted Auth0 SDK session with GitHub subject. There is no first-login enrollment, email allowlist or browser-only authorization. All API reads and exports check ownerStatus; ingestion uses a distinct server-side credential with only the ingestion endpoint as its scope.

## Required auth setup
Auth0 development tenant has no GitHub connection yet. Register/reuse a GitHub OAuth application and enable Auth0's GitHub social connection for this application through supported provider setup. Public-profile only; no repository/org/email scope. Exact development GitHub callback:
https://icfg-z3uc6mptddb1xudcedobmb60-development.us.auth0.com/login/callback

Current application callback registered by marketplace: http://localhost:3000/auth/callback; logout http://localhost:3000/. Production intended canonical https://www.taocreativelabs.com/auth/callback is NOT configured or deployed by this patch. Preview callback requires the actual approved preview origin/client; no wildcard callbacks. Client secret must be entered via provider UI/secure secret workflow, never a chat message. Private development credentials are held outside repo under the server's private config directory, not in source or shared artifacts.

## Development schema and data sync
Use Node24+ (migration helper uses node:util parseEnv). The private env file comes from supported Vercel development env pull and contains credentials; never print or commit it. `npm run admin:migrate -- PRIVATE_ENV_FILE` creates only the new development admin tables. Production mode refuses this helper.

Authoritative OpenBot data stays in shared tables and is queried ONLY through OpenBot tools. Agent workflow:
1. Call list_tables, then query_data SELECTs for public publication fields from organic_social_publications and social_publication_records and measurement fields from marketing_metric_observations. Follow pagination and require truncated=false. No direct SQLite access. Do not include internal notes, customer identifiers or raw local paths in the outputs.
2. Assemble the tools' columns/rows results into an ephemeral private JSON envelope with schema {batchId,observedAt,organic,agentic,metrics}. batchId is stable for retries. This envelope is a transient transport artifact, not a second persistent authority. Refresh it only from new tool results.
3. `tsx scripts/admin/build-batch.ts PRIVATE_TOOL_RESULTS DAILY_SOCIAL_POLICY PUBLICATION_ARCHIVE_ROOT PRIVATE_BATCH_OUTPUT` normalizes app/slot aliases, dedupes natural keys/permalinks, reads only published captions, preserves measured zeros/null periods and excludes internal archive paths. The current documented owner roster is coded here; review it when ownership changes. Accounts remain access=documented and verifiedAt=null until real evidence establishes verification.
4. `npm run admin:ingest -- PRIVATE_ENV_FILE PRIVATE_BATCH_OUTPUT` sends through authenticated /api/admin/ingest. ADMIN_INGEST_URL must be explicit HTTPS (loopback allowed locally) and ADMIN_INGEST_TOKEN at least32characters, stored privately. Never put token on command line or URL. Redirects refused. Current key exists only in private development configuration, not deployed env.
5. On non-2xx retain same batch ID, diagnose and retry. Duplicate identical batch is safe. Different payload under same ID returns409; overlapping immutable observation timestamp with conflicting value returns409. All writes are one serializable transaction. Validation errors/body limits do not write. Max512KiB and explicit per-collection bounds. No public browser endpoint connects to local files/shared DB.

Database measurement history is retained; reads are bounded to the latest10000 observations. UI explicitly calls data a snapshot, not live analytics. Refresh reads the durable database; it does not silently sign in to social platforms or launch data extraction. New social/business refreshes must follow authorized tools and this ingestion path. Current business ingestion/module integration is pending Forge/Signal reconciliation; /admin/business is a guarded truthful pending state, not fake analytics.

## Security/data semantics
Account URL and platform must agree, only supported HTTPS social hosts, no credential URLs. Facebook story_fbid/id query identity survives tracking removal. Unknown !=0; no revenue/ranking/CTR from isolated metrics. Publishing calendar filters use America/New_York and display observation timestamps in UTC. Staleness policy48hours and missing timestamps explicit. CSV cells guard spreadsheet formulas. Both sessions and API responses are private/no-store; robots disallows admin/auth/API paths.

## Verification
`npm run test:admin`, `npm run lint`, `npm run typecheck`, `npm run build`.
`node scripts/admin/verify-local.mjs PRIVATE_ENV_FILE PRIVATE_SANITIZED_BATCH` starts an owned local server with an ephemeral TEST-ONLY Auth0 cookie key, uses real SDK encryption/expiry and actual development Neon storage. It checks anonymous, owner, outsider, forged/expired cookies, logout cookie deletion, SDK state+PKCE, no public dataset, private headers, durable/idempotent source ingestion and immutable observation conflicts. This is NOT live GitHub OAuth consent verification.
Optional ADMIN_OPENBOT_PREVIEW=1 keeps a loopback-only QA proxy on127.0.0.1:3101 that injects only that test process's synthetic owner cookie upstream for OpenBot browser rendering checks. It is a scripts-only test harness, not an app route/auth bypass, never deployed. No cookie/secret is sent into browser tools; auth routes/writes are refused by the QA proxy. Stop the owning script after browser QA.

## Runtime dependency update
Existing Next14 had a critical production dependency advisory when inspected. Implementation updates Next16.4.3, Auth0 SDK4.33, Neon1.2 and Zod4.6.7; React18 retained as supported by Next peer requirements. Middleware migrated to supported Node proxy.ts; ESLint flat config and webpack build updated for Next16. Production dependency audit now0advisories. Development lint ecosystem retains16moderate advisory entries; no force downgrade or gate bypass applied. Full public-site build passes; live production behavior has not been changed or certified.
