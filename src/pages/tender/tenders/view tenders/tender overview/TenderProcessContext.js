import { useContext, createContext } from "react";

// ── Context ────────────────────────────────────────────────────────────────────
export const TenderProcessContext = createContext(null);

export const useTenderProcess = () => {
  const ctx = useContext(TenderProcessContext);
  if (!ctx) throw new Error("Must be used inside TenderProcessProvider");
  return ctx;
};
