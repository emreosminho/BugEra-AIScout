/**
 * Playwright DOM Analyzer Service
 * Analyzes web pages and extracts UI components for test scenario generation
 */

import { chromium, Browser, Page } from 'playwright';
import type { DOMComponent, AnalysisResult, AnalysisOptions, ComponentType } from './types';

/**
 * Main analyzer class for DOM component extraction
 */
export class DOMAnalyzer {
  private browser: Browser | null = null;
  private page: Page | null = null;

  /**
   * Initialize browser instance
   */
  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
    });
    this.page = await this.browser.newPage();
  }

  /**
   * Close browser instance and cleanup
   */
  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    this.browser = null;
    this.page = null;
  }

  /**
   * Analyze a web page and extract all interactive components
   */
  async analyzePage(options: AnalysisOptions): Promise<AnalysisResult> {
    if (!this.page) {
      throw new Error('Analyzer not initialized. Call initialize() first.');
    }

    const { url, waitForSelector, timeout = 30000, excludeSelectors = [] } = options;

    // Navigate to the target page
    await this.page.goto(url, { 
      waitUntil: 'networkidle',
      timeout 
    });

    // Wait for specific selector if provided
    if (waitForSelector) {
      await this.page.waitForSelector(waitForSelector, { timeout });
    }

    // Extract page title
    const title = await this.page.title();

    // Extract all components from the page
    const components = await this.extractComponents(excludeSelectors);

    // Calculate statistics
    const statistics = this.calculateStatistics(components);

    return {
      url,
      timestamp: new Date().toISOString(),
      title,
      components,
      statistics,
    };
  }

  /**
   * Extract all interactive components from the current page
   */
  private async extractComponents(excludeSelectors: string[]): Promise<DOMComponent[]> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    const components = await this.page.evaluate((excludes) => {
      const components: DOMComponent[] = [];
      let idCounter = 0;

      // Component type mapping
      const getComponentType = (element: Element): ComponentType => {
        const tagName = element.tagName.toLowerCase();
        const role = element.getAttribute('role');

        if (tagName === 'button' || role === 'button') return 'button';
        if (tagName === 'input') {
          const type = (element as HTMLInputElement).type;
          if (type === 'checkbox') return 'checkbox';
          if (type === 'radio') return 'radio';
          return 'input';
        }
        if (tagName === 'textarea') return 'textarea';
        if (tagName === 'select') return 'select';
        if (tagName === 'label') return 'label';
        if (tagName === 'a') return 'link';
        if (tagName === 'img') return 'image';
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) return 'heading';
        if (tagName === 'form') return 'form';
        if (tagName === 'div') return 'div';
        if (tagName === 'span') return 'span';
        return 'other';
      };

      // Get XPath for an element
      const getXPath = (element: Element): string => {
        if (element.id) {
          return `//*[@id="${element.id}"]`;
        }
        
        const parts: string[] = [];
        let current: Element | null = element;

        while (current && current.nodeType === Node.ELEMENT_NODE) {
          let index = 0;
          let sibling = current.previousSibling;
          
          while (sibling) {
            if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === current.nodeName) {
              index++;
            }
            sibling = sibling.previousSibling;
          }

          const tagName = current.nodeName.toLowerCase();
          const pathIndex = index > 0 ? `[${index + 1}]` : '';
          parts.unshift(tagName + pathIndex);

          current = current.parentElement;
        }

        return parts.length ? '/' + parts.join('/') : '';
      };

      // Get CSS Selector for an element
      const getCSSSelector = (element: Element): string => {
        if (element.id) {
          return `#${element.id}`;
        }

        const path: string[] = [];
        let current: Element | null = element;

        while (current) {
          let selector = current.tagName.toLowerCase();
          
          if (current.className) {
            const classes = Array.from(current.classList).join('.');
            if (classes) selector += `.${classes}`;
          }

          path.unshift(selector);
          current = current.parentElement;
        }

        return path.join(' > ');
      };

      // Check if element should be excluded
      const shouldExclude = (element: Element): boolean => {
        return excludes.some(selector => {
          try {
            return element.matches(selector);
          } catch {
            return false;
          }
        });
      };

      // Selectors for interactive elements
      const selectors = [
        'button',
        'input',
        'textarea',
        'select',
        'a',
        'label',
        '[role="button"]',
        '[role="link"]',
        '[role="checkbox"]',
        '[role="radio"]',
        '[onclick]',
        'img',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'form',
      ];

      const allElements = document.querySelectorAll(selectors.join(','));

      allElements.forEach((element) => {
        if (shouldExclude(element)) return;

        const component: DOMComponent = {
          id: `component-${idCounter++}`,
          type: getComponentType(element),
          tagName: element.tagName.toLowerCase(),
          text: element.textContent?.trim().substring(0, 100) || undefined,
          className: element.className || undefined,
          role: element.getAttribute('role') || undefined,
          ariaLabel: element.getAttribute('aria-label') || undefined,
          xpath: getXPath(element),
          cssSelector: getCSSSelector(element),
          attributes: {},
        };

        // Extract specific attributes based on element type
        if (element.tagName === 'INPUT') {
          const input = element as HTMLInputElement;
          component.placeholder = input.placeholder || undefined;
          component.value = input.value || undefined;
          component.name = input.name || undefined;
          component.attributes['type'] = input.type;
        }

        if (element.tagName === 'A') {
          const link = element as HTMLAnchorElement;
          component.href = link.href || undefined;
        }

        if (element.tagName === 'IMG') {
          const img = element as HTMLImageElement;
          component.src = img.src || undefined;
          component.alt = img.alt || undefined;
        }

        // Extract all data attributes
        Array.from(element.attributes).forEach((attr) => {
          if (attr.name.startsWith('data-')) {
            component.attributes[attr.name] = attr.value;
          }
        });

        components.push(component);
      });

      return components;
    }, excludeSelectors);

    return components;
  }

  /**
   * Calculate statistics for extracted components
   */
  private calculateStatistics(components: DOMComponent[]) {
    const componentsByType: Record<ComponentType, number> = {
      button: 0,
      input: 0,
      textarea: 0,
      select: 0,
      checkbox: 0,
      radio: 0,
      label: 0,
      link: 0,
      image: 0,
      heading: 0,
      form: 0,
      div: 0,
      span: 0,
      other: 0,
    };

    components.forEach((component) => {
      componentsByType[component.type]++;
    });

    return {
      totalComponents: components.length,
      componentsByType,
    };
  }

  /**
   * Save analysis result to JSON file
   */
  async saveToJSON(result: AnalysisResult, filepath: string = '/public/components.json'): Promise<void> {
    // In a Node.js environment, this would use fs.writeFile
    // For now, we'll return the JSON string
    const json = JSON.stringify(result, null, 2);
    console.log('Analysis result:', json);
    
    // TODO: Implement actual file writing in Node.js context
    // This will be handled by the backend/Node.js script
  }
}

/**
 * Convenience function to analyze a page and return results
 */
export async function analyzeWebPage(options: AnalysisOptions): Promise<AnalysisResult> {
  const analyzer = new DOMAnalyzer();
  
  try {
    await analyzer.initialize();
    const result = await analyzer.analyzePage(options);
    return result;
  } finally {
    await analyzer.cleanup();
  }
}

