import { useState } from 'react';
import { Goal, GoalType } from '@/types';
import { addGoal } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  TrendingUp, Hash, ArrowLeft,
} from 'lucide-react';

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#78716c'];

const TYPE_INFO: Record<GoalType, { label: string; desc: string; icon: React.ComponentType<{ className?: string }>; defaultUnit: string; targetLabel: string }> = {
  curve: {
    label: 'Courbe',
    desc: 'Suivre l\'evolution d\'une valeur dans le temps',
    icon: TrendingUp,
    defaultUnit: 'kg',
    targetLabel: 'Objectif cible (opt.)',
  },
  counter: {
    label: 'Compteur',
    desc: 'Compter un nombre de fois par jour',
    icon: Hash,
    defaultUnit: 'fois',
    targetLabel: 'Objectif / jour (opt.)',
  },
};

interface Props {
  onCreated: () => void;
  onBack: () => void;
}

export default function CreateGoalPage({ onCreated, onBack }: Props) {
  const [selectedType, setSelectedType] = useState<GoalType | null>(null);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [target, setTarget] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedType) return;
    const info = TYPE_INFO[selectedType];
    const goal: Goal = {
      id: crypto.randomUUID(),
      name: name.trim(),
      type: selectedType,
      unit: unit.trim() || info.defaultUnit,
      icon: selectedType === 'curve' ? 'TrendingUp' : 'Hash',
      color,
      target: target ? Number(target) : null,
      createdAt: new Date().toISOString(),
    };
    await addGoal(goal);
    onCreated();
  };

  return (
    <div className="space-y-6" style={{ animation: 'fade-up 0.4s ease forwards' }}>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={selectedType ? () => setSelectedType(null) : onBack}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {selectedType ? TYPE_INFO[selectedType].label : 'Nouvel objectif'}
        </h2>
      </div>

      {!selectedType ? (
        /* Step 1: Choose type */
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Quel type d'objectif ?</p>
          {(Object.entries(TYPE_INFO) as [GoalType, typeof TYPE_INFO['curve']][]).map(([key, info]) => {
            const Icon = info.icon;
            return (
              <Card
                key={key}
                className="cursor-pointer hover:bg-secondary/30 transition-colors !py-0"
                onClick={() => setSelectedType(key)}
              >
                <CardContent className="!px-5 !py-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{info.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{info.desc}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Step 2: Details */
        <Card className="!py-0">
          <CardContent className="!px-6 !py-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  placeholder={selectedType === 'curve' ? 'Ex: Poids' : 'Ex: Coca Zero, Cafe...'}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Unite</Label>
                  <Input
                    placeholder={TYPE_INFO[selectedType].defaultUnit}
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{TYPE_INFO[selectedType].targetLabel}</Label>
                  <Input
                    type="number"
                    placeholder="--"
                    value={target}
                    onChange={e => setTarget(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Couleur</Label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110' : 'hover:scale-105'}`}
                      style={{ background: c }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full h-11" disabled={!name.trim()}>
                Creer
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
