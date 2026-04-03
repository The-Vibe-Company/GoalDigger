import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_db';
import { verifyToken } from '../_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await verifyToken(req);
  if (!user) return res.status(401).json({ error: 'Non authentifie' });

  if (req.method === 'GET') {
    const rows = await sql`
      SELECT id, name, type, unit, icon, color, target, created_at
      FROM goals WHERE user_id = ${user.userId}
      ORDER BY created_at ASC
    `;
    return res.json(rows);
  }

  if (req.method === 'POST') {
    const { id, name, type, unit, icon, color, target } = req.body;
    await sql`
      INSERT INTO goals (id, user_id, name, type, unit, icon, color, target)
      VALUES (${id}, ${user.userId}, ${name}, ${type}, ${unit}, ${icon}, ${color}, ${target})
    `;
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
