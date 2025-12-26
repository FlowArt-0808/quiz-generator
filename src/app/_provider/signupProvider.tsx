"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

type SignupContextType = {
  signinTab: boolean;
  setSigninTab: Dispatch<SetStateAction<boolean>>;
};

const SignupContext = createContext<SignupContextType | undefined>(undefined);

export const useSignupContext = () => {
  const context = useContext(SignupContext);
  if (!context) {
    throw new Error("");
  }

  return context;
};

export const SignupProvider = ({ children }: { children: ReactNode }) => {
  const [signinTab, setSigninTab] = useState(false);

  return (
    <SignupContext.Provider
      value={{
        signinTab,
        setSigninTab,
      }}
    >
      {children}
    </SignupContext.Provider>
  );
};
