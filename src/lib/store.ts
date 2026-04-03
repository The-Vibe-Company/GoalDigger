import { neon } from '@/lib/client';
import { Goal, CurveEntry, CounterEntry } from '@/types';

// ── Goals ──

export async function loadGoals(): Promise<Goal[]> {
  const { data, error } = await neon
    .from('goals')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToGoal);
}

export async function addGoal(goal: Goal): Promise<void> {
  const { error } = await neon.from('goals').insert({
    id: goal.id,
    name: goal.name,
    type: goal.type,
    unit: goal.unit,
    icon: goal.icon,
    color: goal.color,
    target: goal.target,
  });
  if (error) throw error;
}

export async function deleteGoal(id: string): Promise<void> {
  // Entries cascade-delete via FK
  const { error } = await neon.from('goals').delete().eq('id', id);
  if (error) throw error;
}

export async function updateGoal(id: string, updates: Partial<Goal>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.target !== undefined) row.target = updates.target;
  if (updates.color !== undefined) row.color = updates.color;
  if (updates.unit !== undefined) row.unit = updates.unit;
  if (updates.icon !== undefined) row.icon = updates.icon;

  const { error } = await neon.from('goals').update(row).eq('id', id);
  if (error) throw error;
}

// ── Entries ──

export async function loadEntries<T extends CurveEntry | CounterEntry>(goalId: string): Promise<T[]> {
  const { data, error } = await neon
    .from('entries')
    .select('*')
    .eq('goal_id', goalId)
    .order('date', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(r => rowToEntry<T>(r));
}

export async function setCurveEntry(goalId: string, date: string, value: number): Promise<void> {
  const { error } = await neon.from('entries').upsert(
    { goal_id: goalId, date, value, count: null },
    { onConflict: 'goal_id,date' },
  );
  if (error) throw error;
}

export async function setCounterEntry(goalId: string, date: string, count: number): Promise<void> {
  if (count <= 0) {
    // Delete the entry if count is 0
    await neon.from('entries').delete().eq('goal_id', goalId).eq('date', date);
    return;
  }
  const { error } = await neon.from('entries').upsert(
    { goal_id: goalId, date, value: null, count },
    { onConflict: 'goal_id,date' },
  );
  if (error) throw error;
}

export async function incrementCounter(goalId: string, date: string, delta: number): Promise<void> {
  // Read current
  const { data } = await neon
    .from('entries')
    .select('count')
    .eq('goal_id', goalId)
    .eq('date', date)
    .maybeSingle();

  const current = (data?.count as number) ?? 0;
  const newCount = Math.max(0, current + delta);

  if (data) {
    const { error } = await neon
      .from('entries')
      .update({ count: newCount })
      .eq('goal_id', goalId)
      .eq('date', date);
    if (error) throw error;
  } else if (newCount > 0) {
    const { error } = await neon.from('entries').insert({
      goal_id: goalId,
      date,
      value: null,
      count: newCount,
    });
    if (error) throw error;
  }
}

export async function getCounterForDate(goalId: string, date: string): Promise<number> {
  const { data } = await neon
    .from('entries')
    .select('count')
    .eq('goal_id', goalId)
    .eq('date', date)
    .maybeSingle();
  return (data?.count as number) ?? 0;
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── Mappers ──

function rowToGoal(r: Record<string, unknown>): Goal {
  return {
    id: r.id as string,
    name: r.name as string,
    type: r.type as Goal['type'],
    unit: r.unit as string,
    icon: r.icon as string,
    color: r.color as string,
    target: (r.target as number) ?? null,
    createdAt: r.created_at as string,
  };
}

function rowToEntry<T>(r: Record<string, unknown>): T {
  const date = (r.date as string).slice(0, 10); // normalize to yyyy-MM-dd
  if (r.value !== null && r.value !== undefined) {
    return { date, value: r.value as number } as T;
  }
  return { date, count: (r.count as number) ?? 0 } as T;
}
