import { useState, useMemo } from 'react';
import { Goal, CurveEntry } from '@/types';
import { loadEntries, setCurveEntry, today, updateGoal } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip, Area, ComposedChart } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Target, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface Props {
  goal: Goal;
  onUpdate: () => void;
}

export default function CurveTracker({ goal, onUpdate }: Props) {
  const entries = loadEntries<CurveEntry>(goal.id);
  const todayStr = today();
  const todayEntry = entries.find(e => e.date === todayStr);

  const [value, setValue] = useState(todayEntry?.value?.toString() ?? '');
  const [editTarget, setEditTarget] = useState(false);
  const [targetValue, setTargetValue] = useState(goal.target?.toString() ?? '');

  const handleLog = () => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setCurveEntry(goal.id, todayStr, num);
    onUpdate();
  };

  const handleTargetSave = () => {
    const num = parseFloat(targetValue);
    updateGoal(goal.id, { target: isNaN(num) ? null : num });
    setEditTarget(false);
    onUpdate();
  };

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
  const latest = hasData ? entries[entries.length - 1] : null;
  const previous = entries.length > 1 ? entries[entries.length - 2] : null;
  const diff = latest && previous ? latest.value - previous.value : null;

  const minVal = hasData ? Math.min(...entries.map(e => e.value)) : 0;
  const maxVal = hasData ? Math.max(...entries.map(e => e.value)) : 100;
  const padding = (maxVal - minVal) * 0.15 || 5;

  return (
    <div className="space-y-4">
      {/* Today input */}
      <Card className="!py-0">
        <CardContent className="!px-5 !py-5">
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label className="text-xs text-muted-foreground">Aujourd'hui</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.1"
                  placeholder={`-- ${goal.unit}`}
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  className="text-lg font-semibold h-12"
                  onKeyDown={e => e.key === 'Enter' && handleLog()}
                />
                <span className="text-sm text-muted-foreground shrink-0">{goal.unit}</span>
              </div>
            </div>
            <Button className="h-12 px-6" onClick={handleLog} disabled={!value}>
              OK
            </Button>
          </div>

          {/* Quick stats */}
          {latest && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-muted-foreground">Dernier :</span>
                <span className="font-semibold">{latest.value} {goal.unit}</span>
              </div>
              {diff !== null && (
                <div className="flex items-center gap-1 text-sm">
                  {diff < 0 ? (
                    <TrendingDown className="w-3.5 h-3.5 text-green-500" />
                  ) : diff > 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                  <span className={diff < 0 ? 'text-green-500' : diff > 0 ? 'text-red-400' : 'text-muted-foreground'}>
                    {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          )}
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
