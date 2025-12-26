"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type QuizContextType = {};

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuizContext = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("");
  }

  return context;
};

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  return <QuizContext.Provider value={{}}>{children}</QuizContext.Provider>;
};
