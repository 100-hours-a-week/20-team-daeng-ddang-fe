import { create } from "zustand";
import { ExpressionAnalysis } from "./types";

interface ExpressionStore {
  analysis: ExpressionAnalysis | null;
  setAnalysis: (analysis: ExpressionAnalysis) => void;
  clearAnalysis: () => void;
}

export const useExpressionStore = create<ExpressionStore>((set) => ({
  analysis: null,
  setAnalysis: (analysis) => set({ analysis }),
  clearAnalysis: () => set({ analysis: null }),
}));
