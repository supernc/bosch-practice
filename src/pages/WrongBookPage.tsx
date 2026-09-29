import { useState, useMemo } from 'react';
import { getWrongQuestions, getFavorites, removeWrongQuestion, toggleFavorite as toggleFav } from '../services/storage';
import { getQuestionsByIds } from '../services/questionService';
import { chapters } from '../data/chapters';
import QuestionCard from '../components/question/QuestionCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { ChevronLeft, ChevronRight, RotateCcw, Trash2, BookOpen, Star } from 'lucide-react';

type TabType = 'wrong' | 'favorites';

export default function WrongBookPage() {
  const [tab, setTab] = useState<TabType>('wrong');
  const [filterChapter, setFilterChapter] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const wrongIds = useMemo(() => Array.from(getWrongQuestions()), [refreshKey]);
  const favIds = useMemo(() => Array.from(getFavorites()), [refreshKey]);

  const ids = tab === 'wrong' ? wrongIds : favIds;
  const questions = useMemo(() => {
    let qs = getQuestionsByIds(ids);
    if (filterChapter) {
      qs = qs.filter(q => q.chapter === filterChapter);
    }
    return qs;
  }, [ids, filterChapter]);

  const handleToggleFav = (qId: string) => {
    toggleFav(qId);
    setRefreshKey(k => k + 1);
  };

  const handleRemoveWrong = (qId: string) => {
    removeWrongQuestion(qId);
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Tab switch */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setTab('wrong')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            tab === 'wrong' ? 'bg-danger/15 text-danger border border-danger/20' : 'bg-bg-card text-text-secondary border border-white/10 hover:border-white/20'
          }`}
        >
          <BookOpen size={16} /> 错题本 <Badge variant={tab === 'wrong' ? 'danger' : 'default'}>{String(wrongIds.length)}</Badge>
        </button>
        <button
          onClick={() => setTab('favorites')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            tab === 'favorites' ? 'bg-warning/15 text-warning border border-warning/20' : 'bg-bg-card text-text-secondary border border-white/10 hover:border-white/20'
          }`}
        >
          <Star size={16} /> 收藏夹 <Badge variant={tab === 'favorites' ? 'warning' : 'default'}>{String(favIds.length)}</Badge>
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterChapter(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
            !filterChapter ? 'bg-primary/15 text-primary-light' : 'bg-bg-card text-text-secondary hover:text-text-primary'
          }`}
        >
          全部
        </button>
        {chapters.map(ch => (
          <button
            key={ch.id}
            onClick={() => setFilterChapter(ch.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              filterChapter === ch.id ? 'bg-primary/15 text-primary-light' : 'bg-bg-card text-text-secondary hover:text-text-primary'
            }`}
          >
            Ch{ch.id} {ch.name}
          </button>
        ))}
      </div>

      {/* Question list */}
      {questions.length === 0 ? (
        <div className="card-glow rounded-2xl bg-bg-secondary p-12 text-center">
          <div className="text-4xl mb-4">{tab === 'wrong' ? '🎉' : '⭐'}</div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            {tab === 'wrong' ? '暂无错题，继续保持！' : '暂无收藏题目'}
          </h3>
          <p className="text-sm text-text-secondary">
            {tab === 'wrong' ? '做题时答错的题目会自动出现在这里' : '练习时点击星标可以收藏题目'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={q.id}>
              <button
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                className="w-full card-glow rounded-xl bg-bg-secondary p-4 text-left transition-all cursor-pointer hover:border-white/20"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-muted w-8">#{i + 1}</span>
                  <Badge variant="info" size="sm">{q.type === 'single' ? '单选' : '多选'}</Badge>
                  <Badge variant="primary" size="sm">Ch{q.chapter}</Badge>
                  <span className="text-sm text-text-primary truncate flex-1">{q.stem}</span>
                  {tab === 'wrong' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveWrong(q.id); }}
                      className="p-1 rounded text-text-muted hover:text-danger transition-colors cursor-pointer"
                      title="移除错题"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </button>
              {expandedId === q.id && (
                <div className="mt-2 animate-slide-up">
                  <QuestionCard
                    question={q}
                    index={i}
                    total={questions.length}
                    userAnswer={q.answer}
                    onAnswer={() => {}}
                    showResult={true}
                    isFavorited={getFavorites().has(q.id)}
                    onToggleFavorite={handleToggleFav}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
