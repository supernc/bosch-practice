import { Question } from '../types';
import { getAllQuestions } from '../data';

// 按章节获取题目
export function getQuestionsByChapter(chapter: number): Question[] {
  return getAllQuestions().filter(q => q.chapter === chapter);
}

// 按子章节获取题目
export function getQuestionsBySubChapter(subChapter: string): Question[] {
  return getAllQuestions().filter(q => q.subChapter === subChapter);
}

// 按题型获取题目
export function getQuestionsByType(type: 'single' | 'multiple'): Question[] {
  return getAllQuestions().filter(q => q.type === type);
}

// Fisher-Yates 洗牌算法
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 随机抽题（可指定数量和题型）
export function getRandomQuestions(
  count: number,
  type?: 'single' | 'multiple' | 'mixed',
  excludeIds?: Set<string>
): Question[] {
  let pool = getAllQuestions();

  if (type === 'single') {
    pool = pool.filter(q => q.type === 'single');
  } else if (type === 'multiple') {
    pool = pool.filter(q => q.type === 'multiple');
  }

  if (excludeIds && excludeIds.size > 0) {
    pool = pool.filter(q => !excludeIds.has(q.id));
  }

  const shuffled = shuffleArray(pool);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// 计算指定来源 + 题型下可抽取的题目总数（用于「全部」选项）
export function getAvailableCount(
  ids: string[] | null,
  type?: 'single' | 'multiple' | 'mixed'
): number {
  let pool = ids ? getQuestionsByIds(ids) : getAllQuestions();

  if (type === 'single') {
    pool = pool.filter(q => q.type === 'single');
  } else if (type === 'multiple') {
    pool = pool.filter(q => q.type === 'multiple');
  }

  return pool.length;
}

// 从指定 ID 集合中随机抽题（用于错题/收藏随机练习）
export function getRandomQuestionsFromIds(
  ids: string[],
  count: number,
  type?: 'single' | 'multiple' | 'mixed'
): Question[] {
  let pool = getQuestionsByIds(ids);

  if (type === 'single') {
    pool = pool.filter(q => q.type === 'single');
  } else if (type === 'multiple') {
    pool = pool.filter(q => q.type === 'multiple');
  }

  const shuffled = shuffleArray(pool);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// 按考试大纲比例抽题（模拟考试用）
export function getExamQuestions(): Question[] {
  const all = getAllQuestions();

  // 7 领域均分抽题（单选 56 + 多选 11 = 67 题）
  const chapterDistribution: Record<number, { single: number; multiple: number }> = {
    1: { single: 8, multiple: 4 },
    2: { single: 8, multiple: 2 },
    3: { single: 8, multiple: 1 },
    4: { single: 8, multiple: 1 },
    5: { single: 8, multiple: 1 },
    6: { single: 8, multiple: 1 },
    7: { single: 8, multiple: 1 },
  };

  const examQuestions: Question[] = [];

  for (const [chapter, dist] of Object.entries(chapterDistribution)) {
    const chapterNum = Number(chapter);
    const chapterQuestions = all.filter(q => q.chapter === chapterNum);
    const singles = shuffleArray(chapterQuestions.filter(q => q.type === 'single'));
    const multiples = shuffleArray(chapterQuestions.filter(q => q.type === 'multiple'));

    examQuestions.push(...singles.slice(0, dist.single));
    examQuestions.push(...multiples.slice(0, dist.multiple));
  }

  // 最终打乱顺序，但保持单选在前、多选在后
  const finalSingles = shuffleArray(examQuestions.filter(q => q.type === 'single'));
  const finalMultiples = shuffleArray(examQuestions.filter(q => q.type === 'multiple'));

  return [...finalSingles, ...finalMultiples];
}

// 根据 ID 获取题目
export function getQuestionById(id: string): Question | undefined {
  return getAllQuestions().find(q => q.id === id);
}

// 根据 ID 列表获取题目
export function getQuestionsByIds(ids: string[]): Question[] {
  const idSet = new Set(ids);
  return getAllQuestions().filter(q => idSet.has(q.id));
}

// 获取题库总数
export function getTotalCount(): number {
  return getAllQuestions().length;
}

// 获取各章节题目数
export function getChapterCounts(): Record<number, number> {
  const counts: Record<number, number> = {};
  getAllQuestions().forEach(q => {
    counts[q.chapter] = (counts[q.chapter] || 0) + 1;
  });
  return counts;
}

const questionService = {
  getQuestionsByChapter,
  getQuestionsBySubChapter,
  getQuestionsByType,
  getRandomQuestions,
  getRandomQuestionsFromIds,
  getAvailableCount,
  getExamQuestions,
  getQuestionById,
  getQuestionsByIds,
  getTotalCount,
  getChapterCounts,
};

export default questionService;
