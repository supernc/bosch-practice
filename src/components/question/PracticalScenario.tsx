import { Layers, ListChecks, Network } from 'lucide-react';
import { PracticalMeta } from '../../types';
import MermaidDiagram from '../common/MermaidDiagram';

interface PracticalScenarioProps {
  practical: PracticalMeta;
}

/**
 * 实操题场景渲染区：场景描述 + 拓扑图 + 业务约束
 * 不渲染推理链路（推理链路只在答题后由 PracticalAnalysisPanel 展示）
 */
export default function PracticalScenario({ practical }: PracticalScenarioProps) {
  return (
    <div className="mb-5 rounded-xl bg-bg-card/40 border border-primary/15 overflow-hidden">
      {/* Scenario header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 border-b border-primary/15">
        <Layers size={14} className="text-primary-light" />
        <span className="text-xs font-semibold text-primary-light tracking-wider uppercase">
          业务场景
        </span>
      </div>

      {/* Scenario text */}
      <div className="px-4 py-3 text-sm text-text-primary leading-relaxed whitespace-pre-line">
        {practical.scenario}
      </div>

      {/* Topology */}
      {practical.topology && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1.5 mb-2 text-[11px] text-text-secondary uppercase tracking-wider">
            <Network size={12} />
            <span>{practical.topology.caption || '架构拓扑'}</span>
          </div>
          {practical.topology.type === 'mermaid' ? (
            <MermaidDiagram code={practical.topology.content} />
          ) : (
            <pre className="rounded-lg bg-bg-primary border border-white/5 p-3 text-[12px] leading-relaxed text-text-secondary overflow-x-auto whitespace-pre">
              <code>{practical.topology.content}</code>
            </pre>
          )}
          <p className="mt-1 text-[10px] text-text-muted">
            * 拓扑以 {practical.topology.type === 'mermaid' ? 'Mermaid' : 'ASCII'} 形式展示
            {practical.topology.type === 'mermaid' && (
              <>
                ，也可在{' '}
                <a
                  href="https://mermaid.live"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-light hover:underline"
                >
                  mermaid.live
                </a>{' '}
                打开查看清晰版
              </>
            )}
          </p>
        </div>
      )}

      {/* Constraints */}
      {practical.constraints && practical.constraints.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-1.5 mb-2 text-[11px] text-text-secondary uppercase tracking-wider">
            <ListChecks size={12} />
            <span>已知条件 / 业务约束</span>
          </div>
          <ul className="space-y-1">
            {practical.constraints.map((c, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-[13px] text-text-primary leading-relaxed"
              >
                <span className="flex-shrink-0 mt-1.5 w-1 h-1 rounded-full bg-primary-light" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
