import { useState, useCallback } from 'react';
import { Goal } from '@/types';
import { loadGoals, deleteGoal } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import CreateGoalPage from '@/pages/CreateGoalPage';
import CurveTracker from '@/components/CurveTracker';
import CounterTracker from '@/components/CounterTracker';
import {
  Pickaxe, LogOut, Plus, ArrowLeft, Trash2,
  Scale, Coffee, Droplets, Cigarette, Wine, CupSoda, Hash, TrendingUp,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Scale, Coffee, Droplets, Cigarette, Wine, Cup: CupSoda, Hash, TrendingUp,
};

interface Props {
  onSignOut: () => void;
}

type View = { type: 'list' } | { type: 'create' } | { type: 'detail'; goalId: string };

export default function HomePage({ onSignOut }: Props) {
  const [view, setView] = useState<View>({ type: 'list' });
  const [goals, setGoals] = useState<Goal[]>(loadGoals);
  const [, setTick] = useState(0); // force re-render on data change

  const refresh = useCallback(() => {
    setGoals(loadGoals());
    setTick(t => t + 1);
  }, []);

  const handleDelete = (id: string) => {
    deleteGoal(id);
    refresh();
    setView({ type: 'list' });
  };

  const activeGoal = view.type === 'detail' ? goals.find(g => g.id === view.goalId) : null;

  return (
    <div className="min-h-dvh flex flex-col max-w-[430px] mx-auto px-4 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between pt-6 pb-3">
        <h1 className="text-lg font-bold tracking-tight flex items-center gap-1.5">
          Goal<span className="text-primary">Digger</span>
          <Pickaxe className="w-4 h-4 text-primary" />
        </h1>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSignOut}>
          <LogOut className="w-4 h-4" />
        </Button>
      </header>
      <Separator className="mb-5" />

      {/* Views */}
      {view.type === 'create' ? (
        <CreateGoalPage
          onCreated={() => { refresh(); setView({ type: 'list' }); }}
          onBack={() => setView({ type: 'list' })}
        />
      ) : view.type === 'detail' && activeGoal ? (
        <div className="space-y-4" style={{ animation: 'fade-up 0.3s ease forwards' }}>
          {/* Detail header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setView({ type: 'list' })}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2.5">
                {(() => {
                  const Icon = ICON_MAP[activeGoal.icon] ?? Hash;
                  return (
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: activeGoal.color + '18', color: activeGoal.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  );
                })()}
                <h2 className="text-base font-semibold">{activeGoal.name}</h2>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => handleDelete(activeGoal.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Tracker */}
          {activeGoal.type === 'curve' ? (
            <CurveTracker goal={activeGoal} onUpdate={refresh} />
          ) : (
            <CounterTracker goal={activeGoal} onUpdate={refresh} />
          )}
        </div>
      ) : (
        /* Goal list */
        <div style={{ animation: 'fade-up 0.3s ease forwards' }}>
          {goals.length === 0 ? (
            <div className="text-center mt-32 text-muted-foreground">
              <Pickaxe className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-sm">Aucun objectif.</p>
              <p className="text-xs mt-1 text-muted-foreground/60">Commence par en creer un.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {goals.map(g => {
                const Icon = ICON_MAP[g.icon] ?? Hash;
                return (
                  <Card
                    key={g.id}
                    className="cursor-pointer hover:bg-secondary/30 transition-colors !py-0"
                    onClick={() => setView({ type: 'detail', goalId: g.id })}
                  >
                    <CardContent className="!px-4 !py-4 flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: g.color + '18', color: g.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{g.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {g.type === 'curve' ? 'Courbe' : 'Compteur'} · {g.unit}
                          {g.target ? ` · Objectif: ${g.target}` : ''}
                        </p>
                      </div>
                      <ChevronIcon className="w-4 h-4 text-muted-foreground/50" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Bottom CTA - spacer */}
          <div className="h-20" />

          {/* Fixed bottom button */}
          <div className="fixed bottom-5 left-4 right-4 z-50 max-w-[398px] mx-auto">
            <Button
              className="w-full h-12 rounded-xl text-sm font-semibold shadow-lg"
              onClick={() => setView({ type: 'create' })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvel objectif
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
