"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import axios from "axios";

import { useHomeContext } from "./homeProvider";
import type {
  QuizAttemptResult,
  QuizAttemptSummary,
  SavedArticle,
} from "@/lib/article-types";

type ApiResponse<T> = {
  data?: T;
  error?: string;
  ok?: boolean;
};

type QuizContextType = {
  article: SavedArticle | null;
  currentQuestionIndex: number;
  error: string | null;
  goToPreviousQuestion: () => void;
  lastAttempt: QuizAttemptSummary | null;
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

type QuizSubmissionResponse = ApiResponse<QuizAttemptResult>;

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuizContext = () => {
  const context = useContext(QuizContext);

  if (!context) {
    throw new Error("useQuizContext must be used within QuizProvider");
  }

  return context;
};

export const QuizProvider = ({ articleId, children }: QuizProviderProps) => {
  const { refreshSavedArticles } = useHomeContext();
  const [article, setArticle] = useState<SavedArticle | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(
    {}
  );
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [loading, setLoading] = useState(Boolean(articleId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    if (!articleId) {
      setArticle(null);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setResult(null);
      setLoading(false);
      setError(null);
      return () => {
        isCancelled = true;
      };
    }

    const loadArticle = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get<ApiResponse<SavedArticle>>(
          "/api/routes/article",
          {
            params: {
              articleId,
            },
          }
        );
        const nextArticle = response.data?.data;

        if (!nextArticle) {
          throw new Error("The requested quiz could not be found.");
        }

        if (isCancelled) {
          return;
        }

        setArticle(nextArticle);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setResult(null);
      } catch (err) {
        if (isCancelled) {
          return;
        }

        setArticle(null);
        setResult(null);

        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.error || err.message || "Failed to load the quiz."
          );
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load the quiz.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    void loadArticle();

    return () => {
      isCancelled = true;
    };
  }, [articleId]);

  const currentQuestion = article?.questions[currentQuestionIndex] ?? null;
  const selectedAnswer = currentQuestion
    ? selectedAnswers[currentQuestion.id] ?? null
    : null;
  const lastAttempt =
    result ??
    article?.lastAttempt ??
    null;

  const selectAnswer = (answer: string) => {
    if (!currentQuestion || result || loading) {
      return;
    }

    setSelectedAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentQuestion.id]: answer,
    }));
  };

  const finishQuiz = async () => {
    if (!article) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<QuizSubmissionResponse>("/api/routes/quiz", {
        answers: article.questions.map((question) => ({
          questionId: question.id,
          selectedAnswer: selectedAnswers[question.id] ?? null,
        })),
        articleId: article.id,
      });
      const nextResult = response.data?.data;

      if (!nextResult) {
        throw new Error("The quiz result could not be saved.");
      }

      setResult(nextResult);
      setArticle((currentArticle) =>
        currentArticle
          ? {
              ...currentArticle,
              lastAttempt: {
                completedAt: nextResult.completedAt,
                score: nextResult.score,
                total: nextResult.total,
              },
            }
          : currentArticle
      );
      await refreshSavedArticles();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to save the quiz result."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save the quiz result.");
      }
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (!article || !currentQuestion || !selectedAnswer || loading) {
      return;
    }

    if (currentQuestionIndex >= article.questions.length - 1) {
      void finishQuiz();
      return;
    }

    setCurrentQuestionIndex((currentIndex) => currentIndex + 1);
  };

  const goToPreviousQuestion = () => {
    if (loading) {
      return;
    }

    setCurrentQuestionIndex((currentIndex) => Math.max(0, currentIndex - 1));
  };

  const restartQuiz = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);
    setError(null);
  };

  return (
    <QuizContext.Provider
      value={{
        article,
        currentQuestionIndex,
        error,
        goToPreviousQuestion,
        lastAttempt,
        loading,
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
};
