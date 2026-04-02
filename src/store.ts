import { Goal } from './types';

const STORAGE_KEY = 'goaldigger_goals';

function migrateGoal(g: Record<string, unknown>): Goal {
  return {
    id: g.id as string,
    title: g.title as string,
    emoji: g.emoji as string,
    target: g.target as number,
    unit: g.unit as string,
    progress: g.progress as number,
    createdAt: g.createdAt as string,
    color: g.color as string,
    category: (g.category as Goal['category']) ?? 'Perso',
    deadline: (g.deadline as string | null) ?? null,
    history: (g.history as Goal['history']) ?? [],
    order: (g.order as number) ?? 0,
  };
}

export function loadGoals(): Goal[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    return parsed.map(migrateGoal);
  } catch {
    return [];
  }
}

export function saveGoals(goals: Goal[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}
