import { useState, useMemo, useRef, useEffect } from 'react';
import { Goal, CurveEntry } from '@/types';
import { loadEntries, setCurveEntry, updateGoal } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip, Area, ComposedChart } from 'recharts';
import { format, parseISO, subDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Target, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';

interface Props {
  goal: Goal;
  onUpdate: () => void;
}

export default function CurveTracker({ goal, onUpdate }: Props) {
  const [entries, setEntries] = useState<CurveEntry[]>([]);
  const [month, setMonth] = useState(new Date());
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editTarget, setEditTarget] = useState(false);
  const [targetValue, setTargetValue] = useState(goal.target?.toString() ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchEntries = async () => {
    const e = await loadEntries<CurveEntry>(goal.id);
    setEntries(e);
  };

  useEffect(() => { fetchEntries(); }, [goal.id]);

  useEffect(() => {
    if (editingDate && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingDate]);

  const handleDateTap = (dateStr: string) => {
    const existing = entries.find(e => e.date === dateStr);
    setEditingDate(dateStr);
    setEditValue(existing?.value?.toString() ?? '');
  };

  const handleSaveEntry = async () => {
    if (!editingDate) return;
    const num = parseFloat(editValue);
    if (isNaN(num)) return;
    await setCurveEntry(goal.id, editingDate, num);
    setEditingDate(null);
    setEditValue('');
    await fetchEntries();
    onUpdate();
  };

  const handleCancelEdit = () => {
    setEditingDate(null);
    setEditValue('');
  };

  const handleTargetSave = async () => {
    const num = parseFloat(targetValue);
    await updateGoal(goal.id, { target: isNaN(num) ? null : num });
    setEditTarget(false);
    onUpdate();
  };

  // Value map for calendar
  const valueMap = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach(e => map.set(e.date, e.value));
    return map;
  }, [entries]);

  // Calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    const startDow = (getDay(start) + 6) % 7;
    const padded: (Date | null)[] = Array(startDow).fill(null);
    padded.push(...days);
    return padded;
  }, [month]);

  // Chart data: last 30 days
  const chartData = useMemo(() => {
    const data: { date: string; label: string; value?: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const entry = entries.find(e => e.date === d);
      data.push({
        date: d,
        label: format(parseISO(d), 'd MMM', { locale: fr }),
        value: entry?.value,
      });
    }
    return data;
  }, [entries]);

  const hasData = entries.length > 0;
  const minVal = hasData ? Math.min(...entries.map(e => e.value)) : 0;
  const maxVal = hasData ? Math.max(...entries.map(e => e.value)) : 100;
  const padding = (maxVal - minVal) * 0.15 || 5;

  return (
    <div className="space-y-4">
      {/* Inline edit bar */}
      {editingDate && (
        <Card className="!py-0" style={{ animation: 'fade-up 0.2s ease forwards' }}>
          <CardContent className="!px-4 !py-4">
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground shrink-0">
                {format(parseISO(editingDate), 'd MMM yyyy', { locale: fr })}
              </p>
              <Input
                ref={inputRef}
                type="number"
                step="0.1"
                placeholder={`-- ${goal.unit}`}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                className="text-sm font-semibold h-9 flex-1"
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveEntry();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
              />
              <span className="text-xs text-muted-foreground shrink-0">{goal.unit}</span>
              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleSaveEntry} disabled={!editValue}>
                <Check className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-muted-foreground" onClick={handleCancelEdit}>
                <X className="w-4 h-4" />
              </Button>
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
              const val = valueMap.get(dateStr);
              const isNow = isToday(day);
              const isEditing = editingDate === dateStr;

              return (
                <button
                  key={dateStr}
                  type="button"
                  className={`aspect-square rounded-md flex flex-col items-center justify-center relative transition-colors
                    ${isNow ? 'ring-1 ring-foreground/30' : ''}
                    ${isEditing ? 'ring-2 ring-primary' : ''}
                    ${val !== undefined ? '' : 'hover:bg-secondary/30'}
                  `}
                  style={{
                    backgroundColor: val !== undefined ? goal.color + '18' : undefined,
                  }}
                  onClick={() => handleDateTap(dateStr)}
                >
                  <span className="text-[11px] tabular-nums leading-none">{format(day, 'd')}</span>
                  {val !== undefined && (
                    <span className="text-[8px] font-semibold tabular-nums mt-0.5 leading-none" style={{ color: goal.color }}>
                      {val}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Target */}
      <Card className="!py-0">
        <CardContent className="!px-5 !py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Objectif</span>
            </div>
            {editTarget ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.1"
                  value={targetValue}
                  onChange={e => setTargetValue(e.target.value)}
                  className="w-24 h-8 text-sm"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleTargetSave()}
                />
                <span className="text-xs text-muted-foreground">{goal.unit}</span>
                <Button size="sm" variant="ghost" className="h-8" onClick={handleTargetSave}>OK</Button>
              </div>
            ) : (
              <button
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setEditTarget(true)}
              >
                {goal.target ? `${goal.target} ${goal.unit}` : 'Definir'}
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      {hasData && (
        <Card className="!py-0">
          <CardContent className="!px-2 !py-4">
            <p className="text-xs text-muted-foreground mb-3 px-3">30 derniers jours</p>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${goal.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={goal.color} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={goal.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#666' }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[minVal - padding, maxVal + padding]}
                  tick={{ fontSize: 10, fill: '#666' }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#888' }}
                  formatter={(val) => [`${val} ${goal.unit}`, '']}
                />
                <Area
                  dataKey="value"
                  fill={`url(#grad-${goal.id})`}
                  stroke="none"
                  connectNulls
                />
                <Line
                  dataKey="value"
                  stroke={goal.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: goal.color }}
                  connectNulls
                />
                {goal.target && (
                  <ReferenceLine
                    y={goal.target}
                    stroke="#666"
                    strokeDasharray="4 4"
                    label={{ value: `${goal.target}`, position: 'right', fontSize: 10, fill: '#666' }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
