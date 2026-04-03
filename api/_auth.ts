import { SignJWT, jwtVerify } from 'jose';
import type { VercelRequest } from '@vercel/node';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'goaldigger-secret-change-me');

export async function createToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(secret);
}

export async function verifyToken(req: VercelRequest): Promise<{ userId: string; email: string } | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const { payload } = await jwtVerify(header.slice(7), secret);
    return { userId: payload.userId as string, email: payload.email as string };
  } catch {
    return null;
  }
}
