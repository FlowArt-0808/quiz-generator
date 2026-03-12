import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

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
            question.options.length >= 2 &&
            question.answer &&
            question.options.includes(question.answer)
        )
        .slice(0, 5)
    : [];

  if (!summary || !questions.length) {
    return null;
  }

  return {
    questions,
    summary,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    if (typeof title !== "string" || typeof content !== "string") {
      return NextResponse.json(
        { ok: false, error: "Title and content must be strings." },
        { status: 400 }
      );
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

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

    return NextResponse.json({
      ok: true,
      data: generatedPayload,
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
