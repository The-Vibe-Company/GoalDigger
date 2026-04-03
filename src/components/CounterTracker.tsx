import { useState, useMemo, useRef, useEffect } from 'react';
import { Goal, CounterEntry } from '@/types';
import { loadEntries, setCounterEntry } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, ReferenceLine } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths, isSameMonth, isToday, parseISO, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Minus, Check, X } from 'lucide-react';

interface Props {
  goal: Goal;
  onUpdate: () => void;
}

export default function CounterTracker({ goal, onUpdate }: Props) {
  const [entries, setEntries] = useState<CounterEntry[]>([]);
  const [month, setMonth] = useState(new Date());
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editCount, setEditCount] = useState(0);
  const editRef = useRef<HTMLDivElement>(null);

  const fetchEntries = async () => {
    const e = await loadEntries<CounterEntry>(goal.id);
    setEntries(e);
  };

  useEffect(() => { fetchEntries(); }, [goal.id]);

  useEffect(() => {
    if (editingDate && editRef.current) {
      editRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [editingDate]);

  const handleDateTap = (dateStr: string) => {
    const existing = entries.find(e => e.date === dateStr);
    setEditingDate(dateStr);
    setEditCount(existing?.count ?? 0);
  };

  const handleEditDelta = (delta: number) => {
    setEditCount(c => Math.max(0, c + delta));
  };

  const handleEditSave = async () => {
    if (!editingDate) return;
    await setCounterEntry(goal.id, editingDate, editCount);
    setEditingDate(null);
    await fetchEntries();
    onUpdate();
  };

  // Calendar data
  const calendarDays = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    const startDow = (getDay(start) + 6) % 7;
    const padded: (Date | null)[] = Array(startDow).fill(null);
    padded.push(...days);
    return padded;
  }, [month]);

  const countMap = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach(e => map.set(e.date, e.count));
    return map;
  }, [entries]);

  const totalThisMonth = useMemo(() => {
    return entries
      .filter(e => isSameMonth(parseISO(e.date), month))
      .reduce((sum, e) => sum + e.count, 0);
  }, [entries, month]);

  const maxCount = useMemo(() => {
    return entries.length > 0 ? Math.max(...entries.map(e => e.count)) : 1;
  }, [entries]);

  const chartData = useMemo(() => {
    const data: { date: string; label: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const entry = entries.find(e => e.date === d);
      data.push({
        date: d,
        label: format(parseISO(d), 'd MMM', { locale: fr }),
        count: entry?.count ?? 0,
      });
    }
    return data;
  }, [entries]);

  const hasData = entries.length > 0;

  return (
    <div className="space-y-4">
      {/* Inline edit bar */}
      {editingDate && (
        <Card className="!py-0" ref={editRef} style={{ animation: 'fade-up 0.2s ease forwards' }}>
          <CardContent className="!px-4 !py-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {format(parseISO(editingDate), 'd MMM yyyy', { locale: fr })}
              </p>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => handleEditDelta(-1)} disabled={editCount <= 0}>
                  <Minus className="w-3.5 h-3.5" />
                </Button>
                <p className="text-lg font-bold tabular-nums min-w-[28px] text-center" style={{ color: goal.color }}>{editCount}</p>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => handleEditDelta(1)}>
                  <Plus className="w-3.5 h-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleEditSave}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" onClick={() => setEditingDate(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar */}
      <Card className="!py-0">
        <CardContent className="!px-4 !py-5">
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

          <div className="grid grid-cols-7 gap-1 mb-1">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
              <div key={i} className="text-[10px] text-muted-foreground text-center font-medium py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;

              const dateStr = format(day, 'yyyy-MM-dd');
              const count = countMap.get(dateStr) ?? 0;
              const intensity = count > 0 ? Math.max(0.1, Math.min(0.35, (count / maxCount) * 0.35)) : 0;
              const isNow = isToday(day);
              const isEditing = editingDate === dateStr;

              return (
                <button
                  key={dateStr}
                  type="button"
                  className={`aspect-square rounded-md flex flex-col items-center justify-center relative transition-colors
                    ${isNow ? 'ring-1 ring-foreground/30' : ''}
                    ${isEditing ? 'ring-2 ring-primary' : ''}
                    ${count === 0 ? 'hover:bg-secondary/30' : ''}
                  `}
                  style={{
                    backgroundColor: count > 0 ? `color-mix(in oklch, ${goal.color} ${Math.round(intensity * 100)}%, transparent)` : undefined,
                  }}
                  onClick={() => handleDateTap(dateStr)}
                >
                  <span className="text-[11px] tabular-nums leading-none">{format(day, 'd')}</span>
                  {count > 0 && (
                    <span className="absolute bottom-1.5 right-1.5 text-[9px] font-bold tabular-nums leading-none" style={{ color: goal.color }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">Total du mois</span>
            <span className="text-sm font-semibold" style={{ color: goal.color }}>
              {totalThisMonth} {goal.unit}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      {hasData && (
        <Card className="!py-0">
          <CardContent className="!px-2 !py-4">
            <p className="text-xs text-muted-foreground mb-3 px-3">30 derniers jours</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#666' }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#666' }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#888' }}
                  formatter={(val) => [`${val} ${goal.unit}`, '']}
                />
                <Bar
                  dataKey="count"
                  fill={goal.color}
                  radius={[3, 3, 0, 0]}
                  opacity={0.8}
                />
                {goal.target && (
                  <ReferenceLine
                    y={goal.target}
                    stroke="#666"
                    strokeDasharray="4 4"
                    label={{ value: `${goal.target}`, position: 'right', fontSize: 10, fill: '#666' }}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
