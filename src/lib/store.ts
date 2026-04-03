import { apiFetch } from './client';
import { Goal, CurveEntry, CounterEntry } from '@/types';

// ── Goals ──

export async function loadGoals(): Promise<Goal[]> {
  const rows = await apiFetch<Record<string, unknown>[]>('/api/goals');
  return rows.map(rowToGoal);
}

export async function addGoal(goal: Goal): Promise<void> {
  await apiFetch('/api/goals', {
    method: 'POST',
    body: JSON.stringify({
      id: goal.id,
      name: goal.name,
      type: goal.type,
      unit: goal.unit,
      icon: goal.icon,
      color: goal.color,
      target: goal.target,
    }),
  });
}

export async function deleteGoal(id: string): Promise<void> {
  await apiFetch(`/api/goals/${id}`, { method: 'DELETE' });
}

export async function updateGoal(id: string, updates: Partial<Goal>): Promise<void> {
  await apiFetch(`/api/goals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

// ── Entries ──

export async function loadEntries<T extends CurveEntry | CounterEntry>(goalId: string): Promise<T[]> {
  const rows = await apiFetch<Record<string, unknown>[]>(`/api/entries/${goalId}`);
  return rows.map(r => rowToEntry<T>(r));
}

export async function setCurveEntry(goalId: string, date: string, value: number): Promise<void> {
  await apiFetch(`/api/entries/${goalId}`, {
    method: 'POST',
    body: JSON.stringify({ date, value }),
  });
}

export async function setCounterEntry(goalId: string, date: string, count: number): Promise<void> {
  await apiFetch(`/api/entries/${goalId}`, {
    method: 'POST',
    body: JSON.stringify({ date, count }),
  });
}

export async function getCounterForDate(goalId: string, date: string): Promise<number> {
  const entries = await loadEntries<CounterEntry>(goalId);
  return entries.find(e => e.date === date)?.count ?? 0;
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
  const date = (r.date as string).slice(0, 10);
  if (r.value !== null && r.value !== undefined) {
    return { date, value: r.value as number } as T;
  }
  return { date, count: (r.count as number) ?? 0 } as T;
}
