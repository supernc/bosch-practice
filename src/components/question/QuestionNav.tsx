import { twMerge } from 'tailwind-merge';

interface QuestionNavProps {
  total: number;
  currentIndex: number;
  answeredMap: Record<number, boolean>; // index -> hasAnswered
  markedSet?: Set<number>; // index set
  onNavigate: (index: number) => void;
  compact?: boolean;
}

export default function QuestionNav({
  total,
  currentIndex,
  answeredMap,
  markedSet,
  onNavigate,
  compact = false,
}: QuestionNavProps) {
  function getStyle(index: number): string {
    const isCurrent = index === currentIndex;
    const isAnswered = answeredMap[index];
    const isMarked = markedSet?.has(index);

    if (isCurrent) return 'bg-primary text-white ring-2 ring-primary/50 scale-110';
    if (isMarked) return 'bg-warning/20 text-warning border-warning/30';
    if (isAnswered) return 'bg-primary/15 text-primary-light border-primary/20';
    return 'bg-bg-card text-text-muted border-white/5 hover:border-white/15 hover:text-text-secondary';
  }

  return (
    <div className={twMerge('flex flex-wrap gap-1.5', compact ? 'gap-1' : 'gap-2')}>
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onNavigate(i)}
          className={twMerge(
            'border rounded-lg font-medium transition-all duration-200 cursor-pointer',
            compact ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs',
            getStyle(i)
          )}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}
