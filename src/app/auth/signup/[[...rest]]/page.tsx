"use client";

import { SignUp } from "@clerk/nextjs";
import { useSignupContext } from "../../../_provider/signupProvider";

const AuthPage = () => {
  const { signinTab, setSigninTab } = useSignupContext();

  return (
    <div className="w-full flex h-screen">
      <div className="w-6/10 bg-black"></div>
      <div className="w-4/10 bg-blue-800 flex items-center justify-center">
        {" "}
        <SignUp signInUrl="/auth/login" />
      </div>
    </div>
  );
};

export default AuthPage;
