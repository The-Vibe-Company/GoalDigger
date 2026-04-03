import { Goal, CurveEntry, CounterEntry } from '@/types';

const GOALS_KEY = 'goaldigger_goals';
const ENTRIES_PREFIX = 'goaldigger_entries_';

// Goals
export function loadGoals(): Goal[] {
  const raw = localStorage.getItem(GOALS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function saveGoals(goals: Goal[]): void {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export function addGoal(goal: Goal): void {
  const goals = loadGoals();
  goals.push(goal);
  saveGoals(goals);
}

export function deleteGoal(id: string): void {
  const goals = loadGoals().filter(g => g.id !== id);
  saveGoals(goals);
  localStorage.removeItem(ENTRIES_PREFIX + id);
}

export function updateGoal(id: string, updates: Partial<Goal>): void {
  const goals = loadGoals().map(g => g.id === id ? { ...g, ...updates } : g);
  saveGoals(goals);
}

// Entries
export function loadEntries<T extends CurveEntry | CounterEntry>(goalId: string): T[] {
  const raw = localStorage.getItem(ENTRIES_PREFIX + goalId);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function saveEntries(goalId: string, entries: (CurveEntry | CounterEntry)[]): void {
  localStorage.setItem(ENTRIES_PREFIX + goalId, JSON.stringify(entries));
}

// Curve: set value for a date (replace if exists)
export function setCurveEntry(goalId: string, date: string, value: number): void {
  const entries = loadEntries<CurveEntry>(goalId);
  const idx = entries.findIndex(e => e.date === date);
  if (idx >= 0) {
    entries[idx].value = value;
  } else {
    entries.push({ date, value });
  }
  entries.sort((a, b) => a.date.localeCompare(b.date));
  saveEntries(goalId, entries);
}

// Counter: increment count for a date
export function incrementCounter(goalId: string, date: string, delta = 1): void {
  const entries = loadEntries<CounterEntry>(goalId);
  const idx = entries.findIndex(e => e.date === date);
  if (idx >= 0) {
    entries[idx].count = Math.max(0, entries[idx].count + delta);
  } else if (delta > 0) {
    entries.push({ date, count: delta });
  }
  saveEntries(goalId, entries);
}

export function getCounterForDate(goalId: string, date: string): number {
  const entries = loadEntries<CounterEntry>(goalId);
  return entries.find(e => e.date === date)?.count ?? 0;
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
