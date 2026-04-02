import { useState, useEffect, useMemo } from 'react';
import { Goal, View, SortMode, Category, CATEGORIES } from './types';
import { loadGoals, saveGoals } from './store';
import GoalCard from './components/GoalCard';
import GoalForm from './components/GoalForm';
import StatsView from './components/StatsView';
import ConfirmModal from './components/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import './App.css';

type FormData = Omit<Goal, 'id' | 'createdAt' | 'history' | 'order'>;

export default function App() {
  const [goals, setGoals] = useState<Goal[]>(loadGoals);
  const [view, setView] = useState<View>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [sortMode, setSortMode] = useState<SortMode>('custom');

  useEffect(() => { saveGoals(goals); }, [goals]);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const addGoal = (data: FormData) => {
    const maxOrder = goals.reduce((max, g) => Math.max(max, g.order), -1);
    setGoals(prev => [...prev, {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      history: [],
      order: maxOrder + 1,
    }]);
    setView('list');
  };

  const editGoal = (data: FormData) => {
    if (!editingId) return;
    setGoals(prev => prev.map(g => g.id === editingId ? { ...g, ...data } : g));
    setEditingId(null);
    setView('list');
  };

  const updateProgress = (id: string, delta: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== id) return g;
      const newProgress = Math.max(0, g.progress + delta);
      return {
        ...g,
        progress: newProgress,
        history: [...g.history, {
          timestamp: new Date().toISOString(),
          delta,
          newProgress,
        }],
      };
    }));
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setGoals(prev => prev.filter(g => g.id !== deleteId));
    setDeleteId(null);
  };

  const moveGoal = (id: string, direction: 'up' | 'down') => {
    setGoals(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex(g => g.id === id);
      if (idx < 0) return prev;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const tempOrder = sorted[idx].order;
      sorted[idx] = { ...sorted[idx], order: sorted[swapIdx].order };
      sorted[swapIdx] = { ...sorted[swapIdx], order: tempOrder };
      return sorted;
    });
  };

  const filteredGoals = useMemo(() => {
    let result = goals;
    if (filterCategory !== 'all') {
      result = result.filter(g => g.category === filterCategory);
    }
    switch (sortMode) {
      case 'progress':
        return [...result].sort((a, b) => (a.progress / a.target) - (b.progress / b.target));
      case 'deadline':
        return [...result].sort((a, b) => {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return a.deadline.localeCompare(b.deadline);
        });
      case 'created':
        return [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      default:
        return [...result].sort((a, b) => a.order - b.order);
    }
  }, [goals, filterCategory, sortMode]);

  const completedCount = goals.filter(g => g.progress >= g.target).length;
  const editingGoal = editingId ? goals.find(g => g.id === editingId) : undefined;
  const deletingGoal = deleteId ? goals.find(g => g.id === deleteId) : undefined;

  // Active categories (that have at least one goal)
  const activeCategories = useMemo(() => {
    const cats = new Set(goals.map(g => g.category));
    return CATEGORIES.filter(c => cats.has(c));
  }, [goals]);

  return (
    <div className="max-w-[430px] mx-auto min-h-dvh flex flex-col px-4 pb-24">
      {/* Header */}
      <header className="pt-6 pb-3 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">GoalDigger <span className="inline-block">⛏️</span></h1>
        {goals.length > 0 && (
          <p className="text-sm text-muted-foreground mt-1">{completedCount}/{goals.length} completes</p>
        )}
      </header>

      {view === 'stats' ? (
        <StatsView goals={goals} onBack={() => setView('list')} />
      ) : view === 'add' ? (
        <GoalForm onSubmit={addGoal} onCancel={() => setView('list')} />
      ) : view === 'edit' && editingGoal ? (
        <GoalForm initial={editingGoal} onSubmit={editGoal} onCancel={() => { setEditingId(null); setView('list'); }} isEdit />
      ) : (
        <>
          {/* Toolbar */}
          {goals.length > 0 && (
            <div className="space-y-3 mb-4">
              {/* Filters */}
              {activeCategories.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                  <Badge
                    variant={filterCategory === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer shrink-0"
                    onClick={() => setFilterCategory('all')}
                  >
                    Tous
                  </Badge>
                  {activeCategories.map(c => (
                    <Badge
                      key={c}
                      variant={filterCategory === c ? 'default' : 'outline'}
                      className="cursor-pointer shrink-0"
                      onClick={() => setFilterCategory(c)}
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Sort + Stats */}
              <div className="flex items-center gap-2">
                <Select value={sortMode} onValueChange={v => setSortMode(v as SortMode)}>
                  <SelectTrigger className="h-8 text-xs w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Ordre perso</SelectItem>
                    <SelectItem value="progress">Progression</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="created">Plus recents</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex-1" />
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setView('stats')}>
                  📊 Stats
                </Button>
              </div>
            </div>
          )}

          {/* Goal list */}
          {filteredGoals.length === 0 && goals.length === 0 ? (
            <div className="text-center mt-[30vh] text-muted-foreground">
              <span className="text-6xl block mb-4">⛏️</span>
              <p className="text-base">Aucun objectif pour l'instant.</p>
              <p className="text-base">Creuse-toi un chemin vers le succes !</p>
            </div>
          ) : filteredGoals.length === 0 ? (
            <div className="text-center mt-20 text-muted-foreground">
              <p className="text-sm">Aucun objectif dans cette categorie.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGoals.map(g => (
                <div key={g.id} className="relative">
                  <GoalCard
                    goal={g}
                    onUpdate={updateProgress}
                    onDelete={(id) => setDeleteId(id)}
                    onEdit={(id) => { setEditingId(id); setView('edit'); }}
                  />
                  {sortMode === 'custom' && (
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                      <button
                        className="text-muted-foreground/40 hover:text-muted-foreground text-[10px] leading-none"
                        onClick={() => moveGoal(g.id, 'up')}
                      >▲</button>
                      <button
                        className="text-muted-foreground/40 hover:text-muted-foreground text-[10px] leading-none"
                        onClick={() => moveGoal(g.id, 'down')}
                      >▼</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* FAB */}
          <Button
            className="fixed bottom-7 right-[calc(50%-179px)] h-14 w-14 rounded-full text-2xl shadow-lg bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-0"
            size="icon"
            onClick={() => setView('add')}
          >
            +
          </Button>
        </>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!deleteId}
        title="Supprimer l'objectif"
        message={deletingGoal ? `Tu veux vraiment supprimer "${deletingGoal.title}" ? Cette action est irreversible.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
