import { UserButton } from '@neondatabase/neon-js/auth/react/ui';
import { Separator } from '@/components/ui/separator';
import { Pickaxe, Construction } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col max-w-[430px] mx-auto px-4">
      <header className="flex items-center justify-between pt-6 pb-3">
        <h1 className="text-lg font-bold tracking-tight flex items-center gap-1.5">
          Goal<span className="text-primary">Digger</span>
          <Pickaxe className="w-4 h-4 text-primary" />
        </h1>
        <UserButton />
      </header>
      <Separator />

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground" style={{ animation: 'fade-up 0.5s ease forwards' }}>
          <Construction className="w-16 h-16 mx-auto mb-5 text-muted-foreground/40" />
          <p className="text-base font-medium">Bienvenue !</p>
          <p className="text-sm mt-1 text-muted-foreground/70">L'app est en construction.</p>
        </div>
      </main>
    </div>
  );
}
