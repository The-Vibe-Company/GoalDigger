import { useState, useEffect } from 'react';
import { Goal, View } from './types';
import { loadGoals, saveGoals } from './store';
import './App.css';

const EMOJIS = ['🏋️', '📚', '💰', '🏃', '💧', '🧘', '✍️', '🎯', '🔥', '💤', '🥗', '🎸'];
const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#e84393'];

function GoalCard({ goal, onUpdate, onDelete }: { goal: Goal; onUpdate: (id: string, delta: number) => void; onDelete: (id: string) => void }) {
  const pct = Math.min(100, Math.round((goal.progress / goal.target) * 100));
  const done = pct >= 100;

  return (
    <div className={`goal-card ${done ? 'done' : ''}`} style={{ '--accent': goal.color } as React.CSSProperties}>
      <div className="goal-header">
        <span className="goal-emoji">{goal.emoji}</span>
        <div className="goal-info">
          <h3>{goal.title}</h3>
          <span className="goal-stats">{goal.progress} / {goal.target} {goal.unit}</span>
        </div>
        <button className="delete-btn" onClick={() => onDelete(goal.id)}>×</button>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="goal-actions">
        <button onClick={() => onUpdate(goal.id, -1)} disabled={goal.progress <= 0}>−</button>
        <span className="pct">{pct}%</span>
        <button onClick={() => onUpdate(goal.id, 1)}>+</button>
      </div>
    </div>
  );
}

function AddGoalForm({ onAdd, onCancel }: { onAdd: (g: Omit<Goal, 'id' | 'createdAt'>) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !target) return;
    onAdd({ title: title.trim(), emoji, target: Number(target), unit: unit.trim() || 'fois', progress: 0, color });
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <h2>Nouvel objectif</h2>

      <label>Emoji</label>
      <div className="emoji-picker">
        {EMOJIS.map(e => (
          <button type="button" key={e} className={emoji === e ? 'selected' : ''} onClick={() => setEmoji(e)}>{e}</button>
        ))}
      </div>

      <label>Nom</label>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Lire des livres" autoFocus />

      <label>Objectif</label>
      <div className="target-row">
        <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="10" min="1" />
        <input type="text" value={unit} onChange={e => setUnit(e.target.value)} placeholder="fois" />
      </div>

      <label>Couleur</label>
      <div className="color-picker">
        {COLORS.map(c => (
          <button type="button" key={c} className={color === c ? 'selected' : ''} style={{ background: c }} onClick={() => setColor(c)} />
        ))}
      </div>

      <div className="form-actions">
        <button type="button" className="cancel-btn" onClick={onCancel}>Annuler</button>
        <button type="submit" className="submit-btn" disabled={!title.trim() || !target}>Ajouter</button>
      </div>
    </form>
  );
}

export default function App() {
  const [goals, setGoals] = useState<Goal[]>(loadGoals);
  const [view, setView] = useState<View>('list');

  useEffect(() => { saveGoals(goals); }, [goals]);

  const addGoal = (data: Omit<Goal, 'id' | 'createdAt'>) => {
    setGoals(prev => [...prev, { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]);
    setView('list');
  };

  const updateProgress = (id: string, delta: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, progress: Math.max(0, g.progress + delta) } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const completedCount = goals.filter(g => g.progress >= g.target).length;

  return (
    <div className="app">
      <header>
        <h1>GoalDigger ⛏️</h1>
        {goals.length > 0 && (
          <p className="subtitle">{completedCount}/{goals.length} complétés</p>
        )}
      </header>

      {view === 'list' ? (
        <main>
          {goals.length === 0 ? (
            <div className="empty">
              <span className="empty-icon">⛏️</span>
              <p>Aucun objectif pour l'instant.</p>
              <p>Creuse-toi un chemin vers le succès !</p>
            </div>
          ) : (
            <div className="goals-list">
              {goals.map(g => (
                <GoalCard key={g.id} goal={g} onUpdate={updateProgress} onDelete={deleteGoal} />
              ))}
            </div>
          )}
          <button className="fab" onClick={() => setView('add')}>+</button>
        </main>
      ) : (
        <main>
          <AddGoalForm onAdd={addGoal} onCancel={() => setView('list')} />
        </main>
      )}
    </div>
  );
}
