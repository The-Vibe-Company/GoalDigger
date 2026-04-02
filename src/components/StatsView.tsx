import { Goal } from '../types';

interface Props {
  goals: Goal[];
  onBack: () => void;
}

function getStreak(goals: Goal[]): number {
  const allEntries = goals.flatMap(g => g.history);
  if (allEntries.length === 0) return 0;

  const daySet = new Set(
    allEntries.map(e => e.timestamp.slice(0, 10))
  );

  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (daySet.has(key)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export default function StatsView({ goals, onBack }: Props) {
  const active = goals.filter(g => g.progress < g.target);
  const completed = goals.filter(g => g.progress >= g.target);
  const avgProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + Math.min(100, (g.progress / g.target) * 100), 0) / goals.length)
    : 0;
  const streak = getStreak(goals);
  const totalActions = goals.reduce((sum, g) => sum + g.history.length, 0);

  return (
    <div className="stats-view">
      <div className="stats-header">
        <button className="back-btn" onClick={onBack}>← Retour</button>
        <h2>Statistiques</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{goals.length}</span>
          <span className="stat-label">Objectifs</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{active.length}</span>
          <span className="stat-label">En cours</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{completed.length}</span>
          <span className="stat-label">Completes</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{avgProgress}%</span>
          <span className="stat-label">Moy. progression</span>
        </div>
        <div className="stat-card accent">
          <span className="stat-value">{streak}🔥</span>
          <span className="stat-label">Jours de streak</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalActions}</span>
          <span className="stat-label">Actions totales</span>
        </div>
      </div>

      {goals.length > 0 && (
        <div className="stats-breakdown">
          <h3>Par objectif</h3>
          {goals.map(g => {
            const pct = Math.min(100, Math.round((g.progress / g.target) * 100));
            return (
              <div key={g.id} className="stat-row">
                <span className="stat-row-emoji">{g.emoji}</span>
                <span className="stat-row-title">{g.title}</span>
                <span className="stat-row-pct" style={{ color: g.color }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
