import { useNavigate } from 'react-router-dom';
import useStats from '../hooks/useStats';
import { getTotalCount } from '../services/questionService';
import { FileText, BookOpen, Shuffle, ArrowRight, Trophy, AlertTriangle, Wrench } from 'lucide-react';
import { chapters } from '../data/chapters';
import { getPracticalQuestions } from '../data';

export default function HomePage() {
  const navigate = useNavigate();
  const stats = useStats();
  const totalQuestions = getTotalCount();
  const practicalCount = getPracticalQuestions().length;

  const quickActions = [
    {
      label: '随机自测',
      desc: '67题 / 120分钟',
      icon: FileText,
      color: 'from-primary to-primary-dark',
      path: '/exam',
    },
    {
      label: '领域练习',
      desc: `${totalQuestions} 道题目`,
      icon: BookOpen,
      color: 'from-purple-500 to-purple-700',
      path: '/practice',
    },
    {
      label: '实操模拟题',
      desc: `${practicalCount} 道场景题 · 含拓扑图`,
      icon: Wrench,
      color: 'from-amber-500 to-orange-600',
      path: '/practical',
    },
    {
      label: '随机练习',
      desc: '自定义抽题',
      icon: Shuffle,
      color: 'from-primary-cyan to-teal-600',
      path: '/random',
    },
  ];

  const lastExam = stats.examHistory.length > 0
    ? stats.examHistory[stats.examHistory.length - 1]
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="card-glow rounded-2xl bg-gradient-to-r from-bg-secondary to-bg-tertiary p-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1">
          欢迎使用 <span className="gradient-text">博世业务学习</span>
        </h1>
        <p className="text-sm text-text-secondary">
          博世汽车业务方向刷题平台 · 共 {totalQuestions} 道题 · 覆盖数据合规 / 自动驾驶 / 地图 / 具身智能 / 座舱 / XC / 博世代码 7 大领域
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map(({ label, desc, icon: Icon, color, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="card-glow rounded-xl bg-bg-secondary p-5 text-left group hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <Icon size={24} className="text-white" />
            </div>
            <h3 className="text-base font-bold text-text-primary mb-1">{label}</h3>
            <p className="text-xs text-text-secondary">{desc}</p>
            <div className="flex items-center gap-1 mt-3 text-xs text-primary-light opacity-0 group-hover:opacity-100 transition-opacity">
              开始 <ArrowRight size={12} />
            </div>
          </button>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Today summary */}
        <div className="card-glow rounded-xl bg-bg-secondary p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">今日学习</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-bg-card rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-primary-light">{stats.todayStats.answered}</div>
              <div className="text-[10px] text-text-secondary">做题数</div>
            </div>
            <div className="bg-bg-card rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-success">{stats.todayStats.correct}</div>
              <div className="text-[10px] text-text-secondary">正确数</div>
            </div>
            <div className="bg-bg-card rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-primary-cyan">
                {stats.todayStats.answered > 0
                  ? Math.round((stats.todayStats.correct / stats.todayStats.answered) * 100)
                  : 0}%
              </div>
              <div className="text-[10px] text-text-secondary">正确率</div>
            </div>
          </div>
        </div>

        {/* Last exam */}
        <div className="card-glow rounded-xl bg-bg-secondary p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">最近模考</h3>
          {lastExam ? (
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                lastExam.passed ? 'bg-success/15 ring-2 ring-success/20' : 'bg-danger/15 ring-2 ring-danger/20'
              }`}>
                {lastExam.passed ? (
                  <Trophy size={24} className="text-success" />
                ) : (
                  <span className="text-lg font-bold text-danger">{lastExam.score}</span>
                )}
              </div>
              <div>
                <div className={`text-2xl font-bold ${lastExam.passed ? 'text-success' : 'text-danger'}`}>
                  {lastExam.score} 分
                </div>
                <div className="text-xs text-text-secondary">
                  {lastExam.passed ? '✅ 通过' : '❌ 未通过'} · {lastExam.correctCount}/{lastExam.totalQuestions} 正确
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">
                  {new Date(lastExam.startTime).toLocaleDateString('zh-CN')}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-text-muted text-center py-4">
              暂无模考记录，快去试试吧！
            </div>
          )}
        </div>
      </div>

      {/* Weak points */}
      {stats.weakPoints.length > 0 && (
        <div className="card-glow rounded-xl bg-bg-secondary p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-warning" />
            <h3 className="text-sm font-semibold text-text-primary">需要加强的知识点</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.weakPoints.slice(0, 6).map(wp => (
              <span key={wp.subChapter} className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger text-xs border border-danger/20">
                {wp.name}（{wp.rate}%）
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
