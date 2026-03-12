"use client";

export type GeneratedQuizQuestion = {
  answer: string;
  id: string;
  options: string[];
  question: string;
};

export type QuizAttemptAnswer = {
  correctAnswer: string;
  isCorrect: boolean;
  question: string;
  questionId: string;
  selectedAnswer: string | null;
};

export type QuizAttemptResult = {
  answers: QuizAttemptAnswer[];
  completedAt: string;
  score: number;
  total: number;
};

export type SavedArticle = {
  content: string;
  createdAt: string;
  id: string;
  lastAttempt: QuizAttemptResult | null;
  questions: GeneratedQuizQuestion[];
  summary: string;
  title: string;
};

const STORAGE_KEY = "quiz-generator.saved-articles.v1";
const CURRENT_ARTICLE_KEY = "quiz-generator.current-article.v1";
export const ARTICLE_STORAGE_EVENT = "quiz-generator:articles-updated";

function isBrowser() {
  return typeof window !== "undefined";
}

function dispatchStorageUpdate() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new CustomEvent(ARTICLE_STORAGE_EVENT));
}

export function getSavedArticles(): SavedArticle[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as SavedArticle[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

export function getSavedArticle(articleId: string) {
  return getSavedArticles().find((article) => article.id === articleId) ?? null;
}

export function saveArticle(article: SavedArticle) {
  const existingArticles = getSavedArticles();
  const nextArticles = [
    article,
    ...existingArticles.filter((existingArticle) => existingArticle.id !== article.id),
  ];

  if (isBrowser()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextArticles));
  }

  dispatchStorageUpdate();

  return nextArticles;
}

export function saveQuizAttempt(articleId: string, attempt: QuizAttemptResult) {
  const article = getSavedArticle(articleId);

  if (!article) {
    return null;
  }

  const nextArticle: SavedArticle = {
    ...article,
    lastAttempt: attempt,
  };

  saveArticle(nextArticle);

  return nextArticle;
}

export function getCurrentArticleId() {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(CURRENT_ARTICLE_KEY);
}

export function setCurrentArticleId(articleId: string) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(CURRENT_ARTICLE_KEY, articleId);
  dispatchStorageUpdate();
}
