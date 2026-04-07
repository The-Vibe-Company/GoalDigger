import { apiFetch } from './client';
import { setToken, clearToken, getToken } from './client';

interface AuthResponse {
  token: string;
  user: { id: string; email: string };
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data;
}

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data;
}

export async function getSession(): Promise<{ userId: string; email: string } | null> {
  if (!getToken()) return null;
  try {
    const data = await apiFetch<{ user: { userId: string; email: string } }>('/api/auth/session');
    return data.user;
  } catch {
    clearToken();
    return null;
  }
}

export function signOut(): void {
  clearToken();
}
