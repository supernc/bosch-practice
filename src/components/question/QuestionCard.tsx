import { useState, useEffect } from 'react';
import { Star, Hash, FileText, Wrench, Trash2, Briefcase } from 'lucide-react';
import { Question } from '../../types';
import OptionItem from './OptionItem';
import AnalysisPanel from './AnalysisPanel';
import PracticalScenario from './PracticalScenario';
import PracticalAnalysisPanel from './PracticalAnalysisPanel';
import Badge from '../common/Badge';
import { ConfirmModal } from '../common/Modal';
import { getNote, saveNote } from '../../services/storage';

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  userAnswer: string[];
  onAnswer: (questionId: string, answer: string[]) => void;
  showResult?: boolean;
  isFavorited?: boolean;
  onToggleFavorite?: (questionId: string) => void;
  onDelete?: (questionId: string) => void;  // 传入时在右上角显示删除按钮
  mode?: 'exam' | 'practice';
}

export default function QuestionCard({
  question,
  index,
  total,
  userAnswer,
  onAnswer,
  showResult = false,
  isFavorited = false,
  onToggleFavorite,
  onDelete,
  mode = 'practice',
}: QuestionCardProps) {
  const isMultiple = question.type === 'multiple';
  const isPractical = question.kind === 'practical' && !!question.practical;
  const isScenario = question.subChapter.startsWith('sc');
  const isCorrect = showResult && checkCorrect(userAnswer, question.answer, question.type);
  const [noteText, setNoteText] = useState(() => getNote(question.id));
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setNoteText(getNote(question.id));
  }, [question.id]);

  function handleNoteBlur() {
    saveNote(question.id, noteText);
  }

  function handleOptionClick(label: string) {
    if (showResult) return;

    if (isMultiple) {
      // 多选：切换选中状态
      const newAnswer = userAnswer.includes(label)
        ? userAnswer.filter(a => a !== label)
        : [...userAnswer, label];
      onAnswer(question.id, newAnswer);
    } else {
      // 单选：直接选中
      onAnswer(question.id, [label]);
    }
  }

  function getOptionState(label: string): 'default' | 'correct' | 'wrong' | 'missed' {
    if (!showResult) return 'default';

    const isInCorrectAnswer = question.answer.includes(label);
    const isSelected = userAnswer.includes(label);

    if (isInCorrectAnswer && isSelected) return 'correct';
    if (!isInCorrectAnswer && isSelected) return 'wrong';
    if (isInCorrectAnswer && !isSelected) return 'missed';
    return 'default';
  }

  return (
    <div className="card-glow rounded-2xl bg-bg-secondary p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-text-secondary">
            <Hash size={12} />
            {index + 1}/{total}
          </span>
          <Badge variant={isMultiple ? 'warning' : 'info'} size="md">
            {isMultiple ? '多选' : '单选'}
          </Badge>
          {isPractical && (
            <Badge variant="primary" size="md" className="gap-1">
              <Wrench size={11} className="inline -mt-0.5" />
              实操模拟
            </Badge>
          )}
          {isScenario && (
            <Badge variant="success" size="md" className="gap-1">
              <Briefcase size={11} className="inline -mt-0.5" />
              业务场景
            </Badge>
          )}
          {isMultiple && !showResult && (
            <span className="text-[10px] text-text-muted">（可选多项）</span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(question.id)}
              title={isFavorited ? '取消收藏' : '收藏'}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                isFavorited
                  ? 'text-warning bg-warning/10'
                  : 'text-text-muted hover:text-warning hover:bg-warning/5'
              }`}
            >
              <Star size={16} fill={isFavorited ? 'currentColor' : 'none'} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              title="删除这道题（可在「数据管理」中恢复）"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-text-secondary bg-white/[0.03] border border-white/10 hover:text-danger hover:bg-danger/10 hover:border-danger/30 transition-all cursor-pointer"
            >
              <Trash2 size={15} />
              <span>删除</span>
            </button>
          )}
        </div>
      </div>

      {onDelete && (
        <ConfirmModal
          isOpen={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          onConfirm={() => { setConfirmDelete(false); onDelete(question.id); }}
          title="删除这道题？"
          message={`删除后该题不再出现在练习、随机、模拟考试、错题本和收藏中。如需找回，可在「数据管理 → 已删除题目」中恢复。\n\n题号：${question.id}`}
          confirmText="确认删除"
          variant="danger"
        />
      )}

      {/* 实操题：场景 + 拓扑 + 约束 */}
      {isPractical && question.practical && (
        <PracticalScenario practical={question.practical} />
      )}

      {/* Stem */}
      <p className="text-[15px] text-text-primary leading-relaxed mb-5 font-medium whitespace-pre-line">
        {isPractical && (
          <span className="text-primary-light mr-1">问：</span>
        )}
        {question.stem}
      </p>

      {/* Options */}
      <div className="space-y-2.5">
        {question.options.map((opt) => (
          <OptionItem
            key={opt.label}
            label={opt.label}
            text={opt.text}
            selected={userAnswer.includes(opt.label)}
            state={getOptionState(opt.label)}
            disabled={showResult}
            isMultiple={isMultiple}
            onClick={() => handleOptionClick(opt.label)}
          />
        ))}
      </div>

      {/* Analysis (shown after submit in practice mode) */}
      {showResult && (
        isPractical && question.practical ? (
          <PracticalAnalysisPanel
            correctAnswer={question.answer}
            userAnswer={userAnswer}
            isCorrect={isCorrect}
            analysis={question.analysis}
            tags={question.tags}
            wikiUrl={question.wikiUrl}
            practical={question.practical}
          />
        ) : (
          <AnalysisPanel
            correctAnswer={question.answer}
            userAnswer={userAnswer}
            isCorrect={isCorrect}
            analysis={question.analysis}
            tags={question.tags}
            wikiUrl={question.wikiUrl}
          />
        )
      )}

      {/* Note section */}
      <div className="mt-4 rounded-xl bg-bg-card/50 border border-white/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={14} className="text-warning" />
          <span className="text-xs font-semibold text-warning">我的备注</span>
        </div>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onBlur={handleNoteBlur}
          placeholder="在此输入备注内容..."
          className="w-full min-h-[60px] px-3 py-2 rounded-lg bg-bg-primary border border-white/10 text-sm text-text-primary placeholder-text-muted resize-y focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
        />
      </div>
    </div>
  );
}

function checkCorrect(userAnswer: string[], correctAnswer: string[], type: string): boolean {
  if (type === 'single') {
    return userAnswer.length === 1 && userAnswer[0] === correctAnswer[0];
  }
  if (userAnswer.length !== correctAnswer.length) return false;
  const sorted1 = [...userAnswer].sort();
  const sorted2 = [...correctAnswer].sort();
  return sorted1.every((v, i) => v === sorted2[i]);
}
