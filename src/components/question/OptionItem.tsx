import { twMerge } from 'tailwind-merge';

interface OptionItemProps {
  label: string;
  text: string;
  selected: boolean;
  state?: 'default' | 'correct' | 'wrong' | 'missed';
  disabled?: boolean;
  isMultiple?: boolean;
  onClick: () => void;
}

export default function OptionItem({
  label,
  text,
  selected,
  state = 'default',
  disabled = false,
  isMultiple = false,
  onClick,
}: OptionItemProps) {
  const stateStyles = {
    default: selected
      ? 'border-primary/40 bg-primary/10'
      : 'border-white/10 bg-bg-card hover:border-white/20 hover:bg-white/5',
    correct: 'border-success/40 bg-success/10',
    wrong: 'border-danger/40 bg-danger/10',
    missed: 'border-warning/30 bg-warning/5',
  };

  const labelColors = {
    default: selected ? 'bg-primary text-white' : 'bg-white/10 text-text-secondary',
    correct: 'bg-success text-white',
    wrong: 'bg-danger text-white',
    missed: 'bg-warning text-white',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={twMerge(
        'w-full flex items-start gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-left group',
        stateStyles[state],
        disabled ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'
      )}
    >
      {/* Label badge */}
      <span
        className={twMerge(
          'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200',
          labelColors[state]
        )}
      >
        {label}
      </span>

      {/* Text */}
      <span className={twMerge(
        'text-sm leading-relaxed pt-0.5 flex-1',
        state === 'correct' ? 'text-success' :
        state === 'wrong' ? 'text-danger' :
        state === 'missed' ? 'text-warning' :
        selected ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'
      )}>
        {text}
      </span>

      {/* Checkbox/Radio indicator */}
      <span className="flex-shrink-0 mt-1">
        {isMultiple ? (
          <span
            className={twMerge(
              'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
              selected || state === 'correct'
                ? 'border-primary bg-primary'
                : 'border-white/20'
            )}
          >
            {(selected || state === 'correct') && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
        ) : (
          <span
            className={twMerge(
              'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all',
              selected || state === 'correct'
                ? 'border-primary'
                : 'border-white/20'
            )}
          >
            {(selected || state === 'correct') && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </span>
        )}
      </span>
    </button>
  );
}
