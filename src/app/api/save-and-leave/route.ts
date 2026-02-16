import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, content, summary, quizzes } = await req.json();

    if (
      !content ||
      !summary ||
      !Array.isArray(quizzes) ||
      quizzes.length === 0
    ) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const article = await prisma.article.create({
      data: {
        title: title ?? "Untitled",
        content,
        summary,
        user: {
          connect: { clerkId: userId },
        },
        quizzes: {
          create: quizzes.map((q) => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      articleId: article.id,
    });
  } catch (error) {
    console.error("Save & Leave error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
