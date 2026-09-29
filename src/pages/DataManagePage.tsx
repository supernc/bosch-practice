import { useState, useRef, useCallback } from 'react';
import {
  Download,
  Upload,
  Trash2,
  Database,
  FileText,
  XCircle,
  Star,
  Trophy,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  downloadData,
  importData,
  clearAllData,
  getDataSummary,
  type ImportResult,
} from '../services/storage';

export default function DataManagePage() {
  const [summary, setSummary] = useState(() => getDataSummary());
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshSummary = useCallback(() => {
    setSummary(getDataSummary());
  }, []);

  // 导出
  const handleExport = () => {
    downloadData();
  };

  // 导入文件处理
  const processFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      setImportResult({ success: false, message: '请选择 .json 格式的文件' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = importData(text, 'merge');
      setImportResult(result);
      if (result.success) {
        refreshSummary();
      }
    };
    reader.onerror = () => {
      setImportResult({ success: false, message: '文件读取失败' });
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // 清空 input，允许重复选择同一文件
    e.target.value = '';
  };

  // 拖拽上传
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // 清空数据
  const handleClear = () => {
    clearAllData();
    refreshSummary();
    setShowClearConfirm(false);
    setImportResult({ success: true, message: '所有数据已清空' });
  };

  const hasData = summary.answerRecords > 0 || summary.wrongQuestions > 0 ||
                  summary.favorites > 0 || summary.examHistory > 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* 标题 */}
      <div>
        <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <Database size={22} className="text-primary-light" />
          数据管理
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          导出/导入学习数据，在不同设备间同步进度
        </p>
      </div>

      {/* 数据概览 */}
      <div className="card-glow rounded-xl bg-bg-secondary p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Info size={16} className="text-primary-light" />
          当前数据概览
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <DataStatItem
            icon={<FileText size={18} className="text-primary-light" />}
            label="答题记录"
            value={summary.answerRecords}
          />
          <DataStatItem
            icon={<XCircle size={18} className="text-danger" />}
            label="错题"
            value={summary.wrongQuestions}
          />
          <DataStatItem
            icon={<Star size={18} className="text-warning" />}
            label="收藏"
            value={summary.favorites}
          />
          <DataStatItem
            icon={<Trophy size={18} className="text-cyan" />}
            label="考试记录"
            value={summary.examHistory}
          />
          <DataStatItem
            icon={<Calendar size={18} className="text-success" />}
            label="学习天数"
            value={summary.dailyStats}
          />
        </div>
      </div>

      {/* 操作区 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 导出 */}
        <div className="card-glow rounded-xl bg-bg-secondary p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
            <Download size={16} className="text-success" />
            导出数据
          </h3>
          <p className="text-xs text-text-secondary mb-4">
            将所有学习数据（答题记录、错题、收藏、考试历史、统计）导出为 JSON 文件
          </p>
          <button
            onClick={handleExport}
            disabled={!hasData}
            className="w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-success/15 text-success hover:bg-success/25 border border-success/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download size={18} />
            导出为 JSON 文件
          </button>
          {!hasData && (
            <p className="text-xs text-text-secondary mt-2 text-center">暂无数据可导出</p>
          )}
        </div>

        {/* 导入 */}
        <div className="card-glow rounded-xl bg-bg-secondary p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
            <Upload size={16} className="text-primary-light" />
            导入数据
          </h3>
          <p className="text-xs text-text-secondary mb-4">
            从其他设备导出的 JSON 文件导入，自动去重合并（不会覆盖已有数据）
          </p>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleImport}
            className={`w-full py-6 px-4 rounded-lg border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-2 cursor-pointer ${
              isDragging
                ? 'border-primary bg-primary/10'
                : 'border-white/10 hover:border-primary/50 hover:bg-white/[0.02]'
            }`}
          >
            <Upload size={24} className={isDragging ? 'text-primary-light' : 'text-text-secondary'} />
            <span className="text-sm text-text-secondary">
              {isDragging ? '释放文件即可导入' : '点击选择或拖拽 JSON 文件'}
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* 导入结果提示 */}
      {importResult && (
        <div
          className={`rounded-xl p-4 flex items-start gap-3 animate-fade-in ${
            importResult.success
              ? 'bg-success/10 border border-success/20'
              : 'bg-danger/10 border border-danger/20'
          }`}
        >
          {importResult.success ? (
            <CheckCircle size={20} className="text-success flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle size={20} className="text-danger flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${importResult.success ? 'text-success' : 'text-danger'}`}>
              {importResult.message}
            </p>
            {importResult.stats && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                <MergeStat label="答题记录" stat={importResult.stats.answerRecords} />
                <MergeStat label="错题" stat={importResult.stats.wrongQuestions} />
                <MergeStat label="收藏" stat={importResult.stats.favorites} />
                <MergeStat label="考试记录" stat={importResult.stats.examHistory} />
                <MergeStat label="学习天数" stat={importResult.stats.dailyStats} />
              </div>
            )}
          </div>
          <button
            onClick={() => setImportResult(null)}
            className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* 危险操作区 */}
      <div className="card-glow rounded-xl bg-bg-secondary p-5 border border-danger/10">
        <h3 className="text-sm font-semibold text-danger mb-2 flex items-center gap-2">
          <AlertTriangle size={16} />
          危险操作
        </h3>
        <p className="text-xs text-text-secondary mb-4">
          清空所有学习数据，此操作不可恢复。建议先导出备份。
        </p>
        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={!hasData}
            className="py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Trash2 size={16} />
            清空所有数据
          </button>
        ) : (
          <div className="flex items-center gap-3 animate-fade-in">
            <span className="text-sm text-danger font-medium">确定要清空所有数据吗？</span>
            <button
              onClick={handleClear}
              className="py-2 px-4 rounded-lg text-sm font-medium bg-danger text-white hover:bg-danger/80 transition-colors cursor-pointer"
            >
              确认清空
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="py-2 px-4 rounded-lg text-sm font-medium bg-white/5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              取消
            </button>
          </div>
        )}
      </div>

      {/* 使用说明 */}
      <div className="card-glow rounded-xl bg-bg-secondary p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Info size={16} className="text-primary-light" />
          使用说明
        </h3>
        <div className="space-y-2 text-xs text-text-secondary leading-relaxed">
          <p>📱 <strong className="text-text-primary">跨设备同步</strong>：在电脑 A「导出」→ 传输 JSON 文件 → 在电脑 B「导入」</p>
          <p>🔄 <strong className="text-text-primary">智能合并</strong>：导入时自动去重，不会覆盖已有数据，可放心多次导入</p>
          <p>📊 <strong className="text-text-primary">去重规则</strong>：答题记录按题目+时间戳去重，错题/收藏按题目ID去重，考试按考试ID去重</p>
          <p>💾 <strong className="text-text-primary">数据安全</strong>：建议定期导出备份，清除浏览器缓存会丢失所有本地数据</p>
        </div>
      </div>
    </div>
  );
}

// 数据统计项
function DataStatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 bg-white/[0.03] rounded-lg p-3">
      {icon}
      <div>
        <p className="text-lg font-bold text-text-primary">{value}</p>
        <p className="text-[10px] text-text-secondary">{label}</p>
      </div>
    </div>
  );
}

// 合并统计项
function MergeStat({ label, stat }: { label: string; stat: { before: number; imported: number; after: number } }) {
  const added = stat.after - stat.before;
  return (
    <div className="bg-white/[0.03] rounded-lg px-3 py-2">
      <p className="text-[10px] text-text-secondary">{label}</p>
      <p className="text-sm text-text-primary font-medium">
        {stat.before} → {stat.after}
        {added > 0 && <span className="text-success ml-1 text-xs">+{added}</span>}
      </p>
    </div>
  );
}
