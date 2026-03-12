import type {
  GeneratedQuizQuestion,
  QuizAttemptSummary,
  SavedArticle,
  SavedArticleListItem,
} from "@/lib/article-types";

type QuizAttemptRecord = {
  completedAt: Date;
  score: number;
};

type QuizRecord = {
  answer: string;
  createdAt: Date;
  id: string;
  options: string[];
  question: string;
  quizAttempts?: QuizAttemptRecord[];
};

type ArticleRecord = {
  content: string;
  createdAt: Date;
  id: string;
  quizzes: QuizRecord[];
  summary: string;
  title: string;
};

function sortQuestions(questions: QuizRecord[]) {
  return [...questions].sort(
    (left, right) => left.createdAt.getTime() - right.createdAt.getTime()
  );
}

function serializeQuestions(questions: QuizRecord[]): GeneratedQuizQuestion[] {
  return sortQuestions(questions).map((question) => ({
    answer: question.answer,
    id: question.id,
    options: question.options,
    question: question.question,
  }));
}

export function buildLatestQuizAttemptSummary(
  questions: QuizRecord[]
): QuizAttemptSummary | null {
  const attempts = questions.flatMap((question) =>
    (question.quizAttempts ?? []).map((attempt) => ({
      completedAt: attempt.completedAt,
      score: attempt.score,
    }))
  );

  if (!attempts.length) {
    return null;
  }

  const latestCompletedAt = attempts.reduce(
    (latest, attempt) =>
      attempt.completedAt.getTime() > latest.getTime()
        ? attempt.completedAt
        : latest,
    attempts[0].completedAt
  );
  const latestAttemptScore = attempts
    .filter(
      (attempt) =>
        attempt.completedAt.getTime() === latestCompletedAt.getTime()
    )
    .reduce((score, attempt) => score + attempt.score, 0);

  return {
    completedAt: latestCompletedAt.toISOString(),
    score: latestAttemptScore,
    total: questions.length,
  };
}

export function serializeSavedArticle(article: ArticleRecord): SavedArticle {
  return {
    content: article.content,
    createdAt: article.createdAt.toISOString(),
    id: article.id,
    lastAttempt: buildLatestQuizAttemptSummary(article.quizzes),
    questions: serializeQuestions(article.quizzes),
    summary: article.summary,
    title: article.title,
  };
}

export function serializeSavedArticleListItem(
  article: ArticleRecord
): SavedArticleListItem {
  return {
    createdAt: article.createdAt.toISOString(),
    id: article.id,
    lastAttempt: buildLatestQuizAttemptSummary(article.quizzes),
    questionCount: article.quizzes.length,
    title: article.title,
  };
}
