import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const goalId = Array.isArray(req.query.goalId) ? req.query.goalId[0] : req.query.goalId;

    if (req.method === 'GET') {
      const rows = await sql`
        SELECT date, value, count FROM entries
        WHERE goal_id = ${goalId as string}
        ORDER BY date ASC
      `;
      const entries = rows.map(r => ({
        date: (r.date as string).slice(0, 10),
        value: r.value,
        count: r.count,
      }));
      return res.json(entries);
    }

    if (req.method === 'POST') {
      const { date, value, count } = req.body;

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
  } catch (err) {
    console.error('Entries error:', err);
    return res.status(500).json({ error: 'Erreur serveur', details: String(err) });
  }
}
