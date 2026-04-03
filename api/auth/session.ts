import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = await verifyToken(req);
  if (!user) return res.status(401).json({ error: 'Non authentifie' });

  return res.json({ user });
}
