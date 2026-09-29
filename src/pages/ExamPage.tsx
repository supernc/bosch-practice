import { useState } from 'react';
import useExam from '../hooks/useExam';
import QuestionCard from '../components/question/QuestionCard';
import QuestionNav from '../components/question/QuestionNav';
import ExamToolbar from '../components/exam/ExamToolbar';
import ExamResult from '../components/exam/ExamResult';
import Button from '../components/common/Button';
import { ConfirmModal } from '../components/common/Modal';
import { FileText, Clock, Target, AlertTriangle } from 'lucide-react';
import { toggleFavorite, getFavorites } from '../services/storage';

export default function ExamPage() {
  const {
    state, examResult, currentQuestion, answeredCount,
    startExam, answerQuestion, toggleMark, goToQuestion, goNext, goPrev,
    submitExam, retryExam,
  } = useExam();

  const [showConfirm, setShowConfirm] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(getFavorites());

  const handleToggleFavorite = (qId: string) => {
    toggleFavorite(qId);
    setFavorites(getFavorites());
  };

  // 考试前 - 须知页面
  if (state.status === 'idle' || state.status === 'preparing') {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="card-glow rounded-2xl bg-bg-secondary p-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-6">
            <FileText size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold gradient-text mb-2">博世业务 · 随机自测</h2>
          <p className="text-text-secondary mb-8">覆盖 7 大领域的业务侧综合自测</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-bg-card rounded-xl p-4">
              <FileText size={20} className="text-primary-light mx-auto mb-2" />
              <div className="text-lg font-bold text-text-primary">67 题</div>
              <div className="text-xs text-text-secondary">56单选 + 11多选</div>
            </div>
            <div className="bg-bg-card rounded-xl p-4">
              <Clock size={20} className="text-primary-cyan mx-auto mb-2" />
              <div className="text-lg font-bold text-text-primary">120 分钟</div>
              <div className="text-xs text-text-secondary">自测时长</div>
            </div>
            <div className="bg-bg-card rounded-xl p-4">
              <Target size={20} className="text-success mx-auto mb-2" />
              <div className="text-lg font-bold text-text-primary">70 分</div>
              <div className="text-xs text-text-secondary">及格线</div>
            </div>
          </div>

          <div className="bg-bg-card rounded-xl p-4 mb-8 text-left">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-warning" />
              <span className="text-sm font-semibold text-warning">考试须知</span>
            </div>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>• 考试中不显示正确答案，交卷后统一批改</li>
              <li>• 可以标记不确定的题目，稍后回来检查</li>
              <li>• 多选题选对部分选项且没选错可获得半分</li>
              <li>• 超时将自动交卷</li>
              <li>• 刷新页面不会丢失答题进度</li>
            </ul>
          </div>

          <Button variant="primary" size="lg" onClick={startExam} className="w-full">
            开始考试
          </Button>
        </div>
      </div>
    );
  }

  // 考试结束 - 结果页面
  if (state.status === 'submitted' && examResult) {
    return <ExamResult record={examResult} onRetry={retryExam} />;
  }

  // 考试进行中
  if (!currentQuestion) return null;

  const answeredMap: Record<number, boolean> = {};
  state.questions.forEach((q, i) => {
    answeredMap[i] = !!(state.answers[q.id] && state.answers[q.id].length > 0);
  });

  return (
    <div className="animate-fade-in">
      <ExamToolbar
        currentIndex={state.currentIndex}
        total={state.questions.length}
        answeredCount={answeredCount}
        remainingSeconds={state.remainingTime}
        isMarked={state.markedQuestions.has(state.currentIndex)}
        onPrev={goPrev}
        onNext={goNext}
        onMark={toggleMark}
        onSubmit={() => setShowConfirm(true)}
        onTimeUp={submitExam}
      />

      <div className="max-w-4xl mx-auto mt-6 grid grid-cols-[1fr_200px] gap-6">
        <QuestionCard
          question={currentQuestion}
          index={state.currentIndex}
          total={state.questions.length}
          userAnswer={state.answers[currentQuestion.id] || []}
          onAnswer={answerQuestion}
          showResult={false}
          isFavorited={favorites.has(currentQuestion.id)}
          onToggleFavorite={handleToggleFavorite}
          mode="exam"
        />

        <div className="card-glow rounded-xl bg-bg-secondary p-4 h-fit sticky top-40">
          <h4 className="text-xs font-semibold text-text-secondary mb-3 uppercase">答题卡</h4>
          <QuestionNav
            total={state.questions.length}
            currentIndex={state.currentIndex}
            answeredMap={answeredMap}
            markedSet={state.markedQuestions}
            onNavigate={goToQuestion}
            compact
          />
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-3 text-[10px] text-text-muted">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-primary/15" /> 已答</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-warning/20" /> 标记</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-bg-card" /> 未答</span>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => { setShowConfirm(false); submitExam(); }}
        title="确认交卷"
        message={`你已完成 ${answeredCount}/${state.questions.length} 题。${answeredCount < state.questions.length ? `还有 ${state.questions.length - answeredCount} 题未作答。` : ''} 确定要交卷吗？`}
        confirmText="确认交卷"
        variant="primary"
      />
    </div>
  );
}
