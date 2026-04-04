import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Non authentifie' });

  try {
    const { payload } = await jwtVerify(header.slice(7), secret);
    return res.json({ user: { userId: payload.userId, email: payload.email } });
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }
}
