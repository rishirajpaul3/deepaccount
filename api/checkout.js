import Stripe from 'stripe';
import { requireUser } from './auth.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICES = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = await requireUser(req, res);
  if (!user) return;

  const { plan = 'pro' } = req.body;
  const priceId = PRICES[plan];
  if (!priceId) return res.status(400).json({ error: 'Invalid plan' });

  // Get user email from Clerk
  const { createClerkClient } = await import('@clerk/backend');
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const clerkUser = await clerk.users.getUser(user.id);
  const email = clerkUser.emailAddresses[0]?.emailAddress;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: email,
    metadata: { user_id: user.id },
    success_url: `${process.env.APP_URL}/settings?upgraded=1`,
    cancel_url: `${process.env.APP_URL}/settings`,
  });

  res.json({ url: session.url });
}
