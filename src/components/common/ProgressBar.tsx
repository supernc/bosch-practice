import { twMerge } from 'tailwind-merge';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'cyan';
  showLabel?: boolean;
  className?: string;
}

const colorStyles = {
  primary: 'bg-gradient-to-r from-primary to-primary-dark',
  success: 'bg-gradient-to-r from-success to-emerald-400',
  warning: 'bg-gradient-to-r from-warning to-amber-400',
  danger: 'bg-gradient-to-r from-danger to-red-400',
  cyan: 'bg-gradient-to-r from-primary-cyan to-teal-400',
};

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export default function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={twMerge('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-text-secondary">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={twMerge('w-full bg-white/5 rounded-full overflow-hidden', sizeStyles[size])}>
        <div
          className={twMerge(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorStyles[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
