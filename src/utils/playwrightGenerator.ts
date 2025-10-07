/**
 * Playwright test code generator
 * Converts scenarios and components into executable Playwright tests
 */

import type { GeneratedScenario } from '@/services/ai/types';
import type { AnalysisResult } from '@/services/playwright/types';

/**
 * Generate Playwright test code from scenarios and components
 */
export function generatePlaywrightTests(
  scenarios: GeneratedScenario[],
  analysisResult: AnalysisResult
): string {
  const { url, components } = analysisResult;

  // Create component selector map
  const componentMap = new Map();
  components.forEach(comp => {
    const key = (comp.text || comp.placeholder || comp.ariaLabel || '').toLowerCase();
    if (key) {
      componentMap.set(key, comp);
    }
  });

  let code = `// Auto-generated Playwright Tests
// Generated from BugEra AIScout
// URL: ${url}
// Date: ${new Date().toLocaleString('tr-TR')}

import { test, expect } from '@playwright/test';

`;

  // Add test configuration
  code += `test.describe('${analysisResult.title || 'Web Application Tests'}', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('${url}');
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

`;

  // Generate tests for each scenario
  scenarios.forEach((scenario, index) => {
    code += generateTestCase(scenario, componentMap, url);
    if (index < scenarios.length - 1) {
      code += '\n';
    }
  });

  code += `});
`;

  return code;
}

/**
 * Generate a single test case from scenario
 */
function generateTestCase(
  scenario: GeneratedScenario,
  componentMap: Map<string, any>,
  baseUrl: string
): string {
  const testName = scenario.title;
  const priority = scenario.priority.toUpperCase();

  let code = `  test('${testName}', async ({ page }) => {
    // Priority: ${priority}
    // Category: ${scenario.category}
    // Description: ${scenario.description}

`;

  // Generate steps
  scenario.steps.forEach((step) => {
    const stepCode = convertStepToCode(step.action, componentMap, baseUrl);
    code += `    // Step ${step.stepNumber}: ${step.action}\n`;
    code += stepCode.map(line => `    ${line}`).join('\n') + '\n\n';
  });

  // Add expected result verification
  code += `    // Expected Result: ${scenario.expectedResult}\n`;
  code += `    // Add your verification assertions here\n`;
  code += `    // Example: await expect(page.locator('selector')).toBeVisible();\n`;
  code += `  });\n`;

  return code;
}

/**
 * Convert a test step description into Playwright code
 */
function convertStepToCode(
  stepText: string,
  componentMap: Map<string, any>,
  baseUrl: string
): string[] {
  const code: string[] = [];
  const lowerStep = stepText.toLowerCase();

  // Navigate actions
  if (lowerStep.includes('sayfaya git') || lowerStep.includes('navigate') || lowerStep.includes('ana sayfa')) {
    code.push(`await page.goto('${baseUrl}');`);
    code.push(`await page.waitForLoadState('networkidle');`);
    return code;
  }

  // Click actions
  if (lowerStep.includes('tıkla') || lowerStep.includes('click') || lowerStep.includes('bas')) {
    const selector = findSelectorFromText(stepText, componentMap, 'button');
    if (selector) {
      code.push(`await page.locator('${selector}').click();`);
      code.push(`await page.waitForLoadState('networkidle');`);
    } else {
      code.push(`// TODO: Find and click the correct element`);
      code.push(`// await page.locator('selector').click();`);
    }
    return code;
  }

  // Input actions
  if (lowerStep.includes('gir') || lowerStep.includes('yaz') || lowerStep.includes('enter') || lowerStep.includes('type')) {
    const selector = findSelectorFromText(stepText, componentMap, 'input');
    
    // Extract value to enter
    let value = '';
    const emailMatch = stepText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      value = emailMatch[1];
    } else if (lowerStep.includes('email')) {
      value = 'test@example.com';
    } else if (lowerStep.includes('şifre') || lowerStep.includes('password')) {
      value = 'TestPassword123!';
    } else if (lowerStep.includes('kullanıcı') || lowerStep.includes('username')) {
      value = 'testuser';
    } else {
      value = 'test value';
    }

    if (selector) {
      code.push(`await page.locator('${selector}').fill('${value}');`);
    } else {
      code.push(`// TODO: Find the input field and enter value`);
      code.push(`// await page.locator('input selector').fill('${value}');`);
    }
    return code;
  }

  // Select/dropdown actions
  if (lowerStep.includes('seç') || lowerStep.includes('select')) {
    const selector = findSelectorFromText(stepText, componentMap, 'select');
    if (selector) {
      code.push(`await page.locator('${selector}').selectOption({ index: 1 });`);
    } else {
      code.push(`// TODO: Select an option from dropdown`);
      code.push(`// await page.locator('select').selectOption('value');`);
    }
    return code;
  }

  // Checkbox actions
  if (lowerStep.includes('işaretle') || lowerStep.includes('check')) {
    const selector = findSelectorFromText(stepText, componentMap, 'checkbox');
    if (selector) {
      code.push(`await page.locator('${selector}').check();`);
    } else {
      code.push(`// TODO: Check the checkbox`);
      code.push(`// await page.locator('input[type="checkbox"]').check();`);
    }
    return code;
  }

  // Verification actions
  if (lowerStep.includes('doğrula') || lowerStep.includes('kontrol') || lowerStep.includes('verify') || lowerStep.includes('check')) {
    code.push(`// Verification step`);
    code.push(`// await expect(page.locator('selector')).toBeVisible();`);
    return code;
  }

  // Wait actions
  if (lowerStep.includes('bekle') || lowerStep.includes('wait')) {
    code.push(`await page.waitForTimeout(2000);`);
    return code;
  }

  // Default: add as comment
  code.push(`// ${stepText}`);
  code.push(`// TODO: Implement this step`);
  return code;
}

/**
 * Find selector from step text and components
 */
function findSelectorFromText(
  stepText: string,
  componentMap: Map<string, any>,
  preferredType?: string
): string | null {
  const lowerText = stepText.toLowerCase();

  // Common keywords to search
  const keywords = [
    'email', 'şifre', 'password', 'kullanıcı', 'username', 'giriş', 'login',
    'ara', 'search', 'kayıt', 'register', 'sepet', 'cart', 'ürün', 'product'
  ];

  for (const keyword of keywords) {
    if (lowerText.includes(keyword)) {
      // Try to find component with this keyword
      for (const [key, component] of componentMap) {
        if (key.includes(keyword)) {
          if (!preferredType || component.type === preferredType) {
            // Return best selector
            if (component.cssSelector?.includes('#') && !component.cssSelector?.includes(' ')) {
              return component.cssSelector;
            }
            return component.cssSelector || component.xpath;
          }
        }
      }
    }
  }

  // If no specific match, try to find by type
  if (preferredType) {
    for (const [, component] of componentMap) {
      if (component.type === preferredType) {
        if (component.cssSelector?.includes('#') && !component.cssSelector?.includes(' ')) {
          return component.cssSelector;
        }
        return component.cssSelector || component.xpath;
      }
    }
  }

  return null;
}

/**
 * Download Playwright test file
 */
export function downloadPlaywrightTest(code: string, filename?: string) {
  const blob = new Blob([code], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `test-${Date.now()}.spec.ts`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
