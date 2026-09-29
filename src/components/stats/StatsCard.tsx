import { ReactNode } from 'react';

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
}

export default function StatsCard({ icon, label, value, subtext, color = 'text-primary-light' }: StatsCardProps) {
  return (
    <div className="card-glow rounded-xl bg-bg-secondary p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${color === 'text-success' ? 'from-success/20 to-success/5' : color === 'text-warning' ? 'from-warning/20 to-warning/5' : color === 'text-danger' ? 'from-danger/20 to-danger/5' : 'from-primary/20 to-primary/5'}`}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-text-secondary mb-0.5">{label}</div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        {subtext && <div className="text-[10px] text-text-muted mt-0.5">{subtext}</div>}
      </div>
    </div>
  );
}
