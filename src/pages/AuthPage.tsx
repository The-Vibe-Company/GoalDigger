import { useState } from 'react';
import { AuthView } from '@neondatabase/neon-js/auth/react/ui';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pickaxe } from 'lucide-react';

export default function AuthPage() {
  const [view, setView] = useState<'sign-in' | 'sign-up'>('sign-in');

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background atmosphere */}
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
            <Tabs value={view} onValueChange={(v) => setView(v as 'sign-in' | 'sign-up')} className="mb-8">
              <TabsList className="w-full h-11">
                <TabsTrigger value="sign-in" className="flex-1 text-sm">Connexion</TabsTrigger>
                <TabsTrigger value="sign-up" className="flex-1 text-sm">Inscription</TabsTrigger>
              </TabsList>
            </Tabs>

            <AuthView pathname={view} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
