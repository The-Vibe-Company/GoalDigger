import { HistoryEntry } from '../types';

interface Props {
  history: HistoryEntry[];
  color: string;
  width?: number;
  height?: number;
}

export default function Sparkline({ history, color, width = 120, height = 32 }: Props) {
  if (history.length < 2) return null;

  const values = history.map(h => h.newProgress);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const padding = 2;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * innerW;
    const y = padding + innerH - ((v - min) / range) * innerH;
    return `${x},${y}`;
  });

  return (
    <svg width={width} height={height} className="sparkline">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.join(' ')}
        opacity="0.7"
      />
    </svg>
  );
}
