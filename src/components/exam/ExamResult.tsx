import { useNavigate } from 'react-router-dom';
import { Trophy, XCircle, Clock, Target, RotateCcw, Home, BookOpen } from 'lucide-react';
import { ExamRecord } from '../../types';
import { chapters } from '../../data/chapters';
import Button from '../common/Button';

interface ExamResultProps {
  record: ExamRecord;
  onRetry: () => void;
}

export default function ExamResult({ record, onRetry }: ExamResultProps) {
  const navigate = useNavigate();
  const duration = Math.round((record.endTime - record.startTime) / 60000);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Score hero */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-4 ${
          record.passed
            ? 'bg-gradient-to-br from-success/20 to-success/5 ring-4 ring-success/20'
            : 'bg-gradient-to-br from-danger/20 to-danger/5 ring-4 ring-danger/20'
        }`}>
          {record.passed ? (
            <Trophy size={48} className="text-success" />
          ) : (
            <XCircle size={48} className="text-danger" />
          )}
        </div>

        <div className={`text-5xl font-bold mb-2 ${record.passed ? 'text-success' : 'text-danger'}`}>
          {record.score}
          <span className="text-lg text-text-secondary font-normal ml-1">/ 100</span>
        </div>

        <p className={`text-lg font-medium ${record.passed ? 'text-success' : 'text-danger'}`}>
          {record.passed ? '🎉 恭喜通过！' : '😔 未通过，继续加油！'}
        </p>
        <p className="text-sm text-text-secondary mt-1">及格线：70分</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card-glow rounded-xl bg-bg-secondary p-4 text-center">
          <Target size={20} className="text-primary-light mx-auto mb-2" />
          <div className="text-xl font-bold text-text-primary">{record.correctCount}/{record.totalQuestions}</div>
          <div className="text-xs text-text-secondary">正确题数</div>
        </div>
        <div className="card-glow rounded-xl bg-bg-secondary p-4 text-center">
          <Clock size={20} className="text-primary-cyan mx-auto mb-2" />
          <div className="text-xl font-bold text-text-primary">{duration} 分钟</div>
          <div className="text-xs text-text-secondary">用时</div>
        </div>
        <div className="card-glow rounded-xl bg-bg-secondary p-4 text-center">
          <Target size={20} className="text-warning mx-auto mb-2" />
          <div className="text-xl font-bold text-text-primary">
            {Math.round((record.correctCount / record.totalQuestions) * 100)}%
          </div>
          <div className="text-xs text-text-secondary">正确率</div>
        </div>
      </div>

      {/* Chapter scores */}
      <div className="card-glow rounded-xl bg-bg-secondary p-5 mb-8">
        <h3 className="text-sm font-semibold text-text-primary mb-4">各章节得分</h3>
        <div className="space-y-3">
          {chapters.map(ch => {
            const scores = record.chapterScores[ch.id];
            if (!scores) return null;
            const rate = scores.total > 0 ? Math.round((scores.correct / scores.total) * 100) : 0;
            return (
              <div key={ch.id} className="flex items-center gap-3">
                <span className="text-xs text-text-secondary w-32 flex-shrink-0 truncate">
                  {ch.name}
                </span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      rate >= 70 ? 'bg-success' : rate >= 50 ? 'bg-warning' : 'bg-danger'
                    }`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
                <span className={`text-xs font-medium w-16 text-right ${
                  rate >= 70 ? 'text-success' : rate >= 50 ? 'text-warning' : 'text-danger'
                }`}>
                  {scores.correct}/{scores.total} ({rate}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="secondary" onClick={() => navigate('/')}>
          <Home size={16} />
          返回首页
        </Button>
        <Button variant="outline" onClick={() => navigate('/wrong')}>
          <BookOpen size={16} />
          查看错题
        </Button>
        <Button variant="primary" onClick={onRetry}>
          <RotateCcw size={16} />
          再考一次
        </Button>
      </div>
    </div>
  );
}
