// src/middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

const WEBHOOK_PATH = "/api/webhooks/clerk";

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;

  if (pathname === WEBHOOK_PATH) {
    return;
  }

  const session = await auth();
  if (!session.userId) {
    return session.redirectToSignIn();
  }
});

export const config = {
  matcher: [
    "/((?!_next|api/webhooks/clerk|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
