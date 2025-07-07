import { createContext, useContext } from "react";
import type { Socket } from "socket.io-client";

type AppContextType = {
  socket: Socket | null;
  setSocket: (s: Socket | null) => void;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppContext.Provider");
  return ctx;
}