import { useState, useCallback, useEffect } from 'react';
import { Goal, CurveEntry } from '@/types';
import { loadGoals, deleteGoal, setCurveEntry, setCounterEntry, getCounterForDate, loadEntries, today } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import CreateGoalPage from '@/pages/CreateGoalPage';
import CurveTracker from '@/components/CurveTracker';
import CounterTracker from '@/components/CounterTracker';
import CalendarOverview from '@/components/CalendarOverview';
import {
  Pickaxe, LogOut, Plus, ArrowLeft, Trash2, Minus, Check, CalendarDays,
  Scale, Coffee, Droplets, Cigarette, Wine, CupSoda, Hash, TrendingUp,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Scale, Coffee, Droplets, Cigarette, Wine, Cup: CupSoda, Hash, TrendingUp, Pickaxe,
};

interface Props {
  onSignOut: () => void;
}

type View = { type: 'list' } | { type: 'create' } | { type: 'detail'; goalId: string } | { type: 'calendar' };

export default function HomePage({ onSignOut }: Props) {
  const [view, setView] = useState<View>({ type: 'list' });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const g = await loadGoals();
    setGoals(g);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleDelete = async (id: string) => {
    await deleteGoal(id);
    await refresh();
    setView({ type: 'list' });
  };

  const activeGoal = view.type === 'detail' ? goals.find(g => g.id === view.goalId) : null;

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col max-w-[430px] mx-auto px-4 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between pt-6 pb-3">
        <h1 className="text-lg font-bold tracking-tight flex items-center gap-1.5">
          Goal<span className="text-primary">Digger</span>
          <Pickaxe className="w-4 h-4 text-primary" />
        </h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setView(v => v.type === 'calendar' ? { type: 'list' } : { type: 'calendar' })}>
            <CalendarDays className={`w-4 h-4 ${view.type === 'calendar' ? 'text-primary' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSignOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>
      <Separator className="mb-5" />

      {/* Views */}
      {view.type === 'calendar' ? (
        <CalendarOverview goals={goals} />
      ) : view.type === 'create' ? (
        <CreateGoalPage
          onCreated={async () => { await refresh(); setView({ type: 'list' }); }}
          onBack={() => setView({ type: 'list' })}
        />
      ) : view.type === 'detail' && activeGoal ? (
        <div className="space-y-4" style={{ animation: 'fade-up 0.3s ease forwards' }}>
          {/* Detail header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => { refresh(); setView({ type: 'list' }); }}>
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
              onClick={() => setDeleteConfirm(activeGoal.id)}
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
        <>
          <div style={{ animation: 'fade-up 0.3s ease forwards' }}>
            {goals.length === 0 ? (
              <div className="text-center mt-32 text-muted-foreground">
                <Pickaxe className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-sm">Aucun objectif.</p>
                <p className="text-xs mt-1 text-muted-foreground/60">Commence par en creer un.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.map(g => (
                  <GoalCard key={g.id} goal={g} onUpdate={refresh} onOpen={() => setView({ type: 'detail', goalId: g.id })} />
                ))}
              </div>
            )}

            {/* Bottom CTA - spacer */}
            <div className="h-20" />
          </div>

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
        </>
      )}

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="max-w-[340px]">
          <DialogHeader>
            <DialogTitle>Supprimer cet objectif ?</DialogTitle>
            <DialogDescription>
              Toutes les donnees associees seront perdues. Cette action est irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={async () => {
              if (deleteConfirm) {
                await handleDelete(deleteConfirm);
                setDeleteConfirm(null);
              }
            }}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GoalCard({ goal, onUpdate, onOpen }: { goal: Goal; onUpdate: () => void; onOpen: () => void }) {
  if (goal.type === 'counter') {
    return <CounterCard goal={goal} onUpdate={onUpdate} onOpen={onOpen} />;
  }
  return <CurveCard goal={goal} onUpdate={onUpdate} onOpen={onOpen} />;
}

function CounterCard({ goal, onUpdate, onOpen }: { goal: Goal; onUpdate: () => void; onOpen: () => void }) {
  const Icon = ICON_MAP[goal.icon] ?? Hash;
  const todayStr = today();
  const [count, setCount] = useState(0);

  useEffect(() => {
    getCounterForDate(goal.id, todayStr).then(setCount);
  }, [goal.id, todayStr]);

  const handleDelta = async (delta: number) => {
    const newCount = Math.max(0, count + delta);
    setCount(newCount); // optimistic
    await setCounterEntry(goal.id, todayStr, newCount);
    onUpdate();
  };

  return (
    <Card className="!py-0">
      <CardContent className="!px-4 !py-3 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 cursor-pointer"
          style={{ backgroundColor: goal.color + '18', color: goal.color }}
          onClick={onOpen}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onOpen}>
          <p className="text-sm font-medium leading-tight">{goal.name}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={() => handleDelta(-1)}
            disabled={count <= 0}
          >
            <Minus className="w-3.5 h-3.5" />
          </Button>
          <p className="text-lg font-bold tabular-nums min-w-[28px] text-center" style={{ color: goal.color }}>{count}</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={() => handleDelta(1)}
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
        <ChevronIcon className="w-4 h-4 text-muted-foreground/40 shrink-0 cursor-pointer" onClick={onOpen} />
      </CardContent>
    </Card>
  );
}

function CurveCard({ goal, onUpdate, onOpen }: { goal: Goal; onUpdate: () => void; onOpen: () => void }) {
  const Icon = ICON_MAP[goal.icon] ?? Hash;
  const todayStr = today();
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadEntries<CurveEntry>(goal.id).then(entries => {
      const todayEntry = entries.find(e => e.date === todayStr);
      if (todayEntry) {
        setValue(todayEntry.value.toString());
        setSaved(true);
      }
    });
  }, [goal.id, todayStr]);

  const handleLog = async () => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    await setCurveEntry(goal.id, todayStr, num);
    setSaved(true);
    onUpdate();
  };

  return (
    <Card className="!py-0">
      <CardContent className="!px-4 !py-3 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 cursor-pointer"
          style={{ backgroundColor: goal.color + '18', color: goal.color }}
          onClick={onOpen}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onOpen}>
          <p className="text-sm font-medium leading-tight">{goal.name}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Input
            type="number"
            step="0.1"
            placeholder="--"
            value={value}
            onChange={e => { setValue(e.target.value); setSaved(false); }}
            className="text-sm font-semibold h-8 w-20 text-center"
            onKeyDown={e => e.key === 'Enter' && handleLog()}
          />
          <span className="text-[11px] text-muted-foreground">{goal.unit}</span>
          <Button
            size="icon"
            className="h-8 w-8"
            onClick={handleLog}
            disabled={!value}
            variant={saved ? 'secondary' : 'default'}
          >
            <Check className="w-3.5 h-3.5" />
          </Button>
        </div>
        <ChevronIcon className="w-4 h-4 text-muted-foreground/40 shrink-0 cursor-pointer" onClick={onOpen} />
      </CardContent>
    </Card>
  );
}

function ChevronIcon({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <svg onClick={onClick} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
