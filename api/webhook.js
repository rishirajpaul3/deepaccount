import Stripe from 'stripe';
import pool from './db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  const rawBody = await getRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.user_id;
    if (userId) {
      await pool.query(`
        INSERT INTO user_usage (user_id, plan, stripe_customer_id)
        VALUES ($1, 'pro', $2)
        ON CONFLICT (user_id) DO UPDATE
        SET plan = 'pro', stripe_customer_id = $2
      `, [userId, session.customer]);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    await pool.query(
      `UPDATE user_usage SET plan = 'free' WHERE stripe_customer_id = $1`,
      [sub.customer]
    );
  }

  res.json({ received: true });
}
