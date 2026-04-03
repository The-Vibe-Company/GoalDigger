import { apiFetch, setToken, clearToken, getToken } from './client';

interface AuthResponse {
  token: string;
  user: { id: string; email: string };
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(res.token);
  return res;
}

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(res.token);
  return res;
}

export async function getSession(): Promise<{ userId: string; email: string } | null> {
  if (!getToken()) return null;
  try {
    const res = await apiFetch<{ user: { userId: string; email: string } }>('/api/auth/session');
    return res.user;
  } catch {
    clearToken();
    return null;
  }
}

export function signOut(): void {
  clearToken();
}
