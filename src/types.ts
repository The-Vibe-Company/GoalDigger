export interface Goal {
  id: string;
  title: string;
  emoji: string;
  target: number;
  unit: string;
  progress: number;
  createdAt: string;
  color: string;
}

export type View = 'list' | 'add';
