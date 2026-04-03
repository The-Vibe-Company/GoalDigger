export type GoalType = 'curve' | 'counter';

export interface Goal {
  id: string;
  name: string;
  type: GoalType;
  unit: string;
  icon: string;
  color: string;
  target: number | null;
  createdAt: string;
}

// One data point per day
export interface CurveEntry {
  date: string; // YYYY-MM-DD
  value: number;
}

export interface CounterEntry {
  date: string; // YYYY-MM-DD
  count: number;
}

export type GoalEntry = CurveEntry | CounterEntry;
