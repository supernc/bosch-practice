import { useState } from 'react';
import usePractice from '../hooks/usePractice';
import { getRandomQuestions, getRandomQuestionsFromIds, getAvailableCount } from '../services/questionService';
import { getWrongQuestions, getFavorites } from '../services/storage';
import { Question } from '../types';
import QuestionCard from '../components/question/QuestionCard';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import { ChevronLeft, ChevronRight, CheckCircle, Shuffle, Play, BookOpen, Star } from 'lucide-react';

type SourceType = 'all' | 'wrong' | 'favorites';
type CountOption = number | 'all';

export default function RandomPage() {
  const practice = usePractice('random');
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState<CountOption>(20);
  const [qType, setQType] = useState<'mixed' | 'single' | 'multiple'>('mixed');
  const [source, setSource] = useState<SourceType>('all');
  const [error, setError] = useState('');

  const wrongSet = getWrongQuestions();
  const favSet = getFavorites();
  const wrongCount = wrongSet.size;
  const favCount = favSet.size;

  // 当前来源 + 题型下可抽取的题目总数
  const sourceIds =
    source === 'wrong'
      ? Array.from(wrongSet)
      : source === 'favorites'
        ? Array.from(favSet)
        : null;
  const availableCount = getAvailableCount(sourceIds, qType);

  const startRandom = () => {
    // 选择「全部」时抽完当前来源（含题型过滤后）的所有题目
    const take = count === 'all' ? availableCount : count;
    let qs: Question[];
    if (source === 'wrong') {
      qs = getRandomQuestionsFromIds(Array.from(wrongSet), take, qType);
    } else if (source === 'favorites') {
      qs = getRandomQuestionsFromIds(Array.from(favSet), take, qType);
    } else {
      qs = getRandomQuestions(take, qType);
    }

    if (qs.length === 0) {
      setError(
        source === 'wrong'
          ? '错题本里没有符合当前题型的题目，请调整题型'
          : source === 'favorites'
            ? '收藏夹里没有符合当前题型的题目，请调整题型'
            : '题库中没有符合条件的题目'
      );
      return;
    }

    setError('');
    practice.setQuestions(qs);
    setStarted(true);
  };

  const handleSubmit = () => {
    if (practice.userAnswer.length === 0) return;
    const correct = practice.submitAnswer();
    if (correct && practice.currentIndex < practice.questions.length - 1) {
      setTimeout(() => practice.goNext(), 1000);
    }
  };

  // 配置界面
  if (!started) {
    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <div className="card-glow rounded-2xl bg-bg-secondary p-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-cyan to-teal-500 flex items-center justify-center mx-auto mb-6">
            <Shuffle size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">随机练习</h2>
          <p className="text-text-secondary text-sm mb-8">随机抽题练习，可自由选择题目来源</p>

          {/* 题目来源 */}
          <div className="mb-6">
            <label className="text-sm text-text-secondary mb-3 block">选择题目来源</label>
            <div className="flex gap-2 justify-center">
              {[
                { value: 'all' as const, label: '全部题库', icon: Shuffle, count: -1 },
                { value: 'wrong' as const, label: '错题', icon: BookOpen, count: wrongCount },
                { value: 'favorites' as const, label: '收藏', icon: Star, count: favCount },
              ].map(({ value, label, icon: Icon, count: c }) => {
                const disabled = c === 0;
                return (
                  <button
                    key={value}
                    disabled={disabled}
                    onClick={() => setSource(value)}
                    className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      disabled
                        ? 'bg-bg-card text-text-muted opacity-50 cursor-not-allowed'
                        : source === value
                          ? 'bg-primary-cyan text-white cursor-pointer'
                          : 'bg-bg-card text-text-secondary hover:text-text-primary border border-white/10 hover:border-white/20 cursor-pointer'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                    {c >= 0 && (
                      <span className={`text-xs ${source === value && !disabled ? 'text-white/80' : 'text-text-muted'}`}>
                        {c > 0 ? c : '暂无'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 题数选择 */}
          <div className="mb-6">
            <label className="text-sm text-text-secondary mb-3 block">选择题目数量</label>
            <div className="flex gap-2 justify-center flex-wrap">
              {[10, 20, 30, 60].map(n => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    count === n
                      ? 'bg-primary text-white'
                      : 'bg-bg-card text-text-secondary hover:text-text-primary border border-white/10 hover:border-white/20'
                  }`}
                >
                  {n} 题
                </button>
              ))}
              <button
                disabled={availableCount === 0}
                onClick={() => setCount('all')}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  availableCount === 0
                    ? 'bg-bg-card text-text-muted opacity-50 cursor-not-allowed'
                    : count === 'all'
                      ? 'bg-primary text-white cursor-pointer'
                      : 'bg-bg-card text-text-secondary hover:text-text-primary border border-white/10 hover:border-white/20 cursor-pointer'
                }`}
              >
                全部
                <span className={`ml-1.5 text-xs ${count === 'all' && availableCount > 0 ? 'text-white/80' : 'text-text-muted'}`}>
                  {availableCount > 0 ? `(${availableCount} 题)` : '暂无'}
                </span>
              </button>
            </div>
            {count === 'all' && availableCount > 0 && (
              <p className="text-xs text-text-muted mt-3">
                将从{source === 'wrong' ? '错题本' : source === 'favorites' ? '收藏夹' : '全部题库'}中抽取
                {qType === 'mixed' ? '全部' : qType === 'single' ? '全部单选题' : '全部多选题'}，共 {availableCount} 题
              </p>
            )}
          </div>

          {/* 题型选择 */}
          <div className="mb-8">
            <label className="text-sm text-text-secondary mb-3 block">选择题型</label>
            <div className="flex gap-2 justify-center">
              {[
                { value: 'mixed' as const, label: '混合' },
                { value: 'single' as const, label: '仅单选' },
                { value: 'multiple' as const, label: '仅多选' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setQType(value)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    qType === value
                      ? 'bg-primary-cyan text-white'
                      : 'bg-bg-card text-text-secondary hover:text-text-primary border border-white/10 hover:border-white/20'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          <Button variant="primary" size="lg" onClick={startRandom} className="w-full">
            <Play size={18} /> 开始练习
          </Button>
        </div>
      </div>
    );
  }

  // 练习完成
  if (practice.currentIndex >= practice.questions.length - 1 && practice.isSubmitted) {
    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <div className="card-glow rounded-2xl bg-bg-secondary p-8 text-center">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">练习完成！</h2>
          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="bg-bg-card rounded-xl p-4">
              <div className="text-2xl font-bold text-success">{practice.stats.correct}</div>
              <div className="text-xs text-text-secondary">正确</div>
            </div>
            <div className="bg-bg-card rounded-xl p-4">
              <div className="text-2xl font-bold text-text-primary">
                {practice.stats.answered > 0 ? Math.round((practice.stats.correct / practice.stats.answered) * 100) : 0}%
              </div>
              <div className="text-xs text-text-secondary">正确率</div>
            </div>
          </div>
          <Button variant="primary" onClick={() => { setStarted(false); practice.reset(); }}>
            <Shuffle size={16} /> 再来一轮
          </Button>
        </div>
      </div>
    );
  }

  if (!practice.currentQuestion) return null;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Progress */}
      <div className="card-glow rounded-xl bg-bg-secondary p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-secondary">
            进度：{practice.stats.answered}/{practice.questions.length}
          </span>
          <span className="text-xs">
            正确率：<span className="text-primary-light font-bold">
              {practice.stats.answered > 0 ? Math.round((practice.stats.correct / practice.stats.answered) * 100) : 0}%
            </span>
          </span>
        </div>
        <ProgressBar value={practice.stats.answered} max={practice.questions.length} color="cyan" size="sm" />
      </div>

      {/* Question */}
      <QuestionCard
        question={practice.currentQuestion}
        index={practice.currentIndex}
        total={practice.questions.length}
        userAnswer={practice.userAnswer}
        onAnswer={(_, ans) => practice.answerQuestion(ans)}
        showResult={practice.isSubmitted}
        isFavorited={practice.favorites.has(practice.currentQuestion.id)}
        onToggleFavorite={practice.toggleFavorite}
        onDelete={practice.deleteQuestion}
      />

      {/* Actions */}
      <div className="flex items-center justify-between mt-4">
        <Button variant="ghost" onClick={practice.goPrev} disabled={practice.currentIndex === 0}>
          <ChevronLeft size={16} /> 上一题
        </Button>
        {!practice.isSubmitted ? (
          <Button variant="primary" onClick={handleSubmit} disabled={practice.userAnswer.length === 0}>
            <CheckCircle size={16} /> 提交
          </Button>
        ) : (
          <Button variant="primary" onClick={practice.goNext}>
            下一题 <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
