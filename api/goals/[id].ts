import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { jwtVerify } from 'jose';

const sql = neon(process.env.DATABASE_URL!);
const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

async function getUser(req: VercelRequest) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const { payload } = await jwtVerify(header.slice(7), secret);
    return { userId: payload.userId as string };
  } catch { return null; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Non authentifie' });

  const { id } = req.query;

  if (req.method === 'DELETE') {
    await sql`DELETE FROM goals WHERE id = ${id as string} AND user_id = ${user.userId}`;
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
      WHERE id = ${id as string} AND user_id = ${user.userId}
    `;
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
