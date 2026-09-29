import { useMemo } from 'react';

interface HeatMapProps {
  dailyStats: Record<string, { answered: number; correct: number }>;
  days?: number;
}

export default function HeatMap({ dailyStats, days = 90 }: HeatMapProps) {
  const cells = useMemo(() => {
    const result: { date: string; count: number; level: number }[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = dailyStats[dateStr]?.answered || 0;

      let level = 0;
      if (count > 0) level = 1;
      if (count >= 10) level = 2;
      if (count >= 30) level = 3;
      if (count >= 60) level = 4;

      result.push({ date: dateStr, count, level });
    }
    return result;
  }, [dailyStats, days]);

  const levelColors = [
    'bg-white/5',           // 0: no activity
    'bg-primary/20',        // 1: 1-9
    'bg-primary/40',        // 2: 10-29
    'bg-primary/60',        // 3: 30-59
    'bg-primary',           // 4: 60+
  ];

  // 按周分组
  const weeks: typeof cells[] = [];
  let currentWeek: typeof cells = [];
  const startDay = new Date(cells[0]?.date || '').getDay();
  // 填充第一周前面的空白
  for (let i = 0; i < startDay; i++) {
    currentWeek.push({ date: '', count: 0, level: -1 });
  }
  cells.forEach(cell => {
    currentWeek.push(cell);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  return (
    <div>
      <div className="flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((cell, ci) => (
              <div
                key={ci}
                className={`w-3 h-3 rounded-sm transition-all ${
                  cell.level === -1 ? 'bg-transparent' : levelColors[cell.level]
                }`}
                title={cell.date ? `${cell.date}: ${cell.count} 题` : ''}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-[10px] text-text-muted">
        <span>少</span>
        {levelColors.map((color, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
        ))}
        <span>多</span>
      </div>
    </div>
  );
}
