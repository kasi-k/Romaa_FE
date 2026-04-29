import { useContext, createContext } from "react";

// ── Context ────────────────────────────────────────────────────────────────────
export const PreliminaryProcessContext = createContext(null);

export const usePreliminaryProcess = () => {
  const ctx = useContext(PreliminaryProcessContext);
  if (!ctx) throw new Error("Must be used inside PreliminaryProcessProvider");
  return ctx;
};
