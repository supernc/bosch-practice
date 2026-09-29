import { useEffect, useId, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  code: string;
  id?: string;
  className?: string;
}

let initialized = false;

function ensureInitialized() {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    flowchart: {
      htmlLabels: true,
      curve: 'basis',
    },
    themeVariables: {
      primaryColor: '#3b82f6',
      primaryTextColor: '#e2e8f0',
      primaryBorderColor: '#3b82f6',
      lineColor: '#94a3b8',
      textColor: '#e2e8f0',
      mainBkg: '#1e293b',
      secondaryColor: '#0f172a',
      tertiaryColor: '#1e293b',
      background: '#0f172a',
      nodeBorder: '#3b82f6',
      clusterBkg: '#1e293b',
      clusterBorder: '#475569',
      titleColor: '#e2e8f0',
      edgeLabelBackground: '#1e293b',
    },
  });
  initialized = true;
}

/**
 * 通用 Mermaid 渲染组件
 * - 暗色主题，与项目风格一致
 * - 渲染失败时回退显示原始代码并提示错误
 * - 通过 useId 保证同页多实例 id 不冲突
 */
export default function MermaidDiagram({ code, id, className }: MermaidDiagramProps) {
  const reactId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    ensureInitialized();

    const safeBase = (id ?? reactId).replace(/[^a-zA-Z0-9_-]/g, '_');
    const renderId = `mermaid-${safeBase}-${Date.now()}`;

    (async () => {
      try {
        const { svg } = await mermaid.render(renderId, code);
        if (cancelled) return;
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
        setError(null);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, id, reactId]);

  if (error) {
    return (
      <div
        className={
          'rounded-lg bg-bg-primary border border-red-500/30 p-3 text-[12px] overflow-x-auto ' +
          (className ?? '')
        }
      >
        <div className="text-red-400 mb-2">Mermaid 渲染失败：{error}</div>
        <pre className="text-text-secondary whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={
        'mermaid-diagram rounded-lg bg-bg-primary border border-white/5 p-3 overflow-x-auto flex justify-center ' +
        (className ?? '')
      }
    />
  );
}
