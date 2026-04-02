import { useState } from 'react';
import { Goal, CATEGORIES, Category } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EMOJIS = ['🏋️', '📚', '💰', '🏃', '💧', '🧘', '✍️', '🎯', '🔥', '💤', '🥗', '🎸', '🎨', '🧠', '🏊', '🚴'];
const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#e84393'];

type FormData = Omit<Goal, 'id' | 'createdAt' | 'history' | 'order'>;

interface Props {
  initial?: Goal;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function GoalForm({ initial, onSubmit, onCancel, isEdit }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? EMOJIS[0]);
  const [target, setTarget] = useState(initial?.target?.toString() ?? '');
  const [unit, setUnit] = useState(initial?.unit ?? '');
  const [color, setColor] = useState(initial?.color ?? COLORS[0]);
  const [category, setCategory] = useState<Category>(initial?.category ?? 'Perso');
  const [deadline, setDeadline] = useState(initial?.deadline ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !target) return;
    onSubmit({
      title: title.trim(),
      emoji,
      target: Number(target),
      unit: unit.trim() || 'fois',
      progress: initial?.progress ?? 0,
      color,
      category,
      deadline: deadline || null,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">{isEdit ? 'Modifier' : 'Nouvel objectif'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Emoji */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Emoji</label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map(e => (
                <button
                  type="button"
                  key={e}
                  className={`w-10 h-10 rounded-lg text-lg flex items-center justify-center transition-all ${emoji === e ? 'ring-2 ring-primary bg-secondary' : 'bg-muted/50 hover:bg-muted'}`}
                  onClick={() => setEmoji(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Nom */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nom</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Lire des livres"
              autoFocus
            />
          </div>

          {/* Categorie */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categorie</label>
            <Select value={category} onValueChange={v => setCategory(v as Category)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Objectif */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Objectif</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={target}
                onChange={e => setTarget(e.target.value)}
                placeholder="10"
                min="1"
                className="flex-1"
              />
              <Input
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="fois"
                className="flex-1"
              />
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date limite (optionnel)</label>
            <Input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
          </div>

          {/* Couleur */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Couleur</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button
                  type="button"
                  key={c}
                  className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" className="flex-1" disabled={!title.trim() || !target}>
              {isEdit ? 'Sauvegarder' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
