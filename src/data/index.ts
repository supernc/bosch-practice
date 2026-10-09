import { Question } from '../types';
import { getDeletedQuestions } from '../services/storage';
import chapter1Data from './questions/chapter1.json';
import chapter2Data from './questions/chapter2.json';
import chapter3Data from './questions/chapter3.json';
import chapter4Data from './questions/chapter4.json';
import chapter5Data from './questions/chapter5.json';
import chapter6Data from './questions/chapter6.json';
import chapter7Data from './questions/chapter7.json';
import scenarioData from './questions/scenario.json';
import practicalData from './questions/practical.json';

// 合并所有领域题库：概念题 + 业务场景题（scenario.json，由 scripts/build_scenario_questions.py 生成）+ 实操题
const rawQuestions: Question[] = [
  ...(chapter1Data as Question[]),
  ...(chapter2Data as Question[]),
  ...(chapter3Data as Question[]),
  ...(chapter4Data as Question[]),
  ...(chapter5Data as Question[]),
  ...(chapter6Data as Question[]),
  ...(chapter7Data as Question[]),
  ...(scenarioData as Question[]),
  ...(practicalData as Question[]),
];

// 是否为业务场景题
export function isScenarioQuestion(q: Question): boolean {
  return q.subChapter.startsWith('sc');
}

// 获取全部题目（已排除用户删除的题目）
export function getAllQuestions(): Question[] {
  const deleted = getDeletedQuestions();
  if (deleted.size === 0) return rawQuestions;
  return rawQuestions.filter(q => !deleted.has(q.id));
}

// 获取包括已删除在内的全部题目（仅用于「已删除题目」恢复管理）
export function getRawQuestions(): Question[] {
  return rawQuestions;
}

// 按章节获取题目
export function getQuestionsByChapter(chapter: number): Question[] {
  return getAllQuestions().filter(q => q.chapter === chapter);
}

// 按子章节获取题目
export function getQuestionsBySubChapter(subChapter: string): Question[] {
  return getAllQuestions().filter(q => q.subChapter === subChapter);
}

// 按 ID 获取单题
export function getQuestionById(id: string): Question | undefined {
  return getAllQuestions().find(q => q.id === id);
}

// 仅获取实操模拟题（场景判断 / 架构图 等）
export function getPracticalQuestions(): Question[] {
  return getAllQuestions().filter(q => q.kind === 'practical');
}
