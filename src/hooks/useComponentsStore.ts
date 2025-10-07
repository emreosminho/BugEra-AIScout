/**
 * Zustand store for managing DOM component analysis results
 */

import { create } from 'zustand';
import type { AnalysisResult } from '@/services/playwright/types';

interface ComponentsStoreState {
  // Current analysis result
  currentAnalysis: AnalysisResult | null;
  
  // Analysis history
  analysisHistory: AnalysisResult[];
  
  // Loading states
  isAnalyzing: boolean;
  analysisError: string | null;
  
  // Actions
  setCurrentAnalysis: (analysis: AnalysisResult) => void;
  addToHistory: (analysis: AnalysisResult) => void;
  clearCurrentAnalysis: () => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisError: (error: string | null) => void;
  clearHistory: () => void;
}

/**
 * Global store for component analysis data
 */
export const useComponentsStore = create<ComponentsStoreState>((set) => ({
  currentAnalysis: null,
  analysisHistory: [],
  isAnalyzing: false,
  analysisError: null,

  setCurrentAnalysis: (analysis) =>
    set({ currentAnalysis: analysis, analysisError: null }),

  addToHistory: (analysis) =>
    set((state) => ({
      analysisHistory: [analysis, ...state.analysisHistory].slice(0, 10), // Keep last 10
    })),

  clearCurrentAnalysis: () =>
    set({ currentAnalysis: null, analysisError: null }),

  setIsAnalyzing: (isAnalyzing) =>
    set({ isAnalyzing, analysisError: isAnalyzing ? null : undefined }),

  setAnalysisError: (error) =>
    set({ analysisError: error, isAnalyzing: false }),

  clearHistory: () =>
    set({ analysisHistory: [] }),
}));

