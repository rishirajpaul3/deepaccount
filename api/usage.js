import pool from './db.js';
import { requireUser } from './auth.js';

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  // Reset counter if month has rolled over, then upsert row
  const { rows } = await pool.query(`
    INSERT INTO user_usage (user_id, plan, analyses_this_month, reset_at)
    VALUES ($1, 'free', 0, date_trunc('month', now()) + interval '1 month')
    ON CONFLICT (user_id) DO UPDATE SET
      analyses_this_month = CASE
        WHEN user_usage.reset_at <= now() THEN 0
        ELSE user_usage.analyses_this_month
      END,
      reset_at = CASE
        WHEN user_usage.reset_at <= now()
        THEN date_trunc('month', now()) + interval '1 month'
        ELSE user_usage.reset_at
      END
    RETURNING *
  `, [user.id]);

  res.json(rows[0]);
}
