export const CATEGORIES = ['Sport', 'Finance', 'Santé', 'Perso', 'Travail', 'Éducation'] as const;
export type Category = (typeof CATEGORIES)[number];

export interface HistoryEntry {
  timestamp: string;
  delta: number;
  newProgress: number;
}

export interface Goal {
  id: string;
  title: string;
  emoji: string;
  target: number;
  unit: string;
  progress: number;
  createdAt: string;
  color: string;
  category: Category;
  deadline: string | null;
  history: HistoryEntry[];
  order: number;
}

export type SortMode = 'custom' | 'progress' | 'deadline' | 'created';
export type View = 'list' | 'add' | 'edit' | 'stats';
