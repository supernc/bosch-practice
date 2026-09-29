import { useState, useEffect } from 'react';
import usePractice from '../hooks/usePractice';
import { chapters } from '../data/chapters';
import { getQuestionsByChapter, getQuestionsBySubChapter } from '../data';
import QuestionCard from '../components/question/QuestionCard';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import { ChevronLeft, ChevronRight, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function PracticePage() {
  const practice = usePractice('practice');
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());

  const toggleExpand = (chId: number) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chId)) next.delete(chId);
      else next.add(chId);
      return next;
    });
  };

  const selectChapter = (chId: number) => {
    setSelectedChapter(chId);
    setSelectedSub(null);
    const qs = getQuestionsByChapter(chId);
    practice.setQuestions(qs);
  };

  const selectSubChapter = (subId: string, chId: number) => {
    setSelectedChapter(chId);
    setSelectedSub(subId);
    const qs = getQuestionsBySubChapter(subId);
    practice.setQuestions(qs);
  };

  const handleSubmit = () => {
    if (practice.userAnswer.length === 0) return;
    const correct = practice.submitAnswer();
    if (correct && practice.currentIndex < practice.questions.length - 1) {
      setTimeout(() => practice.goNext(), 1000);
    }
  };

  const handleNext = () => {
    if (practice.currentIndex < practice.questions.length - 1) {
      practice.goNext();
    }
  };

  return (
    <div className="flex gap-6 animate-fade-in">
      {/* Left sidebar - Chapter tree */}
      <div className="w-64 flex-shrink-0">
        <div className="card-glow rounded-xl bg-bg-secondary p-4 sticky top-24">
          <h3 className="text-sm font-semibold text-text-primary mb-4">章节选择</h3>
          <div className="space-y-1">
            {chapters.map(ch => (
              <div key={ch.id}>
                <button
                  onClick={() => { toggleExpand(ch.id); selectChapter(ch.id); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                    selectedChapter === ch.id && !selectedSub
                      ? 'bg-primary/15 text-primary-light'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  <span className="truncate text-left">
                    <span className="text-text-muted mr-1">Ch{ch.id}</span>
                    {ch.name}
                  </span>
                  {expandedChapters.has(ch.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {expandedChapters.has(ch.id) && (
                  <div className="ml-3 mt-1 space-y-0.5 animate-fade-in">
                    {ch.subChapters.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => selectSubChapter(sub.id, ch.id)}
                        className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                          selectedSub === sub.id
                            ? 'bg-primary/10 text-primary-light'
                            : 'text-text-muted hover:text-text-secondary hover:bg-white/5'
                        }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right main area */}
      <div className="flex-1 min-w-0">
        {!practice.currentQuestion ? (
          <div className="card-glow rounded-2xl bg-bg-secondary p-12 text-center">
            <div className="text-4xl mb-4">📖</div>
            <h3 className="text-lg font-bold text-text-primary mb-2">选择章节开始练习</h3>
            <p className="text-sm text-text-secondary">从左侧选择章节或子章节，开始刷题</p>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="card-glow rounded-xl bg-bg-secondary p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-secondary">
                  练习进度：{practice.stats.answered}/{practice.questions.length} 题
                </span>
                <span className="text-xs">
                  正确率：<span className={`font-bold ${practice.stats.answered > 0 && (practice.stats.correct / practice.stats.answered) >= 0.7 ? 'text-success' : 'text-warning'}`}>
                    {practice.stats.answered > 0 ? Math.round((practice.stats.correct / practice.stats.answered) * 100) : 0}%
                  </span>
                </span>
              </div>
              <ProgressBar
                value={practice.stats.answered}
                max={practice.questions.length}
                color="primary"
                size="sm"
              />
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
            />

            {/* Actions */}
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="ghost"
                onClick={practice.goPrev}
                disabled={practice.currentIndex === 0}
              >
                <ChevronLeft size={16} /> 上一题
              </Button>

              <div className="flex gap-2">
                {!practice.isSubmitted ? (
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={practice.userAnswer.length === 0}
                  >
                    <CheckCircle size={16} /> 提交答案
                  </Button>
                ) : (
                  <Button variant="primary" onClick={handleNext} disabled={practice.currentIndex >= practice.questions.length - 1}>
                    下一题 <ChevronRight size={16} />
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
