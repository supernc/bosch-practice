// 选项结构
export interface Option {
  label: string;  // A, B, C, D
  text: string;   // 选项内容
}

// 实操题专属：场景元数据
export interface PracticalMeta {
  scenario: string;              // 业务场景描述（多行）
  topology?: {                   // 拓扑/架构信息（可选）
    type: 'mermaid' | 'ascii';   // 渲染方式
    content: string;             // mermaid 代码 或 ASCII 图
    caption?: string;            // 图注
  };
  constraints?: string[];        // 业务约束 / 已知条件
  reasoning: string[];           // 解题推理链路（每一步一行）
  pitfall?: string;              // 常见误区 / 为什么会答错
}

// 题目结构
export interface Question {
  id: string;                    // 唯一标识，如 "ch2-cvm-003"
  stem: string;                  // 题干文本
  options: Option[];             // 选项数组
  answer: string[];              // 正确答案，如 ["A"] 或 ["A","C"]
  type: "single" | "multiple";   // 题型
  chapter: number;               // 所属章节 1-5
  subChapter: string;            // 子章节标识
  tags: string[];                // 知识点标签
  analysis: string;              // 解析文本
  wikiUrl?: string;              // 对应 Wiki 页面链接
  difficulty: 1 | 2 | 3;        // 难度等级
  kind?: 'theory' | 'practical'; // 题型种类，缺省视为 theory（理论选择题）
  practical?: PracticalMeta;     // 实操题元数据（kind=practical 时必填）
}

// 考试记录
export interface ExamRecord {
  id: string;
  startTime: number;
  endTime: number;
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctCount: number;
  answers: Record<string, string[]>;  // questionId -> 用户选择
  chapterScores: Record<number, { correct: number; total: number }>;
}

// 答题记录（单题）
export interface AnswerRecord {
  questionId: string;
  userAnswer: string[];
  isCorrect: boolean;
  timestamp: number;
  mode: 'exam' | 'practice' | 'random';
}

// 章节信息
export interface ChapterInfo {
  id: number;
  name: string;
  description: string;
  weight: number;  // 考试占比百分比
  subChapters: SubChapter[];
  wikiUrl: string;
}

// 子章节信息
export interface SubChapter {
  id: string;
  name: string;
  wikiUrl: string;
}

// 用户进度
export interface UserProgress {
  totalAnswered: number;
  totalCorrect: number;
  chapterProgress: Record<number, {
    answered: number;
    correct: number;
    total: number;
  }>;
  dailyStats: Record<string, {
    answered: number;
    correct: number;
  }>;
  examHistory: ExamRecord[];
  wrongQuestions: Set<string>;  // questionId set
  favorites: Set<string>;       // questionId set
  lastStudyDate: string;
  streakDays: number;
}

// 考试状态
export type ExamStatus = 'idle' | 'preparing' | 'ongoing' | 'submitted';

// 考试状态机
export interface ExamState {
  status: ExamStatus;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string[]>;
  markedQuestions: Set<number>;
  startTime: number | null;
  remainingTime: number;  // 秒
}

// 练习状态
export interface PracticeState {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string[]>;
  showAnalysis: boolean;
  isSubmitted: boolean;
  stats: {
    answered: number;
    correct: number;
  };
}

// 存储数据结构
export interface StorageData {
  answerRecords: AnswerRecord[];
  wrongQuestions: string[];     // questionId array (JSON不支持Set)
  favorites: string[];          // questionId array
  examHistory: ExamRecord[];
  dailyStats: Record<string, { answered: number; correct: number }>;
  lastStudyDate: string;
  streakDays: number;
  version: number;
}

// ===== 学习中心（博世业务方向）类型 =====

// 学习模块自测题（复用 Option）
export interface LearningQuiz {
  stem: string;                 // 题干
  options: Option[];            // 选项数组
  answer: string[];             // 正确答案，如 ["A"] 或 ["A","C"]
  type: "single" | "multiple";
  analysis: string;             // 解析
}

// 学习模块章节（三段式：基础概念 / 业务逻辑 / 初步方案）
export interface LearningSection {
  key: 'concept' | 'logic' | 'solution';
  title: string;                // 段落标题
  points: string[];             // 要点列表
  diagram?: {                   // 可选架构/流程示意图
    content: string;            // mermaid 代码
    caption?: string;           // 图注
  };
}

// 学习模块
export interface LearningModule {
  id: string;                   // 唯一标识，如 "autonomous-driving"
  code?: string;                // 业务代码标签，如 "XC 高阶" / "脱敏"
  title: string;                // 模块标题
  category: 'business' | 'code';// 业务方向 or 博世代码模块
  summary: string;              // 一句话概述
  keyTerms: { term: string; desc: string }[];  // 核心术语
  sections: LearningSection[];  // 三段式内容
  quiz: LearningQuiz[];         // 配套自测题
  source?: string;              // 知识来源标注
}

// 统计数据
export interface StatsData {
  totalAnswered: number;
  totalCorrect: number;
  correctRate: number;
  chapterStats: Record<number, {
    name: string;
    answered: number;
    correct: number;
    rate: number;
    total: number;
  }>;
  examHistory: ExamRecord[];
  bestScore: number;
  avgScore: number;
  dailyStats: Record<string, { answered: number; correct: number }>;
  streakDays: number;
  weakPoints: { chapter: number; subChapter: string; name: string; rate: number }[];
}
