export const adminSchema = [
`CREATE TABLE IF NOT EXISTS tao_admin_business_snapshots (generated_at timestamptz PRIMARY KEY, payload jsonb NOT NULL, received_at timestamptz NOT NULL DEFAULT now())`,
`CREATE TABLE IF NOT EXISTS tao_admin_batches (batch_id text PRIMARY KEY, digest text NOT NULL, observed_at timestamptz NOT NULL, received_at timestamptz NOT NULL DEFAULT now())`,
`CREATE TABLE IF NOT EXISTS tao_admin_items (kind text NOT NULL, item_key text NOT NULL, payload jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(kind,item_key))`,
`CREATE TABLE IF NOT EXISTS tao_admin_observations (entity_url text NOT NULL, metric text NOT NULL, observed_at timestamptz NOT NULL, payload jsonb NOT NULL, PRIMARY KEY(entity_url,metric,observed_at))`,
`CREATE INDEX IF NOT EXISTS tao_admin_observations_recent ON tao_admin_observations(observed_at DESC)`,
];
