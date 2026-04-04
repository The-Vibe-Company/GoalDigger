import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { SignJWT } from 'jose';

const sql = neon(process.env.DATABASE_URL!);
const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

async function createToken(userId: string, email: string) {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(secret);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  if (password.length < 8) return res.status(400).json({ error: 'Mot de passe trop court (8 caracteres min)' });

  try {
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) return res.status(409).json({ error: 'Email deja utilise' });

    const rows = await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${email}, crypt(${password}, gen_salt('bf')))
      RETURNING id, email
    `;

    const user = rows[0];
    const token = await createToken(user.id, user.email);
    return res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
