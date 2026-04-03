import { useState, useMemo, useEffect } from 'react';
import { Goal, CurveEntry, CounterEntry } from '@/types';
import { loadEntries } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isToday, isSameWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  goals: Goal[];
}

export default function CalendarOverview({ goals }: Props) {
  const [week, setWeek] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [allEntries, setAllEntries] = useState<Map<string, Map<string, { value?: number; count?: number }>>>(new Map());

  useEffect(() => {
    const fetchAll = async () => {
      const map = new Map<string, Map<string, { value?: number; count?: number }>>();
      await Promise.all(
        goals.map(async (g) => {
          const goalMap = new Map<string, { value?: number; count?: number }>();
          if (g.type === 'curve') {
            const entries = await loadEntries<CurveEntry>(g.id);
            entries.forEach(e => goalMap.set(e.date, { value: e.value }));
          } else {
            const entries = await loadEntries<CounterEntry>(g.id);
            entries.forEach(e => goalMap.set(e.date, { count: e.count }));
          }
          map.set(g.id, goalMap);
        })
      );
      setAllEntries(map);
    };
    fetchAll();
  }, [goals]);

  const days = useMemo(() => {
    const start = startOfWeek(week, { weekStartsOn: 1 });
    const end = endOfWeek(week, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [week]);

  const isCurrentWeek = isSameWeek(week, new Date(), { weekStartsOn: 1 });

  return (
    <div className="space-y-2" style={{ animation: 'fade-up 0.3s ease forwards' }}>
      {/* Week nav */}
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeek(subWeeks(week, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <button
          className={`text-sm font-medium ${isCurrentWeek ? 'text-primary' : ''}`}
          onClick={() => setWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}
        >
          {format(days[0], 'd MMM', { locale: fr })} — {format(days[6], 'd MMM yyyy', { locale: fr })}
        </button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeek(addWeeks(week, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Days */}
      {days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const isNow = isToday(day);

        const dayGoals = goals.map(g => {
          const goalEntries = allEntries.get(g.id);
          const entry = goalEntries?.get(dateStr);
          return { ...g, entry };
        });

        const hasAnyData = dayGoals.some(g => g.entry);

        return (
          <Card key={dateStr} className={`!py-0 ${isNow ? 'ring-1 ring-primary' : ''}`}>
            <CardContent className="!px-4 !py-3">
              <div className="flex items-start gap-3">
                {/* Day label */}
                <div className="w-10 shrink-0 pt-0.5">
                  <p className={`text-xs font-medium capitalize ${isNow ? 'text-primary' : 'text-muted-foreground'}`}>
                    {format(day, 'EEE', { locale: fr })}
                  </p>
                  <p className={`text-lg font-bold tabular-nums leading-tight ${isNow ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </p>
                </div>

                {/* Goal values */}
                {hasAnyData ? (
                  <div className="flex-1 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                    {dayGoals.map(g => {
                      if (!g.entry) return null;
                      const val = g.type === 'curve' ? g.entry.value : g.entry.count;
                      return (
                        <div key={g.id} className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                          <span className="text-xs text-muted-foreground">{g.name}</span>
                          <span className="text-xs font-semibold" style={{ color: g.color }}>
                            {val} {g.unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex-1 pt-2">
                    <p className="text-xs text-muted-foreground/30">--</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
