import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    method: "GET",
    message: "Hello quiz",
  });
}
