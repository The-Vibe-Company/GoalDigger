import { UserButton } from '@neondatabase/neon-js/auth/react/ui';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col max-w-[430px] mx-auto px-4">
      <header className="flex items-center justify-between pt-6 pb-3">
        <h1 className="text-lg font-bold tracking-tight">
          Goal<span className="text-primary">Digger</span>
          <span className="ml-1.5">⛏️</span>
        </h1>
        <UserButton />
      </header>
      <Separator />

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground" style={{ animation: 'fade-up 0.5s ease forwards' }}>
          <span className="text-6xl block mb-5">⛏️</span>
          <p className="text-base font-medium">Bienvenue !</p>
          <p className="text-sm mt-1 text-muted-foreground/70">L'app est en construction.</p>
        </div>
      </main>
    </div>
  );
}
