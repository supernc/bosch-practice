import { ExternalLink, CheckCircle, XCircle, Lightbulb, AlertTriangle, GitBranch } from 'lucide-react';
import Badge from '../common/Badge';
import { PracticalMeta } from '../../types';

interface PracticalAnalysisPanelProps {
  correctAnswer: string[];
  userAnswer: string[];
  isCorrect: boolean;
  analysis: string;
  tags: string[];
  wikiUrl?: string;
  practical: PracticalMeta;
}

/**
 * 实操题专属解析面板
 * - 答错时：红色高亮的错误提示框 + 推理链路 + 常见误区 + Wiki 链接
 * - 答对时：绿色的肯定 + 推理链路（让用户复盘自己思路是否正确）
 */
export default function PracticalAnalysisPanel({
  correctAnswer,
  userAnswer,
  isCorrect,
  analysis,
  tags,
  wikiUrl,
  practical,
}: PracticalAnalysisPanelProps) {
  return (
    <div
      className={`mt-4 rounded-xl border overflow-hidden animate-slide-up ${
        isCorrect
          ? 'bg-success/5 border-success/30'
          : 'bg-danger/5 border-danger/40 ring-1 ring-danger/20'
      }`}
    >
      {/* Result banner - 实操题答错时更明显的红框 */}
      <div
        className={`flex items-center gap-2 px-4 py-3 ${
          isCorrect
            ? 'bg-success/15 border-b border-success/20'
            : 'bg-danger/15 border-b border-danger/30'
        }`}
      >
        {isCorrect ? (
          <CheckCircle size={18} className="text-success" />
        ) : (
          <XCircle size={18} className="text-danger" />
        )}
        <span
          className={`text-sm font-bold ${isCorrect ? 'text-success' : 'text-danger'}`}
        >
          {isCorrect ? '回答正确，复盘一下解题思路' : '回答错误，请仔细看推理链路'}
        </span>
        <span className="text-xs text-text-secondary ml-auto">
          正确答案：
          <span className="text-text-primary font-bold">
            {correctAnswer.join(', ')}
          </span>
          {!isCorrect && (
            <>
              {'　'}你的答案：
              <span className="text-danger font-bold">
                {userAnswer.length > 0 ? userAnswer.join(', ') : '未作答'}
              </span>
            </>
          )}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-4 space-y-4">
        {/* 解析（一句话总结） */}
        <div>
          <h4 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
            一句话答案
          </h4>
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">
            {analysis}
          </p>
        </div>

        {/* 推理链路（实操题核心） */}
        {practical.reasoning && practical.reasoning.length > 0 && (
          <div className="rounded-lg bg-bg-card/60 border border-primary/15 p-3.5">
            <div className="flex items-center gap-1.5 mb-2.5">
              <GitBranch size={14} className="text-primary-light" />
              <h4 className="text-xs font-bold text-primary-light uppercase tracking-wider">
                解题推理链路
              </h4>
            </div>
            <ol className="space-y-2">
              {practical.reasoning.map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed">
                  <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-md bg-primary/20 text-primary-light text-[11px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-text-primary flex-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* 常见误区（仅答错时强调） */}
        {practical.pitfall && (
          <div
            className={`rounded-lg border p-3.5 ${
              isCorrect
                ? 'bg-warning/5 border-warning/20'
                : 'bg-danger/5 border-danger/30'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-2">
              {isCorrect ? (
                <Lightbulb size={14} className="text-warning" />
              ) : (
                <AlertTriangle size={14} className="text-danger" />
              )}
              <h4
                className={`text-xs font-bold uppercase tracking-wider ${
                  isCorrect ? 'text-warning' : 'text-danger'
                }`}
              >
                {isCorrect ? '提醒：常见误区' : '为什么会答错 / 常见误区'}
              </h4>
            </div>
            <p className="text-[13px] text-text-primary leading-relaxed whitespace-pre-line">
              {practical.pitfall}
            </p>
          </div>
        )}

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
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/15 text-primary-light text-xs font-semibold hover:bg-primary/25 transition-colors"
          >
            <ExternalLink size={13} />
            打开学习资料链接
          </a>
        )}
      </div>
    </div>
  );
}
