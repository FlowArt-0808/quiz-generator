import React from "react";
import { createContext, useContext, useState } from "react";

type AuthContextType = {};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("");
  }
};
