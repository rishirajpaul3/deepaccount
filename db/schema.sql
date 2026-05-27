-- Run this in Railway's Postgres query console

CREATE TABLE IF NOT EXISTS user_usage (
  user_id               TEXT PRIMARY KEY,
  plan                  TEXT NOT NULL DEFAULT 'free',
  analyses_this_month   INTEGER NOT NULL DEFAULT 0,
  reset_at              TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now()) + INTERVAL '1 month',
  stripe_customer_id    TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analyses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL,
  company_url   TEXT NOT NULL,
  company_name  TEXT,
  icp           TEXT,
  result        JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analyses_user_id_idx ON analyses(user_id);
CREATE INDEX IF NOT EXISTS analyses_created_at_idx ON analyses(created_at DESC);
