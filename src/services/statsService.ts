import { StatsData, AnswerRecord } from '../types';
import { getField, getAnswerRecords, getExamHistory } from './storage';
import { getChapterCounts } from './questionService';
import { chapters } from '../data/chapters';
import { getAllQuestions } from '../data';

// 题目 id -> 章节信息映射（博世题目 id 为纯数字，不能从 id 字符串解析章节）
let infoMapCache: Record<string, { chapter: number; subChapter: string }> | null = null;
function getInfoMap() {
  if (!infoMapCache) {
    infoMapCache = {};
    getAllQuestions().forEach(q => {
      infoMapCache![q.id] = { chapter: q.chapter, subChapter: q.subChapter };
    });
  }
  return infoMapCache;
}

// 计算完整统计数据
export function getStatsData(): StatsData {
  const records = getAnswerRecords();
  const examHistory = getExamHistory();
  const dailyStats = getField('dailyStats');
  const streakDays = getField('streakDays');
  const chapterCounts = getChapterCounts();

  // 总体统计
  const totalAnswered = records.length;
  const totalCorrect = records.filter(r => r.isCorrect).length;
  const correctRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  // 各章节统计
  const chapterStats = calculateChapterStats(records, chapterCounts);

  // 考试历史统计
  const scores = examHistory.map(e => e.score);
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  // 薄弱知识点
  const weakPoints = findWeakPoints(records);

  return {
    totalAnswered,
    totalCorrect,
    correctRate,
    chapterStats,
    examHistory,
    bestScore,
    avgScore,
    dailyStats,
    streakDays,
    weakPoints,
  };
}

// 计算各章节统计
function calculateChapterStats(
  records: AnswerRecord[],
  chapterCounts: Record<number, number>
): StatsData['chapterStats'] {
  const stats: StatsData['chapterStats'] = {};

  // 通过题目 id 映射到章节
  for (const chapter of chapters) {
    const chapterRecords = records.filter(r => getInfoMap()[r.questionId]?.chapter === chapter.id);

    const answered = chapterRecords.length;
    const correct = chapterRecords.filter(r => r.isCorrect).length;

    stats[chapter.id] = {
      name: chapter.name,
      answered,
      correct,
      rate: answered > 0 ? Math.round((correct / answered) * 100) : 0,
      total: chapterCounts[chapter.id] || 0,
    };
  }

  return stats;
}

// 找出薄弱知识点（正确率低于 60%）
function findWeakPoints(records: AnswerRecord[]): StatsData['weakPoints'] {
  const subChapterStats: Record<string, { correct: number; total: number; chapter: number; name: string }> = {};

  for (const record of records) {
    const info = getInfoMap()[record.questionId];
    if (!info) continue;
    const subCh = info.subChapter;

    if (!subChapterStats[subCh]) {
      const chapterInfo = chapters.find(c => c.id === info.chapter);
      const subChapterInfo = chapterInfo?.subChapters.find(sc => sc.id === subCh);
      subChapterStats[subCh] = {
        correct: 0,
        total: 0,
        chapter: info.chapter,
        name: subChapterInfo?.name || subCh,
      };
    }

    subChapterStats[subCh].total += 1;
    if (record.isCorrect) {
      subChapterStats[subCh].correct += 1;
    }
  }

  return Object.entries(subChapterStats)
    .filter(([, stats]) => stats.total >= 3 && (stats.correct / stats.total) < 0.6)
    .map(([subChapter, stats]) => ({
      chapter: stats.chapter,
      subChapter,
      name: stats.name,
      rate: Math.round((stats.correct / stats.total) * 100),
    }))
    .sort((a, b) => a.rate - b.rate);
}

// 获取今日统计
export function getTodayStats(): { answered: number; correct: number } {
  const today = new Date().toISOString().split('T')[0];
  const dailyStats = getField('dailyStats');
  return dailyStats[today] || { answered: 0, correct: 0 };
}

// 获取最近 N 天的每日做题数据
export function getRecentDailyStats(days: number): Record<string, { answered: number; correct: number }> {
  const dailyStats = getField('dailyStats');
  const result: Record<string, { answered: number; correct: number }> = {};
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    result[dateStr] = dailyStats[dateStr] || { answered: 0, correct: 0 };
  }

  return result;
}

const statsService = {
  getStatsData,
  getTodayStats,
  getRecentDailyStats,
};

export default statsService;
