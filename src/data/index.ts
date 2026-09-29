import { Question } from '../types';
import chapter1Data from './questions/chapter1.json';
import chapter2Data from './questions/chapter2.json';
import chapter3Data from './questions/chapter3.json';
import chapter4Data from './questions/chapter4.json';
import chapter5Data from './questions/chapter5.json';
import chapter6Data from './questions/chapter6.json';
import chapter7Data from './questions/chapter7.json';
import practicalData from './questions/practical.json';

// 合并所有领域题库（含实操题）
const allQuestions: Question[] = [
  ...(chapter1Data as Question[]),
  ...(chapter2Data as Question[]),
  ...(chapter3Data as Question[]),
  ...(chapter4Data as Question[]),
  ...(chapter5Data as Question[]),
  ...(chapter6Data as Question[]),
  ...(chapter7Data as Question[]),
  ...(practicalData as Question[]),
];

// 获取全部题目
export function getAllQuestions(): Question[] {
  return allQuestions;
}

// 按章节获取题目
export function getQuestionsByChapter(chapter: number): Question[] {
  return allQuestions.filter(q => q.chapter === chapter);
}

// 按子章节获取题目
export function getQuestionsBySubChapter(subChapter: string): Question[] {
  return allQuestions.filter(q => q.subChapter === subChapter);
}

// 按 ID 获取单题
export function getQuestionById(id: string): Question | undefined {
  return allQuestions.find(q => q.id === id);
}

// 仅获取实操模拟题（场景判断 / 架构图 等）
export function getPracticalQuestions(): Question[] {
  return allQuestions.filter(q => q.kind === 'practical');
}
