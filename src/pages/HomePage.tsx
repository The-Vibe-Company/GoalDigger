import { UserButton } from '@neondatabase/neon-js/auth/react/ui';

export default function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col max-w-[430px] mx-auto px-4">
      <header className="flex items-center justify-between pt-6 pb-4">
        <h1 className="text-xl font-bold tracking-tight">
          Goal<span className="text-gold">Digger</span> ⛏️
        </h1>
        <UserButton />
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center text-text-muted">
          <span className="text-6xl block mb-4">⛏️</span>
          <p className="text-base">Bienvenue !</p>
          <p className="text-sm mt-1">L'app est en construction.</p>
        </div>
      </main>
    </div>
  );
}
