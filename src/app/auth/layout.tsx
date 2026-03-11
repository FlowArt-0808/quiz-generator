"use client";

import { SignupProvider } from "../_provider/signupProvider";

const AuthLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return <SignupProvider>{children}</SignupProvider>;
};

export default AuthLayout;
