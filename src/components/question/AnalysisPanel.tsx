import { ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import Badge from '../common/Badge';

interface AnalysisPanelProps {
  correctAnswer: string[];
  userAnswer: string[];
  isCorrect: boolean;
  analysis: string;
  tags: string[];
  wikiUrl?: string;
}

export default function AnalysisPanel({
  correctAnswer,
  userAnswer,
  isCorrect,
  analysis,
  tags,
  wikiUrl,
}: AnalysisPanelProps) {
  return (
    <div className="mt-4 rounded-xl bg-bg-card/50 border border-white/5 overflow-hidden animate-slide-up">
      {/* Result banner */}
      <div
        className={`flex items-center gap-2 px-4 py-2.5 ${
          isCorrect ? 'bg-success/10 border-b border-success/10' : 'bg-danger/10 border-b border-danger/10'
        }`}
      >
        {isCorrect ? (
          <CheckCircle size={16} className="text-success" />
        ) : (
          <XCircle size={16} className="text-danger" />
        )}
        <span className={`text-sm font-medium ${isCorrect ? 'text-success' : 'text-danger'}`}>
          {isCorrect ? '回答正确' : '回答错误'}
        </span>
        <span className="text-xs text-text-secondary ml-auto">
          正确答案：<span className="text-text-primary font-medium">{correctAnswer.join(', ')}</span>
          {!isCorrect && (
            <>
              {'　'}你的答案：<span className="text-danger font-medium">{userAnswer.length > 0 ? userAnswer.join(', ') : '未作答'}</span>
            </>
          )}
        </span>
      </div>

      {/* Analysis content */}
      <div className="px-4 py-4 space-y-3">
        <div>
          <h4 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">解析</h4>
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">{analysis}</p>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="primary" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Wiki link */}
        {wikiUrl && (
          <a
            href={wikiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary-light text-xs font-medium hover:bg-primary/20 transition-colors"
          >
            <ExternalLink size={12} />
            查看知识点详情
          </a>
        )}
      </div>
    </div>
  );
}
