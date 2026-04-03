import { NeonAuthUIProvider, SignedIn, SignedOut } from '@neondatabase/neon-js/auth/react/ui';
import { authClient } from '@/lib/auth';
import AuthPage from '@/pages/AuthPage';
import HomePage from '@/pages/HomePage';

export default function App() {
  return (
    <NeonAuthUIProvider authClient={authClient}>
      <SignedIn>
        <HomePage />
      </SignedIn>
      <SignedOut>
        <AuthPage />
      </SignedOut>
    </NeonAuthUIProvider>
  );
}
