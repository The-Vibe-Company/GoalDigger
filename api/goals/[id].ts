import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

  if (req.method === 'DELETE') {
    await sql`DELETE FROM goals WHERE id = ${id as string}`;
    return res.json({ ok: true });
  }

  if (req.method === 'PATCH') {
    const { target, name, color, unit, icon } = req.body;
    await sql`
      UPDATE goals SET
        target = COALESCE(${target ?? null}, target),
        name = COALESCE(${name ?? null}, name),
        color = COALESCE(${color ?? null}, color),
        unit = COALESCE(${unit ?? null}, unit),
        icon = COALESCE(${icon ?? null}, icon)
      WHERE id = ${id as string}
    `;
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
