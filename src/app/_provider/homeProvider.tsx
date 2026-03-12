"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import axios from "axios";

import {
  getCurrentArticleId,
  getSavedArticle,
  saveArticle,
  setCurrentArticleId,
  type SavedArticle,
} from "@/lib/article-store";

type HomeContextType = {
  articleContent: string;
  articleTitle: string;
  currentArticleId: string | null;
  error: string | null;
  generateSummary: () => Promise<void>;
  isGenerated: boolean;
  loadSavedArticle: (articleId: string) => void;
  loading: boolean;
  questionCount: number;
  setArticleContent: (value: string) => void;
  setArticleTitle: (value: string) => void;
  summary: string;
};

type SummaryResponse = {
  data?: {
    questions?: Array<{
      answer: string;
      options: string[];
      question: string;
    }>;
    summary?: string;
  };
};

const HomeContext = createContext<HomeContextType | undefined>(undefined);

function mapArticleToState(article: SavedArticle) {
  return {
    articleContent: article.content,
    articleTitle: article.title,
    currentArticleId: article.id,
    isGenerated: true,
    questionCount: article.questions.length,
    summary: article.summary,
  };
}

export const useHomeContext = () => {
  const context = useContext(HomeContext);

  if (!context) {
    throw new Error("useHomeContext must be used within HomeProvider");
  }

  return context;
};

export const HomeProvider = ({ children }: { children: ReactNode }) => {
  const [articleTitle, setArticleTitleState] = useState("");
  const [articleContent, setArticleContentState] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [currentArticleId, setCurrentArticleIdState] = useState<string | null>(
    null
  );

  useEffect(() => {
    const articleId = getCurrentArticleId();

    if (!articleId) {
      return;
    }

    const article = getSavedArticle(articleId);

    if (!article) {
      return;
    }

    const nextState = mapArticleToState(article);

    setArticleTitleState(nextState.articleTitle);
    setArticleContentState(nextState.articleContent);
    setSummary(nextState.summary);
    setIsGenerated(nextState.isGenerated);
    setQuestionCount(nextState.questionCount);
    setCurrentArticleIdState(nextState.currentArticleId);
  }, []);

  const resetGeneratedState = (clearCurrentArticleId: boolean) => {
    setError(null);
    setIsGenerated(false);
    setQuestionCount(0);
    setSummary("");

    if (clearCurrentArticleId) {
      setCurrentArticleIdState(null);
    }
  };

  const setArticleTitle = (value: string) => {
    setArticleTitleState(value);
    resetGeneratedState(true);
  };

  const setArticleContent = (value: string) => {
    setArticleContentState(value);
    resetGeneratedState(true);
  };

  const loadSavedArticle = (articleId: string) => {
    const article = getSavedArticle(articleId);

    if (!article) {
      return;
    }

    const nextState = mapArticleToState(article);

    setArticleTitleState(nextState.articleTitle);
    setArticleContentState(nextState.articleContent);
    setSummary(nextState.summary);
    setIsGenerated(nextState.isGenerated);
    setQuestionCount(nextState.questionCount);
    setCurrentArticleIdState(nextState.currentArticleId);
    setCurrentArticleId(article.id);
    setError(null);
  };

  const generateSummary = async () => {
    const trimmedTitle = articleTitle.trim();
    const trimmedContent = articleContent.trim();

    if (!trimmedTitle || !trimmedContent) {
      setError("Enter a title and article content before generating a summary.");
      setIsGenerated(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<SummaryResponse>("/api/routes/summary", {
        title: trimmedTitle,
        content: trimmedContent,
      });

      const generatedSummary = response.data?.data?.summary;
      const generatedQuestions = response.data?.data?.questions ?? [];

      if (typeof generatedSummary !== "string" || !generatedSummary.trim()) {
        throw new Error("The summary response was empty.");
      }

      if (!generatedQuestions.length) {
        throw new Error("The quiz questions could not be generated.");
      }

      const existingArticle = currentArticleId
        ? getSavedArticle(currentArticleId)
        : null;
      const articleId = existingArticle?.id ?? crypto.randomUUID();
      const savedArticle: SavedArticle = {
        content: trimmedContent,
        createdAt: existingArticle?.createdAt ?? new Date().toISOString(),
        id: articleId,
        lastAttempt: existingArticle?.lastAttempt ?? null,
        questions: generatedQuestions.map((question, index) => ({
          ...question,
          id: existingArticle?.questions[index]?.id ?? crypto.randomUUID(),
        })),
        summary: generatedSummary.trim(),
        title: trimmedTitle,
      };

      saveArticle(savedArticle);
      setCurrentArticleId(articleId);
      setCurrentArticleIdState(articleId);
      setSummary(savedArticle.summary);
      setQuestionCount(savedArticle.questions.length);
      setIsGenerated(true);
    } catch (err) {
      setIsGenerated(false);

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to generate the summary."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to generate the summary.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <HomeContext.Provider
      value={{
        articleContent,
        articleTitle,
        currentArticleId,
        error,
        generateSummary,
        isGenerated,
        loadSavedArticle,
        loading,
        questionCount,
        setArticleContent,
        setArticleTitle,
        summary,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};
