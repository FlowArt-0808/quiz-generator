"use client";

import {
  useState,
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";

import axios from "axios";
import { error } from "console";

type HomeContextType = {
  isGenerated: boolean;
  loading: boolean;
  setLoading: (value: boolean) => void;
  setIsGenerated: (value: boolean) => void;
  getArticleData: () => Promise<void>;
};

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export const useHomeContext = () => {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error("");
  }

  return context;
};

export const HomeProvider = ({ children }: { children: ReactNode }) => {
  const [isGenerated, setIsGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

  const getArticleData = async () => {
    try {
      const response = await axios.get("/api/routes/article");
      console.log("Article Data Success:", response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Error status:", err.response?.status);
        console.error("Error data:", err.response?.data);
        console.error("Error message:", err.message);
      } else {
        console.error("Unexpected error:", err);
      }
    }
  };

  const getUserData = async () => {
    try {
      const response = await axios.get("/api/routes/user");
      console.log(`Obtained User Data Successfully:`, response.data);
    } catch (err) {
      console.log(`getUserData error:`, err);
    }
  };

  useEffect(() => {
    void getArticleData(), void getUserData();
  }, []);

  return (
    <HomeContext.Provider
      value={{
        getArticleData,
        loading,
        isGenerated,
        setLoading,
        setIsGenerated,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};
