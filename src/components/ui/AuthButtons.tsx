"use client";

import { usePathname, useRouter } from "next/navigation";
import { SignedOut } from "@clerk/nextjs";

export default function AuthButtons() {
  const pathname = usePathname();
  const router = useRouter();
  const hideAuthButtons =
    pathname === "/auth" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up");

  if (hideAuthButtons) return null;

  return (
    <SignedOut>
      <button
        onClick={() => router.push("/sign-in")}
        className="text-sm sm:text-base cursor-pointer"
      >
        Sign In
      </button>
      <button
        onClick={() => router.push("/sign-up")}
        className="bg-[#6c47ff] text-ceramic-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer"
      >
        Sign Up
      </button>
    </SignedOut>
  );
}
