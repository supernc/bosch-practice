import { StorageData } from '../types';

const STORAGE_KEY = 'tccp-practice-data';
const CURRENT_VERSION = 1;

// 默认存储数据
const defaultData: StorageData = {
  answerRecords: [],
  wrongQuestions: [],
  favorites: [],
  examHistory: [],
  dailyStats: {},
  lastStudyDate: '',
  streakDays: 0,
  version: CURRENT_VERSION,
};

// 获取完整存储数据
function getData(): StorageData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...defaultData };
  const parsed = JSON.parse(raw) as StorageData;
  // 版本迁移
  if (!parsed.version || parsed.version < CURRENT_VERSION) {
    return migrateData(parsed);
  }
  return parsed;
}

// 保存完整存储数据
function setData(data: StorageData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 版本迁移
function migrateData(data: StorageData): StorageData {
  const migrated = { ...defaultData, ...data, version: CURRENT_VERSION };
  setData(migrated);
  return migrated;
}

// 获取指定字段
export function getField<K extends keyof StorageData>(key: K): StorageData[K] {
  return getData()[key];
}

// 更新指定字段
export function setField<K extends keyof StorageData>(key: K, value: StorageData[K]): void {
  const data = getData();
  data[key] = value;
  setData(data);
}

// 获取错题集合
export function getWrongQuestions(): Set<string> {
  return new Set(getField('wrongQuestions'));
}

// 添加错题
export function addWrongQuestion(questionId: string): void {
  const wrongs = getField('wrongQuestions');
  if (!wrongs.includes(questionId)) {
    setField('wrongQuestions', [...wrongs, questionId]);
  }
}

// 移除错题（做对后自动移除）
export function removeWrongQuestion(questionId: string): void {
  const wrongs = getField('wrongQuestions');
  setField('wrongQuestions', wrongs.filter(id => id !== questionId));
}

// 获取收藏集合
export function getFavorites(): Set<string> {
  return new Set(getField('favorites'));
}

// 切换收藏状态
export function toggleFavorite(questionId: string): boolean {
  const favs = getField('favorites');
  const index = favs.indexOf(questionId);
  if (index === -1) {
    setField('favorites', [...favs, questionId]);
    return true;
  } else {
    setField('favorites', favs.filter(id => id !== questionId));
    return false;
  }
}

// 获取考试历史
export function getExamHistory() {
  return getField('examHistory');
}

// 保存考试记录
export function saveExamRecord(record: StorageData['examHistory'][0]): void {
  const history = getField('examHistory');
  setField('examHistory', [...history, record]);
}

// 记录今日答题
export function recordDailyAnswer(isCorrect: boolean): void {
  const today = new Date().toISOString().split('T')[0];
  const dailyStats = getField('dailyStats');
  if (!dailyStats[today]) {
    dailyStats[today] = { answered: 0, correct: 0 };
  }
  dailyStats[today].answered += 1;
  if (isCorrect) {
    dailyStats[today].correct += 1;
  }
  setField('dailyStats', dailyStats);
  updateStreak(today);
}

// 更新连续打卡天数
function updateStreak(today: string): void {
  const lastDate = getField('lastStudyDate');
  if (lastDate === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastDate === yesterdayStr) {
    setField('streakDays', getField('streakDays') + 1);
  } else if (lastDate !== today) {
    setField('streakDays', 1);
  }
  setField('lastStudyDate', today);
}

// 保存答题记录
export function saveAnswerRecord(record: StorageData['answerRecords'][0]): void {
  const records = getField('answerRecords');
  records.push(record);
  // 最多保留最近 5000 条
  if (records.length > 5000) {
    records.splice(0, records.length - 5000);
  }
  setField('answerRecords', records);
}

// 获取所有答题记录
export function getAnswerRecords() {
  return getField('answerRecords');
}

// 清除所有数据
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ======= 备注功能 =======
const NOTES_KEY = 'tccp-question-notes';

export function getNotes(): Record<string, string> {
  const raw = localStorage.getItem(NOTES_KEY);
  return raw ? JSON.parse(raw) : {};
}

export function getNote(questionId: string): string {
  return getNotes()[questionId] || '';
}

export function saveNote(questionId: string, note: string): void {
  const notes = getNotes();
  if (note.trim()) {
    notes[questionId] = note.trim();
  } else {
    delete notes[questionId];
  }
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

// ======= 题目删除（用户在题库中隐藏不需要的题目） =======
const DELETED_KEY = 'bosch-deleted-questions';
const deletedListeners = new Set<() => void>();

export function getDeletedQuestions(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function setDeletedQuestions(ids: Set<string>): void {
  localStorage.setItem(DELETED_KEY, JSON.stringify([...ids]));
  deletedListeners.forEach(fn => fn());
}

// 删除题目：从题库隐藏，同时移出错题本与收藏夹
export function deleteQuestion(questionId: string): void {
  const ids = getDeletedQuestions();
  ids.add(questionId);
  const data = getData();
  data.wrongQuestions = data.wrongQuestions.filter(id => id !== questionId);
  data.favorites = data.favorites.filter(id => id !== questionId);
  setData(data);
  setDeletedQuestions(ids);
}

export function restoreQuestion(questionId: string): void {
  const ids = getDeletedQuestions();
  ids.delete(questionId);
  setDeletedQuestions(ids);
}

export function restoreAllQuestions(): void {
  setDeletedQuestions(new Set());
}

export function subscribeDeleted(fn: () => void): () => void {
  deletedListeners.add(fn);
  return () => { deletedListeners.delete(fn); };
}

// ======= 导出/导入功能 =======

// 导出所有数据为 JSON 字符串
export function exportData(): string {
  const data = getData();
  const exportPayload = {
    _meta: {
      app: 'tccp-practice',
      exportTime: new Date().toISOString(),
      version: CURRENT_VERSION,
    },
    data,
    deletedQuestions: [...getDeletedQuestions()],
  };
  return JSON.stringify(exportPayload, null, 2);
}

// 下载数据为 JSON 文件
export function downloadData(): void {
  const json = exportData();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  a.href = url;
  a.download = `tccp-backup-${timestamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// 导入数据（带智能合并去重）
export interface ImportResult {
  success: boolean;
  message: string;
  stats?: {
    answerRecords: { before: number; imported: number; after: number };
    wrongQuestions: { before: number; imported: number; after: number };
    favorites: { before: number; imported: number; after: number };
    examHistory: { before: number; imported: number; after: number };
    dailyStats: { before: number; imported: number; after: number };
  };
}

export function importData(jsonStr: string, mode: 'merge' | 'overwrite' = 'merge'): ImportResult {
  try {
    const parsed = JSON.parse(jsonStr);

    // 支持两种格式：带 _meta 的导出格式 和 直接的 StorageData 格式
    let importedData: StorageData;
    if (parsed._meta && parsed.data) {
      importedData = parsed.data as StorageData;
    } else if (parsed.answerRecords !== undefined) {
      importedData = parsed as StorageData;
    } else {
      return { success: false, message: '无法识别的数据格式，请确认是博世业务学习导出的文件' };
    }

    // 验证必要字段
    if (!Array.isArray(importedData.answerRecords) ||
        !Array.isArray(importedData.wrongQuestions) ||
        !Array.isArray(importedData.favorites)) {
      return { success: false, message: '数据格式不完整，缺少必要字段' };
    }

    // 同步「已删除题目」（合并模式取并集，覆盖模式直接替换）
    if (Array.isArray(parsed.deletedQuestions)) {
      const incoming = parsed.deletedQuestions as string[];
      setDeletedQuestions(
        mode === 'overwrite' ? new Set(incoming) : new Set([...getDeletedQuestions(), ...incoming])
      );
    }

    if (mode === 'overwrite') {
      // 直接覆盖
      const migrated = { ...defaultData, ...importedData, version: CURRENT_VERSION };
      setData(migrated);
      return {
        success: true,
        message: '数据已完全覆盖导入',
        stats: {
          answerRecords: { before: 0, imported: migrated.answerRecords.length, after: migrated.answerRecords.length },
          wrongQuestions: { before: 0, imported: migrated.wrongQuestions.length, after: migrated.wrongQuestions.length },
          favorites: { before: 0, imported: migrated.favorites.length, after: migrated.favorites.length },
          examHistory: { before: 0, imported: migrated.examHistory.length, after: migrated.examHistory.length },
          dailyStats: { before: 0, imported: Object.keys(migrated.dailyStats).length, after: Object.keys(migrated.dailyStats).length },
        },
      };
    }

    // 合并模式（默认）：智能去重
    const current = getData();
    const stats = {
      answerRecords: { before: current.answerRecords.length, imported: importedData.answerRecords.length, after: 0 },
      wrongQuestions: { before: current.wrongQuestions.length, imported: importedData.wrongQuestions.length, after: 0 },
      favorites: { before: current.favorites.length, imported: importedData.favorites.length, after: 0 },
      examHistory: { before: current.examHistory.length, imported: importedData.examHistory.length, after: 0 },
      dailyStats: { before: Object.keys(current.dailyStats).length, imported: Object.keys(importedData.dailyStats || {}).length, after: 0 },
    };

    // 1. 合并答题记录（按 questionId + timestamp 去重）
    const existingRecordKeys = new Set(
      current.answerRecords.map(r => `${r.questionId}_${r.timestamp}`)
    );
    const newRecords = (importedData.answerRecords || []).filter(
      r => !existingRecordKeys.has(`${r.questionId}_${r.timestamp}`)
    );
    current.answerRecords = [...current.answerRecords, ...newRecords];
    // 按时间排序并限制 5000 条
    current.answerRecords.sort((a, b) => a.timestamp - b.timestamp);
    if (current.answerRecords.length > 5000) {
      current.answerRecords = current.answerRecords.slice(-5000);
    }
    stats.answerRecords.after = current.answerRecords.length;

    // 2. 合并错题（Set 去重）
    const wrongSet = new Set([...current.wrongQuestions, ...(importedData.wrongQuestions || [])]);
    current.wrongQuestions = [...wrongSet];
    stats.wrongQuestions.after = current.wrongQuestions.length;

    // 3. 合并收藏（Set 去重）
    const favSet = new Set([...current.favorites, ...(importedData.favorites || [])]);
    current.favorites = [...favSet];
    stats.favorites.after = current.favorites.length;

    // 4. 合并考试历史（按 id 去重）
    const existingExamIds = new Set(current.examHistory.map(e => e.id));
    const newExams = (importedData.examHistory || []).filter(e => !existingExamIds.has(e.id));
    current.examHistory = [...current.examHistory, ...newExams];
    current.examHistory.sort((a, b) => a.startTime - b.startTime);
    stats.examHistory.after = current.examHistory.length;

    // 5. 合并每日统计（相同日期取较大值）
    const importedDaily = importedData.dailyStats || {};
    for (const [date, importedStat] of Object.entries(importedDaily)) {
      if (!current.dailyStats[date]) {
        current.dailyStats[date] = importedStat;
      } else {
        current.dailyStats[date] = {
          answered: Math.max(current.dailyStats[date].answered, importedStat.answered),
          correct: Math.max(current.dailyStats[date].correct, importedStat.correct),
        };
      }
    }
    stats.dailyStats.after = Object.keys(current.dailyStats).length;

    // 6. 连续打卡和最近学习日期：取较新的
    if (importedData.lastStudyDate && importedData.lastStudyDate > current.lastStudyDate) {
      current.lastStudyDate = importedData.lastStudyDate;
    }
    current.streakDays = Math.max(current.streakDays, importedData.streakDays || 0);

    current.version = CURRENT_VERSION;
    setData(current);

    const totalNew = (stats.answerRecords.after - stats.answerRecords.before) +
                     (stats.wrongQuestions.after - stats.wrongQuestions.before) +
                     (stats.favorites.after - stats.favorites.before) +
                     (stats.examHistory.after - stats.examHistory.before);

    return {
      success: true,
      message: totalNew > 0
        ? `合并完成，新增 ${totalNew} 条数据（已自动去重）`
        : '合并完成，所有数据已存在（无新增）',
      stats,
    };
  } catch {
    return { success: false, message: '文件解析失败，请确认是有效的 JSON 文件' };
  }
}

// 获取当前数据概要（用于展示）
export function getDataSummary() {
  const data = getData();
  return {
    answerRecords: data.answerRecords.length,
    wrongQuestions: data.wrongQuestions.length,
    favorites: data.favorites.length,
    examHistory: data.examHistory.length,
    dailyStats: Object.keys(data.dailyStats).length,
    lastStudyDate: data.lastStudyDate,
    streakDays: data.streakDays,
  };
}

// 导出所有存储 API
const storageService = {
  getData,
  getField,
  setField,
  getWrongQuestions,
  addWrongQuestion,
  removeWrongQuestion,
  getFavorites,
  toggleFavorite,
  getExamHistory,
  saveExamRecord,
  recordDailyAnswer,
  saveAnswerRecord,
  getAnswerRecords,
  clearAllData,
  exportData,
  downloadData,
  importData,
  getDataSummary,
};

export default storageService;
