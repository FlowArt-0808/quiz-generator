import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { serializeSavedArticle, serializeSavedArticleListItem } from "@/lib/server/article-data";
import { getCurrentDbUser } from "@/lib/server/current-db-user";

import prisma from "../../../../../lib/prisma";

export const runtime = "nodejs";

function unauthorizedResponse() {
  return NextResponse.json(
    { ok: false, error: "Sign in to access saved articles." },
    { status: 401 }
  );
}

const articleInclude = (userId: string) => ({
  quizzes: {
    include: {
      quizAttempts: {
        orderBy: {
          completedAt: "desc" as const,
        },
        select: {
          completedAt: true,
          score: true,
        },
        where: {
          userId,
        },
      },
    },
    orderBy: {
      createdAt: "asc" as const,
    },
  },
});

export async function GET(req: NextRequest) {
  const dbUser = await getCurrentDbUser();

  if (!dbUser) {
    return unauthorizedResponse();
  }

  const articleId = req.nextUrl.searchParams.get("articleId");

  try {
    if (articleId) {
      const article = await prisma.article.findFirst({
        include: articleInclude(dbUser.id),
        where: {
          id: articleId,
          userId: dbUser.id,
        },
      });

      if (!article) {
        return NextResponse.json(
          { ok: false, error: "Article not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        ok: true,
        data: serializeSavedArticle(article),
      });
    }

    const articles = await prisma.article.findMany({
      include: articleInclude(dbUser.id),
      orderBy: {
        updatedAt: "desc",
      },
      where: {
        userId: dbUser.id,
      },
    });

    return NextResponse.json({
      ok: true,
      data: articles.map(serializeSavedArticleListItem),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to load saved articles." },
      { status: 500 }
    );
  }
}
