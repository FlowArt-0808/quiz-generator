import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { QuizAttemptAnswer, QuizAttemptResult } from "@/lib/article-types";
import { getCurrentDbUser } from "@/lib/server/current-db-user";

import prisma from "../../../../../lib/prisma";

export const runtime = "nodejs";

type QuizSubmissionBody = {
  answers?: Array<{
    questionId?: string;
    selectedAnswer?: string | null;
  }>;
  articleId?: string;
};

function unauthorizedResponse() {
  return NextResponse.json(
    { ok: false, error: "Sign in to save quiz history." },
    { status: 401 }
  );
}

export async function POST(req: NextRequest) {
  const dbUser = await getCurrentDbUser();

  if (!dbUser) {
    return unauthorizedResponse();
  }

  try {
    const body = (await req.json()) as QuizSubmissionBody;
    const articleId =
      typeof body.articleId === "string" ? body.articleId.trim() : "";
    const submittedAnswers = Array.isArray(body.answers) ? body.answers : [];

    if (!articleId) {
      return NextResponse.json(
        { ok: false, error: "Article id is required." },
        { status: 400 }
      );
    }

    const article = await prisma.article.findFirst({
      include: {
        quizzes: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            answer: true,
            id: true,
            options: true,
            question: true,
          },
        },
      },
      where: {
        id: articleId,
        userId: dbUser.id,
      },
    });

    if (!article || !article.quizzes.length) {
      return NextResponse.json(
        { ok: false, error: "Quiz not found for this article." },
        { status: 404 }
      );
    }

    const selectedAnswers = new Map(
      submittedAnswers
        .filter(
          (answer): answer is { questionId: string; selectedAnswer?: string | null } =>
            typeof answer.questionId === "string" && answer.questionId.trim().length > 0
        )
        .map((answer) => [answer.questionId, answer.selectedAnswer ?? null])
    );

    const answers: QuizAttemptAnswer[] = article.quizzes.map((question) => {
      const selectedAnswer = selectedAnswers.get(question.id) ?? null;

      return {
        correctAnswer: question.answer,
        isCorrect: selectedAnswer === question.answer,
        question: question.question,
        questionId: question.id,
        selectedAnswer,
      };
    });
    const completedAt = new Date();
    const score = answers.filter((answer) => answer.isCorrect).length;

    await prisma.quizAttempt.createMany({
      data: answers.map((answer) => ({
        completedAt,
        quizId: answer.questionId,
        score: answer.isCorrect ? 1 : 0,
        userId: dbUser.id,
      })),
    });

    const result: QuizAttemptResult = {
      answers,
      completedAt: completedAt.toISOString(),
      score,
      total: article.quizzes.length,
    };

    return NextResponse.json({
      ok: true,
      data: result,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to save quiz results." },
      { status: 500 }
    );
  }
}
