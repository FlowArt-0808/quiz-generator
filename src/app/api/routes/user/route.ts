import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

async function handler(req: NextRequest) {
  try {
    const data = await prisma.user.findMany();
    console.log(data);
    return NextResponse.json({
      ok: true,
      method: req.method,
      data,
    });
  } catch (err) {
    console.log(err, "Something wrong with route in Article");
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
