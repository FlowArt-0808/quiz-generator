"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";

import axios from "axios";

type HomeContextType = { getArticleData: () => Promise<void> };

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export const useHomeContext = () => {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error("");
  }

  return context;
};

export const HomeProvider = ({ children }: { children: ReactNode }) => {
  const getArticleData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8888/api/routes/article"
      );
      const data = await response.data;
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    void getArticleData();
  }, []);

  return (
    <HomeContext.Provider value={{ getArticleData }}>
      {children}
    </HomeContext.Provider>
  );
};
