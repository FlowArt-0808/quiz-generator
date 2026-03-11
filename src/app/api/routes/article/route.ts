import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

// GET - Read all articles
async function getHandler(req: NextRequest) {
  try {
    const data = await prisma.article.findMany({
      include: {
        user: true, // Include user data if needed
      },
    });
    console.log(data);
    return NextResponse.json({
      ok: true,
      method: req.method,
      data,
    });
  } catch (err) {
    console.log(err, "Error fetching articles");
    return NextResponse.json(
      { ok: false, error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

// POST - Create a new article
async function postHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, summary, userId } = body;

    const newArticle = await prisma.article.create({
      data: {
        title,
        content,
        summary,
        userId,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        method: req.method,
        data: newArticle,
      },
      { status: 201 }
    );
  } catch (err) {
    console.log(err, "Error creating article");
    return NextResponse.json(
      { ok: false, error: "Failed to create article" },
      { status: 500 }
    );
  }
}

// PUT - Update an article
async function putHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Article ID is required" },
        { status: 400 }
      );
    }

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      ok: true,
      method: req.method,
      data: updatedArticle,
    });
  } catch (err) {
    console.log(err, "Error updating article");
    return NextResponse.json(
      { ok: false, error: "Failed to update article" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an article
async function deleteHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Article ID is required" },
        { status: 400 }
      );
    }

    const deletedArticle = await prisma.article.delete({
      where: { id },
    });

    return NextResponse.json({
      ok: true,
      method: req.method,
      data: deletedArticle,
    });
  } catch (err) {
    console.log(err, "Error deleting article");
    return NextResponse.json(
      { ok: false, error: "Failed to delete article" },
      { status: 500 }
    );
  }
}

export const GET = getHandler;
export const POST = postHandler;
export const PUT = putHandler;
export const DELETE = deleteHandler;
