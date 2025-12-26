"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type HomeContextType = {};

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export const useHomeContext = () => {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error("");
  }

  return context;
};

export const HomeProvider = ({ children }: { children: ReactNode }) => {
  return <HomeContext.Provider value={{}}>{children}</HomeContext.Provider>;
};
