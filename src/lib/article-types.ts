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

export type QuizAttemptSummary = {
  completedAt: string;
  score: number;
  total: number;
};

export type QuizAttemptResult = QuizAttemptSummary & {
  answers: QuizAttemptAnswer[];
};

export type SavedArticle = {
  content: string;
  createdAt: string;
  id: string;
  lastAttempt: QuizAttemptSummary | null;
  questions: GeneratedQuizQuestion[];
  summary: string;
  title: string;
};

export type SavedArticleListItem = {
  createdAt: string;
  id: string;
  lastAttempt: QuizAttemptSummary | null;
  questionCount: number;
  title: string;
};
