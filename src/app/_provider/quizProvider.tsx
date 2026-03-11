"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";

import axios from "axios";

type QuizContextType = {
  getQuizData: () => Promise<void>;
  getUserData: () => Promise<void>;
};

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuizContext = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("");
  }

  return context;
};

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const getQuizData = async () => {
    try {
      const response = await axios.get("http://localhost:8888/api/routes/quiz");
      const data = response.data;
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  };

  const getUserData = async () => {
    try {
      const response = await axios.get("http://localhost:8888/api/routes/user");
      const data = response.data;
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    void getQuizData(), void getUserData();
  }, []);

  return (
    <QuizContext.Provider value={{ getQuizData, getUserData }}>
      {children}
    </QuizContext.Provider>
  );
};
