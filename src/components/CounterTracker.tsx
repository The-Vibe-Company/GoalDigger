import { useState, useMemo } from 'react';
import { Goal, CounterEntry } from '@/types';
import { loadEntries, incrementCounter, getCounterForDate, today } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths, isSameMonth, isToday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  goal: Goal;
  onUpdate: () => void;
}

export default function CounterTracker({ goal, onUpdate }: Props) {
  const todayStr = today();
  const todayCount = getCounterForDate(goal.id, todayStr);
  const entries = loadEntries<CounterEntry>(goal.id);

  const [month, setMonth] = useState(new Date());

  const handleIncrement = (delta: number) => {
    incrementCounter(goal.id, todayStr, delta);
    onUpdate();
  };

  // Calendar data
  const calendarDays = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });

    // Pad start with empty slots (Monday = 0)
    const startDow = (getDay(start) + 6) % 7; // Convert Sunday=0 to Monday=0
    const padded: (Date | null)[] = Array(startDow).fill(null);
    padded.push(...days);

    return padded;
  }, [month]);

  // Build a map of date -> count for quick lookup
  const countMap = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach(e => map.set(e.date, e.count));
    return map;
  }, [entries]);

  // Stats
  const totalThisMonth = useMemo(() => {
    return entries
      .filter(e => {
        const d = parseISO(e.date);
        return isSameMonth(d, month);
      })
      .reduce((sum, e) => sum + e.count, 0);
  }, [entries, month]);

  const maxCount = useMemo(() => {
    return entries.length > 0 ? Math.max(...entries.map(e => e.count)) : 1;
  }, [entries]);

  return (
    <div className="space-y-4">
      {/* Today counter */}
      <Card className="!py-0">
        <CardContent className="!px-5 !py-6">
          <p className="text-xs text-muted-foreground text-center mb-4">Aujourd'hui</p>
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => handleIncrement(-1)}
              disabled={todayCount <= 0}
            >
              <Minus className="w-5 h-5" />
            </Button>
            <div className="text-center min-w-[80px]">
              <p className="text-4xl font-bold tabular-nums" style={{ color: goal.color }}>
                {todayCount}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{goal.unit}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => handleIncrement(1)}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card className="!py-0">
        <CardContent className="!px-4 !py-5">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMonth(subMonths(month, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <p className="text-sm font-medium capitalize">
              {format(month, 'MMMM yyyy', { locale: fr })}
            </p>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMonth(addMonths(month, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
              <div key={i} className="text-[10px] text-muted-foreground text-center font-medium py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;

              const dateStr = format(day, 'yyyy-MM-dd');
              const count = countMap.get(dateStr) ?? 0;
              const intensity = count > 0 ? Math.max(0.15, Math.min(1, count / maxCount)) : 0;
              const isNow = isToday(day);

              return (
                <div
                  key={dateStr}
                  className={`aspect-square rounded-md flex flex-col items-center justify-center relative ${isNow ? 'ring-1 ring-foreground/30' : ''}`}
                  style={{
                    backgroundColor: count > 0 ? `color-mix(in oklch, ${goal.color} ${Math.round(intensity * 100)}%, transparent)` : undefined,
                  }}
                >
                  <span className="text-[11px] tabular-nums leading-none">{format(day, 'd')}</span>
                  {count > 0 && (
                    <span className="text-[8px] font-semibold tabular-nums mt-0.5 leading-none" style={{ color: goal.color }}>
                      {count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Month total */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">Total du mois</span>
            <span className="text-sm font-semibold" style={{ color: goal.color }}>
              {totalThisMonth} {goal.unit}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
