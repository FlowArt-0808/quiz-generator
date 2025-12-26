"use client";

import { SignupProvider } from "../../_provider/signupProvider";

const SignupLayout = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  return <SignupProvider>{children}</SignupProvider>;
};

export default SignupLayout;
