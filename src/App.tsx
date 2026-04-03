import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth';
import AuthPage from '@/pages/AuthPage';
import HomePage from '@/pages/HomePage';

export default function App() {
  const [session, setSession] = useState<unknown>(undefined); // undefined = loading
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const s = await authClient.getSession();
        setSession(s.data?.session ?? null);
      } catch {
        setSession(null);
      } finally {
        setChecking(false);
      }
    };
    checkSession();
  }, []);

  const handleAuthSuccess = async () => {
    const s = await authClient.getSession();
    setSession(s.data?.session ?? null);
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    setSession(null);
  };

  if (checking) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AuthPage onSuccess={handleAuthSuccess} />;
  }

  return <HomePage onSignOut={handleSignOut} />;
}
