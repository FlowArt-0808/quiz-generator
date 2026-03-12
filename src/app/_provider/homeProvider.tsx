"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useUser } from "@clerk/nextjs";
import axios from "axios";

import type { SavedArticle, SavedArticleListItem } from "@/lib/article-types";

type ApiResponse<T> = {
  data?: T;
  error?: string;
  ok?: boolean;
};

type HomeContextType = {
  articleContent: string;
  articleTitle: string;
  currentArticleId: string | null;
  error: string | null;
  generateSummary: () => Promise<void>;
  isGenerated: boolean;
  loadSavedArticle: (articleId: string) => Promise<void>;
  loading: boolean;
  questionCount: number;
  refreshSavedArticles: () => Promise<void>;
  savedArticles: SavedArticleListItem[];
  savedArticlesLoading: boolean;
  setArticleContent: (value: string) => void;
  setArticleTitle: (value: string) => void;
  summary: string;
};

const HomeContext = createContext<HomeContextType | undefined>(undefined);

function applyArticleToState(article: SavedArticle) {
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
  const { isLoaded, isSignedIn, user } = useUser();
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
  const [savedArticles, setSavedArticles] = useState<SavedArticleListItem[]>([]);
  const [savedArticlesLoading, setSavedArticlesLoading] = useState(true);

  const clearSelectedArticleState = () => {
    setCurrentArticleIdState(null);
    setIsGenerated(false);
    setQuestionCount(0);
    setSummary("");
  };

  const resetEditorState = () => {
    setArticleTitleState("");
    setArticleContentState("");
    clearSelectedArticleState();
    setError(null);
  };

  const refreshSavedArticles = async () => {
    if (!isSignedIn || !user?.id) {
      setSavedArticles([]);
      setSavedArticlesLoading(false);
      return;
    }

    setSavedArticlesLoading(true);

    try {
      const response = await axios.get<ApiResponse<SavedArticleListItem[]>>(
        "/api/routes/article"
      );

      setSavedArticles(
        Array.isArray(response.data?.data) ? response.data.data : []
      );
    } catch {
      setSavedArticles([]);
    } finally {
      setSavedArticlesLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || !user?.id) {
      setSavedArticles([]);
      setSavedArticlesLoading(false);
      resetEditorState();
      return;
    }

    void refreshSavedArticles();
  }, [isLoaded, isSignedIn, user?.id]);

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

  const loadSavedArticle = async (articleId: string) => {
    if (!articleId.trim()) {
      return;
    }

    try {
      const response = await axios.get<ApiResponse<SavedArticle>>(
        "/api/routes/article",
        {
          params: {
            articleId,
          },
        }
      );
      const article = response.data?.data;

      if (!article) {
        throw new Error("The saved article could not be found.");
      }

      const nextState = applyArticleToState(article);

      setArticleTitleState(nextState.articleTitle);
      setArticleContentState(nextState.articleContent);
      setSummary(nextState.summary);
      setIsGenerated(nextState.isGenerated);
      setQuestionCount(nextState.questionCount);
      setCurrentArticleIdState(nextState.currentArticleId);
      setError(null);
    } catch (err) {
      clearSelectedArticleState();

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error || err.message || "Failed to load the article."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load the article.");
      }
    }
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
      const response = await axios.post<ApiResponse<SavedArticle>>(
        "/api/routes/summary",
        {
          articleId: currentArticleId,
          content: trimmedContent,
          title: trimmedTitle,
        }
      );
      const article = response.data?.data;

      if (!article) {
        throw new Error("The summary response was empty.");
      }

      const nextState = applyArticleToState(article);

      setArticleTitleState(nextState.articleTitle);
      setArticleContentState(nextState.articleContent);
      setSummary(nextState.summary);
      setIsGenerated(nextState.isGenerated);
      setQuestionCount(nextState.questionCount);
      setCurrentArticleIdState(nextState.currentArticleId);
      await refreshSavedArticles();
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
        refreshSavedArticles,
        savedArticles,
        savedArticlesLoading,
        setArticleContent,
        setArticleTitle,
        summary,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};
