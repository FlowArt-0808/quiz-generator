"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");

  const [whichOne, setWhichOne] = useState(
    viewParam === "signin" ? "signin" : "signup"
  );

  return (
    <div>
      <div
        aria-label="Switching buttons"
        className="flex gap-4 mb-4 justify-center"
      >
        <button
          onClick={() => setWhichOne("signin")}
          className={`px-4 py-2 ${
            whichOne === "signin" ? "font-bold border-b-2" : ""
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setWhichOne("signup")}
          className={`px-4 py-2 ${
            whichOne === "signup" ? "font-bold border-b-2" : ""
          }`}
        >
          Sign Up
        </button>
      </div>

      {whichOne === "signin" ? (
        <SignIn
          appearance={{
            elements: {
              footerAction: { display: "none" },
            },
          }}
        />
      ) : (
        <SignUp
          appearance={{
            elements: {
              footerAction: { display: "none" },
            },
          }}
        />
      )}
    </div>
  );
}
