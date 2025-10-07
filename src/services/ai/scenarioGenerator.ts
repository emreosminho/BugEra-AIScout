/**
 * AI-powered Test Scenario Generator
 * Uses Hugging Face API to generate test scenarios from DOM components
 */

import { HfInference } from '@huggingface/inference';
import type {
  ScenarioGenerationRequest,
  ScenarioGenerationResult,
  GeneratedScenario,
  AIModelConfig,
} from './types';

export class ScenarioGenerator {
  private hf: HfInference;
  private config: AIModelConfig;

  constructor(config: AIModelConfig) {
    this.config = config;
    this.hf = new HfInference(config.apiKey);
  }

  /**
   * Generate test scenarios from DOM components
   */
  async generateScenarios(request: ScenarioGenerationRequest): Promise<ScenarioGenerationResult> {
    const startTime = Date.now();

    // Build the prompt for the AI model
    const prompt = this.buildPrompt(request);

    try {
      // Call Hugging Face API
      const response = await this.hf.textGeneration({
        model: this.config.model,
        inputs: prompt,
        parameters: {
          temperature: this.config.temperature ?? 0.7,
          max_new_tokens: this.config.maxTokens ?? 2000,
          top_p: this.config.topP ?? 0.95,
          return_full_text: false,
        },
      });

      // Parse the AI response into structured scenarios
      const scenarios = this.parseAIResponse(response.generated_text);

      const generationTime = Date.now() - startTime;

      return {
        scenarios,
        totalGenerated: scenarios.length,
        generationTime,
        model: this.config.model,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating scenarios:', error);
      throw new Error('Failed to generate test scenarios from AI model');
    }
  }

  /**
   * Build a detailed prompt for the AI model
   */
  private buildPrompt(request: ScenarioGenerationRequest): string {
    const { components, url, title, options } = request;
    
    const language = options?.language === 'tr' ? 'Turkish' : 'English';
    const complexity = options?.complexity ?? 'moderate';

    // Summarize component types
    const componentSummary = this.summarizeComponents(components);

    const prompt = `You are an expert QA engineer specializing in automated testing. 
Generate comprehensive test scenarios for a web application based on the following information:

**Application Details:**
- URL: ${url}
- Page Title: ${title}

**Available UI Components:**
${componentSummary}

**Requirements:**
- Generate ${options?.maxScenarios ?? 5} test scenarios
- Complexity level: ${complexity}
- Language: ${language}
- ${options?.includeEdgeCases ? 'Include edge cases and negative testing scenarios' : 'Focus on positive test cases'}
${options?.focusAreas && options.focusAreas.length > 0 ? `- Focus on these areas: ${options.focusAreas.join(', ')}` : ''}

**Output Format:**
For each test scenario, provide:
1. Scenario Title (clear and descriptive)
2. Description (what the scenario tests)
3. Test Steps (numbered, clear actions)
4. Expected Result (what should happen)
5. Priority (low, medium, high, or critical)
6. Category (e.g., functional, usability, security)

Generate realistic, actionable test scenarios that cover different aspects of the application.
Format each scenario clearly with proper structure.

---

Begin generating test scenarios:`;

    return prompt;
  }

  /**
   * Summarize components for the prompt
   */
  private summarizeComponents(components: any[]): string {
    const summary: string[] = [];

    // Group by type
    const byType = components.reduce((acc, comp) => {
      if (!acc[comp.type]) acc[comp.type] = [];
      acc[comp.type].push(comp);
      return acc;
    }, {} as Record<string, any[]>);

    Object.entries(byType).forEach(([type, comps]) => {
      summary.push(`- ${type}: ${comps.length} found`);
      
      // Add sample details for important components
      if (['button', 'input', 'link', 'form'].includes(type) && comps.length > 0) {
        const samples = comps.slice(0, 3).map(c => 
          c.text || c.placeholder || c.ariaLabel || c.name || 'unnamed'
        );
        summary.push(`  Examples: ${samples.join(', ')}`);
      }
    });

    return summary.join('\n');
  }

  /**
   * Parse AI-generated text into structured scenarios
   */
  private parseAIResponse(text: string): GeneratedScenario[] {
    const scenarios: GeneratedScenario[] = [];
    
    // Split by scenario markers (this is a simplified parser)
    // In production, you'd want more robust parsing
    const scenarioBlocks = text.split(/(?:Scenario|Test Case|TC)\s*\d+/i).filter(block => block.trim());

    scenarioBlocks.forEach((block, index) => {
      try {
        const scenario = this.parseScenarioBlock(block, index);
        if (scenario) {
          scenarios.push(scenario);
        }
      } catch (error) {
        console.warn(`Failed to parse scenario block ${index}:`, error);
      }
    });

    return scenarios;
  }

  /**
   * Parse individual scenario block
   */
  private parseScenarioBlock(block: string, index: number): GeneratedScenario | null {
    const lines = block.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) return null;

    // Extract title
    const titleMatch = block.match(/(?:Title|Scenario|Name):\s*(.+?)(?:\n|$)/i);
    const title = titleMatch ? titleMatch[1].trim() : `Test Scenario ${index + 1}`;

    // Extract description
    const descMatch = block.match(/(?:Description|Objective|Goal):\s*(.+?)(?:\n|$)/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extract steps
    const steps = this.extractSteps(block);

    // Extract expected result
    const expectedMatch = block.match(/(?:Expected Result|Expected Outcome|Result):\s*(.+?)(?:\n|$)/i);
    const expectedResult = expectedMatch ? expectedMatch[1].trim() : 'Test passes successfully';

    // Extract priority
    const priorityMatch = block.match(/(?:Priority):\s*(low|medium|high|critical)/i);
    const priority = (priorityMatch ? priorityMatch[1].toLowerCase() : 'medium') as 'low' | 'medium' | 'high' | 'critical';

    // Extract category
    const categoryMatch = block.match(/(?:Category|Type):\s*(.+?)(?:\n|$)/i);
    const category = categoryMatch ? categoryMatch[1].trim() : 'functional';

    return {
      id: `scenario-${Date.now()}-${index}`,
      title,
      description,
      steps,
      expectedResult,
      priority,
      category,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Extract test steps from scenario block
   */
  private extractSteps(block: string): any[] {
    const steps: any[] = [];
    const stepRegex = /(?:Step|^\d+\.)\s*(.+?)(?=(?:Step|\d+\.|Expected|Priority|Category|$))/gis;
    
    const matches = block.matchAll(stepRegex);
    let stepNumber = 1;

    for (const match of matches) {
      const stepText = match[1].trim();
      if (stepText && stepText.length > 0) {
        steps.push({
          stepNumber: stepNumber++,
          action: stepText,
        });
      }
    }

    // Fallback: if no steps found, try simple numbered list
    if (steps.length === 0) {
      const lines = block.split('\n');
      lines.forEach(line => {
        const match = line.match(/^\s*\d+\.\s*(.+)$/);
        if (match) {
          steps.push({
            stepNumber: steps.length + 1,
            action: match[1].trim(),
          });
        }
      });
    }

    return steps;
  }

  /**
   * Format scenarios as readable text for file output
   */
  formatScenariosAsText(result: ScenarioGenerationResult): string {
    let output = `# Test Scenarios\n\n`;
    output += `Generated: ${new Date(result.timestamp).toLocaleString()}\n`;
    output += `Model: ${result.model}\n`;
    output += `Total Scenarios: ${result.totalGenerated}\n`;
    output += `Generation Time: ${result.generationTime}ms\n\n`;
    output += `${'='.repeat(80)}\n\n`;

    result.scenarios.forEach((scenario, index) => {
      output += `## Scenario ${index + 1}: ${scenario.title}\n\n`;
      output += `**Priority:** ${scenario.priority.toUpperCase()}\n`;
      output += `**Category:** ${scenario.category}\n\n`;
      output += `**Description:**\n${scenario.description}\n\n`;
      output += `**Test Steps:**\n`;
      
      scenario.steps.forEach(step => {
        output += `${step.stepNumber}. ${step.action}\n`;
        if (step.expectedBehavior) {
          output += `   Expected: ${step.expectedBehavior}\n`;
        }
      });
      
      output += `\n**Expected Result:**\n${scenario.expectedResult}\n\n`;
      output += `${'-'.repeat(80)}\n\n`;
    });

    return output;
  }
}

/**
 * Convenience function to generate scenarios
 */
export async function generateTestScenarios(
  request: ScenarioGenerationRequest,
  config: AIModelConfig
): Promise<ScenarioGenerationResult> {
  const generator = new ScenarioGenerator(config);
  return await generator.generateScenarios(request);
}

