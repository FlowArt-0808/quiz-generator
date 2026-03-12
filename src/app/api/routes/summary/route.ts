import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { serializeSavedArticle } from "@/lib/server/article-data";
import { getCurrentDbUser } from "@/lib/server/current-db-user";

import prisma from "../../../../../lib/prisma";

type GeminiPart = {
  text?: string;
};

type GeminiCandidate = {
  content?: {
    parts?: GeminiPart[];
  };
};

type GeminiResponse = {
  candidates?: GeminiCandidate[];
  error?: {
    message?: string;
  };
};

type GeneratedQuestion = {
  answer: string;
  options: string[];
  question: string;
};

type GeneratedPayload = {
  questions: GeneratedQuestion[];
  summary: string;
};

type SummaryRequestBody = {
  articleId?: string | null;
  content?: string;
  title?: string;
};

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export const runtime = "nodejs";

function extractGeminiText(payload: GeminiResponse) {
  const text = payload.candidates
    ?.flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n");

  return text?.trim() ?? "";
}

function parseGeneratedPayload(rawText: string): GeneratedPayload | null {
  const normalizedText = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  const parsed = JSON.parse(normalizedText) as Partial<GeneratedPayload>;
  const summary = typeof parsed.summary === "string" ? parsed.summary.trim() : "";
  const questions = Array.isArray(parsed.questions)
    ? parsed.questions
        .map((question) => ({
          answer:
            typeof question?.answer === "string" ? question.answer.trim() : "",
          options: Array.isArray(question?.options)
            ? question.options
                .filter((option): option is string => typeof option === "string")
                .map((option) => option.trim())
                .filter(Boolean)
            : [],
          question:
            typeof question?.question === "string"
              ? question.question.trim()
              : "",
        }))
        .filter(
          (question) =>
            question.question &&
            question.options.length === 4 &&
            question.answer &&
            question.options.includes(question.answer)
        )
        .slice(0, 5)
    : [];

  if (!summary || questions.length !== 5) {
    return null;
  }

  return {
    questions,
    summary,
  };
}

function unauthorizedResponse() {
  return NextResponse.json(
    { ok: false, error: "Sign in to generate and save articles." },
    { status: 401 }
  );
}

async function saveGeneratedArticle(input: {
  articleId: string | null;
  content: string;
  questions: GeneratedQuestion[];
  summary: string;
  title: string;
  userId: string;
}) {
  return prisma.$transaction(async (tx) => {
    if (input.articleId) {
      const existingArticle = await tx.article.findFirst({
        where: {
          id: input.articleId,
          userId: input.userId,
        },
      });

      if (existingArticle) {
        await tx.quizAttempt.deleteMany({
          where: {
            quiz: {
              articleId: existingArticle.id,
            },
          },
        });
        await tx.userScore.deleteMany({
          where: {
            quiz: {
              articleId: existingArticle.id,
            },
          },
        });
        await tx.quiz.deleteMany({
          where: {
            articleId: existingArticle.id,
          },
        });

        return tx.article.update({
          data: {
            content: input.content,
            quizzes: {
              create: input.questions.map((question) => ({
                answer: question.answer,
                options: question.options,
                question: question.question,
              })),
            },
            summary: input.summary,
            title: input.title,
          },
          include: {
            quizzes: {
              include: {
                quizAttempts: {
                  select: {
                    completedAt: true,
                    score: true,
                  },
                  where: {
                    userId: input.userId,
                  },
                },
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
          where: {
            id: existingArticle.id,
          },
        });
      }
    }

    return tx.article.create({
      data: {
        content: input.content,
        quizzes: {
          create: input.questions.map((question) => ({
            answer: question.answer,
            options: question.options,
            question: question.question,
          })),
        },
        summary: input.summary,
        title: input.title,
        userId: input.userId,
      },
      include: {
        quizzes: {
          include: {
            quizAttempts: {
              select: {
                completedAt: true,
                score: true,
              },
              where: {
                userId: input.userId,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
  });
}

export async function POST(req: NextRequest) {
  const dbUser = await getCurrentDbUser();

  if (!dbUser) {
    return unauthorizedResponse();
  }

  try {
    const body = (await req.json()) as SummaryRequestBody;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    if (typeof body.title !== "string" || typeof body.content !== "string") {
      return NextResponse.json(
        { ok: false, error: "Title and content must be strings." },
        { status: 400 }
      );
    }

    const articleId =
      typeof body.articleId === "string" && body.articleId.trim()
        ? body.articleId.trim()
        : null;
    const trimmedTitle = body.title.trim();
    const trimmedContent = body.content.trim();

    if (!trimmedTitle || !trimmedContent) {
      return NextResponse.json(
        { ok: false, error: "Title and content are required." },
        { status: 400 }
      );
    }

    const prompt = [
      "Return valid JSON only.",
      'Use this exact shape: {"summary":"string","questions":[{"question":"string","options":["a","b","c","d"],"answer":"string"}]}.',
      "The summary must be 3 to 5 sentences.",
      "Generate exactly 5 multiple-choice questions.",
      "Each question must have exactly 4 options.",
      "The answer must exactly match one of the options.",
      "Do not include markdown, explanations, or extra keys.",
      "",
      `Title: ${trimmedTitle}`,
      "",
      "Article:",
      trimmedContent,
    ].join("\n");

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(30000),
    });

    const data = (await response.json()) as GeminiResponse;

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            data.error?.message || "Gemini rejected the content generation request.",
        },
        { status: response.status }
      );
    }

    const rawText = extractGeminiText(data);

    if (!rawText) {
      return NextResponse.json(
        { ok: false, error: "Gemini returned an empty payload." },
        { status: 502 }
      );
    }

    const generatedPayload = parseGeneratedPayload(rawText);

    if (!generatedPayload) {
      return NextResponse.json(
        { ok: false, error: "Gemini returned an invalid quiz payload." },
        { status: 502 }
      );
    }

    const savedArticle = await saveGeneratedArticle({
      articleId,
      content: trimmedContent,
      questions: generatedPayload.questions,
      summary: generatedPayload.summary,
      title: trimmedTitle,
      userId: dbUser.id,
    });

    return NextResponse.json({
      ok: true,
      data: serializeSavedArticle(savedArticle),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      return NextResponse.json(
        { ok: false, error: "Summary generation timed out. Try again." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { ok: false, error: "Failed to generate the summary." },
      { status: 500 }
    );
  }
}
