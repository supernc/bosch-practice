import { useLocation } from 'react-router-dom';
import { CalendarDays, Zap } from 'lucide-react';
import { getTodayStats } from '../../services/statsService';
import { getField } from '../../services/storage';

const pageTitles: Record<string, string> = {
  '/': '学习仪表盘',
  '/exam': '随机自测',
  '/practice': '领域练习',
  '/random': '随机练习',
  '/wrong': '错题本',
  '/favorites': '收藏夹',
  '/stats': '数据看板',
};

export default function Header() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || '博世业务学习';
  const todayStats = getTodayStats();
  const streakDays = getField('streakDays');

  return (
    <header className="h-16 bg-bg-secondary/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40">
      <h2 className="text-lg font-bold text-text-primary">{title}</h2>

      <div className="flex items-center gap-4">
        {/* 今日做题 */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-card border border-white/5">
          <Zap size={14} className="text-warning" />
          <span className="text-xs text-text-secondary">
            今日 <span className="text-text-primary font-semibold">{todayStats.answered}</span> 题
          </span>
        </div>

        {/* 连续学习 */}
        {streakDays > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-card border border-white/5">
            <CalendarDays size={14} className="text-primary-cyan" />
            <span className="text-xs text-text-secondary">
              连续 <span className="text-primary-cyan font-semibold">{streakDays}</span> 天
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
