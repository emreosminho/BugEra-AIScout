/**
 * Type definitions for AI test scenario generation
 */

import type { DOMComponent } from '../playwright/types';

export interface ScenarioGenerationRequest {
  components: DOMComponent[];
  url: string;
  title: string;
  options?: ScenarioOptions;
}

export interface ScenarioOptions {
  maxScenarios?: number;
  focusAreas?: string[];
  includeEdgeCases?: boolean;
  language?: 'en' | 'tr';
  complexity?: 'simple' | 'moderate' | 'complex';
}

export interface GeneratedScenario {
  id: string;
  title: string;
  description: string;
  steps: TestStep[];
  expectedResult: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  timestamp: string;
}

export interface TestStep {
  stepNumber: number;
  action: string;
  target?: string;
  data?: string;
  expectedBehavior?: string;
}

export interface ScenarioGenerationResult {
  scenarios: GeneratedScenario[];
  totalGenerated: number;
  generationTime: number;
  model: string;
  timestamp: string;
}

export interface AIModelConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

