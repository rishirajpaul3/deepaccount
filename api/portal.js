import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { data: usage } = await supabase
    .from('user_usage')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  if (!usage?.stripe_customer_id) {
    return res.status(400).json({ error: 'No billing account found' });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: usage.stripe_customer_id,
    return_url: `${process.env.APP_URL}/settings`,
  });

  res.redirect(session.url);
}
