import { useState } from 'react';
import { AuthView } from '@neondatabase/neon-js/auth/react/ui';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Pickaxe } from 'lucide-react';

export default function AuthPage() {
  const [view, setView] = useState<'sign-in' | 'sign-up'>('sign-in');

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 relative overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, oklch(0.75 0.15 85 / 0.06), transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] blur-[100px]"
          style={{ background: 'radial-gradient(ellipse, oklch(0.75 0.15 85 / 0.03), transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(oklch(1 0 0 / 0.1) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[400px]" style={{ animation: 'fade-up 0.7s ease forwards' }}>
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-card border border-border mb-4">
            <Pickaxe className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Goal<span className="text-primary">Digger</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Creuse-toi un chemin vers le succes
          </p>
        </div>

        {/* Auth card */}
        <Card className="border-border/50 shadow-2xl shadow-black/20">
          <CardContent className="p-6">
            <Tabs value={view} onValueChange={(v) => setView(v as 'sign-in' | 'sign-up')} className="mb-5">
              <TabsList className="w-full">
                <TabsTrigger value="sign-in" className="flex-1">Connexion</TabsTrigger>
                <TabsTrigger value="sign-up" className="flex-1">Inscription</TabsTrigger>
              </TabsList>
            </Tabs>

            <AuthView pathname={view} />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <Separator className="flex-1 max-w-16" />
          <span className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase">
            Powered by Neon
          </span>
          <Separator className="flex-1 max-w-16" />
        </div>
      </div>
    </div>
  );
}
