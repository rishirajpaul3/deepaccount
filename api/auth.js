import { createClerkClient } from '@clerk/backend';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function requireUser(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  try {
    const payload = await clerk.verifyToken(token);
    return { id: payload.sub };
  } catch {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }
}
