import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_db';
import { createToken } from '../_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

  try {
    const rows = await sql`
      SELECT id, email FROM users
      WHERE email = ${email} AND password_hash = crypt(${password}, password_hash)
    `;

    if (rows.length === 0) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const user = rows[0];
    const token = await createToken(user.id, user.email);
    return res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
