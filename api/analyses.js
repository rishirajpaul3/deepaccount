import pool from './db.js';
import { requireUser } from './auth.js';

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const { rows } = await pool.query(
      'SELECT * FROM analyses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [user.id]
    );
    return res.json(rows);
  }

  if (req.method === 'POST') {
    const { company_url, company_name, icp, result } = req.body;

    // Enforce free limit
    const { rows: usageRows } = await pool.query(
      'SELECT plan, analyses_this_month FROM user_usage WHERE user_id = $1',
      [user.id]
    );
    const usage = usageRows[0];
    if (usage?.plan === 'free' && (usage?.analyses_this_month ?? 0) >= 10) {
      return res.status(403).json({ error: 'Free limit reached. Upgrade to Pro.' });
    }

    const { rows } = await pool.query(
      `INSERT INTO analyses (user_id, company_url, company_name, icp, result)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user.id, company_url, company_name ?? null, icp ?? null, JSON.stringify(result)]
    );

    // Increment usage (upsert in case row doesn't exist yet)
    await pool.query(`
      INSERT INTO user_usage (user_id, analyses_this_month)
      VALUES ($1, 1)
      ON CONFLICT (user_id) DO UPDATE
      SET analyses_this_month = user_usage.analyses_this_month + 1
    `, [user.id]);

    return res.json(rows[0]);
  }

  res.status(405).end();
}
