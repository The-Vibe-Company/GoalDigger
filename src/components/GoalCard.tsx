import { useState, useRef, useCallback } from 'react';
import { Goal } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Sparkline from './Sparkline';

interface Props {
  goal: Goal;
  onUpdate: (id: string, delta: number) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

function getDeadlineStatus(deadline: string | null): { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' } | null {
  if (!deadline) return null;
  const now = new Date();
  const dl = new Date(deadline);
  const diffDays = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: `${Math.abs(diffDays)}j en retard`, variant: 'destructive' };
  if (diffDays <= 3) return { label: `${diffDays}j restants`, variant: 'default' };
  if (diffDays <= 7) return { label: `${diffDays}j restants`, variant: 'secondary' };
  return { label: `${diffDays}j restants`, variant: 'outline' };
}

export default function GoalCard({ goal, onUpdate, onDelete, onEdit }: Props) {
  const pct = Math.min(100, Math.round((goal.progress / goal.target) * 100));
  const done = pct >= 100;
  const deadlineStatus = getDeadlineStatus(goal.deadline);

  const [increment, setIncrement] = useState(1);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showIncrement, setShowIncrement] = useState(false);

  const handleLongPressStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setShowIncrement(true);
    }, 500);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const increments = [1, 2, 5, 10, 25];

  return (
    <Card className={`transition-opacity ${done ? 'opacity-60' : ''}`} style={{ borderLeftColor: goal.color, borderLeftWidth: '4px' }}>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="text-2xl shrink-0">{goal.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate">{goal.title}</h3>
              <Badge variant="outline" className="text-[10px] shrink-0">{goal.category}</Badge>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">{goal.progress} / {goal.target} {goal.unit}</span>
              {deadlineStatus && (
                <Badge variant={deadlineStatus.variant} className="text-[10px]">{deadlineStatus.label}</Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => onEdit(goal.id)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDelete(goal.id)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <Progress value={pct} className="h-2" style={{ '--progress-color': goal.color } as React.CSSProperties} />
          <div className="flex items-center justify-between">
            <Sparkline history={goal.history} color={goal.color} width={100} height={24} />
            <span className="text-xs font-bold text-muted-foreground">{pct}%</span>
          </div>
        </div>

        {/* Increment selector (on long press) */}
        {showIncrement && (
          <div className="flex items-center gap-1.5 justify-center">
            {increments.map(inc => (
              <Button
                key={inc}
                variant={increment === inc ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => { setIncrement(inc); setShowIncrement(false); }}
              >
                +{inc}
              </Button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            style={{ borderColor: goal.color }}
            disabled={goal.progress <= 0}
            onClick={() => onUpdate(goal.id, -increment)}
          >
            <span className="text-lg leading-none">-</span>
          </Button>
          <span className="text-xs text-muted-foreground font-mono w-8 text-center">
            {increment > 1 ? `x${increment}` : ''}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            style={{ borderColor: goal.color }}
            onClick={() => onUpdate(goal.id, increment)}
            onPointerDown={handleLongPressStart}
            onPointerUp={handleLongPressEnd}
            onPointerLeave={handleLongPressEnd}
          >
            <span className="text-lg leading-none">+</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
