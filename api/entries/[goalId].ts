import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_db';
import { verifyToken } from '../_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await verifyToken(req);
  if (!user) return res.status(401).json({ error: 'Non authentifie' });

  const { goalId } = req.query;

  // Verify goal ownership
  const goal = await sql`SELECT id FROM goals WHERE id = ${goalId as string} AND user_id = ${user.userId}`;
  if (goal.length === 0) return res.status(404).json({ error: 'Objectif non trouve' });

  if (req.method === 'GET') {
    const rows = await sql`
      SELECT date, value, count FROM entries
      WHERE goal_id = ${goalId as string}
      ORDER BY date ASC
    `;
    // Normalize date to yyyy-MM-dd
    const entries = rows.map(r => ({
      date: (r.date as string).slice(0, 10),
      value: r.value,
      count: r.count,
    }));
    return res.json(entries);
  }

  if (req.method === 'POST') {
    const { date, value, count } = req.body;

    // Delete if count is 0 and no value
    if (count === 0 && (value === null || value === undefined)) {
      await sql`DELETE FROM entries WHERE goal_id = ${goalId as string} AND date = ${date}`;
      return res.json({ ok: true });
    }

    await sql`
      INSERT INTO entries (goal_id, date, value, count)
      VALUES (${goalId as string}, ${date}, ${value ?? null}, ${count ?? null})
      ON CONFLICT (goal_id, date) DO UPDATE SET
        value = COALESCE(${value ?? null}, entries.value),
        count = COALESCE(${count ?? null}, entries.count)
    `;
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
