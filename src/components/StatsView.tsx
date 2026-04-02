import { Goal } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Props {
  goals: Goal[];
  onBack: () => void;
}

function getStreak(goals: Goal[]): number {
  const allEntries = goals.flatMap(g => g.history);
  if (allEntries.length === 0) return 0;

  const daySet = new Set(
    allEntries.map(e => e.timestamp.slice(0, 10))
  );

  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (daySet.has(key)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export default function StatsView({ goals, onBack }: Props) {
  const active = goals.filter(g => g.progress < g.target);
  const completed = goals.filter(g => g.progress >= g.target);
  const avgProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + Math.min(100, (g.progress / g.target) * 100), 0) / goals.length)
    : 0;
  const streak = getStreak(goals);
  const totalActions = goals.reduce((sum, g) => sum + g.history.length, 0);

  const stats = [
    { value: goals.length, label: 'Objectifs', icon: '🎯' },
    { value: active.length, label: 'En cours', icon: '⚡' },
    { value: completed.length, label: 'Termines', icon: '✅' },
    { value: `${avgProgress}%`, label: 'Moy. progression', icon: '📊' },
    { value: streak, label: 'Jours de streak', icon: '🔥', accent: true },
    { value: totalActions, label: 'Actions totales', icon: '💪' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Retour
        </Button>
        <h2 className="text-lg font-bold">Statistiques</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(s => (
          <Card key={s.label} className={s.accent ? 'border-orange-500/50' : ''}>
            <CardContent className="p-4 text-center">
              <span className="text-2xl">{s.icon}</span>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {goals.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">Par objectif</h3>
            {goals.map(g => {
              const pct = Math.min(100, Math.round((g.progress / g.target) * 100));
              return (
                <div key={g.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      <span className="mr-1.5">{g.emoji}</span>
                      {g.title}
                    </span>
                    <span className="text-xs font-bold" style={{ color: g.color }}>{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
