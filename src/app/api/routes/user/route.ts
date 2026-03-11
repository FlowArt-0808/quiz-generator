import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

async function getHandler(req: NextRequest) {
  try {
    const data = await prisma.user.findMany();
    console.log(data);
    return NextResponse.json({
      ok: true,
      method: req.method,
      data,
    });
  } catch (err) {
    console.log(err, "Error fetching users");
    return NextResponse.json(
      { ok: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

async function postHandler(req: NextRequest) {
  try {
    const body = await req.json();

    const { clerkId, email, name } = body;

    const newUser = await prisma.user.create({
      data: {
        clerkId,
        email,
        name,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        method: req.method,
        data: newUser,
      },
      { status: 201 }
    );
  } catch (err) {
    console.log(err, "Error creating user");
    return NextResponse.json(
      { ok: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}

async function putHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, clerkId, email, name } = body;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(clerkId && { clerkId }),
        ...(email && { email }),
        ...(name && { name }),
      },
    });

    return NextResponse.json({
      ok: true,
      method: req.method,
      data: updatedUser,
    });
  } catch (err) {
    console.log(err, "Error updating user");
    return NextResponse.json(
      { ok: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}

async function deleteHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const deletedUser = await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      ok: true,
      method: req.method,
      data: deletedUser,
    });
  } catch (err) {
    console.log(err, "Error deleting user");
    return NextResponse.json(
      { ok: false, error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

export const GET = getHandler;
export const POST = postHandler;
export const PUT = putHandler;
export const DELETE = deleteHandler;
