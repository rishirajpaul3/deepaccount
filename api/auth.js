import { createClerkClient } from '@clerk/backend';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const AUTHORIZED_PARTIES = [
  'https://deepaccount.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

export async function requireUser(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  try {
    const payload = await clerk.verifyToken(token, { authorizedParties: AUTHORIZED_PARTIES });
    return { id: payload.sub };
  } catch (err) {
    console.error('[auth] verifyToken failed:', err?.message ?? err);
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }
}
