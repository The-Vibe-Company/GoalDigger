import { GoalTemplate } from '@/types';

export const TEMPLATES: GoalTemplate[] = [
  {
    id: 'weight',
    name: 'Poids',
    type: 'curve',
    icon: 'Scale',
    unit: 'kg',
    defaultTarget: 75,
    color: '#3b82f6',
  },
  {
    id: 'coca-zero',
    name: 'Coca Zero',
    type: 'counter',
    icon: 'Cup',
    unit: 'canettes',
    color: '#ef4444',
  },
  {
    id: 'coffee',
    name: 'Cafe',
    type: 'counter',
    icon: 'Coffee',
    unit: 'tasses',
    color: '#92400e',
  },
  {
    id: 'water',
    name: 'Eau',
    type: 'counter',
    icon: 'Droplets',
    unit: 'verres',
    color: '#06b6d4',
  },
  {
    id: 'cigarettes',
    name: 'Cigarettes',
    type: 'counter',
    icon: 'Cigarette',
    unit: 'clopes',
    color: '#78716c',
  },
  {
    id: 'alcohol',
    name: 'Alcool',
    type: 'counter',
    icon: 'Wine',
    unit: 'verres',
    color: '#7c3aed',
  },
];
