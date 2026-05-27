import Stripe from 'stripe';
import pool from './db.js';
import { requireUser } from './auth.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = await requireUser(req, res);
  if (!user) return;

  const { rows } = await pool.query(
    'SELECT stripe_customer_id FROM user_usage WHERE user_id = $1',
    [user.id]
  );

  if (!rows[0]?.stripe_customer_id) {
    return res.status(400).json({ error: 'No billing account found' });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: rows[0].stripe_customer_id,
    return_url: `${process.env.APP_URL}/settings`,
  });

  res.json({ url: session.url });
}
