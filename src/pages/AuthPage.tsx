import { useState } from 'react';
import { authClient } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pickaxe, Loader2 } from 'lucide-react';

interface Props {
  onSuccess: () => void;
}

export default function AuthPage({ onSuccess }: Props) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'sign-in') {
        const res = await authClient.signIn.email({ email, password });
        if (res.error) {
          setError(res.error.message ?? 'Erreur de connexion');
        } else {
          onSuccess();
        }
      } else {
        const res = await authClient.signUp.email({
          name: email.split('@')[0] || 'User',
          email,
          password,
        });
        if (res.error) {
          setError(res.error.message ?? "Erreur lors de l'inscription");
        } else {
          onSuccess();
        }
      }
    } catch {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, oklch(0.75 0.15 85 / 0.05), transparent 70%)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[380px]" style={{ animation: 'fade-up 0.6s ease forwards' }}>
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20">
            <Pickaxe className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            Goal<span className="text-primary">Digger</span>
          </h1>
        </div>

        {/* Auth card */}
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm !py-0">
          <CardContent className="!px-8 !py-8">
            <Tabs
              value={mode}
              onValueChange={(v) => { setMode(v as 'sign-in' | 'sign-up'); setError(''); }}
              className="mb-8"
            >
              <TabsList className="w-full h-11">
                <TabsTrigger value="sign-in" className="flex-1 text-sm">Connexion</TabsTrigger>
                <TabsTrigger value="sign-up" className="flex-1 text-sm">Inscription</TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  mode === 'sign-in' ? 'Se connecter' : "S'inscrire"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
