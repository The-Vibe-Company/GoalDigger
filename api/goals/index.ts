import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const rows = await sql`
      SELECT id, name, type, unit, icon, color, target, created_at
      FROM goals ORDER BY created_at ASC
    `;
    return res.json(rows);
  }

  if (req.method === 'POST') {
    const { id, name, type, unit, icon, color, target } = req.body;
    await sql`
      INSERT INTO goals (id, user_id, name, type, unit, icon, color, target)
      VALUES (${id}, (SELECT id FROM users LIMIT 1), ${name}, ${type}, ${unit}, ${icon}, ${color}, ${target})
    `;
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
