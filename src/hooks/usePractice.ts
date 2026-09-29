import { useState, useCallback } from 'react';
import { Question } from '../types';
import { isAnswerCorrect } from '../services/examService';
import {
  addWrongQuestion,
  removeWrongQuestion,
  recordDailyAnswer,
  saveAnswerRecord,
  toggleFavorite as toggleFav,
  getFavorites,
} from '../services/storage';

interface PracticeReturn {
  questions: Question[];
  currentIndex: number;
  currentQuestion: Question | null;
  userAnswer: string[];
  isSubmitted: boolean;
  isCorrect: boolean;
  stats: { answered: number; correct: number };
  favorites: Set<string>;
  setQuestions: (qs: Question[]) => void;
  answerQuestion: (answer: string[]) => void;
  submitAnswer: () => boolean;
  goNext: () => void;
  goPrev: () => void;
  goTo: (index: number) => void;
  toggleFavorite: (questionId: string) => void;
  reset: () => void;
}

export default function usePractice(mode: 'practice' | 'random' = 'practice'): PracticeReturn {
  const [questions, setQuestionsState] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submittedSet, setSubmittedSet] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({ answered: 0, correct: 0 });
  const [favorites, setFavorites] = useState<Set<string>>(getFavorites());

  const currentQuestion = questions[currentIndex] || null;
  const userAnswer = currentQuestion ? (answers[currentQuestion.id] || []) : [];
  const isSubmitted = currentQuestion ? submittedSet.has(currentQuestion.id) : false;
  const isCorrect = currentQuestion && isSubmitted
    ? isAnswerCorrect(userAnswer, currentQuestion.answer, currentQuestion.type)
    : false;

  const setQuestions = useCallback((qs: Question[]) => {
    setQuestionsState(qs);
    setCurrentIndex(0);
    setAnswers({});
    setSubmittedSet(new Set());
    setStats({ answered: 0, correct: 0 });
  }, []);

  const answerQuestion = useCallback((answer: string[]) => {
    if (!currentQuestion || isSubmitted) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
  }, [currentQuestion, isSubmitted]);

  const submitAnswer = useCallback((): boolean => {
    if (!currentQuestion || isSubmitted) return false;
    const ans = answers[currentQuestion.id] || [];
    if (ans.length === 0) return false;

    const correct = isAnswerCorrect(ans, currentQuestion.answer, currentQuestion.type);

    setSubmittedSet(prev => new Set(prev).add(currentQuestion.id));
    setStats(prev => ({
      answered: prev.answered + 1,
      correct: prev.correct + (correct ? 1 : 0),
    }));

    // 记录答题
    saveAnswerRecord({
      questionId: currentQuestion.id,
      userAnswer: ans,
      isCorrect: correct,
      timestamp: Date.now(),
      mode,
    });

    recordDailyAnswer(correct);

    if (correct) {
      removeWrongQuestion(currentQuestion.id);
    } else {
      addWrongQuestion(currentQuestion.id);
    }

    return correct;
  }, [currentQuestion, isSubmitted, answers, mode]);

  const goNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, questions.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const goTo = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  }, [questions.length]);

  const toggleFavorite = useCallback((questionId: string) => {
    const isFav = toggleFav(questionId);
    setFavorites(getFavorites());
  }, []);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setAnswers({});
    setSubmittedSet(new Set());
    setStats({ answered: 0, correct: 0 });
  }, []);

  return {
    questions,
    currentIndex,
    currentQuestion,
    userAnswer,
    isSubmitted,
    isCorrect,
    stats,
    favorites,
    setQuestions,
    answerQuestion,
    submitAnswer,
    goNext,
    goPrev,
    goTo,
    toggleFavorite,
    reset,
  };
}
