"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import {
  getCurrentArticleId,
  getSavedArticle,
  saveQuizAttempt,
  setCurrentArticleId,
  type QuizAttemptResult,
  type SavedArticle,
} from "@/lib/article-store";

type QuizContextType = {
  article: SavedArticle | null;
  currentQuestionIndex: number;
  goToPreviousQuestion: () => void;
  lastAttempt: QuizAttemptResult | null;
  loading: boolean;
  nextQuestion: () => void;
  result: QuizAttemptResult | null;
  restartQuiz: () => void;
  selectAnswer: (answer: string) => void;
  selectedAnswer: string | null;
};

type QuizProviderProps = {
  articleId: string | null;
  children: ReactNode;
};

type QuizStateProviderProps = {
  article: SavedArticle | null;
  children: ReactNode;
};

const QuizContext = createContext<QuizContextType | undefined>(undefined);

function QuizStateProvider({ article, children }: QuizStateProviderProps) {
  const [articleState, setArticleState] = useState(article);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(
    {}
  );
  const [result, setResult] = useState<QuizAttemptResult | null>(null);

  const currentQuestion = articleState?.questions[currentQuestionIndex] ?? null;
  const selectedAnswer = currentQuestion
    ? selectedAnswers[currentQuestion.id] ?? null
    : null;
  const lastAttempt = result ?? articleState?.lastAttempt ?? null;

  const selectAnswer = (answer: string) => {
    if (!currentQuestion || result) {
      return;
    }

    setSelectedAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentQuestion.id]: answer,
    }));
  };

  const finishQuiz = () => {
    if (!articleState) {
      return;
    }

    const answers = articleState.questions.map((question) => {
      const selected = selectedAnswers[question.id] ?? null;

      return {
        correctAnswer: question.answer,
        isCorrect: selected === question.answer,
        question: question.question,
        questionId: question.id,
        selectedAnswer: selected,
      };
    });
    const score = answers.filter((answer) => answer.isCorrect).length;
    const nextResult: QuizAttemptResult = {
      answers,
      completedAt: new Date().toISOString(),
      score,
      total: articleState.questions.length,
    };
    const updatedArticle = saveQuizAttempt(articleState.id, nextResult);

    setResult(nextResult);

    if (updatedArticle) {
      setArticleState(updatedArticle);
    }
  };

  const nextQuestion = () => {
    if (!articleState || !currentQuestion || !selectedAnswer) {
      return;
    }

    if (currentQuestionIndex >= articleState.questions.length - 1) {
      finishQuiz();
      return;
    }

    setCurrentQuestionIndex((currentIndex) => currentIndex + 1);
  };

  const goToPreviousQuestion = () => {
    setCurrentQuestionIndex((currentIndex) => Math.max(0, currentIndex - 1));
  };

  const restartQuiz = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);
  };

  return (
    <QuizContext.Provider
      value={{
        article: articleState,
        currentQuestionIndex,
        goToPreviousQuestion,
        lastAttempt,
        loading: false,
        nextQuestion,
        result,
        restartQuiz,
        selectAnswer,
        selectedAnswer,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export const useQuizContext = () => {
  const context = useContext(QuizContext);

  if (!context) {
    throw new Error("useQuizContext must be used within QuizProvider");
  }

  return context;
};

export const QuizProvider = ({ articleId, children }: QuizProviderProps) => {
  const effectiveArticleId = articleId ?? getCurrentArticleId();
  const article = effectiveArticleId ? getSavedArticle(effectiveArticleId) : null;

  useEffect(() => {
    if (!effectiveArticleId) {
      return;
    }

    setCurrentArticleId(effectiveArticleId);
  }, [effectiveArticleId]);

  return (
    <QuizStateProvider key={effectiveArticleId ?? "empty"} article={article}>
      {children}
    </QuizStateProvider>
  );
};
