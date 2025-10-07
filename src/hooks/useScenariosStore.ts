/**
 * Zustand store for managing AI-generated test scenarios
 */

import { create } from 'zustand';
import type { ScenarioGenerationResult, GeneratedScenario } from '@/services/ai/types';

interface ScenariosStoreState {
  // Current generation result
  currentResult: ScenarioGenerationResult | null;
  
  // All generated scenarios
  allScenarios: GeneratedScenario[];
  
  // Loading states
  isGenerating: boolean;
  generationError: string | null;
  
  // Statistics
  totalGenerated: number;
  lastGenerationTime: number;
  
  // Actions
  setCurrentResult: (result: ScenarioGenerationResult) => void;
  addScenarios: (scenarios: GeneratedScenario[]) => void;
  clearCurrentResult: () => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setGenerationError: (error: string | null) => void;
  clearAllScenarios: () => void;
  removeScenario: (scenarioId: string) => void;
}

/**
 * Global store for test scenario generation
 */
export const useScenariosStore = create<ScenariosStoreState>((set) => ({
  currentResult: null,
  allScenarios: [],
  isGenerating: false,
  generationError: null,
  totalGenerated: 0,
  lastGenerationTime: 0,

  setCurrentResult: (result) =>
    set({
      currentResult: result,
      generationError: null,
      totalGenerated: result.totalGenerated,
      lastGenerationTime: result.generationTime,
    }),

  addScenarios: (scenarios) =>
    set((state) => ({
      allScenarios: [...scenarios, ...state.allScenarios],
      totalGenerated: state.totalGenerated + scenarios.length,
    })),

  clearCurrentResult: () =>
    set({ currentResult: null, generationError: null }),

  setIsGenerating: (isGenerating) =>
    set({ isGenerating, generationError: isGenerating ? null : undefined }),

  setGenerationError: (error) =>
    set({ generationError: error, isGenerating: false }),

  clearAllScenarios: () =>
    set({ allScenarios: [], totalGenerated: 0, currentResult: null }),

  removeScenario: (scenarioId) =>
    set((state) => {
      const newAllScenarios = state.allScenarios.filter((s) => s.id !== scenarioId);
      const newCurrentResult = state.currentResult
        ? {
            ...state.currentResult,
            scenarios: state.currentResult.scenarios.filter((s) => s.id !== scenarioId),
            totalGenerated: state.currentResult.scenarios.filter((s) => s.id !== scenarioId).length,
          }
        : null;

      return {
        allScenarios: newAllScenarios,
        currentResult: newCurrentResult,
      };
    }),
}));

