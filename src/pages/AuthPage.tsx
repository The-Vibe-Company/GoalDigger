import { useState } from 'react';
import { AuthView } from '@neondatabase/neon-js/auth/react/ui';

export default function AuthPage() {
  const [view, setView] = useState<'sign-in' | 'sign-up'>('sign-in');

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Diagonal gold line */}
        <div className="absolute -top-20 -left-20 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent rotate-[35deg] origin-top-left" />
        <div className="absolute -bottom-20 -right-20 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent rotate-[35deg] origin-bottom-right" />
        {/* Noise grain overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }} />
        {/* Radial glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold/[0.04] blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[380px] animate-[fadeUp_0.6s_ease_forwards]">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface border border-border mb-5 shadow-[0_0_40px_rgba(212,160,23,0.08)]">
            <span className="text-3xl">⛏️</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Goal<span className="text-gold">Digger</span>
          </h1>
          <p className="text-text-muted text-sm mt-2 tracking-wide">
            Creuse-toi un chemin vers le succes
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.3)]">
          {/* Tab switcher */}
          <div className="flex gap-1 p-1 bg-bg rounded-lg mb-6">
            <button
              onClick={() => setView('sign-in')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                view === 'sign-in'
                  ? 'bg-surface-2 text-text shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setView('sign-up')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                view === 'sign-up'
                  ? 'bg-surface-2 text-text shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Neon Auth form */}
          <AuthView pathname={view} />
        </div>

        {/* Footer */}
        <p className="text-center text-text-muted text-xs mt-8 tracking-wider uppercase">
          Powered by Neon
        </p>
      </div>
    </div>
  );
}
