import { useState, useCallback, useEffect } from 'react';
import { Question, ExamRecord, ExamState } from '../types';
import { generateExam, submitExam, isAnswerCorrect } from '../services/examService';
import { addWrongQuestion, removeWrongQuestion, recordDailyAnswer, saveAnswerRecord } from '../services/storage';

const EXAM_STATE_KEY = 'tccp-exam-state';
const EXAM_TIME = 120 * 60; // 120分钟 = 7200秒

export default function useExam() {
  const [state, setState] = useState<ExamState>({
    status: 'idle',
    questions: [],
    currentIndex: 0,
    answers: {},
    markedQuestions: new Set(),
    startTime: null,
    remainingTime: EXAM_TIME,
  });

  const [examResult, setExamResult] = useState<ExamRecord | null>(null);

  // 尝试恢复考试状态
  useEffect(() => {
    const saved = sessionStorage.getItem(EXAM_STATE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // 恢复 Set 类型
      parsed.markedQuestions = new Set(parsed.markedQuestions || []);
      // 计算剩余时间
      if (parsed.startTime) {
        const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
        parsed.remainingTime = Math.max(EXAM_TIME - elapsed, 0);
      }
      setState(parsed);
    }
  }, []);

  // 保存考试状态到 sessionStorage
  const saveState = useCallback((newState: ExamState) => {
    const toSave = {
      ...newState,
      markedQuestions: Array.from(newState.markedQuestions),
    };
    sessionStorage.setItem(EXAM_STATE_KEY, JSON.stringify(toSave));
  }, []);

  // 开始考试
  const startExam = useCallback(() => {
    const questions = generateExam();
    const newState: ExamState = {
      status: 'ongoing',
      questions,
      currentIndex: 0,
      answers: {},
      markedQuestions: new Set(),
      startTime: Date.now(),
      remainingTime: EXAM_TIME,
    };
    setState(newState);
    saveState(newState);
    setExamResult(null);
  }, [saveState]);

  // 作答
  const answerQuestion = useCallback((questionId: string, answer: string[]) => {
    setState(prev => {
      const newState = {
        ...prev,
        answers: { ...prev.answers, [questionId]: answer },
      };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  // 标记题目
  const toggleMark = useCallback(() => {
    setState(prev => {
      const newMarked = new Set(prev.markedQuestions);
      if (newMarked.has(prev.currentIndex)) {
        newMarked.delete(prev.currentIndex);
      } else {
        newMarked.add(prev.currentIndex);
      }
      const newState = { ...prev, markedQuestions: newMarked };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  // 导航
  const goToQuestion = useCallback((index: number) => {
    setState(prev => {
      const newState = { ...prev, currentIndex: index };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const goNext = useCallback(() => {
    setState(prev => {
      if (prev.currentIndex >= prev.questions.length - 1) return prev;
      const newState = { ...prev, currentIndex: prev.currentIndex + 1 };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const goPrev = useCallback(() => {
    setState(prev => {
      if (prev.currentIndex <= 0) return prev;
      const newState = { ...prev, currentIndex: prev.currentIndex - 1 };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  // 交卷
  const submitExamAction = useCallback(() => {
    if (!state.startTime) return;

    const record = submitExam(state.questions, state.answers, state.startTime);
    setExamResult(record);

    // 记录每题的结果
    state.questions.forEach(q => {
      const userAns = state.answers[q.id] || [];
      const correct = isAnswerCorrect(userAns, q.answer, q.type);

      saveAnswerRecord({
        questionId: q.id,
        userAnswer: userAns,
        isCorrect: correct,
        timestamp: Date.now(),
        mode: 'exam',
      });

      recordDailyAnswer(correct);

      if (correct) {
        removeWrongQuestion(q.id);
      } else {
        addWrongQuestion(q.id);
      }
    });

    setState(prev => ({ ...prev, status: 'submitted' }));
    sessionStorage.removeItem(EXAM_STATE_KEY);
  }, [state]);

  // 重新考试
  const retryExam = useCallback(() => {
    startExam();
  }, [startExam]);

  // 当前题目
  const currentQuestion = state.questions[state.currentIndex];
  const answeredCount = Object.keys(state.answers).filter(
    id => state.answers[id] && state.answers[id].length > 0
  ).length;

  return {
    state,
    examResult,
    currentQuestion,
    answeredCount,
    startExam,
    answerQuestion,
    toggleMark,
    goToQuestion,
    goNext,
    goPrev,
    submitExam: submitExamAction,
    retryExam,
  };
}
