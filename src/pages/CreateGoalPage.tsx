import { useState } from 'react';
import { Goal, GoalType } from '@/types';
import { TEMPLATES } from '@/lib/templates';
import { addGoal } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Scale, Coffee, Droplets, Cigarette, Wine, CupSoda,
  TrendingUp, Hash, ArrowLeft, Plus,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Scale, Coffee, Droplets, Cigarette, Wine, Cup: CupSoda,
};

const TYPE_LABELS: Record<GoalType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  curve: { label: 'Courbe', icon: TrendingUp },
  counter: { label: 'Compteur', icon: Hash },
};

interface Props {
  onCreated: () => void;
  onBack: () => void;
}

export default function CreateGoalPage({ onCreated, onBack }: Props) {
  const [step, setStep] = useState<'templates' | 'custom'>('templates');
  const [name, setName] = useState('');
  const [type, setType] = useState<GoalType>('counter');
  const [unit, setUnit] = useState('');
  const [target, setTarget] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#78716c'];

  const handleTemplate = (templateId: string) => {
    const t = TEMPLATES.find(tpl => tpl.id === templateId);
    if (!t) return;
    const goal: Goal = {
      id: crypto.randomUUID(),
      name: t.name,
      type: t.type,
      unit: t.unit,
      icon: t.icon,
      color: t.color,
      target: t.defaultTarget ?? null,
      createdAt: new Date().toISOString(),
    };
    addGoal(goal);
    onCreated();
  };

  const handleCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const goal: Goal = {
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
      unit: unit.trim() || (type === 'curve' ? 'kg' : 'fois'),
      icon: type === 'curve' ? 'Scale' : 'Hash',
      color,
      target: target ? Number(target) : null,
      createdAt: new Date().toISOString(),
    };
    addGoal(goal);
    onCreated();
  };

  return (
    <div className="space-y-6" style={{ animation: 'fade-up 0.4s ease forwards' }}>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-lg font-semibold">Nouvel objectif</h2>
      </div>

      {step === 'templates' ? (
        <>
          {/* Templates */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">Templates</p>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map(t => {
                const Icon = ICON_MAP[t.icon] ?? Hash;
                return (
                  <Card
                    key={t.id}
                    className="cursor-pointer hover:bg-secondary/50 transition-colors !py-0"
                    onClick={() => handleTemplate(t.id)}
                  >
                    <CardContent className="!px-4 !py-4 flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: t.color + '18', color: t.color }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.unit}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Custom */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">ou</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <Button variant="outline" className="w-full h-11" onClick={() => setStep('custom')}>
              <Plus className="w-4 h-4 mr-2" />
              Objectif personnalise
            </Button>
          </div>
        </>
      ) : (
        <Card className="!py-0">
          <CardContent className="!px-6 !py-6">
            <form onSubmit={handleCustom} className="space-y-5">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  placeholder="Ex: Poids, Steps, Clopes..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex gap-2">
                  {(Object.entries(TYPE_LABELS) as [GoalType, typeof TYPE_LABELS['curve']][]).map(([key, val]) => {
                    const Icon = val.icon;
                    return (
                      <Badge
                        key={key}
                        variant={type === key ? 'default' : 'outline'}
                        className="cursor-pointer h-9 px-4 text-sm gap-1.5"
                        onClick={() => setType(key)}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {val.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Unite</Label>
                  <Input
                    placeholder={type === 'curve' ? 'kg' : 'fois'}
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Objectif {type === 'curve' ? 'cible' : '/ jour'} (opt.)</Label>
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

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setStep('templates')}>
                  Retour
                </Button>
                <Button type="submit" className="flex-1" disabled={!name.trim()}>
                  Creer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
