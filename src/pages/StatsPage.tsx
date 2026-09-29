import useStats from '../hooks/useStats';
import { chapters } from '../data/chapters';
import StatsCard from '../components/stats/StatsCard';
import RadarChart from '../components/stats/RadarChart';
import TrendChart from '../components/stats/TrendChart';
import HeatMap from '../components/stats/HeatMap';
import { Hash, Target, Trophy, Flame, AlertTriangle } from 'lucide-react';

export default function StatsPage() {
  const stats = useStats();

  const radarData = chapters.map(ch => ({
    name: ch.name,
    value: stats.chapterStats[ch.id]?.rate || 0,
    fullMark: 100,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard
          icon={<Hash size={22} className="text-primary-light" />}
          label="总做题数"
          value={stats.totalAnswered}
          color="text-primary-light"
        />
        <StatsCard
          icon={<Target size={22} className="text-success" />}
          label="总正确率"
          value={`${stats.correctRate}%`}
          subtext={`${stats.totalCorrect} / ${stats.totalAnswered}`}
          color="text-success"
        />
        <StatsCard
          icon={<Trophy size={22} className="text-warning" />}
          label="模考最高分"
          value={stats.bestScore}
          subtext={stats.examHistory.length > 0 ? `共考 ${stats.examHistory.length} 次` : '暂无记录'}
          color="text-warning"
        />
        <StatsCard
          icon={<Flame size={22} className="text-danger" />}
          label="连续学习"
          value={`${stats.streakDays} 天`}
          color="text-danger"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Radar */}
        <div className="card-glow rounded-xl bg-bg-secondary p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">章节掌握度</h3>
          <RadarChart data={radarData} />
        </div>

        {/* Trend */}
        <div className="card-glow rounded-xl bg-bg-secondary p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">模考成绩趋势</h3>
          <TrendChart examHistory={stats.examHistory} />
        </div>
      </div>

      {/* Heatmap */}
      <div className="card-glow rounded-xl bg-bg-secondary p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">做题打卡（近90天）</h3>
        <HeatMap dailyStats={stats.dailyStats} />
      </div>

      {/* Weak points */}
      {stats.weakPoints.length > 0 && (
        <div className="card-glow rounded-xl bg-bg-secondary p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-warning" />
            <h3 className="text-sm font-semibold text-text-primary">薄弱知识点（正确率 &lt; 60%）</h3>
          </div>
          <div className="space-y-2">
            {stats.weakPoints.map(wp => (
              <div key={wp.subChapter} className="flex items-center gap-3">
                <span className="text-xs text-text-secondary w-48 truncate">{wp.name}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-danger"
                    style={{ width: `${wp.rate}%` }}
                  />
                </div>
                <span className="text-xs text-danger font-medium w-12 text-right">{wp.rate}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
